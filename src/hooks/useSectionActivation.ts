import { useEffect, useRef, useState } from 'react';

export const useSectionActivation = <T extends HTMLElement>() => {
  const ref = useRef<T>(null);
  const [isActive, setIsActive] = useState(
    () => typeof window === 'undefined' || !('IntersectionObserver' in window),
  );

  useEffect(() => {
    if (isActive) return;
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        setIsActive(true);
        observer.disconnect();
      },
      { rootMargin: '400px 0px' },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [isActive]);

  return { ref, isActive };
};
