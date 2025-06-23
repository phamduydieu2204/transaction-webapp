/**
 * Employee Charts Module
 * Quản lý các biểu đồ và visualization cho báo cáo nhân viên
 */
                },
                },
            },
                    }
                },
                    }
                }
            }
        };
    }

    /**
     * Render performance chart
     */
    renderPerformanceChart(employees) {
        const canvas = document.getElementById('employeePerformanceChart');
        if (!canvas) {
            console.warn('Performance chart canvas not found');
            return;
        }

        const ctx = canvas.getContext('2d');
        
        // Destroy existing chart
        if (this.charts.has('performance')) {
            this.charts.get('performance').destroy();
        }

        // Prepare data
        const topEmployees = employees
            .sort((a, b) => b.performanceScore - a.performanceScore)
            .slice(0, 10);

        const data = {
            labels: topEmployees.map(emp => emp.name.length > 15 ? emp.name.substr(0, 15) + '...' : emp.name),
                backgroundColor: topEmployees.map((emp, index) => {
                    if (index === 0) return '#FFD700'; // Gold for #1
                    if (index === 1) return '#C0C0C0'; // Silver for #2
                    if (index === 2) return '#CD7F32'; // Bronze for #3
                    return 'rgba(102, 126, 234, 0.8)';
                }),
                borderColor: topEmployees.map((emp, index) => {
            }]
        };
                ...this.chartConfig,
                    ...this.chartConfig.plugins,
                    }
                },
                    ...this.chartConfig.scales,
                        ...this.chartConfig.scales.y,
            };
        });
        };
                ...this.chartConfig,
                    ...this.chartConfig.plugins,
                    }
                },
                    ...this.chartConfig.scales,
                        ...this.chartConfig.scales.y,
  });

                                }).format(value);
                            }
                        }
                    }
                },
                },
            }
        };
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(255, 205, 86, 0.8)',
                    'rgba(75, 192, 192, 0.8)',
                    'rgba(153, 102, 255, 0.8)',
                    'rgba(255, 159, 64, 0.8)'
                ],
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 205, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
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
  });

                })),
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
            }]
        };
                    },
  });

                                }).format(context.parsed.x);
  });

                                }).format(context.parsed.y);
                                return [`Doanh thu: ${revenue}`, `Hoa hồng: ${commission}`];
                            }
                        }
                    }
                },
                        },
                                }).format(value);
                            }
                        }
                    },
                        },
                                }).format(value);
                            }
                        }
                    }
                }
            }
        };
            'Tốt (80-89%)': employees.filter(emp => emp.performanceScore >= 80 && emp.performanceScore < 90).length,
            'Khá (70-79%)': employees.filter(emp => emp.performanceScore >= 70 && emp.performanceScore < 80).length,
            'Trung bình (60-69%)': employees.filter(emp => emp.performanceScore >= 60 && emp.performanceScore < 70).length,
            'Cần cải thiện (<60%)': employees.filter(emp => emp.performanceScore < 60).length
        };
                    'rgba(40, 167, 69, 0.8)',   // Green for excellent
                    'rgba(23, 162, 184, 0.8)',  // Blue for good
                    'rgba(255, 193, 7, 0.8)',   // Yellow for fair
                    'rgba(255, 108, 0, 0.8)',   // Orange for average
                    'rgba(220, 53, 69, 0.8)'    // Red for needs improvement
                ],
                    'rgba(40, 167, 69, 1)',
                    'rgba(23, 162, 184, 1)',
                    'rgba(255, 193, 7, 1)',
                    'rgba(255, 108, 0, 1)',
                    'rgba(220, 53, 69, 1)'
                ],
            }]
        };
                    }
                },
                        }
                    }
                }
            }
        };

        const chart = new Chart(ctx, config);
        this.charts.set('distribution', chart);
    }

    /**
     * Update chart period
     */
    updateChartPeriod(period, employees, departments) {
        console.log(`Updating charts for period: ${period}`);
        
        // Filter data based on period
        const filteredEmployees = this.filterEmployeesByPeriod(employees, period);
        
        // Re-render all charts with filtered data
        this.renderPerformanceChart(filteredEmployees);
        this.renderRevenueTrendChart(filteredEmployees);
        this.renderDepartmentChart(departments);
        this.renderCommissionRevenueChart(filteredEmployees);
        this.renderPerformanceDistribution(filteredEmployees);
    }

    /**
     * Filter employees by time period
     */
    filterEmployeesByPeriod(employees, period) {
        // For now, return all employees as filtering would require more complex logic
        // In a real implementation, this would filter based on the period
        return employees;
    }

    /**
     * Cleanup all charts
     */
    cleanup() {
        this.charts.forEach(chart => chart.destroy());
        this.charts.clear();
    }

    /**
     * Get chart instances for external access
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
            link.download = `employee-${chartName}-chart.png`;
            link.href = url;
            link.click();
        }
    }
}