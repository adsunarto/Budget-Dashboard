import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import ChartAnnotation from 'chartjs-plugin-annotation';  // Import the annotation plugin
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartAnnotation);
import { Transaction, Budget } from '@/lib/types';
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
    // Add the absolute value of the amount (since spending is negative)
    spendingMap[tx.tag] += Math.abs(tx.amount);
  });

  // Add any missing categories from transactions to budgets
  const updatedBudgets = [...budgets];
  Object.keys(spendingMap).forEach(category => {
    if (!updatedBudgets.some(b => b.category === category)) {
      updatedBudgets.push({ category, budgeted: 0, amountSpent: 0 }); // Start with 0 budget for new categories
    }
  });

  // Combine category list from either budgets or spendingMap
  const categories = Array.from(new Set([
    ...updatedBudgets.map((b) => b.category),
    ...Object.keys(spendingMap),
  ])).filter(category => category !== "Income");

  const rawData = categories.map((category) => {
    const spent = spendingMap[category] || 0;
    const budgeted = updatedBudgets.find((b) => b.category === category)?.budgeted || 1;
    // Calculate percentage of budget spent (spent is already positive)
    return (spent / budgeted) * 100;
  });

  const data = {
    labels: categories,
    datasets: [
      {
        label: 'Spent (%)',
        data: rawData,
        backgroundColor: (context: any) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return null; // This is for initial animation

          const value = rawData[context.dataIndex];
          const category = categories[context.dataIndex];

          // Create gradients
          const redGradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
          redGradient.addColorStop(0, '#FF4043');
          redGradient.addColorStop(1, '#FF4080');

          const greenGradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
          greenGradient.addColorStop(0, '#32FF65');
          greenGradient.addColorStop(1, '#81FFC8');

          const orangeGradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
          orangeGradient.addColorStop(0, '#FF8C00');
          orangeGradient.addColorStop(1, '#FFEC81');

          if (["Rent/Utilities", "Debt Payment"].includes(category)) {
            // Positive categories - Reward paying more
            if (value < 80) return redGradient;
            if (value < 100 || value > 100) return orangeGradient;
            return greenGradient;
          } else {
            // Negative categories - Punish spending more
            if (value < 80) return greenGradient;
            if (value <= 100) return orangeGradient;
            return redGradient;
          }
        },
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
          family: "'Poppins', sans-serif", // Font family
          weight: 'bold', // Font weight
        },
      },
      legend: {
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `${context.raw}%`, // Display percentage in tooltip
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
                family: "'Poppins', sans-serif" // Font family
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
        <Bar data={data} options={options as any} />
      </div>
    </div>
  );
};

export default VerticalBarChart;
