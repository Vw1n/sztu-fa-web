import React, { useState, useEffect } from 'react';
import './About.css';
import { SectionHeader } from '../common';
import { fetchPublicSummary } from '../../api';

interface Feature {
  icon: React.ReactNode;
  text: string;
}

const features: Feature[] = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
    text: '校长杯',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
      </svg>
    ),
    text: '足协杯',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
        <path d="M2 12h20" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
    text: '世界杯观赛',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M8 21l4-8 4 8M7 21v-8a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v8" />
        <path d="M12 22a9 9 0 0 0 9-9H3a9 9 0 0 0 9 9z" />
      </svg>
    ),
    text: '社团嘉年华',
  },
];

interface StatItem {
  value: string;
  suffix: string;
  label: string;
}

const About: React.FC = () => {
  const [stats, setStats] = useState<StatItem[]>([
    { value: '2017', suffix: '年', label: '成立年份' },
    { value: '--', suffix: '场', label: '举办赛事' },
    { value: '--', suffix: '名', label: '覆盖球员' },
  ]);

  useEffect(() => {
    let isMounted = true;
    const loadRealStats = async () => {
      try {
        const summary = await fetchPublicSummary();
        const matchValue = String(summary.matchCount);
        const playerValue = String(summary.playerCount);

        if (isMounted) {
          setStats([
            { value: '2017', suffix: '年', label: '成立年份' },
            { value: matchValue, suffix: '场', label: '举办赛事' },
            { value: playerValue, suffix: '名', label: '覆盖球员' },
          ]);
        }
      } catch (error) {
        console.error('获取关于我们真实统计数据失败:', error);
        if (isMounted) {
          setStats([
            { value: '2017', suffix: '年', label: '成立年份' },
            { value: '暂时无法获取', suffix: '场', label: '举办赛事' },
            { value: '暂时无法获取', suffix: '名', label: '覆盖球员' },
          ]);
        }
      }
    };

    loadRealStats();
    return () => {
      isMounted = false;
    };
  }, []);
  return (
    <section className="about" id="about">
      <div className="aboutContainer">
        <SectionHeader
          tag="关于我们"
          title="深圳技术大学"
          emphasis="足球协会"
          description="致力于推广校园足球文化，培养学生足球兴趣，提高足球技术水平"
        />

        <div className="aboutContent">
          <div className="aboutImageWrapper">
            <picture>
              <source srcSet="/poster.webp" type="image/webp" />
              <img
                src="/poster.png"
                alt="足球协会活动"
                className="aboutImage"
                width="2048"
                height="1152"
                loading="lazy"
                decoding="async"
              />
            </picture>
          </div>

          <div className="aboutText">
            <h3 className="aboutTitle">传承足球精神，培育明日之星</h3>
            <p className="aboutParagraph">
              深圳技术大学足球协会，是深圳技术⼤学官⽅的⾜球组织，成立于2017年。社团分别设宣传部、组织部、财务部、技术部和裁判部。深技大足协一直与深技大足球校队深度合作，为校队做好宣传、后勤等工作，共同致力于深技大足球事业。
            </p>
            <p className="aboutParagraph">
              协会组织校际联赛和各类足球赛事，并定期组织社团嘉年华、观赛等活动。
              无论你是足球新手还是资深爱好者，都能在这里找到属于自己的位置。
            </p>

            <div className="aboutFeatures">
              {features.map((feature, index) => (
                <div key={index} className="aboutFeature">
                  <div className="aboutFeatureIcon">{feature.icon}</div>
                  <span className="aboutFeatureText">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="aboutStats">
          {stats.map((stat) => (
            <div key={stat.label} className="statItem">
              <div className="statNumber">
                {stat.value}
                {stat.value !== '暂时无法获取' && <span>{stat.suffix}</span>}
              </div>
              <div className="statLabel">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );

};

export default About;
