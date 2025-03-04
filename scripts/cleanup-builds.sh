#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print banner
echo -e "${BLUE}"
echo "╔════════════════════════════════════════╗"
echo "║           CLEANUP BUILD SCRIPT         ║"
echo "╚════════════════════════════════════════╝"
echo -e "${NC}"

# Find all temp_build directories
TEMP_DIRS=$(find . -maxdepth 1 -type d -name "temp_build_*")
COUNT=$(echo "$TEMP_DIRS" | grep -v "^$" | wc -l)

if [ $COUNT -eq 0 ]; then
    echo -e "${GREEN}No temporary build directories found.${NC}"
    exit 0
fi

echo -e "${YELLOW}Found $COUNT temporary build directories:${NC}"
echo "$TEMP_DIRS" | sed 's/^\.\//  - /'

# Ask for confirmation
echo -e "${YELLOW}Do you want to remove these directories? (y/n)${NC}"
read -r CONFIRM

if [[ $CONFIRM =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Removing temporary build directories...${NC}"
    echo "$TEMP_DIRS" | xargs rm -rf
    echo -e "${YELLOW}Removing timestamp files...${NC}"
    find . -name "*.timestamp-*" -type f -delete
    echo -e "${GREEN}Successfully removed $COUNT temporary build directories.${NC}"
else
    echo -e "${YELLOW}Operation cancelled.${NC}"
fi 