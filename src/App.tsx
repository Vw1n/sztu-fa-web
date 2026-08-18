import { Navigate, Route, Routes, Link, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Activities from './components/Activities';
import Teams from './components/Teams';
import Matches from './components/Matches';
import Footer from './components/Footer';
import MotionEffects from './components/common/MotionEffects';
import ScrollToTop from './components/common/ScrollToTop';
import { useActiveHomeSection } from './hooks/useActiveHomeSection';

import Login from './pages/Login';
import Register from './pages/Register';
import Predictions from './pages/Predictions';
import MyPredictions from './pages/MyPredictions';
import Leaderboard from './pages/Leaderboard';

function HomePage() {
  return (
    <div className="app">
      <Header />
      <main className="main">
        <Hero />
        <About />
        <Activities />
        <Teams />
        <Matches />
      </main>
      <Footer />
      <MobileDock />
    </div>
  );
}

function MobileDock() {
  const location = useLocation();
  const activeHomeSection = useActiveHomeSection();
  const items = [
    { label: '首页', to: '/', icon: '⌂' },
    { label: '赛事', to: '/#matches', icon: '◷' },
    { label: '球队', to: '/#teams', icon: '◉' },
    { label: '竞猜', to: '/predictions', icon: '◇' },
    { label: '我的', to: '/my-predictions', icon: '○' },
  ];

  return (
    <nav className="mobileDock" aria-label="移动端快捷导航">
      {items.map((item) => {
        const [pathname, hash = ''] = item.to.split('#');
        const active = location.pathname === pathname
          && (hash ? activeHomeSection === hash : activeHomeSection === 'home');
        return (
          <Link key={item.label} to={item.to} className={active ? 'active' : ''}>
            <span className="mobileDockIcon" aria-hidden="true">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function App() {
  return (
    <AuthProvider>
      <ScrollToTop />
      <MotionEffects />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/predictions" element={<Predictions />} />
        <Route path="/my-predictions" element={<MyPredictions />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
