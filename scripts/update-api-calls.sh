#!/bin/bash

# Script to update all files to use apiClient.js
# This script lists all files that need to be updated to use the new apiClient

echo "Files that need to be updated to use apiClient.js:"
echo "================================================"

# List of files that use fetch with BACKEND_URL
files=(
  "handleSearch.js"
  "viewTransaction.js"
  "expenseQuickSearch.js"
  "initExpenseTab.js"
  "expenseQuickSearchNew.js"
  "checkSheetAccess.js"
  "handleUpdateExpense.js"
  "handleAddExpense.js"
  "renderExpenseStats.js"
  "handleSearchExpense.js"
  "handleAdd.js"
  "handleUpdate.js"
  "loadTransactions.js"
  "fetchSoftwareList.js"
  "core/sessionValidator.js"
  "deleteTransaction.js"
  "statistics-data/dataFetchers.js"
  "initExpenseDropdowns.js"
  "handleDeleteExpense.js"
  "handleAddChiPhi.js"
  "handleChangePassword.js"
  "handleUpdateCookie.js"
)

echo ""
echo "Update pattern:"
echo "1. Add import: import { apiRequestJson } from './apiClient.js';"
echo "2. Replace: await fetch(BACKEND_URL, {...}) with await apiRequestJson({action: ...})"
echo "3. Remove manual header setting for 'X-API-Key'"
echo ""

for file in "${files[@]}"; do
  echo "- $file"
done

echo ""
echo "Total files to update: ${#files[@]}"