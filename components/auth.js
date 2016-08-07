var strategy=require('passport-http').BasicStrategy;
var us=require('../services/userservice');

module.exports=new strategy((username,password,done)=>{
	us.verifyUser(username,password)
		.then((result)=>{
			if(result)
				done(null,username);
			else
				done(null,false);
		})
		.catch(done);
});
