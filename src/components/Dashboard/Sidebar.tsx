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
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Activity, Calendar, BarChart3, Sparkles } from "lucide-react";
const tabs = [
    { label: "Overview", icon: LayoutDashboard },
    { label: "Activity", icon: Activity },
    { label: "Learn", icon: Sparkles },
    { label: "Insights", icon: BarChart3 },
];

type SidebarProps = {
    activeTab: string;
    setActiveTab: (tab: string) => void;
};

interface Account {
    type: string;
    name: string;
    balance: number;
}

type SectionKey = "Accounts" | "Loans" | "Investments";

interface FinancialSection {
    key: SectionKey;
    data: Account[];
}

const Sidebar = ({
    activeTab,
    setActiveTab,
}: SidebarProps) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [accountType, setAccountType] = useState("");
    const [entryName, setEntryName] = useState("");
    const [accountBalance, setAccountBalance] = useState<number | undefined>(undefined);
    const [accounts, setAccounts] = useState<Account[]>(getFromLocalStorage("accounts", []));
    const [loans, setLoans] = useState<Account[]>(getFromLocalStorage("loans", []));
    const [investments, setInvestments] = useState<Account[]>(getFromLocalStorage("investments", []));
    const [expandedSections, setExpandedSections] = useState<Record<SectionKey, boolean>>({
        Accounts: true,
        Loans: true,
        Investments: true,
    });

    const toggleSection = (section: SectionKey) => {
        setExpandedSections((prev) => ({
            ...prev,
            [section]: !prev[section],
        }));
    };

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Create a new account object
        const newAccount: Account = {
            type: accountType,
            name: entryName,
            balance: accountBalance || 0,
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

        // Recalculate net worth
        const storedAccounts: Account[] = getFromLocalStorage("accounts", []);
        const storedLoans: Account[] = getFromLocalStorage("loans", []);
        const storedInvestments: Account[] = getFromLocalStorage("investments", []);
        
        let netWorth = 0;
        storedAccounts.forEach(account => netWorth += Number(account.balance));
        storedInvestments.forEach(investment => netWorth += Number(investment.balance));
        storedLoans.forEach(loan => netWorth -= Number(loan.balance));
        
        setToLocalStorage("netWorth", parseFloat(netWorth.toFixed(2)));

        // Close the dialog
        setDialogOpen(false);

        // Clear form
        setAccountType("");
        setEntryName("");
        setAccountBalance(undefined);
    };

    const handleDelete = (type: string, name: string) => {
        switch (type) {
            case "Accounts":
                const filteredAccounts = accounts.filter((a: Account) => a.name !== name);
                setAccounts(filteredAccounts);
                setToLocalStorage("accounts", filteredAccounts);
                break;
            case "Loans":
                const filteredLoans = loans.filter((l: Account) => l.name !== name);
                setLoans(filteredLoans);
                setToLocalStorage("loans", filteredLoans);
                break;
            case "Investments":
                const filteredInvestments = investments.filter((i: Account) => i.name !== name);
                setInvestments(filteredInvestments);
                setToLocalStorage("investments", filteredInvestments);
                break;
        }

        // Recalculate net worth
        const storedAccounts: Account[] = getFromLocalStorage("accounts", []);
        const storedLoans: Account[] = getFromLocalStorage("loans", []);
        const storedInvestments: Account[] = getFromLocalStorage("investments", []);
        
        let netWorth = 0;
        storedAccounts.forEach(account => netWorth += Number(account.balance));
        storedInvestments.forEach(investment => netWorth += Number(investment.balance));
        storedLoans.forEach(loan => netWorth -= Number(loan.balance));
        
        setToLocalStorage("netWorth", parseFloat(netWorth.toFixed(2)));
    };

    const financialSections: FinancialSection[] = [
        { key: "Accounts", data: accounts },
        { key: "Loans", data: loans },
        { key: "Investments", data: investments },
    ];

    return (
        <div className="w-64 bg-background border-r border-border p-6 space-y-6 h-screen overflow-y-auto">
            <h5 className="text-2xl font-bold tracking-tight text-primary">Budgeteer</h5>

            <div className="h-px bg-border my-4" />

            {/* Sidebar Tabs */}
            <div className="space-y-1">
                {tabs.map(({ label, icon: Icon }) => {
                    const isActive = activeTab === label;

                    return (
                        <button
                            key={label}
                            onClick={() => setActiveTab(label)}
                            className={`w-full flex items-center gap-3 text-left px-4 py-2 rounded-lg text-sm font-medium transition ${isActive
                                    ? "bg-primary/20 text-primary"
                                    : "hover:bg-muted text-muted-foreground"
                                }`}
                            aria-current={isActive ? "page" : undefined}
                        >
                            <Icon className="h-5 w-5" />
                            {label}
                        </button>
                    );
                })}
            </div>

            {/* Financial Sections */}
            <div className="space-y-4">
                {financialSections.map(({ key, data }) => {
                    const isOpen = expandedSections[key];

                    return (
                        <div key={key}>
                            <button
                                onClick={() => toggleSection(key)}
                                className="w-full flex items-center justify-between text-left text-sm font-semibold text-muted-foreground hover:text-foreground transition"
                            >
                                <div className="flex items-center gap-2">
                                    {isOpen ? (
                                        <ChevronUp className="h-4 w-4" />
                                    ) : (
                                        <ChevronDown className="h-4 w-4" />
                                    )}
                                    {key}
                                </div>
                            </button>

                            {isOpen && (
                                <ul className="mt-2 space-y-2 pl-2">
                                    {data.map((item) => (
                                        <li
                                            key={item.name}
                                            className="flex items-center justify-between px-2 py-1 text-sm rounded-md hover:bg-muted/50 transition"
                                        >
                                            <div className="flex flex-col">
                                                <span className="text-foreground font-medium">{item.name}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    ${Math.abs(item.balance).toLocaleString(undefined, {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2,
                                                    })}
                                                </span>
                                            </div>

                                            {/* Dropdown */}
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <button className="text-muted-foreground hover:text-foreground p-1">
                                                        <MoreVertical className="w-4 h-4" />
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="bg-background border border-border">
                                                    <DropdownMenuItem
                                                        onClick={() => handleDelete(key, item.name)}
                                                        className="cursor-pointer hover:bg-muted"
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
            </div>

            {/* Add Account Button */}
            <div className="pt-6">
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="w-full" variant="secondary">
                            Add Account
                        </Button>
                    </DialogTrigger>

                    <DialogContent className="bg-background border border-border">
                        <DialogHeader>
                            <DialogTitle>Add New Account</DialogTitle>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">Type</label>
                                <div className="grid grid-cols-3 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setAccountType("Account")}
                                        className={`p-4 rounded-lg outline outline-2 transition ${
                                            accountType === "Account"
                                                ? "outline-primary bg-primary/10 text-white"
                                                : "outline-gray-300 text-white hover:outline-primary/50"
                                        }`}
                                    >
                                        <div className="text-center font-medium">Account</div>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setAccountType("Loan")}
                                        className={`p-4 rounded-lg outline outline-2 transition ${
                                            accountType === "Loan"
                                                ? "outline-primary bg-primary/10 text-white"
                                                : "outline-gray-300 text-white hover:outline-primary/50"
                                        }`}
                                    >
                                        <div className="text-center font-medium">Loan</div>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setAccountType("Investment")}
                                        className={`p-4 rounded-lg outline outline-2 transition ${
                                            accountType === "Investment"
                                                ? "outline-primary bg-primary/10 text-white"
                                                : "outline-gray-300 text-white hover:outline-primary/50"
                                        }`}
                                    >
                                        <div className="text-center font-medium">Investment</div>
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground">Name</label>
                                <input
                                    type="text"
                                    value={entryName}
                                    onChange={(e) => setEntryName(e.target.value)}
                                    placeholder="e.g. Checking, Car Loan, Roth IRA"
                                    className="w-full mt-1 bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground">Balance</label>
                                <input
                                    type="number"
                                    value={accountBalance}
                                    onChange={(e) => setAccountBalance(parseFloat(e.target.value))}
                                    placeholder="e.g. 15000"
                                    className="w-full mt-1 bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                            </div>

                            <DialogFooter>
                                <Button type="submit" className="w-full">
                                    Save
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
};

export default Sidebar;
