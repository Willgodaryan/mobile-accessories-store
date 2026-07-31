/**
 * AUREX Mobile Accessories - Shopping Cart & Drawer Manager
 */

(function () {
    'use strict';

    // State Management
    function getCart() {
        try {
            return JSON.parse(localStorage.getItem('aurexCart')) || [];
        } catch (e) {
            return [];
        }
    }

    function saveCart(cart) {
        localStorage.setItem('aurexCart', JSON.stringify(cart));
        const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
        localStorage.setItem('aurexCartCount', totalCount);
        updateCartBadge(totalCount);
    }

    function updateCartBadge(count) {
        const badgeElements = document.querySelectorAll('#cartCount');
        badgeElements.forEach(badge => {
            badge.textContent = count;
            badge.classList.add('bounce');
            setTimeout(() => badge.classList.remove('bounce'), 300);
        });
    }

    function formatPrice(num) {
        return '₹' + num.toLocaleString('en-IN');
    }

    // Dynamic UI Injection
    function injectCartDrawerUI() {
        if (document.getElementById('aurexCartDrawer')) return;

        // Overlay
        const overlay = document.createElement('div');
        overlay.className = 'cart-overlay';
        overlay.id = 'aurexCartOverlay';
        document.body.appendChild(overlay);

        // Drawer
        const drawer = document.createElement('div');
        drawer.className = 'cart-drawer';
        drawer.id = 'aurexCartDrawer';
        drawer.innerHTML = `
            <div class="cart-header">
                <div class="cart-header-title">
                    <i class="fa-solid fa-bag-shopping"></i>
                    <h3>Your Shopping Bag</h3>
                </div>
                <button class="cart-close-btn" id="aurexCartClose" aria-label="Close Cart">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
            <div class="cart-body" id="aurexCartBody">
                <!-- Cart items rendered dynamically -->
            </div>
            <div class="cart-footer" id="aurexCartFooter">
                <div class="cart-summary-row">
                    <span>Subtotal</span>
                    <strong id="aurexCartSubtotal">₹0</strong>
                </div>
                <div class="cart-summary-row">
                    <span>Shipping</span>
                    <strong style="color: #10b981;">FREE</strong>
                </div>
                <div class="cart-summary-row total">
                    <span>Total</span>
                    <strong id="aurexCartTotal">₹0</strong>
                </div>
                <button class="cart-checkout-btn" id="aurexCheckoutBtn">
                    Proceed to Checkout <i class="fa-solid fa-arrow-right"></i>
                </button>
                <button class="cart-clear-btn" id="aurexClearCartBtn">Clear Shopping Bag</button>
            </div>
        `;
        document.body.appendChild(drawer);

        // Toast Notification
        const toast = document.createElement('div');
        toast.className = 'cart-toast';
        toast.id = 'aurexCartToast';
        toast.innerHTML = `<i class="fa-solid fa-circle-check"></i> <span id="aurexToastMsg">Item added to your bag!</span>`;
        document.body.appendChild(toast);

        // Event listeners for close & overlay
        document.getElementById('aurexCartClose').addEventListener('click', closeCartDrawer);
        overlay.addEventListener('click', closeCartDrawer);

        document.getElementById('aurexCheckoutBtn').addEventListener('click', handleCheckout);
        document.getElementById('aurexClearCartBtn').addEventListener('click', clearCart);
    }

    function openCartDrawer() {
        injectCartDrawerUI();
        renderCartItems();
        document.getElementById('aurexCartOverlay').classList.add('active');
        document.getElementById('aurexCartDrawer').classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeCartDrawer() {
        const overlay = document.getElementById('aurexCartOverlay');
        const drawer = document.getElementById('aurexCartDrawer');
        if (overlay) overlay.classList.remove('active');
        if (drawer) drawer.classList.remove('active');
        document.body.style.overflow = '';
    }

    function showToast(message) {
        injectCartDrawerUI();
        const toast = document.getElementById('aurexCartToast');
        const msgEl = document.getElementById('aurexToastMsg');
        if (msgEl) msgEl.textContent = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 2500);
    }

    // Render Cart Contents
    function renderCartItems() {
        const cartBody = document.getElementById('aurexCartBody');
        const cartFooter = document.getElementById('aurexCartFooter');
        const subtotalEl = document.getElementById('aurexCartSubtotal');
        const totalEl = document.getElementById('aurexCartTotal');
        if (!cartBody) return;

        const cart = getCart();

        if (cart.length === 0) {
            cartBody.innerHTML = `
                <div class="cart-empty">
                    <i class="fa-solid fa-basket-shopping"></i>
                    <h4>Your shopping bag is empty</h4>
                    <p>Discover our high-speed chargers, wireless earbuds, and 925 silver cases.</p>
                    <a href="products.html" class="cart-empty-btn" onclick="window.aurexCloseCart()">Explore Collection</a>
                </div>
            `;
            if (cartFooter) cartFooter.style.display = 'none';
            return;
        }

        if (cartFooter) cartFooter.style.display = 'flex';

        let totalPrice = 0;
        let html = '';

        cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            totalPrice += itemTotal;

            html += `
                <div class="cart-item" data-index="${index}">
                    <img src="${item.image}" alt="${item.title}" class="cart-item-img">
                    <div class="cart-item-details">
                        <span class="cart-item-category">${item.category || 'Accessories'}</span>
                        <div class="cart-item-title">${item.title}</div>
                        <div class="cart-item-price">${formatPrice(item.price)}</div>
                        <div class="cart-qty-ctrl">
                            <button class="cart-qty-btn decrease-qty" data-index="${index}">-</button>
                            <span class="cart-qty-num">${item.quantity}</span>
                            <button class="cart-qty-btn increase-qty" data-index="${index}">+</button>
                        </div>
                    </div>
                    <button class="cart-item-remove remove-item" data-index="${index}" title="Remove Item">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            `;
        });

        cartBody.innerHTML = html;

        if (subtotalEl) subtotalEl.textContent = formatPrice(totalPrice);
        if (totalEl) totalEl.textContent = formatPrice(totalPrice);

        // Attach event listeners for quantity & remove
        cartBody.querySelectorAll('.increase-qty').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.currentTarget.getAttribute('data-index'), 10);
                changeQuantity(idx, 1);
            });
        });

        cartBody.querySelectorAll('.decrease-qty').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.currentTarget.getAttribute('data-index'), 10);
                changeQuantity(idx, -1);
            });
        });

        cartBody.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.currentTarget.getAttribute('data-index'), 10);
                removeItem(idx);
            });
        });
    }

    function changeQuantity(index, delta) {
        const cart = getCart();
        if (cart[index]) {
            cart[index].quantity += delta;
            if (cart[index].quantity <= 0) {
                cart.splice(index, 1);
            }
            saveCart(cart);
            renderCartItems();
        }
    }

    function removeItem(index) {
        const cart = getCart();
        if (cart[index]) {
            const title = cart[index].title;
            cart.splice(index, 1);
            saveCart(cart);
            renderCartItems();
            showToast(`Removed "${title.substring(0, 20)}..." from bag`);
        }
    }

    function clearCart() {
        saveCart([]);
        renderCartItems();
        showToast('Shopping bag cleared!');
    }

    function handleCheckout() {
        const cart = getCart();
        if (cart.length === 0) return;

        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        alert(`🎉 Thank you for your order with AUREX!\n\nOrder Total: ${formatPrice(total)}\nTotal Items: ${cart.reduce((s, i) => s + i.quantity, 0)}\n\nYour items will be dispatched to your location promptly.`);
        
        saveCart([]);
        closeCartDrawer();
    }

    // Add To Cart Action
    function addToCart(productData) {
        const cart = getCart();
        const existingIndex = cart.findIndex(item => item.title === productData.title);

        if (existingIndex > -1) {
            cart[existingIndex].quantity += 1;
        } else {
            cart.push({
                id: productData.id || Date.now().toString(),
                title: productData.title,
                price: productData.price,
                image: productData.image,
                category: productData.category || 'Accessories',
                quantity: 1
            });
        }

        saveCart(cart);
        showToast(`Added "${productData.title.substring(0, 22)}..." to bag`);
        openCartDrawer();
    }

    // Parse Product Data from DOM Element
    function parseProductCard(card, targetButton) {
        const titleEl = card.querySelector('.product-title') || card.querySelector('h3');
        const priceEl = card.querySelector('.price-row .price') || card.querySelector('.price');
        const imgEl = card.querySelector('.product-img') || card.querySelector('img');
        const catEl = card.querySelector('.product-category');

        const title = card.getAttribute('data-title') || (titleEl ? titleEl.textContent.trim() : 'AUREX Accessory');

        // Extract numerical price
        let price = 0;
        if (card.hasAttribute('data-price')) {
            price = parseFloat(card.getAttribute('data-price'));
        } else if (priceEl) {
            const rawPrice = priceEl.textContent.replace(/[^0-9]/g, '');
            price = parseFloat(rawPrice) || 2999;
        }

        const image = card.getAttribute('data-img') || (imgEl ? imgEl.getAttribute('src') : 'media/charger_gan.png');
        const category = card.getAttribute('data-category') || (catEl ? catEl.textContent.trim() : 'Accessories');
        const id = card.getAttribute('data-id') || title.toLowerCase().replace(/\s+/g, '-');

        return { id, title, price, image, category };
    }

    // Initializer
    function initCartSystem() {
        injectCartDrawerUI();

        // Initial badge update
        const cart = getCart();
        const count = cart.reduce((sum, item) => sum + item.quantity, 0);
        updateCartBadge(count);

        // Bind all navbar cart icons
        document.querySelectorAll('.fa-cart-shopping').forEach(icon => {
            const parentLink = icon.closest('a');
            if (parentLink) {
                parentLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    openCartDrawer();
                });
            }
        });

        // Global Search listener across all pages
        document.querySelectorAll('.search-box input, #navbarSearch').forEach(input => {
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const query = input.value.trim();
                    if (query) {
                        window.location.href = `products.html?search=${encodeURIComponent(query)}`;
                    }
                }
            });

            const searchBox = input.closest('.search-box');
            if (searchBox) {
                const icon = searchBox.querySelector('i.fa-magnifying-glass');
                if (icon) {
                    icon.style.cursor = 'pointer';
                    icon.addEventListener('click', () => {
                        const query = input.value.trim();
                        if (query) {
                            window.location.href = `products.html?search=${encodeURIComponent(query)}`;
                        }
                    });
                }
            }
        });

        // Delegate Add To Cart button clicks
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('.add-to-cart');
            if (!btn) return;

            e.preventDefault();
            const card = btn.closest('.product-card') || btn.parentElement;
            if (card) {
                const productData = parseProductCard(card, btn);
                addToCart(productData);

                // Button visual animation feedback
                const origHTML = btn.innerHTML;
                btn.innerHTML = '<i class="fa-solid fa-check"></i> Added!';
                btn.style.background = '#10b981';
                btn.style.color = '#ffffff';
                setTimeout(() => {
                    btn.innerHTML = origHTML;
                    btn.style.background = '';
                    btn.style.color = '';
                }, 1600);
            }
        });

        // Mobile Nav Drawer Logic
        initMobileNavSystem();
    }

    function initMobileNavSystem() {
        // Create mobile nav backdrop overlay if not present
        let navOverlay = document.getElementById('aurexNavOverlay');
        if (!navOverlay) {
            navOverlay = document.createElement('div');
            navOverlay.className = 'nav-overlay';
            navOverlay.id = 'aurexNavOverlay';
            document.body.appendChild(navOverlay);
        }

        const navToggles = document.querySelectorAll('.mobile-nav-toggle, #mobileNavToggle');
        const navLinks = document.querySelector('.nav-links');

        function openMobileNav() {
            if (navLinks) navLinks.classList.add('mobile-active');
            if (navOverlay) navOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
            navToggles.forEach(btn => {
                btn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
                btn.classList.add('active');
            });
        }

        function closeMobileNav() {
            if (navLinks) navLinks.classList.remove('mobile-active');
            if (navOverlay) navOverlay.classList.remove('active');
            document.body.style.overflow = '';
            navToggles.forEach(btn => {
                btn.innerHTML = '<i class="fa-solid fa-bars"></i>';
                btn.classList.remove('active');
            });
        }

        navOverlay.addEventListener('click', closeMobileNav);

        navToggles.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (navLinks && navLinks.classList.contains('mobile-active')) {
                    closeMobileNav();
                } else {
                    openMobileNav();
                }
            });
        });

        // Handle link clicks inside mobile nav
        if (navLinks) {
            navLinks.querySelectorAll('a').forEach(link => {
                const parentLi = link.closest('.dropdown');
                if (parentLi && link.parentElement === parentLi) {
                    link.addEventListener('click', (e) => {
                        if (window.innerWidth <= 992) {
                            // Toggle dropdown inside mobile drawer
                            e.preventDefault();
                            parentLi.classList.toggle('mobile-open');
                        }
                    });
                } else {
                    link.addEventListener('click', () => {
                        if (window.innerWidth <= 992) {
                            closeMobileNav();
                        }
                    });
                }
            });
        }

        // Reset state when resizing to desktop
        window.addEventListener('resize', () => {
            if (window.innerWidth > 992) {
                closeMobileNav();
            }
        });
    }

    // Export global helpers if needed
    window.aurexOpenCart = openCartDrawer;
    window.aurexCloseCart = closeCartDrawer;
    window.aurexAddToCart = addToCart;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCartSystem);
    } else {
        initCartSystem();
    }
})();

