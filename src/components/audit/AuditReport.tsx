// components/audit/AuditReport.tsx
"use client"
import type React from "react"
import type { FileItem } from "@/types/editor"
import type { AuditResult, SecurityIssue, Suggestion, AnalyticsData } from "@/app/ide/audit/page"
import ReportHeader from "./ReportHeader"
import PrintStyles from "./PrintStyles"

interface AuditReportProps {
  file: FileItem | null
  currentReport: AuditResult | null
  isGenerating: boolean
  generatingType: string
}

const AuditReport: React.FC<AuditReportProps> = ({ file, currentReport, isGenerating, generatingType }) => {
  const renderSecurityIssues = (issues: SecurityIssue[]) => (
    <div className="space-y-6 pt-25">
      {issues.map((issue) => (
        <div
          key={issue.id}
          className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-xl p-5 shadow-lg hover:shadow-purple-900/20 transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <span className={`w-3 h-3 rounded-full mr-2 ${getSeverityBullet(issue.severity)}`}></span>
              {issue.title}
            </h3>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${getSeverityColor(issue.severity)}`}>
              {issue.severity.toUpperCase()}
            </span>
          </div>
          <p className="text-gray-300 mb-3">{issue.description}</p>
          {issue.lineNumber && (
            <div className="flex items-center text-purple-300 text-sm mb-3">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Line: {issue.lineNumber}
            </div>
          )}
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <p className="text-purple-300 font-medium mb-2 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              Recommendation
            </p>
            <p className="text-gray-200">{issue.recommendation}</p>
          </div>
        </div>
      ))}
    </div>
  )

  const renderSuggestions = (suggestions: Suggestion[]) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-25">
      {suggestions.map((suggestion) => (
        <div
          key={suggestion.id}
          className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-xl p-5 hover:shadow-purple-900/20 transition-all"
        >
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-lg font-semibold text-white">{suggestion.title}</h3>
            <div className="flex flex-col items-end space-y-2">
              <div
                className={`px-2.5 py-1 rounded-full text-xs font-bold ${getImpactColor(suggestion.impact || "low")}`}
              >
                {(suggestion.impact || "low").toUpperCase()}
              </div>
              <div className="px-2.5 py-1 bg-purple-900/30 text-purple-300 rounded-full text-xs font-medium">
                {(suggestion.type || "general").toString().replace("-", " ").toUpperCase()}
              </div>
            </div>
          </div>
          <p className="text-gray-300 mb-4">{suggestion.description}</p>
          {suggestion.codeExample && (
            <div className="mt-4">
              <div className="flex items-center text-purple-300 text-xs mb-1">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                  />
                </svg>
                CODE EXAMPLE
              </div>
              <pre className="bg-gray-800/50 border border-gray-700 p-3 rounded-lg text-sm text-gray-300 overflow-x-auto">
                {suggestion.codeExample}
              </pre>
            </div>
          )}
        </div>
      ))}
    </div>
  )

  const renderAnalytics = (analytics: AnalyticsData) => {
    const defaultMetrics = {
      complexity: {
        cyclomatic: 0,
        cognitive: 0,
        score: "moderate" as const,
      },
      codeQuality: {
        maintainability: 0,
        readability: 0,
        testability: 0,
        overall: 0,
      },
      metrics: {
        linesOfCode: 0,
        functions: 0,
        variables: 0,
        comments: 0,
        commentRatio: 0,
      },
    }

    const safeAnalytics = {
      ...defaultMetrics,
      ...analytics,
      codeQuality: {
        ...defaultMetrics.codeQuality,
        ...(analytics?.codeQuality || {}),
      },
    }

    const renderScoreBar = (value: number) => {
      const percentage = Math.min(Math.max(value, 0), 100)
      let colorClass = "bg-green-500"
      if (percentage < 40) colorClass = "bg-red-500"
      else if (percentage < 70) colorClass = "bg-yellow-500"

      return (
        <div className="w-full bg-gray-700 rounded-full h-2.5 mt-2">
          <div className={`h-2.5 rounded-full ${colorClass}`} style={{ width: `${percentage}%` }}></div>
        </div>
      )
    }

    return (
      <div className="space-y-6 pt-25">
        {/* Complexity Analysis */}
        <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center border-b border-gray-700 pb-3">
            <svg className="w-5 h-5 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
              />
            </svg>
            Complexity Analysis
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(safeAnalytics.complexity).map(([key, value], index) => (
              <div key={`complexity-${key}-${index}`} className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                <p className="text-xs uppercase tracking-wider text-purple-300 mb-1">{key}</p>
                <p className="text-2xl font-bold text-white">
                  {typeof value === "number" ? value : value.charAt(0).toUpperCase() + value.slice(1)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Code Quality */}
        <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center border-b border-gray-700 pb-3">
            <svg className="w-5 h-5 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            Code Quality
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(safeAnalytics.codeQuality).map(([key, value], index) => (
              <div key={`quality-${key}-${index}`} className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                <p className="text-xs uppercase tracking-wider text-purple-300 mb-1">{key}</p>
                <p className="text-2xl font-bold text-white mb-1">{value}/100</p>
                {renderScoreBar(value)}
              </div>
            ))}
          </div>
        </div>

        {/* Code Metrics */}
        <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center border-b border-gray-700 pb-3">
            <svg className="w-5 h-5 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            Code Metrics
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Object.entries(safeAnalytics.metrics).map(([key, value], index) => (
              <div key={`metrics-${key}-${index}`} className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                <p className="text-xs uppercase tracking-wider text-purple-300 mb-1">
                  {key.replace(/([A-Z])/g, " $1").toLowerCase()}
                </p>
                <p className="text-2xl font-bold text-white">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Gas Optimization */}
        {analytics?.gasOptimization && (
          <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center border-b border-gray-700 pb-3">
              <svg className="w-5 h-5 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Gas Optimization
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                <p className="text-xs uppercase tracking-wider text-purple-300 mb-1">Estimated Gas</p>
                <p className="text-2xl font-bold text-white">{analytics.gasOptimization.estimatedGas}</p>
              </div>
              <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                <p className="text-xs uppercase tracking-wider text-purple-300 mb-1">Optimization Potential</p>
                <p className="text-2xl font-bold text-white">{analytics.gasOptimization.optimizationPotential}%</p>
              </div>
            </div>
            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
              <p className="text-sm font-medium text-purple-300 mb-2 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                Optimization Suggestions
              </p>
              <ul className="space-y-2">
                {analytics.gasOptimization.suggestions.map((suggestion, index) => (
                  <li key={`gas-suggestion-${index}`} className="flex items-start">
                    <span className="text-purple-400 mr-2 mt-1">•</span>
                    <span className="text-gray-300">{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    )
  }

  const getSeverityBullet = (severity: string) => {
    const colors = {
      critical: "bg-red-500 animate-pulse",
      high: "bg-orange-500",
      medium: "bg-yellow-500",
      low: "bg-blue-500",
      info: "bg-gray-500",
    }
    return colors[severity as keyof typeof colors] || colors.info
  }

  const getSeverityColor = (severity: string) => {
    const colors = {
      critical: "bg-red-900/50 text-red-300 border border-red-800",
      high: "bg-orange-900/50 text-orange-300 border border-orange-800",
      medium: "bg-yellow-900/50 text-yellow-300 border border-yellow-800",
      low: "bg-blue-900/50 text-blue-300 border border-blue-800",
      info: "bg-gray-900/50 text-gray-300 border border-gray-800",
    }
    return colors[severity as keyof typeof colors] || colors.info
  }

  const getImpactColor = (impact: string) => {
    const colors = {
      high: "bg-red-900/50 text-red-300 border border-red-800",
      medium: "bg-yellow-900/50 text-yellow-300 border border-yellow-800",
      low: "bg-purple-900/50 text-purple-300 border border-purple-800",
    }
    return colors[impact as keyof typeof colors] || colors.low
  }

  if (!file) {
    return (
      <div className="flex-1 p-6 flex items-center justify-center bg-gray-950 text-gray-500 pt-25">
        <div className="text-center max-w-md">
          <svg
            className="w-12 h-12 mx-auto text-purple-900/50 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-400 mb-1">No File Selected</h3>
          <p className="text-sm">Select a file to view audit reports and analysis</p>
        </div>
      </div>
    )
  }

  if (isGenerating) {
    return (
      <div className="flex-1 p-6 bg-gray-950 flex flex-col items-center justify-center pt-25">
        <div className="relative w-16 h-16 mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-purple-900/50 animate-ping"></div>
          <div className="absolute inset-2 rounded-full border-4 border-purple-500 animate-spin"></div>
        </div>
        <h3 className="text-xl font-medium text-purple-300 mb-1">Generating Report</h3>
        <p className="text-gray-400 text-sm">
          Analyzing {generatingType} for <span className="text-purple-300">{file.name}</span>
        </p>
      </div>
    )
  }

  if (!currentReport) {
    return (
      <div className="flex-1 p-6 bg-gray-950 flex items-center justify-center pt-25">
        <div className="text-center max-w-md">
          <svg
            className="w-12 h-12 mx-auto text-purple-900/50 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-400 mb-1">No Report Generated</h3>
          <p className="text-sm">Use the sidebar options to generate an audit, suggestions, or analytics report</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 p-6 bg-gray-950 overflow-y-auto pt-25">
      <PrintStyles />
      <div className="max-w-6xl mx-auto">
        <ReportHeader file={file} currentReport={currentReport} />

        <div className="space-y-8">
          {currentReport.type === "audit" &&
            "securityIssues" in currentReport.data &&
            renderSecurityIssues(currentReport.data.securityIssues)}
          {currentReport.type === "suggestions" &&
            "suggestions" in currentReport.data &&
            renderSuggestions(currentReport.data.suggestions)}
          {currentReport.type === "analytics" &&
            "analytics" in currentReport.data &&
            renderAnalytics(currentReport.data.analytics)}
        </div>
      </div>
    </div>
  )
}

export default AuditReport
