/**
 * Cash Flow vs Accrual Charts Module
 * Handles all chart visualizations for cash flow vs accrual comparison
 */

export class CashFlowAccrualCharts {
    constructor() {
        this.charts = {};
        this.chartColors = {
            cashFlow: '#2E86AB',      // Blue for cash flow
            accrual: '#A23B72',       // Purple for accrual
            difference: '#F18F01',    // Orange for difference
            positive: '#06A77D',      // Green for positive
            negative: '#D73027',      // Red for negative
        };
    }

    /**
     * Render monthly comparison chart
     */
                    {
  });

                    },
                    {
                    },
                    {
                    }
                ]
            },
                        font: { size: 14, weight: 'bold' }
                    },
                    },
                                const value = this.formatCurrency(context.parsed.y);
                                return `${context.dataset.label}: ${value}`;
                            }
                        }
                    }
                },
                        }
                    },
                        },
                        }
                    },
                        },
                        },
                        }
                    }
                },
                }
            }
        });
    }

    /**
     * Render category comparison chart
     */
                    {
                    },
                    {
                    }
                ]
            },
                        font: { size: 14, weight: 'bold' }
                    },
  });

                    },
                                const value = this.formatCurrency(context.parsed.x);
                                return `${context.dataset.label}: ${value}`;
                            }
                        }
                    }
                },
                        },
                        }
                    },
                        }
                    }
                }
            }
        });
    }

    /**
     * Render cumulative flow chart
     */
                    {
                    },
                    {
                    }
                ]
            },
                        font: { size: 14, weight: 'bold' }
                    },
                    },
  });

                                const value = this.formatCurrency(context.parsed.y);
                                return `${context.dataset.label}: ${value}`;
                            }
                        }
                    },
                    }
                },
                        }
                    },
                        },
                        }
                    }
                },
                }
            }
        });
    }

    /**
     * Render difference analysis chart
     */
        );
        );
                    {
  });

                    }
                ]
            },
                        font: { size: 14, weight: 'bold' }
                    },
                    },
                                return [`Chênh lệch: ${value}`, interpretation];
                            }
                        }
                    }
                },
                        }
                    },
                        },
                        }
                    }
                }
            }
        });
    }

    /**
     * Render variance analysis chart
     */
        });
                    {
                        data: data.labels.map((label, index) => ({
  });

                        })),
                    }
                ]
            },
                        font: { size: 14, weight: 'bold' }
                    },
                                const pointIndex = context.dataIndex;
                                const month = data.labels[pointIndex];
                                const cashFlow = this.formatCurrency(context.parsed.x);
                                const variance = context.parsed.y.toFixed(1);
                                return [
                                    `Tháng: ${month}`,
                                    `Cash Flow: ${cashFlow}`,
                                    `Độ lệch: ${variance}%`
                                ];
                            }
                        }
                    }
                },
                        },
                        }
                    },
                        },
                        }
                    }
                }
            }
        });
    }

    /**
     * Render allocation timeline chart
     */
        };
  });

                })),
            };
        });
            data: { datasets },
  });
                        font: { size: 14, weight: 'bold' }
                    },
                                const expense = context.raw;
                                return [
                                    `Ngày: ${new Date(expense.x).toLocaleDateString('vi-VN')}`,
                                    `Số tiền: ${this.formatCurrency(expense.y)}`,
                                    `Mô tả: ${expense.description}`
                                ];
                            }
                        }
                    }
                },
                            }
                        },
                        }
                    },
                        },
                        }
                    }
                }
            }
        });
    }

    /**
     * Update all charts with new data
     */
  });

        }).format(amount);
    }
        };
        }
    }

    /**
     * Export chart as image
     */
    exportChart(chartKey, filename) {
        if (this.charts[chartKey]) {
            const url = this.charts[chartKey].toBase64Image();
            const link = document.createElement('a');
            link.download = filename || `${chartKey}-chart.png`;
            link.href = url;
            link.click();
        }
    }
}

// Export for use in other modules
export default CashFlowAccrualCharts;