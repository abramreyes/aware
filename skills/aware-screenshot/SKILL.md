---
name: aware-screenshot
description: >
  Project-relative screenshot capture workflow for local web app visual review.
  Use after UI changes, route additions, layout refactors, responsive polish,
  or before reviewing a site visually. Captures desktop and optional mobile
  route screenshots under docs/screenshots/{date-time}/ from the current
  project root.
---

# Aware Screenshot

## Overview

Capture local web app screenshots from the target project's root, using
project-owned routes and timestamped output under `docs/screenshots/`.

## Workflow

1. Confirm the local dev server is running.
2. Set `$baseUrl` for the current project.
3. Define `$routes` from the current project's real static and representative
   dynamic routes.
4. Create a timestamped output folder under the project root.
5. Capture desktop screenshots.
6. Capture mobile screenshots when responsive polish is part of the task.
7. Review very small files first because they often indicate blank, error,
   redirect, or not-found pages.

## Project Setup

Run from the project root so output stays with the project being reviewed.

Use the project's actual local URL:

```powershell
$baseUrl = "http://localhost:3000"
```

Common alternatives include `http://localhost:3001` for another Next.js app or
`http://localhost:5173` for Vite.

Create a timestamped output folder:

```powershell
$projectRoot = (Get-Location).Path
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$out = Join-Path $projectRoot "docs\screenshots\$timestamp"
New-Item -ItemType Directory -Force -Path $out | Out-Null
```

## Route Selection

Build `$routes` from the current project. Do not reuse example paths unless
they exist in that project.

```powershell
$routes = @(
  @("home", "/"),
  @("about", "/about"),
  @("contact", "/contact")
)
```

For dynamic routes, use concrete paths from local data, route config, seed data,
or a known representative set:

```powershell
$routes += @(
  @("blog-detail-example", "/blog/example-post"),
  @("project-detail-example", "/projects/example-project")
)
```

Keep route names filename-safe. Prefer lowercase words separated by hyphens.

## Desktop Capture

Use Microsoft Edge headless on Windows:

```powershell
$baseUrl = "http://localhost:3000"
$projectRoot = (Get-Location).Path
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$out = Join-Path $projectRoot "docs\screenshots\$timestamp"
$edge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

New-Item -ItemType Directory -Force -Path $out | Out-Null

$routes = @(
  @("home", "/"),
  @("about", "/about"),
  @("contact", "/contact")
)

foreach ($route in $routes) {
  $name = $route[0]
  $path = $route[1]
  $file = Join-Path $out ($name + ".png")

  & $edge `
    --headless=new `
    --disable-gpu `
    --window-size=1440,1200 `
    --virtual-time-budget=3000 `
    --screenshot="$file" `
    "$baseUrl$path" | Out-Null
}

Get-ChildItem $out -File | Sort-Object Name | Select-Object Name,Length
```

## Mobile Capture

Run a mobile pass when the user asks for responsive review or the changed UI is
visible on mobile.

```powershell
foreach ($route in $routes) {
  $name = $route[0]
  $path = $route[1]
  $file = Join-Path $out ($name + "-mobile.png")

  & $edge `
    --headless=new `
    --disable-gpu `
    --window-size=390,844 `
    --virtual-time-budget=3000 `
    --screenshot="$file" `
    "$baseUrl$path" | Out-Null
}
```

## Review

After capture, inspect the screenshots for:

- Navigation visibility and active states.
- Oversized or clipped hero sections.
- Text overlap, overflow, or unreadable wrapping.
- Repeated components that no longer align consistently.
- CTAs in unexpected positions.
- Dynamic pages rendering not-found or placeholder states.
- Inconsistent visual language across pages.
- Accidental contrast inversion in dark or light mode.

Report the output folder path, notable visual issues, and any routes that failed
or produced suspiciously small files. Do not claim visual correctness without
opening or otherwise inspecting the generated screenshots.
