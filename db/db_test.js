/*使用 mongoose 操作 mongodb 的测试文件
1. 连接数据库*/

// 1.1. 引入 mongoose
const mongoose=require('mongoose');
const m5=require('blueimp-md5');
// 1.2. 连接指定数据库 (URL 只有数据库是变化的 )
mongoose.connect('mongodb://localhost:27017/db_test',{useNewUrlParser:true}, function(err){
    if(err){
        console.log("连接失败" + err)
    }else{
        console.log("连接成功")
}});

/*2. 得到对应特定集合的 Model*/

// 2.1. 字义 Schema( 描述文档结构 )
var db_schema=mongoose.Schema({
   username:String,
   password:{type:String,require:true},
   type:{type:String,require:true},
});



// 2.2. 定义 Model( 与集合对应 , 可以操作集合 )
var Usermodel=mongoose.model('user',db_schema);

/*3. 通过 Model 或其实例对集合数据进行 CRUD 操作*/
// 3.1. 通过 Model 实例的 save() 添加数据
function testInsert() {

    Usermodel.create({username:'bb',password:m5('123'),type:"laoban"});
}




// 3.2. 通过 Model 的 find()/findOne() 查询多个或一个数据
function testFind(){
    Usermodel.find({username:"bb"},function (err,data) {
        console.log(data);
    });
}



// 3.3. 通过 Model 的 findByIdAndUpdate() 更新某个数据
function testUpdate() {
    Usermodel.findByIdAndUpdate("5b63b9049b0353131c869c4a",{username:"cc"},function (err,doc) {
        console.log(doc);
    })
}


// 3.4. 通过 Model 的 remove() 删除匹配的数据
function testRemove() {
    Usermodel.remove({username:"bb"},function (err,doc) {
        console.log(err,doc);
    })
}





