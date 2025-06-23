/**
 * Financial Charts Module
 * Tạo và quản lý các biểu đồ tài chính
 */
                },
                },
            },
                    }
                },
                    },
  });

                            }).format(value);
                        }
                    }
                }
            }
        };
    }

    /**
     * Render cash flow chart
     */
                {
                    backgroundColor: 'rgba(40, 167, 69, 0.8)',
                    borderColor: 'rgba(40, 167, 69, 1)',
                },
                {
                    backgroundColor: 'rgba(220, 53, 69, 0.8)',
                    borderColor: 'rgba(220, 53, 69, 1)',
                },
                {
                    borderColor: 'rgba(54, 162, 235, 1)',
                    backgroundColor: 'rgba(54, 162, 235, 0.1)',
                }
            ]
        };
                ...this.chartConfig,
                    ...this.chartConfig.plugins,
                    }
                },
                },
            }
        };
                {
                    backgroundColor: 'rgba(40, 167, 69, 0.8)',
                    borderColor: 'rgba(40, 167, 69, 1)',
                },
                {
                    backgroundColor: 'rgba(255, 193, 7, 0.8)',
                    borderColor: 'rgba(255, 193, 7, 1)',
                },
                {
                        data.profit >= 0 ? 'rgba(40, 167, 69, 0.6)' : 'rgba(220, 53, 69, 0.6)'
                    ),
                        data.profit >= 0 ? 'rgba(40, 167, 69, 1)' : 'rgba(220, 53, 69, 1)'
                    ),
                }
            ]
        };
                ...this.chartConfig,
                    ...this.chartConfig.plugins,
                    }
                }
            }
        };
                {
                    backgroundColor: 'rgba(108, 117, 125, 0.6)',
                    borderColor: 'rgba(108, 117, 125, 1)',
                    borderDash: [5, 5]
                },
                {
                    backgroundColor: 'rgba(23, 162, 184, 0.8)',
                    borderColor: 'rgba(23, 162, 184, 1)',
                },
                {
                    data: sortedActual.map((data, index) => data.expenses - budgetData[index]),
                    backgroundColor: sortedActual.map((data, index) => 
                        data.expenses <= budgetData[index] ? 'rgba(40, 167, 69, 0.6)' : 'rgba(220, 53, 69, 0.6)'
                    ),
                    borderColor: sortedActual.map((data, index) => 
                        data.expenses <= budgetData[index] ? 'rgba(40, 167, 69, 1)' : 'rgba(220, 53, 69, 1)'
                    ),
                }
            ]
        };
                ...this.chartConfig,
                    ...this.chartConfig.plugins,
                    }
                }
            }
        };
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(255, 205, 86, 0.8)',
                    'rgba(75, 192, 192, 0.8)',
                    'rgba(153, 102, 255, 0.8)',
                ],
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(255, 205, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                ],
            }]
        };
                    },
                    },
  });

                                }).format(context.parsed);
                                const percentage = ((context.parsed / context.dataset.data.reduce((a, b) => a + b, 0)) * 100).toFixed(1);
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        };
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(255, 205, 86, 0.8)',
                    'rgba(75, 192, 192, 0.8)',
                    'rgba(153, 102, 255, 0.8)',
                    'rgba(255, 159, 64, 0.8)',
                    'rgba(199, 199, 199, 0.8)',
                    'rgba(83, 102, 255, 0.8)'
                ],
            }]
        };
                    },
                    }
                }
            }
        };
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(255, 159, 64, 0.8)',
                    'rgba(255, 205, 86, 0.8)',
                    'rgba(75, 192, 192, 0.8)',
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(153, 102, 255, 0.8)',
                    'rgba(201, 203, 207, 0.8)',
                    'rgba(255, 99, 255, 0.8)'
                ],
            }]
        };
                    },
                    }
                },
  });

                                }).format(value);
                            }
                        }
                    }
                }
            }
        };
        );
                {
                    borderColor: 'rgba(40, 167, 69, 1)',
                    backgroundColor: 'rgba(40, 167, 69, 0.1)',
                },
                {
                    borderColor: 'rgba(220, 53, 69, 1)',
                    backgroundColor: 'rgba(220, 53, 69, 0.1)',
                },
                {
                    borderColor: 'rgba(54, 162, 235, 1)',
                    backgroundColor: 'rgba(54, 162, 235, 0.1)',
                }
            ]
        };
                },
                    }
                },
                        }
                    },
                        },
  });

                                }).format(value);
                            }
                        }
                    },
                        },
                        },
                                return value + '%';
                            }
                        }
                    },
                }
            }
        };

        const chart = new Chart(ctx, config);
        this.charts.set('financialTrends', chart);
    }

    /**
     * Update chart period
     */
    updateChartPeriod(period, financialData) {
        console.log(`Updating financial charts for period: ${period}`);
        
        // Filter data based on period
                break;
            case 'month':
                startDate = new Date(now.getFullYear(), quarterStart, 1);
                break;
            case 'year':
        }
        
        // Filter logic would go here
        // For now, return original data
        return data;
    }

    /**
     * Generate mock budget data
     */
    generateMockBudgetData(actualData) {
        const sortedActual = Array.from(actualData.values()).sort((a, b) => a.month.localeCompare(b.month));
        
        // Generate budget that's slightly higher than actual with some variance
        return sortedActual.map(data => {
            const variance = 0.1 + Math.random() * 0.2; // 10-30% variance
            return Math.round(data.expenses * (1 + variance));
        });
    }

    /**
     * Cleanup all charts
     */
    cleanup() {
        this.charts.forEach(chart => chart.destroy());
        this.charts.clear();
    }

    /**
     * Get chart instance
     */
    getChart(name) {
        return this.charts.get(name);
    }

    /**
     * Export chart as image
     */
    exportChart(chartName) {
        const chart = this.charts.get(chartName);
        if (chart) {
            const url = chart.toBase64Image();
            const link = document.createElement('a');
            link.download = `financial-${chartName}-chart.png`;
            link.href = url;
            link.click();
        }
    }

    /**
     * Resize all charts
     */
    resizeCharts() {
        this.charts.forEach(chart => {
            chart.resize();
        });
    }
}