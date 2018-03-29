var express = require('express');
var fileUpload = require('express-fileupload');
var wd = require("word-definition");
const AWS = require('aws-sdk')
var app = express();
const Fs = require('fs')

let path = __dirname + '/tmp/';

// default options
app.use(fileUpload());

// Create an Polly client
const Polly = new AWS.Polly({
    signatureVersion: 'v4',
    region: 'us-east-2'
})

const Rekognition = require('node-rekognition');

// Set your AWS credentials
const AWSParameters = '';

if (AWSParameters == '') {
  throw new Error("T'as pas copié la constante AWSParameters de Mehdi andouille !");
}

const rekognition = new Rekognition(AWSParameters);

app.post('/upload', function(req, res) {
    if (!req.files)
      return res.status(400).send('No files were uploaded.');

    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    let sampleFile = req.files.sampleFile;

    // Use the mv() method to place the file somewhere on your server
    sampleFile.mv(path+sampleFile.name, function(err) {
      if (err)
        return res.status(500).send(err);

    const s3Images = rekognition.uploadToS3(path+sampleFile.name, 'images/');

    s3Images.then (function(value) {
        var key = value.Key;
        const imageLabels =  rekognition.detectLabels({Key:key});
        imageLabels.then (function(value) {
            if (value.Labels[0].Name == 'Animal'){
                wd.getDef(value.Labels[1].Name.toLowerCase(), "en", null, function(definition) {
                    synthesizeSpeech(function (src){
                        console.log(src);
                        if (src == true){
                            res.send("."+path+sampleFile.name+".mp3");
                        }
                    },definition.word+". "+definition.definition, sampleFile.name);
                });
            }
          });
      });
    });
  });
app.listen(3000);
console.log(path);

function synthesizeSpeech (callback, text, name){
    let params = {
        'Text': text,
        'OutputFormat': 'mp3',
        'VoiceId': 'Joey'
    }

    Polly.synthesizeSpeech(params, (err, data) => {
        if (err) {
            console.log("ERREUR : " + err.code)
        } else if (data) {
            if (data.AudioStream instanceof Buffer) {
                Fs.writeFile(path+name+".mp3", data.AudioStream, function(err) {
                    if (err) {
                        return console.log("ERREUR : " + err)
                        callback(false);
                    }
                    callback(true);
                    console.log("OK :) Le fichier a été enregistré")
                })
            }
        }
    })
}
