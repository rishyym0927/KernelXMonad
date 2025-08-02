"use client"
import { createContext, useContext } from "react"

// Create a wallet context
export const WalletContext = createContext<{
  address: string | null
  isConnected: boolean
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
}>({
  address: null,
  isConnected: false,
  connectWallet: async () => {},
  disconnectWallet: () => {},
})

export const useWallet = () => useContext(WalletContext)