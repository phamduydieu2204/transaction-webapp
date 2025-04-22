export async function callProxyAPI(body) {
  const response = await fetch('https://sleepy-bastion-81523.herokuapp.com/api/proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  return await response.json();
}