import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import ChartAnnotation from 'chartjs-plugin-annotation';  // Import the annotation plugin
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartAnnotation);

type Transaction = {
  id: number;
  date: string;
  tag: string;
  name: string;
  amount: number;
};
type Budget = {
  category: string;
  budgeted: number;
};
type props = {
  transactions: Transaction[];
  budgets: Budget[]; // optional for comparing with fixed budget goals
};

const VerticalBarChart = ({ transactions, budgets }: props) => {
  // Map of category -> total amount spent
  const spendingMap: Record<string, number> = {};
  transactions.forEach((tx) => {
    if (!spendingMap[tx.tag]) {
      spendingMap[tx.tag] = 0;
    }
    spendingMap[tx.tag] += Math.abs(tx.amount);
  });

  // Add any missing categories from transactions to budgets
  const updatedBudgets = [...budgets];
  Object.keys(spendingMap).forEach(category => {
    if (!updatedBudgets.some(b => b.category === category)) {
      updatedBudgets.push({ category, budgeted: 1000 }); // Default budget of 1000 for new categories
    }
  });

  // Combine category list from either budgets or spendingMap
  const categories = Array.from(new Set([
    ...updatedBudgets.map((b) => b.category),
    ...Object.keys(spendingMap),
  ])).filter(category => category !== "Income");

  const rawData = categories.map((category) => {
    const spent = spendingMap[category] || 0;
    const budgeted = updatedBudgets.find((b) => b.category === category)?.budgeted ?? 1000;
    return 100 * spent / (budgeted === 0 ? 1 : budgeted); // Avoid divide-by-zero
  });

  const data = {
    labels: categories,
    datasets: [
      {
        label: 'Spent (%)',
        data: rawData, // Your percentage of the budget spent
        backgroundColor: rawData.map((value, index) => {
          const category = categories[index];
          if (["Income", "Investment"].includes(category)) {
            if (value < 90) return '#EF4444';   // red
            if (value < 100) return '#FACC15';  // orange
            return '#34D399';                   // green
          } else {
            if (value < 90) return '#34D399';   // red
            if (value <= 100) return '#FACC15';  // orange
            return '#EF4444';                   // green
          }
        }),
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: "Budget vs Spent by Category", // Title text
        font: {
          size: 18, // Set the title font size
          family: "'Arial', sans-serif", // Font family
          weight: 'bold', // Font weight
        },
      },
      legend: {
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.raw}%`, // Display percentage in tooltip
        },
      },
      annotation: {
        annotations: {
          line1: {
            type: 'line',
            yMin: 100,
            yMax: 100,
            borderColor: 'darkred', // Color of the line
            borderWidth: 2,
            label: {
              content: '100%',
              enabled: true,
              position: 'center',
              font: {
                size: 14,
                weight: 'bold',
              },
              color: 'black', // Line label color
            },
          },
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
      },
      y: {
        beginAtZero: true,
        max: 200, // Set a max value for the Y-axis
      },
    },
  };

  return (
    <div className="flex h-[50vh]">  {/* Full height container with flexbox */}
      <div className="flex flex-col justify-end h-full w-[25vw] overflow-hidden">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default VerticalBarChart;
