'use strict'

var _ = require('../../helper')
var Node = require('../../node')

var Prefixer = require('../prefixer')

Prefixer.prototype.visitPropertyList = function(propertyListNode) {
	if (this.skipPrefixed) {
		var parentPropertyList = this.parentPropertyList
		this.parentPropertyList = propertyListNode

		this.visit(propertyListNode.children)

		this.parentPropertyList = parentPropertyList
	} else {
		this.visit(propertyListNode.children)
	}
}