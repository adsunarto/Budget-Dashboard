import { Line } from "react-chartjs-2";
import { format } from 'date-fns';
import { useMemo, useState } from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";

import { Button } from "@/components/ui/button";

// Register chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

type Transaction = {
    id: number;
    date: string;
    tag: string;
    name: string;
    amount: number;
};

type TimeRange = 'week' | 'month' | 'year';

type Props = {
    transactions: Transaction[];
};

const colorMap = new Map<string, string>();

const getCurrentDateRange = (range: TimeRange) => {
    const now = new Date();
    const startDate = new Date(now);
    
    switch (range) {
        case 'week':
            // Start of current week (Sunday)
            startDate.setDate(now.getDate() - now.getDay());
            return {
                start: startDate,
                end: new Date(startDate),
                days: 7,
                increment: (date: Date) => new Date(date.setDate(date.getDate() + 1)),
                format: (date: Date) => date.toLocaleDateString('en-US', { weekday: 'short' })
            };
        case 'month':
            // Start of current month
            startDate.setDate(1);
            return {
                start: startDate,
                end: new Date(now.getFullYear(), now.getMonth() + 1, 0), // Last day of month
                days: new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate(),
                increment: (date: Date) => new Date(date.setDate(date.getDate() + 1)),
                format: (date: Date) => date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
            };
        case 'year':
            // startDate.setMonth(0, 1); // January 1st
            // const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Last day of current month
            const monthCount = now.getMonth() + 1; // e.g. April = 3 + 1 = 4 months

            // return {
            //     start: startDate,
            //     end: endDate,
            //     days: monthCount,
            //     increment: (date: Date) => new Date(date.setMonth(date.getMonth() + 1)),
            //     format: (date: Date) => date.toLocaleDateString('en-US', { month: 'short' })
            // };

            startDate.setMonth(0, 1);
            return {
                start: startDate,
                end: now, // today
                days: 12, // keep if you're still grouping by months
                increment: (date: Date) => new Date(date.setMonth(date.getMonth() + 1)),
                format: (date: Date) => date.toLocaleDateString('en-US', { month: 'short' })
            };
            }
};

const MoneyTrends = ({ transactions }: Props) => {
    const [timeRange, setTimeRange] = useState<TimeRange>('month');
    const dateRange = useMemo(() => getCurrentDateRange(timeRange), [timeRange]);

    // Filter and aggregate transactions for the current date range
    const chartData = useMemo(() => {
        const labels: string[] = [];
        const datasets: Record<string, number[]> = {};
        
        // Initialize date iterator and labels
        const currentDate = new Date(dateRange.start);
        for (let i = 0; i < dateRange.days; i++) {
            labels.push(dateRange.format(new Date(currentDate)));
            dateRange.increment(currentDate);
        }

        // Initialize datasets with zeros
        transactions.forEach(tx => {
            if (!datasets[tx.tag]) {
                datasets[tx.tag] = new Array(dateRange.days).fill(0);
            }
        });

        // Aggregate transactions within date range
        transactions.forEach(tx => {
            const txDate = new Date(tx.date);
            if (txDate >= dateRange.start && txDate <= dateRange.end) {
                const index = timeRange === 'year' 
                    ? txDate.getMonth() 
                    : Math.floor((txDate.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24));
                
                if (index >= 0 && index < dateRange.days) {
                    if (!datasets[tx.tag]) {
                        datasets[tx.tag] = new Array(dateRange.days).fill(0); 
                    }
                    datasets[tx.tag][index] += tx.amount*(-1);
                }
            }
        });

        // Then in your chartDatasets mapping, replace getRandomShades() with:
        const chartDatasets = Object.entries(datasets).map(([tag, data]) => ({
            label: tag,
            data,
            fill: false,
            borderColor: getColorForCategory(tag), // Use consistent color per category
            tension: 0.4,
        }));

        return {
            labels,
            datasets: chartDatasets,
        };
    }, [transactions, timeRange, dateRange]);

    const getButtonClass = (range: TimeRange) => 
        `w-full flex items-center gap-3 justify-center text-center px-4 py-2 rounded-lg text-sm font-medium transition ${timeRange === range ? "bg-primary/20 text-primary" : "hover:bg-muted text-muted-foreground"}`;

    return (
        <div className="flex flex-col h-[50vh] w-full">
            <div className="flex justify-center mb-4 space-x-4">
                <button
                    onClick={() => setTimeRange('week')}
                    className={getButtonClass('week')}
                >
                    This Week
                </button>
                <button
                    onClick={() => setTimeRange('month')}
                    className={getButtonClass('month')}
                >
                    This Month
                </button>
                <button
                    onClick={() => setTimeRange('year')}
                    className={getButtonClass('year')}
                >
                    This Year
                </button>
            </div>
            
            <div className="flex-grow">
                <Line
                    data={chartData}
                    options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            title: {
                                display: true,
                                text: `${timeRange === 'week' ? 'This Week' : timeRange === 'month' ? format(new Date(), 'MMMM yyyy') : format(new Date(), 'yyyy')}`,

                                // text: `Spending Trends (${timeRange === 'week' ? 'This Week' : timeRange === 'month' ? 'This Month' : 'This Year'})`,
                                font: {
                                    size: 18,
                                    family: "'Poppins', sans-serif",
                                    weight: '600',
                                },
                                padding: {
                                    bottom: 20,
                                },
                            },
                            legend: {
                                labels: {
                                    font: {
                                        family: "'Poppins', sans-serif",
                                        size: 12,
                                        weight: '500',
                                    },
                                    padding: 20,
                                    usePointStyle: true,
                                },
                            },
                            tooltip: {
                                callbacks: {
                                    label: (tooltipItem) => {
                                        return `${tooltipItem.dataset.label}: $${tooltipItem.raw.toFixed(2)}`;
                                    },
                                },
                                titleFont: {
                                    family: "'Poppins', sans-serif",
                                },
                                bodyFont: {
                                    family: "'Poppins', sans-serif",
                                },
                            },
                        },
                        scales: {
                            x: {
                                grid: {
                                    display: false,
                                    drawBorder: false,
                                },
                                ticks: {
                                    font: {
                                        family: "'Poppins', sans-serif",
                                    },
                                    maxRotation: timeRange === 'week' ? 45 : 0,
                                },
                            },
                            y: {
                                grid: {
                                    display: false,
                                    drawBorder: false,
                                },
                                title: {
                                    display: true,
                                    text: 'Amount ($)',
                                    font: {
                                        family: "'Poppins', sans-serif",
                                        weight: '500',
                                    },
                                },
                                ticks: {
                                    font: {
                                        family: "'Poppins', sans-serif",
                                    },
                                },
                                beginAtZero: true,
                            },
                        },
                    }}
                />
            </div>
        </div>
    );
};


const getColorForCategory = (category: string) => {
    // If we already have a color for this category, return it
    if (colorMap.has(category)) {
      return colorMap.get(category)!;
    }
  
    // Otherwise generate a new color and store it
    const randomShades = [
      '#1A3E72', '#2D5C9E', '#4A89DC', '#1565C0', '#2196F3',
      '#1B5E20', '#388E3C', '#66BB6A', '#00897B', '#43A047',
      '#FFD700', '#FFC400', '#FFA000', '#FFF176', '#FDD835',
      '#6A1B9A', '#4527A0', '#7E57C2', '#9575CD', '#00897B',
      '#26A69A', '#4DB6AC', '#80CBC4'
    ];
    
    // Use the category's hash to pick a consistent color
    const hash = Array.from(category).reduce(
      (hash, char) => char.charCodeAt(0) + ((hash << 5) - hash),
      0
    );
    const color = randomShades[Math.abs(hash) % randomShades.length];
    
    colorMap.set(category, color);
    return color;
  };

export default MoneyTrends;