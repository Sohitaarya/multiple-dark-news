<?php
/**
 * Dynamic Auto-Sync XML Sitemap for MultipleDarkNews Tools
 * Automatically pulls the real-time XML sitemap from Cloudflare Worker
 * Never requires manual re-upload when new tools or pages are added!
 */
header('Content-Type: application/xml; charset=utf-8');
header('Cache-Control: public, max-age=1800');

// 1. Immediately serve local pristine sitemap.xml if available
if (file_exists(__DIR__ . '/sitemap.xml')) {
    echo file_get_contents(__DIR__ . '/sitemap.xml');
    exit;
}

$url = 'https://multiple-dark-news.sohitprakash970.workers.dev/sitemap.xml';
$content = false;

// 2. Try cURL for maximum speed and compatibility on Hostinger
if (function_exists('curl_init')) {
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    $content = curl_exec($ch);
    curl_close($ch);
}

// 3. Fallback to file_get_contents if cURL is disabled
if (!$content) {
    $content = @file_get_contents($url);
}

if ($content) {
    echo $content;
} else {
    // Failsafe standard fallback header
    echo '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://tools.multipledarknews.com/</loc></url></urlset>';
}
?>
