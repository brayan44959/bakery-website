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
  
  add(productId, qty = 1) {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return;
    
    const items = this.get();
    const existing = items.find(item => item.id === productId);
    
    if (existing) {
      existing.qty += qty;
    } else {
      items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        unit: product.unit || "unidad",
        img: product.img,
        qty: qty
      });
    }
    
    this.save(items);
    showToast(`✓ Añadido al pedido: <b>${product.name}</b> (${qty} ${qty === 1 ? 'unidad' : 'unidades'})`);
    
    // Si estamos en la página de pedidos, actualizar la vista
    if (typeof renderOrderPage === "function") {
      renderOrderPage();
    }
  },
  
  updateQty(index, newQty) {
    const items = this.get();
    if (items[index]) {
      if (newQty <= 0) {
        items.splice(index, 1);
      } else {
        items[index].qty = newQty;
      }
      this.save(items);
      if (typeof renderOrderPage === "function") {
        renderOrderPage();
      }
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
   MODAL DE DETALLE DE PRODUCTO
   ========================================================================== */
function openProductModal(productId) {
  const p = PRODUCTS.find(x => x.id === productId);
  if (!p) return;
  
  let modal = $("#product-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "product-modal";
    modal.className = "modal";
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
                <button type="button" class="stepper-btn" id="modal-minus">-</button>
                <input type="number" id="modal-qty" value="1" min="1" max="99">
                <button type="button" class="stepper-btn" id="modal-plus">+</button>
              </div>
              <button class="btn" id="modal-add-btn">Añadir al pedido</button>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    
    // Event listeners del modal
    const close = () => modal.classList.remove("open");
    modal.querySelector(".modal-close").onclick = close;
    modal.querySelector(".modal-backdrop").onclick = close;
    
    const qtyInput = modal.querySelector("#modal-qty");
    modal.querySelector("#modal-minus").onclick = () => {
      qtyInput.value = Math.max(1, parseInt(qtyInput.value || 1) - 1);
    };
    modal.querySelector("#modal-plus").onclick = () => {
      qtyInput.value = parseInt(qtyInput.value || 1) + 1;
    };
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
    const q = Math.max(1, parseInt(qtyInput.value || 1));
    Cart.add(p.id, q);
    modal.classList.remove("open");
  };
  
  modal.classList.add("open");
}

/* ==========================================================================
   MENÚ LATERAL RESPONSIVE & NAVEGACIÓN
   ========================================================================== */
function initNavigation() {
  const drawer = $("#drawer");
  const burger = $("#burger");
  const scrim = $("#scrim");
  
  if (!drawer || !burger) return;
  
  const toggleMenu = (open) => {
    drawer.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", open);
    drawer.setAttribute("aria-hidden", !open);
    document.body.classList.toggle("lock", open);
    if (scrim) scrim.classList.toggle("open", open);
  };
  
  burger.onclick = () => toggleMenu(!drawer.classList.contains("open"));
  if (scrim) scrim.onclick = () => toggleMenu(false);
  
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      toggleMenu(false);
      const modal = $("#product-modal");
      if (modal) modal.classList.remove("open");
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
  $$(".address-display").forEach(el => el.textContent = CONFIG.ADDRESS);
  $$(".hours-week").forEach(el => el.textContent = CONFIG.HORARIOS_SEMANA);
  $$(".hours-sun").forEach(el => el.textContent = CONFIG.HORARIOS_DOMINGO);
  $$(".hot-bread-am").forEach(el => el.textContent = CONFIG.PAN_CALIENTE_MANANA);
  $$(".hot-bread-pm").forEach(el => el.textContent = CONFIG.PAN_CALIENTE_TARDE);
  
  // Botones WhatsApp
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
  
  // Enlaces a redes
  const fb = $("#link-fb"), ig = $("#link-ig"), tk = $("#link-tk");
  if (fb && CONFIG.FACEBOOK) { fb.href = CONFIG.FACEBOOK; fb.target = "_blank"; }
  if (ig && CONFIG.INSTAGRAM) { ig.href = CONFIG.INSTAGRAM; ig.target = "_blank"; }
  if (tk && CONFIG.TIKTOK) { tk.href = CONFIG.TIKTOK; tk.target = "_blank"; }
  
  const mapsBtn = $("#btn-maps");
  if (mapsBtn) {
    mapsBtn.href = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(CONFIG.MAPS_QUERY);
    mapsBtn.target = "_blank";
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
   LÓGICA ESPECÍFICA DE LA PÁGINA: PRODUCTOS (productos.html)
   ========================================================================== */
function initProductsPage() {
  const grid = $("#products-grid");
  if (!grid) return;
  
  // Renderizar catálogo completo
  grid.innerHTML = PRODUCTS.map(p => renderProductCard(p)).join("");
  
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
      filterBtns.forEach(b => b.setAttribute("aria-pressed", b === btn));
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
function renderOrderPage() {
  const itemsContainer = $("#order-items-list");
  if (!itemsContainer) return;
  
  const items = Cart.get();
  
  if (items.length === 0) {
    const prodLink = `${pagesPrefix}productos.html`;
    itemsContainer.innerHTML = `
      <div class="empty-cart-state">
        <div class="empty-icon">🧺</div>
        <h4>Tu lista de pedido está vacía</h4>
        <p>Explora nuestros panes y pasteles artesanales para añadirlos a tu pedido.</p>
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
  itemsContainer.innerHTML = items.map((item, idx) => `
    <li class="order-item-row">
      <img src="${rootPrefix}${item.img || 'img/logo.jpg'}" alt="${item.name}" class="order-item-img">
      <div class="order-item-details">
        <b>${item.name}</b>
        <span class="order-item-unit-price">${money(item.price)} / ${item.unit}</span>
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
  `).join("");
  
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
      if (hasWA) {
        window.open(getWaUrl(msg), "_blank", "noopener,noreferrer");
      } else {
        navigator.clipboard?.writeText(msg).then(() => {
          showToast("¡Resumen copiado! Abre WhatsApp y pégalo.");
        });
      }
    };
  }
  
  const copyBtn = $("#btn-copy-summary");
  if (copyBtn) {
    copyBtn.onclick = () => {
      navigator.clipboard?.writeText(msg).then(() => {
        showToast("✓ Resumen del pedido copiado al portapapeles");
      });
    };
  }
}

function initOrderPage() {
  const form = $("#order-form");
  if (!form) return;
  
  // Selector rápido de productos para añadir desde la misma página de pedidos
  const quickSelect = $("#quick-prod-select");
  if (quickSelect) {
    quickSelect.innerHTML = PRODUCTS.map(p => 
      `<option value="${p.id}">${p.name} (${money(p.price)})</option>`
    ).join("");
    
    const quickAddBtn = $("#btn-quick-add");
    if (quickAddBtn) {
      quickAddBtn.onclick = () => {
        const pid = quickSelect.value;
        const qty = Math.max(1, parseInt($("#quick-prod-qty")?.value || 1));
        Cart.add(pid, qty);
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
  
  // Inputs que actualizan el resumen en vivo
  ["order-name", "order-phone", "order-address", "order-time", "order-notes"].forEach(id => {
    const input = $("#" + id);
    if (input) input.oninput = updateWhatsAppSummary;
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
}

/* ==========================================================================
   EVENT DELEGATION GLOBAL
   ========================================================================== */
document.addEventListener("click", e => {
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
});
