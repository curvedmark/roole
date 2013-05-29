/**
 * LinearGradientPrefixer
 *
 * Visit property value nodes to prefix linear-gradient()
 */
'use strict';

var _ = require('../helper');
var Translator = require('../visitor/translator');
var Node = require('../node');
module.exports = LinearGradientPrefixer;

function LinearGradientPrefixer(options) {
	this.options = options;
}

LinearGradientPrefixer.stop = {};

LinearGradientPrefixer.prototype = new Translator();

LinearGradientPrefixer.prototype.prefix = function(val) {
	var prefixes = _.intersect(this.options.prefixes, ['webkit', 'moz', 'o']);
	var vals = [];

	this.hasLinearGradient = false;
	try { this.visit(val); }
	catch (error) { if (error !== LinearGradientPrefixer.stop) throw error; }
	if (!this.hasLinearGradient) return vals;

	prefixes.forEach(function(prefix) {
		this.currentPrefix = prefix;
		var clone = Node.clone(val);
		vals.push(this.visit(clone));
	}, this);

	return vals;
};

LinearGradientPrefixer.prototype._visit = function (node) {
	if (node !== Object(node)) return node;
	var name = 'visit' + _.capitalize(node.type);
	if (this[name]) return this[name](node);
	return this.visitNode(node);
};

LinearGradientPrefixer.prototype.visitNode = function (node) {
	if (node.children) this.visit(node.children);
};

LinearGradientPrefixer.prototype.visitCall = function(call) {
	var ident = call.children[0];
	var name = ident.children[0];
	if (name.toLowerCase() !== 'linear-gradient') return;

	if (!this.hasLinearGradient) {
		this.hasLinearGradient = true;
		throw LinearGradientPrefixer.stop;
	}
	call.children[0] = '-' + this.currentPrefix + '-' + name;

	var argList = call.children[1];
	var firstArg = argList.children[0];
	if (firstArg.type !== 'list') {
		return;
	}

	var item = firstArg.children[0];
	if (item.type !== 'identifier' || item.children[0] !== 'to') {
		return;
	}

	var positions = firstArg.children.slice(2);
	firstArg.children = positions.map(function(position) {
		if (position.type !== 'identifier') return position;

		var name = position.children[0];
		switch (name) {
		case 'top':
			name = 'bottom';
			break;
		case 'bottom':
			name = 'top';
			break;
		case 'left':
			name = 'right';
			break;
		case 'right':
			name = 'left';
			break;
		}
		position.children[0] = name;

		return position;
	});
};