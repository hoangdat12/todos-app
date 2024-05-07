require('dotenv').config();
const express = require('express');
// const { connectToMongoDB } = require('./database');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Health check endpoint
app.get('/', (req, res) => {
  res.status(200).json({ msg: 'success' });
});

app.use(express.static(path.join(__dirname, 'build')));

const router = require('./routes');

app.use('/api', router);

const port = process.env.PORT || 5000;

async function startServer() {
  // await connectToMongoDB();
  app.listen(port, () => {
    console.log(`Server is listening on http://localhost:${port}`);
  });
}
startServer();
