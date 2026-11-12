<?php
/**
 * Native Loader & SPA Reverse Proxy for MultipleDarkNews Tools
 * Guarantees HTTP 200 OK and Full Native HTML for Googlebot Indexing
 */

header('Cache-Control: no-cache, must-revalidate');

$path = $_SERVER['REQUEST_URI'] ?? '/';

// Serve physical static files directly (sitemap.xml, robots.txt, assets, images)
$requestFile = __DIR__ . strtok($path, '?');
if ($path !== '/' && file_exists($requestFile) && !is_dir($requestFile)) {
    return false;
}

// Target Cloudflare Workers Edge Engine
$workerUrl = 'https://multiple-dark-news.sohitprakash970.workers.dev' . $path;

$content = false;

if (function_exists('curl_init')) {
    $ch = curl_init($workerUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 12);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_USERAGENT, $_SERVER['HTTP_USER_AGENT'] ?? 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)');
    $content = curl_exec($ch);
    curl_close($ch);
}

if (!$content) {
    $content = @file_get_contents($workerUrl);
}

if ($content) {
    header("HTTP/1.1 200 OK");
    header("Content-Type: text/html; charset=UTF-8");
    echo $content;
} else {
    // Fallback to static index.html wrapper
    if (file_exists(__DIR__ . '/index.html')) {
        header("HTTP/1.1 200 OK");
        include __DIR__ . '/index.html';
    } else {
        header("HTTP/1.1 200 OK");
        echo "MultipleDarkNews Tools Platform Ready";
    }
}
?>
