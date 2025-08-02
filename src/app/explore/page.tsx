"use client"

import { ContractStore } from "../../data/contracts"
import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import axios from "axios"
import { Copy, Check, X, ChevronDown, Code, Eye, Zap, Shield, Layers } from "lucide-react"

const ExplorePage = () => {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({})
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [sourceCode, setSourceCode] = useState("")
  const [selectedContract, setSelectedContract] = useState<CustomizeContract | null>(null)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)

  interface ExpandedCategories {
    [key: string]: boolean
  }

  const toggleCategory = (categoryId: string): void => {
    setExpandedCategories((prev: ExpandedCategories) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }))
  }

  interface Contract {
    path: string
    name: string
  }

  interface CodeResponse {
    contract: string
  }

  const fetchCode = async (contract: Contract): Promise<void> => {
    console.log("Fetching contract:", contract.path)
    setLoading(true)

    try {
      const res = await axios.post<CodeResponse>("/api/explore", {
        slug: contract.path,
      })
      if (res.status === 200) {
        setSourceCode(res.data.contract)
      }
    } catch (e) {
      console.error("Error fetching code:", e)
    } finally {
      setLoading(false)
    }
  }

  interface CustomizeContract {
    identifier: string
    name: string
    version: string
    description: string
    path: string
  }

  const handleCustomize = async (
    e: React.MouseEvent<HTMLButtonElement>,
    contract: CustomizeContract,
  ): Promise<void> => {
    e.preventDefault()
    setSelectedContract(contract)
    setIsModalOpen(true)
    await fetchCode(contract)
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(sourceCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  const getContractIcon = (name: string) => {
    if (name.toLowerCase().includes("token") || name.toLowerCase().includes("erc20")) {
      return <Layers className="w-5 h-5" />
    }
    if (name.toLowerCase().includes("nft") || name.toLowerCase().includes("721")) {
      return <Shield className="w-5 h-5" />
    }
    if (name.toLowerCase().includes("dao") || name.toLowerCase().includes("governance")) {
      return <Zap className="w-5 h-5" />
    }
    return <Code className="w-5 h-5" />
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden pt-30">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-purple-900/10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]" />
        <motion.div
          className="absolute inset-0 opacity-30"
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 max-w-7xl py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent">
            Smart Contract Templates
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Discover and customize battle-tested smart contract templates for your next blockchain project
          </p>
          <motion.div
            className="w-24 h-1 bg-gradient-to-r from-purple-500 to-purple-700 mx-auto mt-6 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: 96 }}
            transition={{ duration: 1, delay: 0.5 }}
          />
        </motion.div>

        {/* Contract Categories */}
        <div className="space-y-20">
          {ContractStore.map((store, storeIndex) => (
            <motion.div
              key={`${store.contracts[0].identifier}-${store.contracts[0].version}`}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: storeIndex * 0.1 }}
              className="relative"
            >
              {/* Category Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-purple-700/20 backdrop-blur-sm rounded-xl border border-purple-500/30 flex items-center justify-center">
                    <Code className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-white">{store.name}</h2>
                    <p className="text-gray-400 text-sm">{store.contracts.length} templates available</p>
                  </div>
                </div>
                {store.contracts.length > 6 && (
                  <motion.button
                    onClick={() => toggleCategory(store.identifier)}
                    className="group flex items-center gap-2 px-4 py-2 bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-xl hover:border-purple-500/30 transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="text-purple-400 text-sm font-medium">
                      {expandedCategories[store.identifier] ? "Show Less" : "View More"}
                    </span>
                    <motion.div
                      animate={{ rotate: expandedCategories[store.identifier] ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ChevronDown className="w-4 h-4 text-purple-400" />
                    </motion.div>
                  </motion.button>
                )}
              </div>

              {/* Contract Grid */}
              <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {store.contracts
                    .slice(0, expandedCategories[store.identifier] ? undefined : 6)
                    .map((contract, index) => (
                      <motion.div
                        key={`${store.identifier}-${contract.identifier}-${index}`}
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.9 }}
                        transition={{ duration: 0.4, delay: index * 0.05 }}
                        layout
                      >
                        <Link href={`/${contract.identifier}`}>
                          <motion.div
                            className="group relative bg-gray-900/30 backdrop-blur-xl rounded-2xl p-6 border border-gray-800/50 hover:border-purple-500/30 transition-all duration-500 h-[240px] flex flex-col overflow-hidden"
                            whileHover={{ y: -5, scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            {/* Animated background gradient */}
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-purple-700/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                              initial={false}
                            />

                            {/* Glowing border effect */}
                            <motion.div
                              className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/20 to-purple-700/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500"
                              initial={false}
                            />

                            <div className="relative z-10 flex flex-col h-full">
                              {/* Header */}
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                  <motion.div
                                    className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-purple-700/20 backdrop-blur-sm rounded-lg border border-purple-500/30 flex items-center justify-center text-purple-400"
                                    whileHover={{ rotate: 360 }}
                                    transition={{ duration: 0.6 }}
                                  >
                                    {getContractIcon(contract.name)}
                                  </motion.div>
                                  <div>
                                    <h3 className="text-lg font-semibold text-white group-hover:text-purple-200 transition-colors duration-300 line-clamp-1">
                                      {contract.name}
                                    </h3>
                                  </div>
                                </div>
                                <motion.div
                                  className="px-2 py-1 rounded-lg text-xs font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20"
                                  whileHover={{ scale: 1.1 }}
                                >
                                  v{contract.version}
                                </motion.div>
                              </div>

                              {/* Description */}
                              <p className="text-gray-400 text-sm leading-relaxed line-clamp-3 flex-grow mb-4">
                                {contract.description.length > 120
                                  ? `${contract.description.slice(0, 120)}...`
                                  : contract.description}
                              </p>

                              {/* Actions */}
                              <div className="flex justify-between items-center mt-auto">
                                <motion.button
                                  onClick={(e) =>
                                    handleCustomize(e, {
                                      ...contract,
                                      path: contract.path || "",
                                    })
                                  }
                                  className="flex items-center gap-2 text-purple-400 text-sm font-medium hover:text-purple-300 transition-colors duration-200"
                                  whileHover={{ x: -2 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <Code className="w-4 h-4" />
                                  Customize
                                </motion.button>

                                <motion.div
                                  className="flex items-center gap-2 text-gray-400 text-sm"
                                  whileHover={{ x: 2 }}
                                >
                                  <span>View Details</span>
                                  <Eye className="w-4 h-4" />
                                </motion.div>
                              </div>
                            </div>
                          </motion.div>
                        </Link>
                      </motion.div>
                    ))}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Enhanced Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-gray-800/50 w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center p-6 border-b border-gray-800/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-purple-700/20 backdrop-blur-sm rounded-xl border border-purple-500/30 flex items-center justify-center">
                    {selectedContract && getContractIcon(selectedContract.name)}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">{selectedContract?.name}</h3>
                    <p className="text-gray-400 text-sm">Source Code Preview</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <motion.button
                    onClick={copyToClipboard}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 backdrop-blur-sm text-purple-300 rounded-lg hover:bg-purple-500/30 transition-all border border-purple-500/30"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={!sourceCode || loading}
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? "Copied!" : "Copy Code"}
                  </motion.button>
                  <motion.button
                    onClick={() => setIsModalOpen(false)}
                    className="w-10 h-10 bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700/50 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700/50 transition-all"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-hidden">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <motion.div
                      className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                    />
                  </div>
                ) : (
                  <div className="h-full overflow-auto p-6">
                    <motion.pre
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="bg-black/50 backdrop-blur-sm p-6 rounded-xl border border-gray-800/50 overflow-x-auto"
                    >
                      <code className="text-sm text-green-400 font-mono leading-relaxed">
                        {sourceCode || "No source code available"}
                      </code>
                    </motion.pre>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ExplorePage
