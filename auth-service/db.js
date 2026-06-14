const { Pool } = require("pg");

const pool = new Pool({
  host: "localhost",
  port: 5432,
  database: "auth_db",
  user: "alexandramoldovan"
});

module.exports = pool;