const cron = require('node-cron');
const Food = require('../models/foodItems');
const nodemailer = require('nodemailer');

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // Use your email service (e.g., Gmail, SMTP)
  auth: {
    user: 'shaileshmali97@gmail.com', // Replace with your email
    pass: 'axfe kure vlqd felk', // Replace with your email password or app password
  },
});

// Cron job to check for expiring products
cron.schedule('0 7 * * *', async () => {
  console.log('Running expiry check at 7 AM daily.');

  try {
    const today = new Date();
    const threeDaysLater = new Date();
    threeDaysLater.setDate(today.getDate() + 7);

    // Fetch products expiring in the next 3 days
    const expiringProducts = await Food.find({
      expiryDate: { $gte: today, $lte: threeDaysLater },
    });

    if (expiringProducts.length > 0) {
      const productList = expiringProducts
        .map(product => `${product.name} (Expires on ${product.expiryDate.toDateString()})`)
        .join('\n');

      // Email notification
      const mailOptions = {
        from: 'shaileshmali97@gmail.com',
        to: 'sakshismp1a052@gmail.com', // Replace with the recipient's email
        subject: 'Alert: Products About to Expire',
        text: `The following products are about to expire:\n\n${productList}`,
      };

      await transporter.sendMail(mailOptions);
      console.log('Expiry notification sent successfully.');
    } else {
      console.log('No products expiring in the next 3 days.');
    }
  } catch (err) {
    console.error('Error during expiry notification:', err.message);
  }
});

module.exports = cron;
