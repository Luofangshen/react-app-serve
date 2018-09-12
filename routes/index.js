var express = require('express');
var router = express.Router();

var UserModel = require('../db/models').UserModel;
var ChatModel=require('../db/models').ChatModel;
var md5 = require('blueimp-md5');


/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Express'});
});

/*
注册路由接口
 */
router.post('/register', function (req, res) {
    //获取req数据
    const {username, password} = req.body;
    //处理
    UserModel.findOne({username}, (err, user) => {
            if (user) {
                res.send({code: 1, msg: '此用户已存在'});
            } else {
                UserModel.create({username, password: md5(password)}, (err, user) => {
                    const {username,_id} = user;
                    res.cookie('userid', user._id, {maxAge: 1000 * 60 * 60 * 24});
                    res.send({code: 0,data:{username,_id}});
                });
            }

        }
    );
    //响应数据
});
/*
登录的路由接口
 */
router.post('/login', function (req, res) {
    const {username, password} = req.body;
    UserModel.findOne({username, password: md5(password)}, {password: 0, __v: 0}, function (err, user) {
        if (user) {
            res.cookie('userid', user._id, {maxAge: 1000 * 60 * 60 * 24})
            res.send({code: 0, data: user})
        } else {
            res.send({code: 1, msg: '用户名或者密码错误'})
        }
    })


});

/*
更新数据后台接口
 */
router.post('/update',function (req,res) {

    const user=req.body;

    const {userid}=req.cookies;
    if (!userid){
        res.send({code:1,msg:'请先登录'})
    } else{

        UserModel.findByIdAndUpdate({_id:userid},user,function (err,oldUser) {
            if (!oldUser){
                res.clearCookie('userid');
                res.send({code:1,msg:'请先登录'})
            }else{
                const {username,_id}=oldUser;
                const data=Object.assign(user,{username,_id});
                res.send({code:0,data})
            }
        })
    }

});
/*
获取当前user的信息（根据cookie）
 */
router.get('/user',function (req,res) {
    const {userid}=req.cookies;
    if (!userid){
        return  res.send({code:1,msg:'请先登录'});
    }
    UserModel.findOne({_id:userid},{password: 0, __v: 0},function (err,user) {
        if (!user){
            res.clearCookie('userid');
            res.send({code:1,msg:'请先登录'});
        }else{
            res.send({code:0,data:user});
        }

    });


});
/*
获取用户列表接口
 */
router.get('/userlist',function (req,res) {
   UserModel.find({},{password: 0, __v: 0},function (err,users) {
       if (!users){
           res.send({code:1,msg:'无法获取'})
       } else{
           res.send({code:0,data:users})
       }

   })
});
/*
获取当前用户聊天信息列表
 */
router.get('/msglist',function (req,res) {
    const {userid}=req.cookies;
    ChatModel.find({'$or':[{from:userid},{to:userid}]},function (err,chat) {
        UserModel.find({},function (err,userlist) {
            const users=userlist.reduce((users,user)=>{
                users[user._id]={username:user.username,header:user.header};
                return users;
            },{});
            res.send({code:0,data:{users,chatMsgs:chat}})
        });


    });




});

/*
修改指定消息为已读
 */

router.post('/readmsg',function (req,res) {
    const {from}=req.body;
    const to=req.cookies.userid;
    ChatModel.updateMany({from,to,read:false},{read:true}, function (err,doc) {
        res.send({code: 0, data: doc.nModified})
    })
});

module.exports = router;
