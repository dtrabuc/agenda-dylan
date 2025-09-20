require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const eventRoutes = require('./routes/events');

const app = express();
const PORT = process.env.PORT || 5555;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// Base de données simulée (remplacer par MongoDB/PostgreSQL en production)
app.locals.events = [
  {
    id: 1,
    title: "Réunion équipe",
    description: "Réunion hebdomadaire de l'équipe",
    start: "2025-09-21T09:00:00",
    end: "2025-09-21T10:30:00",
    category: "travail",
    priority: "haute"
  },
  {
    id: 2,
    title: "RDV médecin",
    description: "Consultation de routine",
    start: "2025-09-23T14:00:00",
    end: "2025-09-23T15:00:00",
    category: "personnel",
    priority: "moyenne"
  }
];

// Routes
app.use('/api/events', eventRoutes);

// Route pour servir l'index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
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

app.listen(PORT, () => {
  console.log(`Serveur agenda démarré sur http://localhost:${PORT}`);
});