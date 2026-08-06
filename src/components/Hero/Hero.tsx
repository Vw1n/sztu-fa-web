import { useCallback, useEffect, useState } from 'react';
import './Hero.css';
import { slides } from '../../data/heroSlides';

const Hero: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState<boolean[]>(() => slides.map(() => false));

  const nextSlide = useCallback(() => {
    setCurrentSlide((previous) => (previous + 1) % slides.length);
  }, []);

  const previousSlide = () => {
    setCurrentSlide((previous) => (previous - 1 + slides.length) % slides.length);
  };

  const markLoaded = (index: number) => {
    setImagesLoaded((previous) => previous.map((loaded, itemIndex) => (
      itemIndex === index ? true : loaded
    )));
  };

  useEffect(() => {
    const timer = window.setInterval(nextSlide, 6500);
    return () => window.clearInterval(timer);
  }, [nextSlide]);

  return (
    <section className="hero" id="home" aria-label="深圳技术大学足球协会">
      <div className="heroMedia" aria-hidden="true">
        {slides.map((slide, index) => (
          <div key={slide.id} className={`heroSlide ${index === currentSlide ? 'active' : ''}`}>
            <div className="heroImagePlaceholder" />
            <img
              src={index === 0 ? slide.image : slide.thumb}
              alt=""
              className={`heroImage ${imagesLoaded[index] ? 'loaded' : ''}`}
              loading={index === 0 ? 'eager' : 'lazy'}
              fetchPriority={index === 0 ? 'high' : 'low'}
              onLoad={() => markLoaded(index)}
            />
          </div>
        ))}
      </div>

      <div className="heroWash" />

      <div className="heroFrame">
        <div className="heroEyebrow">
          <span>Campus Football / Shenzhen</span>
          <span>Est. 2017</span>
        </div>

        <div className="heroContent">
          <p className="heroIndex">0{currentSlide + 1} <span>/ 0{slides.length}</span></p>
          <h1 className="heroTitle">
            <span>{slides[currentSlide].titlePlain}</span>
            <strong>{slides[currentSlide].titleEmphasis}</strong>
          </h1>
          <p className="heroDescription">{slides[currentSlide].description}</p>
          <div className="heroButtons">
            <a href="#matches" className="heroButton heroButtonPrimary">
              查看赛事 <span aria-hidden="true">↗</span>
            </a>
            <a href="#about" className="heroButton heroButtonSecondary">
              认识我们 <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>

        <div className="heroRail">
          <span className="heroRailLabel">SZTU FOOTBALL ASSOCIATION</span>
          <div className="heroControls">
            <button type="button" onClick={previousSlide} aria-label="上一张">←</button>
            <button type="button" onClick={nextSlide} aria-label="下一张">→</button>
          </div>
          <div className="heroIndicators" aria-label="轮播图切换">
            {slides.map((slide, index) => (
              <button
                type="button"
                key={slide.id}
                className={index === currentSlide ? 'active' : ''}
                onClick={() => setCurrentSlide(index)}
                aria-label={`切换到第 ${index + 1} 张`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
