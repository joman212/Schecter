const $ = id => document.getElementById(id);

function formatPrice(p) {
  return parseFloat(p).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function showMessage(el, text, type) {
  if (!el) return;
  el.textContent   = text;
  el.style.display = 'block';
  el.style.color   = type === 'success' ? '#28a745' : '#dc3545';
  setTimeout(() => { el.style.display = 'none'; }, 5000);
}

function rootPrefix() {
  return window.location.pathname.includes('/html/') ? '../' : '';
}

function getCart()   { return JSON.parse(localStorage.getItem('userCart')) || []; }
function saveCart(c) { localStorage.setItem('userCart', JSON.stringify(c)); }

function getCurrentUser() {
  const s = localStorage.getItem('schecterCurrentUser') || sessionStorage.getItem('schecterCurrentUser');
  return s ? JSON.parse(s) : null;
}

function logout() {
  localStorage.removeItem('schecterCurrentUser');
  sessionStorage.removeItem('schecterCurrentUser');
  updateAuthNav();
  updateCartBadge();
  if (window.location.href.includes('account.html')) window.location.href = '../index.html';
}

function openNav()  { $('myOffcanvasNav').style.width = '220px'; }
function closeNav() { $('myOffcanvasNav').style.width = '0px'; }

function updateAuthNav() {
  const user        = getCurrentUser();
  const prefix      = rootPrefix();
  const accountHref = prefix + 'html/account.html';
  const loginHref   = prefix + 'html/login.html';

  document.querySelectorAll('#myOffcanvasNav a').forEach(link => {
    const href = link.getAttribute('href') || '';
    if (!href.includes('login') && !href.includes('account')) return;
    link.textContent = user ? 'My Account' : 'Sign In';
    link.href        = user ? accountHref : loginHref;
  });

  document.querySelectorAll('[data-action="logout"], #signOutBtn, .logout-btn').forEach(btn => {
    btn.onclick = e => { e.preventDefault(); if (confirm('Are you sure you want to sign out?')) logout(); };
  });
}

function updateCartBadge() {
  const total = getCart().reduce((sum, i) => sum + (parseInt(i.quantity) || 1), 0);
  document.querySelectorAll('.cart-count, #cart-count, [data-cart-badge]').forEach(el => {
    el.textContent   = total;
    el.style.display = total > 0 ? 'inline-block' : 'none';
  });
}

function addToCart(id, name, price, image, quantity = 1) {
  if (!id || !name || isNaN(parseFloat(price))) return false;
  const cart = getCart();
  const idx  = cart.findIndex(i => i.id === id);
  if (idx > -1) cart[idx].quantity = (parseInt(cart[idx].quantity) || 1) + quantity;
  else cart.push({ id, name, price: parseFloat(price), image: image || '', quantity });
  saveCart(cart);
  updateCartBadge();
  return true;
}

function removeItem(index) {
  const cart = getCart();
  if (!cart[index]) return;
  cart.splice(index, 1);
  saveCart(cart);
  renderCartDisplay();
  updateCartBadge();
}

function changeQuantity(index, delta) {
  const cart = getCart();
  if (!cart[index]) return;
  cart[index].quantity = Math.max(1, (parseInt(cart[index].quantity) || 1) + delta);
  saveCart(cart);
  renderCartDisplay();
}

function renderCartDisplay() {
  const container = $('cartContainer');
  if (!container) return;

  const cart    = getCart();
  const summary = $('cartSummary');
  const totalEl = $('cartTotal');

  if (!cart.length) {
    container.innerHTML = '<div class="empty-cart"><p style="color:#E5E5E5">Your cart is empty.</p><p><a href="html/products.html" style="color:#E76E24">→ Continue Shopping</a></p></div>';
    if (summary) summary.style.display = 'none';
    if (totalEl) totalEl.textContent = '0.00';
    updateCartBadge();
    return;
  }

  let total = 0;
  container.innerHTML = '<div class="cart-items">' + cart.map((item, i) => {
    const price = parseFloat(item.price) || 0;
    const qty   = parseInt(item.quantity) || 1;
    total += price * qty;
    return `<div class="cart-item" data-index="${i}">
      <img src="${item.image || 'placeholder.jpg'}" alt="${item.name}" class="cart-item-image" onerror="this.src='https://via.placeholder.com/200'">
      <div class="cart-item-info">
        <h3><a href="${item.id}.html">${item.name}</a></h3>
        <div class="cart-item-price">Price: $${formatPrice(price)}</div>
        <div class="cart-item-quantity">Quantity: ${qty}</div>
        <div class="cart-item-price" style="margin-top:10px">Subtotal: $${formatPrice(price * qty)}</div>
        <button class="remove-btn" data-index="${i}">Remove</button>
      </div>
    </div>`;
  }).join('') + '</div>';

  if (totalEl) totalEl.textContent = formatPrice(total);
  if (summary) summary.style.display = 'block';

  container.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', function () { removeItem(parseInt(this.dataset.index)); });
  });

  updateCartBadge();
}

function initImageGallery() {
  document.querySelectorAll('.image-gallery').forEach(gallery => {
    const mainImg = gallery.querySelector('.main-image img');
    const thumbs  = gallery.querySelectorAll('.thumbnails img');
    if (!mainImg || !thumbs.length) return;

    thumbs[0].classList.add('active');
    thumbs.forEach(thumb => {
      thumb.addEventListener('click', function () {
        mainImg.style.opacity = '0';
        setTimeout(() => {
          mainImg.src    = this.dataset.full || this.src;
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
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      if (!addToCart(this.dataset.id, this.dataset.name, this.dataset.price, this.dataset.image, parseInt(this.dataset.quantity) || 1)) return;
      const orig = this.textContent;
      this.textContent = '✓ Added!';
      this.disabled    = true;
      setTimeout(() => { this.textContent = orig; this.disabled = false; }, 1500);
    });
  });
}

function initLoginForm() {
  const form = $('loginForm');
  const msg  = $('loginMessage');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const email    = $('email').value.trim();
    const password = $('password').value;
    const remember = $('remember').checked;

    if (!email || !password) return showMessage(msg, 'Please fill in all fields', 'error');

    const users = JSON.parse(localStorage.getItem('schecterUsers')) || [];
    const user  = users.find(u => u.email === email && u.password === password);
    if (!user) return showMessage(msg, 'Invalid email or password', 'error');

    const session = { email: user.email, name: user.firstName + ' ' + user.lastName };
    (remember ? localStorage : sessionStorage).setItem('schecterCurrentUser', JSON.stringify(session));
    showMessage(msg, 'Login successful! Redirecting...', 'success');
    setTimeout(() => { window.location.href = '../index.html'; }, 1500);
  });
}

function initSignupForm() {
  const form = $('signupForm');
  const msg  = $('signupMessage');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const firstName = $('firstName').value.trim();
    const lastName  = $('lastName').value.trim();
    const email     = $('email').value.trim();
    const password  = $('password').value;
    const confirm   = $('confirmPassword').value;

    if (!firstName || !lastName || !email || !password || !confirm) return showMessage(msg, 'Please fill in all fields', 'error');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))                  return showMessage(msg, 'Please enter a valid email', 'error');
    if (password.length < 6)                                          return showMessage(msg, 'Password must be at least 6 characters', 'error');
    if (password !== confirm)                                         return showMessage(msg, 'Passwords do not match', 'error');
    if (!$('terms').checked)                                          return showMessage(msg, 'Please agree to the Terms of Service', 'error');

    const users = JSON.parse(localStorage.getItem('schecterUsers')) || [];
    if (users.find(u => u.email === email)) return showMessage(msg, 'An account with this email already exists', 'error');

    users.push({ id: Date.now().toString(), firstName, lastName, email, password, createdAt: new Date().toISOString(), cart: [] });
    localStorage.setItem('schecterUsers', JSON.stringify(users));
    localStorage.setItem('schecterCurrentUser', JSON.stringify({ email, name: firstName + ' ' + lastName }));
    showMessage(msg, 'Account created! Redirecting...', 'success');
    setTimeout(() => { window.location.href = '../index.html'; }, 1500);
  });
}

function initAccountPage() {
  if (!window.location.href.includes('account.html')) return;

  const user = getCurrentUser();
  if (!user) { window.location.href = '../php/login.php'; return; }

  const allUsers = JSON.parse(localStorage.getItem('schecterUsers')) || [];
  const fullUser = allUsers.find(u => u.email === user.email) || {};
  const name     = user.name || (fullUser.firstName + ' ' + fullUser.lastName) || 'User';

  document.querySelectorAll('#accountEmail, #profileEmail').forEach(el => { el.textContent = user.email || '-'; });
  document.querySelectorAll('#profileName').forEach(el => { el.textContent = name; });

  const initialsEl = $('accountInitials');
  if (initialsEl) {
    const parts = name.trim().split(' ');
    initialsEl.textContent = ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase() || 'U';
  }

  const memberSince = fullUser.createdAt
    ? new Date(fullUser.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : '2026';
  document.querySelectorAll('#memberSince, #profileMemberSince').forEach(el => { el.textContent = memberSince; });

  const userCart = fullUser.cart || [];
  const cartEl   = $('cartItems');
  if (cartEl) cartEl.textContent = userCart.reduce((s, i) => s + (parseInt(i.quantity) || 1), 0);

  const ordersList = $('ordersList');
  if (ordersList) {
    const orders = fullUser.orders || [];
    ordersList.innerHTML = orders.length
      ? orders.slice(0, 3).map(o =>
          `<div class="order-item">
            <span class="order-id">#${o.id}</span>
            <span class="order-date">${new Date(o.date).toLocaleDateString()}</span>
            <span class="order-total">$${o.total || '0.00'}</span>
            <span class="order-status status-${o.status || 'pending'}">${o.status || 'Pending'}</span>
          </div>`).join('')
      : '<p class="no-orders">No orders yet. <a href="../html/products.html">Start shopping!</a></p>';
  }

  const cartPreview = $('cartPreview');
  if (cartPreview) {
    cartPreview.innerHTML = userCart.length
      ? userCart.slice(0, 2).map(item =>
          `<div class="cart-preview-item">
            <img src="${item.image || '../images/placeholder.jpg'}" alt="${item.name}" class="preview-img">
            <div class="preview-info">
              <p class="preview-name">${item.name}</p>
              <p class="preview-qty">Qty: ${item.quantity || 1}</p>
            </div>
            <span class="preview-price">$${(parseFloat(item.price) || 0).toFixed(2)}</span>
          </div>`).join('') + (userCart.length > 2 ? `<p class="preview-more">+ ${userCart.length - 2} more items</p>` : '')
      : '<p class="no-orders">Your cart is empty.</p>';
  }

  updateCartBadge();
}

function openModal() {
  const modal = $('promoModal');
  if (!modal) return;
  modal.style.display          = 'block';
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const modal = $('promoModal');
  if (!modal) return;
  modal.style.display          = 'none';
  document.body.style.overflow = '';
}

window.onclick = e => { if (e.target === $('promoModal')) closeModal(); };

let slideIndex = 0;
let autoSlideInterval;

function showSlide(index) {
  const slides = document.querySelectorAll('.carousel-slide');
  const dots   = document.querySelectorAll('.dot');
  if (!slides.length) return;
  slideIndex = (index + slides.length) % slides.length;
  slides.forEach((s, i) => s.classList.toggle('active', i === slideIndex));
  dots.forEach((d, i)   => d.classList.toggle('active', i === slideIndex));
}

function moveSlide(dir)   { showSlide(slideIndex + dir); resetAutoSlide(); }
function currentSlide(i)  { showSlide(i - 1); resetAutoSlide(); }
function startAutoSlide() { if (document.querySelectorAll('.carousel-slide').length) autoSlideInterval = setInterval(() => moveSlide(1), 5000); }
function resetAutoSlide() { clearInterval(autoSlideInterval); startAutoSlide(); }

document.addEventListener('DOMContentLoaded', function () {
  attachListeners();
  initImageGallery();
  initLoginForm();
  initSignupForm();
  initAccountPage();
  updateAuthNav();
  updateCartBadge();

  if ($('cartContainer')) renderCartDisplay();

  if (!sessionStorage.getItem('schecterModalSeen')) {
    const modal = $('promoModal');
    if (modal) { setTimeout(openModal, 1000); sessionStorage.setItem('schecterModalSeen', 'true'); }
  }

  const slides = document.querySelectorAll('.carousel-slide');
  if (slides.length) {
    showSlide(0);
    startAutoSlide();
    const carousel = document.querySelector('.carousel-container');
    if (carousel) {
      carousel.addEventListener('mouseenter', () => clearInterval(autoSlideInterval));
      carousel.addEventListener('mouseleave', startAutoSlide);
    }
  }

  const observer = new IntersectionObserver(
    entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
    { threshold: 0.1 }
  );
  document.querySelectorAll('.featured, .reviews, .bio, .featured-videos').forEach(el => observer.observe(el));
});