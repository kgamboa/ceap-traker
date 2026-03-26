const pool = require('./server/src/config/database');

async function checkTables() {
  try {
    const res = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log('Tables:', res.rows.map(r => r.table_name).join(', '));
    
    // Check phases
    const phases = await pool.query("SELECT * FROM fases ORDER BY numero_orden");
    console.log('Phases:', phases.rows);
    
    // Check users
    try {
        const users = await pool.query("SELECT * FROM usuarios LIMIT 5");
        console.log('Users (limited):', users.rows);
    } catch (e) {
        console.log('Users table probably not named "usuarios"');
    }

  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

checkTables();
