import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts';
import './Header.css';

const navItems = [
  { id: 'home', label: '首页', path: '/' },
  { id: 'about', label: '协会简介', path: '/#about' },
  { id: 'news', label: '活动动态', path: '/#activities' },
  { id: 'teams', label: '球队信息', path: '/#teams' },
  { id: 'notice', label: '赛事公告', path: '/#matches' },
  { id: 'predictions', label: '竞猜大厅', path: '/predictions' },
  { id: 'leaderboard', label: '排行榜', path: '/leaderboard' },
  { id: 'my-predictions', label: '我的竞猜', path: '/my-predictions' },
];

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (location.pathname !== '/' || !location.hash) return;
    const element = document.getElementById(location.hash.slice(1));
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }, [location.pathname, location.hash]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleNavClick = (path: string) => {
    setIsMobileMenuOpen(false);
    if (path === `${location.pathname}${location.hash}` && location.hash) {
      document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    navigate(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/' && !location.hash;
    if (path.includes('#')) {
      const [pathname, hash] = path.split('#');
      return location.pathname === pathname && location.hash === `#${hash}`;
    }
    return location.pathname.startsWith(path);
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
                  className={`navLinkBtn ${isActive(item.path) ? 'active' : ''}`}
                  onClick={() => handleNavClick(item.path)}
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
              <div className="userIdentity">
                <span className="userName">{user.nickname || user.username}</span>
                {user.studentId && <span className="userStudentId">{user.studentId}</span>}
              </div>
              <button type="button" className="authBtn logoutBtn" onClick={handleLogout}>
                退出
              </button>
            </div>
          ) : (
            <div className="authButtons">
              <Link to="/login" className="authBtn loginBtn">
                登录
              </Link>
              <Link to="/register" className="authBtn registerBtn">
                注册绑定学号
              </Link>
            </div>
          )}
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
                className={`mobileNavLinkBtn ${isActive(item.path) ? 'active' : ''}`}
                onClick={() => handleNavClick(item.path)}
              >
                {item.label}
              </button>
            </li>
          ))}
          <li className="mobileNavItem mobileAuthItem">
            {isAuthenticated && user ? (
              <div className="mobileUserInfo">
                <div>
                  <strong>{user.nickname || user.username}</strong>
                  {user.studentId && <span> ({user.studentId})</span>}
                </div>
                <button type="button" className="authBtn logoutBtn" onClick={handleLogout}>
                  退出登录
                </button>
              </div>
            ) : (
              <div className="mobileAuthButtons">
                <Link to="/login" className="authBtn loginBtn" onClick={() => setIsMobileMenuOpen(false)}>
                  登录
                </Link>
                <Link to="/register" className="authBtn registerBtn" onClick={() => setIsMobileMenuOpen(false)}>
                  注册绑定学号
                </Link>
              </div>
            )}
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
