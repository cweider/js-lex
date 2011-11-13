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

var Lexer = function (rules) {
  this._tokenRegExp = undefined;

  // Perform validation and freeze rules so there are no side-effects.
  this._rules = [];
  if (!rules || !rules.length) {
    throw new Error("Rules must be of type Array.");
  } else {
    for (var i = 0, ii = rules.length; i < ii; i++) {
      var rule = rules[i];
      if (!rule || !rule.length || rule.length > 3) {
        throw new Error("Invalid rule at index " + i + ".");
      }
      var expression = rule[0];
      if (!((expression instanceof RegExp)
          || (expression instanceof String))) {
        throw new Error("Expression must be an instance of RegExp or String"
          + " for rule at index " + i + ".");
      }
      // Prevent side-effects by taking string copy of RegExp. This also has
      // the benefit of stripping all modifiers from the RegExp.
      if (expression.source) {
        expression = expression.source;
      } else {
        expression = expression.replace(/[-*+?.,^$|#\[\]{}()\\]/g, '\\$1');
      }

      var type = rule[1];
      if ((typeof type != 'string' || type.length == 0)
        && type !== null) {
        throw new Error("Expected String or null instead found "
          + JSON.stringify(String(type))
          + " for type of rule at index " + i + ".");
      }
      var action = rule[2];
      if (action !== undefined
        && !(action instanceof Function)) {
        throw new Error("Constructor is defined, but is not a function for "
          + "rule at index " + i + ".");
      }
      this._rules[i] = [expression, type, action];
    }
  }
};
Lexer.prototype = new function () {
  this._compile = function () {
    if (!this._tokenRegExp) {
      var tokenExpressions = [];
      var rules = this._rules;
      for (var i = 0, ii = rules.length; i < ii; i++) {
        var rule = rules[i];
        var expression = rule[0];

        // How many captures does this expression have?
        var captureCount = 1;
        for (var j = 0, jj = expression.length; j < jj; j++) {
          var char = expression.charAt(j);
          if (char == '\\') {
            j++;
          } else if (char == '(' && expression.charAt(j+1) != '?') {
            captureCount++;
            j += 2;
          }
        }
        rule[3] = captureCount;

        tokenExpressions.push(expression);
      }
      this._tokenRegExp =
        new RegExp('(' + tokenExpressions.join(')|(') + ')', 'g');
    }

    return this._tokenRegExp;
  };
  this.lex = function (text) {
    if (typeof text != 'string') {
      throw new Error("Attempt to lex an Object that is not a String.");
    }

    var tokens = [];
    var tokenMatch;
    var tokenRegExp = this._compile();

    var index = 0;
    while (tokenMatch = tokenRegExp.exec(text)) {
      // Throw if character is skipped.
      if (tokenMatch.index != index) {
        throw new Error("Unexpected character found "
          + JSON.stringify(String(text.charAt(index))) + " at index "
          + index + ".");
      }
      index += tokenMatch[0].length;

      var token = {
          type: undefined
        , value: tokenMatch[0]
        , match: undefined
        , offset: index
        };

      // Do a linear search for the group that matched then look up its
      // corresponding token.
      var i = 1;
      var r = 0;
      var rules = this._rules;
      var rule = rules[r];
      while (!tokenMatch[i]) {
        i += rule[3];
        rule = rules[++r];
      }
      token.type = rule[1];
      token.match = tokenMatch.slice(i, i+rule[3]);
      token.match[rule[3]-1] = token.match[rule[3]-1]; // Expected length
      if (rule[2]) {
        rule[2].call(this, token);
      }

      // Throw an exception rather than enter an infinite loop.
      if (tokenMatch[0].length == 0) {
        throw new Error(
          "Rule at index " + i + " matched the empty string.");
      }

      // If the type is null then token will be thrown away.
      if (token.type) {
        tokens.push(token);
      }
    }

    // Throw if all input isn't consumed.
    if (text.length != index) {
      throw new Error("Unexpected character found "
        + JSON.stringify(String(text.charAt(index))) + " at index "
        + index + ".");
    }

    return tokens;
  };
};

exports.Lexer = Lexer;
