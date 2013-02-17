/**
 * Compiler
 *
 * Compile ast to css.
 */
'use strict'

var _ = require('../helper')
var Visitor = require('../visitor')

var Compiler = module.exports = function() {}

Compiler.defaults = {
	indent: '\t',
	precision: 3
}

Compiler.prototype = new Visitor()
Compiler.prototype.constructor = Compiler

Compiler.prototype.compile = function(ast, options) {
	if (!options) options = {}
	this.indentUnit = options.indent || Compiler.defaults.indent
	this.precision = options.precision || Compiler.defaults.precision
	this.indentLevel = 0

	return this.visit(ast)
}

Compiler.prototype.indent = function() {
	++this.indentLevel
}

Compiler.prototype.outdent = function() {
	--this.indentLevel
}

Compiler.prototype.indentString = function() {
	return Array(this.indentLevel + 1).join(this.indentUnit)
}

require('./node/node')
require('./node/root')
require('./node/comment')
require('./node/ruleset')
require('./node/selectorList')
require('./node/combinator')
require('./node/universalSelector')
require('./node/classSelector')
require('./node/hashSelector')
require('./node/attributeSelector')
require('./node/pseudoSelector')
require('./node/propertyList')
require('./node/property')
require('./node/rulesetList')
require('./node/ruleList')
require('./node/media')
require('./node/mediaQueryList')
require('./node/mediaQuery')
require('./node/mediaType')
require('./node/mediaFeature')
require('./node/import')
require('./node/url')
require('./node/string')
require('./node/number')
require('./node/percentage')
require('./node/dimension')
require('./node/color')
require('./node/function')
require('./node/argumentList')
require('./node/range')
require('./node/null')
require('./node/separator')
require('./node/keyframes')
require('./node/keyframeList')
require('./node/keyframe')
require('./node/keyframeSelectorList')