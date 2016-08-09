var Promise=require('bluebird');
var db=require('./repositories/db');

exports.pushlishNewPost=function(post){
	return new Promise((resolve,reject)=>{
		db.create(post)
			.then(resolve,reject);
	});
}
