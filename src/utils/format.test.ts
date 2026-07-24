import { describe, it, expect } from 'vitest';
import { formatMatchScore, formatJerseyNumber } from './format';

describe('前台 UI 工具函数测试', () => {
  describe('formatMatchScore', () => {
    it('正确格式化常规时间比分', () => {
      expect(formatMatchScore(2, 1)).toBe('2 - 1');
      expect(formatMatchScore(0, 0)).toBe('0 - 0');
    });

    it('无比分时显示 VS', () => {
      expect(formatMatchScore(null, null)).toBe('VS');
      expect(formatMatchScore(undefined, 2)).toBe('VS');
    });

    it('支持包含点球大战比分', () => {
      expect(formatMatchScore(1, 1, 4, 3)).toBe('1 - 1 (点球 4-3)');
    });
  });

  describe('formatJerseyNumber', () => {
    it('为有效号码增加 # 前缀', () => {
      expect(formatJerseyNumber(10)).toBe('#10');
      expect(formatJerseyNumber('7')).toBe('#7');
    });

    it('空号码返回连字符', () => {
      expect(formatJerseyNumber(null)).toBe('-');
      expect(formatJerseyNumber('')).toBe('-');
    });
  });
});
