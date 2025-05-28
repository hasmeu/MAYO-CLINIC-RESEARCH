const emotions = ["happy", "sad", "stressed", "anxious", "loved", "calm", "grateful", "excited", "disappointed", "alone", "frustrated"];
const emotionSelect = document.getElementById("emotion");
const moodForm = document.getElementById("moodForm");

let moodData = [];

// Populate the dropdown
emotions.forEach(emotion => {
    const option = document.createElement("option");
    option.value = emotion;
    option.textContent = emotion.charAt(0).toUpperCase() + emotion.slice(1);
    emotionSelect.appendChild(option);
});

moodForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const selectedEmotion = emotionSelect.value;
    const intensity = parseInt(document.getElementById("intensity").value);
    const date = new Date().toISOString().slice(0, 10);

    if (!selectedEmotion) return alert("Please select an emotion.");

    moodData.push({ date, emotion: selectedEmotion, intensity });
    updateChart();
});

const ctx = document.getElementById("moodChart").getContext("2d");
let chart = new Chart(ctx, {
    type: "line",
    data: {
        labels: [],
        datasets: []
    },
    options: {
        responsive: true,
        scales: {
            y: {
                min: 0,
                max: 10,
                ticks: { stepSize: 1 }
            }
        }
    }
});

function updateChart() {
    const grouped = {};
    moodData.forEach(entry => {
        if (!grouped[entry.date]) grouped[entry.date] = {};
        grouped[entry.date][entry.emotion] = entry.intensity;
    });

    const labels = getLastNDates(30);
    const datasets = emotions.map((emotion, idx) => ({
        label: emotion,
        data: labels.map(date => grouped[date]?.[emotion] ?? null),
        borderColor: getColor(idx),
        spanGaps: false
    }));

    chart.data.labels = labels;
    chart.data.datasets = datasets;
    chart.update();
}

function getColor(index) {
    const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#9966FF', '#4BC0C0', '#FF9F40', '#C9CBCF', '#FF6B6B', '#6BFF95', '#6B95FF', '#DB6BFF'];
    return colors[index % colors.length];
}

function getLastNDates(n) {
    const dates = [];
    for (let i = n - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        dates.push(date.toISOString().slice(0, 10));
    }
    return dates;
}

// Mood/Journal UI toggle
document.getElementById("showJournal").addEventListener("click", () => {
    const journalSection = document.getElementById("journalSection");
    const moodSection = document.getElementById("moodSection");

    const isVisible = journalSection.style.display === "block";
    journalSection.style.display = isVisible ? "none" : "block";
    moodSection.style.display = isVisible ? "block" : "none";
});

// Journal functionality
let journalData = [];

document.getElementById("logJournal").addEventListener("click", () => {
    const entryText = document.getElementById("journalInput").value.trim();
    if (!entryText) return alert("Journal entry cannot be empty.");
    const timestamp = new Date().toLocaleString();

    const entry = { text: entryText, time: timestamp };
    journalData.unshift(entry); // newest first
    document.getElementById("journalInput").value = "";
    renderJournal();
});

function renderJournal() {
    const container = document.getElementById("journalEntries");
    container.innerHTML = "";
    journalData.forEach(entry => {
        const div = document.createElement("div");
        div.className = "journal-entry";
        div.innerHTML = `
            <div class="timestamp">${entry.time}</div>
            <div>${entry.text}</div>
        `;
        container.appendChild(div);
    });
}
