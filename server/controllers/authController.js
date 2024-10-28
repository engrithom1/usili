const pool = require('../config/dbconfig')
const bcrypt = require('bcrypt');
var data = require('../data')

var richFunctions = require('../richardFunctions')

const axios = require("axios");
const https = require("https");
var btoa = require("btoa");

const api_key = "958144a52338709f";
const secret_key = "ZDc1Nzk5NDg5NjQ3NDkwZmRmYzQzMzZiZTg1YjBlMDE1NjI1YTFhMTEzMTA1ZWQ1YTIzNDU0ODRlOTI2NDY2Nw==";
const content_type = "application/json";
const source_addr ="AKILIFORUM";

var farFuture = new Date(new Date().getTime() + (1000*60*30));
//*60*24*365*10
var userInfo = data.userInfo;

////constroller functions
//4 get pass
exports.forgetPassword = (req, res) =>{

    var { username, phone_number } = req.body;

    var phone1 = phone_number.substr(phone_number.length - 9);
    
    pool.getConnection((err, connection) =>{
        if(err) throw err;
        ///check if user exist
        connection.query('SELECT * FROM users WHERE username = ?',[username], (err, rows) => { 
            if(!err){

                if(rows.length == 0){
                    return res.send('fail_username') 
                }

                var phone2 = rows[0].phone_number 
                
                console.log("phone numba1 "+phone1)

                var phone2 = phone2.substr(phone2.length - 9);
                console.log("phone numba2 "+phone2)

                if(phone1 == phone2){
                    
                    var password = richFunctions.randomString(8,'0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
                    bcrypt.hash(password, 10, function(err, hash) {

                        connection.query("UPDATE users SET password = ? WHERE username = ?",[hash, username],(err,rows)=>{
                            if(!err){
                                axios
                                .post(
                                "https://apisms.beem.africa/v1/send",
                                {
                                    source_addr: source_addr,
                                    schedule_time: "",
                                    encoding: 0,
                                    message: "Kwasasa nenosiri ni "+password+" lakini nivema ukabadiri ulipendalo, go to your to change it",
                                    recipients: [
                                    {
                                        recipient_id: 1,
                                        dest_addr: "255"+phone1,
                                    }
                                    ]
                                },
                                {
                                    headers: {
                                    "Content-Type": content_type,
                                    Authorization: "Basic " + btoa(api_key + ":" + secret_key),
                                    },
                                    httpsAgent: new https.Agent({
                                    rejectUnauthorized: false,
                                    }),
                                }
                                )
                                .then(
                                    (response) => {console.log(response, api_key + ":" + secret_key)
                                    return res.send('success')
                                })
                                .catch((error) => {console.error(error.response.data)
                                    return res.send('fail_send')
                                });
                            }else{
                                console.log(err);
                            }
                         })

                    }) 
       
                }
                else{
                    return res.send('fail_phone')
                }

                ////send
                
            }else{
                console.log(err);
                return res.send('fail')
            }
        })
    })   

}

exports.loginForm = (req, res)=>{
    
    var seo_data = {
        title:"login form",
        description:"login form"
    } 

    if(req.session.flag == 1){
        req.session.destroy();
        res.render('auth/login',{layout:'auth', seo_data,message:"Password miss match"})
    }else if(req.session.flag == 2){
        req.session.destroy();
        res.render('auth/login',{layout:'auth', seo_data,message:"Incorrect Username"})
    }else if(req.session.flag == 3){
        req.session.destroy();
        res.render('auth/login',{layout:'auth', seo_data,message:"Server error try again"})
    }else if(req.session.flag == 4){
        req.session.destroy();
        res.render('auth/login',{layout:'auth', seo_data,message:"Your branch has beed Closed. contact manager"})
    }else if(req.session.flag == 5){
    req.session.destroy();
    res.render('auth/login',{layout:'auth', seo_data,message:"Your account is not Active. contact manager"})
}
    else{
        res.render('auth/login',{layout:'auth', seo_data})
    }
    
}

exports.registerForm = (req, res)=>{
    if(req.session.flag == 1){
        req.session.destroy();
        res.render('auth/register',{title:"Register form",message:"Username already exist"})
    }else if(req.session.flag == 2){
        req.session.destroy();
        res.render('auth/register',{title:"Register form",message:"Server error try again"})
    }else{
        res.render('auth/register',{title:"Register form"})
    }
    
}

//register
exports.register = (req, res) => {
    var { username, password, phone_number,path} = req.body;

    if(path){
        req.session.path = path
    } 
   
    pool.getConnection((err, connection) =>{
        if(err) throw err;
        ///check if user exist
        connection.query('SELECT * FROM users WHERE username = ?',[username], (err, rows) => { 
            if(!err){
                if(rows.length == 0){
                    //inser query
                    bcrypt.hash(password, 10, function(err, hash) {
                        connection.query('INSERT INTO users SET username = ? , password = ? , phone_number = ?',[username, hash, phone_number], (err, rows) => {
                            if(!err){
                                var id = rows.insertId
                                connection.query('SELECT * FROM users WHERE id = ?',[id], (err, rows) => { 
                                    if(!err){
                                        //console.log(rows)
                                        var role = rows[0].role
                                        var subscription = rows[0].subscription
                                        var avator = rows[0].avator
                                        var id = rows[0].id
                                        var phone_number = rows[0].phone_number
                                        var logedUser = {isLoged:true, user:{username,role,subscription,avator,id,phone_number}}
    
                                        req.session.user = logedUser;
                                        res.cookie('usiri_user',logedUser,{ expires: farFuture })

                                        console.log('from login')
                                        console.log(req.session.user);
                                        if(req.session.path){
                                            res.redirect(req.session.path);
                                        }else{
                                            res.redirect('/');
                                        }
                                        
                                    }else{
                                        res.redirect('/login');  
                                    }
                                })        
                            }else{
                                req.session.flag = 2
                                console.log(err);
                                res.redirect('/register');
                                
                            }
                        })
                      });
                    
                   
                }else{
                    req.session.flag = 1    
                    console.log('user exist');
                    res.redirect('/register');
                }
            }else{
                req.session.flag = 2
                console.log('server error');
                res.redirect('/register');
            }
        })
       
    })

}

exports.login = (req, res) => {
    var { username, password} = req.body;
    //console.log(req.body)

    //connect to DB
    pool.getConnection((err, connection) =>{
        if(err) throw err;
        //console.log('Connection as ID '+connection.threadId)

        //query
        connection.query('SELECT * FROM users WHERE username = ?',[username], (err, rows) => { 
            if(!err){
                if(rows.length != 0){
                    var user = rows[0]

                    var pass = user.password;
                   
                    var doMatch = bcrypt.compareSync(password, pass)

                        if(doMatch){
                            var role = user.role
                            var avator = user.avator
                            var id = user.id
                            var status = user.status
                            var bid = user.branch_id
                            var fulname = user.fulname
                            var username = user.username
                            var phone1 = user.phone1

                            if(status == 1){

                            connection.query('SELECT * FROM branches WHERE id = ?',[bid], (err, rows) => { 
                                if(!err){
                                    var branch = rows[0]

                                    var bname = branch.name
                                    var bthumbnail = branch.thumbnail
                                    var bregion = branch.region
                                    var bdistrict = branch.district
                                    var blocation = branch.location
                                    var bstatus = branch.status

                                    if(bstatus == 1){

                                    var logedUser = {isLoged:true, user:{role,avator,id,fulname,username,phone1,status,bid,bname,bthumbnail,bregion,bdistrict,blocation,bstatus}}

                                    req.session.user = logedUser;
                                    res.cookie('usiri_user',logedUser,{ expires: farFuture })
                                
                                    console.log(req.session.user)
                                
                                    res.redirect('/');
                                    }else{
                                        req.session.flag = 4
                                        res.redirect('/login');
                                    }
                                }else{
                                    req.session.flag = 3
                                    res.redirect('/login');
                                    console.log(err);
                                }
                            })
                            }else{
                                req.session.flag = 5
                                res.redirect('/login');
                            }

                        }else{
                            req.session.flag = 1
                            res.redirect('/login');
                        }

                }else{
                    req.session.flag = 2
                    console.log('user not exist')
                    res.redirect('/login');
                }

            }else{
                req.session.flag = 3
                res.redirect('/login');
                console.log(err);
            }
            
            //console.log('the data: \n',rows);
        })
    })

}

exports.logout = (req, res) => {
    if (req.session.user) {
		req.session.user = {isLoged:false,user:{}};
        console.log("ater log outttttttt")
        console.log(req.session.user)
        res.clearCookie('usiri_user')
        
        res.redirect('/');
    } else {
        res.redirect('/');
    }
}

exports.changePassword = (req, res) => {

    var { cpassword, npassword} = req.body; 

    var username = req.session.user.user.username

    //connect to DB
    pool.getConnection((err, connection) =>{
        if(err) throw err;
        //console.log('Connection as ID '+connection.threadId)

        //query
        connection.query('SELECT * FROM users WHERE username = ?',[username], (err, rows) => { 
            if(!err){
                if(rows.length != 0){
                    var pass = rows[0].password

                    var doMatch = bcrypt.compareSync(cpassword, pass)

                        if(doMatch){
                            bcrypt.hash(npassword, 10, function(err, hash) {

                            connection.query("UPDATE users SET password = ? WHERE username = ?",[hash, username],(err,rows)=>{
                                if(!err){
                                    return res.json({status: 'good', msg: "Password Changed Successfully" });
                                }else{
                                    return res.json({status: 'good', msg: "Database or Server Error" });
                                }
                            }) 

                            })   
                                
                        }else{
                            return res.json({status: 'good', msg: "Current Password Doesn't Match" });
                        }
                }else{
                    return res.json({status: 'good', msg: "No user found" });
                }
            }else{
                console.log(err)
                return res.send('fail_db')
            }
        }) 
    })


}
  


