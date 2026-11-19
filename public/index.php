<?php
/**
 * Native Reverse Proxy for MultipleDarkNews Tools on Hostinger (PHP 8.x compatible)
 * Proxies HTML, JS, CSS, API routes, and image assets from Cloudflare Workers
 * with accurate HTTP status codes (200, 301, 404), canonical tags, and MIME types.
 */

@ini_set('display_errors', '0');

$rawUri = $_SERVER['REQUEST_URI'] ?? '/';
$parsedUrl = parse_url($rawUri);
$pathOnly = $parsedUrl['path'] ?? '/';
$queryString = isset($parsedUrl['query']) && $parsedUrl['query'] !== '' ? '?' . $parsedUrl['query'] : '';

// If /index.php is requested directly, proxy the root homepage '/'
if ($pathOnly === '/index.php' || $pathOnly === '') {
    $pathOnly = '/';
}

$targetUri = $pathOnly . $queryString;
$workerOrigin = 'https://multiple-dark-news.sohitprakash970.workers.dev';
$workerUrl = $workerOrigin . $targetUri;

$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
$content = false;
$httpCode = 200;
$upstreamHeaders = [];

if (function_exists('curl_init')) {
    $ch = curl_init($workerUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    // Do NOT follow 301/302 automatically so /portfolio -> /sohit-aarya returns a real 301 redirect
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, false);
    curl_setopt($ch, CURLOPT_TIMEOUT, 20);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
    curl_setopt($ch, CURLOPT_USERAGENT, $_SERVER['HTTP_USER_AGENT'] ?? 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)');

    $reqHeaders = [];
    if (!empty($_SERVER['HTTP_ACCEPT_LANGUAGE'])) {
        $reqHeaders[] = 'Accept-Language: ' . $_SERVER['HTTP_ACCEPT_LANGUAGE'];
    }

    if ($method === 'POST' || $method === 'PUT' || $method === 'PATCH') {
        $rawBody = file_get_contents('php://input');
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $rawBody !== false ? $rawBody : '');
        $reqContentType = $_SERVER['CONTENT_TYPE'] ?? 'application/json';
        $reqHeaders[] = 'Content-Type: ' . $reqContentType;
    }

    if (!empty($reqHeaders)) {
        curl_setopt($ch, CURLOPT_HTTPHEADER, $reqHeaders);
    }

    curl_setopt($ch, CURLOPT_HEADERFUNCTION, static function ($curl, $headerLine) use (&$upstreamHeaders) {
        $len = strlen($headerLine);
        $parts = explode(':', $headerLine, 2);
        if (count($parts) === 2) {
            $name = strtolower(trim($parts[0]));
            $value = trim($parts[1]);
            $upstreamHeaders[$name] = $value;
        }
        return $len;
    });

    $content = curl_exec($ch);
    $infoCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    if ($infoCode) {
        $httpCode = (int) $infoCode;
    }
    unset($ch);
}

if ($content === false) {
    $context = stream_context_create([
        'http' => [
            'method' => $method,
            'ignore_errors' => true,
            'follow_location' => 0,
            'timeout' => 15,
            'header' => "User-Agent: " . ($_SERVER['HTTP_USER_AGENT'] ?? 'Mozilla/5.0') . "\r\n",
        ],
    ]);
    $content = @file_get_contents($workerUrl, false, $context);
    if (isset($http_response_header) && is_array($http_response_header)) {
        foreach ($http_response_header as $hdr) {
            if (preg_match('#^HTTP/\S+\s+(\d{3})#', $hdr, $m)) {
                $httpCode = (int) $m[1];
            } elseif (strpos($hdr, ':') !== false) {
                [$k, $v] = explode(':', $hdr, 2);
                $upstreamHeaders[strtolower(trim($k))] = trim($v);
            }
        }
    }
}

if ($content !== false) {
    // Pass through 301/302/307/308 redirects rewritten to public domain
    if ($httpCode >= 300 && $httpCode < 400 && !empty($upstreamHeaders['location'])) {
        $loc = str_replace($workerOrigin, 'https://tools.multipledarknews.com', $upstreamHeaders['location']);
        http_response_code($httpCode);
        header('Location: ' . $loc);
        exit;
    }

    $ext = strtolower(pathinfo($pathOnly, PATHINFO_EXTENSION));
    $mimeTypes = [
        'js'    => 'application/javascript; charset=UTF-8',
        'mjs'   => 'application/javascript; charset=UTF-8',
        'css'   => 'text/css; charset=UTF-8',
        'json'  => 'application/json; charset=UTF-8',
        'xml'   => 'application/xml; charset=UTF-8',
        'txt'   => 'text/plain; charset=UTF-8',
        'svg'   => 'image/svg+xml',
        'png'   => 'image/png',
        'jpg'   => 'image/jpeg',
        'jpeg'  => 'image/jpeg',
        'webp'  => 'image/webp',
        'ico'   => 'image/x-icon',
        'woff2' => 'font/woff2',
        'woff'  => 'font/woff',
        'mp4'   => 'video/mp4',
    ];

    $contentType = $upstreamHeaders['content-type'] ?? ($mimeTypes[$ext] ?? 'text/html; charset=UTF-8');
    http_response_code($httpCode);
    header('Content-Type: ' . $contentType);

    if (!empty($upstreamHeaders['x-robots-tag'])) {
        header('X-Robots-Tag: ' . $upstreamHeaders['x-robots-tag']);
    } elseif ($httpCode === 404 || $pathOnly === '/admin') {
        header('X-Robots-Tag: noindex, nofollow');
    }

    if ($ext !== '' && $httpCode === 200) {
        header('Cache-Control: public, max-age=86400');
    } else {
        header('Cache-Control: no-cache, must-revalidate');
    }

    echo $content;
    exit;
}

http_response_code(502);
header('Content-Type: text/plain; charset=UTF-8');
echo 'Upstream service temporarily unavailable.';
