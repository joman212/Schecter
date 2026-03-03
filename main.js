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


// ============ AUTO-ADDED: Cart Event Listeners & Helpers ============
// Added by fix-cart.py on 2026-03-02T23:58:19.995335

(function() {
  if (window._cartListenersAttached) return;
  window._cartListenersAttached = true;

  function updateCartBadge() {
    try {
      const cart = JSON.parse(localStorage.getItem('userCart')) || [];
      const badges = document.querySelectorAll('.cart-count, #cart-count, [data-cart-badge]');
      const totalItems = cart.reduce((sum, item) => sum + (parseInt(item.quantity) || 1), 0);
      
      badges.forEach(badge => {
        badge.textContent = totalItems;
        badge.style.display = totalItems > 0 ? 'inline' : 'none';
      });
    } catch(e) {
      console.warn('updateCartBadge error:', e);
    }
  }

  function attachCartListeners() {
    const buttons = document.querySelectorAll('.add-to-cart, button[data-id]');
    
    buttons.forEach(btn => {
      if (btn._cartListenerAttached) return;
      btn._cartListenerAttached = true;
      
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const id = this.dataset.id;
        const name = this.dataset.name;
        const price = parseFloat(this.dataset.price);
        const image = this.dataset.image;
        const quantity = parseInt(this.dataset.quantity) || 1;
        
        if (!id || !name || isNaN(price)) {
          console.warn('Invalid cart data:', { id, name, price });
          return;
        }
        
        if (typeof addToCart === 'function') {
          addToCart(id, name, price, image, quantity);
          updateCartBadge();
          
          const originalText = this.textContent;
          this.textContent = '✓ Added!';
          this.disabled = true;
          setTimeout(() => {
            this.textContent = originalText;
            this.disabled = false;
          }, 1500);
        } else {
          console.error('addToCart function not found!');
        }
      });
    });
  }

  function renderCartDisplay() {
    if (typeof window.renderCartDisplay === 'function') {
      window.renderCartDisplay();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      attachCartListeners();
      updateCartBadge();
      renderCartDisplay();
    });
  } else {
    attachCartListeners();
    updateCartBadge();
    renderCartDisplay();
  }

  window._reinitCart = function() {
    attachCartListeners();
    updateCartBadge();
  };
})();
// ============ END AUTO-ADDED CODE ============
function addToCart(id, name, price, image, quantity = 1) {
  let cart = JSON.parse(localStorage.getItem('userCart')) || [];
  
  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.quantity = (parseInt(existing.quantity) || 1) + quantity;
  } else {
    cart.push({ id, name, price, image, quantity });
  }
  
  localStorage.setItem('userCart', JSON.stringify(cart));
  
  if (typeof updateCartBadge === 'function') updateCartBadge();
}

// Attach listeners to all add-to-cart buttons
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      addToCart(
        this.dataset.id,
        this.dataset.name,
        parseFloat(this.dataset.price),
        this.dataset.image,
        1
      );
      
      // Visual feedback
      const original = this.textContent;
      this.textContent = '✓ Added!';
      setTimeout(() => this.textContent = original, 1500);
    });
  });
});

// ============ CART FIX APPLIED ============
(function() {
  if (window._cartMainJSInitialized) return;
  window._cartMainJSInitialized = true;

  window.addToCart = function(id, name, price, image, quantity) {
    if (!id || !name) { console.error('Missing cart params'); return; }
    if (!quantity) quantity = 1;
    
    var numericPrice = parseFloat(price);
    if (isNaN(numericPrice)) { console.error('Invalid price:', price); return; }
    
    var cart = JSON.parse(localStorage.getItem('userCart')) || [];
    var existingIndex = -1;
    
    for (var i = 0; i < cart.length; i++) {
      if (cart[i].id === id) { existingIndex = i; break; }
    }
    
    if (existingIndex > -1) {
      cart[existingIndex].quantity = (parseInt(cart[existingIndex].quantity) || 1) + quantity;
    } else {
      cart.push({ id: id, name: name, price: numericPrice, image: image || '', quantity: quantity });
    }
    
    localStorage.setItem('userCart', JSON.stringify(cart));
    console.log('Cart updated:', cart);
    
    if (typeof window.updateCartBadge === 'function') window.updateCartBadge();
    return true;
  };

  function attachAddToCartListeners() {
    var buttons = document.querySelectorAll('.add-to-cart');
    
    for (var i = 0; i < buttons.length; i++) {
      (function(button) {
        var newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        
        newButton.addEventListener('click', function(e) {
          e.preventDefault();
          var id = this.dataset.id;
          var name = this.dataset.name;
          var price = this.dataset.price;
          var image = this.dataset.image;
          
          if (!id || !name || !price) { console.error('Missing data:', {id:id, name:name, price:price}); return; }
          
          var success = addToCart(id, name, price, image, 1);
          
          if (success) {
            var originalText = this.textContent;
            this.textContent = '✓ Added!';
            var self = this;
            setTimeout(function() { self.textContent = originalText; }, 1500);
          }
        });
      })(buttons[i]);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachAddToCartListeners);
  } else {
    attachAddToCartListeners();
  }
  
  window._reinitCartListeners = attachAddToCartListeners;
})();
// ============ CART FUNCTIONALITY (cart.html only) ============

(function() {
  // Only run on cart page
  if (!document.getElementById('cartContainer')) return;
  
  // Prevent duplicate initialization
  if (window._cartInitialized) return;
  window._cartInitialized = true;

  // Format price with commas: 1999.00 → "1,999.00"
  function formatPrice(price) {
    return parseFloat(price).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
  }

  // Render cart items from localStorage
  function renderCart() {
    var container = document.getElementById('cartContainer');
    var summary = document.getElementById('cartSummary');
    var totalEl = document.getElementById('cartTotal');
    
    if (!container) return;
    
    var cart = JSON.parse(localStorage.getItem('userCart')) || [];
    
    // Handle empty cart
    if (cart.length === 0) {
      container.innerHTML = '<div class="empty-cart"><p style="color: #E5E5E5;">Your cart is empty.</p><p><a href="products.html" style="color: #E76E24;">→ Continue Shopping</a></p></div>';
      if (summary) summary.style.display = 'none';
      updateCartBadge();
      return;
    }
    
    var html = '<div class="cart-items">';
    var total = 0;
    
    cart.forEach(function(item, index) {
      var price = parseFloat(item.price) || 0;
      var qty = parseInt(item.quantity) || 1;
      var itemTotal = price * qty;
      total += itemTotal;
      var imgSrc = item.image || 'placeholder.jpg';
      
      html += '<div class="cart-item" data-index="' + index + '">' +
        '<img src="' + imgSrc + '" alt="' + item.name + '" class="cart-item-image" onerror="this.src=\'https://via.placeholder.com/200\'">' +
        '<div class="cart-item-info">' +
          '<h3 style="color: #E5E5E5; margin: 0 0 10px 0;"><a href="' + item.id + '.html" style="color: #E5E5E5; text-decoration: none;">' + item.name + '</a></h3>' +
          '<div style="color: #D4AF37; font-size: 1.2rem; font-weight: bold; margin: 10px 0;">Price: $' + formatPrice(price) + '</div>' +
          '<div style="color: #E5E5E5; margin: 10px 0;">Quantity: ' + qty + '</div>' +
          '<div style="color: #D4AF37; font-size: 1.1rem; font-weight: bold; margin: 10px 0;">Subtotal: $' + formatPrice(itemTotal) + '</div>' +
          '<button class="remove-btn" data-index="' + index + '">Remove</button>' +
        '</div>' +
      '</div>';
    });
    
    html += '</div>';
    container.innerHTML = html;
    
    // Update total with commas
    if (totalEl) totalEl.textContent = formatPrice(total);
    if (summary) summary.style.display = 'block';
    
    // Attach remove button listeners
    document.querySelectorAll('.remove-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var index = parseInt(this.getAttribute('data-index'));
        var cart = JSON.parse(localStorage.getItem('userCart')) || [];
        cart.splice(index, 1);
        localStorage.setItem('userCart', JSON.stringify(cart));
        renderCart();
        updateCartBadge();
      });
    });
    
    updateCartBadge();
  }
  
  // Update cart badge count in navigation
  function updateCartBadge() {
    var cart = JSON.parse(localStorage.getItem('userCart')) || [];
    var badge = document.querySelector('.cart-count');
    var total = cart.reduce(function(sum, item) { return sum + (parseInt(item.quantity) || 1); }, 0);
    if (badge) {
      badge.textContent = total;
      badge.style.display = total > 0 ? 'inline-block' : 'none';
    }
  }
  
  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderCart);
  } else {
    renderCart();
  }
  
  // Expose for manual re-init if needed
  window._reinitCart = function() {
    renderCart();
    updateCartBadge();
  };
})();
// ============ END CART FUNCTIONALITY ============