var Promise=require('bluebird');
var db=require('../repositories/db');

exports.publishNewPost=function(post){
	return new Promise((resolve,reject)=>{
		db.Post.create(post)
			.then(resolve,reject);
	});
}
