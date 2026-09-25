import React, { useState, useEffect } from 'react';
import { Sparkles, Calendar, Clock } from 'lucide-react';

export default function CountdownTimer({ t, lang }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 2,
    hours: 14,
    minutes: 48,
    seconds: 35
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="countdown-card-wrapper">
      {/* Event Timetable Header Cards (Matching Image 2) */}
      <div className="event-timing-grid">
        <div className="timing-mini-card">
          <div className="timing-badge">
            <span className="timing-icon">🪔</span>
            <span className="timing-label">{lang === 'ta' ? 'காலை நிகழ்வு' : 'Morning Muhurtham'}</span>
            <span className="timing-time">8:30 AM</span>
          </div>
          <div className="timing-date">{lang === 'ta' ? '13 Sep · ஞாயிறு' : '13 Sep · Sunday'}</div>
        </div>

        <div className="timing-mini-card">
          <div className="timing-badge">
            <span className="timing-icon">✨</span>
            <span className="timing-label">{lang === 'ta' ? 'மாலை மங்களம்' : 'Evening Reception'}</span>
            <span className="timing-time">6:30 PM</span>
          </div>
          <div className="timing-date">{lang === 'ta' ? '20 Sep · ஞாயிறு' : '20 Sep · Sunday'}</div>
        </div>
      </div>

      {/* Main Countdown Container with Double Border */}
      <div className="countdown-main-box">
        <div className="countdown-pill-header">
          <div className="pill-tab active">
            {t.countdownTitle}
          </div>
        </div>

        {/* 4-Box Number Grid */}
        <div className="timer-digits-grid">
          <div className="timer-cell">
            <div className="timer-num">{String(timeLeft.days).padStart(2, '0')}</div>
            <div className="timer-unit">{t.days}</div>
          </div>

          <div className="timer-cell">
            <div className="timer-num">{String(timeLeft.hours).padStart(2, '0')}</div>
            <div className="timer-unit">{t.hours}</div>
          </div>

          <div className="timer-cell">
            <div className="timer-num">{String(timeLeft.minutes).padStart(2, '0')}</div>
            <div className="timer-unit">{t.minutes}</div>
          </div>

          <div className="timer-cell">
            <div className="timer-num">{String(timeLeft.seconds).padStart(2, '0')}</div>
            <div className="timer-unit">{t.seconds}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
