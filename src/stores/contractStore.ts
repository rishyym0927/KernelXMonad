import { create } from 'zustand'

export interface Contract {
  address: string
  name: string
  description: string
  version: string
  abi: string
  content: string // Add this for the actual Solidity code
  language: string // Add this for syntax highlighting
}

interface ContractStore {
  contracts: Contract[]
  addContract: (contract: Contract) => void
  removeContract: (address: string) => void
  updateContract: (address: string, contract: Partial<Contract>) => void
}

export const useContractStore = create<ContractStore>((set) => ({
  contracts: [],
  
  addContract: (contract) => 
    set((state) => ({
      contracts: [...state.contracts, contract]
    })),

  removeContract: (address) =>
    set((state) => ({
      contracts: state.contracts.filter((c) => c.address !== address)
    })),

  updateContract: (address, updatedContract) =>
    set((state) => ({
      contracts: state.contracts.map((c) => 
        c.address === address ? { ...c, ...updatedContract } : c
      )
    }))
}))