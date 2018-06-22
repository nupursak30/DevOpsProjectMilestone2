var express = require('express'); var mongo = require('mongodb');
 var request = require('sync-request'); 
 var ObjectID=mongo.ObjectID;var Sinon = require('sinon'); 
 var CollectionMock = Sinon.mock(mongo.Collection.prototype);


 var admin = require('./routes/admin.js'); 



 var create = require('./routes/create.js'); 



 var study = require('./routes/study.js'); 



 var app = express();app.configure(function () {app.use(express.logger('test'));  app.use(express.bodyParser()); });var res =null;

var result1={ _id: 1 , votes: {studyId: 345, timestamp: null,  ip: null ,email: 'cm@nbhd.com',contact: null} ,token: 1,studyKind: 'survey', email:'jjr@gmail.com' } ;

var result2={ _id: 2 , votes: {studyId: 345, timestamp: null,  ip: null ,email: 'cm@nbhd.com',contact: null} ,token: 1,studyKind: 'dataStudy' }   ;

var result3={ _id: 3 , votes: {studyId: 345, timestamp: null,  ip: null ,email: 'cm@nbhd.com',contact: null} ,token: 1,studyKind: 'test' } ;



var result4={toArray: function(cb) {
 const result = [{
  _id: 0 , votes: {studyId: 345, timestamp: null,  ip: null ,email: 'cmachan@gmail.com', contact: null} ,token: 1,studyKind: 'survey' 
   }];
   cb(null, result);
  }};


var result5={toArray: function(cb) {
 const result = [];
   cb(null, result);
  }};


var result6={toArray: function(cb) {
 const result = [{
  _id: 0 , votes: {studyId: 345, timestamp: null,  ip: null ,email: '', contact: null} ,token: 2,studyKind: 'dataStudy' , email: 'cm@gmail.com' 
   }];
   cb(null, result);
  }};
var result7={ 'inserted': 1};

var result8=[{ _id: 1 , votes: {studyId: 345, timestamp: null,  ip: null ,email: 'cm@nbhd.com',contact: null} ,token: 1,studyKind: 'survey' } ,{ _id: 2 , token: 1,studyKind: 'survey' }];
CollectionMock.expects('findOne').once().yields(null,result1);
CollectionMock.expects('findOne').once().yields(null,result2);
CollectionMock.expects('findOne').once().yields(null,result3);

app.get('/api/study/load/1',study.loadStudy);
CollectionMock.expects('find').once().returns(result4);

CollectionMock.expects('find').once().returns(result5);

CollectionMock.expects('find').once().returns(result6);

app.get('/api/study/vote/status',study.voteStatus);
CollectionMock.expects('find').once().returns(result4);

CollectionMock.expects('find').once().returns(result5);

CollectionMock.expects('find').once().returns(result6);

app.get('/api/study/status/1',study.status);
CollectionMock.expects('find').once().returns(result4);

CollectionMock.expects('find').once().returns(result5);

CollectionMock.expects('find').once().returns(result6);
CollectionMock.expects('aggregate').thrice().yields(null,result8);

app.get('/api/study/listing',study.listing);CollectionMock.expects('insert').exactly(10).yields(null,result7);

app.post('/api/study/create',create.createStudy);
app.post('/api/study/vote/submit/',study.submitVote);CollectionMock.expects('findOne').once().yields(null,result1);
CollectionMock.expects('findOne').once().yields(null,result2);
CollectionMock.expects('findOne').once().yields(null,result3);

app.get('/api/study/admin/1',admin.loadStudy);CollectionMock.expects('findOne').once().yields(null,result1);
CollectionMock.expects('findOne').once().yields(null,result2);
CollectionMock.expects('findOne').once().yields(null,result3);

CollectionMock.expects('find').once().returns(result4);

CollectionMock.expects('find').once().returns(result5);

CollectionMock.expects('find').once().returns(result6);

CollectionMock.expects('find').once().returns(result4);

CollectionMock.expects('find').once().returns(result5);

CollectionMock.expects('find').once().returns(result6);

app.get('/api/study/admin/download/1',admin.download);CollectionMock.expects('findOne').once().yields(null,result1);
CollectionMock.expects('findOne').once().yields(null,result2);
CollectionMock.expects('findOne').once().yields(null,result3);

CollectionMock.expects('find').once().returns(result4);

CollectionMock.expects('find').once().returns(result5);

CollectionMock.expects('find').once().returns(result6);

app.get('/api/study/admin/assign/1',admin.assignWinner);CollectionMock.expects('findOne').once().yields(null,result1);
CollectionMock.expects('findOne').once().yields(null,result2);
CollectionMock.expects('findOne').once().yields(null,result3);

app.post('/api/study/admin/open/',admin.openStudy);CollectionMock.expects('findOne').once().yields(null,result1);
CollectionMock.expects('findOne').once().yields(null,result2);
CollectionMock.expects('findOne').once().yields(null,result3);

app.post('/api/study/admin/close/',admin.closeStudy);
app.post('/api/study/admin/notify/',admin.notifyParticipant);
app.listen(process.env.MONGO_PORT);
console.log('Listening on port 3002...');