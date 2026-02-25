class PrayerTimesApp {
    constructor() {
        this.prayerData = null;
        this.selectedCity = 'София';
        this.currentDate = new Date();
        this.order = ["Зора", "Изгрев", "Обяд", "Следобяд", "Залез", "Нощ"];
        this.prevPrayer = null;
        this.nextPrayer = null;
        this.nextPrayerDate = null;
        this.remainingSeconds = null;
        this.elapsedSeconds = null;
        this.timer = null;
        this.progressBarWidth = '50%';
        
        this.init();
    }
    
    async init() {
        // Get saved city first
        this.selectedCity = localStorage.getItem('selectedCity') || 'София';
        
        // Load prayer data FROM API for the selected city
        await this.loadPrayerData(this.selectedCity);
        
        // Set initial values
        this.updateCurrentTime();
        this.calculateNextPrayer();
        this.updatePrayerTable();
        this.updateDateDisplay();
        
        // Start timers
        this.startTimers();
        
        // Add event listeners
        this.addEventListeners();
    }
    
    async loadPrayerData(city) {
        try {
            // Извикваме api.php само за конкретния град
            // Използваме encodeURIComponent, за да сме сигурни, че кирилицата се предава правилно
            const response = await fetch(`api.php?city=${encodeURIComponent(city)}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
          
            
            this.prayerData = {};
            this.prayerData[city] = result.data;
            
        } catch (error) {
            console.error('Error loading prayer data:', error);
            alert('Грешка при зареждане на данните за молитвите. Проверете връзката с API.');
        }
    }
    
    calculateNextPrayer() {
        const now = new Date();
        const todayStr = this.formatDate(now);
        const cityTimesToday = this.prayerData?.[this.selectedCity]?.[todayStr];
        
        if (!cityTimesToday) {
            this.updateNoDataState();
            return;
        }
        
        let previous = null;
        let next = null;
        let nextTime = null;
        let prevTime = null;
        
        // Find current and next prayer
        for (let key of this.order) {
            const timeStr = cityTimesToday[key];
            if (!timeStr) continue;
            
            const [hours, minutes] = timeStr.split(':').map(Number);
            const prayerTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0);
            
            if (now >= prayerTime) {
                previous = key;
                prevTime = prayerTime;
            } else if (!next) {
                next = key;
                nextTime = prayerTime;
            }
        }
        
        // If no next prayer today, get first prayer tomorrow
        if (!next) {
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            const tomorrowStr = this.formatDate(tomorrow);
            const cityTimesTomorrow = this.prayerData?.[this.selectedCity]?.[tomorrowStr];
            
            if (cityTimesTomorrow && cityTimesTomorrow["Зора"]) {
                next = "Зора";
                const [hours, minutes] = cityTimesTomorrow["Зора"].split(':').map(Number);
                nextTime = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), hours, minutes, 0);
            }
        }
        
        this.prevPrayer = previous;
        this.nextPrayer = next;
        this.nextPrayerDate = nextTime;
        
        // Calculate remaining and elapsed seconds
        if (nextTime) {
            this.remainingSeconds = Math.max(Math.floor((nextTime - now) / 1000), 0);
        } else {
            this.remainingSeconds = null;
        }
        
        if (prevTime) {
            this.elapsedSeconds = Math.max(Math.floor((now - prevTime) / 1000), 0);
        } else {
            this.elapsedSeconds = null;
        }
        
        // Calculate progress bar
        if (nextTime && prevTime) {
            const totalTimeBetweenPrayers = (nextTime - prevTime) / 1000;
            const elapsedSincePrevPrayer = (now - prevTime) / 1000;
            const progress = Math.min(elapsedSincePrevPrayer / totalTimeBetweenPrayers, 1);
            const widthPercent = Math.max(progress * 100, 2);
            this.progressBarWidth = `${widthPercent}%`;
            
            // Update progress bar color
            this.updateProgressBarColor();
        } else {
            this.progressBarWidth = '50%';
        }
        
        this.updateDisplay();
    }
    
    updateNoDataState() {
        this.prevPrayer = null;
        this.nextPrayer = null;
        this.remainingSeconds = null;
        this.elapsedSeconds = null;
        
        document.getElementById('remainingContainer').style.display = 'none';
        document.getElementById('elapsedContainer').style.display = 'none';
    }
    
    updateDisplay() {
        // Update current time
        this.updateCurrentTime();
        
        // Update remaining time
        if (this.remainingSeconds !== null && this.nextPrayer) {
            const remaining = this.formatRemainingTime(this.remainingSeconds);
            document.getElementById('remainingHours').textContent = `- ${remaining.hhmm}`;
            document.getElementById('remainingSeconds').textContent = `:${remaining.ss}`;
            document.getElementById('nextPrayerName').textContent = this.getPrayerDisplayName(this.nextPrayer);
            document.getElementById('remainingContainer').style.display = 'block';
        } else {
            document.getElementById('remainingContainer').style.display = 'none';
        }
        
        // Update elapsed time
        if (this.elapsedSeconds !== null && this.prevPrayer) {
            const elapsed = this.formatElapsedTime(this.elapsedSeconds);
            document.getElementById('prevPrayerName').textContent = this.getPrayerDisplayName(this.prevPrayer);
            document.getElementById('elapsedTime').textContent = `+${elapsed.hhmm}`;
            document.getElementById('elapsedContainer').style.display = 'block';
            
            // Update progress bar
            const progressBar = document.getElementById('progressBar');
            if (progressBar) {
                progressBar.style.width = this.progressBarWidth;
            }
        } else {
            document.getElementById('elapsedContainer').style.display = 'none';
        }
        
        // Update prayer table highlights
        this.updatePrayerTable();
    }
    
    updateProgressBarColor() {
        const progressBar = document.getElementById('progressBar');
        if (!progressBar || !this.remainingSeconds) return;
        
        if (this.remainingSeconds <= 300) { // 5 minutes
            progressBar.style.backgroundColor = '#ff6b6b';
        } else if (this.remainingSeconds <= 900) { // 15 minutes
            progressBar.style.backgroundColor = '#ffa726';
        } else {
            progressBar.style.backgroundColor = '#38b000';
        }
    }
    
    updateCurrentTime() {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('bg-BG', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
        });
        document.getElementById('currentTime').textContent = timeStr;
    }
    
    updatePrayerTable() {
        const dateStr = this.formatDate(this.currentDate);
        const cityTimes = this.prayerData?.[this.selectedCity]?.[dateStr];
        const grid = document.getElementById('prayerTimesGrid');
        
        if (!grid || !cityTimes) return;
        
        let html = '';
        const todayStr = this.formatDate(new Date());
        const isToday = (dateStr === todayStr);
        
        this.order.forEach((key, index) => {
            const time = cityTimes[key];
            let rowClass = 'time-row';
            let nameClass = 'time-name';
            let valueClass = 'time-value';
            
            if (isToday) {
                if (this.nextPrayer === key && this.nextPrayerDate && 
                    this.formatDate(this.nextPrayerDate) === dateStr) {
                    rowClass += ' current';
                    nameClass += ' current';
                    valueClass += ' current';
                } else if (this.prevPrayer === key) {
                    rowClass += ' passed';
                    nameClass += ' passed';
                    valueClass += ' passed';
                }
            }
            
            html += `
                <div class="${rowClass}">
                    <div class="time-info">
                        <i class="fas ${this.getPrayerIcon(key)} prayer-icon"></i>
                        <span class="${nameClass}">${this.getPrayerDisplayName(key, this.currentDate)}</span>
                    </div>
                    <span class="${valueClass}">${this.formatTime(time)}</span>
                </div>
            `;
        });
        
        grid.innerHTML = html;
        
        // Update weekday title
        const weekday = this.getWeekday(this.currentDate);
        document.getElementById('weekdayTitle').textContent = this.capitalize(weekday);
    }
    
    updateDateDisplay() {
        const dateStr = this.formatDate(this.currentDate);
        document.getElementById('currentDateText').textContent = dateStr;
        
        // Update weekday in table header
        const weekday = this.getWeekday(this.currentDate);
        document.getElementById('weekdayTitle').textContent = this.capitalize(weekday);
    }
    
    startTimers() {
        // Update time every second
        this.timer = setInterval(() => {
            this.calculateNextPrayer();
        }, 1000);
        
        // Update current time every minute
        setInterval(() => {
            this.updateCurrentTime();
        }, 60000);
    }
    
    addEventListeners() {
        // Date navigation
        document.getElementById('prevDayBtn').addEventListener('click', () => this.changeDate(-1));
        document.getElementById('nextDayBtn').addEventListener('click', () => this.changeDate(1));
        
        // City search
        const citySearch = document.getElementById('citySearch');
        if (citySearch) {
            citySearch.addEventListener('input', (e) => this.filterCities(e.target.value));
        }
        
        // Save scroll position before page refresh
        window.addEventListener('beforeunload', () => {
            localStorage.setItem('scrollPosition', window.scrollY);
        });
        
        // Restore scroll position
        window.addEventListener('load', () => {
            const scrollPosition = localStorage.getItem('scrollPosition');
            if (scrollPosition) {
                window.scrollTo(0, parseInt(scrollPosition));
                localStorage.removeItem('scrollPosition');
            }
        });
    }
    
    changeDate(days) {
        const newDate = new Date(this.currentDate);
        newDate.setDate(newDate.getDate() + days);
        
        // Don't allow dates before today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (newDate < today) return;
        
        this.currentDate = newDate;
        this.updateDateDisplay();
        this.updatePrayerTable();
    }
    
    async selectCity(city) {
        this.selectedCity = city;
        localStorage.setItem('selectedCity', city);
        
        // Update city title immediately for better UX
        document.querySelector('.city-title').textContent = city;
        
       
        const grid = document.getElementById('prayerTimesGrid');
        if (grid) grid.innerHTML = '<div style="text-align:center; padding: 20px;"><i class="fas fa-spinner fa-spin"></i> Зареждане...</div>';
        
        // Fetch new data for the selected city from API
        await this.loadPrayerData(city);
        
        this.currentDate = new Date(); // Reset to today
        this.calculateNextPrayer();
        this.updatePrayerTable();
        this.updateDateDisplay();
        this.closeCityModal();
    }
    
    filterCities(searchTerm) {
        // Пълният списък с градове
        const cities = [
            "Айтос", "Балчик", "Благоевград", "Бургас", "Бяла", "Варна", "Велики Преслав", 
            "Велико Търново", "Велинград", "Горна Оряховица", "Гоце Делчев", "Добрич", 
            "Исперих", "Каварна", "Каолиново", "Карлово", "Карнобат", "Кнежа", "Котел", 
            "Крумовград", "Кубрат", "Кърджали", "Ловеч", "Мадан", "Монтана", "Никопол", 
            "Нова Загора", "Нови пазар", "Пазарджик", "Плевен", "Пловдив", "Провадия", 
            "Разград", "Русе", "Свищов", "Силистра", "Ситово", "Сливен", "Смолян", 
            "София", "Стара Загора", "Твърдица", "Търговище", "Харманли", "Хасково", 
            "Шумен", "Якоруда", "Ямбол"
        ];
        
        const cityList = document.getElementById('cityList');
        if (!cityList) return;
        
        const filtered = cities.filter(city => 
            city.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        let html = '';
        filtered.forEach(city => {
            const isSelected = (city === this.selectedCity);
            html += `
                <div class="city-item ${isSelected ? 'selected' : ''}" 
                     onclick="prayerApp.selectCity('${city}')">
                    <div class="city-item-content">
                        <i class="fas fa-map-marker-alt city-icon"></i>
                        <div class="city-text-container">
                            <div class="city-text">${city}</div>
                            ${isSelected ? '<div class="selected-label">Избран</div>' : ''}
                        </div>
                    </div>
                    ${isSelected ? '<i class="fas fa-check-circle check-icon"></i>' : ''}
                </div>
            `;
        });
        
        cityList.innerHTML = html;
    }
    
    // Helper functions
    formatDate(date) {
        return date.toISOString().split('T')[0];
    }
    
    formatTime(timeStr) {
        if (!timeStr) return '--:--';
        const [hours, minutes] = timeStr.split(':');
        return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
    }
    
    formatRemainingTime(seconds) {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return {
            hhmm: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`,
            ss: String(s).padStart(2, '0')
        };
    }
    
    formatElapsedTime(seconds) {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        return {
            hhmm: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
        };
    }
    
    getPrayerDisplayName(prayerKey, date = null) {
        if (date === null) date = new Date();
        const isFriday = (date.getDay() === 5); // 0 = Sunday, 5 = Friday
        
        const prayerMap = {
            "Зора": "Зора",
            "Изгрев": "Изгрев",
            "Обяд": isFriday ? "Джума" : "Обедна",
            "Следобяд": "Следобедна",
            "Залез": "Вечерна",
            "Нощ": "Нощна"
        };
        
        return prayerMap[prayerKey] || prayerKey;
    }
    
    getPrayerIcon(prayerKey) {
        const iconMap = {
            "Зора": "sun",
            "Изгрев": "sunrise",
            "Обяд": "sun",
            "Следобяд": "cloud-sun",
            "Залез": "sunset",
            "Нощ": "moon"
        };
        return iconMap[prayerKey] || "clock";
    }
    
    getWeekday(date) {
        const weekdays = [
            'Неделя',
            'Понеделник', 
            'Вторник',
            'Сряда',
            'Четвъртък',
            'Петък',
            'Събота'
        ];
        return weekdays[date.getDay()];
    }
    
    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    
    // Modal controls
    openCityModal() {
        document.getElementById('cityModal').classList.add('active');
        document.getElementById('citySearch').focus();
    }
    
    closeCityModal() {
        document.getElementById('cityModal').classList.remove('active');
        document.getElementById('citySearch').value = '';
        this.filterCities(''); // Reset filter
    }
    
    toggleMenu() {
        document.getElementById('menuOverlay').classList.toggle('active');
    }
}

// Global functions for HTML onclick events
function toggleMenu() {
    prayerApp.toggleMenu();
}

function openCityModal() {
    prayerApp.openCityModal();
}

function closeCityModal() {
    prayerApp.closeCityModal();
}

function selectCity(city) {
    prayerApp.selectCity(city);
}



// Initialize the app when DOM is loaded
let prayerApp;
document.addEventListener('DOMContentLoaded', () => {
    prayerApp = new PrayerTimesApp();
});