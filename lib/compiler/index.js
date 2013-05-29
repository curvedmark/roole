/**
 * Compiler
 *
 * Compile CSS AST to string.
 */
'use strict';

var Translator = require('../visitor/translator');
var methods = require('./node');

module.exports = Compiler;

function Compiler(options) {
	this.options = options;
}

Compiler.prototype = new Translator();

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

Compiler.prototype._visit = function (node) {
	if (node !== Object(node)) return node;
	var method = methods[node.type in methods ? node.type : 'node'];
	return method(this, node);
};