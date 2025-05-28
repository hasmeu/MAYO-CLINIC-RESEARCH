# Health Monitoring Dashboard

This project is a web portal for bariatric surgery patients that integrates health metrics. The web app displays data such as weight, BMI, exercise progress, daily caloric intake, and more through a user-friendly dashboard. It also includes a Node.js backend and SQLite database to store and serve the data.

## Table of Contents

- [Features](#features)
- [File Structure](#file-structure)
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Development Workflow](#development-workflow)
- [License](#license)

## Features

- **Responsive Dashboard UI:** Built with HTML, CSS, Python, and JavaScript.
- **Health Data Integration:** Displays key metrics such as weight, BMI, exercise duration, daily caloric intake, and calories burned over time.
- **Backend API:** Node.js/Express-based API to fetch and update health data as well as Flask to access a calorie burning API.
- **SQL Database:** Stores user data and health metrics.
- **Agile Development:** Incremental feature development with a clear branching strategy.


## Installation

1. **Clone the Repository:**

    bash
    git clone https://github.com/JoshGPG/Group2Research.git
    cd health-monitoring-dashboard
    

2. **Install Dependencies:**

    bash
    npm install
    


## Usage

1. **Start the Backend Server:**

    bash
    npm start
    

2. **Access the Web App:**

    Open your browser and navigate to [http://localhost:3000](http://localhost:3000).

3. **Test API Endpoints:**

    - **GET `/api/health-data`**: Retrieves current health metrics.
    - **PUT `/api/health-data`**: Updates health metrics (send JSON data in the request body).

## API Endpoints

- **GET `/api/health-data`**  
  Returns a JSON object with health data (e.g., weight, BMI, exercise, and calories).

- **PUT `/api/health-data`**  
  Updates the health data. Expects a JSON payload with the fields to update.

## Database Schema

The database schema is defined in `db/schema.sql`.

## Development Workflow

- **Branching Strategy:**  
  Use a Git branching strategy with:
  - `Production` for production-ready code,
  - `Staging` for ongoing integration,
  - Feature branches (e.g., `feature/dashboard-ui`) for specific tasks.

- **Agile Development:**  
  Break down features into small, manageable user stories and tasks to ensure continuous delivery and incremental improvement.

- **Testing:**  
  Implement unit and integration tests as the project evolves to ensure stability and quality.

## License

This project is licensed under UWEC.
