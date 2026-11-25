# Santa

Application Next.js avec authentification par email et mot de passe, réservée aux adresses autorisées.

## Configuration

### PostgreSQL local avec Docker

Les variables `POSTGRES_USER`, `POSTGRES_PASSWORD` et `POSTGRES_DB` sont à définir dans `.env.local`, avec une `DATABASE_URL` correspondante (`postgresql://USER:PASSWORD@localhost:55432/DATABASE`).

```sh
docker compose --env-file .env.local up -d --wait
npm run db:migrate
```

PostgreSQL est accessible uniquement en local sur le port 55432. Les données sont conservées dans le volume `postgres_data`. Pour arrêter le service sans effacer les données :

```sh
docker compose --env-file .env.local down
```

Les variables PostgreSQL initialisent le volume au premier démarrage ; les modifier ensuite ne change pas les identifiants d’une base déjà créée.

Si le conteneur a été créé directement avec `docker run` sous le nom `santa-postgres`, utiliser `docker stop santa-postgres` et `docker start santa-postgres` pour le gérer. L’arrêter avant de démarrer le service Compose, qui utilise le même port.

### Application

1. Installer les dépendances avec `pnpm install`.
2. Créer un fichier `.env.local` contenant `DATABASE_URL` (URL de connexion PostgreSQL) et `AUTH_SECRET` (secret aléatoire stable, généré par exemple avec `openssl rand -base64 48`). Définir aussi ce secret dans l’environnement de production et le conserver entre les déploiements. Ne pas versionner ce fichier. Utiliser TLS selon les exigences de votre hébergeur PostgreSQL.
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

L’authentification utilise NextAuth v5 (`next-auth`, actuellement en bêta) avec le fournisseur Credentials. Les comptes et mots de passe scrypt existants sont conservés. L’inscription et le blocage du compte pendant quinze minutes après cinq échecs restent gérés par l’application.

NextAuth gère les sessions JWT chiffrées de sept jours et les cookies HttpOnly, SameSite=Lax et Secure en production (HTTPS requis). Les routes Auth.js sont exposées sous `/api/auth`. La déconnexion efface le cookie NextAuth. Les pages privées vérifient aussi en base que le compte existe toujours.

En production, définir `AUTH_URL` avec l’URL publique HTTPS de la route Auth.js (par exemple `https://santa.example.com/santa/api/auth`).

Les anciennes sessions `santa_session` ne sont plus acceptées : les utilisateurs doivent se reconnecter après migration. La table historique `sessions` est conservée mais n’est plus utilisée. Supprimer ses lignes ne révoque donc pas les sessions NextAuth. Avec les JWT, la déconnexion ne révoque pas une copie du jeton déjà dérobée : celle-ci reste valable jusqu’à expiration. La suppression du compte empêche immédiatement l’accès aux pages protégées par `requireUser()`.

Supprimer une adresse de `allowed_emails` supprime également son utilisateur par cascade. Aucun changement de schéma n’est requis pour cette migration.

La liste autorisée est stockée dans Postgres et alimentée par le script d’import. La vérification de possession d'une adresse email et la récupération de mot de passe ne sont pas incluses. Toute future page ou action privée doit appeler `requireUser()` avant d'accéder aux données protégées.

## Vérifications

### CI/CD de production

GitHub Actions exécute le lint, la vérification TypeScript et le build pour les pull requests et les changements sur `main`. Après réussite, le job de production construit l’image Docker et la transfère par SSH à l’instance OVH.

Sur l’instance, installer Docker Engine avec Compose et Caddy. Placer `deploy/compose.yaml` et `deploy/release.sh` dans `/opt/santa`, sous le compte root, avec le script exécutable. Créer `/opt/santa/.env` avec les permissions `0600` et les variables `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `DATABASE_URL`, `AUTH_SECRET` et `AUTH_URL`. Utiliser `postgres` comme hôte dans `DATABASE_URL` et `https://<domaine>/santa/api/auth` pour `AUTH_URL`.

Configurer `deploy/Caddyfile` avec `SANTA_HOST`, le nom d’hôte public. Avec cette configuration, Caddy utilise le port 443 pour HTTPS et la validation ACME. Le port 80 reste disponible pour Nginx. Caddy transmet `/santa` à Next.js sur `127.0.0.1:13000`. L’image de production inclut le préfixe `/santa`. Les données PostgreSQL résident dans le volume `santa_postgres_data`.

Dans GitHub, définir les variables du dépôt `PRODUCTION_DEPLOY_ENABLED=true` et `PRODUCTION_SSH_HOST`, puis les secrets de l’environnement `production` `PRODUCTION_SSH_KEY` et `PRODUCTION_SSH_KNOWN_HOSTS`. Utiliser une clé dédiée, avec l’option `restrict,command="/opt/santa/release.sh"` sur la ligne correspondante de `/root/.ssh/authorized_keys`. Vérifier la clé d’hôte auprès de l’instance avant de renseigner le secret.

Le script attend PostgreSQL, applique les migrations et vérifie la santé de l’application. Si la vérification échoue, il rétablit l’image précédente lorsqu’elle est disponible. Les migrations appliquées restent en base. Le résultat du déploiement est visible dans GitHub Actions.

### Vérifications locales

Les pages utilisent `lib/data/users.ts` pour lire les profils : ce module serveur vérifie la connexion, valide les identifiants et ne retourne que les champs nécessaires à l’affichage. Les pages gèrent le rendu, les états de chargement et les réponses 404. Les mutations d’authentification restent dans les Server Actions de `app/auth-actions.ts`. La lecture de l’utilisateur connecté est dédupliquée pendant le rendu serveur avec `React.cache`, sans cache partagé entre utilisateurs.

```sh
npm run lint
npx tsc --noEmit
npm run build
```
