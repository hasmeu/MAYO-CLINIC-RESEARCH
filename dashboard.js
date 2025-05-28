document.addEventListener('DOMContentLoaded', () => {
    const totalHeight = parseFloat(localStorage.getItem('totalHeight')) || 0;
    const weight = parseFloat(localStorage.getItem('weight')) || 0;
    const form = document.querySelector(".weight-tracker");
    //const update = document.getElementById("button");
    const currWeightInput = document.getElementById('current-weight').value;
    const bmiDisplay = document.getElementById('updatedBMI');
    let bmi = document.getElementById('updatedBMI').value;


    const inputs = form.querySelectorAll("input");
        inputs.forEach(input => {
            const savedInputs = localStorage.getItem(input.name);
            if (savedInputs) {
                input.value = savedInputs;
            }
        });

    const updatedBMI = () => {
        let currWeight = parseFloat(currWeightInput.value);
        if (isNaN(currWeight) || currWeight <= 0) {
            currWeight = weight;
        }

        if (totalHeight > 0 && currWeight > 0) {
            bmi = (currWeight / (totalHeight * totalHeight)) * 703;
            bmiDisplay.textContent = bmi.toFixed(1);
            console.log(bmi);
        } else {
            console.log('Missing necessary values for calculation');
        }
    };
    updatedBMI();


        form.addEventListener("submit", function (e) {
                e.preventDefault();

                fetch(totalHeight, {
                    method: 'POST',
                    headers: {
                        'Content-type': 'application/json'
                    },
                    body: JSON.stringify({
                        weight: weight,
                        bmi: bmi
                    })
                })
                .then (response => response.text())
                .then (data => {
                    console.log('Response from server:', data);
                    alert(data);
                })
                .catch (error => {
                    console.error('Error sending data', error);
                    alert('Unable to submit data');
                });
            inputs.forEach(input => {
                localStorage.setItem(input.name, input.value);
            });
            updatedBMI();
        });
    });
