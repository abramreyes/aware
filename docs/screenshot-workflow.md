# Screenshot Workflow

This workflow captures local route screenshots for design review and saves them
inside the current project under a timestamped `docs/screenshots/` folder.

The normative skill behavior lives in
[`skills/aware-screenshot/SKILL.md`](../skills/aware-screenshot/SKILL.md).

## When To Use

Use this after visual design changes, layout refactors, route additions, or
before reviewing a site for polish. The screenshots give a quick baseline for
what needs adjustment across pages.

## Prerequisites

- The project dev server is running.
- Microsoft Edge is installed at:

```text
C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe
```

Set the local base URL to match the project being reviewed. Common examples:

```powershell
$baseUrl = "http://localhost:3000"
$baseUrl = "http://localhost:3001"
$baseUrl = "http://localhost:5173"
```

## Output Folder

Run the commands from the project root. Screenshots are saved to a folder named
with the current date and time:

```text
docs/screenshots/yyyy-MM-dd_HH-mm-ss/
```

Create the project-specific output folder before capture:

```powershell
$projectRoot = (Get-Location).Path
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$out = Join-Path $projectRoot "docs\screenshots\$timestamp"
New-Item -ItemType Directory -Force -Path $out | Out-Null
```

## Project Route List

Define the routes for the current project. Keep the route names stable and
filename-safe because they become screenshot filenames.

```powershell
$routes = @(
  @("home", "/"),
  @("about", "/about"),
  @("contact", "/contact")
)
```

For dynamic routes, add representative concrete URLs from the project's local
data or route config:

```powershell
$routes += @(
  @("blog-detail-example", "/blog/example-post"),
  @("project-detail-example", "/projects/example-project")
)
```

## Capture Screenshots

This pass works for any local web project as long as `$baseUrl` and `$routes`
match the project.

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

## Optional Mobile Pass

Use a separate timestamped folder or add a viewport suffix to filenames when
capturing mobile screenshots.

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

## Review Checklist

After capture, open the images and check:

- Navigation is visible and active states are correct.
- Hero sections are not too tall.
- Text does not overlap or overflow.
- Cards, rows, and repeated components align consistently.
- CTAs sit in predictable positions.
- Dynamic detail pages render actual content, not a not-found state.
- Pages share the same visual language.
- Dark/light mode state did not accidentally invert contrast.

## Useful Signal

Very small screenshot files can indicate an error page, redirect page, blank
render, or sparse not-found page. Open those first.

## Notes

- Run from the project root so output stays project-specific.
- Use absolute screenshot output paths. Edge headless may fail to write
  screenshots when given a relative path.
- Keep the route list project-owned. Do not reuse example routes unless they
  exist in the current project.
- The `--window-size=1440,1200` viewport is good for desktop design review.
