# One-command sync: pull what the other machine did, commit what this one did, push.
#   .\sync.ps1                      commit message is written for you
#   .\sync.ps1 "aeo checklist v2"   your own message
param([string]$Message = "")

Set-Location $PSScriptRoot

if (-not (Test-Path (Join-Path $PSScriptRoot ".git"))) {
    Write-Output "Not a git repository: $PSScriptRoot"
    exit 1
}

function Show-Stuck {
    Write-Output ""
    Write-Output "Stopped with conflicts. Nothing was committed and nothing was pushed,"
    Write-Output "and none of your work is lost. Start with:"
    Write-Output ""
    Write-Output "  git status"
    Write-Output ""
    Write-Output "Anything listed as 'both modified' or 'unmerged' was changed on both"
    Write-Output "machines. Open each file, keep the lines you want, delete the"
    Write-Output "<<<<<<< ======= >>>>>>> marker lines, then:"
    Write-Output ""
    Write-Output "  git add <file>"
    Write-Output "  git rebase --continue   # if git says a rebase is in progress"
    Write-Output "  git stash drop          # if it says your changes were stashed"
    Write-Output ""
    Write-Output "To throw this machine's edits away and take the other machine's version"
    Write-Output "instead: git rebase --abort, or git reset --hard then git stash drop."
    Write-Output ""
    Write-Output "Do not run sync again until git status is clean. Ask Claude if it looks"
    Write-Output "tangled - say 'sync hit a conflict in <repo>' and it can see the state."
    exit 1
}

$branch = (git rev-parse --abbrev-ref HEAD).Trim()

Write-Output "==> Pulling $branch from origin"
git pull --rebase --autostash origin $branch
if (-not $?) { Show-Stuck }

# A fast-forward pull whose autostash fails to re-apply still exits 0, so
# check the index for unmerged paths before committing anything.
if (git ls-files -u) { Show-Stuck }

if (git status --porcelain) {
    if ($Message -eq "") {
        $Message = "sync from $env:COMPUTERNAME $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
    }
    git add -A
    if (-not $?) { exit 1 }
    git commit -q -m $Message
    if (-not $?) { exit 1 }
    Write-Output "==> Committed: $Message"
} else {
    Write-Output "==> Nothing new to commit here"
}

$ahead = (git rev-list --count '@{u}..HEAD').Trim()
if ([int]$ahead -gt 0) {
    git push -u origin $branch
    if (-not $?) { exit 1 }
    Write-Output "==> Pushed $ahead commit(s). Both machines are level."
} else {
    Write-Output "==> Already in sync. Nothing to push."
}
