import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Activities from './components/Activities';
import Teams from './components/Teams';
import Matches from './components/Matches';
import Footer from './components/Footer';

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
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
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
