import { Line } from "react-chartjs-2";
import { useMemo } from "react";
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

type Props = {
    transactions: Transaction[];
};

const formatMonthYear = (dateObj: Date) => {
    const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return `${months[dateObj.getMonth()]} ${dateObj.getFullYear().toString().slice(-2)}`;
};

const MoneyTrends2 = ({ transactions }: Props) => {
    // Aggregating data by category per month
    const categoryTrends = useMemo(() => {
        const trends: { [key: string]: { [key: string]: number } } = {}; // {category: {month_year: total_spent}}

        transactions.forEach((tx: Transaction) => {
            const dateObj = new Date(tx.date);
            const monthYear = formatMonthYear(dateObj); // "Apr 2025" (current month/year)
            if (!trends[tx.tag]) {
                trends[tx.tag] = {};
            }
            if (!trends[tx.tag][monthYear]) {
                trends[tx.tag][monthYear] = 0;
            }
            trends[tx.tag][monthYear] += tx.amount;
        });

        return trends;
    }, [transactions]);

    // Prepare data for the chart, calculating delta (change from previous month)
    const chartData = useMemo(() => {
        const labels: string[] = [];
        const datasets: any[] = [];

        Object.entries(categoryTrends).forEach(([category, monthlyData]) => {
            const dataPoints = Object.entries(monthlyData)
                .sort(([monthA], [monthB]) => (monthA > monthB ? 1 : -1)) // Sort by month
                .map(([, amount], index, arr) => {
                    // If not the first entry, calculate the delta
                    if (index > 0) {
                        return amount - arr[index - 1][1];
                    }
                    return 0; // For the first month, set the delta to 0 (no prior month to compare)
                });

            // Add category name as dataset
            datasets.push({
                label: category,
                data: dataPoints,
                fill: false,
                borderColor: getRandomShades(), // Random color for each category line
                tension: 0.4,
            });

            // Add months to the label if not already added
            Object.keys(monthlyData).forEach((monthYear) => {
                if (!labels.includes(monthYear)) {
                    labels.push(monthYear);
                }
            });
        });

        return {
            labels: labels.sort(), // Sort months in chronological order
            datasets,
        };
    }, [categoryTrends]);

    return (
        <div className="w-full h-[400px] relative">
            <Line
                data={chartData}
                options={{
                    maintainAspectRatio: false,
                    responsive: true,
                    elements: {
                        point: {
                            radius: 5, // Make points slightly larger
                            hitRadius: 20, // Increase the hit detection area
                            hoverRadius: 10, // Make points even larger on hover
                        },
                    },
                    plugins: {
                        title: {
                            color: '#ffffff', // white legend text
                            display: true,
                            text: "Spending Trends by Category",
                            font: {
                                size: 18,
                                family: "'Poppins', sans-serif",
                                weight: 600,
                            },
                            padding: {
                                bottom: 20,
                            },
                        },
                        legend: {
                            labels: {
                                color: '#ffffff', // white legend text
                                font: {
                                    family: "'Poppins', sans-serif",
                                    size: 12,
                                    weight: 500,
                                },
                                padding: 20,
                                usePointStyle: true, // Nicer legend item markers
                            },
                        },
                        tooltip: {
                            backgroundColor: '#333333', // darker background for tooltip
                            titleColor: '#ffffff', // white tooltip title
                            bodyColor: '#ffffff', // white tooltip body text
                            callbacks: {
                                label: (tooltipItem: any) => {
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
                            ticks: {
                                color: '#ffffff', // white font for x-axis
                                font: {
                                    family: "'Poppins', sans-serif",
                                },
                            },
                            grid: {
                                display: false, // Remove vertical grid lines
                            },
                            title: {
                                display: true,
                                // text: 'Month-Year',
                                font: {
                                    family: "'Poppins', sans-serif",
                                    weight: 500,
                                },
                            }
                        },
                        y: {
                            grid: {
                                display: false, // Remove horizontal grid lines
                            },
                            title: {
                                display: true,
                                text: 'Change in Amount ($)',
                                font: {
                                    family: "'Poppins', sans-serif",
                                    weight: 500,
                                },
                                color: '#ffffff', // white title for y-axis
                            },
                            ticks: {
                                color: '#ffffff', // white font for x-axis
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
    );
};

// Helper function to generate random green shades
const getRandomShades = () => {
    const colors = [
        '#3B82F6', // Blue-500 (Bright blue)
        '#60A5FA', // Blue-400 (Lighter blue)
        '#22D3EE', // Cyan-400 (Bright teal)
        '#06B6D4', // Cyan-500 (Stronger teal)
        '#4ADE80', // Green-400 (Bright green)
        '#22C55E', // Green-500 (Deeper green)
        '#A78BFA', // Purple-400 (Bright purple)
        '#8B5CF6', // Purple-500 (Stronger purple)
    ];
    return colors[Math.floor(Math.random() * colors.length)];
};




export default MoneyTrends2;
