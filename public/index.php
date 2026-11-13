<?php
/**
 * Native Reverse Proxy for MultipleDarkNews Tools on Hostinger
 * Proxies HTML, JS, CSS, and image assets from Cloudflare Workers with proper MIME types and HTTP 200 OK.
 */

$requestUri = $_SERVER['REQUEST_URI'] ?? '/';
$pathOnly = strtok($requestUri, '?') ?: '/';

// Serve physical static files if they exist on Hostinger (sitemap.xml, robots.txt, etc.)
$localFile = __DIR__ . $pathOnly;
if ($pathOnly !== '/' && file_exists($localFile) && !is_dir($localFile)) {
    return false;
}

// Target Cloudflare Workers Edge Engine
$workerUrl = 'https://multiple-dark-news.sohitprakash970.workers.dev' . $requestUri;

$content = false;
$httpCode = 200;

if (function_exists('curl_init')) {
    $ch = curl_init($workerUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 15);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_USERAGENT, $_SERVER['HTTP_USER_AGENT'] ?? 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)');
    $content = curl_exec($ch);
    $infoCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    if ($infoCode) {
        $httpCode = (int) $infoCode;
    }
    curl_close($ch);
}

if ($content === false) {
    $content = @file_get_contents($workerUrl);
}

if ($content !== false) {
    $ext = strtolower(pathinfo($pathOnly, PATHINFO_EXTENSION));
    $mimeTypes = [
        'js'   => 'application/javascript; charset=UTF-8',
        'mjs'  => 'application/javascript; charset=UTF-8',
        'css'  => 'text/css; charset=UTF-8',
        'json' => 'application/json; charset=UTF-8',
        'xml'  => 'application/xml; charset=UTF-8',
        'txt'  => 'text/plain; charset=UTF-8',
        'svg'  => 'image/svg+xml',
        'png'  => 'image/png',
        'jpg'  => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'webp' => 'image/webp',
        'ico'  => 'image/x-icon',
        'woff2'=> 'font/woff2',
        'woff' => 'font/woff',
        'mp4'  => 'video/mp4',
    ];

    $contentType = $mimeTypes[$ext] ?? 'text/html; charset=UTF-8';
    http_response_code($httpCode === 404 && !$ext ? 200 : $httpCode);
    header('Content-Type: ' . $contentType);
    header('Cache-Control: ' . ($ext ? 'public, max-age=86400' : 'no-cache, must-revalidate'));
    echo $content;
    exit;
}

// Fallback to static index.html wrapper if upstream unreachable
http_response_code(200);
header('Content-Type: text/html; charset=UTF-8');
if (file_exists(__DIR__ . '/index.html')) {
    include __DIR__ . '/index.html';
} else {
    echo 'MultipleDarkNews Tools Platform Ready';
}
?>
