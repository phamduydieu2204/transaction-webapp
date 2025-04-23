export function checkAuth() {
  const userData = localStorage.getItem('employeeInfo');
  let user;
  try {
    user = userData ? JSON.parse(userData) : null;
  } catch (e) {
    user = null;
  }

  if (!user) {
    window.location.href = 'index.html';
    return null;
  }

  return user;
}

export function logout() {
  localStorage.removeItem('employeeInfo');
  window.location.href = 'index.html';
}