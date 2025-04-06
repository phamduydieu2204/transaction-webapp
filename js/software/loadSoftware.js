import { SHEET_ID } from '../config.js';

export function loadSoftwareOptions() {
    console.log('Loading software options...');
    gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: 'Danh sách phần mềm!A2:C'
    }).then(response => {
        const softwareData = response.result.values || [];
        console.log('Software data:', softwareData);
        if (!softwareData.length) {
            console.warn('No software data found in the sheet');
            return;
        }

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
    }).catch(err => {
        console.error('Error loading software data:', err);
    });
}