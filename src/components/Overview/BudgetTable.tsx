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
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full text-sm text-left">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-3 font-medium text-gray-700">Category</th>
            <th className="p-3 font-medium text-gray-700">Budget</th>
            <th className="p-3 font-medium text-gray-700">Amount Spent</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((tx) => (
            <tr key={tx.category} className="border-t hover:bg-gray-50">
              <td className="p-3 text-gray-800">{tx.category}</td>
              <td className="p-3 text-gray-800">$
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
                  className="w-24 bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-400"
                />
              </td>
              {tx.spent < 0 ? (
                <td className="p-3 text-red-400">
                  -$
                  {Math.abs(tx.spent).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>
              ) : (
                <td className="p-3 text-green-600">
                  +$
                  {Math.abs(tx.spent).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BudgetTable;