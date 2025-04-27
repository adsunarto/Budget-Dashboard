import { Line } from "react-chartjs-2";
import { useMemo, useState } from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";

// Register chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

type Transaction = {
    id: number;
    date: string;
    tag: string;
    name: string;
    amount: number;
};

type TimeRange = 'weekly' | 'monthly' | 'yearly';

type Props = {
    transactions: Transaction[];
};

const formatDateLabel = (dateObj: Date, range: TimeRange) => {
    const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    
    if (range === 'weekly') {
        const year = dateObj.getFullYear();
        const month = months[dateObj.getMonth()];
        const firstDay = new Date(year, dateObj.getMonth(), 1).getDay();
        const weekNum = Math.ceil((dateObj.getDate() + firstDay) / 7);
        return `${month} W${weekNum}`;
    } else if (range === 'monthly') {
        return `${months[dateObj.getMonth()]} ${dateObj.getFullYear().toString().slice(-2)}`;
    } else {
        return dateObj.getFullYear().toString();
    }
};

const aggregateData = (transactions: Transaction[], range: TimeRange) => {
    const trends: Record<string, Record<string, number>> = {};

    transactions.forEach((tx) => {
        const date = new Date(tx.date);
        let periodKey: string;
        
        if (range === 'weekly') {
            const year = date.getFullYear();
            const month = date.getMonth();
            const firstDay = new Date(year, month, 1).getDay();
            const weekNum = Math.ceil((date.getDate() + firstDay) / 7);
            periodKey = `${year}-${month}-${weekNum}`;
        } else if (range === 'monthly') {
            periodKey = `${date.getFullYear()}-${date.getMonth()}`;
        } else {
            periodKey = `${date.getFullYear()}`;
        }

        if (!trends[tx.tag]) trends[tx.tag] = {};
        trends[tx.tag][periodKey] = (trends[tx.tag][periodKey] || 0) + tx.amount;
    });

    return trends;
};

const MoneyTrends = ({ transactions }: Props) => {
    const [timeRange, setTimeRange] = useState<TimeRange>('monthly');

    // Aggregating data by category based on selected time range
    const categoryTrends = useMemo(() => {
        return aggregateData(transactions, timeRange);
    }, [transactions, timeRange]);

    // Prepare data for the chart
    const chartData = useMemo(() => {
        const labels: string[] = [];
        const datasets: any[] = [];
        const allPeriods = new Set<string>();

        // Collect all unique periods across all categories
        Object.values(categoryTrends).forEach((periodData) => {
            Object.keys(periodData).forEach(period => allPeriods.add(period));
        });

        // Convert periods to dates for sorting
        const sortedPeriods = Array.from(allPeriods).sort((a, b) => {
            if (timeRange === 'yearly') {
                return parseInt(a) - parseInt(b);
            } else if (timeRange === 'monthly') {
                const [yearA, monthA] = a.split('-').map(Number);
                const [yearB, monthB] = b.split('-').map(Number);
                return yearA !== yearB ? yearA - yearB : monthA - monthB;
            } else {
                // weekly
                const [yearA, monthA, weekA] = a.split('-').map(Number);
                const [yearB, monthB, weekB] = b.split('-').map(Number);
                if (yearA !== yearB) return yearA - yearB;
                if (monthA !== monthB) return monthA - monthB;
                return weekA - weekB;
            }
        });

        // Create labels in the correct format
        sortedPeriods.forEach(period => {
            let dateObj: Date;
            if (timeRange === 'yearly') {
                dateObj = new Date(parseInt(period), 0, 1);
            } else if (timeRange === 'monthly') {
                const [year, month] = period.split('-').map(Number);
                dateObj = new Date(year, month, 1);
            } else {
                // weekly - approximate to first day of the week
                const [year, month, week] = period.split('-').map(Number);
                const firstDay = new Date(year, month, 1).getDay();
                const firstDate = (week - 1) * 7 - firstDay + 1;
                dateObj = new Date(year, month, firstDate);
            }
            labels.push(formatDateLabel(dateObj, timeRange));
        });

        // Create datasets for each category
        Object.entries(categoryTrends).forEach(([category, periodData]) => {
            const dataPoints = sortedPeriods.map(period => {
                return periodData[period] || 0;
            });

            datasets.push({
                label: category,
                data: dataPoints,
                fill: false,
                borderColor: getRandomShades(),
                tension: 0.4,
            });
        });

        return {
            labels,
            datasets,
        };
    }, [categoryTrends, timeRange]);

    return (
        <div className="flex flex-col h-[50vh] w-full">
            <div className="flex justify-center mb-4 space-x-4">
                <button
                    onClick={() => setTimeRange('weekly')}
                    className={`px-4 py-2 rounded-md ${timeRange === 'weekly' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                >
                    Weekly
                </button>
                <button
                    onClick={() => setTimeRange('monthly')}
                    className={`px-4 py-2 rounded-md ${timeRange === 'monthly' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                >
                    Monthly
                </button>
                <button
                    onClick={() => setTimeRange('yearly')}
                    className={`px-4 py-2 rounded-md ${timeRange === 'yearly' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                >
                    Yearly
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
                                text: `Spending Trends by Category (${timeRange.charAt(0).toUpperCase() + timeRange.slice(1)})`,
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

const getRandomShades = () => {
    const randomShades = [
        '#1A3E72', // Deep navy
        '#2D5C9E', // Corporate blue
        '#4A89DC', // Bright banking blue
        '#1565C0', // Royal blue
        '#2196F3', // Sky blue (lighter accent)

        '#1B5E20', // Forest green
        '#388E3C', // Financial green
        '#66BB6A', // Positive growth
        '#00897B', // Teal (professional)
        '#43A047',  // Credit/debit green

        '#FFD700', // Pure gold
        '#FFC400', // Bullion gold
        '#FFA000', // Amber (darker)
        '#FFF176', // Highlight yellow
        '#FDD835',  // Profit gold

        '#6A1B9A', // Deep purple
        '#4527A0', // Royal purple
        '#7E57C2', // Medium purple
        '#9575CD',  // Soft purple

        '#00897B', // Dark teal
        '#26A69A', // Medium teal
        '#4DB6AC', // Light teal
        '#80CBC4'  // Muted teal
    ];
    
    return randomShades[Math.floor(Math.random() * randomShades.length)];
};

export default MoneyTrends;