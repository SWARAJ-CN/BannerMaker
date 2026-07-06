import React, { useState, useEffect } from 'react';
import InstaGridCropper from '../components/InstaGridCropper';
import InstaStoryTemplates from '../components/InstaStoryTemplates';
import StudioImageRemover from '../components/StudioImageRemover';

import { FiInstagram, FiHeart, FiGrid, FiLayout, FiImage, FiLogOut } from 'react-icons/fi';
import { FaGooglePay } from "react-icons/fa";

export default function Home() {
  const [activeTool, setActiveTool] = useState('grid');
  const [username, setUsername] = useState('Creator');

  useEffect(() => {
    // Parse the active user profile data out of storage
    const activeSession = localStorage.getItem("gridflow_session");
    if (activeSession) {
      try {
        const userData = JSON.parse(activeSession);
        if (userData && userData.username) {
          setUsername(userData.username);
        }
      } catch (err) {
        console.error("Failed to parse user session stream:", err);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("gridflow_session");
    window.location.reload(); // Hard re-route parameters back to entry node
  };

  const handleTemplateSelect = (template) => {
    console.log("Selected story template:", template);
  };

  // Extract first letter parameter for avatar graphic mapping
  const avatarLetter = username.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased">
      {/* Navigation Header */}
      <header className="border-b border-slate-900 bg-slate-950/70 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Logo Brand Block */}
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/10">
              <FiInstagram className="text-slate-950 w-4 h-4 stroke-[2.5]" />
            </div>
            <h1 className="text-xs font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 font-mono">
              GRIDFLOW PRO
            </h1>
          </div>

          {/* Action Ribbon Links */}
          <div className="flex items-center bg-slate-900/60 border border-slate-800 p-1 rounded-xl shadow-inner">
            <a 
              href="https://www.instagram.com/s.waraj_/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-bold text-slate-400 hover:text-cyan-400 transition-colors px-3 py-1.5 flex items-center gap-1.5 border-r border-slate-800"
            >
              <FiInstagram className="text-pink-500 w-3.5 h-3.5" />
              <span>Developer</span>
            </a> 
            
            <a 
              href="upi://pay?pa=swarajcn774@okicici"
              className="text-[11px] font-bold text-slate-400 hover:text-emerald-400 transition-colors px-3 py-1.5 flex items-center gap-1 border-r border-slate-800"
            >
              <FaGooglePay className="text-blue-400 text-xl leading-none" />
              <span className="-ml-0.5">Donate</span>
            </a>

            <a 
              href="https://www.instagram.com/bann.er433/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-bold text-slate-400 hover:text-cyan-400 transition-colors px-3 py-1.5 flex items-center gap-1.5"
            >
              <FiInstagram className="text-cyan-400 w-3.5 h-3.5" />
              <span>More Posts</span>
            </a>
          </div>

          {/* User Session Profile Badge & Logout Interface */}
          <div className="flex items-center gap-3.5">
            {/* Identity Group */}
            <div className="flex items-center gap-2 bg-slate-900/40 border border-slate-800/80 pl-2 pr-3 py-1 rounded-xl">
              <div className="h-6 w-6 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-xs font-black text-cyan-400 font-mono shadow-sm">
                {avatarLetter}
              </div>
              <span className="text-[11px] font-bold text-slate-300 tracking-wide font-mono">
                @{username.toLowerCase()}
              </span>
            </div>

            {/* Logout Terminal Trigger */}
            <button
              onClick={handleLogout}
              title="Terminate Session"
              className="p-2 rounded-xl bg-slate-900/40 border border-slate-800/80 text-slate-400 hover:text-rose-400 hover:border-rose-950/50 hover:bg-rose-950/10 transition-all duration-200"
            >
              <FiLogOut className="w-3.5 h-3.5" />
            </button>
          </div>
          
        </div>
      </header>

      {/* Main Workspace Layout Wrapper */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 md:py-8 space-y-6">
        
        {/* Modern Brutalist Multi-Tool Selection Grid Toggles */}
        <div className="grid grid-cols-3 gap-3 bg-slate-900/40 p-1.5 rounded-2xl border border-slate-800/80 max-w-2xl mx-auto">
          <button
            onClick={() => setActiveTool('grid')}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${
              activeTool === 'grid'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black shadow-lg shadow-cyan-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <FiGrid className="w-4 h-4 stroke-[2.5]" />
            <span>Feed Grid</span>
          </button>

          <button
            onClick={() => setActiveTool('remover')}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${
              activeTool === 'remover'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black shadow-lg shadow-cyan-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <FiImage className="w-4 h-4 stroke-[2.5]" />
            <span>BG Remover</span>
          </button>

          <button
            onClick={() => setActiveTool('story')}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${
              activeTool === 'story'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black shadow-lg shadow-cyan-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <FiLayout className="w-4 h-4 stroke-[2.5]" />
            <span>Story Studio</span>
          </button>
        </div>

        {/* Dynamic Tool Window Viewport Render */}
        <div className="transition-all duration-300 transform">
          {activeTool === 'grid' && <InstaGridCropper />}
          {activeTool === 'remover' && <StudioImageRemover />}
          {activeTool === 'story' && <InstaStoryTemplates onSelectTemplate={handleTemplateSelect} />}
        </div>

      </main>
    </div>
  );
}