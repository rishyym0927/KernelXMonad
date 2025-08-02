"use client"
import type React from "react"

const PrintStyles: React.FC = () => {
  return (
    <style jsx global>{`
      @media print {
        body {
          font-family: 'Times New Roman', Times, serif;
          color: #000;
          background: #fff;
        }
        
        .pt-25 {
          padding-top: 0 !important;
        }
        
        @page {
          margin: 1.5cm;
          size: portrait;
        }
        
        h1, h2, h3, h4, h5, h6 {
          page-break-after: avoid;
          page-break-inside: avoid;
          color: black !important;
        }
        
        img, svg {
          page-break-inside: avoid;
        }
        
        .print:hidden {
          display: none !important;
        }
        
        .bg-white, .bg-gray-50, .bg-gray-900\\/80, .bg-gray-800\\/50, .bg-gray-950 {
          background-color: white !important;
          border-color: #ddd !important;
          backdrop-filter: none !important;
        }
        
        .text-gray-800, .text-gray-700, .text-gray-600, .text-white, .text-gray-300, .text-gray-200, .text-purple-300 {
          color: #000 !important;
        }
        
        .text-gray-500, .text-gray-400 {
          color: #444 !important;
        }
        
        .shadow-sm, .shadow-md, .shadow-lg, .shadow-purple-900\\/20 {
          box-shadow: none !important;
        }
        
        .rounded-lg, .rounded-md, .rounded-full, .rounded-xl {
          border-radius: 0 !important;
        }
        
        /* Add page numbers */
        @page {
          @bottom-right {
            content: "Page " counter(page) " of " counter(pages);
          }
        }
      }
    `}</style>
  )
}

export default PrintStyles
