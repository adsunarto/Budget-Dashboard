// src/components/Dashboard/Sidebar.tsx
import { useState, useEffect, useRef } from "react";
import BudgetTable from "@/components/Overview/BudgetTable";
import VerticalBarChart from "@/components/Overview/VerticalBarChart";
import AIExplanation from "@/components/Overview/AIExplanation";
import { getFromLocalStorage, setToLocalStorage } from "@/lib/storage";
import MoneyTrends from "./MoneyTrends";
import MoneyTrends2 from "./MoneyTrends2";
import GaugeComponent from 'react-gauge-component';
import Header from "@/components/Dashboard/Header"; // Add this import at the top

import LineChart from "./LineChart";

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
    amountSpent: number;
};

type Asset = {
    type: string;
    name: string;
    balance: number;
};

type Assets = {
    accounts: Asset[];
    loans: Asset[];
    investments: Asset[];
};

const Overview = ({ transactions }) => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth(); // 0 = January, 11 = December
    const currentYear = currentDate.getFullYear();

    const transactionsThisMonth = transactions.filter((tx) => {
        const [month, day, year] = tx.date.split("/").map(Number);
        return month - 1 === currentMonth && year === currentYear;
    });

    const transactionsMinusPaycheck = transactions.filter((tx) => {
        return tx.tag !== "Income";
    });

    const spendingByCategory: Record<string, number> = {};

    transactionsThisMonth.forEach((tx) => {
        if (!spendingByCategory[tx.tag]) {
            spendingByCategory[tx.tag] = 0;
        }
        spendingByCategory[tx.tag] += tx.amount;
    });

    const transactionsThisMonthMinusPaycheck = transactionsThisMonth.filter((tx) => {
        return tx.tag !== "Income";
    });

    function calculateNetSavings() {
        let total = 0;
        transactionsThisMonth.forEach(tx => {
            if (tx.tag === "Income") {
                total += tx.amount; // Add income
            } else {
                total -= Math.abs(tx.amount); // Subtract all other expenses
            }
        });
        return parseFloat(total.toFixed(2));
    }

    const [netSavings] = useState(calculateNetSavings);

    const defaultBudgets: Budget[] = Array.from(
        transactionsThisMonth
            .filter(tx => tx.tag !== "Income")
            .reduce((map, tx) => {
                const current = map.get(tx.tag) || { budgeted: 0, amountSpent: 0 };
                current.amountSpent += tx.amount;
                map.set(tx.tag, current);
                return map;
            }, new Map())
    ).map(([category, data]) => ({
        category,
        budgeted: 0,
        amountSpent: parseFloat(data.amountSpent.toFixed(2)),
    }));
    const [budgets, setBudgets] = useState(() =>
        getFromLocalStorage("budgets", defaultBudgets)
    );

    // Add effect to listen for changes in localStorage
    useEffect(() => {
        const handleStorageChange = () => {
            const updatedBudgets = getFromLocalStorage("budgets", defaultBudgets);
            setBudgets(updatedBudgets);
        };

        // Listen for storage events
        window.addEventListener('storage', handleStorageChange);

        // Also check for changes periodically
        const interval = setInterval(handleStorageChange, 1000);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            clearInterval(interval);
        };
    }, []);

    function calculateBudgeteerScore() {
        const minScore = 300;
        const maxScore = 850;

        // 1. Normalize net savings to a range of -1 to 1
        const maxSavingsImpact = 5000; // Cap impact at ±$5000
        const savingsRatio = Math.max(-1, Math.min(netSavings / maxSavingsImpact, 1));
        const savingsScore = minScore + ((savingsRatio + 1) / 2) * (maxScore - minScore);

        // 2. Penalize categories over budget — more harshly for more categories
        const penaltyPerCategory = 50;
        const categoriesPenalty = catsOverBudget * penaltyPerCategory;
        const categoriesScore = Math.max(minScore, maxScore - categoriesPenalty);

        // 3. Weight final score (e.g., 60% categories, 40% savings)
        const finalScore = (0.40 * categoriesScore) + (0.60 * savingsScore);

        return Math.floor(Math.max(minScore, Math.min(finalScore, maxScore)));
    }

    function calculateCatsOverBudget() {
        // Calculate spending by category from current month's transactions
        const spendingByCategory: Record<string, number> = {};
        transactionsThisMonth.forEach((tx) => {
            if (!spendingByCategory[tx.tag]) {
                spendingByCategory[tx.tag] = 0;
            }
            spendingByCategory[tx.tag] += tx.amount;
        });

        let overBudget = 0;
        budgets
            .filter(budget => budget.category !== "Income")
            .forEach(budget => {
                const spent = spendingByCategory[budget.category] || 0;
                if (-1 * spent > budget.budgeted) {
                    overBudget += 1;
                }
            });
        return overBudget;
    }

    const [catsOverBudget, setCatsOverBudget] = useState(calculateCatsOverBudget);
    const [budgeteerScore, setBudgeteerScore] = useState(calculateBudgeteerScore());
    const [AIexplanation, setAIexplanation] = useState({ "title": "", "explanation": "" });
    const [showAIexplain, setShowAIexplain] = useState(false);

    useEffect(() => {
        setToLocalStorage("budgets", budgets);

        setCatsOverBudget(calculateCatsOverBudget());
        setBudgeteerScore(calculateBudgeteerScore());
    }, [budgets]);

    function getBudgeteerScoreCategory(score: number) {
        if (score >= 800 && score <= 850) {
            return "Excellent";
        } else if (score >= 740 && score < 800) {
            return "Very Good";
        } else if (score >= 670 && score < 740) {
            return "Good";
        } else if (score >= 580 && score < 670) {
            return "Fair";
        } else if (score >= 300 && score < 580) {
            return "Poor";
        } else {
            return "Invalid score";
        }
    }

    function getnetSavingsColor(value: number) {
        if (value < 0) {
            return "text-red-400";
        } else {
            return "text-green-600";
        }
    }

    function getOverBudgetColor(count: number) {
        if (count == 0) {
            return "text-green-600";
        } else if (count == 1) {
            return "text-orange-400";
        } else if (count > 1) {
            return "text-red-400"
        }
    }

    function getBudgeteerScoreColor(score: number) {
        if (score >= 800 && score <= 850) {
            return "text-green-600";
        } else if (score >= 740 && score < 800) {
            return "text-lime-500";
        } else if (score >= 670 && score < 740) {
            return "text-yellow-500";
        } else if (score >= 580 && score < 670) {
            return "text-orange-500";
        } else if (score >= 300 && score < 580) {
            return "text-red-500";
        } else {
            return "text-gray-500";
        }
    }

    function calculateNetWorth() {
        let total = 0;
        
        // Get assets from localStorage with proper typing
        const accounts: Asset[] = getFromLocalStorage("accounts", []);
        const loans: Asset[] = getFromLocalStorage("loans", []);
        const investments: Asset[] = getFromLocalStorage("investments", []);
        
        // Add all account balances
        accounts.forEach(account => {
            total += Number(account.balance);
        });
        
        // Add all investment balances
        investments.forEach(investment => {
            total += Number(investment.balance);
        });
        
        // Subtract all loan balances
        loans.forEach(loan => {
            total -= Number(loan.balance);
        });
        
        return parseFloat(total.toFixed(2));
    }

    const [netWorth, setNetWorth] = useState(calculateNetWorth);

    // Add effect to update net worth when assets change
    useEffect(() => {
        const handleStorageChange = () => {
            setNetWorth(calculateNetWorth());
        };

        // Listen for storage events
        window.addEventListener('storage', handleStorageChange);

        // Also check for changes periodically
        const interval = setInterval(handleStorageChange, 1000);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            clearInterval(interval);
        };
    }, []);

    const [primaryGoal, setPrimaryGoal] = useState(() => 
        getFromLocalStorage("primaryGoal", "Building a 6-month emergency fund")
    );

    useEffect(() => {
        setToLocalStorage("primaryGoal", primaryGoal);
    }, [primaryGoal]);

    // Net Savings, Categories Over Budget, Budgeteer Score, Net Worth
    const cards = [
        {
            "ai-explain-id": "ai-explain-net-worth",
            "title": "Net Worth",
            "id": "net-worth",
            "value": netWorth,
            "symbol": "$",
            "color": getnetSavingsColor(netWorth),
            "additionalDetail": "",
            "promptContext": [
                "Tell me about my current net worth.",
                "Explain how my assets and liabilities contribute to this value.",
                "Provide insights on how to improve my net worth.",
                "Use my assets and liabilities to explain the value. Do not discuss net savings."
            ]
        },
        {
            "ai-explain-id": "ai-explain-net-spend",
            "title": "Net Savings",
            "id": "net-savings",
            "value": netSavings,
            "symbol": "$",
            "color": getnetSavingsColor(netSavings),
            "additionalDetail": "",
            "promptContext": [
                "Tell me how much I'm saving or spending this month.",
                "Do not suggest reducing spending on necessities, such as debt or housing.",
                "The income category is not related to spending. Do not suggest reducing spending on income."
            ]
        },
        {
            "ai-explain-id": "ai-explain-cats-over-budget",
            "title": "Categories Over Budget",
            "id": "categories-over-budget",
            "value": catsOverBudget,
            "symbol": "",
            "color": getOverBudgetColor(catsOverBudget),
            "additionalDetail": "",
            "promptContext": [
                "Tell me which categories are over budget and why.",
                "Only if the absolute amount spent is greater than the budget, the category is over budget.",
            ]
        },
        {
            "ai-explain-id": "ai-explain-budgeteer-score",
            "title": "Budgeteer Score",
            "id": "credit-score",
            "value": budgeteerScore,
            "symbol": "",
            "color": getBudgeteerScoreColor(budgeteerScore),
            "additionalDetail": " " + getBudgeteerScoreCategory(budgeteerScore),
            "promptContext": [
                "Tell me what my Budgeteer Score is and why."
            ]
        }
    ]

    const userDataRef = useRef({
        "netSavings": netSavings,
        "categoriesOverBudget": catsOverBudget,
        "budgeteerScore": budgeteerScore,
        "budgets": budgets,
        "netWorth": netWorth
    });

    // Update the ref when values change
    useEffect(() => {
        userDataRef.current = {
            "netSavings": netSavings,
            "categoriesOverBudget": catsOverBudget,
            "budgeteerScore": budgeteerScore,
            "budgets": budgets,
            "netWorth": netWorth
        };
    }, [netSavings, catsOverBudget, budgeteerScore, budgets, netWorth]);

    const fetchAIResponse = async (topic: string, context: string[]) => {
        const promptParts = [
            "You are an assistant that helps with budgeting. Your goal is to provide helpful, clear explanations.",
            "Limit your response to a short paragraph of a few sentences (with no markdown and no emojis), using only the information provided.",
            "Be direct with your response, don't say things like 'Based on x' or 'According to'.",
            "Act as if everyone knows what the value is, don't say 'It looks like' or 'I'm reporting a value of x'.",
            "Do not thank me. Do not ask me if I have any other questions. Do not use numbers or bullet points to list things.",
            "If there are easy improvements, explain how I might be able to improve the score.",
            `Explain the reasoning behind my score for ${topic} given the following data: ${JSON.stringify(userDataRef.current)}.`,
            "Lastly, given the user's assets, does this value make sense? Offer advice based on their assets.",
        ];
        promptParts.push.apply(promptParts, context);
        try {
            const response = await fetch('http://localhost:11434/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'llama3',
                    prompt: promptParts.join(' ')
                }),
            });

            // Check if the response is OK (status code 200-299)
            if (!response.ok || !response.body) {
                throw new Error('Failed to fetch response from the server.');
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let done = false;
            let accumulatedData = '';
            let cleanResponse = '';
            while (!done) {
                const { value, done: streamDone } = await reader.read();
                done = streamDone;
                accumulatedData += decoder.decode(value, { stream: true });

                try {
                    const currentResponse = decoder.decode(value);
                    cleanResponse += JSON.parse(currentResponse).response;
                    setAIexplanation({ "title": topic, "explanation": cleanResponse })
                } catch (parseError) {
                    console.error("Error processing the response chunk:", parseError);
                }
            }
        } catch (error) {
            console.error("Fetch error or response handling error:", error);
            setAIexplanation({ "title": "Error: ollama not running.", "explanation": "Error retrieving response. Make sure the ollama service is running: `ollama serve`." })
        }
    };

    const [activeExplanation, setActiveExplanation] = useState<string | null>(null);

    const handleExplainClick = async (topic: string, context: string[]) => {
        if (activeExplanation === topic) {
            setActiveExplanation(null);
            return;
        }
        setActiveExplanation(topic);
        await fetchAIResponse(topic, context);
    };

    const handleRefreshClick = async (topic: string, context: string[]) => {
        await fetchAIResponse(topic, context);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
            {/* Primary Goal Card */}
            <div className="lg:col-span-3">
                <div className="glass p-6">
                    <div className="flex flex-col gap-4">
                        <h4 className="text-base font-semibold">Primary Financial Goal</h4>
                        <div className="flex flex-col gap-2">
                            <select
                                value={primaryGoal}
                                onChange={(e) => setPrimaryGoal(e.target.value)}
                                className="w-full bg-transparent border-b border-border focus:outline-none focus:border-primary transition text-base appearance-none"
                            >
                                <option value="Build 6 month emergency fund">Build 6 month emergency fund</option>
                                <option value="Prioritizing paying off student loans">Prioritizing paying off student loans</option>
                                <option value="Reducing money spent eating out">Reducing money spent eating out</option>
                                <option value="Saving money for a condo">Saving money for a condo</option>
                            </select>
                            <p className="text-sm text-muted-foreground">
                                This will help personalize your insights and suggestions
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Left Column */}
            <div className="flex flex-col gap-8 lg:col-span-2">
                <div className="glass p-6">
                    <MoneyTrends2 transactions={transactionsMinusPaycheck} />
                </div>

                {/* Graphs Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="glass p-6">
                        <MoneyTrends transactions={transactionsMinusPaycheck} />
                    </div>

                    <div className="glass p-6">
                        <VerticalBarChart transactions={transactionsThisMonthMinusPaycheck} budgets={budgets} />
                    </div>
                </div>
            </div>

            {/* Right Column */}
            <div className="flex flex-col gap-8 lg:col-span-1">
                {/* Card Section */}
                <div className="flex flex-col gap-6">
                    {cards.map((card) => (
                        <div key={card.id} className="relative flex flex-col items-center text-center glass p-6">
                            {/* Action Buttons in the top-right */}
                            <div className="absolute top-4 right-4 flex gap-2">
                                {activeExplanation === card.title ? (
                                    <>
                                        <button
                                            onClick={() => handleRefreshClick(card.title, card.promptContext)}
                                            className="p-1 rounded-full transition hover:bg-gray-100 dark:hover:bg-gray-700"
                                            title="Refresh explanation"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => setActiveExplanation(null)}
                                            className="p-1 rounded-full transition hover:bg-gray-100 dark:hover:bg-gray-700"
                                            title="Close explanation"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => handleExplainClick(card.title, card.promptContext)}
                                        className="p-1 rounded-full transition hover:bg-gray-100 dark:hover:bg-gray-700"
                                        title="Explain with AI"
                                    >
                                        <img
                                            src="src/assets/ai-sparkle.png"
                                            alt="Explain with AI"
                                            className="h-5 w-5 filter invert"
                                        />
                                    </button>
                                )}
                            </div>

                            {/* Card content */}
                            <h3 className="text-lg font-semibold mb-2">{card.title}</h3>
                            <h2 className={`text-3xl font-bold mt-4 ${card.color}`}>
                                {card.value < 0 ? "-" : ""}{card.symbol}{Math.abs(card.value)}
                                {card.additionalDetail}
                            </h2>

                            {/* AI Explanation */}
                            {activeExplanation === card.title && (
                                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm text-left">
                                    {AIexplanation.title === card.title ? (
                                        <p>{AIexplanation.explanation}</p>
                                    ) : (
                                        <p className="text-gray-500 dark:text-gray-400">Generating explanation...</p>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Budget Table */}
                <div className="glass p-6">
                    <BudgetTable
                        transactions={transactionsThisMonth}
                        budgets={budgets}
                        setBudgets={setBudgets}
                        updateCard={calculateCatsOverBudget}
                        updateScore={calculateBudgeteerScore}
                    />
                </div>
            </div>
        </div>
    );
};

export default Overview;
