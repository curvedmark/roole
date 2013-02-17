/**
 * Normalizer
 *
 * Remove empty ruleset/media nodes, unextended void nodes, etc.
 */
'use strict'

var _ = require('../helper')
var Visitor = require('../visitor')

var Normalizer = module.exports = function() {}

Normalizer.prototype = new Visitor()
Normalizer.prototype.constructor = Normalizer

Normalizer.prototype.normalize = function(ast) {
	return this.visit(ast)
}

Normalizer.prototype.visitRoot =
Normalizer.prototype.visitRuleList = Normalizer.prototype.visitNode

Normalizer.prototype.visitNode = _.noop

require('./node/root')
require('./node/ruleset')
require('./node/media')
require('./node/void')