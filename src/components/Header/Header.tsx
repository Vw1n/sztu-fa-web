import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts';
import { useActiveHomeSection } from '../../hooks/useActiveHomeSection';
import './Header.css';

const navItems = [
  { id: 'home', label: '首页', path: '/', section: 'home' as const },
  { id: 'about', label: '协会简介', path: '/#about', section: 'about' as const },
  { id: 'news', label: '活动动态', path: '/#activities', section: 'activities' as const },
  { id: 'teams', label: '球队信息', path: '/#teams', section: 'teams' as const },
  { id: 'notice', label: '赛事公告', path: '/#matches', section: 'matches' as const },
  { id: 'predictions', label: '助威中心', path: '/predictions', section: null },
];

type HomeSectionId = 'home' | 'about' | 'activities' | 'teams' | 'matches';

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [forcedSection, setForcedSection] = useState<HomeSectionId | null>(null);
  const location = useLocation();
  const activeHomeSection = useActiveHomeSection();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 点击导航后立即强制激活对应 section，滚动结束自动清除（通过 scroll 监听）
  useEffect(() => {
    if (!forcedSection) return;
    let rafId = 0;
    let stableFrames = 0;
    let lastY = window.scrollY;
    const check = () => {
      const y = window.scrollY;
      stableFrames = Math.abs(y - lastY) < 1 ? stableFrames + 1 : 0;
      lastY = y;
      if (stableFrames >= 8) {
        // 滚动稳定后清除强制激活，回到真实滚动检测
        setForcedSection(null);
        return;
      }
      rafId = window.requestAnimationFrame(check);
    };
    rafId = window.requestAnimationFrame(check);
    // 最长 1.5 秒后强制清除，防止卡住
    const fallback = window.setTimeout(() => setForcedSection(null), 1500);
    return () => {
      window.cancelAnimationFrame(rafId);
      window.clearTimeout(fallback);
    };
  }, [forcedSection]);

  useEffect(() => {
    if (location.pathname !== '/' || !location.hash) return;

    const targetId = location.hash.slice(1);
    let animationFrame = 0;
    let cancelled = false;

    const scrollToTarget = () => {
      animationFrame = 0;
      if (cancelled) return;

      const element = document.getElementById(targetId);
      if (!element) return;

      const headerOffset =
        document.querySelector('header.header')?.getBoundingClientRect().height ?? 72;
      const target = element.getBoundingClientRect().top + window.scrollY - headerOffset - 4;
      window.scrollTo({ top: Math.max(0, target), behavior: 'auto' });
    };

    const scheduleScroll = () => {
      if (cancelled || animationFrame) return;
      animationFrame = window.requestAnimationFrame(scrollToTarget);
    };

    // 跨页面返回首页时，上方异步区块可能在首轮定位后继续变高。
    // 监听首页布局变化并重新对齐目标，避免最终落到前一个区块。
    const layoutRoot = document.querySelector('main.main');
    const resizeObserver = typeof ResizeObserver === 'undefined'
      ? null
      : new ResizeObserver(scheduleScroll);
    if (layoutRoot) resizeObserver?.observe(layoutRoot);

    const retryTimers = [0, 100, 300, 700, 1500].map((delay) =>
      window.setTimeout(scheduleScroll, delay),
    );
    const stopTimer = window.setTimeout(() => {
      cancelled = true;
      resizeObserver?.disconnect();
    }, 2200);

    const cancelOnUserInput = () => {
      cancelled = true;
      resizeObserver?.disconnect();
    };
    window.addEventListener('wheel', cancelOnUserInput, { passive: true, once: true });
    window.addEventListener('touchstart', cancelOnUserInput, { passive: true, once: true });

    return () => {
      cancelled = true;
      resizeObserver?.disconnect();
      retryTimers.forEach((timer) => window.clearTimeout(timer));
      window.clearTimeout(stopTimer);
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener('wheel', cancelOnUserInput);
      window.removeEventListener('touchstart', cancelOnUserInput);
    };
  }, [location.pathname, location.hash]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const getHeaderOffset = useCallback(() => {
    if (typeof document === 'undefined') return 76;
    return document.querySelector('header.header')?.getBoundingClientRect().height ?? 72;
  }, []);

  const handleNavClick = (path: string, section: HomeSectionId | null) => {
    setIsMobileMenuOpen(false);

    // 首页锚点导航（或者已在首页时点击首页）：自行处理滚动 + 激活
    if (path === '/' && location.pathname === '/') {
      if (section) setForcedSection(section);
      if (location.hash) navigate('/', { replace: true });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (path.startsWith('/#') && location.pathname === '/') {
      const targetId = path.slice(2); // '/#about' -> '#about' then below slice
      const realId = targetId.startsWith('#') ? targetId.slice(1) : targetId;
      const element = document.getElementById(realId);
      if (element) {
        if (section) setForcedSection(section);
        const offset = getHeaderOffset() + 4;
        const target = element.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: Math.max(0, target), behavior: 'smooth' });
        // 同步 hash，保持浏览器地址栏正确（但不触发重复 effect）
        if (history.replaceState) {
          history.replaceState(null, '', path);
        }
      }
      return;
    }

    // 跨页面（如 /predictions 等）正常跳转
    navigate(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string, section: HomeSectionId | null) => {
    // 1. 非首页路径：用 path 精确 / 前缀匹配
    if (!path.startsWith('/#') && path !== '/') {
      if (path === '/predictions') {
        return (
          location.pathname === '/predictions' ||
          location.pathname.startsWith('/predictions/') ||
          location.pathname === '/leaderboard' ||
          location.pathname.startsWith('/leaderboard/') ||
          location.pathname === '/my-predictions' ||
          location.pathname.startsWith('/my-predictions/')
        );
      }
      if (path === location.pathname) return true;
      if (location.pathname.startsWith(path + '/')) return true;
      return false;
    }

    // 2. 首页('/') 或 首页锚点（/#about）
    if (location.pathname !== '/') return false;

    // 优先使用点击强制激活（在滚动动画过程中）
    const effectiveSection: HomeSectionId | null = forcedSection ?? activeHomeSection;

    if (path === '/') {
      return effectiveSection === 'home';
    }
    // path 形如 '/#about' -> 取 sectionId 对比
    return section ? effectiveSection === section : false;
  };

  const getVerificationBadge = () => {
    if (!user) return null;
    const status = user.verificationStatus || 'PENDING';
    const statusMap: Record<string, { label: string; className: string }> = {
      APPROVED: { label: '已认证', className: 'status-approved' },
      PENDING: { label: '审核中', className: 'status-pending' },
      CHANGES_REQUESTED: { label: '待补充', className: 'status-changes-requested' },
      LEGACY: { label: '待补交', className: 'status-legacy' },
    };
    const info = statusMap[status] || { label: '审核状态', className: 'status-pending' };
    return (
      <Link
        to="/verification"
        className={`verificationStatusBadge ${info.className}`}
        title="查看校园卡审核状态与材料"
        onClick={() => setIsMobileMenuOpen(false)}
      >
        <span className="statusDot"></span>
        {info.label}
      </Link>
    );
  };

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="headerContainer">
        <Link to="/" className="logo" onClick={() => setIsMobileMenuOpen(false)}>
          <img className="logoIcon" src="/logo.jpg" alt="SZTU足球协会" />
          <div className="logoText">
            <span className="logoTitle">SZTU足球协会</span>
            <span className="logoSubtitle">Shenzhen Tech University FA</span>
          </div>
        </Link>

        <nav className="nav">
          <ul className="navList">
            {navItems.map((item) => (
              <li key={item.id} className="navItem">
                <button
                  type="button"
                  className={`navLinkBtn ${isActive(item.path, item.section) ? 'active' : ''}`}
                  onClick={() => handleNavClick(item.path, item.section)}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="headerAuth">
          {isAuthenticated && user ? (
            <div className="userInfoBox">
              <Link to="/verification" className="userIdentityLink" title="查看校园卡审核状态">
                <div className="userIdentity">
                  <span className="userName">{user.nickname || user.username}</span>
                  {user.studentId && <span className="userStudentId">{user.studentId}</span>}
                </div>
              </Link>
              {getVerificationBadge()}
              <button type="button" className="authBtn logoutBtn" onClick={handleLogout}>
                退出
              </button>
            </div>
          ) : null}
        </div>

        <button
          className={`menuButton ${isMobileMenuOpen ? 'active' : ''}`}
          onClick={toggleMobileMenu}
          aria-label="菜单"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      <nav className={`mobileNav ${isMobileMenuOpen ? 'open' : ''}`}>
        <ul className="mobileNavList">
          {navItems.map((item) => (
            <li key={item.id} className="mobileNavItem">
              <button
                type="button"
                className={`mobileNavLinkBtn ${isActive(item.path, item.section) ? 'active' : ''}`}
                onClick={() => handleNavClick(item.path, item.section)}
              >
                {item.label}
              </button>
            </li>
          ))}
          {isAuthenticated && user ? (
            <li className="mobileNavItem mobileAuthItem">
              <div className="mobileUserInfo">
                <div className="mobileUserDetail">
                  <Link to="/verification" className="userIdentityLink" onClick={() => setIsMobileMenuOpen(false)}>
                    <strong>{user.nickname || user.username}</strong>
                    {user.studentId && <span> ({user.studentId})</span>}
                  </Link>
                  <div className="mobileBadgeWrapper">
                    {getVerificationBadge()}
                  </div>
                </div>
                <button type="button" className="authBtn logoutBtn" onClick={handleLogout}>
                  退出登录
                </button>
              </div>
            </li>
          ) : null}
        </ul>
      </nav>
    </header>
  );
};

export default Header;
