/* ============================================================
   FORGE FITNESS PLATFORM — MAIN JAVASCRIPT
   ============================================================ */

'use strict';

/* ============================================================
   GLOBAL STATE & CONSTANTS
   ============================================================ */
const APP = {
  data: null,
  cart: JSON.parse(localStorage.getItem('forge_cart') || '[]'),
  foodLog: JSON.parse(localStorage.getItem('forge_foodlog') || '[]'),
  registeredGyms: JSON.parse(localStorage.getItem('forge_gyms') || '[]'),
  sellerProducts: JSON.parse(localStorage.getItem('forge_products') || '[]'),
};

/* ============================================================
   UTILITY FUNCTIONS
   ============================================================ */

/** Show a toast notification */
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer') || createToastContainer();
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icon = type === 'success' ? '✓' : '✕';
  toast.innerHTML = `<span class="toast-icon">${icon}</span><span class="toast-message">${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function createToastContainer() {
  const c = document.createElement('div');
  c.id = 'toastContainer';
  c.className = 'toast-container';
  document.body.appendChild(c);
  return c;
}

/** Generate star rating HTML */
function renderStars(rating) {
  let stars = '';
  for (let i = 1; i <= 5; i++) {
    stars += i <= Math.floor(rating)
      ? '<span class="star">★</span>'
      : (i - rating < 1 ? '<span class="star" style="opacity:0.5">★</span>' : '<span class="empty-star">★</span>');
  }
  return stars;
}

/** Format currency */
function formatPrice(n) {
  return '₦' + n.toLocaleString('en-NG');
}

/** Load data from JSON */
async function loadData() {
  if (APP.data) return APP.data;
  try {
    const res = await fetch('data/sample-data.json');
    APP.data = await res.json();
    return APP.data;
  } catch (e) {
    console.error('Could not load data:', e);
    return { gyms: [], workouts: [], equipment: [], products: [] };
  }
}

/** Save to localStorage helpers */
function saveCart() { localStorage.setItem('forge_cart', JSON.stringify(APP.cart)); }
function saveFoodLog() { localStorage.setItem('forge_foodlog', JSON.stringify(APP.foodLog)); }
function saveGyms() { localStorage.setItem('forge_gyms', JSON.stringify(APP.registeredGyms)); }
function saveProducts() { localStorage.setItem('forge_products', JSON.stringify(APP.sellerProducts)); }

/* ============================================================
   NAVIGATION
   ============================================================ */
function initNav() {
  const hamburger = document.querySelector('.nav-hamburger');
  const mobileMenu = document.querySelector('.nav-mobile-menu');
  const mobileLinks = document.querySelectorAll('.nav-mobile-link');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      mobileMenu.classList.toggle('open');
      document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
    });
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // Update cart badge
  updateCartBadge();

  // Set active nav link
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    if (link.getAttribute('href') === page) link.classList.add('active');
  });
}

function updateCartBadge() {
  const badge = document.querySelector('.cart-badge-count');
  if (badge) {
    badge.textContent = APP.cart.length;
    badge.style.display = APP.cart.length ? 'flex' : 'none';
  }
}

/* ============================================================
   HOMEPAGE — GYM CARDS
   ============================================================ */
async function initHomePage() {
  const featuredGrid = document.getElementById('featuredGyms');
  if (!featuredGrid) return;

  const data = await loadData();
  // Combine stored gyms + sample gyms
  const allGyms = [...data.gyms, ...APP.registeredGyms];
  const featured = allGyms.slice(0, 6);

  featuredGrid.innerHTML = '';
  featuredGrid.className = 'grid-3 stagger';

  featured.forEach(gym => {
    featuredGrid.innerHTML += buildGymCard(gym);
  });

  // Search from hero
  const heroSearch = document.getElementById('heroSearch');
  if (heroSearch) {
    heroSearch.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const q = heroSearch.value.trim();
        if (q) window.location.href = `gyms.html?q=${encodeURIComponent(q)}`;
        else window.location.href = 'gyms.html';
      }
    });
  }

  const heroSearchBtn = document.getElementById('heroSearchBtn');
  if (heroSearchBtn) {
    heroSearchBtn.addEventListener('click', () => {
      const q = document.getElementById('heroSearch')?.value.trim();
      window.location.href = q ? `gyms.html?q=${encodeURIComponent(q)}` : 'gyms.html';
    });
  }
}

function buildGymCard(gym) {
  const imgSrc = gym.image || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80';
  const tags = (gym.tags || []).map(t => `<span class="tag">${t}</span>`).join('');
  const priceLabel = gym.price || gym.pricing || 'Contact for price';

  return `
    <div class="gym-card">
      <div class="gym-card-img-wrapper">
        <img src="${imgSrc}" alt="${gym.name}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80'">
        <span class="gym-card-badge">${gym.priceRange || '$$'}</span>
      </div>
      <div class="gym-card-body">
        <h3 class="gym-card-name">${gym.name}</h3>
        <p class="gym-card-location">📍 ${gym.location || gym.address || 'Lagos, Nigeria'}</p>
        <div class="gym-card-meta">
          <div class="rating">
            <span class="rating-stars">${renderStars(gym.rating || 4.5)}</span>
            <span class="rating-score">${gym.rating || 4.5}</span>
            <span class="rating-count">(${gym.reviews || 0})</span>
          </div>
          <span class="price-tag">${priceLabel}</span>
        </div>
        <div class="gym-card-tags">${tags}</div>
        <div class="gym-card-footer">
          <button class="btn btn-primary btn-full" onclick="viewGym(${gym.id || 0})">View Gym →</button>
        </div>
      </div>
    </div>`;
}

function viewGym(id) {
  window.location.href = `gyms.html#gym-${id}`;
}

/* ============================================================
   GYM FINDER PAGE
   ============================================================ */
async function initGymsPage() {
  const gymsGrid = document.getElementById('gymsGrid');
  if (!gymsGrid) return;

  const data = await loadData();
  const allGyms = [...data.gyms, ...APP.registeredGyms];

  // Check URL params
  const params = new URLSearchParams(window.location.search);
  const q = params.get('q') || '';
  const searchInput = document.getElementById('gymSearch');
  if (searchInput && q) searchInput.value = q;

  // Initial render
  renderGyms(allGyms, q);

  // Map pins
  renderMapPins(allGyms);

  // Search
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const query = searchInput.value.toLowerCase();
      const filtered = allGyms.filter(g =>
        g.name.toLowerCase().includes(query) ||
        (g.location || '').toLowerCase().includes(query) ||
        (g.address || '').toLowerCase().includes(query)
      );
      renderGyms(filtered, searchInput.value);
    });
  }

  // Filter tabs
  document.querySelectorAll('.filter-tab[data-filter]').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.filter-tab[data-filter]').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const filter = tab.dataset.filter;
      const query = searchInput?.value || '';
      let filtered = allGyms.filter(g =>
        g.name.toLowerCase().includes(query.toLowerCase()) ||
        (g.location || '').toLowerCase().includes(query.toLowerCase())
      );
      if (filter !== 'all') {
        filtered = filtered.filter(g =>
          (g.priceRange === filter) ||
          (g.tags || []).some(t => t.toLowerCase().includes(filter.toLowerCase()))
        );
      }
      renderGyms(filtered, query);
    });
  });
}

function renderGyms(gyms, query = '') {
  const grid = document.getElementById('gymsGrid');
  const countEl = document.getElementById('gymCount');
  if (!grid) return;

  if (countEl) countEl.textContent = `${gyms.length} gym${gyms.length !== 1 ? 's' : ''} found`;

  if (!gyms.length) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <div class="empty-state-icon">🏋️</div>
        <h3 class="empty-state-title">No gyms found</h3>
        <p class="empty-state-desc">Try adjusting your search or filters.</p>
      </div>`;
    return;
  }

  grid.className = 'grid-3 stagger';
  grid.innerHTML = gyms.map(g => buildGymCard(g)).join('');
}

function renderMapPins(gyms) {
  const mapEl = document.querySelector('.map-mock');
  if (!mapEl) return;

  const positions = [
    { top: '30%', left: '25%' }, { top: '55%', left: '60%' },
    { top: '20%', left: '70%' }, { top: '70%', left: '35%' },
    { top: '45%', left: '80%' }, { top: '60%', left: '15%' },
  ];

  gyms.slice(0, 6).forEach((gym, i) => {
    const pos = positions[i] || { top: `${20 + i * 12}%`, left: `${20 + i * 12}%` };
    const pin = document.createElement('div');
    pin.className = 'map-pin';
    pin.style.cssText = `top:${pos.top};left:${pos.left};`;
    pin.innerHTML = `<span class="map-pin-label">${gym.name}</span>`;
    pin.title = gym.name;
    mapEl.appendChild(pin);
  });
}

/* ============================================================
   WORKOUT LIBRARY PAGE
   ============================================================ */
async function initWorkoutLibrary() {
  const grid = document.getElementById('workoutsGrid');
  if (!grid) return;

  const data = await loadData();
  const workouts = data.workouts || [];

  renderWorkouts(workouts, 'all');

  // Muscle filter tabs
  document.querySelectorAll('.filter-tab[data-muscle]').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.filter-tab[data-muscle]').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const muscle = tab.dataset.muscle;
      const filtered = muscle === 'all' ? workouts : workouts.filter(w => w.muscle.toLowerCase() === muscle.toLowerCase());
      renderWorkouts(filtered, muscle);
    });
  });

  // Search
  const searchEl = document.getElementById('workoutSearch');
  if (searchEl) {
    searchEl.addEventListener('input', () => {
      const q = searchEl.value.toLowerCase();
      const filtered = workouts.filter(w =>
        w.name.toLowerCase().includes(q) ||
        w.muscle.toLowerCase().includes(q)
      );
      renderWorkouts(filtered, 'search');
    });
  }
}

function renderWorkouts(workouts, filter) {
  const grid = document.getElementById('workoutsGrid');
  const countEl = document.getElementById('workoutCount');
  if (!grid) return;

  if (countEl) countEl.textContent = `${workouts.length} exercise${workouts.length !== 1 ? 's' : ''}`;

  if (!workouts.length) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <div class="empty-state-icon">💪</div>
        <h3 class="empty-state-title">No exercises found</h3>
        <p class="empty-state-desc">Try a different muscle group.</p>
      </div>`;
    return;
  }

  grid.className = 'grid-3 stagger';
  grid.innerHTML = workouts.map(w => buildWorkoutCard(w)).join('');

  // Attach expand listeners
  grid.querySelectorAll('.workout-card').forEach(card => {
    card.addEventListener('click', () => {
      const detail = card.querySelector('.workout-detail');
      if (!detail) return;
      const isOpen = detail.classList.contains('open');
      // Close all
      document.querySelectorAll('.workout-detail.open').forEach(d => d.classList.remove('open'));
      if (!isOpen) detail.classList.add('open');
    });
  });
}

function buildWorkoutCard(w) {
  return `
    <div class="workout-card">
      <img class="workout-card-img" src="${w.image}" alt="${w.name}" loading="lazy"
        onerror="this.src='https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80'">
      <div class="workout-card-body">
        <span class="workout-card-muscle">${w.muscle}</span>
        <h3 class="workout-card-name">${w.name}</h3>
        <p class="workout-card-desc">${w.description}</p>
        <div class="workout-card-level">
          <span>🎯</span> <span>${w.level}</span>
          <span style="margin-left:auto;font-size:0.75rem;color:var(--text-muted)">Click to expand →</span>
        </div>
        <div class="workout-detail">
          <div class="detail-section">
            <div class="detail-label">✅ Perfect Form</div>
            <div class="detail-text">${w.form}</div>
          </div>
          <div class="detail-section">
            <div class="detail-label">⚠️ Common Mistakes</div>
            <div class="detail-mistake">${w.mistakes}</div>
          </div>
        </div>
      </div>
    </div>`;
}

/* ============================================================
   EQUIPMENT GUIDE PAGE
   ============================================================ */
async function initEquipmentPage() {
  const grid = document.getElementById('equipmentGrid');
  if (!grid) return;

  const data = await loadData();
  const equipment = data.equipment || [];

  renderEquipment(equipment);

  document.querySelectorAll('.filter-tab[data-cat]').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.filter-tab[data-cat]').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const cat = tab.dataset.cat;
      const filtered = cat === 'all' ? equipment : equipment.filter(e => e.category.toLowerCase() === cat.toLowerCase());
      renderEquipment(filtered);
    });
  });
}

function renderEquipment(equipment) {
  const grid = document.getElementById('equipmentGrid');
  if (!grid) return;

  grid.className = 'grid-3 stagger';
  grid.innerHTML = equipment.map(e => `
    <div class="equipment-card">
      <img class="equipment-card-img" src="${e.image}" alt="${e.name}" loading="lazy"
        onerror="this.src='https://images.unsplash.com/photo-1576678927484-cc907957088c?w=400&q=80'">
      <div class="equipment-card-body">
        <span class="equipment-card-cat">${e.category}</span>
        <h3 class="equipment-card-name">${e.name}</h3>
        <p class="equipment-card-muscles">🎯 Trains: <strong>${e.muscles}</strong></p>
        <div class="equipment-info-block">
          <div class="equipment-info-label">How To Use</div>
          <div class="equipment-info-text">${e.howToUse}</div>
        </div>
        <div class="safety-block">
          <div class="safety-label">⚠️ Safety Tips</div>
          <div class="equipment-info-text">${e.safetyTips}</div>
        </div>
      </div>
    </div>`).join('');
}

/* ============================================================
   DIET TRACKER PAGE
   ============================================================ */
function initDietTracker() {
  const form = document.getElementById('dietForm');
  const resultsEl = document.getElementById('dietResults');
  if (!form) return;

  // Load food log
  renderFoodLog();

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const weight = parseFloat(form.weight.value);
    const height = parseFloat(form.height.value);
    const age = parseInt(form.age.value);
    const gender = form.gender.value;
    const goal = form.goal.value;

    if (!weight || !height || !age) { showToast('Please fill all fields.', 'error'); return; }

    // Mifflin-St Jeor BMR
    let bmr = gender === 'male'
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161;

    let tdee = bmr * 1.55; // Moderate activity
    let calories, protein, carbs, fat, label;

    switch (goal) {
      case 'lose':
        calories = Math.round(tdee - 500);
        protein = Math.round(weight * 2.2);
        fat = Math.round(calories * 0.25 / 9);
        carbs = Math.round((calories - protein * 4 - fat * 9) / 4);
        label = 'Cut (Fat Loss)';
        break;
      case 'build':
        calories = Math.round(tdee + 300);
        protein = Math.round(weight * 2.5);
        fat = Math.round(calories * 0.25 / 9);
        carbs = Math.round((calories - protein * 4 - fat * 9) / 4);
        label = 'Bulk (Muscle Gain)';
        break;
      default:
        calories = Math.round(tdee);
        protein = Math.round(weight * 2.0);
        fat = Math.round(calories * 0.3 / 9);
        carbs = Math.round((calories - protein * 4 - fat * 9) / 4);
        label = 'Maintenance';
    }

    const bmi = (weight / ((height / 100) ** 2)).toFixed(1);
    let bmiLabel = bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese';

    document.getElementById('resultCals').textContent = calories;
    document.getElementById('resultProtein').textContent = protein + 'g';
    document.getElementById('resultCarbs').textContent = carbs + 'g';
    document.getElementById('resultFat').textContent = fat + 'g';
    document.getElementById('resultBMI').textContent = bmi;
    document.getElementById('resultBMILabel').textContent = bmiLabel;
    document.getElementById('resultGoalLabel').textContent = label;

    // Macro bars
    const total = protein * 4 + carbs * 4 + fat * 9;
    document.getElementById('proteinBar').style.width = ((protein * 4 / total) * 100) + '%';
    document.getElementById('carbsBar').style.width = ((carbs * 4 / total) * 100) + '%';
    document.getElementById('fatBar').style.width = ((fat * 9 / total) * 100) + '%';

    document.getElementById('barProteinLabel').innerHTML = `Protein <strong>${protein}g</strong>`;
    document.getElementById('barCarbsLabel').innerHTML = `Carbs <strong>${carbs}g</strong>`;
    document.getElementById('barFatLabel').innerHTML = `Fats <strong>${fat}g</strong>`;

    // Workout recs
    const workoutRec = document.getElementById('workoutRec');
    if (workoutRec) {
      const recs = {
        lose: '🏃 Cardio 4x/week + Strength training 3x/week. HIIT sessions recommended.',
        build: '🏋️ Strength training 5x/week (PPL split). Cardio 2x/week for health.',
        maintain: '⚖️ Balanced: Strength 3x/week + Cardio 2x/week. Active lifestyle.',
      };
      workoutRec.textContent = recs[goal];
    }

    // Store target calories in food log
    localStorage.setItem('forge_target_cals', calories);
    updateFoodLogTarget();

    if (resultsEl) resultsEl.classList.add('visible');
    resultsEl?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    showToast('Nutrition plan calculated! 🎯');
  });

  // Food log
  const addFoodBtn = document.getElementById('addFoodBtn');
  if (addFoodBtn) {
    addFoodBtn.addEventListener('click', addFoodItem);
  }
}

function addFoodItem() {
  const name = document.getElementById('foodName')?.value.trim();
  const cals = parseFloat(document.getElementById('foodCals')?.value);
  const protein = parseFloat(document.getElementById('foodProtein')?.value || 0);

  if (!name || !cals) { showToast('Enter food name and calories.', 'error'); return; }

  const item = { id: Date.now(), name, calories: cals, protein: protein || 0 };
  APP.foodLog.push(item);
  saveFoodLog();
  renderFoodLog();

  document.getElementById('foodName').value = '';
  document.getElementById('foodCals').value = '';
  if (document.getElementById('foodProtein')) document.getElementById('foodProtein').value = '';
}

function removeFoodItem(id) {
  APP.foodLog = APP.foodLog.filter(i => i.id !== id);
  saveFoodLog();
  renderFoodLog();
}

function renderFoodLog() {
  const list = document.getElementById('foodLogList');
  const totalCalsEl = document.getElementById('totalCals');
  const totalProteinEl = document.getElementById('totalProtein');
  if (!list) return;

  const totalCals = APP.foodLog.reduce((s, i) => s + i.calories, 0);
  const totalProtein = APP.foodLog.reduce((s, i) => s + i.protein, 0);

  if (totalCalsEl) totalCalsEl.textContent = Math.round(totalCals) + ' kcal';
  if (totalProteinEl) totalProteinEl.textContent = Math.round(totalProtein) + 'g protein';

  if (!APP.foodLog.length) {
    list.innerHTML = `<div class="empty-state" style="padding:2rem">
      <div class="empty-state-icon">🍽️</div>
      <p class="empty-state-desc">No meals logged yet. Start adding above.</p>
    </div>`;
    return;
  }

  list.innerHTML = APP.foodLog.map(item => `
    <div class="food-log-item">
      <div>
        <div class="food-log-item-name">${item.name}</div>
        <div class="food-log-item-meta">${item.protein}g protein</div>
      </div>
      <div style="display:flex;align-items:center;gap:1rem">
        <span class="food-log-item-cals">${item.calories} kcal</span>
        <span class="food-log-item-del" onclick="removeFoodItem(${item.id})">✕</span>
      </div>
    </div>`).join('');

  updateFoodLogTarget();
}

function updateFoodLogTarget() {
  const target = localStorage.getItem('forge_target_cals');
  const totalCals = APP.foodLog.reduce((s, i) => s + i.calories, 0);
  const targetEl = document.getElementById('caloriesRemaining');
  if (targetEl && target) {
    const remaining = Math.round(target - totalCals);
    targetEl.textContent = remaining >= 0 ? `${remaining} kcal remaining` : `${Math.abs(remaining)} kcal over target`;
    targetEl.style.color = remaining < 0 ? 'var(--accent-red)' : 'var(--accent)';
  }
}

/* ============================================================
   FITNESS PLANNER / BODY GOAL
   ============================================================ */
function initFitnessPlanner() {
  // Handled within diet tracker — same logic
}

/* ============================================================
   MARKETPLACE PAGE
   ============================================================ */
async function initMarketplace() {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;

  const data = await loadData();
  const allProducts = [...data.products, ...APP.sellerProducts];

  renderProducts(allProducts, 'all');

  document.querySelectorAll('.filter-tab[data-category]').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.filter-tab[data-category]').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const cat = tab.dataset.category;
      const filtered = cat === 'all' ? allProducts : allProducts.filter(p => p.category.toLowerCase() === cat.toLowerCase());
      renderProducts(filtered, cat);
    });
  });

  // Search
  const searchEl = document.getElementById('productSearch');
  if (searchEl) {
    searchEl.addEventListener('input', () => {
      const q = searchEl.value.toLowerCase();
      const filtered = allProducts.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.seller.toLowerCase().includes(q)
      );
      renderProducts(filtered, 'search');
    });
  }

  // Cart modal
  initCartModal();
}

function renderProducts(products, cat) {
  const grid = document.getElementById('productsGrid');
  const countEl = document.getElementById('productCount');
  if (!grid) return;

  if (countEl) countEl.textContent = `${products.length} product${products.length !== 1 ? 's' : ''}`;

  if (!products.length) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
      <div class="empty-state-icon">🛍️</div>
      <h3 class="empty-state-title">No products found</h3>
      <p class="empty-state-desc">Try a different category or search term.</p>
    </div>`;
    return;
  }

  grid.className = 'grid-4 stagger';
  grid.innerHTML = products.map(p => buildProductCard(p)).join('');
}

function buildProductCard(p) {
  const imgSrc = p.image || 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400&q=80';
  const isNew = Date.now() - (p.addedAt || 0) < 7 * 24 * 60 * 60 * 1000;

  return `
    <div class="product-card">
      <div class="product-card-img-wrap">
        <img src="${imgSrc}" alt="${p.name}" loading="lazy"
          onerror="this.src='https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400&q=80'">
        ${isNew ? '<span class="product-badge">New</span>' : ''}
      </div>
      <div class="product-card-body">
        <div class="product-card-category">${p.category}</div>
        <h3 class="product-card-name">${p.name}</h3>
        <p class="product-card-seller">by ${p.seller}</p>
        <div class="product-card-footer">
          <span class="product-price">${formatPrice(p.price)}</span>
          <button class="btn btn-primary btn-sm" onclick='addToCart(${JSON.stringify(p).replace(/'/g, "&#39;")})'>Add to Cart</button>
        </div>
      </div>
    </div>`;
}

function addToCart(product) {
  APP.cart.push({ ...product, cartId: Date.now() });
  saveCart();
  updateCartBadge();
  showToast(`${product.name} added to cart! 🛒`);
}

function initCartModal() {
  const cartBtn = document.getElementById('viewCartBtn');
  const modal = document.getElementById('cartModal');
  const closeBtn = document.getElementById('closeCartModal');

  if (cartBtn) cartBtn.addEventListener('click', openCart);
  if (closeBtn) closeBtn.addEventListener('click', closeCart);
  if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) closeCart(); });
}

function openCart() {
  const modal = document.getElementById('cartModal');
  const cartList = document.getElementById('cartItems');
  if (!modal || !cartList) return;

  const total = APP.cart.reduce((s, i) => s + i.price, 0);

  if (!APP.cart.length) {
    cartList.innerHTML = `<div class="empty-state"><div class="empty-state-icon">🛒</div><p>Your cart is empty.</p></div>`;
  } else {
    cartList.innerHTML = APP.cart.map(item => `
      <div class="food-log-item">
        <div>
          <div class="food-log-item-name">${item.name}</div>
          <div class="food-log-item-meta">${item.seller}</div>
        </div>
        <div style="display:flex;align-items:center;gap:1rem">
          <span class="food-log-item-cals">${formatPrice(item.price)}</span>
          <span class="food-log-item-del" onclick="removeFromCart(${item.cartId})">✕</span>
        </div>
      </div>`).join('');
  }

  const totalEl = document.getElementById('cartTotal');
  if (totalEl) totalEl.textContent = formatPrice(total);

  modal.classList.add('open');
}

function closeCart() {
  const modal = document.getElementById('cartModal');
  if (modal) modal.classList.remove('open');
}

window.removeFromCart = function(cartId) {
  APP.cart = APP.cart.filter(i => i.cartId !== cartId);
  saveCart();
  updateCartBadge();
  openCart(); // Re-render
};

window.checkout = function() {
  if (!APP.cart.length) { showToast('Your cart is empty.', 'error'); return; }
  showToast('Order placed successfully! 🎉');
  APP.cart = [];
  saveCart();
  updateCartBadge();
  closeCart();
};

/* ============================================================
   GYM REGISTRATION PAGE
   ============================================================ */
function initGymRegister() {
  const form = document.getElementById('gymRegisterForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form);

    const gym = {
      id: Date.now(),
      name: form.gymName.value.trim(),
      location: form.gymCity.value.trim(),
      address: form.gymAddress.value.trim(),
      description: form.gymDescription.value.trim(),
      pricing: form.gymPricing.value.trim(),
      price: form.gymPricing.value.trim(),
      rating: 4.5,
      reviews: 0,
      priceRange: '$$',
      tags: form.gymAmenities.value.split(',').map(t => t.trim()).filter(Boolean),
      image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80',
      phone: form.gymPhone.value.trim(),
      hours: form.gymHours.value.trim(),
      registeredAt: Date.now(),
    };

    APP.registeredGyms.push(gym);
    saveGyms();
    showToast('Gym registered successfully! It will appear on the gym finder. 🏋️');
    form.reset();

    // Preview card
    const preview = document.getElementById('gymPreview');
    if (preview) {
      preview.innerHTML = `
        <h3 style="font-family:var(--font-display);margin-bottom:1rem;color:var(--accent)">Preview</h3>
        ${buildGymCard(gym)}`;
      preview.style.display = 'block';
    }
  });
}

/* ============================================================
   SELLER REGISTRATION PAGE
   ============================================================ */
function initSellerRegister() {
  const form = document.getElementById('sellerRegisterForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const product = {
      id: Date.now(),
      name: form.productName.value.trim(),
      category: form.productCategory.value,
      price: parseFloat(form.productPrice.value),
      seller: form.sellerName.value.trim(),
      description: form.productDescription.value.trim(),
      image: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400&q=80',
      addedAt: Date.now(),
    };

    if (!product.name || !product.price || !product.seller) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }

    APP.sellerProducts.push(product);
    saveProducts();
    showToast('Product listed successfully! It will appear in the marketplace. 🛍️');
    form.reset();

    const preview = document.getElementById('productPreview');
    if (preview) {
      preview.innerHTML = `
        <h3 style="font-family:var(--font-display);margin-bottom:1rem;color:var(--accent)">Preview</h3>
        ${buildProductCard(product)}`;
      preview.style.display = 'block';
    }
  });
}

/* ============================================================
   PAGE AUTO-DETECTION & INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', async () => {
  // Always init nav
  initNav();

  // Detect page and init accordingly
  const page = window.location.pathname.split('/').pop() || 'index.html';

  if (page === 'index.html' || page === '') await initHomePage();
  else if (page === 'gyms.html') await initGymsPage();
  else if (page === 'workout-library.html') await initWorkoutLibrary();
  else if (page === 'equipment-guide.html') await initEquipmentPage();
  else if (page === 'diet-tracker.html') initDietTracker();
  else if (page === 'marketplace.html') await initMarketplace();
  else if (page === 'gym-register.html') initGymRegister();
  else if (page === 'seller-register.html') initSellerRegister();
});

/* Expose global functions for inline handlers */
window.addToCart = addToCart;
window.removeFoodItem = removeFoodItem;
window.viewGym = viewGym;
window.openCart = openCart;
window.closeCart = closeCart;
