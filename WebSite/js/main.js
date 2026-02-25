
class ShoppingCart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('prayer_cart')) || [];
        this.products = {
            'watch': {
                name: 'Prayer Watch',
                price: 80,
                type: 'watch'
            }
        };
        this.init();
    }

    init() {
        this.updateCartCount();
        this.loadCartItems();
        
        // Event listeners
       //  document.getElementById('citySelect').addEventListener('change', (e) => {
         //   window.location.href = `index.php?city=${encodeURIComponent(e.target.value)}`;
      //  });
        
        document.getElementById('cartBtn').addEventListener('click', () => this.openCart());
    }

    addToCart(productId) {
        const product = this.products[productId];
        if (!product) return;

        const existingItem = this.items.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity++;
        } else {
            this.items.push({
                id: productId,
                name: product.name,
                price: product.price,
                quantity: 1,
                type: product.type
            });
        }

        this.saveCart();
        this.updateCartCount();
        this.loadCartItems();
        this.showNotification(`${product.name} добавено в количката`);
        
        // Ако checkout модала е отворен, обновяваме детайлите
        if (document.getElementById('checkoutModal').style.display === 'flex') {
            this.updateOrderDetails();
        }
    }

    removeFromCart(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.saveCart();
        this.updateCartCount();
        this.loadCartItems();
        
        // Ако checkout модала е отворен, обновяваме детайлите
        if (document.getElementById('checkoutModal').style.display === 'flex') {
            this.updateOrderDetails();
        }
    }

    updateQuantity(productId, quantity) {
        const item = this.items.find(item => item.id === productId);
        if (item) {
            if (quantity < 1) {
                this.removeFromCart(productId);
            } else {
                item.quantity = quantity;
                this.saveCart();
                this.loadCartItems();
                
                // Ако checkout модала е отворен, обновяваме детайлите
                if (document.getElementById('checkoutModal').style.display === 'flex') {
                    this.updateOrderDetails();
                }
            }
        }
    }

    getTotal() {
        return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    saveCart() {
        localStorage.setItem('prayer_cart', JSON.stringify(this.items));
    }

    updateCartCount() {
        const cartBtn = document.getElementById('cartBtn');
        const countElement = cartBtn.querySelector('.cart-count') || document.createElement('span');
        
        const totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
        
        if (totalItems > 0) {
            countElement.className = 'cart-count';
            countElement.textContent = totalItems;
            if (!cartBtn.contains(countElement)) {
                cartBtn.appendChild(countElement);
            }
        } else if (countElement.parentNode) {
            countElement.parentNode.removeChild(countElement);
        }
    }

    loadCartItems() {
        const container = document.getElementById('cartItems');
        const totalElement = document.getElementById('cartTotal');
        
        if (!container) return;

        if (this.items.length === 0) {
            container.innerHTML = '<p style="text-align: center; opacity: 0.7;">Количката е празна</p>';
            totalElement.textContent = '0.00 евро.';
            return;
        }

        let html = '';
        this.items.forEach(item => {
            html += `
                <div class="cart-item">
                    <div class="item-info">
                        <div class="item-name">${item.name}</div>
                        <div class="item-price">${item.price.toFixed(2)} евро</div>
                    </div>
                    <div class="item-controls">
                        <button onclick="cart.updateQuantity('${item.id}', ${item.quantity - 1})">-</button>
                        <span>${item.quantity}</span>
                        <button onclick="cart.updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
                        <button onclick="cart.removeFromCart('${item.id}')" class="remove-btn">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
        totalElement.textContent = `${this.getTotal().toFixed(2)} евро.`;
    }

    updateOrderDetails() {
        const checkoutItems = document.getElementById('checkoutItems');
        const checkoutTotal = document.getElementById('checkoutTotal');
        
        if (!checkoutItems || !checkoutTotal) return;
        
        if (this.items.length === 0) {
            checkoutItems.innerHTML = '<p style="text-align: center; opacity: 0.7; padding: 20px;">Няма продукти в количката</p>';
            checkoutTotal.textContent = '0.00';
            return;
        }
        
        let itemsHtml = '';
        this.items.forEach(item => {
            const itemTotal = (item.price * item.quantity).toFixed(2);
            itemsHtml += `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid rgba(56, 176, 0, 0.2);">
                    <div style="flex: 1;">
                        <div style="font-weight: 600; color: #ffffff;">${item.name}</div>
                        <div style="font-size: 14px; opacity: 0.8; color: #ccc;">Количество: ${item.quantity} бр. × ${item.price.toFixed(2)} евро</div>
                    </div>
                    <div style="font-weight: 700; font-size: 18px; color: #38b000;">${itemTotal} евро</div>
                </div>
            `;
        });
        
        checkoutItems.innerHTML = itemsHtml;
        checkoutTotal.textContent = this.getTotal().toFixed(2);
    }

    openCart() {
        document.getElementById('cartContainer').classList.add('open');
    }

    closeCart() {
        document.getElementById('cartContainer').classList.remove('open');
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #38b000;
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            z-index: 10000;
            animation: slideIn 0.3s ease;
            font-weight: 600;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        `;
        
        notification.innerHTML = `
            <i class="fas fa-check-circle" style="margin-right: 10px;"></i>
            ${message}
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize cart
const cart = new ShoppingCart();

// Global functions for HTML onclick events
function addToCart(productId) {
    cart.addToCart(productId);
}

function openCart() {
    cart.openCart();
}

function closeCart() {
    cart.closeCart();
}

function openCheckout() {
    if (cart.items.length === 0) {
        alert('Количката е празна');
        return;
    }
    document.getElementById('checkoutModal').style.display = 'flex';
    // Обновяване на детайлите на поръчката при отваряне
    cart.updateOrderDetails();
    
    // Фокус на първото поле
    setTimeout(() => {
        document.getElementById('name').focus();
    }, 100);
}

function closeCheckout() {
    document.getElementById('checkoutModal').style.display = 'none';
    // Ресет на формата
    const orderForm = document.getElementById('orderForm');
    if (orderForm) {
        orderForm.reset();
        // Връщане на оригиналния вид на формата
        const formContent = `
            <div class="form-group">
                <label for="name">Име и Фамилия:</label>
                <input type="text" id="name" class="form-control" required>
            </div>
            <div class="form-group">
                <label for="email">Имейл адрес:</label>
                <input type="email" id="email" class="form-control" required>
            </div>
            <div class="form-group">
                <label for="phone">Телефонен номер:</label>
                <input type="tel" id="phone" class="form-control" required>
            </div>
            
            <div class="form-group">
                <label for="deliveryMethod">Начин на доставка:</label>
                <select id="deliveryMethod" class="form-control" required style="background: #000; color: #fff;">
                    <option value="">Изберете начин на доставка</option>
                    <option value="address">До адрес</option>
                    <option value="office">До офис</option>
                </select>
            </div>
            
            <div class="form-group">
                <label for="address" id="addressLabel">Адрес за доставка:</label>
                <textarea id="address" class="form-control" rows="3" required 
                    placeholder="Въведете пълен адрес за доставка (ул., №, блок, вход, ет., ап.)"></textarea>
            </div>
            
            <div class="form-group">
                <label for="city">Град:</label>
                <input type="text" id="city" class="form-control" required 
                    placeholder="Въведете град">
            </div>
            
            <!-- Order summary -->
            <div class="order-summary" style="margin: 20px 0; padding: 20px; background: #000; border-radius: 10px; border: 2px solid #38b000;">
                <h4 style="margin-bottom: 15px; color: #38b000; display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-receipt"></i> Детайли на поръчката:
                </h4>
                <div id="checkoutItems"></div>
                <div style="text-align: right; margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(56, 176, 0, 0.3); font-weight: bold;">
                    <div style="font-size: 18px; margin-bottom: 5px;">Обща сума:</div>
                    <div style="color: #38b000; font-size: 28px; font-weight: 800;">
                        <span id="checkoutTotal">0.00</span> лв.
                    </div>
                </div>
            </div>
            
            <div style="display: flex; gap: 15px; margin-top: 20px;">
                <button type="submit" class="checkout-btn" style="flex: 1;">
                    <i class="fas fa-paper-plane"></i> Изпрати поръчка
                </button>
                <button type="button" class="checkout-btn" onclick="closeCheckout()" style="background: #666; flex: 1;">
                    <i class="fas fa-times"></i> Отказ
                </button>
            </div>
        `;
        orderForm.innerHTML = formContent;
        // Реинициализиране на event listeners
        initializeCheckoutForm();
    }
}

// Order form submission - подобрена версия
function initializeCheckoutForm() {
    const orderForm = document.getElementById('orderForm');
    if (orderForm) {
        // Премахване на старите event listeners
        const newOrderForm = orderForm.cloneNode(true);
        orderForm.parentNode.replaceChild(newOrderForm, orderForm);
        
        // Добавяне на нови event listeners
        document.getElementById('orderForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('=== FORM SUBMIT STARTED ===');
            
            // Показване на съобщение за товарене
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            const originalBtn = submitBtn.cloneNode(true);
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Изпращане...';
            submitBtn.disabled = true;
            
            try {
                // Валидация
                const deliveryMethod = document.getElementById('deliveryMethod');
                const addressField = document.getElementById('address');
                const cityField = document.getElementById('city');
                
                if (!deliveryMethod.value) {
                    throw new Error('Моля, изберете начин на доставка');
                }
                
                if (!addressField.value.trim()) {
                    throw new Error('Моля, въведете адрес/офис за доставка');
                }
                
                if (!cityField.value.trim()) {
                    throw new Error('Моля, въведете град');
                }
                
                // Подготвяне на данните за поръчката
                const formData = {
                    name: document.getElementById('name').value.trim(),
                    email: document.getElementById('email').value.trim(),
                    phone: document.getElementById('phone').value.trim(),
                    deliveryMethod: deliveryMethod.value,
                    address: addressField.value,
                    city: cityField.value,
                    items: cart.items,
                    total: cart.getTotal()
                };
                
                console.log('Sending order data to server:', formData);
                
                // Изпращане на заявка
                const response = await fetch('save_order.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });
                
                console.log('Response status:', response.status);
                
                // Проверка дали отговорът е OK
                if (!response.ok) {
                    const text = await response.text();
                    console.error('Server returned error:', text);
                    
                    // Опитваме да парснем като JSON, ако е възможно
                    try {
                        const errorData = JSON.parse(text);
                        throw new Error(errorData.message || `HTTP грешка ${response.status}`);
                    } catch (e) {
                        throw new Error(`Сървърна грешка (${response.status}): ${text.substring(0, 100)}`);
                    }
                }
                
                // Опитваме да прочетем JSON отговора
                let result;
                try {
                    const responseText = await response.text();
                    console.log('Raw response:', responseText);
                    
                    if (!responseText.trim()) {
                        throw new Error('Празен отговор от сървъра');
                    }
                    
                    result = JSON.parse(responseText);
                } catch (parseError) {
                    console.error('JSON parse error:', parseError);
                    throw new Error('Невалиден формат на отговора от сървъра');
                }
                
                console.log('Parsed response:', result);
                
                // Проверка на резултата
                if (result && result.success === true) {
                    console.log('Order successful:', result.order_number);
                    
                    // Показване на успешно съобщение
                    showSuccessMessage(result, formData);
                    
                    // Изчистване на количката
                    cart.items = [];
                    cart.saveCart();
                    cart.updateCartCount();
                    cart.loadCartItems();
                    
                } else {
                    const errorMsg = result ? (result.message || 'Неизвестна грешка') : 'Грешка без детайли';
                    throw new Error(errorMsg);
                }
                
            } catch (error) {
                console.error('Order submission error:', error);
                
                // Възстановяване на бутона
                submitBtn.replaceWith(originalBtn);
                
                // Показване на грешката
                if (error.message.includes('network') || error.message.includes('fetch')) {
                    alert('Грешка при връзка със сървъра. Моля, проверете интернет връзката си и опитайте отново.');
                } else {
                    alert(error.message || 'Грешка при изпращане на поръчката. Моля, опитайте отново.');
                }
            }
        });
    }
    
    // Динамично променяне на label за адрес според метода на доставка
    const deliveryMethod = document.getElementById('deliveryMethod');
    const addressLabel = document.getElementById('addressLabel');
    const addressField = document.getElementById('address');
    
    if (deliveryMethod && addressLabel && addressField) {
        deliveryMethod.addEventListener('change', function() {
            if (this.value === 'Адрес') {
                addressLabel.textContent = 'Адрес за доставка:';
                addressField.placeholder = 'Въведете пълен адрес за доставка (ул., №, блок, вход, ет., ап.)';
            } else if (this.value === 'Офис') {
                addressLabel.textContent = 'Офис за доставка:';
                addressField.placeholder = 'Въведете куриерска фирма и номер на офис (напр. Еконт офис №123, Speedy офис №456)';
            }
        });
    }
}



// Функция за показване на успешно съобщение
function showSuccessMessage(result, formData) {
    const confirmationHtml = `
        <div style="text-align: center; padding: 30px; animation: fadeIn 0.5s ease;">
            <i class="fas fa-question-circle" style="font-size: 80px; color: #ffa500; margin-bottom: 25px;"></i>
            <h3 style="color: #333; margin-bottom: 20px;">Моля, потвърдете поръчката</h3>
            
            <div style="background: #f9f9f9; padding: 20px; border-radius: 10px; margin: 20px 0; text-align: left; color:black">
                <p><strong>Номер:</strong> ${result.order_number}</p>
                <p><strong>Име:</strong> ${formData.name}</p>
                <p><strong>Сума:</strong> <span style="color: #38b000; font-weight: bold;">${formData.total.toFixed(2)} евро</span></p>
            </div>

            <p style="margin-bottom: 20px;">Сигурни ли сте, че искате да завършите тази поръчка?</p>
            
            <div style="display: flex; gap: 15px; justify-content: center;">
                <button onclick="finalizeOrder(${result.order_id}, 'confirm')" 
                        class="checkout-btn" 
                        style="background: #38b000; color: white; flex: 1;">
                    <i class="fas fa-check"></i> ПОТВЪРДИ
                </button>
                
                <button onclick="finalizeOrder(${result.order_id}, 'cancel')" 
                        class="checkout-btn" 
                        style="background: #dc3545; color: white; flex: 1;">
                    <i class="fas fa-times"></i> ОТКАЖИ
                </button>
            </div>
        </div>
    `;
    
    document.getElementById('orderForm').innerHTML = confirmationHtml;
}

// 2. Нова функция за обработка на бутоните (Потвърди/Откажи)
async function finalizeOrder(orderId, action) {
    // ... (кодът за лоудинг остава същият) ...
    const formContainer = document.getElementById('orderForm');
    formContainer.innerHTML = '<div style="text-align:center; padding:50px;"><i class="fas fa-spinner fa-spin fa-3x"></i><p>Обработка...</p></div>';

    try {
        const response = await fetch('finalize_order.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order_id: orderId, action: action })
        });

        const result = await response.json();

        if (result.success) {
            // ТУК Е ПРОМЯНАТА: ИЗПОЛЗВАМЕ ФУНКЦИЯТА handleOrderComplete
            if (action === 'confirm') {
                // ... (изчистването на количката остава същото) ...
                cart.items = [];
                cart.saveCart();
                cart.updateCartCount();
                cart.loadCartItems();
                
                // ВАЖНО: Вижте т. 2 - трябва да дефинирате тази функция
                const isLoggedIn = window.isUserLoggedIn || false; 

                formContainer.innerHTML = `
                    <div style="text-align: center; padding: 30px;">
                        <i class="fas fa-check-circle" style="font-size: 80px; color: #38b000; margin-bottom: 20px;"></i>
                        <h2 style="color: #38b000;">Успешно!</h2>
                        <p>${result.message}</p>
                        <button onclick="handleOrderComplete(${isLoggedIn})" class="checkout-btn" style="margin-top:20px;">Затвори</button>
                    </div>
                `;
            } else {
                // ... (Отказана поръчка остава същата)
                formContainer.innerHTML = `
                    <div style="text-align: center; padding: 30px;">
                        <i class="fas fa-trash-alt" style="font-size: 80px; color: #666; margin-bottom: 20px;"></i>
                        <h2>Поръчката е отказана</h2>
                        <p>${result.message}</p>
                        <button onclick="closeCheckout();" class="checkout-btn" style="margin-top:20px; background:#666;">Затвори</button>
                    </div>
                `;
            }
        } else {
            alert('Грешка: ' + result.message);
            closeCheckout();
        }

    } catch (error) {
        console.error(error);
        alert('Възникна грешка при връзката със сървъра.');
        closeCheckout();
    }
}
// Добавете тази функция някъде в main.js
function handleOrderComplete(isLoggedIn) {
    // 1. Затваряме модалния прозорец за поръчка
    closeCheckout(); 
    
    // 2. Проверяваме дали потребителят НЕ Е логнат в момента на сървъра
    if (!isLoggedIn) {
        // !!! АКО ИЗПОЛЗВАТЕ Local Storage или Cookies, за да показвате "логнат" статус,
        // ТРЯБВА ДА ГИ ИЗЧИСТИТЕ ТУК.
        
        // Например, ако сте запазили username/settings в Local Storage:
        // localStorage.removeItem('user_settings');
        // localStorage.removeItem('is_logged_in_status');
        
        // Добавете вашия код за изчистване на локалния статус тук!
    }

    // 3. Презареждаме страницата
    location.reload(); 
}

// Функция за принтиране на потвърждение
function printOrderConfirmation(orderNumber, customerName, totalAmount) {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
        <head>
            <title>Потвърждение на поръчка ${orderNumber}</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                .header { text-align: center; margin-bottom: 30px; }
                .logo { color: #38b000; font-size: 24px; font-weight: bold; }
                .order-info { margin: 20px 0; }
                .total { font-size: 20px; font-weight: bold; color: #38b000; }
                .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
                @media print {
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="logo">Молитвени Времена</div>
                <h2>Потвърждение на поръчка</h2>
            </div>
            <div class="order-info">
                <p><strong>Номер на поръчка:</strong> ${orderNumber}</p>
                <p><strong>Клиент:</strong> ${customerName}</p>
                <p><strong>Обща сума:</strong> <span class="total">${totalAmount} лв.</span></p>
                <p><strong>Дата:</strong> ${new Date().toLocaleString('bg-BG')}</p>
            </div>
            <div class="footer">
                <p>Благодарим ви за поръчката!</p>
                <p>www.molitvenivremena.bg</p>
            </div>
            <div class="no-print" style="margin-top: 20px;">
                <button onclick="window.print()" style="padding: 10px 20px; background: #38b000; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    Принтирай
                </button>
                <button onclick="window.close()" style="padding: 10px 20px; background: #666; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">
                    Затвори
                </button>
            </div>
            <script>
                window.onload = function() {
                    window.print();
                }
            </script>
        </body>
        </html>
    `);
    printWindow.document.close();
}

// Add CSS animations and styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
    }
    
    .cart-count {
        background: #ff6b6b;
        color: white;
        border-radius: 50%;
        width: 22px;
        height: 22px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: 700;
        margin-left: 5px;
        animation: pulse 2s infinite;
    }
    
    .item-controls button {
        background: rgba(255,255,255,0.1);
        border: none;
        color: white;
        width: 32px;
        height: 32px;
        border-radius: 6px;
        cursor: pointer;
        margin: 0 5px;
        transition: all 0.2s ease;
    }
    
    .item-controls button:hover {
        background: #38b000;
        transform: translateY(-2px);
    }
    
    .remove-btn {
        background: #ff6b6b !important;
        margin-left: 10px !important;
    }
    
    .remove-btn:hover {
        background: #ff4757 !important;
    }
    
    /* Modal overlay animation */
    #checkoutModal {
        animation: fadeIn 0.3s ease;
    }
    
    /* Spinner animation for submit button */
    .fa-spinner {
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
    
    /* Enhanced dropdown styling */
    #deliveryMethod {
        background: #000000 !important;
        color: #ffffff !important;
        border: 2px solid rgba(255, 255, 255, 0.3) !important;
        border-radius: 10px !important;
        padding: 12px 15px !important;
        font-size: 16px !important;
        appearance: none !important;
        -webkit-appearance: none !important;
        -moz-appearance: none !important;
        background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2338b000'%3e%3cpath d='M7 10l5 5 5-5z'/%3e%3c/svg%3e") !important;
        background-repeat: no-repeat !important;
        background-position: right 15px center !important;
        background-size: 20px !important;
        padding-right: 45px !important;
        transition: all 0.3s ease !important;
    }
    
    #deliveryMethod:hover {
        border-color: #38b000 !important;
        background-color: #111111 !important;
    }
    
    #deliveryMethod:focus {
        border-color: #38b000 !important;
        box-shadow: 0 0 0 3px rgba(56, 176, 0, 0.3) !important;
        outline: none !important;
        background-color: #111111 !important;
    }
    
    #deliveryMethod option {
        background: #000000 !important;
        color: #ffffff !important;
        padding: 12px 15px !important;
    }
    
    #deliveryMethod option:hover,
    #deliveryMethod option:checked {
        background: #38b000 !important;
        color: #ffffff !important;
    }
    
    /* Form controls in checkout modal */
    #checkoutModal .form-control {
        background: #000000 !important;
        color: #ffffff !important;
        border: 2px solid rgba(255, 255, 255, 0.2) !important;
        border-radius: 10px !important;
        padding: 12px 15px !important;
        font-size: 16px !important;
        transition: all 0.3s ease !important;
    }
    
    #checkoutModal .form-control:focus {
        border-color: #38b000 !important;
        box-shadow: 0 0 0 3px rgba(56, 176, 0, 0.3) !important;
        outline: none !important;
        background: #111111 !important;
    }
    
    /* Order summary scrollbar */
    #checkoutItems {
        max-height: 250px;
        overflow-y: auto;
        padding-right: 10px;
    }
    
    #checkoutItems::-webkit-scrollbar {
        width: 8px;
    }
    
    #checkoutItems::-webkit-scrollbar-track {
        background: rgba(56, 176, 0, 0.1);
        border-radius: 4px;
    }
    
    #checkoutItems::-webkit-scrollbar-thumb {
        background: #38b000;
        border-radius: 4px;
    }
    
    #checkoutItems::-webkit-scrollbar-thumb:hover {
        background: #2d8c00;
    }
`;
document.head.appendChild(style);

// Initialize checkout form on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeCheckoutForm();
    const urlParams = new URLSearchParams(window.location.search);
    const logoutStatus = urlParams.get('logout');

    if (logoutStatus === 'success') {
        console.log("Logout detected. Clearing visual settings.");
        
        // Премахваме всички класове за достъпност от <body>
        document.body.classList.remove('high-contrast');
        document.body.classList.remove('large-text-mode');
        document.body.classList.remove('daltonism-mode');
        
        // Може да покажете и съобщение
        if (typeof showNotification === 'function') {
            showNotification('Успешно излязохте от профила си.', 'info');
        }
        
        // Премахваме параметъра от URL-а, за да изчистим адреса
        const newUrl = window.location.href.split('?')[0];
        history.replaceState({}, document.title, newUrl);
    }
    
    // Close modal when clicking outside
    document.getElementById('checkoutModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeCheckout();
        }
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && document.getElementById('checkoutModal').style.display === 'flex') {
            closeCheckout();
        }
    });
 
});
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ShoppingCart };
}