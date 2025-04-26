// app/components/Dashboard.tsx
import { useState } from "react";
import Sidebar from "@/components/Dashboard/Sidebar";
import Overview from "@/components/Overview/Overview";
import Activity from "@/components/Activity/Activity";
import Plan from "@/components/Plan/Plan";
import Compare from "@/components/Compare/Compare";

const transactions = [
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
  { id: 14, date: "3/30/2025", tag: "Groceries", name: "Costco", amount: -127.93 },
  { id: 13, date: "3/29/2025", tag: "Transportation", name: "Uber", amount: -16.50 },
  { id: 12, date: "3/28/2025", tag: "Food Delivery", name: "Chick-fil-A", amount: -17.99 },
  { id: 11, date: "3/27/2025", tag: "Subscription", name: "Spotify", amount: -10.99 },
  { id: 10, date: "3/26/2025", tag: "Groceries", name: "Whole Foods", amount: -48.60 },
  { id: 9,  date: "3/25/2025", tag: "Loan Payment", name: "Auto Loan - Capital One", amount: -456.00 },
];
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
