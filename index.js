var express = require('express');
var fileUpload = require('express-fileupload');
var app = express();

// default options
app.use(fileUpload());

const Rekognition = require('node-rekognition');

// Set your AWS credentials
const AWSParameters = {
    "accessKeyId": "",
    "secretAccessKey": "",
    "region": "",
    "bucket": "",
}

const rekognition = new Rekognition(AWSParameters);

/*app.get('/image', function(req, res) {
    const imageLabels =  rekognition.detectLabels({Key:'chat.jpg'});
    imageLabels.then (function(value) {
        //console.log (value);
        if (value.Labels[0].Name == 'Animal'){
            res.send(value.Labels[0].Name);
        }
        res.end();
      });
});*/

app.post('/upload', function(req, res) {
    if (!req.files)
      return res.status(400).send('No files were uploaded.');
   
    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    let sampleFile = req.files.sampleFile;
   
    // Use the mv() method to place the file somewhere on your server
    sampleFile.mv('/Users/mehdi/Documents/Animadex/'+sampleFile.name, function(err) {
      if (err)
        return res.status(500).send(err);
   
    const s3Images = rekognition.uploadToS3('/**/**/Documents/Animadex/'+sampleFile.name, '/images');

    s3Images.then (function(value) {
        console.log(value);
        res.send('File uploaded!');
      });
    });
  });
app.listen(3000);
