const eventService = require('../services/eventService');
const userService = require('../services/userService');

// Récupérer tous les événements
exports.getAllEvents = async (req, res) => {
  try {
    const { userId, startDate, endDate, status } = req.query;
    
    const filters = {};
    if (startDate && endDate) {
      filters.startDate = startDate;
      filters.endDate = endDate;
    }
    if (status) {
      filters.status = status;
    }
    
    const events = await eventService.getAllEvents(userId, filters);
    
    res.json({
      success: true,
      data: events,
      count: events.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur lors de la récupération des événements'
    });
  }
};

// Récupérer un événement par ID
exports.getEventById = async (req, res) => {
  try {
    const eventId = req.params.id;
    const event = await eventService.getEventById(eventId);
    
    res.json({
      success: true,
      data: event
    });
  } catch (error) {
    if (error.message.includes('non trouvé')) {
      return res.status(404).json({
        success: false,
        error: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur lors de la récupération de l\'événement'
    });
  }
};

// Créer un nouvel événement
exports.createEvent = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      startDate, 
      endDate, 
      location,
      isAllDay,
      color,
      status,
      userId 
    } = req.body;
    
    // Validation des champs requis
    if (!title || !startDate || !userId) {
      return res.status(400).json({
        success: false,
        error: 'Les champs title, startDate et userId sont requis'
      });
    }

    // Vérifier que l'utilisateur existe
    try {
      await userService.getUserById(userId);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: 'Utilisateur non trouvé'
      });
    }
    
    const eventData = {
      title,
      description,
      startDate,
      endDate,
      location,
      isAllDay: isAllDay || false,
      color: color || '#3b82f6',
      status: status || 'SCHEDULED',
      userId
    };
    
    const newEvent = await eventService.createEvent(eventData);
    
    res.status(201).json({
      success: true,
      message: 'Événement créé avec succès',
      data: newEvent
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur lors de la création de l\'événement'
    });
  }
};

// Modifier un événement
exports.updateEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const updateData = req.body;
    
    // Validation des données si nécessaire
    if (updateData.userId) {
      try {
        await userService.getUserById(updateData.userId);
      } catch (error) {
        return res.status(400).json({
          success: false,
          error: 'Utilisateur non trouvé'
        });
      }
    }
    
    const updatedEvent = await eventService.updateEvent(eventId, updateData);
    
    res.json({
      success: true,
      message: 'Événement mis à jour avec succès',
      data: updatedEvent
    });
  } catch (error) {
    if (error.message.includes('non trouvé')) {
      return res.status(404).json({
        success: false,
        error: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur lors de la mise à jour de l\'événement'
    });
  }
};

// Supprimer un événement
exports.deleteEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    
    await eventService.deleteEvent(eventId);
    
    res.json({
      success: true,
      message: 'Événement supprimé avec succès'
    });
  } catch (error) {
    if (error.message.includes('non trouvé')) {
      return res.status(404).json({
        success: false,
        error: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur lors de la suppression de l\'événement'
    });
  }
};

// Récupérer les événements par période
exports.getEventsByDateRange = async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'Les paramètres startDate et endDate sont requis'
      });
    }
    
    const events = await eventService.getEventsByDateRange(userId, startDate, endDate);
    
    res.json({
      success: true,
      data: events,
      count: events.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur lors de la récupération des événements par période'
    });
  }
};