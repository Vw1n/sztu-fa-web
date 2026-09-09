/**
 * PredictionPageState — 统一四态渲染
 *
 * loading -> 加载文案
 * error   -> 错误信息 + 重试按钮
 * empty   -> 空数据提示
 * ready   -> 渲染 children
 */

import React from 'react';
import type { PredictionPagePhase } from '../prediction.types';

export interface PredictionPageStateProps {
  phase: PredictionPagePhase;
  error: string | null;
  onRetry: () => void;
  loadingText?: string;
  emptyText?: string;
  children?: React.ReactNode;
}

export const PredictionPageState: React.FC<PredictionPageStateProps> = ({
  phase,
  error,
  onRetry,
  loadingText = '加载比赛列表中...',
  emptyText = '暂无相关比赛数据',
  children,
}) => {
  if (phase === 'loading') {
    return <div className="loadingContainer">{loadingText}</div>;
  }

  if (phase === 'error') {
    return (
      <div className="errorContainer">
        <p>{error || '加载失败'}</p>
        <button type="button" className="retryBtn" onClick={onRetry}>
          重试
        </button>
      </div>
    );
  }

  if (phase === 'empty') {
    return <div className="emptyContainer">{emptyText}</div>;
  }

  return <>{children}</>;
};
