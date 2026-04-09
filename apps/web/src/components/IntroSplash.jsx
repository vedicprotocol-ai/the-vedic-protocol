import React, { useState, useEffect } from 'react';

export default function IntroSplash() {
  const [phase, setPhase] = useState('idle');

  useEffect(() => {
    const hasSeen = sessionStorage.getItem('hasSeenIntro');
    if (hasSeen) {
      setPhase('gone');
      return;
    }

    // Start visible
    setPhase('visible');
    document.body.style.overflow = 'hidden';

    const fadeTimer = setTimeout(() => {
      setPhase('fading');
    }, 2600);

    const goneTimer = setTimeout(() => {
      setPhase('gone');
      document.body.style.overflow = '';
      sessionStorage.setItem('hasSeenIntro', 'true');
    }, 3350); // 2600ms visible + 750ms fade out

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(goneTimer);
      document.body.style.overflow = '';
    };
  }, []);

  if (phase === 'gone' || phase === 'idle') return null;

  return (
    <div className={`intro-splash intro-splash--${phase}`}>
      <div className="intro-ring"></div>
      <div className="intro-ring intro-ring--delay"></div>
      <div className="intro-content">
        <div className="intro-label">आयुर्वेद</div>
        <div className="intro-brand">The Vedic Protocol</div>
        <div className="intro-divider"></div>
        <div className="intro-line">Ancient wisdom. Clinically precise.</div>
      </div>
    </div>
  );
}