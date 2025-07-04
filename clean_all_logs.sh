#\!/bin/bash

# Remove all emoji console logs from all JS files
find scripts -name "*.js" -type f -exec sed -i 's/console\.log(\([^)]*[🚀✅📊🔄📄📦🎯💰🔍🔐📱⚡💾📏🔧🚫📋🔑📡📈📅🎨🧭🔔⌨️⏭️🌐🏢🗑️⚠️❌⏰🔒📝👤💡🔧💾👁️🎨🚫][^)]*\))/\/\/ console.log(\1)/g' {} \;

echo "All emoji console logs cleaned\!"
