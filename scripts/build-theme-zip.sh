#!/bin/bash
# Build theme ZIP for manual upload (Admin → Themes → Add theme → Upload)
set -e
cd "$(dirname "$0")/.."
rm -f holo-vault-theme.zip
zip -r holo-vault-theme.zip \
  assets config layout locales sections snippets templates \
  -x "*.DS_Store" -x "scripts/*" -x "*.md" -x "*.zip"
echo "Created: $(pwd)/holo-vault-theme.zip"
echo "Upload at: https://admin.shopify.com/store/holo-vault-3/themes"
