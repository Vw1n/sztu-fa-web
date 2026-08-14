import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const HOME_SECTION_IDS = ['home', 'about', 'activities', 'teams', 'matches'] as const;

type HomeSectionId = (typeof HOME_SECTION_IDS)[number];

function getSectionFromHash(hash: string): HomeSectionId {
  const sectionId = hash.slice(1);
  return HOME_SECTION_IDS.includes(sectionId as HomeSectionId)
    ? (sectionId as HomeSectionId)
    : 'home';
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
      const activationLine = Math.min(window.innerHeight * 0.3, 180);
      let nextSection: HomeSectionId = 'home';

      for (const sectionId of HOME_SECTION_IDS) {
        const section = document.getElementById(sectionId);
        if (section && section.getBoundingClientRect().top <= activationLine) {
          nextSection = sectionId;
        }
      }

      setActiveSection((current) => current === nextSection ? current : nextSection);
    };

    const scheduleUpdate = () => {
      if (!animationFrame) animationFrame = window.requestAnimationFrame(updateActiveSection);
    };

    setActiveSection(getSectionFromHash(location.hash));
    scheduleUpdate();
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);

    return () => {
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
    };
  }, [location.pathname, location.hash]);

  return location.pathname === '/' ? activeSection : null;
}

