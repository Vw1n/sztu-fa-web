import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const revealSelectors = [
  '.aboutImageWrapper',
  '.aboutText',
  '.aboutStats .statItem',
  '.activityCard',
  '.teamSearch',
  '.refreshButton',
  '.teamCard',
  '.matchesTabs',
  '.season-selector-container',
  '.matchCard',
  '.standingsContainer',
  '.scorerBoard',
  '.pageHeader',
  '.noticeBanner',
  '.predictionCard',
  '.leaderboardCard',
  '.userProfileCard',
  '.historyTableContainer',
  '.authCard',
  '.footerTop',
].join(',');

const parallaxSelectors = '.aboutImageWrapper, .activityImageWrapper';

const MotionEffects: React.FC = () => {
  const progressRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) return;

    document.documentElement.classList.add('motion-runtime');
    const observed = new WeakSet<Element>();
    let parallaxItems: HTMLElement[] = [];
    let decorateFrame = 0;
    let scrollFrame = 0;

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    }, {
      rootMargin: '0px 0px -10% 0px',
      threshold: 0.08,
    });

    const decorate = () => {
      document.querySelectorAll<HTMLElement>('.sectionHeader').forEach((element) => {
        if (observed.has(element)) return;
        observed.add(element);
        element.classList.add('motion-heading');
        revealObserver.observe(element);
      });

      document.querySelectorAll<HTMLElement>(revealSelectors).forEach((element, index) => {
        if (observed.has(element)) return;
        observed.add(element);
        element.classList.add('motion-reveal');
        element.style.setProperty('--motion-delay', `${Math.min(index % 4, 3) * 85}ms`);
        revealObserver.observe(element);
      });

      document.querySelectorAll<HTMLElement>(parallaxSelectors).forEach((element) => {
        element.classList.add('motion-parallax');
      });
      parallaxItems = Array.from(document.querySelectorAll<HTMLElement>(parallaxSelectors));

      document.querySelectorAll<HTMLElement>('.app, .pageLayout').forEach((element) => {
        window.requestAnimationFrame(() => element.classList.add('motion-page-ready'));
      });
    };

    const scheduleDecorate = () => {
      window.cancelAnimationFrame(decorateFrame);
      decorateFrame = window.requestAnimationFrame(decorate);
    };

    const updateScrollEffects = () => {
      scrollFrame = 0;
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0;
      progressRef.current?.style.setProperty('--scroll-progress', String(progress));

      const mobile = window.innerWidth <= 768;
      const strength = mobile ? 0.018 : 0.045;
      parallaxItems.forEach((element) => {
        const rect = element.getBoundingClientRect();
        if (rect.bottom < -100 || rect.top > window.innerHeight + 100) return;
        const offset = (rect.top + rect.height / 2 - window.innerHeight / 2) * -strength;
        const limit = mobile ? 10 : 24;
        element.style.setProperty('--motion-parallax-y', `${Math.max(-limit, Math.min(limit, offset))}px`);
      });
    };

    const handleScroll = () => {
      if (scrollFrame) return;
      scrollFrame = window.requestAnimationFrame(updateScrollEffects);
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      const hero = document.querySelector<HTMLElement>('.hero');
      if (!hero) return;
      const rect = hero.getBoundingClientRect();
      hero.style.setProperty('--pointer-x', `${event.clientX - rect.left}px`);
      hero.style.setProperty('--pointer-y', `${event.clientY - rect.top}px`);
    };

    const mutationObserver = new MutationObserver(scheduleDecorate);
    mutationObserver.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    document.addEventListener('pointermove', handlePointerMove, { passive: true });

    decorate();
    updateScrollEffects();

    return () => {
      mutationObserver.disconnect();
      revealObserver.disconnect();
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      document.removeEventListener('pointermove', handlePointerMove);
      window.cancelAnimationFrame(decorateFrame);
      window.cancelAnimationFrame(scrollFrame);
      document.documentElement.classList.remove('motion-runtime');
    };
  }, [location.pathname, location.hash]);

  return <div ref={progressRef} className="scrollProgress" aria-hidden="true" />;
};

export default MotionEffects;
