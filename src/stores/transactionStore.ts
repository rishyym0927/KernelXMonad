import { create } from 'zustand'

export interface Transaction {
  transaction: {
    type: string
    chainId: string
    nonce: string
    to: string
    gas: string
    gasPrice: string
    maxPriorityFeePerGas: null
    maxFeePerGas: null
    value: string
    input: string
    v: string
    r: string
    s: string
    hash: string
  }
  sender: string
  success: boolean
  timestamp: number
  BlockNumber: number
}

interface TransactionStore {
  transactions: Transaction[]
  isLoading: boolean
  setTransactions: (transactions: Transaction[]) => void
  addTransaction: (transaction: Transaction) => void
  setLoading: (loading: boolean) => void
}

export const useTransactionStore = create<TransactionStore>((set) => ({
  transactions: [],
  isLoading: false,

  setTransactions: (transactions) => 
    set({ transactions }),

  addTransaction: (transaction) =>
    set((state) => ({
      transactions: [transaction, ...state.transactions]
    })),

  setLoading: (loading) =>
    set({ isLoading: loading })
}))