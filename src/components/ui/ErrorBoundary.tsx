'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  name?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`[ErrorBoundary:${this.props.name || 'Component'}] Caught error:`, error, errorInfo);
  }

  public reset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError && this.state.error) {
      if (typeof this.props.fallback === 'function') {
        return this.props.fallback(this.state.error, this.reset);
      }
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-6 rounded-2xl border-2 border-[#1A3629] bg-[#FFFDF9] shadow-[3px_3px_0px_#1A3629] text-center my-4 flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-xl border-2 border-[#1A3629] bg-[#FEF2F2] flex items-center justify-center text-red-600">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-cabinet font-bold text-sm text-[#1A3629]">
              {this.props.name ? `${this.props.name} encountered an issue` : 'Component Glitch'}
            </h4>
            <p className="text-xs font-mono text-[#2C4A3B] mt-0.5 max-w-sm mx-auto">
              {this.state.error.message || 'An unexpected rendering error occurred.'}
            </p>
          </div>
          <button
            type="button"
            onClick={this.reset}
            className="px-4 py-1.5 rounded-full border-2 border-[#1A3629] bg-[#F4F0EA] text-[#1A3629] hover:bg-[#1A3629] hover:text-[#FFFDF9] font-mono font-bold text-xs shadow-[2px_2px_0px_#1A3629] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer inline-flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
