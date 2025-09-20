# 📅 Agenda (Express + Prisma + EJS)

Application agenda avec API REST et rendu serveur via **EJS**, construite avec **Node.js**, **Express**, et **Prisma ORM**.

## ✨ Fonctionnalités

- 🔐 **CRUD complet** pour utilisateurs et événements
- 📊 **Base de données** avec Prisma ORM (supporte MySQL, PostgreSQL, SQLite)
- 🛡️ **Validation** des données entrantes
- 🚀 **API REST** bien structurée
- �️ **UI EJS** (pages: accueil, login, paramètres) avec assets statiques
- �📝 **Documentation** complète des endpoints (voir `API_DOCS.md`)
- 🔧 **Environnement de développement** avec hot reload

## 🛠️ Technologies utilisées

- **Node.js** + **Express.js**
- **Prisma ORM** pour la gestion de base de données
- **SQLite** (développement) / **MySQL** (production)
- **dotenv** pour la configuration
- **cors** pour les requêtes cross-origin
- **nodemon** pour le développement

## 📦 Installation

1. **Cloner le projet** :
```bash
git clone <url-du-repo>
cd agenda-dylan
```

2. **Installer les dépendances** :
```bash
npm install
```

3. **Configurer les variables d'environnement** :
Créez un fichier `.env` à la racine (exemple):

```env
NODE_ENV=development
PORT=5555
DATABASE_URL="file:./dev.db"   # SQLite (fichier: prisma/dev.db)
JWT_SECRET=change-me-please-very-strong
```

4. **Configurer la base de données** :

### Pour SQLite (développement local) :
```bash
# Générer le client Prisma
npm run db:generate

# Créer la base de données et les tables
npm run db:push
```

### Pour MySQL (production Alwaysdata) :
```bash
# Modifier DATABASE_URL dans .env :
DATABASE_URL="mysql://username:password@mysql-server.alwaysdata.net:3306/database_name"

# Changer le provider dans prisma/schema.prisma de "sqlite" à "mysql"
# Puis :
npm run db:generate
npm run db:push
```

## 🚀 Démarrage

### Développement :
```bash
npm run dev
```

### Production :
```bash
npm start
```

Le serveur démarre sur `http://localhost:5555`

### EJS (moteur de vues)

- Pages servies côté serveur: `/` (index), `/login`, `/settings` via `src/views/*.ejs`
- Layout commun: `src/views/layout.ejs` (via `express-ejs-layouts`)
- Assets statiques: `public/` (ex: `/styles.css`, `/script.js`)
- Route de test: `GET /ejs-test`

Note: L’ancienne page statique `public/index.html` n’est plus utilisée (la page d’accueil est rendue en EJS).

## 📡 Endpoints API

La documentation complète (paramètres, exemples, erreurs) est dans `API_DOCS.md`.

Résumé rapide:

- Utilisateurs: `GET /api/users`, `GET /api/users/:id`, `POST /api/users`, `PUT /api/users/:id`, `DELETE /api/users/:id`
- Événements: `GET /api/events`, `GET /api/events/:id`, `GET /api/events/user/:userId/daterange`, `POST /api/events`, `PUT /api/events/:id`, `DELETE /api/events/:id`
- Autre: `GET /health`

## 💾 Modèles de données

### User
```javascript
{
  id: "string",
  email: "string", // unique
  name: "string", // optionnel
  createdAt: "datetime",
  updatedAt: "datetime"
}
```

### Event
```javascript
{
  id: "string",
  title: "string", // requis
  description: "string", // optionnel
  startDate: "datetime", // requis
  endDate: "datetime", // optionnel
  location: "string", // optionnel
  isAllDay: "boolean", // défaut: false
  color: "string", // défaut: "#3b82f6"
  status: "string", // SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED
  userId: "string", // requis
  createdAt: "datetime",
  updatedAt: "datetime"
}
```

## 📝 Exemples d'utilisation

### Créer un utilisateur :
```bash
curl -X POST http://localhost:5555/api/users \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "name": "Test User"}'
```

### Créer un événement :
```bash
curl -X POST http://localhost:5555/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Réunion importante",
    "description": "Discussion projet",
    "startDate": "2025-09-21T09:00:00Z",
    "endDate": "2025-09-21T10:30:00Z",
    "userId": "USER_ID_HERE"
  }'
```

## 🛠️ Scripts disponibles

```bash
npm run dev          # Démarrer en développement avec nodemon
npm start            # Démarrer en production
npm run db:generate  # Générer le client Prisma
npm run db:push      # Synchroniser le schéma avec la DB
npm run db:migrate   # Créer une migration
npm run db:studio    # Ouvrir Prisma Studio
```

## 🗄️ Structure du projet

```
├── prisma/
│   ├── dev.db                # Base SQLite locale (créée après db:push)
│   └── schema.prisma         # Schéma de base de données
├── src/
│   ├── controllers/          # Logique métier
│   │   ├── eventController.js
│   │   └── userController.js
│   ├── services/             # Services de données
│   │   ├── eventService.js
│   │   └── userService.js
│   ├── routes/               # Routes Express
│   │   ├── events.js
│   │   └── users.js
│   ├── middleware/           # Middleware de validation
│   │   └── validation.js
│   ├── lib/                  # Utilitaires
│   │   └── prisma.js
│   ├── views/                # Vues EJS (rendu serveur)
│   │   ├── layout.ejs
│   │   ├── index.ejs
│   │   ├── login.ejs
│   │   └── settings.ejs
│   └── server.js             # Point d'entrée
├── public/                   # Fichiers statiques (css, js)
├── .env                      # Variables d'environnement
├── .gitignore
├── package.json
└── API_DOCS.md              # Documentation détaillée de l'API
```

## 🔧 Configuration pour Alwaysdata

1. **Modifier le schéma Prisma** :
```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```

2. **Configurer .env pour Alwaysdata** :
```env
DATABASE_URL="mysql://username:password@mysql-server.alwaysdata.net:3306/database_name"
PORT=80
NODE_ENV="production"
```

3. **Déployer** :
```bash
npm run db:generate
npm run db:push
npm start
```

## 🧪 Tests

Un script de test de base de données est inclus :
```bash
node test-db.js
```

## 📚 Documentation

- [Documentation API complète](./API_DOCS.md)
- [Documentation Prisma](https://www.prisma.io/docs/)
- [Documentation Express](https://expressjs.com/)

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push sur la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Distribué sous licence MIT. Voir `LICENSE` pour plus d'informations.

---

## 🎯 Status du projet

✅ **Configuration complète** : Prisma + Express + MySQL/SQLite  
✅ **CRUD utilisateurs** : Complet avec validation  
✅ **CRUD événements** : Complet avec relations  
✅ **API REST** : Endpoints bien structurés  
✅ **Documentation** : API et README complets  
✅ **Validation** : Middleware de validation robuste  
✅ **Prêt pour déploiement** : Configuration Alwaysdata incluse  

**Le projet est maintenant prêt pour la production ! 🚀**