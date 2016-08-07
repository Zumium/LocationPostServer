module.exports=function(obj){
	var cloneObj={};
	for(var key in obj){
		cloneObj[key]=obj[key];
	}
	return cloneObj;
}
