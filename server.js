
require('dotenv').config();
const express = require('express')
const mongoose = require('mongoose')
const ejs = require('ejs')
const bodyParser = require('body-parser');
const methodOverride = require('method-override')
const MongoStore = require('connect-mongo');
const path = require('path');

const app = express()
const session = require('express-session');
const flash = require('express-flash');



//session middleware

app.use(
    session({
      secret: process.env.SESSION_SECRET_KEY,
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({ mongoUrl: process.env.dbURL }),
      cookie: {
        secure: true, 
        httpOnly: true,
        maxAge: 30 * 60 * 1000 //session cookies expires after 30minutes
      }
    })
  );

  // Set up flash middleware
app.use(flash());

// Middleware to pass flash messages to all views
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

// const isAuthenticated = require('./middleware/authMiddleware.js');

//import routes
const adminRouter = require('./Routes/admin.js');
const paymentRouter = require('./Routes/payment.js')
const routesRouter = require("./Routes/routes")
const sitesRoutes = require('./Routes/sites.js');





// Middleware for serving static files and parsing body data
app.use(methodOverride('_method'));
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());

//seting ejs view engine
app.set('view engine','ejs')
app.set('views', path.join(__dirname, 'views'));
//routes middleware
app.use('/', adminRouter);
app.use('/payment', paymentRouter );
app.use('/', routesRouter)
app.use('/sites', sitesRoutes);

//mongoDb connection
const dbURL = process.env.dbURL

mongoose.connect(dbURL)
.then(()=>{
    console.log("Database connection was successfull")
})
.catch((err)=> console.error(err))


    // Rendering 404 page for mispath
    app.use((req, res) => {
        console.log('404 handler triggered');
        res.status(404).render('404');
      });
      
      // Error handling middleware
      app.use((err, req, res, next) => {
        console.error(err.stack);
        res.status(500).send('Something broke!');
      });
    

const port = process.env.PORT

app.listen(port, ()=>{
    console.log("server is up and listening for requests")
})