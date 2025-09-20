const prisma = require('../lib/prisma');

class UserService {
  // Créer un nouvel utilisateur
  async createUser(userData) {
    try {
      const user = await prisma.user.create({
        data: {
          email: userData.email,
          name: userData.name || null
        }
      });
      return user;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new Error('Un utilisateur avec cet email existe déjà');
      }
      throw new Error(`Erreur lors de la création de l'utilisateur: ${error.message}`);
    }
  }

  // Récupérer tous les utilisateurs
  async getAllUsers() {
    try {
      const users = await prisma.user.findMany({
        include: {
          events: {
            select: {
              id: true,
              title: true,
              startDate: true,
              status: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      return users;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des utilisateurs: ${error.message}`);
    }
  }

  // Récupérer un utilisateur par ID
  async getUserById(id) {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          events: {
            orderBy: {
              startDate: 'asc'
            }
          }
        }
      });
      
      if (!user) {
        throw new Error('Utilisateur non trouvé');
      }
      
      return user;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération de l'utilisateur: ${error.message}`);
    }
  }

  // Récupérer un utilisateur par email
  async getUserByEmail(email) {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          events: {
            orderBy: {
              startDate: 'asc'
            }
          }
        }
      });
      return user;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération de l'utilisateur: ${error.message}`);
    }
  }

  // Mettre à jour un utilisateur
  async updateUser(id, updateData) {
    try {
      const existingUser = await prisma.user.findUnique({
        where: { id }
      });

      if (!existingUser) {
        throw new Error('Utilisateur non trouvé');
      }

      const dataToUpdate = {};
      if (updateData.email !== undefined) dataToUpdate.email = updateData.email;
      if (updateData.name !== undefined) dataToUpdate.name = updateData.name;

      const updatedUser = await prisma.user.update({
        where: { id },
        data: dataToUpdate
      });

      return updatedUser;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new Error('Un utilisateur avec cet email existe déjà');
      }
      throw new Error(`Erreur lors de la mise à jour de l'utilisateur: ${error.message}`);
    }
  }

  // Supprimer un utilisateur
  async deleteUser(id) {
    try {
      const existingUser = await prisma.user.findUnique({
        where: { id }
      });

      if (!existingUser) {
        throw new Error('Utilisateur non trouvé');
      }

      await prisma.user.delete({
        where: { id }
      });

      return { message: 'Utilisateur supprimé avec succès' };
    } catch (error) {
      throw new Error(`Erreur lors de la suppression de l'utilisateur: ${error.message}`);
    }
  }
}

module.exports = new UserService();