"use client"
import type React from "react"
import { useState, useCallback } from "react"
import { IconBrandTabler, IconUserBolt, IconSettings } from "@tabler/icons-react"
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar"
import LogoIcon from "@/components/logo"
import Image from "next/image"
import { WalletContext } from "@/components/WalletContext"

interface IDELayoutProps {
  children: React.ReactNode
}

export default function IDELayout({ children }: IDELayoutProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const sidebarLinks = [
    {
      label: "Editor",
      href: "/ide/editor",
      icon: <IconBrandTabler className="h-5 w-5 shrink-0 text-neutral-200" />,
    },
    {
      label: "Audit",
      href: "/ide/audit",
      icon: <IconUserBolt className="h-5 w-5 shrink-0 text-neutral-200" />,
    },
    {
      label: "Plugins",
      href: "/ide/plugins",
      icon: <IconSettings className="h-5 w-5 shrink-0 text-neutral-200" />,
    },
  ]

  const connectWallet = useCallback(async () => {
    try {
      // Check if MetaMask is installed
      if (typeof window.ethereum !== "undefined") {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        })
        const userAddress = accounts[0]
        setAddress(userAddress)
        setIsConnected(true)
        setIsModalOpen(false)
      } else {
        alert("Please install MetaMask to connect wallet")
      }
    } catch (error) {
      console.error("Error connecting wallet:", error)
    }
  }, [])

  const disconnectWallet = useCallback(() => {
    setAddress(null)
    setIsConnected(false)
  }, [])

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <WalletContext.Provider value={{ address, isConnected, connectWallet, disconnectWallet }}>
      <div className="h-screen flex flex-col">
        <div className="flex flex-1 overflow-hidden">
          <Sidebar open={isSidebarOpen} setOpen={setIsSidebarOpen}>
            <SidebarBody className="justify-between gap-10">
              <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
                {isSidebarOpen ? 'Kernel' : <LogoIcon />}
                <div className="mt-8 flex flex-col gap-2">
                  {sidebarLinks.map((link, idx) => (
                    <SidebarLink key={idx} link={link} />
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-4">
                {!address ? (
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-neutral-200 bg-purple-600 hover:bg-purple-700 transition-colors"
                  >
                    <IconUserBolt className="h-5 w-5 shrink-0" />
                    <span>{isSidebarOpen ? 'Connect Wallet' : ''}</span>
                  </button>
                ) : (
                  <SidebarLink
                    link={{
                      label: formatAddress(address),
                      href: "#",
                      icon: (
                        <div className="h-7 w-7 rounded-full bg-purple-500 flex items-center justify-center text-white">
                          {address.substring(2, 4)}
                        </div>
                      ),
                    }}
                  />
                )}
              </div>
            </SidebarBody>
          </Sidebar>

          {/* Main Content - Changed overflow-hidden to overflow-auto */}
          <div className="flex-1 overflow-auto bg-black">
            {children}
          </div>
        </div>

        {/* Enhanced Wallet Connect Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="relative bg-gray-900/95 border border-gray-700/50 rounded-2xl p-8 w-full max-w-md backdrop-blur-xl">
              {/* Modal gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 to-transparent rounded-2xl"></div>

              <div className="relative">
                {/* Modal header */}
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-white">Connect Wallet</h3>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-xl transition-all duration-200"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Connect button */}
                <button
                  onClick={connectWallet}
                  className="group relative w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 rounded-xl text-white font-semibold transition-all duration-200 flex items-center justify-center space-x-3 shadow-xl hover:shadow-purple-500/25 hover:scale-105"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
                  <Image src="/metamask-fox.svg" alt="MetaMask" className="relative" width={6} height={6} />
                  <span className="relative">Connect with MetaMask</span>
                </button>

                {/* Additional info */}
                <p className="text-gray-400 text-sm text-center mt-4">Connect your wallet to access all IDE features</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </WalletContext.Provider>
  )
}