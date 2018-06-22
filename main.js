var fs = require('fs'),
    xml2js = require('xml2js'),
    child  = require('child_process'),
    path = require('path'),
    slash = require('slash'),
    dirRead = require('recursive-readdir-sync');
var parser = new xml2js.Parser();
var Bluebird = require('bluebird')
//var local = slash(__dirname);
const testFolder = slash(`/var/lib/jenkins/jobs/iTrustBuildJob/builds`);
const runTestFolder = slash(`/var/lib/jenkins/jobs/iTrustBuildJob/testReports`)
let SortResult = [];

//console.log("TEST FOLDER location:", testFolder)

calculatePriority(testFolder);
calculateRunTestPriority(runTestFolder)

async function calculatePriority(testFolder)
{
    var files = dirRead(testFolder);
    var BuildResult = [];
    var failedTests = 0;
    var BuildCount = child.execSync(`ls -l | grep ^d | wc -l`, {
      cwd: testFolder
    }).toString('utf8');
    console.log("Number of builds:", BuildCount)


    for (var i=1; i <= BuildCount; i++){
      try{
        var buildPath = slash(`${testFolder}/${i}/build.xml`)
        var contents = fs.readFileSync(buildPath,'utf-8');
      }catch(e){}
      let xml2json = await Bluebird.fromCallback(cb => parser.parseString(contents, cb));
      // console.log(xml2json)
      if (xml2json.build.result[0] == "SUCCESS"){
        BuildResult.push({
        name:   `Build ${i}`,
        time: (xml2json.build.duration[0]*0.001),
        status: "passed"
        });
      }
      if (xml2json.build.result[0] == "FAILURE"){
        BuildResult.push({
        name:   `Build ${i}`,
        time: (xml2json.build.duration[0]*0.001),
        status: "failed"
        });
        failedTests++;
      }
    }

    try{
      BuildResult.sort(function(a,b){
        x = a.status
        y = b.status
        if (x==y) return a.time-b.time;
        if (x>y) return 1;
        if (x<y) return -1;
      });
      BuildResult.forEach( e => console.log(e));
      console.log("Number of failed tests(Fuzzing commits):", failedTests)
    }catch(e){}
    //console.log("BUILD RESULT:", BuildResult)
    // BuildResult.sort(function(a,b){
    //   x = a.status
    //   y = b.status
    //   if (x==y) return a.time-b.time;
    //   if (x>y) return 1;
    //   if (x<y) return -1;
    // });
    // BuildResult.forEach( e => console.log(e));
    // console.log("Number of failed tests(Fuzzing commits):", failedTests)
}


async function calculateRunTestPriority(runTestFolder)
{
  var BuildResult = [];
  //var failedTests = 0;
  var BuildFolder = child.execSync(`ls -l | grep ^d | wc -l`, {
    cwd: runTestFolder
  }).toString('utf8');
  //console.log("Buildfolder type", typeof(BuildFolder))
  //console.log("Buildfolder length:", BuildFolder.length)
  var matchBuild = BuildFolder.match(/\d/g).join("");
  //console.log("matchBuild length:", matchBuild.length)
  //console.log("Number of build folders:",matchBuild)
  //console.log("Index of build folder:", BuildFolder.indexOf('31'))

  while (matchBuild>0){
    //console.log("Test")
    var buildPath = slash(`${runTestFolder}/${matchBuild}/surefire-reports`)
    //console.log("SUREFIRE LOCATION:", buildPath)
    try{
      var files = dirRead(buildPath);
    }catch(e){
      console.log("Surefire-reports directory missing")
      matchBuild--;
      continue;
      }
      //console.log("SUREFIRE FOLDER PATH:", buildPath)
      try{
        var FileCount = child.execSync(`ls -l | grep ^- | grep xml | wc -l`, {
          cwd: buildPath
        }).toString('utf8');
        var matchFile = FileCount.match(/\d/g).join("");
        //console.log("NO. OF FILES inside Surefire:", matchFile)
      }catch(e){
        console.log("Error while getting .xml files inside surefire directory");
        //matchBuild--;
      }
     for (i = 0; i < matchFile; i++){
       if(files[i].endsWith(".xml")) {
          //console.log("XML files:", files[i])
          var FilePath = slash(`${files[i]}`)
          //console.log("FILE PATH:", FilePath)
          try{
            var contents = fs.readFileSync(FilePath,'utf-8');
            //console.log("CONTENT:", contents)
          }catch(e){console.log("Error while reading .xml file")}

        }

        let xml2json = await Bluebird.fromCallback(cb => parser.parseString(contents, cb));
        //console.log(xml2json)

        var testcase = xml2json.testsuite;

        if (testcase['$'].errors == "0"){
          BuildResult.push({
          name: testcase['$'].name,
          time: testcase['$'].time,
          status: "passed"
          });
        } else{
          BuildResult.push({
          name: testcase['$'].name,
          time: testcase['$'].time,
          status: "failed"
          });
        }
     }
     //console.log("BUILD RESULT:", BuildResult)
         BuildResult.sort(function(a,b){
           x = a.status
           y = b.status
           if (x==y) return a.time-b.time;
           if (x>y) return 1;
           if (x<y) return -1;
         });
         // var TestsFailed = 0;
         // console.log(`---------BUILD ${matchBuild}-----------------`)

         try{
           var TestsFailed = 0;
           //console.log(`---------BUILD ${matchBuild}-----------------`)
           BuildResult.forEach( e => {
            // console.log(e)
             if (e.status == "failed"){
               TestsFailed++;
             }
             SortResult.push({
             buildNumber: `${matchBuild}`,
             testname: e.name,
             ExecuteTime: e.time,
             TestResult: e.status
             })
           });
           console.log("Number of failed tests(Test Suite Runs):", TestsFailed)
           SortResult.push({FailedTests: `${TestsFailed}`})
         }catch(e){console.log("Error while pushing to SortResult")}
    matchBuild--;
  }

  console.log("Sort Result:", SortResult)

}
