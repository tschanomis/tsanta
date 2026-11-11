# Santa

Application Next.js avec authentification par email et mot de passe, réservée aux adresses autorisées.

## Configuration

1. Installer les dépendances avec `pnpm install`.
2. Créer un fichier `.env.local` contenant `DATABASE_URL` (URL de connexion PostgreSQL). Ne pas versionner ce fichier. Utiliser TLS selon les exigences de votre hébergeur PostgreSQL.
3. Exécuter `npm run db:migrate`. La migration crée les trois tables : `allowed_emails`, `users`, `sessions`. Elle rétablit aussi la relation entre utilisateurs et emails autorisés si la version avec liste TypeScript avait déjà été appliquée, en conservant les comptes existants.
4. Remplir le fichier caché `.allowed-emails.json` à la racine du projet (exclu de Git) :

```json
[
  { "email": "alice@example.com" },
  { "email": "bob@example.com" }
]
```

Puis exécuter `npm run db:seed-emails`. Le fichier fourni est vide. Le script valide tout le fichier avant l’import, normalise les adresses en minuscules et ignore les doublons. L’import ajoute des adresses sans supprimer celles déjà présentes en base. Modifier le fichier seul ne modifie pas la base ; relancer le script pour importer les ajouts. Le script importe directement le fichier `.allowed-emails.json`.

5. Lancer `npm run dev`, puis ouvrir http://localhost:3000.

## Parcours

La première visite redirige vers `/connexion`. Le lien `/inscription` permet à une adresse autorisée de créer son mot de passe (12 à 128 caractères). Les emails sont normalisés en minuscules. Un compte existant ne peut pas être écrasé par une nouvelle inscription.

Les mots de passe utilisent scrypt avec un sel aléatoire. Le cookie de session est HttpOnly, SameSite=Lax et Secure en production (HTTPS requis). Seul le hash du jeton est stocké en base ; les sessions expirent après sept jours. La déconnexion supprime la session côté serveur. Cinq échecs de connexion bloquent le compte quinze minutes.

Supprimer une adresse de la table `allowed_emails` supprime également son utilisateur et ses sessions par cascade. Révoquer toutes les sessions d'un utilisateur :

```sql
DELETE FROM sessions WHERE user_id = 'UUID_UTILISATEUR';
```

Nettoyer périodiquement les sessions expirées :

```sql
DELETE FROM sessions WHERE expires_at <= now();
```

La liste autorisée est stockée dans Postgres et alimentée par le script d’import. La vérification de possession d'une adresse email et la récupération de mot de passe ne sont pas incluses. Toute future page ou action privée doit appeler `requireUser()` avant d'accéder aux données protégées.

## Vérifications

```sh
npm run lint
npx tsc --noEmit
npm run build
```
