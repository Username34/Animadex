var express = require('express');
var fileUpload = require('express-fileupload');
var wd = require("word-definition");
const AWS = require('aws-sdk')
var app = express();
const Fs = require('fs')

app.use(function(req, res, next){
  res.header("Access-Control-Allow-Origin", "*");
  next();
});


let path = __dirname + '/tmp/';

// default options
app.use(fileUpload());

// Create an Polly client
const Polly = new AWS.Polly({
    signatureVersion: 'v4',
    region: 'us-east-2'
})

const Rekognition = require('node-rekognition');

var contents = Fs.readFileSync("awsParam.json");
 var json_aws_param = JSON.parse(contents);

// Set your AWS credentials
const AWSParameters = {
    "accessKeyId": json_aws_param.accessKeyId,
    "secretAccessKey": json_aws_param.secretAccessKey,
    "region": json_aws_param.region,
    "bucket": json_aws_param.bucket
};

if (AWSParameters == '') {
  throw new Error("T'as pas copié la constante AWSParameters de Mehdi andouille !");
}

const rekognition = new Rekognition(AWSParameters);

app.post('/upload', function(req, res) {
    console.log(1);
    if (!req.files)

      return res.status(400).send('No files were uploaded.');

    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    console.log(2);
    let sampleFile = req.files.sampleFile;

    // Use the mv() method to place the file somewhere on your server
    sampleFile.mv(path+sampleFile.name, function(err) {
      if (err) {
        console.log(3);
        return res.status(500).send(err);
      }

    console.log(4);
    const s3Images = rekognition.uploadToS3(path+sampleFile.name, 'images/');
    console.log(5);
    s3Images.then (function(value) {
        console.log(6);
        var key = value.Key;
        console.log(7);
        const imageLabels =  rekognition.detectLabels({Key:key});
        console.log(8);
        imageLabels.then (function(value) {
            if (value.Labels[0].Name == 'Animal'){
                console.log(9);
                wd.getDef(value.Labels[1].Name.toLowerCase(), "en", null, function(definition) {
                    synthesizeSpeech(function (src){
                        console.log(src);
                        if (src == true){
                            let song = path+sampleFile.name+".mp3";
                            res.set({'Content-Type': 'audio/mpeg'});
                            res.set('accept-ranges', 'bytes');

                            readStream = Fs.createReadStream(song);
                            readStream.pipe(res);
                        }
                    },definition.word+". "+definition.definition, sampleFile.name);
                });
            } else {
              res.json(null);
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
                    console.log("OK :)")
                })
            }
        }
    })
}
