import { type NextRequest, NextResponse } from "next/server"
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { basename, join, resolve, dirname } from 'path'

interface ABIItem {
  type: string
  name?: string
  inputs?: Array<{ name: string; type: string; indexed?: boolean }>
  outputs?: Array<{ name: string; type: string }>
  stateMutability?: string
  anonymous?: boolean
}

interface ContractBytecode {
  object: string
  opcodes?: string
  sourceMap?: string
  linkReferences?: Record<string, unknown>
}

interface ContractEVM {
  bytecode: ContractBytecode
  deployedBytecode?: ContractBytecode
}

interface CompiledContract {
  abi: ABIItem[]
  evm: ContractEVM
}

interface CompilationOutput {
  contracts: {
    [sourcePath: string]: {
      [contractName: string]: CompiledContract
    }
  }
  errors?: Array<{ severity: string; message: string }>
  sources?: Record<string, unknown>
}

interface CompilationResult {
  contracts: { [contractName: string]: { abi: ABIItem[]; bytecode: string } }
  warnings?: string[]
  error?: string
}

// Dynamic import for resolc to handle WASM loading
const loadResolc = async (): Promise<(sources: Record<string, { content: string }>) => Promise<CompilationOutput>> => {
  try {
    const { compile } = await import('@parity/resolc')
    return compile
  } catch (error) {
    console.error('Failed to load resolc:', error)
    throw new Error('Failed to load Solidity compiler')
  }
}

const resolveImportPath = (importPath: string, currentPath?: string) => {
  if (importPath.startsWith("@openzeppelin/contracts/")) {
    return resolve(
      importPath.replace("@openzeppelin/contracts/", "openzeppelin/")
    )
  }

  if (currentPath) {
    console.log(`Resolving import path: ${importPath} from current path: ${currentPath}`)
    return resolve(dirname(currentPath), importPath)
  }

  console.warn('Current path is not provided, using default directory.')
  return resolve(importPath)
}

const readSourceFile = (filePath: string) => {
  if (existsSync(filePath)) {
    return readFileSync(filePath, "utf8")
  }
  throw new Error(`File not found: ${filePath}`)
}

const resolveSources = (sources: Record<string, { content: string }>, parent?: string) => {
  const modifiedSources: Record<string, { content: string }> = {}
  const queue = Object.entries(sources)

  for (const [key, value] of queue) {
    console.log(`Resolving sources: ${key}`)
    let content = value.content

    content = content.replace(/import\s+(\{.*?\}\s+from\s+)?["'](.*)["'];/g, (match, namedImports, importPath) => {
      console.log(`Resolving import: ${importPath}`)
      const localPath = resolveImportPath(importPath, parent)
      console.log(`Resolved import path: ${localPath}`)
      const fileContent = readSourceFile(localPath)
      const filename = basename(localPath)

      const resolvedSources = resolveSources({ [filename]: { content: fileContent } }, localPath)
      Object.assign(modifiedSources, resolvedSources)

      return `import ${namedImports ? namedImports : ""}"${filename}";`
    })

    modifiedSources[key] = { content }
  }

  return modifiedSources
}

const compileFromSources = async (
  sources: { [key: string]: { content: string } },
  outputDir?: string
): Promise<CompilationResult> => {
  try {
    console.log('Compiling contracts from sources...')

    // Resolve imports before compilation
    const resolvedSources = resolveSources(sources)
    console.log('Resolved sources:', Object.keys(resolvedSources))

    // Dynamically load the compile function
    const compile = await loadResolc()

    // Compile using resolved sources
    const out = await compile(resolvedSources)
    const contracts: { [contractName: string]: { abi: ABIItem[]; bytecode: string } } = {}
    const warnings: string[] = []

    // Process compilation output
    for (const [, sourceContracts] of Object.entries(out.contracts)) {
      for (const [name, contract] of Object.entries(sourceContracts)) {
        console.log(`Compiled contract: ${name}`)

        // Extract ABI
        const abi = contract.abi

        // Extract bytecode
        let bytecode = ''
        if (
          contract.evm &&
          contract.evm.bytecode &&
          contract.evm.bytecode.object
        ) {
          bytecode = contract.evm.bytecode.object
          console.log(`Bytecode found for contract: ${name}`)
        } else {
          warnings.push(`No bytecode found for contract: ${name}`)
          console.warn(`No bytecode found for contract: ${name}`)
        }

        contracts[name] = { abi, bytecode }

        // Optionally write files if outputDir is provided
        if (outputDir) {
          // Write the ABI
          const abiPath = join(outputDir, `${name}.json`)
          writeFileSync(abiPath, JSON.stringify(abi, null, 2))
          console.log(`ABI saved to ${abiPath}`)

          // Write the bytecode
          if (bytecode) {
            const bytecodePath = join(outputDir, `${name}.polkavm`)
            writeFileSync(bytecodePath, Buffer.from(bytecode, 'hex'))
            console.log(`Bytecode saved to ${bytecodePath}`)
          }
        }
      }
    }

    return { contracts, warnings: warnings.length > 0 ? warnings : undefined }
  } catch (error) {
    console.error('Error compiling contracts:', error)
    
    // Provide more specific error messages
    if (error instanceof Error && error.message.includes('ENOENT')) {
      return {
        contracts: {},
        error: 'WASM file not found. Please ensure the WASM file is in the public directory and accessible.',
      }
    }
    
    return {
      contracts: {},
      error: error instanceof Error ? error.message : 'Unknown compilation error',
    }
  }
}

const compileFromFile = async (
  solidityFilePath: string,
  outputDir?: string
): Promise<CompilationResult> => {
  try {
    // Read the initial source file
    const content = readFileSync(solidityFilePath, 'utf8')
    
    // Construct the initial sources object
    const sources = {
      [basename(solidityFilePath)]: { content },
    }

    // Use resolveSources to handle imports
    const resolvedSources = resolveSources(sources, solidityFilePath)

    return await compileFromSources(resolvedSources, outputDir)
  } catch (error) {
    console.error('Error reading or resolving file:', error)
    return {
      contracts: {},
      error: error instanceof Error ? error.message : 'Error reading or resolving file',
    }
  }
}

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json()
    
    if (!body) {
      return NextResponse.json({ error: "Missing request body" }, { status: 400 })
    }
    
    // Support both formats: sources object or file path
    if (body.sources) {
      // Frontend format: { sources: { "contracts/file.sol": { content: "..." } } }
      const { sources, outputDir, saveFiles = false } = body
      
      const finalOutputDir = saveFiles ? (outputDir || './artifacts/') : undefined
      console.log(finalOutputDir, 'Final output directory for saving files')
      const result = await compileFromSources(sources, finalOutputDir)
      
      return NextResponse.json(result, { 
        status: result.error ? 500 : 200 
      })
      
    } else if (body.solidityFilePath) {
      // File path format: { solidityFilePath: "./contracts/file.sol" }
      const { solidityFilePath, outputDir, saveFiles = false } = body
      
      const finalOutputDir = saveFiles ? (outputDir || './artifacts/') : undefined
      const result = await compileFromFile(solidityFilePath, finalOutputDir)
      
      return NextResponse.json(result, { 
        status: result.error ? 500 : 200 
      })
      
    } else {
      return NextResponse.json(
        { error: 'Either sources object or solidityFilePath is required' },
        { status: 400 }
      )
    }
    
  } catch (error) {
    console.error('API route error:', error)
    return NextResponse.json(
      { 
        error: `API error: ${error instanceof Error ? error.message : 'Unknown error'}` 
      },
      { status: 500 }
    )
  }
}

export const GET = async () => {
  // Default compilation with hardcoded values (for testing)
  const solidityFilePath = './contracts/Storage.sol'

  const result = await compileFromFile(solidityFilePath)

  return NextResponse.json(result, { 
    status: result.error ? 500 : 200 
  })
}