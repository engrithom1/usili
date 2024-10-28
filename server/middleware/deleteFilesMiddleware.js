

var data = require('../data')
var fs = require('fs')

var deleteAllPdf = (req, res, next) =>{
    
    try {
        path = data.upload_path+'/outputFiles/'
        // Read the directory given in `path`
        const files = fs.readdir(path, (err, files) => {
          if (err)
            throw err;
      
          files.forEach((file) => { 
            // Check if the file is with a PDF extension, remove it
            if (file.split('.').pop().toLowerCase() == 'pdf') {
              console.log(`Deleting file: ${file}`);
              fs.unlinkSync(path + file)
            }
          });
        });

        next();
      } catch (err) {
        console.error(err);
      }

}

const deleteAllExcel = (req, res, next) =>{
    
    try {
        path = data.upload_path+'/outputFiles/'
        // Read the directory given in `path`
        const files = fs.readdir(path, (err, files) => {
          if (err)
            throw err;
      
          files.forEach((file) => { 
            // Check if the file is with a PDF extension, remove it
            if (file.split('.').pop().toLowerCase() == 'xlsx') {
              console.log(`Deleting file: ${file}`);
              fs.unlinkSync(path + file)
            }
          });
        });

        next()
      } catch (err) {
        console.error(err);
      }

}

module.exports = {deleteAllPdf,deleteAllExcel};

