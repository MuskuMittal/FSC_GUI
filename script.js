let events = {};

document.getElementById('fileInput').addEventListener('change', handleFile, false);

function handleFile(e) {
    const file = e.target.files;
    console.log("Selected file:", file.name, "Size:", file.size); // Debugging line

    const reader = new FileReader();
    reader.onload = function(event) {
        console.time("Reading file"); // Start timing
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        console.timeEnd("Reading file"); // End timing
        console.log("Workbook sheets:", workbook.SheetNames); // Debugging line
        const sheet = workbook.Sheets["FSC Data"];
        if (!sheet) {
            alert("Sheet 'FSC Data' not found in the file.");
            return;
        }
        console.time("Parsing data"); // Start timing
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        console.timeEnd("Parsing data"); // End timing
        console.log("Parsed data:", jsonData); // Debugging line
        parseEvents(jsonData);
        updateCalendar();
    };
    reader.readAsArrayBuffer(file);
}

function parseEvents(data) {
    events = {};
    data.forEach((row, index) => {
        if (index === 0) return; // Skip header row
        const date = row; // Assuming the date is in the first column
        const activityType = row; // Column N is the 14th column (0-indexed)
        console.log(`Row ${index}: Date = ${date}, Activity Type = ${activityType}`); // Debugging line
        if (date && activityType) {
            if (!events[date]) {
                events[date] = [];
            }
            events[date].push(activityType);
        }
    });
    console.log("Parsed events:", events); // Debugging line
}

function populateYearSelector() {
    const yearSelector = document.getElementById('yearSelector');
    const currentYear = new Date().getFullYear();
    for (let year = currentYear - 50; year <= currentYear + 50; year++) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelector.appendChild(option);
    }
    yearSelector.value = currentYear;
}

function updateCalendar() {
    const yearSelector = document.getElementById('yearSelector');
    const monthSelector = document.getElementById('monthSelector');
    const year = parseInt(yearSelector.value);
    const month = parseInt(monthSelector.value);
    const calendar = document.getElementById('calendar');
    const date = new Date(year, month, 1);

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let table = '<table><tr><th>Sun</th><th>Mon</th><th>Tue></th><th>Wed</th><th>Thu</th><th>Fri</th><th>Sat</th></tr><tr>';

    for (let i = 0; i < date.getDay(); i++) {
        table += '<td></td>';
    }

    for (let i = 1; i <= daysInMonth; i++) {
        if (date.getDay() === 0 && i !== 1) {
            table += '</tr><tr>';
        }
        const day = i;
        const eventDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const eventList = events[eventDate] ? events[eventDate].join('<br>') : '';
        table += `<td>${day}<br><small>${eventList}</small></td>`;
        date.setDate(date.getDate() + 1);
    }

    table += '</tr></table>';
    calendar.innerHTML = table;
}

window.onload = function() {
    populateYearSelector();
    updateCalendar();
};
