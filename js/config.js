const esLocal =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'

export const API_URL = esLocal
  ? 'http://localhost:3000/api'
  : 'https://tuoficio-production-931c.up.railway.app/api'