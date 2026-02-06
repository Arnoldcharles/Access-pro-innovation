import React from 'react';
import { QrCode, Zap, BarChart3, Users, CheckCircle2, ArrowRight } from 'lucide-react';

const FixedLandingPage = () => {
  return (
    /* 1. The Root: 'overflow-hidden' prevents horizontal scroll.
       2. The Wrapper: 'max-w-[1400px]' keeps it from getting too wide on huge monitors.
       3. 'mx-auto' centers that wrapper.
       4. 'px-6 sm:px-12' creates the 'air' at the edges.
    */
    <div className="min-h-screen bg-[#030712] text-slate-100 font-sans antialiased overflow-x-hidden">
      <div className="max-w-[1300px] mx-auto px-6 sm:px-10 lg:px-16">
        
        {/* Navigation - Added top margin so it doesn't touch the top browser bar */}
        <nav className="flex items-center justify-between py-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-bold shadow-lg shadow-blue-500/20">A</div>
            <span className="font-bold text-xl tracking-tight">AccessPro <span className="text-blue-500 text-[10px] ml-1 uppercase">Beta</span></span>
          </div>
          <button className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Sign In</button>
        </nav>

        {/* Hero Section */}
        <section className="py-12 lg:py-20 grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-400">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              Now powering 500+ events
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1]">
              Event check-in <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
                reimagined.
              </span>
            </h1>

            <p className="text-lg text-slate-400 max-w-lg leading-relaxed">
              Stop fighting with spreadsheets. Auto-generate QR passes and track attendance in real-time with one intuitive platform.
            </p>

            <div className="flex flex-wrap gap-4">
              <button className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-all shadow-xl shadow-blue-600/20 flex items-center gap-2 group">
                Start Free Trial <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-8 py-4 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white font-semibold rounded-2xl transition-all">
                View Events
              </button>
            </div>
          </div>

          {/* Glass Card Preview */}
          <div className="relative group lg:ml-auto w-full max-w-md">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-[2rem] blur opacity-20"></div>
            <div className="relative bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 shadow-2xl">
              <div className="flex justify-between items-center mb-8">
                <h3 className="font-bold text-lg">Live Dashboard</h3>
                <span className="text-[10px] font-black text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-md border border-emerald-400/20 uppercase tracking-widest">Active</span>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                  <span className="text-xs text-slate-500 block mb-1">Checked-in</span>
                  <span className="text-3xl font-black">39</span>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                  <span className="text-xs text-slate-500 block mb-1">Pending</span>
                  <span className="text-3xl font-black text-slate-600">32</span>
                </div>
              </div>
              <div className="space-y-3">
                {['Scan QR pass', 'Update attendance', 'View analytics'].map((text) => (
                  <div key={text} className="flex items-center gap-3 text-sm text-slate-300 font-medium">
                    <CheckCircle2 size={16} className="text-blue-500" /> {text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Workflow Section */}
        <section className="py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">The complete event workflow</h2>
            <p className="text-slate-500">Everything you need to handle guests at scale.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { title: 'Collect RSVPs', icon: <Users /> },
              { title: 'Generate Passes', icon: <QrCode /> },
              { title: 'Scan at Entry', icon: <Zap /> },
              { title: 'Track & Export', icon: <BarChart3 /> },
            ].map((item, i) => (
              <div key={i} className="p-8 bg-slate-900/40 border border-slate-800 rounded-[2rem] hover:border-blue-500/50 transition-colors group">
                <div className="w-12 h-12 rounded-xl bg-blue-600/10 text-blue-500 flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  {item.icon}
                </div>
                <h4 className="font-bold text-lg mb-2">{item.title}</h4>
                <p className="text-sm text-slate-500 leading-relaxed">Instant confirmation and data syncing across all devices.</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Footer Section - Added Bottom Margin to keep it off the very bottom edge */}
        <section className="mb-20">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-800 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
             <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Ready to transform your events?</h2>
              <p className="text-blue-100/70 max-w-xl mx-auto text-lg mb-10 leading-relaxed">
                Join 2,000+ organizers already using AccessPro for seamless guest management.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button className="px-10 py-4 bg-white text-blue-700 font-bold rounded-2xl hover:bg-blue-50 transition-colors shadow-xl">Get Started for Free</button>
                <button className="px-10 py-4 bg-blue-700 text-white font-bold rounded-2xl border border-blue-400/30 hover:bg-blue-800 transition-colors">Contact Sales</button>
              </div>
            </div>
          </div>
        </section>

        <footer className="py-10 border-t border-white/5 text-center text-slate-600 text-[10px] font-bold uppercase tracking-widest">
          &copy; 2026 AccessPro Innovation. All Rights Reserved.
        </footer>
      </div>
    </div>
  );
};

export default FixedLandingPage;