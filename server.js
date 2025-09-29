const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: "https://clientportal.billq.org",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(bodyParser.json({ limit: '10mb' }));

const transporter = nodemailer.createTransport({
  host: "smtp.sendgrid.net",
  port: 587,
  secure: false,
  auth: {
    user: "apikey", // this is literally the string "apikey"
    pass: process.env.SENDGRID_API_KEY
  }
});

app.post('/send-report', async (req, res) => {
  const { to, subject, html, images = [] } = req.body;

  const attachments = images.map((base64, index) => {
  const matches = base64.match(/^data:image\/(png|jpeg);base64,(.+)$/);
  const extension = matches[1];
  const data = matches[2];

  return {
    filename: `chart${index}.${extension}`,
    content: Buffer.from(data, 'base64'),
    cid: `chart${index}@report` // This must match img src="cid:chartX@report"
  };
});
  
    // Replace base64 <img src> with cid references
  
  

  const mailOptions = {
    from: 'gowtham@billq.org',
    to,
    subject,
    html,
    attachments
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).send('Email sent successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error sending email');
  }
});

app.listen(PORT, () => {
  console.log(`Email server running on http://localhost:${PORT}`);
});


