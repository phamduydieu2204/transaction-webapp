export function getCurrentUser() {
  const data = localStorage.getItem('employeeInfo');
  return data ? JSON.parse(data) : null;
}