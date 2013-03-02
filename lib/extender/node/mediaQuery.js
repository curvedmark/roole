'use strict'

var compiler = require('../../compiler')

var Extender = require('../extender')

Extender.prototype.visitMediaQuery = function(mediaQueryNode) {
	var mediaQuery = compiler.compile(mediaQueryNode)
	var parentMediaQuery = this.parentMediaQuery
	if (parentMediaQuery) parentMediaQuery += ' and '
	return parentMediaQuery + mediaQuery
}