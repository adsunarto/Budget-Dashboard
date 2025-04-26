// app/components/Dashboard.tsx
import { useState } from "react";
import Sidebar from "@/components/Dashboard/Sidebar";
import Overview from "@/components/Overview/Overview";
import Activity from "@/components/Activity/Activity";
import Plan from "@/components/Plan/Plan";
import Compare from "@/components/Compare/Compare";

const transactions = [
  { id: 1, date: "1/24/2025", tag: "Groceries", name: "Trader Joe's", amount: -50.00 },
  { id: 2, date: "1/23/2025", tag: "Transportation", name: "Uber", amount: -20.00 },
  { id: 3, date: "1/22/2025", tag: "Food Delivery", name: "Door Dash", amount: -30.00 },
  { id: 4, date: "1/20/2025", tag: "Investment", name: "Roth IRA Contribution", amount: -500.00 },
  { id: 5, date: "1/18/2025", tag: "Groceries", name: "Walmart", amount: -65.00 },
  { id: 6, date: "1/16/2025", tag: "Transportation", name: "Gas Station", amount: -40.00 },
  { id: 7, date: "1/15/2025", tag: "Paycheck", name: "Paycheck", amount: 2500.00 },
  { id: 8, date: "1/13/2025", tag: "Food Delivery", name: "Uber Eats", amount: -25.00 },
  { id: 9, date: "1/11/2025", tag: "Loan Payment", name: "Auto Loan - Capital One", amount: -456.00 },
  { id: 10, date: "1/10/2025", tag: "Groceries", name: "Target", amount: -55.00 },
  { id: 11, date: "1/08/2025", tag: "Housing", name: "Mortgage Payment - Chase", amount: -3200.00 },
  { id: 12, date: "1/06/2025", tag: "Transportation", name: "Uber", amount: -20.00 },
  { id: 13, date: "1/04/2025", tag: "Paycheck", name: "Paycheck", amount: 2500.00 },
  { id: 14, date: "1/02/2025", tag: "Food Delivery", name: "Door Dash", amount: -20.00 },

  { id: 15, date: "2/24/2025", tag: "Groceries", name: "Trader Joe's", amount: -52.00 },
  { id: 16, date: "2/23/2025", tag: "Transportation", name: "Uber", amount: -18.00 },
  { id: 17, date: "2/22/2025", tag: "Food Delivery", name: "Door Dash", amount: -25.00 },
  { id: 18, date: "2/20/2025", tag: "Investment", name: "Roth IRA Contribution", amount: -500.00 },
  { id: 19, date: "2/18/2025", tag: "Groceries", name: "Walmart", amount: -67.00 },
  { id: 20, date: "2/16/2025", tag: "Transportation", name: "Gas Station", amount: -35.00 },
  { id: 21, date: "2/15/2025", tag: "Paycheck", name: "Paycheck", amount: 2500.00 },
  { id: 22, date: "2/13/2025", tag: "Food Delivery", name: "Uber Eats", amount: -22.00 },
  { id: 23, date: "2/11/2025", tag: "Loan Payment", name: "Auto Loan - Capital One", amount: -456.00 },
  { id: 24, date: "2/10/2025", tag: "Groceries", name: "Target", amount: -53.00 },
  { id: 25, date: "2/08/2025", tag: "Housing", name: "Mortgage Payment - Chase", amount: -3200.00 },
  { id: 26, date: "2/06/2025", tag: "Transportation", name: "Uber", amount: -21.00 },
  { id: 27, date: "2/04/2025", tag: "Paycheck", name: "Paycheck", amount: 2500.00 },

  { id: 28, date: "3/24/2025", tag: "Groceries", name: "Trader Joe's", amount: -42.78 },
  { id: 27, date: "3/23/2025", tag: "Transportation", name: "Uber", amount: -18.50 },
  { id: 26, date: "3/22/2025", tag: "Food Delivery", name: "Door Dash", amount: -23.40 },
  { id: 25, date: "3/20/2025", tag: "Investment", name: "Roth IRA Contribution", amount: -500.00 },
  { id: 24, date: "3/18/2025", tag: "Groceries", name: "Walmart", amount: -65.30 },
  { id: 23, date: "3/16/2025", tag: "Transportation", name: "Gas Station", amount: -42.17 },
  { id: 22, date: "3/15/2025", tag: "Paycheck", name: "Paycheck", amount: 2500.00 },
  { id: 21, date: "3/13/2025", tag: "Food Delivery", name: "Uber Eats", amount: -28.65 },
  { id: 20, date: "3/11/2025", tag: "Loan Payment", name: "Auto Loan - Capital One", amount: -456.00 }, // ~60-month loan on $24K
  { id: 19, date: "3/10/2025", tag: "Groceries", name: "Target", amount: -54.82 },
  { id: 18, date: "3/08/2025", tag: "Housing", name: "Mortgage Payment - Chase", amount: -3200.00 }, // Mortgage on $455K home
  { id: 17, date: "3/06/2025", tag: "Transportation", name: "Uber", amount: -22.41 },
  { id: 16, date: "3/04/2025", tag: "Paycheck", name: "Paycheck", amount: 2500.00 },
  { id: 15, date: "3/02/2025", tag: "Food Delivery", name: "Door Dash", amount: -19.85 },


  { id: 28, date: "4/24/2025", tag: "Groceries", name: "Trader Joe's", amount: -42.78 },
  { id: 27, date: "4/23/2025", tag: "Transportation", name: "Uber", amount: -18.50 },
  { id: 26, date: "4/22/2025", tag: "Food Delivery", name: "Door Dash", amount: -23.40 },
  { id: 25, date: "4/20/2025", tag: "Investment", name: "Roth IRA Contribution", amount: -500.00 },
  { id: 24, date: "4/18/2025", tag: "Groceries", name: "Walmart", amount: -65.30 },
  { id: 23, date: "4/16/2025", tag: "Transportation", name: "Gas Station", amount: -42.17 },
  { id: 22, date: "4/15/2025", tag: "Paycheck", name: "Paycheck", amount: 2500.00 },
  { id: 21, date: "4/13/2025", tag: "Food Delivery", name: "Uber Eats", amount: -28.65 },
  { id: 20, date: "4/11/2025", tag: "Loan Payment", name: "Auto Loan - Capital One", amount: -456.00 }, // ~60-month loan on $24K
  { id: 19, date: "4/10/2025", tag: "Groceries", name: "Target", amount: -54.82 },
  { id: 18, date: "4/08/2025", tag: "Housing", name: "Mortgage Payment - Chase", amount: -3200.00 }, // Mortgage on $455K home
  { id: 17, date: "4/06/2025", tag: "Transportation", name: "Uber", amount: -22.41 },
  { id: 16, date: "4/04/2025", tag: "Paycheck", name: "Paycheck", amount: 2500.00 },
  { id: 15, date: "4/02/2025", tag: "Food Delivery", name: "Door Dash", amount: -19.85 },

  { id: 34, date: "5/24/2025", tag: "Groceries", name: "Trader Joe's", amount: -60.00 },
  { id: 35, date: "5/23/2025", tag: "Transportation", name: "Uber", amount: -22.00 },
  { id: 36, date: "5/22/2025", tag: "Food Delivery", name: "Door Dash", amount: -28.00 },
  { id: 37, date: "5/20/2025", tag: "Investment", name: "Roth IRA Contribution", amount: -500.00 },
  { id: 38, date: "5/18/2025", tag: "Groceries", name: "Walmart", amount: -70.00 },
  { id: 39, date: "5/16/2025", tag: "Transportation", name: "Gas Station", amount: -45.00 },
  { id: 40, date: "5/15/2025", tag: "Paycheck", name: "Paycheck", amount: 2500.00 },
  { id: 41, date: "5/13/2025", tag: "Food Delivery", name: "Uber Eats", amount: -30.00 },
  { id: 42, date: "5/11/2025", tag: "Loan Payment", name: "Auto Loan - Capital One", amount: -456.00 },
  { id: 43, date: "5/10/2025", tag: "Groceries", name: "Target", amount: -60.00 },
  { id: 44, date: "5/08/2025", tag: "Housing", name: "Mortgage Payment - Chase", amount: -3200.00 },
  { id: 45, date: "5/06/2025", tag: "Transportation", name: "Uber", amount: -25.00 },
  { id: 46, date: "5/04/2025", tag: "Paycheck", name: "Paycheck", amount: 2500.00 },

  { id: 47, date: "6/24/2025", tag: "Groceries", name: "Trader Joe's", amount: -60.00 },
  { id: 48, date: "6/23/2025", tag: "Transportation", name: "Uber", amount: -22.00 },
  { id: 49, date: "6/22/2025", tag: "Food Delivery", name: "Door Dash", amount: -28.00 },
  { id: 50, date: "6/20/2025", tag: "Investment", name: "Roth IRA Contribution", amount: -500.00 },
  { id: 51, date: "6/18/2025", tag: "Groceries", name: "Walmart", amount: -72.00 },
  { id: 52, date: "6/16/2025", tag: "Transportation", name: "Gas Station", amount: -45.00 },
  { id: 53, date: "6/15/2025", tag: "Paycheck", name: "Paycheck", amount: 2500.00 },
  { id: 54, date: "6/13/2025", tag: "Food Delivery", name: "Uber Eats", amount: -35.00 },
  { id: 55, date: "6/11/2025", tag: "Loan Payment", name: "Auto Loan - Capital One", amount: -456.00 },
  { id: 56, date: "6/10/2025", tag: "Groceries", name: "Target", amount: -65.00 },
  { id: 57, date: "6/08/2025", tag: "Housing", name: "Mortgage Payment - Chase", amount: -3200.00 },
  { id: 58, date: "6/06/2025", tag: "Transportation", name: "Uber", amount: -27.00 },
  { id: 59, date: "6/04/2025", tag: "Paycheck", name: "Paycheck", amount: 2500.00 },

  { id: 60, date: "7/24/2025", tag: "Groceries", name: "Trader Joe's", amount: -55.00 },
  { id: 61, date: "7/23/2025", tag: "Transportation", name: "Uber", amount: -25.00 },
  { id: 62, date: "7/22/2025", tag: "Food Delivery", name: "Door Dash", amount: -32.00 },
  { id: 63, date: "7/20/2025", tag: "Investment", name: "Roth IRA Contribution", amount: -500.00 },
  { id: 64, date: "7/18/2025", tag: "Groceries", name: "Walmart", amount: -68.00 },
  { id: 65, date: "7/16/2025", tag: "Transportation", name: "Gas Station", amount: -50.00 },
  { id: 66, date: "7/15/2025", tag: "Paycheck", name: "Paycheck", amount: 2500.00 },
  { id: 67, date: "7/13/2025", tag: "Food Delivery", name: "Uber Eats", amount: -40.00 },
  { id: 68, date: "7/11/2025", tag: "Loan Payment", name: "Auto Loan - Capital One", amount: -456.00 },
  { id: 69, date: "7/10/2025", tag: "Groceries", name: "Target", amount: -60.00 },
  { id: 70, date: "7/08/2025", tag: "Housing", name: "Mortgage Payment - Chase", amount: -3200.00 },
  { id: 71, date: "7/06/2025", tag: "Transportation", name: "Uber", amount: -30.00 },
  { id: 72, date: "7/04/2025", tag: "Paycheck", name: "Paycheck", amount: 2500.00 },

  { id: 73, date: "8/24/2025", tag: "Groceries", name: "Trader Joe's", amount: -65.00 },
  { id: 74, date: "8/23/2025", tag: "Transportation", name: "Uber", amount: -27.00 },
  { id: 75, date: "8/22/2025", tag: "Food Delivery", name: "Door Dash", amount: -34.00 },
  { id: 76, date: "8/20/2025", tag: "Investment", name: "Roth IRA Contribution", amount: -500.00 },
  { id: 77, date: "8/18/2025", tag: "Groceries", name: "Walmart", amount: -70.00 },
  { id: 78, date: "8/16/2025", tag: "Transportation", name: "Gas Station", amount: -55.00 },
  { id: 79, date: "8/15/2025", tag: "Paycheck", name: "Paycheck", amount: 2500.00 },
  { id: 80, date: "8/13/2025", tag: "Food Delivery", name: "Uber Eats", amount: -45.00 },
  { id: 81, date: "8/11/2025", tag: "Loan Payment", name: "Auto Loan - Capital One", amount: -456.00 },
  { id: 82, date: "8/10/2025", tag: "Groceries", name: "Target", amount: -75.00 },
  { id: 83, date: "8/08/2025", tag: "Housing", name: "Mortgage Payment - Chase", amount: -3200.00 },
  { id: 84, date: "8/06/2025", tag: "Transportation", name: "Uber", amount: -35.00 },
  { id: 85, date: "8/04/2025", tag: "Paycheck", name: "Paycheck", amount: 2500.00 },

  { id: 86, date: "9/24/2025", tag: "Groceries", name: "Trader Joe's", amount: -75.00 },
  { id: 87, date: "9/23/2025", tag: "Transportation", name: "Uber", amount: -30.00 },
  { id: 88, date: "9/22/2025", tag: "Food Delivery", name: "Door Dash", amount: -40.00 },
  { id: 89, date: "9/20/2025", tag: "Investment", name: "Roth IRA Contribution", amount: -500.00 },
  { id: 90, date: "9/18/2025", tag: "Groceries", name: "Walmart", amount: -72.00 },
  { id: 91, date: "9/16/2025", tag: "Transportation", name: "Gas Station", amount: -60.00 },
  { id: 92, date: "9/15/2025", tag: "Paycheck", name: "Paycheck", amount: 2500.00 },
  { id: 93, date: "9/13/2025", tag: "Food Delivery", name: "Uber Eats", amount: -50.00 },
  { id: 94, date: "9/11/2025", tag: "Loan Payment", name: "Auto Loan - Capital One", amount: -456.00 },
  { id: 95, date: "9/10/2025", tag: "Groceries", name: "Target", amount: -80.00 },
  { id: 96, date: "9/08/2025", tag: "Housing", name: "Mortgage Payment - Chase", amount: -3200.00 },
  { id: 97, date: "9/06/2025", tag: "Transportation", name: "Uber", amount: -40.00 },
  { id: 98, date: "9/04/2025", tag: "Paycheck", name: "Paycheck", amount: 2500.00 },

  { id: 99, date: "10/24/2025", tag: "Groceries", name: "Trader Joe's", amount: -80.00 },
  { id: 100, date: "10/23/2025", tag: "Transportation", name: "Uber", amount: -32.00 },
  { id: 101, date: "10/22/2025", tag: "Food Delivery", name: "Door Dash", amount: -45.00 },
  { id: 102, date: "10/20/2025", tag: "Investment", name: "Roth IRA Contribution", amount: -500.00 },
  { id: 103, date: "10/18/2025", tag: "Groceries", name: "Walmart", amount: -80.00 },
  { id: 104, date: "10/16/2025", tag: "Transportation", name: "Gas Station", amount: -65.00 },
  { id: 105, date: "10/15/2025", tag: "Paycheck", name: "Paycheck", amount: 2500.00 },
  { id: 105, date: "10/01/2025", tag: "Paycheck", name: "Paycheck", amount: 2500.00 },
  { id: 106, date: "10/13/2025", tag: "Food Delivery", name: "Uber Eats", amount: -55.00 },
  { id: 107, date: "10/11/2025", tag: "Loan Payment", name: "Auto Loan - Capital One", amount: -456.00 },
  { id: 95, date: "10/08/2025", tag: "Groceries", name: "Target", amount: -80.00 },

  { id: 109, date: "11/24/2025", tag: "Groceries", name: "Trader Joe's", amount: -85.00 },
  { id: 110, date: "11/23/2025", tag: "Transportation", name: "Uber", amount: -35.00 },
  { id: 111, date: "11/22/2025", tag: "Food Delivery", name: "Door Dash", amount: -50.00 },
  { id: 112, date: "11/20/2025", tag: "Investment", name: "Roth IRA Contribution", amount: -500.00 },
  { id: 113, date: "11/18/2025", tag: "Groceries", name: "Walmart", amount: -82.00 },
  { id: 114, date: "11/16/2025", tag: "Transportation", name: "Gas Station", amount: -68.00 },
  { id: 115, date: "11/15/2025", tag: "Paycheck", name: "Paycheck", amount: 2500.00 },
  { id: 116, date: "11/13/2025", tag: "Food Delivery", name: "Uber Eats", amount: -58.00 },
  { id: 117, date: "11/11/2025", tag: "Loan Payment", name: "Auto Loan - Capital One", amount: -456.00 },
  { id: 118, date: "11/10/2025", tag: "Groceries", name: "Target", amount: -85.00 },
  { id: 119, date: "11/08/2025", tag: "Housing", name: "Mortgage Payment - Chase", amount: -3200.00 },
  { id: 120, date: "11/06/2025", tag: "Transportation", name: "Uber", amount: -42.00 },
  { id: 121, date: "11/04/2025", tag: "Paycheck", name: "Paycheck", amount: 2500.00 },

  { id: 122, date: "12/24/2025", tag: "Groceries", name: "Trader Joe's", amount: -90.00 },
  { id: 123, date: "12/23/2025", tag: "Transportation", name: "Uber", amount: -38.00 },
  { id: 124, date: "12/22/2025", tag: "Food Delivery", name: "Door Dash", amount: -52.00 },
  { id: 125, date: "12/20/2025", tag: "Investment", name: "Roth IRA Contribution", amount: -500.00 },
  { id: 126, date: "12/18/2025", tag: "Groceries", name: "Walmart", amount: -88.00 },
  { id: 127, date: "12/16/2025", tag: "Transportation", name: "Gas Station", amount: -70.00 },
  { id: 128, date: "12/15/2025", tag: "Paycheck", name: "Paycheck", amount: 2500.00 },
  { id: 129, date: "12/13/2025", tag: "Food Delivery", name: "Uber Eats", amount: -60.00 },
  { id: 130, date: "12/11/2025", tag: "Loan Payment", name: "Auto Loan - Capital One", amount: -456.00 },
  { id: 131, date: "12/10/2025", tag: "Groceries", name: "Target", amount: -90.00 },
  { id: 132, date: "12/08/2025", tag: "Housing", name: "Mortgage Payment - Chase", amount: -3200.00 },
  { id: 133, date: "12/06/2025", tag: "Transportation", name: "Uber", amount: -45.00 },
  { id: 134, date: "12/04/2025", tag: "Paycheck", name: "Paycheck", amount: 2500.00 }
].map(tx => ({
  ...tx,
  dateObj: new Date(tx.date), // Convert date string to Date object
  month: new Date(tx.date).getMonth(), // Store the month index (0 - 11)
  year: new Date(tx.date).getFullYear() // Store the year
}));

const assets = {
  "accounts": {
    "saving": 18000.00,
    "checking": 21850.00
  },
  "loans": {
    "Car Loan": -24000.00,
    "Home Loan": -455000.00
  },
  "investments": {
    "Roth IRA": 15200.00,
    "401K": 36965.43
  }
}

const tabs = [
  { name: "Overview", component: <Overview transactions={transactions} assets={assets} /> },
  { name: "Activity", component: <Activity transactions={transactions} /> },
  { name: "Plan", component: <Plan /> },
  { name: "Compare", component: <Compare /> }
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("Overview");

  const CurrentComponent = tabs.find((tab) => tab.name === activeTab)?.component;

  return (
    <div className="flex h-screen bg-muted">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto">{CurrentComponent}</div>
    </div>
  );
}
