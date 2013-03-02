'use strict'

var compiler = require('../../compiler')

var Extender = require('../extender')

Extender.prototype.visitSelector = function(selectorNode) {
	var hasAmpersandSelector = false
	var startWithCombinator = false

	var selector = ''
	selectorNode.children.forEach(function(childNode, i) {
		switch (childNode.type) {
		case 'ampersandSelector':
			hasAmpersandSelector = true
			selector += this.parentSelector
			break
		case 'combinator':
			if (!i)
				startWithCombinator = true

			// fall through
		default:
			selector += compiler.compile(childNode)
		}
	}, this)

	if (hasAmpersandSelector)
		return selector

	if (startWithCombinator)
		return this.parentSelector + selector

	var parentSelector = this.parentSelector
	if (parentSelector) parentSelector += ' '
	return  parentSelector + selector
}