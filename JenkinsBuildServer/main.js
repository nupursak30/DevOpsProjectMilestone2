var Random = require('random-js')
    //marqdown = require('./marqdown.js'),
    fs = require('fs'),
    path = require('path'),
    slash = require('slash');
    dirRead = require('recursive-readdir-sync');
const child_process = require('child_process');
const iTrustfilepath =  slash('./src/main/java/edu/ncsu/csc/itrust2');
const randomFuzz = new Random(Random.engines.mt19937().autoSeed());
//let excludeLine = ['List\s<(.*)>','ArrayList\s<(.*)>','Class\s<(.*)>','Vector\s<(.*)>','Map\s<(.*)>','HashMap\s<(.*)>','Comparator\s<(.*)>','DomainObject\s<(.*)>','DomainClassConverter\s<(.*)>','Set\s<(.*)>'];
let excludeLine = ['->','List<(.*)>','ArrayList<(.*)>','Class<(.*)>','Vector<(.*)>','Map<(.*)>','HashMap<(.*)>','Comparator<(.*)>','DomainObject<(.*)>','DomainClassConverter<(.*)>','Set<(.*)>'];
// let bool_ex = false;

var fuzzer =
{
    // random : new Random(Random.engines.mt19937().autoSeed()),

    // seed: function (kernel)
    // {
    //     fuzzer.random = new Random(Random.engines.mt19937().seed(kernel));
    // },

    mutate:
    {
        string: function(val)
        {
            // MUTATE IMPLEMENTATION HERE
            //console.log("Array before split:", val)
            var array = val.split('\n');
            //console.log("Split Array:", array)
            array.forEach(function(element,index){
                let bool_ex = false;
                //Check whether "<" or ">" is a part of generic template or not. If yes, skip this line
                excludeLine.forEach(function (item){
                  //var regex = RegExp(item)
                  let exclude_match = RegExp(item).test(element);
                  if (exclude_match){
                    // console.log("EXCLUDING LINE PRESENT")
                    // console.log("EXCLUDED LINE:", element)
                    bool_ex = true;
                  }
                  })
                  do{
                    var splitEle = element.split(" ")

                    if(splitEle.includes(RegExp('[\\w|\\D]*')) && randomFuzz.bool(0.10)){

                        if(randomFuzz.bool(0.10) ){
                              //console.log("BEFORE EDIT:", element)
                              array[index] = splitEle.split("").reverse().join("")
                              //console.log("AFTER EDIT:", element)
                        }
                        if(randomFuzz.bool(0.15) ){
                            //console.log("BEFORE EDIT:", element)
                            array[index] = splitEle.slice(2, randomFuzz.integer(0, element.length))
                            //console.log("AFTER EDIT:", element)
                        }
                        if(randomFuzz.bool(0.05) ){
                            //console.log("BEFORE EDIT:", element)
                            array[index] = splitEle.replace(`${splitEle}`," ")
                            //console.log("AFTER EDIT:", element)
                          }
                        }


                    if(element.includes("<")){
                      if( randomFuzz.bool(0.25) ){
                        if (bool_ex){
                          // console.log("EXCLUDING LINE PRESENT")
                          // console.log("EXCLUDED LINE:", element)
                        } else{
                          // console.log("REPLACE < with >")
                          // console.log("LINE BEFORE EDIT:", element)
                          array[index] = element.replace(/</g,">")
                          // Replace "<" with ">"
                          // console.log("LINE AFTER EDIT:", array[index])
                        }
                        }
                    }

                    if(element.includes(">")){
                      if( randomFuzz.bool(0.10) ){
                        if (bool_ex){
                          // console.log("EXCLUDING LINE PRESENT")
                          // console.log("EXCLUDED LINE:", element)
                        } else{
                          // console.log("REPLACE > with <")
                          // console.log("LINE BEFORE EDIT:", element)
                          array[index] = element.replace(/>/g,"<")
                          // Replace ">" with "<"
                          // console.log("LINE AFTER EDIT:", array[index])
                        }
                        }
                    }

                    if (element.includes("==")){
                          if( randomFuzz.bool(0.15) )
                          {
                              //console.log("REPLACE == with !=")
                              array[index] = element.replace(/==/g,"!=")
                              // Replace "==" with "!="
                          }
                        }

                        if (element.includes("!=")){
                          if( randomFuzz.bool(0.15) )
                          {
                              //console.log("REPLACE != with ==")
                              array[index] = element.replace(/!=/g,"==")
                              // Replace "!=" with "=="
                          }
                        }

                        if (element.includes("0")){
                          if( randomFuzz.bool(0.05) )
                          {
                              //console.log("REPLACE 0 with 1")
                              array[index] = element.replace(/0/g,"1")
                              // Replace "0" with "1"
                          }
                        }

                        if (element.includes("1")){
                          if( randomFuzz.bool(0.05) )
                          {
                              //console.log("REPLACE 1 with 0")
                              array[index] = element.replace(/1/g,"0")
                              // Replace "0" with "1"
                          }
                        }
                  }while(randomFuzz.bool(0.30))

            })
            let newArray = array.join('\n');
            //console.log("ARRAY after split:", newArray)
            return newArray;


            //
            //     // delete random characters
            //     // if( randomFuzz.bool(0.25) )
            //     // {
            //     //     let RandomStart = randomFuzz.integer(0,array.length);
            //     //     let deleteSet = randomFuzz.integer(0,array.length);
            //     //     array.splice(RandomStart,deleteSet);
            //     //     //randomFuzz.integer(0,99)
            //     // }
            //     //
            //     // // add random characters
            //     // if( randomFuzz.bool(0.25) )
            //     // {
            //     //     let Start = randomFuzz.integer(0,array.length);
            //     //     let string = randomFuzz.string(10).split('');
            //     //     array.splice(Start,0,string);
            //     //     //randomFuzz.integer(0,99)
            //     // }
            //   } while(randomFuzz.bool(0.30));
            // })
            //
          }
      }
};

function main(fuzzing_dir){
  if( process.env.NODE_ENV != "test")
  {
      //fuzzer.seed(0);
      //let iTrustFiles = getFiles(iTrustfilepath);
      console.log("Fuzzing Path:", fuzzing_dir)
      let iTrustFiles = getFiles(fuzzing_dir);
      //console.log("Files:", iTrustFiles);
      console.log("LENGTH ORI:", iTrustFiles.length)



      //let sampleList = randomFuzz.sample(iTrustFiles, randomFuzz.integer(0, iTrustFiles.length));



      let RandomStart = randomFuzz.integer(0,iTrustFiles.length);
      let deleteSet = randomFuzz.integer(6,iTrustFiles.length);
      let sampleList = iTrustFiles.splice(RandomStart,deleteSet);


      //console.log("Sample Files:", sampleList);
      console.log("LENGTH SAMPLE:", sampleList.length)
      mutationTesting(sampleList);
  }
}

function getFiles(dir){
  let fileList = [];
  var files = dirRead(dir);
  //console.log("FILES GET FILES:",files)



  if (randomFuzz.bool(0.15)){
    console.log("INCLUDING ALL FILES")
    fileList = files.concat();
  } else{
    console.log("EXCLUDE MODELS")
    files.forEach(function (file){
      let model_match = RegExp("src/main/java/edu/ncsu/csc/itrust2/models/").test(file);
      // if (model_match){
      //   console.log("Removing model folder files", file)
      //   files.splice(files.indexOf(file), 1)
      // }

      if (!model_match){
        fileList.push(file);
      }
    })
  }



  // files.forEach(function (file){
  //   let model_match = RegExp("src/main/java/edu/ncsu/csc/itrust2/models/").test(file);
  //   // if (model_match){
  //   //   console.log("Removing model folder files", file)
  //   //   files.splice(files.indexOf(file), 1)
  //   // }
  //
  //   if (!model_match){
  //     fileList.push(file);
  //   }
  // })
  //console.log("FILES GET FILES:",fileList)
  return fileList;

  // for (var file in files){
  //   if(files[file].endsWith(".java")) {
  //       fileList.push(files[file]);
  //   }
  // }
  //console.log("FileList is:", fileList)


  // fileList = files.concat();
  // return fileList;
}

function mutationTesting(FuzzyList)
{
    //Do fuzzy operations for each file present in the Sample List
    FuzzyList.forEach(function(file) {
        //console.log ("FILE:",file)
        var fileRead = fs.readFileSync(slash(file),'utf-8');
        let editedFile = fuzzer.mutate.string(fileRead);
        let fileWrite = fs.writeFileSync(slash(file), editedFile, 'utf8')
    });
}



exports.mutationTesting = mutationTesting;
exports.fuzzer = fuzzer;
exports.main = main;
