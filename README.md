# STUDIO e - Paiements

Application de consultation de montants dus pour le STUDIO e.

## 🎯 Fonctionnalités

### Côté Utilisateur (Parents)
- Code d'accès pour accéder à l'application
- Recherche par nom + date de naissance (JJ/MM/AAAA)
- Affichage du montant dû avec raison personnalisable
- Indication si le paiement a été effectué

### Côté Admin
- Import de données (CSV, Excel, TXT, copier-coller)
- Gestion des paiements en attente
- Marquage des paiements comme "payé"
- Historique des paiements
- Export CSV
- Modification du code d'accès

## 📋 Format d'import

```
Nom, Date de naissance (JJ/MM/AAAA), Montant, Raison
```

Exemple:
```
Marie Dupont, 15/03/2010, 150, Cours de danse
Paul Martin, 20/05/2012, 200, Concours
Sophie Leblanc, 10/08/2011, 120, Stage été
```

## 🚀 Installation

1. Installer les dépendances:
```bash
npm install
```

2. Configurer la base de données Neon:
   - Créer un compte sur [Neon](https://neon.tech)
   - Créer une nouvelle base de données PostgreSQL
   - Copier l'URL de connexion

3. Configurer les variables d'environnement:
   - Modifier le fichier `.env.local`
   - Remplacer `your_neon_database_url_here` par votre URL Neon

4. Initialiser la base de données:
   - Démarrer le serveur: `npm run dev`
   - Appeler l'API: `POST http://localhost:3000/api/init-db`
   - Ou utiliser curl: `curl -X POST http://localhost:3000/api/init-db`

5. Lancer l'application:
```bash
npm run dev
```

L'application sera accessible sur `http://localhost:3000`

## 🔐 Accès

### Admin
- URL: `http://localhost:3000/admin`
- Mot de passe par défaut: `admin2026`

### Utilisateurs (Parents)
- URL: `http://localhost:3000`
- Code d'accès par défaut: `STUDIO2026` (modifiable dans l'admin)

## 📦 Déploiement sur Vercel

1. Créer un compte sur [Vercel](https://vercel.com)

2. Installer Vercel CLI:
```bash
npm i -g vercel
```

3. Se connecter:
```bash
vercel login
```

4. Déployer:
```bash
vercel
```

5. Configurer les variables d'environnement sur Vercel:
   - Aller dans Settings > Environment Variables
   - Ajouter `POSTGRES_URL` avec votre URL Neon

6. Initialiser la base de données en production:
   - Appeler: `POST https://votre-app.vercel.app/api/init-db`

## 🎨 Charte graphique

L'application utilise la même charte graphique que l'application "Spectacle de Danse":
- Logo STUDIO e vectoriel
- Dégradé purple-50 to pink-50
- Header gris foncé (gray-800 to gray-700)
- Composants UI shadcn/ui

## 📝 Structure du projet

```
studio-paiements/
├── app/
│   ├── admin/          # Page admin
│   ├── api/            # Routes API
│   ├── globals.css     # Styles globaux
│   ├── layout.tsx      # Layout principal
│   └── page.tsx        # Page utilisateur
├── components/
│   ├── ui/             # Composants UI
│   └── StudioLogo.tsx  # Logo vectoriel
├── lib/
│   ├── api-client.ts   # Client API
│   ├── types.ts        # Types TypeScript
│   └── vercel-db.ts    # Accès base de données
└── .env.local          # Variables d'environnement
```

## 🔧 Technologies utilisées

- **Framework**: Next.js 15 (App Router)
- **Base de données**: Neon PostgreSQL (serverless)
- **UI**: shadcn/ui + Tailwind CSS
- **Déploiement**: Vercel
- **TypeScript**: Pour la sécurité du code

## 📞 Support

En cas de question, contactez l'administrateur du STUDIO e.
