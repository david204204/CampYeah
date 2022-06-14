if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}


const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const helmet = require('helmet');
const MongoDBStore = require('connect-mongo')(session);
//const dbUrl = process.env.DB_URL;

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';
//mongodb://localhost:27017/yelp-camp


const campgroundsRoutes = require('./routes/campgrounds');
const reviewsRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users')

mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Databse connected");
})


const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: true }));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, 'public'))); //for using static assets in public folder (use in boilerplate)


const secret = process.env.SECRET || 'thisiscampgroundland';

const store = new MongoDBStore({
    url: dbUrl,
    secret,
    tuchAfter: 24 * 60 * 60 // in sec not milisec
})

store.on('error', function(e){
    console.log('SESSION STORE ERROR');
})

//session config for cookies and flash etc
const sesionConfig = {
    store,
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        //name: 'session',
        httpOnly: true, //extra security for not reveal cookie to a third party
        //scure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, //save the expires to 7 days, after that the user will rernter his pass or username and etc
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}




app.use(session(sesionConfig))
app.use(flash());


const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net/",
    "https://res.cloudinary.com/ddpmhumqy/"
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net/",
    "https://res.cloudinary.com/ddpmhumqy/"
];
const connectSrcUrls = [
    "https://*.tiles.mapbox.com",
    "https://api.mapbox.com",
    "https://events.mapbox.com",
    "https://res.cloudinary.com/ddpmhumqy/"
];
const fontSrcUrls = [ "https://res.cloudinary.com/ddpmhumqy/" ];
 
app.use(
    helmet.contentSecurityPolicy({
        directives : {
            defaultSrc : [],
            connectSrc : [ "'self'", ...connectSrcUrls ],
            scriptSrc  : [ "'unsafe-inline'", "'self'", ...scriptSrcUrls ],
            styleSrc   : [ "'self'", "'unsafe-inline'", ...styleSrcUrls ],
            workerSrc  : [ "'self'", "blob:" ],
            objectSrc  : [],
            imgSrc     : [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/ddpmhumqy/", 
                "https://images.unsplash.com/"
            ],
            fontSrc    : [ "'self'", ...fontSrcUrls ],
            mediaSrc   : [ "https://res.cloudinary.com/ddpmhumqy/" ],
            childSrc   : [ "blob:" ]
        }
    })
);




//for login and all the authenticate package must be after session
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

//how we store users in session and how we get that user out of this session
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());




//acsses all the flash messages that apears and save it to a general var for more clean rout page
app.use((req, res, next) => {
 
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})


//restructing 1 file to 2 another files
app.use('/campgrounds', campgroundsRoutes);
app.use('/campgrounds/:id/reviews', reviewsRoutes);
app.use('/', userRoutes);


app.get('/', (req, res) => {

    res.render('home');
});


app.all('*', (req, res, next) => {
    next(new ExpressError('Page not found', 404))
})


app.use((err, req, res, next) => {
    const { statusCode = 500, message = 'Somthing went worng' } = err;
    if (!err.message) { err.message = 'Something unexpected happened' };
    res.status(statusCode).render('error', { err });

})

app.listen(3000, () => {
    console.log('serving on port 3000');
})