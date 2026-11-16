# CarePulse Deployment Helper Script
param(
    [string]$GithubRepoUrl = ""
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " CarePulse Deployment & Push Helper    " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# 1. Check Git Remote
if ($GithubRepoUrl -ne "") {
    Write-Host "`nSetting GitHub remote to: $GithubRepoUrl" -ForegroundColor Yellow
    & "C:\Users\sravan\MinGit\cmd\git.exe" remote remove origin 2>$null
    & "C:\Users\sravan\MinGit\cmd\git.exe" remote add origin $GithubRepoUrl
    Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
    & "C:\Users\sravan\MinGit\cmd\git.exe" push -u origin main
    Write-Host "Pushed to GitHub successfully!" -ForegroundColor Green
} else {
    Write-Host "`nTo push to GitHub, run:" -ForegroundColor Yellow
    Write-Host '  git remote add origin https://github.com/<your-username>/appointment-queue-tracker.git' -ForegroundColor White
    Write-Host '  git push -u origin main' -ForegroundColor White
}

# 2. Free Hosting Options
Write-Host "`nDeploying to Free Hosting Platforms:" -ForegroundColor Cyan
Write-Host "Option A (Vercel):" -ForegroundColor Green
Write-Host "  1. Push to GitHub (as above)."
Write-Host "  2. Go to https://vercel.com/new and import your GitHub repo."
Write-Host "  3. Vercel auto-detects Vite and provides a live https://*.vercel.app URL in 30 seconds."

Write-Host "`nOption B (Netlify Drop / Git):" -ForegroundColor Green
Write-Host "  1. Drag and drop the 'dist' folder directly to https://app.netlify.com/drop"
Write-Host "  2. Instant live production site without even needing login!"

Write-Host "`nLocal Preview:" -ForegroundColor Magenta
Write-Host "  Running at: http://localhost:3000"
