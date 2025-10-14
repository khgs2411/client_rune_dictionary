#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print banner
echo -e "${BLUE}=================================${NC}"
echo -e "${BLUE}   Rune Dictionary Deployment    ${NC}"
echo -e "${BLUE}=================================${NC}"

# Check if there are uncommitted changes
if [[ -n $(git status -s) ]]; then
  echo -e "${YELLOW}You have uncommitted changes. Please commit or stash them before deploying.${NC}"
  git status -s
  exit 1
fi

# Get current version from package.json
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo -e "${BLUE}Current version: ${GREEN}$CURRENT_VERSION${NC}"

# Prompt for version bump type
echo -e "${YELLOW}Select version bump type:${NC}"
echo "1) Patch (x.x.X) - Bug fixes"
echo "2) Minor (x.X.0) - New features"
echo "3) Major (X.0.0) - Breaking changes"
read -p "Enter choice [1-3]: " BUMP_TYPE

# Bump version based on selection
case $BUMP_TYPE in
  1)
    npm version patch --no-git-tag-version
    BUMP_TYPE="patch"
    ;;
  2)
    npm version minor --no-git-tag-version
    BUMP_TYPE="minor"
    ;;
  3)
    npm version major --no-git-tag-version
    BUMP_TYPE="major"
    ;;
  *)
    echo -e "${YELLOW}Invalid selection. Using patch version bump.${NC}"
    npm version patch --no-git-tag-version
    BUMP_TYPE="patch"
    ;;
esac

# Get new version
NEW_VERSION=$(node -p "require('./package.json').version")
echo -e "${BLUE}New version: ${GREEN}$NEW_VERSION${NC}"

# Update version comment in main.ts
echo -e "${BLUE}Updating version in main.ts...${NC}"
# Update the version comment
sed -i '' "s|// @version: [0-9]*\.[0-9]*\.[0-9]* - This comment is auto-updated by deploy script|// @version: $NEW_VERSION - This comment is auto-updated by deploy script|" src/main.ts
# Update the APP_VERSION constant
sed -i '' "s|const APP_VERSION = '[0-9]*\.[0-9]*\.[0-9]*';|const APP_VERSION = '$NEW_VERSION';|" src/main.ts
echo -e "${GREEN}Version in main.ts updated to $NEW_VERSION${NC}"

# Update version in useCacheBuster.ts
echo -e "${BLUE}Updating version in useCacheBuster.ts...${NC}"
sed -i '' "s|const VERSION = '[0-9]*\.[0-9]*\.[0-9]*'; // This will be auto-updated by deploy script|const VERSION = '$NEW_VERSION'; // This will be auto-updated by deploy script|" src/composables/useCacheBuster.ts
echo -e "${GREEN}Version in useCacheBuster.ts updated to $NEW_VERSION${NC}"

# Prompt for commit message
read -p "Enter commit message (optional): " COMMIT_MSG

# Default commit message if none provided
if [[ -z "$COMMIT_MSG" ]]; then
  COMMIT_MSG="Version bump to $NEW_VERSION"
fi

# Add [deploy] tag to commit message
COMMIT_MSG="$COMMIT_MSG [deploy]"

# Commit and push changes
echo -e "${BLUE}Committing changes...${NC}"
git add package.json src/main.ts src/composables/useCacheBuster.ts
git commit -m "$COMMIT_MSG"

echo -e "${BLUE}Pushing to remote...${NC}"
git push

echo -e "${GREEN}Deployment process completed successfully!${NC}"
echo -e "${BLUE}Version bumped from ${YELLOW}$CURRENT_VERSION${BLUE} to ${GREEN}$NEW_VERSION${NC}"
echo -e "${BLUE}Changes pushed to remote with message: ${GREEN}$COMMIT_MSG${NC}" 