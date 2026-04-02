import React, { useState, useEffect } from 'react';
import { Button } from 'reshaped';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';

export const Header: React.FC = () => {
  const { currentPage, setCurrentPage, theme, setTheme } = useApp();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user);
      if (!user) return;
      supabase.from('profiles').select('role').eq('id', user.id).single()
        .then(({ data }) => setIsAdmin(data?.role === 'admin'));
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setIsLoggedIn(!!session);
      if (!session) { setIsAdmin(false); return; }
      supabase.from('profiles').select('role').eq('id', session.user.id).single()
        .then(({ data }) => setIsAdmin(data?.role === 'admin'));
    });
    return () => subscription.unsubscribe();
  }, []);

  const navItems = [
    { id: 'page-icons', label: 'Icon Studio' },
    { id: 'page-id-2d', label: '2D Studio' },
    { id: 'page-id-3d', label: '3D Studio' },
    { id: 'page-image', label: 'Image Studio' },
  ];
  
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };
  
  return (
    <header
      className="app-header"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 24px',
        borderBottom: '1px solid var(--border-color, #e0e0e0)',
      }}
    >
      <div className="logo">
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>Creon</h1>
      </div>
      <nav className="main-nav" style={{ display: 'flex', gap: '16px' }}>
        <a
          href="#"
          className={`nav-item ${currentPage === 'page-usages' ? 'active' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            setCurrentPage('page-usages');
          }}
          style={{
            padding: '8px 16px',
            textDecoration: 'none',
            color: currentPage === 'page-usages' ? 'var(--accent-color, #2962FF)' : 'var(--text-primary, #212121)',
            borderBottom: currentPage === 'page-usages' ? '2px solid var(--accent-color, #2962FF)' : '2px solid transparent'
          }}
        >
          Home
        </a>
        {navItems.map((item) => (
          <a
            key={item.id}
            href="#"
            className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              setCurrentPage(item.id);
            }}
            style={{
              padding: '8px 16px',
              textDecoration: 'none',
              color: currentPage === item.id ? 'var(--accent-color, #2962FF)' : 'var(--text-primary, #212121)',
              borderBottom: currentPage === item.id ? '2px solid var(--accent-color, #2962FF)' : '2px solid transparent'
            }}
          >
            {item.label}
          </a>
        ))}
      </nav>
      <div className="header-actions" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        {isLoggedIn ? (
          <>
            <Button
              variant="ghost"
              size="small"
              onClick={() => setCurrentPage('page-storage')}
              aria-label="내 스토리지"
              aria-pressed={currentPage === 'page-storage'}
            >
              <span className="material-symbols-outlined"
                style={{ color: currentPage === 'page-storage' ? 'var(--accent-color, #2962FF)' : undefined }}>
                photo_library
              </span>
            </Button>
            {isAdmin && (
              <Button
                variant="ghost"
                size="small"
                onClick={() => setCurrentPage('page-admin')}
                aria-label="어드민"
                aria-pressed={currentPage === 'page-admin'}
              >
                <span className="material-symbols-outlined"
                  style={{ color: currentPage === 'page-admin' ? 'var(--accent-color, #2962FF)' : undefined }}>
                  admin_panel_settings
                </span>
              </Button>
            )}
          </>
        ) : (
          <>
            <button
              onClick={() => (window as any).creonAuth?.openModal?.('login')}
              style={{
                padding: '7px 16px',
                fontSize: '14px',
                fontWeight: 500,
                background: 'none',
                border: '1px solid var(--border-color, #e0e0e0)',
                borderRadius: '8px',
                cursor: 'pointer',
                color: 'var(--text-primary, #212121)',
              }}
            >
              로그인
            </button>
            <button
              onClick={() => (window as any).creonAuth?.openModal?.('signup')}
              style={{
                padding: '7px 16px',
                fontSize: '14px',
                fontWeight: 500,
                background: 'var(--accent-color, #2962FF)',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                color: '#fff',
              }}
            >
              회원가입
            </button>
          </>
        )}
        <Button
          variant="ghost"
          size="small"
          onClick={toggleTheme}
          aria-pressed={theme === 'dark'}
          aria-label={theme === 'light' ? '다크 모드로 전환' : '라이트 모드로 전환'}
        >
          <span className="material-symbols-outlined">
            {theme === 'light' ? 'light_mode' : 'dark_mode'}
          </span>
        </Button>
      </div>
    </header>
  );
};

