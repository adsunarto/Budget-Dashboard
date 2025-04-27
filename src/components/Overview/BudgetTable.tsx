import { cn } from "@/lib/utils"; // optional, if you want cleaner className handling (tailwind merge helper)

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
type props = {
  transactions: Transaction[];
  budgets: Budget[]; // optional for comparing with fixed budget goals
  setBudgets: any,
  updateCard: any,
  updateScore: any
};

const BudgetTable = ({ transactions, budgets, setBudgets, updateCard, updateScore }: props) => {
  // Aggregate spending by tag
  const spendingByCategory: Record<string, number> = {};

  transactions.forEach((tx) => {
    if (!spendingByCategory[tx.tag]) {
      spendingByCategory[tx.tag] = 0;
    }
    spendingByCategory[tx.tag] += tx.amount;
  });

  // Merge spending with budget values
  const categories = Object.entries(spendingByCategory)
    .filter(([category]) => category !== 'Income') // 👈 filter OUT "Paycheck" first
    .map(([category, spent], index) => {
      const budgetMatch = budgets.find((b) => b.category === category);
      return {
        id: index + 1,
        category,
        spent,
        budgeted: budgetMatch ? budgetMatch.budgeted : 0,
      };
    });


  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-background shadow-sm">
      <table className="min-w-full text-sm text-left">
        <thead className="bg-muted">
          <tr>
            <th className="p-4 font-semibold text-foreground text-xs uppercase tracking-wider">Category</th>
            <th className="p-4 font-semibold text-foreground text-xs uppercase tracking-wider">Budget</th>
            <th className="p-4 font-semibold text-foreground text-xs uppercase tracking-wider">Amount Spent</th>
            <th className="p-4 font-semibold text-foreground text-xs uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {categories.map((tx) => {
            const spent = Math.abs(tx.spent);
            const budgeted = tx.budgeted;
            const percentage = budgeted === 0 ? 0 : (spent / budgeted) * 100;
            
            let status = "";
            let statusColor = "";
            
            if (["Rent/Utilities", "Debt Payment"].includes(tx.category)) {
              status = percentage >= 100 ? "Funded" : "Unfunded";
              statusColor = percentage >= 100 ? "text-green-500" : "text-red-500";
            } else if (percentage > 100) {
              status = "Over Budget";
              statusColor = "text-red-500";
            } else if (percentage >= 90 && percentage <= 100) {
              status = "Nearing Budget";
              statusColor = "text-yellow-500";
            }
            
            return (
              <tr
                key={tx.category}
                className="hover:bg-muted/40 transition"
              >
                <td className="p-4 text-foreground font-medium">{tx.category}</td>
                <td className="p-4 text-foreground">
                  $
                  <input
                    type="number"
                    onChange={(e) => {
                      const value = e.target.value;
                      setBudgets((prev: Budget[]) =>
                        prev.map((b: Budget) =>
                          b.category === tx.category
                            ? { ...b, budgeted: value === "" ? 0 : parseFloat(value) }
                            : b
                        )
                      );
                      updateCard();
                      updateScore();
                    }}
                    value={budgets.find((b) => b.category === tx.category)?.budgeted || ""}
                    placeholder="0"
                    className="w-24 bg-transparent border-b border-border focus:outline-none focus:border-primary transition [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    step="0.01"
                    min="0"
                  />
                </td>
                <td className="p-4 font-semibold">
                  ${tx.spent.toFixed(2)}
                </td>
                <td className={`p-4 font-medium ${statusColor}`}>
                  {status}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default BudgetTable;