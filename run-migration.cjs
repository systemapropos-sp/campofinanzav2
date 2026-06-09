/**
 * run-migration.cjs
 * Aplica migration.sql en Supabase via Management API
 * proyecto: ondkikshwhnkqaynhsfc (CampoFinanzas v2)
 */
const https = require('https');
const fs    = require('fs');
const path  = require('path');

// PAT: Supabase → Account → Access Tokens
// Puedes pasar como variable de entorno: SUPABASE_PAT=sbp_xxx node run-migration.cjs
const PAT         = process.env.SUPABASE_PAT || 'SET_YOUR_PAT_HERE';
const PROJECT_REF = 'ondkikshwhnkqaynhsfc';

function runQuery(query) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ query });
    const opts = {
      hostname: 'api.supabase.com',
      port: 443,
      path: `/v1/projects/${PROJECT_REF}/database/query`,
      method: 'POST',
      headers: {
        'Authorization':  `Bearer ${PAT}`,
        'Content-Type':   'application/json',
        'Content-Length': Buffer.byteLength(body),
      }
    };
    const req = https.request(opts, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// Split SQL preserving $$ dollar-quoted blocks
function splitSQL(sql) {
  const stmts = [];
  let current = '';
  let inDollar = false;
  for (let i = 0; i < sql.length; i++) {
    if (sql.substring(i, i + 2) === '$$') {
      inDollar = !inDollar;
      current += '$$';
      i++;
    } else if (sql[i] === ';' && !inDollar) {
      current += ';';
      if (current.trim()) stmts.push(current);
      current = '';
    } else {
      current += sql[i];
    }
  }
  if (current.trim()) stmts.push(current);
  return stmts;
}

// Strip leading comment lines to get the first real SQL keyword
function firstKeyword(stmt) {
  const lines = stmt.split('\n');
  for (const line of lines) {
    const t = line.trim();
    if (t && !t.startsWith('--')) return t.toUpperCase();
  }
  return '';
}

function safeJSON(str) { try { return JSON.parse(str); } catch { return null; } }
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {
  console.log('=== CampoFinanzas v2 — Migration SQL ===\n');

  const test = await runQuery('SELECT 1 as ping');
  if (test.status < 200 || test.status >= 300) {
    console.error('ERROR: No se pudo conectar (HTTP ' + test.status + ')');
    console.error(test.body.substring(0, 200));
    return;
  }
  console.log('OK: Conectado a proyecto ' + PROJECT_REF + '\n');

  const sql = fs.readFileSync(path.join(__dirname, 'migration.sql'), 'utf8');
  console.log('Archivo: migration.sql (' + sql.length + ' chars)\n');

  // Try all at once first
  console.log('Ejecutando schema completo...');
  const res = await runQuery(sql);
  if (res.status >= 200 && res.status < 300) {
    console.log('EXITO: Migration aplicada completa!\n');
  } else {
    console.log('Fallo completo (HTTP ' + res.status + ') — ejecutando por partes...\n');
    const stmts = splitSQL(sql);
    let ok = 0, fail = 0, skip = 0;

    for (const stmt of stmts) {
      const kw = firstKeyword(stmt);
      if (!kw) continue; // blank / only comments

      const r = await runQuery(stmt);
      // Extract just the SQL keyword for label
      const label = kw.substring(0, 55);

      if (r.status >= 200 && r.status < 300) {
        console.log('  OK: ' + label);
        ok++;
      } else {
        const p = safeJSON(r.body);
        const msg = (p && p.message) || r.body.substring(0, 100);
        const isSkip = msg.includes('already exists') || msg.includes('duplicate') ||
                       msg.includes('ya existe') || msg.includes('already exist');
        if (isSkip) {
          console.log('  SKIP (ya existe): ' + label);
          skip++;
        } else {
          console.log('  FAIL: ' + label);
          console.log('    -> ' + msg.replace(/\n/g,' ').substring(0, 100));
          fail++;
        }
      }
      await sleep(80);
    }
    console.log('\nRESULTADO: OK=' + ok + ' SKIP=' + skip + ' FAIL=' + fail);
  }

  // Verify
  console.log('\nVerificando tablas cf_* ...');
  const verify = await runQuery(
    "SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename LIKE 'cf_%' ORDER BY tablename"
  );
  if (verify.status >= 200 && verify.status < 300) {
    const rows = safeJSON(verify.body) || [];
    console.log('Tablas encontradas: ' + rows.length);
    rows.forEach(r => console.log('  + ' + r.tablename));

    const need = ['cf_inversionistas','cf_proyecto_inversionistas','cf_empleados','cf_inventario','cf_nominas','cf_prestamos'];
    const have = rows.map(r => r.tablename);
    const missing = need.filter(t => !have.includes(t));
    if (missing.length === 0) {
      console.log('\n*** LISTO! Todas las tablas requeridas existen. ***');
    } else {
      console.log('\nFALTAN: ' + missing.join(', '));
    }
  }
}

main().catch(e => { console.error('ERROR FATAL:', e.message); process.exit(1); });
