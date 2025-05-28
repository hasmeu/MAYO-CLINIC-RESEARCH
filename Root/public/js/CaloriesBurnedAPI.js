//mock data for testing to be in database
let customActivityMap = {};

document.addEventListener("DOMContentLoaded", async() => {
    const activityDropdown = document.querySelector('.activityDropdown');
    const textBox = activityDropdown.querySelector('.textBox');
    const optionsContainer = activityDropdown.querySelector('.option');
    const calculateButton = document.getElementById("calculateButton");
    const searchButton = document.getElementById("searchButton");
    let selectedActivity = null;

    try {
        const response = await fetch('/get_activities');
        const activities = await response.json();

        if (response.ok) {
            activities.forEach(({ customName, activityName }) => {
                customActivityMap[customName] = activityName;
            
                const newOption = document.createElement("div");
                newOption.classList.add("dropdown-item", "custom-option");
                newOption.innerHTML = `
                    <span>${customName}</span>
                    <button class="delete-btn" title="Delete">✖</button>
                `;
                optionsContainer.appendChild(newOption);
            });
        } else {
            console.error('Error fetching activities:', activities.error);
        }
    } catch (error) {
        console.error('Error fetching activities:', error);
    }



    //fetches calories burned based metrics that the API takes
    calculateButton.addEventListener("click", async (event) => {
        event.preventDefault();
        await fetchCalories(event);
    });

    //searches api for activities based on user input and sets mock values so the api doesn't get upset
    searchButton.addEventListener("click", async (event) => {
        event.preventDefault();
        document.querySelector('[name="weight"]').value = 100;
        document.querySelector('[name="duration"]').value = 100;
        await searchActivity(event);
        document.querySelector('[name="weight"]').value = '';
        document.querySelector('[name="duration"]').value = '';
    });

    //toggle dropdown menu
    textBox.addEventListener('click', () => {
        activityDropdown.classList.toggle('active');
    });

    //gives each item in the dropdown a clickable remove button
    optionsContainer.addEventListener('click', (event) => {
        const clickedOption = event.target;
    
        if (clickedOption.classList.contains("delete-btn")) {
            const parent = clickedOption.closest(".dropdown-item");
            if (parent) {
                const itemText = parent.querySelector('span').textContent.trim();
    
                // Send request to Flask backend to delete from DB
                fetch('/delete_activity', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ customName: itemText })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        parent.remove(); // remove from UI only if DB delete succeeded
                    } else {
                        alert(data.error || 'Failed to delete from database.');
                    }
                })
                .catch(error => {
                    console.error('Error deleting activity:', error);
                    alert('An error occurred while deleting the activity.');
                });
            }
        } else if (
            clickedOption.classList.contains("dropdown-item") ||
            clickedOption.closest(".dropdown-item")
        ) {
            const selected = clickedOption.closest(".dropdown-item");
            const itemText = selected.querySelector('span').textContent.trim();
            selectedActivity = customActivityMap[itemText] || itemText;
            textBox.value = selectedActivity;
            activityDropdown.classList.remove('active');
        }
    });
    

    //closes dropdown when you click out of it
    document.addEventListener('click', (e) => {
        if (!activityDropdown.contains(e.target)) {
            activityDropdown.classList.remove('active');
        }
    });
});




//saves selected activity to dropdown and customActivityMap
async function saveActivity() {
    const activityName = document.querySelector('.textBox').value.trim();

    if (activityName) {
        const customName = prompt("Please enter a name for your new activity:", activityName);
        if (customName) {
            try {
                const response = await fetch('/save_activity', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ customName, activityName })
                });

                const result = await response.json();
                if (response.ok) {
                    customActivityMap[customName] = activityName;  // <-- Add this line
                
                    const newOption = document.createElement("div");
                    newOption.classList.add("dropdown-item", "custom-option");
                
                    newOption.innerHTML = `
                        <span>${customName}</span>
                        <button class="delete-btn" title="Delete">✖</button>
                    `;
                
                    document.querySelector('.activityDropdown .option').appendChild(newOption);
                    document.querySelector('.textBox').value = '';
                    let resultDiv = document.getElementById("result");
                    resultDiv.innerHTML = ''; // Clear the result div
                } else {
                    alert(`Error: ${result.error}`);
                }
            } catch (error) {
                console.error('Error saving activity:', error);
                alert('Failed to save activity. Please try again.');
            }
        }
    } else {
        alert("Please select an activity to save.");
    }
}


//fetches calories based on the user input
async function fetchCalories(event) {
    event.preventDefault();
    let formData = new FormData(document.getElementById("activityForm"));
    let response = await fetch("/get_calories", {
        method: "POST",
        body: formData
    });

    let result = await response.json();
    let resultDiv = document.getElementById("result");

    //result is the response from the API, and resultDiv is the div where the results will be displayed
    
   

    if (result.error) {
        resultDiv.innerHTML = `<p style="color:red;">Error: ${result.error}</p>`;
    } else {
        resultDiv.innerHTML = `
            <h3>Results:</h3>
            <p><strong>Activity:</strong> ${result[0].name}</p>
            <p><strong>Total Calories Burned:</strong> ${result[0].total_calories}</p>
            <p><strong>Calories Per Hour:</strong> ${result[0].calories_per_hour}</p>
        `;

        let today = new Date().toISOString().split('T')[0];
        document.getElementById("date").value = today;
        document.getElementById("new_calorie").value = result[0].total_calories;
    }
}

//gives a list of activities similar to the user's input activity (if it exists in the API)
async function searchActivity(event) {
    event.preventDefault();

    let formData = new FormData(document.getElementById("activityForm"));

    let response = await fetch("/get_calories", {
        method: "POST",
        body: formData
    });

    let result = await response.json();
    let resultDiv = document.getElementById("result");

    if (result.error) {
        resultDiv.innerHTML = `<p style="color:red;">Error: ${result.error}</p>`;
    } else {
        resultDiv.innerHTML = `
            <h3>Pick which Activity to Save:</h3>
            <br>
            ${result.map((activity) => `
                <p class="result-text-block" style="cursor: pointer;">${activity.name}</p>
                <br>
                <hr>
                <hr>
                <hr>    
                <br>
            `).join('')}
        `;

        document.querySelectorAll('.result-text-block').forEach(block => {
            block.addEventListener('click', () => {
                const activityName = block.textContent.trim();
                document.querySelector('.textBox').value = activityName;
                selectedActivity = activityName;
                saveActivity();
            });
        });
    }
}
