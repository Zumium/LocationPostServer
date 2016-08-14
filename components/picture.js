var multer=require('multer');
var gridfsStorage=require('gridfs-storage-engine')({
	database:'locationpost',
	hostname:'mongodb'
});

module.exports=multer({storage:gridfsStorage});
