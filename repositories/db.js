var mongoose=require('mongoose');

mongoose.Promise=require('bluebird');

mongoose.connect('mongodb://mongodb/locationpost');

var personSchema=mongoose.Schema({
	name:String,
	portrait:String,
	age:{type:Number,min:0,max:200},
	gender:{type:String,enum:['Male','Female']},
	birthday:Date,
	briefIntro:String
},{id:false,_id:false});

var userSchema=mongoose.Schema({
	username:{type:String,unique:true,required:true,dropDups:true},
	password:{type:String,required:true},
	person:personSchema,
	follow:[mongoose.Schema.Types.ObjectId]
});

exports.User=mongoose.model('User',userSchema);
//======================================================
var positionSchema=mongoose.Schema({
	latitude:{type:Number,min:-90,max:90},
	longitude:{type:Number,min:-180,max:180}
},{id:false,_id:false});

var postSchema=mongoose.Schema({
	position:positionSchema,
	content:{type:String,required:true},
	pictures:[String],
	time:{type:Date,default:Date.now},
	sender:{type:String,required:true}
});

exports.Post=mongoose.model('Post',postSchema);
