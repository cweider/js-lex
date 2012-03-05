require.paths.unshift(require('path').join(__dirname, '/../'));
var MiniScript = require('../examples/mini_script').MiniScript;

var assertObjectsEqual = function (one, two) {
  for (var key in one) {
    if (typeof one[key] != typeof two[key]) {
      throw new Error("Not equal!");
    }

    if (typeof one[key] == 'object') {
      assertObjectsEqual(one[key], two[key]);
    } else if (typeof one[key] == 'number') {
      if (typeof two[key] != 'number' ||
          isNaN(one[key]) != isNaN(two[key]) ||
          (!isNaN(one[key]) && one[key] != two[key])
          ) {
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
assertObjectsEqual((new MiniScript('aMethod("aMethod(\\" \\ \\")")'))._statements, [['aMethod', ['aMethod("  ")']]]);
assertObjectsEqual((new MiniScript('aMethod("\\b\\f\\n\\r\\t")'))._statements, [['aMethod', ['\b\f\n\r\t']]]);
assertObjectsEqual((new MiniScript('aMethod("\\u2026\\u202\\uz\u2026")'))._statements, [['aMethod', ['\u2026\u202\uz\u2026']]]);
assertObjectsEqual((new MiniScript('aMethod("\\xF\\xFF\\x0\\x00\\xz")'))._statements, [['aMethod', ['\xF\xFF\x0\x00\xz']]]);
assertObjectsEqual((new MiniScript('aMethod("\\0\\3\\4\\37\\38\\377\\378")'))._statements, [['aMethod', ['\0\3\4\37\38\377\378']]]);
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
assertObjectsEqual((new MiniScript('aMethod(1,+1,-1,1.001,.999,0xFF,0022,+Infinity,-Infinity,NaN,10e-10)'))._statements,
    [['aMethod', [1,+1,-1,1.001,.999,0xFF,0022,+Infinity,-Infinity,NaN,10e-10]]]
    );
assertObjectsEqual((new MiniScript('aMethod(true, false)'))._statements,
    [['aMethod', [true, false]]]
    );
expectException(function () {new MiniScript()})
expectException(function () {new MiniScript('aMethod(\u2026)')})
expectException(function () {new MiniScript('aMethod()a')})

console.log("All Good!")
