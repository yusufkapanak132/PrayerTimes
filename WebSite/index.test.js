// ==========================================
// Подготовка на средата (Mocking)
// ==========================================

// Глобални променливи
global.lang = 'bg';
global.currentMonth = '04';
global.currentYear = '2026';

// Функциите, които тестваме
function buildUrl(paramsToUpdate) {
    const currentUrl = new URL(window.location.href);
    const searchParams = currentUrl.searchParams;

    for (const [key, value] of Object.entries(paramsToUpdate)) {
        searchParams.set(key, value);
    }

    if (!paramsToUpdate.hasOwnProperty('city')) {
        const citySelect = document.getElementById('citySelect');
        if (citySelect) searchParams.set('city', citySelect.value);
    }
    if (!paramsToUpdate.hasOwnProperty('lang') && !searchParams.has('lang')) {
        searchParams.set('lang', global.lang); 
    }
    if (!searchParams.has('month')) searchParams.set('month', global.currentMonth);
    if (!searchParams.has('year')) searchParams.set('year', global.currentYear);

    return currentUrl.pathname + '?' + searchParams.toString();
}

async function saveSetting(setting, value) {
    try {
        const response = await fetch("update_settings.php", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `setting=${setting}&value=${value}`
        });
        const data = await response.json();
        return data.success; 
    } catch (err) {
        return false;
    }
}

// ==========================================
// Самите тестове
// ==========================================

describe('Ключови функции от index.php', () => {

    beforeAll(() => {
        // Създаваме фалшив fetch
        global.fetch = jest.fn();
    });

    afterEach(() => {
        // Изчистваме историята на fetch след всеки тест
        jest.clearAllMocks();
    });

    describe('buildUrl()', () => {
        beforeEach(() => {
            // Най-чистият и позволен начин да сменим URL-а в JSDOM
            window.history.pushState({}, '', 'http://localhost/index.php?city=Sofia');
            
            // Симулираме HTML елемента за град
            document.body.innerHTML = `
                <select id="citySelect">
                    <option value="Plovdiv" selected>Plovdiv</option>
                </select>
            `;
        });

        test('трябва да добави нов параметър към URL-а', () => {
            const result = buildUrl({ lang: 'en' });
            expect(result).toBe('/index.php?city=Plovdiv&lang=en&month=04&year=2026');
        });

        test('трябва да презапише съществуващ параметър', () => {
            const result = buildUrl({ city: 'Varna' });
            expect(result).toContain('city=Varna');
            expect(result).not.toContain('city=Sofia');
        });

        test('трябва да използва стойностите по подразбиране, ако липсват', () => {
            const result = buildUrl({});
            expect(result).toBe('/index.php?city=Plovdiv&lang=bg&month=04&year=2026');
        });
    });

    describe('saveSetting()', () => {
        beforeEach(() => {
            // Задаваме URL и тук за всеки случай
            window.history.pushState({}, '', 'http://localhost/index.php?city=Sofia');
            
            document.body.innerHTML = `
                <select id="citySelect">
                    <option value="Plovdiv" selected>Plovdiv</option>
                </select>
            `;
        });

        test('трябва да върне true при успешна заявка към сървъра', async () => {
            global.fetch.mockResolvedValueOnce({
                json: async () => ({ success: true })
            });

            const result = await saveSetting('contrast', 1);

            expect(global.fetch).toHaveBeenCalledTimes(1);
            expect(global.fetch).toHaveBeenCalledWith('update_settings.php', expect.any(Object));
            expect(result).toBe(true);
        });

        test('трябва да върне false при грешка в мрежата', async () => {
            global.fetch.mockRejectedValueOnce(new Error('Network offline'));

            const result = await saveSetting('language', 'tr');

            expect(result).toBe(false);
        });
    });
});