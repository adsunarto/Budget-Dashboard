import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

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

const LineChart = ({ transactions }: Props) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // Group transactions by date
    const transactionsByDate = transactions.reduce((acc, tx) => {
      const date = tx.date;
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date] += tx.amount;
      return acc;
    }, {} as Record<string, number>);

    // Sort dates chronologically
    const sortedDates = Object.keys(transactionsByDate).sort((a, b) => {
      const [aMonth, aDay, aYear] = a.split('/').map(Number);
      const [bMonth, bDay, bYear] = b.split('/').map(Number);
      return new Date(aYear, aMonth - 1, aDay).getTime() - new Date(bYear, bMonth - 1, bDay).getTime();
    });

    const labels = sortedDates;
    const data = sortedDates.map(date => transactionsByDate[date]);

    // Calculate cumulative sum
    const cumulativeData = data.reduce((acc, value, index) => {
      acc.push((acc[index - 1] || 0) + value);
      return acc;
    }, [] as number[]);

    // Destroy previous chart instance if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Create new chart
    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Daily Transactions',
            data: data,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1,
            yAxisID: 'y',
          },
          {
            label: 'Cumulative Balance',
            data: cumulativeData,
            borderColor: 'rgb(255, 99, 132)',
            tension: 0.1,
            yAxisID: 'y1',
          }
        ]
      },
      options: {
        responsive: true,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        scales: {
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: {
              display: true,
              text: 'Daily Transactions'
            }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            title: {
              display: true,
              text: 'Cumulative Balance'
            },
            grid: {
              drawOnChartArea: false,
            },
          }
        }
      }
    });

    // Cleanup function
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [transactions]);

  return (
    <div className="w-full h-96">
      <canvas ref={chartRef} />
    </div>
  );
};

export default LineChart; 