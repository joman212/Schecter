let cartMemory = JSON.parse(localStorage.getItem('userCart')) || [];

function addToCart(itemId, itemName, itemPrice, itemImage) {
    let itemFound = false;
    
    for (let i = 0; i < cartMemory.length; i++) {
        if (cartMemory[i].id === itemId) {
            cartMemory[i].quantity += 1;
            itemFound = true;
            break;
        }
    }
    
    if (!itemFound) {
        cartMemory.push({
            id: itemId,
            name: itemName,
            price: itemPrice,
            image: itemImage,
            quantity: 1
        });
    }
    
    localStorage.setItem('userCart', JSON.stringify(cartMemory));
    alert(itemName + ' added successfully.');
}

function renderCartDisplay() {
    let containerBox = document.getElementById('cartContainer');
    let totalBox = document.getElementById('cartTotal');
    
    if (!containerBox || !totalBox) return;
    
    containerBox.innerHTML = '';
    let finalCost = 0;
    
    cartMemory.forEach(function(item, index) {
        let costMultiplier = item.price * item.quantity;
        finalCost += costMultiplier;
        
        let itemRow = document.createElement('div');
        itemRow.className = 'cartRow';
        itemRow.innerHTML = `
            <img src="${item.image}" alt="${item.name}" style="width:60px; height:auto;">
            <h4>${item.name}</h4>
            <p>$${item.price} x ${item.quantity}</p>
            <button onclick="removeItem(${index})">Remove</button>
        `;
        containerBox.appendChild(itemRow);
    });
    
    totalBox.innerText = 'Total: $' + finalCost.toFixed(2);
}

function removeItem(index) {
    cartMemory.splice(index, 1);
    localStorage.setItem('userCart', JSON.stringify(cartMemory));
    renderCartDisplay();
}

function submitOrder() {
    if (cartMemory.length === 0) {
        alert('Your cart is empty.');
        return;
    }
    
    const dashChar = String.fromCharCode(45);
    const headerKey = 'Content' + dashChar + 'Type';
    
    fetch('checkout.php', {
        method: 'POST',
        headers: {
            [headerKey]: 'application/json'
        },
        body: JSON.stringify(cartMemory)
    })
    .then(response => response.json())
    .then(data => {
        if(data.status === 'success') {
            localStorage.removeItem('userCart');
            cartMemory = [];
            renderCartDisplay();
            alert(data.message);
        } else {
            alert('Error processing order.');
        }
    })
    .catch(error => {
        console.error('Submission failed', error);
    });
}
// Add this to main.js - runs when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Attach click handlers to all "Add to Cart" buttons
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            addToCart(
                this.dataset.id,
                this.dataset.name,
                parseFloat(this.dataset.price),
                this.dataset.image
            );
            updateCartBadge(); // Optional: update cart icon counter
        });
    });
    
    // Initialize cart display if on cart page
    if (document.getElementById('cartContainer')) {
        renderCartDisplay();
    }
    
    // Initialize cart badge if cart icon exists
    updateCartBadge();
});
function updateCartBadge() {
    const cart = JSON.parse(localStorage.getItem('userCart')) || [];
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    // Create or update badge on cart icon
    let badge = document.querySelector('.cart-badge');
    if (!badge) {
        badge = document.createElement('span');
        badge.className = 'cart-badge';
        badge.style.cssText = 'position:absolute;top:-5px;right:-5px;background:red;color:white;border-radius:50%;padding:2px 6px;font-size:10px;';
        const cartLink = document.querySelector('a[href="cart.html"]');
        if (cartLink) {
            cartLink.style.position = 'relative';
            cartLink.appendChild(badge);
        }
    }
    badge.textContent = totalCount > 99 ? '99+' : totalCount;
    badge.style.display = totalCount > 0 ? 'inline-block' : 'none';
}

// ============= CART FUNCTIONALITY (Auto-added by fix_cart.py) =============

// Add item to cart with quantity support
function addToCart(itemId, itemName, itemPrice, itemImage, quantity = 1) {
    let cart = JSON.parse(localStorage.getItem('userCart')) || [];
    
    // Check if item already exists in cart
    const existingItem = cart.find(item => item.id === itemId);
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: itemId,
            name: itemName,
            price: parseFloat(itemPrice),
            image: itemImage,
            quantity: quantity
        });
    }
    
    localStorage.setItem('userCart', JSON.stringify(cart));
    updateCartBadge();
    
    // Show feedback
    const btn = event?.target;
    if (btn) {
        const originalText = btn.textContent;
        btn.textContent = '✓ Added!';
        btn.style.background = '#28a745';
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = '';
        }, 1500);
    }
    
    console.log(`Added ${itemName} to cart`);
    return cart;
}

// Remove item from cart by index
function removeItem(index) {
    let cart = JSON.parse(localStorage.getItem('userCart')) || [];
    cart.splice(index, 1);
    localStorage.setItem('userCart', JSON.stringify(cart));
    renderCartDisplay();
    updateCartBadge();
}

// Change item quantity in cart
function changeQuantity(index, delta) {
    let cart = JSON.parse(localStorage.getItem('userCart')) || [];
    if (cart[index]) {
        cart[index].quantity += delta;
        if (cart[index].quantity <= 0) {
            cart.splice(index, 1);
        }
        localStorage.setItem('userCart', JSON.stringify(cart));
        renderCartDisplay();
        updateCartBadge();
    }
}

// Render cart items on cart.html
function renderCartDisplay() {
    const containerBox = document.getElementById('cartContainer');
    const totalBox = document.getElementById('cartTotal');
    
    if (!containerBox || !totalBox) return;
    
    containerBox.innerHTML = '';
    let finalCost = 0;
    
    const cartMemory = JSON.parse(localStorage.getItem('userCart')) || [];
    
    if (cartMemory.length === 0) {
        containerBox.innerHTML = '<p style="text-align:center;padding:20px;color:#666">Your cart is empty. <a href="index.html" style="color:#007bff">Continue shopping</a></p>';
        totalBox.innerText = 'Total: $0.00';
        document.querySelector('.checkout-btn')?.setAttribute('disabled', 'true');
        return;
    }
    
    cartMemory.forEach(function(item, index) {
        const itemTotal = item.price * item.quantity;
        finalCost += itemTotal;
        
        const itemRow = document.createElement('div');
        itemRow.className = 'cart-item';
        itemRow.style.cssText = 'display:flex;align-items:center;gap:15px;margin:15px 0;padding:15px;background:#f8f9fa;border-radius:8px;';
        itemRow.innerHTML = `
            <img src="${item.image}" alt="${item.name}" style="width:80px;height:60px;object-fit:cover;border-radius:4px;">
            <div style="flex:1;min-width:0">
                <h4 style="margin:0 0 5px 0;font-size:16px">${item.name}</h4>
                <p style="margin:0;color:#666;font-size:14px">$${item.price.toFixed(2)} each</p>
            </div>
            <div style="display:flex;align-items:center;gap:8px">
                <button onclick="changeQuantity(${index}, -1)" style="width:30px;height:30px;border:1px solid #ddd;background:white;border-radius:4px;cursor:pointer;font-weight:bold">-</button>
                <span style="min-width:20px;text-align:center;font-weight:500">${item.quantity}</span>
                <button onclick="changeQuantity(${index}, 1)" style="width:30px;height:30px;border:1px solid #ddd;background:white;border-radius:4px;cursor:pointer;font-weight:bold">+</button>
            </div>
            <div style="font-weight:600;width:90px;text-align:right;font-size:16px">$${itemTotal.toFixed(2)}</div>
            <button onclick="removeItem(${index})" style="background:#dc3545;color:white;border:none;padding:8px 12px;border-radius:4px;cursor:pointer;font-size:14px">Remove</button>
        `;
        containerBox.appendChild(itemRow);
    });
    
    totalBox.innerText = 'Total: $' + finalCost.toFixed(2);
    document.querySelector('.checkout-btn')?.removeAttribute('disabled');
}

// Update cart badge counter on navigation
function updateCartBadge() {
    const cart = JSON.parse(localStorage.getItem('userCart')) || [];
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    // Find all cart links and add/update badge
    document.querySelectorAll('a[href="cart.html"], a[href="./cart.html"]').forEach(link => {
        link.style.position = 'relative';
        let badge = link.querySelector('.cart-badge');
        if (!badge) {
            badge = document.createElement('span');
            badge.className = 'cart-badge';
            badge.style.cssText = 'position:absolute;top:-8px;right:-8px;background:#dc3545;color:white;border-radius:50%;padding:3px 7px;font-size:11px;font-weight:bold;min-width:18px;text-align:center;line-height:1;';
            link.appendChild(badge);
        }
        badge.textContent = totalCount > 99 ? '99+' : totalCount;
        badge.style.display = totalCount > 0 ? 'inline-block' : 'none';
    });
}

// Submit order (frontend demo)
function submitOrder() {
    const cart = JSON.parse(localStorage.getItem('userCart')) || [];
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const orderDetails = cart.map(i => `• ${i.name} × ${i.quantity} - $${(i.price * i.quantity).toFixed(2)}`).join('\n');
    
    if (confirm(`🎸 Confirm Your Order\n\n${orderDetails}\n\n💰 Total: $${total.toFixed(2)}\n\nThis is a demo - no payment will be processed.`)) {
        localStorage.removeItem('userCart');
        updateCartBadge();
        window.location.href = 'thank.html';
    }
}

// Initialize cart functionality when DOM loads
document.addEventListener('DOMContentLoaded', function() {
    // Attach "Add to Cart" handlers to all buttons with data attributes
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            addToCart(
                this.dataset.id,
                this.dataset.name,
                this.dataset.price,
                this.dataset.image,
                parseInt(this.dataset.quantity) || 1
            );
        });
    });
    
    // Initialize cart display if on cart page
    if (document.getElementById('cartContainer')) {
        renderCartDisplay();
    }
    
    // Initialize badge on all pages
    updateCartBadge();
    
    // Auto-render cart if container exists
    const cartContainer = document.getElementById('cartContainer');
    if (cartContainer && typeof renderCartDisplay === 'function') {
        renderCartDisplay();
    }
});
