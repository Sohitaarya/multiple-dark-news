<?php
/**
 * Dynamic Auto-Sync Robots.txt for MultipleDarkNews Tools
 */
header('Content-Type: text/plain; charset=utf-8');
header('Cache-Control: public, max-age=1800');

$url = 'https://multiple-dark-news.sohitprakash970.workers.dev/robots.txt';

$content = false;

if (function_exists('curl_init')) {
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    $content = curl_exec($ch);
    curl_close($ch);
}

if (!$content) {
    $content = @file_get_contents($url);
}

if ($content) {
    echo $content;
} else {
    echo "User-agent: *\nAllow: /\nDisallow: /#admin\nSitemap: https://tools.multipledarknews.com/sitemap.xml\n";
}
?>
