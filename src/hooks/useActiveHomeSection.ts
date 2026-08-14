import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const HOME_SECTION_IDS = ['home', 'about', 'activities', 'teams', 'matches'] as const;

type HomeSectionId = (typeof HOME_SECTION_IDS)[number];

const SECTION_NAV_MAP: Record<string, HomeSectionId> = {
  home: 'home',
  about: 'about',
  activities: 'activities',
  teams: 'teams',
  matches: 'matches',
  notice: 'matches',
  news: 'activities',
};

function getSectionFromHash(hash: string): HomeSectionId {
  const sectionId = hash.slice(1);
  const mapped = SECTION_NAV_MAP[sectionId];
  return mapped ?? 'home';
}

function clampHeaderHeight(): number {
  if (typeof window === 'undefined') return 80;
  const headerOffset =
    document.querySelector('header.header')?.getBoundingClientRect().height ?? 72;
  return headerOffset + 12;
}

/** Keeps navigation state in sync with the section currently visible on the homepage. */
export function useActiveHomeSection(): HomeSectionId | null {
  const location = useLocation();
  const [activeSection, setActiveSection] = useState<HomeSectionId>(() =>
    getSectionFromHash(location.hash),
  );

  useEffect(() => {
    if (location.pathname !== '/') return;

    let animationFrame = 0;

    const updateActiveSection = () => {
      animationFrame = 0;
      const headerOffset = clampHeaderHeight();
      // 激活线：header 下方一点点，section 顶部过了 header 就被认为"进入"
      const activationLine = headerOffset;
      let nextSection: HomeSectionId = 'home';

      // 先找到当前最靠近顶部但还没完全滚走的 section
      // 逻辑：对每个 section 计算底部是否已经过激活线，然后取最后一个满足条件的
      for (const sectionId of HOME_SECTION_IDS) {
        const section = document.getElementById(sectionId);
        if (!section) continue;
        const rect = section.getBoundingClientRect();
        // 只要 section 顶部已经到激活线上就可以替换；
        // 如果 section 已经离开（整个 section 向上滚走了），我们不选它
        if (rect.top <= activationLine && rect.bottom > activationLine) {
          nextSection = sectionId;
        } else if (rect.top <= activationLine) {
          // section 顶部已过激活线（可能还在视图里或已部分离开），仍然作为候选
          nextSection = sectionId;
        }
      }

      // 如果滚到非常靠近顶部，且 hero/home 还在 header 下方可见，固定为 home
      const homeSection = document.getElementById('home');
      if (homeSection) {
        const homeRect = homeSection.getBoundingClientRect();
        const viewportMid = Math.min(window.innerHeight * 0.4, 360);
        if (homeRect.top <= viewportMid && homeRect.bottom > headerOffset) {
          nextSection = 'home';
        }
      }

      setActiveSection((current) => (current === nextSection ? current : nextSection));
    };

    const scheduleUpdate = () => {
      if (!animationFrame) animationFrame = window.requestAnimationFrame(updateActiveSection);
    };

    // 立即从 hash 初始化，然后再基于真实滚动位置校正
    setActiveSection(getSectionFromHash(location.hash));
    const initTimer = window.setTimeout(scheduleUpdate, 60);
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);

    return () => {
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      window.clearTimeout(initTimer);
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
    };
  }, [location.pathname, location.hash]);

  return location.pathname === '/' ? activeSection : null;
}

