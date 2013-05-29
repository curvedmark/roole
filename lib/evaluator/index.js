/**
 * Evaluator
 *
 * Convert Roole AST to CSS AST.
 */
'use strict';

var TranslatorAsync = require('../visitor/translatorAsync');
var Scope = require('./scope');
var methods = require('./node');
var bifs = require('./bif');
var Normalizer = require('./normalizer');

module.exports = Evaluator;

function Evaluator(options) {
	this.options = options;
	this.imported = {};
	this.scope = new Scope(options.scope || [bifs, {}]);
}

Evaluator.prototype = new TranslatorAsync();

Evaluator.prototype.evaluate = function(node) {
	var opts = this.options;
	return this.visit(node).then(function (node) {
		return new Normalizer(opts).normalize(node);
	});
};

Evaluator.prototype._visit = function (node) {
	if (node !== Object(node)) return node;
	var method = methods[node.type in methods ? node.type : 'node'];
	return method(this, node);
};