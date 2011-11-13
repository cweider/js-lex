var Lexer = require('../lexer').Lexer;

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

var assertStringEqual = function (one, two) {
  if (one != two) {
    throw new Error("Not equal! Expected:\n" + one + '\nGot:\n' + two);
  }
}

var lexer = new Lexer([
  [/(1)(.).+\2\1/, '1']
, [/(2)(?:\.)+\2\1/, '2']
, [/3(?=(3))(?!(3\.))+\2\1/, '2']
]);

lexer._compile();

assertStringEqual(
  /((1)(.).+\3\2)|((2)(?:\.)+2\5)|(3(?=(3))(?!(3\.))+\8\7)/g.source
, lexer._tokenRegExp.source);

console.log("All Good!")
