var express=require('express');
var passport=require('passport');
var ps=require('../services/postservice');
var genError=require('../tools/gene-error');

var router=module.exports=express.Router();

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
				if(post.get('sender')!=req.body)
					throw genError(403,'Not permitted');
				return post.remove();
			})
			.then(()=>{
				res.sendStatus(204);
			})
			.catch(next);
	}
);
