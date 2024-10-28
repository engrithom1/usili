const pool = require('../config/dbconfig')
var data = require('../data')

/*var LocalStorage = require('node-localstorage').LocalStorage
localStorage = new LocalStorage('./scratch');*/

const axios = require('axios')
const {Canvas} = require('canvas')
const JsBarcode = require('jsbarcode')

var userInfo = data.userInfo

exports.genBarcode = (req, res) => {
         
    if(req.session.user){
       userInfo.isLoged = req.session.user.isLoged
       userInfo.user = req.session.user.user
    }
    var seo_data = {
        title:"barcode generator",
        description:"landing page of this simple payment apprication"
    } 
    
    res.render('generate_code',{userInfo:userInfo,seo_data});
        
}

exports.printBarcode = (req, res) => {
         
    if(req.session.user){
       userInfo.isLoged = req.session.user.isLoged
       userInfo.user = req.session.user.user
    }
    var seo_data = {
        title:"barcode generator",
        description:"landing page of this simple payment apprication"
    } 
    
    res.render('print_code',{userInfo:userInfo,seo_data});
        
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function genCode(cod,formats,bool){

    try {

        var canvas = new Canvas()

    JsBarcode(canvas, cod, {
        format: formats,
        lineColor: "#000",
        width:2,
        height:80,
        displayValue:bool
    });

    return canvas.toDataURL('image/png')
        
    } catch (error) {
        console.log(error)
    }

}


exports.barcodeGenerator = (req, res) => {

  var { quantity, texts, formats} = req.body;
  
  
  try {

  /*var sbarcodes = localStorage.getItem('sbarcodes')

  console.log(sbarcodes)
  if(sbarcodes == null){*/
    
    console.log(req.body);

  var codebars = []
  var batch = getRandomInt(10000, 100000);

  var today = new Date();
     var yy = today.getFullYear()
     var dd = today.getDate()
     var mm = today.getMonth() + 1
 
     if(mm < 10){
        mm = '0'+mm
     }
     
     if(dd < 10){
         dd = '0'+dd
     }
     var created_at = yy+'-'+mm+'-'+dd+' 00:00:00' 
   
    if(req.session.user){
       userInfo.isLoged = req.session.user.isLoged
       userInfo.user = req.session.user.user
    }

    var user_id = req.session.user.user.id
    var branch_id = req.session.user.user.bid

    for (let index = 0; index < quantity; index++) {

        var code = getRandomInt(1000000000, 10000000000);
        codebars.push({'id':code,'code_data':'','batch_no':batch,'created_by':user_id,'branch_id':branch_id,'code_type':formats,'created_at':created_at})
    }

    for (let index = 0; index < codebars.length; index++) {

        var cod = codebars[index].code_id

        var cdata = genCode(cod,formats,texts)
        
        console.log(cdata)

        codebars[index].code_data = cdata;

    }
    
    console.log(codebars)
    return res.render('partials/codebar_list',{layout:false,codebars,message:""})

    /*}else{
        return res.render('partials/codebar_list',{layout:false,sbarcodes,message:"Make use of this pending barcodes. save to use or remove them"})
    }*/

  } catch (error) {

    return res.render('partials/danger_message',{layout:false,message:'Something goes wrong, try again'})
  }

 

}