// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', function() {
    // Set countdown timer for limited time offer
    const countdownDate = new Date();
    countdownDate.setDate(countdownDate.getDate() + 7); // 7 days from now
    
    function updateCountdown() {
        const now = new Date().getTime();
        const distance = countdownDate - now;
        
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        document.getElementById('days').innerText = days.toString().padStart(2, '0');
        document.getElementById('hours').innerText = hours.toString().padStart(2, '0');
        document.getElementById('minutes').innerText = minutes.toString().padStart(2, '0');
        document.getElementById('seconds').innerText = seconds.toString().padStart(2, '0');
    }
    
    // Update countdown every second
    updateCountdown();
    setInterval(updateCountdown, 1000);
    
    // Store creation form handling
    const storeForm = document.getElementById('storeForm');
    if (storeForm) {
        storeForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const storeName = document.getElementById('storeName').value;
            const whatsappNumber = document.getElementById('whatsappNumber').value;
            const selectedPlan = document.querySelector('input[name="plan"]:checked').value;
            
            // Basic validation
            if (!storeName || !whatsappNumber) {
                alert('Please fill in all required fields');
                return;
            }
            
            // For free plan, generate store immediately
            if (selectedPlan === 'free') {
                generateStore(storeName, whatsappNumber);
            } else {
                // For paid plans, show payment options
                showPaymentOptions(selectedPlan, storeName, whatsappNumber);
            }
        });
    }
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 70, // Adjust for header height
                    behavior: 'smooth'
                });
            }
        });
    });
});

// Function to generate store (simulation)
function generateStore(storeName, whatsappNumber) {
    // In a real application, this would make an API call to create the store
    const storeUsername = storeName.toLowerCase().replace(/\s+/g, '-');
    const storeUrl = `yourapp.in/store/${storeUsername}`;
    
    // Show success message with store URL
    const formContainer = document.querySelector('.store-creation-form');
    formContainer.innerHTML = `
        <div class="success-message">
            <i class="fas fa-check-circle" style="font-size: 3rem; color: #25D366; margin-bottom: 20px;"></i>
            <h3>Your Store Has Been Created!</h3>
            <p>Your unique store URL:</p>
            <div class="store-url">
                <input type="text" value="${storeUrl}" readonly>
                <button onclick="copyToClipboard('${storeUrl}')" class="btn-secondary">
                    <i class="fas fa-copy"></i> Copy
                </button>
            </div>
            <p class="mt-20">What's next?</p>
            <ul class="next-steps">
                <li><i class="fas fa-arrow-right"></i> Add products to your store</li>
                <li><i class="fas fa-arrow-right"></i> Share your store link with customers</li>
                <li><i class="fas fa-arrow-right"></i> Start receiving orders via WhatsApp</li>
            </ul>
            <a href="dashboard.html" class="btn-primary mt-20">Go to Dashboard</a>
        </div>
    `;
    
    // Add some basic styles for the success message
    const style = document.createElement('style');
    style.textContent = `
        .success-message {
            text-align: center;
            padding: 20px;
        }
        .store-url {
            display: flex;
            margin: 20px 0;
        }
        .store-url input {
            flex: 1;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 5px 0 0 5px;
            font-size: 0.9rem;
        }
        .store-url button {
            border-radius: 0 5px 5px 0;
        }
        .next-steps {
            text-align: left;
            margin: 20px 0;
        }
        .next-steps li {
            margin-bottom: 10px;
        }
        .mt-20 {
            margin-top: 20px;
        }
    `;
    document.head.appendChild(style);
}

// Function to show payment options for paid plans
function showPaymentOptions(plan, storeName, whatsappNumber) {
    let planPrice = '';
    let planName = '';
    
    switch(plan) {
        case 'starter':
            planPrice = '₹199';
            planName = 'Starter';
            break;
        case 'pro':
            planPrice = '₹499';
            planName = 'Pro';
            break;
        case 'lifetime':
            planPrice = '₹4,000';
            planName = 'Lifetime';
            break;
    }
    
    const formContainer = document.querySelector('.store-creation-form');
    formContainer.innerHTML = `
        <div class="payment-options">
            <h3>Complete Your ${planName} Plan Purchase</h3>
            <p>Total: ${planPrice} ${plan !== 'lifetime' ? '/month' : ' one-time'}</p>
            
            <div class="payment-methods">
                <h4>Select Payment Method</h4>
                <div class="payment-method-options">
                    <label class="payment-method">
                        <input type="radio" name="payment" value="razorpay" checked>
                        <span>Credit/Debit Card</span>
                    </label>
                    <label class="payment-method">
                        <input type="radio" name="payment" value="upi">
                        <span>UPI</span>
                    </label>
                </div>
            </div>
            
            <div class="card-details">
                <div class="form-group">
                    <label>Card Number</label>
                    <input type="text" placeholder="1234 5678 9012 3456">
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Expiry Date</label>
                        <input type="text" placeholder="MM/YY">
                    </div>
                    <div class="form-group">
                        <label>CVV</label>
                        <input type="text" placeholder="123">
                    </div>
                </div>
                <div class="form-group">
                    <label>Name on Card</label>
                    <input type="text" placeholder="John Doe">
                </div>
            </div>
            
            <button onclick="processPayment('${plan}', '${storeName}', '${whatsappNumber}')" class="btn-primary">Complete Payment</button>
            <button onclick="window.location.reload()" class="btn-secondary mt-10">Cancel</button>
        </div>
    `;
    
    // Add some basic styles for the payment form
    const style = document.createElement('style');
    style.textContent = `
        .payment-options h3 {
            margin-bottom: 20px;
        }
        .payment-methods {
            margin: 30px 0;
        }
        .payment-method-options {
            display: flex;
            gap: 20px;
            margin-top: 15px;
        }
        .payment-method {
            display: flex;
            align-items: center;
            gap: 10px;
            cursor: pointer;
        }
        .card-details {
            margin-bottom: 30px;
        }
        .form-row {
            display: flex;
            gap: 15px;
        }
        .form-row .form-group {
            flex: 1;
        }
        .mt-10 {
            margin-top: 10px;
        }
    `;
    document.head.appendChild(style);
}

// Function to process payment (simulation)
function processPayment(plan, storeName, whatsappNumber) {
    // In a real application, this would integrate with Razorpay or UPI
    // For demo purposes, we'll just show a success message
    
    // Simulate loading
    const paymentButton = document.querySelector('.payment-options .btn-primary');
    paymentButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    paymentButton.disabled = true;
    
    // Simulate payment processing delay
    setTimeout(() => {
        // After successful payment, generate the store
        generateStore(storeName, whatsappNumber);
    }, 2000);
}

// Function to copy text to clipboard
function copyToClipboard(text) {
    const tempInput = document.createElement('input');
    tempInput.value = text;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
    
    // Show copied message
    const copyButton = document.querySelector('.store-url button');
    const originalText = copyButton.innerHTML;
    copyButton.innerHTML = '<i class="fas fa-check"></i> Copied!';
    
    setTimeout(() => {
        copyButton.innerHTML = originalText;
    }, 2000);
}