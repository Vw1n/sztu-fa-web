import { useState, useEffect } from 'react';
import './Header.css';

interface HeaderProps {
  currentPage?: string;
}

const navItems = [
  { id: 'home', label: '首页', href: '#home' },
  { id: 'about', label: '协会简介', href: '#about' },
  { id: 'activities', label: '活动动态', href: '#activities' },
  { id: 'teams', label: '球队信息', href: '#teams' },
  { id: 'matches', label: '赛事公告', href: '#matches' },
];

const Header: React.FC<HeaderProps> = ({ currentPage: initialPage = 'home' }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(initialPage);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      const headerHeight = window.innerWidth <= 768 ? 70 : 80;
      const scrollPosition = window.scrollY + headerHeight;

      for (let i = navItems.length - 1; i >= 0; i--) {
        const item = navItems[i];
        if (item.id === 'home') continue;
        const element = document.getElementById(item.id);
        if (element) {
          const top = element.offsetTop;
          if (scrollPosition >= top - 20) {
            setActiveSection(item.id);
            return;
          }
        }
      }
      if (window.scrollY < 200) {
        setActiveSection('home');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    setActiveSection(id);

    if (id === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const element = document.getElementById(id);
    if (element) {
      const headerHeight = window.innerWidth <= 768 ? 60 : 70;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - headerHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="headerContainer">
        <a href="#home" className="logo" onClick={(e) => handleNavClick(e, 'home')}>
          <img className="logoIcon" src="/logo.jpg" alt="SZTU足球协会" />
          <div className="logoText">
            <span className="logoTitle">SZTU足球协会</span>
            <span className="logoSubtitle">Shenzhen Tech University FA</span>
          </div>
        </a>

        <nav className="nav">
          <ul className="navList">
            {navItems.map((item) => (
              <li key={item.id} className="navItem">
                <a
                  href={item.href}
                  className={`navLink ${activeSection === item.id ? 'active' : ''}`}
                  onClick={(e) => handleNavClick(e, item.id)}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

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
              <a
                href={item.href}
                className={`mobileNavLink ${activeSection === item.id ? 'active' : ''}`}
                onClick={(e) => handleNavClick(e, item.id)}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
};

export default Header;