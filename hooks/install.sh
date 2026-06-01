#!/bin/sh
# Install Hugo pre-commit hook
cp hooks/pre-commit .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
echo "✅ Hugo pre-commit hook installed"
echo "   It will check commit message quality before each commit."
echo "   Set HUGO_API_URL and HUGO_THRESHOLD in your environment to configure."
