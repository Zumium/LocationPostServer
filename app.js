var express=require('express');
var passport=require('passport');
var bodyParser=require('body-parser');

var authComponent=require('./components/auth');
var errorHandler=require('./middlewares/error-handler');

var routerAuth=require('./routers/auth');

var app=express();

passport.use(authComponent);

app.use(passport.initialize());
app.use(bodyParser.json());

app.use('/auth',routerAuth);

app.use(passport.authenticate('basic',{session:false}));

app.use(errorHandler);

app.listen(80);
