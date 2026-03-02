<?php
$files = glob("*.html");
$skipList = array('index.html', 'about.html', 'cart.html', 'checkout.html', 'contact.html', 'support.html', 'signup.html', 'products.html');

foreach ($files as $file) {
    if (in_array(strtolower($file), $skipList)) {
        continue;
    }

    $content = file_get_contents($file);

    $content = preg_replace('/<h([12])([^>]*)>(.*?)<\/h\1>/i', '<h$1 class="itemName"$2>$3</h$1>', $content, 1);

    $content = preg_replace('/<img([^>]*)src="([^"]+)"([^>]*)>/i', '<img$1src="$2"$3 class="itemImage">', $content, 1);

    $content = preg_replace('/\$([\d,]+)/', '$<span class="itemPrice">$1</span>', $content, 1);

    $content = preg_replace('/<button([^>]*)>Add to Cart<\/button>/i', '<button$1 class="cartButton">Add to Cart</button>', $content);

    file_put_contents($file, $content);

    echo "Processed " . $file . "<br>";
}
echo "Script finished.";
?>