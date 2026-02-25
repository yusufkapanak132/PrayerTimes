/**
 * Файл: checkoutModal.test.js
 * За да стартираш теста, ти трябва Jest. (npm install --save-dev jest jest-environment-jsdom)
 * Увери се, че в package.json си задал: "testEnvironment": "jsdom"
 */





describe('Checkout Modal Operations', () => {
    
    beforeEach(() => {
        
        document.body.innerHTML = `
            <div id="checkoutModal" style="display: none;"></div>
            <form id="orderForm">
                <input type="text" id="name" />
                <input type="email" id="email" />
            </form>
            <div id="checkoutItems"></div>
            <span id="checkoutTotal">0.00</span>
        `;

        
        global.cart = {
            items: [],
            updateOrderDetails: jest.fn() 
        };

        
        global.alert = jest.fn();

        
        global.openCheckout = function() {
            if (global.cart.items.length === 0) {
                alert('Количката е празна');
                return;
            }
            document.getElementById('checkoutModal').style.display = 'flex';
            global.cart.updateOrderDetails();
            
            setTimeout(() => {
                const nameInput = document.getElementById('name');
                if (nameInput) nameInput.focus();
            }, 100);
        };

        global.closeCheckout = function() {
            document.getElementById('checkoutModal').style.display = 'none';
            const orderForm = document.getElementById('orderForm');
            if (orderForm) {
                orderForm.reset = jest.fn(); 
                
                orderForm.innerHTML = '<div class="form-group"><input type="text" id="name" class="form-control" required></div>';
            }
        };

        
        jest.useFakeTimers();
    });

    afterEach(() => {
        
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
        jest.restoreAllMocks();
        document.body.innerHTML = '';
    });

    test('openCheckout() трябва да покаже alert и да не отваря модала, ако количката е празна', () => {
        global.cart.items = []; 
        
        global.openCheckout();
        
        expect(global.alert).toHaveBeenCalledWith('Количката е празна');
        expect(global.alert).toHaveBeenCalledTimes(1);
        expect(document.getElementById('checkoutModal').style.display).toBe('none');
        expect(global.cart.updateOrderDetails).not.toHaveBeenCalled();
    });

    test('openCheckout() трябва да отвори модала и да обнови детайлите, ако има продукти', () => {
        global.cart.items = [{ id: 'watch', name: 'Prayer Watch', price: 80, quantity: 1 }]; 
        
        global.openCheckout();
        
        
        expect(document.getElementById('checkoutModal').style.display).toBe('flex');
        
        
        expect(global.cart.updateOrderDetails).toHaveBeenCalledTimes(1);
        
        
        jest.advanceTimersByTime(100);
        
        
        expect(document.activeElement.id).toBe('name');
    });

    test('closeCheckout() трябва да скрие модала и да възстанови първоначалния вид на формата', () => {
        
        document.getElementById('checkoutModal').style.display = 'flex';
        const form = document.getElementById('orderForm');
        form.innerHTML = '<div>Някакъв променен HTML по време на поръчката</div>';
        form.reset = jest.fn();
        
        global.closeCheckout();
        
        
        expect(document.getElementById('checkoutModal').style.display).toBe('none');
        
        
        expect(form.innerHTML).toContain('id="name"');
    });
});