var Promise=require('bluebird');
var db=require('../repositories/db');

exports.publishNewPost=function(post){
	return new Promise((resolve,reject)=>{
		db.Post.create(post)
			.then(resolve,reject);
	});
}

exports.findOneById=function(id){
	return new Promise((resolve,reject)=>{
		db.Post.findOne({_id:id})
			.then(resolve)
			.catch(reject)
	});
}
