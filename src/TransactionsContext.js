import { createContext, useEffect, useState } from "react";
import { api } from "./services/api";

export const TransactionsContext = createContext({});

export function TransactionsProvider({ children }) {
  const [transactions, setTransactions] = useState([]);
  useEffect(() => {
    api
      .get("transactions")
      .then((response) => setTransactions(response.data.transactions));
  }, []);

  async function createTransaction(transactionInput) {
    const response = await api.post("/transactions", transactionInput);
    const { transaction } = response.data;

    setTransactions([...transactions, transaction]);
  }

  return (
    <TransactionsContext.Provider value={{ transactions, createTransaction }}>
      {children}
    </TransactionsContext.Provider>
  );
}
