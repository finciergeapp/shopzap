document.addEventListener('DOMContentLoaded', function() {
    // Initialize dashboard components
    initDashboard();
    
    // Set up event listeners
    setupEventListeners();
});

// Initialize dashboard components
function initDashboard() {
    // Simulate loading data (in a real app, this would fetch from an API)
    loadDashboardData();
    
    // Initialize charts and visualizations
    initCharts();
}

// Load dashboard data
function loadDashboardData() {
    // This is a simulation - in a real app, this would be an API call
    // The data is already hardcoded in the HTML for this demo
    console.log('Dashboard data loaded');
}

// Initialize charts and visualizations
function initCharts() {
    // In a real application, this would use a charting library like Chart.js
    // For this demo, we're using a simple CSS-based chart
    updateConversionChart(8.5); // 8.5% conversion rate
}

// Update the conversion rate chart
function updateConversionChart(percentage) {
    const chartCircle = document.querySelector('.chart-circle');
    if (chartCircle) {
        chartCircle.style.background = `conic-gradient(#25D366 0% ${percentage}%, #f0f0f0 ${percentage}% 100%)`;
    }
}

// Set up event listeners
function setupEventListeners() {
    // Add product button
    const addProductCard = document.querySelector('.add-product-card');
    if (addProductCard) {
        addProductCard.addEventListener('click', function() {
            showAddProductModal();
        });
    }
    
    // Edit product buttons
    const editButtons = document.querySelectorAll('.edit-btn');
    editButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const productCard = this.closest('.product-card');
            const productName = productCard.querySelector('h3').textContent;
            const productPrice = productCard.querySelector('.product-price').textContent;
            showEditProductModal(productName, productPrice);
        });
    });
    
    // Delete product buttons
    const deleteButtons = document.querySelectorAll('.delete-btn');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const productCard = this.closest('.product-card');
            const productName = productCard.querySelector('h3').textContent;
            confirmDeleteProduct(productName, productCard);
        });
    });
}

// Show add product modal
function showAddProductModal() {
    // Create modal element
    const modal = document.createElement('div');
    modal.className = 'product-modal';
    modal.style.display = 'block';
    
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <h2>Add New Product</h2>
            <form id="addProductForm">
                <div class="form-group">
                    <label for="productName">Product Name</label>
                    <input type="text" id="productName" required>
                </div>
                <div class="form-group">
                    <label for="productPrice">Price (₹)</label>
                    <input type="number" id="productPrice" required>
                </div>
                <div class="form-group">
                    <label for="productDescription">Description</label>
                    <textarea id="productDescription" rows="4"></textarea>
                </div>
                <div class="form-group">
                    <label for="productImage">Product Image</label>
                    <input type="file" id="productImage" accept="image/*">
                </div>
                <button type="submit" class="btn-primary">Add Product</button>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners
    const closeBtn = modal.querySelector('.close-modal');
    closeBtn.addEventListener('click', function() {
        document.body.removeChild(modal);
    });
    
    const form = modal.querySelector('#addProductForm');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const productName = document.getElementById('productName').value;
        const productPrice = document.getElementById('productPrice').value;
        
        // In a real app, this would send data to the server
        // For demo, just show success message and close modal
        alert(`Product "${productName}" added successfully!`);
        document.body.removeChild(modal);
        
        // Refresh dashboard (in a real app, this would update the UI with the new product)
        // For demo purposes, we'll just reload the page
        // window.location.reload();
    });
    
    // Add some basic styles for the modal
    const style = document.createElement('style');
    style.textContent = `
        .product-modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.7);
            z-index: 1000;
            overflow-y: auto;
        }
        
        .modal-content {
            background-color: white;
            margin: 10% auto;
            width: 90%;
            max-width: 500px;
            border-radius: 10px;
            padding: 30px;
            position: relative;
        }
        
        .close-modal {
            position: absolute;
            top: 15px;
            right: 20px;
            font-size: 1.8rem;
            cursor: pointer;
            color: #333;
        }
        
        .modal-content h2 {
            margin-bottom: 20px;
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: 500;
        }
        
        .form-group input,
        .form-group textarea {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 5px;
        }
        
        .form-group textarea {
            resize: vertical;
        }
    `;
    document.head.appendChild(style);
}

// Show edit product modal
function showEditProductModal(productName, productPrice) {
    // Create modal element (similar to add product modal)
    const modal = document.createElement('div');
    modal.className = 'product-modal';
    modal.style.display = 'block';
    
    // Extract price value (remove ₹ symbol)
    const priceValue = productPrice.replace('₹', '').trim();
    
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <h2>Edit Product</h2>
            <form id="editProductForm">
                <div class="form-group">
                    <label for="productName">Product Name</label>
                    <input type="text" id="productName" value="${productName}" required>
                </div>
                <div class="form-group">
                    <label for="productPrice">Price (₹)</label>
                    <input type="number" id="productPrice" value="${priceValue}" required>
                </div>
                <div class="form-group">
                    <label for="productDescription">Description</label>
                    <textarea id="productDescription" rows="4">Comfortable cotton t-shirt perfect for summer. Available in multiple colors and sizes.</textarea>
                </div>
                <div class="form-group">
                    <label for="productImage">Product Image</label>
                    <input type="file" id="productImage" accept="image/*">
                </div>
                <button type="submit" class="btn-primary">Update Product</button>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners
    const closeBtn = modal.querySelector('.close-modal');
    closeBtn.addEventListener('click', function() {
        document.body.removeChild(modal);
    });
    
    const form = modal.querySelector('#editProductForm');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const updatedName = document.getElementById('productName').value;
        
        // In a real app, this would send data to the server
        // For demo, just show success message and close modal
        alert(`Product "${updatedName}" updated successfully!`);
        document.body.removeChild(modal);
    });
}

// Confirm delete product
function confirmDeleteProduct(productName, productCard) {
    if (confirm(`Are you sure you want to delete "${productName}"?`)) {
        // In a real app, this would send a delete request to the server
        // For demo, just remove the product card from the UI
        productCard.remove();
        alert(`Product "${productName}" deleted successfully!`);
    }
}