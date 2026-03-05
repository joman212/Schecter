(function() {
  'use strict';
  
  if (window._schecterCartInitialized) return;
  window._schecterCartInitialized = true;

  function formatPrice(price) {
    return parseFloat(price).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
  
  function getCart() {
    return JSON.parse(localStorage.getItem('userCart')) || [];
  }
  
  function saveCart(cart) {
    localStorage.setItem('userCart', JSON.stringify(cart));
  }
  
  function updateCartBadge() {
    const cart = getCart();
    const totalCount = cart.reduce((sum, item) => sum + (parseInt(item.quantity) || 1), 0);
    document.querySelectorAll('.cart-count, #cartCount, [data-cart-badge]').forEach(badge => {
      badge.textContent = totalCount;
      badge.style.display = totalCount > 0 ? 'inline-block' : 'none';
    });
  }

  window.addToCart = function(itemId, itemName, itemPrice, itemImage, quantity = 1) {
    if (!itemId || !itemName) return false;
    const price = parseFloat(itemPrice);
    if (isNaN(price)) return false;
    
    let cart = getCart();
    const existingIndex = cart.findIndex(item => item.id === itemId);
    
    if (existingIndex > -1) {
      cart[existingIndex].quantity = (parseInt(cart[existingIndex].quantity) || 1) + quantity;
    } else {
      cart.push({
        id: itemId,
        name: itemName,
        price: price,
        image: itemImage || '',
        quantity: quantity
      });
    }
    
    saveCart(cart);
    updateCartBadge();
    return true;
  };
  
  window.removeItem = function(index) {
    let cart = getCart();
    cart.splice(index, 1);
    saveCart(cart);
    renderCartDisplay();
    updateCartBadge();
  };
  
  window.changeQuantity = function(index, delta) {
    let cart = getCart();
    if (!cart[index]) return;
    cart[index].quantity = Math.max(1, (parseInt(cart[index].quantity) || 1) + delta);
    saveCart(cart);
    renderCartDisplay();
    updateCartBadge();
  };
  
  window.renderCartDisplay = function() {
    const container = document.getElementById('cartContainer');
    const summary = document.getElementById('cartSummary');
    const totalEl = document.getElementById('cartTotal');
    
    if (!container) return;
    const cart = getCart();
    
    if (cart.length === 0) {
      container.innerHTML = '<div class="empty-cart"><p style="color: #E5E5E5;">Your cart is empty.</p><p><a href="products.html" style="color: #E76E24;">→ Continue Shopping</a></p></div>';
      if (summary) summary.style.display = 'none';
      if (totalEl) totalEl.textContent = '0.00';
      return;
    }
    
    let html = '<div class="cart-items">';
    let total = 0;
    
    cart.forEach((item, index) => {
      const price = parseFloat(item.price) || 0;
      const qty = parseInt(item.quantity) || 1;
      const itemTotal = price * qty;
      total += itemTotal;
      const imgSrc = item.image || 'placeholder.jpg';
      
      html += '<div class="cart-item" data-index="' + index + '">' +
        '<img src="' + imgSrc + '" alt="' + item.name + '" class="cart-item-image" onerror="this.src=\'https://via.placeholder.com/200?text=No+Image\'">' +
        '<div class="cart-item-info">' +
          '<h3><a href="' + item.id + '.html">' + item.name + '</a></h3>' +
          '<div class="cart-item-price">Price: $' + formatPrice(price) + '</div>' +
          '<div class="cart-item-quantity">' +
            '<button onclick="changeQuantity(' + index + ', -1)" class="qty-btn">−</button>' +
            '<span>' + qty + '</span>' +
            '<button onclick="changeQuantity(' + index + ', 1)" class="qty-btn">+</button>' +
          '</div>' +
          '<div class="cart-item-price" style="margin-top:10px;">Subtotal: $' + formatPrice(itemTotal) + '</div>' +
          '<button class="remove-btn" onclick="removeItem(' + index + ')">Remove</button>' +
        '</div>' +
      '</div>';
    });
    
    html += '</div>';
    container.innerHTML = html;
    if (totalEl) totalEl.textContent = formatPrice(total);
    if (summary) summary.style.display = 'block';
    updateCartBadge();
  };
  
  window.submitOrder = function() {
    const cart = getCart();
    if (cart.length === 0) {
      alert('Your cart is empty!');
      return;
    }
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const orderDetails = cart.map(i => '• ' + i.name + ' × ' + i.quantity + ' - $' + formatPrice(i.price * i.quantity)).join('\n');
    
    if (confirm('🎸 Confirm Your Order\n\n' + orderDetails + '\n\n💰 Total: $' + formatPrice(total) + '\n\nThis is a demo - no payment will be processed.')) {
      localStorage.removeItem('userCart');
      updateCartBadge();
      renderCartDisplay();
      window.location.href = 'thank.html';
    }
  };
  
  function attachEventListeners() {
    document.querySelectorAll('.add-to-cart').forEach(btn => {
      if (btn._cartListenerAttached) return;
      btn._cartListenerAttached = true;
      
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        const success = addToCart(
          this.dataset.id,
          this.dataset.name,
          this.dataset.price,
          this.dataset.image,
          parseInt(this.dataset.quantity) || 1
        );
        if (success) {
          const originalText = this.textContent;
          this.textContent = '✓ Added!';
          this.disabled = true;
          setTimeout(() => {
            this.textContent = originalText;
            this.disabled = false;
          }, 1500);
        }
      });
    });
  }
  
  function init() {
    attachEventListeners();
    updateCartBadge();
    if (document.getElementById('cartContainer')) {
      renderCartDisplay();
    }
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  window._reinitCart = function() {
    attachEventListeners();
    updateCartBadge();
    if (document.getElementById('cartContainer')) renderCartDisplay();
  };
})();