#!/bin/bash

# Comprehensive Console Log Cleanup Script
# Removes all console.log statements while preserving functionality

echo "🧹 Starting comprehensive console log cleanup..."

# Count initial console.log statements
initial_count=$(grep -r "console\.log" scripts/ | wc -l)
echo "📊 Initial console.log statements found: $initial_count"

# Function to clean console logs from a file
clean_file() {
    local file="$1"
    echo "🔧 Cleaning: $file"
    
    # Remove various console.log patterns
    sed -i \
        -e 's/^[[:space:]]*console\.log(.*);[[:space:]]*$/\/\/ &/' \
        -e 's/^[[:space:]]*console\.warn(.*);[[:space:]]*$/\/\/ &/' \
        -e 's/^[[:space:]]*console\.error(.*);[[:space:]]*$/\/\/ &/' \
        -e 's/^[[:space:]]*console\.info(.*);[[:space:]]*$/\/\/ &/' \
        -e 's/^[[:space:]]*console\.debug(.*);[[:space:]]*$/\/\/ &/' \
        "$file"
}

# Clean specific files mentioned in the console output
echo "🎯 Cleaning specific files with console logs..."

# appInitializer.js
if [ -f "scripts/core/appInitializer.js" ]; then
    clean_file "scripts/core/appInitializer.js"
fi

# forceFullWidth.js
if [ -f "scripts/forceFullWidth.js" ]; then
    clean_file "scripts/forceFullWidth.js"
fi

# handleAdd.js
if [ -f "scripts/handleAdd.js" ]; then
    clean_file "scripts/handleAdd.js"
fi

# updateTable.js
if [ -f "scripts/updateTable.js" ]; then
    clean_file "scripts/updateTable.js"
fi

# cacheManager.js
if [ -f "scripts/core/cacheManager.js" ]; then
    clean_file "scripts/core/cacheManager.js"
fi

# modalUnified.js
if [ -f "scripts/modalUnified.js" ]; then
    clean_file "scripts/modalUnified.js"
fi

# uiBlocker.js
if [ -f "scripts/uiBlocker.js" ]; then
    clean_file "scripts/uiBlocker.js"
fi

# loadTransactions.js
if [ -f "scripts/loadTransactions.js" ]; then
    clean_file "scripts/loadTransactions.js"
fi

# Clean all other JavaScript files in scripts directory
echo "🔄 Cleaning all remaining JavaScript files..."
find scripts -name "*.js" -type f | while read -r file; do
    clean_file "$file"
done

# Count remaining console.log statements
final_count=$(grep -r "console\.log" scripts/ | grep -v "^[[:space:]]*\/\/" | wc -l)
echo "📊 Remaining active console.log statements: $final_count"
echo "✅ Cleaned $(($initial_count - $final_count)) console.log statements"

echo "🎉 Console log cleanup completed!"