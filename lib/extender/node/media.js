'use strict'

var Err = require('../../err')
var Node = require('../../node')

var Extender = require('../extender')

Extender.prototype.visitMedia = function(mediaNode) {
	var mediaQueryListNode = this.visit(mediaNode.children[0])

	var parentMediaQueries = this.parentMediaQueries
	this.parentMediaQueries = mediaQueryListNode.children

	this.visit(mediaNode.children[1])

	this.parentMediaQueries = parentMediaQueries
}