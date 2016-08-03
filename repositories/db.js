var mongoose=require('mongoose');

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
