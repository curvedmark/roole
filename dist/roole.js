/*
 * Roole - A language that compiles to CSS v0.5.0-dev
 * http://roole.org
 *
 * Copyright 2012 Glen Huang
 * Released under the MIT license
 */
var roole = (function() {
'use strict';

/**
 * Helper
 *
 * A collection of general utility functions used by other modules.
 */
var _ = {};

_.noop = function() {};

_.mixin = function(target) {
	for (var i = 1, len = arguments.length; i < len; ++i) {
		var obj = arguments[i];
		mixin(target, obj);
	}
	return target;
};

function mixin(target, obj) {
	for (var k in obj) {
		if (obj.hasOwnProperty(k) && obj[k] !== undefined) {
			target[k] = obj[k];
		}
	}
	return target;
}

_.capitalize = function(string) {
	return string.charAt(0).toUpperCase() + string.substr(1);
};

// shallow flatten
_.flatten = function(array) {
	var flattenedArray = [];

	array.forEach(function(item) {
		if (Array.isArray(item)) {
			flattenedArray = flattenedArray.concat(item);
		} else {
			flattenedArray.push(item);
		}
	});

	return flattenedArray;
};

_.intersect = function(arr1, arr2) {
	return arr1.filter(function(item) {
		return arr2.indexOf(item) !== -1;
	});
};

_.dirname = function(path) {
	if (!path) {
		return '.';
	}

	var parts = path.split('/');
	parts.pop();
	return parts.join('/') || '.';
};

_.joinPaths = function(path1, path2) {
	return _.normalizePath(path1 + '/' + path2);
};

_.normalizePath = function (path) {
	var parts = path.split('/').filter(function(p) {
		return p;
	});

	var i = parts.length;
	var up = 0;
	var last;

	while (--i >= 0) {
		last = parts[i];

		if (last === '.') {
			parts.splice(i, 1);
		} else if (last === '..') {
			parts.splice(i, 1);
			++up;
		} else if (up) {
			parts.splice(i, 1);
			--up;
		}
	}

	return parts.join('/');
};

/**
 * Err
 *
 * Thin wrapper around Error to add meta info to the error instance.
 */
/* exported Err */

var Err = function(message, node) {
	var error = new Error(message);
	error.loc = node.loc;
	return error;
};

/**
 * Node
 *
 * A collection of node utility functions.
 */
var Node = function(type, children, properties) {
	if (!Array.isArray(children)) {
		properties = children;
		children = null;
	}

	var node = properties || {};
	if (children) { node.children = children; }
	node.type = type;

	return node;
};

Node.clone = function(node, deep) {
	if (Array.isArray(node)) {
		return node.map(function(node) {
			return Node.clone(node);
		});
	}

	if (node === null || typeof node !== 'object') {
		return node;
	}

	var clone = Object.create(node);

	if ((deep == null || deep) && node.children) {
		clone.children = Node.clone(node.children);
	}

	return clone;
};

Node.replace = function(newNode, oldNode) {
	for (var key in newNode) {
		oldNode[key] = newNode[key];
	}

	return oldNode;
};

Node.equal = function(node1, node2) {
	if (Array.isArray(node1) || Array.isArray(node2)) {
		if (!Array.isArray(node1) || !Array.isArray(node2)) {
			return false;
		}

		if (node1.length !== node2.length) {
			return false;
		}

		return node1.every(function(childNode1, i) {
			var childNode2 = node2[i];
			return Node.equal(childNode1, childNode2);
		});
	}

	if (node1 === null ||
	    typeof node1 !== 'object' ||
	    node2 === null ||
	    typeof node2 !== 'object'
	) {
		return node1 === node2;
	}

	if (node1.type !== node2.type) {
		return false;
	}

	if (!node1.children && !node2.children) {
		return true;
	}

	if (!node1.children || !node2.children) {
		return false;
	}

	return Node.equal(node1.children, node2.children);
};

Node.toNumber = function(node) {
	switch (node.type) {
	case 'number':
	case 'percentage':
	case 'dimension':
		return node.children[0];

	default:
		return null;
	}
};

Node.toString = function(node) {
	if (typeof node === 'string') {
		return node;
	}

	switch (node.type) {
	case 'number':
		return '' + node.children[0];

	case 'identifier':
	case 'string':
		return '' + node.children[0];

	case 'percentage':
	case 'dimension':
		return node.children[0] + node.children[1];

	default:
		return null;
	}
};

Node.toBoolean = function(node) {
	switch (node.type) {
	case 'boolean':
		return node.children[0];

	case 'number':
	case 'percentage':
	case 'dimension':
		return !!node.children[0];

	case 'identifier':
	case 'string':
		return node.children.length !== 1 || !!node.children[0];
	}

	return true;
};

Node.toListNode = function(node) {
	switch (node.type) {
	case 'range':
		var fromNode = node.children[0];
		var fromNumber = fromNode.children[0];

		var operator = node.children[1];
		var exclusive = operator === '...';

		var toNode = node.children[2];
		var toNumber = toNode.children[0];

		var stepNumber = fromNumber <= toNumber ? 1 : -1;

		if (exclusive) {
			if (fromNumber === toNumber) {
				return Node('null', {loc: node.loc});
			}

			toNumber -= stepNumber;
		}

		var fromNode = node.children[0];
		var itemNodes = [];
		var separatorNode;

		for (
			var i = fromNumber;
			stepNumber > 0 ? i <= toNumber : i >= toNumber;
			i += stepNumber
		) {
			if (i !== fromNumber) {
				if (!separatorNode) { separatorNode = Node('separator', [' '], {loc: node.loc}); }
				itemNodes.push(separatorNode);
			}

			var fromClone = Node.clone(fromNode);
			fromClone.children[0] = i;
			itemNodes.push(fromClone);
		}

		if (itemNodes.length === 1) {
			return itemNodes[0];
		}

		return Node('list', itemNodes, {loc: node.loc});

	case 'argumentList':
		if (!node.children.length) {
			return Node('null', {loc: node.loc});
		}

		var listNode = Node('list', [node.children[0]], {loc: node.loc});
		for (var i = 1, length = node.children.length; i < length; ++i) {
			var separatorNode = Node('separator', [','], {loc: node.loc});
			listNode.children.push(separatorNode, node.children[i]);
		}

		return listNode;
	}

	return node;
};

/**
 * Generated Parser
 *
 * Parse the input code.
 */
var generatedParser = (function() {
  /*
   * Generated by PEG.js 0.7.0.
   *
   * http://pegjs.majda.cz/
   */

  function peg$subclass(child, parent) {
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
  }

  function SyntaxError(expected, found, offset, line, column) {
    function buildMessage(expected, found) {
      function stringEscape(s) {
        function hex(ch) { return ch.charCodeAt(0).toString(16).toUpperCase(); }

        return s
          .replace(/\\/g,   '\\\\')
          .replace(/"/g,    '\\"')
          .replace(/\x08/g, '\\b')
          .replace(/\t/g,   '\\t')
          .replace(/\n/g,   '\\n')
          .replace(/\f/g,   '\\f')
          .replace(/\r/g,   '\\r')
          .replace(/[\x00-\x07\x0B\x0E\x0F]/g, function(ch) { return '\\x0' + hex(ch); })
          .replace(/[\x10-\x1F\x80-\xFF]/g,    function(ch) { return '\\x'  + hex(ch); })
          .replace(/[\u0180-\u0FFF]/g,         function(ch) { return '\\u0' + hex(ch); })
          .replace(/[\u1080-\uFFFF]/g,         function(ch) { return '\\u'  + hex(ch); });
      }

      var expectedDesc, foundDesc;

      switch (expected.length) {
        case 0:
          expectedDesc = "end of input";
          break;

        case 1:
          expectedDesc = expected[0];
          break;

        default:
          expectedDesc = expected.slice(0, -1).join(", ")
            + " or "
            + expected[expected.length - 1];
      }

      foundDesc = found ? "\"" + stringEscape(found) + "\"" : "end of input";

      return "Expected " + expectedDesc + " but " + foundDesc + " found.";
    }

    this.expected = expected;
    this.found    = found;
    this.offset   = offset;
    this.line     = line;
    this.column   = column;

    this.name     = "SyntaxError";
    this.message  = buildMessage(expected, found);
  }

  peg$subclass(SyntaxError, Error);

  function parse(input) {
    var options = arguments.length > 1 ? arguments[1] : {},

        peg$startRuleFunctions = { root: peg$parseroot, selector: peg$parseselector, mediaQuery: peg$parsemediaQuery },
        peg$startRuleFunction  = peg$parseroot,

        peg$c0 = null,
        peg$c1 = "",
        peg$c2 = function(c) {return Node('comment', [c], {loc: loc()});},
        peg$c3 = function(r) {return r;},
        peg$c4 = function(comment, rules) {
        		if (!rules) rules = [];
        		if (comment) rules.unshift(comment);
        		return Node('root', rules, {loc: loc()});
        	},
        peg$c5 = [],
        peg$c6 = function(first, rest) {
        		rest.unshift(first);
        		return rest;
        	},
        peg$c7 = function(selectorList, ruleList) {
        		return Node('ruleset', [selectorList, ruleList], {loc: loc()});
        	},
        peg$c8 = ",",
        peg$c9 = "\",\"",
        peg$c10 = function(s) {return s;},
        peg$c11 = function(first, rest) {
        		rest.unshift(first);
        		return Node('selectorList', rest, {loc: loc()});
        	},
        peg$c12 = function(c) {return c;},
        peg$c13 = function(combinator, compoundSelector) {
        		if (combinator) compoundSelector.unshift(combinator);
        		return Node('selector', compoundSelector, {loc: loc()});
        	},
        peg$c14 = function(c, s) {s.unshift(c); return s;},
        peg$c15 = function(first, rest) {
        		if (rest.length) rest = first.concat(_.flatten(rest));
        		else rest = first;

        		return rest;
        	},
        peg$c16 = function(nonSpaceCombinator) {
        		return nonSpaceCombinator;
        	},
        peg$c17 = /^[>+~]/,
        peg$c18 = "[>+~]",
        peg$c19 = function(value) {
        		return Node('combinator', [value], {loc: loc()});
        	},
        peg$c20 = function() {
        		return Node('combinator', [' '], {loc: loc()});
        	},
        peg$c21 = function(value) {
        		return Node('selectorInterpolation', [value], {loc: loc()});
        	},
        peg$c22 = function(value) {
        		return Node('typeSelector', [value], {loc: loc()});
        	},
        peg$c23 = "*",
        peg$c24 = "\"*\"",
        peg$c25 = function() {
        		return Node('universalSelector', {loc: loc()});
        	},
        peg$c26 = "&",
        peg$c27 = "\"&\"",
        peg$c28 = function(value) {
        		return Node('ampersandSelector', [value || null], {loc: loc()});
        	},
        peg$c29 = "#",
        peg$c30 = "\"#\"",
        peg$c31 = function(value) {
        		return Node('hashSelector', [value], {loc: loc()});
        	},
        peg$c32 = ".",
        peg$c33 = "\".\"",
        peg$c34 = function(value) {
        		return Node('classSelector', [value], {loc: loc()});
        	},
        peg$c35 = "[",
        peg$c36 = "\"[\"",
        peg$c37 = "^=",
        peg$c38 = "\"^=\"",
        peg$c39 = "$=",
        peg$c40 = "\"$=\"",
        peg$c41 = "*=",
        peg$c42 = "\"*=\"",
        peg$c43 = "~=",
        peg$c44 = "\"~=\"",
        peg$c45 = "|=",
        peg$c46 = "\"|=\"",
        peg$c47 = "=",
        peg$c48 = "\"=\"",
        peg$c49 = function(o, l) {return [o, l];},
        peg$c50 = "]",
        peg$c51 = "\"]\"",
        peg$c52 = function(name, rest) {
        		if (rest) rest.unshift(name);
        		else rest = [name];
        		return Node('attributeSelector', rest, {loc: loc()});
        	},
        peg$c53 = ":not",
        peg$c54 = "\":not\"",
        peg$c55 = function(arg) {
        		return Node('negationSelector', [arg], {loc: loc()});
        	},
        peg$c56 = "(",
        peg$c57 = "\"(\"",
        peg$c58 = ")",
        peg$c59 = "\")\"",
        peg$c60 = function(arg) {
        		return arg;
        	},
        peg$c61 = ":",
        peg$c62 = "\":\"",
        peg$c63 = function(doubled, name, arg) {
        		return Node('pseudoSelector', [name, arg || null], {doubled: !!doubled, loc: loc()});
        	},
        peg$c64 = function(a) {return a;},
        peg$c65 = function(first, rest) {
        		rest.unshift(first);
        		return Node('pseudoArgument', rest, {loc: loc()});
        	},
        peg$c66 = /^[\-+]/,
        peg$c67 = "[\\-+]",
        peg$c68 = "{",
        peg$c69 = "\"{\"",
        peg$c70 = "}",
        peg$c71 = "\"}\"",
        peg$c72 = function(rules) {
        		return Node('ruleList', rules || [], {loc: loc()});
        	},
        peg$c73 = function(r) {return r},
        peg$c74 = "!important",
        peg$c75 = "\"!important\"",
        peg$c76 = function(star, name, value, priority) {
        		if (star) {
        			if (name.type === 'identifier')
        				name.children.unshift(star);
        			else
        				name = Node('identifier', [star, name], {loc: loc()});
        		}
        		return Node('property', [name, value, priority || null], {loc: loc()});
        	},
        peg$c77 = ";",
        peg$c78 = "\";\"",
        peg$c79 = function(first, rest) {
        		rest = _.flatten(rest);
        		rest.unshift(first);
        		return Node('list', rest, {loc: loc()});
        	},
        peg$c80 = function(commaSeparator) {
        		return commaSeparator;
        	},
        peg$c81 = function(value) {
        		return Node('separator', [value], {loc: loc()});
        	},
        peg$c82 = "/",
        peg$c83 = "\"/\"",
        peg$c84 = function() {return ' '},
        peg$c85 = "or",
        peg$c86 = "\"or\"",
        peg$c87 = function(e) {return e;},
        peg$c88 = function(first, rest) {
        		var node = first;
        		rest.forEach(function(operand) {
        			node = Node('logical', [node, 'or', operand], {loc: loc()});
        		});
        		return node;
        	},
        peg$c89 = "and",
        peg$c90 = "\"and\"",
        peg$c91 = function(first, rest) {
        		var node = first;
        		rest.forEach(function(operand) {
        			node = Node('logical', [node, 'and', operand], {loc: loc()});
        		});
        		return node;
        	},
        peg$c92 = "isnt",
        peg$c93 = "\"isnt\"",
        peg$c94 = "is",
        peg$c95 = "\"is\"",
        peg$c96 = function(o) {return o;},
        peg$c97 = function(first, rest) {
        		var node = first;
        		rest.forEach(function(array) {
        			var operator = array[0];
        			var operand = array[1];
        			node = Node('equality', [node, operator, operand], {loc: loc()});
        		});
        		return node;
        	},
        peg$c98 = /^[<>]/,
        peg$c99 = "[<>]",
        peg$c100 = function(first, rest) {
        		var node = first;
        		rest.forEach(function(array) {
        			var operator = array[0];
        			var operand = array[1];
        			node = Node('relational', [node, operator, operand], {loc: loc()});
        		});
        		return node;
        	},
        peg$c101 = "..",
        peg$c102 = "\"..\"",
        peg$c103 = function(from, operator, to) {
        		return Node('range', [from, operator, to], {loc: loc()});
        	},
        peg$c104 = function(first, rest) {
        		var node = first;
        		rest.forEach(function(array) {
        			var operator = array[0];
        			var operand = array[1];
        			node = Node('arithmetic', [node, operator, operand], {loc: loc()});
        		})
        		return node;
        	},
        peg$c105 = /^[*%]/,
        peg$c106 = "[*%]",
        peg$c107 = function(first, rest) {
        		var node = first;
        		rest.forEach(function(array) {
        			var operator = array[0];
        			var operand = array[1];
        			node = Node('arithmetic', [node, operator, operand], {loc: loc()});
        		});
        		return node;
        	},
        peg$c108 = function(operator, operand) {
        		return Node('unary', [operator, operand], {loc: loc()});
        	},
        peg$c109 = function(value, argumentLists) {
        		var node = value;
        		argumentLists.forEach(function(argumentList) {
        			node = Node('call', [node, argumentList], {loc: loc()});
        		})
        		return node;
        	},
        peg$c110 = function(args) {
        		return Node('argumentList', args || [], {loc: loc()});
        	},
        peg$c111 = function(range) {
        		return range;
        	},
        peg$c112 = function(list) {
        		return list;
        	},
        peg$c113 = function(first, rest) {
        		if (Array.isArray(first)) {
        			rest = first.concat(rest);
        		} else {
        			rest.unshift(first);
        		}
        		return Node('identifier', rest, {loc: loc()});
        	},
        peg$c114 = function(value) {
        		return Node('identifier', [value], {loc: loc()});
        	},
        peg$c115 = "-",
        peg$c116 = "\"-\"",
        peg$c117 = function(dash, variable) {
        		return dash ? [dash, variable] : variable;
        	},
        peg$c118 = function(dash, interpolation) {
        		return dash ? [dash, interpolation] : interpolation;
        	},
        peg$c119 = function(values) {
        		return Node('identifier', values, {loc: loc()});
        	},
        peg$c120 = /^[_a-z]/i,
        peg$c121 = "[_a-z]i",
        peg$c122 = /^[\-_a-z0-9]/i,
        peg$c123 = "[\\-_a-z0-9]i",
        peg$c124 = function(variable) {
        		return variable;
        	},
        peg$c125 = "$",
        peg$c126 = "\"$\"",
        peg$c127 = function(value) {
        		return Node('variable', [value], {loc: loc()});
        	},
        peg$c128 = "'",
        peg$c129 = "\"'\"",
        peg$c130 = /^[^\n\r\f\\']/,
        peg$c131 = "[^\\n\\r\\f\\\\']",
        peg$c132 = "\\",
        peg$c133 = "\"\\\\\"",
        peg$c134 = "any character",
        peg$c135 = function(value) {
        		return Node('string', [value], {quote: "'", loc: loc()});
        	},
        peg$c136 = "\"",
        peg$c137 = "\"\\\"\"",
        peg$c138 = /^[^\n\r\f\\"{$]/,
        peg$c139 = "[^\\n\\r\\f\\\\\"{$]",
        peg$c140 = function(values) {
        		if (!values.length) values.push('');
        		return Node('string', values, {quote: '"', loc: loc()});
        	},
        peg$c141 = "%",
        peg$c142 = "\"%\"",
        peg$c143 = function(value) {
        		return Node('percentage', [value], {loc: loc()});
        	},
        peg$c144 = function(value, unit) {
        		return Node('dimension', [value, unit], {loc: loc()});
        	},
        peg$c145 = function(value) {
        		return Node('number', [value], {loc: loc()});
        	},
        peg$c146 = /^[0-9]/,
        peg$c147 = "[0-9]",
        peg$c148 = function(value) {
        		return +value
        	},
        peg$c149 = /^[0-9a-z]/i,
        peg$c150 = "[0-9a-z]i",
        peg$c151 = function(rgb) {
        		if (rgb.length !== 3 && rgb.length !== 6)
        			return

        		return Node('color', [rgb], {loc: loc()});
        	},
        peg$c152 = "@function",
        peg$c153 = "\"@function\"",
        peg$c154 = function(parameterList, ruleList) {
        		return Node('function', [parameterList, ruleList], {loc: loc()});
        	},
        peg$c155 = function(p) {return p;},
        peg$c156 = function(parameters, restParameter) {
        		if (restParameter) parameters.push(restParameter);
        		return Node('parameterList', parameters, {loc: loc()});
        	},
        peg$c157 = function(restParameter) {
        		var parameters = [];
        		if (restParameter) parameters.push(restParameter);
        		return Node('parameterList', parameters, {loc: loc()});
        	},
        peg$c158 = function(variable, value) {
        		return Node('parameter', [variable, value || null], {loc: loc()});
        	},
        peg$c159 = "...",
        peg$c160 = "\"...\"",
        peg$c161 = function(variable) {
        		return Node('restParameter', [variable], {loc: loc()});
        	},
        peg$c162 = "true",
        peg$c163 = "\"true\"",
        peg$c164 = function() {
        		return Node('boolean', [true], {loc: loc()});
        	},
        peg$c165 = "false",
        peg$c166 = "\"false\"",
        peg$c167 = function() {
        		return Node('boolean', [false], {loc: loc()});
        	},
        peg$c168 = "null",
        peg$c169 = "\"null\"",
        peg$c170 = function() {
        		return Node('null', {loc: loc()});
        	},
        peg$c171 = /^[\-+*\/?]/,
        peg$c172 = "[\\-+*\\/?]",
        peg$c173 = function(variable, operator, value) {
        		return Node('assignment', [variable, operator, value], {loc: loc()});
        	},
        peg$c174 = "@media",
        peg$c175 = "\"@media\"",
        peg$c176 = function(mediaQueryList, ruleList) {
        		return Node('media', [mediaQueryList, ruleList], {loc: loc()});
        	},
        peg$c177 = function(q) {return q;},
        peg$c178 = function(first, rest) {
        		rest.unshift(first);
        		return Node('mediaQueryList', rest, {loc: loc()});
        	},
        peg$c179 = function(m) {return m},
        peg$c180 = function(first, rest) {
        		rest.unshift(first);
        		return Node('mediaQuery', rest, {loc: loc()});
        	},
        peg$c181 = function(value) {
        		return Node('mediaInterpolation', [value], {loc: loc()});
        	},
        peg$c182 = "only",
        peg$c183 = "\"only\"",
        peg$c184 = "not",
        peg$c185 = "\"not\"",
        peg$c186 = function(m) {return m;},
        peg$c187 = function(modifier, value) {
        		return Node('mediaType', [modifier || null, value], {loc: loc()});
        	},
        peg$c188 = function(v) {return v;},
        peg$c189 = function(name, value) {
        		return Node('mediaFeature', [name, value || null], {loc: loc()});
        	},
        peg$c190 = "@extend",
        peg$c191 = "\"@extend\"",
        peg$c192 = function(selectorList) {
        		return Node('extend', [selectorList], {loc: loc()});
        	},
        peg$c193 = "@void",
        peg$c194 = "\"@void\"",
        peg$c195 = function(ruleList) {
        		return Node('void', [ruleList], {loc: loc()});
        	},
        peg$c196 = "@block",
        peg$c197 = "\"@block\"",
        peg$c198 = function(ruleList) {
        		return Node('block', [ruleList], {loc: loc()});
        	},
        peg$c199 = "@import",
        peg$c200 = "\"@import\"",
        peg$c201 = function(value, mediaQueryList) {
        		return Node('import', [value, mediaQueryList || null], {loc: loc()});
        	},
        peg$c202 = "url(",
        peg$c203 = "\"url(\"",
        peg$c204 = function(value) {
        		return Node('url', [value], {loc: loc()});
        	},
        peg$c205 = /^[!#$%&*-~]/,
        peg$c206 = "[!#$%&*-~]",
        peg$c207 = function(value) {
        		return value;
        	},
        peg$c208 = "@if",
        peg$c209 = "\"@if\"",
        peg$c210 = function(condition, consequence, alternative) {
        		return Node('if', [condition, consequence, alternative || null], {loc: loc()});
        	},
        peg$c211 = "@else",
        peg$c212 = "\"@else\"",
        peg$c213 = "if",
        peg$c214 = "\"if\"",
        peg$c215 = function(ruleList) {
        		return ruleList;
        	},
        peg$c216 = "@for",
        peg$c217 = "\"@for\"",
        peg$c218 = function(i) {return i},
        peg$c219 = "by",
        peg$c220 = "\"by\"",
        peg$c221 = "in",
        peg$c222 = "\"in\"",
        peg$c223 = function(value, index, step, list, ruleList) {
        		return Node('for', [value, index || null, step || null, list, ruleList], {loc: loc()});
        	},
        peg$c224 = "@mixin",
        peg$c225 = "\"@mixin\"",
        peg$c226 = function(name, argumentList) {
        		return Node('call', [name, argumentList], {mixin: true, loc: loc()});
        	},
        peg$c227 = "@return",
        peg$c228 = "\"@return\"",
        peg$c229 = function(list) {
        		return Node('return', [list], {loc: loc()});
        	},
        peg$c230 = "@",
        peg$c231 = "\"@\"",
        peg$c232 = /^[a-z_]/i,
        peg$c233 = "[a-z_]i",
        peg$c234 = /^[a-z0-9_]/i,
        peg$c235 = "[a-z0-9_]i",
        peg$c236 = "keyframes",
        peg$c237 = "\"keyframes\"",
        peg$c238 = function(prefix, name, keyframeList) {
        		return Node('keyframes', [prefix || null, name, keyframeList], {loc: loc()});
        	},
        peg$c239 = function(keyframeRules) {
        		return Node('keyframeList', keyframeRules || [], {loc: loc()});
        	},
        peg$c240 = function(k) {return k;},
        peg$c241 = function(first, rest) {
        		rest.unshift(first);
        		return rest
        	},
        peg$c242 = function(keyframeSelectorList, propertyList) {
        		return Node('keyframe', [keyframeSelectorList, propertyList], {loc: loc()});
        	},
        peg$c243 = function(first, rest) {
        		rest.unshift(first);
        		return Node('keyframeSelectorList', rest, {loc: loc()});
        	},
        peg$c244 = "from",
        peg$c245 = "\"from\"",
        peg$c246 = "to",
        peg$c247 = "\"to\"",
        peg$c248 = function(value) {
        		return Node('keyframeSelector', [value], {loc: loc()});
        	},
        peg$c249 = function(p) {return p},
        peg$c250 = function(propertyRules) {
        		return Node('ruleList', propertyRules || [], {loc: loc()});
        	},
        peg$c251 = "@font-face",
        peg$c252 = "\"@font-face\"",
        peg$c253 = function(propertyList) {
        		return Node('fontFace', [propertyList], {loc: loc()});
        	},
        peg$c254 = "@module",
        peg$c255 = "\"@module\"",
        peg$c256 = "with",
        peg$c257 = "\"with\"",
        peg$c258 = function(name, separator, ruleList) {
        		return Node('module', [name, separator || null, ruleList], {loc: loc()});
        	},
        peg$c259 = "@page",
        peg$c260 = "\"@page\"",
        peg$c261 = function(i) {return i;},
        peg$c262 = function(name, propertyList) {
        		return Node('page', [name || null, propertyList], {loc: loc()});
        	},
        peg$c263 = "@charset",
        peg$c264 = "\"@charset\"",
        peg$c265 = function(value) {
        		return Node('charset', [value], {loc: loc()});
        	},
        peg$c266 = /^[ \t\r\n\f]/,
        peg$c267 = "[ \\t\\r\\n\\f]",
        peg$c268 = "//",
        peg$c269 = "\"//\"",
        peg$c270 = /^[^\r\n\f]/,
        peg$c271 = "[^\\r\\n\\f]",
        peg$c272 = "/*",
        peg$c273 = "\"/*\"",
        peg$c274 = /^[^*]/,
        peg$c275 = "[^*]",
        peg$c276 = /^[^\/]/,
        peg$c277 = "[^\\/]",
        peg$c278 = "*/",
        peg$c279 = "\"*/\"",
        peg$c280 = "\r\n",
        peg$c281 = "\"\\r\\n\"",
        peg$c282 = /^[\n\r\f]/,
        peg$c283 = "[\\n\\r\\f]",

        peg$currPos          = 0,
        peg$reportedPos      = 0,
        peg$cachedPos        = 0,
        peg$cachedPosDetails = { line: 1, column: 1, seenCR: false },
        peg$maxFailPos       = 0,
        peg$maxFailExpected  = [],
        peg$silentFails      = 0,

        peg$result;

    if ("startRule" in options) {
      if (!(options.startRule in peg$startRuleFunctions)) {
        throw new Error("Can't start parsing from rule \"" + options.startRule + "\".");
      }

      peg$startRuleFunction = peg$startRuleFunctions[options.startRule];
    }

    function text() {
      return input.substring(peg$reportedPos, peg$currPos);
    }

    function offset() {
      return peg$reportedPos;
    }

    function line() {
      return peg$computePosDetails(peg$reportedPos).line;
    }

    function column() {
      return peg$computePosDetails(peg$reportedPos).column;
    }

    function peg$computePosDetails(pos) {
      function advance(details, startPos, endPos) {
        var p, ch;

        for (p = startPos; p < endPos; p++) {
          ch = input.charAt(p);
          if (ch === "\n") {
            if (!details.seenCR) { details.line++; }
            details.column = 1;
            details.seenCR = false;
          } else if (ch === "\r" || ch === "\u2028" || ch === "\u2029") {
            details.line++;
            details.column = 1;
            details.seenCR = true;
          } else {
            details.column++;
            details.seenCR = false;
          }
        }
      }

      if (peg$cachedPos !== pos) {
        if (peg$cachedPos > pos) {
          peg$cachedPos = 0;
          peg$cachedPosDetails = { line: 1, column: 1, seenCR: false };
        }
        advance(peg$cachedPosDetails, peg$cachedPos, pos);
        peg$cachedPos = pos;
      }

      return peg$cachedPosDetails;
    }

    function peg$fail(expected) {
      if (peg$currPos < peg$maxFailPos) { return; }

      if (peg$currPos > peg$maxFailPos) {
        peg$maxFailPos = peg$currPos;
        peg$maxFailExpected = [];
      }

      peg$maxFailExpected.push(expected);
    }

    function peg$cleanupExpected(expected) {
      var i = 0;

      expected.sort();

      while (i < expected.length) {
        if (expected[i - 1] === expected[i]) {
          expected.splice(i, 1);
        } else {
          i++;
        }
      }
    }

    function peg$parseroot() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      s1 = peg$currPos;
      s2 = peg$parsemultiLineComment();
      if (s2 !== null) {
        peg$reportedPos = s1;
        s2 = peg$c2(s2);
      }
      if (s2 === null) {
        peg$currPos = s1;
        s1 = s2;
      } else {
        s1 = s2;
      }
      if (s1 === null) {
        s1 = peg$c1;
      }
      if (s1 !== null) {
        s2 = peg$parse_();
        if (s2 !== null) {
          s3 = peg$currPos;
          s4 = peg$parserootRules();
          if (s4 !== null) {
            s5 = peg$parse_();
            if (s5 !== null) {
              peg$reportedPos = s3;
              s4 = peg$c3(s4);
              if (s4 === null) {
                peg$currPos = s3;
                s3 = s4;
              } else {
                s3 = s4;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$c0;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$c0;
          }
          if (s3 === null) {
            s3 = peg$c1;
          }
          if (s3 !== null) {
            peg$reportedPos = s0;
            s1 = peg$c4(s1,s3);
            if (s1 === null) {
              peg$currPos = s0;
              s0 = s1;
            } else {
              s0 = s1;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parserootRules() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      s1 = peg$parserootRule();
      if (s1 !== null) {
        s2 = [];
        s3 = peg$currPos;
        s4 = peg$parse_();
        if (s4 !== null) {
          s5 = peg$parserootRule();
          if (s5 !== null) {
            peg$reportedPos = s3;
            s4 = peg$c3(s5);
            if (s4 === null) {
              peg$currPos = s3;
              s3 = s4;
            } else {
              s3 = s4;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$c0;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$c0;
        }
        while (s3 !== null) {
          s2.push(s3);
          s3 = peg$currPos;
          s4 = peg$parse_();
          if (s4 !== null) {
            s5 = peg$parserootRule();
            if (s5 !== null) {
              peg$reportedPos = s3;
              s4 = peg$c3(s5);
              if (s4 === null) {
                peg$currPos = s3;
                s3 = s4;
              } else {
                s3 = s4;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$c0;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$c0;
          }
        }
        if (s2 !== null) {
          peg$reportedPos = s0;
          s1 = peg$c6(s1,s2);
          if (s1 === null) {
            peg$currPos = s0;
            s0 = s1;
          } else {
            s0 = s1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parserootRule() {
      var s0;

      s0 = peg$parseruleset();
      if (s0 === null) {
        s0 = peg$parseassignment();
        if (s0 === null) {
          s0 = peg$parsemedia();
          if (s0 === null) {
            s0 = peg$parsevoid();
            if (s0 === null) {
              s0 = peg$parseblock();
              if (s0 === null) {
                s0 = peg$parseimport();
                if (s0 === null) {
                  s0 = peg$parseif();
                  if (s0 === null) {
                    s0 = peg$parsefor();
                    if (s0 === null) {
                      s0 = peg$parsemixin();
                      if (s0 === null) {
                        s0 = peg$parsekeyframes();
                        if (s0 === null) {
                          s0 = peg$parsefontFace();
                          if (s0 === null) {
                            s0 = peg$parsemodule();
                            if (s0 === null) {
                              s0 = peg$parsepage();
                              if (s0 === null) {
                                s0 = peg$parsecharset();
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }

      return s0;
    }

    function peg$parseruleset() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      s1 = peg$parseselectorList();
      if (s1 !== null) {
        s2 = peg$parse_();
        if (s2 !== null) {
          s3 = peg$parseruleList();
          if (s3 !== null) {
            peg$reportedPos = s0;
            s1 = peg$c7(s1,s3);
            if (s1 === null) {
              peg$currPos = s0;
              s0 = s1;
            } else {
              s0 = s1;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseselectorList() {
      var s0, s1, s2, s3, s4, s5, s6, s7;

      s0 = peg$currPos;
      s1 = peg$parseselector();
      if (s1 !== null) {
        s2 = [];
        s3 = peg$currPos;
        s4 = peg$parse_();
        if (s4 !== null) {
          if (input.charCodeAt(peg$currPos) === 44) {
            s5 = peg$c8;
            peg$currPos++;
          } else {
            s5 = null;
            if (peg$silentFails === 0) { peg$fail(peg$c9); }
          }
          if (s5 !== null) {
            s6 = peg$parse_();
            if (s6 !== null) {
              s7 = peg$parseselector();
              if (s7 !== null) {
                peg$reportedPos = s3;
                s4 = peg$c10(s7);
                if (s4 === null) {
                  peg$currPos = s3;
                  s3 = s4;
                } else {
                  s3 = s4;
                }
              } else {
                peg$currPos = s3;
                s3 = peg$c0;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$c0;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$c0;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$c0;
        }
        while (s3 !== null) {
          s2.push(s3);
          s3 = peg$currPos;
          s4 = peg$parse_();
          if (s4 !== null) {
            if (input.charCodeAt(peg$currPos) === 44) {
              s5 = peg$c8;
              peg$currPos++;
            } else {
              s5 = null;
              if (peg$silentFails === 0) { peg$fail(peg$c9); }
            }
            if (s5 !== null) {
              s6 = peg$parse_();
              if (s6 !== null) {
                s7 = peg$parseselector();
                if (s7 !== null) {
                  peg$reportedPos = s3;
                  s4 = peg$c10(s7);
                  if (s4 === null) {
                    peg$currPos = s3;
                    s3 = s4;
                  } else {
                    s3 = s4;
                  }
                } else {
                  peg$currPos = s3;
                  s3 = peg$c0;
                }
              } else {
                peg$currPos = s3;
                s3 = peg$c0;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$c0;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$c0;
          }
        }
        if (s2 !== null) {
          peg$reportedPos = s0;
          s1 = peg$c11(s1,s2);
          if (s1 === null) {
            peg$currPos = s0;
            s0 = s1;
          } else {
            s0 = s1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseselector() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      s1 = peg$currPos;
      s2 = peg$parsenonSpaceCombinator();
      if (s2 !== null) {
        s3 = peg$parse_();
        if (s3 !== null) {
          peg$reportedPos = s1;
          s2 = peg$c12(s2);
          if (s2 === null) {
            peg$currPos = s1;
            s1 = s2;
          } else {
            s1 = s2;
          }
        } else {
          peg$currPos = s1;
          s1 = peg$c0;
        }
      } else {
        peg$currPos = s1;
        s1 = peg$c0;
      }
      if (s1 === null) {
        s1 = peg$c1;
      }
      if (s1 !== null) {
        s2 = peg$parsecompoundSelector();
        if (s2 !== null) {
          peg$reportedPos = s0;
          s1 = peg$c13(s1,s2);
          if (s1 === null) {
            peg$currPos = s0;
            s0 = s1;
          } else {
            s0 = s1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsecompoundSelector() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      s1 = peg$parsesimpleSelector();
      if (s1 !== null) {
        s2 = [];
        s3 = peg$currPos;
        s4 = peg$parsecombinator();
        if (s4 !== null) {
          s5 = peg$parsesimpleSelector();
          if (s5 !== null) {
            peg$reportedPos = s3;
            s4 = peg$c14(s4,s5);
            if (s4 === null) {
              peg$currPos = s3;
              s3 = s4;
            } else {
              s3 = s4;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$c0;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$c0;
        }
        while (s3 !== null) {
          s2.push(s3);
          s3 = peg$currPos;
          s4 = peg$parsecombinator();
          if (s4 !== null) {
            s5 = peg$parsesimpleSelector();
            if (s5 !== null) {
              peg$reportedPos = s3;
              s4 = peg$c14(s4,s5);
              if (s4 === null) {
                peg$currPos = s3;
                s3 = s4;
              } else {
                s3 = s4;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$c0;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$c0;
          }
        }
        if (s2 !== null) {
          peg$reportedPos = s0;
          s1 = peg$c15(s1,s2);
          if (s1 === null) {
            peg$currPos = s0;
            s0 = s1;
          } else {
            s0 = s1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsecombinator() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      s1 = peg$parse_();
      if (s1 !== null) {
        s2 = peg$parsenonSpaceCombinator();
        if (s2 !== null) {
          s3 = peg$parse_();
          if (s3 !== null) {
            peg$reportedPos = s0;
            s1 = peg$c16(s2);
            if (s1 === null) {
              peg$currPos = s0;
              s0 = s1;
            } else {
              s0 = s1;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }
      if (s0 === null) {
        s0 = peg$parsespaceCombinator();
      }

      return s0;
    }

    function peg$parsenonSpaceCombinator() {
      var s0, s1;

      s0 = peg$currPos;
      if (peg$c17.test(input.charAt(peg$currPos))) {
        s1 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s1 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c18); }
      }
      if (s1 !== null) {
        peg$reportedPos = s0;
        s1 = peg$c19(s1);
      }
      if (s1 === null) {
        peg$currPos = s0;
        s0 = s1;
      } else {
        s0 = s1;
      }

      return s0;
    }

    function peg$parsespaceCombinator() {
      var s0, s1;

      s0 = peg$currPos;
      s1 = peg$parses();
      if (s1 !== null) {
        peg$reportedPos = s0;
        s1 = peg$c20();
      }
      if (s1 === null) {
        peg$currPos = s0;
        s0 = s1;
      } else {
        s0 = s1;
      }

      return s0;
    }

    function peg$parsesimpleSelector() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      s1 = peg$parsebaseSelector();
      if (s1 === null) {
        s1 = peg$parsesuffixSelector();
      }
      if (s1 !== null) {
        s2 = [];
        s3 = peg$parsesuffixSelector();
        while (s3 !== null) {
          s2.push(s3);
          s3 = peg$parsesuffixSelector();
        }
        if (s2 !== null) {
          peg$reportedPos = s0;
          s1 = peg$c6(s1,s2);
          if (s1 === null) {
            peg$currPos = s0;
            s0 = s1;
          } else {
            s0 = s1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsebaseSelector() {
      var s0;

      s0 = peg$parseselectorInterpolation();
      if (s0 === null) {
        s0 = peg$parsetypeSelector();
        if (s0 === null) {
          s0 = peg$parseuniversalSelector();
          if (s0 === null) {
            s0 = peg$parseampersandSelector();
          }
        }
      }

      return s0;
    }

    function peg$parsesuffixSelector() {
      var s0;

      s0 = peg$parsehashSelector();
      if (s0 === null) {
        s0 = peg$parseclassSelector();
        if (s0 === null) {
          s0 = peg$parseattributeSelector();
          if (s0 === null) {
            s0 = peg$parsenegationSelector();
            if (s0 === null) {
              s0 = peg$parsepseudoSelector();
            }
          }
        }
      }

      return s0;
    }

    function peg$parseselectorInterpolation() {
      var s0, s1;

      s0 = peg$currPos;
      s1 = peg$parsevariable();
      if (s1 !== null) {
        peg$reportedPos = s0;
        s1 = peg$c21(s1);
      }
      if (s1 === null) {
        peg$currPos = s0;
        s0 = s1;
      } else {
        s0 = s1;
      }

      return s0;
    }

    function peg$parsetypeSelector() {
      var s0, s1;

      s0 = peg$currPos;
      s1 = peg$parseidentifier();
      if (s1 !== null) {
        peg$reportedPos = s0;
        s1 = peg$c22(s1);
      }
      if (s1 === null) {
        peg$currPos = s0;
        s0 = s1;
      } else {
        s0 = s1;
      }

      return s0;
    }

    function peg$parseuniversalSelector() {
      var s0, s1;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 42) {
        s1 = peg$c23;
        peg$currPos++;
      } else {
        s1 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c24); }
      }
      if (s1 !== null) {
        peg$reportedPos = s0;
        s1 = peg$c25();
      }
      if (s1 === null) {
        peg$currPos = s0;
        s0 = s1;
      } else {
        s0 = s1;
      }

      return s0;
    }

    function peg$parseampersandSelector() {
      var s0, s1, s2;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 38) {
        s1 = peg$c26;
        peg$currPos++;
      } else {
        s1 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c27); }
      }
      if (s1 !== null) {
        s2 = peg$parsepartialIdentifier();
        if (s2 === null) {
          s2 = peg$c1;
        }
        if (s2 !== null) {
          peg$reportedPos = s0;
          s1 = peg$c28(s2);
          if (s1 === null) {
            peg$currPos = s0;
            s0 = s1;
          } else {
            s0 = s1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsehashSelector() {
      var s0, s1, s2;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 35) {
        s1 = peg$c29;
        peg$currPos++;
      } else {
        s1 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c30); }
      }
      if (s1 !== null) {
        s2 = peg$parseidentifier();
        if (s2 !== null) {
          peg$reportedPos = s0;
          s1 = peg$c31(s2);
          if (s1 === null) {
            peg$currPos = s0;
            s0 = s1;
          } else {
            s0 = s1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseclassSelector() {
      var s0, s1, s2;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 46) {
        s1 = peg$c32;
        peg$currPos++;
      } else {
        s1 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c33); }
      }
      if (s1 !== null) {
        s2 = peg$parseidentifier();
        if (s2 !== null) {
          peg$reportedPos = s0;
          s1 = peg$c34(s2);
          if (s1 === null) {
            peg$currPos = s0;
            s0 = s1;
          } else {
            s0 = s1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseattributeSelector() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 91) {
        s1 = peg$c35;
        peg$currPos++;
      } else {
        s1 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c36); }
      }
      if (s1 !== null) {
        s2 = peg$parse_();
        if (s2 !== null) {
          s3 = peg$parseidentifier();
          if (s3 !== null) {
            s4 = peg$currPos;
            s5 = peg$parse_();
            if (s5 !== null) {
              if (input.substr(peg$currPos, 2) === peg$c37) {
                s6 = peg$c37;
                peg$currPos += 2;
              } else {
                s6 = null;
                if (peg$silentFails === 0) { peg$fail(peg$c38); }
              }
              if (s6 === null) {
                if (input.substr(peg$currPos, 2) === peg$c39) {
                  s6 = peg$c39;
                  peg$currPos += 2;
                } else {
                  s6 = null;
                  if (peg$silentFails === 0) { peg$fail(peg$c40); }
                }
                if (s6 === null) {
                  if (input.substr(peg$currPos, 2) === peg$c41) {
                    s6 = peg$c41;
                    peg$currPos += 2;
                  } else {
                    s6 = null;
                    if (peg$silentFails === 0) { peg$fail(peg$c42); }
                  }
                  if (s6 === null) {
                    if (input.substr(peg$currPos, 2) === peg$c43) {
                      s6 = peg$c43;
                      peg$currPos += 2;
                    } else {
                      s6 = null;
                      if (peg$silentFails === 0) { peg$fail(peg$c44); }
                    }
                    if (s6 === null) {
                      if (input.substr(peg$currPos, 2) === peg$c45) {
                        s6 = peg$c45;
                        peg$currPos += 2;
                      } else {
                        s6 = null;
                        if (peg$silentFails === 0) { peg$fail(peg$c46); }
                      }
                      if (s6 === null) {
                        if (input.charCodeAt(peg$currPos) === 61) {
                          s6 = peg$c47;
                          peg$currPos++;
                        } else {
                          s6 = null;
                          if (peg$silentFails === 0) { peg$fail(peg$c48); }
                        }
                      }
                    }
                  }
                }
              }
              if (s6 !== null) {
                s7 = peg$parse_();
                if (s7 !== null) {
                  s8 = peg$parselist();
                  if (s8 !== null) {
                    peg$reportedPos = s4;
                    s5 = peg$c49(s6,s8);
                    if (s5 === null) {
                      peg$currPos = s4;
                      s4 = s5;
                    } else {
                      s4 = s5;
                    }
                  } else {
                    peg$currPos = s4;
                    s4 = peg$c0;
                  }
                } else {
                  peg$currPos = s4;
                  s4 = peg$c0;
                }
              } else {
                peg$currPos = s4;
                s4 = peg$c0;
              }
            } else {
              peg$currPos = s4;
              s4 = peg$c0;
            }
            if (s4 === null) {
              s4 = peg$c1;
            }
            if (s4 !== null) {
              s5 = peg$parse_();
              if (s5 !== null) {
                if (input.charCodeAt(peg$currPos) === 93) {
                  s6 = peg$c50;
                  peg$currPos++;
                } else {
                  s6 = null;
                  if (peg$silentFails === 0) { peg$fail(peg$c51); }
                }
                if (s6 !== null) {
                  peg$reportedPos = s0;
                  s1 = peg$c52(s3,s4);
                  if (s1 === null) {
                    peg$currPos = s0;
                    s0 = s1;
                  } else {
                    s0 = s1;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsenegationSelector() {
      var s0, s1, s2;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 4).toLowerCase() === peg$c53) {
        s1 = input.substr(peg$currPos, 4);
        peg$currPos += 4;
      } else {
        s1 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c54); }
      }
      if (s1 !== null) {
        s2 = peg$parsenegationArgumentList();
        if (s2 !== null) {
          peg$reportedPos = s0;
          s1 = peg$c55(s2);
          if (s1 === null) {
            peg$currPos = s0;
            s0 = s1;
          } else {
            s0 = s1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsenegationArgumentList() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 40) {
        s1 = peg$c56;
        peg$currPos++;
      } else {
        s1 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c57); }
      }
      if (s1 !== null) {
        s2 = peg$parse_();
        if (s2 !== null) {
          s3 = peg$parsenegationArgument();
          if (s3 !== null) {
            s4 = peg$parse_();
            if (s4 !== null) {
              if (input.charCodeAt(peg$currPos) === 41) {
                s5 = peg$c58;
                peg$currPos++;
              } else {
                s5 = null;
                if (peg$silentFails === 0) { peg$fail(peg$c59); }
              }
              if (s5 !== null) {
                peg$reportedPos = s0;
                s1 = peg$c60(s3);
                if (s1 === null) {
                  peg$currPos = s0;
                  s0 = s1;
                } else {
                  s0 = s1;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsenegationArgument() {
      var s0;

      s0 = peg$parseclassSelector();
      if (s0 === null) {
        s0 = peg$parsetypeSelector();
        if (s0 === null) {
          s0 = peg$parseattributeSelector();
          if (s0 === null) {
            s0 = peg$parsepseudoSelector();
            if (s0 === null) {
              s0 = peg$parsehashSelector();
              if (s0 === null) {
                s0 = peg$parseuniversalSelector();
              }
            }
          }
        }
      }

      return s0;
    }

    function peg$parsepseudoSelector() {
      var s0, s1, s2, s3, s4;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 58) {
        s1 = peg$c61;
        peg$currPos++;
      } else {
        s1 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c62); }
      }
      if (s1 !== null) {
        if (input.charCodeAt(peg$currPos) === 58) {
          s2 = peg$c61;
          peg$currPos++;
        } else {
          s2 = null;
          if (peg$silentFails === 0) { peg$fail(peg$c62); }
        }
        if (s2 === null) {
          s2 = peg$c1;
        }
        if (s2 !== null) {
          s3 = peg$parseidentifier();
          if (s3 !== null) {
            s4 = peg$parsepseudoArgumentList();
            if (s4 === null) {
              s4 = peg$c1;
            }
            if (s4 !== null) {
              peg$reportedPos = s0;
              s1 = peg$c63(s2,s3,s4);
              if (s1 === null) {
                peg$currPos = s0;
                s0 = s1;
              } else {
                s0 = s1;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsepseudoArgumentList() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 40) {
        s1 = peg$c56;
        peg$currPos++;
      } else {
        s1 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c57); }
      }
      if (s1 !== null) {
        s2 = peg$parse_();
        if (s2 !== null) {
          s3 = peg$parsepseudoArgument();
          if (s3 !== null) {
            s4 = peg$parse_();
            if (s4 !== null) {
              if (input.charCodeAt(peg$currPos) === 41) {
                s5 = peg$c58;
                peg$currPos++;
              } else {
                s5 = null;
                if (peg$silentFails === 0) { peg$fail(peg$c59); }
              }
              if (s5 !== null) {
                peg$reportedPos = s0;
                s1 = peg$c60(s3);
                if (s1 === null) {
                  peg$currPos = s0;
                  s0 = s1;
                } else {
                  s0 = s1;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsepseudoArgument() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      s1 = peg$parsepseudoElement();
      if (s1 !== null) {
        s2 = [];
        s3 = peg$currPos;
        s4 = peg$parse_();
        if (s4 !== null) {
          s5 = peg$parsepseudoElement();
          if (s5 !== null) {
            peg$reportedPos = s3;
            s4 = peg$c64(s5);
            if (s4 === null) {
              peg$currPos = s3;
              s3 = s4;
            } else {
              s3 = s4;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$c0;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$c0;
        }
        while (s3 !== null) {
          s2.push(s3);
          s3 = peg$currPos;
          s4 = peg$parse_();
          if (s4 !== null) {
            s5 = peg$parsepseudoElement();
            if (s5 !== null) {
              peg$reportedPos = s3;
              s4 = peg$c64(s5);
              if (s4 === null) {
                peg$currPos = s3;
                s3 = s4;
              } else {
                s3 = s4;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$c0;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$c0;
          }
        }
        if (s2 !== null) {
          peg$reportedPos = s0;
          s1 = peg$c65(s1,s2);
          if (s1 === null) {
            peg$currPos = s0;
            s0 = s1;
          } else {
            s0 = s1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsepseudoElement() {
      var s0;

      if (peg$c66.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c67); }
      }
      if (s0 === null) {
        s0 = peg$parsedimension();
        if (s0 === null) {
          s0 = peg$parsenumber();
          if (s0 === null) {
            s0 = peg$parsestring();
            if (s0 === null) {
              s0 = peg$parseidentifier();
            }
          }
        }
      }

      return s0;
    }

    function peg$parseruleList() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 123) {
        s1 = peg$c68;
        peg$currPos++;
      } else {
        s1 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c69); }
      }
      if (s1 !== null) {
        s2 = peg$parse_();
        if (s2 !== null) {
          s3 = peg$parserules();
          if (s3 === null) {
            s3 = peg$c1;
          }
          if (s3 !== null) {
            s4 = peg$parse_();
            if (s4 !== null) {
              if (input.charCodeAt(peg$currPos) === 125) {
                s5 = peg$c70;
                peg$currPos++;
              } else {
                s5 = null;
                if (peg$silentFails === 0) { peg$fail(peg$c71); }
              }
              if (s5 !== null) {
                peg$reportedPos = s0;
                s1 = peg$c72(s3);
                if (s1 === null) {
                  peg$currPos = s0;
                  s0 = s1;
                } else {
                  s0 = s1;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parserules() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      s1 = peg$parserule();
      if (s1 !== null) {
        s2 = [];
        s3 = peg$currPos;
        s4 = peg$parse_();
        if (s4 !== null) {
          s5 = peg$parserule();
          if (s5 !== null) {
            peg$reportedPos = s3;
            s4 = peg$c73(s5);
            if (s4 === null) {
              peg$currPos = s3;
              s3 = s4;
            } else {
              s3 = s4;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$c0;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$c0;
        }
        while (s3 !== null) {
          s2.push(s3);
          s3 = peg$currPos;
          s4 = peg$parse_();
          if (s4 !== null) {
            s5 = peg$parserule();
            if (s5 !== null) {
              peg$reportedPos = s3;
              s4 = peg$c73(s5);
              if (s4 === null) {
                peg$currPos = s3;
                s3 = s4;
              } else {
                s3 = s4;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$c0;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$c0;
          }
        }
        if (s2 !== null) {
          peg$reportedPos = s0;
          s1 = peg$c6(s1,s2);
          if (s1 === null) {
            peg$currPos = s0;
            s0 = s1;
          } else {
            s0 = s1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parserule() {
      var s0;

      s0 = peg$parseruleset();
      if (s0 === null) {
        s0 = peg$parseproperty();
        if (s0 === null) {
          s0 = peg$parseassignment();
          if (s0 === null) {
            s0 = peg$parseextend();
            if (s0 === null) {
              s0 = peg$parsemedia();
              if (s0 === null) {
                s0 = peg$parsevoid();
                if (s0 === null) {
                  s0 = peg$parseblock();
                  if (s0 === null) {
                    s0 = peg$parseimport();
                    if (s0 === null) {
                      s0 = peg$parseif();
                      if (s0 === null) {
                        s0 = peg$parsefor();
                        if (s0 === null) {
                          s0 = peg$parsemixin();
                          if (s0 === null) {
                            s0 = peg$parsereturn();
                            if (s0 === null) {
                              s0 = peg$parsekeyframes();
                              if (s0 === null) {
                                s0 = peg$parsemodule();
                                if (s0 === null) {
                                  s0 = peg$parsefontFace();
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }

      return s0;
    }

    function peg$parseproperty() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 42) {
        s1 = peg$c23;
        peg$currPos++;
      } else {
        s1 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c24); }
      }
      if (s1 === null) {
        s1 = peg$c1;
      }
      if (s1 !== null) {
        s2 = peg$parseidentifier();
        if (s2 !== null) {
          s3 = peg$parse_();
          if (s3 !== null) {
            if (input.charCodeAt(peg$currPos) === 58) {
              s4 = peg$c61;
              peg$currPos++;
            } else {
              s4 = null;
              if (peg$silentFails === 0) { peg$fail(peg$c62); }
            }
            if (s4 !== null) {
              s5 = peg$parse_();
              if (s5 !== null) {
                s6 = peg$parselist();
                if (s6 !== null) {
                  s7 = peg$parse_();
                  if (s7 !== null) {
                    if (input.substr(peg$currPos, 10) === peg$c74) {
                      s8 = peg$c74;
                      peg$currPos += 10;
                    } else {
                      s8 = null;
                      if (peg$silentFails === 0) { peg$fail(peg$c75); }
                    }
                    if (s8 === null) {
                      s8 = peg$c1;
                    }
                    if (s8 !== null) {
                      s9 = peg$parse_();
                      if (s9 !== null) {
                        s10 = peg$parsesemicolon();
                        if (s10 !== null) {
                          peg$reportedPos = s0;
                          s1 = peg$c76(s1,s2,s6,s8);
                          if (s1 === null) {
                            peg$currPos = s0;
                            s0 = s1;
                          } else {
                            s0 = s1;
                          }
                        } else {
                          peg$currPos = s0;
                          s0 = peg$c0;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$c0;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$c0;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c0;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsesemicolon() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      peg$silentFails++;
      if (input.charCodeAt(peg$currPos) === 125) {
        s1 = peg$c70;
        peg$currPos++;
      } else {
        s1 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c71); }
      }
      peg$silentFails--;
      if (s1 !== null) {
        peg$currPos = s0;
        s0 = peg$c1;
      } else {
        s0 = peg$c0;
      }
      if (s0 === null) {
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 59) {
          s1 = peg$c77;
          peg$currPos++;
        } else {
          s1 = null;
          if (peg$silentFails === 0) { peg$fail(peg$c78); }
        }
        if (s1 !== null) {
          s2 = [];
          s3 = peg$currPos;
          s4 = peg$parse_();
          if (s4 !== null) {
            if (input.charCodeAt(peg$currPos) === 59) {
              s5 = peg$c77;
              peg$currPos++;
            } else {
              s5 = null;
              if (peg$silentFails === 0) { peg$fail(peg$c78); }
            }
            if (s5 !== null) {
              s4 = [s4, s5];
              s3 = s4;
            } else {
              peg$currPos = s3;
              s3 = peg$c0;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$c0;
          }
          while (s3 !== null) {
            s2.push(s3);
            s3 = peg$currPos;
            s4 = peg$parse_();
            if (s4 !== null) {
              if (input.charCodeAt(peg$currPos) === 59) {
                s5 = peg$c77;
                peg$currPos++;
              } else {
                s5 = null;
                if (peg$silentFails === 0) { peg$fail(peg$c78); }
              }
              if (s5 !== null) {
                s4 = [s4, s5];
                s3 = s4;
              } else {
                peg$currPos = s3;
                s3 = peg$c0;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$c0;
            }
          }
          if (s2 !== null) {
            s1 = [s1, s2];
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      }

      return s0;
    }

    function peg$parselist() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      s1 = peg$parselogicalOr();
      if (s1 !== null) {
        s2 = [];
        s3 = peg$currPos;
        s4 = peg$parseseparator();
        if (s4 !== null) {
          s5 = peg$parselogicalOr();
          if (s5 !== null) {
            s4 = [s4, s5];
            s3 = s4;
          } else {
            peg$currPos = s3;
            s3 = peg$c0;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$c0;
        }
        if (s3 !== null) {
          while (s3 !== null) {
            s2.push(s3);
            s3 = peg$currPos;
            s4 = peg$parseseparator();
            if (s4 !== null) {
              s5 = peg$parselogicalOr();
              if (s5 !== null) {
                s4 = [s4, s5];
                s3 = s4;
              } else {
                peg$currPos = s3;
                s3 = peg$c0;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$c0;
            }
          }
        } else {
          s2 = peg$c0;
        }
        if (s2 !== null) {
          peg$reportedPos = s0;
          s1 = peg$c79(s1,s2);
          if (s1 === null) {
            peg$currPos = s0;
            s0 = s1;
          } else {
            s0 = s1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }
      if (s0 === null) {
        s0 = peg$parselogicalOr();
      }

      return s0;
    }

    function peg$parseseparator() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      s1 = peg$parse_();
      if (s1 !== null) {
        s2 = peg$parsecommaSeparator();
        if (s2 !== null) {
          s3 = peg$parse_();
          if (s3 !== null) {
            peg$reportedPos = s0;
            s1 = peg$c80(s2);
            if (s1 === null) {
              peg$currPos = s0;
              s0 = s1;
            } else {
              s0 = s1;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }
      if (s0 === null) {
        s0 = peg$parsenonCommaSeparator();
      }

      return s0;
    }

    function peg$parsecommaSeparator() {
      var s0, s1;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 44) {
        s1 = peg$c8;
        peg$currPos++;
      } else {
        s1 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c9); }
      }
      if (s1 !== null) {
        peg$reportedPos = s0;
        s1 = peg$c81(s1);
      }
      if (s1 === null) {
        peg$currPos = s0;
        s0 = s1;
      } else {
        s0 = s1;
      }

      return s0;
    }

    function peg$parsenonCommaSeparator() {
      var s0, s1, s2;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 47) {
        s1 = peg$c82;
        peg$currPos++;
      } else {
        s1 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c83); }
      }
      if (s1 === null) {
        s1 = peg$currPos;
        s2 = peg$parses();
        if (s2 !== null) {
          peg$reportedPos = s1;
          s2 = peg$c84();
        }
        if (s2 === null) {
          peg$currPos = s1;
          s1 = s2;
        } else {
          s1 = s2;
        }
      }
      if (s1 !== null) {
        peg$reportedPos = s0;
        s1 = peg$c81(s1);
      }
      if (s1 === null) {
        peg$currPos = s0;
        s0 = s1;
      } else {
        s0 = s1;
      }

      return s0;
    }

    function peg$parsenonCommaList() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      s1 = peg$parselogicalOr();
      if (s1 !== null) {
        s2 = [];
        s3 = peg$currPos;
        s4 = peg$parsenonCommaSeparator();
        if (s4 !== null) {
          s5 = peg$parselogicalOr();
          if (s5 !== null) {
            s4 = [s4, s5];
            s3 = s4;
          } else {
            peg$currPos = s3;
            s3 = peg$c0;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$c0;
        }
        if (s3 !== null) {
          while (s3 !== null) {
            s2.push(s3);
            s3 = peg$currPos;
            s4 = peg$parsenonCommaSeparator();
            if (s4 !== null) {
              s5 = peg$parselogicalOr();
              if (s5 !== null) {
                s4 = [s4, s5];
                s3 = s4;
              } else {
                peg$currPos = s3;
                s3 = peg$c0;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$c0;
            }
          }
        } else {
          s2 = peg$c0;
        }
        if (s2 !== null) {
          peg$reportedPos = s0;
          s1 = peg$c79(s1,s2);
          if (s1 === null) {
            peg$currPos = s0;
            s0 = s1;
          } else {
            s0 = s1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }
      if (s0 === null) {
        s0 = peg$parselogicalOr();
      }

      return s0;
    }

    function peg$parselogicalOr() {
      var s0, s1, s2, s3, s4, s5, s6, s7;

      s0 = peg$currPos;
      s1 = peg$parselogicalAnd();
      if (s1 !== null) {
        s2 = [];
        s3 = peg$currPos;
        s4 = peg$parse_();
        if (s4 !== null) {
          if (input.substr(peg$currPos, 2).toLowerCase() === peg$c85) {
            s5 = input.substr(peg$currPos, 2);
            peg$currPos += 2;
          } else {
            s5 = null;
            if (peg$silentFails === 0) { peg$fail(peg$c86); }
          }
          if (s5 !== null) {
            s6 = peg$parse_();
            if (s6 !== null) {
              s7 = peg$parselogicalAnd();
              if (s7 !== null) {
                peg$reportedPos = s3;
                s4 = peg$c87(s7);
                if (s4 === null) {
                  peg$currPos = s3;
                  s3 = s4;
                } else {
                  s3 = s4;
                }
              } else {
                peg$currPos = s3;
                s3 = peg$c0;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$c0;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$c0;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$c0;
        }
        while (s3 !== null) {
          s2.push(s3);
          s3 = peg$currPos;
          s4 = peg$parse_();
          if (s4 !== null) {
            if (input.substr(peg$currPos, 2).toLowerCase() === peg$c85) {
              s5 = input.substr(peg$currPos, 2);
              peg$currPos += 2;
            } else {
              s5 = null;
              if (peg$silentFails === 0) { peg$fail(peg$c86); }
            }
            if (s5 !== null) {
              s6 = peg$parse_();
              if (s6 !== null) {
                s7 = peg$parselogicalAnd();
                if (s7 !== null) {
                  peg$reportedPos = s3;
                  s4 = peg$c87(s7);
                  if (s4 === null) {
                    peg$currPos = s3;
                    s3 = s4;
                  } else {
                    s3 = s4;
                  }
                } else {
                  peg$currPos = s3;
                  s3 = peg$c0;
                }
              } else {
                peg$currPos = s3;
                s3 = peg$c0;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$c0;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$c0;
          }
        }
        if (s2 !== null) {
          peg$reportedPos = s0;
          s1 = peg$c88(s1,s2);
          if (s1 === null) {
            peg$currPos = s0;
            s0 = s1;
          } else {
            s0 = s1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parselogicalAnd() {
      var s0, s1, s2, s3, s4, s5, s6, s7;

      s0 = peg$currPos;
      s1 = peg$parseequality();
      if (s1 !== null) {
        s2 = [];
        s3 = peg$currPos;
        s4 = peg$parse_();
        if (s4 !== null) {
          if (input.substr(peg$currPos, 3).toLowerCase() === peg$c89) {
            s5 = input.substr(peg$currPos, 3);
            peg$currPos += 3;
          } else {
            s5 = null;
            if (peg$silentFails === 0) { peg$fail(peg$c90); }
          }
          if (s5 !== null) {
            s6 = peg$parse_();
            if (s6 !== null) {
              s7 = peg$parseequality();
              if (s7 !== null) {
                peg$reportedPos = s3;
                s4 = peg$c87(s7);
                if (s4 === null) {
                  peg$currPos = s3;
                  s3 = s4;
                } else {
                  s3 = s4;
                }
              } else {
                peg$currPos = s3;
                s3 = peg$c0;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$c0;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$c0;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$c0;
        }
        while (s3 !== null) {
          s2.push(s3);
          s3 = peg$currPos;
          s4 = peg$parse_();
          if (s4 !== null) {
            if (input.substr(peg$currPos, 3).toLowerCase() === peg$c89) {
              s5 = input.substr(peg$currPos, 3);
              peg$currPos += 3;
            } else {
              s5 = null;
              if (peg$silentFails === 0) { peg$fail(peg$c90); }
            }
            if (s5 !== null) {
              s6 = peg$parse_();
              if (s6 !== null) {
                s7 = peg$parseequality();
                if (s7 !== null) {
                  peg$reportedPos = s3;
                  s4 = peg$c87(s7);
                  if (s4 === null) {
                    peg$currPos = s3;
                    s3 = s4;
                  } else {
                    s3 = s4;
                  }
                } else {
                  peg$currPos = s3;
                  s3 = peg$c0;
                }
              } else {
                peg$currPos = s3;
                s3 = peg$c0;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$c0;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$c0;
          }
        }
        if (s2 !== null) {
          peg$reportedPos = s0;
          s1 = peg$c91(s1,s2);
          if (s1 === null) {
            peg$currPos = s0;
            s0 = s1;
          } else {
            s0 = s1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseequality() {
      var s0, s1, s2, s3, s4, s5, s6, s7;

      s0 = peg$currPos;
      s1 = peg$parserelational();
      if (s1 !== null) {
        s2 = [];
        s3 = peg$currPos;
        s4 = peg$currPos;
        s5 = peg$parse_();
        if (s5 !== null) {
          if (input.substr(peg$currPos, 4).toLowerCase() === peg$c92) {
            s6 = input.substr(peg$currPos, 4);
            peg$currPos += 4;
          } else {
            s6 = null;
            if (peg$silentFails === 0) { peg$fail(peg$c93); }
          }
          if (s6 === null) {
            if (input.substr(peg$currPos, 2).toLowerCase() === peg$c94) {
              s6 = input.substr(peg$currPos, 2);
              peg$currPos += 2;
            } else {
              s6 = null;
              if (peg$silentFails === 0) { peg$fail(peg$c95); }
            }
          }
          if (s6 !== null) {
            s7 = peg$parse_();
            if (s7 !== null) {
              peg$reportedPos = s4;
              s5 = peg$c96(s6);
              if (s5 === null) {
                peg$currPos = s4;
                s4 = s5;
              } else {
                s4 = s5;
              }
            } else {
              peg$currPos = s4;
              s4 = peg$c0;
            }
          } else {
            peg$currPos = s4;
            s4 = peg$c0;
          }
        } else {
          peg$currPos = s4;
          s4 = peg$c0;
        }
        if (s4 !== null) {
          s5 = peg$parserelational();
          if (s5 !== null) {
            s4 = [s4, s5];
            s3 = s4;
          } else {
            peg$currPos = s3;
            s3 = peg$c0;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$c0;
        }
        while (s3 !== null) {
          s2.push(s3);
          s3 = peg$currPos;
          s4 = peg$currPos;
          s5 = peg$parse_();
          if (s5 !== null) {
            if (input.substr(peg$currPos, 4).toLowerCase() === peg$c92) {
              s6 = input.substr(peg$currPos, 4);
              peg$currPos += 4;
            } else {
              s6 = null;
              if (peg$silentFails === 0) { peg$fail(peg$c93); }
            }
            if (s6 === null) {
              if (input.substr(peg$currPos, 2).toLowerCase() === peg$c94) {
                s6 = input.substr(peg$currPos, 2);
                peg$currPos += 2;
              } else {
                s6 = null;
                if (peg$silentFails === 0) { peg$fail(peg$c95); }
              }
            }
            if (s6 !== null) {
              s7 = peg$parse_();
              if (s7 !== null) {
                peg$reportedPos = s4;
                s5 = peg$c96(s6);
                if (s5 === null) {
                  peg$currPos = s4;
                  s4 = s5;
                } else {
                  s4 = s5;
                }
              } else {
                peg$currPos = s4;
                s4 = peg$c0;
              }
            } else {
              peg$currPos = s4;
              s4 = peg$c0;
            }
          } else {
            peg$currPos = s4;
            s4 = peg$c0;
          }
          if (s4 !== null) {
            s5 = peg$parserelational();
            if (s5 !== null) {
              s4 = [s4, s5];
              s3 = s4;
            } else {
              peg$currPos = s3;
              s3 = peg$c0;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$c0;
          }
        }
        if (s2 !== null) {
          peg$reportedPos = s0;
          s1 = peg$c97(s1,s2);
          if (s1 === null) {
            peg$currPos = s0;
            s0 = s1;
          } else {
            s0 = s1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parserelational() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9;

      s0 = peg$currPos;
      s1 = peg$parserange();
      if (s1 !== null) {
        s2 = [];
        s3 = peg$currPos;
        s4 = peg$currPos;
        s5 = peg$parse_();
        if (s5 !== null) {
          s6 = peg$currPos;
          s7 = peg$currPos;
          if (peg$c98.test(input.charAt(peg$currPos))) {
            s8 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s8 = null;
            if (peg$silentFails === 0) { peg$fail(peg$c99); }
          }
          if (s8 !== null) {
            if (input.charCodeAt(peg$currPos) === 61) {
              s9 = peg$c47;
              peg$currPos++;
            } else {
              s9 = null;
              if (peg$silentFails === 0) { peg$fail(peg$c48); }
            }
            if (s9 === null) {
              s9 = peg$c1;
            }
            if (s9 !== null) {
              s8 = [s8, s9];
              s7 = s8;
            } else {
              peg$currPos = s7;
              s7 = peg$c0;
            }
          } else {
            peg$currPos = s7;
            s7 = peg$c0;
          }
          if (s7 !== null) {
            s7 = input.substring(s6, peg$currPos);
          }
          s6 = s7;
          if (s6 !== null) {
            s7 = peg$parse_();
            if (s7 !== null) {
              peg$reportedPos = s4;
              s5 = peg$c96(s6);
              if (s5 === null) {
                peg$currPos = s4;
                s4 = s5;
              } else {
                s4 = s5;
              }
            } else {
              peg$currPos = s4;
              s4 = peg$c0;
            }
          } else {
            peg$currPos = s4;
            s4 = peg$c0;
          }
        } else {
          peg$currPos = s4;
          s4 = peg$c0;
        }
        if (s4 !== null) {
          s5 = peg$parserange();
          if (s5 !== null) {
            s4 = [s4, s5];
            s3 = s4;
          } else {
            peg$currPos = s3;
            s3 = peg$c0;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$c0;
        }
        while (s3 !== null) {
          s2.push(s3);
          s3 = peg$currPos;
          s4 = peg$currPos;
          s5 = peg$parse_();
          if (s5 !== null) {
            s6 = peg$currPos;
            s7 = peg$currPos;
            if (peg$c98.test(input.charAt(peg$currPos))) {
              s8 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s8 = null;
              if (peg$silentFails === 0) { peg$fail(peg$c99); }
            }
            if (s8 !== null) {
              if (input.charCodeAt(peg$currPos) === 61) {
                s9 = peg$c47;
                peg$currPos++;
              } else {
                s9 = null;
                if (peg$silentFails === 0) { peg$fail(peg$c48); }
              }
              if (s9 === null) {
                s9 = peg$c1;
              }
              if (s9 !== null) {
                s8 = [s8, s9];
                s7 = s8;
              } else {
                peg$currPos = s7;
                s7 = peg$c0;
              }
            } else {
              peg$currPos = s7;
              s7 = peg$c0;
            }
            if (s7 !== null) {
              s7 = input.substring(s6, peg$currPos);
            }
            s6 = s7;
            if (s6 !== null) {
              s7 = peg$parse_();
              if (s7 !== null) {
                peg$reportedPos = s4;
                s5 = peg$c96(s6);
                if (s5 === null) {
                  peg$currPos = s4;
                  s4 = s5;
                } else {
                  s4 = s5;
                }
              } else {
                peg$currPos = s4;
                s4 = peg$c0;
              }
            } else {
              peg$currPos = s4;
              s4 = peg$c0;
            }
          } else {
            peg$currPos = s4;
            s4 = peg$c0;
          }
          if (s4 !== null) {
            s5 = peg$parserange();
            if (s5 !== null) {
              s4 = [s4, s5];
              s3 = s4;
            } else {
              peg$currPos = s3;
              s3 = peg$c0;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$c0;
          }
        }
        if (s2 !== null) {
          peg$reportedPos = s0;
          s1 = peg$c100(s1,s2);
          if (s1 === null) {
            peg$currPos = s0;
            s0 = s1;
          } else {
            s0 = s1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parserange() {
      var s0, s1, s2, s3, s4, s5, s6;

      s0 = peg$currPos;
      s1 = peg$parseadditive();
      if (s1 !== null) {
        s2 = peg$parse_();
        if (s2 !== null) {
          s3 = peg$currPos;
          s4 = peg$currPos;
          if (input.substr(peg$currPos, 2) === peg$c101) {
            s5 = peg$c101;
            peg$currPos += 2;
          } else {
            s5 = null;
            if (peg$silentFails === 0) { peg$fail(peg$c102); }
          }
          if (s5 !== null) {
            if (input.charCodeAt(peg$currPos) === 46) {
              s6 = peg$c32;
              peg$currPos++;
            } else {
              s6 = null;
              if (peg$silentFails === 0) { peg$fail(peg$c33); }
            }
            if (s6 === null) {
              s6 = peg$c1;
            }
            if (s6 !== null) {
              s5 = [s5, s6];
              s4 = s5;
            } else {
              peg$currPos = s4;
              s4 = peg$c0;
            }
          } else {
            peg$currPos = s4;
            s4 = peg$c0;
          }
          if (s4 !== null) {
            s4 = input.substring(s3, peg$currPos);
          }
          s3 = s4;
          if (s3 !== null) {
            s4 = peg$parse_();
            if (s4 !== null) {
              s5 = peg$parseadditive();
              if (s5 !== null) {
                peg$reportedPos = s0;
                s1 = peg$c103(s1,s3,s5);
                if (s1 === null) {
                  peg$currPos = s0;
                  s0 = s1;
                } else {
                  s0 = s1;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }
      if (s0 === null) {
        s0 = peg$parseadditive();
      }

      return s0;
    }

    function peg$parseadditive() {
      var s0, s1, s2, s3, s4, s5, s6, s7;

      s0 = peg$currPos;
      s1 = peg$parsemultiplicative();
      if (s1 !== null) {
        s2 = [];
        s3 = peg$currPos;
        s4 = peg$currPos;
        s5 = peg$parse_();
        if (s5 !== null) {
          if (peg$c66.test(input.charAt(peg$currPos))) {
            s6 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s6 = null;
            if (peg$silentFails === 0) { peg$fail(peg$c67); }
          }
          if (s6 !== null) {
            s7 = peg$parses();
            if (s7 !== null) {
              peg$reportedPos = s4;
              s5 = peg$c12(s6);
              if (s5 === null) {
                peg$currPos = s4;
                s4 = s5;
              } else {
                s4 = s5;
              }
            } else {
              peg$currPos = s4;
              s4 = peg$c0;
            }
          } else {
            peg$currPos = s4;
            s4 = peg$c0;
          }
        } else {
          peg$currPos = s4;
          s4 = peg$c0;
        }
        if (s4 === null) {
          if (peg$c66.test(input.charAt(peg$currPos))) {
            s4 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s4 = null;
            if (peg$silentFails === 0) { peg$fail(peg$c67); }
          }
        }
        if (s4 !== null) {
          s5 = peg$parsemultiplicative();
          if (s5 !== null) {
            s4 = [s4, s5];
            s3 = s4;
          } else {
            peg$currPos = s3;
            s3 = peg$c0;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$c0;
        }
        while (s3 !== null) {
          s2.push(s3);
          s3 = peg$currPos;
          s4 = peg$currPos;
          s5 = peg$parse_();
          if (s5 !== null) {
            if (peg$c66.test(input.charAt(peg$currPos))) {
              s6 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s6 = null;
              if (peg$silentFails === 0) { peg$fail(peg$c67); }
            }
            if (s6 !== null) {
              s7 = peg$parses();
              if (s7 !== null) {
                peg$reportedPos = s4;
                s5 = peg$c12(s6);
                if (s5 === null) {
                  peg$currPos = s4;
                  s4 = s5;
                } else {
                  s4 = s5;
                }
              } else {
                peg$currPos = s4;
                s4 = peg$c0;
              }
            } else {
              peg$currPos = s4;
              s4 = peg$c0;
            }
          } else {
            peg$currPos = s4;
            s4 = peg$c0;
          }
          if (s4 === null) {
            if (peg$c66.test(input.charAt(peg$currPos))) {
              s4 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s4 = null;
              if (peg$silentFails === 0) { peg$fail(peg$c67); }
            }
          }
          if (s4 !== null) {
            s5 = peg$parsemultiplicative();
            if (s5 !== null) {
              s4 = [s4, s5];
              s3 = s4;
            } else {
              peg$currPos = s3;
              s3 = peg$c0;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$c0;
          }
        }
        if (s2 !== null) {
          peg$reportedPos = s0;
          s1 = peg$c104(s1,s2);
          if (s1 === null) {
            peg$currPos = s0;
            s0 = s1;
          } else {
            s0 = s1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsemultiplicative() {
      var s0, s1, s2, s3, s4, s5, s6, s7;

      s0 = peg$currPos;
      s1 = peg$parseunary();
      if (s1 !== null) {
        s2 = [];
        s3 = peg$currPos;
        s4 = peg$currPos;
        s5 = peg$parse_();
        if (s5 !== null) {
          if (input.charCodeAt(peg$currPos) === 47) {
            s6 = peg$c82;
            peg$currPos++;
          } else {
            s6 = null;
            if (peg$silentFails === 0) { peg$fail(peg$c83); }
          }
          if (s6 !== null) {
            s7 = peg$parses();
            if (s7 !== null) {
              peg$reportedPos = s4;
              s5 = peg$c12(s6);
              if (s5 === null) {
                peg$currPos = s4;
                s4 = s5;
              } else {
                s4 = s5;
              }
            } else {
              peg$currPos = s4;
              s4 = peg$c0;
            }
          } else {
            peg$currPos = s4;
            s4 = peg$c0;
          }
        } else {
          peg$currPos = s4;
          s4 = peg$c0;
        }
        if (s4 === null) {
          s4 = peg$currPos;
          s5 = peg$parses();
          if (s5 !== null) {
            if (input.charCodeAt(peg$currPos) === 47) {
              s6 = peg$c82;
              peg$currPos++;
            } else {
              s6 = null;
              if (peg$silentFails === 0) { peg$fail(peg$c83); }
            }
            if (s6 !== null) {
              s7 = peg$parse_();
              if (s7 !== null) {
                peg$reportedPos = s4;
                s5 = peg$c12(s6);
                if (s5 === null) {
                  peg$currPos = s4;
                  s4 = s5;
                } else {
                  s4 = s5;
                }
              } else {
                peg$currPos = s4;
                s4 = peg$c0;
              }
            } else {
              peg$currPos = s4;
              s4 = peg$c0;
            }
          } else {
            peg$currPos = s4;
            s4 = peg$c0;
          }
          if (s4 === null) {
            s4 = peg$currPos;
            s5 = peg$parse_();
            if (s5 !== null) {
              if (peg$c105.test(input.charAt(peg$currPos))) {
                s6 = input.charAt(peg$currPos);
                peg$currPos++;
              } else {
                s6 = null;
                if (peg$silentFails === 0) { peg$fail(peg$c106); }
              }
              if (s6 !== null) {
                s7 = peg$parse_();
                if (s7 !== null) {
                  peg$reportedPos = s4;
                  s5 = peg$c12(s6);
                  if (s5 === null) {
                    peg$currPos = s4;
                    s4 = s5;
                  } else {
                    s4 = s5;
                  }
                } else {
                  peg$currPos = s4;
                  s4 = peg$c0;
                }
              } else {
                peg$currPos = s4;
                s4 = peg$c0;
              }
            } else {
              peg$currPos = s4;
              s4 = peg$c0;
            }
          }
        }
        if (s4 !== null) {
          s5 = peg$parseunary();
          if (s5 !== null) {
            s4 = [s4, s5];
            s3 = s4;
          } else {
            peg$currPos = s3;
            s3 = peg$c0;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$c0;
        }
        while (s3 !== null) {
          s2.push(s3);
          s3 = peg$currPos;
          s4 = peg$currPos;
          s5 = peg$parse_();
          if (s5 !== null) {
            if (input.charCodeAt(peg$currPos) === 47) {
              s6 = peg$c82;
              peg$currPos++;
            } else {
              s6 = null;
              if (peg$silentFails === 0) { peg$fail(peg$c83); }
            }
            if (s6 !== null) {
              s7 = peg$parses();
              if (s7 !== null) {
                peg$reportedPos = s4;
                s5 = peg$c12(s6);
                if (s5 === null) {
                  peg$currPos = s4;
                  s4 = s5;
                } else {
                  s4 = s5;
                }
              } else {
                peg$currPos = s4;
                s4 = peg$c0;
              }
            } else {
              peg$currPos = s4;
              s4 = peg$c0;
            }
          } else {
            peg$currPos = s4;
            s4 = peg$c0;
          }
          if (s4 === null) {
            s4 = peg$currPos;
            s5 = peg$parses();
            if (s5 !== null) {
              if (input.charCodeAt(peg$currPos) === 47) {
                s6 = peg$c82;
                peg$currPos++;
              } else {
                s6 = null;
                if (peg$silentFails === 0) { peg$fail(peg$c83); }
              }
              if (s6 !== null) {
                s7 = peg$parse_();
                if (s7 !== null) {
                  peg$reportedPos = s4;
                  s5 = peg$c12(s6);
                  if (s5 === null) {
                    peg$currPos = s4;
                    s4 = s5;
                  } else {
                    s4 = s5;
                  }
                } else {
                  peg$currPos = s4;
                  s4 = peg$c0;
                }
              } else {
                peg$currPos = s4;
                s4 = peg$c0;
              }
            } else {
              peg$currPos = s4;
              s4 = peg$c0;
            }
            if (s4 === null) {
              s4 = peg$currPos;
              s5 = peg$parse_();
              if (s5 !== null) {
                if (peg$c105.test(input.charAt(peg$currPos))) {
                  s6 = input.charAt(peg$currPos);
                  peg$currPos++;
                } else {
                  s6 = null;
                  if (peg$silentFails === 0) { peg$fail(peg$c106); }
                }
                if (s6 !== null) {
                  s7 = peg$parse_();
                  if (s7 !== null) {
                    peg$reportedPos = s4;
                    s5 = peg$c12(s6);
                    if (s5 === null) {
                      peg$currPos = s4;
                      s4 = s5;
                    } else {
                      s4 = s5;
                    }
                  } else {
                    peg$currPos = s4;
                    s4 = peg$c0;
                  }
                } else {
                  peg$currPos = s4;
                  s4 = peg$c0;
                }
              } else {
                peg$currPos = s4;
                s4 = peg$c0;
              }
            }
          }
          if (s4 !== null) {
            s5 = peg$parseunary();
            if (s5 !== null) {
              s4 = [s4, s5];
              s3 = s4;
            } else {
              peg$currPos = s3;
              s3 = peg$c0;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$c0;
          }
        }
        if (s2 !== null) {
          peg$reportedPos = s0;
          s1 = peg$c107(s1,s2);
          if (s1 === null) {
            peg$currPos = s0;
            s0 = s1;
          } else {
            s0 = s1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseunary() {
      var s0, s1, s2;

      s0 = peg$parsecall();
      if (s0 === null) {
        s0 = peg$currPos;
        if (peg$c66.test(input.charAt(peg$currPos))) {
          s1 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s1 = null;
          if (peg$silentFails === 0) { peg$fail(peg$c67); }
        }
        if (s1 !== null) {
          s2 = peg$parsecall();
          if (s2 !== null) {
            peg$reportedPos = s0;
            s1 = peg$c108(s1,s2);
            if (s1 === null) {
              peg$currPos = s0;
              s0 = s1;
            } else {
              s0 = s1;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      }

      return s0;
    }

    function peg$parsecall() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      s1 = peg$parseprimary();
      if (s1 !== null) {
        s2 = [];
        s3 = peg$parseargumentList();
        while (s3 !== null) {
          s2.push(s3);
          s3 = peg$parseargumentList();
        }
        if (s2 !== null) {
          peg$reportedPos = s0;
          s1 = peg$c109(s1,s2);
          if (s1 === null) {
            peg$currPos = s0;
            s0 = s1;
          } else {
            s0 = s1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseargumentList() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 40) {
        s1 = peg$c56;
        peg$currPos++;
      } else {
        s1 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c57); }
      }
      if (s1 !== null) {
        s2 = peg$parse_();
        if (s2 !== null) {
          s3 = peg$parseargs();
          if (s3 === null) {
            s3 = peg$c1;
          }
          if (s3 !== null) {
            s4 = peg$parse_();
            if (s4 !== null) {
              if (input.charCodeAt(peg$currPos) === 41) {
                s5 = peg$c58;
                peg$currPos++;
              } else {
                s5 = null;
                if (peg$silentFails === 0) { peg$fail(peg$c59); }
              }
              if (s5 !== null) {
                peg$reportedPos = s0;
                s1 = peg$c110(s3);
                if (s1 === null) {
                  peg$currPos = s0;
                  s0 = s1;
                } else {
                  s0 = s1;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseargs() {
      var s0, s1, s2, s3, s4, s5, s6, s7;

      s0 = peg$currPos;
      s1 = peg$parsenonCommaList();
      if (s1 !== null) {
        s2 = [];
        s3 = peg$currPos;
        s4 = peg$parse_();
        if (s4 !== null) {
          if (input.charCodeAt(peg$currPos) === 44) {
            s5 = peg$c8;
            peg$currPos++;
          } else {
            s5 = null;
            if (peg$silentFails === 0) { peg$fail(peg$c9); }
          }
          if (s5 !== null) {
            s6 = peg$parse_();
            if (s6 !== null) {
              s7 = peg$parsenonCommaList();
              if (s7 !== null) {
                peg$reportedPos = s3;
                s4 = peg$c10(s7);
                if (s4 === null) {
                  peg$currPos = s3;
                  s3 = s4;
                } else {
                  s3 = s4;
                }
              } else {
                peg$currPos = s3;
                s3 = peg$c0;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$c0;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$c0;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$c0;
        }
        while (s3 !== null) {
          s2.push(s3);
          s3 = peg$currPos;
          s4 = peg$parse_();
          if (s4 !== null) {
            if (input.charCodeAt(peg$currPos) === 44) {
              s5 = peg$c8;
              peg$currPos++;
            } else {
              s5 = null;
              if (peg$silentFails === 0) { peg$fail(peg$c9); }
            }
            if (s5 !== null) {
              s6 = peg$parse_();
              if (s6 !== null) {
                s7 = peg$parsenonCommaList();
                if (s7 !== null) {
                  peg$reportedPos = s3;
                  s4 = peg$c10(s7);
                  if (s4 === null) {
                    peg$currPos = s3;
                    s3 = s4;
                  } else {
                    s3 = s4;
                  }
                } else {
                  peg$currPos = s3;
                  s3 = peg$c0;
                }
              } else {
                peg$currPos = s3;
                s3 = peg$c0;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$c0;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$c0;
          }
        }
        if (s2 !== null) {
          peg$reportedPos = s0;
          s1 = peg$c6(s1,s2);
          if (s1 === null) {
            peg$currPos = s0;
            s0 = s1;
          } else {
            s0 = s1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseaccessor() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 91) {
        s1 = peg$c35;
        peg$currPos++;
      } else {
        s1 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c36); }
      }
      if (s1 !== null) {
        s2 = peg$parse_();
        if (s2 !== null) {
          s3 = peg$parserange();
          if (s3 !== null) {
            s4 = peg$parse_();
            if (s4 !== null) {
              if (input.charCodeAt(peg$currPos) === 93) {
                s5 = peg$c50;
                peg$currPos++;
              } else {
                s5 = null;
                if (peg$silentFails === 0) { peg$fail(peg$c51); }
              }
              if (s5 !== null) {
                peg$reportedPos = s0;
                s1 = peg$c111(s3);
                if (s1 === null) {
                  peg$currPos = s0;
                  s0 = s1;
                } else {
                  s0 = s1;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseprimary() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 40) {
        s1 = peg$c56;
        peg$currPos++;
      } else {
        s1 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c57); }
      }
      if (s1 !== null) {
        s2 = peg$parse_();
        if (s2 !== null) {
          s3 = peg$parselist();
          if (s3 !== null) {
            s4 = peg$parse_();
            if (s4 !== null) {
              if (input.charCodeAt(peg$currPos) === 41) {
                s5 = peg$c58;
                peg$currPos++;
              } else {
                s5 = null;
                if (peg$silentFails === 0) { peg$fail(peg$c59); }
              }
              if (s5 !== null) {
                peg$reportedPos = s0;
                s1 = peg$c112(s3);
                if (s1 === null) {
                  peg$currPos = s0;
                  s0 = s1;
                } else {
                  s0 = s1;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }
      if (s0 === null) {
        s0 = peg$parsepercentage();
        if (s0 === null) {
          s0 = peg$parsedimension();
          if (s0 === null) {
            s0 = peg$parsenumber();
            if (s0 === null) {
              s0 = peg$parsecolor();
              if (s0 === null) {
                s0 = peg$parseurl();
                if (s0 === null) {
                  s0 = peg$parsefunction();
                  if (s0 === null) {
                    s0 = peg$parseboolean();
                    if (s0 === null) {
                      s0 = peg$parsenull();
                      if (s0 === null) {
                        s0 = peg$parseidentifier();
                        if (s0 === null) {
                          s0 = peg$parsestring();
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }

      return s0;
    }

    function peg$parseidentifier() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      s1 = peg$parseidentifierStart();
      if (s1 !== null) {
        s2 = [];
        s3 = peg$parsevariable();
        if (s3 === null) {
          s3 = peg$parseinterpolation();
          if (s3 === null) {
            s3 = peg$parsepartialRawIdentifier();
          }
        }
        if (s3 !== null) {
          while (s3 !== null) {
            s2.push(s3);
            s3 = peg$parsevariable();
            if (s3 === null) {
              s3 = peg$parseinterpolation();
              if (s3 === null) {
                s3 = peg$parsepartialRawIdentifier();
              }
            }
          }
        } else {
          s2 = peg$c0;
        }
        if (s2 !== null) {
          peg$reportedPos = s0;
          s1 = peg$c113(s1,s2);
          if (s1 === null) {
            peg$currPos = s0;
            s0 = s1;
          } else {
            s0 = s1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }
      if (s0 === null) {
        s0 = peg$currPos;
        s1 = peg$parserawIdentifier();
        if (s1 !== null) {
          peg$reportedPos = s0;
          s1 = peg$c114(s1);
        }
        if (s1 === null) {
          peg$currPos = s0;
          s0 = s1;
        } else {
          s0 = s1;
        }
        if (s0 === null) {
          s0 = peg$parsevariable();
          if (s0 === null) {
            s0 = peg$parseinterpolation();
          }
        }
      }

      return s0;
    }

    function peg$parseidentifierStart() {
      var s0, s1, s2;

      s0 = peg$parserawIdentifier();
      if (s0 === null) {
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 45) {
          s1 = peg$c115;
          peg$currPos++;
        } else {
          s1 = null;
          if (peg$silentFails === 0) { peg$fail(peg$c116); }
        }
        if (s1 === null) {
          s1 = peg$c1;
        }
        if (s1 !== null) {
          s2 = peg$parsevariable();
          if (s2 !== null) {
            peg$reportedPos = s0;
            s1 = peg$c117(s1,s2);
            if (s1 === null) {
              peg$currPos = s0;
              s0 = s1;
            } else {
              s0 = s1;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
        if (s0 === null) {
          s0 = peg$currPos;
          if (input.charCodeAt(peg$currPos) === 45) {
            s1 = peg$c115;
            peg$currPos++;
          } else {
            s1 = null;
            if (peg$silentFails === 0) { peg$fail(peg$c116); }
          }
          if (s1 === null) {
            s1 = peg$c1;
          }
          if (s1 !== null) {
            s2 = peg$parseinterpolation();
            if (s2 !== null) {
              peg$reportedPos = s0;
              s1 = peg$c118(s1,s2);
              if (s1 === null) {
                peg$currPos = s0;
                s0 = s1;
              } else {
                s0 = s1;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        }
      }

      return s0;
    }

    function peg$parsepartialIdentifier() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = [];
      s2 = peg$parsepartialRawIdentifier();
      if (s2 === null) {
        s2 = peg$parsevariable();
        if (s2 === null) {
          s2 = peg$parseinterpolation();
        }
      }
      if (s2 !== null) {
        while (s2 !== null) {
          s1.push(s2);
          s2 = peg$parsepartialRawIdentifier();
          if (s2 === null) {
            s2 = peg$parsevariable();
            if (s2 === null) {
              s2 = peg$parseinterpolation();
            }
          }
        }
      } else {
        s1 = peg$c0;
      }
      if (s1 !== null) {
        peg$reportedPos = s0;
        s1 = peg$c119(s1);
      }
      if (s1 === null) {
        peg$currPos = s0;
        s0 = s1;
      } else {
        s0 = s1;
      }

      return s0;
    }

    function peg$parserawIdentifier() {
      var s0, s1, s2, s3, s4;

      s0 = peg$currPos;
      s1 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 45) {
        s2 = peg$c115;
        peg$currPos++;
      } else {
        s2 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c116); }
      }
      if (s2 === null) {
        s2 = peg$c1;
      }
      if (s2 !== null) {
        if (peg$c120.test(input.charAt(peg$currPos))) {
          s3 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s3 = null;
          if (peg$silentFails === 0) { peg$fail(peg$c121); }
        }
        if (s3 !== null) {
          s4 = peg$parsepartialRawIdentifier();
          if (s4 === null) {
            s4 = peg$c1;
          }
          if (s4 !== null) {
            s2 = [s2, s3, s4];
            s1 = s2;
          } else {
            peg$currPos = s1;
            s1 = peg$c0;
          }
        } else {
          peg$currPos = s1;
          s1 = peg$c0;
        }
      } else {
        peg$currPos = s1;
        s1 = peg$c0;
      }
      if (s1 !== null) {
        s1 = input.substring(s0, peg$currPos);
      }
      s0 = s1;

      return s0;
    }

    function peg$parsepartialRawIdentifier() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = [];
      if (peg$c122.test(input.charAt(peg$currPos))) {
        s2 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s2 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c123); }
      }
      if (s2 !== null) {
        while (s2 !== null) {
          s1.push(s2);
          if (peg$c122.test(input.charAt(peg$currPos))) {
            s2 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s2 = null;
            if (peg$silentFails === 0) { peg$fail(peg$c123); }
          }
        }
      } else {
        s1 = peg$c0;
      }
      if (s1 !== null) {
        s1 = input.substring(s0, peg$currPos);
      }
      s0 = s1;

      return s0;
    }

    function peg$parseinterpolation() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 123) {
        s1 = peg$c68;
        peg$currPos++;
      } else {
        s1 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c69); }
      }
      if (s1 !== null) {
        s2 = peg$parse_();
        if (s2 !== null) {
          s3 = peg$parsevariable();
          if (s3 !== null) {
            s4 = peg$parse_();
            if (s4 !== null) {
              if (input.charCodeAt(peg$currPos) === 125) {
                s5 = peg$c70;
                peg$currPos++;
              } else {
                s5 = null;
                if (peg$silentFails === 0) { peg$fail(peg$c71); }
              }
              if (s5 !== null) {
                peg$reportedPos = s0;
                s1 = peg$c124(s3);
                if (s1 === null) {
                  peg$currPos = s0;
                  s0 = s1;
                } else {
                  s0 = s1;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsevariable() {
      var s0, s1, s2;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 36) {
        s1 = peg$c125;
        peg$currPos++;
      } else {
        s1 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c126); }
      }
      if (s1 !== null) {
        s2 = peg$parserawIdentifier();
        if (s2 !== null) {
          peg$reportedPos = s0;
          s1 = peg$c127(s2);
          if (s1 === null) {
            peg$currPos = s0;
            s0 = s1;
          } else {
            s0 = s1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsestring() {
      var s0, s1, s2, s3, s4, s5, s6, s7;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 39) {
        s1 = peg$c128;
        peg$currPos++;
      } else {
        s1 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c129); }
      }
      if (s1 !== null) {
        s2 = peg$currPos;
        s3 = [];
        if (peg$c130.test(input.charAt(peg$currPos))) {
          s4 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s4 = null;
          if (peg$silentFails === 0) { peg$fail(peg$c131); }
        }
        if (s4 === null) {
          s4 = peg$currPos;
          if (input.charCodeAt(peg$currPos) === 92) {
            s5 = peg$c132;
            peg$currPos++;
          } else {
            s5 = null;
            if (peg$silentFails === 0) { peg$fail(peg$c133); }
          }
          if (s5 !== null) {
            if (input.length > peg$currPos) {
              s6 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s6 = null;
              if (peg$silentFails === 0) { peg$fail(peg$c134); }
            }
            if (s6 !== null) {
              s5 = [s5, s6];
              s4 = s5;
            } else {
              peg$currPos = s4;
              s4 = peg$c0;
            }
          } else {
            peg$currPos = s4;
            s4 = peg$c0;
          }
        }
        while (s4 !== null) {
          s3.push(s4);
          if (peg$c130.test(input.charAt(peg$currPos))) {
            s4 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s4 = null;
            if (peg$silentFails === 0) { peg$fail(peg$c131); }
          }
          if (s4 === null) {
            s4 = peg$currPos;
            if (input.charCodeAt(peg$currPos) === 92) {
              s5 = peg$c132;
              peg$currPos++;
            } else {
              s5 = null;
              if (peg$silentFails === 0) { peg$fail(peg$c133); }
            }
            if (s5 !== null) {
              if (input.length > peg$currPos) {
                s6 = input.charAt(peg$currPos);
                peg$currPos++;
              } else {
                s6 = null;
                if (peg$silentFails === 0) { peg$fail(peg$c134); }
              }
              if (s6 !== null) {
                s5 = [s5, s6];
                s4 = s5;
              } else {
                peg$currPos = s4;
                s4 = peg$c0;
              }
            } else {
              peg$currPos = s4;
              s4 = peg$c0;
            }
          }
        }
        if (s3 !== null) {
          s3 = input.substring(s2, peg$currPos);
        }
        s2 = s3;
        if (s2 !== null) {
          if (input.charCodeAt(peg$currPos) === 39) {
            s3 = peg$c128;
            peg$currPos++;
          } else {
            s3 = null;
            if (peg$silentFails === 0) { peg$fail(peg$c129); }
          }
          if (s3 !== null) {
            peg$reportedPos = s0;
            s1 = peg$c135(s2);
            if (s1 === null) {
              peg$currPos = s0;
              s0 = s1;
            } else {
              s0 = s1;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }
      if (s0 === null) {
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 34) {
          s1 = peg$c136;
          peg$currPos++;
        } else {
          s1 = null;
          if (peg$silentFails === 0) { peg$fail(peg$c137); }
        }
        if (s1 !== null) {
          s2 = [];
          s3 = peg$currPos;
          s4 = [];
          if (peg$c138.test(input.charAt(peg$currPos))) {
            s5 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s5 = null;
            if (peg$silentFails === 0) { peg$fail(peg$c139); }
          }
          if (s5 === null) {
            s5 = peg$currPos;
            if (input.charCodeAt(peg$currPos) === 92) {
              s6 = peg$c132;
              peg$currPos++;
            } else {
              s6 = null;
              if (peg$silentFails === 0) { peg$fail(peg$c133); }
            }
            if (s6 !== null) {
              if (input.length > peg$currPos) {
                s7 = input.charAt(peg$currPos);
                peg$currPos++;
              } else {
                s7 = null;
                if (peg$silentFails === 0) { peg$fail(peg$c134); }
              }
              if (s7 !== null) {
                s6 = [s6, s7];
                s5 = s6;
              } else {
                peg$currPos = s5;
                s5 = peg$c0;
              }
            } else {
              peg$currPos = s5;
              s5 = peg$c0;
            }
          }
          if (s5 !== null) {
            while (s5 !== null) {
              s4.push(s5);
              if (peg$c138.test(input.charAt(peg$currPos))) {
                s5 = input.charAt(peg$currPos);
                peg$currPos++;
              } else {
                s5 = null;
                if (peg$silentFails === 0) { peg$fail(peg$c139); }
              }
              if (s5 === null) {
                s5 = peg$currPos;
                if (input.charCodeAt(peg$currPos) === 92) {
                  s6 = peg$c132;
                  peg$currPos++;
                } else {
                  s6 = null;
                  if (peg$silentFails === 0) { peg$fail(peg$c133); }
                }
                if (s6 !== null) {
                  if (input.length > peg$currPos) {
                    s7 = input.charAt(peg$currPos);
                    peg$currPos++;
                  } else {
                    s7 = null;
                    if (peg$silentFails === 0) { peg$fail(peg$c134); }
                  }
                  if (s7 !== null) {
                    s6 = [s6, s7];
                    s5 = s6;
                  } else {
                    peg$currPos = s5;
                    s5 = peg$c0;
                  }
                } else {
                  peg$currPos = s5;
                  s5 = peg$c0;
                }
              }
            }
          } else {
            s4 = peg$c0;
          }
          if (s4 !== null) {
            s4 = input.substring(s3, peg$currPos);
          }
          s3 = s4;
          if (s3 === null) {
            s3 = peg$parsevariable();
            if (s3 === null) {
              s3 = peg$parseinterpolation();
              if (s3 === null) {
                if (input.charCodeAt(peg$currPos) === 123) {
                  s3 = peg$c68;
                  peg$currPos++;
                } else {
                  s3 = null;
                  if (peg$silentFails === 0) { peg$fail(peg$c69); }
                }
              }
            }
          }
          while (s3 !== null) {
            s2.push(s3);
            s3 = peg$currPos;
            s4 = [];
            if (peg$c138.test(input.charAt(peg$currPos))) {
              s5 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s5 = null;
              if (peg$silentFails === 0) { peg$fail(peg$c139); }
            }
            if (s5 === null) {
              s5 = peg$currPos;
              if (input.charCodeAt(peg$currPos) === 92) {
                s6 = peg$c132;
                peg$currPos++;
              } else {
                s6 = null;
                if (peg$silentFails === 0) { peg$fail(peg$c133); }
              }
              if (s6 !== null) {
                if (input.length > peg$currPos) {
                  s7 = input.charAt(peg$currPos);
                  peg$currPos++;
                } else {
                  s7 = null;
                  if (peg$silentFails === 0) { peg$fail(peg$c134); }
                }
                if (s7 !== null) {
                  s6 = [s6, s7];
                  s5 = s6;
                } else {
                  peg$currPos = s5;
                  s5 = peg$c0;
                }
              } else {
                peg$currPos = s5;
                s5 = peg$c0;
              }
            }
            if (s5 !== null) {
              while (s5 !== null) {
                s4.push(s5);
                if (peg$c138.test(input.charAt(peg$currPos))) {
                  s5 = input.charAt(peg$currPos);
                  peg$currPos++;
                } else {
                  s5 = null;
                  if (peg$silentFails === 0) { peg$fail(peg$c139); }
                }
                if (s5 === null) {
                  s5 = peg$currPos;
                  if (input.charCodeAt(peg$currPos) === 92) {
                    s6 = peg$c132;
                    peg$currPos++;
                  } else {
                    s6 = null;
                    if (peg$silentFails === 0) { peg$fail(peg$c133); }
                  }
                  if (s6 !== null) {
                    if (input.length > peg$currPos) {
                      s7 = input.charAt(peg$currPos);
                      peg$currPos++;
                    } else {
                      s7 = null;
                      if (peg$silentFails === 0) { peg$fail(peg$c134); }
                    }
                    if (s7 !== null) {
                      s6 = [s6, s7];
                      s5 = s6;
                    } else {
                      peg$currPos = s5;
                      s5 = peg$c0;
                    }
                  } else {
                    peg$currPos = s5;
                    s5 = peg$c0;
                  }
                }
              }
            } else {
              s4 = peg$c0;
            }
            if (s4 !== null) {
              s4 = input.substring(s3, peg$currPos);
            }
            s3 = s4;
            if (s3 === null) {
              s3 = peg$parsevariable();
              if (s3 === null) {
                s3 = peg$parseinterpolation();
                if (s3 === null) {
                  if (input.charCodeAt(peg$currPos) === 123) {
                    s3 = peg$c68;
                    peg$currPos++;
                  } else {
                    s3 = null;
                    if (peg$silentFails === 0) { peg$fail(peg$c69); }
                  }
                }
              }
            }
          }
          if (s2 !== null) {
            if (input.charCodeAt(peg$currPos) === 34) {
              s3 = peg$c136;
              peg$currPos++;
            } else {
              s3 = null;
              if (peg$silentFails === 0) { peg$fail(peg$c137); }
            }
            if (s3 !== null) {
              peg$reportedPos = s0;
              s1 = peg$c140(s2);
              if (s1 === null) {
                peg$currPos = s0;
                s0 = s1;
              } else {
                s0 = s1;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      }

      return s0;
    }

    function peg$parsepercentage() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = peg$parserawNumber();
      if (s1 !== null) {
        if (input.charCodeAt(peg$currPos) === 37) {
          s2 = peg$c141;
          peg$currPos++;
        } else {
          s2 = null;
          if (peg$silentFails === 0) { peg$fail(peg$c142); }
        }
        if (s2 !== null) {
          peg$reportedPos = s0;
          s1 = peg$c143(s1);
          if (s1 === null) {
            peg$currPos = s0;
            s0 = s1;
          } else {
            s0 = s1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsedimension() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = peg$parserawNumber();
      if (s1 !== null) {
        s2 = peg$parserawIdentifier();
        if (s2 !== null) {
          peg$reportedPos = s0;
          s1 = peg$c144(s1,s2);
          if (s1 === null) {
            peg$currPos = s0;
            s0 = s1;
          } else {
            s0 = s1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsenumber() {
      var s0, s1;

      s0 = peg$currPos;
      s1 = peg$parserawNumber();
      if (s1 !== null) {
        peg$reportedPos = s0;
        s1 = peg$c145(s1);
      }
      if (s1 === null) {
        peg$currPos = s0;
        s0 = s1;
      } else {
        s0 = s1;
      }

      return s0;
    }

    function peg$parserawNumber() {
      var s0, s1, s2, s3, s4, s5, s6;

      s0 = peg$currPos;
      s1 = peg$currPos;
      s2 = peg$currPos;
      s3 = [];
      if (peg$c146.test(input.charAt(peg$currPos))) {
        s4 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s4 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c147); }
      }
      while (s4 !== null) {
        s3.push(s4);
        if (peg$c146.test(input.charAt(peg$currPos))) {
          s4 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s4 = null;
          if (peg$silentFails === 0) { peg$fail(peg$c147); }
        }
      }
      if (s3 !== null) {
        if (input.charCodeAt(peg$currPos) === 46) {
          s4 = peg$c32;
          peg$currPos++;
        } else {
          s4 = null;
          if (peg$silentFails === 0) { peg$fail(peg$c33); }
        }
        if (s4 !== null) {
          s5 = [];
          if (peg$c146.test(input.charAt(peg$currPos))) {
            s6 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s6 = null;
            if (peg$silentFails === 0) { peg$fail(peg$c147); }
          }
          if (s6 !== null) {
            while (s6 !== null) {
              s5.push(s6);
              if (peg$c146.test(input.charAt(peg$currPos))) {
                s6 = input.charAt(peg$currPos);
                peg$currPos++;
              } else {
                s6 = null;
                if (peg$silentFails === 0) { peg$fail(peg$c147); }
              }
            }
          } else {
            s5 = peg$c0;
          }
          if (s5 !== null) {
            s3 = [s3, s4, s5];
            s2 = s3;
          } else {
            peg$currPos = s2;
            s2 = peg$c0;
          }
        } else {
          peg$currPos = s2;
          s2 = peg$c0;
        }
      } else {
        peg$currPos = s2;
        s2 = peg$c0;
      }
      if (s2 === null) {
        s2 = [];
        if (peg$c146.test(input.charAt(peg$currPos))) {
          s3 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s3 = null;
          if (peg$silentFails === 0) { peg$fail(peg$c147); }
        }
        if (s3 !== null) {
          while (s3 !== null) {
            s2.push(s3);
            if (peg$c146.test(input.charAt(peg$currPos))) {
              s3 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s3 = null;
              if (peg$silentFails === 0) { peg$fail(peg$c147); }
            }
          }
        } else {
          s2 = peg$c0;
        }
      }
      if (s2 !== null) {
        s2 = input.substring(s1, peg$currPos);
      }
      s1 = s2;
      if (s1 !== null) {
        peg$reportedPos = s0;
        s1 = peg$c148(s1);
      }
      if (s1 === null) {
        peg$currPos = s0;
        s0 = s1;
      } else {
        s0 = s1;
      }

      return s0;
    }

    function peg$parsecolor() {
      var s0, s1, s2, s3, s4;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 35) {
        s1 = peg$c29;
        peg$currPos++;
      } else {
        s1 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c30); }
      }
      if (s1 !== null) {
        s2 = peg$currPos;
        s3 = [];
        if (peg$c149.test(input.charAt(peg$currPos))) {
          s4 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s4 = null;
          if (peg$silentFails === 0) { peg$fail(peg$c150); }
        }
        if (s4 !== null) {
          while (s4 !== null) {
            s3.push(s4);
            if (peg$c149.test(input.charAt(peg$currPos))) {
              s4 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s4 = null;
              if (peg$silentFails === 0) { peg$fail(peg$c150); }
            }
          }
        } else {
          s3 = peg$c0;
        }
        if (s3 !== null) {
          s3 = input.substring(s2, peg$currPos);
        }
        s2 = s3;
        if (s2 !== null) {
          peg$reportedPos = s0;
          s1 = peg$c151(s2);
          if (s1 === null) {
            peg$currPos = s0;
            s0 = s1;
          } else {
            s0 = s1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsefunction() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 9).toLowerCase() === peg$c152) {
        s1 = input.substr(peg$currPos, 9);
        peg$currPos += 9;
      } else {
        s1 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c153); }
      }
      if (s1 !== null) {
        s2 = peg$parse_();
        if (s2 !== null) {
          s3 = peg$parseparameterList();
          if (s3 !== null) {
            s4 = peg$parse_();
            if (s4 !== null) {
              s5 = peg$parseruleList();
              if (s5 !== null) {
                peg$reportedPos = s0;
                s1 = peg$c154(s3,s5);
                if (s1 === null) {
                  peg$currPos = s0;
                  s0 = s1;
                } else {
                  s0 = s1;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseparameterList() {
      var s0, s1, s2, s3, s4, s5, s6;

      s0 = peg$currPos;
      s1 = peg$parseparameters();
      if (s1 !== null) {
        s2 = peg$currPos;
        s3 = peg$parse_();
        if (s3 !== null) {
          if (input.charCodeAt(peg$currPos) === 44) {
            s4 = peg$c8;
            peg$currPos++;
          } else {
            s4 = null;
            if (peg$silentFails === 0) { peg$fail(peg$c9); }
          }
          if (s4 !== null) {
            s5 = peg$parse_();
            if (s5 !== null) {
              s6 = peg$parserestParameter();
              if (s6 !== null) {
                peg$reportedPos = s2;
                s3 = peg$c155(s6);
                if (s3 === null) {
                  peg$currPos = s2;
                  s2 = s3;
                } else {
                  s2 = s3;
                }
              } else {
                peg$currPos = s2;
                s2 = peg$c0;
              }
            } else {
              peg$currPos = s2;
              s2 = peg$c0;
            }
          } else {
            peg$currPos = s2;
            s2 = peg$c0;
          }
        } else {
          peg$currPos = s2;
          s2 = peg$c0;
        }
        if (s2 === null) {
          s2 = peg$c1;
        }
        if (s2 !== null) {
          peg$reportedPos = s0;
          s1 = peg$c156(s1,s2);
          if (s1 === null) {
            peg$currPos = s0;
            s0 = s1;
          } else {
            s0 = s1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }
      if (s0 === null) {
        s0 = peg$currPos;
        s1 = peg$parserestParameter();
        if (s1 === null) {
          s1 = peg$c1;
        }
        if (s1 !== null) {
          peg$reportedPos = s0;
          s1 = peg$c157(s1);
        }
        if (s1 === null) {
          peg$currPos = s0;
          s0 = s1;
        } else {
          s0 = s1;
        }
      }

      return s0;
    }

    function peg$parseparameters() {
      var s0, s1, s2, s3, s4, s5, s6, s7;

      s0 = peg$currPos;
      s1 = peg$parseparameter();
      if (s1 !== null) {
        s2 = [];
        s3 = peg$currPos;
        s4 = peg$parse_();
        if (s4 !== null) {
          if (input.charCodeAt(peg$currPos) === 44) {
            s5 = peg$c8;
            peg$currPos++;
          } else {
            s5 = null;
            if (peg$silentFails === 0) { peg$fail(peg$c9); }
          }
          if (s5 !== null) {
            s6 = peg$parse_();
            if (s6 !== null) {
              s7 = peg$parseparameter();
              if (s7 !== null) {
                peg$reportedPos = s3;
                s4 = peg$c155(s7);
                if (s4 === null) {
                  peg$currPos = s3;
                  s3 = s4;
                } else {
                  s3 = s4;
                }
              } else {
                peg$currPos = s3;
                s3 = peg$c0;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$c0;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$c0;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$c0;
        }
        while (s3 !== null) {
          s2.push(s3);
          s3 = peg$currPos;
          s4 = peg$parse_();
          if (s4 !== null) {
            if (input.charCodeAt(peg$currPos) === 44) {
              s5 = peg$c8;
              peg$currPos++;
            } else {
              s5 = null;
              if (peg$silentFails === 0) { peg$fail(peg$c9); }
            }
            if (s5 !== null) {
              s6 = peg$parse_();
              if (s6 !== null) {
                s7 = peg$parseparameter();
                if (s7 !== null) {
                  peg$reportedPos = s3;
                  s4 = peg$c155(s7);
                  if (s4 === null) {
                    peg$currPos = s3;
                    s3 = s4;
                  } else {
                    s3 = s4;
                  }
                } else {
                  peg$currPos = s3;
                  s3 = peg$c0;
                }
              } else {
                peg$currPos = s3;
                s3 = peg$c0;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$c0;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$c0;
          }
        }
        if (s2 !== null) {
          peg$reportedPos = s0;
          s1 = peg$c6(s1,s2);
          if (s1 === null) {
            peg$currPos = s0;
            s0 = s1;
          } else {
            s0 = s1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseparameter() {
      var s0, s1, s2, s3, s4, s5, s6;

      s0 = peg$currPos;
      s1 = peg$parsevariable();
      if (s1 !== null) {
        s2 = peg$currPos;
        s3 = peg$parse_();
        if (s3 !== null) {
          if (input.charCodeAt(peg$currPos) === 61) {
            s4 = peg$c47;
            peg$currPos++;
          } else {
            s4 = null;
            if (peg$silentFails === 0) { peg$fail(peg$c48); }
          }
          if (s4 !== null) {
            s5 = peg$parse_();
            if (s5 !== null) {
              s6 = peg$parsenonCommaList();
              if (s6 !== null) {
                peg$reportedPos = s2;
                s3 = peg$c10(s6);
                if (s3 === null) {
                  peg$currPos = s2;
                  s2 = s3;
                } else {
                  s2 = s3;
                }
              } else {
                peg$currPos = s2;
                s2 = peg$c0;
              }
            } else {
              peg$currPos = s2;
              s2 = peg$c0;
            }
          } else {
            peg$currPos = s2;
            s2 = peg$c0;
          }
        } else {
          peg$currPos = s2;
          s2 = peg$c0;
        }
        if (s2 === null) {
          s2 = peg$c1;
        }
        if (s2 !== null) {
          peg$reportedPos = s0;
          s1 = peg$c158(s1,s2);
          if (s1 === null) {
            peg$currPos = s0;
            s0 = s1;
          } else {
            s0 = s1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parserestParameter() {
      var s0, s1, s2;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 3) === peg$c159) {
        s1 = peg$c159;
        peg$currPos += 3;
      } else {
        s1 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c160); }
      }
      if (s1 !== null) {
        s2 = peg$parsevariable();
        if (s2 !== null) {
          peg$reportedPos = s0;
          s1 = peg$c161(s2);
          if (s1 === null) {
            peg$currPos = s0;
            s0 = s1;
          } else {
            s0 = s1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseboolean() {
      var s0, s1;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 4).toLowerCase() === peg$c162) {
        s1 = input.substr(peg$currPos, 4);
        peg$currPos += 4;
      } else {
        s1 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c163); }
      }
      if (s1 !== null) {
        peg$reportedPos = s0;
        s1 = peg$c164();
      }
      if (s1 === null) {
        peg$currPos = s0;
        s0 = s1;
      } else {
        s0 = s1;
      }
      if (s0 === null) {
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 5).toLowerCase() === peg$c165) {
          s1 = input.substr(peg$currPos, 5);
          peg$currPos += 5;
        } else {
          s1 = null;
          if (peg$silentFails === 0) { peg$fail(peg$c166); }
        }
        if (s1 !== null) {
          peg$reportedPos = s0;
          s1 = peg$c167();
        }
        if (s1 === null) {
          peg$currPos = s0;
          s0 = s1;
        } else {
          s0 = s1;
        }
      }

      return s0;
    }

    function peg$parsenull() {
      var s0, s1;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 4).toLowerCase() === peg$c168) {
        s1 = input.substr(peg$currPos, 4);
        peg$currPos += 4;
      } else {
        s1 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c169); }
      }
      if (s1 !== null) {
        peg$reportedPos = s0;
        s1 = peg$c170();
      }
      if (s1 === null) {
        peg$currPos = s0;
        s0 = s1;
      } else {
        s0 = s1;
      }

      return s0;
    }

    function peg$parseassignment() {
      var s0, s1, s2, s3, s4, s5, s6, s7;

      s0 = peg$currPos;
      s1 = peg$parsevariable();
      if (s1 !== null) {
        s2 = peg$parse_();
        if (s2 !== null) {
          s3 = peg$currPos;
          s4 = peg$currPos;
          if (peg$c171.test(input.charAt(peg$currPos))) {
            s5 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s5 = null;
            if (peg$silentFails === 0) { peg$fail(peg$c172); }
          }
          if (s5 === null) {
            s5 = peg$c1;
          }
          if (s5 !== null) {
            if (input.charCodeAt(peg$currPos) === 61) {
              s6 = peg$c47;
              peg$currPos++;
            } else {
              s6 = null;
              if (peg$silentFails === 0) { peg$fail(peg$c48); }
            }
            if (s6 !== null) {
              s5 = [s5, s6];
              s4 = s5;
            } else {
              peg$currPos = s4;
              s4 = peg$c0;
            }
          } else {
            peg$currPos = s4;
            s4 = peg$c0;
          }
          if (s4 !== null) {
            s4 = input.substring(s3, peg$currPos);
          }
          s3 = s4;
          if (s3 !== null) {
            s4 = peg$parse_();
            if (s4 !== null) {
              s5 = peg$parselist();
              if (s5 !== null) {
                s6 = peg$parse_();
                if (s6 !== null) {
                  s7 = peg$parsesemicolon();
                  if (s7 !== null) {
                    peg$reportedPos = s0;
                    s1 = peg$c173(s1,s3,s5);
                    if (s1 === null) {
                      peg$currPos = s0;
                      s0 = s1;
                    } else {
                      s0 = s1;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c0;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsemedia() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 6).toLowerCase() === peg$c174) {
        s1 = input.substr(peg$currPos, 6);
        peg$currPos += 6;
      } else {
        s1 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c175); }
      }
      if (s1 !== null) {
        s2 = peg$parse_();
        if (s2 !== null) {
          s3 = peg$parsemediaQueryList();
          if (s3 !== null) {
            s4 = peg$parse_();
            if (s4 !== null) {
              s5 = peg$parseruleList();
              if (s5 !== null) {
                peg$reportedPos = s0;
                s1 = peg$c176(s3,s5);
                if (s1 === null) {
                  peg$currPos = s0;
                  s0 = s1;
                } else {
                  s0 = s1;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsemediaQueryList() {
      var s0, s1, s2, s3, s4, s5, s6, s7;

      s0 = peg$currPos;
      s1 = peg$parsemediaQuery();
      if (s1 !== null) {
        s2 = [];
        s3 = peg$currPos;
        s4 = peg$parse_();
        if (s4 !== null) {
          if (input.charCodeAt(peg$currPos) === 44) {
            s5 = peg$c8;
            peg$currPos++;
          } else {
            s5 = null;
            if (peg$silentFails === 0) { peg$fail(peg$c9); }
          }
          if (s5 !== null) {
            s6 = peg$parse_();
            if (s6 !== null) {
              s7 = peg$parsemediaQuery();
              if (s7 !== null) {
                peg$reportedPos = s3;
                s4 = peg$c177(s7);
                if (s4 === null) {
                  peg$currPos = s3;
                  s3 = s4;
                } else {
                  s3 = s4;
                }
              } else {
                peg$currPos = s3;
                s3 = peg$c0;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$c0;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$c0;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$c0;
        }
        while (s3 !== null) {
          s2.push(s3);
          s3 = peg$currPos;
          s4 = peg$parse_();
          if (s4 !== null) {
            if (input.charCodeAt(peg$currPos) === 44) {
              s5 = peg$c8;
              peg$currPos++;
            } else {
              s5 = null;
              if (peg$silentFails === 0) { peg$fail(peg$c9); }
            }
            if (s5 !== null) {
              s6 = peg$parse_();
              if (s6 !== null) {
                s7 = peg$parsemediaQuery();
                if (s7 !== null) {
                  peg$reportedPos = s3;
                  s4 = peg$c177(s7);
                  if (s4 === null) {
                    peg$currPos = s3;
                    s3 = s4;
                  } else {
                    s3 = s4;
                  }
                } else {
                  peg$currPos = s3;
                  s3 = peg$c0;
                }
              } else {
                peg$currPos = s3;
                s3 = peg$c0;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$c0;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$c0;
          }
        }
        if (s2 !== null) {
          peg$reportedPos = s0;
          s1 = peg$c178(s1,s2);
          if (s1 === null) {
            peg$currPos = s0;
            s0 = s1;
          } else {
            s0 = s1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsemediaQuery() {
      var s0, s1, s2, s3, s4, s5, s6, s7;

      s0 = peg$currPos;
      s1 = peg$parsemediaInterpolation();
      if (s1 === null) {
        s1 = peg$parsemediaType();
        if (s1 === null) {
          s1 = peg$parsemediaFeature();
        }
      }
      if (s1 !== null) {
        s2 = [];
        s3 = peg$currPos;
        s4 = peg$parse_();
        if (s4 !== null) {
          if (input.substr(peg$currPos, 3).toLowerCase() === peg$c89) {
            s5 = input.substr(peg$currPos, 3);
            peg$currPos += 3;
          } else {
            s5 = null;
            if (peg$silentFails === 0) { peg$fail(peg$c90); }
          }
          if (s5 !== null) {
            s6 = peg$parse_();
            if (s6 !== null) {
              s7 = peg$parsemediaInterpolation();
              if (s7 === null) {
                s7 = peg$parsemediaFeature();
              }
              if (s7 !== null) {
                peg$reportedPos = s3;
                s4 = peg$c179(s7);
                if (s4 === null) {
                  peg$currPos = s3;
                  s3 = s4;
                } else {
                  s3 = s4;
                }
              } else {
                peg$currPos = s3;
                s3 = peg$c0;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$c0;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$c0;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$c0;
        }
        while (s3 !== null) {
          s2.push(s3);
          s3 = peg$currPos;
          s4 = peg$parse_();
          if (s4 !== null) {
            if (input.substr(peg$currPos, 3).toLowerCase() === peg$c89) {
              s5 = input.substr(peg$currPos, 3);
              peg$currPos += 3;
            } else {
              s5 = null;
              if (peg$silentFails === 0) { peg$fail(peg$c90); }
            }
            if (s5 !== null) {
              s6 = peg$parse_();
              if (s6 !== null) {
                s7 = peg$parsemediaInterpolation();
                if (s7 === null) {
                  s7 = peg$parsemediaFeature();
                }
                if (s7 !== null) {
                  peg$reportedPos = s3;
                  s4 = peg$c179(s7);
                  if (s4 === null) {
                    peg$currPos = s3;
                    s3 = s4;
                  } else {
                    s3 = s4;
                  }
                } else {
                  peg$currPos = s3;
                  s3 = peg$c0;
                }
              } else {
                peg$currPos = s3;
                s3 = peg$c0;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$c0;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$c0;
          }
        }
        if (s2 !== null) {
          peg$reportedPos = s0;
          s1 = peg$c180(s1,s2);
          if (s1 === null) {
            peg$currPos = s0;
            s0 = s1;
          } else {
            s0 = s1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsemediaInterpolation() {
      var s0, s1;

      s0 = peg$currPos;
      s1 = peg$parsevariable();
      if (s1 !== null) {
        peg$reportedPos = s0;
        s1 = peg$c181(s1);
      }
      if (s1 === null) {
        peg$currPos = s0;
        s0 = s1;
      } else {
        s0 = s1;
      }

      return s0;
    }

    function peg$parsemediaType() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      s1 = peg$currPos;
      if (input.substr(peg$currPos, 4).toLowerCase() === peg$c182) {
        s2 = input.substr(peg$currPos, 4);
        peg$currPos += 4;
      } else {
        s2 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c183); }
      }
      if (s2 === null) {
        if (input.substr(peg$currPos, 3).toLowerCase() === peg$c184) {
          s2 = input.substr(peg$currPos, 3);
          peg$currPos += 3;
        } else {
          s2 = null;
          if (peg$silentFails === 0) { peg$fail(peg$c185); }
        }
      }
      if (s2 !== null) {
        s3 = peg$parse_();
        if (s3 !== null) {
          peg$reportedPos = s1;
          s2 = peg$c186(s2);
          if (s2 === null) {
            peg$currPos = s1;
            s1 = s2;
          } else {
            s1 = s2;
          }
        } else {
          peg$currPos = s1;
          s1 = peg$c0;
        }
      } else {
        peg$currPos = s1;
        s1 = peg$c0;
      }
      if (s1 === null) {
        s1 = peg$c1;
      }
      if (s1 !== null) {
        s2 = peg$parseidentifier();
        if (s2 !== null) {
          peg$reportedPos = s0;
          s1 = peg$c187(s1,s2);
          if (s1 === null) {
            peg$currPos = s0;
            s0 = s1;
          } else {
            s0 = s1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsemediaFeature() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 40) {
        s1 = peg$c56;
        peg$currPos++;
      } else {
        s1 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c57); }
      }
      if (s1 !== null) {
        s2 = peg$parse_();
        if (s2 !== null) {
          s3 = peg$parseidentifier();
          if (s3 !== null) {
            s4 = peg$parse_();
            if (s4 !== null) {
              s5 = peg$currPos;
              if (input.charCodeAt(peg$currPos) === 58) {
                s6 = peg$c61;
                peg$currPos++;
              } else {
                s6 = null;
                if (peg$silentFails === 0) { peg$fail(peg$c62); }
              }
              if (s6 !== null) {
                s7 = peg$parse_();
                if (s7 !== null) {
                  s8 = peg$parselist();
                  if (s8 !== null) {
                    s9 = peg$parse_();
                    if (s9 !== null) {
                      peg$reportedPos = s5;
                      s6 = peg$c188(s8);
                      if (s6 === null) {
                        peg$currPos = s5;
                        s5 = s6;
                      } else {
                        s5 = s6;
                      }
                    } else {
                      peg$currPos = s5;
                      s5 = peg$c0;
                    }
                  } else {
                    peg$currPos = s5;
                    s5 = peg$c0;
                  }
                } else {
                  peg$currPos = s5;
                  s5 = peg$c0;
                }
              } else {
                peg$currPos = s5;
                s5 = peg$c0;
              }
              if (s5 === null) {
                s5 = peg$c1;
              }
              if (s5 !== null) {
                if (input.charCodeAt(peg$currPos) === 41) {
                  s6 = peg$c58;
                  peg$currPos++;
                } else {
                  s6 = null;
                  if (peg$silentFails === 0) { peg$fail(peg$c59); }
                }
                if (s6 !== null) {
                  peg$reportedPos = s0;
                  s1 = peg$c189(s3,s5);
                  if (s1 === null) {
                    peg$currPos = s0;
                    s0 = s1;
                  } else {
                    s0 = s1;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseextend() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 7).toLowerCase() === peg$c190) {
        s1 = input.substr(peg$currPos, 7);
        peg$currPos += 7;
      } else {
        s1 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c191); }
      }
      if (s1 !== null) {
        s2 = peg$parse_();
        if (s2 !== null) {
          s3 = peg$parseselectorList();
          if (s3 !== null) {
            s4 = peg$parse_();
            if (s4 !== null) {
              s5 = peg$parsesemicolon();
              if (s5 !== null) {
                peg$reportedPos = s0;
                s1 = peg$c192(s3);
                if (s1 === null) {
                  peg$currPos = s0;
                  s0 = s1;
                } else {
                  s0 = s1;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsevoid() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 5).toLowerCase() === peg$c193) {
        s1 = input.substr(peg$currPos, 5);
        peg$currPos += 5;
      } else {
        s1 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c194); }
      }
      if (s1 !== null) {
        s2 = peg$parse_();
        if (s2 !== null) {
          s3 = peg$parseruleList();
          if (s3 !== null) {
            peg$reportedPos = s0;
            s1 = peg$c195(s3);
            if (s1 === null) {
              peg$currPos = s0;
              s0 = s1;
            } else {
              s0 = s1;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseblock() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 6).toLowerCase() === peg$c196) {
        s1 = input.substr(peg$currPos, 6);
        peg$currPos += 6;
      } else {
        s1 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c197); }
      }
      if (s1 !== null) {
        s2 = peg$parse_();
        if (s2 !== null) {
          s3 = peg$parseruleList();
          if (s3 !== null) {
            peg$reportedPos = s0;
            s1 = peg$c198(s3);
            if (s1 === null) {
              peg$currPos = s0;
              s0 = s1;
            } else {
              s0 = s1;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseimport() {
      var s0, s1, s2, s3, s4, s5, s6, s7;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 7).toLowerCase() === peg$c199) {
        s1 = input.substr(peg$currPos, 7);
        peg$currPos += 7;
      } else {
        s1 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c200); }
      }
      if (s1 !== null) {
        s2 = peg$parse_();
        if (s2 !== null) {
          s3 = peg$parsestring();
          if (s3 === null) {
            s3 = peg$parseurl();
            if (s3 === null) {
              s3 = peg$parsevariable();
            }
          }
          if (s3 !== null) {
            s4 = peg$parse_();
            if (s4 !== null) {
              s5 = peg$currPos;
              s6 = peg$parsemediaQueryList();
              if (s6 !== null) {
                s7 = peg$parse_();
                if (s7 !== null) {
                  peg$reportedPos = s5;
                  s6 = peg$c186(s6);
                  if (s6 === null) {
                    peg$currPos = s5;
                    s5 = s6;
                  } else {
                    s5 = s6;
                  }
                } else {
                  peg$currPos = s5;
                  s5 = peg$c0;
                }
              } else {
                peg$currPos = s5;
                s5 = peg$c0;
              }
              if (s5 === null) {
                s5 = peg$c1;
              }
              if (s5 !== null) {
                s6 = peg$parsesemicolon();
                if (s6 !== null) {
                  peg$reportedPos = s0;
                  s1 = peg$c201(s3,s5);
                  if (s1 === null) {
                    peg$currPos = s0;
                    s0 = s1;
                  } else {
                    s0 = s1;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseurl() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 4).toLowerCase() === peg$c202) {
        s1 = input.substr(peg$currPos, 4);
        peg$currPos += 4;
      } else {
        s1 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c203); }
      }
      if (s1 !== null) {
        s2 = peg$parse_();
        if (s2 !== null) {
          s3 = peg$parsestring();
          if (s3 === null) {
            s3 = peg$parseurlAddr();
          }
          if (s3 !== null) {
            s4 = peg$parse_();
            if (s4 !== null) {
              if (input.charCodeAt(peg$currPos) === 41) {
                s5 = peg$c58;
                peg$currPos++;
              } else {
                s5 = null;
                if (peg$silentFails === 0) { peg$fail(peg$c59); }
              }
              if (s5 !== null) {
                peg$reportedPos = s0;
                s1 = peg$c204(s3);
                if (s1 === null) {
                  peg$currPos = s0;
                  s0 = s1;
                } else {
                  s0 = s1;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseurlAddr() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      s1 = peg$currPos;
      s2 = [];
      if (peg$c205.test(input.charAt(peg$currPos))) {
        s3 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s3 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c206); }
      }
      if (s3 !== null) {
        while (s3 !== null) {
          s2.push(s3);
          if (peg$c205.test(input.charAt(peg$currPos))) {
            s3 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s3 = null;
            if (peg$silentFails === 0) { peg$fail(peg$c206); }
          }
        }
      } else {
        s2 = peg$c0;
      }
      if (s2 !== null) {
        s2 = input.substring(s1, peg$currPos);
      }
      s1 = s2;
      if (s1 !== null) {
        peg$reportedPos = s0;
        s1 = peg$c207(s1);
      }
      if (s1 === null) {
        peg$currPos = s0;
        s0 = s1;
      } else {
        s0 = s1;
      }

      return s0;
    }

    function peg$parseif() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 3).toLowerCase() === peg$c208) {
        s1 = input.substr(peg$currPos, 3);
        peg$currPos += 3;
      } else {
        s1 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c209); }
      }
      if (s1 !== null) {
        s2 = peg$parse_();
        if (s2 !== null) {
          s3 = peg$parselist();
          if (s3 !== null) {
            s4 = peg$parse_();
            if (s4 !== null) {
              s5 = peg$parseruleList();
              if (s5 !== null) {
                s6 = peg$currPos;
                s7 = peg$parse_();
                if (s7 !== null) {
                  s8 = peg$parseelseIf();
                  if (s8 === null) {
                    s8 = peg$parseelse();
                  }
                  if (s8 !== null) {
                    peg$reportedPos = s6;
                    s7 = peg$c87(s8);
                    if (s7 === null) {
                      peg$currPos = s6;
                      s6 = s7;
                    } else {
                      s6 = s7;
                    }
                  } else {
                    peg$currPos = s6;
                    s6 = peg$c0;
                  }
                } else {
                  peg$currPos = s6;
                  s6 = peg$c0;
                }
                if (s6 === null) {
                  s6 = peg$c1;
                }
                if (s6 !== null) {
                  peg$reportedPos = s0;
                  s1 = peg$c210(s3,s5,s6);
                  if (s1 === null) {
                    peg$currPos = s0;
                    s0 = s1;
                  } else {
                    s0 = s1;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseelseIf() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 5).toLowerCase() === peg$c211) {
        s1 = input.substr(peg$currPos, 5);
        peg$currPos += 5;
      } else {
        s1 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c212); }
      }
      if (s1 !== null) {
        s2 = peg$parse_();
        if (s2 !== null) {
          if (input.substr(peg$currPos, 2).toLowerCase() === peg$c213) {
            s3 = input.substr(peg$currPos, 2);
            peg$currPos += 2;
          } else {
            s3 = null;
            if (peg$silentFails === 0) { peg$fail(peg$c214); }
          }
          if (s3 !== null) {
            s4 = peg$parse_();
            if (s4 !== null) {
              s5 = peg$parselist();
              if (s5 !== null) {
                s6 = peg$parse_();
                if (s6 !== null) {
                  s7 = peg$parseruleList();
                  if (s7 !== null) {
                    s8 = peg$currPos;
                    s9 = peg$parse_();
                    if (s9 !== null) {
                      s10 = peg$parseelseIf();
                      if (s10 === null) {
                        s10 = peg$parseelse();
                      }
                      if (s10 !== null) {
                        peg$reportedPos = s8;
                        s9 = peg$c87(s10);
                        if (s9 === null) {
                          peg$currPos = s8;
                          s8 = s9;
                        } else {
                          s8 = s9;
                        }
                      } else {
                        peg$currPos = s8;
                        s8 = peg$c0;
                      }
                    } else {
                      peg$currPos = s8;
                      s8 = peg$c0;
                    }
                    if (s8 === null) {
                      s8 = peg$c1;
                    }
                    if (s8 !== null) {
                      peg$reportedPos = s0;
                      s1 = peg$c210(s5,s7,s8);
                      if (s1 === null) {
                        peg$currPos = s0;
                        s0 = s1;
                      } else {
                        s0 = s1;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$c0;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c0;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseelse() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 5).toLowerCase() === peg$c211) {
        s1 = input.substr(peg$currPos, 5);
        peg$currPos += 5;
      } else {
        s1 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c212); }
      }
      if (s1 !== null) {
        s2 = peg$parse_();
        if (s2 !== null) {
          s3 = peg$parseruleList();
          if (s3 !== null) {
            peg$reportedPos = s0;
            s1 = peg$c215(s3);
            if (s1 === null) {
              peg$currPos = s0;
              s0 = s1;
            } else {
              s0 = s1;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsefor() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 4).toLowerCase() === peg$c216) {
        s1 = input.substr(peg$currPos, 4);
        peg$currPos += 4;
      } else {
        s1 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c217); }
      }
      if (s1 !== null) {
        s2 = peg$parse_();
        if (s2 !== null) {
          s3 = peg$parsevariable();
          if (s3 !== null) {
            s4 = peg$parse_();
            if (s4 !== null) {
              s5 = peg$currPos;
              if (input.charCodeAt(peg$currPos) === 44) {
                s6 = peg$c8;
                peg$currPos++;
              } else {
                s6 = null;
                if (peg$silentFails === 0) { peg$fail(peg$c9); }
              }
              if (s6 !== null) {
                s7 = peg$parse_();
                if (s7 !== null) {
                  s8 = peg$parsevariable();
                  if (s8 !== null) {
                    s9 = peg$parse_();
                    if (s9 !== null) {
                      peg$reportedPos = s5;
                      s6 = peg$c218(s8);
                      if (s6 === null) {
                        peg$currPos = s5;
                        s5 = s6;
                      } else {
                        s5 = s6;
                      }
                    } else {
                      peg$currPos = s5;
                      s5 = peg$c0;
                    }
                  } else {
                    peg$currPos = s5;
                    s5 = peg$c0;
                  }
                } else {
                  peg$currPos = s5;
                  s5 = peg$c0;
                }
              } else {
                peg$currPos = s5;
                s5 = peg$c0;
              }
              if (s5 === null) {
                s5 = peg$c1;
              }
              if (s5 !== null) {
                s6 = peg$currPos;
                if (input.substr(peg$currPos, 2).toLowerCase() === peg$c219) {
                  s7 = input.substr(peg$currPos, 2);
                  peg$currPos += 2;
                } else {
                  s7 = null;
                  if (peg$silentFails === 0) { peg$fail(peg$c220); }
                }
                if (s7 !== null) {
                  s8 = peg$parse_();
                  if (s8 !== null) {
                    s9 = peg$parseadditive();
                    if (s9 !== null) {
                      s10 = peg$parse_();
                      if (s10 !== null) {
                        peg$reportedPos = s6;
                        s7 = peg$c64(s9);
                        if (s7 === null) {
                          peg$currPos = s6;
                          s6 = s7;
                        } else {
                          s6 = s7;
                        }
                      } else {
                        peg$currPos = s6;
                        s6 = peg$c0;
                      }
                    } else {
                      peg$currPos = s6;
                      s6 = peg$c0;
                    }
                  } else {
                    peg$currPos = s6;
                    s6 = peg$c0;
                  }
                } else {
                  peg$currPos = s6;
                  s6 = peg$c0;
                }
                if (s6 === null) {
                  s6 = peg$c1;
                }
                if (s6 !== null) {
                  if (input.substr(peg$currPos, 2).toLowerCase() === peg$c221) {
                    s7 = input.substr(peg$currPos, 2);
                    peg$currPos += 2;
                  } else {
                    s7 = null;
                    if (peg$silentFails === 0) { peg$fail(peg$c222); }
                  }
                  if (s7 !== null) {
                    s8 = peg$parse_();
                    if (s8 !== null) {
                      s9 = peg$parselist();
                      if (s9 !== null) {
                        s10 = peg$parse_();
                        if (s10 !== null) {
                          s11 = peg$parseruleList();
                          if (s11 !== null) {
                            peg$reportedPos = s0;
                            s1 = peg$c223(s3,s5,s6,s9,s11);
                            if (s1 === null) {
                              peg$currPos = s0;
                              s0 = s1;
                            } else {
                              s0 = s1;
                            }
                          } else {
                            peg$currPos = s0;
                            s0 = peg$c0;
                          }
                        } else {
                          peg$currPos = s0;
                          s0 = peg$c0;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$c0;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$c0;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c0;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsemixin() {
      var s0, s1, s2, s3, s4, s5, s6;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 6).toLowerCase() === peg$c224) {
        s1 = input.substr(peg$currPos, 6);
        peg$currPos += 6;
      } else {
        s1 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c225); }
      }
      if (s1 !== null) {
        s2 = peg$parse_();
        if (s2 !== null) {
          s3 = peg$parsevariable();
          if (s3 !== null) {
            s4 = peg$parseargumentList();
            if (s4 !== null) {
              s5 = peg$parse_();
              if (s5 !== null) {
                s6 = peg$parsesemicolon();
                if (s6 !== null) {
                  peg$reportedPos = s0;
                  s1 = peg$c226(s3,s4);
                  if (s1 === null) {
                    peg$currPos = s0;
                    s0 = s1;
                  } else {
                    s0 = s1;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsereturn() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 7).toLowerCase() === peg$c227) {
        s1 = input.substr(peg$currPos, 7);
        peg$currPos += 7;
      } else {
        s1 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c228); }
      }
      if (s1 !== null) {
        s2 = peg$parse_();
        if (s2 !== null) {
          s3 = peg$parselist();
          if (s3 !== null) {
            s4 = peg$parse_();
            if (s4 !== null) {
              s5 = peg$parsesemicolon();
              if (s5 !== null) {
                peg$reportedPos = s0;
                s1 = peg$c229(s3);
                if (s1 === null) {
                  peg$currPos = s0;
                  s0 = s1;
                } else {
                  s0 = s1;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsekeyframes() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 64) {
        s1 = peg$c230;
        peg$currPos++;
      } else {
        s1 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c231); }
      }
      if (s1 !== null) {
        s2 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 45) {
          s3 = peg$c115;
          peg$currPos++;
        } else {
          s3 = null;
          if (peg$silentFails === 0) { peg$fail(peg$c116); }
        }
        if (s3 !== null) {
          s4 = peg$currPos;
          s5 = peg$currPos;
          if (peg$c232.test(input.charAt(peg$currPos))) {
            s6 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s6 = null;
            if (peg$silentFails === 0) { peg$fail(peg$c233); }
          }
          if (s6 !== null) {
            s7 = [];
            if (peg$c234.test(input.charAt(peg$currPos))) {
              s8 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s8 = null;
              if (peg$silentFails === 0) { peg$fail(peg$c235); }
            }
            while (s8 !== null) {
              s7.push(s8);
              if (peg$c234.test(input.charAt(peg$currPos))) {
                s8 = input.charAt(peg$currPos);
                peg$currPos++;
              } else {
                s8 = null;
                if (peg$silentFails === 0) { peg$fail(peg$c235); }
              }
            }
            if (s7 !== null) {
              s6 = [s6, s7];
              s5 = s6;
            } else {
              peg$currPos = s5;
              s5 = peg$c0;
            }
          } else {
            peg$currPos = s5;
            s5 = peg$c0;
          }
          if (s5 !== null) {
            s5 = input.substring(s4, peg$currPos);
          }
          s4 = s5;
          if (s4 !== null) {
            if (input.charCodeAt(peg$currPos) === 45) {
              s5 = peg$c115;
              peg$currPos++;
            } else {
              s5 = null;
              if (peg$silentFails === 0) { peg$fail(peg$c116); }
            }
            if (s5 !== null) {
              peg$reportedPos = s2;
              s3 = peg$c155(s4);
              if (s3 === null) {
                peg$currPos = s2;
                s2 = s3;
              } else {
                s2 = s3;
              }
            } else {
              peg$currPos = s2;
              s2 = peg$c0;
            }
          } else {
            peg$currPos = s2;
            s2 = peg$c0;
          }
        } else {
          peg$currPos = s2;
          s2 = peg$c0;
        }
        if (s2 === null) {
          s2 = peg$c1;
        }
        if (s2 !== null) {
          if (input.substr(peg$currPos, 9).toLowerCase() === peg$c236) {
            s3 = input.substr(peg$currPos, 9);
            peg$currPos += 9;
          } else {
            s3 = null;
            if (peg$silentFails === 0) { peg$fail(peg$c237); }
          }
          if (s3 !== null) {
            s4 = peg$parse_();
            if (s4 !== null) {
              s5 = peg$parseidentifier();
              if (s5 !== null) {
                s6 = peg$parse_();
                if (s6 !== null) {
                  s7 = peg$parsekeyframeList();
                  if (s7 !== null) {
                    peg$reportedPos = s0;
                    s1 = peg$c238(s2,s5,s7);
                    if (s1 === null) {
                      peg$currPos = s0;
                      s0 = s1;
                    } else {
                      s0 = s1;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c0;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsekeyframeList() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 123) {
        s1 = peg$c68;
        peg$currPos++;
      } else {
        s1 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c69); }
      }
      if (s1 !== null) {
        s2 = peg$parse_();
        if (s2 !== null) {
          s3 = peg$parsekeyframeRules();
          if (s3 === null) {
            s3 = peg$c1;
          }
          if (s3 !== null) {
            s4 = peg$parse_();
            if (s4 !== null) {
              if (input.charCodeAt(peg$currPos) === 125) {
                s5 = peg$c70;
                peg$currPos++;
              } else {
                s5 = null;
                if (peg$silentFails === 0) { peg$fail(peg$c71); }
              }
              if (s5 !== null) {
                peg$reportedPos = s0;
                s1 = peg$c239(s3);
                if (s1 === null) {
                  peg$currPos = s0;
                  s0 = s1;
                } else {
                  s0 = s1;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsekeyframeRules() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      s1 = peg$parsekeyframeRule();
      if (s1 !== null) {
        s2 = [];
        s3 = peg$currPos;
        s4 = peg$parse_();
        if (s4 !== null) {
          s5 = peg$parsekeyframeRule();
          if (s5 !== null) {
            peg$reportedPos = s3;
            s4 = peg$c240(s5);
            if (s4 === null) {
              peg$currPos = s3;
              s3 = s4;
            } else {
              s3 = s4;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$c0;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$c0;
        }
        while (s3 !== null) {
          s2.push(s3);
          s3 = peg$currPos;
          s4 = peg$parse_();
          if (s4 !== null) {
            s5 = peg$parsekeyframeRule();
            if (s5 !== null) {
              peg$reportedPos = s3;
              s4 = peg$c240(s5);
              if (s4 === null) {
                peg$currPos = s3;
                s3 = s4;
              } else {
                s3 = s4;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$c0;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$c0;
          }
        }
        if (s2 !== null) {
          peg$reportedPos = s0;
          s1 = peg$c241(s1,s2);
          if (s1 === null) {
            peg$currPos = s0;
            s0 = s1;
          } else {
            s0 = s1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsekeyframeRule() {
      var s0;

      s0 = peg$parsekeyframe();
      if (s0 === null) {
        s0 = peg$parseassignment();
      }

      return s0;
    }

    function peg$parsekeyframe() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      s1 = peg$parsekeyframeSelectorList();
      if (s1 !== null) {
        s2 = peg$parse_();
        if (s2 !== null) {
          s3 = peg$parsepropertyList();
          if (s3 !== null) {
            peg$reportedPos = s0;
            s1 = peg$c242(s1,s3);
            if (s1 === null) {
              peg$currPos = s0;
              s0 = s1;
            } else {
              s0 = s1;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsekeyframeSelectorList() {
      var s0, s1, s2, s3, s4, s5, s6, s7;

      s0 = peg$currPos;
      s1 = peg$parsekeyframeSelector();
      if (s1 !== null) {
        s2 = [];
        s3 = peg$currPos;
        s4 = peg$parse_();
        if (s4 !== null) {
          if (input.charCodeAt(peg$currPos) === 44) {
            s5 = peg$c8;
            peg$currPos++;
          } else {
            s5 = null;
            if (peg$silentFails === 0) { peg$fail(peg$c9); }
          }
          if (s5 !== null) {
            s6 = peg$parse_();
            if (s6 !== null) {
              s7 = peg$parsekeyframeSelector();
              if (s7 !== null) {
                peg$reportedPos = s3;
                s4 = peg$c240(s7);
                if (s4 === null) {
                  peg$currPos = s3;
                  s3 = s4;
                } else {
                  s3 = s4;
                }
              } else {
                peg$currPos = s3;
                s3 = peg$c0;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$c0;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$c0;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$c0;
        }
        while (s3 !== null) {
          s2.push(s3);
          s3 = peg$currPos;
          s4 = peg$parse_();
          if (s4 !== null) {
            if (input.charCodeAt(peg$currPos) === 44) {
              s5 = peg$c8;
              peg$currPos++;
            } else {
              s5 = null;
              if (peg$silentFails === 0) { peg$fail(peg$c9); }
            }
            if (s5 !== null) {
              s6 = peg$parse_();
              if (s6 !== null) {
                s7 = peg$parsekeyframeSelector();
                if (s7 !== null) {
                  peg$reportedPos = s3;
                  s4 = peg$c240(s7);
                  if (s4 === null) {
                    peg$currPos = s3;
                    s3 = s4;
                  } else {
                    s3 = s4;
                  }
                } else {
                  peg$currPos = s3;
                  s3 = peg$c0;
                }
              } else {
                peg$currPos = s3;
                s3 = peg$c0;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$c0;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$c0;
          }
        }
        if (s2 !== null) {
          peg$reportedPos = s0;
          s1 = peg$c243(s1,s2);
          if (s1 === null) {
            peg$currPos = s0;
            s0 = s1;
          } else {
            s0 = s1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsekeyframeSelector() {
      var s0, s1;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 4).toLowerCase() === peg$c244) {
        s1 = input.substr(peg$currPos, 4);
        peg$currPos += 4;
      } else {
        s1 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c245); }
      }
      if (s1 === null) {
        if (input.substr(peg$currPos, 2).toLowerCase() === peg$c246) {
          s1 = input.substr(peg$currPos, 2);
          peg$currPos += 2;
        } else {
          s1 = null;
          if (peg$silentFails === 0) { peg$fail(peg$c247); }
        }
        if (s1 === null) {
          s1 = peg$parsepercentage();
        }
      }
      if (s1 !== null) {
        peg$reportedPos = s0;
        s1 = peg$c248(s1);
      }
      if (s1 === null) {
        peg$currPos = s0;
        s0 = s1;
      } else {
        s0 = s1;
      }

      return s0;
    }

    function peg$parsepropertyList() {
      var s0, s1, s2, s3, s4;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 123) {
        s1 = peg$c68;
        peg$currPos++;
      } else {
        s1 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c69); }
      }
      if (s1 !== null) {
        s2 = peg$currPos;
        s3 = peg$parse_();
        if (s3 !== null) {
          s4 = peg$parsepropertyRules();
          if (s4 !== null) {
            peg$reportedPos = s2;
            s3 = peg$c249(s4);
            if (s3 === null) {
              peg$currPos = s2;
              s2 = s3;
            } else {
              s2 = s3;
            }
          } else {
            peg$currPos = s2;
            s2 = peg$c0;
          }
        } else {
          peg$currPos = s2;
          s2 = peg$c0;
        }
        if (s2 === null) {
          s2 = peg$c1;
        }
        if (s2 !== null) {
          s3 = peg$parse_();
          if (s3 !== null) {
            if (input.charCodeAt(peg$currPos) === 125) {
              s4 = peg$c70;
              peg$currPos++;
            } else {
              s4 = null;
              if (peg$silentFails === 0) { peg$fail(peg$c71); }
            }
            if (s4 !== null) {
              peg$reportedPos = s0;
              s1 = peg$c250(s2);
              if (s1 === null) {
                peg$currPos = s0;
                s0 = s1;
              } else {
                s0 = s1;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsepropertyRules() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      s1 = peg$parsepropertyRule();
      if (s1 !== null) {
        s2 = [];
        s3 = peg$currPos;
        s4 = peg$parse_();
        if (s4 !== null) {
          s5 = peg$parsepropertyRule();
          if (s5 !== null) {
            peg$reportedPos = s3;
            s4 = peg$c155(s5);
            if (s4 === null) {
              peg$currPos = s3;
              s3 = s4;
            } else {
              s3 = s4;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$c0;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$c0;
        }
        while (s3 !== null) {
          s2.push(s3);
          s3 = peg$currPos;
          s4 = peg$parse_();
          if (s4 !== null) {
            s5 = peg$parsepropertyRule();
            if (s5 !== null) {
              peg$reportedPos = s3;
              s4 = peg$c155(s5);
              if (s4 === null) {
                peg$currPos = s3;
                s3 = s4;
              } else {
                s3 = s4;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$c0;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$c0;
          }
        }
        if (s2 !== null) {
          peg$reportedPos = s0;
          s1 = peg$c6(s1,s2);
          if (s1 === null) {
            peg$currPos = s0;
            s0 = s1;
          } else {
            s0 = s1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsepropertyRule() {
      var s0;

      s0 = peg$parseproperty();
      if (s0 === null) {
        s0 = peg$parseassignment();
      }

      return s0;
    }

    function peg$parsefontFace() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 10).toLowerCase() === peg$c251) {
        s1 = input.substr(peg$currPos, 10);
        peg$currPos += 10;
      } else {
        s1 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c252); }
      }
      if (s1 !== null) {
        s2 = peg$parse_();
        if (s2 !== null) {
          s3 = peg$parsepropertyList();
          if (s3 !== null) {
            peg$reportedPos = s0;
            s1 = peg$c253(s3);
            if (s1 === null) {
              peg$currPos = s0;
              s0 = s1;
            } else {
              s0 = s1;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsemodule() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 7).toLowerCase() === peg$c254) {
        s1 = input.substr(peg$currPos, 7);
        peg$currPos += 7;
      } else {
        s1 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c255); }
      }
      if (s1 !== null) {
        s2 = peg$parse_();
        if (s2 !== null) {
          s3 = peg$parseadditive();
          if (s3 !== null) {
            s4 = peg$parse_();
            if (s4 !== null) {
              s5 = peg$currPos;
              if (input.substr(peg$currPos, 4) === peg$c256) {
                s6 = peg$c256;
                peg$currPos += 4;
              } else {
                s6 = null;
                if (peg$silentFails === 0) { peg$fail(peg$c257); }
              }
              if (s6 !== null) {
                s7 = peg$parse_();
                if (s7 !== null) {
                  s8 = peg$parselist();
                  if (s8 !== null) {
                    peg$reportedPos = s5;
                    s6 = peg$c10(s8);
                    if (s6 === null) {
                      peg$currPos = s5;
                      s5 = s6;
                    } else {
                      s5 = s6;
                    }
                  } else {
                    peg$currPos = s5;
                    s5 = peg$c0;
                  }
                } else {
                  peg$currPos = s5;
                  s5 = peg$c0;
                }
              } else {
                peg$currPos = s5;
                s5 = peg$c0;
              }
              if (s5 === null) {
                s5 = peg$c1;
              }
              if (s5 !== null) {
                s6 = peg$parse_();
                if (s6 !== null) {
                  s7 = peg$parseruleList();
                  if (s7 !== null) {
                    peg$reportedPos = s0;
                    s1 = peg$c258(s3,s5,s7);
                    if (s1 === null) {
                      peg$currPos = s0;
                      s0 = s1;
                    } else {
                      s0 = s1;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c0;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsepage() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 5).toLowerCase() === peg$c259) {
        s1 = input.substr(peg$currPos, 5);
        peg$currPos += 5;
      } else {
        s1 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c260); }
      }
      if (s1 !== null) {
        s2 = peg$currPos;
        s3 = peg$parse_();
        if (s3 !== null) {
          if (input.charCodeAt(peg$currPos) === 58) {
            s4 = peg$c61;
            peg$currPos++;
          } else {
            s4 = null;
            if (peg$silentFails === 0) { peg$fail(peg$c62); }
          }
          if (s4 !== null) {
            s5 = peg$parseidentifier();
            if (s5 !== null) {
              peg$reportedPos = s2;
              s3 = peg$c261(s5);
              if (s3 === null) {
                peg$currPos = s2;
                s2 = s3;
              } else {
                s2 = s3;
              }
            } else {
              peg$currPos = s2;
              s2 = peg$c0;
            }
          } else {
            peg$currPos = s2;
            s2 = peg$c0;
          }
        } else {
          peg$currPos = s2;
          s2 = peg$c0;
        }
        if (s2 === null) {
          s2 = peg$c1;
        }
        if (s2 !== null) {
          s3 = peg$parse_();
          if (s3 !== null) {
            s4 = peg$parsepropertyList();
            if (s4 !== null) {
              peg$reportedPos = s0;
              s1 = peg$c262(s2,s4);
              if (s1 === null) {
                peg$currPos = s0;
                s0 = s1;
              } else {
                s0 = s1;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsecharset() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 8).toLowerCase() === peg$c263) {
        s1 = input.substr(peg$currPos, 8);
        peg$currPos += 8;
      } else {
        s1 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c264); }
      }
      if (s1 !== null) {
        s2 = peg$parse_();
        if (s2 !== null) {
          s3 = peg$parsestring();
          if (s3 !== null) {
            s4 = peg$parse_();
            if (s4 !== null) {
              s5 = peg$parsesemicolon();
              if (s5 !== null) {
                peg$reportedPos = s0;
                s1 = peg$c265(s3);
                if (s1 === null) {
                  peg$currPos = s0;
                  s0 = s1;
                } else {
                  s0 = s1;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parse_() {
      var s0;

      s0 = peg$parses();
      if (s0 === null) {
        s0 = peg$c1;
      }

      return s0;
    }

    function peg$parses() {
      var s0, s1;

      s0 = [];
      s1 = peg$parsews();
      if (s1 === null) {
        s1 = peg$parsesingleLineComment();
        if (s1 === null) {
          s1 = peg$parsemultiLineComment();
        }
      }
      if (s1 !== null) {
        while (s1 !== null) {
          s0.push(s1);
          s1 = peg$parsews();
          if (s1 === null) {
            s1 = peg$parsesingleLineComment();
            if (s1 === null) {
              s1 = peg$parsemultiLineComment();
            }
          }
        }
      } else {
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsews() {
      var s0, s1;

      s0 = [];
      if (peg$c266.test(input.charAt(peg$currPos))) {
        s1 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s1 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c267); }
      }
      if (s1 !== null) {
        while (s1 !== null) {
          s0.push(s1);
          if (peg$c266.test(input.charAt(peg$currPos))) {
            s1 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s1 = null;
            if (peg$silentFails === 0) { peg$fail(peg$c267); }
          }
        }
      } else {
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsesingleLineComment() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 2) === peg$c268) {
        s1 = peg$c268;
        peg$currPos += 2;
      } else {
        s1 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c269); }
      }
      if (s1 !== null) {
        s2 = [];
        if (peg$c270.test(input.charAt(peg$currPos))) {
          s3 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s3 = null;
          if (peg$silentFails === 0) { peg$fail(peg$c271); }
        }
        while (s3 !== null) {
          s2.push(s3);
          if (peg$c270.test(input.charAt(peg$currPos))) {
            s3 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s3 = null;
            if (peg$silentFails === 0) { peg$fail(peg$c271); }
          }
        }
        if (s2 !== null) {
          s1 = [s1, s2];
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsemultiLineComment() {
      var s0, s1, s2, s3, s4, s5, s6;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 2) === peg$c272) {
        s1 = peg$c272;
        peg$currPos += 2;
      } else {
        s1 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c273); }
      }
      if (s1 !== null) {
        s2 = peg$currPos;
        s3 = [];
        if (peg$c274.test(input.charAt(peg$currPos))) {
          s4 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s4 = null;
          if (peg$silentFails === 0) { peg$fail(peg$c275); }
        }
        if (s4 === null) {
          s4 = peg$currPos;
          if (input.charCodeAt(peg$currPos) === 42) {
            s5 = peg$c23;
            peg$currPos++;
          } else {
            s5 = null;
            if (peg$silentFails === 0) { peg$fail(peg$c24); }
          }
          if (s5 !== null) {
            if (peg$c276.test(input.charAt(peg$currPos))) {
              s6 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s6 = null;
              if (peg$silentFails === 0) { peg$fail(peg$c277); }
            }
            if (s6 !== null) {
              s5 = [s5, s6];
              s4 = s5;
            } else {
              peg$currPos = s4;
              s4 = peg$c0;
            }
          } else {
            peg$currPos = s4;
            s4 = peg$c0;
          }
        }
        while (s4 !== null) {
          s3.push(s4);
          if (peg$c274.test(input.charAt(peg$currPos))) {
            s4 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s4 = null;
            if (peg$silentFails === 0) { peg$fail(peg$c275); }
          }
          if (s4 === null) {
            s4 = peg$currPos;
            if (input.charCodeAt(peg$currPos) === 42) {
              s5 = peg$c23;
              peg$currPos++;
            } else {
              s5 = null;
              if (peg$silentFails === 0) { peg$fail(peg$c24); }
            }
            if (s5 !== null) {
              if (peg$c276.test(input.charAt(peg$currPos))) {
                s6 = input.charAt(peg$currPos);
                peg$currPos++;
              } else {
                s6 = null;
                if (peg$silentFails === 0) { peg$fail(peg$c277); }
              }
              if (s6 !== null) {
                s5 = [s5, s6];
                s4 = s5;
              } else {
                peg$currPos = s4;
                s4 = peg$c0;
              }
            } else {
              peg$currPos = s4;
              s4 = peg$c0;
            }
          }
        }
        if (s3 !== null) {
          s3 = input.substring(s2, peg$currPos);
        }
        s2 = s3;
        if (s2 !== null) {
          if (input.substr(peg$currPos, 2) === peg$c278) {
            s3 = peg$c278;
            peg$currPos += 2;
          } else {
            s3 = null;
            if (peg$silentFails === 0) { peg$fail(peg$c279); }
          }
          if (s3 !== null) {
            peg$reportedPos = s0;
            s1 = peg$c207(s2);
            if (s1 === null) {
              peg$currPos = s0;
              s0 = s1;
            } else {
              s0 = s1;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsenl() {
      var s0;

      if (input.substr(peg$currPos, 2) === peg$c280) {
        s0 = peg$c280;
        peg$currPos += 2;
      } else {
        s0 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c281); }
      }
      if (s0 === null) {
        if (peg$c282.test(input.charAt(peg$currPos))) {
          s0 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s0 = null;
          if (peg$silentFails === 0) { peg$fail(peg$c283); }
        }
      }

      return s0;
    }


    	var loc = function() {
    		return options.loc || {
    			line: line(),
    			column: column(),
    			offset: offset(),
    			filename: options.filename
    		}
    	};


    peg$result = peg$startRuleFunction();

    if (peg$result !== null && peg$currPos === input.length) {
      return peg$result;
    } else {
      peg$cleanupExpected(peg$maxFailExpected);
      peg$reportedPos = Math.max(peg$currPos, peg$maxFailPos);

      throw new SyntaxError(
        peg$maxFailExpected,
        peg$reportedPos < input.length ? input.charAt(peg$reportedPos) : null,
        peg$reportedPos,
        peg$computePosDetails(peg$reportedPos).line,
        peg$computePosDetails(peg$reportedPos).column
      );
    }
  }

  return {
    SyntaxError: SyntaxError,
    parse      : parse
  };
})()


var parser = {};

parser.parse = function(input, options) {
	try {
		return generatedParser.parse(input, options);
	} catch(error) {
		if (error.line) {
			var found = error.found;
			switch (found) {
			case '\r':
			case '\n':
				found = 'new line';
				break;
			default:
				if (!found) {
					found = 'end of file';
				} else {
					found = "'" + found + "'";
				}
			}
			error.message = "unexpected " + found;

			if (options.loc) {
				error.loc = options.loc;
			} else {
				error.loc = {
					line: error.line,
					column: error.column,
					offset: error.offset,
					filename: options.filename
				};
			}
		}

		throw error;
	}
};

/**
 * Visitor
 *
 * Visit each node in the ast.
 */
var Visitor = function() {};

Visitor.prototype.visit = function(node) {
	if (Array.isArray(node)) {
		return this._visitNodes(node);
	}

	var visitedNode = this._visitNode(node);
	if (visitedNode === undefined) { visitedNode = node; }

	return visitedNode;
};

Visitor.prototype._visitNode = function(node) {
	if (node === null || typeof node !== 'object') {
		return;
	}

	var methodName = 'visit' + _.capitalize(node.type);
	var method = this[methodName] || this.visitNode;
	return method.call(this, node);
};

Visitor.prototype._visitNodes = function(nodes) {
	var i = 0;

	while (i < nodes.length) {
		var node = this._visitNode(nodes[i]);

		if (node === undefined) {
			++i;
			continue;
		}

		if (node === null) {
			if (nodes[i] === null) { ++i; }
			else { nodes.splice(i, 1); }
			continue;
		}

		if (!Array.isArray(node)) {
			nodes[i] = node;
			++i;
			continue;
		}

		nodes.splice.apply(nodes, [i, 1].concat(node));
		i += node.length;
	}

	return nodes;
};

Visitor.prototype.visitNode = function(node) {
	if (node.children) {
		this._visitNodes(node.children);
	}
};

/* jshint browser: true, node: false */

var loader = {};

loader.load = function(url, callback, context) {
	var xhr = new XMLHttpRequest();

	xhr.onreadystatechange = function() {
		if (xhr.readyState !== 4) {
			return;
		}

		if (xhr.status >= 200 && xhr.status < 300 || xhr.status === 304) {
			callback.call(context, null, xhr.responseText);
		} else {
			callback.call(context, new Error('Failed to request file ' + url + ': ' + xhr.status));
		}
	};

	// disable cache
	url += (url.indexOf('?') === -1 ? '?' : '&') + '_=' + Date.now();

	try {
		xhr.open('GET', url, true);
		xhr.send(null);
	} catch (error) {
		callback.call(context, error);
	}
};

/**
 * Importer
 *
 * Import files specified in the import nodes.
 */
var Importer = function() {};

Importer.prototype = new Visitor();

Importer.prototype.import = function(ast, options, callback) {
	this.imports = options.imports;
	this.imported = {};
	this.ast = ast;
	this.callback = callback;
	this.importing = 0;

	try {
		this.visit(ast);
	} catch (error) {
		return callback(error);
	}

	if (!this.importing) {
		callback(null, ast);
	}
};

Importer.prototype.visitRoot =
Importer.prototype.visitRuleset =
Importer.prototype.visitMedia =
Importer.prototype.visitVoid =
Importer.prototype.visitIf =
Importer.prototype.visitFor =
Importer.prototype.visitAssignment =
Importer.prototype.visitMixin =
Importer.prototype.visitBlock =
Importer.prototype.visitModule =
Importer.prototype.visitRuleList = Importer.prototype.visitNode;

Importer.prototype.visitNode = _.noop;

Importer.prototype.visitImport = function(importNode) {
	var mediaQueryListNode = importNode.children[1];
	if (mediaQueryListNode) {
		return;
	}

	var urlNode = importNode.children[0];
	if (urlNode.type !== 'string' || urlNode.children.length !== 1) {
		return;
	}

	var filename = urlNode.children[0];
	if (/^\w+:\/\//.test(filename)) {
		return;
	}

	if (!/\.[a-z]+$/i.test(filename)) {
		filename += '.roo';
	}
	filename = _.joinPaths(_.dirname(importNode.loc.filename), filename);

	if (this.imported[filename]) {
		return null;
	}

	this.imported[filename] = true;

	var content = this.imports[filename];
	if (typeof content === 'string') {
		var ast = parser.parse(content, {filename: filename});
		return this.visit(ast);
	}

	++this.importing;

	var callback = this.callback;

	loader.load(filename, function(error, content) {
		if (this.hasError) {
			return;
		}

		if (error) {
			this.hasError = true;
			return callback(error);
		}

		var rootNode;
		try {
			this.imports[filename] = content;
			rootNode = parser.parse(content, {filename: filename});
			this.visit(rootNode);
		} catch (error) {
			this.hasError = true;
			return callback(error);
		}

		Node.replace(rootNode, importNode);

		if (!--this.importing) {
			callback(null, this.ast);
		}
	}, this);
};

var importer = {};

importer.import = function(ast, options, callback) {
	new Importer().import(ast, options, callback);
};

/**
 * Scope
 *
 * Regulate lexical scoping.
 */
var Scope = function(scope) {
	this.scopes = scope instanceof Scope ?
		scope.scopes.slice(0) : [scope, {}];
};

Scope.prototype.add = function() {
	this.scopes.push({});
};

Scope.prototype.remove = function() {
	this.scopes.pop();
};

Scope.prototype.define = function(name, value) {
	this.scopes[this.scopes.length - 1][name] = value;
};

Scope.prototype.resolve = function(name) {
	var length = this.scopes.length;
	var value;

	while (length--) {
		value = this.scopes[length][name];
		if(value) {
			return value;
		}
	}
};

/**
 * Evaluator
 *
 * Eliminate dynamic constructs (e.g., variable, @if, @for).
 */
var Evaluator = function() {};

Evaluator.prototype = new Visitor();

Evaluator.prototype.evaluate = function(ast) {
	this.scope = new Scope(bif);

	return this.visit(ast);
};



Evaluator.prototype.visitRuleset = function(rulesetNode) {
	this.visit(rulesetNode.children[0]);

	this.scope.add();

	var ruleListNode = this.visit(rulesetNode.children[1]);

	this.scope.remove();

	if (!ruleListNode.children.length) {
		return null;
	}
};

Evaluator.prototype.visitSelector = function(selectorNode) {
	this.visit(selectorNode.children);

	var childNodes = [];
	var prevIsCombinator = false;
	selectorNode.children.forEach(function(childNode) {
		// make sure selector interpolation not to result in
		// two consecutive combinators
		if (childNode.type === 'combinator') {
			if (prevIsCombinator) {
				childNodes.pop();
			} else {
				prevIsCombinator = true;
			}
		} else {
			prevIsCombinator = false;
		}

		childNodes.push(childNode);
	}, this);

	selectorNode.children = childNodes;
};

Evaluator.prototype.visitSelectorInterpolation = function(selectorInterpolationNode) {
	this.visit(selectorInterpolationNode.children);

	var valueNode = selectorInterpolationNode.children[0];
	if (valueNode.type !== 'string') {
		selectorInterpolationNode.type = 'typeSelector';
		return;
	}

	var value = valueNode.children[0].trim();
	var options = {
		startRule: 'selector',
		loc: valueNode.loc
	};
	var selectorNode;

	try{
		selectorNode = parser.parse(value, options);
	} catch (error) {
		error.message = 'error parsing selector interpolation: ' + error.message;
		throw error;
	}

	return selectorNode.children;
};

Evaluator.prototype.visitClassSelector = function(classSelectorNode) {
	this.visit(classSelectorNode.children);

	var valueNode = classSelectorNode.children[0];
	if (valueNode.type !== 'identifier') {
		throw Err("'" + valueNode.type + "' can not be used in class selector", valueNode);
	}
	var value = valueNode.children[0];

	if (this.parentModuleName) {
		valueNode.children[0] = this.parentModuleName + value;
	}
};

Evaluator.prototype.visitAssignment = function(assignmentNode) {
	var variableNode = assignmentNode.children[0];
	var variableName = variableNode.children[0];
	var operator = assignmentNode.children[1];
	var valueNode = this.visit(assignmentNode.children[2]);

	switch (operator) {
	case '?=':
		if (!this.scope.resolve(variableName)) {
			this.scope.define(variableName, valueNode);
		}
		return null;

	case '=':
		this.scope.define(variableName, valueNode);
		return null;

	default:
		operator = operator.charAt(0);
		var oldValueNode = this.visit(variableNode);
		valueNode = this.visit(Node('arithmetic', [oldValueNode, operator, valueNode]));
		this.scope.define(variableName, valueNode);
		return null;
	}
};

Evaluator.prototype.visitCall = function(callNode) {
	var functionNode = this.visit(callNode.children[0]);

	if (typeof functionNode === 'function') {
		this.visit(callNode.children[1]);
		return functionNode.call(this, callNode);
	}

	if (functionNode.type === 'identifier') {
		this.visit(callNode.children[1]);
		callNode.children[0] = functionNode.children[0];
		return;
	}

	if (functionNode.type !== 'function') {
		throw Err("'" + functionNode.type + "' is not a 'function'", functionNode);
	}

	var argumentListNode = this.visit(callNode.children[1]);
	var argumentNodes = argumentListNode.children;

	var scope = this.scope;
	this.scope = functionNode.scope;
	this.scope.add();

	var listNode = Node.toListNode(argumentListNode);
	this.scope.define('arguments', listNode);

	var parameterListNode = functionNode.children[0];
	var parameterNodes = parameterListNode.children;

	parameterNodes.forEach(function(parameterNode, i) {
		var variableNode = parameterNode.children[0];
		var variableName = variableNode.children[0];

		if (parameterNode.type === 'restParameter') {
			var argListNode = Node('argumentList', argumentNodes.slice(i), {loc: argumentListNode.loc});
			var listNode = Node.toListNode(argListNode);
			this.scope.define(variableName, listNode);
		} else if (i < argumentNodes.length) {
			this.scope.define(variableName, argumentNodes[i]);
		} else {
			var valueNode = parameterNode.children[1];
			if (!valueNode) { valueNode = Node('null', {loc: argumentListNode.loc}); }

			this.scope.define(variableName, valueNode);
		}
	}, this);

	var ruleListClone = Node.clone(functionNode.children[1]);

	var context = this.context;

	var returnedNode;
	if (callNode.mixin) {
		this.context = 'mixin';
		returnedNode = this.visit(ruleListClone.children);
	} else {
		this.context = 'call';

		try {
			this.visit(ruleListClone);
		} catch (error) {
			if (error instanceof Error) {
				throw error;
			}

			returnedNode = error;
		}

		if (!returnedNode) {
			returnedNode = Node('null', {loc: callNode.loc});
		}
	}

	this.context = context;

	this.scope.remove();
	this.scope = scope;

	return returnedNode;
};

Evaluator.prototype.visitFunction = function(functionNode) {
	var parameterListNode = functionNode.children[0];
	parameterListNode.children.forEach(function(parameterNode) {
		if (parameterNode.type !== 'parameter') {
			return;
		}

		parameterNode.children[1] = this.visit(parameterNode.children[1]);
	}, this);

	functionNode.scope = new Scope(this.scope);
};

Evaluator.prototype.visitReturn = function(returnNode) {
	if (!this.context) {
		throw Err('@return is only allowed inside @function', returnNode);
	}

	if (this.context === 'call') {
		throw this.visit(returnNode.children[0]);
	}

	return null;
};

Evaluator.prototype.visitVariable = function(variableNode) {
	var variableName = variableNode.children[0];
	var valueNode = this.scope.resolve(variableName);

	if (!valueNode) {
		throw Err('$' + variableName + ' is undefined', variableNode);
	}

	valueNode = Node.clone(valueNode, false);
	valueNode.loc = variableNode.loc;

	return valueNode;
};

Evaluator.prototype.visitIdentifier = function(identifierNode) {
	var childNodes = this.visit(identifierNode.children);

	var value = childNodes.map(function(childNode) {
		var value = Node.toString(childNode);
		if (value === null) {
			throw Err("'" + childNode.type + "' is not allowed to be interpolated in 'identifier'", childNode);
		}

		return value;
	}, this).join('');

	identifierNode.children = [value];
};

Evaluator.prototype.visitString = function(stringNode) {
	if (stringNode.quote === "'") {
		return;
	}

	var childNodes = this.visit(stringNode.children);
	var value = childNodes.map(function(childNode) {
		var value = Node.toString(childNode);
		if (value === null) {
			throw Err("'" + childNode.type + "' is not allowed to be interpolated in 'string'", childNode);
		}

		if (childNode.type === 'string') {
			value = value.replace(/\\?"/g, function(quote) {
				return quote.length === 1 ? '\\"' : quote;
			});
		}

		return value;
	}, this).join('');
	stringNode.children = [value];
};

Evaluator.prototype.visitRange = function(rangeNode) {
	this.visit(rangeNode.children);

	var fromNode = rangeNode.children[0];
	var toNode = rangeNode.children[2];

	var invalidNode;
	if (Node.toNumber(fromNode) === null) {
		invalidNode = fromNode;
	} else if (Node.toNumber(toNode) === null) {
		invalidNode = toNode;
	}

	if (invalidNode) {
		throw Err("only numberic values are allowed in 'range'", invalidNode);
	}
};

Evaluator.prototype.visitLogical = function(logicalNode) {
	var leftNode = logicalNode.children[0];
	var operator = logicalNode.children[1];
	var rightNode = logicalNode.children[2];

	switch (operator) {
	case 'and':
		leftNode = this.visit(leftNode);
		if (!Node.toBoolean(leftNode)) {
			return leftNode;
		}

		return this.visit(rightNode);

	case 'or':
		leftNode = this.visit(leftNode);
		if (Node.toBoolean(leftNode)) {
			return leftNode;
		}

		return this.visit(rightNode);
	}
};

Evaluator.prototype.visitEquality = function(equalityNode) {
	var leftNode = this.visit(equalityNode.children[0]);
	var operator = equalityNode.children[1];
	var rightNode = this.visit(equalityNode.children[2]);

	var trueNode = function() {
		return Node('boolean', [true], {loc: leftNode.loc});
	};
	var falseNode = function() {
		return Node('boolean', [false], {loc: leftNode.loc});
	};

	switch (operator) {
	case 'is':
		return Node.equal(leftNode, rightNode) ? trueNode() : falseNode();
	case 'isnt':
		return !Node.equal(leftNode, rightNode) ? trueNode() : falseNode();
	}
};

Evaluator.prototype.visitRelational = function(relationalNode) {
	var leftNode = this.visit(relationalNode.children[0]);
	var operator = relationalNode.children[1];
	var rightNode = this.visit(relationalNode.children[2]);

	var trueNode = function() {
		return Node('boolean', [true], {loc: leftNode.loc});
	};
	var falseNode = function() {
		return Node('boolean', [false], {loc: leftNode.loc});
	};

	var leftValue, rightValue;
	if (
		leftNode.type === 'identifier' && rightNode.type === 'identifier' ||
		leftNode.type === 'string' && rightNode.type === 'string'
	) {
		leftValue = leftNode.children[0];
		rightValue = rightNode.children[0];
	} else {
		leftValue = Node.toNumber(leftNode);
		if (leftValue === null) {
			return falseNode();
		}

		rightValue = Node.toNumber(rightNode);
		if (rightValue === null) {
			return falseNode();
		}
	}

	switch (operator) {
	case '>':
		return leftValue > rightValue ? trueNode() : falseNode();
	case '>=':
		return leftValue >= rightValue ? trueNode() : falseNode();
	case '<':
		return leftValue < rightValue ? trueNode() : falseNode();
	case '<=':
		return leftValue <= rightValue ? trueNode() : falseNode();
	}
};

Evaluator.prototype.visitArithmetic = function(arithmeticNode) {
	var leftNode = this.visit(arithmeticNode.children[0]);
	var operator = arithmeticNode.children[1];
	var rightNode = this.visit(arithmeticNode.children[2]);

	switch (leftNode.type + ' ' + operator + ' ' + rightNode.type) {
	case 'number + number':
	case 'percentage + number':
	case 'percentage + percentage':
	case 'percentage + dimension':
	case 'dimension + number':
	case 'dimension + percentage':
	case 'dimension + dimension':
	case 'identifier + number':
	case 'identifier + boolean':
	case 'identifier + identifier':
	case 'string + number':
	case 'string + boolean':
	case 'string + identifier':
	case 'string + string':
		var leftClone = Node.clone(leftNode);
		leftClone.children[0] += rightNode.children[0];
		return leftClone;

	case 'identifier + percentage':
	case 'identifier + dimension':
	case 'string + dimension':
		var leftClone = Node.clone(leftNode);
		leftClone.children[0] += rightNode.children.join('');
		return leftClone;

	case 'string + percentage':
		var leftClone = Node.clone(leftNode);
		leftClone.children[0] += rightNode.children[0] + '%';
		return leftClone;

	case 'number + percentage':
	case 'number + dimension':
	case 'number + string':
	case 'boolean + identifier':
	case 'boolean + string':
	case 'identifier + string':
		var rightClone = Node.clone(rightNode);
		rightClone.children[0] = leftNode.children[0] + rightClone.children[0];
		return rightClone;

	case 'dimension + identifier':
	case 'dimension + string':
		var rightClone = Node.clone(rightNode);
		rightClone.children[0] = leftNode.children.join('') + rightClone.children[0];
		return rightClone;

	case 'percentage + string':
		var rightClone = Node.clone(rightNode);
		rightClone.children[0] = leftNode.children[0] + '%' + rightClone.children[0];
		return rightClone;

	case 'number - number':
	case 'percentage - percentage':
	case 'percentage - number':
	case 'percentage - dimension':
	case 'dimension - dimension':
	case 'dimension - number':
	case 'dimension - percentage':
		var leftClone = Node.clone(leftNode);
		leftClone.children[0] -= rightNode.children[0];
		return leftClone;

	case 'number - dimension':
	case 'number - percentage':
		var rightClone = Node.clone(rightNode);
		rightClone.children[0] = leftNode.children[0] - rightNode.children[0];
		return rightClone;

	case 'number * number':
	case 'percentage * percentage':
	case 'percentage * number':
	case 'percentage * dimension':
	case 'dimension * dimension':
	case 'dimension * number':
	case 'dimension * percentage':
		var leftClone = Node.clone(leftNode);
		leftClone.children[0] *= rightNode.children[0];
		return leftClone;

	case 'number * dimension':
	case 'number * percentage':
		var rightClone = Node.clone(rightNode);
		rightClone.children[0] = leftNode.children[0] * rightNode.children[0];
		return rightClone;

	case 'number / number':
	case 'percentage / percentage':
	case 'percentage / number':
	case 'percentage / dimension':
	case 'dimension / dimension':
	case 'dimension / number':
	case 'dimension / percentage':
		var divisor = rightNode.children[0];
		if (!divisor) {
			throw Err('divide by zero', rightNode);
		}

		var leftClone = Node.clone(leftNode);
		leftClone.children[0] /= divisor;
		return leftClone;

	case 'number / dimension':
	case 'number / percentage':
		var divisor = rightNode.children[0];
		if (!divisor) {
			throw Err('divide by zero', rightNode);
		}

		var rightClone = Node.clone(rightNode);
		rightClone.children[0] = leftNode.children[0] / divisor;
		return rightClone;

	case 'number % number':
	case 'number % percentage':
	case 'number % dimension':
	case 'percentage % number':
	case 'percentage % percentage':
	case 'percentage % dimension':
	case 'dimension % number':
	case 'dimension % percentage':
	case 'dimension % dimension':
		var leftClone = Node.clone(leftNode);
		leftClone.children[0] %= rightNode.children[0];
		return leftClone;
	}

	throw Err("unsupported binary operation: '" + leftNode.type + "' " + operator + " '" + rightNode.type + "'", leftNode);
};

Evaluator.prototype.visitUnary = function(unaryNode) {
	var operator = unaryNode.children[0];
	var operandNode = this.visit(unaryNode.children[1]);

	switch (operator + operandNode.type) {
	case '+number':
	case '+percentage':
	case '+dimension':
		var operandClone = Node.clone(operandNode);
		return operandClone;

	case '-number':
	case '-percentage':
	case '-dimension':
		var operandClone = Node.clone(operandNode);
		operandClone.children[0] = -operandClone.children[0];
		return operandClone;

	case '-identifier':
		var operandClone = Node.clone(operandNode);
		operandClone.children[0] = '-' + operandClone.children[0];
		return operandClone;
	}

	throw Err("unsupported unary operation: " + operator + "'" + operandNode.type + "'", unaryNode);
};

Evaluator.prototype.visitMedia = function(mediaNode) {
	this.visit(mediaNode.children[0]);

	this.scope.add();
	var ruleListNode = this.visit(mediaNode.children[1]);
	this.scope.remove();

	if (!ruleListNode.children.length) {
		return null;
	}
};

Evaluator.prototype.visitMediaQuery = function(mediaQueryNode) {
	var childNodes = this.visit(mediaQueryNode.children);

	if (this.interpolatingMediaQuery) {
		return childNodes;
	}
};

Evaluator.prototype.visitMediaInterpolation = function(mediaInterpolationNode) {
	this.visit(mediaInterpolationNode.children);

	var valueNode = mediaInterpolationNode.children[0];
	if (valueNode.type !== 'string') {
		mediaInterpolationNode.children.unshift(null);
		mediaInterpolationNode.type = 'mediaType';
		return;
	}

	var value = valueNode.children[0].trim();
	var options = {
		startRule: 'mediaQuery',
		loc: valueNode.loc
	};
	var mediaQueryNode;

	try{
		mediaQueryNode = parser.parse(value, options);
	} catch (error) {
		error.message = 'error parsing media query interpolation: ' + error.message;
		throw error;
	}

	this.interpolatingMediaQuery = true;
	mediaQueryNode = this.visit(mediaQueryNode);
	this.interpolatingMediaQuery = false;

	return mediaQueryNode;
};

Evaluator.prototype.visitVoid = function(voidNode) {
	this.scope.add();
	this.visit(voidNode.children);
	this.scope.remove();
};

Evaluator.prototype.visitBlock = function(blockNode) {
	this.scope.add();

	var ruleListNode = blockNode.children[0];
	this.visit(ruleListNode);

	this.scope.remove();

	return ruleListNode.children;
};

Evaluator.prototype.visitIf = function(ifNode) {
	var conditionNode = this.visit(ifNode.children[0]);

	if (Node.toBoolean(conditionNode)) {
		var ruleListNode = ifNode.children[1];
		return this.visit(ruleListNode.children);
	}

	var alternativeNode = ifNode.children[2];
	if (!alternativeNode) {
		return null;
	}

	if (alternativeNode.type === 'if') {
		return this.visit(alternativeNode);
	}

	return this.visit(alternativeNode.children);
};

Evaluator.prototype.visitFor = function(forNode) {
	var stepNode = this.visit(forNode.children[2]);
	var stepNumber = 1;
	if (stepNode) {
		stepNumber = Node.toNumber(stepNode);
		if (stepNumber === null) {
			throw Err("step number must be a numberic value", stepNode);
		}

		if (!stepNumber) {
			throw Err("step number is not allowed to be zero", stepNode);
		}
	}

	var valueVariableNode = forNode.children[0];
	var indexVariableNode = forNode.children[1];
	var listNode = this.visit(forNode.children[3]);
	listNode = Node.toListNode(listNode);
	var ruleListNode = forNode.children[4];

	var valueVariableName = valueVariableNode.children[0];

	if (listNode.type === 'null') {
		this.scope.define(valueVariableName, listNode);

		if (indexVariableNode) {
			var indexVariableName = indexVariableNode.children[0];
			var indexNode = Node('null', {loc: indexVariableNode.loc});
			this.scope.define(indexVariableName, indexNode);
		}

		return null;
	}

	if (listNode.type !== 'list') {
		this.scope.define(valueVariableName, listNode);

		if (indexVariableNode) {
			var indexVariableName = indexVariableNode.children[0];
			var indexNode = Node('number', [0], {loc: indexVariableNode.loc});
			this.scope.define(indexVariableName, indexNode);
		}

		return this.visit(ruleListNode.children);
	}

	var itemNodes = listNode.children;
	var lastIndex = (itemNodes.length - 1) / 2;
	var ruleNodes = [];

	for (
		var i = stepNumber > 0 ? 0 : lastIndex;
		stepNumber > 0 ? i <= lastIndex : i >= 0;
		i += stepNumber
	) {
		var itemNode = itemNodes[i * 2];
		this.scope.define(valueVariableName, itemNode);

		if (indexVariableNode) {
			var indexVariableName = indexVariableNode.children[0];
			var indexNode = Node('number', [i], {loc: indexVariableNode.loc});
			this.scope.define(indexVariableName, indexNode);
		}

		var isLast = i === (stepNumber > 0 ? lastIndex : 0);
		var ruleListClone = isLast ? ruleListNode : Node.clone(ruleListNode);
		this.visit(ruleListClone.children);
		ruleNodes = ruleNodes.concat(ruleListClone.children);
	}

	return ruleNodes;
};

Evaluator.prototype.visitKeyframes = function(keyframesNode) {
	keyframesNode.children[1] = this.visit(keyframesNode.children[1]);

	this.scope.add();

	var keyframeListNode = this.visit(keyframesNode.children[2]);

	this.scope.remove();

	if (!keyframeListNode.children.length) {
		return null;
	}
};

Evaluator.prototype.visitKeyframe = function(keyframeNode) {
	this.visit(keyframeNode.children[0]);

	this.scope.add();

	var ruleListNode = this.visit(keyframeNode.children[1]);

	this.scope.remove();

	if (!ruleListNode.children.length) {
		return null;
	}
};

Evaluator.prototype.visitModule = function(moduleNode) {
	var parentModuleName = this.parentModuleName || '';

	var nameNode = this.visit(moduleNode.children[0]);
	var name = Node.toString(nameNode);
	if (name === null) {
		throw Err("'" + nameNode.type + "' can not be used as a module name" , nameNode);
	}

	var separatorNode = this.visit(moduleNode.children[1]);
	var separator = separatorNode ? Node.toString(separatorNode) : '-';
	if (separator === null) {
		throw Err("'" + separatorNode.type + "' can not be used as a module name separator" , separatorNode);
	}

	this.parentModuleName = parentModuleName + name + separator;

	var ruleListNode = this.visit(moduleNode.children[2]);

	this.parentModuleName = parentModuleName;

	return ruleListNode.children;
};

Evaluator.prototype.visitFontFace = function(fontFaceNode) {
	var ruleList = this.visit(fontFaceNode.children[0]);

	if (!ruleList.children.length) {
		return null;
	}
};

var evaluator = {};

evaluator.evaluate = function(ast) {
	return new Evaluator().evaluate(ast);
};

/* exported bif */

var bif = {};



bif.len = function(callNode) {
	var argumentListNode = callNode.children[1];
	if (!argumentListNode.children.length) {
		throw Err('no arguments passed', callNode);
	}

	var argumentNode = argumentListNode.children[0];
	var length;
	if (argumentNode.type !== 'list') {
		length = 1;
	} else {
		length = (argumentNode.children.length - 1) / 2 + 1;
	}

	return Node('number', [length], {loc: callNode.loc});
};

bif.unit = function(callNode) {
	var argumentListNode = callNode.children[1];
	var length = argumentListNode.children.length;
	if (!length) {
		throw Err('no arguments passed', callNode);
	}

	var targetNode = argumentListNode.children[0];
	var value = Node.toNumber(targetNode);
	if (value === null) {
		throw Err("'" + targetNode.type + "' is not a numberic value", targetNode);
	}

	if (length === 1) {
		switch (targetNode.type) {
		case 'number':
			return Node('string', [''], {quote: '"', loc: callNode.loc});

		case 'percentage':
			return Node('string', ['%'], {quote: '"', loc: callNode.loc});

		case 'dimension':
			var unit = targetNode.children[1];
			return Node('string', [unit], {quote: '"', loc: callNode.loc});
		}
	}

	var unitNode = argumentListNode.children[1];
	switch (unitNode.type) {
	case 'number':
		return Node('number', [value], {loc: callNode.loc});

	case 'percentage':
		return Node('percentage', [value], {loc: callNode.loc});

	case 'dimension':
		var unit = unitNode.children[1];
		return Node('dimension', [value, unit], {loc: callNode.loc});

	case 'identifier':
		var unit = unitNode.children[0];
		return Node('dimension', [value, unit], {loc: callNode.loc});

	case 'string':
		var unit = unitNode.children[0];
		if (!unit) {
			return Node('number', [value], {loc: callNode.loc});
		}
		return Node('dimension', [value, unit], {loc: callNode.loc});

	default:
		throw Err("'" + unitNode.type + "' is not a valid unit", unitNode);
	}
};

bif.opp = function(callNode) {
	var argumentListNode = callNode.children[1];
	if (!argumentListNode.children.length) {
		throw Err('no arguments passed', callNode);
	}

	var argumentNode = argumentListNode.children[0];
	var argumentClone = Node.clone(argumentNode);

	if (argumentClone.type === 'list') {
		argumentClone.children[0] = toOppNode(argumentClone.children[0]);
		argumentClone.children[2] = toOppNode(argumentClone.children[2]);
		return argumentClone;
	}

	return toOppNode(argumentClone);
};

function toOppNode(node) {
	var pos = Node.toString(node);
	if (pos === null || (pos = toOppPos(pos)) == null) {
		throw Err('invalid position', node);
	}

	node.children[0] = pos;
	return node;
}

function toOppPos(pos) {
	switch(pos) {
	case 'left':
		return 'right';
	case 'right':
		return 'left';
	case 'top':
		return 'bottom';
	case 'bottom':
		return 'top';
	case 'center':
		return 'center';
	}

	return null;
}

/**
 * Extender
 *
 * Join nested selectors and media queries, and extend selectors
 * specified in extend nodes.
 */
var Extender = function() {};

Extender.prototype = new Visitor();

Extender.prototype.extend = function(ast) {
	return this.visit(ast);
};

Extender.prototype.visitRuleList = Extender.prototype.visitNode;

Extender.prototype.visitNode = _.noop;



Extender.prototype.visitRoot = function(rootNode) {
	var extendBoundaryNode = this.extendBoundaryNode;
	this.extendBoundaryNode = rootNode;

	this.visit(rootNode.children);

	this.extendBoundaryNode = extendBoundaryNode;
};

Extender.prototype.visitRuleset = function(rulesetNode) {
	var selectorListNode = this.visit(rulesetNode.children[0]);

	var parentSelectorList = this.parentSelectorList;
	this.parentSelectorList = selectorListNode;

	this.visit(rulesetNode.children[1]);

	this.parentSelectorList = parentSelectorList;
};

Extender.prototype.visitSelectorList = function(selectorListNode) {
	var selectorListClone = Node.clone(selectorListNode);
	selectorListNode.originalNode = selectorListClone;

	if (this.parentSelectorList) {
		var childNodes = [];
		var length = this.parentSelectorList.children.length;

		this.parentSelectorList.children.forEach(function(parentSelector, i) {
			this.parentSelector = parentSelector;

			var selectorListClone = i === length - 1 ?
				selectorListNode :
				Node.clone(selectorListNode);
			childNodes = childNodes.concat(this.visit(selectorListClone.children));
		}, this);

		selectorListNode.children = childNodes;
	} else {
		this.parentSelector = null;
		this.visit(selectorListNode.children);
	}
};

Extender.prototype.visitSelector = function(selectorNode) {
	this.visit(selectorNode.children);

	if (this.hasAmpersandSelector) {
		this.hasAmpersandSelector = false;
		return;
	}

	var firstNode = selectorNode.children[0];
	var startWithCombinator = firstNode.type === 'combinator';
	if (startWithCombinator) {
		if (!this.parentSelector) {
			throw Err("selector starting with a combinator is not allowed at the top level", firstNode);
		}

		selectorNode.children = this.parentSelector.children.concat(selectorNode.children);
	} else if (this.parentSelector) {
		var combinator = Node('combinator', [' '], {loc: selectorNode.loc});
		selectorNode.children = this.parentSelector.children.concat(combinator, selectorNode.children);
	}
};

Extender.prototype.visitAmpersandSelector = function(ampersandSelectorNode) {
	if (!this.parentSelector) {
		throw Err("& selector is not allowed at the top level", ampersandSelectorNode);
	}

	this.hasAmpersandSelector = true;

	var valueNode = ampersandSelectorNode.children[0];
	if (valueNode) {
		var lastNode = this.parentSelector.children[this.parentSelector.children.length - 1];
		switch (lastNode.type) {
		case 'classSelector':
		case 'hashSelector':
		case 'typeSelector':
			break;
		default:
			throw Err("parent selector '" + lastNode.type + "' is not allowed to be appended", ampersandSelectorNode);
		}

		var lastClone = Node.clone(lastNode);
		var identifierNode = lastClone.children[0];
		identifierNode.children[0] += valueNode.children[0];
		var childNodes = this.parentSelector.children.slice(0, -1);
		childNodes.push(lastClone);

		return childNodes;
	}

	return this.parentSelector.children;
};

Extender.prototype.visitMedia = function(mediaNode) {
	var mediaQueryListNode = this.visit(mediaNode.children[0]);

	var parentMediaQueryList = this.parentMediaQueryList;
	this.parentMediaQueryList = mediaQueryListNode;

	this.visit(mediaNode.children[1]);

	this.parentMediaQueryList = parentMediaQueryList;
};

Extender.prototype.visitMediaQueryList = function(mediaQueryListNode) {
	if (this.parentMediaQueryList) {
		var childNodes = [];
		var length = this.parentMediaQueryList.children.length;

		this.parentMediaQueryList.children.forEach(function(parentMediaQuery, i) {
			this.parentMediaQuery = parentMediaQuery;

			var mediaQueryListClone = i === length - 1 ?
				mediaQueryListNode :
				Node.clone(mediaQueryListNode);
			childNodes = childNodes.concat(this.visit(mediaQueryListClone.children));
		}, this);

		mediaQueryListNode.children = childNodes;
	} else {
		this.parentMediaQuery = null;
		this.visit(mediaQueryListNode.children);
	}
};

Extender.prototype.visitMediaQuery = function(mediaQueryNode) {
	if (this.parentMediaQuery) {
		mediaQueryNode.children = this.parentMediaQuery.children.concat(mediaQueryNode.children);
	}
};

Extender.prototype.visitExtend = function(extendNode) {
	var nodes = this.extendBoundaryNode.children;

	if (this.parentMediaQueryList) {
		var mediaNodes = new MediaFilter().filter(nodes, this.parentMediaQueryList, options);
		nodes = [];
		mediaNodes.forEach(function(mediaNode) {
			nodes = nodes.concat(mediaNode.children);
		});
	}

	var options = {
		extendNode: extendNode,
		insideVoid: this.insideVoid
	};

	var rulesetNodes = [];
	var selectorListNode = extendNode.children[0];
	selectorListNode.children.forEach(function(selectorNode) {
		rulesetNodes = rulesetNodes.concat(new RulesetFilter().filter(nodes, selectorNode, options));
	});

	rulesetNodes.forEach(function(rulesetNode) {
		new SelectorExtender().extend(rulesetNode, this.parentSelectorList, options);
	}, this);

	return null;
};

Extender.prototype.visitVoid = function(voidNode) {
	var insideVoid = this.insideVoid;
	this.insideVoid = true;

	var extendBoundaryNode = this.extendBoundaryNode;
	this.extendBoundaryNode = voidNode;

	this.visit(voidNode.children);

	this.insideVoid = insideVoid;
	this.extendBoundaryNode = extendBoundaryNode;
};

/**
 * Media Filter
 *
 * Find medias matching the passed media queries
 */
var MediaFilter = function() {};

MediaFilter.stop = {};

MediaFilter.prototype = new Visitor();

MediaFilter.prototype.filter = function(ast, mediaQueryListNode) {
	this.mediaQueryListNode = mediaQueryListNode;
	this.mediaNodes = [];

	try {
		this.visit(ast);
	} catch (error) {
		if (error !== MediaFilter.stop) {
			throw error;
		}
	}

	return this.mediaNodes;
};

MediaFilter.prototype.visitRoot =
MediaFilter.prototype.visitVoid =
MediaFilter.prototype.visitRuleset =
MediaFilter.prototype.visitRuleList = MediaFilter.prototype.visitNode;

MediaFilter.prototype.visitNode = _.noop;

MediaFilter.prototype.visitMedia = function(mediaNode) {
	var mediaQueryListNode = mediaNode.children[0];
	var ruleListNode = mediaNode.children[1];

	if (mediaQueryListNode === this.mediaQueryListNode) {
		this.mediaNodes.push(mediaNode);
		throw MediaFilter.stop;
	}

	if (Node.equal(mediaQueryListNode, this.mediaQueryListNode)) {
		this.mediaNodes.push(mediaNode);
	} else {
		this.visit(ruleListNode);
	}
};

/**
 * Ruleset Filter
 *
 * Find ruleset node matching the passed selector
 */
var RulesetFilter = function() {};

RulesetFilter.stop = {};

RulesetFilter.prototype = new Visitor();

RulesetFilter.prototype.filter = function(ast, selectorNode, options) {
	this.selectorNode = selectorNode;
	this.extendNode = options.extendNode;
	this.options = options;
	this.rulesetNodes = [];

	try {
		this.visit(ast);
	} catch (error) {
		if (error !== RulesetFilter.stop) {
			throw error;
		}
	}

	return this.rulesetNodes;
};

RulesetFilter.prototype.visitRoot =
RulesetFilter.prototype.visitVoid =
RulesetFilter.prototype.visitRuleList = RulesetFilter.prototype.visitNode;

RulesetFilter.prototype.visitNode = _.noop;

RulesetFilter.prototype.visitExtend = function(extendNode) {
	if (extendNode === this.extendNode) {
		throw RulesetFilter.stop;
	}
};

RulesetFilter.prototype.visitRuleset = function(rulesetNode) {
	var selectorListNode = rulesetNode.children[0];

	var selectorMatched = selectorListNode.children.some(function(selectorNode) {
		if (Node.equal(this.selectorNode, selectorNode)) {
			this.rulesetNodes.push(rulesetNode);
			return true;
		}
	}, this);
	if (selectorMatched) {
		return;
	}

	var ruleListNode = rulesetNode.children[1];
	this.visit(ruleListNode);
};

/**
 * Selector Extender
 *
 * Extend selectors in the passed ruleset with the passed parent selectors
 */
var SelectorExtender = function() {};

SelectorExtender.stop = {};

SelectorExtender.prototype = new Visitor();

SelectorExtender.prototype.extend = function(rulesetNode, parentSelectorList, options) {
	this.parentSelectorList = parentSelectorList;
	this.extendNode = options.extendNode;
	this.insideVoid = options.insideVoid;

	var selectorListNode = rulesetNode.children[0];
	selectorListNode.children = selectorListNode.children.concat(parentSelectorList.children);

	if (!this.insideVoid) {
		selectorListNode.extendedSelectors = selectorListNode.extendedSelectors ?
			selectorListNode.extendedSelectors.concat(parentSelectorList.children) :
			parentSelectorList.children;
	}

	var ruleListNode = rulesetNode.children[1];

	try {
		this.visit(ruleListNode);
	} catch (error) {
		if (error !== SelectorExtender.stop) {
			throw error;
		}
	}
};

SelectorExtender.prototype.visitRoot =
SelectorExtender.prototype.visitMedia =
SelectorExtender.prototype.visitRuleList = SelectorExtender.prototype.visitNode;

SelectorExtender.prototype.visitNode = _.noop;

SelectorExtender.prototype.visitExtend = function(extendNode) {
	if (extendNode === this.extendNode) {
		throw SelectorExtender.stop;
	}
};

SelectorExtender.prototype.visitRuleset = function(rulesetNode) {
	var selectorListNode = this.visit(rulesetNode.children[0]);

	var parentSelectorList = this.parentSelectorList;
	this.parentSelectorList = selectorListNode;

	var ruleListNode = rulesetNode.children[1];
	this.visit(ruleListNode);

	this.parentSelectorList = parentSelectorList;
};

SelectorExtender.prototype.visitSelectorList = function(selectorListNode) {
	var selectorListClone = Node.clone(selectorListNode.originalNode);

	var extender = new Extender();
	extender.parentSelectorList = this.parentSelectorList;
	selectorListClone = extender.extend(selectorListClone, this.options);

	selectorListNode.children = selectorListNode.children.concat(selectorListClone.children);

	if (!this.insideVoid) {
		selectorListNode.extendedSelectors = selectorListNode.extendedSelectors ?
			selectorListNode.extendedSelectors.concat(selectorListClone.children) :
			selectorListClone.children;
	}

	return selectorListClone;
};

var extender = {};

extender.extend = function(ast) {
	return new Extender().extend(ast);
};

/**
 * Normalizer
 *
 * Remove empty ruleset/media nodes, unextended void nodes, etc.
 */
var Normalizer = function() {};

Normalizer.prototype = new Visitor();

Normalizer.prototype.normalize = function(ast) {
	return this.visit(ast);
};

Normalizer.prototype.visitRoot =
Normalizer.prototype.visitRuleList = Normalizer.prototype.visitNode;

Normalizer.prototype.visitNode = _.noop;



Normalizer.prototype.visitRoot = function(rootNode) {
	var parentRoot = this.parentRoot;
	this.parentRoot = rootNode;

	var childNodes = this.visit(rootNode.children);

	this.parentRoot = parentRoot;

	if (parentRoot && !childNodes.length) {
		return null;
	}
};

Normalizer.prototype.visitRuleset = function(rulesetNode) {
	var selectorListNode = rulesetNode.children[0];

	if (this.insideVoid) {
		if (!selectorListNode.extendedSelectors) {
			return null;
		}

		selectorListNode.children = selectorListNode.extendedSelectors;
	}

	var parentSelectorList = this.parentSelectorList;
	this.parentSelectorList = selectorListNode;

	var ruleListNode = this.visit(rulesetNode.children[1]);

	this.parentSelectorList = parentSelectorList;

	var propertyNodes = [];
	var otherNodes = [];

	ruleListNode.children.forEach(function(childNode) {
		if (childNode.type === 'property') {
			propertyNodes.push(childNode);
		} else {
			otherNodes.push(childNode);
		}
	});

	if (!propertyNodes.length) {
		return otherNodes;
	}

	var firstPropertyNode = propertyNodes[0];
	var propertyListNode = Node('ruleList', propertyNodes, {loc: firstPropertyNode.loc});

	// bubble child medias if under a media
	var mediaNodes;
	if (this.parentMedia) {
		mediaNodes = [];
		var others = [];
		otherNodes.forEach(function(node) {
			if (node.type === 'media') {
				mediaNodes.push(node);
			} else {
				others.push(node);
			}
		});
		otherNodes = others;
	}

	if (!otherNodes.length) {
		ruleListNode = null;
	} else {
		ruleListNode.children = otherNodes;
	}

	rulesetNode.children = [selectorListNode, propertyListNode, ruleListNode];

	if (this.parentMedia && mediaNodes.length) {
		return [rulesetNode].concat(mediaNodes);
	}
};

Normalizer.prototype.visitMedia = function(mediaNode) {
	var mediaQueryListNode = mediaNode.children[0];

	var parentMedia = this.parentMedia;
	this.parentMedia = mediaNode;

	var ruleListNode = this.visit(mediaNode.children[1]);

	this.parentMedia = parentMedia;

	var propertyNodes = [];
	var rulesetNodes = [];
	var otherNodes = [];

	ruleListNode.children.forEach(function(childNode) {
		switch (childNode.type) {
		case 'property':
			propertyNodes.push(childNode);
			break;
		case 'ruleset':
			rulesetNodes.push(childNode);
			break;
		default:
			otherNodes.push(childNode);
		}
	});

	if (propertyNodes.length) {
		if (!this.parentSelectorList) {
			throw Err("@media containing properties is not allowed at the top level", mediaNode);
		}

		var firstPropertyNode = propertyNodes[0];
		var propertyList = Node('ruleList', propertyNodes, {loc: firstPropertyNode.loc});

		var rulesetChildNodes = [this.parentSelectorList, propertyList, null];
		var rulesetNode = Node('ruleset', rulesetChildNodes, {loc: this.parentSelectorList.loc});
		rulesetNodes.unshift(rulesetNode);
	}

	if (!rulesetNodes.length) {
		return otherNodes;
	}

	var firstRulesetNode = rulesetNodes[0];
	var rulesetListNode = Node('ruleList', rulesetNodes, {loc: firstRulesetNode.loc});

	if (!otherNodes.length) {
		ruleListNode = null;
	} else {
		ruleListNode.children = otherNodes;
	}

	mediaNode.children = [mediaQueryListNode, rulesetListNode, ruleListNode];
};

Normalizer.prototype.visitVoid = function(voidNode) {
	var insideVoid = this.insideVoid;
	this.insideVoid = true;

	var ruleListNode = voidNode.children[0];
	this.visit(ruleListNode);

	this.insideVoid = insideVoid;

	return ruleListNode.children;
};

var normalizer = {};

normalizer.normalize = function(ast) {
	return new Normalizer().normalize(ast);
};

/**
 * Prefixer
 *
 * Prefix property nodes, keyframes nodes, etc
 */
var Prefixer = function() {};

Prefixer.prototype = new Visitor();

Prefixer.prototype.prefix = function(ast, options) {
	this.prefixes = options.prefix.trim().split(/\s+/);
	this.skipPrefixed = options.skipPrefixed;

	return this.visit(ast);
};

Prefixer.prototype.visitRoot =
Prefixer.prototype.visitRuleset =
Prefixer.prototype.visitMedia =
Prefixer.prototype.visitKeyframeList =
Prefixer.prototype.visitKeyframe =
Prefixer.prototype.visitRuleList = Prefixer.prototype.visitNode;

Prefixer.prototype.visitNode = _.noop;



/**
 * PropertyNamePrefixer
 *
 * Prefix property name
 */
var PropertyNamePrefixer = function() {};

PropertyNamePrefixer.prototype = new Visitor();

PropertyNamePrefixer.prototype.prefix = function(propertyNameNode, options) {
	this.prefixes = options.prefixes;
	this.properties = options.properties;

	return this.visit(propertyNameNode);
};

PropertyNamePrefixer.prototype.visitIdentifier = function(identifierNode) {
	var propertyName = identifierNode.children[0];
	var prefixedPropertyNameNodes = [];

	var prefixes;
	switch (propertyName) {
	case 'box-sizing':
	case 'box-shadow':
	case 'border-radius':
		prefixes = _.intersect(this.prefixes, ['webkit', 'moz']);
		break;
	case 'user-select':
		prefixes = _.intersect(this.prefixes, ['webkit', 'moz', 'ms']);
		break;
	case 'transition-duration':
	case 'transition-property':
	case 'transition':
		prefixes = _.intersect(this.prefixes, ['webkit', 'moz', 'o']);
		break;
	case 'transform':
		prefixes = this.prefixes;
		break;
	default:
		return prefixedPropertyNameNodes;
	}

	prefixes.forEach(function(prefix) {
		var prefixedPropertyName = '-' + prefix + '-' + propertyName;
		if (this.properties) {
			var prefixedPropertyExists = this.properties.some(function(propertyNode) {
				var propertyNameNode = propertyNode.children[0];
				var propertyName = propertyNameNode.children[0];
				return prefixedPropertyName === propertyName;
			});
			if (prefixedPropertyExists) {
				return;
			}
		}

		var prefixedPropertyNameNode = Node.clone(identifierNode);
		prefixedPropertyNameNode.children[0] = prefixedPropertyName;
		prefixedPropertyNameNodes.push(prefixedPropertyNameNode);
	}, this);

	return prefixedPropertyNameNodes;
};

/**
 * LinearGradientPrefixer
 *
 * Visit property value nodes to prefix linear-gradient()
 */
var LinearGradientPrefixer = function() {};

LinearGradientPrefixer.stop = {};

LinearGradientPrefixer.prototype = new Visitor();

LinearGradientPrefixer.prototype.prefix = function(propertyValueNode, options) {
	var prefixes = _.intersect(options.prefixes, ['webkit', 'moz', 'o']);

	var prefixedPropertyValueNodes = [];

	this.hasLinearGradient = false;
	try {
		this.visit(propertyValueNode);
	} catch (error) {
		if (error !== LinearGradientPrefixer.stop) {
			throw error;
		}
	}
	if (!this.hasLinearGradient) {
		return prefixedPropertyValueNodes;
	}

	prefixes.forEach(function(prefix) {
		this.currentPrefix = prefix;

		var propertyValueClone = Node.clone(propertyValueNode);
		var prefixedPropertyValueNode = this.visit(propertyValueClone);

		prefixedPropertyValueNodes.push(prefixedPropertyValueNode);
	}, this);

	return prefixedPropertyValueNodes;
};

LinearGradientPrefixer.prototype.visitCall = function(callNode) {
	var functionName = callNode.children[0];

	if (functionName.toLowerCase() !== 'linear-gradient') {
		return;
	}

	if (!this.hasLinearGradient) {
		this.hasLinearGradient = true;
		throw LinearGradientPrefixer.stop;
	}

	callNode.children[0] = '-' + this.currentPrefix + '-' + functionName;

	var argumentListNode = callNode.children[1];

	var firstArgumentNode = argumentListNode.children[0];
	if (firstArgumentNode.type !== 'list') {
		return;
	}

	var firstListItemNode = firstArgumentNode.children[0];
	if (firstListItemNode.type !== 'identifier' || firstListItemNode.children[0] !== 'to') {
		return;
	}

	var positionNodes = firstArgumentNode.children.slice(2);
	firstArgumentNode.children = positionNodes.map(function(positionNode) {
		if (positionNode.type !== 'identifier') {
			return positionNode;
		}

		var positionName = positionNode.children[0];
		switch (positionName) {
		case 'top':
			positionName = 'bottom';
			break;
		case 'bottom':
			positionName = 'top';
			break;
		case 'left':
			positionName = 'right';
			break;
		case 'right':
			positionName = 'left';
			break;
		}
		positionNode.children[0] = positionName;

		return positionNode;
	});
};

Prefixer.prototype.visitRuleset = function(rulesetNode) {
	var ruleListNode = rulesetNode.children[1];

	if (this.skipPrefixed) {
		var properties = this.properties;
		this.properties = ruleListNode.children;

		this.visit(ruleListNode.children);

		this.properties = properties;
	} else {
		this.visit(ruleListNode.children);
	}
};

Prefixer.prototype.visitProperty = function(propertyNode) {
	var propertyNameNode = propertyNode.children[0];
	var propertyValueNode = propertyNode.children[1];

	var propertyName = propertyNameNode.children[0];
	var propertyNodes = [];
	var options = {
		prefixes: this.prefixes
	};

	switch (propertyName) {
	case 'background':
	case 'background-image':
		var prefixedPropertyValueNodes = new LinearGradientPrefixer().prefix(propertyValueNode, options);

		prefixedPropertyValueNodes.forEach(function(prefixedPropertyValueNode) {
			var propertyClone = Node.clone(propertyNode, false);
			propertyClone.children = [propertyNameNode, prefixedPropertyValueNode];
			propertyNodes.push(propertyClone);
		});

		break;

	default:
		options.properties = this.properties;
		var prefixedPropertyNameNodes = new PropertyNamePrefixer().prefix(propertyNameNode, options);

		prefixedPropertyNameNodes.forEach(function(prefixedPropertyNameNode) {
			var propertyClone = Node.clone(propertyNode, false);
			propertyClone.children = [prefixedPropertyNameNode, propertyValueNode];
			propertyNodes.push(propertyClone);
		});
	}

	if (!propertyNodes.length) {
		return;
	}

	propertyNodes.push(propertyNode);
	return propertyNodes;
};

Prefixer.prototype.visitKeyframes = function(keyframesNode) {
	var prefix = keyframesNode.children[0];
	if (prefix) {
		return;
	}

	var keyframeNameNode = this.visit(keyframesNode.children[1]);
	var keyframeListNode = keyframesNode.children[2];

	var prefixes = _.intersect(this.prefixes, ['webkit', 'moz', 'o']);

	var keyframesNodes = [];

	prefixes.forEach(function(prefix) {
		this.prefixes = [prefix];
		var keyframeListClone = Node.clone(keyframeListNode);
		this.visit(keyframeListClone);

		var keyframesClone = Node.clone(keyframesNode, false);
		keyframesClone.children = [prefix, keyframeNameNode, keyframeListClone];

		keyframesNodes.push(keyframesClone);
	}, this);

	keyframesNodes.push(keyframesNode);

	return keyframesNodes;
};

var prefixer = {};

prefixer.prefix = function(ast, options) {
	return new Prefixer().prefix(ast, options);
};

/**
 * Compiler
 *
 * Compile ast to css.
 */
var Compiler = function() {};

Compiler.prototype = new Visitor();

Compiler.prototype.compile = function(ast, options) {
	this.indentUnit = options.indent;
	this.precision = options.precision;
	this.indentLevel = 0;

	return this.visit(ast);
};

Compiler.prototype.indent = function() {
	++this.indentLevel;
};

Compiler.prototype.outdent = function() {
	--this.indentLevel;
};

Compiler.prototype.indentString = function() {
	return new Array(this.indentLevel + 1).join(this.indentUnit);
};



Compiler.prototype.visitNode = function(node) {
	return this.visit(node.children).join('');
};

Compiler.prototype.visitRoot = function(rootNode) {
	return this.visit(rootNode.children).join('\n\n');
};

Compiler.prototype.visitComment = function(commentNode) {
	return '/*' + commentNode.children[0] + '*/';
};

Compiler.prototype.visitRuleset = function(rulesetNode) {
	var selectorListNode = rulesetNode.children[0];
	var css = this.visit(selectorListNode) + ' {\n';

	var propertyListNode = rulesetNode.children[1];
	this.indent();
	css += this.indentString() + this.visit(propertyListNode);
	this.outdent();
	css += '\n' + this.indentString() + '}';

	var ruleListNode = rulesetNode.children[2];
	if (ruleListNode) {
		this.indent();
		css += '\n' + this.indentString() + this.visit(ruleListNode);
		this.outdent();
	}

	return css;
};

Compiler.prototype.visitSelectorList = function(selectorListNode) {
	return this.visit(selectorListNode.children).join(',\n' + this.indentString());
};

Compiler.prototype.visitCombinator = function(combinatorNode) {
	var value = combinatorNode.children[0];
	if (value !== ' ') { value = ' ' + value + ' '; }

	return value;
};

Compiler.prototype.visitUniversalSelector = function() {
	return '*';
};

Compiler.prototype.visitClassSelector = function(classSelectorNode) {
	return '.' + this.visit(classSelectorNode.children[0]);
};

Compiler.prototype.visitHashSelector = function(hashSelectorNode) {
	return '#' + this.visit(hashSelectorNode.children[0]);
};

Compiler.prototype.visitAttributeSelector = function(attributeSelectorNode) {
	return '[' + this.visit(attributeSelectorNode.children).join('') + ']';
};

Compiler.prototype.visitNegationSelector = function(negationSelectorNode) {
	return ':not(' + this.visit(negationSelectorNode.children[0]) + ')';
};

Compiler.prototype.visitPseudoSelector = function(pseudoSelectorNode) {
	var css = pseudoSelectorNode.doubled ? '::' : ':';
	css += this.visit(pseudoSelectorNode.children[0]);

	if (pseudoSelectorNode.children[1]) {
		css += '(' + this.visit(pseudoSelectorNode.children[1]) + ')';
	}

	return css;
};

Compiler.prototype.visitProperty = function(propertyNode) {
	var css = this.visit(propertyNode.children[0]) + ': ' +  this.visit(propertyNode.children[1]);

	var priority = propertyNode.children[2];
	if (priority) { css += ' ' + priority; }

	css += ';';

	return css;
};

Compiler.prototype.visitRuleList = function(ruleListNode) {
	return this.visit(ruleListNode.children).join('\n' + this.indentString());
};

Compiler.prototype.visitMedia = function(mediaNode) {
	var mediaQueryListNode = mediaNode.children[0];
	var css = '@media';
	css += mediaQueryListNode.children.length > 1 ? '\n' + this.indentString() : ' ';
	css += this.visit(mediaQueryListNode) + ' {\n';

	var rulesetListNode = mediaNode.children[1];
	this.indent();
	css += this.indentString() + this.visit(rulesetListNode);
	this.outdent();
	css += '\n' + this.indentString() + '}';

	var ruleListNode = mediaNode.children[2];
	if (ruleListNode) {
		this.indent();
		css += '\n' + this.indentString() + this.visit(ruleListNode);
		this.outdent();
	}

	return css;
};

Compiler.prototype.visitMediaQueryList = function(mediaQueryListNode) {
	return this.visit(mediaQueryListNode.children).join(',\n' + this.indentString());
};

Compiler.prototype.visitMediaQuery = function(mediaQueryNode) {
	return this.visit(mediaQueryNode.children).join(' and ');
};

Compiler.prototype.visitMediaType = function(mediaTypeNode) {
	var modifier = mediaTypeNode.children[0];
	if (!modifier) { mediaTypeNode.children.shift(); }

	return this.visit(mediaTypeNode.children).join(' ');
};

Compiler.prototype.visitMediaFeature = function(mediaFeatureNode) {
	this.visit(mediaFeatureNode.children);
	var name = mediaFeatureNode.children[0];
	var value = mediaFeatureNode.children[1];

	return '(' + name + (value ? ': ' + value : '') + ')';
};

Compiler.prototype.visitImport = function(importNode) {
	var url = this.visit(importNode.children[0]);
	var mediaQuery = this.visit(importNode.children[1]);

	var css = '@import ' + url;
	if (mediaQuery) { css += ' ' + mediaQuery; }
	css += ';';

	return  css;
};

Compiler.prototype.visitUrl = function(urlNode) {
	return 'url(' + this.visit(urlNode.children[0]) + ')';
};

Compiler.prototype.visitString = function(stringNode) {
	return stringNode.quote + stringNode.children[0] + stringNode.quote;
};

Compiler.prototype.visitNumber = function(numberNode) {
	var number = +numberNode.children[0].toFixed(this.precision);
	return number.toString();
};

Compiler.prototype.visitPercentage = function(percentageNode) {
	return +percentageNode.children[0].toFixed(this.precision) + '%';
};

Compiler.prototype.visitDimension = function(dimensionNode) {
	return +dimensionNode.children[0].toFixed(this.precision) + dimensionNode.children[1];
};

Compiler.prototype.visitColor = function(colorNode) {
	return '#' + colorNode.children[0];
};

Compiler.prototype.visitCall = function(callNode) {
	var functionName = this.visit(callNode.children[0]);
	var args = this.visit(callNode.children[1]);

	return functionName + '(' + args + ')';
};

Compiler.prototype.visitArgumentList = function(argumentListNode) {
	return this.visit(argumentListNode.children).join(', ');
};

Compiler.prototype.visitRange = function(rangeNode) {
	return this.visit(Node.toListNode(rangeNode));
};

Compiler.prototype.visitNull = function() {
	return 'null';
};

Compiler.prototype.visitSeparator = function(separatorNode) {
	var value = separatorNode.children[0];
	if (value === ',') { value += ' '; }

	return value;
};

Compiler.prototype.visitKeyframes = function(keyframesNode) {
	var css = '@';

	var prefix = keyframesNode.children[0];
	if (prefix) { css += '-' + prefix + '-'; }

	var nameNode = keyframesNode.children[1];
	css += 'keyframes ' + this.visit(nameNode) + ' {\n';

	var ruleListNode = keyframesNode.children[2];
	this.indent();
	css += this.indentString() + this.visit(ruleListNode);
	this.outdent();
	css += '\n' + this.indentString() + '}';

	return css;
};

Compiler.prototype.visitKeyframeList = Compiler.prototype.visitRuleList;

Compiler.prototype.visitKeyframe = function(keyframeNode) {
	var css = this.visit(keyframeNode.children[0]) + ' {\n';
	this.indent();
	css += this.indentString() + this.visit(keyframeNode.children[1]);
	this.outdent();
	css += '\n' + this.indentString() + '}';

	return css;
};

Compiler.prototype.visitKeyframeSelectorList = function(keyframeSelectorListNode) {
	return this.visit(keyframeSelectorListNode.children).join(', ');
};

Compiler.prototype.visitFontFace = function(fontFaceNode) {
	var css = '@font-face {\n';
	this.indent();
	css += this.indentString() + this.visit(fontFaceNode.children[0]);
	this.outdent();
	css += '\n' + this.indentString() + '}';

	return css;
};

Compiler.prototype.visitPage = function(pageNode) {
	var css = '@page ';
	if (pageNode.children[0]) {
		css += ':' + this.visit(pageNode.children[0]) + ' ';
	}
	css += '{\n';
	var propertyListNode = pageNode.children[1];
	this.indent();
	css += this.indentString() + this.visit(propertyListNode);
	this.outdent();
	css += '\n' + this.indentString() + '}';

	return css;
};

Compiler.prototype.visitCharset = function(charsetNode) {
	return '@charset ' + this.visit(charsetNode.children[0]) + ';';
};

var compiler = {};

compiler.compile = function(ast, options) {
	return new Compiler().compile(ast, options);
};

/**
 * Formmatter
 *
 * Make error message contain input context.
 */
var formatter = {};

formatter.format = function(error, input) {
	var message = error.message;
	if (input == null) {
		return message;
	}

	var lineNumber = error.loc.line;
	var columnNumber = error.loc.column;
	var filename = error.loc.filename;
	var lines = input.split(/\r\n|[\r\n]/);
	var siblingLineSize = 4;
	var startLineNumber = Math.max(lineNumber - siblingLineSize, 1);
	var endLineNumber = Math.min(lineNumber + siblingLineSize, lines.length);
	var maxLineNumberDigitCount = endLineNumber.toString().length;

	var context = lines
		.slice(startLineNumber - 1, endLineNumber)
		.reduce(function(context, line, i) {
			var tabCount = 0;
			line = line.replace(/^\t+/, function(tabs) {
				tabCount = tabs.length;
				return new Array(tabCount + 1).join('  ');
			});

			var currentLineNumber = i + startLineNumber;
			var currentLineNumberDigitCount = currentLineNumber.toString().length;

			context += '  ' +
			           new Array(maxLineNumberDigitCount - currentLineNumberDigitCount + 1).join(' ') +
			           currentLineNumber +
			           '| ' +
			           line +
			           '\n';

			if (i + startLineNumber === lineNumber) {
				context += '  ' +
				           new Array(maxLineNumberDigitCount + 1).join('-') +
				           '--' +
				           new Array(columnNumber + tabCount).join('-') +
				           '^\n';
			}

			return context;
		}, '');

	return message +
	       '\n\n  ' + '(' + (filename ? filename + ' ' : '') + lineNumber + ':' + columnNumber + ')' +
	       '\n' + context;
};


/**
 * Roole
 *
 * Expose public APIs.
 */
var roole = {};

roole.defaults = {
	prefix: 'webkit moz ms o',
	indent: '\t',
	precision: 3,
	skipPrefixed: false,
	prettyError: false,
	filename: '',
	imports: {}
};

roole.compile = function(input, options, callback) {
	if (callback == null) {
		callback = options;
		options = {};
	} else if (options == null) {
		options = {};
	}

	options = _.mixin({}, roole.defaults, options);
	options.imports[options.filename] = input;
	if (options.prettyError) {
		var cb = callback;
		callback = function (error, output) {
			if (error && error.loc) {
				var input = options.imports[error.loc.filename];
				error.message = formatter.format(error, input);
			}
			cb(error, output);
		};
	}

	compile(input, options, callback);
};

function compile(input, options, callback) {
	var output;
	try {
		output = parser.parse(input, options);
	} catch (error) {
		return callback(error);
	}
	importer.import(output, options, function(error, output) {
		if (error) {
			return callback(error);
		}
		try {
			output = evaluator.evaluate(output, options);
			output = extender.extend(output, options);
			output = normalizer.normalize(output, options);
			output = prefixer.prefix(output, options);
			output = compiler.compile(output, options);
		} catch (error) {
			return callback(error);
		}
		callback(null, output);
	});
}

/**
 * Compile style and link elements in the HTML.
 */
/* jshint browser: true, node: false */
/* global roole, loader */

var selector = 'link[rel="stylesheet/roole"],style[type="text/roole"]';
var elements = document.querySelectorAll(selector);

Array.prototype.forEach.call(elements, function(element) {
	var styleElement = document.createElement('style');
	document.head.appendChild(styleElement);

	var options = {
		prettyError: true
	};

	if (element.nodeName === 'STYLE') {
		roole.compile(element.textContent, options, function(error, css) {
			if (error) {
				displayError(error.message);
				throw error;
			}

			styleElement.textContent = css;
		});
	} else if (element.nodeName === 'LINK') {
		var url = element.getAttribute('href');
		loader.load(url, function(error, content) {
			if (error) {
				displayError(error.message);
				throw error;
			}

			options.filename = url;
			roole.compile(content, options, function(error, css) {
				if (error) {
					displayError(error.message);
					throw error;
				}

				styleElement.textContent = css;
			});
		});
	}
});

function displayError(message) {
	var errorElement = document.createElement('pre');
	var style = [
		['font', '14px/1.25 Menlo,Monaco,Consolas,"Lucida Console",monospace'],
		['border', '3px solid #f60f92'],
		['color', '#000'],
		['background-color', '#ffeff4'],
		['padding', '1em'],
		['margin', '0'],
		['position', 'fixed'],
		['top', '0'],
		['left', '0'],
		['right', '0'],
		['z-index', '99999999']
	].map(function(property) {
		return property[0] + ':' + property[1];
	}).join(';');

	errorElement.setAttribute('style', style);
	errorElement.textContent = message;
	document.body.appendChild(errorElement);
}

roole.version = '0.5.0-dev';

return roole;

})();
