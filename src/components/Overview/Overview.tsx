// src/components/Dashboard/Sidebar.tsx
import { useState, useEffect } from "react";
import BudgetTable from "@/components/Overview/BudgetTable";
import VerticalBarChart from "@/components/Overview/VerticalBarChart";
import AIExplanation from "@/components/Overview/AIExplanation";
import { getFromLocalStorage, setToLocalStorage } from "@/lib/storage";

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
    accounts: object;
    loans: object;
    investments: object;
}
type props = {
    transactions: Transaction[];
    assets: Assets[];
};

const Overview = ({ transactions, assets }) => {
    function calculateNetSavings() {
        let total = 0
        transactions.forEach(tx => {
            total += tx.amount;
        });
        return parseFloat(total.toFixed(2));
    }

    const [netSavings] = useState(calculateNetSavings); // useState(parseFloat((Math.random() * 2000 - 1000).toFixed(2)));
    const defaultBudgets: Budget[] = Array.from(
        transactions.reduce((map, tx) => {
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
        let overBudget = 0;
        budgets.forEach(budget => {
            if (-1 * budget.amountSpent > budget.budgeted) {
                overBudget += 1;
            }
        })
        return overBudget;
    }

    const [catsOverBudget, setCatsOverBudget] = useState(calculateCatsOverBudget); // useState(Math.floor(Math.random() * 5));
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
                ""
            ]
        },
        {
            "ai-explain-id": "ai-explain-cats-over-budget",
            "title": "Categories Over Budget",
            "id": "categories-over-budget",
            "value": catsOverBudget,
            "valueSymbol": "",
            "color": getOverBudgetColor(catsOverBudget),
            "additionalDetail": "",
            "promptContext": [
                ""
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
                ""
            ]
        }
    ]

    const userData = {
        "netSavings": netSavings,
        "categoriesOverBudget": catsOverBudget,
        "budgeteerScore": budgeteerScore,
        "transactions": transactions,
        "budgets": budgets,
        "assets": assets
    }
    console.log(userData);

    const fetchAIResponse = async (topic: string, context: string[]) => {
        console.log(`Generating response for ${topic}`)
        const promptParts = [
            "You are an assistant that helps with budgeting. Your goal is to provide helpful, clear explanations.",
            "Limit your response to a short paragraph using only the information provided.",
            "Be direct with your response, don't say things like 'Based on x' or 'According to'.",
            "Act as if everyone knows what the value is, don't say 'It looks like' or 'I'm reporting a value of x'.",
            "If the value explained has a negative association, explain how I might be able to improve the score.",
            "The lowest Budgeteer Score is 300 and the highest Budgeteer Score is 850.",
            "A negative net earnings correlates to a lower Budgeteer Score",
            "More categories over budget correlates to a lower Budgeteer Score",
            "Regarding budgets and spending, a negative spend means the user spent that amount. If the absolute value of the amount spent is less than the budget, the user is not overbudget. If the absolute value of the amount spent is greater than the budget, the user is overbudget.",
            `Explain the reasoning behind my score for ${topic} given the following data: ${JSON.stringify(userData)}.`,
            "If the category to explain is affected by any transactions or budgets, enlighten the user to the data.",
            "Lastly, given the user's assets, does this value make sense? Offer advice based on their assets."
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
        console.log("userData", userData);
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
                {cards.map(card => (
                    // Cards
                    <div id={card.id} className="relative flex bg-white shadow-lg rounded-lg w-[400px] h-[200px] m-4 flex-col justify-center items-center text-lg text-center">
                        {/* Button in top-right */}
                        <button id={card["ai-explain-id"]} className="group absolute top-2 right-2" onClick={() => handleExplainClick(card.title, card.promptContext)}>
                            <img className="icon h-4 w-4" src="src/assets/ai-sparkle.png" alt="Explain with AI" />

                            {/* Tooltip below the icon */}
                            <div className="absolute hidden group-hover:flex flex-col items-center top-full mt-1 left-1/2 -translate-x-1/2 z-10">
                                <div className="bg-gray-700 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-md">
                                    Explain with AI
                                </div>
                            </div>
                        </button>

                        <div className="flex flex-col items-center mt-6">
                            {/* Title */}
                            <h3 className="text-gray-700 font-medium">{card.title}</h3>

                            {/* Value */}
                            <h2 className={card.color}>
                                {card.value < 0 ? "-" : ""}{card.valueSymbol}{Math.abs(card.value)}{card.additionalDetail}
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
            <BudgetTable transactions={transactions} budgets={budgets} setBudgets={setBudgets} updateCard={calculateCatsOverBudget} updateScore={calculateBudgeteerScore} />

            {/* Bar Graph Component */}
            <VerticalBarChart transactions={transactions} budgets={budgets} />
        </>
    );
};

export default Overview;
