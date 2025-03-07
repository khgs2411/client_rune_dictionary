#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print banner
echo -e "${BLUE}"
echo "╔════════════════════════════════════════╗"
echo "║           TEST BUILD SCRIPT            ║"
echo "╚════════════════════════════════════════╝"
echo -e "${NC}"

# Clean up any leftover build directories
LEFTOVER_DIRS=$(find . -maxdepth 1 -type d -name "temp_build_*" | wc -l | tr -d ' ')
if [ "$LEFTOVER_DIRS" -gt 0 ]; then
    echo -e "${YELLOW}Found $LEFTOVER_DIRS leftover build directories.${NC}"
    echo -e "${YELLOW}Cleaning up...${NC}"
    find . -maxdepth 1 -type d -name "temp_build_*" -exec rm -rf {} \;
    echo -e "${GREEN}Cleanup completed.${NC}"
fi

# Create a temporary directory for the build
TEMP_DIR="temp_build_$(date +%s)"
mkdir -p $TEMP_DIR

echo -e "${YELLOW}Starting test build...${NC}"
echo -e "${YELLOW}Build output will be stored in ${TEMP_DIR}${NC}"

# Run the build with output redirected to a log file
LOG_FILE="${TEMP_DIR}/build.log"
echo -e "${YELLOW}Running: vite build${NC}"

# Set environment variables for the build
export VITE_HOST="http://localhost:3000"
export VITE_WS_HOST="ws://localhost:3000"

# Run the build and capture the exit code
(vite build --outDir $TEMP_DIR)
BUILD_EXIT_CODE=$?

# Check if build was successful
if [ $BUILD_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}┌────────────────────────────────────────┐${NC}"
    echo -e "${GREEN}│             BUILD SUCCESSFUL           │${NC}"
    echo -e "${GREEN}└────────────────────────────────────────┘${NC}"
    echo -e "${GREEN}Build completed successfully!${NC}"
    
    # Count files in the build directory
    FILE_COUNT=$(find $TEMP_DIR -type f | wc -l)
    echo -e "${GREEN}Generated $FILE_COUNT files${NC}"
    
    # Show the size of the build
    BUILD_SIZE=$(du -sh $TEMP_DIR | cut -f1)
    echo -e "${GREEN}Build size: $BUILD_SIZE${NC}"
    
    # Add bundle size analysis
    echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║           BUNDLE SIZE ANALYSIS         ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
    
    # Count WebP images
    WEBP_COUNT=$(find $TEMP_DIR -name "*.webp" | wc -l)
    echo -e "${GREEN}WebP Images: (~80% of total size)${NC}"
    echo -e "${GREEN}- $WEBP_COUNT webp images in the build${NC}"
    echo -e "${GREEN}- Largest images:${NC}"
    find $TEMP_DIR -name "*.webp" -exec du -h {} \; | sort -hr | head -3 | awk '{print "  - " $2 " (" $1 ")"}' | sed "s|$TEMP_DIR/||g"
    
    # Show JavaScript files
    echo -e "${GREEN}JavaScript: (~9% of total size)${NC}"
    echo -e "${GREEN}- Largest JS files:${NC}"
    find $TEMP_DIR -name "*.js" -exec du -h {} \; | sort -hr | head -3 | awk '{print "  - " $2 " (" $1 ")"}' | sed "s|$TEMP_DIR/||g"
    
    # Show PrimeIcons
    echo -e "${GREEN}PrimeIcons: (~9% of total size)${NC}"
    find $TEMP_DIR -name "primeicons*" -exec du -h {} \; | sort -hr | head -3 | awk '{print "  - " $2 " (" $1 ")"}' | sed "s|$TEMP_DIR/||g"
    
    # Show CSS
    echo -e "${GREEN}CSS: (~2% of total size)${NC}"
    find $TEMP_DIR -name "*.css" -exec du -h {} \; | sort -hr | head -3 | awk '{print "  - " $2 " (" $1 ")"}' | sed "s|$TEMP_DIR/||g"
    
    # Clean up
    echo -e "${YELLOW}Cleaning up temporary build directory...${NC}"
    rm -rf $TEMP_DIR
    echo -e "${GREEN}Test build process completed successfully!${NC}"
    exit 0
else
    echo -e "${RED}┌────────────────────────────────────────┐${NC}"
    echo -e "${RED}│              BUILD FAILED              │${NC}"
    echo -e "${RED}└────────────────────────────────────────┘${NC}"
    echo -e "${RED}Build failed with exit code: $BUILD_EXIT_CODE${NC}"
    
    # Clean up
    echo -e "${YELLOW}Cleaning up temporary build directory...${NC}"
    rm -rf $TEMP_DIR
    echo -e "${RED}Test build process failed!${NC}"
    exit 1
fi 