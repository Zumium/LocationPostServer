var us=require('../services/userservice');
//var genError=require('../tools/gene-error');
var express=require('express');

var router=module.exports=express.Router();

router.post('/',(req,res,next)=>{
	us.addUser(req.body)
		.then((newUser)=>{
			res.location('/users/'+newUser.username).sendStatus(201);
		})
		.catch(next);
});