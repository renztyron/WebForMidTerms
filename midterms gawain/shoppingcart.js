// ShoppingCart.js - Handles all cart operations across the site

// Cart data structure
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let products = [
    { id: 1, name: "Wireless Headphones", price: 7299.00, image: "bago/headphones.jpg" },
    { id: 2, name: "Smart Watch", price: 5099.00, image: "bago/watch.jpg" },
    { id: 3, name: "Portable Speaker", price: 3399.00, image: "bago/speaker.jpg" },
    { id: 4, name: "Smartphone", price: 39999.00, image: "bago/smarthphone.jpg" },
    { id: 5, name: "Laptop", price: 56999.00, image: "bago/laptop.jpg" },
    { id: 6, name: "Wireless Earbuds", price: 4499.00, image: "bago/earbuds.webp" },
    { id: 7, name: "Tablet", price: 16999.00, image: "bago/tablet.avif" },
    { id: 8, name: "Digital Camera", price: 28499.00, image: "bago/cam.jpg" },
    { id: 9, name: "Gaming Console", price: 22799.00, image: "bago/console.avif" },
    { id: 10, name: "Smart Home Hub", price: 8499.00, image: "bago/hub.jpg" }
];

// Initialize the cart
function initCart() {
    updateCartCounter();
    
    // Add event listeners to "Add to Cart" buttons if on products page
    if (document.querySelector('.product-card')) {
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', function() {
                const productId = parseInt(this.dataset.id);
                addToCart(productId);
            });
        });
    }

    // Render cart if on cart page
    if (document.getElementById('cartItems')) {
        renderCart();
    }
    
    // Add event listener to checkout button if it exists
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', proceedToCheckout);
    }
}

// Add item to cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ id: productId, quantity: 1 });
    }
    
    saveCart();
    updateCartCounter();
    
    // Show feedback to user
    showToast(`${product.name} added to cart!`);
}

// Update item quantity
function updateQuantity(productId, change) {
    const itemIndex = cart.findIndex(item => item.id === productId);
    if (itemIndex === -1) return;

    cart[itemIndex].quantity += change;

    // Remove item if quantity reaches 0
    if (cart[itemIndex].quantity <= 0) {
        cart.splice(itemIndex, 1);
    }

    saveCart();
    renderCart();
    updateCartCounter();
}

// Remove item from cart
function removeItem(productId) {
    const product = products.find(p => p.id === productId);
    cart = cart.filter(item => item.id !== productId);
    
    saveCart();
    renderCart();
    updateCartCounter();
    
    // Show feedback to user
    if (product) {
        showToast(`${product.name} removed from cart`);
    }
}

// Update cart counter on all pages
function updateCartCounter() {
    const counter = document.getElementById('cart-counter');
    if (!counter) return;
    
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    counter.textContent = itemCount;
    counter.style.display = itemCount > 0 ? 'inline' : 'none';
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Render cart on cart page
function renderCart() {
    const cartItemsContainer = document.getElementById('cartItems');
    if (!cartItemsContainer) return;
    
    cartItemsContainer.innerHTML = '';

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart-message">Your cart is empty</p>';
        updateSummary();
        return;
    }

    cart.forEach(item => {
        const product = products.find(p => p.id === item.id);
        if (!product) return;

        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        itemElement.innerHTML = `
            <div class="cart-item-image">
                <img src="${product.image}" alt="${product.name}" class="img-fluid">
            </div>
            <div class="cart-item-details">
                <h4 class="cart-item-title">${product.name}</h4>
                <p class="cart-item-price">₱${product.price.toFixed(2)}</p>
                <div class="cart-item-quantity">
                    <button class="btn btn-sm btn-outline-secondary decrease-btn" data-id="${product.id}">-</button>
                    <input type="text" value="${item.quantity}" readonly>
                    <button class="btn btn-sm btn-outline-secondary increase-btn" data-id="${product.id}">+</button>
                </div>
            </div>
            <button class="cart-item-remove remove-btn" data-id="${product.id}" aria-label="Remove item">&times;</button>
        `;
        cartItemsContainer.appendChild(itemElement);
    });

    // Add event listeners
    document.querySelectorAll('.decrease-btn').forEach(btn => {
        btn.addEventListener('click', () => updateQuantity(parseInt(btn.dataset.id), -1));
    });

    document.querySelectorAll('.increase-btn').forEach(btn => {
        btn.addEventListener('click', () => updateQuantity(parseInt(btn.dataset.id), 1));
    });

    document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', () => removeItem(parseInt(btn.dataset.id)));
    });

    updateSummary();
}

// Update summary totals
function updateSummary() {
    const subtotalElement = document.getElementById('subtotal');
    const shippingElement = document.getElementById('shipping');
    const taxElement = document.getElementById('tax');
    const totalElement = document.getElementById('total');
    const itemCountElement = document.getElementById('itemCount');
    
    if (!subtotalElement || !totalElement) return;
    
    const subtotal = cart.reduce((sum, item) => {
        const product = products.find(p => p.id === item.id);
        return sum + (product ? product.price * item.quantity : 0);
    }, 0);

    const shipping = subtotal > 0 ? 50 : 0; // Fixed shipping cost or free if cart is empty
    const tax = subtotal * 0.12; // 12% tax
    const total = subtotal + shipping + tax;

    if (itemCountElement) {
        itemCountElement.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    }
    
    subtotalElement.textContent = `₱${subtotal.toFixed(2)}`;
    if (shippingElement) shippingElement.textContent = `₱${shipping.toFixed(2)}`;
    if (taxElement) taxElement.textContent = `₱${tax.toFixed(2)}`;
    totalElement.textContent = `₱${total.toFixed(2)}`;
}

// Show toast message
function showToast(message) {
    // Check if a toast container already exists
    let toastContainer = document.querySelector('.toast-container');
    
    // If not, create one
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = message;
    
    // Add toast to container
    toastContainer.appendChild(toast);
    
    // Remove toast after animation
    setTimeout(() => {
        toast.classList.add('toast-hide');
        setTimeout(() => {
            toast.remove();
            if (toastContainer.children.length === 0) {
                toastContainer.remove();
            }
        }, 500);
    }, 3000);
}

// Proceed to checkout
function proceedToCheckout() {
    // Check if cart is empty
    if (cart.length === 0) {
        showToast('Your cart is empty!');
        return;
    }
    
    // Create checkout form container
    const checkoutContainer = document.createElement('div');
    checkoutContainer.className = 'checkout-container';
    
    // Calculate totals
    const subtotal = cart.reduce((sum, item) => {
        const product = products.find(p => p.id === item.id);
        return sum + (product ? product.price * item.quantity : 0);
    }, 0);
    const shipping = 50; // Fixed shipping cost
    const tax = subtotal * 0.12; // 12% tax
    const total = subtotal + shipping + tax;
    
    // Create checkout form HTML
    checkoutContainer.innerHTML = `
        <div class="checkout-form">
            <span class="close-checkout">&times;</span>
            <h2>Checkout</h2>
            
            <div class="checkout-summary">
                <h3>Order Summary</h3>
                <div class="order-items">
                    ${cart.map(item => {
                        const product = products.find(p => p.id === item.id);
                        return `
                            <div class="order-item">
                                <span>${product.name} x ${item.quantity}</span>
                                <span>₱${(product.price * item.quantity).toFixed(2)}</span>
                            </div>
                        `;
                    }).join('')}
                </div>
                <div class="order-totals">
                    <div class="order-subtotal">
                        <span>Subtotal</span>
                        <span>₱${subtotal.toFixed(2)}</span>
                    </div>
                    <div class="order-shipping">
                        <span>Shipping</span>
                        <span>₱${shipping.toFixed(2)}</span>
                    </div>
                    <div class="order-tax">
                        <span>Tax (12%)</span>
                        <span>₱${tax.toFixed(2)}</span>
                    </div>
                    <div class="order-total">
                        <span><strong>Total</strong></span>
                        <span><strong>₱${total.toFixed(2)}</strong></span>
                    </div>
                </div>
            </div>
            
            <form id="checkoutForm">
                <div class="form-section">
                    <h3>Shipping Information</h3>
                    <div class="form-group">
                        <label for="fullName">Full Name</label>
                        <input type="text" id="fullName" required>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="email">Email</label>
                            <input type="email" id="email" required>
                        </div>
                        <div class="form-group">
                            <label for="phone">Phone</label>
                            <input type="tel" id="phone" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="address">Address</label>
                        <input type="text" id="address" required>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="city">City</label>
                            <input type="text" id="city" required>
                        </div>
                        <div class="form-group">
                            <label for="postalCode">Postal Code</label>
                            <input type="text" id="postalCode" required>
                        </div>
                    </div>
                </div>
                
                <div class="form-section">
                    <h3>Payment Information</h3>
                    <div class="payment-methods">
                        <div class="payment-method">
                            <input type="radio" id="creditCard" name="paymentMethod" value="creditCard" checked>
                            <label for="creditCard">Credit Card</label>
                        </div>
                        <div class="payment-method">
                            <input type="radio" id="paypal" name="paymentMethod" value="paypal">
                            <label for="paypal">PayPal</label>
                        </div>
                        <div class="payment-method">
                            <input type="radio" id="cod" name="paymentMethod" value="cod">
                            <label for="cod">Cash on Delivery</label>
                        </div>
                    </div>
                    
                    <div id="creditCardDetails">
                        <div class="form-group">
                            <label for="cardHolder">Card Holder Name</label>
                            <input type="text" id="cardHolder" required>
                        </div>
                        <div class="form-group">
                            <label for="cardNumber">Card Number</label>
                            <input type="text" id="cardNumber" placeholder="XXXX XXXX XXXX XXXX" required>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="expiry">Expiry Date</label>
                                <input type="text" id="expiry" placeholder="MM/YY" required>
                            </div>
                            <div class="form-group">
                                <label for="cvv">CVV</label>
                                <input type="text" id="cvv" placeholder="XXX" required>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="checkout-actions">
                    <button type="button" class="btn btn-secondary cancel-checkout">Cancel</button>
                    <button type="submit" class="btn btn-primary confirm-order">Complete Order</button>
                </div>
            </form>
        </div>
    `;
    
    // Add checkout container to the page
    document.body.appendChild(checkoutContainer);
    document.body.classList.add('checkout-active');
    
    // Add event listeners for checkout form
    document.querySelector('.close-checkout').addEventListener('click', closeCheckout);
    document.querySelector('.cancel-checkout').addEventListener('click', closeCheckout);
    
    // Toggle payment method details
    const paymentMethods = document.querySelectorAll('input[name="paymentMethod"]');
    paymentMethods.forEach(method => {
        method.addEventListener('change', togglePaymentDetails);
    });
    
    // Handle form submission
    document.getElementById('checkoutForm').addEventListener('submit', function(e) {
        e.preventDefault();
        processOrder();
    });
}

// Toggle payment details based on selected payment method
function togglePaymentDetails() {
    const creditCardDetails = document.getElementById('creditCardDetails');
    const selectedMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    
    if (selectedMethod === 'creditCard') {
        creditCardDetails.style.display = 'block';
        creditCardDetails.querySelectorAll('input').forEach(input => input.setAttribute('required', ''));
    } else {
        creditCardDetails.style.display = 'none';
        creditCardDetails.querySelectorAll('input').forEach(input => input.removeAttribute('required'));
    }
}

// Close checkout form
function closeCheckout() {
    const checkoutContainer = document.querySelector('.checkout-container');
    if (checkoutContainer) {
        checkoutContainer.remove();
        document.body.classList.remove('checkout-active');
    }
}

// Process the order
function processOrder() {
    // Get form data
    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('email').value;
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    
    // Display loading state
    const confirmBtn = document.querySelector('.confirm-order');
    const originalText = confirmBtn.textContent;
    confirmBtn.disabled = true;
    confirmBtn.textContent = 'Processing...';
    
    // Simulate order processing
    setTimeout(() => {
        // Close checkout form
        closeCheckout();
        
        // Clear cart
        cart = [];
        saveCart();
        
        if (document.getElementById('cartItems')) {
            renderCart();
        }
        updateCartCounter();
        
        // Show order confirmation
        showOrderConfirmation(fullName, email, paymentMethod);
        
        // Reset button state
        confirmBtn.disabled = false;
        confirmBtn.textContent = originalText;
    }, 1500);
}

// Show order confirmation message
function showOrderConfirmation(name, email, paymentMethod) {
    const confirmationContainer = document.createElement('div');
    confirmationContainer.className = 'order-confirmation';
    
    // Create confirmation message
    confirmationContainer.innerHTML = `
        <div class="confirmation-message">
            <span class="close-confirmation">&times;</span>
            <div class="confirmation-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
            </div>
            <h2>Order Confirmed!</h2>
            <p>Thank you for your purchase, ${name}!</p>
            <p>We've sent a confirmation email to ${email}.</p>
            <p>Payment Method: ${paymentMethod === 'creditCard' ? 'Credit Card' : 
                              paymentMethod === 'paypal' ? 'PayPal' : 'Cash on Delivery'}</p>
            <p>Your order will be shipped within 2-3 business days.</p>
            <button class="btn btn-primary continue-shopping">Continue Shopping</button>
        </div>
    `;
    
    // Add confirmation to the page
    document.body.appendChild(confirmationContainer);
    
    // Add event listeners
    document.querySelector('.close-confirmation').addEventListener('click', closeConfirmation);
    document.querySelector('.continue-shopping').addEventListener('click', function() {
        closeConfirmation();
        // Redirect to products page
        window.location.href = 'index.html';
    });
}

// Close confirmation message
function closeConfirmation() {
    const confirmationContainer = document.querySelector('.order-confirmation');
    if (confirmationContainer) {
        confirmationContainer.remove();
    }
}

// Execute when DOM is loaded
document.addEventListener('DOMContentLoaded', initCart);