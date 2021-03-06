var us=require('../services/userservice');
var ps=require('../services/postservice');
var pts=require('../services/portraitservice');
var genError=require('../tools/gene-error');
var userTools=require('../tools/user');
var gridfs=require('../components/gridfs');
var util=require('util');
var express=require('express');
var passport=require('passport');
var Promise=require('bluebird');
var _=require('underscore');

var router=module.exports=express.Router();

router.get('/',(req,res,next)=>{
	if(!req.query.search)
		return next(genError(400,'Must have \'search\' query'));

	us.searchUser(req.query.search,['username','name'])
		.then((users)=>{
			res.status(200).json(users.map((user)=>{
				var personalInfo=userTools.abstractUserInfo(user);
				personalInfo.username=user.get('username');
				return personalInfo;
			}));
		})
		.catch(next);
});

router.post('/',(req,res,next)=>{
	us.checkUserExists(req.body.username)
		.then((isExists)=>{
			if(isExists) 
				throw genError(403,'用户名已被占用');
			return us.addUser(req.body);
		})
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
			if(req.user!=req.params.username)
				return next(genError(403,'Not permitted'));
			if(req.body.username)
				return next(genError(400,'Cannot to change username'));

			us.findOneByUsername(req.params.username)
				.then((user)=>{
					return user.update({person:_.extend(user.get('person'),req.body)});
				})
				.then((result)=>{
					if(result.ok==0) throw genError(400,'Operation failed due to wrong request');
					res.sendStatus(200);
				})
				.catch(next);
		}
);
//=============================================================
router.put('/:username/password',
	passport.authenticate('basic',{session:false}),
	(req,res,next)=>{
		//user authorization check
		if(req.user!=req.params.username)
			return next(genError(403,'Not permitted'));
		//content valiation check
		if(!util.isString(req.body.password))
			return next(genError(400,'Wrong request content'));

		us.findOneByUsername(req.params.username)
			.then((user)=>{
				return user.update({password:req.body.password}); //filter out other properties for safety
			})
			.then(()=>{
				res.sendStatus(204);
			})
			.catch(next);
	}
);
//=============================================================
router.get('/:username/portrait',
	gridfs.init(),
	(req,res,next)=>{
		pts.getPortrait(req.gridfs,req.params.username,res)
			.then(()=>{
				res.sendStatus(200);
			})
			.catch(next);
	}
);

router.put('/:username/portrait',
	passport.authenticate('basic',{session:false}),
	gridfs.init(),
	(req,res,next)=>{
		if(req.user!=req.params.username)
			return next(genError('403','Not permitted'));
		pts.setPortrait(req.gridfs,req.params.username,req)
			.then(()=>{
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
		if(!req.body.username.map((eachOne)=>{return originalFollowerList.includes(eachOne);}).reduce((x,y)=>{return x&&y;}))
			throw genError(400,'username list error');
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
