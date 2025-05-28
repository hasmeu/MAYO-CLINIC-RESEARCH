-- seed.sql

-- Insert a test user
INSERT INTO users (username, email, password)
VALUES ('testuser', 'test@example.com', 'hashed_password');

-- Insert seed data for health_metrics for the test user (assumes user id 1)
INSERT INTO health_metrics (user_id, weight, bmi, exercise, calories)
VALUES (1, '78 kg', '24.3', '45 minutes', '2100 kcal');
