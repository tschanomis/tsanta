import entries from '../.allowed-emails.json' with { type: 'json' };
import pg from 'pg';

async function main() {
  if (!Array.isArray(entries)) throw new Error('Le fichier doit contenir un tableau d’objets { "email": "…" }.');

  const emails = [...new Set(entries.map((entry, index) => {
    if (!entry || typeof entry !== 'object' || typeof entry.email !== 'string') {
      throw new Error(`Entrée ${index + 1} : propriété email manquante ou invalide.`);
    }
    const email = entry.email.trim().toLowerCase();
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error(`Entrée ${index + 1} : adresse email invalide.`);
    }
    return email;
  }))];

  if (!emails.length) {
    console.log('Aucun email à importer. Remplissez le fichier caché .allowed-emails.json.');
    return;
  }
  if (!process.env.DATABASE_URL) throw new Error('Définissez DATABASE_URL avant l’import.');
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  try {
    await client.connect();
    const result = await client.query(
      `INSERT INTO allowed_emails (email)
       SELECT unnest($1::text[]) ON CONFLICT (email) DO NOTHING`, [emails],
    );
    console.log(`${result.rowCount} adresse(s) ajoutée(s), ${emails.length - result.rowCount} déjà présente(s).`);
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : 'Échec de l’import.');
  process.exitCode = 1;
});
