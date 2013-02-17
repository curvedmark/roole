/**
 * Scope
 *
 * Regulate lexical scoping.
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
	name = name.toLowerCase()
	this.scopes[this.scopes.length - 1][name] = value
}

Scope.prototype.resolve = function(name) {
	name = name.toLowerCase()

	var length = this.scopes.length
	var value

	while (length--) {
		value = this.scopes[length][name]
		if(value)
			return value
	}
}