const express = require("express");
const exphbs = require("express-handlebars");
const bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
var { v4: uuidv4 } = require("uuid");
var session = require("express-session");
var moment = require("moment");

//const fileUpload = require('express-fileupload');
var path = require("path");
//const mysql = require('mysql');

require("dotenv").config();

const app = express();
const port = process.env.PORT || 1500;

//image pload
//app.use(fileUpload());
//parsing middleware
app.use(bodyParser.urlencoded({ extended: true }));

//parse application.json
app.use(bodyParser.json());


//declare static file
app.use(express.static("public"));
app.use(express.static(path.join(__dirname, "/uploads")));
app.use(express.static(path.join(__dirname, "/node_modules")));
//app.use(express.static('uploads'));

// initialize cookie-parser to allow us access the cookies stored in the browser.
app.use(cookieParser());

// initialize express-session to allow us track the logged-in user across sessions.
//console.log('secret = ' + uuidv4())

var sec = uuidv4();
app.use(
  session({
    secret: sec,
    resave: true,
    saveUninitialized: true,
  })
);
////////////handlebars register

//templating engine
const handlebars = exphbs.create({
  extname: ".hbs",
  helpers: {
    substr: function (len, context) {
      if (context.length > len) {
        return context.substring(0, len) + "..";
      } else {
        return context;
      }
    },
    subdate: function (context) {
      //var context = context.toString()
      return moment(context).format("DD - MM - YYYY");
    },
    removeTimeZone: function (context) {
      //var context = context.toString()
      return context.toLocaleString()
    },
    base_url: function (){
      return 'https://www.mawobuy.com';
    },
    if_equal: function (v1, v2) {
      if (v1 == v2) {
        return true;
      } else {
        return false;
      }
    },
    if_greater: function (v1, v2) {
      if (v1 > v2) {
        return true;
      } else {
        return false;
      }
    },
    if_not_equal: function (v1, v2) {
      if (v1 != v2) {
        return true;
      } else {
        return false;
      }
    },
    index_plas: function (v1, v2){
       return v1 + v2
    },
    price: function (price) {
      return price.toLocaleString()
    },
  },
});

app.engine(".hbs", handlebars.engine);
app.set("view engine", ".hbs");

// This middleware will check if user's cookie is still saved in browser and user is not set, then automatically log the user out.
// This usually happens when you stop your express server after login, your cookie still remains saved in the browser.
app.use((req, res, next) => {
  var cookie_data = req.cookies.usiri_user;

  if (!req.session.user && cookie_data === undefined) {
    req.session.user = { isLoged: false, user: {} };
  }

  console.log("defore cokies");
  console.log(req.session.user);

  if (cookie_data) {
    req.session.user = cookie_data;
  }

  console.log("after cookies data set");
  console.log(req.session.user);

  next();
});

//routers
const routes = require("./server/routers/routers");
app.use("/", routes);

///check if page not exist
app.use(function (req, res, next) {
  res.status(404);
  // respond with html page
  if (req.accepts("html")) {
    res.render("404", { url: req.url });
    return;
  }
});

app.listen(port, () => console.log(`listening on port ${port}`));
//app.listen();
