/**
 * fix-data.cjs — CampoFinanzas v2
 */
const https = require('https');

const PAT         = process.env.SUPABASE_PAT || 'SET_YOUR_PAT_HERE';
const PROJECT_REF = 'ondkikshwhnkqaynhsfc';

function q(query) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ query });
    const opts = {
      hostname: 'api.supabase.com', port: 443,
      path: `/v1/projects/${PROJECT_REF}/database/query`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PAT}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    };
    const req = https.request(opts, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ s: res.statusCode, b: d }));
    });
    req.on('error', reject); req.write(body); req.end();
  });
}

// The Management API returns either an array or {message: "..."}
function rows(res) {
  try {
    const parsed = JSON.parse(res.b);
    if (Array.isArray(parsed)) return parsed;
    // Some versions return { rows: [] }
    if (parsed && Array.isArray(parsed.rows)) return parsed.rows;
    return [];
  } catch { return []; }
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {
  console.log('=== CampoFinanzas v2 — Fix Data ===\n');

  // DEBUG: ver formato raw de respuesta
  const test = await q("SELECT id, name FROM cf_businesses LIMIT 3");
  console.log('RAW businesses response (HTTP ' + test.s + '):');
  console.log(test.b.substring(0, 300));
  console.log('');

  const bizRows = rows(test);
  console.log('NEGOCIOS: ' + bizRows.length);
  bizRows.forEach(r => console.log('  id=' + r.id + '  name=' + r.name));

  if (bizRows.length === 0) {
    console.log('\nNo hay negocios registrados.');
    console.log('Inserta primero un negocio en cf_businesses, luego corre este script de nuevo.');
    return;
  }
  const BID = bizRows[0].id;
  console.log('\nUsando BID: ' + BID + '\n');

  // ── USUARIOS ────────────────────────────────────────────────────
  const usrRes = await q("SELECT full_name, pin, role, is_active, permissions FROM cf_usuarios_negocio WHERE business_id='" + BID + "' ORDER BY role DESC");
  const usrRows2 = rows(usrRes);
  console.log('USUARIOS ACTUALES (' + usrRows2.length + '):');
  usrRows2.forEach(r => {
    const p = (typeof r.permissions === 'object' && r.permissions) ? r.permissions : {};
    console.log('  PIN=' + r.pin + '  ' + r.full_name + '  rol=' + r.role + '  investors=' + (p.investors||false));
  });

  await sleep(100);

  // ── FIX PERMISOS ADMIN ──────────────────────────────────────────
  console.log('\nActualizando permisos admin...');
  const updAdmin = await q(`
    UPDATE cf_usuarios_negocio
    SET permissions = permissions || '{"full_access":true,"investors":true}'::jsonb
    WHERE business_id = '${BID}' AND role = 'admin'
    RETURNING pin, full_name
  `);
  rows(updAdmin).forEach(r => console.log('  FIXED: PIN=' + r.pin + ' ' + r.full_name + ' -> investors=true'));
  if (rows(updAdmin).length === 0) console.log('  (ningun admin encontrado para actualizar)');

  await sleep(100);

  // ── CREAR USUARIOS DEMO SI NO EXISTEN ──────────────────────────
  // Check si ya existe PIN 1234
  const chk1234 = await q("SELECT pin FROM cf_usuarios_negocio WHERE pin='1234' LIMIT 1");
  if (rows(chk1234).length === 0) {
    const cr = await q(`
      INSERT INTO cf_usuarios_negocio (business_id, full_name, pin, role, is_active, permissions)
      VALUES ('${BID}', 'Administrador', '1234', 'admin', true,
        '{"dashboard":true,"projects":true,"warehouse":true,"purchases":true,"invoices":true,
          "users":true,"settings":true,"workers":true,"operational_expenses":true,"payroll":true,
          "loans":true,"expense_report":true,"full_access":true,"investors":true}'::jsonb)
      RETURNING pin
    `);
    if (rows(cr).length > 0) console.log('  CREADO: admin PIN=1234');
  } else {
    console.log('  PIN 1234 ya existe');
  }

  await sleep(100);

  const chk5678 = await q("SELECT pin FROM cf_usuarios_negocio WHERE pin='5678' LIMIT 1");
  if (rows(chk5678).length === 0) {
    const cr = await q(`
      INSERT INTO cf_usuarios_negocio (business_id, full_name, pin, role, is_active, permissions)
      VALUES ('${BID}', 'Operario', '5678', 'operator', true,
        '{"dashboard":true,"projects":true,"warehouse":true,"purchases":true,"invoices":true,
          "users":false,"settings":false,"workers":true,"operational_expenses":true,"payroll":true,
          "loans":true,"expense_report":true,"full_access":false,"investors":false}'::jsonb)
      RETURNING pin
    `);
    if (rows(cr).length > 0) console.log('  CREADO: operario PIN=5678');
  } else {
    console.log('  PIN 5678 ya existe');
  }

  await sleep(100);

  // ── DATOS DEMO ──────────────────────────────────────────────────
  console.log('\nInsertando datos demo...');

  const inv = await q(`INSERT INTO cf_inventario (business_id,name,category,price,quantity,min_stock) VALUES
    ('${BID}','Semillas Maiz Hibrido','Semillas',850,200,50),
    ('${BID}','Fertilizante NPK','Agroquimicos',1200,50,10),
    ('${BID}','Herbicida 1L','Agroquimicos',2500,20,5),
    ('${BID}','Bomba de Agua 2HP','Equipos',18000,2,1),
    ('${BID}','Sacos Abono Organico','Insumos',650,80,20)
    ON CONFLICT DO NOTHING RETURNING name`);
  console.log('  Inventario: ' + rows(inv).length + ' items nuevos');

  await sleep(100);

  const emp = await q(`INSERT INTO cf_empleados (business_id,full_name,phone,daily_rate,pay_frequency,is_active) VALUES
    ('${BID}','Pedro Hernandez','809-555-0010',1200,'daily',true),
    ('${BID}','Luis Martinez','809-555-0011',1200,'daily',true),
    ('${BID}','Ana Lopez','809-555-0012',1400,'weekly',true),
    ('${BID}','Carlos Reyes','829-444-0013',1100,'daily',true)
    ON CONFLICT DO NOTHING RETURNING full_name`);
  console.log('  Empleados: ' + rows(emp).length + ' nuevos');

  await sleep(100);

  const gastos = await q(`INSERT INTO cf_gastos_operativos (business_id,category,description,amount,date) VALUES
    ('${BID}','fuel','Gasolina camioneta',3500,'2026-06-02'),
    ('${BID}','transport','Flete fertilizantes',2800,'2026-06-04'),
    ('${BID}','food','Almuerzo trabajadores',1800,'2026-06-05'),
    ('${BID}','maintenance','Reparacion bomba',5500,'2026-06-06')
    ON CONFLICT DO NOTHING RETURNING id`);
  console.log('  Gastos: ' + rows(gastos).length + ' nuevos');

  await sleep(100);

  const invR = await q(`INSERT INTO cf_inversionistas (business_id,nombre,email,telefono,empresa,capital_total,notas) VALUES
    ('${BID}','Roberto Castillo','roberto@campo.com','809-999-0001','Inversiones RC SRL',500000,'Socio principal'),
    ('${BID}','Maria Fondeur','maria@fondeur.com','829-888-0002',NULL,300000,'Inversionista angel'),
    ('${BID}','Juan Peralta','juan@agro.com','809-777-0003','AgroInvest SA',750000,'Sociedad desde 2025')
    ON CONFLICT DO NOTHING RETURNING nombre`);
  console.log('  Inversionistas: ' + rows(invR).length + ' nuevos');

  // ── LISTA FINAL USUARIOS ────────────────────────────────────────
  console.log('\n=== USUARIOS FINALES (usa estos PINs) ===');
  const fin = await q("SELECT full_name, pin, role, is_active FROM cf_usuarios_negocio WHERE business_id='" + BID + "' ORDER BY role DESC, created_at");
  rows(fin).forEach(r => {
    const active = r.is_active ? '' : ' [INACTIVO]';
    console.log('  PIN ' + r.pin + '  |  ' + r.full_name + '  |  ' + r.role + active);
  });
  console.log('\n*** LISTO ***');
}

main().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
