const SERVER_ERR_MSG = "Unexpected internal server error";

function returnMessage(res, status, message) {
    res.status(status);
    res.send(message);
    if (status !== 200) {
        console.log(e);
    }
}

function makeArray(obj) {
    let newArr = obj || []; // if null, set as empty list
    return Array.isArray(newArr) ? newArr : [newArr]; // if 1 element, make it into array
}

module.exports = {
    returnMessage, makeArray, SERVER_ERR_MSG
}