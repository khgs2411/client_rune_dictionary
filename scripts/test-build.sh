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

# Create a temporary directory for the build
TEMP_DIR="temp_build_$(date +%s)"
mkdir -p $TEMP_DIR

echo -e "${YELLOW}Starting test build...${NC}"
echo -e "${YELLOW}Build output will be stored in ${TEMP_DIR}${NC}"

# Run the build with output redirected to a log file
LOG_FILE="${TEMP_DIR}/build.log"
echo -e "${YELLOW}Running: bun run build${NC}"

# Set environment variables for the build
export VITE_WS_HOST="localhost"

# Run the build and capture the exit code
(bun run build --outDir $TEMP_DIR) > $LOG_FILE 2>&1
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
    
    # Display the last 20 lines of the log
    echo -e "${YELLOW}Last 20 lines of build log:${NC}"
    echo -e "${RED}$(tail -n 20 $LOG_FILE)${NC}"
    
    # Clean up
    echo -e "${YELLOW}Cleaning up temporary build directory...${NC}"
    rm -rf $TEMP_DIR
    echo -e "${RED}Test build process failed!${NC}"
    exit 1
fi 