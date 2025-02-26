import { FC } from "react";

interface Transaction {
  id: number;
  playerAddress: string;
  action: string;
  status: string;
  txHash?: string;
}

interface TransactionTableProps {
  transactions: Transaction[];
}

const TransactionTable: FC<TransactionTableProps> = ({ transactions }) => {
  console.log("TransactionTable transactions", transactions); // Add this log to check transactions
  return (
    <div className="transaction-table">
      <h2>Transaction History</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Player Address</th>
            <th>Action</th>
            <th>Status</th>
            <th>Transaction Hash</th>
          </tr>
        </thead>
        <tbody>
          {transactions?.map(tx => (
            <tr key={tx.id}>
              <td>{tx.id}</td>
              <td>{tx.playerAddress}</td>
              <td>{tx.action}</td>
              <td>{tx.status}</td>
              <td>{tx.txHash || "N/A"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionTable;
