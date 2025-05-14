// Sample store data (in a real app, this would be loaded from a database)
const storeData = {
    name: "Fashion Store",
    logo: "images/demo-logo.svg",
    whatsappNumber: "919876543210", // Format: country code + number without +
    products: [
        {
            id: 1,
            name: "Summer T-Shirt",
            price: 599,
            description: "Comfortable cotton t-shirt perfect for summer. Available in multiple colors and sizes.",
            image: "images/product1.jpg"
        },
        {
            id: 2,
            name: "Denim Jeans",
            price: 1299,
            description: "Classic denim jeans with a modern fit. Durable and stylish for everyday wear.",
            image: "images/product2.jpg"
        },
        {
            id: 3,
            name: "Casual Sneakers",
            price: 899,
            description: "Lightweight and comfortable sneakers for daily use. Non-slip sole and breathable material.",
            image: "images/product3.jpg"
        },
        {
            id: 4,
            name: "Leather Wallet",
            price: 499,
            description: "Genuine leather wallet with multiple card slots and a coin pocket. Slim design fits perfectly in your pocket.",
            image: "images/product4.jpg"
        }
    ]
};

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the store
    initializeStore();
    
    // Load products
    loadProducts();
    
    // Set up modal functionality
    setupModal();
});

// Initialize store details
function initializeStore() {
    // Set store name and logo
    document.getElementById('storeName').textContent = storeData.name;
    document.getElementById('storeLogo').src = storeData.logo;
    document.title = `${storeData.name} - WhatsApp Store`;
}

// Load products into the grid
function loadProducts() {
    const productsContainer = document.getElementById('productsContainer');
    
    // Clear container
    productsContainer.innerHTML = '';
    
    if (storeData.products.length === 0) {
        // Show empty state if no products
        productsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-shopping-bag"></i>
                <h3>No Products Yet</h3>
                <p>This store hasn't added any products yet.</p>
            </div>
        `;
        return;
    }
    
    // Add each product to the grid
    storeData.products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.setAttribute('data-product-id', product.id);
        
        productCard.innerHTML = `
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}">
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <p class="product-price">₹${product.price}</p>
                <p class="product-description">${product.description}</p>
                <a href="#" class="whatsapp-btn" data-product-id="${product.id}">
                    <i class="fab fa-whatsapp"></i> Buy on WhatsApp
                </a>
            </div>
        `;
        
        productsContainer.appendChild(productCard);
        
        // Add click event to the product card
        productCard.addEventListener('click', function(e) {
            // Don't open modal if WhatsApp button was clicked
            if (e.target.closest('.whatsapp-btn')) {
                e.preventDefault();
                const productId = this.getAttribute('data-product-id');
                openWhatsApp(productId);
                return;
            }
            
            const productId = this.getAttribute('data-product-id');
            openProductModal(productId);
        });
    });
}

// Set up modal functionality
function setupModal() {
    const modal = document.getElementById('productModal');
    const closeBtn = document.querySelector('.close-modal');
    const whatsappBtn = document.getElementById('whatsappOrderBtn');
    
    // Close modal when clicking the X
    closeBtn.addEventListener('click', function() {
        modal.style.display = 'none';
    });
    
    // Close modal when clicking outside the content
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // WhatsApp order button in modal
    whatsappBtn.addEventListener('click', function() {
        const productId = this.getAttribute('data-product-id');
        openWhatsApp(productId);
    });
}

// Open product modal
function openProductModal(productId) {
    const product = storeData.products.find(p => p.id == productId);
    if (!product) return;
    
    // Set modal content
    document.getElementById('modalProductImage').src = product.image;
    document.getElementById('modalProductName').textContent = product.name;
    document.getElementById('modalProductPrice').textContent = `₹${product.price}`;
    document.getElementById('modalProductDescription').textContent = product.description;
    document.getElementById('whatsappOrderBtn').setAttribute('data-product-id', productId);
    
    // Show modal
    document.getElementById('productModal').style.display = 'block';
}

// Open WhatsApp with prefilled message
function openWhatsApp(productId) {
    const product = storeData.products.find(p => p.id == productId);
    if (!product) return;
    
    // Create WhatsApp message
    const message = `Hello! I would like to order:\n\n*${product.name}*\nPrice: ₹${product.price}\n\nThank you!`;
    
    // Encode message for URL
    const encodedMessage = encodeURIComponent(message);
    
    // Create WhatsApp URL
    const whatsappUrl = `https://wa.me/${storeData.whatsappNumber}?text=${encodedMessage}`;
    
    // Open WhatsApp in new tab
    window.open(whatsappUrl, '_blank');
}