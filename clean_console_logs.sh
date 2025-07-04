#\!/bin/bash

# List of files to clean (most important first)
files=(
  "scripts/core/appInitializer.js"
  "scripts/core/authManager.js"
  "scripts/core/navigationManager.js"
  "scripts/core/stateManager.js"
  "scripts/core/sessionValidator.js"
  "scripts/core/tabPermissions.js"
  "scripts/initTransactionTab.js"
  "scripts/transactionTypeManager.js"
  "scripts/forceFullWidth.js"
  "scripts/renderExpenseStats.js"
  "scripts/updateTotalDisplay.js"
)

# Common emoji patterns to remove
patterns=(
  "🚀"
  "✅"
  "📊"
  "🔄"
  "📄"
  "📦"
  "🎯"
  "💰"
  "🔍"
  "🔐"
  "📱"
  "⚡"
  "💾"
  "📏"
  "🔧"
  "🚫"
  "📋"
  "🔑"
  "📡"
  "📈"
  "📅"
  "🎨"
  "🧭"
  "🔔"
  "⌨️"
  "📱"
  "⏭️"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "Cleaning $file..."
    # Comment out console.log lines with emojis
    for pattern in "${patterns[@]}"; do
      sed -i "s/console\.log(\([^)]*${pattern}[^)]*\))/\/\/ \1/g" "$file"
    done
  fi
done

echo "Console log cleanup complete\!"
