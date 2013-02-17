/**
 * Prefixer
 *
 * Prefix property nodes, keyframes nodes, etc
 */
'use strict'

var _ = require('../helper')
var Visitor = require('../visitor')

var Prefixer = module.exports = function() {}

Prefixer.defaults = {
	prefixes: ['webkit', 'moz', 'ms', 'o']
}

Prefixer.prototype = new Visitor()
Prefixer.prototype.constructor = Prefixer

Prefixer.prototype.prefix = function(ast, options) {
	this.prefixes = options.prefixes || Prefixer.defaults.prefixes
	return this.visit(ast)
}

Prefixer.prototype.visitRoot =
Prefixer.prototype.visitPropertyList =
Prefixer.prototype.visitRuleset =
Prefixer.prototype.visitMedia =
Prefixer.prototype.visitKeyframeList =
Prefixer.prototype.visitKeyframe =
Prefixer.prototype.visitRuleList = Prefixer.prototype.visitNode

Prefixer.prototype.visitNode = _.noop

require('./node/property.js')
require('./node/keyframes.js')