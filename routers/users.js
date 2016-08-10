var us=require('../services/userservice');
var ps=require('../services/postservice');
var genError=require('../tools/gene-error');
var userTools=require('../tools/user');
var util=require('util');
var express=require('express');
var passport=require('passport');
var Promise=require('bluebird');

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
//============================================================
router.get('/:username/follow',(req,res,next)=>{
	us.findOneByUsername(req.params.username)
		.then((user)=>{
			return Promise.all(user.follow.map((followerName)=>{
				return us.findOneByUsername(followerName);
			}));
		})
		.then((followers)=>{
			res.status(200).json(followers.map((follower)=>{
				var followerInfo=userTools.abstractUserInfo(follower);
				followerInfo.username=follower.username;
				return followerInfo;
			}));
		})
		.catch(next);
});

router.patch('/:username/follow',
	passport.authenticate('basic',{session:false}),
	(req,res,next)=>{
		switch(req.body.operation){
			case 'add':
				addFollowing(req,res,next);
				break;
			case 'delete':
				delFollowing(req,res,next);
				break;
			default:
				next(genError(400,'No such operation'));
		}
	}
);

function addFollowing(req,res,next){
	new Promise((resolve,reject)=>{
		if(!util.isArray(req.body.username))
			return reject(genError(400,'Wrong request format'));
		if(req.user!=req.params.username)
			return reject(genError(403,'Not permitted'));
		resolve();
	})
	.then(()=>{
		return Promise.all(req.body.username.map((eachUser)=>{
			return us.checkUserExists(eachUser);
		}));
	})
	.then((validationResults)=>{
		if(!validationResults.reduce((x,y)=>{return x&&y;}))
			throw genError(400,'Unexisting user(s) in the request');
		return us.findOneByUsername(req.params.username);
	})
	.then((user)=>{
		var originalFollowerList=user.get('follow');
		user.set('follow',originalFollowerList.concat(req.body.username.filter((uname)=>{return !originalFollowerList.includes(uname);})));
		return user.save();
	})
	.then(()=>{
		res.sendStatus(200);
	})
	.catch(next);
}

function delFollowing(req,res,next){
	new Promise((resolve,reject)=>{
		if(!util.isArray(req.body.username))
			return reject(genError(400,'Wrong request format'));
		if(req.user!=req.params.username)
			return reject(genError(403,'Not permitted'));
		resolve();
	})
	.then(()=>{
		return us.findOneByUsername(req.params.username);
	})
	.then((user)=>{
		var originalFollowerList=user.get('follow');
		user.set('follow',originalFollowerList.filter((follower)=>{
			return !req.body.username.includes(follower);
		}));
		return user.save();
	})
	.then(()=>{
		res.sendStatus(200);
	})
	.catch(next);
}
