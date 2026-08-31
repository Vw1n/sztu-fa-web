import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PredictionNavTabs from '../components/Predictions/PredictionNavTabs';
import './pages.css';

const MyPredictions: React.FC = () => {
  return (
    <div className="pageLayout">
      <Header />
      <main className="mainContent">
        <div className="pageContainer">
          <PredictionNavTabs activeTab="my-predictions" />
          <div className="comingSoonPage">
            <div className="comingSoonDecor comingSoonDecor-1">📋</div>
            <div className="comingSoonDecor comingSoonDecor-2">👤</div>
            <div className="comingSoonDecor comingSoonDecor-3">🎯</div>
            <div className="comingSoonDecor comingSoonDecor-4">⭐</div>
            <div className="comingSoonDecor comingSoonDecor-5">🏅</div>
            <div className="comingSoonCard">
              <div className="comingSoonIcon">
                <span className="iconBase">🚧</span>
              </div>
              <h1 className="comingSoonTitle">我的助威</h1>
              <div className="comingSoonDivider" />
              <p className="comingSoonSubtitle">
                功能开发中，预计新生杯投入使用
              </p>
              <div className="comingSoonTagLine">
                <span className="comingSoonTag">⚽ SZTUFA</span>
                <span className="comingSoonTag comingSoonTag-accent">·</span>
                <span className="comingSoonTag comingSoonTag-accent">敬请期待</span>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MyPredictions;
