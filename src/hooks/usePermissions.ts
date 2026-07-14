export function usePermissions() {
  const can = (permission: string) => {
    try {
      // 1. Leemos la sesión actual de Supabase que guardamos en el Login
      const sessionData = localStorage.getItem('sentinel_session');
      if (!sessionData) return false;
      
      const user = JSON.parse(sessionData);
      
      // 2. Si el usuario tiene el rol 'admin', tiene poder absoluto en el sistema
      if (user.role === 'admin') {
        return true;
      }
      
      // 3. Si NO es admin (es viewer, etc.), le bloqueamos administrar usuarios
      if (permission === 'manage_users') {
        return false;
      }

      // Por defecto, permitimos que los viewers vean las gráficas y sensores
      return true; 
    } catch (error) {
      console.error("Error validando permisos:", error);
      return false;
    }
  };

  return { can };
}