const pool = require('../config/dbconfig')
var data = require('../data')

const axios = require('axios')

var userInfo = data.userInfo
//home page
exports.notification = (req, res) => {

    if (req.session.user) {
        userInfo.isLoged = req.session.user.isLoged
        userInfo.user = req.session.user.user
    }
    var seo_data = {
        title: "Notification",
        description: "notification"
    }

    res.render('notification', { userInfo: userInfo, seo_data });

}

exports.profile = (req, res) => {

    if (req.session.user) {
        userInfo.isLoged = req.session.user.isLoged
        userInfo.user = req.session.user.user
    }
    var seo_data = {
        title: "User Profile",
        description: "landing page of this simple payment apprication"
    }

    res.render('profile', { userInfo: userInfo, seo_data });

}

exports.receipt = (req, res) => {

    if (req.session.user) {
        userInfo.isLoged = req.session.user.isLoged
        userInfo.user = req.session.user.user
    }
    var seo_data = {
        title: "receipt",
        description: "landing page of this simple payment apprication"
    }

    res.render('receipt', { layout:'receipt',userInfo: userInfo, seo_data });

}

exports.adminPage = (req, res) => {

    if (req.session.user) {
        userInfo.isLoged = req.session.user.isLoged
        userInfo.user = req.session.user.user
    }
    var seo_data = {
        title: "Dashbord",
        description: "mawobuy payment application"
    }

    var branch_id = req.session.user.user.bid
    var role = req.session.user.user.role

    //console.log(branch_id)
    var today = new Date();
    var yy = today.getFullYear()
    var dd = today.getDate()
    var mm = today.getMonth() + 1

    if (mm < 10) {
        mm = '0' + mm
    }

    if (dd < 10) {
        dd = '0' + dd
    }

    var date_start = yy + '-' + mm + '-' + dd + ' 00:00:00'
    var date_end = yy + '-' + mm + '-' + dd + ' 23:59:59'

    /////////////////7day////////////////////////////////////

    var last_7 = new Date();
    last_7.setDate(last_7.getDate() - 7);

    var yy7 = last_7.getFullYear()
    var dd7 = last_7.getDate()
    var mm7 = last_7.getMonth() + 1

    if (mm7 < 10) {
        mm7 = '0' + mm7
    }

    if (dd7 < 10) {
        dd7 = '0' + dd7
    }

    var date_start7 = yy7 + '-' + mm7 + '-' + dd7 + ' 00:00:00'

    /////////////////end-today/////////////////////////////// 

    var last_30 = new Date();
    last_30.setDate(last_30.getDate() - 30);

    var yy30 = last_30.getFullYear()
    var dd30 = last_30.getDate()
    var mm30 = last_30.getMonth() + 1

    if (mm30 < 10) {
        mm30 = '0' + mm30
    }

    if (dd30 < 10) {
        dd30 = '0' + dd30
    }

    var date_start30 = yy30 + '-' + mm30 + '-' + dd30 + ' 00:00:00'


    /////////////////////end 30day/////////////////////////

    //console.log(date_start+", "+date_end)
    //console.log(date_start7+", "+date_end)
    //console.log(date_start30+", "+date_end)

    if (role == 3) {
       
        var queries = "SELECT COUNT(*) AS incoming FROM packages WHERE status = ? AND branch_to = ?;"
        queries += "SELECT COUNT(*) AS outgoing FROM packages WHERE status = ? AND branch_from = ?;"
        queries += "SELECT COUNT(*) AS received FROM packages WHERE status = ? AND branch_to = ? AND created_at >= ? AND created_at <= ?;"
        queries += "SELECT COUNT(*) AS sent FROM packages WHERE status = ? AND branch_from = ? AND created_at >= ? AND created_at <= ?;"
        queries += "SELECT COUNT(*) AS transit FROM packages WHERE status = "+1+";"
        queries += "SELECT SUM(price) AS revDay FROM packages WHERE status <= "+2+" AND created_at >= '"+date_start+"' AND created_at <= '"+date_end+"';"
        queries += "SELECT SUM(price) AS rev7 FROM packages WHERE status <= "+2+" AND created_at >= '"+date_start7+"' AND created_at <= '"+date_end+"';"
        queries += "SELECT SUM(price) AS rev30 FROM packages WHERE status <= "+2+" AND created_at >= '"+date_start30+"' AND created_at <= '"+date_end+"';"

    } else {

        var queries = "SELECT COUNT(*) AS incoming FROM packages WHERE status = ? AND branch_to = ?;"
        queries += "SELECT COUNT(*) AS outgoing FROM packages WHERE status = ? AND branch_from = ?;"
        queries += "SELECT COUNT(*) AS received FROM packages WHERE status = ? AND branch_to = ? AND created_at >= ? AND created_at <= ?;"
        queries += "SELECT COUNT(*) AS sent FROM packages WHERE status = ? AND branch_from = ? AND created_at >= ? AND created_at <= ?;"
        queries += "SELECT COUNT(*) AS transit FROM packages WHERE branch_from = "+branch_id+" OR branch_to = "+branch_id+" AND status = "+1+";"
        queries += "SELECT SUM(price) AS revDay FROM packages WHERE branch_from = "+branch_id+" AND status <= "+2+" AND created_at >= '"+date_start+"' AND created_at <= '"+date_end+"';"
        queries += "SELECT SUM(price) AS rev7 FROM packages WHERE branch_from = "+branch_id+" AND status <= "+2+" AND created_at >= '"+date_start7+"' AND created_at <= '"+date_end+"';"
        queries += "SELECT SUM(price) AS rev30 FROM packages WHERE branch_from = "+branch_id+" AND status <= "+2+" AND created_at >= '"+date_start30+"' AND created_at <= '"+date_end+"';"


    }



    pool.getConnection((err, connection) => {
        if (err) throw err; // not connected 0,date_start30,date_end

        connection.query(queries, [1, branch_id, 1, branch_id, 2, branch_id, date_start30, date_end, 2, branch_id, date_start30, date_end], (err, reults) => {
            if (!err) {

               

                var incoming = reults[0][0].incoming || 0
                var outgoing = reults[1][0].outgoing || 0
                var received = reults[2][0].received || 0
                var sent = reults[3][0].sent || 0
                var transit = reults[4][0].transit || 0
                var revDay = reults[5][0]['revDay'] || 0
                var rev7 = reults[6][0]['rev7'] || 0
                var rev30 = reults[7][0]['rev30'] || 0


                res.render('dashbord', { userInfo: userInfo, seo_data, message: "", incoming, outgoing, received, sent, transit, revDay, rev7,rev30 });
            } else {
                console.log(err);
                res.render('dashbord', { userInfo: userInfo, seo_data, message: "Server Error on fetching Data", incoming: '##', outgoing: '##', received: '###', sent: '###' });
            }
        });
    });

}

exports.completedOrder = (req, res) => {

    if (req.session.user) {
        userInfo.isLoged = req.session.user.isLoged
        userInfo.user = req.session.user.user
    }
    var seo_data = {
        title: "Completed Orders",
        description: "landing page of this simple payment apprication"
    }

    var today = new Date();
    var yy = today.getFullYear()
    var dd = today.getDate()
    var mm = today.getMonth() + 1

    if (mm < 10) {
        mm = '0' + mm
    }

    if (dd < 10) {
        dd = '0' + dd
    }

    var date_start = yy + '-' + mm + '-' + dd + ' 00:00:00'
    var date_end = yy + '-' + mm + '-' + dd + ' 23:59:59'

    pool.getConnection((err, connection) => {
        if (err) throw err; // not connected

        connection.query('SELECT * FROM payments WHERE status = ? AND created_at >= ? AND created_at <= ?', [1, date_start, date_end], (err, orders) => {
            if (!err) {
                //console.log(orders)
                res.render('complete', { userInfo: userInfo, orders, seo_data, message: "" });
            } else {
                console.log(err);
                res.render('complete', { userInfo: userInfo, orders: [], seo_data, message: "Server Error" });
            }
        });
    });


}

exports.pendingOrder = (req, res) => {

    if (req.session.user) {
        userInfo.isLoged = req.session.user.isLoged
        userInfo.user = req.session.user.user
    }
    var seo_data = {
        title: "Pending Orders",
        description: "landing page of this simple payment apprication"
    }

    var today = new Date();
    var yy = today.getFullYear()
    var dd = today.getDate()
    var mm = today.getMonth() + 1

    if (mm < 10) {
        mm = '0' + mm
    }

    if (dd < 10) {
        dd = '0' + dd
    }

    var date_start = yy + '-' + mm + '-' + dd + ' 00:00:00'
    var date_end = yy + '-' + mm + '-' + dd + ' 23:59:59'

    pool.getConnection((err, connection) => {
        if (err) throw err; // not connected

        connection.query('SELECT * FROM payments WHERE status = ? AND created_at >= ? AND created_at <= ?', [0, date_start, date_end], (err, orders) => {
            if (!err) {
                //console.log(orders)
                res.render('pending', { userInfo: userInfo, orders, seo_data, message: "" });
            } else {
                console.log(err);
                res.render('pending', { userInfo: userInfo, orders: [], seo_data, message: "Server Error" });
            }
        });
    });



}





