const express=require('express')
const mongoose = require('mongoose')
const path=require('path')
var user=require('./routes/user')
var admin=require('./routes/admin')
const bodyParser = require('body-parser');
var hbs=require('express-handlebars').engine
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const app=express()
const nocache = require("nocache")
var connect= require("./config/connection")
var middleware=require('./middlewares/middleware')
const { Collection } = require('mongoose')
const multer=require('multer')
connect()



app.use(nocache())
app.use(express.json())
app.use(bodyParser.urlencoded({ extended:false}))
app.use(bodyParser.json())
const cookieParser = require("cookie-parser");
const sessions = require('express-session');
const products = require('./models/admin/productModel')
app.use(cookieParser());
app.set('views', path.join(__dirname, 'views'));
app.engine('hbs',hbs({extname:'hbs',defaultLayout:'layout',layoutsDir:__dirname+'/views/layout/',partialsDir:__dirname+'/views/partials/'}))
app.set('view engine', 'hbs');
   admin.use((req, res, next) => {
    next();
  });
  user.use((req, res, next) => {
    next();
  });
  app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: false,
  }),
);
const oneDay = 1000 * 60 * 60 * 24;
app.use(sessions({
  secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
  saveUninitialized: true,
  cookie: { maxAge: oneDay },
  resave: false
}));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/',async(req,res)=>{
  const check=await products.find().limit(6).lean()
  res.render('users/landing-page',{check})
})
app.use('/user',user)
app.use('/admin',admin)

app.listen(3000,console.log("server started"))