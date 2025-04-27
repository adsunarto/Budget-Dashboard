import React, { useState, useEffect } from "react";

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
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full text-sm text-left">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-3 font-medium text-gray-700">Date</th>
            <th className="p-3 font-medium text-gray-700">Name</th>
            <th className="p-3 font-medium text-gray-700">Tag(s)</th>
            <th className="p-3 font-medium text-gray-700">Amount</th>
          </tr>
        </thead>
        <tbody>
          {localTransactions.map((tx) => (
            <tr key={tx.id} className="border-t hover:bg-gray-50">
              <td className="p-3 text-gray-800">{tx.date}</td>
              <td className="p-3 text-gray-800">{tx.name}</td>
              <td className="p-3 text-gray-800">
                <input
                  type="text"
                  value={tx.tag}
                  onChange={(e) => handleTagChange(tx.id, e.target.value)}
                  className="w-full bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-400"
                />
              </td>
              <td
                className={`p-3 ${tx.tag === "Income" ? "text-green-600" : "text-red-400"
                  }`}
              >
                {tx.tag === "Income" ? "+" : "-"}${Math.abs(tx.amount).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionTable;
