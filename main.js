let cartMemory = JSON.parse(localStorage.getItem('userCart')) || [];

function addToCart(itemId, itemName, itemPrice, itemImage) {
    let itemFound = false;
    
    for (let i = 0; i < cartMemory.length; i++) {
        if (cartMemory[i].id === itemId) {
            cartMemory[i].quantity += 1;
            itemFound = true;
            break;
        }
    }
    
    if (!itemFound) {
        cartMemory.push({
            id: itemId,
            name: itemName,
            price: itemPrice,
            image: itemImage,
            quantity: 1
        });
    }
    
    localStorage.setItem('userCart', JSON.stringify(cartMemory));
    alert(itemName + ' added successfully.');
}

function renderCartDisplay() {
    let containerBox = document.getElementById('cartContainer');
    let totalBox = document.getElementById('cartTotal');
    
    if (!containerBox || !totalBox) return;
    
    containerBox.innerHTML = '';
    let finalCost = 0;
    
    cartMemory.forEach(function(item, index) {
        let costMultiplier = item.price * item.quantity;
        finalCost += costMultiplier;
        
        let itemRow = document.createElement('div');
        itemRow.className = 'cartRow';
        itemRow.innerHTML = `
            <img src="${item.image}" alt="${item.name}" style="width:60px; height:auto;">
            <h4>${item.name}</h4>
            <p>$${item.price} x ${item.quantity}</p>
            <button onclick="removeItem(${index})">Remove</button>
        `;
        containerBox.appendChild(itemRow);
    });
    
    totalBox.innerText = 'Total: $' + finalCost.toFixed(2);
}

function removeItem(index) {
    cartMemory.splice(index, 1);
    localStorage.setItem('userCart', JSON.stringify(cartMemory));
    renderCartDisplay();
}

function submitOrder() {
    if (cartMemory.length === 0) {
        alert('Your cart is empty.');
        return;
    }
    
    const dashChar = String.fromCharCode(45);
    const headerKey = 'Content' + dashChar + 'Type';
    
    fetch('checkout.php', {
        method: 'POST',
        headers: {
            [headerKey]: 'application/json'
        },
        body: JSON.stringify(cartMemory)
    })
    .then(response => response.json())
    .then(data => {
        if(data.status === 'success') {
            localStorage.removeItem('userCart');
            cartMemory = [];
            renderCartDisplay();
            alert(data.message);
        } else {
            alert('Error processing order.');
        }
    })
    .catch(error => {
        console.error('Submission failed', error);
    });
}