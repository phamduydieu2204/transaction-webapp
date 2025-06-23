/**
 * Financial Core Module
 * Xử lý và phân tích dữ liệu tài chính từ GiaoDich và ChiPhi sheets
 */

import { formatDate } from '../../formatDate.js';
import { formatDateTime } from '../../formatDateTime.js';

export class FinancialCore {
    constructor() {
        this.transactions = [];
        this.expenses = [];
        this.accounts = new Map();
        this.budgets = new Map();
        this.financialMetrics = {};
        this.isInitialized = false;
    }

    /**
     * Initialize financial management system
     */
    async initialize() {
        if (this.isInitialized) return;
        
        try {
            
            await this.loadFinancialData();
            this.processFinancialData();
            this.calculateFinancialMetrics();
            this.setupAccounts();
            this.generateFinancialHealth();
            
            this.isInitialized = true;
  } catch (error) {
            console.error('❌ Error initializing Financial Core:', error);
  } catch (error) {
            console.error('❌ Error loading financial data:', error);
            // Use mock data as fallback
                };
            }
            
            // Handle array format
            };
        });
    }

    /**
     * Extract expense data for financial analysis
     */
                };
            }
            
            // Handle array format
            };
        });
    }

    /**
     * Process financial data for analysis
     */
  });
            }
  });
            }
  });
            }
  });
            }
  });
            }
  });
            }
  });
            });
        });
        
        return cashFlowData;
    }

    /**
     * Calculate financial metrics and KPIs
     */
    calculateFinancialMetrics() {
        
        const totalRevenue = this.transactions.reduce((sum, t) => sum + t.revenue, 0);
        const totalExpenses = this.expenses.reduce((sum, e) => sum + e.amount, 0);
        const netProfit = totalRevenue - totalExpenses;
        
        // Current month data
        const currentMonth = new Date().toISOString().slice(0, 7);
        const currentMonthData = this.monthlyData.get(currentMonth) || { revenue: 0, expenses: 0, profit: 0 };
        
        // Previous month data for comparison
        const previousMonthDate = new Date();
        previousMonthDate.setMonth(previousMonthDate.getMonth() - 1);
        const previousMonth = previousMonthDate.toISOString().slice(0, 7);
        const previousMonthData = this.monthlyData.get(previousMonth) || { revenue: 0, expenses: 0, profit: 0 };
        
        // Calculate changes
            },
            },
            
            // Changes
            // Customer metrics
        };
        
    }

    /**
     * Calculate percentage change between two values
     */
    }

    /**
     * Calculate liquidity ratio
     */
    }

    /**
     * Calculate cash cycle in days
     */
    }

    /**
     * Calculate Customer Acquisition Cost (CAC)
     */
    }

    /**
     * Setup account management
     */
            }],
            ['backup', {
            }],
            ['operational', {
  });
            }]
        ]);
    }

    /**
     * Generate financial health indicators
     */
                },
                },
                },
                }
            }
        };
        
        this.financialHealth = health;
        return health;
    }

    /**
     * Generate mock data for testing
     */
    generateMockFinancialData() {
        
        // Mock transactions
        this.transactions = [
            { id: 1, date: '2025-06-01', revenue: 15000000, customer: 'Customer A', software: 'CRM Software' },
            { id: 2, date: '2025-06-05', revenue: 25000000, customer: 'Customer B', software: 'ERP System' },
            { id: 3, date: '2025-06-10', revenue: 12000000, customer: 'Customer C', software: 'Marketing Tools' }
        ];
        
        // Mock expenses
        this.expenses = [
            { id: 1, date: '2025-06-01', amount: 8000000, category: 'Nhân sự', recurring: true },
            { id: 2, date: '2025-06-02', amount: 3000000, category: 'Marketing', recurring: false },
            { id: 3, date: '2025-06-03', amount: 2000000, category: 'Công cụ', recurring: true }
        ];
    }

    /**
     * Export financial data
     */
        };
            },
            },
        };
    }
}