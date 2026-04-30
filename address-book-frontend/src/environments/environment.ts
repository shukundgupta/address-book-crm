const isLocalhost = window.location.hostname === 'localhost' && window.location.port === '4200';

export const environment = {
  production: false,
  apiUrl: isLocalhost ? 'http://localhost:3000/api' : '/api'
};