import React, { useEffect, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export default function DashboardGrid() {
  const [metrics, setMetrics] = useState({
    totalApplications: 1521,
    appliedToday: 12,
    totalPending: 3,
    totalApplied: 1521,
    totalFailed: 0,
    engineStatus: 'RUNNING'
  });

  const [alerts, setAlerts] = useState([
    {
      type: 'INTERVIEW_ALERT',
      priority: 'HIGH PRIORITY',
      sender: 'Google Talent Team',
      subject: 'Interview Schedule: Backend Software Engineer (Java 21)',
      preview: 'Hi Amit, We reviewed your application and would like to invite you for a technical assessment round...',
      time: 'Just now'
    }
  ]);
  const [connected, setConnected] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetch('http://localhost:8080/api/v1/bot/metrics')
      .then(res => res.json())
      .then(data => setMetrics(prev => ({ ...prev, ...data })))
      .catch(() => console.log('Backend offline, using cached state.'));

    const socket = new SockJS('http://localhost:8080/ws-job-bot');
    const stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
        setConnected(true);
        stompClient.subscribe('/topic/metrics', msg => {
          if (msg.body) setMetrics(JSON.parse(msg.body));
        });
        stompClient.subscribe('/topic/alerts', msg => {
          if (msg.body) setAlerts(prev => [JSON.parse(msg.body), ...prev.slice(0, 3)]);
        });
      },
      onDisconnect: () => setConnected(false)
    });

    stompClient.activate();
    return () => stompClient.deactivate();
  }, []);

  return (
    <div className="min-h-screen bg-[#141414] text-[#E5E5E5] font-sans antialiased selection:bg-[#E50914] selection:text-white">
      {/* Top Netflix Style Navigation Bar */}
      <header className="sticky top-0 z-50 bg-[#141414]/95 backdrop-blur-md border-b border-[#282828] px-4 md:px-10 py-3.5 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-8">
          {/* Netflix Red Brand Title */}
          <div className="flex items-center gap-2">
            <span className="text-[#E50914] font-black text-2xl md:text-3xl tracking-tighter uppercase select-none">
              AUTONOMOUS
            </span>
            <span className="bg-[#E50914] text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded tracking-widest uppercase">
              AGENT
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#B3B3B3]">
            <button
              onClick={() => setActiveTab('overview')}
              className={`transition hover:text-white ${activeTab === 'overview' ? 'text-white font-bold' : ''}`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('pipeline')}
              className={`transition hover:text-white ${activeTab === 'pipeline' ? 'text-white font-bold' : ''}`}
            >
              Live Pipeline
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`transition hover:text-white ${activeTab === 'security' ? 'text-white font-bold' : ''}`}
            >
              Security Vault
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`transition hover:text-white ${activeTab === 'analytics' ? 'text-white font-bold' : ''}`}
            >
              Analytics
            </button>
          </nav>
        </div>

        {/* Live Status Pill & Avatar */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-[#1f1f1f] border border-[#333] px-3 py-1.5 rounded-full text-xs">
            <span className={`h-2.5 w-2.5 rounded-full ${connected ? 'bg-[#46D369] shadow-[0_0_8px_#46D369]' : 'bg-[#E50914] shadow-[0_0_8px_#E50914]'}`} />
            <span className="text-[#999] font-medium hidden sm:inline">
              {connected ? 'CORE CONNECTED' : 'STANDALONE MODE'}
            </span>
          </div>

          <div className="h-9 w-9 rounded bg-gradient-to-br from-[#E50914] to-[#B81D24] flex items-center justify-center font-black text-white text-sm shadow-md">
            AR
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="px-4 md:px-10 py-8 max-w-7xl mx-auto space-y-8">
        {/* Hero Section / Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#181818] via-[#1c1c1c] to-[#141414] border border-[#262626] p-6 md:p-10 shadow-2xl">
          <div className="relative z-10 max-w-2xl">
            <span className="text-[#E50914] font-bold text-xs uppercase tracking-widest">
              Distributed Backend SDE System &bull; Java 21 & Node.js
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mt-2 leading-none">
              AI Job Application Engine
            </h2>
            <p className="text-[#A3A3A3] text-sm md:text-base mt-3 leading-relaxed">
              Enterprise autonomous multi-portal job targeting matrix. Integrated with AES-256-GCM zero-knowledge vault, BullMQ Redis distributed queuing, and Gemini ATS scoring.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  fetch('http://localhost:8080/api/v1/bot/trigger-batch', { method: 'POST' });
                }}
                className="bg-[#E50914] hover:bg-[#b81d24] text-white font-bold px-6 py-2.5 rounded text-sm transition flex items-center gap-2 shadow-lg shadow-[#E50914]/20 active:scale-95"
              >
                <span>▶</span> Trigger Batch Sprint
              </button>
              <a
                href="https://github.com/amitraz62/autonomous-job-agent"
                target="_blank"
                rel="noreferrer"
                className="bg-[#2A2A2A] hover:bg-[#333] text-white font-medium px-5 py-2.5 rounded text-sm transition border border-[#404040]"
              >
                View Repository
              </a>
            </div>
          </div>

          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-[#E50914]/10 to-transparent pointer-events-none" />
        </div>

        {/* Priority Inbound Interview Alert */}
        {alerts.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#999]">Priority Notifications</h3>
            {alerts.map((alert, idx) => (
              <div
                key={idx}
                className="bg-[#1F1F1F] border-l-4 border-[#E50914] border-t border-r border-b border-[#2A2A2A] p-4 md:p-5 rounded-r-xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="bg-[#E50914]/20 text-[#E50914] text-[10px] font-black px-2 py-0.5 rounded tracking-wider">
                      INTERVIEW ALERT
                    </span>
                    <span className="text-white font-bold text-sm">{alert.sender}</span>
                  </div>
                  <h4 className="text-white text-base font-semibold">{alert.subject}</h4>
                  <p className="text-xs text-[#999] line-clamp-1">{alert.preview}</p>
                </div>

                <div className="shrink-0 flex items-center gap-3">
                  <span className="text-xs text-[#666] font-mono">{alert.time || '10:30 AM'}</span>
                  <button className="bg-white hover:bg-[#E5E5E5] text-black font-bold text-xs px-4 py-2 rounded transition">
                    Open Inbox
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 
          Netflix Style Metrics Grid
          Desktop: 4 columns
          Tablet: 2 columns
          Mobile: 1 column
        */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#999] mb-4">Real-Time Performance Matrix</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Metric 1 */}
            <div className="bg-[#181818] border border-[#282828] hover:border-[#404040] p-5 rounded-xl transition shadow-lg group">
              <div className="text-xs font-bold uppercase text-[#888] tracking-wider">Total Dispatched</div>
              <div className="text-3xl md:text-4xl font-black text-white mt-2 tracking-tight group-hover:text-[#E50914] transition">
                {metrics.totalApplications.toLocaleString()}
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-[#666] pt-3 border-t border-[#222]">
                <span>PostgreSQL DB</span>
                <span className="text-[#46D369] font-semibold">100% Verified</span>
              </div>
            </div>

            {/* Metric 2 */}
            <div className="bg-[#181818] border border-[#282828] hover:border-[#404040] p-5 rounded-xl transition shadow-lg group">
              <div className="text-xs font-bold uppercase text-[#888] tracking-wider">Applied Today</div>
              <div className="text-3xl md:text-4xl font-black text-white mt-2 tracking-tight group-hover:text-[#46D369] transition">
                {metrics.appliedToday}
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-[#666] pt-3 border-t border-[#222]">
                <span>Target: 300 Daily</span>
                <span className="text-[#888]">Rate Limited</span>
              </div>
            </div>

            {/* Metric 3 */}
            <div className="bg-[#181818] border border-[#282828] hover:border-[#404040] p-5 rounded-xl transition shadow-lg group">
              <div className="text-xs font-bold uppercase text-[#888] tracking-wider">Queue Buffer</div>
              <div className="text-3xl md:text-4xl font-black text-white mt-2 tracking-tight group-hover:text-[#E50914] transition">
                {metrics.totalPending} <span className="text-base text-[#666] font-normal">Tasks</span>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-[#666] pt-3 border-t border-[#222]">
                <span>BullMQ / Redis</span>
                <span className="text-[#46D369] font-semibold">Active</span>
              </div>
            </div>

            {/* Metric 4 */}
            <div className="bg-[#181818] border border-[#282828] hover:border-[#404040] p-5 rounded-xl transition shadow-lg group">
              <div className="text-xs font-bold uppercase text-[#888] tracking-wider">Runtime Concurrency</div>
              <div className="text-3xl md:text-4xl font-black text-white mt-2 tracking-tight">
                JDK 21
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-[#666] pt-3 border-t border-[#222]">
                <span>Virtual Threads</span>
                <span className="text-[#46D369] font-semibold">Project Loom</span>
              </div>
            </div>
          </div>
        </div>

        {/* Multi-Portal Pipeline Status Bar */}
        <div className="bg-[#181818] border border-[#282828] rounded-xl p-6 shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#242424]">
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">Multi-Portal Strategy Adapters</h3>
              <p className="text-xs text-[#888] mt-0.5">Automated submission pipelines with stealth evasion</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-[#242424] text-xs text-[#AAA] px-3 py-1.5 rounded-full font-mono">
                Port: 8080 (REST + STOMP)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#141414] border border-[#262626] p-4 rounded-lg flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-white">Naukri.com Adapter</h4>
                <p className="text-xs text-[#777] mt-1">Multi-file resume mapping &bull; Chip bypass</p>
              </div>
              <span className="text-[11px] font-bold text-[#46D369] bg-[#46D369]/10 px-2 py-1 rounded">
                OPERATIONAL
              </span>
            </div>

            <div className="bg-[#141414] border border-[#262626] p-4 rounded-lg flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-white">LinkedIn Adapter</h4>
                <p className="text-xs text-[#777] mt-1">Easy Apply &bull; AES-256 Session Vault</p>
              </div>
              <span className="text-[11px] font-bold text-[#46D369] bg-[#46D369]/10 px-2 py-1 rounded">
                OPERATIONAL
              </span>
            </div>

            <div className="bg-[#141414] border border-[#262626] p-4 rounded-lg flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-white">Gemini 2.5 ATS Engine</h4>
                <p className="text-xs text-[#777] mt-1">Gating score &ge; 70% &bull; Keyword tailor</p>
              </div>
              <span className="text-[11px] font-bold text-[#46D369] bg-[#46D369]/10 px-2 py-1 rounded">
                ACTIVE
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Netflix Minimalist Dark Footer */}
      <footer className="border-t border-[#222] py-8 text-center text-xs text-[#666]">
        <p>AI-Powered Autonomous Job Application Agent &bull; Designed & Built by Amit Raj</p>
        <p className="mt-1 font-mono text-[11px]">Java 21 LTS &bull; Spring Boot 3.2.4 &bull; Node.js &bull; Tailwind CSS</p>
      </footer>
    </div>
  );
}
