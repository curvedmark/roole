/**
 * PropertyNamePrefixer
 *
 * Prefix property name
 */
'use strict';

var _ = require('../helper');
var Translator = require('../visitor/translator');
var Node = require('../node');
module.exports = PropertyNamePrefixer;

function PropertyNamePrefixer(options) {
	this.options = options;
}

PropertyNamePrefixer.prototype = new Translator();

PropertyNamePrefixer.prototype.prefix = function(name) {
	return this.visit(name);
};

PropertyNamePrefixer.prototype._visit = function (node) {
	if (node !== Object(node)) return node;
	var name = 'visit' + _.capitalize(node.type);
	if (this[name]) return this[name](node);
	return this.visitNode(node);
};

PropertyNamePrefixer.prototype.visitNode = function (node) {
	if (node.children) this.visit(node.children);
};

PropertyNamePrefixer.prototype.visitIdentifier = function(ident) {
	var name = ident.children[0];
	var names = [];
	var prefixes = this.options.prefixes;

	switch (name) {
	case 'box-sizing':
	case 'box-shadow':
	case 'border-radius':
		prefixes = _.intersect(prefixes, ['webkit', 'moz']);
		break;
	case 'user-select':
		prefixes = _.intersect(prefixes, ['webkit', 'moz', 'ms']);
		break;
	case 'transition-duration':
	case 'transition-property':
	case 'transition':
		prefixes = _.intersect(prefixes, ['webkit', 'moz', 'o']);
		break;
	case 'transform':
		break;
	default:
		return names;
	}
	prefixes.forEach(function(prefix) {
		var prefixed = '-' + prefix + '-' + name;
		if (this.options.properties) {
			var exists = this.options.properties.some(function(prop) {
				var ident = prop.children[0];
				var name = ident.children[0];
				return prefixed === name;
			});
			if (exists) return;
		}
		var clone = Node.clone(ident);
		clone.children[0] = prefixed;
		names.push(clone);
	}, this);
	return names;
};