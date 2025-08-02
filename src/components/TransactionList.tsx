import React, { useState } from 'react'
import axios from 'axios'
import { toast } from 'sonner'
import { useTransactionStore } from '@/stores/transactionStore'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatDistanceToNow } from 'date-fns'
import { Copy, ChevronDown,  Activity, ExternalLink, Zap } from 'lucide-react'
import { useTransactions } from '@/hooks/useTransactions'
import { useAccount } from 'wagmi'
import { makeGeminiRequest } from '@/utils/api'
import { motion, AnimatePresence } from 'framer-motion'

interface Transaction {
  transaction: {
    hash: string;
    input: string;
    to: string;
    value: string;
    gas: string;
    gasPrice: string;
  };
  sender: string;
  timestamp: number;
}

interface DecodedTransaction {
  explanation: string;
  type: string;
  details: Record<string, unknown>;
}

export function TransactionList() {
  const { address, isConnected } = useAccount()
  useTransactions(address, isConnected)

  const { transactions, isLoading } = useTransactionStore()
  const [expandedId, setExpandedId] = React.useState<string | null>(null)
  const [decodingMap, setDecodingMap] = useState<Record<string, DecodedTransaction>>({})
  const [decodingLoading, setDecodingLoading] = useState<string | null>(null)

  const decodeTransaction = async (tx: Transaction) => {
    setDecodingLoading(tx.transaction.hash)

    try {
      const prompt = `Analyze and decode this blockchain transaction:
        Input Data: ${tx.transaction.input}
        To Address: ${tx.transaction.to}
        Value: ${parseInt(tx.transaction.value, 16) / 1e18} ETH
        Please explain what this transaction does in simple terms.
        Return the response as a JSON object with 'explanation' and 'type' fields.`;

      const decoded = await makeGeminiRequest(prompt);

      setDecodingMap(prev => ({
        ...prev,
        [tx.transaction.hash]: {
          explanation: decoded.explanation,
          type: decoded.type || 'Unknown',
          details: decoded.details || {}
        }
      }));
    } catch (error) {
      console.error('Error decoding transaction:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          toast.error('Invalid API key. Please check your configuration.');
        } else if (error.response?.status === 429) {
          toast.error('API rate limit exceeded. Please try again later.');
        } else {
          toast.error(`API Error: ${error.response?.status || 'Unknown error'}`);
        }
      } else {
        toast.error('Failed to decode transaction');
      }
    } finally {
      setDecodingLoading(null)
    }
  };

  if (isLoading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center p-12"
      >
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="h-12 w-12 animate-spin rounded-full border-2 border-purple-500/20 border-t-purple-500" />
            <div className="absolute inset-0 rounded-full bg-purple-500/10 blur-lg" />
          </div>
          <p className="text-gray-400 text-sm">Loading transactions...</p>
        </div>
      </motion.div>
    )
  }

  if (!transactions.length) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="relative overflow-hidden p-12 text-center bg-gray-900/30 backdrop-blur-xl border-gray-800/50">
          {/* Subtle glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 rounded-lg" />
          
          <div className="relative z-10 space-y-4">
            <div className="mx-auto w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center">
              <Activity className="w-8 h-8 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-white mb-2">No Transactions Yet</h3>
              <p className="text-gray-400 text-sm">Your transaction history will appear here once you start using the platform.</p>
            </div>
          </div>
        </Card>
      </motion.div>
    )
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {transactions.map((tx, index) => (
          <motion.div
            key={tx.transaction.hash}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card
              className="group relative overflow-hidden p-6 transition-all duration-300 hover:-translate-y-1 bg-gray-900/30 backdrop-blur-xl border-gray-800/50 hover:border-purple-500/30 cursor-pointer"
              onClick={() => setExpandedId(
                expandedId === tx.transaction.hash ? null : tx.transaction.hash
              )}
            >
              {/* Glowing border effect on hover */}
              <motion.div
                className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 blur-lg transition-opacity duration-300"
                initial={false}
              />

              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-800/50 backdrop-blur-sm rounded-lg border border-purple-500/30 flex items-center justify-center">
                      <Activity className="w-5 h-5 text-purple-400" />
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <p className="font-mono text-sm text-white">
                          {tx.transaction.hash.slice(0, 10)}...{tx.transaction.hash.slice(-8)}
                        </p>
                        <div className="px-2 py-1 bg-purple-500/20 rounded-full">
                          <span className="text-xs text-purple-300 font-medium">
                            {parseInt(tx.transaction.value, 16) / 1e18 > 0 ? 'Transfer' : 'Contract'}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-400">
                        {formatDistanceToNow(tx.timestamp, { addSuffix: true })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className="text-sm font-medium text-white">
                        {(parseInt(tx.transaction.value, 16) / 1e18).toFixed(4)} ETH
                      </p>
                      <p className="text-xs text-gray-400">
                        {(parseInt(tx.transaction.gasPrice, 16) / 1e9).toFixed(2)} Gwei
                      </p>
                    </div>
                    
                    <motion.div
                      animate={{ rotate: expandedId === tx.transaction.hash ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="w-8 h-8 bg-gray-800/50 rounded-lg flex items-center justify-center border border-gray-700/50"
                    >
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    </motion.div>
                  </div>
                </div>

                <AnimatePresence>
                  {expandedId === tx.transaction.hash && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-6 pt-6 border-t border-gray-800/50 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="space-y-3">
                            <div>
                              <span className="text-gray-400 block mb-1">From:</span>
                              <div className="flex items-center space-x-2">
                                <code className="text-white font-mono text-xs bg-gray-800/50 px-2 py-1 rounded">
                                  {tx.sender.slice(0, 8)}...{tx.sender.slice(-6)}
                                </code>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 hover:bg-gray-800/50"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    navigator.clipboard.writeText(tx.sender)
                                    toast.success('Address copied')
                                  }}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            
                            <div>
                              <span className="text-gray-400 block mb-1">To:</span>
                              <div className="flex items-center space-x-2">
                                <code className="text-white font-mono text-xs bg-gray-800/50 px-2 py-1 rounded">
                                  {tx.transaction.to.slice(0, 8)}...{tx.transaction.to.slice(-6)}
                                </code>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 hover:bg-gray-800/50"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    navigator.clipboard.writeText(tx.transaction.to)
                                    toast.success('Address copied')
                                  }}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <span className="text-gray-400 block mb-1">Gas Used:</span>
                              <span className="text-white">{parseInt(tx.transaction.gas, 16).toLocaleString()}</span>
                            </div>
                            
                            <div>
                              <span className="text-gray-400 block mb-1">Gas Price:</span>
                              <span className="text-white">{(parseInt(tx.transaction.gasPrice, 16) / 1e9).toFixed(2)} Gwei</span>
                            </div>
                          </div>
                        </div>
                        
                        {decodingMap[tx.transaction.hash] && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-4 p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20"
                          >
                            <div className="flex items-center space-x-2 mb-3">
                              <Zap className="h-4 w-4 text-purple-400" />
                              <h4 className="font-medium text-white">AI Analysis</h4>
                              <div className="px-2 py-1 bg-purple-500/20 rounded-full">
                                <span className="text-xs text-purple-300">{decodingMap[tx.transaction.hash].type}</span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-300 leading-relaxed">
                              {decodingMap[tx.transaction.hash].explanation}
                            </p>
                          </motion.div>
                        )}
                        
                        <div className="flex gap-3 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={decodingLoading === tx.transaction.hash}
                            className="bg-purple-500/10 border-purple-500/30 hover:bg-purple-500/20 text-purple-300 hover:text-white"
                            onClick={(e) => {
                              e.stopPropagation()
                              decodeTransaction(tx)
                            }}
                          >
                            {decodingLoading === tx.transaction.hash ? (
                              <div className="w-4 h-4 animate-spin rounded-full border-2 border-purple-500/30 border-t-purple-500" />
                            ) : (
                              <Zap className="mr-2 h-4 w-4" />
                            )}
                            {decodingMap[tx.transaction.hash] ? 'Re-analyze' : 'Analyze'}
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-gray-800/30 border-gray-700/50 hover:bg-gray-700/30 text-gray-300 hover:text-white"
                            onClick={(e) => {
                              e.stopPropagation()
                              navigator.clipboard.writeText(tx.transaction.hash)
                              toast.success('Transaction hash copied')
                            }}
                          >
                            <Copy className="mr-2 h-4 w-4" />
                            Copy Hash
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-gray-800/30 border-gray-700/50 hover:bg-gray-700/30 text-gray-300 hover:text-white"
                            onClick={(e) => {
                              e.stopPropagation()
                              window.open(`https://etherscan.io/tx/${tx.transaction.hash}`, '_blank')
                            }}
                          >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Explorer
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}