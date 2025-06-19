const scheduleCFDataSync = require('./cron/syncCFData');
const syncCodeforcesData = require('./cron/syncCFData');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const studentRoutes = require('./routes/studentRoutes'); // ✅ ADD THIS

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('SPMS Backend is running');
});

app.use('/api/students', studentRoutes); // ✅ ADD THIS

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected...');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    scheduleCFDataSync();       // 🔁 Schedules the daily job
    syncCodeforcesData();       // 🧪 Runs it immediately for testing (optional)
  })
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
  });




// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// require('dotenv').config();

// const app = express();
// const PORT = process.env.PORT || 5000;


// //Middleware
// app.use(cors());
// app.use(express.json());


// //Root Route
// app.get('/', (req, res) => {
//     res.send('SPMS Backend is running ');
// });


// //MongoDB Connection
// mongoose.connect(process.env.MONGO_URI)
//   .then(() => {
//     console.log('MongoDB connected successfully');
//     app.listen(PORT, () => {
//       console.log(`Server running on port ${PORT}`);
//     });
//   })
//   .catch(err => {
//     console.error('MongoDB connection error:', err.message);
//   });
 