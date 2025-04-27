// app/components/Dashboard.tsx
import { useState, useMemo } from "react";
import Sidebar from "@/components/Dashboard/Sidebar";
import Overview from "@/components/Overview/Overview";
import Activity from "@/components/Activity/Activity";
import Insights from "@/components/Plan/Plan";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import InsightsPopup from "@/components/Activity/InsightsPopup";
import { getFromLocalStorage, setToLocalStorage } from "@/lib/storage";
import Learn from "@/components/Learn/Learn";


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
  },
  "loans": {
  },
  "investments": {
  }
}

type Suggestion = {
  id: number;
  text: string;
  category: string;
  currentBudget: number;
  suggestedBudget: number;
};

const tabs = [
  {
    name: "Overview",
    icon: "📊",
    component: <Overview transactions={transactions} assets={assets} />,
  },
  {
    name: "Activity",
    icon: "📝",
    component: <Activity transactions={transactions} />,
  },
  {
    name: "Learn",
    icon: "✨",
    component: <Learn userData={{
      netSavings: 1000, // Example value, should be calculated from transactions
      categoriesOverBudget: 2, // Example value
      budgeteerScore: 75, // Example value
      budgets: [
        { category: "Food", budgeted: 500, spent: 600 },
        { category: "Transportation", budgeted: 200, spent: 150 },
        { category: "Entertainment", budgeted: 300, spent: 350 }
      ],
      assets: {
        accounts: [
          { name: "Checking", balance: 5000 },
          { name: "Savings", balance: 10000 }
        ],
        loans: [
          { name: "Student Loan", balance: 20000 }
        ],
        investments: [
          { name: "401k", balance: 50000 }
        ]
      }
    }} />,
  },
  { name: "Insights", component: <Insights /> }
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("Overview");
  const [showInsights, setShowInsights] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [suggestionResponses, setSuggestionResponses] = useState<Suggestion[]>(
    getFromLocalStorage("suggestionResponses", [])
  );

  // Calculate spending by category for the current month
  const currentMonthSpending = useMemo(() => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const spending: Record<string, number> = {};
    transactions.forEach((tx) => {
      if (tx.month === currentMonth && tx.year === currentYear) {
        if (!spending[tx.tag]) {
          spending[tx.tag] = 0;
        }
        spending[tx.tag] += Math.abs(tx.amount);
      }
    });
    return spending;
  }, [transactions]);

  // Generate budget suggestions
  const generateSuggestions = () => {
    console.log("Generating suggestions...");
    const currentBudgets: { category: string; budgeted: number }[] = getFromLocalStorage("budgets", []);
    const newSuggestions: Suggestion[] = [];

    Object.entries(currentMonthSpending).forEach(([category, spent], index) => {
      if (category !== "Income") {
        const currentBudget = currentBudgets.find(b => b.category === category)?.budgeted || 0;
        const suggestedBudget = Math.round(spent * 1.1); // 10% increase
        
        newSuggestions.push({
          id: index + 1,
          text: `Consider increasing your ${category} budget by 10% to better accommodate your spending patterns.`,
          category,
          currentBudget,
          suggestedBudget,
        });
      }
    });

    setSuggestions(newSuggestions);
    setShowInsights(true);
  };

  const handleApproveSuggestion = (suggestion: Suggestion) => {
    // Update the budget
    const currentBudgets = getFromLocalStorage("budgets", []);
    const updatedBudgets = currentBudgets.map(budget => 
      budget.category === suggestion.category
        ? { ...budget, budgeted: suggestion.suggestedBudget }
        : budget
    );
    setToLocalStorage("budgets", updatedBudgets);

    // Record the response
    const updatedResponses = [...suggestionResponses, suggestion];
    setSuggestionResponses(updatedResponses);
    setToLocalStorage("suggestionResponses", updatedResponses);
  };

  const handleDenySuggestion = (suggestion: Suggestion) => {
    // Record the response without making changes
    const updatedResponses = [...suggestionResponses, suggestion];
    setSuggestionResponses(updatedResponses);
    setToLocalStorage("suggestionResponses", updatedResponses);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === "Learn") {
      setShowChat(true);
    } else {
      setShowChat(false);
    }
  };

  const CurrentComponent = tabs.find((tab) => tab.name === activeTab)?.component;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col p-6 overflow-y-auto bg-gradient-to-b from-background via-background/80 to-background/60">
        {/* Top Header */}
        <div className="flex items-center justify-between mb-6">
          {/* Left: Welcome Text */}
          <h3 className="text-3xl font-bold tracking-tight">
            {activeTab === "Overview" ? "Welcome back, Andrew!" : activeTab}
          </h3>

          {/* Right: View Insights Button */}
          <Button 
            onClick={generateSuggestions}
            className="flex items-center space-x-2 bg-white text-black border border-gray-300 hover:bg-gray-100"
          >
            <Sparkles className="h-4 w-4" /><span>View Latest Insights</span>
          </Button>
        </div>

        {/* Main Card Area */}
        <div className="grid grid-cols-1 gap-8 animate-fade-in">
          {CurrentComponent}
        </div>

        {/* Insights Popup */}
        {showInsights && suggestions.length > 0 && (
          <InsightsPopup
            suggestions={suggestions}
            onApprove={handleApproveSuggestion}
            onDeny={handleDenySuggestion}
            onClose={() => setShowInsights(false)}
          />
        )}
      </div>
    </div>
  );
}
