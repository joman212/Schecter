let cartItems = JSON.parse(localStorage.getItem('schecterCart')) || [];

function addToCart(itemName, itemPrice, itemImage) {
    let product = { name: itemName, price: itemPrice, image: itemImage };
    cartItems.push(product);
    localStorage.setItem('schecterCart', JSON.stringify(cartItems));
    alert(itemName + " added successfully.");
}

function renderCart() {
    let container = document.getElementById('cartContainer');
    if (!container) return;
    
    container.innerHTML = '';
    let grandTotal = 0;

    cartItems.forEach(function(item, index) {
        let row = document.createElement('div');
        row.innerHTML = "<img src='" + item.image + "' width='50'> " + item.name + " : $" + item.price + " <button onclick='removeItem(" + index + ")'>Remove</button>";
        container.appendChild(row);
        grandTotal += item.price;
    });

    let totalDisplay = document.createElement('h3');
    totalDisplay.innerHTML = "Total: $" + grandTotal;
    container.appendChild(totalDisplay);
    
    localStorage.setItem('cartTotal', grandTotal);
}

function removeItem(index) {
    cartItems.splice(index, 1);
    localStorage.setItem('schecterCart', JSON.stringify(cartItems));
    renderCart();
}

function loadCheckout() {
    let totalDisplay = document.getElementById('checkoutTotal');
    if (!totalDisplay) return;
    
    let savedTotal = localStorage.getItem('cartTotal') || 0;
    totalDisplay.innerHTML = "Amount Due: $" + savedTotal;
}

function validateSignup(event) {
    let email = document.getElementById('emailInput').value;
    let password = document.getElementById('passwordInput').value;

    if (email === "" || password === "") {
        alert("All fields are required.");
        event.preventDefault();
    } else if (!email.includes("@")) {
        alert("Enter a valid email address.");
        event.preventDefault();
    }
}

document.addEventListener("DOMContentLoaded", function() {
    renderCart();
    loadCheckout();

    let signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', validateSignup);
    }
});

document.addEventListener("DOMContentLoaded", function() {
    let actionButton = document.getElementById('cartActionBtn');
    if (actionButton) {
        actionButton.addEventListener('click', function() {
            let nameStr = document.querySelector('.productTitle').innerText;
            let priceNum = parseInt(document.querySelector('.productPrice').innerText);
            let imageSrc = document.querySelector('.productImage').getAttribute('src');
            
            addToCart(nameStr, priceNum, imageSrc);
        });
    }
});