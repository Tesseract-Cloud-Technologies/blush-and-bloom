// ---------- CART HELPERS ----------
function bbGetCart() {
  try { return JSON.parse(localStorage.getItem('bb_cart')) || []; }
  catch (e) { return []; }
}
function bbSaveCart(cart) {
  localStorage.setItem('bb_cart', JSON.stringify(cart));
  bbUpdateBadges();
}
function bbAddToCart(id, name, price, gradientClass, iconKey, shade) {
  var cart = bbGetCart();
  var key = id + (shade ? ('-' + shade) : '');
  var existing = cart.find(function (i) { return i.key === key; });
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ key: key, id: id, name: name, price: price, qty: 1, gradientClass: gradientClass, iconKey: iconKey, shade: shade || null });
  }
  bbSaveCart(cart);
  bbFlashAdded(id);
}
function bbFlashAdded(id) {
  var btn = document.querySelector('[data-add-id="' + id + '"]');
  if (!btn) return;
  var original = btn.textContent;
  btn.textContent = 'Added ✓';
  setTimeout(function () { btn.textContent = original; }, 1200);
}
function bbUpdateBadges() {
  var count = bbGetCart().reduce(function (sum, i) { return sum + i.qty; }, 0);
  document.querySelectorAll('.cart-badge').forEach(function (b) {
    b.textContent = count;
    b.style.display = count > 0 ? 'flex' : 'none';
  });
}

// ---------- ICONS (used in cart thumbnails) ----------
var BB_ICONS = {
  lipstick: '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.6"><rect x="9" y="2" width="6" height="8" rx="2"/><path d="M8 10h8l-1 11a3 3 0 0 1-6 0z"/></svg>',
  bottle: '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.6"><path d="M9 2h6v4l2 2v12a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V8l2-2z"/><path d="M9 10h6"/></svg>',
  dropper: '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.6"><path d="M12 2v6"/><path d="M8 8h8l-1 5a3 3 0 0 1-6 0z"/><circle cx="12" cy="19" r="3"/></svg>',
  spray: '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.6"><path d="M14 4h4"/><path d="M16 2v4"/><path d="M9 8h6l1 3v9a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-9z"/><path d="M9 8V6a2 2 0 0 1 2-2h2"/></svg>',
  jar: '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.6"><rect x="5" y="8" width="14" height="13" rx="3"/><path d="M8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
  brush: '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.6"><path d="M9.5 14.5 3 21"/><path d="M13 11l7-7a2 2 0 0 1 3 3l-7 7"/><path d="M8 15l1.5 1.5"/></svg>'
};

document.addEventListener('DOMContentLoaded', function () {
  bbUpdateBadges();

  // Nav toggle
  var toggle = document.getElementById('navToggle');
  var links = document.getElementById('navLinks');
  if (toggle && links) {
    toggle.addEventListener('click', function () { links.classList.toggle('open'); });
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { links.classList.remove('open'); });
    });
  }

  // Add-to-cart buttons
  document.querySelectorAll('[data-add-id]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      bbAddToCart(
        btn.getAttribute('data-add-id'),
        btn.getAttribute('data-name'),
        parseFloat(btn.getAttribute('data-price')),
        btn.getAttribute('data-gradient'),
        btn.getAttribute('data-icon'),
        btn.getAttribute('data-shade') || null
      );
    });
  });

  // Filter tabs (shop page)
  var tabs = document.querySelectorAll('.filter-tab');
  if (tabs.length) {
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        tabs.forEach(function (t) { t.classList.remove('active'); });
        tab.classList.add('active');
        var cat = tab.getAttribute('data-filter');
        document.querySelectorAll('.product-card').forEach(function (card) {
          var show = cat === 'all' || card.getAttribute('data-category') === cat;
          card.style.display = show ? '' : 'none';
        });
      });
    });
  }

  // Accordion (FAQ)
  document.querySelectorAll('.accordion-head').forEach(function (head) {
    head.addEventListener('click', function () {
      head.parentElement.classList.toggle('open');
    });
  });

  // Shade selector (product page)
  document.querySelectorAll('.shade-swatch').forEach(function (sw) {
    sw.addEventListener('click', function () {
      document.querySelectorAll('.shade-swatch').forEach(function (s) { s.classList.remove('active'); });
      sw.classList.add('active');
      var label = document.getElementById('selectedShadeLabel');
      if (label) label.textContent = sw.getAttribute('data-shade');
      var addBtn = document.querySelector('[data-add-id]');
      if (addBtn) addBtn.setAttribute('data-shade', sw.getAttribute('data-shade'));
    });
  });

  // Newsletter fake submit
  var newsForm = document.getElementById('newsletterForm');
  if (newsForm) {
    newsForm.addEventListener('submit', function (e) {
      e.preventDefault();
      document.getElementById('newsletterMsg').classList.add('show');
      newsForm.reset();
    });
  }

  // Contact form fake submit
  var contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      document.getElementById('contactConfirm').classList.add('show');
      contactForm.reset();
    });
  }

  // Checkout form fake submit
  var checkoutForm = document.getElementById('checkoutForm');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', function (e) {
      e.preventDefault();
      document.getElementById('checkoutForm').style.display = 'none';
      document.getElementById('checkoutConfirm').classList.add('show');
      localStorage.removeItem('bb_cart');
      bbUpdateBadges();
    });
  }

  // Render cart page
  if (document.getElementById('cartBody')) {
    bbRenderCart();
  }
  if (document.getElementById('checkoutSummary')) {
    bbRenderCheckoutSummary();
  }
});

function bbRenderCart() {
  var cart = bbGetCart();
  var body = document.getElementById('cartBody');
  var empty = document.getElementById('cartEmpty');
  var summaryWrap = document.getElementById('cartSummaryWrap');
  body.innerHTML = '';

  if (cart.length === 0) {
    empty.style.display = 'block';
    summaryWrap.style.display = 'none';
    document.getElementById('cartTableWrap').style.display = 'none';
    return;
  }
  empty.style.display = 'none';
  summaryWrap.style.display = 'block';
  document.getElementById('cartTableWrap').style.display = 'block';

  var subtotal = 0;
  cart.forEach(function (item) {
    subtotal += item.price * item.qty;
    var tr = document.createElement('tr');
    tr.innerHTML =
      '<td><div class="cart-item-info">' +
        '<div class="cart-thumb ' + item.gradientClass + '">' + (BB_ICONS[item.iconKey] || '') + '</div>' +
        '<div><div style="font-weight:600;font-size:13.5px;">' + item.name + '</div>' +
        (item.shade ? '<div style="font-size:11.5px;color:var(--grey);">Shade: ' + item.shade + '</div>' : '') +
        '</div></div></td>' +
      '<td>K' + item.price.toFixed(0) + '</td>' +
      '<td><div class="qty-control">' +
        '<button data-action="dec" data-key="' + item.key + '">&minus;</button>' +
        '<span>' + item.qty + '</span>' +
        '<button data-action="inc" data-key="' + item.key + '">+</button>' +
      '</div></td>' +
      '<td>K' + (item.price * item.qty).toFixed(0) + '</td>' +
      '<td><button class="remove-btn" data-action="remove" data-key="' + item.key + '">Remove</button></td>';
    body.appendChild(tr);
  });

  document.getElementById('cartSubtotal').textContent = 'K' + subtotal.toFixed(0);
  var shipping = subtotal > 0 ? 20 : 0;
  document.getElementById('cartShipping').textContent = 'K' + shipping.toFixed(0);
  document.getElementById('cartTotal').textContent = 'K' + (subtotal + shipping).toFixed(0);

  body.querySelectorAll('button[data-action]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var key = btn.getAttribute('data-key');
      var action = btn.getAttribute('data-action');
      var cart = bbGetCart();
      var item = cart.find(function (i) { return i.key === key; });
      if (!item) return;
      if (action === 'inc') item.qty += 1;
      if (action === 'dec') item.qty = Math.max(1, item.qty - 1);
      if (action === 'remove') cart = cart.filter(function (i) { return i.key !== key; });
      bbSaveCart(cart);
      bbRenderCart();
    });
  });
}

function bbRenderCheckoutSummary() {
  var cart = bbGetCart();
  var wrap = document.getElementById('checkoutSummary');
  var subtotal = cart.reduce(function (s, i) { return s + i.price * i.qty; }, 0);
  var shipping = subtotal > 0 ? 20 : 0;
  wrap.innerHTML = cart.map(function (item) {
    return '<div class="cart-summary-row"><span>' + item.name + ' × ' + item.qty + '</span><span>K' + (item.price * item.qty).toFixed(0) + '</span></div>';
  }).join('') +
  '<div class="cart-summary-row"><span>Shipping</span><span>K' + shipping.toFixed(0) + '</span></div>' +
  '<div class="cart-summary-row total"><span>Total</span><span>K' + (subtotal + shipping).toFixed(0) + '</span></div>';
}
