/**
 * NodeJS Test Generation Module
 */


// Core/NPM Modules
const path    = require('path');


// Local Modules
const constraints       = require('./test/constraint');
const generateTestCases = require('./test/testgenerator');


// Polyfills
require('./test/format-polyfill');



/**
 * Parse an input file and generate test cases for it.
 */
(module.exports.main = function() {

    // Parse file input, defaulting to subject.js if not provided
    let args = process.argv.slice(2);
    if( args.length === 0 ) {
        args = ["routes/admin.js","routes/create.js","routes/study.js"];
    }
    let filePath = path.resolve("server.js");
	let appConstraints = {};
    // Initialize constraints based on input file
     appConstraints = constraints(filePath,appConstraints);
		let functionConstraints = {};
	for(var i=0; i<args.length; i++){
		
	 filePath = path.resolve(args[i]);
	 functionConstraints = constraints(filePath,functionConstraints);
	
	}
	let serverFile=path.resolve("server.js");
	//filePath=filePath.split('\\').join('\\\\');
    // Generate test cases
	
	// args = ["admin.js","create.js","designer.js","live.js","study.js","upload.js"];
    
    generateTestCases(args,serverFile, appConstraints,functionConstraints);

})();
