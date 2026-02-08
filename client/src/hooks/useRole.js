// Hook personalizado para manejar el rol del usuario
export const useRole = () => {
  const getRole = () => {
    const role = localStorage.getItem('userRole') || 'user';
    return role;
  };

  const setRole = (role) => {
    localStorage.setItem('userRole', role);
  };

  const isAdmin = () => {
    return getRole() === 'admin';
  };

  return {
    role: getRole(),
    setRole,
    isAdmin: isAdmin()
  };
};
