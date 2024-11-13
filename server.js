const express = require('express');
const bodyParser = require('body-parser');
const customerRoutes = require('./routes/customersRoute.js');
require('dotenv').config();

const app = express();

app.use(bodyParser.json());
app.use('/api', customerRoutes);

app.get('/', (req, res) => {
    res.send('Welcome to Pizza Store API');
  });
  

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});
