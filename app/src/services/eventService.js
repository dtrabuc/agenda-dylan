const prisma = require('../lib/prisma');

class EventService {
  // Créer un nouvel événement
  async createEvent(eventData) {
    try {
      const event = await prisma.event.create({
        data: {
          title: eventData.title,
          description: eventData.description || null,
          startDate: new Date(eventData.startDate),
          endDate: eventData.endDate ? new Date(eventData.endDate) : null,
          location: eventData.location || null,
          isAllDay: eventData.isAllDay || false,
          color: eventData.color || '#3b82f6',
          status: eventData.status || 'SCHEDULED',
          userId: eventData.userId
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });
      return event;
    } catch (error) {
      throw new Error(`Erreur lors de la création de l'événement: ${error.message}`);
    }
  }

  // Récupérer tous les événements
  async getAllEvents(userId = null, filters = {}) {
    try {
      const where = {};
      
      if (userId) {
        where.userId = userId;
      }

      if (filters.startDate && filters.endDate) {
        where.startDate = {
          gte: new Date(filters.startDate),
          lte: new Date(filters.endDate)
        };
      }

      if (filters.status) {
        where.status = filters.status;
      }

      const events = await prisma.event.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          startDate: 'asc'
        }
      });
      return events;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des événements: ${error.message}`);
    }
  }

  // Récupérer un événement par ID
  async getEventById(id) {
    try {
      const event = await prisma.event.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });
      
      if (!event) {
        throw new Error('Événement non trouvé');
      }
      
      return event;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération de l'événement: ${error.message}`);
    }
  }

  // Mettre à jour un événement
  async updateEvent(id, updateData) {
    try {
      // Vérifier si l'événement existe
      const existingEvent = await prisma.event.findUnique({
        where: { id }
      });

      if (!existingEvent) {
        throw new Error('Événement non trouvé');
      }

      // Préparer les données de mise à jour
      const dataToUpdate = {};
      
      if (updateData.title !== undefined) dataToUpdate.title = updateData.title;
      if (updateData.description !== undefined) dataToUpdate.description = updateData.description;
      if (updateData.startDate !== undefined) dataToUpdate.startDate = new Date(updateData.startDate);
      if (updateData.endDate !== undefined) {
        dataToUpdate.endDate = updateData.endDate ? new Date(updateData.endDate) : null;
      }
      if (updateData.location !== undefined) dataToUpdate.location = updateData.location;
      if (updateData.isAllDay !== undefined) dataToUpdate.isAllDay = updateData.isAllDay;
      if (updateData.color !== undefined) dataToUpdate.color = updateData.color;
      if (updateData.status !== undefined) dataToUpdate.status = updateData.status;

      const updatedEvent = await prisma.event.update({
        where: { id },
        data: dataToUpdate,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      return updatedEvent;
    } catch (error) {
      throw new Error(`Erreur lors de la mise à jour de l'événement: ${error.message}`);
    }
  }

  // Supprimer un événement
  async deleteEvent(id) {
    try {
      // Vérifier si l'événement existe
      const existingEvent = await prisma.event.findUnique({
        where: { id }
      });

      if (!existingEvent) {
        throw new Error('Événement non trouvé');
      }

      await prisma.event.delete({
        where: { id }
      });

      return { message: 'Événement supprimé avec succès' };
    } catch (error) {
      throw new Error(`Erreur lors de la suppression de l'événement: ${error.message}`);
    }
  }

  // Récupérer les événements d'une période donnée
  async getEventsByDateRange(userId, startDate, endDate) {
    try {
      const events = await prisma.event.findMany({
        where: {
          userId,
          startDate: {
            gte: new Date(startDate),
            lte: new Date(endDate)
          }
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          startDate: 'asc'
        }
      });
      return events;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des événements par période: ${error.message}`);
    }
  }
}

module.exports = new EventService();