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
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {categories.map((tx) => (
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
                    setBudgets((prev) =>
                      prev.map((b) =>
                        b.category === tx.category
                          ? { ...b, budgeted: value === "" ? 0 : parseFloat(value) }
                          : b
                      )
                    );
                    updateCard();
                    updateScore();
                  }}
                  value={
                    budgets.find((b) => b.category === tx.category)?.budgeted.toString() || ""
                  }
                  placeholder="0"
                  className="w-24 bg-transparent border-b border-border focus:outline-none focus:border-primary transition"
                />
              </td>
              <td
                className={cn(
                  "p-4 font-semibold",
                  tx.spent < 0 ? "text-red-400" : "text-green-400"
                )}
              >
                {tx.spent < 0 ? "-" : "+"}$
                {Math.abs(tx.spent).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BudgetTable;