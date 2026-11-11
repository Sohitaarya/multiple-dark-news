<?php
/**
 * Direct High-Speed Reverse Proxy Loader for MultipleDarkNews Tools
 * Solves mobile blank-screen iframe blocking on iOS & Android
 * Serves 100% native HTML with zero cross-origin iframe security issues
 */

header('Cache-Control: no-cache, must-revalidate');

$path = $_SERVER['REQUEST_URI'] ?? '/';
$workerUrl = 'https://multiple-dark-news.sohitprakash970.workers.dev' . $path;

$content = false;

if (function_exists('curl_init')) {
    $ch = curl_init($workerUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 12);
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
    // Local fallback if remote proxy connection is delayed
    if (file_exists(__DIR__ . '/index.html')) {
        include __DIR__ . '/index.html';
    } else {
        echo '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>MultipleDarkNews Tools</title><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>body{margin:0;padding:0;background:#080808;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;}iframe{width:100%;height:100%;border:none;}</style></head><body><iframe src="https://multiple-dark-news.sohitprakash970.workers.dev"></iframe></body></html>';
    }
}
?>
