'use strict'

var Err = require('../../err')
var compiler = require('../../compiler')

var Extender = require('../extender')

Extender.prototype.visitSelector = function(selectorNode) {
	var hasAmpersandSelector = false
	var startWithCombinator = false

	var selector = ''
	selectorNode.children.forEach(function(childNode, i) {
		switch (childNode.type) {
		case 'ampersandSelector':
			if (!this.parentSelector)
				throw Err("& selector is not allowed at the top level", childNode, this.filePath)

			hasAmpersandSelector = true
			selector += this.parentSelector
			break
		case 'combinator':
			if (!i) {
				if (!this.parentSelector)
					throw Err("selector starting with a combinator is not allowed at the top level", childNode, this.filePath)

				startWithCombinator = true
			}

			// fall through
		default:
			selector += compiler.compile(childNode)
		}
	}, this)

	if (hasAmpersandSelector)
		return selector

	if (startWithCombinator)
		return this.parentSelector + selector

	return  this.parentSelector ? this.parentSelector + ' ' + selector : selector
}