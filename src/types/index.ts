export interface Component {
  id: string;
  type: string;
  category: string;
  name: string;
  icon: React.ReactElement;
  color: string;
  description: string;
  gasEstimate: number;
properties: Record<string, string | number | boolean | object>;
}

export interface SecurityIssue {
  type: string;
  message: string;
  severity: 'high' | 'medium' | 'low';
}

export interface GasEstimates {
  deployment?: number;
  functions?: number;
  storage?: number;
}

export interface Connection {
  from: string;
  to: string;
}

export interface CanvasState {
  canvasComponents: Component[];
  connections: Connection[];
  timestamp: number;
}