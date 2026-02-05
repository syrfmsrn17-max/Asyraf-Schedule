import React, { useState, useEffect, useRef } from 'react';
import { Palette, Moon, Sun, Globe, ChevronDown, Check, Clock as ClockIcon, Calendar, BookOpen, GraduationCap, X } from 'lucide-react';
import { translations, daySchedule, periodTimes, getTeacher, getSubjectName } from './data';
import './index.css';

// --- HOOKS ---

const useTime = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return time;
};

const useSchedule = (currentTime, lang = 'id') => {
  const day = currentTime.getDay();
  const classes = daySchedule[day] || [];

  const isSchoolDay = classes.length > 0;

  if (!isSchoolDay) {
    return { status: 'off', message: 'No School Today', current: null, next: null, schedule: [] };
  }

  const formatTime = (date) => {
    const h = date.getHours().toString().padStart(2, '0');
    const m = date.getMinutes().toString().padStart(2, '0');
    return `${h}:${m}`;
  };

  const timeString = formatTime(currentTime);

  let currentPeriod = null;
  let nextPeriod = null;
  let status = 'off';

  const currentSlot = periodTimes.find(p => timeString >= p.start && timeString < p.end);

  if (currentSlot) {
    if (currentSlot.id === 'break') {
      status = 'break';
      currentPeriod = { name: currentSlot.name, teacher: '-', start: currentSlot.start, end: currentSlot.end };

      const nextIdx = periodTimes.findIndex(p => p.id === 'break') + 1;
      if (nextIdx < periodTimes.length) {
        const nextP = periodTimes[nextIdx];
        const subject = classes[nextP.id - 1];
        nextPeriod = {
          name: subject,
          teacher: getTeacher(subject, lang),
          start: nextP.start,
          end: nextP.end
        };
      }
    } else {
      status = 'ongoing';
      const subject = classes[currentSlot.id - 1];
      currentPeriod = {
        name: subject,
        teacher: getTeacher(subject, lang),
        start: currentSlot.start,
        end: currentSlot.end
      };

      const currentIdx = periodTimes.indexOf(currentSlot);
      const nextIdx = currentIdx + 1;

      if (nextIdx < periodTimes.length) {
        const nextSlot = periodTimes[nextIdx];
        if (nextSlot.id === 'break') {
          nextPeriod = { name: nextSlot.name, teacher: '-', start: nextSlot.start, end: nextSlot.end };
        } else {
          const nextSubject = classes[nextSlot.id - 1];
          nextPeriod = {
            name: nextSubject,
            teacher: getTeacher(nextSubject, lang),
            start: nextSlot.start,
            end: nextSlot.end
          };
        }
      }
    }
  } else {
    const startOfDay = periodTimes[0].start;
    const endOfDay = periodTimes[periodTimes.length - 1].end;

    if (timeString < startOfDay) {
      status = 'upcoming';
      const firstSubject = classes[0];
      nextPeriod = {
        name: firstSubject,
        teacher: getTeacher(firstSubject, lang),
        start: periodTimes[0].start,
        end: periodTimes[0].end
      };
    } else if (timeString >= endOfDay) {
      status = 'finished';
    } else {
      status = 'off';
    }
  }

  return {
    status,
    current: currentPeriod,
    next: nextPeriod,
    schedule: classes
  };
};

// --- COMPONENTS ---

const Header = ({ lang, setLang, theme, setTheme, customColor, setCustomColor, t, toggleScheduleView }) => {
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  const langMenuRef = useRef(null);
  const themeMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target)) {
        setShowLangMenu(false);
      }
      if (themeMenuRef.current && !themeMenuRef.current.contains(event.target)) {
        setShowThemeMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const languages = [
    { code: 'id', label: 'Indonesia', flag: '🇮🇩' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
    { code: 'ja', label: '日本語', flag: '🇯🇵' },
    { code: 'ar', label: 'العربية', flag: '🇸🇦' },
    { code: 'ko', label: '한국어', flag: '🇰🇷' },
  ];

  return (
    <header className="glass-panel" style={{
      margin: '1.5rem 2rem',
      padding: '1rem 1.5rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderRadius: '20px',
      position: 'relative',
      zIndex: 100
    }}>
      <h1 style={{
        fontSize: '1.5rem',
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        gap: '0.8rem',
        background: 'linear-gradient(90deg, var(--text-primary), var(--text-secondary))',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
      }}>
        <div style={{
          width: '12px',
          height: '12px',
          background: 'var(--accent-color)',
          borderRadius: '50%',
          boxShadow: '0 0 10px var(--accent-color)'
        }}></div>
        <span style={{ WebkitTextFillColor: 'var(--text-primary)' }}>{t.title}</span>
      </h1>

      <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
        <button
          onClick={() => toggleScheduleView(true)}
          className="glass-panel"
          style={{
            background: 'var(--accent-color)',
            color: '#fff',
            padding: '0.6rem 1rem',
            borderRadius: '12px',
            fontWeight: 600,
            fontSize: '0.9rem',
            border: 'none',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
          }}
        >
          Lihat Jadwal
        </button>

        <div style={{ position: 'relative' }} ref={langMenuRef}>
          <button
            onClick={() => { setShowLangMenu(!showLangMenu); setShowThemeMenu(false); }}
            className="glass-panel"
            style={{
              background: 'rgba(255,255,255,0.05)',
              color: 'var(--text-primary)',
              padding: '0.6rem 1rem',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.9rem',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
          >
            <Globe size={18} />
            <span className="mono">{lang.toUpperCase()}</span>
            <ChevronDown size={14} style={{ opacity: 0.5 }} />
          </button>

          {showLangMenu && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: '120%',
              padding: '0.5rem',
              minWidth: '200px',
              zIndex: 1000,
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.4rem',
              background: 'var(--bg-secondary)',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
            }}>
              {languages.map(l => (
                <button
                  key={l.code}
                  onClick={() => { setLang(l.code); setShowLangMenu(false); }}
                  style={{
                    padding: '0.8rem 1rem',
                    borderRadius: '8px',
                    background: lang === l.code ? 'var(--accent-color)' : 'transparent',
                    color: lang === l.code ? '#fff' : 'var(--text-primary)',
                    textAlign: 'left',
                    fontSize: '0.9rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.2rem' }}>{l.flag}</span>
                    <span style={{ fontWeight: 500 }}>{l.label}</span>
                  </div>
                  {lang === l.code && <Check size={16} />}
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={{ position: 'relative' }} ref={themeMenuRef}>
          <button
            onClick={() => { setShowThemeMenu(!showThemeMenu); setShowLangMenu(false); }}
            className="glass-panel"
            style={{
              background: 'rgba(255,255,255,0.05)',
              color: 'var(--text-primary)',
              padding: '0.6rem',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
          >
            <Palette size={18} />
          </button>

          {showThemeMenu && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: '120%',
              padding: '1rem',
              minWidth: '220px',
              zIndex: 1000,
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              background: 'var(--bg-secondary)',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
            }}>
              <div>
                <h4 style={{ marginBottom: '0.5rem', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.6 }}>Mode</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', background: 'rgba(0,0,0,0.2)', padding: '4px', borderRadius: '8px' }}>
                  <button
                    onClick={() => setTheme('light')}
                    style={{
                      padding: '0.5rem',
                      borderRadius: '6px',
                      background: theme === 'light' ? '#fff' : 'transparent',
                      color: theme === 'light' ? '#000' : 'var(--text-secondary)',
                      display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px',
                      fontSize: '0.85rem'
                    }}
                  >
                    <Sun size={14} /> Light
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    style={{
                      padding: '0.5rem',
                      borderRadius: '6px',
                      background: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'transparent',
                      color: theme === 'dark' ? '#fff' : 'var(--text-secondary)',
                      display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px',
                      fontSize: '0.85rem'
                    }}
                  >
                    <Moon size={14} /> Dark
                  </button>
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.6 }}>Accent</h4>
                  <span className="mono" style={{ fontSize: '0.75rem', opacity: 0.8 }}>{customColor}</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="color"
                    value={customColor}
                    onChange={(e) => setCustomColor(e.target.value)}
                    style={{
                      width: '100%',
                      height: '40px',
                      cursor: 'pointer',
                      borderRadius: '8px',
                      border: 'none',
                      background: 'transparent'
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

const Clock = ({ time, t, lang }) => {
  const formatTime = (date) => {
    return date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).replace(/:/g, ' : '); // Add spacing around colon
  };

  const formatDate = (date) => {
    return date.toLocaleDateString(lang === 'id' ? 'id-ID' : lang, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div style={{ textAlign: 'center', marginBottom: '3rem', marginTop: '1rem' }}>
      <div className="mono" style={{
        fontSize: '5rem',
        fontWeight: 700,
        letterSpacing: '-2px',
        textShadow: '0 0 30px rgba(59, 130, 246, 0.3)',
        marginBottom: '0.5rem'
      }}>
        {formatTime(time)}
      </div>
      <div style={{
        fontSize: '1.2rem',
        opacity: 0.7,
        textTransform: 'uppercase',
        letterSpacing: '2px'
      }}>
        {formatDate(time)}
      </div>
    </div>
  );
};

const Dashboard = ({ scheduleData, t, lang }) => {
  const { status, current, next, message } = scheduleData;

  if (status === 'off' || status === 'finished') {
    return (
      <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>{message || t.finished}</h2>
        <p style={{ opacity: 0.6 }}>{t.noClass}</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>

      {/* Current Class Card */}
      <div className={`glass-panel ${status === 'break' ? 'highlight-warning' : 'highlight-green'}`} style={{ padding: '2rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '1rem', right: '1rem', opacity: 0.2 }}>
          <ClockIcon size={100} />
        </div>

        <h3 style={{ textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.9rem', opacity: 0.7, marginBottom: '1.5rem' }}>
          {status === 'break' ? t.break : t.currentClass}
        </h3>

        <div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem', lineHeight: 1.2 }}>
            {status === 'break' ? getSubjectName('Istirahat', lang) : getSubjectName(current.name, lang)}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem', opacity: 0.9 }}>
            <BookOpen size={20} />
            <span>{current.teacher}</span>
          </div>
          <div className="mono" style={{ marginTop: '2rem', fontSize: '1.5rem', display: 'inline-block', padding: '0.5rem 1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
            {current.start} - {current.end}
          </div>
        </div>
      </div>

      {/* Next Class Card */}
      {next && (
        <div className="glass-panel highlight-blue" style={{ padding: '2rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '1rem', right: '1rem', opacity: 0.1 }}>
            <GraduationCap size={100} />
          </div>

          <h3 style={{ textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.9rem', opacity: 0.7, marginBottom: '1.5rem' }}>
            {t.nextClass}
          </h3>

          <div style={{ opacity: 0.8 }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              {getSubjectName(next.name, lang)}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1rem', marginBottom: '1.5rem' }}>
              <BookOpen size={18} />
              <span>{next.teacher}</span>
            </div>
            <div className="mono" style={{ fontSize: '1.2rem' }}>
              {next.start} - {next.end}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const DailySchedule = ({ scheduleData, t, lang }) => {
  const { schedule } = scheduleData;

  // Just a helper to find matching slot in periodTimes
  // Since schedule array maps to periodTimes excluding break directly by index logic in usSchedule...
  // Wait, schedule array is just list of subjects. periodTimes has IDs.
  // periodTimes: id 1..4, break, 5..8
  // schedule array: idx 0..7

  // Let's iterate periodTimes to build the list
  return (
    <div className="glass-panel" style={{ padding: '2rem' }}>
      <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Calendar size={20} />
        {t.title}
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {periodTimes.map((slot, index) => {
          let subject = '-';
          let teacher = '-';
          let isBreak = slot.id === 'break';
          let isActive = false;

          // Determine content
          if (isBreak) {
            subject = t.break;
          } else {
            // If slot.id is a number, index in schedule array is slot.id - 1
            const subjectKey = schedule[slot.id - 1];
            subject = subjectKey ? getSubjectName(subjectKey, lang) : '-';
            teacher = subjectKey ? getTeacher(subjectKey, lang) : '-';
          }

          // Check if active (simple time check ideally passed from hook, but we can infer or leave simple for now)
          // For now simple listing

          return (
            <div key={index} style={{
              display: 'grid',
              gridTemplateColumns: '80px 1fr 1fr',
              alignItems: 'center',
              padding: '1rem',
              borderRadius: '12px',
              background: isBreak ? 'rgba(245, 158, 11, 0.1)' : 'rgba(255,255,255,0.02)',
              borderLeft: isBreak ? '3px solid var(--warning-color)' : '3px solid transparent'
            }}>
              <div className="mono" style={{ opacity: 0.6 }}>{slot.start}</div>
              <div style={{ fontWeight: 600 }}>{subject}</div>
              <div style={{ opacity: 0.7, fontSize: '0.9rem' }}>{teacher}</div>
            </div>
          )
        })}
      </div>
    </div>
  );
};

const WeeklySchedule = ({ isOpen, onClose, t, lang }) => {
  if (!isOpen) return null;

  const daysOrder = [6, 0, 1, 2, 3, 4];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0,0,0,0.8)',
      backdropFilter: 'blur(8px)',
      zIndex: 2000,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '2rem'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '1000px',
        height: '90vh',
        background: 'var(--bg-secondary)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        animation: 'fadeIn 0.3s ease'
      }}>
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '1.5rem' }}>
            <Calendar size={28} color="var(--accent-color)" />
            {t.title} - Weekly View
          </h2>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.1)',
            padding: '0.5rem',
            borderRadius: '50%',
            color: '#fff',
            display: 'flex'
          }}>
            <X size={24} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {daysOrder.map(dayIndex => {
            const dayName = t.days[dayIndex];
            const subjects = daySchedule[dayIndex] || [];

            return (
              <div key={dayIndex} className="glass-panel" style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)' }}>
                <h3 style={{
                  marginBottom: '1rem',
                  paddingBottom: '0.5rem',
                  borderBottom: '2px solid var(--accent-color)',
                  color: 'var(--accent-color)',
                  fontSize: '1.2rem'
                }}>
                  {dayName}
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {periodTimes.map((period, idx) => {
                    if (period.id === 'break') {
                      return (
                        <div key={idx} style={{
                          padding: '0.4rem',
                          background: 'rgba(255,165,0,0.1)',
                          borderLeft: '2px solid orange',
                          fontSize: '0.8rem',
                          color: 'orange',
                          display: 'flex',
                          justifyContent: 'space-between'
                        }}>
                          <span>{period.start}</span>
                          <span>{t.break}</span>
                        </div>
                      );
                    }

                    const subjectKey = subjects[period.id - 1];
                    const subjectName = subjectKey ? getSubjectName(subjectKey, lang) : '-';
                    const teacherName = subjectKey ? getTeacher(subjectKey, lang) : '';

                    return (
                      <div key={idx} style={{
                        display: 'grid',
                        gridTemplateColumns: '50px 1fr',
                        gap: '0.5rem',
                        fontSize: '0.9rem',
                        opacity: subjectKey ? 1 : 0.5
                      }}>
                        <span className="mono" style={{ opacity: 0.6 }}>{period.start}</span>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 500 }}>{subjectName}</span>
                          {teacherName && (
                            <span style={{ fontSize: '0.75rem', opacity: 0.7, fontStyle: 'italic' }}>
                              {teacherName}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// --- MAIN APP ---

function App() {
  const [lang, setLang] = useState('id');
  const [theme, setTheme] = useState('dark');
  const [customColor, setCustomColor] = useState('#3b82f6');
  const [showWeeklySchedule, setShowWeeklySchedule] = useState(false);

  const time = useTime();
  const scheduleData = useSchedule(time, lang);
  const t = translations[lang];

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.style.setProperty('--accent-color', customColor);
  }, [theme, customColor]);

  return (
    <div className="app-container">
      <Header
        lang={lang}
        setLang={setLang}
        theme={theme}
        setTheme={setTheme}
        customColor={customColor}
        setCustomColor={setCustomColor}
        t={t}
        toggleScheduleView={setShowWeeklySchedule}
      />

      <main className="container">
        <Clock time={time} t={t} lang={lang} />

        <Dashboard
          scheduleData={scheduleData}
          t={t}
          lang={lang}
        />

        <div style={{ marginTop: '2rem' }}>
          <DailySchedule
            scheduleData={scheduleData}
            t={t}
            lang={lang}
          />
        </div>
      </main>

      <WeeklySchedule
        isOpen={showWeeklySchedule}
        onClose={() => setShowWeeklySchedule(false)}
        t={t}
        lang={lang}
      />
    </div>
  );
}

export default App;
