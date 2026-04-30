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

  function showMessage(element, text, type) {
    if (!element) return;
    element.textContent = text;
    element.className = 'auth-message ' + type;
    element.style.display = 'block';
    element.style.color = type === 'success' ? '#28a745' : '#dc3545';
    setTimeout(() => { element.style.display = 'none'; }, 5000);
  }

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
    
    if (typeof window.updateAuthNav === 'function') {
      window.updateAuthNav();
    }
    if (typeof window.updateCartBadge === 'function') {
      window.updateCartBadge();
    }
    
    if (window.location.href.includes('html/account.html')) {
      window.location.href = '../index.html';
    }
  };

  window.updateAuthNav = function() {
    const user = window.getCurrentUser();
    
    document.querySelectorAll('#myOffcanvasNav a').forEach(function(link) {
      var href = link.getAttribute('href') || '';
      if (href.indexOf('html/login.html') !== -1 || href.indexOf('html/signup.html') !== -1) {
        if (user) {
          link.textContent = 'My Account';
          link.href = 'html/account.html';
        } else {
          if (href.indexOf('html/signup.html') !== -1) {
            link.textContent = 'Sign Up';
            link.href = 'html/signup.html';
          } else {
            link.textContent = 'Sign In';
            link.href = 'html/login.html';
          }
        }
        link.onclick = null;
      }
    });
    
    var authLink = document.getElementById('authLink');
    if (authLink) {
      if (user) {
        authLink.textContent = 'My Account';
        authLink.href = 'html/account.html';
        authLink.onclick = null;
      } else {
        authLink.textContent = 'Sign In';
        authLink.href = 'html/login.html';
        authLink.onclick = null;
      }
    }
    
    document.querySelectorAll('[data-action="logout"], #signOutBtn, .logout-btn').forEach(function(btn) {
      btn.onclick = function(e) {
        e.preventDefault();
        if (confirm('Are you sure you want to sign out?')) {
          window.logout();
        }
      };
    });
  };

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
  };
  
  window.changeQuantity = function(index, delta) {
    let cart = getCart();
    if (!cart[index]) return;
    cart[index].quantity = Math.max(1, (parseInt(cart[index].quantity) || 1) + delta);
    saveCart(cart);
    if (typeof window.renderCartDisplay === 'function') window.renderCartDisplay();
  };

  window.renderCartDisplay = function() {
    const container = document.getElementById('cartContainer');
    const summary = document.getElementById('cartSummary');
    const totalEl = document.getElementById('cartTotal');
    
    if (!container) return;
    
    const cart = getCart();
    
    if (cart.length === 0) {
      container.innerHTML = '<div class="empty-cart"><p style="color:#E5E5E5">Your cart is empty.</p><p><a href="html/products.html" style="color:#E76E24">→ Continue Shopping</a></p></div>';
      if (summary) summary.style.display = 'none';
      if (totalEl) totalEl.textContent = '0.00';
      window.updateCartBadge();
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
    if (document.getElementById('cartContainer')) window.renderCartDisplay(); 
  };

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
        showMessage(msg, 'Please fill in all fields', 'error');
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
        
        showMessage(msg, 'Login successful! Redirecting...', 'success');
        setTimeout(() => { 
          window.location.href = '../index.html'; 
        }, 1500);
      } else {
        showMessage(msg, 'Invalid email or password', 'error');
      }
    });
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
        showMessage(msg, 'Please fill in all fields', 'error');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showMessage(msg, 'Please enter a valid email', 'error');
        return;
      }
      if (password.length < 6) {
        showMessage(msg, 'Password must be at least 6 characters', 'error');
        return;
      }
      if (password !== confirmPassword) {
        showMessage(msg, 'Passwords do not match', 'error');
        return;
      }
      if (!terms) {
        showMessage(msg, 'Please agree to the Terms of Service', 'error');
        return;
      }
      
      const users = JSON.parse(localStorage.getItem('schecterUsers')) || [];
      if (users.find(u => u.email === email)) {
        showMessage(msg, 'An account with this email already exists', 'error');
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
      
      showMessage(msg, 'Account created! Redirecting...', 'success');
      setTimeout(() => { window.location.href = '../index.html'; }, 1500);
    });
  })();

})();

function initAccountPage() {
  if (!window.location.href.includes('account.html')) return;
  
  const user = window.getCurrentUser();
  
  if (!user) {
    window.location.href = 'login.html';
    return;
  }
  
  const allUsers = JSON.parse(localStorage.getItem('schecterUsers')) || [];
  const fullUser = allUsers.find(u => u.email === user.email) || {};
  
  
  const emailEls = document.querySelectorAll('#accountEmail, #profileEmail');
  emailEls.forEach(el => { if (el) el.textContent = user.email || '-'; });
  
  const name = user.name || (fullUser.firstName + ' ' + fullUser.lastName) || 'User';
  const nameEls = document.querySelectorAll('#profileName');
  nameEls.forEach(el => { if (el) el.textContent = name; });
  
  const initialsEl = document.getElementById('accountInitials');
  if (initialsEl && name) {
    const names = name.trim().split(' ');
    const initials = (names[0]?.[0] || '') + (names[1]?.[0] || '');
    initialsEl.textContent = initials.toUpperCase() || 'U';
  }
  
  const memberSince = fullUser.createdAt ? new Date(fullUser.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '2026';
  const memberEls = document.querySelectorAll('#memberSince, #profileMemberSince');
  memberEls.forEach(el => { if (el) el.textContent = memberSince; });
  
  
  const userCart = fullUser.cart || window.getCart?.() || [];
  const cartCount = userCart.reduce((sum, item) => sum + (parseInt(item.quantity) || 1), 0);
  
  const cartEl = document.getElementById('cartItems');
  if (cartEl) cartEl.textContent = cartCount;
  
  
  const ordersList = document.getElementById('ordersList');
  if (ordersList) {
    const userOrders = fullUser.orders || [];
    
    if (userOrders.length === 0) {
      ordersList.innerHTML = '<p class="no-orders">No orders yet. <a href="products.html">Start shopping!</a></p>';
    } else {
      let html = '';
      userOrders.slice(0, 3).forEach(order => {
        html += '<div class="order-item">' +
          '<span class="order-id">#' + order.id + '</span>' +
          '<span class="order-date">' + new Date(order.date).toLocaleDateString() + '</span>' +
          '<span class="order-total">$' + (order.total || '0.00') + '</span>' +
          '<span class="order-status status-' + (order.status || 'pending') + '">' + (order.status || 'Pending') + '</span>' +
        '</div>';
      });
      ordersList.innerHTML = html;
    }
  }
    
  const cartPreview = document.getElementById('cartPreview');
  if (cartPreview && userCart.length > 0) {
    let html = '';
    userCart.slice(0, 2).forEach(item => {
      html += '<div class="cart-preview-item">' +
        '<img src="' + (item.image || '../images/placeholder.jpg') + '" alt="' + item.name + '" class="preview-img">' +
        '<div class="preview-info">' +
          '<p class="preview-name">' + item.name + '</p>' +
          '<p class="preview-qty">Qty: ' + (item.quantity || 1) + '</p>' +
        '</div>' +
        '<span class="preview-price">$' + (parseFloat(item.price) || 0).toFixed(2) + '</span>' +
      '</div>';
    });
    if (userCart.length > 2) {
      html += '<p class="preview-more">+ ' + (userCart.length - 2) + ' more items</p>';
    }
    cartPreview.innerHTML = html;
  }
  
  
  const signOutBtn = document.getElementById('signOutBtn');
  if (signOutBtn) {
    signOutBtn.onclick = function(e) {
      e.preventDefault();
      if (confirm('Are you sure you want to sign out?')) {
        window.logout();
        if (typeof window.updateAuthNav === 'function') {
          window.updateAuthNav();
        }
        window.location.href = '../index.html';
      }
    };
  }
  
  if (typeof window.updateCartBadge === 'function') {
    window.updateCartBadge();
  }
}

document.addEventListener('DOMContentLoaded', function() {
  initAccountPage();
});

function openNav() {
  document.getElementById("myOffcanvasNav").style.width = "220px";
}

function closeNav() {
  document.getElementById("myOffcanvasNav").style.width = "0px";
}

function openModal() {
  document.getElementById("promoModal").style.display = "block";
  document.body.style.overflow = "hidden";
}

function closeModal() {
  document.getElementById("promoModal").style.display = "none";
  document.body.style.overflow = "";
}

window.onclick = function(event) {
  const modal = document.getElementById("promoModal");
  if (event.target === modal) {
    closeModal();
  }
}

document.addEventListener('DOMContentLoaded', function() {
  const hasSeenModal = sessionStorage.getItem('schecterModalSeen');
  if (!hasSeenModal) {
    setTimeout(openModal, 1000);
    sessionStorage.setItem('schecterModalSeen', 'true');
  }
});

let slideIndex = 0;

function showSlide(index) {
  const slides = document.querySelectorAll('.carousel-slide');
  const dots = document.querySelectorAll('.dot');
  
  if (!slides.length) return;  

  if (index >= slides.length) slideIndex = 0;
  else if (index < 0) slideIndex = slides.length - 1;
  else slideIndex = index;
  
  slides.forEach((slide, i) => {
    slide.classList.toggle('active', i === slideIndex);
  });
  
  dots.forEach((dot, i) => {
    dot.classList.toggle('active', i === slideIndex);
  });
}

function moveSlide(direction) {
  showSlide(slideIndex + direction);
  resetAutoSlide();
}

function currentSlide(index) {
  showSlide(index - 1);   
  resetAutoSlide();
}

let autoSlideInterval;

function startAutoSlide() {
  const slides = document.querySelectorAll('.carousel-slide');
  if (!slides.length) return;
  
  autoSlideInterval = setInterval(() => {
    moveSlide(1);
  }, 5000);
}

function resetAutoSlide() {
  clearInterval(autoSlideInterval);
  startAutoSlide();
}

document.addEventListener('DOMContentLoaded', function() {
  const slides = document.querySelectorAll('.carousel-slide');
  if (slides.length > 0) {
    showSlide(0);
    startAutoSlide();
    
    const carousel = document.querySelector('.carousel-container');
    if (carousel) {
      carousel.addEventListener('mouseenter', () => clearInterval(autoSlideInterval));
      carousel.addEventListener('mouseleave', startAutoSlide);
    }
  }
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.featured, .reviews, .bio, .featured-videos')
  .forEach(el => observer.observe(el));

window.animateCarouselSlide = function(direction) {
  const track = document.querySelector('.carousel-track');
  const slides = document.querySelectorAll('.carousel-slide');
  const activeSlide = document.querySelector('.carousel-slide.active');
  
  if (!activeSlide) return;
  
  activeSlide.classList.add('fade-out');
  
  setTimeout(() => {
    const currentIndex = Array.from(slides).indexOf(activeSlide);
    let nextIndex = direction === 'next' 
      ? (currentIndex + 1) % slides.length 
      : (currentIndex - 1 + slides.length) % slides.length;
    
    const nextSlide = slides[nextIndex];
    
    activeSlide.classList.remove('active', 'fade-out');
    nextSlide.classList.add('active');
    
    if (direction === 'next') {
      nextSlide.classList.add('slide-next');
    } else {
      nextSlide.classList.add('slide-prev');
    }
    
    document.querySelectorAll('.dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === nextIndex);
    });
    
    setTimeout(() => {
      nextSlide.classList.remove('slide-next', 'slide-prev');
    }, 500);
    
  }, 300);
};