const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoute.js');
const userRoutes = require('./routes/userRoute.js')
const foodRoutes = require('./routes/foodRoute.js');
const menuRoutes = require('./routes/menuRoute.js');
const cartRoutes = require('./routes/cartRoute.js')
const orderRoutes = require('./routes/orderRoute.js')
const voucherRoutes = require('./routes/voucherRoute.js')
const ingredientRoutes = require('./routes/ingredientRoute.js');
const supplierRoutes = require('./routes/supplierRoute.js');
require('dotenv').config();
const cors = require('cors');

const app = express();

// CORS configuration
const corsOptions = {
  origin: ['http://localhost:3000', 'https://pizza-store-sandy-eta.vercel.app'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'token'],
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use('/api/userAuth',authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/menu', menuRoutes);    
app.use('/api/cart', cartRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/voucher', voucherRoutes);
app.use('/api/ingredient', ingredientRoutes);
app.use('/api/supplier', supplierRoutes);

app.get('/', (req, res) => {
    res.send('Welcome to Pizza Store API');
  });
  

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});
