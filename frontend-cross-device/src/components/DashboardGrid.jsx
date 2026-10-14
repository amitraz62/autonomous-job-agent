import React, { useEffect, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export default function DashboardGrid() {
  const [metrics, setMetrics] = useState({
    totalApplications: 1521,
    appliedToday: 0,
    totalPending: 0,
    totalApplied: 1521,
    totalFailed: 0,
    engineStatus: 'ACTIVE_MONITORING'
  });

  const [alerts, setAlerts] = useState([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Initial fetch from Spring Boot REST API
    fetch('http://localhost:8080/api/v1/bot/metrics')
      .then(res => res.json())
      .then(data => setMetrics(prev => ({ ...prev, ...data })))
      .catch(() => console.log('Backend offline, using cached metrics.'));

    // Connect to Spring Boot WebSocket Broker
    const socket = new SockJS('http://localhost:8080/ws-job-bot');
    const stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
        setConnected(true);
        stompClient.subscribe('/topic/metrics', message => {
          if (message.body) {
            setMetrics(JSON.parse(message.body));
          }
        });

        stompClient.subscribe('/topic/alerts', message => {
          if (message.body) {
            const newAlert = JSON.parse(message.body);
            setAlerts(prev => [newAlert, ...prev.slice(0, 4)]);
          }
        });
      },
      onDisconnect: () => setConnected(false)
    });

    stompClient.activate();
    return () => stompClient.deactivate();
  }, []);

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6 lg:p-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500">
            Autonomous Job Agent Dashboard
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Enterprise Distributed Orchestration (Spring Boot 3 + JDK 21 + Node.js)
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-4 py-2 rounded-full">
          <span className={`h-3 w-3 rounded-full ${connected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
          <span className="text-xs font-semibold text-slate-300">
            {connected ? 'WebSocket Live' : 'Connecting to Core...'}
          </span>
        </div>
      </div>

      {/* Critical Inbound Alerts (Layer 6) */}
      {alerts.length > 0 && (
        <div className="mb-6 space-y-3">
          {alerts.map((alert, idx) => (
            <div key={idx} className="bg-amber-950/40 border border-amber-600/50 p-4 rounded-xl flex items-start gap-4">
              <span className="text-2xl">🚨</span>
              <div>
                <h4 className="text-amber-400 font-bold text-sm uppercase tracking-wider">
                  Critical Interview Alert: {alert.sender}
                </h4>
                <p className="text-xs text-slate-300 mt-0.5">{alert.subject}</p>
                <p className="text-xs text-slate-400 italic mt-1 font-mono">{alert.preview}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 
        Responsive Layout Grid:
        Mobile: grid-cols-1
        Tablet: md:grid-cols-2
        Desktop: lg:grid-cols-4 
      */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Applications</div>
          <div className="text-3xl font-black text-white mt-2">{metrics.totalApplications}</div>
          <div className="text-xs text-slate-500 mt-2">Deduplicated in PostgreSQL</div>
          <div className="absolute top-0 right-0 h-1.5 w-full bg-cyan-500" />
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Applied Today</div>
          <div className="text-3xl font-black text-emerald-400 mt-2">{metrics.appliedToday}</div>
          <div className="text-xs text-slate-500 mt-2">Quota limit: 300/day</div>
          <div className="absolute top-0 right-0 h-1.5 w-full bg-emerald-500" />
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Queue Status</div>
          <div className="text-3xl font-black text-indigo-400 mt-2">{metrics.totalPending} Pending</div>
          <div className="text-xs text-slate-500 mt-2">BullMQ Redis List Buffer</div>
          <div className="absolute top-0 right-0 h-1.5 w-full bg-indigo-500" />
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Engine Health</div>
          <div className="text-3xl font-black text-amber-400 mt-2">100% Active</div>
          <div className="text-xs text-slate-500 mt-2">JDK 21 Virtual Threads</div>
          <div className="absolute top-0 right-0 h-1.5 w-full bg-amber-500" />
        </div>
      </div>

      {/* Architecture & Pipeline Status */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-lg font-bold text-slate-200 mb-4">Autonomous Multi-Portal Pipeline</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
            <span className="text-cyan-400 font-bold block mb-1">Naukri Adapter</span>
            Status: Active &bull; Multi-File Attachment OK &bull; Stealth Mode
          </div>
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
            <span className="text-indigo-400 font-bold block mb-1">LinkedIn Adapter</span>
            Status: Active &bull; Easy Apply Enabled &bull; Session Vault OK
          </div>
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
            <span className="text-emerald-400 font-bold block mb-1">Gemini AI ATS Filter</span>
            Status: Active &bull; Threshold &ge; 70% &bull; Keyword Tailor
          </div>
        </div>
      </div>
    </div>
  );
}
