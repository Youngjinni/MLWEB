import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Activity, BarChart3, CreditCard, LogOut, Menu, MessageCircle, UserRound, X } from 'lucide-react';
import { logout, tokenStorage } from '../api/auth';

const Header = ({ onAuthChange }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setIsLoggedIn(!!tokenStorage.getAccess());
    setIsMenuOpen(false);
  }, [location]);

  const handleLogout = async () => {
    if (!window.confirm('로그아웃 하시겠습니까?')) return;
    try { await logout(); } catch { tokenStorage.clear(); }
    setIsLoggedIn(false);
    if (onAuthChange) onAuthChange(false);
    navigate('/');
  };

  const goTo = (path) => { navigate(path); setIsMenuOpen(false); };

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <div className="nav-left">
          <button className="brand" type="button" onClick={() => goTo('/')}>
            <span className="brand-mark">ML</span><span>ML Web</span>
          </button>
          <nav className="desktop-nav">
            <button className={location.pathname.startsWith('/posts') ? 'nav-item is-active' : 'nav-item'}
              type="button" onClick={() => goTo('/posts')}>
              <MessageCircle size={15} /> 커뮤니티
            </button>
          </nav>
        </div>
        <nav className="desktop-nav nav-right">
          {isLoggedIn ? (
            <>
              <button className={location.pathname === '/analysis/lstm' ? 'nav-item is-active' : 'nav-item'}
                type="button" onClick={() => goTo('/analysis/lstm')}><Activity size={15} /> LSTM 분석</button>
              <button className={location.pathname === '/analysis/rf' ? 'nav-item is-active' : 'nav-item'}
                type="button" onClick={() => goTo('/analysis/rf')}><BarChart3 size={15} /> RF 분석</button>
              <button className={location.pathname === '/payment' ? 'nav-item is-active' : 'nav-item'}
                type="button" onClick={() => goTo('/payment')}><CreditCard size={15} /> 구독</button>
              <button className={location.pathname === '/profile' ? 'nav-item is-active' : 'nav-item'}
                type="button" onClick={() => goTo('/profile')}><UserRound size={15} /> 마이페이지</button>
              <button className="nav-item logout" type="button" onClick={handleLogout}>
                <LogOut size={15} /> 로그아웃</button>
            </>
          ) : (
            <>
              <button className="nav-item" type="button" onClick={() => goTo('/login')}>로그인</button>
              <button className="primary-button compact" type="button" onClick={() => goTo('/signup')}>회원가입</button>
            </>
          )}
        </nav>
        <button className="icon-button mobile-menu" type="button"
          onClick={() => setIsMenuOpen(v => !v)} aria-label="메뉴">
          {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      {isMenuOpen && (
        <nav className="mobile-nav">
          <button className="mobile-nav-item" type="button" onClick={() => goTo('/posts')}><MessageCircle size={18} /> 커뮤니티</button>
          {isLoggedIn ? (
            <>
              <button className="mobile-nav-item" type="button" onClick={() => goTo('/analysis/lstm')}><Activity size={18} /> LSTM 분석</button>
              <button className="mobile-nav-item" type="button" onClick={() => goTo('/analysis/rf')}><BarChart3 size={18} /> RF 분석</button>
              <button className="mobile-nav-item" type="button" onClick={() => goTo('/payment')}><CreditCard size={18} /> 구독</button>
              <button className="mobile-nav-item" type="button" onClick={() => goTo('/profile')}><UserRound size={18} /> 마이페이지</button>
              <button className="mobile-nav-item muted" type="button" onClick={handleLogout}><LogOut size={18} /> 로그아웃</button>
            </>
          ) : (
            <>
              <button className="mobile-nav-item" type="button" onClick={() => goTo('/login')}>로그인</button>
              <button className="mobile-nav-item" type="button" onClick={() => goTo('/signup')}>회원가입</button>
            </>
          )}
        </nav>
      )}
    </header>
  );
};

export default Header;
