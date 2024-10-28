const pool = require('../config/dbconfig')
var data = require('../data')

var LocalStorage = require('node-localstorage').LocalStorage
localStorage = new LocalStorage('./scratch');

//Required package
var pdf = require("pdf-creator-node");
var fs = require("fs");

const axios = require('axios')
const { Canvas } = require('canvas')
const JsBarcode = require('jsbarcode')

var userInfo = data.userInfo

exports.genBarcode = (req, res) => {

    if (req.session.user) {
        userInfo.isLoged = req.session.user.isLoged
        userInfo.user = req.session.user.user
    }
    var seo_data = {
        title: "barcode generator",
        description: "landing page of this simple payment apprication"
    }
    res.render('generate_code', { userInfo: userInfo, seo_data });
}

exports.printBarcode = (req, res) => {

    if (req.session.user) {
        userInfo.isLoged = req.session.user.isLoged
        userInfo.user = req.session.user.user
    }
    var seo_data = {
        title: "barcodeprinting",
        description: "print empty barcodes"
    }

    var branch_id = req.session.user.user.bid

    var query = "SELECT id, code_id, code_data FROM barcodes WHERE branch_id = ? AND status = ?;"

    pool.getConnection((err, connection) => {
        if (err) throw err; // not connected
        //console.log('Connected!');

        connection.query(query, [branch_id, 1], (err, codebars) => {
            // Once done, release connection
            connection.release();
            if (!err) {
                res.render('print_code', { userInfo: userInfo, seo_data, codebars });
            } else {
                console.log(err);
            }

        });
    });

}

exports.printBarcodeDPF = (req, res) => {

    if (req.session.user) {
        userInfo.isLoged = req.session.user.isLoged
        userInfo.user = req.session.user.user
    }
    var seo_data = {
        title: "barcodeprinting",
        description: "print empty barcodes"
    }

    var branch_id = req.session.user.user.bid

    var query = "SELECT id, code_id, code_data FROM barcodes WHERE branch_id = ? AND status = ?;"

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
    var export_date = dd + '-' + mm + '-' + yy

    pool.getConnection((err, connection) => {
        if (err) throw err; // not connected
        //console.log('Connected!');

        connection.query(query, [branch_id, 1], (err, codebars) => {
            // Once done, release connection
            connection.release();

            if (!err) {
                // console.log(codebars)
                //console.log(JSON.stringify(codebars))
                if (codebars.length > 0) {
                    ///export excel
                    try {

                        var orderz = JSON.stringify(codebars)
                        var ordz = JSON.parse(orderz)
                        ////////PDF START HAREEEEEEEEEEEEEEEEE

                        ////Naminig

                        var unq = Math.random().toString(36).substring(2, 7)

                        const file_name = 'empty_barcode_' + unq + '_' + export_date + '.pdf'
                        const filePath = data.upload_path + '/outputFiles/' + file_name;
                        const html_path = data.htmls + '/template.html'


                        // Read HTML Template
                        var html = fs.readFileSync(html_path, "utf8");

                        var options = {
                            format: "A4",
                            orientation: "portrait",
                            border: "2mm",
                            header: {
                                height: "35mm",
                                contents: '<div style="text-align:center;font-size:20px;font-weight:bold">Usiri Trans Empty Barcodes</div>'
                            }
                        };

                        var document = {
                            html: html,
                            data: {
                                codebars: ordz,
                            },
                            path: filePath,
                            type: "",
                        };

                        pdf
                            .create(document, options)
                            .then((res) => {
                                //console.log(res);
                            })
                            .catch((error) => {
                                console.error(error);
                            });

                        return res.send({ status: 'good', file_url: file_name, message: "PDF file is ready to download" })

                        ////////PDF START HAREEEEEEEEEEEEEEEEE

                    } catch (error) {
                        console.log(error)
                        return res.send({ status: 'bad', message: "Fail to export PDF" })
                    }
                } else {
                    return res.send({ status: 'bad', message: "No empty barcodes found" })
                }
            } else {
                console.log(err);
                return res.send({ status: 'bad', message: "Database or server error" })
            }

        });
    });

}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function genCode(cod, formats, bool) {

    try {

        var canvas = new Canvas()

        JsBarcode(canvas, cod, {
            format: formats,
            lineColor: "#000",
            width: 2,
            height: 60,
            displayValue: bool
        });

        return canvas.toDataURL('image/png')

    } catch (error) {
        console.log(error)
    }

}

function genQuery(element) {

    query = "INSERT INTO barcodes SET code_id = " + element.id + ", branch_id = " + element.branch_id + ", code_data = '" + element.code_data + "', status = " + 1 + ", code_type = '" + element.code_type + "', batch_no = " + element.batch_no + ", created_by = " + element.created_by + ", created_at = '" + element.created_at + "';"
    return query;
}

exports.barcodeGenerator = (req, res) => {

    var { quantity, texts, formats } = req.body;

    try {

        var sbarcodes = localStorage.getItem('sbarcodes')

        //console.log(sbarcodes)
        if (sbarcodes == null) {

            //console.log(req.body);

            var codebars = []
            var batch = getRandomInt(10000, 100000);

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
            var created_at = yy + '-' + mm + '-' + dd

            if (req.session.user) {
                userInfo.isLoged = req.session.user.isLoged
                userInfo.user = req.session.user.user
            }

            var user_id = req.session.user.user.id
            var branch_id = req.session.user.user.bid

            for (let index = 0; index < quantity; index++) {

                var code = getRandomInt(10000000, 100000000);/// 6 random digits
                code = parseInt(""+branch_id+code)
                codebars.push({ 'id': code, 'code_data': '', 'batch_no': batch, 'created_by': user_id, 'branch_id': branch_id, 'code_type': formats, 'created_at': created_at, 'status': 1 })
            }

            for (let index = 0; index < codebars.length; index++) {

                var cod = codebars[index].id

                var cdata = genCode(cod, formats, texts)

                //console.log(cdata)

                codebars[index].code_data = cdata;

            }

            //console.log(codebars)
            localStorage.setItem('sbarcodes', JSON.stringify(codebars))
            return res.render('partials/codebar_list', { layout: false, codebars, message: "" })

        } else {

            var codebars = JSON.parse(sbarcodes)
            return res.render('partials/codebar_list', { layout: false, codebars, message: "Make use of this pending barcodes. save to use or remove them" })
        }

    } catch (error) {
        console.log(error)
        return res.render('partials/danger_message', { layout: false, message: 'Something goes wrong, try again' })
    }



}

exports.removeBarcode = (req, res) => {
    if (req.session.user) {
        userInfo.isLoged = req.session.user.isLoged
        userInfo.user = req.session.user.user
    }

    try {

        var sbarcodes = localStorage.getItem('sbarcodes')
        //console.log(sbarcodes)
        if (sbarcodes == null) {
            return res.json({ status: 'bad', msg: "No pending barcodes found" });
        } else {
            localStorage.removeItem('sbarcodes')
            return res.json({ status: 'good', msg: "Barcodes successfully removed" });
        }

    } catch (error) {
        return res.json({ status: 'bad', msg: "Something goes wrong" });
    }


}

exports.saveBarcode = (req, res) => {
    if (req.session.user) {
        userInfo.isLoged = req.session.user.isLoged
        userInfo.user = req.session.user.user
    }

    var branch_id = req.session.user.user.bid

    try {

        var sbarcodes = localStorage.getItem('sbarcodes')
        //console.log(sbarcodes)
        if (sbarcodes == null) {
            return res.json({ status: 'bad', msg: "No pending barcodes found" });
        } else {
            var qr = ""
            var codebars = JSON.parse(sbarcodes)
            for (let index = 0; index < codebars.length; index++) {
                const element = codebars[index];
                qr += genQuery(element)
            }

            pool.getConnection((err, connection) => {
                if (err) throw err; // not connected
                //console.log('Connected!');

                connection.query("SELECT id, code_id FROM barcodes WHERE status = ? AND branch_id = ?;",[1,branch_id],(err, bars) => {

                    if (bars.length >= 20) {
                        return res.json({ status: 'bad', msg: "Can't save this barcodes, there more than 20 unused barcodes in your Branch" });
                    } else {
                        connection.query(qr, (err, rows) => {
                            // Once done, release connection
                            connection.release();

                            if (!err) {
                                localStorage.removeItem('sbarcodes')
                                return res.json({ status: 'good', msg: "Barcode saved successfully" });

                            } else {
                                console.log(err);
                                return res.json({ status: 'bad', msg: "Server or Database error" });
                            }

                        });
                    }

                })
            });
        }

    } catch (error) {
        console.log(error)
        return res.json({ status: 'bad', msg: "Something goes wrong" });
    }
}

exports.findBarcodeValid = (req, res) => {

    var { input_code } = req.body;

    //console.log(input_code)

    var branch_id = req.session.user.user.bid

    var query = "SELECT id, code_id, code_data, branch_id, status FROM barcodes WHERE code_id = ?;"

    pool.getConnection((err, connection) => {
        if (err) throw err; // not connected
        //console.log('Connected!');

        connection.query(query, [input_code], (err, barcode) => {
            // Once done, release connection
            connection.release();
            if (!err) {

                if (barcode.length > 0) {
                    if (barcode[0].status > 1) {
                        return res.json({ status: 3 });
                    } else {

                        if (barcode[0].branch_id == branch_id) {
                            return res.json({ status: 1, code_text: barcode[0].code_id, code_data: barcode[0].code_data });

                        } else {
                            return res.json({ status: 2 });
                        }
                    }

                } else {
                    return res.json({ status: 4 });
                }

            } else {
                console.log(err);
                return res.json({ status: 4 });
                
            }

        });
    });

}

exports.findOnuseBarcodeRemove = (req, res) => {

    var { input_code,pid } = req.body;

    var branch_id = req.session.user.user.bid

    var query = "SELECT id, code_id, code_data, branch_id, status FROM barcodes WHERE code_id = ?;"
        query += "SELECT barcode_id,branch_from, status FROM packages WHERE id = ? AND status = ?;"

    pool.getConnection((err, connection) => {
        if (err) throw err; // not connected
        //console.log('Connected!');

        connection.query(query, [input_code,pid, 1], (err, barcode) => {
            // Once done, release connection
            connection.release();
            if (!err) {

               

                if (barcode[0].length > 0 && barcode[1].length > 0) {
                    if (barcode[0][0].status == 2 && barcode[1][0].barcode_id == barcode[0][0].code_id && barcode[1][0].branch_from == branch_id) {
                        return res.json({ status: 1, code_text: barcode[0][0].code_id, code_data: barcode[0][0].code_data });
                        
                    } else {
                        return res.json({ status: 2 });
                    }

                } else {
                    if (barcode[0].length > 0) {
                        //barcode is valid doent match with action
                        return res.json({ status: 3 });
                    }else{
                        return res.json({ status: 4 });
                    }
                }

            } else {

                console.log(err);
                return res.json({ status: 4 });
                
            }

        });
    });

}

exports.findOnuseBarcodeEdit = (req, res) => {

    var { input_code,pid } = req.body;

    console.log(req.body)
    var branch_id = req.session.user.user.bid

    var query = "SELECT id, code_id, code_data, branch_id, status FROM barcodes WHERE code_id = ?;"
        query += "SELECT * FROM packages WHERE id = ? AND status = ?;"

    pool.getConnection((err, connection) => {
        if (err) throw err; // not connected
        //console.log('Connected!');

        connection.query(query, [input_code,pid, 1], (err, barcode) => {
            // Once done, release connection
            connection.release();
            if (!err) {

                if (barcode[0].length > 0 && barcode[1].length > 0) {
                    if (barcode[0][0].status == 2 && barcode[1][0].barcode_id == barcode[0][0].code_id) {
                       
                        return res.json({ status: 1,data:barcode[1][0], code_text: barcode[0][0].code_id, code_data: barcode[0][0].code_data });
                        
                    } else {
                        return res.json({ status: 2 });
                    }

                } else {
                    if (barcode[0].length > 0) {
                        //barcode is valid doent match with action
                        return res.json({ status: 3 });
                    }else{
                        return res.json({ status: 4 });
                    }
                }

            } else {

                console.log(err);
                return res.json({ status: 4 });
                
            }

        });
    });

}

exports.findOnuseBarcodeReceive = (req, res) => {

    var { input_code,pid } = req.body;

    console.log(req.body)
    var branch_id = req.session.user.user.bid

    var query = "SELECT id, code_id, code_data, branch_id, status FROM barcodes WHERE code_id = ?;"
        query += "SELECT us.fulname, us.phone1,pc.branch_from,pc.barcode_id, pc.branch_to, pc.status, pc.description, pc.edit_description,pc.edit_by, pc.price, pc.created_at, pc.sender_name, pc.sender_phone, pc.receiver_name, pc.receiver_phone, pc.transporter_name, pc.transporter_phone, pc.id, pc.thumbnail,br.id AS bid, pc.name, br.name AS bname  FROM packages AS pc INNER JOIN branches AS br ON pc.branch_from = br.id INNER JOIN users AS us ON pc.created_by = us.id  WHERE pc.status = ? AND pc.id = ?;"

    pool.getConnection((err, connection) => {
        if (err) throw err; // not connected
        //console.log('Connected!');

        connection.query(query, [input_code,1,pid], (err, barcode) => {
            // Once done, release connection
            connection.release();
            if (!err) {

                //console.log(barcode)

                if (barcode[0].length > 0 && barcode[1].length > 0) {
                    if (barcode[0][0].status == 2 && barcode[1][0].barcode_id == barcode[0][0].code_id && branch_id == barcode[1][0].branch_to) {
                       
                        return res.json({ status: 1,data:barcode[1][0], code_text: barcode[0][0].code_id, code_data: barcode[0][0].code_data });
                        
                    } else {
                        return res.json({ status: 2 });
                    }

                } else {
                    if (barcode[0].length > 0) {
                        //barcode is valid doent match with action
                        return res.json({ status: 3 });
                    }else{
                        return res.json({ status: 4 });
                    }
                }

            } else {

                console.log(err);
                return res.json({ status: 4 });
                
            }

        });
    });

}

exports.findOnuseBarcodeHanging = (req, res) => {

    var { input_code } = req.body;

    console.log(req.body)
    var branch_id = req.session.user.user.bid

    var query = "SELECT id, code_id, code_data, branch_id, status FROM barcodes WHERE code_id = ?;"
        query += "SELECT us.fulname, us.phone1, pc.status,pc.barcode_id, pc.description, pc.edit_description,pc.edit_by, pc.price, pc.created_at, pc.sender_name, pc.sender_phone, pc.receiver_name, pc.receiver_phone, pc.transporter_name, pc.branch_from, pc.branch_to, pc.transporter_phone, pc.id, pc.thumbnail,br.id AS bid, pc.name, br.name AS bname  FROM packages AS pc INNER JOIN branches AS br ON pc.branch_to = br.id INNER JOIN users AS us ON pc.created_by = us.id  WHERE pc.status = ? AND pc.barcode_id = ?;"
        query += "SELECT id, name FROM branches WHERE id != ?;"

    pool.getConnection((err, connection) => {
        if (err) throw err; // not connected
        //console.log('Connected!');

        connection.query(query, [input_code,1,input_code,branch_id], (err, barcode) => {
            // Once done, release connection
            connection.release();
            if (!err) {

                console.log(barcode)

                if (barcode[0].length > 0 && barcode[1].length > 0) {
                    if (barcode[0][0].status == 2 && barcode[1][0].barcode_id == barcode[0][0].code_id && branch_id != barcode[1][0].branch_to && branch_id != barcode[1][0].branch_from) {
                       
                        return res.json({ status: 1,branches:barcode[2],data:barcode[1][0], code_text: barcode[0][0].code_id, code_data: barcode[0][0].code_data });
                        
                    } else {
                        return res.json({ status: 2 });
                    }

                } else {
                    if (barcode[0].length > 0) {
                        //barcode is valid doent match with action
                        return res.json({ status: 3 });
                    }else{
                        return res.json({ status: 4 });
                    }
                    
                }

            } else {

                console.log(err);
                return res.json({ status: 4 });
                
            }

        });
    });

}