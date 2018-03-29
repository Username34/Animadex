var express = require('express');
var app = express();

const Rekognition = require('node-rekognition');

// Set your AWS credentials
const AWSParameters = {
    "accessKeyId": "",
    "secretAccessKey": "",
    "region": "us-east-2",
    "bucket": "",
}

const rekognition = new Rekognition(AWSParameters);

const imageLabels =  rekognition.detectLabels({Key:'chat.jpg'});
let test;
//test = imageLabels.then
imageLabels.then (function(value) {
    console.log (value);
  });
