import { useWallet } from "./WalletContext"

interface ConnectWalletButtonProps {
  variant?: "default" | "small"
  className?: string
}

export function ConnectWalletButton({ variant = "default", className = "" }: ConnectWalletButtonProps) {
  const { isConnected, address, connectWallet, disconnectWallet } = useWallet()

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  if (!isConnected) {
    return (
      <button
        onClick={connectWallet}
        className={`group relative ${
          variant === "default" ? "px-6 py-2.5" : "px-4 py-2"
        } bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white text-sm font-medium rounded-xl transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-purple-500/25 hover:scale-105 ${className}`}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
        <svg className="relative w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <span className="relative">Connect Wallet</span>
      </button>
    )
  }

  return (
    <div className="flex items-center space-x-3">
      <div className="flex items-center space-x-3 px-4 py-2.5 bg-gray-900/80 border border-gray-700/50 rounded-xl backdrop-blur-sm">
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        <span className="text-white text-sm font-mono">{formatAddress(address!)}</span>
      </div>

      <button
        onClick={disconnectWallet}
        className="p-2.5 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-xl transition-all duration-200 hover:scale-105"
        title="Disconnect Wallet"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          />
        </svg>
      </button>
    </div>
  )
}