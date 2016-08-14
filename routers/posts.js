var express=require('express');
var passport=require('passport');
var Promise=require('bluebird');
var ps=require('../services/postservice');
var genError=require('../tools/gene-error');

var router=module.exports=express.Router();

router.get('/',(req,res,next)=>{
	new Promise((resolve,reject)=>{
		try{
			var parseRes={};
			parseRes.latitude=parseFloat(req.query.latitude);
			parseRes.longitude=parseFloat(req.query.longitude);
			parseRes.range=parseInt(req.query.range);
			resolve(parseRes);
		}
		catch(e){
			e.suggestStatusCode=400;
			reject(e);
		} 
	})
	.then((parameters)=>{
		return ps.findNearbyPosts({latitude:parameters.latitude,longitude:parameters.longitude},parameters.range);
	})
	.then((posts)=>{
		res.status(200).json(
			posts.map((post)=>post.toJSON())
		);
	})
	.catch(next);
});

router.post('/',
		passport.authenticate('basic',{session:false}),
		(req,res,next)=>{
			var newPost=req.body;
			newPost.sender=req.user;
			if(newPost.time) delete newPost.time;
			ps.publishNewPost(newPost)
				.then((np)=>{
					res.location('/posts/'+np.id).sendStatus(201);
				})
				.catch(next);
		}
);
//==========================================================
router.get('/:pid',(req,res,next)=>{
	ps.findOneById(req.params.pid)
		.then((post)=>{
			res.status(200).json(post.toJSON());
		})
		.catch(next);
});

router.delete('/:pid',
	passport.authenticate('basic',{session:false}),
	(req,res,next)=>{
		ps.findOneById(req.params.pid)
			.then((post)=>{
				if(post.get('sender')!=req.user)
					throw genError(403,'Not permitted');
				return post.remove();
			})
			.then(()=>{
				res.sendStatus(204);
			})
			.catch(next);
	}
);
