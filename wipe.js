const postgres = require("postgres");
const sql = postgres(
  "postgres://postgres:postgres@localhost:5432/inventory_db_test",
);
async function wipe() {
  await sql`DROP SCHEMA public CASCADE;`;
  await sql`CREATE SCHEMA public;`;
  console.log("Wiped");
  process.exit(0);
}
wipe();
