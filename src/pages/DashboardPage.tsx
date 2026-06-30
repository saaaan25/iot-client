import { useState } from 'react';
import Navbar      from '../components/layout/Navbar';
import SensorGrid  from '../components/sensors/SensorGrid';
import AlertItem   from '../components/alerts/AlertItem';
import EventTable  from '../components/history/EventTable';
import { useSensors } from '../hooks/useSensors';
import { useEvents  } from '../hooks/useEvents';
import { useAlerts  } from '../hooks/useAlerts';
import { usePermissions } from '../hooks/usePermissions';
import UserList from '../components/users/UserList';
import MOCK_USERS from '../api/users.json';

type Tab = 'monitoreo' | 'alertas' | 'historial' | 'usuarios';

// Componente de título rediseñado
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-bold tracking-[0.2em] text-zinc-500 uppercase mb-4 flex items-center gap-2">
      <span className="w-4 h-[1px] bg-zinc-700"></span>
      {children}
    </h2>
  );
}

export default function DashboardPage() {
  const [tab, setTab] = useState<Tab>('monitoreo');

  const { sensors, loading: loadSensors } = useSensors(8000);
  const { events,  loading: loadEvents  } = useEvents(50);
  const { alerts,  loading: loadAlerts, acknowledge } = useAlerts();
  const { can } = usePermissions();

  const activeAlerts  = alerts.filter(a => !a.acknowledged).length;
  const criticalCount = alerts.filter(a => a.level === 'critical' && !a.acknowledged).length;

  const TABS: { id: Tab; label: string }[] = [
    { id: 'monitoreo', label: 'Monitoring' },
    { id: 'alertas',   label: 'Alerts' },
    { id: 'historial', label: 'History' },
    { id: 'usuarios',  label: 'Users' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#0d0d0d] text-[#e2e8f0] font-sans selection:bg-[#10b981] selection:text-black">
      
      {/* Mantenemos el Navbar de tu compañero pero lo adaptamos al esquema oscuro */}
      <div className="bg-[#151515] border-b border-[#222]">
        <Navbar activeAlerts={activeAlerts} lastSync="hace 3 s" />
      </div>

      {/* Navegación por Tabs */}
      <div className="flex px-6 bg-[#151515] border-b border-[#222] sticky top-0 z-10">
        {TABS.filter(t => t.id !== 'usuarios' || can('manage_users')).map(t => {
          const isActive = tab === t.id;
          return (
            <button 
              key={t.id} 
              onClick={() => setTab(t.id)}
              className={`relative flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all ${
                isActive ? 'text-white' : 'text-[#888] hover:text-[#bbb]'
              }`}
            >
              {t.label}
              {t.id === 'alertas' && activeAlerts > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#f43f5e]/20 text-[#f43f5e]">
                  {activeAlerts}
                </span>
              )}
              {isActive && (
                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#10b981] shadow-[0_-2px_10px_rgba(16,185,129,0.5)]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Contenido Principal */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
        <div className="max-w-[1600px] mx-auto">

          {/* ── MONITOREO ── */}
          {tab === 'monitoreo' && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-fade-in">
              
              {/* Columna Izquierda */}
              <div className="xl:col-span-2 space-y-6">
                
                {/* Hero Card: Sistema Protegido / En Alerta */}
                <div className={`border rounded-xl p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 transition-all duration-300 ${
                  criticalCount > 0 
                    ? 'bg-[#3f0f16]/30 border-[#f43f5e]/40 shadow-[0_0_30px_rgba(244,63,94,0.05)]' 
                    : 'bg-[#151515] border-[#222]'
                }`}>
                  <div className="flex items-center gap-6">
                    {/* Icono dinámico */}
                    <div className={`w-16 h-16 rounded-xl flex items-center justify-center shrink-0 ${
                      criticalCount > 0 
                        ? 'bg-[#f43f5e]/10 border border-[#f43f5e]/20' 
                        : 'bg-[#10b981]/10 border border-[#10b981]/20'
                    }`}>
                      {criticalCount > 0 ? (
                        <svg className="w-8 h-8 text-[#f43f5e]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      ) : (
                        <svg className="w-8 h-8 text-[#10b981]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      )}
                    </div>
                    {/* Textos dinámicos */}
                    <div>
                      <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">
                        {criticalCount > 0 ? 'Sistema en Alerta' : 'Sistema Protegido'}
                      </h2>
                      <div className="flex items-center gap-2 text-[#888] text-sm">
                        {criticalCount > 0 && (
                          <span className="w-2 h-2 rounded-full bg-[#f43f5e] animate-pulse shadow-[0_0_8px_#f43f5e] shrink-0" />
                        )}
                        <p>
                          {criticalCount > 0 
                            ? `Se detectaron ${criticalCount} anomalía(s) crítica(s) sin atender. Revise los registros de inmediato.` 
                            : 'Todos los sensores activos. Perímetro seguro desde las 08:00 AM.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Botón de View Alerts integrado */}
                  {criticalCount > 0 && (
                    <button 
                      className="shrink-0 px-6 py-3 text-xs font-bold uppercase tracking-widest text-white bg-[#f43f5e] hover:bg-[#e11d48] rounded-lg shadow-[0_0_15px_rgba(244,63,94,0.3)] transition-all transform hover:scale-105"
                      onClick={() => setTab('alertas')}
                    >
                      View Alerts
                    </button>
                  )}
                </div>

                {/* Patio Feed Placeholder + Stats */}
                <div className="bg-[#151515] border border-[#222] rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <svg className="w-5 h-5 text-[#888]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Patio Feed
                      <span className="px-2 py-0.5 text-[9px] font-bold bg-[#f43f5e]/20 text-[#f43f5e] rounded border border-[#f43f5e]/30 uppercase tracking-widest ml-2">Live</span>
                    </h3>
                    <span className="text-xs text-[#666] font-mono">FPS: 15 | Res: 800x600</span>
                  </div>
                  
                  {/* Contenedor de Video */}
                  <div className="w-full aspect-video bg-[#0a0a0a] border border-[#222] rounded-lg flex flex-col items-center justify-center text-[#444] mb-6">
                    <svg className="w-12 h-12 mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                    <p className="text-sm">Awaiting Video Stream...</p>
                  </div>

                  {/* Estadísticas */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-[#222]">
                    {[
                      { label: 'Sensores Activos', value: sensors.filter(s => s.status !== 'offline').length, color: 'text-[#10b981]' },
                      { label: 'Activados',        value: sensors.filter(s => s.status === 'triggered').length, color: 'text-[#f43f5e]' },
                      { label: 'Eventos Hoy',      value: events.filter(e => e.date === '2025-06-14').length, color: 'text-[#22d3ee]' },
                      { label: 'Alertas',          value: activeAlerts, color: 'text-[#f59e0b]' },
                    ].map(stat => (
                      <div key={stat.label} className="p-3 bg-[#0a0a0a] rounded-lg border border-[#222]">
                        <p className="text-[10px] uppercase tracking-wider text-[#666] mb-1">{stat.label}</p>
                        <p className={`text-2xl font-mono ${stat.color}`}>
                          {loadSensors ? '—' : stat.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Columna Derecha */}
              <div className="xl:col-span-1 space-y-6">
                
                {/* Sensors Card */}
                <div className="bg-[#151515] border border-[#222] rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white">Sensors</h3>
                    <svg className="w-5 h-5 text-[#666]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                    </svg>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    <SensorGrid sensors={sensors} loading={loadSensors} />
                  </div>
                </div>

                {/* System Logs Card */}
                <div className="bg-[#151515] border border-[#222] rounded-xl flex flex-col h-[400px]">
                  <div className="p-6 border-b border-[#222] flex items-center justify-between shrink-0">
                    <h3 className="text-lg font-bold text-white">System Logs</h3>
                    <svg className="w-5 h-5 text-[#666]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </div>
                  
                  <div className="p-6 flex-1 overflow-y-auto custom-scrollbar space-y-3">
                    {loadEvents ? (
                      <div className="animate-pulse space-y-3">
                        <div className="h-16 bg-[#222] rounded-lg"></div>
                        <div className="h-16 bg-[#222] rounded-lg"></div>
                      </div>
                    ) : (
                      events.slice(0, 5).map(e => {
                        let containerStyle = "border-[#222] bg-[#0a0a0a]";
                        let icon = null;

                        if (e.type === 'alert' || e.type === 'motion') {
                          containerStyle = "border-[#f43f5e]/30 bg-[#3f0f16]/30";
                          icon = <svg className="w-4 h-4 text-[#f43f5e] mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
                        } else if (e.type === 'auth') {
                          containerStyle = "border-[#10b981]/30 bg-[#10b981]/5";
                          icon = <svg className="w-4 h-4 text-[#10b981] mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
                        } else {
                          icon = <svg className="w-4 h-4 text-[#888] mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
                        }

                        return (
                          <div key={e.id} className={`p-4 rounded-lg border flex gap-3 ${containerStyle}`}>
                            {icon}
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start mb-1">
                                <span className="text-sm font-semibold text-white truncate">{e.label}</span>
                                <span className="text-[10px] font-mono text-[#888] shrink-0 ml-2">{e.time}</span>
                              </div>
                              <p className="text-xs text-[#888] truncate">{e.sensorId} triggered.</p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                  
                  <div className="p-4 border-t border-[#222] shrink-0">
                    <button 
                      onClick={() => setTab('historial')}
                      className="w-full py-2 text-xs font-bold text-[#888] hover:text-white uppercase tracking-widest transition-colors bg-[#0a0a0a] hover:bg-[#222] rounded border border-[#222]"
                    >
                      View Full History
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ── ALERTAS ── */}
          {tab === 'alertas' && (
            <div className="animate-fade-in bg-[#151515] border border-[#222] rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-6">Alertas Críticas</h2>
              {loadAlerts ? (
                <div className="space-y-3">
                  {[1,2,3].map(i => <div key={i} className="h-20 animate-pulse rounded-lg bg-[#222]"/>)}
                </div>
              ) : alerts.length === 0 ? (
                <div className="py-20 text-center">
                  <p className="text-[#888] font-medium">No hay alertas activas en el sistema.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {alerts.map(a => <AlertItem key={a.id} alert={a} onAck={acknowledge} />)}
                </div>
              )}
            </div>
          )}

          {/* ── HISTORIAL ── */}
          {tab === 'historial' && (
            <div className="animate-fade-in bg-[#151515] border border-[#222] rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-6">Historial de Eventos</h2>
              <EventTable events={events} loading={loadEvents} />
            </div>
          )}

          {/* ── USUARIOS ── */}
          {tab === 'usuarios' && can('manage_users') && (
            <div className="animate-fade-in bg-[#151515] border border-[#222] rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-6">Gestión de Usuarios</h2>
              <UserList />
            </div>
          )}

        </div>
      </main>
    </div>
  );
}