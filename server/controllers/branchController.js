const pool = require('../config/dbconfig')
var data = require('../data')
const fs = require('fs');

const axios = require('axios');
const { query } = require('express');

var userInfo = data.userInfo

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min);
}

exports.deportBranches = (req, res) => {

  if (req.session.user) {
    userInfo.isLoged = req.session.user.isLoged
    userInfo.user = req.session.user.user
  }
  var seo_data = {
    title: "deport Branches",
    description: "landing page of this simple payment apprication"
  }

  pool.getConnection((err, connection) => {
    if (err) throw err;

    //query
    connection.query("SELECT * FROM branches ORDER BY id DESC;", (err, branches) => {

      if (!err) {
        res.render('branches', { userInfo: userInfo, seo_data, branches});
      } else {
        console.log(err);
      }

      //console.log('the data: \n',rows);
    })
  })

}

exports.getEditBranch = (req, res)=>{

  if (req.session.user) {
    userInfo.isLoged = req.session.user.isLoged
    userInfo.user = req.session.user.user
  }

  var user_id = req.session.user.user.id;
  var role = req.session.user.user.role;
  var bname = req.session.user.user.bname;
  var bid = req.session.user.user.bid;

  var branch_id = req.body.branch_id

  if(role == 3 || (role == 2 && bid == branch_id)){

  pool.getConnection((err, connection) => {
      if (err) throw err; // not connected
      console.log('Connected!');

      connection.query('SELECT * FROM branches WHERE id = '+branch_id, (err, rows) => {
        //connection.release();
        if (!err) {
          console.log(rows[0])
          return res.json({data:rows[0],status:'good'});
          
        } else { 
          console.log(err);
          return res.json({data:{},status:'bad',msg:"Database or server error"});
        }

      });
    });
  }else{
    return res.json({data:{},status:'bad',msg:"You don't have permission"});
  }
  
}

exports.getViewBranch = (req, res)=>{

  if (req.session.user) {
    userInfo.isLoged = req.session.user.isLoged
    userInfo.user = req.session.user.user
  }

  var user_id = req.session.user.user.id;
  var role = req.session.user.user.role;
  var bname = req.session.user.user.bname;
  var bid = req.session.user.user.bid;

  var branch_id = req.body.branch_id

  if(role == 3){

  var query = 'SELECT * FROM branches WHERE id = '+branch_id+';'
      query += 'SELECT fulname, phone1, id, username, status, role FROM users WHERE branch_id = '+branch_id+';'
      query += "SELECT COUNT(*) AS received FROM packages WHERE branch_to = "+branch_id+' AND status = '+2+';'
      query += "SELECT COUNT(*) AS sent FROM packages WHERE branch_from = "+branch_id+' AND status = '+2+';'
      query += "SELECT COUNT(*) AS trashed FROM packages WHERE branch_from = "+branch_id+' AND status = '+3+';'
      query += "SELECT SUM(price) AS revenue FROM packages WHERE branch_from = "+branch_id+' AND status <= '+2+';'
      //queries += "SELECT SUM(price) AS revDay FROM packages WHERE status <= "+2+" AND created_at >= '"+date_start+"' AND created_at <= '"+date_end+"';"
        //queries += "SELECT SUM(price) AS rev7 FROM packages WHERE status <= "+2+" AND created_at >= '"+date_start7+"' AND created_at <= '"+date_end+"';"

  pool.getConnection((err, connection) => {
      if (err) throw err; // not connected
      console.log('Connected!');

      connection.query(query, (err, rows) => {
        //connection.release();
        if (!err) {
          console.log(rows)
          var data = rows[0][0]
          var staffs = rows[1]
          var received = rows[2][0]['received'] || 0
          var sent = rows[3][0]['sent'] || 0
          var revenue = rows[5][0]['revenue'] || 0
          var trashed = rows[4][0]['trashed'] || 0

          return res.render('partials/branch-content',{layout:false,data,staffs,received,sent,revenue,trashed,userInfo})
          //return res.json({data,staffs,received,sent,revenue,trashed,status:'good'});
          
        } else { 
          console.log(err);
            return res.render('partials/danger_message',{layout:false,message:'Database or server error'})
        }

      });
    });
  }else{
    return res.json({data:{},status:'bad',msg:"You don't have permission"});
  }
  
}

exports.updateBranch = (req, res) => {

  if (req.session.user) {
    userInfo.isLoged = req.session.user.isLoged
    userInfo.user = req.session.user.user
  }

  var { name,status,branch_id,og_filename, region, district, location, description } = req.body;

  console.log(req.body)
  var body = description || "New branch at " + location + " in " + region
  var user_id = req.session.user.user.id;

  pool.getConnection((err, connection) => {
    if (err) throw err; // not connected
    //console.log('Connected!');
    if (req.file) {

      console.log(req.file)
      var filename = req.file.filename

      connection.query('UPDATE branches SET name = ?, region = ?,district = ?,location = ? , description = ?, thumbnail = ?, id = ?, updated_by = ?,status = ? WHERE id = ?', [name, region, district, location, body, filename, branch_id, user_id, status,branch_id], (err, rows) => {

        if (!err) {
           
          if(og_filename != 'branch.jpg'){
          fs.unlink('./public/images/' + og_filename, function (err) {
            if (err && err.code == 'ENOENT') {
              // file doens't exist
              //console.info("File doesn't exist, won't remove it.");
              res.redirect('/deport-branches');
            } else if (err) {
              // other errors, e.g. maybe we don't have enough permission
              //console.error("Error occurred while trying to remove file");
              res.redirect('/deport-branches');
            } else {
              //console.info(`removed`);
              res.redirect('/deport-branches');
            }
          })
        }else{
          res.redirect('/deport-branches');
        }
         
        } else {

          console.log(err);
        }

      });

    } else {
      connection.query('UPDATE branches SET name = ?, region = ?,district = ?,location = ? , description = ?, id = ?,  updated_by = ?,status = ? WHERE id = ?', [name, region, district, location, body, branch_id, user_id, status,branch_id], (err, rows) => {
        // Once done, release connection
        //connection.release();

        if (!err) {
          res.redirect('/deport-branches');
        } else {
          console.log(err);
        }

      });

    }


  });

}

exports.createBranch = (req, res) => {

  if (req.session.user) {
    userInfo.isLoged = req.session.user.isLoged
    userInfo.user = req.session.user.user
  }

  var { name, region, district, location, description } = req.body;

  var body = description || "New branch at " + location + " in " + region
  var branch_id = getRandomInt(1000, 10000);
  var user_id = req.session.user.user.id;

  pool.getConnection((err, connection) => {
    if (err) throw err; // not connected
    //console.log('Connected!');
    if (req.file) {

      console.log(req.file)
      var filename = req.file.filename

      connection.query('INSERT INTO branches SET name = ?, region = ?,district = ?,location = ? , description = ?, thumbnail = ?, id = ?, created_by = ?', [name, region, district, location, body, filename, branch_id, user_id], (err, rows) => {
        // Once done, release connection
        //connection.release();

        if (!err) {
          res.redirect('/deport-branches');
        } else {

          console.log(err);
        }

      });

    } else {
      connection.query('INSERT INTO branches SET name = ?, region = ?,district = ?,location = ? , description = ?, id = ?, created_by = ?', [name, region, district, location, body, branch_id, user_id], (err, rows) => {
        // Once done, release connection
        //connection.release();

        if (!err) {
          res.redirect('/deport-branches');
        } else {
          console.log(err);
        }

      });

    }


  });

}

exports.deleteBranch = (req, res) =>{
  
  if (req.session.user) {
    userInfo.isLoged = req.session.user.isLoged
    userInfo.user = req.session.user.user
  }

  var user_id = req.session.user.user.id;
  var role = req.session.user.user.role;
 

  var branch_id = req.body.branch_id
  var branch_image = req.body.branch_image

  var query = "SELECT * FROM users WHERE branch_id = ?;"
      query += "SELECT * FROM packages WHERE branch_from = ? OR branch_to = ?;"

  if(role == 3){

  pool.getConnection((err, connection) => {
      if (err) throw err; // not connected
     
      connection.query(query,[branch_id, branch_id,branch_id], (err, rows) => {
        //connection.release();
        if (!err) {
          var users = rows[0];
          var packages = rows[1];
          if(users.length != 0 || packages.length != 0){
            return res.json({data:{},status:'bad',msg:"Can't delete branch which holds staffs or packages. you may set branch to inactive"});
          }else{

            connection.query('DELETE FROM branches WHERE id = '+branch_id, (err, rows) => {
              //connection.release();
              if (!err) {

                if(branch_image != 'branch.jpg'){
                  fs.unlink('./public/images/' + branch_image, function (err) {
                    if (err && err.code == 'ENOENT') {
                      // file doens't exist
                      //console.info("File doesn't exist, won't remove it.");
                      return res.json({data:[],status:'good',msg:"Brach deleted successful"});
                    } else if (err) {
                      // other errors, e.g. maybe we don't have enough permission
                      //console.error("Error occurred while trying to remove file");
                      return res.json({data:[],status:'good',msg:"Brach deleted successful"});
                    } else {
                      //console.info(`removed`);
                      return res.json({data:[],status:'good',msg:"Brach deleted successful"});
                    }
                  })

                }else{
                  return res.json({data:[],status:'good',msg:"Brach deleted successful"});
                }
                
              } else { 
                console.log(err);
                return res.json({data:{},status:'bad',msg:"Database or server error"});
              }
  
            });
          }

        } else { 
          console.log(err);
          return res.json({data:{},status:'bad',msg:"Database or server error"});
        }

      });    
    });
  }else{
    return res.json({data:{},status:'bad',msg:"You don't have permission"});
  }

}

