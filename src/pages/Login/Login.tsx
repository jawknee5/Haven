import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/index';

export default function Login() {
  const navigate = useNavigate();
  const { login, loading: authLoading, error: authError, clearError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showIntro, setShowIntro] = useState(true);
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    // Show intro for 2.5 seconds then fade to login
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    
    if (!email || !password) {
      setLocalError('Please enter both email and password');
      return;
    }

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    }
  };

  const handleDemoLogin = async () => {
    setLocalError('');
    try {
      await login('resident@haven.demo', 'Demo2026!');
      navigate('/dashboard');
    } catch (err) {
      setLocalError('Demo login failed. Please try again.');
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #0a0e27 0%, #000000 50%, #1a0a2e 100%)',
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, serif',
      overflow: 'hidden',
      padding: '20px'
    }}>
      <style>{`
        @keyframes introFadeOut {
          0% { opacity: 1; transform: scale(1); }
          80% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(0.95); }
        }

        @keyframes loginSlideIn {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes birdFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        @keyframes wingPulse {
          0%, 100% { transform: scaleX(1); opacity: 0.95; }
          50% { transform: scaleX(1.02); opacity: 1; }
        }

        @keyframes ribbonFlow {
          0%, 100% { opacity: 0.85; }
          50% { opacity: 1; }
        }

        @keyframes goldGlow {
          0%, 100% { filter: drop-shadow(0 0 15px rgba(212, 175, 55, 0.4)); }
          50% { filter: drop-shadow(0 0 30px rgba(212, 175, 55, 0.8)); }
        }

        @keyframes textGlitch {
          0%, 100% { text-shadow: 0 0 20px rgba(212, 175, 55, 0.3); }
          50% { text-shadow: 0 0 40px rgba(212, 175, 55, 0.8), 0 0 60px rgba(192, 192, 192, 0.3); }
        }

        .intro-screen {
          animation: introFadeOut 2.5s ease-in-out forwards;
        }

        .login-screen {
          animation: loginSlideIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        .pathway-bird {
          animation: birdFloat 4s ease-in-out infinite;
        }

        .bird-wings {
          animation: wingPulse 2.5s ease-in-out infinite;
        }

        .bird-ribbon {
          animation: ribbonFlow 3s ease-in-out infinite;
        }

        .logo-glow {
          animation: goldGlow 3s ease-in-out infinite;
        }

        .pathway-text {
          animation: textGlitch 3s ease-in-out infinite;
        }
      `}</style>

      {/* INTRO SCREEN */}
      <div className="intro-screen" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        background: 'linear-gradient(135deg, #0a0e27 0%, #000000 50%, #1a0a2e 100%)',
        pointerEvents: showIntro ? 'auto' : 'none'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '30px'
        }}>
          <svg
            className="pathway-bird logo-glow"
            viewBox="0 0 400 450"
            width="200"
            height="240"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#FFD700', stopOpacity: '1' }} />
                <stop offset="50%" style={{ stopColor: '#FFF44F', stopOpacity: '1' }} />
                <stop offset="100%" style={{ stopColor: '#FFD700', stopOpacity: '1' }} />
              </linearGradient>
              <linearGradient id="silverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#E8E8E8', stopOpacity: '1' }} />
                <stop offset="50%" style={{ stopColor: '#F5F5F5', stopOpacity: '1' }} />
                <stop offset="100%" style={{ stopColor: '#D0D0D0', stopOpacity: '1' }} />
              </linearGradient>
              <filter id="metalSheen">
                <feGaussianBlur in="SourceGraphic" stdDeviation="1" />
              </filter>
            </defs>

            {/* Left Wing - Gold with layered feathers (Upper) */}
            <g className="bird-wings">
              <path d="M 200 180 Q 120 100 60 140 Q 100 120 150 140 Q 180 155 200 180" fill="url(#goldGrad)" style={{ filter: 'drop-shadow(0 4px 12px rgba(212, 175, 55, 0.5))' }} />
              <path d="M 150 140 Q 130 145 100 170 Q 120 155 145 150" fill="#C9A000" opacity="0.6" />
              <path d="M 180 155 Q 170 160 150 175 Q 165 165 178 160" fill="#FFE55C" opacity="0.4" />
            </g>

            {/* Right Wing - Silver with layered feathers (Secondary) */}
            <g className="bird-wings" style={{ animationDelay: '0.2s' }}>
              <path d="M 200 180 Q 280 100 340 140 Q 300 120 250 140 Q 220 155 200 180" fill="url(#silverGrad)" style={{ filter: 'drop-shadow(0 4px 12px rgba(200, 200, 200, 0.5))' }} />
              <path d="M 250 140 Q 270 145 300 170 Q 280 155 255 150" fill="#A0A0A0" opacity="0.6" />
              <path d="M 220 155 Q 230 160 250 175 Q 235 165 222 160" fill="#F5F5F5" opacity="0.4" />
            </g>

            {/* Body - Tapered Gold */}
            <ellipse cx="200" cy="200" rx="45" ry="55" fill="url(#goldGrad)" style={{ filter: 'drop-shadow(0 6px 18px rgba(0, 0, 0, 0.7))' }} />

            {/* Head - Gold */}
            <circle cx="200" cy="120" r="38" fill="#FFF44F" style={{ filter: 'drop-shadow(0 4px 10px rgba(0, 0, 0, 0.6))' }} />

            {/* Eye */}
            <circle cx="216" cy="110" r="7" fill="#000000" />
            <circle cx="218" cy="107" r="3" fill="#FFFFFF" />

            {/* Beak */}
            <path d="M 228 120 Q 255 115 270 125" stroke="#C9A000" strokeWidth="4" fill="none" strokeLinecap="round" />

            {/* Ribbon Tail - Gold and Silver intertwined (S-curve) */}
            <g className="bird-ribbon">
              {/* Gold ribbon left side */}
              <path d="M 170 250 Q 150 290 160 330 Q 170 370 200 400" stroke="url(#goldGrad)" strokeWidth="26" fill="none" strokeLinecap="round" opacity="0.9" style={{ filter: 'drop-shadow(0 3px 10px rgba(0, 0, 0, 0.6))' }} />
              
              {/* Silver ribbon right side */}
              <path d="M 230 250 Q 250 290 240 330 Q 230 370 200 400" stroke="url(#silverGrad)" strokeWidth="26" fill="none" strokeLinecap="round" opacity="0.85" style={{ filter: 'drop-shadow(0 3px 10px rgba(0, 0, 0, 0.6))' }} />

              {/* Center highlight line */}
              <line x1="200" y1="250" x2="200" y2="400" stroke="#FFE55C" strokeWidth="3" opacity="0.6" />
            </g>
          </svg>

          <div className="pathway-text" style={{
            fontSize: '48px',
            fontWeight: '900',
            background: 'linear-gradient(135deg, #FFD700 0%, #FFF44F 50%, #FFD700 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '6px',
            textShadow: '0 0 30px rgba(212, 175, 55, 0.4)',
            filter: 'drop-shadow(0 0 25px rgba(212, 175, 55, 0.3))',
            fontFamily: 'Georgia, serif'
          }}>
            PATHWAY
          </div>
        </div>
      </div>

      {/* LOGIN SCREEN */}
      <div className="login-screen" style={{
        width: '100%',
        maxWidth: '460px',
        padding: '52px 40px',
        background: 'linear-gradient(135deg, rgba(20, 23, 28, 0.98), rgba(13, 15, 18, 0.95))',
        border: '1px solid rgba(212, 175, 55, 0.5)',
        borderRadius: '20px',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 10px 50px rgba(212, 175, 55, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        position: 'relative',
        opacity: showIntro ? 0 : 1,
        pointerEvents: showIntro ? 'none' : 'auto'
      }}>
        {/* Background accent glow */}
        <div style={{
          position: 'absolute',
          top: '-120px',
          right: '-120px',
          width: '240px',
          height: '240px',
          background: 'radial-gradient(circle, rgba(212, 175, 55, 0.12) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none'
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Mini Logo */}
          <div style={{
            textAlign: 'center',
            marginBottom: '40px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px'
          }}>
            <svg
              viewBox="0 0 400 450"
              width="80"
              height="100"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="goldGradMini" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#FFD700', stopOpacity: '1' }} />
                  <stop offset="50%" style={{ stopColor: '#FFF44F', stopOpacity: '1' }} />
                  <stop offset="100%" style={{ stopColor: '#FFD700', stopOpacity: '1' }} />
                </linearGradient>
                <linearGradient id="silverGradMini" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#E8E8E8', stopOpacity: '1' }} />
                  <stop offset="50%" style={{ stopColor: '#F5F5F5', stopOpacity: '1' }} />
                  <stop offset="100%" style={{ stopColor: '#D0D0D0', stopOpacity: '1' }} />
                </linearGradient>
              </defs>

              <path d="M 200 180 Q 120 100 60 140 Q 100 120 150 140 Q 180 155 200 180" fill="url(#goldGradMini)" />
              <path d="M 200 180 Q 280 100 340 140 Q 300 120 250 140 Q 220 155 200 180" fill="url(#silverGradMini)" />
              <ellipse cx="200" cy="200" rx="45" ry="55" fill="url(#goldGradMini)" />
              <circle cx="200" cy="120" r="38" fill="#FFF44F" />
              <circle cx="216" cy="110" r="7" fill="#000000" />
              <circle cx="218" cy="107" r="3" fill="#FFFFFF" />
              <path d="M 170 250 Q 150 290 160 330 Q 170 370 200 400" stroke="url(#goldGradMini)" strokeWidth="26" fill="none" strokeLinecap="round" />
              <path d="M 230 250 Q 250 290 240 330 Q 230 370 200 400" stroke="url(#silverGradMini)" strokeWidth="26" fill="none" strokeLinecap="round" />
            </svg>
            <div style={{
              fontSize: '18px',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #FFD700 0%, #FFF44F 50%, #FFD700 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '2px',
              fontFamily: 'Georgia, serif'
            }}>
              PATHWAY
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ marginBottom: '28px' }}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '11px',
                fontWeight: '700',
                color: '#ffffff',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                Email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={authLoading}
                style={{
                  width: '100%',
                  padding: '13px 16px',
                  background: 'rgba(13, 15, 18, 0.8)',
                  border: '1px solid rgba(212, 175, 55, 0.2)',
                  borderRadius: '10px',
                  color: '#ffffff',
                  fontSize: '14px',
                  transition: 'all 0.3s',
                  opacity: authLoading ? 0.5 : 1,
                  cursor: authLoading ? 'not-allowed' : 'text'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.8)';
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(212, 175, 55, 0.2)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.2)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '11px',
                fontWeight: '700',
                color: '#ffffff',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={authLoading}
                style={{
                  width: '100%',
                  padding: '13px 16px',
                  background: 'rgba(13, 15, 18, 0.8)',
                  border: '1px solid rgba(212, 175, 55, 0.2)',
                  borderRadius: '10px',
                  color: '#ffffff',
                  fontSize: '14px',
                  transition: 'all 0.3s',
                  opacity: authLoading ? 0.5 : 1,
                  cursor: authLoading ? 'not-allowed' : 'text'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.8)';
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(212, 175, 55, 0.2)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.2)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '12px',
              marginBottom: '28px'
            }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                color: '#A0A0A0'
              }}>
                <input
                  type="checkbox"
                  style={{ cursor: 'pointer', accentColor: '#FFD700' }}
                  disabled={authLoading}
                />
                Remember me
              </label>
              <a href="#forgot" style={{ color: '#FFD700', textDecoration: 'none', fontWeight: '500' }}>
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={authLoading}
              style={{
                width: '100%',
                padding: '15px 16px',
                background: 'linear-gradient(135deg, #FFD700 0%, #FFF44F 50%, #FFD700 100%)',
                color: '#0a0e27',
                border: 'none',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: '700',
                letterSpacing: '1.5px',
                cursor: authLoading ? 'not-allowed' : 'pointer',
                textTransform: 'uppercase',
                marginBottom: '12px',
                opacity: authLoading ? 0.6 : 1,
                transition: 'all 0.3s',
                boxShadow: '0 6px 20px rgba(212, 175, 55, 0.25)'
              }}
              onMouseEnter={(e) => {
                if (!authLoading) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(212, 175, 55, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(212, 175, 55, 0.25)';
              }}
            >
              {authLoading ? 'Signing in...' : 'Sign In'}
            </button>

            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={authLoading}
              style={{
                width: '100%',
                padding: '15px 16px',
                background: 'rgba(59, 130, 246, 0.08)',
                color: '#3B82F6',
                border: '1px solid rgba(59, 130, 246, 0.4)',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: '700',
                letterSpacing: '1.5px',
                cursor: authLoading ? 'not-allowed' : 'pointer',
                textTransform: 'uppercase',
                opacity: authLoading ? 0.6 : 1,
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                if (!authLoading) {
                  e.currentTarget.style.background = 'rgba(59, 130, 246, 0.15)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(59, 130, 246, 0.08)';
              }}
            >
              {authLoading ? 'Loading...' : 'Demo Access'}
            </button>
          </form>

          {/* Error Messages */}
          {(localError || authError) && (
            <div style={{
              marginTop: '20px',
              padding: '12px 16px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.5)',
              borderRadius: '8px',
              color: '#FCA5A5',
              fontSize: '13px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span>{localError || authError}</span>
              <button
                onClick={() => {
                  setLocalError('');
                  clearError();
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#FCA5A5',
                  cursor: 'pointer',
                  fontSize: '18px',
                  padding: '0 8px'
                }}
              >
                ×
              </button>
            </div>
          )}

          {/* Divider */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            margin: '28px 0',
            gap: '16px',
            fontSize: '12px',
            color: '#707070'
          }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(212, 175, 55, 0.2)' }} />
            <span>or</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(212, 175, 55, 0.2)' }} />
          </div>

          {/* Signup Prompt */}
          <div style={{
            textAlign: 'center',
            fontSize: '13px',
            color: '#A0A0A0'
          }}>
            Don't have an account?{' '}
            <a href="#signup" style={{
              color: '#FFD700',
              textDecoration: 'none',
              fontWeight: '600'
            }}>
              Create one
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
