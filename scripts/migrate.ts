import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { migrate } from 'drizzle-orm/mysql2/migrator';
import * as schema from '../server/db/schema';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log('Starting migration script...');
  
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL is not set');
    process.exit(1);
  }

  const migrationsFolder = path.join(__dirname, '../drizzle');
  console.log(`Migrations folder: ${migrationsFolder}`);

  if (fs.existsSync(migrationsFolder)) {
    const files = fs.readdirSync(migrationsFolder);
    console.log('Files in migrations folder:', files);
    files.forEach(file => {
      if (file.endsWith('.sql')) {
        const content = fs.readFileSync(path.join(migrationsFolder, file), 'utf8');
        console.log(`--- Content of ${file} (first 100 chars) ---`);
        console.log(content.substring(0, 100).replace(/\n/g, ' '));
        console.log('-----------------------------------------');
      }
    });
  } else {
    console.error('Migrations folder does not exist!');
  }

  console.log('Connecting to database...');
  const connection = await mysql.createConnection(databaseUrl);
  const db = drizzle(connection, { schema, mode: 'default' });

  console.log('Running migrations...');
  try {
    await migrate(db, { migrationsFolder });
    console.log('Migrations completed successfully!');
    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('Migration failed!');
    console.error(error);
    await connection.end();
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Unexpected error in migration script:');
  console.error(err);
  process.exit(1);
});
