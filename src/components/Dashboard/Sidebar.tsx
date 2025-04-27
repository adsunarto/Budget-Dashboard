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
import { LayoutDashboard, Activity, Calendar, BarChart3 } from "lucide-react";
const tabs = [
    { label: "Overview", icon: LayoutDashboard },
    { label: "Activity", icon: Activity },
    { label: "Plan", icon: Calendar },
    { label: "Compare", icon: BarChart3 },
];

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
                    const isOpen = showSections[key];

                    return (
                        <div key={key}>
                            <button
                                onClick={() => setShowSections((prev) => ({ ...prev, [key]: !isOpen }))}
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
                                                    {item.type === "Loan" ? "-" : ""}
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
                                <label className="block text-sm font-medium text-foreground">Type</label>
                                <Select value={accountType} onValueChange={setAccountType}>
                                    <SelectTrigger className="w-full mt-1">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Account">Account</SelectItem>
                                        <SelectItem value="Loan">Loan</SelectItem>
                                        <SelectItem value="Investment">Investment</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground">Name</label>
                                <input
                                    type="text"
                                    value={entryName}
                                    onChange={(e) => setEntryName(e.target.value)}
                                    placeholder="e.g. Checking, Car Loan"
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
                                    className="w-full mt-1 bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary"
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
