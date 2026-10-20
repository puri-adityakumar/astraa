#!/bin/sh
# Vercel "Ignored Build Step": exit 1 builds, exit 0 skips.
# Non-main branches (PR previews) always build. main builds only when the
# package.json version differs from the previous commit, so production
# deploys happen on release bumps and nowhere else.

if [ "$VERCEL_GIT_COMMIT_REF" != "main" ]; then
  echo "Preview build for ${VERCEL_GIT_COMMIT_REF:-local}"
  exit 1
fi

current=$(node -p "require('./package.json').version")
previous=$(git show HEAD^:package.json 2>/dev/null \
  | node -p "JSON.parse(require('fs').readFileSync(0, 'utf8')).version" 2>/dev/null)

if [ -z "$previous" ]; then
  echo "Could not read the previous version; skipping. Redeploy from the dashboard if needed."
  exit 0
fi

if [ "$current" = "$previous" ]; then
  echo "Version unchanged ($current); skipping production build"
  exit 0
fi

echo "Version $previous -> $current; building production"
exit 1
