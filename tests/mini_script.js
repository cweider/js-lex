require.paths.unshift(require('path').join(__dirname, '/../'));
var MiniScript = require('../examples/mini_script').MiniScript;

var assertObjectsEqual = function (one, two) {
  for (var key in one) {
    if (typeof one[key] != typeof two[key]) {
      throw new Error("Not equal!");
    }

    if (typeof one[key] == 'object') {
      assertObjectsEqual(one[key], two[key]);
    } else if (isNaN(one[key])) {
      if (!isNaN(two[key])) {
        throw new Error("Not equal!");
      }
    } else {
      if (one[key] !== two[key]) {
        throw new Error("Not equal!");
      }
    }
  }
}

var expectException = function (func) {
  var gotException = false;
  try {
    func();
  } catch (e) {
    gotException = true;
  }
  if (!gotException) {
    throw new Error("I wanted an exception!");
  }
}

assertObjectsEqual((new MiniScript('aMethod()'))._statements, [['aMethod', []]]);
assertObjectsEqual((new MiniScript('aMethod("")'))._statements, [['aMethod', ['']]]);
assertObjectsEqual((new MiniScript('aMethod("aMethod(\\"\\")")'))._statements, [['aMethod', ['aMethod("")']]]);
assertObjectsEqual((new MiniScript('aMethod("aMethod(\\" \\ \\")")'))._statements, [['aMethod', ['aMethod(" \\ ")']]]);
assertObjectsEqual((new MiniScript('aMethod1("aMethod(1);"); aMethod2("aMethod(2);")'))._statements,
    [['aMethod1', ['aMethod(1);']],['aMethod2', ['aMethod(2);']]]
    );
assertObjectsEqual((new MiniScript('aMethod1("aMethod(1);");aMethod2("aMethod(2);")'))._statements,
    [['aMethod1', ['aMethod(1);']],['aMethod2', ['aMethod(2);']]]
    );
assertObjectsEqual((new MiniScript('aMethod(\"aMethod(1)aMethod(2)\")'))._statements,
    [['aMethod', ['aMethod(1)aMethod(2)']]]
    );
assertObjectsEqual((new MiniScript('aMethod(\"aMethod(1)\",\"aMethod(2)\")'))._statements,
    [['aMethod', ['aMethod(1)','aMethod(2)']]]
    );
assertObjectsEqual((new MiniScript('_aMethod(\"aMethod(1)\",\"aMethod(2)\")'))._statements,
    [['_aMethod', ['aMethod(1)','aMethod(2)']]]
    );
assertObjectsEqual((new MiniScript('aMethod(1,+1,-1,1.001,.999,0xFF,0022,+Infinity,-Infinity,NaN)'))._statements,
    [['aMethod', [1,+1,-1,1.001,.999,0xFF,0022,+Infinity,-Infinity,NaN]]]
    );
expectException(function () {new MiniScript()})
expectException(function () {new MiniScript('aMethod(\u2026)')})
expectException(function () {new MiniScript('aMethod()a')})

console.log("All Good!")