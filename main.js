(function() {
  'use strict';
  
  if (window._schecterInitialized) return;
  window._schecterInitialized = true;

  window.isLoggedIn = function() {
    return !!(localStorage.getItem('schecterCurrentUser') || 
              sessionStorage.getItem('schecterCurrentUser'));
  };
  
  window.getCurrentUser = function() {
    const stored = localStorage.getItem('schecterCurrentUser') || 
                   sessionStorage.getItem('schecterCurrentUser');
    return stored ? JSON.parse(stored) : null;
  };
  
  window.logout = function() {
    localStorage.removeItem('schecterCurrentUser');
    sessionStorage.removeItem('schecterCurrentUser');
    if (window.location.href.includes('account.html') || 
        window.location.href.includes('logout.html')) {
      window.location.href = 'index.html';
    }
  };

  function formatPrice(price) {
    return parseFloat(price).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
  
  function getCart() {
    return JSON.parse(localStorage.getItem('userCart')) || [];
  }
  
  function saveCart(cart) {
    localStorage.setItem('userCart', JSON.stringify(cart));
  }

  window.updateCartBadge = function() {
    const cart = getCart();
    const total = cart.reduce((sum, item) => sum + (parseInt(item.quantity) || 1), 0);
    document.querySelectorAll('.cart-count, #cart-count, [data-cart-badge]').forEach(badge => {
      badge.textContent = total;
      badge.style.display = total > 0 ? 'inline-block' : 'none';
    });
  };

  window.addToCart = function(id, name, price, image, quantity = 1) {
    if (!id || !name) return false;
    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice)) return false;
    
    let cart = getCart();
    const idx = cart.findIndex(item => item.id === id);
    
    if (idx > -1) {
      cart[idx].quantity = (parseInt(cart[idx].quantity) || 1) + quantity;
    } else {
      cart.push({ id, name, price: numericPrice, image: image || '', quantity });
    }
    
    saveCart(cart);
    window.updateCartBadge();
    return true;
  };

  window.removeItem = function(index) {
    let cart = getCart();
    cart.splice(index, 1);
    saveCart(cart);
    if (typeof window.renderCartDisplay === 'function') window.renderCartDisplay();
    window.updateCartBadge();
  };
  
  window.changeQuantity = function(index, delta) {
    let cart = getCart();
    if (!cart[index]) return;
    cart[index].quantity = Math.max(1, (parseInt(cart[index].quantity) || 1) + delta);
    saveCart(cart);
    if (typeof window.renderCartDisplay === 'function') window.renderCartDisplay();
    window.updateCartBadge();
  };

  window.renderCartDisplay = function() {
    const container = document.getElementById('cartContainer');
    const summary = document.getElementById('cartSummary');
    const totalEl = document.getElementById('cartTotal');
    
    if (!container) return;
    const cart = getCart();
    
    if (cart.length === 0) {
      container.innerHTML = '<div class="empty-cart"><p style="color:#E5E5E5">Your cart is empty.</p><p><a href="products.html" style="color:#E76E24">→ Continue Shopping</a></p></div>';
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
      
      html += '<div class="cart-item" data-index="' + index + '">' +
        '<img src="' + (item.image || 'placeholder.jpg') + '" alt="' + item.name + '" class="cart-item-image" onerror="this.src=\'https://via.placeholder.com/200\'">' +
        '<div class="cart-item-info">' +
          '<h3><a href="' + item.id + '.html">' + item.name + '</a></h3>' +
          '<div class="cart-item-price">Price: $' + formatPrice(price) + '</div>' +
          '<div class="cart-item-quantity">Quantity: ' + qty + '</div>' +
          '<div class="cart-item-price" style="margin-top:10px">Subtotal: $' + formatPrice(itemTotal) + '</div>' +
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
        window.removeItem(parseInt(this.getAttribute('data-index')));
      });
    });
    
    window.updateCartBadge();
  };

  function initImageGallery() {
    document.querySelectorAll('.image-gallery').forEach(gallery => {
      const mainImg = gallery.querySelector('.main-image img');
      const thumbs = gallery.querySelectorAll('.thumbnails img');
      if (!mainImg || !thumbs.length) return;
      
      if (thumbs[0]) thumbs[0].classList.add('active');
      
      thumbs.forEach(thumb => {
        thumb.addEventListener('click', function() {
          const newSrc = this.dataset.full || this.src;
          mainImg.style.opacity = '0';
          setTimeout(() => {
            mainImg.src = newSrc;
            mainImg.onload = () => { mainImg.style.opacity = '1'; };
          }, 300);
          thumbs.forEach(t => t.classList.remove('active'));
          this.classList.add('active');
        });
      });
    });
  }

  window.updateAuthNav = function() {
    const user = window.getCurrentUser();
    
    const signUpLink = document.querySelector('a[href="signup.html"]');
    if (signUpLink) {
      if (user) {
        signUpLink.textContent = 'My Account';
        signUpLink.href = 'account.html';
        signUpLink.onclick = null;
      } else {
        signUpLink.textContent = 'Sign Up';
        signUpLink.href = 'signup.html';
        signUpLink.onclick = null;
      }
    }
    
    const authLink = document.getElementById('authLink');
    if (authLink) {
      if (user) {
        authLink.textContent = 'Sign Out';
        authLink.href = '#';
        authLink.onclick = function(e) {
          e.preventDefault();
          if (confirm('Sign out?')) {
            window.logout();
            window.location.reload();
          }
        };
      } else {
        authLink.textContent = 'Sign In';
        authLink.href = 'login.html';
        authLink.onclick = null;
      }
    }
  };

  function attachListeners() {
    document.querySelectorAll('.add-to-cart').forEach(btn => {
      if (btn._attached) return;
      btn._attached = true;
      
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
          const orig = this.textContent;
          this.textContent = '✓ Added!';
          this.disabled = true;
          setTimeout(() => { this.textContent = orig; this.disabled = false; }, 1500);
        }
      });
    });
    
    window.updateAuthNav();
  }

  function init() {
    attachListeners();
    initImageGallery();
    window.updateCartBadge();
    if (document.getElementById('cartContainer')) window.renderCartDisplay();
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  window._reinit = function() { 
    attachListeners(); 
    window.updateCartBadge(); 
    if (document.getElementById('cartContainer')) window.renderCartDisplay(); 
  };
})();

    (function() {
      const form = document.getElementById('loginForm');
      const msg = document.getElementById('loginMessage');
      if (!form) return;
      
      form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const remember = document.getElementById('remember').checked;
        
        if (!email || !password) {
          showMessage('Please fill in all fields', 'error');
          return;
        }
        
        const users = JSON.parse(localStorage.getItem('schecterUsers')) || [];
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
          const sessionData = { email: user.email, name: user.firstName + ' ' + user.lastName };
          if (remember) {
            localStorage.setItem('schecterCurrentUser', JSON.stringify(sessionData));
          } else {
            sessionStorage.setItem('schecterCurrentUser', JSON.stringify(sessionData));
          }
          
          showMessage('Login successful! Redirecting...', 'success');
          setTimeout(() => { window.location.href = 'index.html'; }, 1500);
        } else {
          showMessage('Invalid email or password', 'error');
        }
      });
      
      function showMessage(text, type) {
        msg.textContent = text;
        msg.className = 'auth-message ' + type;
        msg.style.display = 'block';
        msg.style.color = type === 'success' ? '#28a745' : '#dc3545';
        setTimeout(() => { msg.style.display = 'none'; }, 5000);
      }
      
    })();

        (function() {
      const form = document.getElementById('signupForm');
      const msg = document.getElementById('signupMessage');
      if (!form) return;
      
      form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const firstName = document.getElementById('firstName').value.trim();
        const lastName = document.getElementById('lastName').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const terms = document.getElementById('terms').checked;
        
        if (!firstName || !lastName || !email || !password || !confirmPassword) {
          showMessage('Please fill in all fields', 'error');
          return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          showMessage('Please enter a valid email', 'error');
          return;
        }
        if (password.length < 6) {
          showMessage('Password must be at least 6 characters', 'error');
          return;
        }
        if (password !== confirmPassword) {
          showMessage('Passwords do not match', 'error');
          return;
        }
        if (!terms) {
          showMessage('Please agree to the Terms of Service', 'error');
          return;
        }
        
        const users = JSON.parse(localStorage.getItem('schecterUsers')) || [];
        if (users.find(u => u.email === email)) {
          showMessage('An account with this email already exists', 'error');
          return;
        }
        
        const newUser = {
          id: Date.now().toString(),
          firstName, lastName, email, password,
          createdAt: new Date().toISOString(),
          cart: []
        };
        users.push(newUser);
        localStorage.setItem('schecterUsers', JSON.stringify(users));
        
        localStorage.setItem('schecterCurrentUser', JSON.stringify({
          email: newUser.email,
          name: firstName + ' ' + lastName
        }));
        
        showMessage('Account created! Redirecting...', 'success');
        setTimeout(() => { window.location.href = 'index.html'; }, 1500);
      });
      
      function showMessage(text, type) {
        msg.textContent = text;
        msg.className = 'auth-message ' + type;
        msg.style.display = 'block';
        msg.style.color = type === 'success' ? '#28a745' : '#dc3545';
        setTimeout(() => { msg.style.display = 'none'; }, 5000);
      }
      
    })();

      const signOutBtn = document.getElementById('signOutBtn');
  if (signOutBtn) {
    signOutBtn.addEventListener('click', function() {
      window.location.href = 'logout.html';
    });
  }
  
  const authLink = document.getElementById('authLink');
  if (authLink) {
    authLink.addEventListener('click', function(e) {
      e.preventDefault();
      window.location.href = 'logout.html';
    });
  }