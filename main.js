window.jsPDF = window.jspdf.jsPDF;

function sendTimeReport() {
    let userName = document.getElementById("user-name").value.trim();
    let selectedWeek = document.getElementById("week-input").value;
    let comments = document.getElementById("comments").value;

    // Array for weekdays
    let weekdays = ["monday", "tuesday", "wednesday", "thursday", "friday"];

    // Object for saving start- and end times för each weekday
    let times = {};

    weekdays.forEach(day => {
        let startTime = document.getElementById(day + "-start-time").value;
        let endTime = document.getElementById(day + "-end-time").value;
        times[day] = { start: startTime, end: endTime };
    });

    let formattedWeekforOutput = selectedWeek.substring(5);
    userName = userName.replace(/\s+/g, '_');

    let weekDates = getWeekDates();

    // SKapa ny PDF
    let doc = new jsPDF();
    doc.text("Tidrapport för " + userName, 10, 10);
    doc.text("Avser vecka: " + selectedWeek, 10, 20);
    
    let yOffset = 30;
    doc.line(10, 23, 100, 23);
    weekdays.forEach(day => {
        let date = weekDates[day];
        doc.setTextColor(255, 0, 0);
        doc.setFontSize(14);

        console.log(date);

        doc.text(day.charAt(0).toUpperCase() + day.slice(1) + ": " + date, 10, yOffset);

        doc.setTextColor(0);
        doc.setFontSize(12);

        doc.text("Starttid: " + times[day].start, 20, yOffset + 10);
        doc.text("Sluttid: " + times[day].end, 20, yOffset + 20);
        doc.line(10, yOffset + 23, 100, yOffset + 23);
        yOffset += 30;
    });

    doc.text("Kommentar: " + comments, 10, yOffset);

    doc.save("Tidrapport_" + userName + "_" + formattedWeekforOutput + ".pdf");
}

let submitBtn = document.getElementById("submit-btn");

submitBtn.addEventListener("click", (event) => {
    event.preventDefault();

    let isCertain = confirm("Detta kommer att ladda ner en PDF med ifyllda värden till din enhet.\nÄr du säker?");

    if (isCertain) {
        sendTimeReport();
    }
});

function getWeekDates() {
    let selectedWeek = document.getElementById("week-input").value;
    let dateParts = selectedWeek.split("-");
    let year = parseInt(dateParts[0]);
    let week = parseInt(dateParts[1].substring(1));

    let currentDate = new Date(year, 0, 1);
    let weekStart = currentDate.getTime() + ((week - 1) * 7 - currentDate.getDay() + 1) * 24 * 60 * 60 * 1000;

    let days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    let weekDates = {};

    for (let i = 0; i < 7; i++) {
        let currentDay = new Date(weekStart + i * 24 * 60 * 60 * 1000);
        let dayOfWeek = days[currentDay.getDay()];
        weekDates[dayOfWeek] = currentDay.toLocaleDateString("sv-SE");
    }

    return weekDates;
}