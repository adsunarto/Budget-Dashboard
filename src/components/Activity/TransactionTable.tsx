import { useState, useEffect } from "react";
import { Transaction } from "@/lib/types";

type Props = {
  transactions: Transaction[];
};

const TransactionTable = ({ transactions }: Props) => {
  const [localTransactions, setLocalTransactions] = useState<Transaction[]>(transactions);

  useEffect(() => {
    setLocalTransactions(transactions);
  }, [transactions]); // Re-run effect when transactions prop changes

  const handleTagChange = (id: number, newTag: string) => {
    const updated = localTransactions.map((tx) =>
      tx.id === id ? { ...tx, tag: newTag } : tx
    );
    setLocalTransactions(updated);
  };

  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-background shadow-sm">
      <table className="min-w-full text-sm text-left">
        <thead className="bg-muted">
          <tr>
            <th className="p-4 font-semibold text-foreground text-xs uppercase tracking-wider">Date</th>
            <th className="p-4 font-semibold text-foreground text-xs uppercase tracking-wider">Name</th>
            <th className="p-4 font-semibold text-foreground text-xs uppercase tracking-wider">Tag(s)</th>
            <th className="p-4 font-semibold text-foreground text-xs uppercase tracking-wider">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {localTransactions.map((tx) => (
            <tr key={tx.id} className="hover:bg-muted/40 transition">
              <td className="p-4 text-foreground font-medium">{tx.date}</td>
              <td className="p-4 text-foreground font-medium">{tx.name}</td>
              <td className="p-4 text-foreground">
                <input
                  type="text"
                  value={tx.tag}
                  onChange={(e) => handleTagChange(tx.id, e.target.value)}
                  className="w-full bg-transparent border-b border-border focus:outline-none focus:border-primary transition"
                />
              </td>
              <td className={`p-4 font-semibold ${tx.tag !== "Income" ? "text-red-400" : "text-green-400"}`}>
                {tx.tag !== "Income" ? "-" : "+"}${Math.abs(tx.amount).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionTable;
