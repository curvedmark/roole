/**
 * Compiler
 *
 * Compile AST to CSS.
 */
'use strict';

var Visitor = require('../visitor');

module.exports = Compiler;

function Compiler(options) {
	this.options = options;
}

Compiler.prototype = Object.create(Visitor);

Compiler.prototype.compile = function(node) {
	this.level = 0;
	return this.visit(node);
};

Compiler.prototype.indent = function() {
	return new Array(this.level + 1).join(this.options.indent);
};

Compiler.prototype.visitNode = function (node) {
	return this.visit(node.children).join('');
};

require('./root');
require('./comment');
require('./ruleset');
require('./selectorList');
require('./combinator');
require('./universalSelector');
require('./classSelector');
require('./hashSelector');
require('./attributeSelector');
require('./negationSelector');
require('./pseudoSelector');
require('./property');
require('./ruleList');
require('./media');
require('./mediaQueryList');
require('./mediaQuery');
require('./mediaType');
require('./mediaFeature');
require('./import');
require('./url');
require('./string');
require('./number');
require('./percentage');
require('./dimension');
require('./color');
require('./call');
require('./argumentList');
require('./range');
require('./null');
require('./separator');
require('./keyframes');
require('./keyframe');
require('./keyframeSelectorList');
require('./fontFace');
require('./page');
require('./charset');