// middleware function to check for logged-in users
const pool = require('../config/dbconfig')
//var data = require('../data')
var richFunctions = require('../richardFunctions')


var audioPayed = (req, res, next) => {

    //console.log("from audio payed ")
    //console.log(req.session.user)
    
    console.log(req.path)
    var slug = req.params.slug
    var post_id = richFunctions.getIdFromSlug(slug)
    var post_type = 'audio'
    var user_id = req.session.user.user.id;
    var user_role = req.session.user.user.role;
    
    if(user_role == 0 || user_role == 2){
        var query = "SELECT * FROM payed WHERE user_id = ? AND post_id = ? AND post_type = ? ORDER BY id DESC;"
        query += "SELECT * FROM audio_courses WHERE id = ?;"
    //connect to DB
    pool.getConnection((err, connection) => {
    if (err) throw err;

    connection.query(query,[user_id,post_id,post_type,post_id],(err, rows) =>{
        if(!err){
            
            if(rows[0].length == 0){

                connection.query("INSERT INTO course_impressions SET user_id = ?, post_id = ?, post_type = ?",[user_id,post_id,post_type],(err, rows) =>{
                    if(!err){}
                })    

                console.log(rows[1])
                var row = rows[1][0]
                var price = row.price
                var title = row.title
                var slug = row.slug
                var description = row.description
                var thumbnail = '/images/'+row.thumbnail

                req.session.dataz = {user_id,post_id,post_type,price,title,slug,thumbnail,description}

                res.redirect('/payment');
            }else{

                var time_sec = rows[0][0].time_sec
                var time = new Date()
                var now_sec = Math.round(time.getTime() / 1000)

                if(time_sec > now_sec){
                    next();
                }else{

                    connection.query("INSERT INTO course_impressions SET user_id = ?, post_id = ?, post_type = ?",[user_id,post_id,post_type],(err, rows) =>{
                        if(!err){}
                    })
                    //console.log(rows[1])
                    var row = rows[1][0]
                    var price = row.price
                    var title = row.title
                    var slug = row.slug
                    var thumbnail = '/images/'+row.thumbnail
                    var description = row.description

                    req.session.dataz = {user_id,post_id,post_type,price,title,slug,thumbnail,description}

                    res.redirect('/payment');
                }
                
            }
        }else{
            console.log(err)
        }
    })   
    })
    }else{
        next()
    }
    
   
};

var bookPayed = (req, res, next) => {

    //console.log("from audio payed ")
    //console.log(req.session.user)
    
    console.log(req.path)
    var slug = req.params.slug
    var post_id = richFunctions.getIdFromSlug(slug)
    var post_type = 'book'
    var user_id = req.session.user.user.id;
    var user_role = req.session.user.user.role;
    
    if(user_role == 0 || user_role == 2){
        var query = "SELECT * FROM payed WHERE user_id = ? AND post_id = ? AND post_type = ? ORDER BY id DESC;"
        query += "SELECT * FROM books WHERE id = ?;"
    //connect to DB
    pool.getConnection((err, connection) => {
    if (err) throw err;

    connection.query(query,[user_id,post_id,post_type,post_id],(err, rows) =>{
        if(!err){
            
            if(rows[0].length == 0){

                connection.query("INSERT INTO course_impressions SET user_id = ?, post_id = ?, post_type = ?",[user_id,post_id,post_type],(err, rows) =>{
                    if(!err){}
                })

                console.log(rows[1])
                var row = rows[1][0]
                var price = row.price
                var title = row.title
                var slug = row.slug
                var description = row.description
                var thumbnail = '/books/'+row.thumbnail

                req.session.dataz = {user_id,post_id,post_type,price,title,slug,thumbnail,description}

                res.redirect('/payment');
            }else{

                var time_sec = rows[0][0].time_sec
                var time = new Date()
                var now_sec = Math.round(time.getTime() / 1000)

                if(time_sec > now_sec){
                    next();
                }else{
                    //console.log(rows[1])
                    connection.query("INSERT INTO course_impressions SET user_id = ?, post_id = ?, post_type = ?",[user_id,post_id,post_type],(err, rows) =>{
                        if(!err){}
                    })

                    var row = rows[1][0]
                    var price = row.price
                    var title = row.title
                    var slug = row.slug
                    var description = row.description
                    var thumbnail = '/books/'+row.thumbnail

                    req.session.dataz = {user_id,post_id,post_type,price,title,slug,thumbnail,description}

                    res.redirect('/payment');
                }
                
            }
        }else{
            console.log(err)
        }
    })   
    })
    }else{
        next()
    }
    
};

var videoPayed = (req, res, next) => {

    //console.log("from audio payed ")
    //console.log(req.session.user)
    
    console.log(req.path)
    var slug = req.params.slug
    var post_id = richFunctions.getIdFromSlug(slug)
    var post_type = 'video'
    var user_id = req.session.user.user.id;
    var user_role = req.session.user.user.role;
    
    if(user_role == 0 || user_role == 2){

        var query = "SELECT * FROM payed WHERE user_id = ? AND post_id = ? AND post_type = ? ORDER BY id DESC;"
        query += "SELECT * FROM video_courses WHERE id = ?;"
    //connect to DB
    pool.getConnection((err, connection) => {
    if (err) throw err;

    connection.query(query,[user_id,post_id,post_type,post_id],(err, rows) =>{
        if(!err){
            
            if(rows[0].length == 0){
                connection.query("INSERT INTO course_impressions SET user_id = ?, post_id = ?, post_type = ?",[user_id,post_id,post_type],(err, rows) =>{
                    if(!err){}
                })
                //console.log(rows[1])
                var row = rows[1][0]
                var price = row.price
                var title = row.title
                var slug = row.slug
                var description = row.description
                var thumbnail = '/images/'+row.thumbnail

                req.session.dataz = {user_id,post_id,post_type,price,title,slug,thumbnail,description}

                res.redirect('/payment');
            }else{

                var time_sec = rows[0][0].time_sec
                var time = new Date()
                var now_sec = Math.round(time.getTime() / 1000)

                if(time_sec > now_sec){
                    next();
                }else{
                    connection.query("INSERT INTO course_impressions SET user_id = ?, post_id = ?, post_type = ?",[user_id,post_id,post_type],(err, rows) =>{
                        if(!err){}
                    })
                    //console.log(rows[1])
                    var row = rows[1][0]
                    var price = row.price
                    var title = row.title
                    var slug = row.slug
                    var description = row.description
                    var thumbnail = '/images/'+row.thumbnail

                    req.session.dataz = {user_id,post_id,post_type,price,title,slug,thumbnail,description}

                    res.redirect('/payment');
                }
                
            }
        }else{
            console.log(err)
        }
    })   
    })
    }else{
        next()
    }

    
};


module.exports = {audioPayed, bookPayed, videoPayed}