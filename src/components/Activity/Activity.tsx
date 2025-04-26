// src/components/Dashboard/Sidebar.tsx
import TransactionTable from "./TransactionTable";

type Transaction = {
    id: number;
    date: string;
    tag: string;
    name: string;
    amount: number;
};
type props = {
    transactions: Transaction[];
};

const Activity = ({ transactions }: props) => {
    return (
        <>
            <div>
                <h2>Statement History</h2>
                <TransactionTable transactions={transactions} />
            </div>
        </>
    );
};

export default Activity;
