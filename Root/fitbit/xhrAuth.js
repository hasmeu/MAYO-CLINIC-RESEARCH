//less secure and robust, but useful and simple 
const db = require('../../db/connection');

//get url
var url = window.location.href;

//get access token
var access_token = url.split("#")[1].split("=")[1].split("&")[0];
//get user id
var userId = url.split("#")[1].split("=")[2].split("&")[0];

//AJAX request to FitBit API for heart rate data over the last week
var xhr = new XMLHttpRequest();
xhr.open('GET', 'https://api.fitbit.com/1/user/' + userId + '/activities/heart/date/today/1w.json');
xhr.setRequestHeader("Authorization", 'Bearer ' + access_token);
xhr.onload = function () {
    if (xhr.status === 200) {
        console.log(xhr.responseText)
    }
};
xhr.send();
