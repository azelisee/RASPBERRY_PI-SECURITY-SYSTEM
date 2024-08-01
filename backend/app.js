const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = 5000;

const alarmRoutes = require('./routes/alarmRoutes');

app.use(bodyParser.json());
app.use(cors());

/*mongoose.connect('mongodb://localhost:27017/security_system', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Failed to connect to MongoDB', err));*/

mongoose.connect('mongodb+srv://az98:mike2011@cluster0.dhvpft4.mongodb.net/security_system?retryWrites=true&w=majority&appName=Cluster0', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Failed to connect to MongoDB', err));

app.use('/', alarmRoutes);

app.listen(port, () => {
  console.log(`Backend server is running on port ${port}`);
});
