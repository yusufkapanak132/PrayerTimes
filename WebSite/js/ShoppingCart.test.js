
document.body.innerHTML = `
    <div id="cartContainer"></div>
    <button id="cartBtn"><span class="cart-count">0</span></button>
    <div id="cartItems"></div>
    <div id="cartTotal"></div>
    
    <div id="checkoutModal" style="display: none;"></div>
    <div id="checkoutItems"></div>
    <span id="checkoutTotal">0.00</span>
    
    <form id="orderForm"></form>
    <select id="deliveryMethod"></select>
    <textarea id="address"></textarea>
    <label id="addressLabel"></label>
    <input id="city" />
    <input id="name" />
    <input id="email" />
    <input id="phone" />
`;


const { ShoppingCart } = require('./main.js'); 

describe('ShoppingCart Core Logic Tests', () => {
    let cart;

    beforeEach(() => {
        
        localStorage.clear();
        
        
        cart = new ShoppingCart();
        
        
        cart.showNotification = jest.fn(); 
    });

    test('трябва да инициализира празна количка при липса на данни в localStorage', () => {
        expect(cart.items.length).toBe(0);
        expect(cart.getTotal()).toBe(0);
    });

    test('addToCart трябва да добавя "Prayer Watch" правилно', () => {
        cart.addToCart('watch'); 
        
        expect(cart.items.length).toBe(1);
        expect(cart.items[0].id).toBe('watch');
        expect(cart.items[0].name).toBe('Prayer Watch');
        expect(cart.items[0].price).toBe(80);
        expect(cart.getTotal()).toBe(80); 
    });

    test('addToCart трябва да игнорира несъществуващи продукти', () => {
        cart.addToCart('invalid_product');
        expect(cart.items.length).toBe(0);
    });

    test('addToCart трябва да увеличава количеството при повторно добавяне', () => {
        cart.addToCart('watch'); 
        cart.addToCart('watch'); 
        
        expect(cart.items.length).toBe(1); 
        expect(cart.items[0].quantity).toBe(2); 
        expect(cart.getTotal()).toBe(160); 
    });

    test('updateQuantity трябва правилно да променя бройката и общата сума', () => {
        cart.addToCart('watch');
        cart.updateQuantity('watch', 5);
        
        expect(cart.items[0].quantity).toBe(5);
        expect(cart.getTotal()).toBe(400); 
    });

    test('updateQuantity трябва да премахва продукта, ако количеството падне под 1', () => {
        cart.addToCart('watch');
        cart.updateQuantity('watch', 0);
        
        expect(cart.items.length).toBe(0);
        expect(cart.getTotal()).toBe(0);
    });

    test('removeFromCart трябва да изтрива продукта напълно', () => {
        cart.addToCart('watch');
        cart.removeFromCart('watch');
        
        expect(cart.items.length).toBe(0);
    });

    test('saveCart трябва да записва данните в localStorage под ключа "prayer_cart"', () => {
        cart.addToCart('watch');
        
        const savedData = JSON.parse(localStorage.getItem('prayer_cart'));
        expect(savedData).not.toBeNull();
        expect(savedData.length).toBe(1);
        expect(savedData[0].id).toBe('watch');
        expect(savedData[0].quantity).toBe(1);
    });
});