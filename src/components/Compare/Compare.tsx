// src/components/Compare/Compare.tsx
import { useState } from "react";

const Compare = () => {
    const [selectedPeriod, setSelectedPeriod] = useState("month");

    return (
        <div className="flex flex-col gap-8">
            {/* Header Section */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Financial Comparison</h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => setSelectedPeriod("month")}
                        className={`px-4 py-2 rounded-lg ${
                            selectedPeriod === "month"
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                        }`}
                    >
                        This Month
                    </button>
                    <button
                        onClick={() => setSelectedPeriod("year")}
                        className={`px-4 py-2 rounded-lg ${
                            selectedPeriod === "year"
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                        }`}
                    >
                        This Year
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
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
                </div>

                {/* Right Column */}
                <div className="space-y-6">
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

export default Compare;
