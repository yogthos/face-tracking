const express = require('express');
const path = require('path');
const app = express();
const port = 3001;

// Serve static files from the 'models' directory
app.use('/models', express.static(path.join(__dirname, '../models')));

// Serve the main index.html file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

// Handle all other routes by serving index.html (for SPA routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
