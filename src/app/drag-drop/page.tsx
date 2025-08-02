"use client"
import type React from "react"
import { useState } from "react"
import { componentLibrary, categories } from "@/constants/componentLibrary"
import { Database, Radio, Zap, Map, Cpu, X, Copy, Check, ChevronDown,Sparkles,Loader2 } from "lucide-react"
import { makeGeminiRequest } from "@/utils/api"

const VisualSmartContractBuilder = () => {
  const [canvasComponents, setCanvasComponents] = useState<ComponentType[]>([])
  const [selectedComponent, setSelectedComponent] = useState<ComponentType | null>(null)
  const [generatedCode, setGeneratedCode] = useState("")
  const [draggedComponent, setDraggedComponent] = useState<ComponentType | null>(null)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false)
  const [aiRequirements, setAiRequirements] = useState("")
const [isGeneratingFunction, setIsGeneratingFunction] = useState(false)
const [showAiInput, setShowAiInput] = useState(false)



  interface ComponentType {
    originalId: string
    y?: string | number
    x?: string | number
    id: string
    type: string
    name: string
    icon: string | React.JSX.Element
    color: string
    properties: Record<string, string | number | boolean | undefined> // Specific allowed types
    category?: string
    description?: string
    gasEstimate?: number
  }

  // Generate unique ID
  const generateId = () => `component_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  // Handle component drag start
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, component: ComponentType) => {
    // Ensure the component has the correct structure
    const typedComponent: ComponentType = {
      ...component,
      originalId: component.id,
      x: undefined,
      y: undefined,
      properties: component.properties || {} // Ensure properties is always an object
    }
    setDraggedComponent(typedComponent)
    e.dataTransfer.effectAllowed = "copy"
  }

const getAvailableDataTypes = (): string[] => {
  const baseTypes = ["uint256", "int256", "address", "bool", "string", "bytes32", "uint8", "uint128"];
  const structTypes = canvasComponents
    .filter(comp => comp.type === "struct")
    .map(struct => String(struct.properties.name)) // Convert to string
    .filter(name => name && name.trim() !== "" && name !== "undefined"); // Filter out invalid values
  
  return [...baseTypes, ...structTypes];
};

  // Handle drop on canvas
  const handleCanvasDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (!draggedComponent) return

    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const newComponent = {
      ...draggedComponent,
      id: generateId(),
      originalId: draggedComponent.id,
      x: Math.max(0, x - 75),
      y: Math.max(0, y - 25),
    }

    setCanvasComponents((prev) => [...prev, newComponent])
    setDraggedComponent(null)
  }

  // Handle canvas drag over
  const handleCanvasDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "copy"
  }

  // Handle component selection
  const handleComponentClick = (component: ComponentType) => {
    setSelectedComponent(component)
  }

  // Update component properties
  const updateComponentProperty = (componentId: string, property: string, value: string | boolean) => {
    setCanvasComponents((prev) =>
      prev.map((comp) =>
        comp.id === componentId ? { ...comp, properties: { ...comp.properties, [property]: value } } : comp,
      ),
    )

    if (selectedComponent && selectedComponent.id === componentId) {
      setSelectedComponent((prev) => {
        if (!prev) return null
        return {
          ...prev,
          originalId: prev.originalId,
          y: prev.y,
          x: prev.x,
          id: prev.id,
          type: prev.type,
          name: prev.name,
          icon: prev.icon,
          color: prev.color,
          properties: { ...prev.properties, [property]: value },
        }
      })
    }
  }

  // Remove component from canvas
  const removeComponent = (componentId: string) => {
    setCanvasComponents((prev) => prev.filter((comp) => comp.id !== componentId))
    if (selectedComponent && selectedComponent.id === componentId) {
      setSelectedComponent(null)
    }
  }

  // Copy to clipboard function
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  const generateFunctionBody = async () => {
  if (!selectedComponent || !aiRequirements.trim()) return
  
  setIsGeneratingFunction(true)
  
  try {
    // Prepare context from existing components
    const contractContext = {
      stateVariables: canvasComponents.filter(c => c.type === "variable"),
      functions: canvasComponents.filter(c => c.type === "function"),
      events: canvasComponents.filter(c => c.type === "event"),
      modifiers: canvasComponents.filter(c => c.type === "modifier")
    }
    
    const prompt = `
    Generate a Solidity function body based on these requirements: "${aiRequirements}"
    
    Context of existing contract components:
    - State Variables: ${JSON.stringify(contractContext.stateVariables.map(v => ({ name: v.properties.name, type: v.properties.dataType })))}
    - Existing Functions: ${JSON.stringify(contractContext.functions.map(f => ({ name: f.properties.name, params: f.properties.parameters })))}
    
    Function details:
    - Name: ${selectedComponent.properties.name}
    - Parameters: ${selectedComponent.properties.parameters}
    - Visibility: ${selectedComponent.properties.visibility}
    
    Please provide only the function body code (without function declaration), following Solidity best practices.
    `
    
    const response = await makeGeminiRequest(prompt)
    
    if (response) {
      updateComponentProperty(selectedComponent.id, "functionBody", response.trim())
      setAiRequirements("")
      setShowAiInput(false)
    }
    
  } catch (error) {
    console.error("Error generating function body:", error)
  } finally {
    setIsGeneratingFunction(false)
  }
}

  // Generate Solidity code (keeping the existing comprehensive function)
  const generateSolidityCode = () => {
    let code = ""
    const imports = new Set<string>()
    const inheritance = new Set<string>()
    const interfaces = new Set<string>()

    // Analyze components to determine required imports and inheritance
    const templates = canvasComponents.filter((comp) => comp.type === "template")
    const hasAccessControl = canvasComponents.some((comp) => comp.originalId === "access-control")
    const hasReentrancyGuard = canvasComponents.some((comp) => comp.originalId === "reentrancy-guard")
    const hasUpgradeableProxy = canvasComponents.some((comp) => comp.originalId === "upgradeable-proxy")
    const hasERC20 = templates.some((t) => t.originalId === "erc20-advanced")
    const hasERC721 = templates.some((t) => t.originalId === "erc721")
    const hasDAO = templates.some((t) => t.originalId === "dao-voting")
    const hasOracle = canvasComponents.some((comp) => comp.originalId === "chainlink-price-feed")
    const hasFlashLoan = templates.some((t) => t.originalId === "flash-loan")

    // Add necessary imports
    if (hasERC20) {
      imports.add("@openzeppelin/contracts/token/ERC20/ERC20.sol")
      inheritance.add("ERC20")
    }

    if (hasERC721) {
      imports.add("@openzeppelin/contracts/token/ERC721/ERC721.sol")
      inheritance.add("ERC721")
    }

    if (hasAccessControl) {
      imports.add("@openzeppelin/contracts/access/Ownable.sol")
      inheritance.add("Ownable")
    }

    if (hasReentrancyGuard) {
      imports.add("@openzeppelin/contracts/security/ReentrancyGuard.sol")
      inheritance.add("ReentrancyGuard")
    }

    if (hasUpgradeableProxy) {
      imports.add("@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol")
      imports.add("@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol")
      inheritance.add("Initializable")
      inheritance.add("UUPSUpgradeable")
    }

    if (hasDAO) {
      imports.add("@openzeppelin/contracts/governance/Governor.sol")
      imports.add("@openzeppelin/contracts/governance/extensions/GovernorSettings.sol")
      imports.add("@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol")
      imports.add("@openzeppelin/contracts/governance/extensions/GovernorVotes.sol")
      inheritance.add("Governor")
      inheritance.add("GovernorSettings")
      inheritance.add("GovernorCountingSimple")
      inheritance.add("GovernorVotes")
    }

    if (hasOracle) {
      imports.add("@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol")
      interfaces.add("AggregatorV3Interface")
    }

    if (hasFlashLoan) {
      imports.add("@aave/core-v3/contracts/interfaces/IPoolAddressesProvider.sol")
      imports.add("@aave/core-v3/contracts/interfaces/IPool.sol")
      imports.add("@aave/core-v3/contracts/flashloan/interfaces/IFlashLoanReceiver.sol")
      interfaces.add("IFlashLoanReceiver")
    }

    // Start building the contract
    code += `// SPDX-License-Identifier: MIT\n`
    code += `pragma solidity ^0.8.19;\n\n`

    // Add imports
    Array.from(imports).forEach((importPath) => {
      code += `import "${importPath}";\n`
    })

    if (imports.size > 0) code += "\n"

    // Add interfaces
    Array.from(interfaces).forEach((interfaceName) => {
      if (interfaceName === "IFlashLoanReceiver") {
        code += `interface ${interfaceName} {\n`
        code += `    function executeOperation(\n`
        code += `        address[] calldata assets,\n`
        code += `        uint256[] calldata amounts,\n`
        code += `        uint256[] calldata premiums,\n`
        code += `        address initiator,\n`
        code += `        bytes calldata params\n`
        code += `    ) external returns (bool);\n`
        code += `}\n\n`
      }
    })

    // Contract declaration with inheritance
    const inheritanceList = Array.from(inheritance)
    const contractName = "GeneratedContract"

    if (inheritanceList.length > 0) {
      code += `contract ${contractName} is ${inheritanceList.join(", ")} {\n`
    } else {
      code += `contract ${contractName} {\n`
    }

    // Add custom errors (modern Solidity practice)
    code += `    // Custom Errors\n`
    code += `    error Unauthorized();\n`
    code += `    error InsufficientBalance();\n`
    code += `    error InvalidInput();\n`
    code += `    error TransferFailed();\n\n`

    // Add structs
    const structs = canvasComponents.filter((comp) => comp.type === "struct")
    if (structs.length > 0) {
      code += `    // Structs\n`
      structs.forEach((struct) => {
        code += `    struct ${struct.properties.name} {\n`
        const fields = String(struct.properties.fields || "").split(";").filter((field: string) => field.trim())
        fields.forEach((field: string) => {
          code += `        ${field.trim()};\n`
        })
        code += `    }\n\n`
      })
    }

    // Add state variables
    const variables = canvasComponents.filter((comp) => comp.type === "variable")
    if (variables.length > 0) {
      code += `    // State Variables\n`
      variables.forEach((variable) => {
        if (variable.originalId === "mapping") {
          code += `    mapping(${variable.properties.keyType} => ${variable.properties.valueType}) ${variable.properties.visibility} ${variable.properties.name};\n`
        } else if (variable.originalId === "nested-mapping") {
          code += `    mapping(${variable.properties.keyType1} => mapping(${variable.properties.keyType2} => ${variable.properties.valueType})) ${variable.properties.visibility} ${variable.properties.name};\n`
        } else if (variable.originalId === "diamond-storage") {
          code += `    // Diamond Storage Pattern\n`
          const namespace = String(variable.properties.namespace || 'DEFAULT')
          code += `    bytes32 constant ${namespace.toUpperCase()}_STORAGE_POSITION = ${variable.properties.storageSlot};\n`

          // And replace other namespace usages:          code += `    \n`
          code += `    struct ${variable.properties.namespace}Storage {\n`
          const storageVars = String(variable.properties.variables || "").split(";").filter((v: string) => v.trim())
          storageVars.forEach((v: string) => {
            code += `        ${v.trim()};\n`
          })
          code += `    }\n\n`
          code += `    function ${namespace.toLowerCase()}Storage() internal pure returns (${namespace}Storage storage ds) {\n`
          code += `        bytes32 position = ${namespace.toUpperCase()}_STORAGE_POSITION;\n`
          code += `        assembly {\n`
          code += `            ds.slot := position\n`
          code += `        }\n`
          code += `    }\n\n`
        } else {
          const constant = variable.properties.constant ? " constant" : ""
          const immutable = variable.properties.immutable ? " immutable" : ""
          const defaultValue = variable.properties.defaultValue ? ` = ${variable.properties.defaultValue}` : ""
          code += `    ${variable.properties.dataType} ${variable.properties.visibility}${constant}${immutable} ${variable.properties.name}${defaultValue};\n`
        }
      })
      code += "\n"
    }

    // Add events
    const events = canvasComponents.filter((comp) => comp.type === "event")
    if (events.length > 0) {
      code += `    // Events\n`
      events.forEach((event) => {
        const anonymous = event.properties.anonymous ? " anonymous" : ""
        code += `    event ${event.properties.name}(${event.properties.parameters})${anonymous};\n`
      })
      code += "\n"
    }

    // Add modifiers
    const modifiers = canvasComponents.filter((comp) => comp.type === "modifier")
    if (modifiers.length > 0) {
      code += `    // Modifiers\n`
      modifiers.forEach((modifier) => {
        code += `    modifier ${modifier.properties.name}(${modifier.properties.parameters || ""}) {\n`

        if (modifier.originalId === "access-control") {
          code += `        if (${modifier.properties.condition}) revert Unauthorized();\n`
        } else if (modifier.originalId === "reentrancy-guard") {
          code += `        if (${modifier.properties.status} == ${modifier.properties.entered}) revert ReentrancyGuard__ReentrantCall();\n`
          code += `        ${modifier.properties.status} = ${modifier.properties.entered};\n`
          code += `        _;\n`
          code += `        ${modifier.properties.status} = ${modifier.properties.notEntered};\n`
        } else if (modifier.originalId === "time-lock") {
          code += `        if (!(${modifier.properties.timeCondition})) revert InvalidInput();\n`
        } else if (modifier.originalId === "multi-sig") {
          code += `        if (!_verifyMultipleSignatures(${modifier.properties.proposalId}, ${modifier.properties.signers})) revert Unauthorized();\n`
        } else {
          code += `        if (!(${modifier.properties.condition})) revert Unauthorized();\n`
        }

        if (modifier.originalId !== "reentrancy-guard") {
          code += `        _;\n`
        }
        code += `    }\n\n`
      })
    }

    // Add constructor
    const constructor = canvasComponents.find((comp) => comp.originalId === "constructor")
    if (constructor || hasERC20 || hasERC721 || hasDAO) {
      code += `    // Constructor\n`
      const constructorParams = constructor?.properties.parameters || ""
      const payable = constructor?.properties.payable ? " payable" : ""

      // Build constructor parameters from templates
      const allConstructorParams = []
      if (constructorParams) allConstructorParams.push(constructorParams)

      if (hasERC20) {
        if (!String(constructorParams).includes("string")) {
          allConstructorParams.push("string memory name", "string memory symbol")
        }
      }

      if (hasERC721) {
        if (!String(constructorParams).includes("string")) {
          allConstructorParams.push("string memory name", "string memory symbol")
        }
      }

      const finalParams = allConstructorParams.join(", ")
      code += `    constructor(${finalParams})${payable}`

      // Add parent constructor calls
      const parentCalls = []
      if (hasERC20) {
        const token = templates.find((t) => t.originalId === "erc20-advanced")
        parentCalls.push(`ERC20("${token?.properties.name || "name"}", "${token?.properties.symbol || "symbol"}")`)
      }
      if (hasERC721) {
        const nft = templates.find((t) => t.originalId === "erc721")
        parentCalls.push(`ERC721("${nft?.properties.name || "name"}", "${nft?.properties.symbol || "symbol"}")`)
      }
      if (hasDAO) {
        const dao = templates.find((t) => t.originalId === "dao-voting")
        parentCalls.push(`Governor("${dao?.properties.name || "DAO"}")`)
        parentCalls.push(
          `GovernorSettings(${dao?.properties.votingDelay || "1"}, ${dao?.properties.votingPeriod || "50400"}, ${dao?.properties.proposalThreshold || "0"})`,
        )
      }

      if (parentCalls.length > 0) {
        code += ` ${parentCalls.join(" ")}`
      }

      code += ` {\n`

      // Add initialization code
      if (hasERC20) {
        const token = templates.find((t) => t.originalId === "erc20-advanced")
        if (token?.properties.mintable) {
          code += `        _mint(msg.sender, ${token.properties.supply} * 10**decimals());\n`
        }
      }

      if (constructor?.properties.initCode) {
        code += `        ${constructor.properties.initCode}\n`
      }

      code += `    }\n\n`
    }

    // Add functions
    const functions = canvasComponents.filter(
      (comp) => comp.type === "function" && !["constructor"].includes(comp.originalId),
    )

    if (functions.length > 0) {
      code += `    // Functions\n`
      functions.forEach((func) => {
        const payableKeyword = func.properties.payable ? " payable" : ""
        const viewKeyword = func.properties.view ? " view" : ""
        const pureKeyword = func.properties.pure ? " pure" : ""
        const returnsKeyword = func.properties.returns ? ` returns (${func.properties.returns})` : ""
        const modifiersList = func.properties.modifiers ? ` ${func.properties.modifiers}` : ""

        code += `    function ${func.properties.name}(${func.properties.parameters || ""}) ${func.properties.visibility
          }${viewKeyword}${pureKeyword}${payableKeyword}${returnsKeyword}${modifiersList} {\n`

        if (func.originalId === "payable-function") {
          code += `        if (msg.value < ${func.properties.minAmount}) revert InsufficientBalance();\n`
          code += `        emit PaymentReceived(msg.sender, msg.value);\n`
        } else if (func.originalId === "batch-transfer") {
          code += `        if (${func.properties.arrayType}.length != ${func.properties.valueType}.length) revert InvalidInput();\n`
          code += `        if (${func.properties.arrayType}.length > ${func.properties.maxBatchSize}) revert InvalidInput();\n`
          code += `        \n`
          code += `        for (uint256 i = 0; i < ${func.properties.arrayType}.length; i++) {\n`
          code += `            // Batch transfer logic\n`
          code += `            if (${func.properties.checkSuccess}) {\n`
          code += `                // Add success verification\n`
          code += `            }\n`
          code += `        }\n`
        } else if (func.originalId === "view-function") {
          code += `        ${func.properties.functionBody || "return 0;"}\n`
        }

        if (func.properties.functionBody && func.originalId !== "view-function") {
          code += `        ${func.properties.functionBody}\n`
        } else if (!func.properties.functionBody && func.originalId === "payable-function") {
          // Already handled above
        } else if (!func.properties.functionBody && func.originalId !== "view-function") {
          code += `        // TODO: Implement function logic\n`
        }

        code += `    }\n\n`
      })
    }

    code += `}`

    setGeneratedCode(code)
    setIsCodeModalOpen(true)
  }

  // Parse Solidity contract function (keeping existing implementation)
  const parseSolidityContract = (solidityCode: string) => {
    try {
      setCanvasComponents([])

      const lines = solidityCode.split("\n")
      let currentY = 50
      const spacing = 150

      const patterns = {
        stateVariable: /^\s*(.*?)\s+(public|private|internal|external)?\s+(\w+)\s*(?:=\s*([^;]+))?;/,
        function:
          /^\s*function\s+(\w+)\s*$$(.*?)$$(?:\s+(public|private|internal|external))?\s*(?:(pure|view|payable))?\s*(?:returns\s*$$(.*?)$$)?\s*{/,
        event: /^\s*event\s+(\w+)\s*$$(.*?)$$;/,
        mapping: /^\s*mapping\s*$$(\w+)\s*=>\s*(\w+)$$\s*(public|private|internal|external)?\s+(\w+);/,
        modifier: /^\s*modifier\s+(\w+)\s*$$(.*?)$$\s*{/,
        constructor: /^\s*constructor\s*$$(.*?)$$\s*{/,
      }

      lines.forEach((line) => {
        let match
        let component: ComponentType | null = null

        if ((match = line.match(patterns.stateVariable))) {
          component = {
            id: generateId(),
            originalId: "state-variable",
            type: "variable",
            name: "State Variable",
            icon: <Database className="w-5 h-5" />,
            color: "bg-green-100 border-green-300",
            x: 50,
            y: currentY,
            properties: {
              dataType: match[1].trim(),
              visibility: match[2] || "internal",
              name: match[3],
              defaultValue: match[4] || "",
            },
          }
        } else if ((match = line.match(patterns.function))) {
          component = {
            id: generateId(),
            originalId: "function",
            type: "function",
            name: "Function",
            icon: <Zap className="w-5 h-5" />,
            color: "bg-purple-100 border-purple-300",
            x: 50,
            y: currentY,
            properties: {
              name: match[1],
              parameters: match[2],
              visibility: match[3] || "public",
              modifiers: match[4] || "",
              returns: match[5] || "",
              functionBody:""
            },
          }
        } else if ((match = line.match(patterns.event))) {
          component = {
            id: generateId(),
            originalId: "event",
            type: "event",
            name: "Event",
            icon: <Radio className="w-5 h-5" />,
            color: "bg-yellow-100 border-yellow-300",
            x: 50,
            y: currentY,
            properties: {
              name: match[1],
              parameters: match[2],
            },
          }
        } else if ((match = line.match(patterns.mapping))) {
          component = {
            id: generateId(),
            originalId: "mapping",
            type: "variable",
            name: "Mapping",
            icon: <Map className="w-5 h-5" />,
            color: "bg-indigo-100 border-indigo-300",
            x: 50,
            y: currentY,
            properties: {
              keyType: match[1],
              valueType: match[2],
              visibility: match[3] || "internal",
              name: match[4],
            },
          }
        } else if ((match = line.match(patterns.constructor))) {
          component = {
            id: generateId(),
            originalId: "constructor",
            type: "function",
            name: "Constructor",
            icon: <Cpu className="w-5 h-5" />,
            color: "bg-blue-100 border-blue-300",
            x: 50,
            y: currentY,
            properties: {
              parameters: match[1],
              visibility: "public",
            },
          }
        }

        if (component) {
          setCanvasComponents((prev) => [...prev, component as ComponentType])
          currentY += spacing
        }
      })
    } catch (error) {
      console.error("Error parsing Solidity contract:", error)
    }
  }

  // Filter components by selected category
  const filteredComponents = componentLibrary.filter(
    (component) => selectedCategory === "all" || component.category === selectedCategory,
  )

  return (
    <div className="min-h-screen bg-black flex overflow-hidden">
      {/* Component Library Sidebar */}
      <div className="w-80 bg-black/90 backdrop-blur-xl border-r border-gray-800/50 flex flex-col h-screen pt-25">
        {/* Header section - fixed height */}
        <div className="p-6 border-b border-gray-800/50 flex-shrink-0">
          <div className="bg-gradient-to-r from-purple-400/20 to-violet-400/20 backdrop-blur-sm rounded-xl p-4 border border-purple-400/30">
            <h2 className="text-xl font-bold text-white mb-1">Smart Contract Components</h2>
            <p className="text-sm text-gray-300">Drag components to canvas</p>
          </div>
        </div>

        {/* Category filter - fixed height */}
        <div className="p-4 border-b border-gray-800/50 relative flex-shrink-0">
          <button
            onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
            className="w-full flex justify-between items-center px-4 py-3 bg-gray-800/50 text-gray-300 rounded-lg border border-gray-700/50 hover:bg-gray-700/50 transition-colors"
          >
            <span>
              {categories.find(c => c.id === selectedCategory)?.name || "All Categories"}
            </span>
            <ChevronDown className={`w-4 h-4 transition-transform ${isCategoryDropdownOpen ? "transform rotate-180" : ""}`} />
          </button>

          {isCategoryDropdownOpen && (
            <div className="absolute z-10 mt-2 w-full bg-gray-800 rounded-lg shadow-lg border border-gray-700/50 overflow-hidden">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => {
                    setSelectedCategory(category.id)
                    setIsCategoryDropdownOpen(false)
                  }}
                  className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 transition-colors ${selectedCategory === category.id
                      ? "bg-purple-500/20 text-purple-300"
                      : "text-gray-300 hover:bg-gray-700"
                    }`}
                >
                  {category.icon}
                  <span>{category.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Component list - scrollable area */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-3">
            {filteredComponents.map((component) => (
              <div
                key={component.id}
                draggable
                onDragStart={(e) =>
                  handleDragStart(e, {
                    ...component,
                    originalId: component.id,
                    x: undefined,
                    y: undefined,
                    properties: component.properties || {} // Ensure properties exists
                  } as ComponentType) // Type assertion to ensure compatibility
                }
                className="group p-4 rounded-xl bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 cursor-move hover:bg-gray-800/50 hover:border-purple-400/30 transition-all duration-300 transform hover:scale-105"
              >
                <div className="flex items-center space-x-3">
                  <div className="text-purple-400 group-hover:text-purple-300 transition-colors">{component.icon}</div>
                  <div>
                    <div className="font-semibold text-sm text-white">{component.name}</div>
                    <div className="text-xs text-gray-400">{component.description}</div>
                    <div className="text-xs text-gray-500">Gas: ~{component.gasEstimate}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>


      {/* Main Area */}
      <div className="flex-1 flex flex-col pt-25">
        {/* Header */}
        <div className="bg-black/90 backdrop-blur-xl p-6 border-b border-gray-800/50">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">
                Visual Smart Contract Builder
              </h1>
              <p className="text-sm text-gray-400 mt-1">Build smart contracts visually without code</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={generateSolidityCode}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-violet-500 text-white rounded-xl hover:from-purple-600 hover:to-violet-600 transition-all duration-300 shadow-lg hover:shadow-purple-500/25 font-medium backdrop-blur-sm border border-purple-400/30"
              >
                Generate Code
              </button>
              <button
                onClick={() => {
                  setCanvasComponents([])
                  setSelectedComponent(null)
                  setGeneratedCode("")
                }}
                className="px-6 py-3 bg-gradient-to-r from-red-500/80 to-red-600/80 text-white rounded-xl hover:from-red-600/80 hover:to-red-700/80 transition-all duration-300 shadow-lg hover:shadow-red-500/25 font-medium backdrop-blur-sm border border-red-400/30"
              >
                Clear All
              </button>
              <button
                onClick={() => setIsImportModalOpen(true)}
                className="px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-300 shadow-lg font-medium backdrop-blur-sm border border-gray-600/50"
              >
                Import Contract
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex">
          {/* Canvas */}
          <div
            className="flex-1 relative bg-gradient-to-br from-gray-900 via-black to-gray-900 overflow-hidden"
            onDrop={handleCanvasDrop}
            onDragOver={handleCanvasDragOver}
            style={{ minHeight: "600px" }}
          >
            {/* Grid pattern */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: "radial-gradient(circle, #334155 1px, transparent 1px)",
                backgroundSize: "30px 30px",
              }}
            />

            {/* Canvas Components */}
            {canvasComponents.map((component) => (
              <div
                key={component.id}
                onClick={() => handleComponentClick(component)}
                className={`absolute p-4 rounded-xl backdrop-blur-sm border cursor-pointer transition-all duration-300 hover:scale-105 ${selectedComponent?.id === component.id
                    ? "ring-2 ring-purple-400/50 bg-gray-800/80 border-purple-400/50 shadow-lg shadow-purple-400/25"
                    : "bg-gray-900/70 border-gray-700/50 hover:bg-gray-800/70 hover:border-gray-600/50"
                  }`}
                style={{
                  left: component.x,
                  top: component.y,
                  minWidth: "200px",
                  zIndex: selectedComponent?.id === component.id ? 10 : 1,
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <span className="text-purple-400 text-xl">{component.icon}</span>
                    <div>
                      <div className="font-semibold text-sm text-white">{component.name}</div>
                      <div className="text-xs text-gray-400 capitalize">{component.type}</div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removeComponent(component.id)
                    }}
                    className="text-red-400 hover:text-red-300 font-bold text-lg leading-none transition-colors"
                  >
                    ×
                  </button>
                </div>
                <div className="text-xs text-gray-300">
                  {component.type === "variable" && component.originalId === "mapping"
                    ? `${component.properties.name}: ${component.properties.keyType} → ${component.properties.valueType}`
                    : component.type === "function"
                      ? `${component.properties.name}() ${component.properties.visibility}`
                      : component.properties.name || "Click to configure"}
                </div>
              </div>
            ))}

            {/* Empty state */}
            {canvasComponents.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <div className="text-8xl mb-6">🎯</div>
                  <div className="text-2xl font-semibold mb-2 text-white">Start Building</div>
                  <div className="text-lg text-gray-300">
                    Drag components from the sidebar to create your smart contract
                  </div>
                  <div className="text-sm mt-6 bg-gray-900/80 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 max-w-md">
                    <div className="font-medium mb-3 text-purple-400">Quick Start:</div>
                    <div className="text-left space-y-2 text-gray-300">
                      <div>1. Drag a <strong className="text-white">Constructor</strong> to initialize your contract</div>
                      <div>2. Add <strong className="text-white">State Variables</strong> to store data</div>
                      <div>3. Create <strong className="text-white">Functions</strong> for contract logic</div>
                      <div>4. Click <strong className="text-white">Generate Code</strong> to see Solidity</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Properties Panel */}
       {selectedComponent && (
  <div className="w-80 h-[75vh] bg-black/90 backdrop-blur-xl border-l border-gray-800/50 flex flex-col">
    <div className="p-6 border-b border-gray-800/50">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg flex items-center space-x-3 text-white">
          <span className="text-purple-400">{selectedComponent.icon}</span>
          <span>{selectedComponent.name}</span>
        </h3>
        <button
          onClick={() => setSelectedComponent(null)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="text-sm text-gray-400 mt-1 capitalize">{selectedComponent.type}</div>
    </div>
    
    <div className="flex-1 overflow-y-auto min-h-0">
      <div className="p-6 space-y-4">
        {Object.entries(selectedComponent.properties).map(([key, value]) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-300 mb-2 capitalize">
              {key.replace(/([A-Z])/g, " $1").trim()}
            </label>
            {key === "visibility" ? (
              <select
                value={String(value || '')} 
                onChange={(e) => updateComponentProperty(selectedComponent.id, key, e.target.value)}
                className="w-full p-3 bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-lg focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 transition-all text-white"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
                <option value="internal">Internal</option>
                <option value="external">External</option>
              </select>
            ) : key === "dataType" ? (
  <select
    value={String(value || '')} 
    onChange={(e) => updateComponentProperty(selectedComponent.id, key, e.target.value)}
    className="w-full p-3 bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-lg focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 transition-all text-white"
  >
    {getAvailableDataTypes().map(type => (
      <option key={type} value={type}>{type}</option>
    ))}
  </select>
) : key === "keyType" || key === "valueType" ? (
  <select
    value={String(value || '')} 
    onChange={(e) => updateComponentProperty(selectedComponent.id, key, e.target.value)}
    className="w-full p-3 bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-lg focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 transition-all text-white"
  >
    {getAvailableDataTypes().map(type => (
      <option key={type} value={type}>{type}</option>
    ))}
  </select>
): key === "keyType" || key === "valueType" ? (
              <select
                value={String(value || '')} 
                onChange={(e) => updateComponentProperty(selectedComponent.id, key, e.target.value)}
                className="w-full p-3 bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-lg focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 transition-all text-white"
              >
                <option value="address">address</option>
                <option value="uint256">uint256</option>
                <option value="string">string</option>
                <option value="bytes32">bytes32</option>
                <option value="bool">bool</option>
              </select>
            ) : key === "payable" ? (
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(value)}
                  onChange={(e) => updateComponentProperty(selectedComponent.id, key, e.target.checked)}
                  className="w-4 h-4 text-purple-400 bg-gray-900 border-gray-600 rounded focus:ring-purple-400 focus:ring-2"
                />
                <span className="text-sm text-gray-300">Function can receive Ether</span>
              </label>
            ) : key === "functionBody" ? (
              <div className="space-y-3">
                <textarea
                  value={String(value || '')}
                  onChange={(e) => updateComponentProperty(selectedComponent.id, key, e.target.value)}
                  className="w-full p-3 bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-lg focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 transition-all text-white placeholder-gray-500 font-mono text-sm"
                  placeholder="Enter function implementation or use AI generation below"
                  rows={6}
                />
                
                {/* AI Generation Section */}
                <div className="border-t border-gray-700/50 pt-3">
                  <button
                    onClick={() => setShowAiInput(!showAiInput)}
                    className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors mb-3"
                  >
                    <Sparkles className="w-4 h-4" />
                    AI Function Generation
                    <ChevronDown className={`w-4 h-4 transition-transform ${showAiInput ? "rotate-180" : ""}`} />
                  </button>
                  {showAiInput && (
                    <div className="space-y-3">
                      <textarea
                        value={aiRequirements}
                        onChange={(e) => setAiRequirements(e.target.value)}
                        className="w-full p-3 bg-gray-800/50 backdrop-blur-sm border border-gray-600/50 rounded-lg focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 transition-all text-white placeholder-gray-400 text-sm"
                        placeholder="Describe what this function should do... e.g., 'Transfer tokens between addresses with validation' or 'Calculate compound interest based on time period'"
                        rows={3}
                      />
                      <button
                        onClick={generateFunctionBody}
                        disabled={isGeneratingFunction || !aiRequirements.trim()}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-violet-500 text-white rounded-lg hover:from-purple-600 hover:to-violet-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                      >
                        {isGeneratingFunction ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            Generate Function Body
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <input
                type="text"
                value={String(value || '')} 
                onChange={(e) => updateComponentProperty(selectedComponent.id, key, e.target.value)}
                className="w-full p-3 bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-lg focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 transition-all text-white placeholder-gray-500"
                placeholder={`Enter ${key}`}
              />
            )}
          </div>
        ))}

        {/* Component-specific help text */}
        <div className="mt-6 p-4 bg-purple-400/10 backdrop-blur-sm rounded-lg border border-purple-400/20">
          <div className="text-sm text-purple-300">
            <strong>💡 Tip:</strong>
            {selectedComponent.type === "function" &&
              " Functions define the behavior of your contract. Make them external if called by users."}
            {selectedComponent.type === "variable" &&
              " State variables store data permanently on the blockchain."}
            {selectedComponent.type === "event" &&
              " Events let external applications listen to contract activities."}
            {selectedComponent.type === "modifier" &&
              " Modifiers add access control and validation to functions."}
            {selectedComponent.type === "template" && " Templates provide pre-built contract functionality."}
          </div>
        </div>
      </div>
    </div>
  </div>
)}
        </div>

        {/* Code Generation Modal */}
        {isCodeModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-gray-700/50 w-full max-w-4xl max-h-[90vh] flex flex-col">
              <div className="flex justify-between items-center p-6 border-b border-gray-700/50">
                <div>
                  <h3 className="font-bold text-xl text-white">Generated Solidity Code</h3>
                  <p className="text-sm text-gray-400">Ready to deploy smart contract</p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={copyToClipboard}
                    className="px-4 py-2 bg-purple-500/80 backdrop-blur-sm text-white rounded-lg hover:bg-purple-600/80 transition-all font-medium border border-purple-400/30 flex items-center gap-2"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? "Copied!" : "Copy Code"}
                  </button>
                  <button
                    onClick={() => setIsCodeModalOpen(false)}
                    className="px-4 py-2 bg-gray-700/80 backdrop-blur-sm text-white rounded-lg hover:bg-gray-600/80 transition-all font-medium border border-gray-600/50"
                  >
                    Close
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-auto p-6">
                <pre className="text-sm font-mono text-green-400 whitespace-pre-wrap leading-relaxed bg-black/50 p-4 rounded-lg border border-gray-800/50">
                  {generatedCode}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Import Modal */}
        {isImportModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-gray-700/50 w-full max-w-2xl">
              <div className="p-6 border-b border-gray-700/50">
                <h3 className="text-xl font-bold text-white">Import Solidity Contract</h3>
              </div>
              <div className="p-6 space-y-4">
                <textarea
                  className="w-full h-64 p-4 bg-black/50 backdrop-blur-sm border border-gray-700/50 rounded-lg font-mono text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50"
                  placeholder="Paste your Solidity contract code here..."
                  onChange={(e) => parseSolidityContract(e.target.value)}
                />
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setIsImportModalOpen(false)}
                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setIsImportModalOpen(false)}
                    className="px-4 py-2 bg-purple-500/80 backdrop-blur-sm text-white rounded-lg hover:bg-purple-600/80 transition-all border border-purple-400/30"
                  >
                    Import
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default VisualSmartContractBuilder
