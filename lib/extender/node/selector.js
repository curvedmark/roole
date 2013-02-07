'use strict'

var Err = require('../../err')
var Node = require('../../node')

var Extender = require('../extender')

Extender.prototype.visitSelector = function(selectorNode) {
	var hasAmpersandSelector = false
	var children = []
	selectorNode.children.forEach(function(childNode) {
		switch (childNode.type) {
		case 'ampersandSelector':
			if (!this.parentSelector)
				throw Err("& selector is not allowed at the top level", childNode, this.filePath)

			hasAmpersandSelector = true
			children = children.concat(this.parentSelector.children)
			break
		case 'combinator':
			var length = children.length
			if (length) {
				var last = children[length - 1]
				if (last.type === 'combinator')
					children.pop()
			}
			// fall through
		default:
			children.push(childNode)
		}
	}, this)

	var first = children[0]
	if (first.type === 'combinator') {
		if (this.parentSelector)
			children = this.parentSelector.children.concat(children)
	} else if (!hasAmpersandSelector && this.parentSelector) {
		var combinator = Node('combinator', [' '], {loc: selectorNode.loc})
		children = this.parentSelector.children.concat(combinator, children)
	}

	selectorNode.children = children
}