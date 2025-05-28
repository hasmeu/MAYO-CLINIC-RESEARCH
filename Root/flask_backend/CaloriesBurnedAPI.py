from flask import Flask, request, jsonify, render_template, redirect, url_for
import requests
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import pandas as pd
import base64
from io import BytesIO
from datetime import datetime, timedelta
import sqlite3
import os

app = Flask(
    __name__,
    static_folder='../public',
    template_folder='../public'
)

def get_db_connection():
    db_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'db', 'database.sqlite')
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn

def fetch_all_calories():
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM CaloriesBurnedAPI')
        return cursor.fetchall()  # Each row will include 'date' and 'calories'
    finally:
        conn.close()


def insert_calorie_entry(calories, date):
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            'INSERT INTO CaloriesBurnedAPI (calories, date) VALUES (?, ?)',
            (calories, date)
        )
        conn.commit()
    finally:
        conn.close()

def insert_activity_entry(custom_name, activity_name):
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            'INSERT INTO CustomActivities (customName, activityName) VALUES (?, ?)',
            (custom_name, activity_name)
        )
        conn.commit()
    finally:
        conn.close()


API_KEY = "IYFXr4S8bK0bJboUs5c5OA==dx1IWRZiJZvE6naQ"
rows = fetch_all_calories()
date_calories = {
    row['date']: row['calories']
    for row in rows if row['date'] is not None
}

calories = list(date_calories.values())



def prepare_chart_data(filtered_data, view):
    df = pd.DataFrame(filtered_data.items(), columns=['date', 'calories'])
    df['date'] = pd.to_datetime(df['date'])
    df.set_index('date', inplace=True)

    #switch variables based on view of the graph
    if view == 'week':
        resample_freq = 'D'
        date_format = '%Y-%m-%d'
    elif view == 'month':
        resample_freq = 'W'
        date_format = 'Week of %Y-%m-%d'
    elif view == 'year':
        resample_freq = 'M'
        date_format = '%b %Y'

    #this adds up the calorie count depending on the view
    resampled = df.resample(resample_freq).sum().reset_index()

    #this to show start of the week instead of the end (showing end is default) while in month view
    if view == 'month':
        resampled['date'] = resampled['date'] - pd.to_timedelta(6, unit='d')

    #send the data to a list to be used in the graph
    sorted_dates = resampled['date'].dt.strftime(date_format).tolist()
    calories_values = resampled['calories'].tolist()

    return sorted_dates, calories_values


@app.route('/')
def index():
    view = request.args.get('view', 'week')
    today = datetime.now()

    #reformats the date so it's readable by the code
    today_str = today.strftime('%Y-%m-%d')

    #sets today's calorie count to 0 if it doesn't exist in the dictionary
    if today_str not in date_calories:
        date_calories[today_str] = 0


    #says in days, how far back to graph
    if view == 'week':
        cutoff = today - timedelta(days=7)
    elif view == 'month':
        cutoff = today - timedelta(days=30)
    elif view == 'year':
        cutoff = today - timedelta(days=365)
    else:
        return jsonify({"error": "Invalid view parameter"}), 400

    #creates dictionary of dates (dependent on the view) and calories burned 
    filtered_data = {
        date: cal 
        for date, cal in date_calories.items()
        if datetime.strptime(date, '%Y-%m-%d') >= cutoff
    }

    average_per_day = None
    #calculates average calories burned based on view rounded to 2 decimal places
    if view in ['week', 'month', 'year'] and filtered_data:
        earliest_date = min(datetime.strptime(date, '%Y-%m-%d') for date in filtered_data.keys())
        total_days = (today - earliest_date).days + 1
        total_calories = sum(filtered_data.values())
        average_per_day = round(total_calories / total_days, 2)

    sorted_dates, filtered_calories = prepare_chart_data(filtered_data, view)

    #creates graph
    plt.figure(figsize=(10, 6))
    plt.plot(sorted_dates, filtered_calories, marker='o', color='skyblue', linestyle='-', linewidth=2)
    plt.xlabel('Date')
    plt.ylabel('Calories Burned')
    plt.title(f'Calories Burned - Last {view.capitalize()}')
    plt.xticks(rotation=45)
    plt.tight_layout()

    #makes it so the website will store the image bytes into a base64 string so it can be saved in html
    img = BytesIO()
    plt.savefig(img, format='png')
    img.seek(0)
    plt.close()
    
    #Displays the graph in html w/out saving it
    graph_url = base64.b64encode(img.getvalue()).decode('utf-8')
    return render_template('CaloriesBurnedAPI.html', datetime=datetime,graph_url=graph_url, current_view=view, average_per_day=average_per_day)


@app.route('/add_calories', methods=['POST'])
def add_calories():
    global date_calories, calories

    today = datetime.now()
    today_str = today.strftime('%Y-%m-%d')

    if today_str not in date_calories:
        date_calories[today_str] = 0

    try:
        #ensures the date is in the correct format
        view = request.args.get('view', 'week')

        new_calorie_raw = request.form.get('new_calorie', '').strip()
        input_date_raw = request.form.get('date', '').strip()

        if new_calorie_raw or input_date_raw:
            new_calorie = int(new_calorie_raw)

            try:
                parsed_date = datetime.strptime(input_date_raw, '%Y-%m-%d')
            except ValueError:
                try:
                    parsed_date = datetime.strptime(input_date_raw, '%Y/%m/%d')
                except ValueError:
                    return jsonify({"error": "Invalid date format. Use YYYY-MM-DD."}), 400

            input_date = parsed_date.strftime('%Y-%m-%d')

            #makes it so the input date can't be in the future
            if parsed_date.date() > datetime.now().date():
                return jsonify({"error": "You cannot add calories for a future date."}), 400

            # Update in-memory
            if input_date in date_calories:
                date_calories[input_date] += new_calorie
            else:
                date_calories[input_date] = new_calorie

            # Update database
            conn = get_db_connection()
            try:
                cursor = conn.cursor()
                # Check if entry for this date exists
                cursor.execute("SELECT calories FROM CaloriesBurnedAPI WHERE date = ?", (input_date,))
                row = cursor.fetchone()

                if row:
                    # Update existing record
                    updated = row['calories'] + new_calorie
                    cursor.execute("UPDATE CaloriesBurnedAPI SET calories = ? WHERE date = ?", (updated, input_date))
                else:
                    # Insert new record
                    cursor.execute("INSERT INTO CaloriesBurnedAPI (date, calories) VALUES (?, ?)", (input_date, new_calorie))

                conn.commit()
            finally:
                conn.close()


            sorted_dates = sorted(date_calories.keys())
            calories_values = [date_calories[date] for date in sorted_dates]

            calories.clear()
            calories.extend(calories_values)

        return redirect(url_for('index', view=view))

    except Exception as e:
        return jsonify({"error": str(e)}), 400


#gets api response for calories burned
@app.route('/get_calories', methods=['POST'])
def get_calories():
    try:
        activity = request.form['activity']
        weight = int(request.form['weight'])
        duration = int(request.form['duration'])

        if not (50 <= weight <= 500):
            return jsonify({"error": "Weight must be between 50 and 500 lbs"}), 400

        api_url = f'https://api.api-ninjas.com/v1/caloriesburned?activity={activity}&weight={weight}&duration={duration}'
        response = requests.get(api_url, headers={'X-Api-Key': API_KEY})
        data = response.json()

        if not data:
            return jsonify({"error": "We don't have that activity. Please try another one."}), 404

        return jsonify(data)

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
    
#searches for activity based on user input
@app.route('/search_activity', methods=['POST'])
def search_activity():
    activity = request.form['activity']
    api_url = f'https://api.api-ninjas.com/v1/caloriesburned?activity={activity}'
    response = requests.get(api_url, headers={'X-Api-Key': API_KEY})

    if response.status_code != 200:
        return jsonify({'error': 'API request failed'}), 500

    data = response.json()

    if not data:
        return jsonify({'error': 'No matching activities found'}), 404

    matches = []
    for exercise in data:
        name = exercise['name']
        matches.append({
            'name': name
        })

    return jsonify(matches)
    

@app.route('/save_activity', methods=['POST'])
def save_activity():
    data = request.json
    custom_name = data.get('customName')
    activity_name = data.get('activityName')

    if not custom_name or not activity_name:
        return jsonify({'error': 'Both customName and activityName are required'}), 400

    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            'INSERT INTO CustomActivities (customName, activityName) VALUES (?, ?)',
            (custom_name, activity_name)
        )
        conn.commit()
        return jsonify({'message': 'Activity saved successfully'}), 200
    finally:
        conn.close()


@app.route('/get_activities', methods=['GET'])
def get_activities():
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute('SELECT customName, activityName FROM CustomActivities')
        activities = cursor.fetchall()
        return jsonify([{'customName': row['customName'], 'activityName': row['activityName']} for row in activities])
    finally:
        conn.close()

@app.route('/delete_activity', methods=['POST'])
def delete_activity():
    data = request.get_json()
    custom_name = data.get('customName')
    
    if not custom_name:
        return jsonify({'error': 'Missing customName'}), 400

    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute('DELETE FROM CustomActivities WHERE customName = ?', (custom_name,))
        conn.commit()
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

    return jsonify({'success': True})




if __name__ == '__main__':
    app.run(debug=True)
