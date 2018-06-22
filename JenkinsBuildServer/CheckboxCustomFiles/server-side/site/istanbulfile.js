var im = require('istanbul-middleware'),
    isCoverageEnabled = true; // or a mechanism of your choice
var mongo = require('mongodb');
//before your code is require()-ed, hook the loader for coverage
if (isCoverageEnabled) {
    console.log('Hook loader for coverage - ensure this is not production!');
    im.hookLoader(__dirname);
        // cover all files except under node_modules
        // see API for other options
}
var Sinon = require('sinon'); 
// now require the rest of your code
var express = require('express'),   app = express();

// set up basic middleware
// ...
var stuff= require('./testMain.js')
// add the coverage handler
if (isCoverageEnabled) {
    //enable coverage endpoints under /coverage
    app.use('/coverage', im.createHandler());
}

//add your router and other endpoints
//...

//app.listen(80);
app.listen(8095);
