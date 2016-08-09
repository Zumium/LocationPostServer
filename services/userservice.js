var db=require('../repositories/db');
var genError=require('../tools/gene-error');
var filtObject=require('../tools/filt-object');
var clone=require('../tools/clone');
var Promise=require('bluebird');

exports.addUser=function(personInfo){
	return new Promise((resolve,reject)=>{
		if(!personInfo['username']) return reject(genError(400,'Must have a username'));
		if(!personInfo['password']) return reject(genError(400,'Must have a password'));

		var personalInformation=clone(personInfo);
		var username=personalInformation.username;
		var password=personalInformation.password;
		delete personalInformation['username'];
		delete personalInformation['password'];

		db.User.create({username:username,password:password,person:personalInformation,follow:[]}).then(resolve,reject);
	});
}

exports.verifyUser=function(username,password){
	return new Promise((resolve,reject)=>{
		db.User.findOne({username:username})
			.then((user)=>{
				if(!user) return resolve(false);
				resolve(user.password===password);
			})
			.catch(reject);
	});
}

exports.findOneByUsername=function(username){
	return new Promise((resolve,reject)=>{
		db.User.findOne({username:username})
			.then(resolve)
			.catch(reject);
	});
}
