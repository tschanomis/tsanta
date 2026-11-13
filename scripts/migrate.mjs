import { readFile } from 'node:fs/promises';
import pg from 'pg';

if (!process.env.DATABASE_URL) throw new Error('Définissez DATABASE_URL avant la migration.');
const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
try {
  await client.connect();
  await client.query(await readFile(new URL('../db/001-auth.sql', import.meta.url), 'utf8'));
  console.log('Tables d’authentification créées.');
  await client.query(await readFile(new URL('../db/002-items.sql', import.meta.url), 'utf8'));
  console.log('Table des items créée.');
} finally {
  await client.end();
}
