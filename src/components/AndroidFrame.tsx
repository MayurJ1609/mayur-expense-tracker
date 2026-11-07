import React, { useState, useEffect } from 'react';
import { ActiveScreen } from '../types/expense';
import { 
  LayoutDashboard, 
  Receipt, 
  MessageSquareText, 
  CreditCard, 
  Code2, 
  Smartphone, 
  Monitor, 
  Wifi, 
  BatteryMedium, 
  Plus, 
  Sparkles 
} from 'lucide-react';

interface AndroidFrameProps {
  currentScreen: ActiveScreen;
  onSelectScreen: (screen: ActiveScreen) => void;
  onOpenFlutterCode: () => void;
  onOpenSimulateSms: () => void;
  smsCount: number;
  unreadSmsCount: number;
  children: React.ReactNode;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({
  currentScreen,
  onSelectScreen,
  onOpenFlutterCode,
  onOpenSimulateSms,
  smsCount,
  unreadSmsCount,
  children,
}) => {
  const [isPhoneFrameMode, setIsPhoneFrameMode] = useState(true);
  const [currentTime, setCurrentTime] = useState('09:41');

  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setCurrentTime(d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  const navItems: { id: ActiveScreen; label: string; icon: React.FC<{ className?: string }>; badge?: number }[] = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'expenses', label: 'Expenses', icon: Receipt },
    { id: 'sms', label: 'SMS Inbox', icon: MessageSquareText, badge: unreadSmsCount > 0 ? unreadSmsCount : undefined },
    { id: 'cards', label: 'Cards', icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center">
      {/* Top Universal App Control Bar */}
      <header className="w-full border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          {/* Brand Wordmark Zone */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/20">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-base tracking-tight">SpendTrack SMS</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800/60 hidden sm:inline-block">
                  Flutter & Material 3
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                SMS expense tracker with Credit vs. Debit & Bank name extraction
              </p>
            </div>
          </div>

          {/* Quick Action Controls */}
          <div className="flex items-center gap-2.5">
            {/* View Mode Switcher: Mobile Phone Frame vs Desktop Full Canvas */}
            <div className="hidden md:flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 text-xs">
              <button
                type="button"
                onClick={() => setIsPhoneFrameMode(true)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                  isPhoneFrameMode
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Pixel Frame</span>
              </button>
              <button
                type="button"
                onClick={() => setIsPhoneFrameMode(false)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                  !isPhoneFrameMode
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Expanded</span>
              </button>
            </div>

            {/* Simulate Bank SMS Trigger */}
            <button
              onClick={onOpenSimulateSms}
              className="px-3 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Simulate</span>
              <span>SMS</span>
            </button>

            {/* Flutter Source Code (Dart) Button */}
            <button
              onClick={onOpenFlutterCode}
              className="px-3.5 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 shadow-md shadow-indigo-600/30 active:scale-95 transition-all border border-indigo-400/30"
              title="View & Download Flutter (Dart) Source Code"
            >
              <Code2 className="w-4 h-4 text-cyan-300" />
              <span>Flutter Code (Dart)</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace: Either Pixel 9 Pro Frame or Full Desktop */}
      <main className="w-full flex-1 flex justify-center py-4 sm:py-6 px-2 sm:px-4">
        {isPhoneFrameMode ? (
          /* Phone Frame Container */
          <div className="w-full max-w-[430px] h-[860px] bg-slate-950 rounded-[48px] border-[10px] border-slate-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.08)] flex flex-col relative overflow-hidden ring-1 ring-slate-800/80">
            {/* Android Status Bar */}
            <div className="h-10 px-6 bg-slate-950 flex items-center justify-between text-xs font-semibold text-slate-300 select-none z-30 shrink-0">
              <span className="font-mono tabular-nums">{currentTime}</span>

              {/* Camera Notch Hole */}
              <div className="w-4 h-4 rounded-full bg-black border border-slate-800 shadow-inner" />

              <div className="flex items-center gap-2 text-slate-400">
                <span className="text-[10px] font-bold text-slate-300">5G</span>
                <Wifi className="w-3.5 h-3.5 text-slate-300" />
                <BatteryMedium className="w-4 h-4 text-slate-300" />
              </div>
            </div>

            {/* Mobile App Header */}
            <div className="px-5 py-3 bg-slate-950/90 border-b border-slate-900 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                  S
                </div>
                <div>
                  <h1 className="text-xs font-extrabold text-white tracking-tight uppercase">SpendTrack</h1>
                  <span className="text-[10px] text-slate-400 block -mt-0.5">Android · Stitch UI</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenSimulateSms}
                  className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30 flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  <span>SMS</span>
                </button>
              </div>
            </div>

            {/* Scrollable Screen Content */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {children}
            </div>

            {/* Material 3 Bottom Navigation Bar */}
            <div className="bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-3 py-1.5 flex items-center justify-around shrink-0 z-30">
              {navItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = currentScreen === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectScreen(item.id)}
                    className="flex flex-col items-center justify-center py-1 px-3 rounded-2xl relative transition-all group min-w-[64px]"
                  >
                    {/* Material 3 Active Pill Indicator */}
                    <div
                      className={`px-4 py-1 rounded-full transition-all flex items-center justify-center ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                          : 'text-slate-400 group-hover:text-slate-200'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <span
                      className={`text-[10px] mt-1 tracking-tight font-medium ${
                        isActive ? 'text-indigo-400 font-bold' : 'text-slate-400 group-hover:text-slate-300'
                      }`}
                    >
                      {item.label}
                    </span>
                    {item.badge && (
                      <span className="absolute top-1 right-3 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center shadow-sm">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Android Bottom Home Gesture Pill */}
            <div className="h-4 bg-slate-900/95 flex items-center justify-center shrink-0">
              <div className="w-24 h-1 bg-slate-600 rounded-full" />
            </div>
          </div>
        ) : (
          /* Expanded Multi-Column Desktop Layout */
          <div className="w-full max-w-6xl space-y-6">
            {/* Desktop Navigation Tabs */}
            <div className="flex items-center gap-2 p-1.5 bg-slate-900 border border-slate-800 rounded-2xl">
              {navItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = currentScreen === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectScreen(item.id)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-3xl min-h-[700px]">
              {children}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
