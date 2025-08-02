"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Search, Plus, Bot, Activity,  Zap,  Layers, Wallet } from "lucide-react"
import { Input } from "@/components/ui/input"
import { TransactionList } from "@/components/TransactionList"
import { motion, AnimatePresence } from "framer-motion"
import { useAccount, useConnect } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { useRouter } from "next/navigation" // or "next/navigation" for App Router
import Threads from "@/components/ui/threads"
import { AIAssistantModal } from "@/components/modals/AIAssistantModal"

type ActionType = 'deploy' | 'templates' | 'ai-assistant';



export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const { address, isConnected } = useAccount()
  const { connect } = useConnect()
  const [mounted, setMounted] = useState(false)
   const [isNeuronAssistantOpen, setIsNeuronAssistantOpen] = useState(false)
  const router = useRouter() 

const handleActionClick = (actionType: ActionType) => {
    if (!mounted) return
    switch (actionType) {
      case 'deploy':
        router.push('/ide/editor')
        break
      case 'templates':
        router.push('/explore')
        break
      case 'ai-assistant':
        setIsNeuronAssistantOpen(true)
        break
      default:
        break
    }
  }
  

  useEffect(() => {
    setMounted(true)
  }, [])

const quickActions = [
  {
    type: 'deploy' as const, // Add this
    title: "Deploy New Contract",
    description: "Create and deploy a new smart contract",
    href: "/ide",
    icon: <Plus className="w-5 h-5 text-purple-400" />,
    gradient: "from-gray-800/20 to-gray-900/20",
    borderGradient: "from-purple-500/10 to-purple-600/10",
  },
  {
    type: 'templates' as const, // Add this
    title: "Browse Templates",
    description: "Explore pre-built contract templates",
    href: "/templates",
    icon: <Layers className="w-5 h-5 text-purple-400" />,
    gradient: "from-gray-800/20 to-gray-900/20",
    borderGradient: "from-purple-500/10 to-purple-600/10",
  },
  {
    type: 'ai-assistant' as const, // Add this
    title: "AI Assistant",
    description: "Get help with smart contract development",
    href: "/ai",
    icon: <Bot className="w-5 h-5 text-purple-400" />,
    gradient: "from-gray-800/20 to-gray-900/20",
    borderGradient: "from-purple-500/10 to-purple-600/10",
  },
]


  // Modify the wallet button render logic:
  const renderWalletButton = () => {
    if (!mounted) return (
      <Button className="bg-gray-800 hover:bg-gray-700 border border-purple-500/30 hover:border-purple-400/40 text-purple-100 hover:text-white shadow-sm hover:shadow-purple-500/10 transition-all">
        <Wallet className="w-4 h-4 mr-2 text-purple-300" />
        Connect Wallet
      </Button>
    )

    return (
      <Button 
        onClick={() => connect({ connector: injected() })}
        className="bg-gray-800 hover:bg-gray-700 border border-purple-500/30 hover:border-purple-400/40 text-purple-100 hover:text-white shadow-sm hover:shadow-purple-500/10 transition-all"
      >
        {isConnected ? (
          <div className="flex items-center">
            <Wallet className="w-4 h-4 mr-2 text-purple-300" />
            <span>{address?.slice(0, 6)}...{address?.slice(-4)}</span>
          </div>
        ) : (
          <>
            <Wallet className="w-4 h-4 mr-2 text-purple-300" />
            Connect Wallet
          </>
        )}
      </Button>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950  relative overflow-hidden ">
      {/* Animated background */}
      <div className="absolute inset-0 ">
        <div className="absolute inset-0 bg-gradient-to-br  from-gray-900/10 via-black to-purple-900/5" />
        <motion.div
          className="absolute inset-0 opacity-20"
        />
      </div>

      <div className="relative z-10 ">
        {/* Enhanced Header Section */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-b border-gray-800/50 backdrop-blur-xl bg-gray-900/50"
        >
          <div className="container mx-auto px-6  pt-30 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-purple-300 bg-clip-text text-transparent">
                  Dashboard
                </h1>
                <p className="text-gray-400 text-sm mt-1">Manage your smart contracts and deployments</p>
              </div>

              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="search"
                    placeholder="Search contracts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-80 bg-gray-900/50 backdrop-blur-sm border-gray-800/50 focus:border-purple-500/50 text-white placeholder-gray-400"
                  />
                </div>
                {/* Render wallet button here */}
                {renderWalletButton()}
              </div>
            </div>
          </div>
        </motion.header>


        {/* Main Content */}
        <main className="container mx-auto px-6 pb-8 mt-10">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
            {/* Left Content - Contracts & Transactions */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-3"
            >
                
                
                    <Activity className="w-4 h-4 mr-2 text-purple-400" />

<div className="flex justify-between items-center ">
                     <h1 className="text-lg font-semibold text-white ml-20 ">Transactions</h1>
                    <div className="h-40 w-200"> <Threads
    amplitude={1}
    distance={0}
    enableMouseInteraction={true}
  /> 
  </div>
</div>


                <AnimatePresence mode="wait">
                  <div className="mt-10"> {/* Added wrapper div with margin-top */}
                 

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <TransactionList />
                      </motion.div>
                  </div>
                </AnimatePresence>
            </motion.div>

            {/* Enhanced Right Sidebar - Quick Actions */}
           <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-6"
      >
        <div>
          <h2 className="text-xl font-semibold text-white mb-1">Quick Actions</h2>
          <p className="text-gray-400 text-sm">Streamline your workflow</p>
        </div>

        <div className="space-y-4">
          {quickActions.map((action, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.05 }}
            >
              <Card 
                className="group relative overflow-hidden p-6 transition-all duration-300 hover:-translate-y-1 bg-gray-900/30 backdrop-blur-xl border-gray-800/50 hover:border-purple-500/30 cursor-pointer"
                onClick={() => handleActionClick(action.type)}
              >
                {/* Glowing border effect */}
                <motion.div
                  className={`absolute inset-0 rounded-lg bg-gradient-to-r ${action.borderGradient} opacity-0 group-hover:opacity-30 blur-lg transition-opacity duration-300`}
                  initial={false}
                />

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 bg-gray-800/50 backdrop-blur-sm rounded-lg border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform duration-300">
                      {action.icon}
                    </div>
                    <motion.div
                      className="w-2 h-2 bg-purple-400 rounded-full opacity-0 group-hover:opacity-100"
                      initial={false}
                      whileHover={{ scale: 1.5 }}
                    />
                  </div>

                  <h3 className="font-semibold text-white group-hover:text-purple-200 transition-colors duration-300">
                    {action.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                    {action.description}
                  </p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Additional Info Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="p-6 bg-gray-800/20 backdrop-blur-xl border-purple-500/20">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-purple-400" />
              </div>
              <h3 className="font-semibold text-white">Pro Tip</h3>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">
              Use our AI assistant to optimize your smart contracts and reduce gas costs by up to 30%.
            </p>
          </Card>
        </motion.div>
      </motion.div>

      {/* NeuronAssistant Modal */}
      <AIAssistantModal
        isOpen={isNeuronAssistantOpen}
        onClose={() => setIsNeuronAssistantOpen(false)}
      />
          </div>
        </main>
      </div>
    </div>
  )
}