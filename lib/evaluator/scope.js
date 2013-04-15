/**
 * Scope
 *
 * Regulate lexical scoping.
 */
'use strict';

var _ = require('../helper');

var Scope = module.exports = function(scope) {
	this.scopes = scope instanceof Scope ?
		scope.scopes.map(_.clone) : [scope, {}];
};

Scope.prototype.add = function() {
	this.scopes.push({});
};

Scope.prototype.remove = function() {
	this.scopes.pop();
};

Scope.prototype.define = function(name, value) {
	this.scopes[this.scopes.length - 1][name] = value;
};

Scope.prototype.resolve = function(name) {
	var length = this.scopes.length;
	var value;

	while (length--) {
		value = this.scopes[length][name];
		if(value) {
			return value;
		}
	}
};