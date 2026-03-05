(function() {
  'use strict';
  
  // Prevent multiple initializations
  if (window._schecterInitialized) return;
  window._schecterInitialized = true;

  // ============ HELPER FUNCTIONS ============
  function formatPrice(price) {
    return parseFloat(price).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
  
  function getCart() {
    return JSON.parse(localStorage.getItem('userCart')) || [];
  }
  
  function saveCart(cart) {
    localStorage.setItem('userCart', JSON.stringify(cart));
  }
  
  // ============ CART BADGE ============
  window.updateCartBadge = function() {
    const cart = getCart();
    const totalCount = cart.reduce((sum, item) => sum + (parseInt(item.quantity) || 1), 0);
    document.querySelectorAll('.cart-count, #cart-count, [data-cart-badge]').forEach(badge => {
      badge.textContent = totalCount;
      badge.style.display = totalCount > 0 ? 'inline-block' : 'none';
    });
  };

  // ============ ADD TO CART ============
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
  
  // ============ REMOVE ITEM ============
  window.removeItem = function(index) {
    let cart = getCart();
    cart.splice(index, 1);
    saveCart(cart);
    if (typeof window.renderCartDisplay === 'function') window.renderCartDisplay();
    updateCartBadge();
  };
  
  // ============ CHANGE QUANTITY ============
  window.changeQuantity = function(index, delta) {
    let cart = getCart();
    if (!cart[index]) return;
    cart[index].quantity = Math.max(1, (parseInt(cart[index].quantity) || 1) + delta);
    saveCart(cart);
    if (typeof window.renderCartDisplay === 'function') window.renderCartDisplay();
    updateCartBadge();
  };
  
  // ============ RENDER CART DISPLAY ============
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
          '<div class="cart-item-quantity">Quantity: ' + qty + '</div>' +
          '<div class="cart-item-price" style="margin-top:10px;">Subtotal: $' + formatPrice(itemTotal) + '</div>' +
          '<button class="remove-btn" data-index="' + index + '">Remove</button>' +
        '</div>' +
      '</div>';
    });
    
    html += '</div>';
    container.innerHTML = html;
    if (totalEl) totalEl.textContent = formatPrice(total);
    if (summary) summary.style.display = 'block';
    
    document.querySelectorAll('.remove-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const index = parseInt(this.getAttribute('data-index'));
        window.removeItem(index);
      });
    });
    
    updateCartBadge();
  };
  
  // ============ ATTACH ADD TO CART LISTENERS ============
  function attachEventListeners() {
    document.querySelectorAll('.add-to-cart').forEach(btn => {
      if (btn._cartListenerAttached) return;
      btn._cartListenerAttached = true;
      
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        const success = window.addToCart(
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
  
  // ============ PRODUCT IMAGE GALLERY ============
  function initImageGallery() {
    const galleries = document.querySelectorAll('.image-gallery');
    
    galleries.forEach(gallery => {
      const mainImage = gallery.querySelector('.main-image img');
      const thumbnails = gallery.querySelectorAll('.thumbnails img');
      
      if (!mainImage || thumbnails.length === 0) return;
      
      // Set first thumbnail as active
      if (thumbnails[0]) {
        thumbnails[0].classList.add('active');
      }
      
      // Add click event to each thumbnail
      thumbnails.forEach(thumb => {
        thumb.addEventListener('click', function() {
          const newSrc = this.dataset.full || this.src;
          
          // Fade out
          mainImage.style.opacity = '0';
          
          setTimeout(() => {
            // Change image
            mainImage.src = newSrc;
            // Fade in when loaded
            mainImage.onload = () => {
              mainImage.style.opacity = '1';
            };
          }, 300);
          
          // Update active state
          thumbnails.forEach(t => t.classList.remove('active'));
          this.classList.add('active');
        });
      });
    });
  }
  
  // Keyboard navigation for gallery
  document.addEventListener('keydown', function(e) {
    const gallery = document.querySelector('.image-gallery');
    if (!gallery) return;
    
    const thumbnails = gallery.querySelectorAll('.thumbnails img');
    const active = gallery.querySelector('.thumbnails img.active');
    if (!active) return;
    
    const index = Array.from(thumbnails).indexOf(active);
    
    if (e.key === 'ArrowLeft' && index > 0) {
      thumbnails[index - 1].click();
    } else if (e.key === 'ArrowRight' && index < thumbnails.length - 1) {
      thumbnails[index + 1].click();
    }
  });
  
  // ============ INITIALIZATION ============
  function init() {
    attachEventListeners();
    updateCartBadge();
    initImageGallery();
    
    if (document.getElementById('cartContainer')) {
      window.renderCartDisplay();
    }
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  // Expose for manual re-init if needed
  window._reinitCart = function() {
    attachEventListeners();
    updateCartBadge();
    if (document.getElementById('cartContainer')) window.renderCartDisplay();
  };
  
  window._reinitGallery = initImageGallery;
})();

    (function() {
      const mainImage = document.getElementById('mainProductImage');
      const thumbnails = document.querySelectorAll('.thumbnails img');
      if (!mainImage || thumbnails.length === 0) return;
      thumbnails.forEach(function(thumb) {
        thumb.addEventListener('click', function() {
          const newSrc = this.dataset.full || this.src;
          mainImage.style.opacity = '0';
          setTimeout(function() {
            mainImage.src = newSrc;
            mainImage.onload = function() {
              mainImage.style.opacity = '1';
            };
          }, 300);
          thumbnails.forEach(function(t) { t.classList.remove('active'); });
          this.classList.add('active');
        });
      });
      if (thumbnails[0]) {
        thumbnails[0].classList.add('active');
      }
    })();
