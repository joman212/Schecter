(function() {
  'use strict';
  
  if (window._schecterInitialized) return;
  window._schecterInitialized = true;

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
    const totalCount = cart.reduce((sum, item) => sum + (parseInt(item.quantity) || 1), 0);
    document.querySelectorAll('.cart-count, #cart-count, [data-cart-badge]').forEach(badge => {
      badge.textContent = totalCount;
      badge.style.display = totalCount > 0 ? 'inline-block' : 'none';
    });
  };

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
    if (typeof window.renderCartDisplay === 'function') window.renderCartDisplay();
    updateCartBadge();
  };
  
  window.changeQuantity = function(index, delta) {
    let cart = getCart();
    if (!cart[index]) return;
    cart[index].quantity = Math.max(1, (parseInt(cart[index].quantity) || 1) + delta);
    saveCart(cart);
    if (typeof window.renderCartDisplay === 'function') window.renderCartDisplay();
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
  
  function initImageGallery() {
    const galleries = document.querySelectorAll('.image-gallery');
    
    galleries.forEach(gallery => {
      const mainImage = gallery.querySelector('.main-image img');
      const thumbnails = gallery.querySelectorAll('.thumbnails img');
      
      if (!mainImage || thumbnails.length === 0) return;
      
      if (thumbnails[0]) {
        thumbnails[0].classList.add('active');
      }
      
      thumbnails.forEach(thumb => {
        thumb.addEventListener('click', function() {
          const newSrc = this.dataset.full || this.src;
          
          mainImage.style.opacity = '0';
          
          setTimeout(() => {
            mainImage.src = newSrc;
            mainImage.onload = () => {
              mainImage.style.opacity = '1';
            };
          }, 300);
          
          thumbnails.forEach(t => t.classList.remove('active'));
          this.classList.add('active');
        });
      });
    });
  }
  
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
    (function() {
      const loginForm = document.getElementById('loginForm');
      const messageEl = document.getElementById('loginMessage');
      
      if (!loginForm) return;
      
      loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const remember = document.getElementById('remember').checked;
        
        if (!email || !password) {
          showMessage('Please fill in all fields', 'error');
          return;
        }
        
        if (!isValidEmail(email)) {
          showMessage('Please enter a valid email address', 'error');
          return;
        }
        
        const users = JSON.parse(localStorage.getItem('schecterUsers')) || [];
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
          if (remember) {
            localStorage.setItem('schecterCurrentUser', JSON.stringify({
              email: user.email,
              name: user.name,
              remember: true
            }));
          } else {
            sessionStorage.setItem('schecterCurrentUser', JSON.stringify({
              email: user.email,
              name: user.name
            }));
          }
          
          showMessage('Login successful! Redirecting...', 'success');
          
          setTimeout(() => {
            window.location.href = 'index.html';
          }, 1500);
        } else {
          showMessage('Invalid email or password', 'error');
        }
      });
      
      function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      }
      
      function showMessage(text, type) {
        messageEl.textContent = text;
        messageEl.className = 'auth-message ' + type;
        messageEl.style.display = 'block';
        
        if (type === 'success') {
          messageEl.style.color = '#28a745';
        } else {
          messageEl.style.color = '#dc3545';
        }
        
        setTimeout(() => {
          messageEl.style.display = 'none';
        }, 5000);
      }
      
      const currentUser = localStorage.getItem('schecterCurrentUser') || 
                         sessionStorage.getItem('schecterCurrentUser');
      if (currentUser) {
        window.location.href = 'index.html';
      }
    })();

    (function() {
      const signupForm = document.getElementById('signupForm');
      const messageEl = document.getElementById('signupMessage');
      
      if (!signupForm) return;
      
      signupForm.addEventListener('submit', function(e) {
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
        
        if (!isValidEmail(email)) {
          showMessage('Please enter a valid email address', 'error');
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
        const existingUser = users.find(u => u.email === email);
        
        if (existingUser) {
          showMessage('An account with this email already exists', 'error');
          return;
        }
        
        const newUser = {
          id: Date.now().toString(),
          firstName: firstName,
          lastName: lastName,
          email: email,
          password: password,
          createdAt: new Date().toISOString(),
          cart: []
        };
        
        users.push(newUser);
        localStorage.setItem('schecterUsers', JSON.stringify(users));
        
        localStorage.setItem('schecterCurrentUser', JSON.stringify({
          email: newUser.email,
          name: firstName + ' ' + lastName
        }));
        
        showMessage('Account created successfully! Redirecting...', 'success');
        
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1500);
      });
      
      function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      }
      
      function showMessage(text, type) {
        messageEl.textContent = text;
        messageEl.className = 'auth-message ' + type;
        messageEl.style.display = 'block';
        
        if (type === 'success') {
          messageEl.style.color = '#28a745';
        } else {
          messageEl.style.color = '#dc3545';
        }
        
        setTimeout(() => {
          messageEl.style.display = 'none';
        }, 5000);
      }
      
      const currentUser = localStorage.getItem('schecterCurrentUser') || 
                         sessionStorage.getItem('schecterCurrentUser');
      if (currentUser) {
        window.location.href = 'index.html';
      }
    })();

(function() {
  'use strict';
  
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
    window.location.href = 'login.html';
  };
  
  window.updateAuthNav = function() {
    const nav = document.querySelector('nav ul');
    if (!nav) return;
    
    const user = window.getCurrentUser();
    const signUpLink = nav.querySelector('a[href="signup.html"]');
    const signInLink = nav.querySelector('a[href="login.html"]');
    
    if (user) {
      if (signUpLink) signUpLink.textContent = 'My Account';
      if (signUpLink) signUpLink.href = '#';
      if (signInLink) {
        signInLink.textContent = 'Logout';
        signInLink.href = '#';
        signInLink.onclick = function(e) {
          e.preventDefault();
          window.logout();
        };
      }
    } else {
      if (signUpLink) signUpLink.textContent = 'Sign Up';
      if (signUpLink) signUpLink.href = 'signup.html';
      if (signInLink) {
        signInLink.textContent = 'Sign In';
        signInLink.href = 'login.html';
        signInLink.onclick = null;
      }
    }
  };
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.updateAuthNav);
  } else {
    window.updateAuthNav();
  }
})();

(function() {
  'use strict';
  
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
    window.location.href = 'index.html';
  };
  
  window.saveOrder = function(orderData) {
    const orders = JSON.parse(localStorage.getItem('schecterOrders')) || [];
    const newOrder = {
      id: Date.now().toString(),
      email: orderData.email,
      items: orderData.items,
      total: orderData.total,
      date: new Date().toISOString(),
      status: 'completed'
    };
    orders.push(newOrder);
    localStorage.setItem('schecterOrders', JSON.stringify(orders));
    return newOrder;
  };
  
  window.updateAuthNav = function() {
    const nav = document.querySelector('nav ul');
    if (!nav) return;
    
    const user = window.getCurrentUser();
    const signUpLink = nav.querySelector('a[href="signup.html"]');
    const signInLink = nav.querySelector('a[href="login.html"]');
    const authLink = document.getElementById('authLink');
    
    if (user) {
      if (signUpLink) {
        signUpLink.textContent = 'My Account';
        signUpLink.href = 'account.html';
      }
      if (authLink) {
        authLink.textContent = 'Sign Out';
        authLink.href = '#';
        authLink.onclick = function(e) {
          e.preventDefault();
          if (confirm('Are you sure you want to sign out?')) {
            window.logout();
          }
        };
      }
    } else {
      if (signUpLink) {
        signUpLink.textContent = 'Sign Up';
        signUpLink.href = 'signup.html';
      }
      if (authLink) {
        authLink.textContent = 'Sign In';
        authLink.href = 'login.html';
        authLink.onclick = null;
      }
    }
  };
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.updateAuthNav);
  } else {
    window.updateAuthNav();
  }
})();

    (function() {
      // Check if user is logged in
      const currentUser = localStorage.getItem('schecterCurrentUser') || 
                         sessionStorage.getItem('schecterCurrentUser');
      
      if (!currentUser) {
        // Not logged in, redirect to login
        window.location.href = 'login.html';
        return;
      }
      
      const userData = JSON.parse(currentUser);
      const allUsers = JSON.parse(localStorage.getItem('schecterUsers')) || [];
      const fullUser = allUsers.find(u => u.email === userData.email);
      
      // Update account info
      const initials = (userData.name || userData.email || 'U').charAt(0).toUpperCase();
      document.getElementById('accountInitials').textContent = initials;
      document.getElementById('accountEmail').textContent = userData.email || 'User';
      
      if (fullUser) {
        document.getElementById('profileName').textContent = fullUser.firstName + ' ' + fullUser.lastName || 'User';
        document.getElementById('profileEmail').textContent = fullUser.email;
        
        if (fullUser.createdAt) {
          const joinDate = new Date(fullUser.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short'
          });
          document.getElementById('profileMemberSince').textContent = joinDate;
          document.getElementById('memberSince').textContent = joinDate;
        }
      }
      
      // Update stats
      const cart = JSON.parse(localStorage.getItem('userCart')) || [];
      const cartCount = cart.reduce((sum, item) => sum + (parseInt(item.quantity) || 1), 0);
      document.getElementById('cartItems').textContent = cartCount;
      
      // Get orders from localStorage (demo)
      const orders = JSON.parse(localStorage.getItem('schecterOrders')) || [];
      const userOrders = orders.filter(o => o.email === userData.email);
      document.getElementById('totalOrders').textContent = userOrders.length;
      
      // Display recent orders
      const ordersList = document.getElementById('ordersList');
      if (userOrders.length > 0) {
        let ordersHTML = '';
        userOrders.slice(0, 5).forEach((order, index) => {
          const orderDate = new Date(order.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          });
          ordersHTML += `
            <div class="order-item">
              <div class="order-info">
                <span class="order-number">Order #${order.id || (1000 + index)}</span>
                <span class="order-date">${orderDate}</span>
              </div>
              <div class="order-total">$${(order.total || 0).toFixed(2)}</div>
              <div class="order-status status-completed">Completed</div>
            </div>
          `;
        });
        ordersList.innerHTML = ordersHTML;
      }
      
      // Display cart preview
      const cartPreview = document.getElementById('cartPreview');
      if (cart.length > 0) {
        let cartHTML = '';
        cart.slice(0, 3).forEach(item => {
          cartHTML += `
            <div class="cart-preview-item">
              <img src="${item.image || 'placeholder.jpg'}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/50'">
              <div class="cart-preview-info">
                <span class="cart-preview-name">${item.name}</span>
                <span class="cart-preview-qty">Qty: ${item.quantity}</span>
              </div>
              <span class="cart-preview-price">$${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</span>
            </div>
          `;
        });
        if (cart.length > 3) {
          cartHTML += `<p class="more-items">+${cart.length - 3} more items</p>`;
        }
        cartPreview.innerHTML = cartHTML;
      }
      
      // Sign out button
      const signOutBtn = document.getElementById('signOutBtn');
      if (signOutBtn) {
        signOutBtn.addEventListener('click', function() {
          if (confirm('Are you sure you want to sign out?')) {
            localStorage.removeItem('schecterCurrentUser');
            sessionStorage.removeItem('schecterCurrentUser');
            window.location.href = 'index.html';
          }
        });
      }
      
      // Update auth link in nav
      const authLink = document.getElementById('authLink');
      if (authLink) {
        authLink.textContent = 'Sign Out';
        authLink.href = '#';
        authLink.addEventListener('click', function(e) {
          e.preventDefault();
          if (confirm('Are you sure you want to sign out?')) {
            localStorage.removeItem('schecterCurrentUser');
            sessionStorage.removeItem('schecterCurrentUser');
            window.location.href = 'index.html';
          }
        });
      }
    })();