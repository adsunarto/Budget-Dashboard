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

const MoneyTrends = ({ transactions }: Props) => {
    // Aggregating data by category per month
    const categoryTrends = useMemo(() => {
        const trends: { [key: string]: { [key: string]: number } } = {}; // {category: {month_year: total_spent}}

        transactions.forEach((tx) => {
            const dateObj = new Date(tx.date);
            const monthYear = `${dateObj.getMonth() + 1}-${dateObj.getFullYear()}`; // Format as MM-YYYY
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
                borderColor: getRandomColor(), // Random color for each category line
                tension: 0.1,
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
        <div className="flex h-[50vh]">  {/* Full height container with flexbox */}
            <div className="flex flex-col justify-end h-full w-[50vw] overflow-hidden">

                <Line
                    data={chartData}
                    options={{
                        responsive: true,
                        plugins: {
                            title: {
                                display: true,
                                text: "Spending Trends by Category", // Title text
                                font: {
                                    size: 18, // Set the title font size
                                    family: "'Arial', sans-serif", // Font family
                                    weight: 'bold', // Font weight
                                },
                            },
                            tooltip: {
                                callbacks: {
                                    label: (tooltipItem) => {
                                        return `${tooltipItem.dataset.label}: $${tooltipItem.raw.toFixed(2)}`;
                                    },
                                },
                            },
                        },
                        scales: {
                            x: {
                                title: {
                                    display: true,
                                    text: 'Month-Year',
                                },
                            },
                            y: {
                                title: {
                                    display: true,
                                    text: 'Change in Amount ($)',
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

// Helper function to generate random colors for each line
const getRandomColor = () => {
    const randomColor = () => Math.floor(Math.random() * 256);
    return `rgb(${randomColor()}, ${randomColor()}, ${randomColor()})`;
};

export default MoneyTrends;
