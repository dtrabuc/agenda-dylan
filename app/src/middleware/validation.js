exports.validateEvent = (req, res, next) => {
  const { title, start, end } = req.body;
  
  if (!title || title.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Le titre est obligatoire'
    });
  }
  
  if (!start) {
    return res.status(400).json({
      success: false,
      error: 'La date de début est obligatoire'
    });
  }
  
  if (!end) {
    return res.status(400).json({
      success: false,
      error: 'La date de fin est obligatoire'
    });
  }
  
  if (new Date(start) >= new Date(end)) {
    return res.status(400).json({
      success: false,
      error: 'La date de fin doit être postérieure à la date de début'
    });
  }
  
  next();
};
