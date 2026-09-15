(function() {
    'use strict';

    const defaultProducts = [
        {
            id: 'iphone17-promax-silver-peacock',
            category: '925 Silver Cases',
            price: 12999,
            oldPrice: 15999,
            title: 'iPhone 17 Pro Max 92.5 Sterling Silver Peacock Case',
            image: 'media/silver_peacock_real.jpg'
        },
        {
            id: 'magsafe-frosted-case',
            category: 'Phone Cases',
            price: 3999,
            oldPrice: 4999,
            title: 'iPhone 16 Pro MagSafe Frosted Matte Case',
            image: 'media/case_magsafe.png'
        },
        {
            id: 'magsafe-powerbank-10k',
            category: 'Power Banks',
            price: 4499,
            oldPrice: 5999,
            title: 'MagSafe 10,000mAh Ultra-Fast Power Bank',
            image: 'media/powerbank_10k.png'
        },
        {
            id: 'gan-charger-65w',
            category: 'Chargers',
            price: 2999,
            oldPrice: 3999,
            title: '65W GaN Fast Charger Dual USB-C Port',
            image: 'media/charger_gan.png'
        },
        {
            id: 'iphone17-pro-silver-elephant',
            category: '925 Silver Cases',
            price: 8000,
            oldPrice: 10999,
            title: 'iPhone 17 Pro 92.5 Sterling Silver Elephant Case',
            image: 'media/silver_elephant_real.jpg'
        },
        {
            id: 'anc-earbuds-pro',
            category: 'Earbuds',
            price: 5999,
            oldPrice: 7999,
            title: 'Active Noise Cancelling Wireless Earbuds Pro',
            image: 'media/earbuds_pro.png'
        },
        {
            id: 'leather-magsafe-wallet',
            category: 'Phone Cases',
            price: 2499,
            oldPrice: 3299,
            title: 'Premium Genuine Leather MagSafe Wallet & Stand',
            image: 'media/case_leather.png'
        },
        {
            id: 'silver-engraved-armor',
            category: '925 Silver Cases',
            price: 11999,
            oldPrice: 14499,
            title: '925 Sterling Silver Engraved Armor Case',
            image: 'media/product1.png'
        },
        {
            id: '3in1-wireless-charger',
            category: 'Chargers',
            price: 3499,
            oldPrice: 4499,
            title: '3-in-1 Magnetic Foldable Wireless Charging Station',
            image: 'media/charger_3in1.png'
        },
        {
            id: 'armor-bumper-case',
            category: 'Phone Cases',
            price: 1999,
            oldPrice: 2499,
            title: 'Heavy Duty Shockproof Armor Bumper Case',
            image: 'media/case_armor.png'
        },
        {
            id: 'powerbank-5k-slim',
            category: 'Power Banks',
            price: 2799,
            oldPrice: 3499,
            title: 'Ultra-Slim 5,000mAh Magnetic Power Bank',
            image: 'media/powerbank_5k.png'
        },
        {
            id: 'carbon-magsafe-case',
            category: 'Phone Cases',
            price: 2999,
            oldPrice: 3799,
            title: 'Aramid Carbon Fiber Slim MagSafe Case',
            image: 'media/case_carbon.png'
        },
        {
            id: 'silver-royal-armor',
            category: '925 Silver Cases',
            price: 15999,
            oldPrice: 19999,
            title: '925 Silver Royal Armor Edition Case',
            image: 'media/CASE.png'
        }
    ];

    if (!localStorage.getItem('aurexProducts')) {
        localStorage.setItem('aurexProducts', JSON.stringify(defaultProducts));
    }

    // Expose a global getter for products
    window.getAurexProducts = function() {
        try {
            return JSON.parse(localStorage.getItem('aurexProducts')) || [];
        } catch (e) {
            return [];
        }
    };
})();
