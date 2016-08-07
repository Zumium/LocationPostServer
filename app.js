var express=require('express');
var passport=require('passport');
var bodyParser=require('body-parser');

var authComponent=require('./components/auth');

var app=express();

passport.use(authComponent);

app.use(passport.initialize());
app.use(passport.authenticate('basic',{session:false}));
app.use(bodyParser.json());


