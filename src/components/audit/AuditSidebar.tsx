"use client"
import { useState, useEffect } from "react"
import type { FileItem } from "@/types/editor"
import type { AuditResult } from "@/app/ide/audit/page"

interface AuditSidebarProps {
  selectedFile: FileItem | null
  onGenerateAudit: () => void
  onGenerateSuggestions: () => void
  onGenerateAnalytics: () => void
  auditResults: AuditResult[]
  currentReport: AuditResult | null
  onReportSelect: (report: AuditResult) => void
  isGenerating: boolean
  generatingType: string
}

interface SecurityIssue {
  severity: 'critical' | 'high' | 'medium' | 'low';
  // Add other properties as needed based on your actual data structure
}

interface Suggestion {
  id: string;
  description: string;
  // Add other properties as needed
}

interface Analytics {
  codeQuality?: {
    overall: number;
  };
  complexity?: {
    score: string | number;
  };
  metrics?: {
    linesOfCode: number;
  };
}

interface AuditData {
  securityIssues: SecurityIssue[];
}

interface SuggestionsData {
  suggestions: Suggestion[];
}

interface AnalyticsData {
  analytics: Analytics;
}


const AuditSidebar = ({
  selectedFile,
  onGenerateAudit,
  onGenerateSuggestions,
  onGenerateAnalytics,
  auditResults,
  currentReport,
  onReportSelect,
  isGenerating,
  generatingType,
}: AuditSidebarProps) => {
  const [formattedDate, setFormattedDate] = useState("")

  useEffect(() => {
    setFormattedDate(new Date().toLocaleDateString())
  }, [])

  if (!selectedFile) {
    return (
      <div className="w-80 bg-black border-l border-gray-800 p-6 pt-30">
        <div className="text-center text-gray-400">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gray-900 flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.054-.382-3.016z"
              />
            </svg>
          </div>
          <p className="text-sm font-medium">Select a file to start audit</p>
          <p className="text-xs text-gray-500 mt-1">Choose a file from the explorer</p>
        </div>
      </div>
    )
  }

  const getFileLanguage = (filename: string): string => {
    const ext = filename.split(".").pop()?.toLowerCase()
    switch (ext) {
      case "sol":
        return "solidity"
      case "rs":
        return "rust"
      case "js":
        return "javascript"
      case "ts":
        return "typescript"
      default:
        return "unknown"
    }
  }

  const language = getFileLanguage(selectedFile.name)
  const fileResults = auditResults.filter((result) => result.fileId === selectedFile.id)

  const getReportIcon = (type: string) => {
    switch (type) {
      case "audit":
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.054-.382-3.016z"
            />
          </svg>
        )
      case "suggestions":
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
        )
      case "analytics":
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        )
      default:
        return null
    }
  }

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
  }

 return( <div className="w-80 bg-black border-l border-gray-800 p-6 overflow-y-auto pt-30">
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.054-.382-3.016z"
              />
            </svg>
          </div>
          <h2 className="text-white font-semibold text-lg">AI Audit Tools</h2>
        </div>
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-gray-400">Language:</span>
          <span className="text-white capitalize font-medium px-2 py-1 bg-gray-800 rounded-md border border-gray-700">
            {language}
          </span>
        </div>
      </div>

      {/* AI Actions */}
      <div className="space-y-4 mb-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-800 to-gray-700 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <h3 className="text-white font-semibold text-base">Generate Reports</h3>
            <p className="text-gray-400 text-xs">AI-powered code analysis</p>
          </div>
        </div>

        <button
          onClick={onGenerateAudit}
          disabled={isGenerating}
          className="w-full px-4 py-3 bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 disabled:from-gray-900 disabled:to-gray-800 disabled:cursor-not-allowed text-white text-sm rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 font-medium shadow-md hover:shadow-lg border border-gray-700"
        >
          {isGenerating && generatingType === "audit" ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
                <path
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A8.004 8.004 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  className="opacity-75"
                ></path>
              </svg>
              <span>Generating...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.054-.382-3.016z"
                />
              </svg>
              <span>Generate Audit Report</span>
            </>
          )}
        </button>

        <button
          onClick={onGenerateSuggestions}
          disabled={isGenerating}
          className="w-full px-4 py-3 bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 disabled:from-gray-900 disabled:to-gray-800 disabled:cursor-not-allowed text-white text-sm rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 font-medium shadow-md hover:shadow-lg border border-gray-700"
        >
          {isGenerating && generatingType === "suggestions" ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
                <path
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A8.004 8.004 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  className="opacity-75"
                ></path>
              </svg>
              <span>Generating...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
              <span>Generate Suggestions</span>
            </>
          )}
        </button>

        <button
          onClick={onGenerateAnalytics}
          disabled={isGenerating}
          className="w-full px-4 py-3 bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 disabled:from-gray-900 disabled:to-gray-800 disabled:cursor-not-allowed text-white text-sm rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 font-medium shadow-md hover:shadow-lg border border-gray-700"
        >
          {isGenerating && generatingType === "analytics" ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
                <path
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A8.004 8.004 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  className="opacity-75"
                ></path>
              </svg>
              <span>Generating...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <span>Generate Analytics</span>
            </>
          )}
        </button>
      </div>

      {/* Report History */}
      <div className="mb-8">
        <h3 className="text-gray-300 text-sm font-semibold tracking-wide mb-4">Report History</h3>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {fileResults.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-900 flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <p className="text-xs font-medium">No reports generated yet</p>
              <p className="text-xs text-gray-500 mt-1">Generate your first report above</p>
            </div>
          ) : (
            fileResults.map((result, index) => (
              <button
                key={index}
                onClick={() => onReportSelect(result)}
                className={`w-full p-4 rounded-xl text-left transition-all duration-200 border ${
                  currentReport === result
                    ? "bg-gray-800 border-gray-600 shadow-md"
                    : "bg-gray-900/50 hover:bg-gray-800 border-gray-800"
                }`}
              >
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-6 h-6 rounded-md bg-gray-700 flex items-center justify-center">
                    {getReportIcon(result.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white capitalize">{result.type}</span>
                      <span className="text-xs text-gray-400">{formatTimestamp(result.timestamp)}</span>
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-400 ml-9">
                  {result.type === "audit" && `${(result.data as AuditData).securityIssues?.length || 0} issues found`}
                  {result.type === "suggestions" && `${(result.data as SuggestionsData).suggestions?.length || 0} suggestions`}
                  {result.type === "analytics" && `Quality Score: ${(result.data as AnalyticsData).analytics?.codeQuality?.overall || 0}%`}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Quick Stats */}
      {currentReport && (
        <div className="mb-8">
          <h3 className="text-gray-300 text-sm font-semibold tracking-wide mb-4">Quick Stats</h3>
          <div className="bg-gray-900/50 rounded-xl p-4 space-y-3 border border-gray-800">
            {currentReport.type === "audit" && (
              <>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Total Issues:</span>
                  <span className="text-white font-medium">{(currentReport.data as AuditData).securityIssues?.length || 0}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Critical:</span>
                  <span className="text-gray-300 font-medium">
                    {(currentReport.data as AuditData).securityIssues?.filter((i: SecurityIssue) => i.severity === "critical").length || 0}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">High:</span>
                  <span className="text-gray-300 font-medium">
                    {(currentReport.data as AuditData).securityIssues?.filter((i: SecurityIssue) => i.severity === "high").length || 0}
                  </span>
                </div>
              </>
            )}
            {currentReport.type === "suggestions" && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Suggestions:</span>
                <span className="text-white font-medium">{(currentReport.data as SuggestionsData).suggestions?.length || 0}</span>
              </div>
            )}
            {currentReport.type === "analytics" && (
              <>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Overall Quality:</span>
                  <span className="text-gray-300 font-medium">
                    {(currentReport.data as AnalyticsData).analytics?.codeQuality?.overall || 0}%
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Complexity:</span>
                  <span className="text-gray-300 font-medium capitalize">
                    {(currentReport.data as AnalyticsData).analytics?.complexity?.score || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Lines of Code:</span>
                  <span className="text-white font-medium">
                    {(currentReport.data as AnalyticsData).analytics?.metrics?.linesOfCode || 0}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* AI Model Info */}
      <div className="mb-8 bg-gray-900/30 rounded-xl p-4 border border-gray-800">
        <h4 className="text-gray-300 text-xs font-semibold tracking-wide mb-3">AI MODEL INFO</h4>
        <div className="text-xs text-gray-400 space-y-2">
          <div className="flex justify-between">
            <span>Model:</span>
            <span className="text-gray-300">GPT-4 Turbo</span>
          </div>
          <div className="flex justify-between">
            <span>Mode:</span>
            <span className="text-gray-300">Security Audit</span>
          </div>
          <div className="flex justify-between">
            <span>Language:</span>
            <span className="text-gray-300 capitalize">{language}</span>
          </div>
          <div className="flex justify-between">
            <span>Last Updated:</span>
            <span className="text-gray-300">{formattedDate || new Date().toISOString().split("T")[0]}</span>
          </div>
        </div>
      </div>

      {/* Status Section */}
      <div className="mt-8">
        <h4 className="text-gray-300 text-xs font-semibold tracking-wide mb-3">STATUS</h4>
        <div className="bg-black rounded-xl p-4 text-xs text-gray-400 font-mono min-h-[80px] max-h-32 overflow-y-auto border border-gray-800">
          {isGenerating ? (
            <div className="text-yellow-400 flex items-center space-x-2">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
                <path
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A8.004 8.004 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  className="opacity-75"
                ></path>
              </svg>
              <span>Generating {generatingType}...</span>
            </div>
          ) : currentReport ? (
            <div className="text-green-400 flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>✓ {currentReport.type} report generated successfully</span>
            </div>
          ) : (
            <div className="text-gray-500 flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.054-.382-3.016z"
                />
              </svg>
              <span>Ready to generate AI reports...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AuditSidebar