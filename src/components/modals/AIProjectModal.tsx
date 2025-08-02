'use client'
import { SetStateAction, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Loader2, Sparkles, Code, Zap, CheckCircle, AlertCircle } from "lucide-react"

interface AIProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onGenerate: (description: string) => Promise<void>
}

export function AIProjectModal({ isOpen, onClose, onGenerate }: AIProjectModalProps) {
  const [description, setDescription] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [charCount, setCharCount] = useState(0)

  const maxChars = 500
  const minChars = 20

  const handleDescriptionChange = (e: { target: { value: SetStateAction<string> } }) => {
    const value = e.target.value as string
    setDescription(value)
    setCharCount(value.length)
  }

  const handleGenerate = async () => {
    if (!description.trim() || charCount < minChars) return
    setIsGenerating(true)
    try {
      await onGenerate(description)
      onClose()
      setDescription('')
      setCharCount(0)
    } catch (error) {
      console.error('Error generating contract:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleClose = () => {
    if (!isGenerating) {
      onClose()
      setDescription('')
      setCharCount(0)
    }
  }

  const getCharCountColor = () => {
    if (charCount < minChars) return 'text-red-400'
    if (charCount > maxChars * 0.8) return 'text-yellow-400'
    return 'text-green-400'
  }

  const isValidDescription = charCount >= minChars && charCount <= maxChars

  const examples = [
    "ERC20 token with 1M max supply, mintable by owner",
    "NFT collection with 10k items, whitelist presale",
    "Staking contract with 12% APY and lock periods"
  ]

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 border-zinc-700/50 shadow-2xl">
        {/* Header with enhanced styling */}
        <DialogHeader className="text-center pb-6 border-b border-zinc-800/50">
          <div className="flex items-center justify-center mb-3">
            <div className="p-3 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30">
              <Sparkles className="w-6 h-6 text-purple-400" />
            </div>
          </div>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            AI Smart Contract Generator
          </DialogTitle>
          <DialogDescription className="text-gray-400 text-base mt-2 max-w-md mx-auto">
            Describe your requirements and our AI will generate production-ready smart contract code tailored to your specifications.
          </DialogDescription>
        </DialogHeader>

        <div className="pt-6 space-y-6">
          {/* Features badges */}
          <div className="flex flex-wrap gap-2 justify-center">
            <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
              <Code className="w-3 h-3 mr-1" />
              Solidity
            </Badge>
            <Badge variant="secondary" className="bg-green-500/10 text-green-400 border-green-500/20">
              <CheckCircle className="w-3 h-3 mr-1" />
              Audited Patterns
            </Badge>
            <Badge variant="secondary" className="bg-purple-500/10 text-purple-400 border-purple-500/20">
              <Zap className="w-3 h-3 mr-1" />
              Gas Optimized
            </Badge>
          </div>

          {/* Main input section */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                Contract Description
                {!isValidDescription && charCount > 0 && (
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                )}
              </label>
              <div className="relative">
                <Textarea
                  placeholder="Describe your smart contract requirements in detail..."
                  value={description}
                  onChange={handleDescriptionChange}
                  maxLength={maxChars}
                  className="h-32 bg-zinc-800/50 border-zinc-700/50 text-white placeholder:text-gray-500 resize-none focus:border-purple-500/50 focus:ring-purple-500/20 transition-all duration-200"
                />
                <div className="absolute bottom-3 right-3 flex items-center gap-2">
                  <span className={`text-xs font-medium ${getCharCountColor()}`}>
                    {charCount}/{maxChars}
                  </span>
                </div>
              </div>
              {charCount < minChars && charCount > 0 && (
                <p className="text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Minimum {minChars} characters required for better results
                </p>
              )}
            </div>

            {/* Examples section */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-300">Popular Examples:</p>
              <div className="grid gap-2">
                {examples.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setDescription(example)
                      setCharCount(example.length)
                    }}
                    className="text-left p-3 rounded-lg bg-zinc-800/30 border border-zinc-700/30 text-gray-300 text-sm hover:bg-zinc-800/50 hover:border-zinc-600/50 transition-all duration-200 group"
                  >
                    <span className="group-hover:text-white transition-colors">
                      &quot;{example}&quot;
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-between items-center pt-4 border-t border-zinc-800/50">
            <Button 
              variant="ghost" 
              onClick={handleClose}
              disabled={isGenerating}
              className="text-gray-400 hover:text-white hover:bg-zinc-800/50"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleGenerate}
              disabled={isGenerating || !isValidDescription}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold px-6 py-2 shadow-lg hover:shadow-purple-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Contract...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Smart Contract
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Loading overlay */}
        {isGenerating && (
          <div className="absolute inset-0 bg-zinc-900/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="animate-pulse">
                <Sparkles className="w-8 h-8 text-purple-400 mx-auto" />
              </div>
              <div className="space-y-2">
                <p className="text-white font-medium">Generating your smart contract...</p>
                <p className="text-gray-400 text-sm">This may take a few moments</p>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}