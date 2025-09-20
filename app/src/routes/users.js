const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { validateUser } = require('../middleware/validation');

// GET /api/users - Récupérer tous les utilisateurs
router.get('/', userController.getAllUsers);

// GET /api/users/:id - Récupérer un utilisateur par ID
router.get('/:id', userController.getUserById);

// POST /api/users - Créer un nouvel utilisateur
router.post('/', validateUser, userController.createUser);

// PUT /api/users/:id - Modifier un utilisateur
router.put('/:id', validateUser, userController.updateUser);

// DELETE /api/users/:id - Supprimer un utilisateur
router.delete('/:id', userController.deleteUser);

module.exports = router;