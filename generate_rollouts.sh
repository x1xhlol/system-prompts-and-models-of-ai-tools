#!/bin/bash

# Generate Rollouts Script
# This script generates a summary of all system prompts and AI tool configurations in the repository

echo "=================================="
echo "System Prompts and Models Rollout"
echo "=================================="
echo ""
echo "Generating rollout summary..."
echo ""

# Initialize counters
total_dirs=0
total_files=0

# Function to count files in a directory
count_files() {
    local dir="$1"
    local count=$(find "$dir" -type f \( -name "*.txt" -o -name "*.md" -o -name "*.json" \) 2>/dev/null | wc -l)
    echo "$count"
}

# Main directories to scan (excluding .git, .github, node_modules, etc.)
echo "📊 Scanning repository structure..."
echo ""

for dir in */ ; do
    # Skip hidden directories, site, and node_modules
    if [[ "$dir" == "." || "$dir" == ".git/" || "$dir" == ".github/" || "$dir" == "site/" || "$dir" == "node_modules/" ]]; then
        continue
    fi
    
    # Count files in this directory
    file_count=$(count_files "$dir")
    
    if [ $file_count -gt 0 ]; then
        total_dirs=$((total_dirs + 1))
        total_files=$((total_files + file_count))
        echo "📁 $dir - $file_count files"
    fi
done

echo ""
echo "=================================="
echo "📈 Summary:"
echo "   Total Directories: $total_dirs"
echo "   Total Files: $total_files"
echo "=================================="
echo ""
echo "✅ Rollout generation complete!"
echo ""
echo "To view specific system prompts, navigate to the respective directories."
echo "For more information, see README.md"
