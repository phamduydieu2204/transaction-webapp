/**
 * dataFetchers.js
 * 
 * Handles all data fetching operations from various sources
 * Includes API calls for expenses, transactions, and options
 */
  });
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "getExpenseStats" }),
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    if (result.status === "success") {
      const expenseData = result.data || [];
      return expenseData;
    } else {
      throw new Error(result.message || "Unknown API error");
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      console.warn(`⚠️ Expense data fetch timeout after ${timeout}ms`);
      throw new Error("Request timeout - please try again");
    } else {
      console.error("❌ Error fetching expense data:", error);
  });
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "getTransactionStats" }),
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    if (result.status === "success") {
      const transactionData = result.data || [];
      return transactionData;
    } else {
      throw new Error(result.message || "Unknown API error");
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      console.warn(`⚠️ Transaction data fetch timeout after ${timeout}ms`);
      throw new Error("Request timeout - please try again");
    } else {
      console.error("❌ Error fetching transaction data:", error);
  });
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "getExpenseDropdownOptions" }),
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    if (result.status === "success") {
      const optionsData = {
        expenseMap: result.expenseMap || {},
        bankMap: result.bankMap || {}
      };
      return optionsData;
    } else {
      throw new Error(result.message || "Unknown API error");
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      console.warn(`⚠️ Expense options fetch timeout after ${timeout}ms`);
      throw new Error("Request timeout - please try again");
    } else {
      console.error("❌ Error fetching expense options:", error);
      headers: { "Content-Type": "application/json" },
  });
        ...filters
      }),
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    if (result.status === "success") {
      const searchResults = result.data || [];
      return searchResults;
    } else {
      throw new Error(result.message || "Search failed");
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      console.warn(`⚠️ Expense search timeout after ${timeout}ms`);
      throw new Error("Search timeout - please try again");
    } else {
      console.error("❌ Error searching expenses:", error);
      headers: { "Content-Type": "application/json" },
  });
        ...filters
      }),
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    if (result.status === "success") {
      const searchResults = result.data || [];
      return searchResults;
    } else {
      throw new Error(result.message || "Search failed");
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      console.warn(`⚠️ Transaction search timeout after ${timeout}ms`);
      throw new Error("Search timeout - please try again");
    } else {
      console.error("❌ Error searching transactions:", error);
      throw error;
    }
  }
}