import React, { useRef, useEffect } from 'react';
import { Shield, Mic, Brain, Lock, Sparkles } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { gsap } from 'gsap';

export const LoginScreen: React.FC = () => {
  const { login, loading } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && featuresRef.current && logoRef.current && titleRef.current && subtitleRef.current && buttonRef.current) {
      const tl = gsap.timeline();
      
      // Set initial states
      gsap.set([logoRef.current, titleRef.current, subtitleRef.current, buttonRef.current], { 
        opacity: 0, 
        y: 50 
      });
      gsap.set(featuresRef.current.children, { 
        opacity: 0, 
        x: -30,
        scale: 0.9
      });

      // Animate background gradient
      gsap.to(backgroundRef.current, {
        backgroundPosition: '200% 200%',
        duration: 20,
        repeat: -1,
        yoyo: true,
        ease: "none"
      });

      // Main animation sequence
      tl.to(logoRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "back.out(1.7)"
      })
      .to(logoRef.current, {
        rotateY: 360,
        duration: 1,
        ease: "power2.inOut"
      }, "-=0.3")
      .to(titleRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power3.out"
      }, "-=0.5")
      .to(subtitleRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power3.out"
      }, "-=0.3")
      .to(featuresRef.current.children, {
        opacity: 1,
        x: 0,
        scale: 1,
        duration: 0.6,
        stagger: 0.15,
        ease: "back.out(1.2)"
      }, "-=0.2")
      .to(buttonRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "back.out(1.2)"
      }, "-=0.3");

      // Floating animation for logo
      gsap.to(logoRef.current, {
        y: -10,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "power2.inOut"
      });

      // Sparkle effect
      const sparkles = document.querySelectorAll('.sparkle');
      sparkles.forEach((sparkle, index) => {
        gsap.to(sparkle, {
          opacity: 0.8,
          scale: 1.2,
          duration: 1.5,
          repeat: -1,
          yoyo: true,
          delay: index * 0.3,
          ease: "power2.inOut"
        });
      });
    }
  }, []);

  const handleButtonHover = () => {
    if (buttonRef.current) {
      gsap.to(buttonRef.current, {
        scale: 1.05,
        duration: 0.3,
        ease: "power2.out"
      });
    }
  };

  const handleButtonLeave = () => {
    if (buttonRef.current) {
      gsap.to(buttonRef.current, {
        scale: 1,
        duration: 0.3,
        ease: "power2.out"
      });
    }
  };

  const handleFeatureHover = (element: HTMLElement) => {
    gsap.to(element, {
      scale: 1.05,
      y: -5,
      duration: 0.3,
      ease: "power2.out"
    });
  };

  const handleFeatureLeave = (element: HTMLElement) => {
    gsap.to(element, {
      scale: 1,
      y: 0,
      duration: 0.3,
      ease: "power2.out"
    });
  };

  return (
    <div 
      ref={backgroundRef}
      className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        backgroundSize: '400% 400%',
        backgroundPosition: '0% 0%'
      }}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="sparkle absolute top-20 left-20 w-2 h-2 bg-primary-400 rounded-full opacity-0"></div>
        <div className="sparkle absolute top-40 right-32 w-3 h-3 bg-accent-400 rounded-full opacity-0"></div>
        <div className="sparkle absolute bottom-32 left-40 w-2 h-2 bg-primary-300 rounded-full opacity-0"></div>
        <div className="sparkle absolute bottom-20 right-20 w-4 h-4 bg-accent-300 rounded-full opacity-0"></div>
        <div className="sparkle absolute top-1/2 left-10 w-2 h-2 bg-primary-500 rounded-full opacity-0"></div>
        <div className="sparkle absolute top-1/3 right-10 w-3 h-3 bg-accent-500 rounded-full opacity-0"></div>
      </div>

      <div 
        ref={containerRef}
        className="max-w-md w-full space-y-8 relative z-10"
      >
        {/* Logo */}
        <div className="text-center">
          <div 
            ref={logoRef}
            className="mx-auto bg-gradient-to-br from-primary-500 to-accent-500 w-20 h-20 rounded-3xl flex items-center justify-center mb-6 shadow-2xl relative"
          >
            <Shield className="w-10 h-10 text-white" />
            <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400" />
          </div>
          <h1 
            ref={titleRef}
            className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent"
          >
            Welcome to VaultNoteAi
          </h1>
          <p 
            ref={subtitleRef}
            className="text-gray-600 dark:text-gray-300 mt-3 text-lg"
          >
            AI-powered secure note-taking with voice recording
          </p>
        </div>

        {/* Features */}
        <div 
          ref={featuresRef}
          className="space-y-4"
        >
          <div 
            className="bg-white/20 dark:bg-gray-800/20 backdrop-blur-lg rounded-2xl p-6 border border-white/30 shadow-xl cursor-pointer transition-all duration-300"
            onMouseEnter={(e) => handleFeatureHover(e.currentTarget)}
            onMouseLeave={(e) => handleFeatureLeave(e.currentTarget)}
          >
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/50 dark:to-primary-800/50 p-3 rounded-xl">
                <Mic className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-lg">Voice Recording</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Real-time transcription with AI</p>
              </div>
            </div>
          </div>

          <div 
            className="bg-white/20 dark:bg-gray-800/20 backdrop-blur-lg rounded-2xl p-6 border border-white/30 shadow-xl cursor-pointer transition-all duration-300"
            onMouseEnter={(e) => handleFeatureHover(e.currentTarget)}
            onMouseLeave={(e) => handleFeatureLeave(e.currentTarget)}
          >
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-accent-100 to-accent-200 dark:from-accent-900/50 dark:to-accent-800/50 p-3 rounded-xl">
                <Brain className="w-6 h-6 text-accent-600 dark:text-accent-400" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-lg">AI Summarization</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Smart insights & key points</p>
              </div>
            </div>
          </div>

          <div 
            className="bg-white/20 dark:bg-gray-800/20 backdrop-blur-lg rounded-2xl p-6 border border-white/30 shadow-xl cursor-pointer transition-all duration-300"
            onMouseEnter={(e) => handleFeatureHover(e.currentTarget)}
            onMouseLeave={(e) => handleFeatureLeave(e.currentTarget)}
          >
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-success-100 to-success-200 dark:from-success-900/50 dark:to-success-800/50 p-3 rounded-xl">
                <Lock className="w-6 h-6 text-success-600 dark:text-success-400" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-lg">Blockchain Security</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Immutable & encrypted storage</p>
              </div>
            </div>
          </div>
        </div>

        {/* Login Button */}
        <div className="space-y-4">
          <button
            ref={buttonRef}
            onClick={login}
            disabled={loading}
            onMouseEnter={handleButtonHover}
            onMouseLeave={handleButtonLeave}
            className="w-full bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 disabled:opacity-50 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 shadow-2xl relative overflow-hidden"
          >
            <span className="relative z-10">
              {loading ? 'Connecting...' : 'Login with Internet Identity'}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
          </button>
          
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center leading-relaxed">
            Secure, passwordless authentication powered by Internet Computer
          </p>
        </div>
      </div>
    </div>
  );
};