document.addEventListener('DOMContentLoaded', () => {
    const heightInFeet = document.getElementById('feet');
    const heightInInches = document.getElementById('inches');
    const weightInput = document.getElementById('start-weight');
    const bmiInput = document.getElementById('bmi');
    const form = document.querySelector('.profile');

    if (form) {
    const inputs = form.querySelectorAll("input");

    const calculatedBMI = () => {

    const feet = parseFloat(heightInFeet.value) || 0;
    const inches = parseFloat(heightInInches.value) || 0;
    const weight = parseFloat((document.getElementById('start-weight')).value) || 0;
    const totalHeight = feet * 12 + inches;
    let bmiVal = 0;

    console.log(totalHeight);
    console.log(weight);
        if (totalHeight > 0 && weight > 0) {
            bmiVal = (weight / (totalHeight * totalHeight)) * 703;
            bmiInput.value = bmiVal.toFixed(1);
            console.log(bmiVal);
        } else {
            bmiInput.value = '';
        }

        return { weight, totalHeight, bmiVal};

    };

        //localStorage.setItem('weight', weightInput.value);
        //localStorage.setItem('totalHeight', totalHeight);

    inputs.forEach(input => {
        const savedInputs = localStorage.getItem(input.name);
        if (savedInputs) {
            input.value = savedInputs;
        }
    });

    [heightInFeet, heightInInches, (document.getElementById('start-weight'))].forEach(input => {
       input?.addEventListener('input', calculatedBMI);
    });


        form.addEventListener("submit", function (e) {
            e.preventDefault();

            const { totalHeight, weight, bmiVal} = calculatedBMI();

        inputs.forEach(input => {
            localStorage.setItem(input.name, input.value);
        });

        fetch('/submit-name', {
            method: 'POST',
            headers: {
                'Content-type': 'application/JSON'
            },
            body: JSON.stringify({
                height: totalHeight,
                weight: weight,
                bmi: bmiVal, 
            })
        })
        .then(res => res.text())
        .then(data => {
            console.log('server says:', data);
        });

    });

} 

});



