'use strict'

var Extender = require('../extender')

Extender.prototype.visitMediaQuery = function(mediaQueryNode) {
	if (this.parentMediaQuery)
		mediaQueryNode.children = this.parentMediaQuery.children.concat(mediaQueryNode.children)
}