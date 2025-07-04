#!/bin/bash

# Final comprehensive console log cleanup script
# This script will comment out all remaining console statements while preserving functionality

echo "🧹 Starting final console log cleanup..."

# Function to clean console logs in a file
clean_console_logs() {
    local file="$1"
    echo "Cleaning: $file"
    
    # Use perl for more powerful regex handling
    perl -i -pe '
        # Skip lines that are already commented out
        next if /^\s*\/\/.*console\./;
        
        # Comment out console.log statements
        s/^(\s*)(console\.log\s*\([^)]*\)\s*;?\s*)$/\1\/\/ \2/g;
        
        # Comment out console.warn statements
        s/^(\s*)(console\.warn\s*\([^)]*\)\s*;?\s*)$/\1\/\/ \2/g;
        
        # Comment out console.error statements (but keep real errors)
        s/^(\s*)(console\.error\s*\([^)]*\)\s*;?\s*)$/\1\/\/ \2/g unless /console\.error.*Error|console\.error.*error.*:/;
        
        # Comment out console.info statements
        s/^(\s*)(console\.info\s*\([^)]*\)\s*;?\s*)$/\1\/\/ \2/g;
        
        # Comment out console.debug statements
        s/^(\s*)(console\.debug\s*\([^)]*\)\s*;?\s*)$/\1\/\/ \2/g;
        
        # Comment out console.table statements
        s/^(\s*)(console\.table\s*\([^)]*\)\s*;?\s*)$/\1\/\/ \2/g;
        
        # Handle multiline console statements that start with console
        s/^(\s*)(console\.[a-zA-Z]+\s*\([^)]*$)/\1\/\/ \2/g;
        
        # Handle lines that are part of multiline console statements
        if (/^\s*\/\/\s*console\./ .. /\)\s*;?\s*$/) {
            unless (/^\s*\/\//) {
                s/^(\s*)(.*)$/\1\/\/ \2/;
            }
        }
    ' "$file"
}

# Find all JavaScript files and clean them
find scripts -name "*.js" -type f | while read -r file; do
    # Skip if file doesn't contain console statements
    if grep -q "console\." "$file" 2>/dev/null; then
        clean_console_logs "$file"
    fi
done

echo "✅ Final console log cleanup completed!"

# Count remaining active console statements
echo "📊 Remaining active console statements:"
find scripts -name "*.js" -type f -exec grep -H "^\s*console\." {} \; | wc -l