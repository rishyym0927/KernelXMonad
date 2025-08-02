import React from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Copy, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'

interface ContractCardProps {
  contract: {
    address: string
    name: string
    description: string
    version: string
    abi: string
  }
}

export function ContractCard({ contract }: ContractCardProps) {
  return (
    <Card className="group transition-all hover:-translate-y-1 hover:shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {contract.name}
          <span className="text-sm font-normal text-muted-foreground">
            v{contract.version}
          </span>
        </CardTitle>
        <CardDescription className="line-clamp-2">
          {contract.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground truncate">
          {contract.address}
        </p>
      </CardContent>
      <CardFooter className="gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            navigator.clipboard.writeText(contract.abi)
            toast.success('ABI copied to clipboard')
          }}
        >
          <Copy className="mr-2 h-4 w-4" />
          Copy ABI
        </Button>
        <Button
          variant="outline"
          size="sm"
          asChild
        >
          <a 
            href={`https://blockscout-passet-hub.parity-testnet.parity.io/address/${contract.address}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            View
          </a>
        </Button>
      </CardFooter>
    </Card>
  )
}