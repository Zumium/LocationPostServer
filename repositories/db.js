var mongoose=require('mongoose');

mongoose.Promise=require('bluebird');

mongoose.connect('mongodb://mongodb/locationpost');

var personSchema=mongoose.Schema({
	name:String,
	gender:{type:String,required:true,enum:['Male','Female']},
	birthday:{type:Date,required:true},
	briefIntro:String
},{id:false,_id:false,toJSON:{virtuals:true}});
personSchema.virtual('age').get(function(){
	return (new Date()).getYear()-this.birthday.getYear();
});

var userSchema=mongoose.Schema({
	username:{type:String,unique:true,required:true,dropDups:true},
	password:{type:String,required:true},
	person:personSchema,
	follow:{type:[String],default:[]}
},{toJSON:{virtuals:true,
	transform:function(doc,ret,options){
		  	delete ret._id;
			delete ret.__v;
			return ret;
		  }}
});

exports.User=mongoose.model('User',userSchema);
//======================================================
var locationSchema=mongoose.Schema({
	latitude:{type:Number,min:-90,max:90,required:true},
	longitude:{type:Number,min:-180,max:180,required:true}
},{id:false,_id:false});

var postSchema=mongoose.Schema({
	location:{type:locationSchema,required:true},
	content:{type:String,required:true},
	pictures:[String],
	time:{type:Date,default:Date.now},
	sender:{type:String,required:true}
},{toJSON:{
	virtuals:true,
	transform:function(doc,ret,options){
		  	delete ret._id;
			delete ret.__v;
			return ret;
		  }
}});

exports.Post=mongoose.model('Post',postSchema);
