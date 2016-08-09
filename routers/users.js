var us=require('../services/userservice');
var ps=require('../services/postservice');
var genError=require('../tools/gene-error');
var userTools=require('../tools/user');
var express=require('express');
var passport=require('passport');

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
			res.status(200).json(userTools.abstractUserInfo(user));
		})
		.catch(next);
});

router.patch('/:username',
		passport.authenticate('basic',{session:false}),
		(req,res,next)=>{
			//permission check
			if(req.user!=req.params.username) throw genError(403,'Not permitted');
			us.findOneByUsername(req.params.username)
				.then((user)=>{
					return user.update(req.body);
				})
				.then((result)=>{
					if(result.ok==0) throw genError(400,'Operation failed due to wrong request');
					res.sendStatus(200);
				})
				.catch(next);
		}
);
//=============================================================
router.get('/:username/posts',(req,res,next)=>{
	ps.findBySender(req.params.username)
		.then((posts)=>{
			res.status(200).json(posts.map((post)=>{
				return post.toJSON();
			}));
		})
		.catch(next);
});
