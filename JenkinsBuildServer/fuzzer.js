var path = require('path');
var slash = require('slash');
var git_info = require('git-rev-sync');
const git = require('simple-git');
const main = require('./main');
//const fs = require('fs');
const fs = require('fs-extra');
const child_process = require('child_process');
//const iTrustGit = "github.ncsu.edu/nsakhal2/iTrust2-v2.git"
const src_path = "iTrust2/src/main/java/edu/ncsu/csc/itrust2/"
var iterations = 3;
//let match_result = true;
//const username = 'nsakhal2';
//const password = ''
//var remote = `https://${username}:${password}@${iTrustGit}`;
//var remote = `https://${username}:${password}@${iTrustGit}`;
local = slash(__dirname);
const iTrustfolder = slash(`${local}/iTrust2-v2`);


console.log("iTrust folder:", iTrustfolder)

// if (fs.existsSync(iTrustfolder)){
//     console.log("Deleting previous iTrust git folder, if present")
//     fs.removeSync(iTrustfolder);
// }
// console.log ("Cloning iTrust git repo")
// child_process.execSync(`git clone ${remote}`, {
//         cwd: local
//     }).toString('utf8');

//List git branches
var branch_result = child_process.execSync(`git branch -a`, {
          cwd: iTrustfolder
      }).toString('utf8');
console.log("GIT BRANCHES:", branch_result)

//Delete remote and local fuzzer branch, if present
var fuzzerRegRemote = RegExp('remotes/origin/fuzzer')
var fuzzerRegLocal = RegExp('^(\\*\\sfuzzer)')
if (fuzzerRegRemote.test(branch_result)){
  console.log("Deleting fuzzer remote branch")
    child_process.execSync(`git push origin --delete fuzzer`, {
            cwd: iTrustfolder
        }).toString('utf8');
    console.log("Deleted fuzzer remote branch")
}

if (fuzzerRegLocal.test(branch_result)){
  console.log("Deleting fuzzer local branch")
    child_process.execSync(`git checkout master && git branch -D fuzzer`, {
            cwd: iTrustfolder
        }).toString('utf8');
    console.log("Deleted fuzzer local branch")
}

// Create a new fuzzer branch
console.log("Creating new fuzzer branch")
child_process.execSync(`git checkout -b fuzzer && git push origin fuzzer`, {
        cwd: iTrustfolder
    }).toString('utf8');


for (var i=iterations; i > 0; i--){
  try{
    var firstpull = child_process.execSync(`git pull origin fuzzer`, {
            cwd: `${iTrustfolder}`
        }).toString('utf8');
  }catch(e){console.log("First git pull failed:", e)}
  var retries = 10;
  // Get first commit ID of fuzzer branch
  let FirstcommitID = git_info.short(iTrustfolder)
  console.log("FIRST COMMIT ID:", FirstcommitID)

  do{
    const src_files_path = slash(`${iTrustfolder}/${src_path}`)
    console.log("ITRUST FILE PATH:", src_files_path)
    main.main(`${src_files_path}`);
    // Check for syntax errors

    //
    try{
      let copy_result = child_process.execSync(`cp pom.xml_NOPLUGIN pom.xml`, {
              cwd: `${iTrustfolder}/iTrust2`
          }).toString('utf8');
      console.log("Copied pom.xml")
    }catch(e){console.log("Error while copying pom.xml",e)}

    console.log("Do maven compile")
    let result = child_process.spawnSync('mvn', ['compile'], {
              cwd: `${iTrustfolder}/iTrust2`,
              encoding : 'utf8'
        });

    //console.log("MAVEN COMPILE RESULT:", result.stdout)

    var regex = RegExp('BUILD SUCCESS')
    let match_result = regex.test(result.stdout);
    console.log("MATCH RESULT", match_result)

    let gitBranch = git_info.branch(iTrustfolder);
    //console.log("CURRENT GIT BRANCH:", gitBranch);

    if (gitBranch == "fuzzer"){
    // var git_status = child_process.execSync(`git status`, {
    //           cwd: iTrustfolder
    //       }).toString('utf8');
    // console.log("GIT STATUS after fuzzing:", git_status)

        if (match_result){
          console.log("Maven build successful")

          //Pushing the changes made by fuzzing to the remote branch
          console.log("Pushing the commit")
          try{
            var gitcommit = child_process.execSync(`git pull origin fuzzer && git add *java && git commit -m "Commit after fuzzing" && git push origin fuzzer`, {
                    cwd: `${iTrustfolder}`
                }).toString('utf8');
          }catch(e){console.log("Error while commiting the changes", e)}

          // Get commit ID after fuzzing
          let postCommitID = git_info.short(iTrustfolder)
          console.log("COMMIT ID AFTER FUZZING:", postCommitID)

          // Copy edited files to Jenkins job location
          try{
            let copy_result = child_process.execSync(`rm -rf iTrust2/target && cp -R iTrust2/. /var/lib/jenkins/jobs/iTrustBuildJob/iTrust2/ `, {
                    cwd: `${iTrustfolder}`
                }).toString('utf8');
            console.log("Copied edited files to jenkins job location")
          }catch(e){console.log("Error while copying edited files to jenkins job location",e)}


          //Trigger a build
          try{
            let jenkins_ip = "localhost"
            let job_name = "iTrustBuildJob"
            var JenBuild = child_process.execSync(`curl http://${jenkins_ip}:8090/job/${job_name}/build?delay=0sec&PARAMETER=${postCommitID}`,{
              cwd: '.'
            })
            console.log("Triggering Jenkins build")
          }catch(e){console.log("Jenkins build Trigger failed", e)}


          // Reverting back to the first commit
          try{
            let gitRevert = child_process.execSync(`git revert HEAD && git push origin fuzzer`, {
                      cwd: iTrustfolder
                  }).toString('utf8');
            console.log("GIT REVERT OUTPUT:", gitRevert)
          }catch(e){
            console.log("Error while reverting the commit", e)
          }

          //console.log("COMMIT ID AFTER REVERT:", git_info.short(iTrustfolder))
          break;

          } else {
          try{
          let gitReset = child_process.execSync(`git reset --hard ${FirstcommitID}`, {
                      cwd: iTrustfolder
                  }).toString('utf8');
          }catch(e){console.log("Error while reseting the changes", e)}
           //console.log("GIT RESET OUTPUT:", gitReset)

           console.log("RESETING THE CHANGES:", git_info.short(iTrustfolder))

           // git_status = child_process.execSync(`git status`, {
           //           cwd: iTrustfolder
           //       }).toString('utf8');
           // console.log("GIT STATUS after RESET:", git_status)
         }
       }
     }while(retries > 0)
   }
