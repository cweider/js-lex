/*!

  Copyright (C) 2011 Chad Weider

  This software is provided 'as-is', without any express or implied warranty.
  In no event will the authors be held liable for any damages arising from the
  use of this software.

  Permission is granted to anyone to use this software for any purpose,
  including commercial applications, and to alter it and redistribute it
  freely, subject to the following restrictions:

  1. The origin of this software must not be misrepresented; you must not
     claim that you wrote the original software. If you use this software in a
     product, an acknowledgment in the product documentation would be
     appreciated but is not required.
  2. Altered source versions must be plainly marked as such, and must not be
     misrepresented as being the original software.
  3. This notice may not be removed or altered from any source distribution.

*/

var Lexer = require('lexer').Lexer;

var ESCAPES = {b: '\b', f: '\f', n: '\n', r: '\r', t: '\t'};
var RULES = [
    [/(?:"((?:\\.|[^"])*)"|'((?:\\.|[^'])*)')/, 'STRING'
    , function (token) {
        token.value = (token.match[1] || token.match[2] || '')
            .replace(/\\(?:u([0-9a-fA-F]{4})|x([0-9a-fA-F]{2})|([0-3][0-7]{0,2}|[0-7]{1,2})|(.))/g, function () {
              var match = arguments;
              var c;
              if (c = match[1] || match[2]) {
                return String.fromCharCode(parseInt(c, 16));
              } else if (c = match[3]) {
                return String.fromCharCode(parseInt(c, 8));
              } else {
                c = match[4];
                if (Object.prototype.hasOwnProperty.call(ESCAPES, c)) {
                  return ESCAPES[c];
                } else {
                  return c;
                }
              }
            });
      }]
  , [/null/, 'NULL'
    , function (token) {
        token.value = null;
      }]
  , [/true|false/, 'BOOL'
    , function (token) {
        token.value = token.match[0] == 'true';
      }]
  , [/([_a-zA-Z][_a-zA-Z0-9]*)\(/, 'FUNC'
    , function (token) {
        token.value = token.match[1];
      }]
  , [/[+-]?(?:(0x[0-9a-fA-F]+|0[0-7]+)|((?:[0-9]+(?:\.[0-9]*)?|\.[0-9]+)(?:[eE][+-]?[0-9]+)?|NaN|Infinity))/, 'NUM'
    , function (token) {
        if (token.match[1]) {
          token.value = parseInt(token.match[0]);
        } else {
          token.value = parseFloat(token.match[0]);
        }
      }]
  , [/\)/, 'RPAREN']
  , [/;/, 'SEMI']
  , [/,/, 'COMMA']
  , [/\s+/, null]
  ];

var lexer = undefined;
function lex(text) {
  if (!lexer) {
    lexer = new Lexer(RULES);
  }

  return lexer.lex(text);
}

function generate(tokens) {
  // A statement is made of FUNC (STRING (COMMA STRING)*)? RPAREN SEMICOLON
  var statements = [];

  var i = 0, ii = tokens.length;
  while (i < ii) {
    var token = tokens[i];

    if (token.type == 'FUNC') {
      var j = i + 1;
      var arguments = [];
      var token_ = tokens[j];
      while (j < ii
            && (token_.type == 'STRING'
                || token_.type == 'NUM'
                || token_.type == 'NULL'
                || token_.type == 'BOOL')) {
        arguments.push(token_.value);
        token_ = tokens[++j];
        if (j < ii && (token_.type == 'RPAREN' || token_.type != 'COMMA')) {
          break;
        }
        token_ = tokens[++j];
      }

      if (j >= ii || token_.type != 'RPAREN') {
        throw new Error(
            "Expected ')' instead found " + JSON.stringify(tokens_.match[0])
          + ".");
      }
      statements.push([token.value, arguments]);
      i = j + 1;
      continue;
    } else if (token.type == 'SEMI') {
      i++;
      continue;
    } else {
      throw new Error(
          "Unexpected token " + JSON.stringify(token.match[0]) + ".");
    }
  }

  if (i != ii) {
    throw new Error("Unexpected token, expected EOF.");
  }
  return statements;
}

var MiniScript = function (code) {
  this._code = code;
  this._tokens = lex(code);
  this._statements = generate(this._tokens);
};
MiniScript.prototype = new function () {
  function runInContext(sandbox) {
    var statements = this._statements;
    for (var i = 0, ii = statements.length; i < ii; i++) {
      var statement = statements[i];
      if (Object.prototype.hasOwnProperty.call(sandbox, statement[0])) {
        var method = sandbox[statement[0]];
        method.apply(sandbox, statement[1]);
      } else {
        throw new Error(
            "Method " + JSON.stringify(statement[0]) + " is not defined.");
      }
    }
  }
  this.runInContext = runInContext;
}();
MiniScript.runInContext = function (code, sandbox) {
  var script = new this(code);
  script.runInContext(sandbox);
};

exports.MiniScript = MiniScript;
