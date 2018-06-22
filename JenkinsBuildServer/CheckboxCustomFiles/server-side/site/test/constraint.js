// Core/NPM Modules
const esprima = require("esprima");
//const faker = require("faker");
const fs = require('fs');
const Random = require('random-js');
const _ = require('lodash');
const randexp = require('randexp');

// Set options
//faker.locale = "en";
const options = {
   tokens: true,
   tolerant: true,
   loc: true,
   range: true
};

// Create random generator engine
const engine = Random.engines.mt19937().autoSeed();

/**
 * Constraint class. Represents constraints on function call parameters.
 *
 * @property {String}                                                          ident      Identity of the parameter mapped to the constraint.
 * @property {String}                                                          expression Full expression string for a constraint.
 * @property {String}                                                          operator   Operator used in constraint.
 * @property {String|Number}                                                   value      Main constraint value.
 * @property {String|Number}                                                   altvalue   Constraint alternative value.
 * @property {String}                                                          funcName   Name of the function being constrained.
 * @property {'fileWithContent'|'fileExists'|'integer'|'string'|'phoneNumber'} kind       Type of the constraint.
 */
class Constraint {
   constructor(properties) {
      this.ident = properties.ident;
      this.expression = properties.expression;
      this.operator = properties.operator;
      this.value = properties.value;
      this.altvalue = properties.altvalue;
      this.funcName = properties.funcName;
      this.kind = properties.kind;
   }

}

/**
 * Generate function parameter constraints for an input file
 * and save them to the global functionConstraints object.
 *
 * @param   {String} filePath Path of the file to generate tests for.
 * @returns {Object}          Function constraints object.
 */
function constraints(filePath, functionConstraints) {

   // Initialize function constraints directory

   // Read input file and parse it with esprima.
   let buf = fs.readFileSync(filePath, "utf8");
   let result = esprima.parse(buf, options);
   // let funcName =0;
   let colObj = null;

   // Start traversing the root node
   traverse(result, function(node) {

      // If some node is a function declaration, parse it for potential constraints.
      if (node.type === 'ExpressionStatement') {

         let funcName = functionName(node, filePath);
         let params = ['colobj', 'dbtable', 'req', 'files'];
         let collectionlist = [];
         let reqlist = {};
         let altval = 1;
         functionConstraints[funcName] = {
            constraints: _.zipObject(params, _.map(params, () => [])),
            params: params
         };

         // Traverse function node.
         traverse(node, function(child) {
            //let params = node.params.map(function(p) {return p.name});

            if (child.type === "CallExpression" && child.callee.type == "MemberExpression") {

               if (child.callee.object.name == "app" && child.callee.property.name == "get") {
                  // Get expression from original source code:

                  // Get function name and arguments
                  funcName = child.arguments[0].value;
                  //let params = node.params.map(function(p) {return p.name});
                  // let funcName = functionName(node);
                  let params2 = ['class', 'method'];
                  // Initialize function constraints
                  functionConstraints[funcName] = {
                     constraints: _.zipObject(params2, _.map(params2, () => [])),
                     params: params2

                  };

                  // let expression = buf.substring(child.range[0], child.range[1]);
                  //console.log(params[0]);
                  //console.log(functionConstraints[funcName]);
                  if (child.arguments[2]) {
                     functionConstraints[funcName].constraints[params2[0]].push(new Constraint({
                        ident: params2[0],
                        value: child.arguments[2].object.name,
                        kind: "get"
                     }));
                     functionConstraints[funcName].constraints[params2[1]].push(new Constraint({
                        ident: params2[1],
                        value: child.arguments[2].property.name,
                        kind: "get"

                     }));
                  } else {
                     functionConstraints[funcName].constraints[params2[0]].push(new Constraint({
                        ident: params2[0],
                        value: child.arguments[1].object.name,
                        kind: "get"
                     }));
                     functionConstraints[funcName].constraints[params2[1]].push(new Constraint({
                        ident: params2[1],
                        value: child.arguments[1].property.name,
                        kind: "get"

                     }));
                  }

                  ;
               }
            }

            if (child.type === "CallExpression" && child.callee.type == "MemberExpression") {

               if (child.callee.object.name == "app" && child.callee.property.name == "post") {
                  // Get expression from original source code:
                  // Get function name and arguments
                  let funcName = child.arguments[0].value;
                  //let params = node.params.map(function(p) {return p.name});
                  // let funcName = functionName(node);
                  let params2 = ['class', 'method'];

                  //let params = node.params.map(function(p) {return p.name});

                  // Initialize function constraints
                  functionConstraints[funcName] = {
                     constraints: _.zipObject(params2, _.map(params2, () => [])),
                     params: params2

                  };

                  // let expression = buf.substring(child.range[0], child.range[1]);
                  //console.log(params[0]);
                  //console.log(functionConstraints[funcName]);
                  if (child.arguments[2]) {
                     functionConstraints[funcName].constraints[params2[0]].push(new Constraint({
                        ident: params2[0],
                        value: child.arguments[2].object.name,
                        kind: "post"
                     }));

                     functionConstraints[funcName].constraints[params2[1]].push(new Constraint({
                        ident: params2[1],
                        value: child.arguments[2].property.name,
                        kind: "post"

                     }));
                  } else {

                     if (child.arguments[1].object) {
                        functionConstraints[funcName].constraints[params2[0]].push(new Constraint({
                           ident: params2[0],
                           value: child.arguments[1].object.name,
                           kind: "post"
                        }));
                        functionConstraints[funcName].constraints[params2[1]].push(new Constraint({
                           ident: params2[1],
                           value: child.arguments[1].property.name,
                           kind: "post"

                        }));
                     }
                  };
               }
            }

            if (child.type === "ExpressionStatement" && child.expression.type == "CallExpression") {

               if (child.expression.callee.property && child.expression.callee.property.name == "collection" && child.expression.arguments[1].type == "FunctionExpression") {

                  colObj = child.expression.arguments[1].params[1].name
                  collectionlist.push(colObj);

                  // Get expression from original source code:
                  // Get function name and arguments
                  functionConstraints[funcName].constraints[params[1]].push(new Constraint({
                     ident: params[1],
                     value: child.expression.arguments[0].value,

                  }));;
               }
            }

            if (child.type === "ExpressionStatement" && child.expression.type == "CallExpression") {

               if (child.expression.callee.type == "MemberExpression" && collectionlist.includes(child.expression.callee.object.name)) {

                  var fun = child.expression.callee.property.name
                  // funcName = file.concat( ".",child.left.property.name) ;
                  // let funcName = child.left.property.name;
                  //let params = node.params.map(function(p) {return p.name});
                  // let funcName = functionName(node);

                  //console.log(funcName);
                  //let params = node.params.map(function(p) {return p.name});
                  altval = altval + 1;

                  functionConstraints[funcName].constraints[params[0]].push(new Constraint({
                     ident: params[0],
                     value: child.expression.callee.property.name,
                     altvalue: altval,
                  }));

                  ;
               }
            }
            if (child.type === "ExpressionStatement" && child.expression.type == "CallExpression") {

               if (child.expression.callee.type == "MemberExpression" && child.expression.callee.object.callee && child.expression.callee.object.callee.object && child.expression.callee.object.callee.object.name == colObj) {

                  var fun = child.expression.callee.property.name
                  // funcName = file.concat( ".",child.left.property.name) ;
                  // let funcName = child.left.property.name;
                  //let params = node.params.map(function(p) {return p.name});
                  // let funcName = functionName(node);

                  //console.log(funcName);
                  //let params = node.params.map(function(p) {return p.name});
                  altval = altval + 1;

                  functionConstraints[funcName].constraints[params[0]].push(new Constraint({
                     ident: params[0],
                     value: child.expression.callee.object.callee.property.name,
                     altvalue: altval,
                  }));

                  ;
               }
            }

            if (child.type == "VariableDeclaration" && child.declarations[0].type == "VariableDeclarator") {

               //  console.log("---------------------------------------");

               if (child.declarations[0].init.type == "MemberExpression" && child.declarations[0].init.object.type == "MemberExpression" && child.declarations[0].init.object.object.name == 'req') {
                  // console.log("hello");
                  // console.log(child.declarations[0].init.object.property.name +child.declarations[0].init.object.property.name);
                  reqlist[child.declarations[0].id.name] = child.declarations[0].init.property.name;
                  var val1 = ""
                  var val2 = "RESEARCH"
                  if (((child.declarations[0].init.property.name).toUpperCase()).indexOf('KIND') !== -1) {
                     val1 = "survey";
                     val2 = "dataStudy";
                  }

                  if (((child.declarations[0].init.property.name).toUpperCase()).indexOf('ID') !== -1) {
                     val1 = "000000010000000000000000";
                     val2 = "000000020000000000000000";
                  }

                  functionConstraints[funcName].constraints[params[2]].push(new Constraint({
                     ident: params[2],
                     value: val1,
                     altvalue: child.declarations[0].init.property.name,
                  }));
                  functionConstraints[funcName].constraints[params[2]].push(new Constraint({
                     ident: params[2],
                     value: val2,
                     altvalue: child.declarations[0].init.property.name,
                  }));
               }

               if (child.declarations[0].init.type == "CallExpression" && child.declarations[0].init.callee.type == "MemberExpression" && child.declarations[0].init.callee.object.name == 'JSON' && child.declarations[0].init.arguments && child.declarations[0].init.arguments[0].object && child.declarations[0].init.arguments[0].object.object.name == 'req') {
                  // console.log("hello");
                  var key = child.declarations[0].init.arguments[0].property.name;
                  var prm = {};
                  prm[key] = "test";
                  // console.log(child.declarations[0].init.object.property.name +child.declarations[0].init.object.property.name);
                  //reqlist[child.declarations[0].id.name]= child.declarations[0].arguments[0].property.name;
                  functionConstraints[funcName].constraints[params[2]].push(new Constraint({
                     ident: params[2],

                     value: JSON.stringify(prm),
                     altvalue: child.declarations[0].init.arguments[0].property.name,

                  }));
               }

            }

            if (child.type === "IfStatement" && child.test.type == "BinaryExpression" && reqlist[child.test.left.name]) {

               functionConstraints[funcName].constraints[params[2]].push(new Constraint({
                  ident: params[2],
                  value: child.test.right.value,
                  altvalue: reqlist[child.test.left.name],

               }));
               functionConstraints[funcName].constraints[params[2]].push(new Constraint({
                  ident: params[2],
                  value: "",
                  altvalue: reqlist[child.test.left.name],

               }));

            }

            if (child.type === "MemberExpression" && child.object.name == "req" && child.property.name == "files") {

               //params.push("files");

               functionConstraints[funcName].constraints[params[3]].push(new Constraint({
                  ident: params[3],
                  value: true

               }));

            }

         });
      }

   });

   // console.log( functionConstraints[funcName]);

   return functionConstraints;

}

/**
 * Traverse an object tree, calling the visitor at each
 * visited node.
 *
 * @param {Object}   object  Esprima node object.
 * @param {Function} visitor Visitor called at each node.
 */
function traverse(object, visitor) {

   // Call the visitor on the object
   visitor(object);

   // Traverse all children of object
   for (let key in object) {
      if (object.hasOwnProperty(key)) {
         let child = object[key];
         if (typeof child === 'object' && child !== null) {
            traverse(child, visitor);
         }
      }
   }
}

/**
 * Return the name of a function node.
 */
function functionName(node, filePath) {
   var file = (filePath.split('\\').pop().split('/').pop()).split('.')[0];
   //console.log(node.expression.property ? file.concat( ".",node.expression.left.property.name) : '');
   if (node.expression != null && node.expression.left != null && node.expression.left.property != null) {
      //  console.log(node.expression.left.property.name);
      return file.concat(".", node.expression.left.property.name);
   } else {
      return '';
   }
   //return node.expression.left.property ? node.expression.left.property.name : '';
}

/**
 * Generates an integer value based on some constraint.
 *
 * @param   {Number}  constraintValue Constraint integer.
 * @param   {Boolean} greaterThan     Whether or not the concrete integer is greater than the constraint.
 * @returns {Number}                  Integer satisfying constraints.
 */
function createConcreteIntegerValue(constraintValue, greaterThan) {
   if (greaterThan) return Random.integer(constraintValue + 1, constraintValue + 10)(engine);
   else return Random.integer(constraintValue - 10, constraintValue - 1)(engine);
}

// Export
module.exports = constraints;
