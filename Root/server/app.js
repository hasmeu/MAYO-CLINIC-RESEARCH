// server/app.js
const db = require('../db/connection'); // Adjust path if necessary
const path = require('path');
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const { spawn } = require('child_process');


// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from the "public" directory
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/Home.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/ConsistencyGraphs.html'));
}); 

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/signup.html'));
}); 
app.get('/api/posts', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    // Get total count of posts
    db.get('SELECT COUNT(*) as total FROM posts', [], (err, countResult) => {
        if (err) {
            console.error('Error counting posts:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        
        // Get posts with pagination
        db.all(
            `SELECT p.id, p.username, p.title, p.message, p.timestamp, p.likes 
             FROM posts p 
             ORDER BY p.timestamp DESC 
             LIMIT ? OFFSET ?`,
            [limit, offset],
            (err, posts) => {
                if (err) {
                    console.error('Error fetching posts:', err);
                    return res.status(500).json({ error: 'Database error' });
                }
                
                // For each post, get its comments
                const getCommentsPromises = posts.map(post => {
                    return new Promise((resolve, reject) => {
                        db.all(
                            'SELECT comment FROM comments WHERE post_id = ?',
                            [post.id],
                            (err, comments) => {
                                if (err) {
                                    reject(err);
                                } else {
                                    post.comments = comments.map(c => c.comment);
                                    resolve(post);
                                }
                            }
                        );
                    });
                });
                
                Promise.all(getCommentsPromises)
                    .then(() => {
                        res.json({
                            posts,
                            total: countResult.total,
                            pages: Math.ceil(countResult.total / limit),
                            currentPage: page
                        });
                    })
                    .catch(err => {
                        console.error('Error fetching comments:', err);
                        res.status(500).json({ error: 'Database error' });
                    });
            }
        );
    });
});

app.post('/api/posts', (req, res) => {
    const { username, title, message } = req.body;
    
    if (!username || !title || !message) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const timestamp = new Date().toISOString();
    
    db.run(
        'INSERT INTO posts (username, title, message, timestamp, likes) VALUES (?, ?, ?, ?, 0)',
        [username, title, message, timestamp],
        function(err) {
            if (err) {
                console.error('Error creating post:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            
            const postId = this.lastID;
            res.status(201).json({
                id: postId,
                username,
                title,
                message,
                timestamp,
                likes: 0,
                comments: []
            });
        }
    );
});

app.post('/api/posts/:id/like', (req, res) => {
    const postId = req.params.id;
    
    db.run(
        'UPDATE posts SET likes = likes + 1 WHERE id = ?',
        [postId],
        function(err) {
            if (err) {
                console.error('Error liking post:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Post not found' });
            }
            
            // Get updated likes count
            db.get('SELECT likes FROM posts WHERE id = ?', [postId], (err, result) => {
                if (err) {
                    console.error('Error getting likes count:', err);
                    return res.status(500).json({ error: 'Database error' });
                }
                
                res.json({ likes: result.likes });
            });
        }
    );
});

app.post('/api/posts/:id/comments', (req, res) => {
    const postId = req.params.id;
    const { comment } = req.body;
    
    if (!comment) {
        return res.status(400).json({ error: 'Comment is required' });
    }
    
    db.run(
        'INSERT INTO comments (post_id, comment) VALUES (?, ?)',
        [postId, comment],
        function(err) {
            if (err) {
                console.error('Error adding comment:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            
            res.status(201).json({
                id: this.lastID,
                post_id: postId,
                comment
            });
        }
    );
});

app.get('/api/health-data', (req, res) => {
    // In a real application, fetch this data from your SQL database.
    const healthData = {
        weight: '78 kg',
        bmi: '24.3',
        exercise: '45 minutes',
        calories: '2100 kcal'
    };
    res.json(healthData);
});

// Example API endpoint for updating health data
app.put('/api/health-data', (req, res) => {
    const newHealthData = req.body;
    // Here you would add logic to update the health data in your SQL database.
    res.json({
        message: 'Health data updated successfully',
        data: newHealthData
    });
});

app.get('/api/social', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/social.html')); 
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);

  // Spawn the Flask backend
  const flaskProcess = spawn('python', ['flask_backend/CaloriesBurnedAPI.py'], {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit', // Inherit stdout/stderr so you can see output
    shell: true       // Required for Windows
  });

  flaskProcess.on('error', (err) => {
    console.error('Failed to start Flask app:', err);
  });

  flaskProcess.on('exit', (code) => {
    console.log(`Flask app exited with code ${code}`);
  });
});
