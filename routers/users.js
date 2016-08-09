var us=require('../services/userservice');
var genError=require('../tools/gene-error');
var userTools=require('../tools/user');
var express=require('express');

var router=module.exports=express.Router();

router.post('/',(req,res,next)=>{
	us.addUser(req.body)
		.then((newUser)=>{
			res.location('/users/'+newUser.username).sendStatus(201);
		})
		.catch(next);
});

//==================================
router.get('/:username',(req,res,next)=>{
	us.findOneByUsername(req.params.username)
		.then((user)=>{
			if(!user) throw genError(404,'No such user');
			res.status(200).json(userTools.abstractUserInfo(user));
		})
		.catch(next);
});
