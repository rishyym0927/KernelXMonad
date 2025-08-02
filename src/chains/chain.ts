import {defineChain} from 'viem';

export const myCustomChain = defineChain({
  id: 420420421, // Replace this with your chain's ID
  name: 'PolkaVM',
  network: 'Westend Testnet',
  nativeCurrency: {
    decimals: 18, // Replace this with the number of decimals for your chain's native token
    name: 'Westend Token',
    symbol: 'WND'
  },
  rpcUrls: {
    default: {
      http: [' https://monad-testnet.g.alchemy.com/v2/KQFf6_velbK7qaOWz2BVBi74a9ZBy6gw'],
    }
  },
  blockExplorers: {
    default: {name: 'Explorer', url: 'https://testnet.monadexplorer.com/'}
  }
});