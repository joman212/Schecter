document.addEventListener("DOMContentLoaded", function() {
    
    let actionButtons = document.querySelectorAll('.details .btn');
    
    actionButtons.forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            e.preventDefault(); 

            // Much simpler and more robust selectors
            let nameNode = document.querySelector('.itemName');
            let priceNode = document.querySelector('.itemPrice');
            let imgNode = document.querySelector('.main-image img');
            
            // If it fails, it will print exactly what is missing in the console
            if (!nameNode || !priceNode || !imgNode) {
                console.log("Found Name:", nameNode);
                console.log("Found Price:", priceNode);
                console.log("Found Image:", imgNode);
                alert("Error finding product details on this page. Check the console for details.");
                return;
            }

            let itemName = nameNode.innerText;
            let priceString = priceNode.innerText.replace(/,/g, '');
            let itemPrice = parseFloat(priceString);
            let imageSource = imgNode.getAttribute('src');

            let shoppingCart = [];
            
            try {
                let storedData = localStorage.getItem("schecterCart");
                if (storedData) {
                    shoppingCart = JSON.parse(storedData);
                }
            } catch (err) {
                localStorage.removeItem("schecterCart");
            }
            
            shoppingCart.push({ name: itemName, price: itemPrice, image: imageSource });
            localStorage.setItem("schecterCart", JSON.stringify(shoppingCart));
            
            window.location.href = "cart.html";
        });
    });

    let shoppingCartSection = document.querySelector('.cart');
    if (shoppingCartSection) {
        buildCartDisplay();
    }
});

function buildCartDisplay() {
    let container = document.querySelector('.cart');
    if (!container) return;

    let shoppingCart = [];
    
    try {
        let storedData = localStorage.getItem("schecterCart");
        if (storedData) {
            shoppingCart = JSON.parse(storedData);
        }
    } catch (err) {
        localStorage.removeItem("schecterCart");
    }
    
    container.innerHTML = '<h1>Shopping Cart</h1>';
    let finalTotal = 0;

    if (shoppingCart.length === 0) {
        container.innerHTML += '<p>Your cart is empty.</p>';
    } else {
        shoppingCart.forEach(function(item, i) {
            let productRow = document.createElement("div");
            productRow.className = "cart-item";
            
            productRow.innerHTML = '<img src="' + item.image + '" alt="' + item.name + '">' +
                                '<div class="cart-item-details">' +
                                '<h2>' + item.name + '</h2>' +
                                '<p>Price: $' + item.price.toLocaleString() + '</p>' +
                                '<button class="remove-btn" onclick="remove