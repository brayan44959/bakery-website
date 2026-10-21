/* ==========================================================================
   PANADERÍA Y PASTELERÍA WILLIAM - CAJAMARCA
   Lógica global de la aplicación (Multi-página en carpeta /pages, Carrito persistente, WhatsApp)
   ========================================================================== */

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

document.documentElement.classList.add("js");

// Detección de ubicación para rutas relativas
const isInPages = window.location.pathname.replace(/\\/g, "/").includes("/pages/");
const rootPrefix = isInPages ? "../" : "";
const pagesPrefix = isInPages ? "" : "pages/";

// Formato de moneda
const money = p => p == null ? "Consultar precio" : "S/ " + Number(p).toFixed(2);

// Enlace de WhatsApp seguro
const hasWA = /^\d{9,15}$/.test(CONFIG.WHATSAPP);
const getWaUrl = (text = "") => `https://wa.me/${CONFIG.WHATSAPP}?text=${encodeURIComponent(text)}`;

// Cantidades siempre enteras entre 1 y 99 (evita NaN, negativos y desbordes)
const clampQty = q => Math.max(1, Math.min(99, Math.floor(Number(q)) || 1));

// Validación de teléfonos peruanos (celular: 9XXXXXXXX, con o sin +51)
const normalizePhone = v => String(v || "").replace(/[\s\-().]/g, "");
const PERU_PHONE_RE = /^(?:\+?51)?9\d{8}$/;

/* ==========================================================================
   GESTOR DEL CARRITO (Persistente con localStorage)
   ========================================================================== */
const Cart = {
  KEY: "panaderia_william_cart_v2",

  get() {
    try {
      const data = localStorage.getItem(this.KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  save(items) {
    try {
      localStorage.setItem(this.KEY, JSON.stringify(items));
    } catch (e) {
      console.warn("No se pudo guardar el carrito en localStorage", e);
    }
    this.updateBadges();
  },

  /* Re-sincroniza el carrito con el catálogo actual: refresca nombre, precio,
     unidad e imagen de cada producto. Descarta líneas de productos que ya no existan. */
  sync() {
    const items = this.get();
    let changed = false;
    const fresh = items.filter(item => {
      // Líneas de combos: se validan contra COMBOS
      if (item.isCombo) {
        const c = (typeof COMBOS !== "undefined") ? COMBOS.find(x => x.id === item.comboId) : null;
        if (!c) { changed = true; return false; }
        const name = "Combo: " + c.name;
        if (item.name !== name || item.price !== c.price) {
          item.name = name;
          item.price = c.price;
          changed = true;
        }
        return true;
      }
      const p = PRODUCTS.find(x => x.id === item.id);
      if (!p) { changed = true; return false; }
      if (item.name !== p.name || item.price !== p.price || item.unit !== (p.unit || "unidad") || item.img !== p.img) {
        item.name = p.name;
        item.price = p.price;
        item.unit = p.unit || "unidad";
        item.img = p.img;
        changed = true;
      }
      return true;
    });
    if (changed) {
      try { localStorage.setItem(this.KEY, JSON.stringify(fresh)); } catch (e) { /* silencioso */ }
    }
    return fresh;
  },

  add(productId, qty = 1) {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return;

    const cantidad = clampQty(qty);
    const items = this.get();
    const existing = items.find(item => item.id === productId);

    if (existing) {
      existing.qty = clampQty(existing.qty + cantidad);
    } else {
      items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        unit: product.unit || "unidad",
        img: product.img,
        qty: cantidad
      });
    }

    this.save(items);
    showToast(`✓ Añadido al pedido: <b>${product.name}</b> (${cantidad} ${cantidad === 1 ? 'unidad' : 'unidades'})`);

    // Si estamos en la página de pedidos, actualizar la vista
    if (typeof renderOrderPage === "function") {
      renderOrderPage();
    }
  },

  /* Añade un combo como línea única con su precio promocional */
  addCombo(comboId, qty = 1) {
    if (typeof COMBOS === "undefined") return;
    const combo = COMBOS.find(c => c.id === comboId);
    if (!combo || !Array.isArray(combo.items) || !combo.items.length) return;

    const cantidad = clampQty(qty);
    const items = this.get();
    const existing = items.find(item => item.isCombo && item.comboId === combo.id);
    const firstProduct = PRODUCTS.find(p => p.id === combo.items[0].id);

    if (existing) {
      existing.qty = clampQty(existing.qty + cantidad);
    } else {
      items.push({
        id: combo.id,
        comboId: combo.id,
        isCombo: true,
        name: "Combo: " + combo.name,
        price: combo.price,
        unit: "combo",
        img: (firstProduct && firstProduct.img) || "img/logo.jpg",
        qty: cantidad
      });
    }

    this.save(items);
    showToast(`✓ Combo añadido: <b>${combo.name}</b> (${cantidad} × ${money(combo.price)})`);

    if (typeof renderOrderPage === "function") {
      renderOrderPage();
    }
  },

  updateQty(index, newQty) {
    const items = this.get();
    if (!items[index]) return;

    if (Number(newQty) <= 0) {
      items.splice(index, 1);
    } else {
      items[index].qty = clampQty(newQty);
    }
    this.save(items);
    if (typeof renderOrderPage === "function") {
      renderOrderPage();
    }
  },

  remove(index) {
    const items = this.get();
    if (items[index]) {
      const removedName = items[index].name;
      items.splice(index, 1);
      this.save(items);
      showToast(`✕ Se quitó: <b>${removedName}</b> del pedido`);
      if (typeof renderOrderPage === "function") {
        renderOrderPage();
      }
    }
  },

  clear() {
    this.save([]);
    if (typeof renderOrderPage === "function") {
      renderOrderPage();
    }
    showToast(`Pedido vaciado`);
  },

  totalCount() {
    return this.get().reduce((sum, item) => sum + item.qty, 0);
  },

  totalPrice() {
    return this.get().reduce((sum, item) => sum + (item.price ? item.price * item.qty : 0), 0);
  },

  updateBadges() {
    const count = this.totalCount();
    $$(".cart-badge").forEach(el => {
      el.textContent = count;
      el.style.display = count > 0 ? "inline-flex" : "none";
    });

    const pill = $("#floating-cart");
    if (pill) {
      if (count > 0) {
        pill.classList.add("visible");
        const total = this.totalPrice();
        const totalText = total > 0 ? ` • ${money(total)}` : "";
        pill.querySelector(".floating-cart-txt").innerHTML = `<b>${count}</b> ${count === 1 ? 'producto' : 'productos'}${totalText}`;
      } else {
        pill.classList.remove("visible");
      }
    }
  }
};

/* ==========================================================================
   UTILIDADES GENERALES
   ========================================================================== */

/* Copia texto al portapapeles con respaldo para navegadores sin clipboard API */
async function copyToClipboard(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (e) { /* continúa con el respaldo */ }

  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.top = "-1000px";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  } catch (e) {
    return false;
  }
}

/* ==========================================================================
   TOAST NOTIFICATIONS
   ========================================================================== */
function showToast(message, duration = 3200) {
  let toast = $("#app-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "app-toast";
    toast.className = "toast";
    document.body.appendChild(toast);
  }

  const targetLink = `${pagesPrefix}pedidos.html`;
  toast.innerHTML = `
    <div class="toast-body">${message}</div>
    <a href="${targetLink}" class="toast-link">Ver pedido →</a>
  `;
  toast.classList.add("show");

  if (window._toastTimer) clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, duration);
}

/* ==========================================================================
   MODAL DE DETALLE DE PRODUCTO (accesible: foco, Escape y aria)
   ========================================================================== */
let lastFocusedEl = null;

function closeModal() {
  const modal = $("#product-modal");
  if (!modal || !modal.classList.contains("open")) return;
  modal.classList.remove("open");
  document.body.classList.remove("lock");
  if (lastFocusedEl && typeof lastFocusedEl.focus === "function") lastFocusedEl.focus();
  lastFocusedEl = null;
}

function openProductModal(productId) {
  const p = PRODUCTS.find(x => x.id === productId);
  if (!p) return;

  let modal = $("#product-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "product-modal";
    modal.className = "modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "modal-title");
    modal.innerHTML = `
      <div class="modal-backdrop"></div>
      <div class="modal-card">
        <button class="modal-close" aria-label="Cerrar modal">&times;</button>
        <div class="modal-grid">
          <div class="modal-media"><img src="" alt="" id="modal-img"></div>
          <div class="modal-content">
            <span class="product-badge" id="modal-badge"></span>
            <h2 id="modal-title"></h2>
            <p class="modal-price" id="modal-price"></p>
            <p class="modal-desc" id="modal-desc"></p>
            <div class="modal-details" id="modal-details"></div>
            <div class="modal-actions">
              <div class="qty-stepper">
                <button type="button" class="stepper-btn" id="modal-minus" aria-label="Quitar una unidad">-</button>
                <input type="number" id="modal-qty" value="1" min="1" max="99" aria-label="Cantidad">
                <button type="button" class="stepper-btn" id="modal-plus" aria-label="Añadir una unidad">+</button>
              </div>
              <button class="btn" id="modal-add-btn">Añadir al pedido</button>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    // Event listeners del modal
    modal.querySelector(".modal-close").onclick = closeModal;
    modal.querySelector(".modal-backdrop").onclick = closeModal;

    const qtyInput = modal.querySelector("#modal-qty");
    modal.querySelector("#modal-minus").onclick = () => {
      qtyInput.value = clampQty(parseInt(qtyInput.value || 1, 10) - 1);
    };
    modal.querySelector("#modal-plus").onclick = () => {
      qtyInput.value = clampQty(parseInt(qtyInput.value || 1, 10) + 1);
    };

    // Mantener el foco dentro del modal mientras esté abierto
    modal.addEventListener("keydown", e => {
      if (e.key !== "Tab") return;
      const focusables = $$("button, input, a[href], [tabindex]:not([tabindex='-1'])", modal)
        .filter(el => !el.disabled && el.offsetParent !== null);
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });
  }

  // Llenar contenido
  $("#modal-img").src = rootPrefix + p.img;
  $("#modal-img").alt = p.name;
  $("#modal-badge").textContent = p.badge || "Tradición";
  $("#modal-badge").className = `product-badge badge-${p.badgeType || 'gold'}`;
  $("#modal-title").textContent = p.name;
  $("#modal-price").innerHTML = `${money(p.price)} <small>/ ${p.unit || 'unidad'}</small>`;
  $("#modal-desc").textContent = p.desc;
  $("#modal-details").innerHTML = p.details ? `<h4>Detalles e ingredientes:</h4><p>${p.details}</p>` : "";

  const qtyInput = $("#modal-qty");
  qtyInput.value = 1;

  $("#modal-add-btn").onclick = () => {
    Cart.add(p.id, clampQty(qtyInput.value));
    closeModal();
  };

  lastFocusedEl = document.activeElement;
  modal.classList.add("open");
  document.body.classList.add("lock");
  modal.querySelector(".modal-close").focus();
}

/* ==========================================================================
   MENÚ LATERAL RESPONSIVE & NAVEGACIÓN
   ========================================================================== */
function initNavigation() {
  const drawer = $("#drawer");
  const burger = $("#burger");
  const scrim = $("#scrim");

  if (!drawer || !burger) return;

  // Los enlaces del drawer no deben ser enfocables mientras está cerrado
  if ("inert" in drawer) drawer.inert = true;

  const toggleMenu = (open) => {
    drawer.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    drawer.setAttribute("aria-hidden", String(!open));
    if ("inert" in drawer) drawer.inert = !open;
    document.body.classList.toggle("lock", open);
    if (scrim) scrim.classList.toggle("open", open);
  };

  burger.onclick = () => toggleMenu(!drawer.classList.contains("open"));
  if (scrim) scrim.onclick = () => toggleMenu(false);

  document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      toggleMenu(false);
      closeModal();
    }
  });

  // Resaltar enlace activo según la página actual
  const path = window.location.pathname.replace(/\\/g, "/");
  const currentFile = path.split("/").pop() || "index.html";
  $$("nav a, #drawer nav a").forEach(a => {
    const href = a.getAttribute("href") || "";
    const linkFile = href.split("/").pop();

    // Comparar nombre de archivo
    const isCurrent = (currentFile === linkFile) ||
      ((currentFile === "" || currentFile === "index.htm") && linkFile === "index.html");

    if (isCurrent) {
      a.classList.add("active");
      a.setAttribute("aria-current", "page");
    } else {
      a.classList.remove("active");
    }
  });

  // Cerrar menú al hacer clic en un enlace del drawer
  $$("#drawer nav a").forEach(a => {
    a.addEventListener("click", () => toggleMenu(false));
  });

  // Header con scroll sólido
  const header = $("header");
  if (header) {
    window.addEventListener("scroll", () => {
      header.classList.toggle("solid", window.scrollY > 30);
    }, { passive: true });
  }
}

/* ==========================================================================
   ENLACES GLOBALES & CONFIGURACIÓN
   ========================================================================== */
function applyConfig() {
  // Teléfono y WhatsApp
  $$(".phone-display").forEach(el => el.textContent = CONFIG.PHONE_DISPLAY);
  $$(".phone-landline-display").forEach(el => el.textContent = CONFIG.PHONE_LANDLINE);
  $$(".address-display").forEach(el => el.textContent = CONFIG.ADDRESS);
  $$(".hours-week, .hours-morning").forEach(el => el.textContent = CONFIG.HORARIO_MANANA);
  $$(".hours-sun, .hours-afternoon").forEach(el => el.textContent = CONFIG.HORARIO_TARDE);
  $$(".hot-bread-am").forEach(el => el.textContent = CONFIG.PAN_CALIENTE_MANANA);
  $$(".hot-bread-pm").forEach(el => el.textContent = CONFIG.PAN_CALIENTE_TARDE);

  // Años de tradición calculados desde 2000 (nunca queda desactualizado)
  $$(".years-since-2000").forEach(el => el.textContent = String(new Date().getFullYear() - 2000));

  // Datos de pago digital
  $$(".yape-numero").forEach(el => el.textContent = CONFIG.YAPE_NUMERO);
  $$(".yape-titular").forEach(el => el.textContent = CONFIG.YAPE_TITULAR);
  $$(".plin-numero").forEach(el => el.textContent = CONFIG.PLIN_NUMERO);
  $$(".plin-titular").forEach(el => el.textContent = CONFIG.PLIN_TITULAR);
  $$(".bcp-cuenta").forEach(el => el.textContent = CONFIG.BCP_CUENTA);
  $$(".bcp-cci").forEach(el => el.textContent = CONFIG.BCP_CCI);
  $$(".bcp-titular").forEach(el => el.textContent = CONFIG.BCP_TITULAR);

  // Botones de WhatsApp directo (abren chat con mensaje predefinido)
  $$(".wa-link").forEach(a => {
    if (hasWA) {
      const msg = a.dataset.msg || "Hola Panadería William, quisiera consultar sobre sus productos y pedidos.";
      a.href = getWaUrl(msg);
      a.target = "_blank";
      a.rel = "noopener noreferrer";
    } else {
      a.href = `${pagesPrefix}pedidos.html`;
    }
  });

  // Enlaces a redes (cuando existan en el HTML)
  const fb = $("#link-fb"), ig = $("#link-ig"), tk = $("#link-tk");
  if (fb && CONFIG.FACEBOOK) { fb.href = CONFIG.FACEBOOK; fb.target = "_blank"; fb.rel = "noopener"; }
  if (ig && CONFIG.INSTAGRAM) { ig.href = CONFIG.INSTAGRAM; ig.target = "_blank"; ig.rel = "noopener"; }
  if (tk && CONFIG.TIKTOK) { tk.href = CONFIG.TIKTOK; tk.target = "_blank"; tk.rel = "noopener"; }

  const mapsBtn = $("#btn-maps");
  if (mapsBtn) {
    mapsBtn.href = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(CONFIG.MAPS_QUERY);
    mapsBtn.target = "_blank";
    mapsBtn.rel = "noopener";
  }

  // Mapa embebido: si el src del HTML difiere de la configuración, se usa el de CONFIG
  const mapFrame = $("#maps-embed");
  if (mapFrame && CONFIG.MAPS_EMBED && mapFrame.getAttribute("src") !== CONFIG.MAPS_EMBED) {
    mapFrame.src = CONFIG.MAPS_EMBED;
  }
}

/* ==========================================================================
   RENDERIZADOR DE TARJETAS DE PRODUCTO
   ========================================================================== */
function renderProductCard(p, featuredLayout = false) {
  const imgSrc = rootPrefix + p.img;
  return `
    <article class="prod-card ${featuredLayout ? 'featured' : ''}" data-id="${p.id}" data-cats="${p.cats.join(' ')}">
      <div class="prod-thumb" onclick="openProductModal('${p.id}')">
        <img src="${imgSrc}" alt="${p.name}" loading="lazy">
        <span class="product-badge badge-${p.badgeType || 'gold'}">${p.badge || 'Tradición'}</span>
        <button class="quick-view-btn" type="button" aria-label="Ver detalles de ${p.name}">🔍 Ver detalles</button>
      </div>
      <div class="prod-info">
        <div class="prod-head" onclick="openProductModal('${p.id}')">
          <h3 class="prod-title">${p.name}</h3>
          <p class="prod-desc">${p.desc}</p>
        </div>
        <div class="prod-footer">
          <div class="prod-price-box">
            <span class="prod-price">${money(p.price)}</span>
            <span class="prod-unit">${p.unit || 'unidad'}</span>
          </div>
          <button class="btn btn-add" data-add="${p.id}" type="button">
            <span>+ Añadir</span>
          </button>
        </div>
      </div>
    </article>
  `;
}

/* ==========================================================================
   RENDERIZADOR DE COMBOS (con ahorro calculado y añadido al carrito)
   ========================================================================== */
function comboBasePrice(combo) {
  return (combo.items || []).reduce((sum, it) => {
    const p = PRODUCTS.find(x => x.id === it.id);
    return sum + (p ? p.price * it.qty : 0);
  }, 0);
}

/* Texto con el contenido de un combo (para el mensaje de WhatsApp y la lista del pedido) */
function comboContentsText(combo) {
  return (combo.items || []).map(it => {
    const p = PRODUCTS.find(x => x.id === it.id);
    return p ? `${it.qty}× ${p.name} (${p.unit || "unidad"})` : "";
  }).filter(Boolean).join(" · ");
}

function renderComboCard(combo) {
  const base = comboBasePrice(combo);
  const parts = [];
  if (base > combo.price) parts.push(`Ahorra ${money(base - combo.price)} en combo`);
  if (combo.note) parts.push(combo.note);
  const chip = parts.length ? `<span class="combo-saving">${parts.join(" · ")}</span>` : "";

  return `
    <article class="combo-card" data-combo="${combo.id}">
      <span class="combo-badge">${combo.badge || "Promo"}</span>
      <div>
        <h3>${combo.name}</h3>
        <p>${combo.desc}</p>
        ${chip}
      </div>
      <div style="margin-top:20px; display:flex; justify-content:space-between; align-items:center; gap:10px; flex-wrap:wrap;">
        <b style="font-size:1.4rem; color:var(--tostado)">${money(combo.price)}</b>
        <button type="button" class="btn small" data-add-combo="${combo.id}">+ Añadir al pedido</button>
      </div>
    </article>
  `;
}

/* ==========================================================================
   RENDERIZADOR DE TESTIMONIOS
   ========================================================================== */
function renderTestimonialCard(t) {
  const stars = "★".repeat(Math.max(1, Math.min(5, t.stars || 5)));
  return `
    <article class="testimonial-card">
      <div>
        <div class="stars" aria-hidden="true">${stars}</div>
        <p class="testimonial-quote">"${t.comment}"</p>
      </div>
      <div class="testimonial-author">
        <b>${t.name}</b>
        <small>${t.neighborhood}</small>
      </div>
    </article>
  `;
}

/* ==========================================================================
   LÓGICA ESPECÍFICA DE LA PÁGINA: PRODUCTOS (productos.html)
   ========================================================================== */
function initProductsPage() {
  const grid = $("#products-grid");
  if (!grid) return;

  // Renderizar catálogo completo
  grid.innerHTML = PRODUCTS.map(p => renderProductCard(p)).join("");

  // Contador de productos siempre actualizado
  const allBtn = $(".filters button[data-f='todos']");
  if (allBtn) allBtn.textContent = `Todos (${PRODUCTS.length})`;

  // Filtrado por categoría
  const filterBtns = $$(".filters button");
  const searchInput = $("#product-search");

  const filterCatalog = () => {
    const activeBtn = $(".filters button[aria-pressed='true']");
    const activeCat = activeBtn ? activeBtn.dataset.f : "todos";
    const query = searchInput ? searchInput.value.toLowerCase().trim() : "";

    let visibleCount = 0;
    $$(".prod-card", grid).forEach(card => {
      const cats = card.dataset.cats.split(" ");
      const title = card.querySelector(".prod-title").textContent.toLowerCase();
      const desc = card.querySelector(".prod-desc").textContent.toLowerCase();

      const matchCat = activeCat === "todos" || cats.includes(activeCat);
      const matchSearch = !query || title.includes(query) || desc.includes(query);

      if (matchCat && matchSearch) {
        card.style.display = "";
        card.classList.remove("off");
        visibleCount++;
      } else {
        card.style.display = "none";
        card.classList.add("off");
      }
    });

    const emptyNotice = $("#products-empty");
    if (emptyNotice) {
      emptyNotice.style.display = visibleCount === 0 ? "block" : "none";
    }
  };

  filterBtns.forEach(btn => {
    btn.onclick = () => {
      filterBtns.forEach(b => b.setAttribute("aria-pressed", String(b === btn)));
      filterCatalog();
    };
  });

  if (searchInput) {
    searchInput.oninput = filterCatalog;
  }
}

/* ==========================================================================
   LÓGICA ESPECÍFICA DE LA PÁGINA: PEDIDOS (pedidos.html)
   ========================================================================== */

/* Valida los datos del formulario antes de enviar. Devuelve true si todo está correcto. */
function validateOrderForm() {
  const errors = [];
  const phoneEl = $("#order-phone");
  const addrEl = $("#order-address");
  const isDelivery = ($("input[name='delivery-type']:checked")?.value || "recojo") === "delivery";

  [phoneEl, addrEl].forEach(el => el && el.classList.remove("field-error"));

  // Teléfono obligatorio y con formato de celular peruano
  const phone = normalizePhone(phoneEl?.value);
  if (!phone) {
    errors.push({ el: phoneEl, msg: "Ingresa tu teléfono para confirmar el pedido." });
  } else if (!PERU_PHONE_RE.test(phone)) {
    errors.push({ el: phoneEl, msg: "Teléfono inválido. Ejemplo válido: 987 654 321." });
  }

  // Dirección obligatoria cuando es delivery
  if (isDelivery && (addrEl?.value || "").trim().length < 5) {
    errors.push({ el: addrEl, msg: "Para el envío por delivery necesitamos tu dirección exacta en Cajamarca." });
  }

  errors.forEach(e => e.el && e.el.classList.add("field-error"));

  const box = $("#order-form-errors");
  if (box) {
    box.style.display = errors.length ? "block" : "none";
    box.innerHTML = errors.map(e => `<div>⚠️ ${e.msg}</div>`).join("");
  }

  if (errors.length && errors[0].el) errors[0].el.focus();
  return errors.length === 0;
}

function renderOrderPage() {
  const itemsContainer = $("#order-items-list");
  if (!itemsContainer) return;

  // Refrescar precios y datos con el catálogo actual antes de dibujar
  const items = Cart.sync();

  if (items.length === 0) {
    const prodLink = `${pagesPrefix}productos.html`;
    itemsContainer.innerHTML = `
      <div class="empty-cart-state">
        <div class="empty-icon">🧺</div>
        <h4>Tu lista de pedido está vacía</h4>
        <p>Explora nuestros panes, bizcochos, rosquitas y queques artesanales para añadirlos a tu pedido.</p>
        <a href="${prodLink}" class="btn small">Explorar productos</a>
      </div>
    `;
    const summaryBox = $("#order-summary-box");
    if (summaryBox) summaryBox.style.display = "none";
    return;
  }

  const summaryBox = $("#order-summary-box");
  if (summaryBox) summaryBox.style.display = "block";

  // Renderizar items con controles interactivos de cantidad
  itemsContainer.innerHTML = items.map((item, idx) => {
    const combo = item.isCombo && typeof COMBOS !== "undefined"
      ? COMBOS.find(c => c.id === item.comboId)
      : null;
    return `
    <li class="order-item-row">
      <img src="${rootPrefix}${item.img || 'img/logo.jpg'}" alt="${item.name}" class="order-item-img">
      <div class="order-item-details">
        <b>${item.name}</b>
        <span class="order-item-unit-price">${money(item.price)} / ${item.unit}</span>
        ${combo ? `<span class="order-item-includes">↳ ${comboContentsText(combo)}</span>` : ""}
      </div>
      <div class="order-item-controls">
        <div class="qty-stepper small">
          <button type="button" class="stepper-btn" onclick="Cart.updateQty(${idx}, ${item.qty - 1})">-</button>
          <span>${item.qty}</span>
          <button type="button" class="stepper-btn" onclick="Cart.updateQty(${idx}, ${item.qty + 1})">+</button>
        </div>
        <span class="order-item-subtotal">${money(item.price ? item.price * item.qty : null)}</span>
        <button type="button" class="order-item-remove" onclick="Cart.remove(${idx})" aria-label="Eliminar ${item.name}">&times;</button>
      </div>
    </li>
  `;
  }).join("");

  // Totales
  const total = Cart.totalPrice();
  const totalPriceEl = $("#order-total-price");
  if (totalPriceEl) totalPriceEl.textContent = money(total);

  // Actualizar ticket / resumen para WhatsApp
  updateWhatsAppSummary();
}

function updateWhatsAppSummary() {
  const items = Cart.get();
  const name = ($("#order-name")?.value || "").trim();
  const phone = ($("#order-phone")?.value || "").trim();
  const deliveryType = $("input[name='delivery-type']:checked")?.value || "recojo";
  const address = ($("#order-address")?.value || "").trim();
  const time = ($("#order-time")?.value || "").trim();
  const notes = ($("#order-notes")?.value || "").trim();

  let msg = `🥖 *PEDIDO EN PANADERÍA Y PASTELERÍA WILLIAM (CAJAMARCA)*\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━━━\n`;
  if (name) msg += `👤 *Cliente:* ${name}\n`;
  if (phone) msg += `📱 *Teléfono:* ${phone}\n`;
  msg += `📍 *Modalidad:* ${deliveryType === 'delivery' ? 'Envío por Delivery a domicilio' : 'Recojo en local (Jr. Chanchamayo 1874)'}\n`;
  if (deliveryType === 'delivery' && address) msg += `🏠 *Dirección:* ${address}\n`;
  if (time) msg += `⏰ *Hora / Fecha preferida:* ${time}\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `📝 *PRODUCTOS:* \n`;

  items.forEach(it => {
    const sub = it.price ? ` = ${money(it.price * it.qty)}` : "";
    msg += `• *${it.qty}x* ${it.name} (${money(it.price)})${sub}\n`;
    if (it.isCombo && typeof COMBOS !== "undefined") {
      const combo = COMBOS.find(c => c.id === it.comboId);
      if (combo) msg += `   ↳ Incluye: ${comboContentsText(combo)}\n`;
    }
  });

  msg += `━━━━━━━━━━━━━━━━━━━━━━\n`;
  const total = Cart.totalPrice();
  msg += `💰 *TOTAL ESTIMADO:* ${money(total)}\n`;
  if (notes) msg += `💬 *Observaciones:* ${notes}\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `¿Por favor me confirman disponibilidad para preparar el pedido? ¡Muchas gracias!`;

  const previewBox = $("#order-wa-preview");
  if (previewBox) {
    previewBox.textContent = msg;
  }

  const sendBtn = $("#btn-send-wa");
  if (sendBtn) {
    sendBtn.disabled = items.length === 0;
    sendBtn.onclick = () => {
      // No se permite enviar con datos incompletos
      if (!validateOrderForm()) return;

      if (hasWA) {
        window.open(getWaUrl(msg), "_blank", "noopener,noreferrer");
      } else {
        copyToClipboard(msg).then(ok => {
          showToast(ok
            ? "✓ Resumen copiado. Ábrelo en WhatsApp y pégalo."
            : "No se pudo copiar automáticamente. Copia el texto manualmente.");
        });
      }
    };
  }

  const copyBtn = $("#btn-copy-summary");
  if (copyBtn) {
    copyBtn.onclick = () => {
      copyToClipboard(msg).then(ok => {
        showToast(ok
          ? "✓ Resumen del pedido copiado al portapapeles"
          : "No se pudo copiar. Selecciona el texto manualmente.");
      });
    };
  }
}

function initOrderPage() {
  const form = $("#order-form");
  if (!form) return;

  // Selector rápido de productos y combos para añadir desde la misma página de pedidos
  const quickSelect = $("#quick-prod-select");
  if (quickSelect) {
    quickSelect.innerHTML = `
      <optgroup label="Productos">
        ${PRODUCTS.map(p => `<option value="${p.id}">${p.name} (${money(p.price)} / ${p.unit})</option>`).join("")}
      </optgroup>
      <optgroup label="Combos y promociones">
        ${COMBOS.map(c => `<option value="combo:${c.id}">${c.name} (${money(c.price)})</option>`).join("")}
      </optgroup>
    `;

    const quickAddBtn = $("#btn-quick-add");
    if (quickAddBtn) {
      quickAddBtn.onclick = () => {
        const selected = quickSelect.value;
        const qty = clampQty($("#quick-prod-qty")?.value || 1);
        if (selected.startsWith("combo:")) {
          Cart.addCombo(selected.slice(6), qty);
        } else {
          Cart.add(selected, qty);
        }
      };
    }
  }

  // Toggle de dirección según delivery o recojo
  $$("input[name='delivery-type']").forEach(radio => {
    radio.onchange = () => {
      const isDelivery = radio.value === "delivery";
      const addrBox = $("#delivery-address-group");
      if (addrBox) addrBox.style.display = isDelivery ? "block" : "none";
      updateWhatsAppSummary();
    };
  });

  // Inputs que actualizan el resumen en vivo y limpian errores de validación
  ["order-name", "order-phone", "order-address", "order-time", "order-notes"].forEach(id => {
    const input = $("#" + id);
    if (input) input.oninput = () => {
      input.classList.remove("field-error");
      const errBox = $("#order-form-errors");
      if (errBox) errBox.style.display = "none";
      updateWhatsAppSummary();
    };
  });

  const clearBtn = $("#btn-clear-cart");
  if (clearBtn) clearBtn.onclick = () => Cart.clear();

  renderOrderPage();
}

/* ==========================================================================
   LÓGICA ESPECÍFICA DE LA PÁGINA: INICIO (index.html)
   ========================================================================== */
function initHomePage() {
  const featuredGrid = $("#featured-products-grid");
  if (featuredGrid) {
    const featured = PRODUCTS.filter(p => p.destacado);
    featuredGrid.innerHTML = featured.map(p => renderProductCard(p, true)).join("");
  }

  // Combos renderizados desde data.js (un solo origen de datos)
  const combosGrid = $("#combos-grid");
  if (combosGrid) {
    combosGrid.innerHTML = COMBOS.map(renderComboCard).join("");
  }

  // Testimonios renderizados desde data.js
  const testimonialsGrid = $("#testimonials-grid");
  if (testimonialsGrid) {
    testimonialsGrid.innerHTML = TESTIMONIALS.map(renderTestimonialCard).join("");
  }

  // Contador del catálogo siempre actualizado
  const countEl = $("#catalog-count");
  if (countEl) countEl.textContent = String(PRODUCTS.length);
}

/* ==========================================================================
   LÓGICA ESPECÍFICA DE LA PÁGINA: CONTACTO (contacto.html)
   ========================================================================== */
function initContactPage() {
  const btn = $("#btn-contact-send");
  if (!btn) return;

  const nameEl = $("#contact-quick-name");
  const msgEl = $("#contact-quick-msg");
  const errEl = $("#contact-quick-error");

  msgEl.addEventListener("input", () => {
    msgEl.classList.remove("field-error");
    if (errEl) errEl.style.display = "none";
  });

  btn.onclick = () => {
    const msg = (msgEl.value || "").trim();
    if (!msg) {
      msgEl.classList.add("field-error");
      if (errEl) {
        errEl.textContent = "Por favor escribe tu consulta antes de enviarla.";
        errEl.style.display = "block";
      }
      msgEl.focus();
      return;
    }

    const name = (nameEl?.value || "").trim();
    const text = `Hola Panadería William, mi nombre es ${name || "un cliente"}. Mi consulta es: ${msg}`;

    if (hasWA) {
      window.open(getWaUrl(text), "_blank", "noopener,noreferrer");
    } else {
      copyToClipboard(text).then(ok => {
        showToast(ok
          ? "✓ Mensaje copiado. Ábrelo en WhatsApp y pégalo."
          : "No se pudo copiar automáticamente. Escribe tu consulta directamente por WhatsApp.");
      });
    }
  };
}

/* ==========================================================================
   ANIMACIONES DE APARICIÓN AL HACER SCROLL
   ========================================================================== */
function initRevealAnimations() {
  if (!("IntersectionObserver" in window)) return;
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const targets = $$(".section-head, .catalog-grid, .combos-grid, .testimonials-grid, .top5-grid, .pillars-grid, .timeline, .news-grid, .pay-methods-grid, .pay-steps, .contact-layout, .mission-grid, .gallery-grid");
  if (!targets.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -30px 0px" });

  targets.forEach(el => {
    el.classList.add("reveal");
    // Lo que ya está en pantalla se muestra de inmediato (sin esperar al observer)
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      el.classList.add("in");
    } else {
      observer.observe(el);
    }
  });
}

/* ==========================================================================
   EVENT DELEGATION GLOBAL
   ========================================================================== */
document.addEventListener("click", e => {
  // Botones de combos (añaden todos sus productos al carrito)
  const comboBtn = e.target.closest("[data-add-combo]");
  if (comboBtn) {
    e.preventDefault();
    Cart.addCombo(comboBtn.dataset.addCombo);
    return;
  }

  // Botones de añadir al carrito en cualquier parte de la web
  const addBtn = e.target.closest("[data-add]");
  if (addBtn) {
    e.preventDefault();
    const pid = addBtn.dataset.add;
    Cart.add(pid, 1);

    // Efecto visual en el botón
    const originalText = addBtn.innerHTML;
    addBtn.innerHTML = "<span>✓ ¡Añadido!</span>";
    addBtn.classList.add("added");
    setTimeout(() => {
      addBtn.innerHTML = originalText;
      addBtn.classList.remove("added");
    }, 1200);
  }
});

/* ==========================================================================
   INICIALIZACIÓN AL CARGAR LA PÁGINA
   ========================================================================== */
document.addEventListener("DOMContentLoaded", () => {
  initNavigation();
  applyConfig();
  Cart.updateBadges();

  // Inicializadores por página
  initHomePage();
  initProductsPage();
  initOrderPage();
  initContactPage();
  initRevealAnimations();
});
