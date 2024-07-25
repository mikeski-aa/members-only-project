const pool = require("./config/pool");

// connect to DB created in neon
async function getPgVersion() {
  const client = await pool.connect();
  try {
    const result = await client.query("SELECT version()");
    const test = await client.query("SELECT * from users");
    console.log(result.rows[0]);
  } finally {
    client.release();
  }
}
getPgVersion();
