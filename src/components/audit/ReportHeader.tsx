"use client"
import type React from "react"
import type { FileItem } from "@/types/editor"
import type { AuditResult } from "@/app/ide/audit/page"

interface ReportHeaderProps {
  file: FileItem | null
  currentReport: AuditResult | null
}

const ReportHeader: React.FC<ReportHeaderProps> = ({ file, currentReport }) => {
  if (!file || !currentReport) return null

  return (
    <div className="mb-8 bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-xl p-6 shadow-lg">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-900/50 p-2 rounded-lg">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white">Code Analysis Report</h1>
          </div>
          <div className="print:hidden">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                />
              </svg>
              Print Report
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-gray-700 pt-4 mt-2">
          <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700">
            <p className="text-xs uppercase tracking-wider text-purple-300 mb-1">File Name</p>
            <p className="font-medium text-white">{file.name}</p>
          </div>
          <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700">
            <p className="text-xs uppercase tracking-wider text-purple-300 mb-1">Report Type</p>
            <p className="font-medium text-white capitalize">{currentReport.type}</p>
          </div>
          <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700">
            <p className="text-xs uppercase tracking-wider text-purple-300 mb-1">Generated On</p>
            <p className="font-medium text-white">{currentReport.timestamp.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReportHeader
