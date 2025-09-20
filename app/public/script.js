class AgendaApp {
    constructor() {
        this.events = [];
        this.currentDate = new Date();
        this.selectedDate = null;
        this.editingEventId = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadEvents();
        this.renderCalendar();
    }

    setupEventListeners() {
        // Boutons de navigation du calendrier
        document.getElementById('prevMonth').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.renderCalendar();
        });

        document.getElementById('nextMonth').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.renderCalendar();
        });

        // Modal
        document.getElementById('addEventBtn').addEventListener('click', () => {
            this.openModal();
        });

        document.querySelector('.close').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.closeModal();
        });

        // Formulaire
        document.getElementById('eventForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveEvent();
        });

        document.getElementById('deleteBtn').addEventListener('click', () => {
            this.deleteEvent();
        });

        // Fermer modal en cliquant à l'extérieur
        window.addEventListener('click', (e) => {
            if (e.target === document.getElementById('eventModal')) {
                this.closeModal();
            }
        });
    }

    async loadEvents() {
        try {
            const response = await fetch('/api/events');
            const data = await response.json();
            
            if (data.success) {
                this.events = data.data;
                this.renderEventsList();
                this.renderCalendar();
            }
        } catch (error) {
            this.showToast('Erreur lors du chargement des événements', 'error');
        }
    }

    renderCalendar() {
        const calendar = document.getElementById('calendar');
        const currentMonth = document.getElementById('currentMonth');
        
        // Afficher le mois/année actuel
        currentMonth.textContent = this.currentDate.toLocaleDateString('fr-FR', {
            month: 'long',
            year: 'numeric'
        });

        // Nettoyer le calendrier
        calendar.innerHTML = '';

        // Jours de la semaine
        const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
        weekDays.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.textContent = day;
            dayHeader.style.fontWeight = 'bold';
            dayHeader.style.textAlign = 'center';
            dayHeader.style.padding = '10px';
            dayHeader.style.background = '#f7fafc';
            calendar.appendChild(dayHeader);
        });

        // Premier jour du mois
        const firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
        const lastDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);
        
        // Ajuster pour commencer le lundi
        const startDay = (firstDay.getDay() + 6) % 7;

        // Jours vides au début
        for (let i = 0; i < startDay; i++) {
            const emptyDay = document.createElement('div');
            calendar.appendChild(emptyDay);
        }

        // Jours du mois
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = day;
            
            const currentDayDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), day);
            
            // Vérifier s'il y a des événements ce jour
            const hasEvents = this.events.some(event => {
                const eventDate = new Date(event.start);
                return eventDate.toDateString() === currentDayDate.toDateString();
            });
            
            if (hasEvents) {
                dayElement.classList.add('has-events');
            }

            dayElement.addEventListener('click', () => {
                this.selectDate(currentDayDate);
            });

            calendar.appendChild(dayElement);
        }
    }

    selectDate(date) {
        this.selectedDate = date;
        
        // Mettre à jour l'affichage
        document.querySelectorAll('.calendar-day').forEach(day => {
            day.classList.remove('selected');
        });
        
        event.target.classList.add('selected');
        
        // Filtrer les événements pour cette date
        this.renderEventsList(date);
    }

    renderEventsList(filterDate = null) {
        const eventsList = document.getElementById('eventsList');
        let eventsToShow = this.events;

        if (filterDate) {
            eventsToShow = this.events.filter(event => {
                const eventDate = new Date(event.start);
                return eventDate.toDateString() === filterDate.toDateString();
            });
        }

        if (eventsToShow.length === 0) {
            eventsList.innerHTML = '<p style="color: #718096; text-align: center;">Aucun événement</p>';
            return;
        }

        eventsList.innerHTML = eventsToShow.map(event => {
            const startDate = new Date(event.start);
            const endDate = new Date(event.end);
            
            return `
                <div class="event-item priority-${event.priority}" onclick="app.editEvent(${event.id})">
                    <div class="event-title">${event.title}</div>
                    <div class="event-time">
                        ${startDate.toLocaleDateString('fr-FR')} 
                        ${startDate.toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})} - 
                        ${endDate.toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})}
                    </div>
                    <div class="event-category">${event.category}</div>
                    ${event.description ? `<div style="margin-top: 5px; font-size: 0.9rem; color: #718096;">${event.description}</div>` : ''}
                </div>
            `;
        }).join('');
    }

    openModal(event = null) {
        const modal = document.getElementById('eventModal');
        const modalTitle = document.getElementById('modalTitle');
        const deleteBtn = document.getElementById('deleteBtn');
        
        if (event) {
            // Mode édition
            modalTitle.textContent = 'Modifier l\'événement';
            deleteBtn.style.display = 'inline-block';
            this.editingEventId = event.id;
            
            // Pré-remplir le formulaire
            document.getElementById('eventId').value = event.id;
            document.getElementById('eventTitle').value = event.title;
            document.getElementById('eventDescription').value = event.description || '';
            document.getElementById('eventStart').value = this.formatDateTimeLocal(event.start);
            document.getElementById('eventEnd').value = this.formatDateTimeLocal(event.end);
            document.getElementById('eventCategory').value = event.category;
            document.getElementById('eventPriority').value = event.priority;
        } else {
            // Mode création
            modalTitle.textContent = 'Nouvel événement';
            deleteBtn.style.display = 'none';
            this.editingEventId = null;
            document.getElementById('eventForm').reset();
            
            // Pré-remplir avec la date sélectionnée si disponible
            if (this.selectedDate) {
                const start = new Date(this.selectedDate);
                start.setHours(9, 0, 0, 0);
                const end = new Date(start);
                end.setHours(10, 0, 0, 0);
                
                document.getElementById('eventStart').value = this.formatDateTimeLocal(start);
                document.getElementById('eventEnd').value = this.formatDateTimeLocal(end);
            }
        }
        
        modal.style.display = 'block';
    }

    closeModal() {
        document.getElementById('eventModal').style.display = 'none';
        this.editingEventId = null;
    }

    async saveEvent() {
        const formData = new FormData(document.getElementById('eventForm'));
        const eventData = Object.fromEntries(formData.entries());
        
        try {
            let response;
            if (this.editingEventId) {
                // Modifier
                response = await fetch(`/api/events/${this.editingEventId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(eventData)
                });
            } else {
                // Créer
                response = await fetch('/api/events', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(eventData)
                });
            }

            const result = await response.json();
            
            if (result.success) {
                this.showToast(result.message);
                this.closeModal();
                this.loadEvents();
            } else {
                this.showToast(result.error, 'error');
            }
        } catch (error) {
            this.showToast('Erreur lors de la sauvegarde', 'error');
        }
    }

    async deleteEvent() {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
            return;
        }

        try {
            const response = await fetch(`/api/events/${this.editingEventId}`, {
                method: 'DELETE'
            });

            const result = await response.json();
            
            if (result.success) {
                this.showToast(result.message);
                this.closeModal();
                this.loadEvents();
            } else {
                this.showToast(result.error, 'error');
            }
        } catch (error) {
            this.showToast('Erreur lors de la suppression', 'error');
        }
    }

    editEvent(eventId) {
        const event = this.events.find(e => e.id === eventId);
        if (event) {
            this.openModal(event);
        }
    }

    formatDateTimeLocal(dateString) {
        const date = new Date(dateString);
        return date.toISOString().slice(0, 16);
    }

    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast ${type}`;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

// Initialiser l'application
const app = new AgendaApp();
