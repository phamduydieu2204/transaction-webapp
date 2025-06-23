/**
 * Cash Flow vs Accrual Core Module
 * Handles data processing and analysis for cash flow vs accrual accounting comparison
 */
        };
    }

    /**
     * Load and process data
     */
            // Process the data
            await this.processData();
  } catch (error) {
            console.error('❌ Error loading cash flow vs accrual data:', error);
            throw error;
        }
    }

    /**
     * Process and analyze data
     */
    async processData() {
        // Set default date range if not specified
        if (!this.dateRange) {
            const now = new Date();
            this.dateRange = {
                start: new Date(now.getFullYear(), 0, 1),
                end: new Date(now.getFullYear(), 11, 31)
            };
        }

        // Calculate cash flow view
            insights: this.generateInsights(cashFlowView, accrualView, comparison),
        };
    }

    /**
     * Generate insights from the comparison
     */
        };

        // Cash Flow Insights
  });
            });
        }

        // Count large payments
  });
            });
        }

        // Accrual Insights
  });
            });
        }

        // Comparison Insights
  });
            });
        } else if (totalDifferencePercent < 5) {
  });
            });
        }

        // Monthly variance analysis
  });
            });
        }
  });
            });
        } else if (comparison.totalDifference < 0) {
  });
            });
        }

        // Seasonal pattern recommendations
  });
            });
        }

        // Large variance recommendations
  });
            });
        }
        };
    }

    /**
     * Get monthly comparison data for charts
     */
        };
    }

    /**
     * Get category comparison data for charts
     */
                (cashFlow.byCategory[cat] || 0) - (accrual.byCategory[cat] || 0)
            )
        };
    }

    /**
     * Get cumulative flow data for charts
     */
  });
                };
            });
    }

    /**
     * Get detailed category analysis table data
     */
  });
                note: this.getCategoryNote(category, difference)
            };
        }).filter(item => item.cashFlow > 0 || item.accrual > 0);
    }

    /**
     * Get large expenses for allocation details
     */
  });
            }));
    }

    /**
     * Get recurring allocations
     */
  });
                    });
                }
            }
        });
            insights: this.analysisData?.insights || {},
        };
    }

    /**
     * Apply filters to data
     */
  });
        }).format(amount);
    }

    formatMonthLabel(monthString) {
        const [year, month] = monthString.split('-');
        return `${month}/${year}`;
    }

    getDifferenceStatus(percentDiff) {
        const abs = Math.abs(percentDiff);
        if (abs < 5) return 'excellent';
        if (abs < 15) return 'good';
        if (abs < 30) return 'warning';
        return 'critical';
    }

    getLargestMonth(monthlyData) {
        let largest = null;
        let maxAmount = 0;
        
        Object.keys(monthlyData).forEach(month => {
            if (monthlyData[month] > maxAmount) {
                maxAmount = monthlyData[month];
                largest = { month, amount: maxAmount };
            }
        });
        
        return largest;
    }

    getLargestCategory(categoryData) {
        let largest = null;
        let maxAmount = 0;
        
        Object.keys(categoryData).forEach(category => {
            if (categoryData[category] > maxAmount) {
                maxAmount = categoryData[category];
                largest = { category, amount: maxAmount };
            }
        });
        
        return largest;
    }

    detectSeasonalPattern(monthlyDiffs) {
        if (monthlyDiffs.length < 12) return false;
        
        // Simple seasonal detection - check if patterns repeat
        const quarters = [];
        for (let i = 0; i < monthlyDiffs.length; i += 3) {
            quarters.push(monthlyDiffs.slice(i, i + 3));
        }
        
        // Check variance between quarters
        return quarters.length > 1;
    }

    getAllocationMethod(expense) {
        const amount = parseFloat(expense.soTien) || parseFloat(expense.amount) || 0;
        const description = (expense.moTa || expense.description || '').toLowerCase();
        
        if (amount > 50000000) return 'annual'; // > 50M - allocate annually
        if (description.includes('thuê') || description.includes('rent')) return 'monthly';
        if (description.includes('bảo hiểm') || description.includes('insurance')) return 'annual';
        
        return 'immediate';
    }

    getCategoryNote(category, difference) {
        const absDiff = Math.abs(difference);
        if (absDiff < 1000000) return 'Cân bằng tốt';
        if (difference > 0) return 'Cash flow cao hơn';
        return 'Cần thanh toán thêm';
    }

    calculateVariance(amounts, average) {
        const sumSquares = amounts.reduce((sum, amount) => {
            return sum + Math.pow(amount - average, 2);
        }, 0);
        return Math.sqrt(sumSquares / amounts.length);
    }
}

// Export for use in other modules
export default CashFlowAccrualCore;