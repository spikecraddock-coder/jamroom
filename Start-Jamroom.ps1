param([switch]$NoBrowser)

$ErrorActionPreference = "Stop"

$root = (Resolve-Path -LiteralPath $PSScriptRoot).Path
$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, 0)
$listener.Start()
$port = $listener.LocalEndpoint.Port
$address = "http://127.0.0.1:$port/"

Write-Host "Jamroom is running at $address"
Write-Host "Keep this window open while you play. Press Ctrl+C here to stop the local server."
if (-not $NoBrowser) { Start-Process $address }

function Write-Response {
    param(
        [System.IO.Stream]$Stream,
        [int]$StatusCode,
        [string]$StatusText,
        [string]$ContentType,
        [byte[]]$Body,
        [bool]$HeadOnly = $false
    )
    $crlf = [string][char]13 + [char]10
    $headerText = "HTTP/1.1 $StatusCode $StatusText" + $crlf +
        "Content-Type: $ContentType" + $crlf +
        "Content-Length: $($Body.Length)" + $crlf +
        "Cache-Control: no-store" + $crlf +
        "Connection: close" + $crlf +
        "X-Content-Type-Options: nosniff" + $crlf + $crlf
    $header = [System.Text.Encoding]::ASCII.GetBytes($headerText)
    $Stream.Write($header, 0, $header.Length)
    if (-not $HeadOnly -and $Body.Length -gt 0) {
        $Stream.Write($Body, 0, $Body.Length)
    }
}

function Get-ContentType {
    param([string]$Path)
    switch ([System.IO.Path]::GetExtension($Path).ToLowerInvariant()) {
        ".html" { "text/html; charset=utf-8" }
        ".css" { "text/css; charset=utf-8" }
        ".js" { "text/javascript; charset=utf-8" }
        ".mjs" { "text/javascript; charset=utf-8" }
        ".json" { "application/json; charset=utf-8" }
        ".flac" { "audio/flac" }
        ".wav" { "audio/wav" }
        ".svg" { "image/svg+xml" }
        ".md" { "text/markdown; charset=utf-8" }
        default { "application/octet-stream" }
    }
}

try {
    while ($listener.Server.IsBound) {
        $client = $listener.AcceptTcpClient()
        $stream = $client.GetStream()
        $reader = [System.IO.StreamReader]::new($stream, [System.Text.Encoding]::ASCII, $false, 1024, $true)
        try {
            $requestLine = $reader.ReadLine()
            if (-not $requestLine) { continue }
            while ($true) {
                $headerLine = $reader.ReadLine()
                if ([string]::IsNullOrEmpty($headerLine)) { break }
            }
            $parts = $requestLine -split " ", 3
            $method = $parts[0]
            if ($method -ne "GET" -and $method -ne "HEAD") {
                $body = [System.Text.Encoding]::UTF8.GetBytes("Method not allowed.")
                Write-Response -Stream $stream -StatusCode 405 -StatusText "Method Not Allowed" -ContentType "text/plain; charset=utf-8" -Body $body -HeadOnly ($method -eq "HEAD")
                continue
            }
            $requestedPath = ($parts[1] -split "\?", 2)[0]
            $relative = [System.Uri]::UnescapeDataString($requestedPath.TrimStart("/").Replace("/", "\"))
            if ([string]::IsNullOrWhiteSpace($relative)) { $relative = "index.html" }
            $candidate = [System.IO.Path]::GetFullPath((Join-Path $root $relative))
            $rootPrefix = $root.TrimEnd("\") + "\"
            if (-not $candidate.StartsWith($rootPrefix, [System.StringComparison]::OrdinalIgnoreCase)) {
                $body = [System.Text.Encoding]::UTF8.GetBytes("Forbidden.")
                Write-Response -Stream $stream -StatusCode 403 -StatusText "Forbidden" -ContentType "text/plain; charset=utf-8" -Body $body -HeadOnly ($method -eq "HEAD")
                continue
            }
            if (-not (Test-Path -LiteralPath $candidate -PathType Leaf)) {
                $body = [System.Text.Encoding]::UTF8.GetBytes("Not found.")
                Write-Response -Stream $stream -StatusCode 404 -StatusText "Not Found" -ContentType "text/plain; charset=utf-8" -Body $body -HeadOnly ($method -eq "HEAD")
                continue
            }
            $body = [System.IO.File]::ReadAllBytes($candidate)
            Write-Response -Stream $stream -StatusCode 200 -StatusText "OK" -ContentType (Get-ContentType $candidate) -Body $body -HeadOnly ($method -eq "HEAD")
        } catch {
            try {
                $body = [System.Text.Encoding]::UTF8.GetBytes("Local server error.")
                Write-Response -Stream $stream -StatusCode 500 -StatusText "Internal Server Error" -ContentType "text/plain; charset=utf-8" -Body $body
            } catch { }
        } finally {
            $reader.Dispose()
            $stream.Dispose()
            $client.Close()
        }
    }
} finally {
    $listener.Stop()
}
