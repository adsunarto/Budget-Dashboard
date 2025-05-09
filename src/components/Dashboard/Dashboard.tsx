// app/components/Dashboard.tsx
import { useState, useEffect } from "react";
import Sidebar from "@/components/Dashboard/Sidebar";
import Overview from "@/components/Overview/Overview";
import Activity from "@/components/Activity/Activity";
import Plan from "@/components/Plan/Plan";
import Compare from "@/components/Compare/Compare";
import AIChatWindow from "@/components/Dashboard/AIChatWindow";

const transactions = [
  { id: 1, date: "1/05/2025", tag: "Food", name: "Starbucks", amount: 13.50 },
  { id: 2, date: "1/06/2025", tag: "Transportation", name: "Uber", amount: 22.00 },
  { id: 3, date: "1/08/2025", tag: "Subscription", name: "Netflix Subscription", amount: 15.99 },
  { id: 4, date: "1/10/2025", tag: "Income", name: "Paycheck", amount: 2500.00 },
  { id: 5, date: "1/12/2025", tag: "Food", name: "Panda Express", amount: 27.00 },
  { id: 6, date: "1/14/2025", tag: "Subscription", name: "Disney+ Subscription", amount: 8.99 },
  { id: 7, date: "1/16/2025", tag: "Rent/Utilities", name: "Electric Bill - PG&E", amount: 120.00 },
  { id: 8, date: "1/18/2025", tag: "Income", name: "Freelance Project", amount: 1700.00 },
  { id: 9, date: "1/20/2025", tag: "Debt Payment", name: "Student Loan - Nelnet", amount: 350.00 },
  { id: 10, date: "1/22/2025", tag: "Subscription", name: "Spotify Subscription", amount: 11.99 },
  { id: 11, date: "1/24/2025", tag: "Food", name: "Chipotle", amount: 30.00 },
  { id: 12, date: "1/25/2025", tag: "Transportation", name: "Monthly Metro Pass", amount: 70.00 },
  { id: 13, date: "1/27/2025", tag: "Rent/Utilities", name: "Rent - Apartment Complex", amount: 1450.00 },
  { id: 14, date: "1/28/2025", tag: "Food", name: "McDonald's", amount: 15.00 },
  { id: 15, date: "1/30/2025", tag: "Subscription", name: "Amazon Prime Subscription", amount: 12.99 },

  { id: 1, date: "2/01/2025", tag: "Food", name: "Chipotle", amount: 28.50 },
  { id: 2, date: "2/03/2025", tag: "Rent/Utilities", name: "Electric Bill - PG&E", amount: 120.00 },
  { id: 3, date: "2/05/2025", tag: "Subscription", name: "Netflix Subscription", amount: 15.99 },
  { id: 4, date: "2/07/2025", tag: "Income", name: "Paycheck", amount: 2500.00 },
  { id: 5, date: "2/09/2025", tag: "Food", name: "Starbucks", amount: 13.00 },
  { id: 6, date: "2/10/2025", tag: "Subscription", name: "Amazon Prime Subscription", amount: 12.99 },
  { id: 7, date: "2/12/2025", tag: "Transportation", name: "Monthly Metro Pass", amount: 75.00 },
  { id: 8, date: "2/14/2025", tag: "Subscription", name: "Spotify Subscription", amount: 11.99 },
  { id: 9, date: "2/15/2025", tag: "Income", name: "Freelance Project", amount: 1800.00 },
  { id: 10, date: "2/17/2025", tag: "Subscription", name: "HBO Max Subscription", amount: 14.99 },
  { id: 11, date: "2/18/2025", tag: "Debt Payment", name: "Student Loan - Nelnet", amount: 350.00 },
  { id: 12, date: "2/20/2025", tag: "Food", name: "Panda Express", amount: 25.00 },
  { id: 13, date: "2/22/2025", tag: "Transportation", name: "Lyft", amount: 18.00 },
  { id: 14, date: "2/25/2025", tag: "Rent/Utilities", name: "Rent - Apartment Complex", amount: 1450.00 },
  { id: 15, date: "2/28/2025", tag: "Food", name: "Chipotle", amount: 32.00 },

  { id: 1, date: "3/01/2025", tag: "Food", name: "Starbucks", amount: 12.50 },
  { id: 2, date: "3/03/2025", tag: "Rent/Utilities", name: "Electric Bill - PG&E", amount: 125.00 },
  { id: 3, date: "3/05/2025", tag: "Subscription", name: "Netflix Subscription", amount: 15.99 },
  { id: 4, date: "3/07/2025", tag: "Income", name: "Paycheck", amount: 2500.00 },
  { id: 5, date: "3/09/2025", tag: "Food", name: "Chipotle", amount: 29.00 },
  { id: 6, date: "3/12/2025", tag: "Subscription", name: "Disney+ Subscription", amount: 8.99 },
  { id: 7, date: "3/14/2025", tag: "Transportation", name: "Monthly Metro Pass", amount: 75.00 },
  { id: 8, date: "3/16/2025", tag: "Income", name: "Freelance Project", amount: 1800.00 },
  { id: 9, date: "3/18/2025", tag: "Debt Payment", name: "Student Loan - Nelnet", amount: 350.00 },
  { id: 10, date: "3/20/2025", tag: "Subscription", name: "Spotify Subscription", amount: 11.99 },
  { id: 11, date: "3/22/2025", tag: "Food", name: "Panda Express", amount: 26.00 },
  { id: 12, date: "3/24/2025", tag: "Transportation", name: "Lyft", amount: 18.00 },
  { id: 13, date: "3/26/2025", tag: "Rent/Utilities", name: "Rent - Apartment Complex", amount: 1450.00 },
  { id: 14, date: "3/28/2025", tag: "Food", name: "McDonald's", amount: 15.00 },
  { id: 15, date: "3/30/2025", tag: "Subscription", name: "Amazon Prime Subscription", amount: 12.99 },

  { id: 1, date: "4/01/2025", tag: "Food", name: "Panda Express", amount: 27.50 },
  { id: 2, date: "4/03/2025", tag: "Rent/Utilities", name: "Electric Bill - PG&E", amount: 130.00 },
  { id: 3, date: "4/05/2025", tag: "Subscription", name: "Netflix Subscription", amount: 15.99 },
  { id: 4, date: "4/07/2025", tag: "Income", name: "Paycheck", amount: 2500.00 },
  { id: 5, date: "4/09/2025", tag: "Food", name: "Starbucks", amount: 14.00 },
  { id: 6, date: "4/12/2025", tag: "Subscription", name: "Disney+ Subscription", amount: 8.99 },
  { id: 7, date: "4/14/2025", tag: "Transportation", name: "Monthly Metro Pass", amount: 75.00 },
  { id: 8, date: "4/16/2025", tag: "Income", name: "Freelance Project", amount: 1900.00 },
  { id: 9, date: "4/18/2025", tag: "Debt Payment", name: "Student Loan - Nelnet", amount: 350.00 },
  { id: 10, date: "4/20/2025", tag: "Subscription", name: "Spotify Subscription", amount: 11.99 },
  { id: 11, date: "4/22/2025", tag: "Food", name: "Chipotle", amount: 29.00 },
  { id: 12, date: "4/24/2025", tag: "Transportation", name: "Lyft", amount: 18.00 },
  { id: 13, date: "4/26/2025", tag: "Rent/Utilities", name: "Rent - Apartment Complex", amount: 1450.00 },
  { id: 14, date: "4/28/2025", tag: "Food", name: "McDonald's", amount: 16.00 },
  { id: 15, date: "4/30/2025", tag: "Subscription", name: "Amazon Prime Subscription", amount: 12.99 }
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

type Assets = {
  accounts: {
    saving: number;
    checking: number;
  };
  loans: {
    [key: string]: number;
  };
  investments: {
    [key: string]: number;
  };
};

type UserData = {
  netSavings: number;
  categoriesOverBudget: number;
  budgeteerScore: number;
  budgets: any[];
  assets: Assets;
};

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("Overview");
  const [showChat, setShowChat] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);

  const handleDataUpdate = (data: UserData) => {
    setUserData(data);
  };

  const tabs = [
    { 
      name: "Overview", 
      component: <Overview 
        transactions={transactions} 
        assets={assets} 
        onDataUpdate={handleDataUpdate}
      /> 
    },
    { name: "Activity", component: <Activity transactions={transactions} /> },
    { name: "Plan", component: <Plan /> },
    { name: "Compare", component: <Compare /> }
  ];

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

      {/* Chat Bubble AI */}
      <button 
        onClick={() => setShowChat((!showChat))}
        style={{ width: '64px', height: '64px', borderRadius: '9999px' }} 
        className="fixed bottom-4 right-4 bg-[#475598] hover:bg-[#475598]/50 flex items-center justify-center"
      >
        <img
          className="h-9 w-9 filter invert brightness-150 contrast-150"
          src="src/assets/ai-sparkle.png"
          alt="AI Assistant"
        />
      </button>

      {/* AI Chat Window */}
      {showChat && userData && <AIChatWindow 
        onClose={() => setShowChat(false)} 
        userData={userData}
      />}
    </div>
  );
}
