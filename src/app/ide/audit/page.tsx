// app/ide/audit/page.tsx
'use client'
import React, { useState, useCallback } from 'react';
import FileNavigator from '@/components/editor/FileNavigator';
import AuditReport from '@/components/audit/AuditReport';
import AuditSidebar from '@/components/audit/AuditSidebar';
import { useFileStore } from '@/stores/fileStore';
import { querySecurityAudit, queryCodeSuggestions, queryCodeAnalytics } from '@/utils/api';
import { FileItem } from '@/types/editor';

export interface AuditResult {
  type: 'audit' | 'suggestions' | 'analytics';
  data: AuditResultData;
  timestamp: Date;
  fileId: string;
}
export type AuditResultData = 
  | { securityIssues: SecurityIssue[] }
  | { suggestions: Suggestion[] }
  | { analytics: AnalyticsData }

export interface SecurityIssue {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  title: string;
  description: string;
  lineNumber?: number;
  recommendation: string;
  category: string;
}

export interface Suggestion {
  id: string;
  type: 'optimization' | 'best-practice' | 'security' | 'maintainability';
  title: string;
  description: string;
  codeExample?: string;
  impact: 'high' | 'medium' | 'low';
}

export interface AnalyticsData {
  complexity: {
    cyclomatic: number;
    cognitive: number;
    score: 'excellent' | 'good' | 'moderate' | 'complex' | 'very-complex';
  };
  codeQuality: {
    maintainability: number;
    readability: number;
    testability: number;
    overall: number;
  };
  metrics: {
    linesOfCode: number;
    functions: number;
    variables: number;
    comments: number;
    commentRatio: number;
  };
  gasOptimization?: {
    estimatedGas: number;
    optimizationPotential: number;
    suggestions: string[];
  };
}

export default function AuditPage() {
  const {
    files,
    selectedFile,
    setSelectedFile,
    createFile,
    deleteFile
  } = useFileStore();

  const [auditResults, setAuditResults] = useState<AuditResult[]>([]);
  const [currentReport, setCurrentReport] = useState<AuditResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingType, setGeneratingType] = useState<string>('');

  const generateAuditReport = async (file: FileItem): Promise<SecurityIssue[]> => {
    const language = file.extension ?? 'unknown';
    return await querySecurityAudit(file.content, language);
  };

  const generateSuggestions = async (file: FileItem): Promise<Suggestion[]> => {
    const language = file.extension ?? 'unknown';
    return await queryCodeSuggestions(file.content, language);
  };

  const generateAnalytics = async (file: FileItem): Promise<AnalyticsData> => {
    const language = file.extension ?? 'unknown';
    return await queryCodeAnalytics(file.content, language);
  };

  // Action handlers
  const handleGenerateAudit = useCallback(async () => {
    if (!selectedFile) return;
    
    setIsGenerating(true);
    setGeneratingType('audit');
    
    try {
      const securityIssues = await generateAuditReport(selectedFile);
      const auditResult: AuditResult = {
        type: 'audit',
        data: { securityIssues },
        timestamp: new Date(),
        fileId: selectedFile.id
      };
      
      setAuditResults(prev => [...prev, auditResult]);
      setCurrentReport(auditResult);
    } catch (error) {
      console.error('Audit generation failed:', error);
    } finally {
      setIsGenerating(false);
      setGeneratingType('');
    }
  }, [selectedFile]);

  const handleGenerateSuggestions = useCallback(async () => {
    if (!selectedFile) return;
    
    setIsGenerating(true);
    setGeneratingType('suggestions');
    
    try {
      const suggestions = await generateSuggestions(selectedFile);
      const suggestionResult: AuditResult = {
        type: 'suggestions',
        data: { suggestions },
        timestamp: new Date(),
        fileId: selectedFile.id
      };
      
      setAuditResults(prev => [...prev, suggestionResult]);
      setCurrentReport(suggestionResult);
    } catch (error) {
      console.error('Suggestions generation failed:', error);
    } finally {
      setIsGenerating(false);
      setGeneratingType('');
    }
  }, [selectedFile]);

  const handleGenerateAnalytics = useCallback(async () => {
    if (!selectedFile) return;
    
    setIsGenerating(true);
    setGeneratingType('analytics');
    
    try {
      const analytics = await generateAnalytics(selectedFile);
      
      // Ensure codeQuality exists before calculating overall
      if (analytics?.codeQuality) {
        analytics.codeQuality.overall = Math.round(
          (analytics.codeQuality.maintainability + 
           analytics.codeQuality.readability + 
           analytics.codeQuality.testability) / 3
        );
      }
      
      const analyticsResult: AuditResult = {
        type: 'analytics',
        data: { analytics },
        timestamp: new Date(),
        fileId: selectedFile.id
      };
      
      setAuditResults(prev => [...prev, analyticsResult]);
      setCurrentReport(analyticsResult);
    } catch (error) {
      console.error('Analytics generation failed:', error);
    } finally {
      setIsGenerating(false);
      setGeneratingType('');
    }
  }, [selectedFile]);

  // Handle file selection - ensure it's synchronized across pages
  const handleFileSelect = useCallback((file: FileItem) => {
    setSelectedFile(file);
  }, [setSelectedFile]);

  // Handle file creation with proper extension detection
  const handleFileCreate = useCallback((name: string) => {
    const extension = name.split('.').pop()?.toLowerCase() || '';
    const language = getLanguageFromExtension(extension);
    
    createFile(name, language);
  }, [createFile]);

  return (
    <div className="flex h-full">
      <FileNavigator
        files={files}
        selectedFile={selectedFile}
        onFileSelect={handleFileSelect}
        onFileCreate={handleFileCreate}
        onFileDelete={deleteFile}
      />
      <AuditReport
        file={selectedFile}
        currentReport={currentReport}
        isGenerating={isGenerating}
        generatingType={generatingType}
      />
      <AuditSidebar
        selectedFile={selectedFile}
        onGenerateAudit={handleGenerateAudit}
        onGenerateSuggestions={handleGenerateSuggestions}
        onGenerateAnalytics={handleGenerateAnalytics}
        auditResults={auditResults}
        currentReport={currentReport}
        onReportSelect={setCurrentReport}
        isGenerating={isGenerating}
        generatingType={generatingType}
      />
    </div>
  );
}

// Helper function to determine language from file extension
function getLanguageFromExtension(extension: string): string {
  switch (extension) {
    case 'sol':
      return 'solidity';
    case 'js':
      return 'javascript';
    case 'ts':
      return 'typescript';
    case 'rs':
      return 'rust';
    case 'json':
      return 'json';
    case 'css':
      return 'css';
    case 'html':
      return 'html';
    default:
      return 'text';
  }
}