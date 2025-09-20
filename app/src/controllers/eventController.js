// Récupérer tous les événements
exports.getAllEvents = (req, res) => {
  try {
    const events = req.app.locals.events;
    res.json({
      success: true,
      data: events,
      count: events.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des événements'
    });
  }
};

// Récupérer un événement par ID
exports.getEventById = (req, res) => {
  try {
    const eventId = parseInt(req.params.id);
    const event = req.app.locals.events.find(e => e.id === eventId);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Événement non trouvé'
      });
    }
    
    res.json({
      success: true,
      data: event
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération de l\'événement'
    });
  }
};

// Créer un nouvel événement
exports.createEvent = (req, res) => {
  try {
    const { title, description, start, end, category, priority } = req.body;
    
    const newEvent = {
      id: Date.now(), // ID temporaire, utiliser UUID en production
      title,
      description,
      start,
      end,
      category: category || 'général',
      priority: priority || 'moyenne',
      createdAt: new Date().toISOString()
    };
    
    req.app.locals.events.push(newEvent);
    
    res.status(201).json({
      success: true,
      message: 'Événement créé avec succès',
      data: newEvent
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la création de l\'événement'
    });
  }
};

// Modifier un événement
exports.updateEvent = (req, res) => {
  try {
    const eventId = parseInt(req.params.id);
    const eventIndex = req.app.locals.events.findIndex(e => e.id === eventId);
    
    if (eventIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Événement non trouvé'
      });
    }
    
    const { title, description, start, end, category, priority } = req.body;
    
    req.app.locals.events[eventIndex] = {
      ...req.app.locals.events[eventIndex],
      title,
      description,
      start,
      end,
      category,
      priority,
      updatedAt: new Date().toISOString()
    };
    
    res.json({
      success: true,
      message: 'Événement modifié avec succès',
      data: req.app.locals.events[eventIndex]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la modification de l\'événement'
    });
  }
};

// Supprimer un événement
exports.deleteEvent = (req, res) => {
  try {
    const eventId = parseInt(req.params.id);
    const eventIndex = req.app.locals.events.findIndex(e => e.id === eventId);
    
    if (eventIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Événement non trouvé'
      });
    }
    
    req.app.locals.events.splice(eventIndex, 1);
    
    res.json({
      success: true,
      message: 'Événement supprimé avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la suppression de l\'événement'
    });
  }
};
