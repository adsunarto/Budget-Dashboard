// src/components/Dashboard/Sidebar.tsx
import { useState, useEffect, useCallback } from "react";
import BudgetTable from "@/components/Overview/BudgetTable";
import VerticalBarChart from "@/components/Overview/VerticalBarChart";
import AIExplanation from "@/components/Overview/AIExplanation";
import { getFromLocalStorage, setToLocalStorage } from "@/lib/storage";
import MoneyTrends from "./MoneyTrends";
import GaugeComponent from 'react-gauge-component';

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
type Props = {
    transactions: Transaction[];
    assets: Assets;
    onDataUpdate?: (data: UserData) => void;
};

const Overview = ({ transactions, assets, onDataUpdate }: Props) => {
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

    // Initialize state with default values
    const [catsOverBudget, setCatsOverBudget] = useState(0);
    const [budgeteerScore, setBudgeteerScore] = useState(300);
    const [netSavings, setNetSavings] = useState(0);
    const [AIexplanation, setAIexplanation] = useState({ "title": "", "explanation": "" });
    const [showAIexplain, setShowAIexplain] = useState(false);

    // Update all values when dependencies change
    useEffect(() => {
        // Calculate net savings
        const newNetSavings = parseFloat(transactionsThisMonth.reduce((sum, tx) => {
            return tx.tag === "Income" ? sum + tx.amount : sum - tx.amount;
        }, 0).toFixed(2));
        
        // Calculate categories over budget
        const spendingByCategory: Record<string, number> = {};
        transactionsThisMonth.forEach((tx) => {
            if (!spendingByCategory[tx.tag]) {
                spendingByCategory[tx.tag] = 0;
            }
            spendingByCategory[tx.tag] += tx.amount;
        });

        // Update budgets with current spending
        const updatedBudgets = budgets.map(budget => ({
            ...budget,
            amountSpent: Math.abs(spendingByCategory[budget.category] || 0)
        }));

        let newCatsOverBudget = 0;
        updatedBudgets
            .filter(budget => budget.category !== "Income")
            .forEach(budget => {
                if (budget.amountSpent > budget.budgeted) {
                    newCatsOverBudget += 1;
                }
            });

        // Calculate budgeteer score
        const minScore = 300;
        const maxScore = 850;
        const maxSavingsImpact = 5000;
        const savingsRatio = Math.max(-1, Math.min(newNetSavings / maxSavingsImpact, 1));
        const savingsScore = minScore + ((savingsRatio + 1) / 2) * (maxScore - minScore);
        const penaltyPerCategory = 50;
        const categoriesPenalty = newCatsOverBudget * penaltyPerCategory;
        const categoriesScore = Math.max(minScore, maxScore - categoriesPenalty);
        const newBudgeteerScore = Math.floor(Math.max(minScore, Math.min((0.40 * categoriesScore) + (0.60 * savingsScore), maxScore)));

        // Update states
        setNetSavings(newNetSavings);
        setCatsOverBudget(newCatsOverBudget);
        setBudgeteerScore(newBudgeteerScore);

        // Only update budgets if they've actually changed
        const budgetsChanged = JSON.stringify(updatedBudgets) !== JSON.stringify(budgets);
        if (budgetsChanged) {
            setBudgets(updatedBudgets);
        }

        // Notify parent
        if (onDataUpdate) {
            onDataUpdate({
                netSavings: newNetSavings,
                categoriesOverBudget: newCatsOverBudget,
                budgeteerScore: newBudgeteerScore,
                budgets: updatedBudgets,
                assets
            });
        }
    }, [transactionsThisMonth, assets, onDataUpdate]);

    // Save budgets to localStorage
    useEffect(() => {
        setToLocalStorage("budgets", budgets);
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

    // Net Savings, Categories Over Budget, Budgeteer Score
    const cards = [
        {
            "ai-explain-id": "ai-explain-net-spend",
            "title": "Net Savings",
            "id": "net-savings",
            "value": netSavings,
            "valueSymbol": "$",
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
            "title": "Over Budget",
            "id": "categories-over-budget",
            "value": catsOverBudget,
            "valueSymbol": "",
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
            "valueSymbol": "",
            "color": getBudgeteerScoreColor(budgeteerScore),
            "additionalDetail": " " + getBudgeteerScoreCategory(budgeteerScore),
            "promptContext": [
                "Tell me what my Budgeteer Score is and why."
            ]
        }
    ]

    const userData = {
        "netSavings": netSavings,
        "categoriesOverBudget": catsOverBudget,
        "budgeteerScore": budgeteerScore,
        // "transactions": transactions,
        "budgets": budgets,
        "assets": assets
    }
    // console.log(userData);

    const fetchAIResponse = async (topic: string, context: string[]) => {
        // console.log(`Generating response for ${topic}`)
        const promptParts = [
            "You are an assistant that helps with budgeting. Your goal is to provide helpful, clear explanations.",
            "Limit your response to a short paragraph of a few sentences (with no markdown and no emojis), using only the information provided.",
            "Be direct with your response, don't say things like 'Based on x' or 'According to'.",
            "Act as if everyone knows what the value is, don't say 'It looks like' or 'I'm reporting a value of x'.",
            "Do not thank me. Do not ask me if I have any other questions. Do not use numbers or bullet points to list things.",
            "If there are easy improvements, explain how I might be able to improve the score.",
            `Explain the reasoning behind my score for ${topic} given the following data: ${JSON.stringify(userData)}.`,
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

    const handleExplainClick = async (topic: string, context: string[]) => {
        setAIexplanation({ "title": topic, "explanation": "Generating response..." })
        // console.log("userData", userData);
        setShowAIexplain(true);
        await fetchAIResponse(topic, context);
    };

    const handleCloseCard = () => {
        setShowAIexplain(false);
    };

    return (
        <>
            {/* Card Container */}
            <div className="flex justify-center" style={{ gap: "10px" }}>
                {cards.map((card, index) => (
                    <div 
                        key={`card-${index}`}
                        id={card.id} 
                        className="relative flex bg-white shadow-lg rounded-lg w-[400px] h-[200px] m-4 flex-col"
                    >
                        {/* Title and AI button row */}
                        <div className="flex justify-between items-center p-2">
                            <h3 className="text-gray-700 font-medium">{card.title}</h3>
                            <button id={card["ai-explain-id"]} className="group relative" onClick={() => handleExplainClick(card.title, card.promptContext)}>
                                <img className="icon h-4 w-4" src="src/assets/ai-sparkle.png" alt="Explain with AI" />
                                <div className="absolute hidden group-hover:flex flex-col items-center top-full right-0 mt-1 z-10">
                                    <div className="bg-gray-700 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-md">
                                        Explain with AI
                                    </div>
                                </div>
                            </button>
                        </div>

                        {/* Centered value */}
                        <div className="flex-1 flex items-center justify-center">
                            <h2 className={card.color}>
                                {card.id === "credit-score" ? (
                                    <>
                                    </>
                                ) : (
                                    <>
                                        {card.value < 0 ? "-" : ""}{card.valueSymbol}{Math.abs(card.value)}{card.additionalDetail}
                                    </>
                                )}
                            </h2>
                        </div>
                    </div>
                ))}
            </div>

            {/* AI Explanation */}
            {showAIexplain && (
                <AIExplanation
                    response={AIexplanation}
                    handleCloseCard={handleCloseCard}
                />
            )}

            {/* Budget Table Component */}
            <BudgetTable 
                transactions={transactionsThisMonth} 
                budgets={budgets} 
                setBudgets={setBudgets} 
                currentNetSavings={netSavings}
                currentCatsOverBudget={catsOverBudget}
            />

            <div className="flex">
                {/* Line Graph Component */}
                <MoneyTrends transactions={transactionsMinusPaycheck} />

                {/* Bar Graph Component */}
                <VerticalBarChart transactions={transactionsThisMonthMinusPaycheck} budgets={budgets} />
            </div>
        </>
    );
};

export default Overview;
