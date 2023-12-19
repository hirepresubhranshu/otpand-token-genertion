const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const express = require('express');
const twilio = require('twilio');

const app = express();
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
// Define the schema for the token
const tokenSchema = new mongoose.Schema({
  phoneNumber: { type: String, required: true },
  token: { type: String, required: true },
});
// Create a model using the schema
const Token = mongoose.model('Token', tokenSchema);

// Generate a random OTP
const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000);
};

// Store generated OTPs (You might want a database in production)
const otps = new Map();

// Send OTP via SMS
app.get('/send-otp/:phoneNumber', (req, res) => {
  const phoneNumber = req.params.phoneNumber;
  const otp = generateOTP();

  // Save the OTP
  otps.set(phoneNumber, otp);

  // Send OTP via Twilio
  client.messages
    .create({
      body: `Your OTP for verification is: ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    })
    .then(() => {
      res.send('OTP sent successfully');
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error sending OTP');
    });
});
mongoose.connect('mongodb+srv://demo:gQ1wMMDRI4nva5tR@cluster0.bw6vdpx.mongodb.net/otp', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000, 
});

app.get('/verify-otp/:phoneNumber/:otp', async (req, res) => {
  const phoneNumber = req.params.phoneNumber;
  const otpAttempt = req.params.otp;

  if (otps.has(phoneNumber) && otps.get(phoneNumber) == otpAttempt) {
    try {
      const token = jwt.sign({ phoneNumber }, 'JayJagannath@123', { expiresIn: '1h' });
      otps.delete(phoneNumber);
      await Token.create({ phoneNumber, token });
      res.send({ token }); // Send the generated token in the response
    } catch (err) {
      console.error('Error saving token:', err);
      res.status(500).send('Error connecting to database or saving token');
    }
  } else {
    res.status(400).send('Invalid OTP');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

//mongoose.connect('mongodb+srv://demo:gQ1wMMDRI4nva5tR@cluster0.bw6vdpx.mongodb.net/book', 
// // Verify OTP
// app.get('/verify-otp/:phoneNumber/:otp', (req, res) => {
//   const phoneNumber = req.params.phoneNumber;
//   const otpAttempt = req.params.otp;

//   if (otps.has(phoneNumber) && otps.get(phoneNumber) == otpAttempt) {
//     res.send('OTP Verified successfully');
//   } else {
//     res.status(400).send('Invalid OTP');
//   }
// });