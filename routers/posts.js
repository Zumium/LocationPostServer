var express=require('express');
var passport=require('passport');
var Promise=require('bluebird');
var util=require('util');
var ps=require('../services/postservice');
var cs=require('../services/commentservice');
var genError=require('../tools/gene-error');
var upload=require('../components/picture');
var gridfs=require('../components/gridfs');
var _=require('underscore');

var router=module.exports=express.Router();

router.get('/',(req,res,next)=>{
	new Promise((resolve,reject)=>{
		try{
			var parseRes={};
			parseRes.latitude=parseFloat(req.query.latitude);
			parseRes.longitude=parseFloat(req.query.longitude);
			parseRes.range=parseInt(req.query.range);

			if(!(util.isNumber(parseRes.latitude)&&util.isNumber(parseRes.longitude)&&util.isNumber(parseRes.range)))
				throw genError(400,'Wrong query parameters');
			resolve(parseRes);
		}
		catch(e){
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
		upload.array('pictures',5),
		(req,res,next)=>{
			var newPost=req.body;
			newPost.sender=req.user;
			if(newPost.time) delete newPost.time;
			var postId=null;
			ps.publishNewPost(newPost)
				.then((np)=>{
					postId=np.id;
					if(req.files)
						np.set('pictures',req.files.map((imgFile)=>imgFile.gridfsEntry._id));
						return np.save();
					return;
				})
				.then(()=>{
					res.location('/posts/'+postId).sendStatus(201);
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
	gridfs.init(),
	(req,res,next)=>{
		var pictures=null;
		ps.findOneById(req.params.pid)
			.then((post)=>{
				if(post.get('sender')!=req.user)
					throw genError(403,'Not permitted');
				pictures=post.get('pictures');
				return post.remove();
			})
			.then(()=>{
				return Promise.all(pictures.map((eachId)=>req.gridfs.remove({_id:eachId})));
			})
			.then(()=>{
				res.sendStatus(204);
			})
			.catch(next);
	}
);

router.get('/:nid/comments',(req,res,next)=>{	
	ps.postExists(req.params.nid)
	.then((isExist)=>{
		if(!isExist)
			throw genError(404,'No such post');

		var segmentSelector=_.pick(_.mapObject(_.pick(req.query,'start','end'),(val)=>parseInt(val)),(val)=>util.isNumber(val));
		return cs.getComments(req.params.nid,segmentSelector);
	})
	.then((comments)=>{
		res.status(200).json(comments);
	})
	.catch(next);
});

router.post('/:nid/comments',
	passport.authenticate('basic',{session:false}),
	(req,res,next)=>{
	if(!util.isString(req.body.comment))
		return next(genError(400,'Must have \'comment\' key and it must be a string'));

	ps.postExists(req.params.nid)
	.then((isExist)=>{
		if(!isExist)
			throw genError(404,'No such post');
		return cs.appendComment({comment:req.body.comment,sender:req.user,postId:req.params.nid});
	})
	.then(()=>{
		res.sendStatus(201);
	})
	.catch(next);
});
