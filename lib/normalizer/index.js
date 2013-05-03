/**
 * Normalizer
 *
 * Remove empty ruleset/media nodes, unextended void nodes, etc.
 */
'use strict';

var Visitor = require('../visitor');
var Normalizer = module.exports = function() {};

Normalizer.prototype = new Visitor();

Normalizer.prototype.normalize = function(node) {
	this.visit(node.children);
	return node;
};

Normalizer.prototype.visitNode = function () {};

require('./node/root');
require('./node/ruleset');
require('./node/media');
require('./node/void');