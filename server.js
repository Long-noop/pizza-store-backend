const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoute.js')
require('dotenv').config();

const app = express();

app.use(bodyParser.json());
app.use('/api/user',authRoutes)

app.get('/', (req, res) => {
    res.send('Welcome to Pizza Store API');
  });
  

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});
