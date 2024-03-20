window.jsPDF = window.jspdf.jsPDF;

let totalHoursInWeek = 0;
let totalMinutesInWeek = 0;
let totalWorkTime = {};
let comments = {};

function sendTimeReport() {
    let userName = document.getElementById("user-name").value.trim();
    let selectedWeek = document.getElementById("week-input").value;

    // Array for weekdays
    let weekdays = ["måndag", "tisdag", "onsdag", "torsdag", "fredag"];

    // Object for saving start- and end times för each weekday
    let times = {};
    let breakTimes = {};

    weekdays.forEach(day => {
        let startTime = document.getElementById(day + "-start-time").value;
        let endTime = document.getElementById(day + "-end-time").value;
        let breakTime = parseInt(document.getElementById(day + "-break-duration").value) || 0;

        if (startTime && endTime) {
            times[day] = { start: startTime, end: endTime };
            breakTimes[day] = { time: breakTime };
            totalWorkTime[day] = getHoursAndMinutes(startTime, endTime, breakTime);

            totalHoursInWeek += totalWorkTime[day].hours;
            totalMinutesInWeek += totalWorkTime[day].minutes;

            if (totalMinutesInWeek >= 60) {
                totalHoursInWeek += Math.floor(totalMinutesInWeek / 60);
                totalMinutesInWeek %= 60;
            }
        }
        else {
            times[day] = { start: "", end: "" };
            breakTimes[day] = { time: "" };
            totalWorkTime[day] = { hours: 0, minutes: 0 };
        }

        let comment = document.getElementById(day + "-comment").value;
        comments[day] = { note: comment };
    });

    let weekNumber = selectedWeek.substring(6);
    let formattedWeekforOutput = selectedWeek.substring(5);
    userName = userName.replace(/\s+/g, '_');

    let weekDates = getWeekDates();

    // SKapa ny PDF
    let doc = new jsPDF();
    doc.text("Tidrapport för " + userName, 10, 10);
    doc.text("Avser vecka: " + weekNumber, 10, 20);

    let yOffset = 30;
    doc.line(10, 23, 100, 23);
    weekdays.forEach(day => {
        let date = weekDates[day];
        doc.setTextColor(255, 0, 0);
        doc.setFontSize(14);

        doc.text(day.charAt(0).toUpperCase() + day.slice(1) + " - ", 10, yOffset);

        doc.setFontSize(10);
        doc.text(date, 32, yOffset);

        doc.setTextColor(0);
        doc.setFontSize(12);

        doc.text("Starttid: " + times[day].start, 20, yOffset + 6);
        doc.text("Sluttid: " + times[day].end, 20, yOffset + 11);
        doc.text("Rast: " + breakTimes[day].time + " min", 20, yOffset + 16);
        doc.setFont(undefined, 'bold');
        doc.text("Totalt: " + totalWorkTime[day].hours + "h " + totalWorkTime[day].minutes + "min", 20, yOffset + 23);
        doc.setFont(undefined, 'normal');
        doc.text("Notis: " + comments[day].note, 20, yOffset + 28)
        doc.line(10, yOffset + 31, 100, yOffset + 31);
        yOffset += 37;
    });

    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text("Total arbetstid vecka " + weekNumber + ": " + totalHoursInWeek + "h " + totalMinutesInWeek + "min", 10, yOffset + 3);

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

    let days = ["söndag", "måndag", "tisdag", "onsdag", "torsdag", "fredag", "lördag"];
    let weekDates = {};

    for (let i = 0; i < 7; i++) {
        let currentDay = new Date(weekStart + i * 24 * 60 * 60 * 1000);
        let dayOfWeek = days[currentDay.getDay()];
        weekDates[dayOfWeek] = currentDay.toLocaleDateString("sv-SE");
    }

    return weekDates;
}

function getHoursAndMinutes(startTime, endTime, breakTime) {
    let startDate = new Date("2000-01-01T" + startTime + ":00");
    let endDate = new Date("2000-01-01T" + endTime + ":00");

    let timeDiff = endDate.getTime() - startDate.getTime();

    timeDiff -= breakTime * 60 * 1000;

    let totalMinutes = Math.floor(timeDiff / (1000 * 60));

    let hours = Math.floor(totalMinutes / 60);
    let minutes = totalMinutes % 60;

    return { hours: hours, minutes: minutes };
}

// Förklaring av getWeekDates()-metoden:

/* Hämta veckoinformationen från inputfältet: Funktionen börjar med att hämta värdet från inputfältet med id "week-input". Detta värde förväntas vara i formatet "ÅÅÅÅ-W##", där "ÅÅÅÅ" representerar året och "W##" representerar veckonumret.

Dela upp veckoinformationen: Veckoinformationen delas upp med hjälp av split() metoden för att separera året och veckonumret. Resultatet är en array med två element: det första elementet är året och det andra är veckonumret.

Konvertera till heltal: De två delarna av veckoinformationen, året och veckonumret, konverteras till heltal med parseInt() metoden. Detta görs för att vi behöver arbeta med numeriska värden senare.

Skapa ett datum för årets första dag: Vi skapar ett Date-objekt som representerar årets första dag genom att använda new Date(year, 0, 1). Här är "year" det året som hämtades från inputfältet. Månaden är satt till 0 eftersom månaderna i JavaScript börjar från 0 (0 motsvarar januari).

Beräkna startdatum för veckan: Vi beräknar startdatumet för den valda veckan genom att använda det första dagens getTime()-metod för att få tiden i millisekunder sedan 1 januari 1970 (UTC-tid). Sedan lägger vi till ett antal millisekunder beroende på vilken vecka som valts: ((week - 1) * 7 - currentDate.getDay() + 1) * 24 * 60 * 60 * 1000. Detta beräknar antalet dagar som måste läggas till för att komma till den första dagen i veckan.

Skapa en array med veckodagar: Vi skapar en array med namn på veckodagarna i ordning från söndag till lördag.

Loopa genom veckodagarna: Vi loopar igenom varje veckodag med hjälp av en for-loop. För varje dag skapar vi ett Date-objekt som representerar den aktuella dagen med hjälp av new Date(weekStart + i * 24 * 60 * 60 * 1000). Här lägger vi till ett antal millisekunder beroende på vilken veckodag vi är på.

Spara veckodagen och datumet i en nyckel-värde-par: Vi använder toLocaleDateString("sv-SE") för att konvertera datumet till ett läsbart format med hjälp av den svenska locale (sv-SE). Vi sparar sedan detta datum tillsammans med veckodagen som nyckel i ett objekt weekDates.

Returnera veckodagarna med tillhörande datum: Funktionen returnerar slutligen objektet weekDates, som innehåller alla veckodagarna som nycklar och respektive datum som värden. */