/**
 * Normalizer
 *
 * Remove empty ruleset/media nodes, unextended void nodes, etc.
 */
'use strict';

var Visitor = require('../visitor');
var Normalizer = module.exports = function() {};

Normalizer.prototype = new Visitor();

Normalizer.prototype.normalize = function(ast) {
	this.level = 0;
	this.visit(ast.children);
	return ast;
};

Normalizer.prototype.visitNode = function () {};

require('./node/root');
require('./node/ruleset');
require('./node/media');
require('./node/void');