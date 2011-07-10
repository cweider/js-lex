# JS-Lex #

## What Is It? ##
A [lexer](http://en.wikipedia.org/wiki/Lexical_analysis) generator written in JavaScript that uses the language’s regular expression engine to perform its analysis.

## Usage ##
For anyone familiar with lex, flex, and friends the syntax is familiar enough. The following will create a lexer that will tokenize a JavaScript-like text. A full example can be found in the repository.

    var rules = [
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

    lexer = new Lexer(rules);

## Notes ##
At the moment, `Lexer` does not support macros (the definitions section for users of lex). There are also no guards on the regular expressions preventing the use of non-regular constructs (e.g. back references) that are exposed by the language; the generated lexer will not work properly of those are used.

## License ##
Released under zlib

    Copyright (C) 2010 Chad Weider

    This software is provided 'as-is', without any express or implied
    warranty. In no event will the authors be held liable for any damages
    arising from the use of this software.

    Permission is granted to anyone to use this software for any purpose,
    including commercial applications, and to alter it and redistribute it
    freely, subject to the following restrictions:

    1. The origin of this software must not be misrepresented; you must not
       claim that you wrote the original software. If you use this software in
       a product, an acknowledgment in the product documentation would be
       appreciated but is not required.
    2. Altered source versions must be plainly marked as such, and must not be
       misrepresented as being the original software.
    3. This notice may not be removed or altered from any source distribution.
