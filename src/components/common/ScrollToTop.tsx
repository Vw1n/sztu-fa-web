import { useLayoutEffect, type FC } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop: FC = () => {
  const { pathname, hash } = useLocation();

  useLayoutEffect(() => {
    // 首页锚点由 Header 负责定位，避免先跳到顶部再滚到目标区块。
    if (pathname === '/' && hash) return;

    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname, hash]);

  return null;
};

export default ScrollToTop;
