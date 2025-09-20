// Validation des événements
exports.validateEvent = (req, res, next) => {
  const { title, startDate, endDate, userId } = req.body;
  
  if (!title || title.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Le titre est obligatoire'
    });
  }
  
  if (!startDate) {
    return res.status(400).json({
      success: false,
      error: 'La date de début est obligatoire'
    });
  }
  
  if (!userId) {
    return res.status(400).json({
      success: false,
      error: 'L\'ID utilisateur est obligatoire'
    });
  }
  
  // Validation optionnelle de la date de fin si elle est fournie
  if (endDate && new Date(startDate) >= new Date(endDate)) {
    return res.status(400).json({
      success: false,
      error: 'La date de fin doit être postérieure à la date de début'
    });
  }
  
  // Validation de la date de début
  const startDateObj = new Date(startDate);
  if (isNaN(startDateObj.getTime())) {
    return res.status(400).json({
      success: false,
      error: 'La date de début n\'est pas valide'
    });
  }
  
  next();
};

// Validation des utilisateurs
exports.validateUser = (req, res, next) => {
  const { email, name } = req.body;
  
  if (!email || email.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'L\'email est obligatoire'
    });
  }
  
  // Validation basique de l'email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      error: 'L\'email n\'est pas valide'
    });
  }
  
  // Validation optionnelle du nom
  if (name && name.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Le nom ne peut pas être vide s\'il est fourni'
    });
  }
  
  next();
};
