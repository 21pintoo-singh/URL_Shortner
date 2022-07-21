
const validUrl=require('valid-url')


const emptyObject = function (value) {
    return Object.keys(value).length > 0
}

const isEmpty = function (value) {
    if (typeof value === 'undefined' || value === 'null') return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    if (typeof value === 'number' && value.toString().trim().length === 0) return false
    return true;
}

const isValidUrl= function (value) {
    let checkUrl = /[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&=]*)/
    if (checkUrl.test(value)) {
        return true;
    }
    return false;
}


module.exports={
    emptyObject,
    isEmpty,
    isValidUrl
}