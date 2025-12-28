const STORAGE_KEYS = {
  MENU: "biryani_menu",
  SALES: "biryani_sales",
};

const DEFAULT_MENU = [
  {
    name: "Mutton Briyani",
    category: "biryani",
    price: 280,
    image:
      "https://images.unsplash.com/photo-1599305090598-fe179161e13c?auto=format&w=800",
    desc: "Slow cooked with seeraga samba rice.",
  },
  {
    name: "Chicken Briyani",
    category: "biryani",
    price: 220,
    image:
      "https://images.unsplash.com/photo-1608039829574-5c7421fdbfc2?auto=format&w=800",
    desc: "Classic dum briyani with tender chicken.",
  },
  {
    name: "Prawn Briyani",
    category: "biryani",
    price: 320,
    image:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&w=800",
    desc: "Juicy prawns tossed in aromatic masala.",
  },
  {
    name: "Chicken 65 Briyani",
    category: "biryani",
    price: 260,
    image:
      "https://images.unsplash.com/photo-1608039829574-5c7421fdbfc2?auto=format&w=800",
    desc: "Briyani topped with crispy chicken 65.",
  },
  {
    name: "Chilli Chicken",
    category: "starter",
    price: 200,
    image:
      "https://images.unsplash.com/photo-1608039829574-5c7421fdbfc2?auto=format&w=800",
    desc: "Fiery Indo-Chinese classic.",
  },
  {
    name: "Prawn Thokku",
    category: "gravy",
    price: 240,
    image:
      "https://images.unsplash.com/photo-1601312378427-446a31ff88ec?auto=format&w=800",
    desc: "Chettinad style spicy prawn fry.",
  },
  {
    name: "Mutton Sukka",
    category: "starter",
    price: 250,
    image:
      "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&w=800",
    desc: "Peppery dry-fried mutton chunks.",
  },
].map((item) => ({ ...item, id: crypto.randomUUID() }));

const state = {
  menu: [],
  cart: new Map(),
  sales: [],
};

const elements = {
  menuForm: document.getElementById("menu-form"),
  menuId: document.getElementById("menu-id"),
  menuName: document.getElementById("menu-name"),
  menuCategory: document.getElementById("menu-category"),
  menuPrice: document.getElementById("menu-price"),
  menuImage: document.getElementById("menu-image"),
  menuDesc: document.getElementById("menu-desc"),
  menuTableBody: document.querySelector("#menu-table tbody"),
  menuGallery: document.getElementById("menu-gallery"),
  addNewButton: document.getElementById("add-new-menu"),
  cancelEdit: document.getElementById("cancel-edit"),
  cartTableBody: document.querySelector("#cart-table tbody"),
  subtotal: document.getElementById("subtotal"),
  tax: document.getElementById("tax"),
  grandTotal: document.getElementById("grand-total"),
  clearCart: document.getElementById("clear-cart"),
  printBill: document.getElementById("print-bill"),
  payNow: document.getElementById("pay-now"),
  payNowTop: document.getElementById("pay-now-top"),
  printBillTop: document.getElementById("print-bill-top"),
  qrModal: document.getElementById("qr-modal"),
  closeQr: document.getElementById("close-qr"),
  reportTableBody: document.querySelector("#report-table tbody"),
  exportReport: document.getElementById("export-report"),
  reportCanvas: document.getElementById("report-chart"),
};

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

function loadState() {
  const storedMenu = localStorage.getItem(STORAGE_KEYS.MENU);
  const storedSales = localStorage.getItem(STORAGE_KEYS.SALES);
  state.menu = storedMenu ? JSON.parse(storedMenu) : DEFAULT_MENU;
  state.sales = storedSales ? JSON.parse(storedSales) : [];
}

function persistMenu() {
  localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(state.menu));
}

function persistSales() {
  localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(state.sales));
}

function resetForm() {
  elements.menuForm.reset();
  elements.menuId.value = "";
  elements.menuName.focus();
}

function handleMenuSubmit(event) {
  event.preventDefault();
  const payload = {
    id: elements.menuId.value || crypto.randomUUID(),
    name: elements.menuName.value.trim(),
    category: elements.menuCategory.value,
    price: Number(elements.menuPrice.value),
    image:
      elements.menuImage.value ||
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&w=800",
    desc: elements.menuDesc.value.trim(),
  };

  if (!payload.name || payload.price <= 0) {
    alert("Please provide a valid name and price.");
    return;
  }

  const itemIndex = state.menu.findIndex((item) => item.id === payload.id);
  if (itemIndex >= 0) {
    state.menu[itemIndex] = payload;
  } else {
    state.menu.push(payload);
  }
  persistMenu();
  renderMenu();
  resetForm();
}

function handleMenuAction(event) {
  const target = event.target;
  if (!target.matches("button[data-action]")) return;
  const { action, id } = target.dataset;
  if (action === "edit") {
    const item = state.menu.find((entry) => entry.id === id);
    if (!item) return;
    elements.menuId.value = item.id;
    elements.menuName.value = item.name;
    elements.menuCategory.value = item.category;
    elements.menuPrice.value = item.price;
    elements.menuImage.value = item.image;
    elements.menuDesc.value = item.desc;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  if (action === "delete") {
    if (confirm("Delete this menu item?")) {
      state.menu = state.menu.filter((entry) => entry.id !== id);
      persistMenu();
      renderMenu();
    }
  }
}

function createMenuRow(item) {
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td>${item.name}</td>
    <td>${capitalize(item.category)}</td>
    <td>${currency.format(item.price)}</td>
    <td>
      <button class="ghost small" data-action="edit" data-id="${item.id}">Edit</button>
      <button class="ghost small" data-action="delete" data-id="${item.id}">Delete</button>
    </td>
  `;
  return tr;
}

function createMenuCard(item) {
  const template = document.getElementById("menu-card-template");
  const node = template.content.cloneNode(true);
  const card = node.querySelector(".menu-card");
  card.querySelector("img").src = item.image;
  card.querySelector("img").alt = item.name;
  card.querySelector("h3").textContent = item.name;
  card.querySelector(".desc").textContent = item.desc || "Chef's specialty.";
  card.querySelector(".price").textContent = currency.format(item.price);
  const btn = card.querySelector(".add-cart");
  btn.dataset.id = item.id;
  btn.addEventListener("click", () => addToCart(item.id));
  return node;
}

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function renderMenu() {
  elements.menuTableBody.innerHTML = "";
  elements.menuGallery.innerHTML = "";
  state.menu.forEach((item) => {
    elements.menuTableBody.appendChild(createMenuRow(item));
    elements.menuGallery.appendChild(createMenuCard(item));
  });
}

function addToCart(itemId) {
  const item = state.menu.find((entry) => entry.id === itemId);
  if (!item) return;
  const existing = state.cart.get(itemId) || { ...item, qty: 0 };
  existing.qty += 1;
  state.cart.set(itemId, existing);
  renderCart();
}

function updateCartQuantity(itemId, qty) {
  const entry = state.cart.get(itemId);
  if (!entry) return;
  if (qty <= 0) {
    state.cart.delete(itemId);
  } else {
    entry.qty = qty;
    state.cart.set(itemId, entry);
  }
  renderCart();
}

function removeCartItem(itemId) {
  state.cart.delete(itemId);
  renderCart();
}

function renderCart() {
  elements.cartTableBody.innerHTML = "";
  let subtotal = 0;
  state.cart.forEach((item) => {
    const row = document.createElement("tr");
    const lineTotal = item.qty * item.price;
    subtotal += lineTotal;
    row.innerHTML = `
      <td>${item.name}</td>
      <td>
        <input type="number" min="1" value="${item.qty}" data-id="${item.id}" class="qty-input"/>
      </td>
      <td>${currency.format(item.price)}</td>
      <td>${currency.format(lineTotal)}</td>
      <td>
        <button class="ghost small" data-remove="${item.id}">×</button>
      </td>
    `;
    elements.cartTableBody.appendChild(row);
  });
  const tax = subtotal * 0.05;
  const total = subtotal + tax;
  elements.subtotal.textContent = currency.format(subtotal);
  elements.tax.textContent = currency.format(tax);
  elements.grandTotal.textContent = currency.format(total);
}

function handleCartInput(event) {
  const target = event.target;
  if (target.matches(".qty-input")) {
    const id = target.dataset.id;
    updateCartQuantity(id, Number(target.value));
  }
  if (target.matches("button[data-remove]")) {
    removeCartItem(target.dataset.remove);
  }
}

function clearCart() {
  state.cart.clear();
  renderCart();
}

function printBill() {
  if (!state.cart.size) {
    alert("Cart is empty.");
    return;
  }
  window.print();
}

function toggleQrModal(open) {
  elements.qrModal.classList.toggle("hidden", !open);
}

function recordSale() {
  if (!state.cart.size) {
    alert("Cart is empty.");
    return;
  }
  const order = {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    items: Array.from(state.cart.values()).map(({ id, name, qty, price }) => ({
      id,
      name,
      qty,
      price,
    })),
    total: Array.from(state.cart.values()).reduce(
      (sum, item) => sum + item.qty * item.price,
      0
    ),
  };
  state.sales.push(order);
  persistSales();
  renderReport();
  toggleQrModal(true);
  clearCart();
}

function aggregateSales() {
  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  });
  const aggregates = {};
  state.sales.forEach((sale) => {
    const month = formatter.format(sale.timestamp);
    if (!aggregates[month]) {
      aggregates[month] = { revenue: 0, orders: 0 };
    }
    aggregates[month].orders += 1;
    aggregates[month].revenue += sale.total * 1.05; // include tax
  });
  return aggregates;
}

function renderReport() {
  const aggregates = aggregateSales();
  elements.reportTableBody.innerHTML = "";
  Object.entries(aggregates).forEach(([month, data]) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${month}</td>
      <td>${data.orders}</td>
      <td>${currency.format(data.revenue)}</td>
    `;
    elements.reportTableBody.appendChild(row);
  });
  drawChart(aggregates);
}

function drawChart(aggregates) {
  const ctx = elements.reportCanvas.getContext("2d");
  ctx.clearRect(0, 0, elements.reportCanvas.width, elements.reportCanvas.height);
  const entries = Object.entries(aggregates);
  if (!entries.length) return;
  const padding = 20;
  const width = elements.reportCanvas.width;
  const height = elements.reportCanvas.height;
  const barWidth = (width - padding * 2) / entries.length - 10;
  const maxRevenue = Math.max(...entries.map(([, data]) => data.revenue));
  entries.forEach(([month, data], idx) => {
    const x = padding + idx * (barWidth + 10);
    const barHeight = (data.revenue / maxRevenue) * (height - padding * 2);
    const y = height - padding - barHeight;
    ctx.fillStyle = "#f97316";
    ctx.fillRect(x, y, barWidth, barHeight);
    ctx.fillStyle = "#fff";
    ctx.font = "12px Segoe UI";
    ctx.fillText(month, x, height - 5);
  });
}

function exportCsv() {
  const aggregates = aggregateSales();
  const rows = [["Month", "Orders", "Revenue"]];
  Object.entries(aggregates).forEach(([month, data]) => {
    rows.push([month, data.orders, data.revenue.toFixed(2)]);
  });
  const csvContent = rows.map((row) => row.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "biryani-monthly-report.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function init() {
  loadState();
  renderMenu();
  renderCart();
  renderReport();

  elements.menuForm.addEventListener("submit", handleMenuSubmit);
  elements.menuTableBody.addEventListener("click", handleMenuAction);
  elements.addNewButton.addEventListener("click", resetForm);
  elements.cancelEdit.addEventListener("click", resetForm);
  elements.cartTableBody.addEventListener("input", handleCartInput);
  elements.cartTableBody.addEventListener("click", handleCartInput);
  elements.clearCart.addEventListener("click", clearCart);
  elements.printBill.addEventListener("click", printBill);
  elements.printBillTop.addEventListener("click", printBill);
  elements.payNow.addEventListener("click", recordSale);
  elements.payNowTop.addEventListener("click", recordSale);
  elements.closeQr.addEventListener("click", () => toggleQrModal(false));
  elements.qrModal.addEventListener("click", (event) => {
    if (event.target === elements.qrModal) toggleQrModal(false);
  });
  elements.exportReport.addEventListener("click", exportCsv);
}

document.addEventListener("DOMContentLoaded", init);


