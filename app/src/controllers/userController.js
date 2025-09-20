const userService = require('../services/userService');

// Récupérer tous les utilisateurs
exports.getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    
    res.json({
      success: true,
      data: users,
      count: users.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur lors de la récupération des utilisateurs'
    });
  }
};

// Récupérer un utilisateur par ID
exports.getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await userService.getUserById(userId);
    
    res.json({
      success: true,
      data: user
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
      error: error.message || 'Erreur lors de la récupération de l\'utilisateur'
    });
  }
};

// Créer un nouvel utilisateur
exports.createUser = async (req, res) => {
  try {
    const { email, name } = req.body;
    
    // Validation des champs requis
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Le champ email est requis'
      });
    }
    
    const userData = { email, name };
    const newUser = await userService.createUser(userData);
    
    res.status(201).json({
      success: true,
      message: 'Utilisateur créé avec succès',
      data: newUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur lors de la création de l\'utilisateur'
    });
  }
};

// Mettre à jour un utilisateur
exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const updateData = req.body;
    
    const updatedUser = await userService.updateUser(userId, updateData);
    
    res.json({
      success: true,
      message: 'Utilisateur mis à jour avec succès',
      data: updatedUser
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
      error: error.message || 'Erreur lors de la mise à jour de l\'utilisateur'
    });
  }
};

// Supprimer un utilisateur
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    
    await userService.deleteUser(userId);
    
    res.json({
      success: true,
      message: 'Utilisateur supprimé avec succès'
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
      error: error.message || 'Erreur lors de la suppression de l\'utilisateur'
    });
  }
};