// src/components/Dashboard/Sidebar.tsx
import { useState } from "react";

const Insights = () => {
    const [selectedTimeframe, setSelectedTimeframe] = useState("monthly");
    const [selectedPeriod, setSelectedPeriod] = useState("month");

    return (
        <div className="flex flex-col gap-8">
            {/* Header Section */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Financial Insights</h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => setSelectedTimeframe("monthly")}
                        className={`px-4 py-2 rounded-lg ${
                            selectedTimeframe === "monthly"
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                        }`}
                    >
                        Monthly
                    </button>
                    <button
                        onClick={() => setSelectedTimeframe("yearly")}
                        className={`px-4 py-2 rounded-lg ${
                            selectedTimeframe === "yearly"
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                        }`}
                    >
                        Yearly
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Planning Column */}
                <div className="space-y-6">
                    <h3 className="text-xl font-semibold">Planning</h3>
                    
                    {/* Savings Goals */}
                    <div className="glass p-6">
                        <h3 className="text-lg font-semibold mb-4">Savings Goals</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-medium">Emergency Fund</p>
                                    <p className="text-sm text-muted-foreground">Target: $10,000</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium">$5,000</p>
                                    <p className="text-sm text-muted-foreground">50% complete</p>
                                </div>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                                <div className="bg-primary h-2 rounded-full" style={{ width: "50%" }}></div>
                            </div>
                        </div>
                    </div>

                    {/* Budget Planning */}
                    <div className="glass p-6">
                        <h3 className="text-lg font-semibold mb-4">Budget Planning</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <p>Monthly Income</p>
                                <p className="font-medium">$5,000</p>
                            </div>
                            <div className="flex justify-between items-center">
                                <p>Monthly Expenses</p>
                                <p className="font-medium">$3,500</p>
                            </div>
                            <div className="flex justify-between items-center">
                                <p>Monthly Savings</p>
                                <p className="font-medium text-green-600">$1,500</p>
                            </div>
                        </div>
                    </div>

                    {/* Debt Repayment */}
                    <div className="glass p-6">
                        <h3 className="text-lg font-semibold mb-4">Debt Repayment Plan</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-medium">Car Loan</p>
                                    <p className="text-sm text-muted-foreground">$15,000 remaining</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium">$500/mo</p>
                                    <p className="text-sm text-muted-foreground">30 months left</p>
                                </div>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                                <div className="bg-primary h-2 rounded-full" style={{ width: "60%" }}></div>
                            </div>
                        </div>
                    </div>

                    {/* Investment Goals */}
                    <div className="glass p-6">
                        <h3 className="text-lg font-semibold mb-4">Investment Goals</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-medium">Retirement</p>
                                    <p className="text-sm text-muted-foreground">Target: $1,000,000</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium">$25,000</p>
                                    <p className="text-sm text-muted-foreground">2.5% complete</p>
                                </div>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                                <div className="bg-primary h-2 rounded-full" style={{ width: "2.5%" }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Comparison Column */}
                <div className="space-y-6">
                    <h3 className="text-xl font-semibold">Comparison</h3>
                    
                    {/* Spending Comparison */}
                    <div className="glass p-6">
                        <h3 className="text-lg font-semibold mb-4">Spending Comparison</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <p>Food</p>
                                <div className="flex items-center gap-4">
                                    <p className="text-green-600">-$50</p>
                                    <p className="text-sm text-muted-foreground">vs last {selectedPeriod}</p>
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <p>Transportation</p>
                                <div className="flex items-center gap-4">
                                    <p className="text-red-600">+$30</p>
                                    <p className="text-sm text-muted-foreground">vs last {selectedPeriod}</p>
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <p>Entertainment</p>
                                <div className="flex items-center gap-4">
                                    <p className="text-green-600">-$20</p>
                                    <p className="text-sm text-muted-foreground">vs last {selectedPeriod}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Income Comparison */}
                    <div className="glass p-6">
                        <h3 className="text-lg font-semibold mb-4">Income Comparison</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <p>Salary</p>
                                <div className="flex items-center gap-4">
                                    <p className="text-green-600">+$500</p>
                                    <p className="text-sm text-muted-foreground">vs last {selectedPeriod}</p>
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <p>Investments</p>
                                <div className="flex items-center gap-4">
                                    <p className="text-green-600">+$100</p>
                                    <p className="text-sm text-muted-foreground">vs last {selectedPeriod}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Savings Rate */}
                    <div className="glass p-6">
                        <h3 className="text-lg font-semibold mb-4">Savings Rate</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <p>Current Rate</p>
                                <p className="font-medium">30%</p>
                            </div>
                            <div className="flex justify-between items-center">
                                <p>Previous Rate</p>
                                <p className="font-medium">25%</p>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                                <div className="bg-primary h-2 rounded-full" style={{ width: "30%" }}></div>
                            </div>
                        </div>
                    </div>

                    {/* Net Worth Growth */}
                    <div className="glass p-6">
                        <h3 className="text-lg font-semibold mb-4">Net Worth Growth</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <p>Current Net Worth</p>
                                <p className="font-medium">$50,000</p>
                            </div>
                            <div className="flex justify-between items-center">
                                <p>Growth</p>
                                <p className="text-green-600">+$5,000</p>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                                <div className="bg-primary h-2 rounded-full" style={{ width: "10%" }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Insights;
