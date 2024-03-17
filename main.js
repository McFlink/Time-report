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

    // SKapa ny PDF
    let doc = new jsPDF();
    doc.text("Tidrapport för " + userName, 10, 10);
    doc.text("Avser vecka: " + selectedWeek, 10, 20);

    let yOffset = 30;
    weekdays.forEach(day => {
        doc.setTextColor(255, 0, 0);
        doc.setFontSize(14);

        doc.text(day.charAt(0).toUpperCase() + day.slice(1) + ": ", 10, yOffset);

        doc.setTextColor(0);
        doc.setFontSize(12);

        doc.text("Starttid: " + times[day].start, 20, yOffset + 10);
        doc.text("Sluttid: " + times[day].end, 20, yOffset + 20);
        doc.line(10, yOffset + 25, 100, yOffset + 25);
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