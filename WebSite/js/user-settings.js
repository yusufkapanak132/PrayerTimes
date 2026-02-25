// js/user-settings.js

// --- Глобален обект за настройки ---
window.userSettings = {
    userId: null,
    settings: {},
    init: function() {
        console.log("User settings module initialized");
    },
    
    // --- Функция за записване на настройки ---
    saveSetting: async function(setting, value) {
        if (!this.userId) {
            console.warn("No user logged in, cannot save setting");
            return false;
        }
        
        try {
            const response = await fetch("update_settings.php", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: `setting=${setting}&value=${value}`
            });
            const data = await response.json();
            if (data.success) {
                this.settings[setting] = value; // актуализира JS обекта
                return true;
            }
            return false;
        } catch (err) {
            console.error("Error updating setting:", err);
            return false;
        }
    },
    
    // --- Прилагане на настройки към страницата ---
    applySettings: function() {
        if (!this.settings || Object.keys(this.settings).length === 0) {
            console.log("No user settings to apply");
            return;
        }
        
        console.log("Applying user settings:", this.settings);
        
        // --- Модовете ---
        if (this.settings.contrast == 1) {
            document.body.classList.add("contrast-mode");
            console.log("Applied contrast mode");
        }
        if (this.settings.large_text == 1) {
            document.body.classList.add("large-text-mode");
            console.log("Applied large text mode");
        }
        if (this.settings.daltonism == 1) {
            document.body.classList.add("daltonism-mode");
            console.log("Applied daltonism mode");
        }

        // --- Език ---
        if (this.settings.language) {
            const btn = document.querySelector(`.lang-btn[data-lang="${this.settings.language}"]`);
            if (btn) {
                document.querySelectorAll(".lang-btn").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                console.log("Applied language:", this.settings.language);
            }
        }

        // --- Град ---
        const citySelect = document.getElementById("citySelect");
        if (citySelect && this.settings.city) {
            citySelect.value = this.settings.city;
            console.log("Applied city:", this.settings.city);
        }
    }
};

// --- Инициализация ---
document.addEventListener("DOMContentLoaded", function() {
    // Инициализираме userSettings обекта
    window.userSettings.init();
    
    // --- Настройки за достъпност ---
    document.querySelectorAll(".acc-btn").forEach(btn => {
        btn.addEventListener("click", function() {
            const action = this.dataset.action;
            let className = "";
            let dbSetting = "";

            switch(action) {
                case "contrast": className="contrast-mode"; dbSetting="contrast"; break;
                case "large-text": className="large-text-mode"; dbSetting="large_text"; break;
                case "simulate-colorblind": className="daltonism-mode"; dbSetting="daltonism"; break;
                case "read-aloud": return; // не записваме
            }

            const enabled = document.body.classList.toggle(className) ? 1 : 0;
            if (dbSetting) {
                window.userSettings.saveSetting(dbSetting, enabled);
            }
        });
    });

    // --- Избор на език ---
    document.querySelectorAll(".lang-btn").forEach(btn => {
        btn.addEventListener("click", function() {
            const lang = this.dataset.lang;
            document.querySelectorAll(".lang-btn").forEach(b => b.classList.remove("active"));
            this.classList.add("active");
            window.userSettings.saveSetting("language", lang);
        });
    });

    // --- Избор на град ---
    const citySelect = document.getElementById("citySelect");
    if (citySelect) {
        citySelect.addEventListener("change", function() {
            window.userSettings.saveSetting("city", this.value);
        });
    }
    
    console.log("User settings event handlers initialized");
});