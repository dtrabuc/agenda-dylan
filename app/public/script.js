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
        // Navigation calendrier
        document.getElementById('prevMonth')?.addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.renderCalendar();
        });
        document.getElementById('nextMonth')?.addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.renderCalendar();
        });

        // Modal
        document.getElementById('addEventBtn')?.addEventListener('click', () => this.openModal());
        document.querySelector('.close')?.addEventListener('click', () => this.closeModal());
        document.getElementById('cancelBtn')?.addEventListener('click', () => this.closeModal());

        // Formulaire
        document.getElementById('eventForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveEvent();
        });
        document.getElementById('deleteBtn')?.addEventListener('click', () => this.deleteEvent());

        // Fermer modal clic extérieur
        window.addEventListener('click', (e) => {
            if (e.target === document.getElementById('eventModal')) this.closeModal();
        });
    }

    async loadEvents() {
        try {
            const response = await fetch('/api/events');
            const data = await response.json();
            if (data.success) {
                this.events = data.data || [];
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
        if (!calendar || !currentMonth) return;

        currentMonth.textContent = this.currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
        calendar.innerHTML = '';

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

        const firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
        const lastDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);
        const startDay = (firstDay.getDay() + 6) % 7; // lundi

        for (let i = 0; i < startDay; i++) {
            const emptyDay = document.createElement('div');
            calendar.appendChild(emptyDay);
        }

        for (let day = 1; day <= lastDay.getDate(); day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = day;

            const currentDayDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), day);
            const hasEvents = this.events.some(ev => {
                const evDate = ev.startDate ? new Date(ev.startDate) : null;
                return evDate && evDate.toDateString() === currentDayDate.toDateString();
            });
            if (hasEvents) dayElement.classList.add('has-events');

            dayElement.addEventListener('click', (e) => {
                this.selectDate(currentDayDate, e.currentTarget);
            });

            calendar.appendChild(dayElement);
        }
    }

    selectDate(date, el) {
        this.selectedDate = date;
        document.querySelectorAll('.calendar-day').forEach(d => d.classList.remove('selected'));
        el?.classList.add('selected');
        this.renderEventsList(date);
    }

    renderEventsList(filterDate = null) {
        const eventsList = document.getElementById('eventsList');
        if (!eventsList) return;
        let eventsToShow = this.events;
        if (filterDate) {
            eventsToShow = this.events.filter(ev => {
                const evDate = ev.startDate ? new Date(ev.startDate) : null;
                return evDate && evDate.toDateString() === filterDate.toDateString();
            });
        }
        if (!eventsToShow.length) {
            eventsList.innerHTML = '<p style="color:#718096;text-align:center;">Aucun événement</p>';
            return;
        }
        eventsList.innerHTML = eventsToShow.map(ev => {
            const start = ev.startDate ? new Date(ev.startDate) : null;
            const end = ev.endDate ? new Date(ev.endDate) : null;
            const time = start ? `${start.toLocaleDateString('fr-FR')} ${start.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}` + (end ? ` - ${end.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}` : '') : '';
            return `
                <div class="event-item" onclick="app.editEvent('${ev.id}')">
                    <div class="event-title">${ev.title}</div>
                    <div class="event-time">${time}</div>
                    ${ev.description ? `<div style=\"margin-top:5px;font-size:0.9rem;color:#718096;\">${ev.description}</div>` : ''}
                </div>
            `;
        }).join('');
    }

    // Helpers
    toIsoFromLocal(inputValue) {
        if (!inputValue) return null;
        const [date, time] = inputValue.split('T');
        const [y,m,d] = date.split('-').map(Number);
        let hh=0, mm=0;
        if (time) [hh,mm] = time.split(':').map(Number);
        const dt = new Date(y, (m-1), d, hh||0, mm||0, 0, 0); // local time
        return dt.toISOString();
    }

    formatForDatetimeLocal(dateString) {
        if (!dateString) return '';
        const d = new Date(dateString);
        const pad = (n) => String(n).padStart(2,'0');
        const yyyy = d.getFullYear();
        const mm = pad(d.getMonth()+1);
        const dd = pad(d.getDate());
        const hh = pad(d.getHours());
        const mi = pad(d.getMinutes());
        return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
    }

    openModal(ev = null) {
        const modal = document.getElementById('eventModal');
        const modalTitle = document.getElementById('modalTitle');
        const deleteBtn = document.getElementById('deleteBtn');
        if (ev) {
            modalTitle.textContent = 'Modifier l\'événement';
            deleteBtn.style.display = 'inline-block';
            this.editingEventId = ev.id;
            document.getElementById('eventId').value = ev.id;
            document.getElementById('eventTitle').value = ev.title;
            document.getElementById('eventDescription').value = ev.description || '';
            document.getElementById('eventStart').value = this.formatForDatetimeLocal(ev.startDate);
            document.getElementById('eventEnd').value = this.formatForDatetimeLocal(ev.endDate);
            // catégories/priorité non persistées côté backend actuel
        } else {
            modalTitle.textContent = 'Nouvel événement';
            deleteBtn.style.display = 'none';
            this.editingEventId = null;
            document.getElementById('eventForm').reset();
            if (this.selectedDate) {
                const start = new Date(this.selectedDate);
                start.setHours(9,0,0,0);
                const end = new Date(start);
                end.setHours(10,0,0,0);
                document.getElementById('eventStart').value = this.formatForDatetimeLocal(start.toISOString());
                document.getElementById('eventEnd').value = this.formatForDatetimeLocal(end.toISOString());
            }
        }
        modal.style.display = 'block';
    }

    closeModal() {
        document.getElementById('eventModal').style.display = 'none';
        this.editingEventId = null;
    }

    async saveEvent() {
        const title = document.getElementById('eventTitle').value.trim();
        const description = document.getElementById('eventDescription').value.trim();
        const startLocal = document.getElementById('eventStart').value;
        const endLocal = document.getElementById('eventEnd').value;

        if (!title) return this.showToast('Le titre est obligatoire', 'error');
        if (!startLocal) return this.showToast('La date de début est obligatoire', 'error');

        const startDate = this.toIsoFromLocal(startLocal);
        const endDate = endLocal ? this.toIsoFromLocal(endLocal) : null;
        if (endDate && new Date(endDate) <= new Date(startDate)) {
            return this.showToast('La date de fin doit être postérieure à la date de début', 'error');
        }

        let userId = localStorage.getItem('userId');
        if (!userId) {
            this.showToast('Connectez-vous d\'abord', 'error');
            setTimeout(()=> location.href = '/login', 800);
            return;
        }

        const payload = { title, description: description || null, startDate, endDate, userId };

        try {
            let response;
            if (this.editingEventId) {
                response = await fetch(`/api/events/${this.editingEventId}`, {
                    method: 'PUT', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            } else {
                response = await fetch('/api/events', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            }
            const result = await response.json();
            if (result.success) {
                this.showToast(result.message || 'Enregistré');
                this.closeModal();
                await this.loadEvents();
            } else {
                throw new Error(result.error || 'Erreur enregistrement');
            }
        } catch (err) {
            this.showToast(err.message, 'error');
        }
    }

    async deleteEvent() {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) return;
        try {
            const response = await fetch(`/api/events/${this.editingEventId}`, { method: 'DELETE' });
            const result = await response.json();
            if (result.success) {
                this.showToast(result.message || 'Supprimé');
                this.closeModal();
                await this.loadEvents();
            } else {
                throw new Error(result.error || 'Erreur suppression');
            }
        } catch (err) {
            this.showToast('Erreur lors de la suppression', 'error');
        }
    }

    editEvent(eventId) {
        const ev = this.events.find(e => e.id === eventId);
        if (ev) this.openModal(ev);
    }

    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        if (!toast) return;
        toast.textContent = message;
        toast.className = `toast ${type}`;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    }
}

// Initialiser l'application (uniquement sur la page index)
window.app = new AgendaApp();
