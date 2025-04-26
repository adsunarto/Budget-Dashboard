// src/components/Dashboard/Sidebar.tsx
import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, MoreVertical } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { getFromLocalStorage, setToLocalStorage } from "@/lib/storage";
const defaultAccounts: object = [];
const defaultLoans: object = [];
const defaultInvestments: object = [];
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

type SidebarProps = {
    activeTab: string;
    setActiveTab: (tab: string) => void;
};

const Sidebar = ({
    activeTab,
    setActiveTab,
}: SidebarProps) => {
    const [showSections, setShowSections] = useState({
        Accounts: true,
        Loans: true,
        Investments: true,
    });

    const [accounts, setAccounts] = useState(() =>
        getFromLocalStorage("accounts", defaultAccounts)
    );
    const [loans, setLoans] = useState(() =>
        getFromLocalStorage("loans", defaultLoans)
    );
    const [investments, setInvestments] = useState(() =>
        getFromLocalStorage("investments", defaultInvestments)
    );

    // Update LocalStorage whenever state changes
    useEffect(() => {
        setToLocalStorage("accounts", accounts);
    }, [accounts]);

    useEffect(() => {
        setToLocalStorage("loans", loans);
    }, [loans]);

    useEffect(() => {
        setToLocalStorage("investments", investments);
    }, [investments]);

    // Form fields
    const [accountType, setAccountType] = useState("");
    const [entryName, setEntryName] = useState("");
    const [accountBalance, setAccountBalance] = useState();
    const [dialogOpen, setDialogOpen] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Create a new account object
        const newAccount = {
            type: accountType,
            name: entryName,
            balance: parseFloat(accountBalance.toString()), // Ensure balance is a number
        };

        // Add new account to the state
        switch (accountType) {
            case "Account":
                const updatedAccounts = [...accounts, newAccount];
                setAccounts(updatedAccounts);
                setToLocalStorage("accounts", updatedAccounts);
                break;
            case "Loan":
                const updatedLoans = [...loans, newAccount];
                setLoans(updatedLoans);
                setToLocalStorage("loans", updatedLoans);
                break;
            case "Investment":
                const updatedInvestments = [...investments, newAccount];
                setInvestments(updatedInvestments);
                setToLocalStorage("investments", updatedInvestments);
                break;
            default:
                return;
        }

        // Close the dialog
        setDialogOpen(false);

        // Clear form
        setAccountType("");
        setEntryName("");
        setAccountBalance(0);
    };

    const handleDelete = (type: string, name: string) => {
        switch (type) {
            case "Accounts":
                const filteredAccounts = accounts.filter((a) => a.name !== name);
                setAccounts(filteredAccounts);
                setToLocalStorage("accounts", filteredAccounts);
                break;
            case "Loans":
                const filteredLoans = loans.filter((l) => l.name !== name);
                setLoans(filteredLoans);
                setToLocalStorage("loans", filteredLoans);
                break;
            case "Investments":
                const filteredInvestments = investments.filter((i) => i.name !== name);
                setInvestments(filteredInvestments);
                setToLocalStorage("investments", filteredInvestments);
                break;
        }
    };


    const financialSections = [
        { key: "Accounts", data: accounts },
        { key: "Loans", data: loans },
        { key: "Investments", data: investments },
    ];

    return (
        <div className="w-64 bg-[#3F466E] border-r p-4 space-y-6 h-screen overflow-y-auto overflow-x-hidden">
            <div className="w-64 bg-[#3F466E] border-r p-4 space-y-6 sidebar">
                <h1 style={{ fontFamily: 'lobster' }} className="text-white">Budgeteer</h1>
                <div className="h-px bg-[#475598] w-full -mx-4" />
                {/* Sidebar Tabs */}
                <div className="space-y-2 pt-4">
                    {["Overview", "Activity", "Plan", "Compare"].map((tab) => {
                        const isActive = activeTab === tab;

                        return (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`w-full text-left px-4 py-2 rounded-md transition-colors duration-200 ${isActive ? "bg-[#475598] font-semibold text-white" : "hover:bg-[#475598]/50 text-white/90"} -mx-4`}
                                aria-current={isActive ? "page" : undefined}
                            >
                                {tab}
                            </button>
                        );
                    })}
                </div>

                {/* Expandable Account Section */}
                {financialSections.map(({ key, data }) => {
                    const isOpen = showSections[key];

                    return (
                        <div key={key} className="pt-2">
                            <button
                                onClick={() => setShowSections((prev) => ({ ...prev, [key]: !isOpen }))}
                                className="w-full flex items-center justify-between text-left text-sm font-medium text-white/90 hover:text-white transition"
                                aria-expanded={isOpen}
                            >
                                <div className="flex items-center gap-2">
                                    {isOpen ? (
                                        <ChevronUp className="w-4 h-4" />
                                    ) : (
                                        <ChevronDown className="w-4 h-4" />
                                    )}
                                    <span>{key}</span>
                                </div>
                            </button>

                            {isOpen && (
                                <ul className="mt-2 space-y-1 pl-2 text-sm text-white">
                                    {data.map((item) => (
                                        <li key={item.name} className="flex items-center justify-between pr-1 mb-4">
                                            <div className="flex flex-col">
                                                <span className="font-medium">{item.name}</span>
                                                <span className="text-xs text-gray-200">
                                                    {item.type === "Loan" ? "-" : ""}
                                                    ${Math.abs(item.balance).toLocaleString(undefined, {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2,
                                                    })}
                                                </span>
                                            </div>

                                            {/* Dropdown menu */}
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <button className="text-white hover:text-gray-300 p-1">
                                                        <MoreVertical className="w-4 h-4" />
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="bg-white text-sm text-gray-800 rounded shadow-md">
                                                    <DropdownMenuItem
                                                        onClick={() => handleDelete(key, item.name)}
                                                        className="cursor-pointer hover:bg-gray-100"
                                                    >
                                                        Remove
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    );
                })}

                {/* Add Account */}
                <div className="flex justify-center">
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="bg-[#475598] text-white">Add Account</Button>
                        </DialogTrigger>

                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>Add New Account</DialogTitle>
                            </DialogHeader>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-white">Type</label>
                                    <Select value={accountType} onValueChange={setAccountType}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent className="w-full mt-1 border border-white rounded-md px-3 py-2 text-sm">
                                            <SelectItem value="Account">Account</SelectItem>
                                            <SelectItem value="Loan">Loan</SelectItem>
                                            <SelectItem value="Investment">Investment</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-white">Name</label>
                                    <input
                                        type="text"
                                        value={entryName}
                                        onChange={(e) => setEntryName(e.target.value)}
                                        placeholder="e.g. Checking, Car Loan"
                                        className="w-full mt-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-white">Balance</label>
                                    <input
                                        type="number"
                                        value={accountBalance}
                                        onChange={(e) => setAccountBalance(parseFloat(e.target.value))}
                                        placeholder="e.g. 15000"
                                        className="w-full mt-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
                                    />
                                </div>

                                <DialogFooter>
                                    <Button type="submit" className="bg-[#3F466E]">Save</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
