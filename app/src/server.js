require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const eventRoutes = require('./routes/events');
const userRoutes = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 5555;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// View engine: EJS (without touching current frontend)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layout');

// Routes API
app.use('/api/events', eventRoutes);
app.use('/api/users', userRoutes);

// Routes pages EJS (frontend migré)
app.get('/', (req, res) => {
  res.render('index', { title: 'Agenda', heading: '📅 Mon Agenda Personnel' });
});

app.get('/login', (req, res) => {
  res.render('login', { title: 'Connexion', heading: '🔐 Connexion' });
});

app.get('/settings', (req, res) => {
  res.render('settings', { title: 'Paramètres', heading: '⚙️ Paramètres' });
});

// Route de test EJS (ne modifie pas le frontend existant)
app.get('/ejs-test', (req, res) => {
  res.render('ejs-test', {
    title: 'Test EJS',
    heading: 'Rendu EJS',
    message: 'EJS est configuré et opérationnel sans toucher au code frontend.'
  });
});

// Route de santé pour vérifier le statut du serveur
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Serveur agenda fonctionne correctement',
    timestamp: new Date().toISOString()
  });
});

// Gestion d'erreurs globale
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Erreur interne du serveur',
    message: err.message 
  });
});

// Route 404
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Serveur agenda démarré sur http://localhost:${PORT}`);
    console.log(`Endpoints disponibles:`);
    console.log(`  - GET    /health`);
    console.log(`  - GET    /api/users`);
    console.log(`  - POST   /api/users`);
    console.log(`  - GET    /api/events`);
    console.log(`  - POST   /api/events`);
    console.log(`  - PUT    /api/events/:id`);
    console.log(`  - DELETE /api/events/:id`);
    console.log(`  - GET    /ejs-test`);
  });
}

module.exports = app;