/**
 * Scope
 *
 * This module regulates lexical scoping.
 */

'use strict'

var Scope = module.exports = function() {
	this.scopes = [{}]
}

Scope.prototype.add = function() {
	this.scopes.push({})
}

Scope.prototype.remove = function() {
	this.scopes.pop()
}

Scope.prototype.define = function(name, value) {
	this.scopes[this.scopes.length - 1][name] = value
}

Scope.prototype.resolve = function(name) {
	var length = this.scopes.length
	var value

	while (length--) {
		value = this.scopes[length][name]
		if(value)
			return value
	}
}