class AIAssistant {
    constructor() {
        this.isOpen = false;
        this.prayerData = {};
        this.currentCity = 'София';
        this.init();
    }

    async init() {
        await this.loadPrayerData();
        this.createAILauncher();
        this.setupEventListeners();
        
        // Изчакваме мултилингал мениджъра да се инициализира
        setTimeout(() => {
            this.updateTranslations();
        }, 100);
    }

    async loadPrayerData() {
        try {
            const response = await fetch('assets/all_prayer_times_2026.json');
            this.prayerData = await response.json();
            this.currentCity = document.getElementById('citySelect')?.value || 'София';
        } catch (error) {
            console.error('Error loading prayer data for AI:', error);
        }
    }

    createAILauncher() {
        if (document.getElementById('aiLauncher')) return;
        
        const launcher = document.createElement('button');
        launcher.id = 'aiLauncher';
        launcher.className = 'ai-launcher-btn';
        launcher.innerHTML = '<i class="fas fa-robot"></i> <span data-translate="ai">AI Помощник</span>';
        launcher.title = 'AI Помощник';
        
        document.body.appendChild(launcher);
    }

    setupEventListeners() {
        const launcher = document.getElementById('aiLauncher');
        if (launcher) {
            launcher.addEventListener('click', () => this.toggleAssistant());
        }
        
        const navAI = document.getElementById('aiBtn');
        if (navAI) {
            navAI.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleAssistant();
            });
        }
        
        const citySelect = document.getElementById('citySelect');
        if (citySelect) {
            citySelect.addEventListener('change', () => {
                this.currentCity = citySelect.value;
            });
        }
        
        // Слушаме за промяна на езика
        document.addEventListener('languageChanged', () => {
            this.updateTranslations();
        });
    }

    toggleAssistant() {
        if (this.isOpen) {
            this.closeAssistant();
        } else {
            this.openAssistant();
        }
    }

    openAssistant() {
        if (!document.querySelector('.ai-assistant')) {
            this.createAssistant();
        } else {
            // Актуализираме преводите при отваряне
            this.updateTranslations();
        }
        
        const assistant = document.querySelector('.ai-assistant');
        assistant.style.display = 'flex';
        this.isOpen = true;
        
        setTimeout(() => {
            const input = document.querySelector('.ai-input');
            if (input) input.focus();
        }, 100);
        
        this.scrollToBottom();
    }

    closeAssistant() {
        const assistant = document.querySelector('.ai-assistant');
        if (assistant) {
            assistant.style.display = 'none';
            this.isOpen = false;
        }
    }

    createAssistant() {
        // Взимаме преводите
        const dict = this.getTranslations();
        
        const assistantHTML = `
            <div class="ai-assistant">
                <div class="ai-header">
                    <i class="fa-solid fa-robot"></i>
                    <h3 class="ai-title" data-translate="aiAssistant">${dict.aiAssistant || 'AI Помощник за намаз'}</h3>
                    <button class="ai-close"><i class="fas fa-times"></i></button>
                </div>
                <div class="ai-chat-window">
                    <div class="ai-messages-container">
                        <div class="ai-messages">
                            <div class="ai-message ai-bot">
                                <div class="ai-avatar"><i class="fa-solid fa-robot"></i></div>
                                <div class="ai-content welcome-message" data-translate="aiWelcome">${dict.aiWelcome || 'Ас-саляму алейкум! Аз съм вашият AI асистент за намаз. Мога да отговарям на въпроси за молитвени времена, уду, ракати и кибла. Как мога да ви помогна?'}</div>
                            </div>
                        </div>
                    </div>
                    <div class="ai-quick-questions">
                        <button class="ai-quick-btn" data-question="aiAskRakat" data-translate="aiAskRakat">${dict.aiAskRakat || 'колко раката има фаджр'}</button>
                        <button class="ai-quick-btn" data-question="aiAskWudu" data-translate="aiAskWudu">${dict.aiAskWudu || 'как се прави уду'}</button>
                        <button class="ai-quick-btn" data-question="aiAskQibla" data-translate="aiAskQibla">${dict.aiAskQibla || 'към къде е кибла'}</button>
                        <button class="ai-quick-btn" data-question="aiAskJumuah" data-translate="aiAskJumuah">${dict.aiAskJumuah || 'кога се прави джума'}</button>
                    </div>
                    <div class="ai-input-area">
                        <input type="text" class="ai-input" data-translate-placeholder="aiPlaceholder" placeholder="${dict.aiPlaceholder || 'Задайте въпрос за намаза...'}">
                        <button class="ai-send"><i class="fas fa-paper-plane"></i></button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', assistantHTML);
        
        this.setupAssistantListeners();
        this.setupQuickQuestionListeners();
    }

    setupAssistantListeners() {
        const closeBtn = document.querySelector('.ai-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeAssistant());
        }
        
        const sendBtn = document.querySelector('.ai-send');
        const input = document.querySelector('.ai-input');
        
        if (sendBtn && input) {
            sendBtn.addEventListener('click', () => this.sendMessage());
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.sendMessage();
            });
        }
    }

    setupQuickQuestionListeners() {
        document.querySelectorAll('.ai-quick-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const questionKey = btn.dataset.question;
                const dict = this.getTranslations();
                const question = dict[questionKey] || btn.textContent;
                
                const input = document.querySelector('.ai-input');
                if (input) {
                    input.value = question;
                    this.sendMessage();
                }
            });
        });
    }

    updateTranslations() {
        const dict = this.getTranslations();
        if (!dict) return;
        
        // Обновяваме заглавието
        const title = document.querySelector('.ai-title');
        if (title) title.textContent = dict.aiAssistant || 'AI Помощник за намаз';
        
        // Обновяваме welcome съобщението
        const welcome = document.querySelector('.welcome-message');
        if (welcome) welcome.textContent = dict.aiWelcome || 'Ас-саляму алейкум! Аз съм вашият AI асистент за намаз. Мога да отговарям на въпроси за молитвени времена, уду, ракати и кибла. Как мога да ви помогна?';
        
        // Обновяваме бързите въпроси
        document.querySelectorAll('.ai-quick-btn').forEach(btn => {
            const key = btn.dataset.question;
            if (key && dict[key]) {
                btn.textContent = dict[key];
            }
        });
        
        // Обновяваме placeholder
        const input = document.querySelector('.ai-input');
        if (input && dict.aiPlaceholder) {
            input.placeholder = dict.aiPlaceholder;
        }
        
        // Обновяваме AI launcher бутона
        const launcher = document.getElementById('aiLauncher');
        if (launcher) {
            const span = launcher.querySelector('span');
            if (span && dict.ai) {
                span.textContent = dict.ai;
            }
        }
    }

    getTranslations() {
        return window.multilingual?.translations[window.multilingual.currentLang] || 
               window.multilingual?.translations['bg'] || 
               {
                   'ai': 'AI Помощник',
                   'aiAssistant': 'AI Помощник за намаз',
                   'aiWelcome': 'Ас-саляму алейкум! Аз съм вашият AI асистент за намаз. Мога да отговарям на въпроси за молитвени времена, уду, ракати и кибла. Как мога да ви помогна?',
                   'aiPlaceholder': 'Задайте въпрос за намаза...',
                   'aiAskRakat': 'колко раката има фаджр',
                   'aiAskWudu': 'как се прави уду',
                   'aiAskQibla': 'към къде е кибла',
                   'aiAskJumuah': 'кога се прави джума',
                   'aiFajrRakat': '🌅 Фаджр (утрешен намаз) има 2 раката сунна и 2 раката фард. Общо 4 раката.',
                   'aiWuduSteps': '💧 Уду (мало омовение) включва следните стъпки:\n\n1. 👐 Умиване на ръцете 3 пъти\n2. 👄 Изплакване на устата 3 пъти\n3. 👃 Изсмукване на вода в носа 3 пъти\n4. 😷 Умиване на лицето 3 пъти\n5. 💪 Умиване на ръцете до лактите 3 пъти\n6. 👤 Протриване на главата веднъж\n7. 🦶 Умиване на краката до глезените 3 пъти\n\n💡 Уду е задължително преди всеки намаз.',
                   'aiQiblaDirection': '🕋 В България, киблата е посоката към Кааба в Мека, приблизително 135 градуса югоизток.\n📍 За точна посока използвайте вградения GPS компас в приложението.\n👉 Натиснете бутона "Определи моята локация" за точна кибла посока.',
                   'aiJumuahInfo': '🕌 Джума (петъчен намаз) се извършва вместо Зухр на всеки петък в обеден час.\n📖 Има 2 раката фард и се извършва в джамия с хутба (проповед).',
                   'aiRakatInfo': '📿 Ракатите по намази са:\n\n• 🌅 Фаджр: 2 сунна + 2 фард\n• 🕛 Зухр: 4 сунна + 4 фард + 2 сунна\n• ⏳ Аср: 4 сунна + 4 фард\n• 🌇 Магриб: 3 фард + 2 сунна\n• 🌙 Иша: 4 сунна + 4 фард + 2 сунна + 3 витър',
                   'aiNextPrayer': 'Следващият намаз е',
                   'aiAfter': 'след',
                   'aiHours': 'часа и',
                   'aiMinutes': 'минути',
                   'aiDefault': '🤖 Благодаря за въпроса! За конкретна информация:\n\n• ⏰ За молитвени времена - питайте "кога е следващият намаз"\n• 📿 За ракати - посочете конкретен намаз\n• 💧 За уду - питайте "стъпки за уду"\n• 🕋 За кибла - използвайте GPS функцията\n\nАс-саляму алейкум!'
               };
    }

    sendMessage() {
        const input = document.querySelector('.ai-input');
        const message = input.value.trim();
        
        if (!message) return;
        
        this.addMessage(message, 'user');
        input.value = '';
        
        setTimeout(() => {
            const response = this.generateResponse(message);
            this.addMessage(response, 'bot');
        }, 800);
    }

    addMessage(text, sender) {
        const messages = document.querySelector('.ai-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `ai-message ai-${sender}`;
        
        const formattedText = text.replace(/\n/g, '<br>');
        
        messageDiv.innerHTML = `
            <div class="ai-avatar">
                <i class="fas fa-${sender === 'user' ? 'user' : 'robot'}"></i>
            </div>
            <div class="ai-content">${formattedText}</div>
        `;
        messages.appendChild(messageDiv);
        
        this.scrollToBottom();
    }

    scrollToBottom() {
        const messagesContainer = document.querySelector('.ai-messages-container');
        if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }

    generateResponse(question) {
        const q = question.toLowerCase();
        const dict = this.getTranslations();
        const today = new Date().toISOString().split('T')[0];
        const cityData = this.prayerData[this.currentCity];
        const todayPrayers = cityData?.[today];
        
        // Проверка за въпроси за време на всички езици
        const timeKeywords = [
            'време', 'кога', 'сега', 'time', 'when', 'now', 
            'vakit', 'ne zaman', 'şimdi', 'وقت', 'متى', 'الآن'
        ];
        
        if (timeKeywords.some(keyword => q.includes(keyword))) {
            if (todayPrayers) {
                const prayerNames = {
                    'Зора': '🌅 ' + (dict['fajr'] || 'Фаджр'),
                    'Изгрев': '☀️ ' + (dict['sunrise'] || 'Изгрев'),
                    'Обяд': '🕛 ' + (dict['dhuhr'] || 'Зухр'),
                    'Следобяд': '⏳ ' + (dict['asr'] || 'Аср'),
                    'Залез': '🌇 ' + (dict['maghrib'] || 'Магриб'),
                    'Нощ': '🌙 ' + (dict['isha'] || 'Иша')
                };
                
                let response = `🕌 ${dict['appName'] || 'Молитвени времена'} - ${this.currentCity} (${today}):\n\n`;
                
                for (const [prayer, time] of Object.entries(todayPrayers)) {
                    if (prayerNames[prayer]) {
                        response += `${prayerNames[prayer]}: ${time}\n`;
                    }
                }
                
                const nextPrayer = this.getNextPrayerTime(todayPrayers, dict);
                if (nextPrayer) {
                    response += `\n⏱️ ${nextPrayer}`;
                }
                
                return response;
            }
            return dict['aiDefault']?.split('\n')[0] || 'Моля, изберете град.';
        }
        
        // Проверка за Фаджр
        if (q.includes('фаджр') || q.includes('зора') || q.includes('fajr') || 
            q.includes('sabah') || q.includes('فجر')) {
            return dict['aiFajrRakat'] || '🌅 Фаджр има 2 раката сунна и 2 раката фард. Общо 4 раката.';
        }
        
        // Проверка за Уду
        if (q.includes('уду') || q.includes('абдест') || q.includes('очистване') || 
            q.includes('wudu') || q.includes('abdest') || q.includes('وضوء')) {
            return dict['aiWuduSteps'] || '💧 Уду (мало омовение) включва 7 стъпки.';
        }
        
        // Проверка за Кибла
        if (q.includes('кибла') || q.includes('посока') || q.includes('qibla') || 
            q.includes('kıble') || q.includes('قبلة')) {
            return dict['aiQiblaDirection'] || '🕋 Киблата е 135° югоизток.';
        }
        
        // Проверка за Джума
        if (q.includes('джума') || q.includes('петък') || q.includes('jumuah') || 
            q.includes('cuma') || q.includes('جمعة')) {
            return dict['aiJumuahInfo'] || '🕌 Джума се извършва в петък.';
        }
        
        // Проверка за Ракати
        if (q.includes('ракат') || q.includes('раката') || q.includes('rakat') || 
            q.includes('rekat') || q.includes('ركعة')) {
            return dict['aiRakatInfo'] || '📿 Ракати: Фаджр 4, Зухр 10, Аср 8, Магриб 5, Иша 13.';
        }
        
        return dict['aiDefault'] || '🤖 Моля, задайте въпрос за намаза.';
    }

    getNextPrayerTime(prayers, dict) {
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        
        const prayerTimes = [
            { name: dict['fajr'] || 'Фаджр', time: prayers['Зора'], emoji: '🌅' },
            { name: dict['sunrise'] || 'Изгрев', time: prayers['Изгрев'], emoji: '☀️' },
            { name: dict['dhuhr'] || 'Зухр', time: prayers['Обяд'], emoji: '🕛' },
            { name: dict['asr'] || 'Аср', time: prayers['Следобяд'], emoji: '⏳' },
            { name: dict['maghrib'] || 'Магриб', time: prayers['Залез'], emoji: '🌇' },
            { name: dict['isha'] || 'Иша', time: prayers['Нощ'], emoji: '🌙' }
        ];
        
        for (const prayer of prayerTimes) {
            if (prayer.time) {
                const prayerDate = new Date(today + ' ' + prayer.time);
                if (prayerDate > now) {
                    const diffMs = prayerDate - now;
                    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                    
                    if (diffHours > 0) {
                        return `${dict['aiNextPrayer'] || 'Следващият намаз е'} ${prayer.emoji} ${prayer.name} ${dict['aiAfter'] || 'след'} ${diffHours} ${dict['aiHours'] || 'часа и'} ${diffMinutes} ${dict['aiMinutes'] || 'минути'} (${prayer.time})`;
                    } else {
                        return `${dict['aiNextPrayer'] || 'Следващият намаз е'} ${prayer.emoji} ${prayer.name} ${dict['aiAfter'] || 'след'} ${diffMinutes} ${dict['aiMinutes'] || 'минути'} (${prayer.time})`;
                    }
                }
            }
        }
        
        return null;
    }
}

// Инициализиране на AI асистента
document.addEventListener('DOMContentLoaded', () => {
    window.aiAssistant = new AIAssistant();
});