const CLIENT_ID = '490612546849-1vqphpttqqislvdc1e9eb7jdjt8lrbdi.apps.googleusercontent.com';
const API_KEY = 'AIzaSyDt9wLPmhQBYN2OKUnO3tXqiZdo6DCoS0g';
const SHEET_ID = '1OKMn-g-mOm2MlsAOoWEMi3JjRlwfdw5IpVTRmwMKcHU';
const DISCOVERY_DOCS = ['https://sheets.googleapis.com/$discovery/rest?version=v4'];
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets';

function initClient() {
    gapi.load('client:auth2', () => {
        gapi.client.init({
            apiKey: API_KEY,
            clientId: CLIENT_ID,
            discoveryDocs: DISCOVERY_DOCS,
            scope: SCOPES
        }).then(() => {
            console.log('Google API initialized');
            const employee = JSON.parse(localStorage.getItem('loggedInEmployee'));
            if (employee) {
                document.getElementById('login-page').style.display = 'none';
                document.getElementById('main-page').style.display = 'block';
                loadSoftwareOptions();
            }
        }).catch(err => console.error('Error initializing Google API:', err));
    });
}

function login() {
    const empId = document.getElementById('employee-id').value;
    const password = document.getElementById('password').value;
    gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: 'Danh sách nhân viên!A2:E'
    }).then(response => {
        const employees = response.result.values || [];
        const employee = employees.find(row => row[0] === empId && row[2] === password);
        if (employee) {
            localStorage.setItem('loggedInEmployee', JSON.stringify({ id: empId, name: employee[1], role: employee[3] }));
            document.getElementById('login-page').style.display = 'none';
            document.getElementById('main-page').style.display = 'block';
            loadSoftwareOptions();
        } else {
            document.getElementById('error-message').textContent = 'Sai thông tin đăng nhập';
        }
    });
}

function loadSoftwareOptions() {
    gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: 'Danh sách phần mềm!A2:C'
    }).then(response => {
        const softwareData = response.result.values || [];
        console.log('Software data:', softwareData);
        const softwareSelect = document.getElementById('software');
        const packageSelect = document.getElementById('package');

        const uniqueSoftware = [...new Set(softwareData.map(row => row[0]))];
        softwareSelect.innerHTML = '<option value="">Chọn phần mềm</option>';
        uniqueSoftware.forEach(software => {
            softwareSelect.innerHTML += `<option value="${software}">${software}</option>`;
        });

        softwareSelect.onchange = () => {
            const selectedSoftware = softwareSelect.value;
            packageSelect.innerHTML = '<option value="">Chọn gói phần mềm</option>';
            if (selectedSoftware) {
                const packages = softwareData.filter(row => row[0] === selectedSoftware);
                packages.forEach(row => {
                    packageSelect.innerHTML += `<option value="${row[1]}">${row[1]}</option>`;
                });
            }
        };
    }).catch(err => console.error('Error loading software data:', err));
}

window.onload = initClient;