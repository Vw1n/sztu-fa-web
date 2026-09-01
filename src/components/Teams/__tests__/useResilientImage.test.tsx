import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useResilientImage } from '../useResilientImage';

describe('useResilientImage', () => {
  it('首次加载失败时添加查询参数绕过缓存重试', () => {
    vi.spyOn(Date, 'now').mockReturnValue(123456);
    const { result } = renderHook(() => useResilientImage('https://assets.example/logo.webp'));

    act(() => result.current.onError());

    expect(result.current.src).toBe('https://assets.example/logo.webp?image_retry=123456');
    expect(result.current.failed).toBe(false);
  });

  it('重试仍失败时显示失败状态，并在 URL 更新后恢复', () => {
    const { result, rerender } = renderHook(
      ({ url }) => useResilientImage(url),
      { initialProps: { url: 'https://assets.example/old.webp' } },
    );

    act(() => result.current.onError());
    act(() => result.current.onError());
    expect(result.current.failed).toBe(true);

    rerender({ url: 'https://assets.example/new.webp' });
    expect(result.current.src).toBe('https://assets.example/new.webp');
    expect(result.current.failed).toBe(false);
  });
});
