var Promise=require('bluebird');
var mongo=Promise.promisifyAll(require('mongodb'));
var grid=require('gridfs-stream');

var isDbOpened=false;

var db=new mongo.Db('locationpost',new mongo.Server('mongodb',27017));

var gfs=null;

exports.init=function(){
	return (req,res,next)=>{
		if(isDbOpened){
			req.gridfs=gfs;
			next();
		}
		else{
			db.openAsync()
			.then(()=>{
				gfs=Promise.promisifyAll(grid(db,mongo));
				isDbOpened=true;
				req.gridfs=gfs;
				next();
			})
			.catch(next);
		}
	};
}
