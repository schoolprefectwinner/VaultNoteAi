import React, { useRef, useEffect } from 'react';
import { Shield, Moon, Sun, LogOut, Settings, Sparkles } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { gsap } from 'gsap';

interface HeaderProps {
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
}

export const Header: React.FC<HeaderProps> = ({ theme, onThemeToggle }) => {
  const { isAuthenticated, logout } = useAuth();
  const headerRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (headerRef.current && logoRef.current && titleRef.current && actionsRef.current) {
      // Set initial states
      gsap.set([logoRef.current, titleRef.current, actionsRef.current], {
        opacity: 0,
        y: -20
      });

      // Animation timeline
      const tl = gsap.timeline();
      
      tl.to(headerRef.current, {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: "power3.out"
      })
      .to(logoRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "back.out(1.7)"
      }, "-=0.5")
      .to(titleRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out"
      }, "-=0.4")
      .to(actionsRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out"
      }, "-=0.3");

      // Logo floating animation
      gsap.to(logoRef.current, {
        y: -2,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "power2.inOut"
      });

      // Sparkle rotation
      const sparkle = logoRef.current.querySelector('.sparkle');
      if (sparkle) {
        gsap.to(sparkle, {
          rotation: 360,
          duration: 4,
          repeat: -1,
          ease: "none"
        });
      }
    }
  }, []);

  const handleButtonHover = (element: HTMLElement) => {
    gsap.to(element, {
      scale: 1.1,
      duration: 0.2,
      ease: "power2.out"
    });
  };

  const handleButtonLeave = (element: HTMLElement) => {
    gsap.to(element, {
      scale: 1,
      duration: 0.2,
      ease: "power2.out"
    });
  };

  const handleThemeToggle = () => {
    // Theme toggle animation
    const button = document.querySelector('.theme-toggle');
    if (button) {
      gsap.to(button, {
        rotation: 180,
        duration: 0.5,
        ease: "back.out(1.7)"
      });
    }
    onThemeToggle();
  };

  const handleLogout = () => {
    // Logout animation
    if (headerRef.current) {
      gsap.to(headerRef.current, {
        opacity: 0.5,
        duration: 0.3,
        ease: "power2.out",
        onComplete: () => {
          logout();
        }
      });
    }
  };

  return (
    <header 
      ref={headerRef}
      className="bg-white/20 dark:bg-gray-900/20 backdrop-blur-xl border-b border-white/30 dark:border-gray-700/30 sticky top-0 z-50 shadow-lg"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <div 
              ref={logoRef}
              className="relative bg-gradient-to-br from-primary-500 to-accent-500 p-3 rounded-2xl shadow-lg"
            >
              <Shield className="w-8 h-8 text-white" />
              <Sparkles className="sparkle absolute -top-1 -right-1 w-4 h-4 text-yellow-400" />
            </div>
            <div ref={titleRef}>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                VaultNoteAi
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                AI-Powered Secure Notes
              </p>
            </div>
          </div>

          {/* Actions */}
          <div 
            ref={actionsRef}
            className="flex items-center space-x-3"
          >
            {/* Theme Toggle */}
            <button
              onClick={handleThemeToggle}
              onMouseEnter={(e) => handleButtonHover(e.currentTarget)}
              onMouseLeave={(e) => handleButtonLeave(e.currentTarget)}
              className="theme-toggle p-3 rounded-xl bg-white/20 dark:bg-gray-800/20 hover:bg-white/30 dark:hover:bg-gray-800/30 transition-all duration-300 backdrop-blur-sm border border-white/30"
            >
              {theme === 'dark' ? (
                <Sun className="w-6 h-6 text-yellow-500" />
              ) : (
                <Moon className="w-6 h-6 text-gray-600" />
              )}
            </button>

            {/* Settings */}
            <button 
              onMouseEnter={(e) => handleButtonHover(e.currentTarget)}
              onMouseLeave={(e) => handleButtonLeave(e.currentTarget)}
              className="p-3 rounded-xl bg-white/20 dark:bg-gray-800/20 hover:bg-white/30 dark:hover:bg-gray-800/30 transition-all duration-300 backdrop-blur-sm border border-white/30"
            >
              <Settings className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </button>

            {/* Logout */}
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                onMouseEnter={(e) => handleButtonHover(e.currentTarget)}
                onMouseLeave={(e) => handleButtonLeave(e.currentTarget)}
                className="p-3 rounded-xl bg-white/20 dark:bg-gray-800/20 hover:bg-error-500/20 transition-all duration-300 backdrop-blur-sm border border-white/30 hover:border-error-400/50"
              >
                <LogOut className="w-6 h-6 text-gray-700 dark:text-gray-300 hover:text-error-500" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};