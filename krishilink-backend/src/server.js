require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/error');

const app = express();
app.use(helmet());
app.use(cors({ origin: (process.env.CLIENT_URL || '*').split(',') })); // frontend ka URL
app.use(express.json());
app.use(morgan('dev'));

app.get('/', (req, res) => res.json({ app: 'KrishiLink API', mock: process.env.USE_MOCK === 'true' }));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/market', require('./routes/market'));
app.use('/api/produce', require('./routes/produce'));
app.use('/api/requirements', require('./routes/requirements'));
app.use('/api/match', require('./routes/match'));
app.use('/api/offers', require('./routes/offers'));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
connectDB().then(() => app.listen(PORT, () => console.log(`Server on :${PORT}`)))
  .catch(e => { console.error('DB connection failed:', e.message); process.exit(1); });
