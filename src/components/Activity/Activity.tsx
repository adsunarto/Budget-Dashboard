import { useState, useMemo } from "react";
import TransactionTable from "./TransactionTable";
import { getFromLocalStorage, setToLocalStorage } from "@/lib/storage";

type Budget = {
    category: string;
    budgeted: number;
    amountSpent: number;
};

type Transaction = {
    id: number;
    date: string;
    tag: string;
    name: string;
    amount: number;
};

type Props = {
    transactions: Transaction[];
};

const Activity = ({ transactions: initialTransactions }: Props) => {
    const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

    // Parse transaction data into month and year fields for filtering
    const parsedTransactions = useMemo(() => {
        return initialTransactions.map((tx) => {
            const dateObj = new Date(tx.date);
            return {
                ...tx,
                month: dateObj.getMonth(),
                year: dateObj.getFullYear(),
            };
        });
    }, [initialTransactions]);

    // Filter transactions based on the selected month and year
    const filteredTransactions = useMemo(() => {
        return parsedTransactions.filter(
            (tx) => tx.month === selectedMonth && tx.year === selectedYear
        );
    }, [selectedMonth, selectedYear, parsedTransactions]);

    // Check if there are transactions in previous month
    const hasPrevTransactions = useMemo(() => {
        const prevMonth = selectedMonth === 0 ? 11 : selectedMonth - 1;
        const prevYear = selectedMonth === 0 ? selectedYear - 1 : selectedYear;
        return parsedTransactions.some(
            tx => tx.month === prevMonth && tx.year === prevYear
        );
    }, [selectedMonth, selectedYear, parsedTransactions]);

    // Check if there are transactions in next month
    const hasNextTransactions = useMemo(() => {
        const nextMonth = selectedMonth === 11 ? 0 : selectedMonth + 1;
        const nextYear = selectedMonth === 11 ? selectedYear + 1 : selectedYear;
        return parsedTransactions.some(
            tx => tx.month === nextMonth && tx.year === nextYear
        );
    }, [selectedMonth, selectedYear, parsedTransactions]);

    // Update to previous month
    const handlePrevMonth = () => {
        if (!hasPrevTransactions) return;
        const prevMonth = selectedMonth === 0 ? 11 : selectedMonth - 1;
        const prevYear = selectedMonth === 0 ? selectedYear - 1 : selectedYear;
        setSelectedMonth(prevMonth);
        setSelectedYear(prevYear);
    };

    // Update to next month
    const handleNextMonth = () => {
        if (!hasNextTransactions) return;
        const nextMonth = selectedMonth === 11 ? 0 : selectedMonth + 1;
        const nextYear = selectedMonth === 11 ? selectedYear + 1 : selectedYear;
        setSelectedMonth(nextMonth);
        setSelectedYear(nextYear);
    };

    return (
        <div className="relative">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-center text-2xl font-semibold">Statement History</h2>
            </div>

            <div className="flex items-center justify-between mb-4">
                {/* Buttons on the left */}
                <div className="flex space-x-2">
                    <button
                        onClick={handlePrevMonth}
                        disabled={!hasPrevTransactions}
                        className={`w-full flex items-center gap-3 justify-center text-center px-4 py-2 rounded-lg text-sm font-medium transition ${
                            hasPrevTransactions 
                                ? "hover:bg-muted text-muted-foreground" 
                                : "opacity-50 cursor-not-allowed text-muted-foreground/50"
                        }`}
                    >
                        <i className="fa-solid fa-chevron-left"></i>
                    </button>
                    <button
                        onClick={handleNextMonth}
                        disabled={!hasNextTransactions}
                        className={`w-full flex items-center gap-3 justify-center text-center px-4 py-2 rounded-lg text-sm font-medium transition ${
                            hasNextTransactions 
                                ? "hover:bg-muted text-muted-foreground" 
                                : "opacity-50 cursor-not-allowed text-muted-foreground/50"
                        }`}
                    >
                        <i className="fa-solid fa-chevron-right"></i>
                    </button>
                </div>

                {/* Centered month/year */}
                <div className="flex-1 text-center">
                    <span className="text-xl font-semibold">
                        {getMonthName(selectedMonth)} {selectedYear}
                    </span>
                </div>

                {/* Empty div to balance layout */}
                <div className="w-16" />
            </div>

            {/* Transaction Table */}
            <TransactionTable
                key={`${selectedMonth}-${selectedYear}`}
                transactions={filteredTransactions}
            />
        </div>
    );
};

const getMonthName = (month: number) => {
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    return months[month];
};

export default Activity;
