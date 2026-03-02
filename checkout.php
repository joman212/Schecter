<?php
$rawPayload = file_get_contents('php://input');
$orderData = json_decode($rawPayload, true);

if (!$orderData || empty($orderData)) {
    echo json_encode(['status' => 'error', 'message' => 'Cart is empty.']);
    exit;
}

$calculatedTotal = 0;

foreach ($orderData as $product) {
    $itemPrice = floatval($product['price']);
    $itemQuantity = intval($product['quantity']);
    $calculatedTotal += ($itemPrice * $itemQuantity);
}

$formattedTotal = number_format($calculatedTotal, 2);
$successMessage = 'Order secured. Final total is $' . $formattedTotal;

echo json_encode(['status' => 'success', 'message' => $successMessage]);
?>