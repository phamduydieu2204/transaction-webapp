import { API_KEY, DISCOVERY_DOCS } from '../config.js';

export function initClient(callback) {
    console.log('Starting initClient...');
    gapi.load('client', () => {
        gapi.client.init({
            apiKey: API_KEY,
            discoveryDocs: DISCOVERY_DOCS
        }).then(() => {
            console.log('Google API initialized successfully');
            const employee = JSON.parse(localStorage.getItem('loggedInEmployee'));
            if (employee) {
                console.log('User already logged in:', employee);
                document.getElementById('login-page').style.display = 'none';
                document.getElementById('main-page').style.display = 'block';
                callback();
            }
        }).catch(err => {
            console.error('Error initializing Google API:', err);
        });
    });
}