import { useEffect, useMemo, useState } from "react";
import { Transaction } from "~~/services/transactionQueue/queue";

export const TransactionList = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const fetchTransactions = async () => {
    try {
      const response = await fetch("/api/transactions");
      const data = await response.json();

      // Filter only breakBrick transactions
      const breakBrickTxs = data.transactions.filter((tx: Transaction) => tx.action === "breakBrick");

      // Process transactions based on txHash
      const processedTxs = breakBrickTxs.reduce((acc: Transaction[], tx: Transaction) => {
        // If transaction has a txHash, it's either completed or failed
        if (tx.txHash) {
          // Remove any pending transaction with the same ID
          const withoutPending = acc.filter(t => t.id !== tx.id);
          return [...withoutPending, tx];
        }

        // For pending transactions, only add if there isn't already a transaction with same ID
        if (!acc.some(t => t.id === tx.id)) {
          return [...acc, tx];
        }

        return acc;
      }, []);

      // Sort by ID in descending order (newest first)
      const sortedTxs = processedTxs.sort((a: Transaction, b: Transaction) => b.id - a.id);
      setTransactions(sortedTxs);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    }
  };

  useEffect(() => {
    fetchTransactions();
    // Refresh every 2 seconds to ensure more responsive status updates
    const interval = setInterval(fetchTransactions, 2000);
    return () => clearInterval(interval);
  }, []);

  // Calculate transaction statistics using useMemo to optimize performance
  const stats = useMemo(
    () => ({
      pending: transactions.filter(tx => !tx.txHash).length,
      completed: transactions.filter(tx => tx.txHash && tx.status === "completed").length,
      failed: transactions.filter(tx => tx.txHash && tx.status === "failed").length,
      total: transactions.length,
    }),
    [transactions],
  );

  if (transactions.length === 0) {
    return <div className="text-center p-4">No brick break transactions yet</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Transaction Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-base-100 p-4 rounded-lg shadow">
          <div className="text-sm text-base-content/60">Total Breaks</div>
          <div className="text-2xl font-bold">{stats.total}</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg shadow">
          <div className="text-sm text-yellow-800/60">Pending</div>
          <div className="text-2xl font-bold text-yellow-800">{stats.pending}</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg shadow">
          <div className="text-sm text-green-800/60">Completed</div>
          <div className="text-2xl font-bold text-green-800">{stats.completed}</div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg shadow">
          <div className="text-sm text-red-800/60">Failed</div>
          <div className="text-2xl font-bold text-red-800">{stats.failed}</div>
        </div>
      </div>

      {/* Transaction List */}
      <div className="overflow-y-auto max-h-[300px] bg-base-100 rounded-lg shadow">
        <table className="table w-full">
          <thead className="sticky top-0 bg-base-100 z-10">
            <tr>
              <th className="w-16">ID</th>
              <th>Status</th>
              <th>Hash</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(tx => (
              <tr key={tx.id} className={tx.status === "failed" ? "bg-red-50" : ""}>
                <td className="text-sm">{tx.id}</td>
                <td>
                  <span
                    className={`px-2 py-1 text-sm rounded-full ${
                      !tx.txHash
                        ? "bg-yellow-100 text-yellow-800"
                        : tx.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {!tx.txHash ? "pending" : tx.status}
                  </span>
                </td>
                <td className="font-mono text-sm">
                  {tx.txHash ? (
                    <a
                      href={`https://testnet.monadexplorer.com/tx/${tx.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-700"
                    >
                      {tx.txHash.slice(0, 6)}...{tx.txHash.slice(-4)}
                    </a>
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
