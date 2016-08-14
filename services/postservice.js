var Promise=require('bluebird');
var db=require('../repositories/db');
var genError=require('../tools/gene-error');

const METER_PER_DEGREE=6379500/360.0; //6379.5km

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

exports.findNearbyPosts=function(position,range){
	return new Promise((resolve,reject)=>{
		var degreeRange=range/METER_PER_DEGREE;
		db.Post.find({
			'location.latitude':{$gt:position.latitude-degreeRange,$lt:position.latitude+degreeRange},
			'location.longitude':{$gt:position.longitude-degreeRange,$lt:position.longitude+degreeRange}
		})
		.then(resolve,reject);
	});
}
