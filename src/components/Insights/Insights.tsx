// src/components/Dashboard/Sidebar.tsx
import { useState, useEffect } from "react";
import { Budget, Asset } from "@/lib/types";
import { getFromLocalStorage } from "@/lib/storage";

interface Transaction {
    amount: number;
    tag: string;
    date: string;
}

const Insights = ({ transactions, budgets }: { transactions: Transaction[], budgets: Budget[] }) => {
    const [timeframe, setTimeframe] = useState<"monthly" | "yearly">("monthly");
    // const [selectedPeriod] = useState("month");
    const [accounts, setAccounts] = useState<Asset[]>([]);
    const [loans, setLoans] = useState<Asset[]>([]);
    const [investments, setInvestments] = useState<Asset[]>([]);
    const [netWorth, setNetWorth] = useState(0);
    const [totalInvestments, setTotalInvestments] = useState(0);
    const [totalDebt, setTotalDebt] = useState(0);
    const [totalLiquidAssets, setTotalLiquidAssets] = useState(0);
    const [debtToAssetRatio, setDebtToAssetRatio] = useState(0);

    // Function to calculate all financial metrics
    const calculateFinancialMetrics = () => {
        // Calculate total investment value
        const newTotalInvestments = investments.reduce((sum, investment) => sum + Number(investment.balance), 0);
        setTotalInvestments(newTotalInvestments);

        // Calculate total debt
        const newTotalDebt = loans.reduce((sum, loan) => sum + Number(loan.balance), 0);
        setTotalDebt(newTotalDebt);

        // Calculate total liquid assets
        const newTotalLiquidAssets = accounts.reduce((sum, account) => sum + Number(account.balance), 0);
        setTotalLiquidAssets(newTotalLiquidAssets);

        // Calculate net worth
        const newNetWorth = newTotalLiquidAssets + newTotalInvestments - newTotalDebt;
        setNetWorth(parseFloat(newNetWorth.toFixed(2)));

        // Calculate debt-to-asset ratio
        const newDebtToAssetRatio = newTotalDebt / (newTotalLiquidAssets + newTotalInvestments);
        setDebtToAssetRatio(parseFloat(newDebtToAssetRatio.toFixed(2)));
    };

    // Load initial data and set up storage listener
    useEffect(() => {
        // Function to load data from localStorage
        const loadData = () => {
            const storedAccounts = getFromLocalStorage<Asset[]>("accounts", []);
            const storedLoans = getFromLocalStorage<Asset[]>("loans", []);
            const storedInvestments = getFromLocalStorage<Asset[]>("investments", []);

            // Only update if the data has actually changed
            if (JSON.stringify(storedLoans) !== JSON.stringify(loans)) {
                setLoans(storedLoans);
            }
            if (JSON.stringify(storedAccounts) !== JSON.stringify(accounts)) {
                setAccounts(storedAccounts);
            }
            if (JSON.stringify(storedInvestments) !== JSON.stringify(investments)) {
                setInvestments(storedInvestments);
            }
        };

        // Load initial data
        loadData();

        // Set up storage event listener
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === "loans") {
                const newLoans = JSON.parse(e.newValue || "[]");
                if (JSON.stringify(newLoans) !== JSON.stringify(loans)) {
                    setLoans(newLoans);
                }
            } else if (e.key === "accounts") {
                const newAccounts = JSON.parse(e.newValue || "[]");
                if (JSON.stringify(newAccounts) !== JSON.stringify(accounts)) {
                    setAccounts(newAccounts);
                }
            } else if (e.key === "investments") {
                const newInvestments = JSON.parse(e.newValue || "[]");
                if (JSON.stringify(newInvestments) !== JSON.stringify(investments)) {
                    setInvestments(newInvestments);
                }
            }
        };

        // Add a polling mechanism to check for changes
        const pollInterval = setInterval(loadData, 1000);

        window.addEventListener("storage", handleStorageChange);

        return () => {
            window.removeEventListener("storage", handleStorageChange);
            clearInterval(pollInterval);
        };
    }, [accounts, loans, investments]);

    // Recalculate metrics when data changes
    useEffect(() => {
        calculateFinancialMetrics();
    }, [accounts, loans, investments]);

    const getCurrentMonthTransactions = () => {
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        return transactions.filter(t => new Date(t.date) >= firstDayOfMonth);
    };

    const getYearToDateTransactions = () => {
        const now = new Date();
        const firstDayOfYear = new Date(now.getFullYear(), 0, 1);
        return transactions.filter(t => new Date(t.date) >= firstDayOfYear);
    };

    const getRelevantTransactions = () => {
        return timeframe === "monthly" ? getCurrentMonthTransactions() : getYearToDateTransactions();
    };

    // Calculate monthly income
    const monthlyIncome = getRelevantTransactions()
        .filter(t => t.tag === "Income")
        .reduce((sum, t) => sum + t.amount, 0);

    // Calculate spending by category
    // const spendingByCategory = getRelevantTransactions()
    //     .filter(t => t.tag !== "Income")
    //     .reduce((acc, t) => {
    //         const category = t.tag || "Uncategorized";
    //         acc[category] = (acc[category] || 0) + Math.abs(t.amount);
    //         return acc;
    //     }, {} as Record<string, number>);

    return (
        <div className="flex flex-col gap-8">
            {/* Header Section */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Financial Insights</h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => setTimeframe("monthly")}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition ${timeframe === "monthly"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                            }`}
                    >
                        Current Month
                    </button>
                    <button
                        onClick={() => setTimeframe("yearly")}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition ${timeframe === "yearly"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                            }`}
                    >
                        Year to Date
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Assets & Investments Column */}
                <div className="space-y-6">
                    <h3 className="text-xl font-semibold">Assets & Investments</h3>

                    {/* Net Worth Overview */}
                    <div className="glass p-6">
                        <h3 className="text-lg font-semibold mb-4">Net Worth Overview</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <p>Liquid Assets</p>
                                <p className="font-medium">${totalLiquidAssets.toLocaleString()}</p>
                            </div>
                            <div className="flex justify-between items-center">
                                <p>Investment Value</p>
                                <p className="font-medium">${totalInvestments.toLocaleString()}</p>
                            </div>
                            <div className="flex justify-between items-center">
                                <p>Total Debt</p>
                                <p className="font-medium text-red-600">${totalDebt.toLocaleString()}</p>
                            </div>
                            <div className="pt-4 border-t border-border">
                                <div className="flex justify-between items-center">
                                    <p>Total Net Worth</p>
                                    <p className="font-medium">${netWorth.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Investment Performance */}
                    <div className="glass p-6">
                        <h3 className="text-lg font-semibold mb-4">Investment Performance</h3>
                        <div className="space-y-4">
                            {investments.length === 0 ? (
                                <div className="text-center py-4 text-muted-foreground">
                                    No active investments
                                </div>
                            ) : (
                                <>
                                    {investments.map((investment, index) => (
                                        <div key={index} className="flex justify-between items-center">
                                            <div>
                                                <p className="font-medium">{investment.name}</p>
                                                <p className="text-sm text-muted-foreground">{investment.type}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-medium">${Number(investment.balance).toLocaleString()}</p>
                                                <p className="text-sm text-muted-foreground">{(Number(investment.balance) / totalInvestments * 100).toFixed(1)}% of portfolio</p>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="pt-4 border-t border-border">
                                        <div className="flex justify-between items-center">
                                            <p>Total Investment Value</p>
                                            <p className="font-medium">${totalInvestments.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Debt Overview */}
                    <div className="glass p-6">
                        <h3 className="text-lg font-semibold mb-4">Debt Overview</h3>
                        <div className="space-y-4">
                            {loans.length === 0 ? (
                                <div className="text-center py-4 text-muted-foreground">
                                    No active loans
                                </div>
                            ) : (
                                <>
                                    {loans.map((loan, index) => (
                                        <div key={index} className="flex justify-between items-center">
                                            <div>
                                                <p className="font-medium">{loan.name}</p>
                                                <p className="text-sm text-muted-foreground">{loan.type}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-medium">${Number(loan.balance).toLocaleString()}</p>
                                                <p className="text-sm text-muted-foreground">{(Number(loan.balance) / totalDebt * 100).toFixed(1)}% of total debt</p>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="pt-4 border-t border-border">
                                        <div className="flex justify-between items-center">
                                            <p>Total Debt</p>
                                            <p className="font-medium text-red-600">${totalDebt.toLocaleString()}</p>
                                        </div>
                                        <div className="flex justify-between items-center mt-2">
                                            <p>Debt-to-Asset Ratio</p>
                                            <p className="font-medium">{debtToAssetRatio.toFixed(2)}</p>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Budget & Spending Column */}
                <div className="space-y-6">
                    <h3 className="text-xl font-semibold">Budget & Spending</h3>

                    {/* Budget Overview */}
                    <div className="glass p-6">
                        <h3 className="text-lg font-semibold mb-4">Budget Overview</h3>
                        <div className="space-y-4">
                            {budgets.map((budget, index) => (
                                <div key={index} className="flex justify-between items-center">
                                    <div>
                                        <p className="font-medium">{budget.category}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {budget.budgeted > 0
                                                ? `Budgeted: $${budget.budgeted.toLocaleString()}`
                                                : "No budget set"}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium">${Math.abs(budget.amountSpent).toLocaleString()}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {budget.budgeted > 0
                                                ? `${((Math.abs(budget.amountSpent) / budget.budgeted) * 100).toFixed(1)}% of budget`
                                                : "No budget set"}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {budgets.length === 0 && (
                                <div className="text-center py-4 text-muted-foreground">
                                    No budgets set for this month
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Spending Trends */}
                    <div className="glass p-6">
                        <h3 className="text-lg font-semibold mb-4">Spending Trends</h3>
                        <div className="space-y-4">
                            {(() => {
                                // Calculate spending by category for current month
                                const spendingByCategory = getRelevantTransactions()
                                    .filter(t => t.tag !== "Income")
                                    .reduce((acc: Record<string, number>, t) => {
                                        const category = t.tag || "Uncategorized";
                                        acc[category] = (acc[category] || 0) + Math.abs(t.amount);
                                        return acc;
                                    }, {});

                                return (
                                    <>
                                        {Object.entries(spendingByCategory).map(([category, amount]) => (
                                            <div key={category} className="flex justify-between items-center">
                                                <p>{category}</p>
                                                <div className="flex items-center gap-4">
                                                    <p className="font-medium">${amount.toLocaleString()}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {monthlyIncome > 0
                                                            ? `${((amount / monthlyIncome) * 100).toFixed(1)}% of income`
                                                            : 'N/A'}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                        {Object.keys(spendingByCategory).length === 0 && (
                                            <div className="text-center py-4 text-muted-foreground">
                                                No spending data for this month
                                            </div>
                                        )}
                                    </>
                                );
                            })()}
                        </div>
                    </div>

                    {/* Savings Rate */}
                    <div className="glass p-6">
                        <h3 className="text-lg font-semibold mb-4">Savings Rate</h3>
                        <div className="space-y-4">
                            {(() => {
                                // Calculate monthly expenses
                                const monthlyExpenses = getRelevantTransactions()
                                    .filter(t => t.tag !== "Income")
                                    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

                                const monthlySavings = monthlyIncome - monthlyExpenses;
                                const savingsRate = monthlyIncome > 0 ? (monthlySavings / monthlyIncome) * 100 : 0;

                                return (
                                    <>
                                        <div className="flex justify-between items-center">
                                            <p>Monthly Income</p>
                                            <p className="font-medium">${monthlyIncome.toLocaleString()}</p>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <p>Monthly Expenses</p>
                                            <p className="font-medium">${monthlyExpenses.toLocaleString()}</p>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <p>Monthly Savings</p>
                                            <p className="font-medium text-green-600">${monthlySavings.toLocaleString()}</p>
                                        </div>
                                        <div className="w-full bg-muted rounded-full h-2">
                                            <div
                                                className="bg-primary h-2 rounded-full"
                                                style={{
                                                    width: `${Math.min(100, Math.max(0, savingsRate)).toFixed(1)}%`
                                                }}
                                            ></div>
                                        </div>
                                        <div className="text-center text-sm text-muted-foreground">
                                            Savings Rate: {savingsRate.toFixed(1)}%
                                        </div>
                                    </>
                                );
                            })()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Insights;

