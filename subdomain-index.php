<?php
$uri = $_SERVER['REQUEST_URI'];
$method = $_SERVER['REQUEST_METHOD'];

// Strip query string for file checks
$path = parse_url($uri, PHP_URL_PATH);

// Debug header to confirm PHP router is active
header('X-PHP-Router: active');

// Determine the document root - use DOCUMENT_ROOT if set, otherwise use known path
$docRoot = !empty($_SERVER['DOCUMENT_ROOT'])
    ? $_SERVER['DOCUMENT_ROOT']
    : '/home/u492425110/domains/barber.barmagly.tech/public_html';

// Also try dirname of SCRIPT_FILENAME as fallback
if (empty($docRoot) || !is_dir($docRoot)) {
    $docRoot = dirname($_SERVER['SCRIPT_FILENAME'] ?? __FILE__);
}

// Check if the requested file exists on disk (static assets)
$localFile = $docRoot . $path;
if ($path !== '/' && is_file($localFile)) {
    // Serve static file directly with proper MIME type
    $ext = strtolower(pathinfo($localFile, PATHINFO_EXTENSION));
    $mimeTypes = [
        'js'   => 'application/javascript',
        'mjs'  => 'application/javascript',
        'css'  => 'text/css',
        'html' => 'text/html',
        'json' => 'application/json',
        'png'  => 'image/png',
        'jpg'  => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'gif'  => 'image/gif',
        'svg'  => 'image/svg+xml',
        'ico'  => 'image/x-icon',
        'woff' => 'font/woff',
        'woff2'=> 'font/woff2',
        'ttf'  => 'font/ttf',
        'eot'  => 'application/vnd.ms-fontobject',
        'map'  => 'application/json',
        'webp' => 'image/webp',
        'mp4'  => 'video/mp4',
        'webm' => 'video/webm',
        'pdf'  => 'application/pdf',
    ];
    $contentType = isset($mimeTypes[$ext]) ? $mimeTypes[$ext] : 'application/octet-stream';

    header('Content-Type: ' . $contentType);
    header('Content-Length: ' . filesize($localFile));
    header('Cache-Control: public, max-age=31536000');
    readfile($localFile);
    exit;
}

// Root path -> serve landing page (marketing site)
if ($path === '/' || $path === '') {
    $landingFile = $docRoot . '/landing.html';
    if (is_file($landingFile)) {
        header('Content-Type: text/html');
        header('Cache-Control: no-cache, no-store, must-revalidate');
        readfile($landingFile);
        exit;
    }
}

// For super_admin SPA routes (not API, not static files)
if (preg_match('#^/super_admin#', $path)) {
    $adminIndex = $docRoot . '/super_admin/index.html';
    if (is_file($adminIndex)) {
        header('Content-Type: text/html');
        header('Cache-Control: no-cache, no-store, must-revalidate');
        header('Pragma: no-cache');
        header('Expires: 0');
        readfile($adminIndex);
        exit;
    }
}

// For API routes -> proxy to Node.js
if (preg_match('#^/api/#', $path)) {
    proxyToNode($uri, $method);
    exit;
}

// For uploaded media -> proxy to Node.js (chat images, files, salon images)
if (preg_match('#^/uploads/#', $path)) {
    proxyToNode($uri, $method);
    exit;
}

// For all other routes -> serve Expo web SPA
// Dynamically find the current entry JS file and generate HTML
$jsDir = $docRoot . '/_expo/static/js/web';
$cssDir = $docRoot . '/_expo/static/css';
$entryFile = '';
$cssFile = '';
if (is_dir($jsDir)) {
    foreach (scandir($jsDir) as $f) {
        if (strpos($f, 'entry-') === 0 && substr($f, -3) === '.js' && filesize("$jsDir/$f") > 1000) {
            $entryFile = $f;
        }
    }
}
if (is_dir($cssDir)) {
    foreach (scandir($cssDir) as $f) {
        if (substr($f, -4) === '.css') {
            $cssFile = $f;
        }
    }
}
if ($entryFile) {
    header('Content-Type: text/html; charset=UTF-8');
    header('Cache-Control: no-cache, no-store, must-revalidate');
    header('Pragma: no-cache');
    header('Expires: 0');
    $cb = filemtime("$jsDir/$entryFile");
    $cssLink = $cssFile ? '<link rel="preload" href="/_expo/static/css/' . $cssFile . '" as="style"><link rel="stylesheet" href="/_expo/static/css/' . $cssFile . '">' : '';
    echo '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta httpEquiv="X-UA-Compatible" content="IE=edge"/><meta name="viewport" content="width=device-width,initial-scale=1,shrink-to-fit=no"/><title>Barmagly</title><style id="expo-reset">html,body{height:100%}body{overflow:hidden}#root{display:flex;height:100%;flex:1}</style>' . $cssLink . '<link rel="icon" href="/favicon.ico"/></head><body><noscript>You need to enable JavaScript to run this app.</noscript><div id="root"></div><script src="/_expo/static/js/web/' . $entryFile . '?v=' . $cb . '" defer></script></body></html>';
    exit;
}

// Fallback: proxy everything to Node.js
proxyToNode($uri, $method);

function proxyToNode($uri, $method) {
    $nodeUrl = "http://127.0.0.1:3000" . $uri;

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $nodeUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, false);
    curl_setopt($ch, CURLOPT_HEADER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 5);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);

    // Forward request headers
    $reqHeaders = [];
    foreach (getallheaders() as $name => $value) {
        $lower = strtolower($name);
        if ($lower !== 'host' && $lower !== 'connection') {
            $reqHeaders[] = "$name: $value";
        }
    }
    // Tell Express the original request was HTTPS (needed for secure cookies)
    $reqHeaders[] = "X-Forwarded-Proto: https";
    $reqHeaders[] = "X-Forwarded-Host: " . ($_SERVER['HTTP_HOST'] ?? 'barber.barmagly.tech');
    curl_setopt($ch, CURLOPT_HTTPHEADER, $reqHeaders);

    // Forward body for POST/PUT/PATCH/DELETE
    if (in_array($method, ['POST', 'PUT', 'PATCH', 'DELETE'])) {
        $body = file_get_contents('php://input');
        curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
    }

    // Forward cookies
    if (!empty($_SERVER['HTTP_COOKIE'])) {
        curl_setopt($ch, CURLOPT_COOKIE, $_SERVER['HTTP_COOKIE']);
    }

    $response = curl_exec($ch);
    $httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $header_size = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
    $error = curl_error($ch);
    curl_close($ch);

    if ($response === false || $error) {
        // Auto-restart Node.js server if it's down
        $lockFile = '/tmp/barber-restart.lock';
        $lastRestart = @file_get_contents($lockFile);
        $now = time();
        // Only restart if last restart was more than 30 seconds ago (prevent restart loops)
        if (!$lastRestart || ($now - intval($lastRestart)) > 30) {
            file_put_contents($lockFile, strval($now));
            // Kill any zombie processes and restart
            exec('fuser -k 3000/tcp 2>/dev/null');
            usleep(500000); // 0.5s
            $appDir = '/home/u492425110/barber-app';
            exec("cd $appDir && nohup node server_dist/index.js >> /tmp/barber-server.log 2>&1 &");
            // Wait for server to start
            usleep(3000000); // 3s
            // Retry the request
            $ch2 = curl_init();
            curl_setopt($ch2, CURLOPT_URL, $nodeUrl);
            curl_setopt($ch2, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch2, CURLOPT_HEADER, true);
            curl_setopt($ch2, CURLOPT_CUSTOMREQUEST, $method);
            curl_setopt($ch2, CURLOPT_CONNECTTIMEOUT, 5);
            curl_setopt($ch2, CURLOPT_TIMEOUT, 15);
            if (!empty($reqHeaders)) curl_setopt($ch2, CURLOPT_HTTPHEADER, $reqHeaders);
            if (in_array($method, ['POST', 'PUT', 'PATCH', 'DELETE'])) {
                $retryBody = file_get_contents('php://input');
                curl_setopt($ch2, CURLOPT_POSTFIELDS, $retryBody);
            }
            if (!empty($_SERVER['HTTP_COOKIE'])) curl_setopt($ch2, CURLOPT_COOKIE, $_SERVER['HTTP_COOKIE']);
            $response = curl_exec($ch2);
            $httpcode = curl_getinfo($ch2, CURLINFO_HTTP_CODE);
            $header_size = curl_getinfo($ch2, CURLINFO_HEADER_SIZE);
            $error = curl_error($ch2);
            curl_close($ch2);
            if ($response !== false && !$error) {
                // Retry succeeded — continue to output response below
                goto outputResponse;
            }
        }
        http_response_code(502);
        header('Content-Type: application/json');
        echo json_encode(["error" => "Backend unavailable - auto-restart attempted", "detail" => $error]);
        exit;
    }
    outputResponse:

    $headerStr = substr($response, 0, $header_size);
    $body = substr($response, $header_size);

    foreach (explode("\r\n", $headerStr) as $line) {
        $line = trim($line);
        if (empty($line)) continue;
        $lower = strtolower($line);
        if (strpos($lower, 'transfer-encoding') === 0) continue;
        if (strpos($lower, 'connection:') === 0) continue;
        if (strpos($lower, 'http/') === 0) continue;
        header($line, strpos($lower, 'set-cookie') === 0 ? false : true);
    }

    http_response_code($httpcode);
    echo $body;
}
