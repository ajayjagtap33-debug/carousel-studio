#!/usr/bin/env bash
# One-command sync: pull what the other machine did, commit what this one did, push.
#   ./sync.sh                      commit message is written for you
#   ./sync.sh "aeo checklist v2"   your own message
set -u

cd "$(dirname "$0")" || exit 1

if [ ! -d .git ]; then
  echo "Not a git repository: $(pwd)" >&2
  exit 1
fi

branch=$(git rev-parse --abbrev-ref HEAD)

stuck() {
  cat >&2 <<'MSG'

Stopped with conflicts. Nothing was committed and nothing was pushed,
and none of your work is lost. Start with:

  git status

Anything listed as "both modified" or "unmerged" was changed on both
machines. Open each file, keep the lines you want, delete the
<<<<<<< ======= >>>>>>> marker lines, then:

  git add <file>
  git rebase --continue   # if git says a rebase is in progress
  git stash drop          # if it says your changes were stashed

To throw this machine's edits away and take the other machine's version
instead: git rebase --abort, or git reset --hard then git stash drop.

Do not run sync again until git status is clean. Ask Claude if it looks
tangled - say "sync hit a conflict in <repo>" and it can see the state.
MSG
  exit 1
}

echo "==> Pulling $branch from origin"
git pull --rebase --autostash origin "$branch" || stuck

# A fast-forward pull whose autostash fails to re-apply still exits 0, so
# check the index for unmerged paths before committing anything.
[ -z "$(git ls-files -u)" ] || stuck

if [ -n "$(git status --porcelain)" ]; then
  msg=${1:-"sync from $(hostname) $(date '+%Y-%m-%d %H:%M')"}
  git add -A || exit 1
  git commit -q -m "$msg" || exit 1
  echo "==> Committed: $msg"
else
  echo "==> Nothing new to commit here"
fi

ahead=$(git rev-list --count '@{u}..HEAD' 2>/dev/null || echo 0)
if [ "${ahead:-0}" -gt 0 ]; then
  git push -u origin "$branch" || exit 1
  echo "==> Pushed $ahead commit(s). Both machines are level."
else
  echo "==> Already in sync. Nothing to push."
fi
