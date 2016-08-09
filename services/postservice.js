var Promise=require('bluebird');
var db=require('../repositories/db');
var genError=require('../tools/gene-error');

exports.publishNewPost=function(post){
	return new Promise((resolve,reject)=>{
		db.Post.create(post)
			.then(resolve,reject);
	});
}

exports.findOneById=function(id){
	return new Promise((resolve,reject)=>{
		db.Post.findOne({_id:id})
			.then((post)=>{
				if(!post) throw genError(404,'No such post');
				resolve(post);
			})
			.catch(reject);
	});
}

exports.findBySender=function(sender){
	return new Promise((resolve,reject)=>{
		db.Post.find({sender:sender})
			.then(resolve)
			.catch(reject);
	});
}
