<?php
/**
 * Native Loader & SPA Reverse Proxy for MultipleDarkNews Tools
 * Serves 100% native HTML directly with zero iframe dependency.
 */

header('Cache-Control: no-cache, must-revalidate');

if (file_exists(__DIR__ . '/index.html')) {
    include __DIR__ . '/index.html';
    exit;
}

$path = $_SERVER['REQUEST_URI'] ?? '/';
$workerUrl = 'https://multiple-dark-news.sohitprakash970.workers.dev' . $path;

$content = false;

if (function_exists('curl_init')) {
    $ch = curl_init($workerUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    $content = curl_exec($ch);
    curl_close($ch);
}

if (!$content) {
    $content = @file_get_contents($workerUrl);
}

if ($content) {
    echo $content;
} else {
    header("HTTP/1.0 500 Internal Server Error");
    echo "MultipleDarkNews Tools Platform Offline";
}
?>
