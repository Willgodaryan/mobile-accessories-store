document.addEventListener('DOMContentLoaded', () => {
    // Utilities
    function formatPrice(num) {
        return '₹' + parseInt(num).toLocaleString('en-IN');
    }

    // Storage Getters
    function getProducts() {
        return window.getAurexProducts ? window.getAurexProducts() : [];
    }
    function saveProducts(products) {
        localStorage.setItem('aurexProducts', JSON.stringify(products));
        renderProducts();
        updateDashboardStats();
    }

    function getOrders() {
        try {
            return JSON.parse(localStorage.getItem('aurexOrders')) || [];
        } catch (e) {
            return [];
        }
    }
    function saveOrders(orders) {
        localStorage.setItem('aurexOrders', JSON.stringify(orders));
        renderOrders();
        updateDashboardStats();
    }

    function getMessages() {
        try {
            return JSON.parse(localStorage.getItem('aurexMessages')) || [];
        } catch (e) {
            return [];
        }
    }

    function getWishlistCount() {
        try {
            const w = JSON.parse(localStorage.getItem('aurexWishlist')) || [];
            return w.length;
        } catch(e) {
            return 0;
        }
    }

    // Navigation
    const navItems = document.querySelectorAll('.nav-item[data-tab]');
    const tabPanes = document.querySelectorAll('.tab-pane');
    const pageTitle = document.getElementById('pageTitle');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(n => n.classList.remove('active'));
            tabPanes.forEach(t => t.classList.remove('active'));
            
            item.classList.add('active');
            const tabId = item.getAttribute('data-tab');
            document.getElementById('tab-' + tabId).classList.add('active');
            
            pageTitle.textContent = item.textContent.trim();
        });
    });

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', () => {
        sessionStorage.removeItem('adminLoggedIn');
        window.location.href = 'index.html';
    });

    // Dashboard Stats
    function updateDashboardStats() {
        document.getElementById('statProducts').textContent = getProducts().length;
        document.getElementById('statOrders').textContent = getOrders().length;
        document.getElementById('statMessages').textContent = getMessages().length;
        document.getElementById('statWishlist').textContent = getWishlistCount();
    }

    // --- PRODUCTS MANAGEMENT ---
    function renderProducts() {
        const tbody = document.getElementById('productsTableBody');
        const products = getProducts();
        tbody.innerHTML = '';
        
        products.forEach((p, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><img src="${p.image}" alt="${p.title}"></td>
                <td><strong>${p.title}</strong></td>
                <td>${p.category}</td>
                <td>${formatPrice(p.price)}</td>
                <td>
                    <div class="action-btns">
                        <button class="btn btn-edit" onclick="editProduct(${index})"><i class="fa-solid fa-pen"></i></button>
                        <button class="btn btn-danger" onclick="deleteProduct(${index})"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    // Modal logic
    const modal = document.getElementById('productModal');
    const form = document.getElementById('productForm');

    document.getElementById('addProductBtn').addEventListener('click', () => {
        document.getElementById('productModalTitle').textContent = 'Add Product';
        form.reset();
        document.getElementById('prodId').value = '';
        modal.classList.add('active');
    });

    document.getElementById('closeModalBtn').addEventListener('click', () => {
        modal.classList.remove('active');
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const products = getProducts();
        const index = document.getElementById('prodId').value;
        
        const newProd = {
            title: document.getElementById('prodTitle').value.trim(),
            category: document.getElementById('prodCategory').value.trim(),
            price: parseFloat(document.getElementById('prodPrice').value),
            oldPrice: parseFloat(document.getElementById('prodOldPrice').value) || 0,
            image: document.getElementById('prodImage').value.trim(),
        };

        if (index !== '') {
            // Edit
            newProd.id = products[index].id;
            products[index] = newProd;
        } else {
            // Add
            newProd.id = newProd.title.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
            products.unshift(newProd);
        }

        saveProducts(products);
        modal.classList.remove('active');
    });

    window.editProduct = function(index) {
        const products = getProducts();
        const p = products[index];
        document.getElementById('productModalTitle').textContent = 'Edit Product';
        document.getElementById('prodId').value = index;
        document.getElementById('prodTitle').value = p.title;
        document.getElementById('prodCategory').value = p.category;
        document.getElementById('prodPrice').value = p.price;
        document.getElementById('prodOldPrice').value = p.oldPrice || '';
        document.getElementById('prodImage').value = p.image;
        modal.classList.add('active');
    };

    window.deleteProduct = function(index) {
        if (confirm('Are you sure you want to delete this product?')) {
            const products = getProducts();
            products.splice(index, 1);
            saveProducts(products);
        }
    };


    // --- ORDERS MANAGEMENT ---
    function renderOrders() {
        const tbody = document.getElementById('ordersTableBody');
        const orders = getOrders();
        tbody.innerHTML = '';
        
        // Render in reverse chronological
        [...orders].reverse().forEach((order, rIndex) => {
            const actualIndex = orders.length - 1 - rIndex;
            const tr = document.createElement('tr');
            
            // Format items
            let itemsHtml = order.items.map(i => `${i.quantity}x ${i.title}`).join('<br>');
            
            // Status class
            let sClass = 'status-pending';
            if(order.status === 'Confirmed') sClass = 'status-confirmed';
            if(order.status === 'Shipped') sClass = 'status-shipped';
            if(order.status === 'Delivered') sClass = 'status-delivered';

            tr.innerHTML = `
                <td><strong>#${order.id}</strong><br><small style="color:#888">${order.date}</small></td>
                <td style="font-size:0.85rem">${itemsHtml}</td>
                <td><strong>${formatPrice(order.total)}</strong></td>
                <td><span class="status-badge ${sClass}">${order.status}</span></td>
                <td>
                    <select onchange="updateOrderStatus(${actualIndex}, this.value)" style="padding:5px; border-radius:4px; background:#222; color:#fff; border:1px solid #444;">
                        <option value="Pending" ${order.status === 'Pending' ? 'selected' : ''}>Pending</option>
                        <option value="Confirmed" ${order.status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
                        <option value="Shipped" ${order.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
                        <option value="Delivered" ${order.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                    </select>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    window.updateOrderStatus = function(index, newStatus) {
        const orders = getOrders();
        if (orders[index]) {
            orders[index].status = newStatus;
            saveOrders(orders);
        }
    };


    // --- MESSAGES MANAGEMENT ---
    function renderMessages() {
        const tbody = document.getElementById('messagesTableBody');
        const messages = getMessages();
        tbody.innerHTML = '';
        
        [...messages].reverse().forEach((msg) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="white-space:nowrap">${msg.date}</td>
                <td><strong>${msg.name}</strong></td>
                <td><a href="mailto:${msg.email}" style="color:#4285f4; text-decoration:none;">${msg.email}</a></td>
                <td>${msg.subject || 'General'}</td>
                <td style="max-width:300px; font-size:0.9rem;">${msg.message}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    // Initialize
    updateDashboardStats();
    renderProducts();
    renderOrders();
    renderMessages();
});
