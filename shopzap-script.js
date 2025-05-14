document.addEventListener('DOMContentLoaded', function() {
    // Initialize form validation and submission
    initializeFormHandling();
    
    // Initialize theme preview functionality
    initializeThemePreview();
});

// Handle form validation and submission
function initializeFormHandling() {
    const storeCreationForm = document.getElementById('storeCreationForm');
    
    if (storeCreationForm) {
        storeCreationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Basic validation
            const storeName = document.getElementById('storeName').value.trim();
            const whatsappNumber = document.getElementById('whatsappNumber').value.trim();
            const email = document.getElementById('email').value.trim();
            const selectedTheme = document.querySelector('input[name="theme"]:checked').value;
            
            if (!storeName || !whatsappNumber || !email) {
                alert('Please fill in all required fields');
                return;
            }
            
            // Validate WhatsApp number format (10 digits for India)
            if (!/^\d{10}$/.test(whatsappNumber)) {
                alert('Please enter a valid 10-digit WhatsApp number');
                return;
            }
            
            // Validate email format
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                alert('Please enter a valid email address');
                return;
            }
            
            // Handle store logo upload
            const logoInput = document.getElementById('storeLogo');
            let logoFile = null;
            
            if (logoInput.files && logoInput.files[0]) {
                logoFile = logoInput.files[0];
            }
            
            // In a real application, you would upload the logo file to a server
            // and create the store in a database. For this demo, we'll simulate
            // store creation and redirect to a demo store.
            
            // Create store data object
            const storeData = {
                name: storeName,
                whatsappNumber: '91' + whatsappNumber, // Adding India country code
                email: email,
                theme: selectedTheme,
                logo: logoFile ? URL.createObjectURL(logoFile) : 'images/demo-logo.svg'
            };
            
            // Save store data to localStorage (for demo purposes)
            localStorage.setItem('shopzapStoreData', JSON.stringify(storeData));
            
            // Show success message and redirect to demo store
            alert('Your store has been created successfully!');
            window.location.href = 'shopzap-demo.html';
        });
    }
}

// Initialize theme preview functionality
function initializeThemePreview() {
    const themeOptions = document.querySelectorAll('.theme-option input[type="radio"]');
    
    themeOptions.forEach(option => {
        option.addEventListener('change', function() {
            // In a real application, you would show a live preview of the selected theme
            // For this demo, we'll just highlight the selected theme option
            document.querySelectorAll('.theme-option label').forEach(label => {
                label.classList.remove('selected');
            });
            
            this.parentElement.querySelector('label').classList.add('selected');
        });
    });
}

// Create a demo store template
function createDemoStore() {
    // This function would be used in the demo store page to load the store data
    // from localStorage and display it
    
    const storeData = JSON.parse(localStorage.getItem('shopzapStoreData')) || {
        name: 'Demo Fashion Store',
        whatsappNumber: '919876543210',
        email: 'demo@shopzap.io',
        theme: 'theme1',
        logo: 'images/demo-logo.svg'
    };
    
    // Sample products for the demo store
    const products = [
        {
            id: 1,
            name: 'Summer T-Shirt',
            price: 599,
            description: 'Comfortable cotton t-shirt perfect for summer. Available in multiple colors and sizes.',
            image: 'images/product1.jpg'
        },
        {
            id: 2,
            name: 'Denim Jeans',
            price: 1299,
            description: 'Classic denim jeans with a modern fit. Durable and stylish for everyday wear.',
            image: 'images/product2.jpg'
        },
        {
            id: 3,
            name: 'Casual Sneakers',
            price: 899,
            description: 'Lightweight and comfortable sneakers for daily use. Non-slip sole and breathable material.',
            image: 'images/product3.jpg'
        },
        {
            id: 4,
            name: 'Leather Wallet',
            price: 499,
            description: 'Genuine leather wallet with multiple card slots and a coin pocket. Slim design fits perfectly in your pocket.',
            image: 'images/product4.jpg'
        }
    ];
    
    return {
        storeData: storeData,
        products: products
    };
}

// Handle checkout process
function processCheckout(productId) {
    // This function would be used in the demo store to handle the checkout process
    // It would show a checkout form and then process the order
    
    // Get the demo store data
    const demoStore = createDemoStore();
    
    // Find the selected product
    const product = demoStore.products.find(p => p.id === productId);
    
    if (!product) {
        alert('Product not found');
        return;
    }
    
    // In a real application, you would show a checkout form and collect customer details
    // For this demo, we'll simulate the checkout process
    
    // Create order data
    const orderData = {
        orderId: 'ORD' + Math.floor(Math.random() * 1000000),
        product: product,
        customerName: 'Demo Customer',
        customerEmail: 'customer@example.com',
        customerPhone: '9876543210',
        customerAddress: '123 Main St, Mumbai, India',
        paymentMethod: 'UPI',
        orderDate: new Date().toISOString(),
        status: 'pending'
    };
    
    // Save order data to localStorage (for demo purposes)
    localStorage.setItem('shopzapOrderData', JSON.stringify(orderData));
    
    // Redirect to thank you page
    window.location.href = 'shopzap-thankyou.html';
}

// Send WhatsApp notification
function sendWhatsAppNotification(orderData) {
    // This function would be used to send a WhatsApp notification to the store owner
    // In a real application, you would use a WhatsApp API like Twilio or Interakt
    // For this demo, we'll just open a WhatsApp link with a pre-filled message
    
    const message = `New Order Received!\n\nOrder ID: ${orderData.orderId}\nProduct: ${orderData.product.name}\nPrice: ₹${orderData.product.price}\n\nCustomer Details:\nName: ${orderData.customerName}\nPhone: ${orderData.customerPhone}\nEmail: ${orderData.customerEmail}\nAddress: ${orderData.customerAddress}\nPayment Method: ${orderData.paymentMethod}\n\nThank you for using ShopZap.io!`;
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${orderData.storeWhatsappNumber}?text=${encodedMessage}`;
    
    // Open WhatsApp in a new tab
    window.open(whatsappUrl, '_blank');
}

// Handle order correction
function handleOrderCorrection(orderId) {
    // This function would be used to handle order corrections
    // In a real application, you would show a form with the current order details
    // and allow the customer to make changes
    // For this demo, we'll just show an alert
    
    alert('Order correction functionality would be implemented here. The customer would be able to edit their order details within 24 hours of placing the order.');
}