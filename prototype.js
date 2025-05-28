window.onload = function () {
const n = new Date();
const dateElement = document.getElementById("date");
let date = n.toLocaleDateString("en-US", {year : "numeric", month : "long", day : "numeric"});
dateElement.innerText = date;

let minutes = localStorage.getItem("exerciseMinutes");
const displayMinutes = document.getElementById("exercise-minutes");

if (minutes && displayMinutes !== null) {
    displayMinutes.innerText = minutes;
}

setInterval(() => {
    const newDate = new Date();
    if (newDate.toDateString() !== date.toString()) {
        date = newDate;
        displayMinutes.innerText = 0;
        dateElement.innerText = date.toLocaleDateString("en-US", {year : "numeric", month : "long", day : "numeric"});
        localStorage.clear("exerciseMinutes");
    }
}, 1000);


};

