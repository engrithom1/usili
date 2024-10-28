const axios = require("axios");

exports.getSlug = (str, id, len) => {

    if (str.length > len) {
        str = str.substr(0, len)
    }
    str = str + '-' + id
    str = str.toString()                     // Cast to string
    str = str.toLowerCase()                  // Convert the string to lowercase letters
    str = str.normalize('NFD')       // The normalize() method returns the Unicode Normalization Form of a given string.
    str = str.trim()                         // Remove whitespace from both sides of a string
    str = str.replace(/\s+/g, '-')           // Replace spaces with -
    str = str.replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    str = str.replace(/\-\-+/g, '-');     // Replace multiple - with single -

    return str
}

exports.getIdFromSlug = (slug) => {
    var strArry = slug.split("-")
    return strArry[strArry.length - 1]
}

exports.randomString = (length, chars) => {
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}

exports.sendMultSMS = async(numberz,message) =>{

    var reff = Math.floor(10000 + Math.random()*90000)

    var Url ='https://messaging-service.co.tz/api/sms/v1/text/single';
    var auth ='bmFzc2lidW1rYWxpOlNoaW5lcG9ydGFs';

    var res = await axios({
        method: "post",
        url: Url,
        data:{
            'from':'ShinePortal',
            'to':numberz,
            'text':message,
            'reference':reff
        },
        headers: {
            'Authorization':'Basic bmFzc2lidW1rYWxpOlNoaW5lcG9ydGFs',
            'Content-Type': 'application/json',
            'Accept': 'application/json'   
        }
    })
    .catch((err) => {
        console.log(err)
        return err
    });
    return res
}