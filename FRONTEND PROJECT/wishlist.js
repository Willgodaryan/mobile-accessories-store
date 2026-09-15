/**
 * AUREX Mobile Accessories - Wishlist Manager
 */

(function () {
    'use strict';

    // State Management
    function getWishlist() {
        try {
            return JSON.parse(localStorage.getItem('aurexWishlist')) || [];
        } catch (e) {
            return [];
        }
    }

    function saveWishlist(wishlist) {
        localStorage.setItem('aurexWishlist', JSON.stringify(wishlist));
        updateWishlistBadge(wishlist.length);
        updateWishlistButtonsUI();
    }

    function updateWishlistBadge(count) {
        const badgeElements = document.querySelectorAll('#wishlistCount');
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
    function injectWishlistDrawerUI() {
        if (document.getElementById('aurexWishlistDrawer')) return;

        // Overlay
        const overlay = document.createElement('div');
        overlay.className = 'cart-overlay';
        overlay.id = 'aurexWishlistOverlay';
        overlay.style.zIndex = '99998'; // slightly below drawer
        document.body.appendChild(overlay);

        // Drawer
        const drawer = document.createElement('div');
        drawer.className = 'cart-drawer';
        drawer.id = 'aurexWishlistDrawer';
        drawer.style.zIndex = '99999';
        drawer.innerHTML = `
            <div class="cart-header">
                <div class="cart-header-title">
                    <i class="fa-solid fa-heart"></i>
                    <h3>Your Wishlist</h3>
                </div>
                <button class="cart-close-btn" id="aurexWishlistClose" aria-label="Close Wishlist">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
            <div class="cart-body" id="aurexWishlistBody">
                <!-- Wishlist items rendered dynamically -->
            </div>
            <div class="cart-footer" id="aurexWishlistFooter">
                <button class="cart-clear-btn" id="aurexClearWishlistBtn" style="margin-top: 0;">Clear Wishlist</button>
            </div>
        `;
        document.body.appendChild(drawer);

        // Toast Notification for Wishlist
        const toast = document.createElement('div');
        toast.className = 'cart-toast';
        toast.id = 'aurexWishlistToast';
        toast.style.zIndex = '100000';
        toast.innerHTML = `<i class="fa-solid fa-circle-check"></i> <span id="aurexWishlistToastMsg"></span>`;
        document.body.appendChild(toast);

        // Event listeners for close & overlay
        document.getElementById('aurexWishlistClose').addEventListener('click', closeWishlistDrawer);
        overlay.addEventListener('click', closeWishlistDrawer);
        document.getElementById('aurexClearWishlistBtn').addEventListener('click', clearWishlist);
    }

    function openWishlistDrawer() {
        injectWishlistDrawerUI();
        renderWishlistItems();
        document.getElementById('aurexWishlistOverlay').classList.add('active');
        document.getElementById('aurexWishlistDrawer').classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeWishlistDrawer() {
        const overlay = document.getElementById('aurexWishlistOverlay');
        const drawer = document.getElementById('aurexWishlistDrawer');
        if (overlay) overlay.classList.remove('active');
        if (drawer) drawer.classList.remove('active');
        document.body.style.overflow = '';
    }

    function showWishlistToast(message) {
        injectWishlistDrawerUI();
        const toast = document.getElementById('aurexWishlistToast');
        const msgEl = document.getElementById('aurexWishlistToastMsg');
        if (msgEl) msgEl.textContent = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 2500);
    }

    // Render Wishlist Contents
    function renderWishlistItems() {
        const wishlistBody = document.getElementById('aurexWishlistBody');
        const wishlistFooter = document.getElementById('aurexWishlistFooter');
        if (!wishlistBody) return;

        const wishlist = getWishlist();

        if (wishlist.length === 0) {
            wishlistBody.innerHTML = `
                <div class="cart-empty">
                    <i class="fa-regular fa-heart"></i>
                    <h4>Your wishlist is empty</h4>
                    <p>Save items you love to your wishlist.</p>
                    <a href="products.html" class="cart-empty-btn" onclick="window.aurexCloseWishlist()">Explore Collection</a>
                </div>
            `;
            if (wishlistFooter) wishlistFooter.style.display = 'none';
            return;
        }

        if (wishlistFooter) wishlistFooter.style.display = 'block';

        let html = '';

        wishlist.forEach((item, index) => {
            html += `
                <div class="cart-item" data-index="${index}">
                    <img src="${item.image}" alt="${item.title}" class="cart-item-img">
                    <div class="cart-item-details">
                        <span class="cart-item-category">${item.category || 'Accessories'}</span>
                        <div class="cart-item-title">${item.title}</div>
                        <div class="cart-item-price">${formatPrice(item.price)}</div>
                        <button class="cart-checkout-btn move-to-cart" data-index="${index}" style="margin-top: 10px; padding: 8px 12px; font-size: 0.85rem;">
                            Move to Cart
                        </button>
                    </div>
                    <button class="cart-item-remove remove-wishlist-item" data-index="${index}" title="Remove Item">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            `;
        });

        wishlistBody.innerHTML = html;

        // Attach event listeners
        wishlistBody.querySelectorAll('.remove-wishlist-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.currentTarget.getAttribute('data-index'), 10);
                removeWishlistItem(idx);
            });
        });

        wishlistBody.querySelectorAll('.move-to-cart').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.currentTarget.getAttribute('data-index'), 10);
                moveItemToCart(idx);
            });
        });
    }

    function removeWishlistItem(index) {
        const wishlist = getWishlist();
        if (wishlist[index]) {
            const title = wishlist[index].title;
            wishlist.splice(index, 1);
            saveWishlist(wishlist);
            renderWishlistItems();
            showWishlistToast(`Removed "${title.substring(0, 20)}..." from wishlist`);
        }
    }

    function moveItemToCart(index) {
        const wishlist = getWishlist();
        if (wishlist[index]) {
            const item = wishlist[index];
            if (window.aurexAddToCart) {
                window.aurexAddToCart(item);
                removeWishlistItem(index);
                closeWishlistDrawer();
            } else {
                showWishlistToast('Cart system not found.');
            }
        }
    }

    function clearWishlist() {
        saveWishlist([]);
        renderWishlistItems();
        showWishlistToast('Wishlist cleared!');
    }

    // Toggle Wishlist Action (from product card)
    function toggleWishlist(productData) {
        const wishlist = getWishlist();
        const existingIndex = wishlist.findIndex(item => item.title === productData.title);

        if (existingIndex > -1) {
            wishlist.splice(existingIndex, 1);
            saveWishlist(wishlist);
            showWishlistToast(`Removed "${productData.title.substring(0, 22)}..." from wishlist`);
        } else {
            wishlist.push({
                id: productData.id || Date.now().toString(),
                title: productData.title,
                price: productData.price,
                image: productData.image,
                category: productData.category || 'Accessories'
            });
            saveWishlist(wishlist);
            showWishlistToast(`Added "${productData.title.substring(0, 22)}..." to wishlist`);
        }
    }

    // Parse Product Data from DOM Element
    function parseProductCard(card) {
        const titleEl = card.querySelector('.product-title') || card.querySelector('h3');
        const priceEl = card.querySelector('.price-row .price') || card.querySelector('.price');
        const imgEl = card.querySelector('.product-img') || card.querySelector('img');
        const catEl = card.querySelector('.product-category');

        const title = card.getAttribute('data-title') || (titleEl ? titleEl.textContent.trim() : 'AUREX Accessory');

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

    function updateWishlistButtonsUI() {
        const wishlist = getWishlist();
        document.querySelectorAll('.wishlist-btn').forEach(btn => {
            const card = btn.closest('.product-card') || btn.parentElement;
            if (card) {
                const productData = parseProductCard(card);
                const isInWishlist = wishlist.some(item => item.title === productData.title);
                const icon = btn.querySelector('i');
                if (isInWishlist) {
                    btn.classList.add('active');
                    if(icon) {
                        icon.classList.remove('fa-regular');
                        icon.classList.add('fa-solid');
                    }
                } else {
                    btn.classList.remove('active');
                    if(icon) {
                        icon.classList.remove('fa-solid');
                        icon.classList.add('fa-regular');
                    }
                }
            }
        });
    }

    // Initializer
    function initWishlistSystem() {
        injectWishlistDrawerUI();

        // Initial badge and UI update
        const wishlist = getWishlist();
        updateWishlistBadge(wishlist.length);
        updateWishlistButtonsUI();

        // Bind all navbar heart icons
        document.querySelectorAll('.fa-heart').forEach(icon => {
            const parentLink = icon.closest('a');
            if (parentLink && !parentLink.classList.contains('wishlist-btn')) { // ensure it's the nav link
                parentLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    openWishlistDrawer();
                });
            }
        });

        // Delegate Wishlist Toggle button clicks
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('.wishlist-btn');
            if (!btn) return;

            e.preventDefault();
            const card = btn.closest('.product-card') || btn.parentElement;
            if (card) {
                const productData = parseProductCard(card);
                toggleWishlist(productData);
            }
        });
    }

    // Export global helpers if needed
    window.aurexOpenWishlist = openWishlistDrawer;
    window.aurexCloseWishlist = closeWishlistDrawer;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initWishlistSystem);
    } else {
        initWishlistSystem();
    }
})();
