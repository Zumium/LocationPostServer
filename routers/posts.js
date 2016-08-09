var express=require('express');
var passport=require('passport');
var ps=require('../services/postservice');

var router=module.exports=express.Router();

router.post('/',
		passport.authenticate('basic',{session::false}),
		(req,res,next)=>{
			var newPost=req.body;
			newPost.sender=req.user;
			if(newPost.time) delete newPost.time;
			db.publishNewPost(newPost)
				.then((np)=>{
					res.location('/posts/'+np.id).sendStatus(201);
				})
				.catch(next);
		}
);
