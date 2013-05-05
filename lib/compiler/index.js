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

Compiler.prototype = new Visitor();

Compiler.prototype.compile = function(node) {
	this.level = 0;
	return this.visit(node);
};

Compiler.prototype.indent = function(offset) {
	if (offset === undefined) offset = 0;
	return new Array(this.level + offset + 1).join(this.options.indent);
};

Compiler.prototype.comments = function(node) {
	var comments = node.comments;
	if (!comments) return '';
	comments = comments.map(function (comment) {
		return comment.replace(/\n/g, '\n' + this.indent());
	}, this).join('\n' + this.indent());
	if (comments) return this.indent() + comments + '\n';
	return comments;
};

Compiler.prototype.visitNode = function (node) {
	return this.visit(node.children).join('');
};

require('./node/root');
require('./node/ruleset');
require('./node/selectorList');
require('./node/combinator');
require('./node/universalSelector');
require('./node/classSelector');
require('./node/hashSelector');
require('./node/attributeSelector');
require('./node/negationSelector');
require('./node/pseudoSelector');
require('./node/property');
require('./node/ruleList');
require('./node/media');
require('./node/mediaQueryList');
require('./node/mediaQuery');
require('./node/mediaType');
require('./node/mediaFeature');
require('./node/import');
require('./node/url');
require('./node/string');
require('./node/number');
require('./node/percentage');
require('./node/dimension');
require('./node/color');
require('./node/call');
require('./node/argumentList');
require('./node/range');
require('./node/null');
require('./node/separator');
require('./node/keyframes');
require('./node/keyframe');
require('./node/keyframeSelectorList');
require('./node/fontFace');
require('./node/page');
require('./node/charset');