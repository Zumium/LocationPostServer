var us=require('../services/userservice');
var genError=require('../tools/gene-error');
var express=require('express');

var router=module.exports=express.Router();

router.post('/',(req,res,next)=>{
	if(!(req.body.username && req.body.password)) return next(genError(400,'Must have a username and a password'));

	us.verifyUser(req.body.username,req.body.password)
		.then((result)=>{
			if(result)
				res.status(200).json({result:'succeed'});
			else
				res.status(200).json({result:'fail'});
		})
		.catch(next);
});
