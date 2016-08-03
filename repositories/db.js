var mongoose=require('mongoose');

mongoose.connect('mongodb://mongodb/locationpost');

var personSchema=mongoose.Schema({
	name:String,
	portrait:String,
	age:{type:Number,min:0,max:200},
	gender:String,
	birthday:Date,
	briefIntro:String
},{id:false,_id:false});

var accountSchema=mongoose.Schema({
	username:String,
	password:String
},{id:false,_id:false});

var userSchema=mongoose.Schema({
	person:personSchema,
	account:accountSchema,
	follow:[mongoose.Schema.Types.ObjectId]
});

exports.User=mongoose.model('User',userSchema);
