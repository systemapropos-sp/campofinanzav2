/**
 * setup-demo.cjs — CampoFinanzas v2
 * 1. Verifica tablas y crea bucket de storage
 * 2. Fix PIN 8080 → investors: true
 * 3. Setup PIN 1234 como DEMO completo con flujo de trabajo
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

function apiCall(method, path, body) {
  return new Promise((resolve, reject) => {
    const bodyStr = body ? JSON.stringify(body) : '';
    const opts = {
      hostname: 'api.supabase.com', port: 443,
      path, method,
      headers: {
        'Authorization': `Bearer ${PAT}`,
        'Content-Type': 'application/json',
        ...(bodyStr ? { 'Content-Length': Buffer.byteLength(bodyStr) } : {})
      }
    };
    const req = https.request(opts, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ s: res.statusCode, b: d }));
    });
    req.on('error', reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

function rows(res) {
  try {
    const p = JSON.parse(res.b);
    if (Array.isArray(p)) return p;
    if (p && Array.isArray(p.rows)) return p.rows;
    return [];
  } catch { return []; }
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {
  console.log('=== CampoFinanzas v2 — Setup Demo Completo ===\n');

  // ── VERIFICAR TABLAS ────────────────────────────────────────────
  console.log('1. Verificando tablas...');
  const tablesRes = await q("SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename LIKE 'cf_%' ORDER BY tablename");
  const tables = rows(tablesRes).map(r => r.tablename);
  console.log('   Tablas en Supabase: ' + tables.length);
  tables.forEach(t => console.log('   + ' + t));

  // ── CREAR BUCKET CF-MEDIA ───────────────────────────────────────
  console.log('\n2. Verificando bucket de storage...');
  const bucketCheck = await q("SELECT id FROM storage.buckets WHERE id='cf-media'");
  if (rows(bucketCheck).length === 0) {
    const bc = await q(`INSERT INTO storage.buckets (id, name, public) VALUES ('cf-media','cf-media',true) ON CONFLICT DO NOTHING RETURNING id`);
    if (rows(bc).length > 0) console.log('   ✅ Bucket cf-media creado');
    else console.log('   ⚠️  No se pudo crear bucket cf-media');
  } else {
    console.log('   ✅ Bucket cf-media ya existe');
  }

  // ── OBTENER NEGOCIOS ────────────────────────────────────────────
  const bizRes = await q("SELECT id, name FROM cf_businesses ORDER BY created_at");
  const bizRows2 = rows(bizRes);
  console.log('\n3. Negocios: ' + bizRows2.length);
  bizRows2.forEach(r => console.log('   ' + r.id + ' = ' + r.name));

  if (bizRows2.length === 0) { console.log('No hay negocios.'); return; }

  // Agroboys = 1er negocio (BID real)
  const ABID = bizRows2[0].id;
  // Demo = 2do o crear
  let DBID = bizRows2[1] ? bizRows2[1].id : null;

  // ── FIX PIN 8080 (Agroboys) ─────────────────────────────────────
  console.log('\n4. Fixing PIN 8080 (Agroboys)...');
  const fix8080 = await q(`
    UPDATE cf_usuarios_negocio
    SET permissions = permissions || '{"investors":true,"full_access":true}'::jsonb
    WHERE pin = '8080' AND business_id = '${ABID}'
    RETURNING pin, full_name
  `);
  rows(fix8080).forEach(r => console.log('   ✅ PIN ' + r.pin + ' ' + r.full_name + ' → investors=true'));

  await sleep(100);

  // ── CREAR/VERIFICAR NEGOCIO DEMO ────────────────────────────────
  console.log('\n5. Verificando negocio demo...');
  if (!DBID) {
    const demoB = await q(`
      INSERT INTO cf_businesses (name, plan, owner_email)
      VALUES ('Finca Demo El Paraiso','premium','demo@campofinanzas.com')
      RETURNING id, name
    `);
    const demoRow = rows(demoB)[0];
    if (demoRow) { DBID = demoRow.id; console.log('   ✅ Negocio demo creado: ' + DBID); }
    else { console.log('   ❌ No se pudo crear negocio demo'); return; }
  } else {
    console.log('   ✅ Negocio demo existente: ' + DBID);
  }

  await sleep(150);

  // ── CREAR USUARIO 1234 (DEMO ADMIN) ────────────────────────────
  console.log('\n6. Creando usuario 1234 demo...');
  const fullPerms = '{"dashboard":true,"projects":true,"warehouse":true,"purchases":true,"invoices":true,"users":true,"settings":true,"workers":true,"operational_expenses":true,"payroll":true,"loans":true,"expense_report":true,"full_access":true,"investors":true}';

  const chk1234 = await q(`SELECT id FROM cf_usuarios_negocio WHERE pin='1234' AND business_id='${DBID}' LIMIT 1`);
  if (rows(chk1234).length === 0) {
    const cr1234 = await q(`
      INSERT INTO cf_usuarios_negocio (business_id, full_name, pin, role, is_active, permissions)
      VALUES ('${DBID}','Admin Demo','1234','admin',true,'${fullPerms}'::jsonb)
      ON CONFLICT DO NOTHING RETURNING pin
    `);
    if (rows(cr1234).length > 0) console.log('   ✅ PIN 1234 creado (Admin Demo)');
    else console.log('   ⚠️  PIN 1234 puede existir en otro negocio');
  } else {
    await q(`UPDATE cf_usuarios_negocio SET permissions='${fullPerms}'::jsonb, role='admin', is_active=true WHERE pin='1234' AND business_id='${DBID}'`);
    console.log('   ✅ PIN 1234 actualizado con permisos completos');
  }

  const operPerms = '{"dashboard":true,"projects":true,"warehouse":true,"purchases":true,"invoices":false,"users":false,"settings":false,"workers":true,"operational_expenses":true,"payroll":true,"loans":true,"expense_report":true,"full_access":false,"investors":false}';
  const chk5678 = await q(`SELECT id FROM cf_usuarios_negocio WHERE pin='5678' AND business_id='${DBID}' LIMIT 1`);
  if (rows(chk5678).length === 0) {
    await q(`INSERT INTO cf_usuarios_negocio (business_id,full_name,pin,role,is_active,permissions) VALUES ('${DBID}','Operario Demo','5678','operator',true,'${operPerms}'::jsonb) ON CONFLICT DO NOTHING`);
    console.log('   ✅ PIN 5678 creado (Operario Demo)');
  }

  await sleep(150);

  // ── PROYECTOS DEMO ──────────────────────────────────────────────
  console.log('\n7. Insertando proyectos demo...');
  const projRes = await q(`
    INSERT INTO cf_proyectos (business_id, name, description, budget, spent, status, pipeline_stage, manager_name) VALUES
    ('${DBID}','Cultivo Arroz Parcela A','Siembra y cosecha de arroz en parcela norte',850000,420000,'active','in_progress','Carlos Mendez'),
    ('${DBID}','Invernadero Tomates','Construccion y operacion invernadero hidroponica',350000,180000,'active','in_progress','Ana Rodriguez'),
    ('${DBID}','Finca Maiz 2026','Proyecto maiz hibrido temporada lluviosa',620000,95000,'active','planning','Pedro Martinez'),
    ('${DBID}','Cosecha Platano Completada','Cosecha de platano cuarta temporada',280000,280000,'completed','delivered','Luis Garcia')
    ON CONFLICT DO NOTHING RETURNING id, name
  `);
  const projRows = rows(projRes);
  console.log('   Proyectos: ' + projRows.length + ' nuevos');

  await sleep(150);

  // Obtener IDs de proyectos
  const allProj = await q(`SELECT id, name FROM cf_proyectos WHERE business_id='${DBID}' ORDER BY created_at`);
  const projs = rows(allProj);
  if (projs.length === 0) { console.log('   ❌ No hay proyectos para asociar datos'); }
  const P1 = projs[0]?.id;
  const P2 = projs[1]?.id;

  // ── EMPLEADOS DEMO ──────────────────────────────────────────────
  console.log('\n8. Empleados demo...');
  const empRes = await q(`
    INSERT INTO cf_empleados (business_id, full_name, phone, daily_rate, pay_frequency, is_active) VALUES
    ('${DBID}','Miguel Santos Perez','829-555-1001',1500,'daily',true),
    ('${DBID}','Jose Ramon Feliz','829-555-1002',1200,'daily',true),
    ('${DBID}','Juan de la Cruz','809-444-1003',1300,'weekly',true),
    ('${DBID}','Felix Antonio Marte','809-444-1004',1100,'daily',true),
    ('${DBID}','Ramon Diaz Suero','829-333-1005',1400,'daily',true)
    ON CONFLICT DO NOTHING RETURNING id, full_name
  `);
  const empRows = rows(empRes);
  console.log('   Empleados: ' + empRows.length + ' nuevos');

  await sleep(150);

  // Obtener empleados
  const allEmp = await q(`SELECT id, full_name, daily_rate FROM cf_empleados WHERE business_id='${DBID}' ORDER BY created_at LIMIT 5`);
  const emps = rows(allEmp);
  const E1 = emps[0]?.id;
  const E2 = emps[1]?.id;
  const E3 = emps[2]?.id;

  // ── INVENTARIO DEMO ─────────────────────────────────────────────
  console.log('\n9. Inventario demo...');
  const invRes = await q(`
    INSERT INTO cf_inventario (business_id, name, category, sku, price, quantity, min_stock) VALUES
    ('${DBID}','Semilla Arroz Juma 57','Semillas','SEM-001',1800,150,30),
    ('${DBID}','Urea 46% 50kg','Fertilizantes','FER-001',2200,80,20),
    ('${DBID}','NPK 15-15-15 50kg','Fertilizantes','FER-002',1950,60,15),
    ('${DBID}','Herbicida Basagran 1L','Agroquimicos','AGR-001',3500,25,5),
    ('${DBID}','Fungicida Amistar 250ml','Agroquimicos','AGR-002',4200,18,5),
    ('${DBID}','Bomba Aspersora 16L','Equipos','EQP-001',5500,4,1),
    ('${DBID}','Machete Bellota','Herramientas','HER-001',850,12,3),
    ('${DBID}','Sacos 100lb (unidad)','Empaques','EMP-001',95,500,100)
    ON CONFLICT DO NOTHING RETURNING name
  `);
  console.log('   Inventario: ' + rows(invRes).length + ' items nuevos');

  await sleep(150);

  // ── COMPRAS DEMO ────────────────────────────────────────────────
  console.log('\n10. Compras demo...');
  await q(`
    INSERT INTO cf_compras (business_id, supplier, product_name, quantity, unit_price, total, date) VALUES
    ('${DBID}','AgroProductos del Norte SRL','Urea 46% 50kg',20,2200,44000,'2026-05-10'),
    ('${DBID}','AgroProductos del Norte SRL','NPK 15-15-15 50kg',15,1950,29250,'2026-05-12'),
    ('${DBID}','Distribuidora Campo Verde','Herbicida Basagran 1L',10,3500,35000,'2026-05-15'),
    ('${DBID}','Semillas Dominicanas SA','Semilla Arroz Juma 57',50,1800,90000,'2026-04-20'),
    ('${DBID}','Ferreteria El Agricultor','Sacos 100lb x100',5,9500,47500,'2026-05-18'),
    ('${DBID}','AgroProductos del Norte SRL','Fungicida Amistar 250ml',8,4200,33600,'2026-05-22')
    ON CONFLICT DO NOTHING RETURNING id
  `);
  console.log('   Compras: OK');

  await sleep(150);

  // ── GASTOS OPERATIVOS ───────────────────────────────────────────
  console.log('\n11. Gastos operativos demo...');
  await q(`
    INSERT INTO cf_gastos_operativos (business_id, category, description, amount, date, project_id, project_name) VALUES
    ('${DBID}','fuel','Gasolina tractor semana 1',4500,'2026-05-06','${P1 || ''}','Cultivo Arroz Parcela A'),
    ('${DBID}','fuel','Gasolina camioneta mayo',3800,'2026-05-08','${P1 || ''}','Cultivo Arroz Parcela A'),
    ('${DBID}','transport','Flete abono campo norte',3200,'2026-05-10','${P1 || ''}','Cultivo Arroz Parcela A'),
    ('${DBID}','food','Almuerzo trabajadores semana',2400,'2026-05-12','${P2 || P1 || ''}','Invernadero Tomates'),
    ('${DBID}','maintenance','Reparacion bomba riego',8500,'2026-05-14','${P2 || P1 || ''}','Invernadero Tomates'),
    ('${DBID}','other','Herramientas varias',3100,'2026-05-16','${P1 || ''}','Cultivo Arroz Parcela A'),
    ('${DBID}','fuel','Combustible generador',2900,'2026-05-20','${P2 || P1 || ''}','Invernadero Tomates'),
    ('${DBID}','transport','Flete cosecha platano',5500,'2026-05-28','${P1 || ''}','Cultivo Arroz Parcela A')
    ON CONFLICT DO NOTHING RETURNING id
  `);
  console.log('   Gastos: OK');

  await sleep(150);

  // ── FACTURAS DEMO ───────────────────────────────────────────────
  console.log('\n12. Facturas demo...');
  const projName1 = projs[0]?.name || 'Proyecto';
  const projName2 = projs[1]?.name || 'Proyecto 2';
  await q(`
    INSERT INTO cf_facturas (business_id, project_id, project_name, invoice_number, supplier, amount, paid_amount, payment_type, credit_days, status, due_date) VALUES
    ('${DBID}','${P1 || ''}','${projName1}','FAC-2026-001','AgroProductos del Norte SRL',44000,44000,'cash',0,'paid','2026-05-15'),
    ('${DBID}','${P1 || ''}','${projName1}','FAC-2026-002','Distribuidora Campo Verde',35000,20000,'credit',30,'partial','2026-06-14'),
    ('${DBID}','${P2 || P1 || ''}','${projName2}','FAC-2026-003','Semillas Dominicanas SA',90000,0,'credit',45,'pending','2026-07-01'),
    ('${DBID}','${P1 || ''}','${projName1}','FAC-2026-004','Ferreteria El Agricultor',47500,47500,'cash',0,'paid','2026-05-20'),
    ('${DBID}','${P2 || P1 || ''}','${projName2}','FAC-2026-005','AgroProductos del Norte SRL',29250,10000,'credit',30,'partial','2026-06-18')
    ON CONFLICT DO NOTHING RETURNING id
  `);
  console.log('   Facturas: OK');

  await sleep(150);

  // ── NOMINAS DEMO ────────────────────────────────────────────────
  if (E1 && E2 && E3) {
    console.log('\n13. Nominas demo...');
    await q(`
      INSERT INTO cf_nominas (business_id, worker_id, worker_name, project_id, project_name, days_worked, daily_rate, total, week_start, week_end, is_paid, paid_date) VALUES
      ('${DBID}','${E1}','${emps[0].full_name}','${P1 || ''}','${projName1}',6,${emps[0].daily_rate},${emps[0].daily_rate * 6},'2026-05-05','2026-05-10',true,'2026-05-11'),
      ('${DBID}','${E2}','${emps[1].full_name}','${P1 || ''}','${projName1}',6,${emps[1].daily_rate},${emps[1].daily_rate * 6},'2026-05-05','2026-05-10',true,'2026-05-11'),
      ('${DBID}','${E3}','${emps[2].full_name}','${P2 || P1 || ''}','${projName2}',5,${emps[2].daily_rate},${emps[2].daily_rate * 5},'2026-05-05','2026-05-09',true,'2026-05-10'),
      ('${DBID}','${E1}','${emps[0].full_name}','${P1 || ''}','${projName1}',6,${emps[0].daily_rate},${emps[0].daily_rate * 6},'2026-05-12','2026-05-17',false,null),
      ('${DBID}','${E2}','${emps[1].full_name}','${P1 || ''}','${projName1}',5,${emps[1].daily_rate},${emps[1].daily_rate * 5},'2026-05-12','2026-05-16',false,null)
      ON CONFLICT DO NOTHING RETURNING id
    `);
    console.log('   Nominas: OK (3 pagadas + 2 pendientes)');
  }

  await sleep(150);

  // ── PRESTAMOS DEMO ──────────────────────────────────────────────
  if (E1 && E2) {
    console.log('\n14. Prestamos demo...');
    const loanRes = await q(`
      INSERT INTO cf_prestamos (business_id, worker_id, worker_name, amount, remaining, status, date, notes) VALUES
      ('${DBID}','${E1}','${emps[0]?.full_name}',8000,5000,'active','2026-04-15','Prestamo para medicamentos'),
      ('${DBID}','${E2}','${emps[1]?.full_name}',5000,0,'paid','2026-03-10','Prestamo escolar completado')
      ON CONFLICT DO NOTHING RETURNING id
    `);
    const loanRows = rows(loanRes);
    console.log('   Prestamos: ' + loanRows.length + ' nuevos');

    if (loanRows[0]) {
      await sleep(100);
      await q(`
        INSERT INTO cf_deducciones_prestamo (loan_id, amount, date, notes) VALUES
        ('${loanRows[0].id}',1000,'2026-05-01','Deduccion quincenal'),
        ('${loanRows[0].id}',1000,'2026-05-15','Deduccion quincenal'),
        ('${loanRows[0].id}',1000,'2026-06-01','Deduccion quincenal')
        ON CONFLICT DO NOTHING RETURNING id
      `);
      console.log('   Deducciones: 3 cuotas aplicadas');
    }
  }

  await sleep(150);

  // ── INVERSIONISTAS DEMO ─────────────────────────────────────────
  console.log('\n15. Inversionistas demo...');
  const invR = await q(`
    INSERT INTO cf_inversionistas (business_id, nombre, email, telefono, empresa, capital_total, notas, is_active) VALUES
    ('${DBID}','Carlos Familia Ortega','carlos@familiaortega.com','809-800-0001','Inversiones Familia Ortega SRL',1500000,'Socio estrategico desde 2023',true),
    ('${DBID}','Rosa Mendez de Garcia','rosa@garcia.com','829-700-0002',NULL,800000,'Inversionista angel - sector agro',true),
    ('${DBID}','Grupo AgroCapital SA','info@agrocapital.com','809-600-0003','Grupo AgroCapital SA',2000000,'Fondo de inversion agricola',true),
    ('${DBID}','Miguel Fernandez VB','miguel.vb@gmail.com','829-500-0004',NULL,500000,'Referido por Carlos Familia',true)
    ON CONFLICT DO NOTHING RETURNING id, nombre
  `);
  const invRows = rows(invR);
  console.log('   Inversionistas: ' + invRows.length + ' nuevos');

  await sleep(150);

  // Vincular inversionistas a proyectos
  if (invRows.length > 0 && P1) {
    const allInv = await q(`SELECT id, nombre FROM cf_inversionistas WHERE business_id='${DBID}' ORDER BY created_at`);
    const investors = rows(allInv);
    if (investors[0] && P1) {
      await q(`
        INSERT INTO cf_proyecto_inversionistas (business_id, proyecto_id, inversionista_id, capital_invertido, porcentaje_ganancia, ganancia_estimada, ganancia_real, status, fecha_inicio) VALUES
        ('${DBID}','${P1}','${investors[0].id}',500000,15,75000,0,'activo','2026-04-01'),
        ('${DBID}','${P1}','${investors[1]?.id || investors[0].id}',300000,12,36000,0,'activo','2026-04-01')
        ON CONFLICT DO NOTHING RETURNING id
      `);
      console.log('   Vinculado inversionistas a proyecto');
    }
  }

  // ── CONFIGURACION DEMO ──────────────────────────────────────────
  await sleep(100);
  await q(`
    INSERT INTO cf_configuracion (business_id, empresa, direccion, telefono, moneda, formato_fecha)
    VALUES ('${DBID}','Finca Demo El Paraiso','Km 45 Autopista Duarte, Santiago, RD','809-555-9999','RD$','DD/MM/YYYY')
    ON CONFLICT (business_id) DO UPDATE SET
      empresa = EXCLUDED.empresa,
      direccion = EXCLUDED.direccion,
      telefono = EXCLUDED.telefono
  `);
  console.log('\n16. Configuracion demo: OK');

  // ── RESUMEN FINAL ───────────────────────────────────────────────
  console.log('\n=== RESUMEN FINAL ===');
  const usrFin = await q(`SELECT full_name, pin, role FROM cf_usuarios_negocio ORDER BY business_id, role DESC`);
  rows(usrFin).forEach(r => console.log('  PIN=' + r.pin + ' | ' + r.full_name + ' | ' + r.role));
  console.log('\n*** SETUP COMPLETO ***');
  console.log('  PIN 1234 = Admin Demo (Finca Demo El Paraiso) - FLUJO COMPLETO');
  console.log('  PIN 5678 = Operario Demo (Finca Demo El Paraiso)');
  console.log('  PIN 8080 = Administrador (Agroboys) - con Inversionistas habilitado');
}

main().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
