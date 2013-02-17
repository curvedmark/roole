/**
 * Extender
 *
 * Join nested selectors and media queries, and extend selectors
 * specified in extend nodes.
 */
'use strict'

var _ = require('../helper')
var Visitor = require('../visitor')

var Extender = module.exports = function() {}

Extender.prototype = new Visitor()
Extender.prototype.constructor = Extender

Extender.prototype.extend = function(ast) {
	return this.visit(ast)
}

Extender.prototype.visitRuleList = Extender.prototype.visitNode

Extender.prototype.visitNode = _.noop

require('./node/root')
require('./node/ruleset')
require('./node/selectorList')
require('./node/selector')
require('./node/media')
require('./node/mediaQueryList')
require('./node/mediaQuery')
require('./node/extend')
require('./node/void')