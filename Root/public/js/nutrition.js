let Boxes = document.getElementsByClassName("input-box");
let infoSelect = document.getElementById("infoSelect"); 
let infoSelected = infoSelect.options[infoSelect.selectedIndex].text;


let data = {
    ex1: {
        "mealName": "Steak",
        "servings": "2",
        "calories": "200",
        "Total carbohydrate": "25g",
        "Dietary fiber": "4g",
        "Sodium": "1mg",
        "Saturated fat": "0g",
        "Total fat": "0.3g",
        "Trans fat": "0g",
        "Cholesterol": "0mg",
        "Protein": "0.5g",
        "Monounsaturated fat": "0.01g",
        "Trace Calories": "95",
        "Added sugars": "0g",
        "Total sugars": "19g"
      },
      ex2: {
        "mealName": "sushi",
        "servings": "5",
        "calories": "200",
        "Total carbohydrate": "36",
        "Dietary fiber": "2g",
        "Sodium": "640mg",
        "Saturated fat": "5g",
        "Total fat": "10g",
        "Trans fat": "0.3g",
        "Cholesterol": "25mg",
        "Protein": "12g",
        "Monounsaturated fat": "3g",
        "Trace Calories": "285",
        "Added sugars": "2g",
        "Total sugars": "4g"
      },
      ex3: {
        "mealName": "salad",
        "servings": "3",
        "calories": "200",
        "Total carbohydrate": "0g",
        "Dietary fiber": "0g",
        "Sodium": "50mg",
        "Saturated fat": "1g",
        "Total fat": "13g",
        "Trans fat": "0g",
        "Cholesterol": "55mg",
        "Protein": "20g",
        "Monounsaturated fat": "4.5g",
        "Trace Calories": "208",
        "Added sugars": "0g",
        "Total sugars": "0g"
      }
    };


    //console.log(infoSelected);
    function switchMeal(mealNum) {
        const entryArray = Object.entries(data)[mealNum]; //gets [key, nutritionInfo] of the first thing in 'data'
        displayNutrition(entryArray);
    }
    
    function displayNutrition(entryArray){
        let count = 0;
        const [key, nutritionInfo] = entryArray;
        Object.entries(nutritionInfo).forEach(([nutrient, value]) => {
            //console.log(`${nutrient}: ${value}`);
            Boxes[count].value = value; 
            count++;
        });
        return Boxes;
    }


    

    const loggedMeals = []; // Only meals that have been logged

document.getElementById("mealForm").addEventListener("submit", addMeal);
document.getElementById("addLogBtn").addEventListener("click", addMealToLog);

function cleanNumber(value) {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    let num = parseFloat(value.replace(/[^\d.-]/g, '')); // Remove anything that's not a number, minus, or dot
    return isNaN(num) ? 0 : num;
  }
  return 0;
}



//function for adding meals to the meal bar
function addMeal(event) {
  event.preventDefault();
  let nextKey = "ex" + (Object.keys(data).length + 1);

  function getNumber(id) {
    let val = parseFloat(document.getElementById(id).value);
    return isNaN(val) ? 0 : val;
  }

  let newMeal = {
    "mealName": document.getElementById("mealName").value,
    "servings": getNumber("servings"),
    "calories": getNumber("calories"),
    "Total carbohydrate": getNumber("Total_carbohydrate"),
    "Dietary fiber": getNumber("Dietary_fiber"),
    "Sodium": getNumber("Sodium"),
    "Saturated fat": getNumber("Saturated_fat"),
    "Total fat": getNumber("Total_fat"),
    "Trans fat": getNumber("Trans_fat"),
    "Cholesterol": getNumber("Cholesterol"),
    "Protein": getNumber("Protein"),
    "Monounsaturated fat": getNumber("Monounsaturated_fat"),
    "Trace Calories": getNumber("Trace_Calories"),
    "Added sugars": getNumber("Added_sugars"),
    "Total sugars": getNumber("Total_sugars")
  };

  data[nextKey] = newMeal;

  let option = document.createElement("option");
  option.value = nextKey;
  option.text = newMeal.mealName;
  document.getElementById("infoSelect").appendChild(option);
}


function addMealToLog() {
  let lastKey = "ex" + (Object.keys(data).length);
  let meal = data[lastKey];

  if (!meal) return;

  loggedMeals.push(meal);

  let tableBody = document.getElementById("mealTableBody");
  let newRow = document.createElement("tr");

  for (const key in meal) {
    let cell = document.createElement("td");
    cell.textContent = meal[key];
    newRow.appendChild(cell);
  }
  tableBody.appendChild(newRow);

  updateTotals();
}

function updateTotals() {
  let totals = {
    servings: 0,
    calories: 0,
    carbs: 0,
    fiber: 0,
    sodium: 0,
    satFat: 0,
    fat: 0,
    transFat: 0,
    cholesterol: 0,
    protein: 0,
    monoFat: 0,
    traceCals: 0,
    addedSugars: 0,
    sugars: 0
  };

  for (const meal of loggedMeals) {
    totals.servings += cleanNumber(meal["servings"]);
    totals.calories += cleanNumber(meal["calories"]);
    totals.carbs += cleanNumber(meal["Total carbohydrate"]);
    totals.fiber += cleanNumber(meal["Dietary fiber"]);
    totals.sodium += cleanNumber(meal["Sodium"]);
    totals.satFat += cleanNumber(meal["Saturated fat"]);
    totals.fat += cleanNumber(meal["Total fat"]);
    totals.transFat += cleanNumber(meal["Trans fat"]);
    totals.cholesterol += cleanNumber(meal["Cholesterol"]);
    totals.protein += cleanNumber(meal["Protein"]);
    totals.monoFat += cleanNumber(meal["Monounsaturated fat"]);
    totals.traceCals += cleanNumber(meal["Trace Calories"]);
    totals.addedSugars += cleanNumber(meal["Added sugars"]);
    totals.sugars += cleanNumber(meal["Total sugars"]);
  }
  

  document.getElementById("totalServings").textContent = totals.servings;
  document.getElementById("totalCalories").textContent = totals.calories;
  document.getElementById("totalCarbs").textContent = totals.carbs;
  document.getElementById("totalFiber").textContent = totals.fiber;
  document.getElementById("totalSodium").textContent = totals.sodium;
  document.getElementById("totalSatFat").textContent = totals.satFat;
  document.getElementById("totalFat").textContent = totals.fat;
  document.getElementById("totalTransFat").textContent = totals.transFat;
  document.getElementById("totalCholesterol").textContent = totals.cholesterol;
  document.getElementById("totalProtein").textContent = totals.protein;
  document.getElementById("totalMonoFat").textContent = totals.monoFat;
  document.getElementById("totalTraceCals").textContent = totals.traceCals;
  document.getElementById("totalAddedSugars").textContent = totals.addedSugars;
  document.getElementById("totalSugars").textContent = totals.sugars;
  updateTotalRowColors();
}



//For the colored diet
const dietProfiles = {
  default: {
    servings: 3, calories: 2000, carbs: 275, fiber: 28, sodium: 2300,
    satFat: 20, fat: 70, transFat: 2, cholesterol: 300, protein: 50,
    monoFat: 25, traceCals: 150, addedSugars: 50, sugars: 90
  },
  lowCarb: {
    servings: 3, calories: 2000, carbs: 100, fiber: 28, sodium: 2300,
    satFat: 20, fat: 70, transFat: 2, cholesterol: 300, protein: 80,
    monoFat: 25, traceCals: 150, addedSugars: 20, sugars: 50
  },
  highProtein: {
    servings: 3, calories: 2500, carbs: 200, fiber: 30, sodium: 2500,
    satFat: 20, fat: 80, transFat: 2, cholesterol: 300, protein: 120,
    monoFat: 30, traceCals: 200, addedSugars: 40, sugars: 70
  },
  lowSodium: {
    servings: 3, calories: 2000, carbs: 275, fiber: 28, sodium: 1500,
    satFat: 20, fat: 70, transFat: 2, cholesterol: 200, protein: 50,
    monoFat: 25, traceCals: 150, addedSugars: 50, sugars: 90
  }
};


//function to fully update the colors

function updateTotalRowColors() {
  const comparisons = [
    { id: 'totalServings', key: 'servings' },
    { id: 'totalCalories', key: 'calories' },
    { id: 'totalCarbs', key: 'carbs' },
    { id: 'totalFiber', key: 'fiber' },
    { id: 'totalSodium', key: 'sodium' },
    { id: 'totalSatFat', key: 'satFat' },
    { id: 'totalFat', key: 'fat' },
    { id: 'totalTransFat', key: 'transFat' },
    { id: 'totalCholesterol', key: 'cholesterol' },
    { id: 'totalProtein', key: 'protein' },
    { id: 'totalMonoFat', key: 'monoFat' },
    { id: 'totalTraceCals', key: 'traceCals' },
    { id: 'totalAddedSugars', key: 'addedSugars' },
    { id: 'totalSugars', key: 'sugars' }
  ];


  let dietTargets = { ...dietProfiles.default }; // default on load

  document.getElementById("dietSelect").addEventListener("change", (e) => {
      const selected = e.target.value;
      dietTargets = { ...dietProfiles[selected] };
      updateTotalRowColors(); // re-apply coloring based on new targets
  });

  comparisons.forEach(({ id, key }) => {
    const cell = document.getElementById(id);
    const value = parseFloat(cell.textContent) || 0;
    const limit = dietTargets[key];

    if (value <= limit) {
      cell.style.backgroundColor = 'lightgreen';
    } else {
      cell.style.backgroundColor = 'lightcoral';
    }
  });
}
