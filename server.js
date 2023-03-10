const express = require('express');
const cors = require('cors');
const path = require('path');
const compression = require('compression');
const enforce = require('express-sslify');

if(process.env.NODE_ENV !== 'production') require('dotenv').config();

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
const port = process.env.PORT || 5001;

const corsOptions = require('./config/cors-option')

app.use(compression());
app.use(express.json());
// app.use(enforce.HTTPS({trustProtoHeader: true}));
app.use(express.urlencoded({extended: false}));
app.use(cors(corsOptions));

app.use(function (req, res, next) {
	res.header('Access-Control-Allow-Origin', req.headers.origin);
	res.header(
		'Access-Control-Allow-Headers',
		'Origin, X-Requested-With, Content-Type, Accept'
	);
	res.header('Access-Control-Allow-Credentials', true);
	res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH');
	next();
});

if(process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'))
  });
}

app.get('/service-worker.js', (req, res) => {
  res.sendFile(path.resolve(__dirname, '..', 'build', 'service-worker.js'))
})

app.post('/payment', async (req, res) => {
  const { amount } = req.body;

	try {
		const paymentIntent = await stripe.paymentIntents.create({
			amount,
			currency: 'usd',
			payment_method: 'pm_card_visa',
		});
		return res.status(200).json(paymentIntent);
	} catch(err) {
		console.log(err);
	}
})

app.listen(port, (error) => {
  if(error) throw error;
  console.log(`Server is running on port ${port}...`);
})