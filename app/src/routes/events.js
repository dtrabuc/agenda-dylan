const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { validateEvent } = require('../middleware/validation');

// GET /api/events - Récupérer tous les événements (avec filtres optionnels)
router.get('/', eventController.getAllEvents);

// GET /api/events/:id - Récupérer un événement par ID
router.get('/:id', eventController.getEventById);

// GET /api/events/user/:userId/daterange - Récupérer les événements d'un utilisateur par période
router.get('/user/:userId/daterange', eventController.getEventsByDateRange);

// POST /api/events - Créer un nouvel événement
router.post('/', validateEvent, eventController.createEvent);

// PUT /api/events/:id - Modifier un événement
router.put('/:id', validateEvent, eventController.updateEvent);

// DELETE /api/events/:id - Supprimer un événement
router.delete('/:id', eventController.deleteEvent);

module.exports = router;
