const multer = require("multer")
var data = require('../data')

const fileStorageEngine = multer.diskStorage({
    destination: (req, file, cb) =>{
        cb(null, data.upload_path+'/images')
    },
    filename: (req, file, cb) =>{
        var name = file.originalname
        var nameArry = name.split(".")
        var ext = nameArry[nameArry.length - 1]
        var filename = Date.now()+'-'+Math.random().toString(36).substring(2,7)+'.'+ext;
        cb(null, filename)
    }
})


const fileStorageAudio = multer.diskStorage({
    destination: (req, file, cb) =>{
        cb(null, data.upload_path+'/audios')
    },
    filename: (req, file, cb) =>{
        var name = file.originalname
        var nameArry = name.split(".")
        var ext = nameArry[nameArry.length - 1]
        var filename = Date.now()+'-'+Math.random().toString(36).substring(2,8)+'.'+ext;
        cb(null, filename)
    }
})

const fileStorageVideo = multer.diskStorage({
    destination: (req, file, cb) =>{
        cb(null, data.upload_path+'/videos')
    },
    filename: (req, file, cb) =>{
        var name = file.originalname
        var nameArry = name.split(".")
        var ext = nameArry[nameArry.length - 1]
        var filename = Date.now()+'-'+Math.random().toString(36).substring(2,5)+'.'+ext;
        cb(null, filename)
    }
})


const fileStorageBook = multer.diskStorage({
    destination: (req, file, cb) =>{
        cb(null, data.upload_path+'/books')
    },
    filename: (req, file, cb) =>{
        var name = file.originalname
        var nameArry = name.split(".")
        var ext = nameArry[nameArry.length - 1]
        var filename = Date.now()+'-'+Math.random().toString(36).substring(3,9)+'.'+ext;
        cb(null, filename)
    }
})

const bookUpload = multer({storage: fileStorageBook})
const videoUpload = multer({storage: fileStorageVideo})
const audioUpload = multer({storage: fileStorageAudio})
const imageUpload = multer({storage: fileStorageEngine})

module.exports = {imageUpload, audioUpload, videoUpload,bookUpload}