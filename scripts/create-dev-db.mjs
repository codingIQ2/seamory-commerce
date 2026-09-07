import pg from "pg";

const databaseName = "hukupuku";
const client = new pg.Client({
  connectionString: "postgresql://postgres:postgres@localhost:51214/template1?sslmode=disable",
});

await client.connect();

try {
  const result = await client.query("SELECT 1 FROM pg_database WHERE datname = $1", [databaseName]);

  if (result.rowCount === 0) {
    await client.query(`CREATE DATABASE ${databaseName}`);
    console.log(`Created local database: ${databaseName}`);
  } else {
    console.log(`Local database already exists: ${databaseName}`);
  }
} finally {
  await client.end();
}
