var Promise=require('bluebird');

const prefix='PORTRAIT_';
const emptyPortrait=prefix+'DEFAULT';

function getFileName(username){
	return prefix+username;
}

exports.setPortrait=function(gfs,username,instream){
	return new Promise((resolve,reject)=>{
		if(!username || !instream)
			return reject(new Error('username or instream is empty'));
		var option={filename:getFileName(username)};
		gfs.existAsync(option)
		.then((found)=>{
			if(found)
				return gfs.removeAsync(option);
			else
				return;
		})
		.then(()=>{
			var gfsWriteStream=gfs.createWriteStream(option);
			gfsWriteStream.on('finish',resolve);
			gfsWriteStream.on('error',reject);
			instream.on('error',reject);
			instream.pipe(gfsWriteStream);
		})
		.catch(reject);
	});
}

exports.getPortrait=function(gfs,username,outstream){
	return new Promise((resolve,reject)=>{
		if(!username || !outstream)
			return reject(new Error('username or outstream is empty'));
		gfs.existAsync({filename:getFileName(username)})
		.then((found)=>{
			if(!found)
				gfs.createReadStream({filename:emptyPortrait}).pipe(outstream);
			else
				gfs.createReadStream({filename:getFileName(username)}).pipe(outstream);
			outstream.on('error',reject);
			outstream.on('finish',resolve);
		})
		.catch(reject);
	});
}
