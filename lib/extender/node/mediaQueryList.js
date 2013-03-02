'use strict'

var Node = require('../../node')

var Extender = require('../extender')

Extender.prototype.visitMediaQueryList = function(mediaQueryListNode) {
	if (this.parentMediaQueries) {
		var parentMediaQueries = []

		this.parentMediaQueries.forEach(function(parentMediaQuery) {
			this.parentMediaQuery = parentMediaQuery

			mediaQueryListNode.children.forEach(function(mediaQueryNode) {
				parentMediaQueries.push(this.visit(mediaQueryNode))
			}, this)
		}, this)

		mediaQueryListNode.children = parentMediaQueries
	} else {
		this.parentMediaQuery = ''
		this.visit(mediaQueryListNode.children)
	}
}