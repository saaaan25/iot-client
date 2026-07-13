import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

interface Profile {
  id: string;
  name: string;
  last_name: string;
  phone: string;
  role: string;
  created_at: string;
}

interface UserListProps {
  onDeleteClick: (userId: string) => void;
  refreshTrigger: number; // Esto nos avisa cuando recargar la tabla
}

const roleStyles: Record<string, { bg: string; color: string; label: string }> = {
  admin:  { bg: 'rgba(34,211,238,0.1)', color: '#22d3ee', label: 'Admin' },
  viewer: { bg: 'rgba(148,163,184,0.1)', color: '#94a3b8', label: 'Viewer' },
};

export default function UserList({ onDeleteClick, refreshTrigger }: UserListProps) {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, [refreshTrigger]); // Se vuelve a ejecutar si el admin agrega/elimina a alguien

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-[#888] animate-pulse p-4">Cargando base de datos de usuarios...</div>;
  }

  if (users.length === 0) {
    return <div className="text-[#888] p-4">No hay perfiles registrados en el sistema.</div>;
  }

  return (
    <div className="rounded-xl overflow-x-auto border border-[#222]">
      <table className="w-full text-sm border-collapse min-w-[800px]">
        <thead>
          <tr className="bg-[#0a0a0a] border-b border-[#222]">
            {['Usuario', 'Teléfono', 'Rol del Sistema', 'Fecha de Registro', 'Acciones'].map((h, index) => (
              <th key={index} className={`text-left px-4 py-4 text-xs font-bold tracking-widest text-[#666] uppercase ${h === 'Acciones' ? 'text-right pr-6' : ''}`}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {users.map((user, i) => {
            const rs = roleStyles[user.role] ?? roleStyles.viewer;
            const initials = `${user.name.charAt(0)}${user.last_name?.charAt(0) || ''}`.toUpperCase();

            return (
              <tr key={user.id} className="group transition-colors" style={{ background: i % 2 === 0 ? '#151515' : '#0d0d0d', borderBottom: '1px solid #222' }}>
                
                {/* Nombre y Apellido */}
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 bg-[#0e7490] text-[#22d3ee]">
                      {initials}
                    </div>
                    <span className="text-white font-medium">{user.name} {user.last_name}</span>
                  </div>
                </td>

                {/* Teléfono */}
                <td className="px-4 py-4">
                  <span className="text-xs font-mono text-[#888]">{user.phone || 'N/A'}</span>
                </td>

                {/* Rol */}
                <td className="px-4 py-4">
                  <span className="text-[10px] font-bold px-2 py-1 rounded tracking-wider uppercase border" style={{ background: rs.bg, color: rs.color, borderColor: `${rs.color}30` }}>
                    {rs.label}
                  </span>
                </td>

                {/* Fecha de Registro */}
                <td className="px-4 py-4">
                  <span className="text-xs font-mono text-[#666]">
                    {new Date(user.created_at).toLocaleDateString('es-PE', {
                      day: '2-digit', month: 'short', year: 'numeric'
                    })}
                  </span>
                </td>

                {/* Botón Eliminar */}
                <td className="px-4 py-4 text-right pr-6">
                  <button 
                    onClick={() => onDeleteClick(user.id)}
                    className="p-2 text-[#666] hover:text-[#f43f5e] hover:bg-[#f43f5e]/10 rounded opacity-0 group-hover:opacity-100 transition-all"
                    title="Revocar acceso"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </td>

              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}