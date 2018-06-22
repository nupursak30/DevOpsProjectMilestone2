// Core/NPM Modules
"use strict";
const fs = require("fs");
const _ = require('lodash');

/**
 * Generate test cases based on the global object functionConstraints.
 * @param {String} args                Path to routes.
 * @param {String} filepath            Path to write test file.
 * @param {Object} appConstraints      Server.js Constraints object as returned by `constraints`.
 * @param {Object} functionConstraints Routes Constraints object as returned by `constraints`.
 */
function generateTestCases(args, filepath, appConstraints, functionConstraints) {

   // Content string. This will be built up to generate the full text of the test string.
   let content2 = `var request = require('sync-request'); `;
   let content = `var express = require('express'); var mongo = require('mongodb');\n var request = require('sync-request'); \n var ObjectID=mongo.ObjectID;`;
   content += `var Sinon = require('sinon'); \n var CollectionMock = Sinon.mock(mongo.Collection.prototype);\n var gridStoreMock = Sinon.mock(mongo.GridStore.prototype);\n `
   let iter = 1;
   for (let arg of args) {
      var model = arg.replace('routes/', '').split('.')[0];
      content += `var ${model} = require('./${arg}'); \n\n\n\n `

   }

   content += `var app = express();app.configure(function () {`;
   content += `app.use(express.logger('test')); `;
   content += ` app.use(express.bodyParser());`;
   content += ` });var res =null;\n`;

   var result1 = "{ _id: 1 , votes: {studyId: 345, timestamp: null,  ip: null ,email: 'cm@nbhd.com',contact: null} ,token: 1,studyKind: 'survey', email:'jjr@gmail.com' } ";
   var result2 = "{ _id: 2 , votes: {studyId: 345, timestamp: null,  ip: null ,email: 'cm@nbhd.com',contact: null} ,token: 1,studyKind: 'dataStudy' }   ";
   var result3 = "{ _id: 3 , votes: {studyId: 345, timestamp: null,  ip: null ,email: 'cm@nbhd.com',contact: null} ,token: 1,studyKind: 'test' } ";
   content += `\nvar result1=${result1};\n`;
   content += `\nvar result2=${result2};\n`;
   content += `\nvar result3=${result3};\n`;

   content += `\n\n\nvar result4={toArray: function(cb) {`;
   content += `\n const result = [{`;
   content += `\n  _id: 0 , votes: {studyId: 345, timestamp: null,  ip: null ,email: 'cmachan@gmail.com', contact: null} ,token: 1,studyKind: 'survey',skipListing: true `;
   content += `\n   },{`;
   content += `\n  _id: 1 , votes: {studyId: 345, timestamp: null,  ip: null ,email: 'cmachan@gmail.com', contact: null} ,token: 1,studyKind: 'survey' `;
   content += `\n   },{`;
   content += `\n  _id: 2 , votes: {studyId: 345, timestamp: null,  ip: null ,email: 'cmachan@gmail.com', contact: null} ,token: 1,studyKind: 'survey' `;
   content += `\n   }];`;
   content += `\n   cb(null, result);`;
   content += `\n  }};`;

   content += `\n\n\nvar result6={toArray: function(cb) {`;
   content += `\n const result = [];`;
   content += `\n   cb(null, result);`;
   content += `\n  }};`;

   content += `\n\n\nvar result5={toArray: function(cb) {`;
   content += `\n const result = [{`;
   content += `\n  _id: 0 , votes: {studyId: 345, timestamp: null,  ip: null ,email: '', contact: null} ,token: 2,studyKind: 'dataStudy' , email: 'cm@gmail.com'  `;
   content += `\n   }];`;
   content += `\n   cb(null, result);`;
   content += `\n  }};`;

   var result7 = "{ 'inserted': 1}";
   content += `\nvar result7=${result7};\n`;
   var result8 = "[{ _id: 0 , votes: {studyId: 345, timestamp: null,  ip: null ,email: 'cm@nbhd.com',contact: null} ,token: 1,studyKind: 'survey' } ,{ _id: 2 , token: 1,studyKind: 'survey' }, { _id: 1 , votes: {studyId: 345, timestamp: null,  ip: null ,email: 'cm@nbhd.com',contact: null} ,token: 1,studyKind: 'survey' } ,{ _id: 2 , token: 1,studyKind: 'survey' },{ _id: 2 , votes: {studyId: 345, timestamp: null,  ip: null ,email: 'cm@nbhd.com',contact: null} ,token: 1,studyKind: 'survey' } ]";
   content += `\nvar result8=${result8};\n`;
   var result9 = "[{ _id: 1 , votes: {studyId: 345, timestamp: null,  ip: null ,email: 'cm@nbhd.com',contact: null} ,token: 1,studyKind: 'survey' } ,{ _id: 2 , token: 1,studyKind: 'survey' }]";
   content += `\nvar result9=${result9};\n`;
     var result10 = "[{ _id: 2 , votes: {studyId: 345, timestamp: null,  ip: null ,email: 'cm@nbhd.com',contact: null} ,token: 1,studyKind: 'survey' } ,{ _id: 2 , token: 1,studyKind: 'survey' }]";
   content += `\nvar result10=${result10};\n`;
   //console.log("functionConstraints",functionConstraints);
   // Iterate over each function in appConstraints
   for (let funcName in appConstraints) {

      if (funcName != '') {
         //console.log(funcName);
         // Reference all constraints for funcName.
         let params = appConstraints[funcName].params;
         //console.log("params",params);
         // Get constraints and map to values
         let constraints = appConstraints[funcName].constraints;
         //console.log("constraints",constraints);

         let values = _.mapValues(constraints, (arr) => _.map(arr, c => c.value));
         //console.log("values",values);

         let callback = values.class + "." + values.method;

        
         //console.log(callback);
         if (functionConstraints[callback]) {

            let callbackConstraints = functionConstraints[callback].constraints;
            let callbackvaluesvalues = _.mapValues(callbackConstraints, (arr) => _.map(arr, c => c.value));

           
            _.forEach(callbackConstraints.req, function(value) {
               var param = (value.altvalue);
               var vaue = (value.value);
            });

            for (let i in callbackvaluesvalues.dbtable) { //console.log(callbackvaluesvalues.colobj[i]);

               switch (callbackvaluesvalues.colobj[i]) {
                  case 'findOne':

                     content += `CollectionMock.expects('${callbackvaluesvalues.colobj[i]}').once().yields(null,result1);\n`
                     content += `CollectionMock.expects('${callbackvaluesvalues.colobj[i]}').once().yields(null,result2);\n`
                     content += `CollectionMock.expects('${callbackvaluesvalues.colobj[i]}').once().yields(null,result3);\n`

                     break;
                  case 'find':

                     content += `\nCollectionMock.expects('${callbackvaluesvalues.colobj[i]}').once().returns(result4);\n`
                     content += `\nCollectionMock.expects('${callbackvaluesvalues.colobj[i]}').once().returns(result5);\n`
                     content += `\nCollectionMock.expects('${callbackvaluesvalues.colobj[i]}').once().returns(result6);\n`

                     break;

                  case 'aggregate':

                     content += `CollectionMock.expects('${callbackvaluesvalues.colobj[i]}').once().yields(null,result8);\n`
					content += `CollectionMock.expects('${callbackvaluesvalues.colobj[i]}').once().yields(null,result9);\n`
					content += `CollectionMock.expects('${callbackvaluesvalues.colobj[i]}').once().yields(null,result10);\n`


                     break;

                  case 'insert':

                     content += `CollectionMock.expects('${callbackvaluesvalues.colobj[i]}').exactly(10).yields(null,result7);\n`
                    
                     break;
                  default:
                     break

               }

               iter++;
              

            }

            var file = {};
            for (let flag of callbackvaluesvalues.files) {

               file = {
                  "field": 'file'
               }
               if (flag) {
                  content += `gridStoreMock.expects('read').once().yields(null,"test Data");\n`
               }
            }

            let allConstraints = _.flattenDeep(_.map(constraints));
            let appgetCon = _.some(allConstraints, {
               kind: 'get'
            });
            if (appgetCon) {
               var uri = funcName.split(":")
               var getparam = 1;
               var param = uri[1] ? 1 : '';
               content += `\napp.get('${uri[0]}${param}',${callback});`;

               for (var i = 0; i < 3; i++) {
                  content2 += '\ntry{\n';
                  content2 += `\tres =request('GET',('http://localhost:${process.env.MONGO_PORT}${uri[0]}${param}'));\n`;

                  content2 += '} catch(e) {}\n';
               }

               } else {
               content += `\napp.post('${funcName}',${callback});`;
               var jsonOb = {};
               let requestparams = _.mapValues(callbackConstraints, (arr) => _.map(arr, c => c.altvalue));
               if (_.isEmpty(callbackConstraints.req)) {
                  for (var i = 0; i < 3; i++) {
                     content2 += '\ntry{\n';
                     content2 += `\tres =request('POST',('http://localhost:${process.env.MONGO_PORT}${funcName}'));\n`;
                     content2 += '} catch(e) {}\n';
                     funcName
                  }
               } else {
                  _.forEach(callbackConstraints.req, function(value) {
                     jsonOb[value.altvalue] = value.value;
                     var flag = (requestparams.req).every(function(val) {
                        return (Object.keys(jsonOb)).indexOf(val) >= 0
                     });
                     if (flag) {

                        content2 += '\ntry{\n';
                        content2 += `\tres =request('POST',('http://localhost:${process.env.MONGO_PORT}${funcName}'),{ json: ${JSON.stringify(jsonOb)},files:{files: [${JSON.stringify(file)}]} });\n`;
                        content2 += '} catch(e) {}\n';

                     }

                  });

               }
            }

         }
      }
   }
   // Write final content string to file test.js.

   content += `\napp.listen(process.env.MONGO_PORT);`;
   content += `\nconsole.log('Listening on port 3002...');`;
   fs.writeFileSync('testMain.js', content, "utf8");
   fs.writeFileSync('test.js', content2, "utf8");

}

// Export
module.exports = generateTestCases;
