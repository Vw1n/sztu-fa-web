import { useEffect, useState } from 'react';

const appendRetryToken = (url: string): string => {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}image_retry=${Date.now()}`;
};

/**
 * 上传完成后 CDN 可能短暂返回旧的 404。首次失败时绕过缓存重试一次，
 * 并在业务 URL 改变时恢复加载状态，避免错误状态一直残留到下一次上传。
 */
export const useResilientImage = (url: string | null | undefined) => {
  const normalizedUrl = url || '';
  const [src, setSrc] = useState(normalizedUrl);
  const [retryCount, setRetryCount] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setSrc(normalizedUrl);
    setRetryCount(0);
    setFailed(false);
  }, [normalizedUrl]);

  const onError = () => {
    if (!normalizedUrl || retryCount >= 1) {
      setFailed(true);
      return;
    }

    setRetryCount(1);
    setSrc(appendRetryToken(normalizedUrl));
  };

  return { src, failed, onError };
};
