import { useState, FormEvent, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/services';
import FaceCapture from '../components/camera/FaceCapture';
import MOCK_USERS from '../api/users.json';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Lógica original de tu compañero intacta
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Lógica original de tu compañero intacta
  const handleFaceRecognized = useCallback((recognizedName: string) => {
    const found = MOCK_USERS.find(u => u.name === recognizedName && u.active);

    const session = found
      ? {
          id: found.id,
          email: found.email,
          name: found.name,
          role: found.role,
          avatar: found.avatar,
          token: `face-jwt-${found.id}`,
        }
      : {
          id: 'face-unknown',
          email: 'facial@sentinel.io',
          name: recognizedName,
          role: 'viewer',
          avatar: recognizedName.slice(0, 2).toUpperCase(),
          token: `face-jwt-${Date.now()}`,
        };

    localStorage.setItem('sentinel_session', JSON.stringify(session));
    navigate('/dashboard');
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#141313] bg-pattern flex items-center justify-center p-6 font-sans">
      {/* Contenedor Principal Split-Screen */}
      <div className="glass-panel w-full max-w-5xl rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
        
        {/* LADO IZQUIERDO: Formulario Clásico */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center border-b md:border-b-0 md:border-r border-zinc-800">
          
          {/* Logo y Título */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-[#10b981]/10 flex items-center justify-center border border-[#10b981]/30">
              <svg width="24" height="24" viewBox="0 0 22 22" fill="none" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 3 L19 7 L19 11 C19 15.4 15.4 19.3 11 21 C6.6 19.3 3 15.4 3 11 L3 7 Z"/>
                <circle cx="11" cy="11" r="2.5"/>
                <path d="M11 8.5L11 3.5M11 13.5L11 18.5M13.5 11L18.5 11M8.5 11L3.5 11"/>
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-wide">SENTINEL</h1>
              <p className="text-xs text-zinc-400 tracking-widest uppercase">IoT Security</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-2">Acceso al Sistema</h2>
            <p className="text-sm text-zinc-400">Ingresa tus credenciales o utiliza el escáner biométrico.</p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-2 uppercase tracking-wider">Usuario</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@sentinel.io"
                className="w-full bg-[#18181b] border border-zinc-800 text-white rounded-lg px-4 py-3 input-glow transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-2 uppercase tracking-wider">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#18181b] border border-zinc-800 text-white rounded-lg px-4 py-3 input-glow transition-all"
                required
              />
            </div>

            {/* Manejo de Errores */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-start gap-3">
                <span className="text-red-500 mt-0.5">⚠️</span>
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#10b981] text-black font-bold rounded-lg px-4 py-3 mt-2 btn-primary-glow flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="animate-pulse">Autenticando...</span>
              ) : (
                <>
                  <span>Ingresar Manualmente</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </>
              )}
            </button>
            
            <p className="text-center text-xs text-zinc-500 mt-2">
              Mock: Puedes ingresar cualquier email y contraseña
            </p>
          </form>
        </div>

        {/* LADO DERECHO: Reconocimiento Facial (IA) */}
        <div className="w-full md:w-1/2 p-8 md:p-12 bg-black/40 flex flex-col items-center justify-center relative border-t md:border-t-0 border-zinc-800">
          
          <div className="text-center mb-6 z-10">
            <h3 className="text-lg font-medium text-[#10b981] flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse-dot"></span>
              Face ID Activo
            </h3>
            <p className="text-sm text-zinc-400 mt-1">Mira a la cámara para ingresar</p>
          </div>

          {/* Contenedor del Componente de la Cámara */}
          <div className="relative w-full max-w-[320px] aspect-square rounded-xl overflow-hidden border border-zinc-800 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
            
            {/* Esquinas de escáner (Estilo Cyberpunk/Tech) */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#10b981] z-20 m-4 rounded-tl-lg"></div>
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#10b981] z-20 m-4 rounded-tr-lg"></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#10b981] z-20 m-4 rounded-bl-lg"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#10b981] z-20 m-4 rounded-br-lg"></div>
            
            {/* Línea de escaneo animada */}
            <div className="absolute left-0 w-full h-0.5 bg-[#10b981]/50 shadow-[0_0_10px_#10b981] z-20 animate-scan-line"></div>

            {/* El componente de tu compañero */}
            <div className="w-full h-full object-cover relative z-10 [&>div]:h-full [&>div]:w-full">
              <FaceCapture onRecognized={handleFaceRecognized} />
            </div>
            
          </div>
        </div>

      </div>
    </div>
  );
}