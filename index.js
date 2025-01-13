require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const foodRoutes = require('./routes/foodItemRoutes');
// Import and initialize the expiry notification cron job
const cron = require('./cron/expiryNotifier');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserSchema = require("./models/user");
const cors = require('cors');


const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = 'fwmsecret'; 
// Connect to MongoDB
connectDB();

app.use(cors());
// Middleware
app.use(bodyParser.json());
app.use('/api/users', userRoutes);
// Middleware for food APIs
app.use('/api/foods', foodRoutes);

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  console.log("==================", email, password);
  
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const user = await UserSchema.findOne({ email });
    console.log("user", user);
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generate JWT Token
    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

    console.log("token=====>", token);
    
    res.status(200).json({ message: 'Login successful', token });
  } catch (err) {
    res.status(500).json({ message: 'Error logging in', error: err.message });
  }
});
// Home route
app.get('/', (req, res) => {
  res.send('Welcome to the Node.js API with Express and Mongoose!');
});
cron.schedule('* * * * *', async () => {
    console.log('Testing expiry check every minute.');
    // Rest of the code...
  });

  
// Start the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
