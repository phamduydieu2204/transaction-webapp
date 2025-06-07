export function getConstants() {
  return {
    // Temporary: Use Heroku proxy for GitHub Pages testing
    BACKEND_URL: 'https://transaction-webapp-proxy-4b2c79e5db75.herokuapp.com/proxy'
    // Production will use: 'https://vidieu.vn/api/proxy.php'
  };
}

// Accounting types
export const ACCOUNTING_TYPES = {
  COGS: 'COGS',
  OPEX: 'OPEX',
  NON_RELATED: 'Không liên quan'
};