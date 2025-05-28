import requests
import json


activity = 'yoga'
weight = 100 #In lbs AND MUST BE IN RANGE 50-500
duration = 100

#https://api-ninjas.com/api/caloriesburned
api_url = 'https://api.api-ninjas.com/v1/caloriesburned?activity={}&weight={}&duration={}'.format(activity, weight, duration)
response = requests.get(api_url, headers={'X-Api-Key': 'IYFXr4S8bK0bJboUs5c5OA==dx1IWRZiJZvE6naQ'})

data = json.loads(response.text)
new_string = json.dumps(data, indent=2)
print(new_string)

for exercise in data:
    name = exercise['name']
    total_calories = exercise['total_calories']
    calories_per_hour = exercise['calories_per_hour']
    print(f"the activity is {name} and the total calories burned is {total_calories} and the calories burned per hour is {calories_per_hour}")

