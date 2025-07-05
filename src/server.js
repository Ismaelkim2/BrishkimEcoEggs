const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'dist/farm-market')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/farm-market/index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
