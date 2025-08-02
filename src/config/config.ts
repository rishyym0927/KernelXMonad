import { http, createConfig } from 'wagmi'
import { myCustomChain } from '@/chains/chain'

export const config = createConfig({
  chains: [myCustomChain],
  transports: {
    [myCustomChain.id]: http(),
  },
})