import { cn } from "@/lib/utils"

interface CodeProps extends React.HTMLAttributes<HTMLPreElement> {
  children: React.ReactNode
}

export function Code({ children, className, ...props }: CodeProps) {
  return (
    <pre
      className={cn(
        "bg-gray-950 rounded-lg p-4 overflow-x-auto font-mono text-sm text-gray-300",
        className
      )}
      {...props}
    >
      <code>{children}</code>
    </pre>
  )
}