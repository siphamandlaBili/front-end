import React from 'react';

export default function TransactionHistory({ transactions }) {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Transaction History</h2>
      {transactions.length === 0 ? (
        <p className="text-gray-500 text-sm">No transactions yet</p>
      ) : (
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="border rounded-lg p-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {transaction.service.name}
                  </h3>
                  <div className="mt-1 flex items-center text-sm">
                    <span className={`capitalize ${
                      transaction.type === 'charge' ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {transaction.type === 'charge' ? '-' : '+'} R{transaction.amount}
                    </span>
                    <span className="mx-2 text-gray-500">&middot;</span>
                    <span className="text-gray-500">
                      {new Date(transaction.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  transaction.status === 'success'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {transaction.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
