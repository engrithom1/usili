const pool = require('../config/dbconfig')
var data = require('../data')
var richFunctions = require('../richardFunctions')
const bcrypt = require('bcrypt');

var userInfo = data.userInfo
///user pages functions

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min);
}


exports.staffMembers = (req, res) => {


  if (req.session.user) {
    userInfo.isLoged = req.session.user.isLoged
    userInfo.user = req.session.user.user
  }
  var seo_data = {
    title: "staff members",
    description: "staf page"
  }

  var branch_id = req.session.user.user.bid

  var query = "SELECT br.name AS bname, br.thumbnail AS bthumbnail, br.region AS bregion, us.fulname, us.username,us.id, us.role, us.branch_id, us.avator, us.status, us.phone1, us.phone2, us.bio FROM users AS us INNER JOIN branches AS br ON us.branch_id = br.id WHERE us.branch_id = ?;"
      query += "SELECT id, name FROM branches WHERE id != ?;"

  pool.getConnection((err, connection) => {
    if (err) throw err; // not connected

    connection.query(query, [branch_id, branch_id], (err, rows) => {
      connection.release();
      if (!err) {
          console.log(rows)
          var staffs = rows[0]
          var branches = rows[1]

          res.render('staff_members', { userInfo: userInfo, seo_data, staffs, branches });

      } else {
        console.log(err);
        //return res.json({ data: {}, status: 'bad', msg: "Database or server error" });
      }

    });
  });

}

exports.createStaffMember = (req, res)=>{
  if (req.session.user) {
    userInfo.isLoged = req.session.user.isLoged
    userInfo.user = req.session.user.user
  }

  var { username, fulname, phone1, phone2, role, branch_id } = req.body;

  var phone_2 = phone2 || '0xxxxxxxxx'
  var id = getRandomInt(1000, 10000);
  var user_id = req.session.user.user.id;
  var role_id = req.session.user.user.role;
  var bid = req.session.user.user.bid;
  var bname = req.session.user.user.bname;

  var password = phone1

  if(role_id > 1){

    if((role_id == 2 && bid == branch_id) || role_id == 3){
    pool.getConnection((err, connection) => {
      if (err) throw err; // not connected
      //console.log('Connected!');

      connection.query('SELECT * FROM users WHERE username = ? OR phone1 = ?;', [username,phone1], (err, rows) => {

        if (!err) {
          if (rows.length == 0) {
            bcrypt.hash(password, 10, function (err, hash) {
              connection.query('INSERT INTO users SET id = ?, fulname = ?, username = ?, password = ?, phone1 = ? ,phone2 = ?, status = ?, role = ?, created_by = ?, branch_id = ?, bio = ?;', [id, fulname, username, hash, phone1, phone_2, 1, role, user_id, branch_id,'am staff in usiri strans'], (err, rows) => {
                // Once done, release connection
                connection.release();

                if (!err) {
                  return res.json({status:'good',msg:"Staff created successful"});
                } else {
                  console.log(err);
                  return res.json({status:'bad',msg:"Server or Database error"});
                }

              });
            });
          } else {
            return res.json({status:'bad',msg:"Phone number or Username aleady exist"});
          }

        } else {
          console.log(err);
          return res.json({status:'bad',msg:"Server or Database error"});
        }
      })
    });

  }else{
    return res.json({status:'bad',msg:"You can only add staff in your branch ("+bname+")"});
  }

  }else{
    return res.json({status:'bad',msg:"You don't have permission"});
  }

}

exports.filterStaffMembers = (req, res) => {

  if (req.session.user) {
    userInfo.isLoged = req.session.user.isLoged
    userInfo.user = req.session.user.user
  }
  var branch_id = req.body.branch_id
  var query = ""
  if(branch_id == 0){
     query = "SELECT br.name AS bname, br.thumbnail AS bthumbnail, br.region AS bregion, us.fulname, us.username,us.id, us.role, us.branch_id, us.avator, us.status, us.phone1, us.phone2, us.bio FROM users AS us INNER JOIN branches AS br ON us.branch_id = br.id;"
  }else{
     query = "SELECT br.name AS bname, br.thumbnail AS bthumbnail, br.region AS bregion, us.fulname, us.username, us.role, us.branch_id, us.avator, us.status, us.phone1, us.phone2, us.bio FROM users AS us INNER JOIN branches AS br ON us.branch_id = br.id WHERE us.branch_id = "+branch_id+";"
  }

  pool.getConnection((err, connection) => {
    if (err) throw err; // not connected

    connection.query(query, (err, staffs) => {
      if (!err) {
        if(staffs.length > 0){
            return res.render('partials/staff_list',{layout:false,staffs,userInfo})
        }else{
            return res.render('partials/info_message',{layout:false,message:'No staff found'})
        }
      }else{
          console.log(err);
          return res.render('partials/danger_message',{layout:false,message:'Database or server error'})
      }  
    });
  });


}  

exports.getUserEdit = (req, res) => {
  var id = req.body.id

  pool.getConnection((err, connection) => {
    if (err) throw err; // not connected
    console.log('Connected!');

    connection.query('SELECT * FROM users WHERE id = ' + id, (err, rows) => {
      // Once done, release connection
      connection.release();
      if (!err) {
        return res.json(rows);
      } else {
        console.log("get feed errors---------------------------------------");
        console.log(err);
      }

    });
  });

}


exports.updateUser = (req, res) => {
  var { fulname, position, status, company, role, contacts, user } = req.body;

  console.log(req.body)
  var user_id = req.session.user.user.id;
  //never change the slug
  ///var slug = richFunctions.getSlug(title,feed_id,60)

  pool.getConnection((err, connection) => {
    if (err) throw err; // not connected
    //console.log('Connected!');

    connection.query('UPDATE users SET fulname = ?, status = ?, company = ?, position = ?, role = ?, created_by = ?, contacts = ? WHERE id = ?;', [fulname, status, company, position, role, user_id, contacts, user], (err, rows) => {

      if (!err) {

        res.redirect('/account/user');
      } else {
        console.log("errors---------------------------------------");
        console.log(err);
      }

    });
  })

}

exports.deleteStaff = (req, res) => {

  var user = req.body.user;
  var user_role = req.body.user_role;
  var user_branch = req.body.user_branch;
  var user_image = req.body.user_image;

  var user_id = req.session.user.user.id;
  var role = req.session.user.user.role;
  var bid = req.session.user.user.bid;
  var bname = req.session.user.user.bname;

  if((role == 2 && bid == user_branch) || (role == 3)){
  if (user != user_id) {
    var query = "SELECT * FROM barcodes  WHERE created_by = ?;"
    query += "SELECT * FROM branches  WHERE created_by = ? OR updated_by = ?;"
    query += "SELECT * FROM customers  WHERE created_by = ?;"
    query += "SELECT * FROM packages  WHERE created_by = ?;"
    query += "SELECT * FROM users  WHERE created_by = ?;"


    pool.getConnection((err, connection) => {
      if (err) throw err; // not connected
      //console.log('Connected!');

      connection.query(query, [user, user, user, user, user, user], (err, rows) => {

        if (!err) {
          console.log(rows)
          ///check contribution
          if (rows[0].length == 0 && rows[1].length == 0 && rows[2].length == 0 && rows[3].length == 0 && rows[4].length == 0) {

            connection.query('DELETE FROM users  WHERE id = ?;', [user], (err, rows) => {
              if (!err) {
                return res.json({ status:"good", msg: 'Deleted Successfully' });
              } else {
                return res.json({ status: "bad", msg: 'Fail to delete', error: err });
              }

            });

          } else {
            return res.json({ status: "bad", msg: "Can't delete the Contributor user", error: "" });
          }

        } else {
          //console.log(err);
          return res.json({ status: "bad", msg: 'Fail to delete', error: err });
        }

      });
    });

  } else {
    return res.json({ status: "bad", msg: "Can't delete yourself"});
  }
}else{
  return res.json({status:'bad',msg:"Don't have permission to delete this user, either is not in your branch or same-upper role"});
}
  //return res.status(400).send('No files were uploaded.');
}

exports.updateStaffMember = (req, res)=>{
  if (req.session.user) {
    userInfo.isLoged = req.session.user.isLoged
    userInfo.user = req.session.user.user
  }

  var { branch_id,role,phone1,phone2,fulname,status,staff_id,ogrole,ogbranch_id } = req.body;

  console.log(req.body)
  var phone_2 = phone2 || '0xxxxxxxxx'
  
  var user_id = req.session.user.user.id;
  var brole = req.session.user.user.role;
  var bid = req.session.user.user.bid;
  var bname = req.session.user.user.bname;


  if(brole > 1){

    if(staff_id != user_id){

    if((brole == 2 && bid == branch_id) || brole == 3){
    pool.getConnection((err, connection) => {
      if (err) throw err; // not connected
      //console.log('Connected!');

      connection.query('UPDATE users SET fulname = ?, phone1 = ? ,phone2 = ?, status = ?, role = ?, updated_by = ?, branch_id = ? WHERE id = ?;', [fulname, phone1, phone_2, status, role, user_id, branch_id,staff_id], (err, rows) => {
                // Once done, release connection
                connection.release();

                if (!err) {
                  return res.json({status:'good',msg:"Staff updated successful"});
                } else {
                  console.log(err);
                  return res.json({status:'bad',msg:"Server or Database error"});
                }

              });
            });
        
  }else{
    return res.json({status:'bad',msg:"You can only add staff in your branch"});
  }

  }else{
    return res.json({status:'bad',msg:"Edit in your profile not here"});
  }
}else{
  return res.json({status:'bad',msg:"You don't have permission"});
}

}

///////////////////customers////////////////////////////////

exports.customers = (req, res) => {

  var branch_id = req.session.user.user.bid
  var seo_data = {
      title:"unique customers",
      description:"usiri trans"
  } 
 
  var query = "SELECT cu.id, cu.fulname, cu.phone_no, cu.invorved, us.username FROM customers AS cu INNER JOIN users AS us ON cu.created_by = us.id ORDER BY cu.invorved DESC;"
  
  pool.getConnection((err, connection) => {
    if (err) throw err; // not connected
 
    connection.query(query, (err, customers) => {
      connection.release();
      if (!err) {
        //console.log(customers)
        res.render('customers',{userInfo:userInfo,seo_data,customers});
      }else{
        console.log(err)
        res.render('customers',{userInfo:userInfo,seo_data,customers:[]});
      }
    })
  })    
 

}

exports.customerEvents = (req, res) => {

  var phone = req.params.phone
  var seo_data = {
      title:"unique customers events",
      description:"usiri trans"
  } 
 
   query = "SELECT us.fulname, pc.status, us.phone1, pc.sender_name, pc.sender_phone, pc.transporter_name, pc.transporter_phone, pc.receiver_name, pc.receiver_phone, pc.created_at,pc.price, pc.id, pc.thumbnail, bf.id AS bfid,  bt.id AS btid, pc.name, bf.name AS bfname, bt.name AS btname  FROM packages AS pc INNER JOIN branches AS bf ON pc.branch_from = bf.id INNER JOIN branches AS bt ON pc.branch_to = bt.id INNER JOIN users AS us ON pc.created_by = us.id  WHERE pc.sender_phone = "+phone+" OR pc.receiver_phone = '"+phone+"' ORDER BY pc.created_at DESC;"
  
  pool.getConnection((err, connection) => {
    if (err) throw err; // not connected
 
    connection.query(query, (err, events) => {
      connection.release();
      if (!err) {
        console.log(events)
        if(events.length > 0){

          var header = "This are Events which Customer "+phone+" Envorved"
          res.render('customer_events',{userInfo:userInfo,seo_data,events,message:header});
        }else{

          var header = "No Events found for a Customer "+phone
          res.render('customer_events',{userInfo:userInfo,seo_data,events,message:header});
        }
      }else{
        console.log(err)
        res.render('customer_events',{userInfo:userInfo,seo_data,customers:[],message:"Server or Database Error"});
      }
    })
  })    
 

}