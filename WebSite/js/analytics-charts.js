class AnalyticsModule {
    constructor() {
        this.prayerData = {};
        this.charts = {};
        this.currentCity = 'София';
        this.currentMonth = new Date().getMonth() + 1;
        this.currentYear = new Date().getFullYear();
        this.today = new Date().toISOString().split('T')[0];
        this.init();
    }

    async init() {
        await this.loadPrayerData();
        this.setupEventListeners();
        this.calculateQuickStats();
        
        // Взимаме текущия месец от URL или от таблицата
        this.updateCurrentMonthFromPage();
        
        // Ако аналитиката вече е видима, инициализирай графиките
        if (document.getElementById('analyticsSection')?.style.display === 'block') {
            this.initCharts();
            this.updateMonthlyStats();
        }
    }

    async loadPrayerData() {
        try {
            const response = await fetch('assets/all_prayer_times_2026.json');
            this.prayerData = await response.json();
            
            // Вземаме селектирания град от DOM
            const citySelect = document.getElementById('citySelect');
            if (citySelect) {
                this.currentCity = citySelect.value;
            }
            console.log('Prayer data loaded for analytics:', Object.keys(this.prayerData).length, 'cities');
        } catch (error) {
            console.error('Error loading prayer data:', error);
        }
    }

    setupEventListeners() {
        // View full stats button
        const viewStatsBtn = document.querySelector('.view-full-stats-btn');
        if (viewStatsBtn) {
            viewStatsBtn.addEventListener('click', () => this.showFullAnalytics());
        }
        
        // Close analytics button
        const closeAnalyticsBtn = document.querySelector('.close-analytics');
        if (closeAnalyticsBtn) {
            closeAnalyticsBtn.addEventListener('click', () => this.hideFullAnalytics());
        }
        
        // City select change
        const citySelect = document.getElementById('citySelect');
        if (citySelect) {
            citySelect.addEventListener('change', () => {
                this.currentCity = citySelect.value;
                this.updateAllAnalytics();
            });
        }
        
        // Събитие за следене на промяна на месеца (чрез hash change или URL промяна)
        window.addEventListener('hashchange', () => this.handleMonthChange());
        window.addEventListener('popstate', () => this.handleMonthChange());
        
        // Също така проверяваме при зареждане на страницата
        document.addEventListener('DOMContentLoaded', () => {
            // Добавяме наблюдател за промяна на текста на текущия месец
            this.observeMonthTextChanges();
            
            // Събитие при клик на стрелките за месеци (ако са заредени динамично)
            document.addEventListener('click', (e) => {
                const monthBtn = e.target.closest('.month-btn');
                if (monthBtn) {
                    // Изчакваме малко зареждането на новия месец, след което актуализираме
                    setTimeout(() => this.handleMonthChange(), 500);
                }
            });
        });
    }
    
    updateCurrentMonthFromPage() {
        // Опитайте се да вземете месеца от текущия месец на страницата
        const currentMonthElement = document.querySelector('.current-month');
        if (currentMonthElement) {
            const monthText = currentMonthElement.textContent.trim();
            this.extractMonthYearFromText(monthText);
        }
        
        // Опитайте се да вземете месеца от URL параметри
        const urlParams = new URLSearchParams(window.location.search);
        const monthFromUrl = urlParams.get('month');
        const yearFromUrl = urlParams.get('year');
        
        if (monthFromUrl) {
            this.currentMonth = parseInt(monthFromUrl);
        }
        if (yearFromUrl) {
            this.currentYear = parseInt(yearFromUrl);
        }
    }
    
    extractMonthYearFromText(text) {
        
        const bulgarianMonths = {
            'януари': 1, 'февруари': 2, 'март': 3, 'април': 4,
            'май': 5, 'юни': 6, 'юли': 7, 'август': 8,
            'септември': 9, 'октомври': 10, 'ноември': 11, 'декември': 12
        };
        
        const textLower = text.toLowerCase();
        
        // Търсим месец
        for (const [monthName, monthNumber] of Object.entries(bulgarianMonths)) {
            if (textLower.includes(monthName)) {
                this.currentMonth = monthNumber;
                break;
            }
        }
        
        // Търсим година (4 цифри)
        const yearMatch = text.match(/\b(20\d{2})\b/);
        if (yearMatch) {
            this.currentYear = parseInt(yearMatch[1]);
        }
    }
    
    observeMonthTextChanges() {
        // Наблюдаваме за промени в текста на текущия месец
        const currentMonthElement = document.querySelector('.current-month');
        if (currentMonthElement) {
            // Използваме MutationObserver за да открием промени в текста
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'characterData' || mutation.type === 'childList') {
                        const newText = currentMonthElement.textContent.trim();
                        this.extractMonthYearFromText(newText);
                        this.updateAnalyticsForCurrentMonth();
                    }
                });
            });
            
            observer.observe(currentMonthElement, {
                characterData: true,
                childList: true,
                subtree: true
            });
        }
    }
    
    handleMonthChange() {
        // Изчакваме малко за да се зареди новия месец
        setTimeout(() => {
            this.updateCurrentMonthFromPage();
            this.updateAnalyticsForCurrentMonth();
            
            
        }, 300);
    }
    
    updateAnalyticsForCurrentMonth() {
        console.log('Updating analytics for month:', this.currentMonth, 'year:', this.currentYear);
        
        // Актуализирай всички графики и статистики
        if (this.charts.daylight) {
            this.initDaylightChart(); // Презареди графиката за деня
        }
        
        if (this.charts.dayDistribution) {
            this.initDayDistributionChart(); // Може да искаш да актуализираш и тази
        }
        
        // Актуализирай месечната статистика
        this.updateMonthlyStats();
    }
    
    getMonthName(monthNumber) {
        const months = [
            'Януари', 'Февруари', 'Март', 'Април', 'Май', 'Юни',
            'Юли', 'Август', 'Септември', 'Октомври', 'Ноември', 'Декември'
        ];
        return months[monthNumber - 1] || '';
    }

    calculateQuickStats() {
        const cityData = this.prayerData[this.currentCity];
        
        if (!cityData || !cityData[this.today]) {
            console.warn('No data for today for', this.currentCity);
            return;
        }
        
        const todayPrayers = cityData[this.today];
        
        // Calculate fasting hours (Fajr to Maghrib)
        if (todayPrayers['Зора'] && todayPrayers['Залез']) {
            const fastingHours = this.calculateTimeDifference(todayPrayers['Зора'], todayPrayers['Залез']);
            
            // Calculate daylight hours (Sunrise to Sunset)
            if (todayPrayers['Изгрев']) {
                const daylightHours = this.calculateTimeDifference(todayPrayers['Изгрев'], todayPrayers['Залез']);
                
                // Calculate time to next prayer
                const nextPrayerTime = this.calculateNextPrayer(todayPrayers);
                
                // Update quick stats
                const fastingElement = document.getElementById('quickFastingHours');
                const daylightElement = document.getElementById('quickDaylightHours');
                const timeElement = document.getElementById('quickTimeToNext');
                
                if (fastingElement) fastingElement.textContent = fastingHours.toFixed(1);
                if (daylightElement) daylightElement.textContent = daylightHours.toFixed(1);
                if (timeElement) timeElement.textContent = nextPrayerTime;
                
                // Update analytics stats
                this.updateAnalyticsStats(fastingHours, daylightHours);
            }
        }
    }

    // Хелпер функция за изчисляване на разлика между две времеви стойности
    calculateTimeDifference(startTime, endTime) {
        if (!startTime || !endTime || startTime === '--:--' || endTime === '--:--') {
            return 0;
        }
        
        const [startHours, startMinutes] = startTime.split(':').map(Number);
        const [endHours, endMinutes] = endTime.split(':').map(Number);
        
        const startTotalMinutes = startHours * 60 + startMinutes;
        const endTotalMinutes = endHours * 60 + endMinutes;
        
        let difference = endTotalMinutes - startTotalMinutes;
        
        // Ако времето е след полунощ (напр. 23:00 до 01:00)
        if (difference < 0) {
            difference += 24 * 60;
        }
        
        return difference / 60; // Върни в часове
    }

    calculateNextPrayer(prayers) {
        const now = new Date();
        const currentHours = now.getHours();
        const currentMinutes = now.getMinutes();
        const currentTotalMinutes = currentHours * 60 + currentMinutes;
        
        const prayerTimes = [
            { name: 'Зора', time: prayers['Зора'] },
            { name: 'Изгрев', time: prayers['Изгрев'] },
            { name: 'Обяд', time: prayers['Обяд'] },
            { name: 'Следобяд', time: prayers['Следобяд'] },
            { name: 'Залез', time: prayers['Залез'] },
            { name: 'Нощ', time: prayers['Нощ'] }
        ];
        
        for (const prayer of prayerTimes) {
            if (prayer.time && prayer.time !== '--:--') {
                const [prayerHours, prayerMinutes] = prayer.time.split(':').map(Number);
                const prayerTotalMinutes = prayerHours * 60 + prayerMinutes;
                
                if (prayerTotalMinutes > currentTotalMinutes) {
                    const diffMinutes = prayerTotalMinutes - currentTotalMinutes;
                    const diffHours = Math.floor(diffMinutes / 60);
                    const diffMins = diffMinutes % 60;
                    return `${diffHours}:${diffMins.toString().padStart(2, '0')}`;
                }
            }
        }
        
        return '--:--';
    }

    showFullAnalytics() {
        const analyticsSection = document.getElementById('analyticsSection');
        if (analyticsSection) {
            analyticsSection.style.display = 'block';
            window.scrollTo({
                top: analyticsSection.offsetTop - 100,
                behavior: 'smooth'
            });
            this.initCharts();
            this.updateMonthlyStats();
            
            // Покажи нотификация
            if (typeof showNotification === 'function') {
                showNotification('Аналитиката е отворена с реални данни', 'success');
            }
        }
    }

    hideFullAnalytics() {
        const analyticsSection = document.getElementById('analyticsSection');
        if (analyticsSection) {
            analyticsSection.style.display = 'none';
        }
    }

    updateAllAnalytics() {
        this.calculateQuickStats();
        if (document.getElementById('analyticsSection')?.style.display === 'block') {
            this.initCharts();
            this.updateMonthlyStats();
        }
    }

    initCharts() {
        // Day Distribution Chart
        this.initDayDistributionChart();
        
        // Daylight Chart
        this.initDaylightChart();
        
        // City Comparison Chart
        this.initCityComparisonChart();
    }

    initDayDistributionChart() {
        const ctx = document.getElementById('dayDistributionChart');
        if (!ctx) return;
        
        if (this.charts.dayDistribution) {
            this.charts.dayDistribution.destroy();
        }
        
        const cityData = this.prayerData[this.currentCity];
        
        if (!cityData || !cityData[this.today]) return;
        
        const todayPrayers = cityData[this.today];
        
        if (todayPrayers['Зора'] && todayPrayers['Залез']) {
            const fastingHours = this.calculateTimeDifference(todayPrayers['Зора'], todayPrayers['Залез']);
            
            // НОВА ЛОГИКА: Постинг = времето за постинг (Fajr до Maghrib)
            // В това време се правят и молитвите и работата
            // Отделно имаме:
            const sleepHours = 8; // Фиксирани 8 часа сън
            const leisureHours = Math.max(0, 24 - fastingHours - sleepHours);
            
            // Проверка за валидни стойности
            const dataValues = [
                Math.max(fastingHours, 0),
                sleepHours,
                Math.max(leisureHours, 0)
            ];
            
            this.charts.dayDistribution = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Постинг (включва молитви и работа)', 'Сън', 'Отдих и други'],
                    datasets: [{
                        data: dataValues,
                        backgroundColor: ['#38b000', '#6a0572', '#ffd166']
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                color: '#fff',
                                padding: 20,
                                font: {
                                    size: 12
                                }
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return `${context.label}: ${context.parsed} часа`;
                                }
                            }
                        }
                    }
                }
            });
        }
    }

    initDaylightChart() {
        const ctx = document.getElementById('daylightChart');
        if (!ctx) return;
        
        if (this.charts.daylight) {
            this.charts.daylight.destroy();
        }
        
        const cityData = this.prayerData[this.currentCity];
        if (!cityData) return;
        
        // Get data for current month
        const dates = Object.keys(cityData)
            .filter(date => {
                const dateObj = new Date(date);
                return dateObj.getMonth() + 1 === this.currentMonth && 
                       dateObj.getFullYear() === this.currentYear;
            })
            .sort()
            .slice(0, 30); // Limit to 30 days
        
        const daylightHours = [];
        const fastingHours = []; // Добавено за часовете на постинга
        const labels = [];
        
        let longestDay = { date: '', hours: 0 };
        let shortestDay = { date: '', hours: 24 };
        let longestFasting = { date: '', hours: 0 };
        let shortestFasting = { date: '', hours: 24 };
        
        dates.forEach(date => {
            const prayers = cityData[date];
            if (prayers['Изгрев'] && prayers['Залез'] && 
                prayers['Изгрев'] !== '--:--' && prayers['Залез'] !== '--:--') {
                
                const hours = this.calculateTimeDifference(prayers['Изгрев'], prayers['Залез']);
                daylightHours.push(hours);
                
                // Изчисляване на часовете на постинга
                if (prayers['Зора']) {
                    const fasting = this.calculateTimeDifference(prayers['Зора'], prayers['Залез']);
                    fastingHours.push(fasting);
                    
                    if (fasting > longestFasting.hours) {
                        longestFasting = { date, hours: fasting };
                    }
                    if (fasting < shortestFasting.hours) {
                        shortestFasting = { date, hours: fasting };
                    }
                }
                
                labels.push(new Date(date).getDate() + '/' + (new Date(date).getMonth() + 1));
                
                // Track longest and shortest days
                if (hours > longestDay.hours) {
                    longestDay = { date, hours };
                }
                if (hours < shortestDay.hours) {
                    shortestDay = { date, hours };
                }
            }
        });
        
        // Update longest/shortest day display
        const longestDayElement = document.getElementById('longestDay');
        const shortestDayElement = document.getElementById('shortestDay');
        
        if (longestDayElement && longestDay.hours > 0) {
            longestDayElement.textContent = longestDay.hours.toFixed(1) + 'ч';
        } else if (longestDayElement) {
            longestDayElement.textContent = '--';
        }
        
        if (shortestDayElement && shortestDay.hours < 24) {
            shortestDayElement.textContent = shortestDay.hours.toFixed(1) + 'ч';
        } else if (shortestDayElement) {
            shortestDayElement.textContent = '--';
        }
        
        if (daylightHours.length === 0) {
            console.warn('No daylight data available for chart for month', this.currentMonth);
            return;
        }
        
        this.charts.daylight = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Продължителност на деня (часове)',
                        data: daylightHours,
                        borderColor: '#ffd166',
                        backgroundColor: 'rgba(255, 209, 102, 0.1)',
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'Време на постинг (часове)',
                        data: fastingHours,
                        borderColor: '#38b000',
                        backgroundColor: 'rgba(56, 176, 0, 0.1)',
                        fill: false,
                        tension: 0.4,
                        borderDash: [5, 5]
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Продължителност (часове)',
                            color: '#fff'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#fff',
                            callback: function(value) {
                                return value.toFixed(1) + 'ч';
                            }
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#fff'
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: '#fff'
                        }
                    }
                }
            }
        });
        
        // Актуализирай статистиката за постинга
        this.updateFastingStats(longestFasting, shortestFasting);
    }
    
    updateFastingStats(longestFasting, shortestFasting) {
        const longestFastingElement = document.getElementById('longestFasting');
        const shortestFastingElement = document.getElementById('shortestFasting');
        
        if (longestFastingElement && longestFasting.hours > 0) {
            longestFastingElement.textContent = longestFasting.hours.toFixed(1) + 'ч';
        } else if (longestFastingElement) {
            longestFastingElement.textContent = '--';
        }
        
        if (shortestFastingElement && shortestFasting.hours < 24) {
            shortestFastingElement.textContent = shortestFasting.hours.toFixed(1) + 'ч';
        } else if (shortestFastingElement) {
            shortestFastingElement.textContent = '--';
        }
    }

    initCityComparisonChart() {
        const ctx = document.getElementById('cityComparisonChart');
        if (!ctx) return;
        
        if (this.charts.cityComparison) {
            this.charts.cityComparison.destroy();
        }
        
        const city1 = document.getElementById('compareCity1')?.value || 'София';
        const city2 = document.getElementById('compareCity2')?.value || 'Пловдив';
        
        const data1 = this.prayerData[city1]?.[this.today];
        const data2 = this.prayerData[city2]?.[this.today];
        
        if (!data1 || !data2) {
            console.warn('No data for comparison');
            return;
        }
        
        // Convert time to hours for chart
        const prayerOrder = ['Зора', 'Изгрев', 'Обяд', 'Следобяд', 'Залез', 'Нощ'];
        const prayerTimes1 = prayerOrder.map(prayer => this.timeToHours(data1[prayer]));
        const prayerTimes2 = prayerOrder.map(prayer => this.timeToHours(data2[prayer]));
        
        this.charts.cityComparison = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: prayerOrder,
                datasets: [
                    {
                        label: city1,
                        data: prayerTimes1,
                        backgroundColor: '#38b000'
                    },
                    {
                        label: city2,
                        data: prayerTimes2,
                        backgroundColor: '#4d96ff'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Час от деня',
                            color: '#fff'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#fff',
                            callback: function(value) {
                                const hours = Math.floor(value);
                                const minutes = Math.round((value - hours) * 60);
                                return `${hours}:${minutes.toString().padStart(2, '0')}`;
                            }
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#fff'
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: '#fff'
                        }
                    }
                }
            }
        });
    }

    timeToHours(timeStr) {
        if (!timeStr || timeStr === '--:--') return 0;
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours + minutes / 60;
    }

    updateAnalyticsStats(fastingHours, daylightHours) {
        // Update elements
        const fastingElement = document.getElementById('analyticsFastingHours');
        const eatingElement = document.getElementById('analyticsEatingWindow');
        const progressBar = document.getElementById('fastingProgress');
        const progressText = document.getElementById('fastingProgressText');
        
        if (fastingElement) fastingElement.textContent = fastingHours.toFixed(1);
        if (eatingElement) eatingElement.textContent = (24 - fastingHours).toFixed(1);
        
        // Calculate fasting progress
        const now = new Date();
        const cityData = this.prayerData[this.currentCity];
        
        if (cityData && cityData[this.today] && cityData[this.today]['Зора']) {
            const fajrTimeStr = cityData[this.today]['Зора'];
            const [fajrHours, fajrMinutes] = fajrTimeStr.split(':').map(Number);
            
            const currentHour = now.getHours();
            const currentMinute = now.getMinutes();
            
            const fajrTotalMinutes = fajrHours * 60 + fajrMinutes;
            const currentTotalMinutes = currentHour * 60 + currentMinute;
            
            let timeSinceFajr = currentTotalMinutes - fajrTotalMinutes;
            
            // Ако е след полунощ
            if (timeSinceFajr < 0) {
                timeSinceFajr += 24 * 60;
            }
            
            const fastingTotalMinutes = fastingHours * 60;
            let progress = (timeSinceFajr / fastingTotalMinutes) * 100;
            
            // Ограничаване на прогреса между 0 и 100%
            progress = Math.min(Math.max(progress, 0), 100);
            
            if (progressBar) progressBar.style.width = progress + '%';
            if (progressText) progressText.textContent = Math.round(progress) + '%';
        }
    }

    updateMonthlyStats() {
        const cityData = this.prayerData[this.currentCity];
        
        if (!cityData) return;
        
        // Филтрираме данните само за текущия месец
        const currentMonthData = {};
        Object.entries(cityData).forEach(([date, prayers]) => {
            const dateObj = new Date(date);
            if (dateObj.getMonth() + 1 === this.currentMonth && 
                dateObj.getFullYear() === this.currentYear) {
                currentMonthData[date] = prayers;
            }
        });
        
        // Find earliest Fajr, latest Isha, average daylight for current month only
        let earliestFajr = null;
        let latestIsha = null;
        let totalDaylight = 0;
        let totalFasting = 0;
        let dayCount = 0;
        let fridayCount = 0;
        let validDaylightDays = 0;
        let validFastingDays = 0;
        
        Object.entries(currentMonthData).forEach(([date, prayers]) => {
            if (prayers['Зора'] && prayers['Зора'] !== '--:--') {
                if (earliestFajr === null || prayers['Зора'] < earliestFajr) {
                    earliestFajr = prayers['Зора'];
                }
            }
            
            if (prayers['Нощ'] && prayers['Нощ'] !== '--:--') {
                if (latestIsha === null || prayers['Нощ'] > latestIsha) {
                    latestIsha = prayers['Нощ'];
                }
            }
            
            if (prayers['Изгрев'] && prayers['Залез'] && 
                prayers['Изгрев'] !== '--:--' && prayers['Залез'] !== '--:--') {
                
                const hours = this.calculateTimeDifference(prayers['Изгрев'], prayers['Залез']);
                totalDaylight += hours;
                validDaylightDays++;
            }
            
            if (prayers['Зора'] && prayers['Залез'] && 
                prayers['Зора'] !== '--:--' && prayers['Залез'] !== '--:--') {
                
                const fastingHours = this.calculateTimeDifference(prayers['Зора'], prayers['Залез']);
                totalFasting += fastingHours;
                validFastingDays++;
            }
            
            dayCount++;
            
            // Check for Friday
            const dayOfWeek = new Date(date).getDay();
            if (dayOfWeek === 5) fridayCount++;
        });
        
        // Update interface
        const avgDayLength = validDaylightDays > 0 ? (totalDaylight / validDaylightDays).toFixed(1) : '0.0';
        const avgFastingHours = validFastingDays > 0 ? (totalFasting / validFastingDays).toFixed(1) : '0.0';
        
        document.getElementById('earliestFajr').textContent = earliestFajr || '--:--';
        document.getElementById('latestIsha').textContent = latestIsha || '--:--';
        document.getElementById('avgDayLength').textContent = avgDayLength + 'ч';
        document.getElementById('fridayCount').textContent = fridayCount;
        
        // Актуализирай или добави елемент за средно време на постинг
        this.updateOrCreateStatElement('avgFastingHours', 'Средно време на постинг:', avgFastingHours + 'ч');
        
        // Изчисляване на промяна от миналия месец
        this.calculateMonthChange();
    }

    updateOrCreateStatElement(elementId, label, value) {
        let element = document.getElementById(elementId);
        
        if (!element) {
            // Създайте елемент ако не съществува
            const monthlyStatsContainer = document.querySelector('.monthly-stats');
            if (monthlyStatsContainer) {
                // Проверка дали вече имаме елемент за промяна от миналия месец
                const monthChangeElement = document.getElementById('monthChange');
                const monthChangeRow = monthChangeElement ? monthChangeElement.closest('.stat-row') : null;
                
                const newRow = document.createElement('div');
                newRow.className = 'stat-row';
                newRow.innerHTML = `
                    <div class="stat-label">${label}</div>
                    <div class="stat-value" id="${elementId}">${value}</div>
                `;
                
                // Вмъкни преди реда за промяна от миналия месец
                if (monthChangeRow) {
                    monthlyStatsContainer.insertBefore(newRow, monthChangeRow);
                } else {
                    monthlyStatsContainer.appendChild(newRow);
                }
            }
        } else {
            element.textContent = value;
        }
    }

    calculateMonthChange() {
        const cityData = this.prayerData[this.currentCity];
        if (!cityData) return;
        
        const currentMonth = this.currentMonth;
        const currentYear = this.currentYear;
        
        let prevMonth = currentMonth - 1;
        let prevYear = currentYear;
        
        if (prevMonth === 0) {
            prevMonth = 12;
            prevYear -= 1;
        }
        
        // Изчисляване на средна продължителност на деня за текущия месец
        let currentMonthDaylight = 0;
        let currentMonthCount = 0;
        let currentMonthFasting = 0;
        let currentMonthFastingCount = 0;
        
        // Изчисляване на средна продължителност на деня за предишния месец
        let prevMonthDaylight = 0;
        let prevMonthCount = 0;
        let prevMonthFasting = 0;
        let prevMonthFastingCount = 0;
        
        Object.entries(cityData).forEach(([date, prayers]) => {
            const dateObj = new Date(date);
            const month = dateObj.getMonth() + 1;
            const year = dateObj.getFullYear();
            
            if (prayers['Изгрев'] && prayers['Залез'] && 
                prayers['Изгрев'] !== '--:--' && prayers['Залез'] !== '--:--') {
                
                const hours = this.calculateTimeDifference(prayers['Изгрев'], prayers['Залез']);
                
                if (month === currentMonth && year === currentYear) {
                    currentMonthDaylight += hours;
                    currentMonthCount++;
                } else if (month === prevMonth && year === prevYear) {
                    prevMonthDaylight += hours;
                    prevMonthCount++;
                }
            }
            
            if (prayers['Зора'] && prayers['Залез'] && 
                prayers['Зора'] !== '--:--' && prayers['Залез'] !== '--:--') {
                
                const fasting = this.calculateTimeDifference(prayers['Зора'], prayers['Залез']);
                
                if (month === currentMonth && year === currentYear) {
                    currentMonthFasting += fasting;
                    currentMonthFastingCount++;
                } else if (month === prevMonth && year === prevYear) {
                    prevMonthFasting += fasting;
                    prevMonthFastingCount++;
                }
            }
        });
        
        // Изчисляване на средните стойности
        const currentMonthAvg = currentMonthCount > 0 ? currentMonthDaylight / currentMonthCount : 0;
        const prevMonthAvg = prevMonthCount > 0 ? prevMonthDaylight / prevMonthCount : 0;
        const currentMonthFastingAvg = currentMonthFastingCount > 0 ? currentMonthFasting / currentMonthFastingCount : 0;
        const prevMonthFastingAvg = prevMonthFastingCount > 0 ? prevMonthFasting / prevMonthFastingCount : 0;
        
        // Изчисляване на промяната
        const daylightChange = currentMonthCount > 0 && prevMonthCount > 0 
            ? currentMonthAvg - prevMonthAvg 
            : 0;
            
        const fastingChange = currentMonthFastingCount > 0 && prevMonthFastingCount > 0
            ? currentMonthFastingAvg - prevMonthFastingAvg
            : 0;
        
        const monthChangeElement = document.getElementById('monthChange');
        if (monthChangeElement) {
            if (daylightChange !== 0 || fastingChange !== 0) {
                let changeText = '';
                
                if (daylightChange !== 0) {
                    changeText += daylightChange > 0 ? 
                        `+${daylightChange.toFixed(1)}ч (ден)` : 
                        `${daylightChange.toFixed(1)}ч (ден)`;
                }
                
                if (fastingChange !== 0) {
                    if (changeText !== '') changeText += ', ';
                    changeText += fastingChange > 0 ?
                        `+${fastingChange.toFixed(1)}ч (постинг)` :
                        `${fastingChange.toFixed(1)}ч (постинг)`;
                }
                
                monthChangeElement.textContent = changeText;
                monthChangeElement.style.color = (daylightChange > 0 || fastingChange > 0) ? '#38b000' : '#ff6b6b';
            } else {
                monthChangeElement.textContent = '0.0ч (без промяна)';
                monthChangeElement.style.color = '#fff';
            }
        }
    }

    updateCityComparison() {
        this.initCityComparisonChart();
        if (typeof showNotification === 'function') {
            showNotification('Сравнението между градовете е актуализирано', 'success');
        }
    }
}

// Initialize analytics module
document.addEventListener('DOMContentLoaded', () => {
    window.analyticsModule = new AnalyticsModule();
});

// Глобални функции за достъп от HTML
window.showFullAnalytics = function() {
    if (window.analyticsModule) {
        window.analyticsModule.showFullAnalytics();
    }
};

window.hideFullAnalytics = function() {
    if (window.analyticsModule) {
        window.analyticsModule.hideFullAnalytics();
    }
};

window.updateCityComparison = function() {
    if (window.analyticsModule) {
        window.analyticsModule.updateCityComparison();
    }
};

// Функция за ръчно актуализиране на аналитиката при промяна на месеца
window.updateAnalyticsForMonth = function() {
    if (window.analyticsModule) {
        window.analyticsModule.handleMonthChange();
    }
};