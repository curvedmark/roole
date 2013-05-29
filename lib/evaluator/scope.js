/**
 * Scope
 *
 * Regulate lexical scoping.
 */
'use strict';

var Scope = module.exports = function(frames) {
	this.frames = frames || [{}];
};

Scope.prototype.clone = function () {
	var scope = new Scope();
	scope.frames = this.frames.slice(0);
	return scope;
};

Scope.prototype.push = function() {
	this.frames.push({});
};

Scope.prototype.pop = function() {
	this.frames.pop();
};

Scope.prototype.define = function(name, value) {
	this.frames[this.frames.length - 1][name] = value;
};

Scope.prototype.resolve = function(name) {
	var length = this.frames.length;
	var value;

	while (length--) {
		value = this.frames[length][name];
		if(value) return value;
	}
};