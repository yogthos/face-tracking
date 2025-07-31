const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// Serve static files from the 'models' directory
app.use('/models', express.static(path.join(__dirname, '../models')));

// Serve the main index.html file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
