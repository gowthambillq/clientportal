const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sgMail = require('@sendgrid/mail');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: "https://clientportal.billq.org",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(bodyParser.json({ limit: '10mb' }));

// ✅ Set SendGrid API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

app.post('/send-report', async (req, res) => {
  const { to, subject, html, images = [] } = req.body;

  // Convert base64 images to SendGrid-compatible attachments
  const attachments = images.map((base64, index) => {
    const matches = base64.match(/^data:image\/(png|jpeg);base64,(.+)$/);
    const extension = matches[1];
    const data = matches[2];

    return {
      content: data, // base64 string only, no Buffer
      filename: `chart${index}.${extension}`,
      type: `image/${extension}`,
      disposition: 'inline',
      content_id: `chart${index}@report`
    };
  });

  const msg = {
    to,
    from: 'gowtham@billq.org', // must be verified in SendGrid
    subject,
    html,
    attachments
  };

  try {
    await sgMail.send(msg);
    res.status(200).send('Email sent successfully');
  } catch (error) {
    console.error(error.response?.body || error);
    res.status(500).send('Error sending email');
  }
});

app.listen(PORT, () => {
  console.log(`Email server running on port ${PORT}`);
});
