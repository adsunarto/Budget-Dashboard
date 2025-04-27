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

const formatMonthYear = (dateObj) => {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return `${months[dateObj.getMonth()]} ${dateObj.getFullYear().toString().slice(-2)}`;
};

const MoneyTrends = ({ transactions }: Props) => {
    // Aggregating data by category per month
    const categoryTrends = useMemo(() => {
        const trends: { [key: string]: { [key: string]: number } } = {}; // {category: {month_year: total_spent}}

        transactions.forEach((tx) => {
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
        <div className="flex h-[50vh]">  {/* Full height container with flexbox */}
            <div className="flex flex-col justify-end h-full w-[50vw] overflow-hidden">

            <Line
                data={chartData}
                options={{
                    responsive: true,
                    elements: {
                    },
                    plugins: {
                    title: {
                        display: true,
                        text: "Spending Trends by Category",
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
                        usePointStyle: true, // Nicer legend item markers
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
                        display: false, // Remove vertical grid lines
                        drawBorder: false, // Optional: remove axis line
                        },
                        title: {
                        display: true,
                        // text: 'Month-Year',
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
                    },
                    y: {
                        grid: {
                        display: false, // Remove horizontal grid lines
                        drawBorder: false, // Optional: remove axis line
                        },
                        title: {
                        display: true,
                        text: 'Change in Amount ($)',
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

// Helper function to generate random green shades
const getRandomShades = () => {

    const randomShades = [
        '#1b5af8', // Darker blue
        '#61bdff',  // Lighter blue
        '#abe394',
        '#136b38'
      ];
    
    return randomShades[Math.floor(Math.random() * randomShades.length)];
    
    // Alternative with opacity for softer look:
    // return `rgba(${red}, ${green}, ${blue}, 0.8)`;
};

export default MoneyTrends;



