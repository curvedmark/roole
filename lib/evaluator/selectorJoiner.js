'use strict';

var _ = require('../helper');
var RooleError = require('../error');
var Node = require('../node');
var Translator = require('../visitor/translator');

module.exports = SelectorJoiner;

function SelectorJoiner() {}

SelectorJoiner.prototype = new Translator();

SelectorJoiner.prototype.join = function (parentSelList, selList) {
	if (!parentSelList) {
		this.selector = null;
		return this.visit(selList.children);
	}
	var children = [];
	var sels = parentSelList.children;
	var length = sels.length;
	sels.forEach(function (sel, i) {
		this.selector = sel;
		var clone = i === length - 1 ? selList : Node.clone(selList);
		children = children.concat(this.visit(clone.children));
	}, this);
	selList.children = children;
	return selList;
};

SelectorJoiner.prototype._visit = function (node) {
	if (node !== Object(node)) return node;
	var name = 'visit' + _.capitalize(node.type);
	if (name in this) return this[name](node);
};

SelectorJoiner.prototype.visitSelector = function (sel) {
	this.visit(sel.children);
	if (this.ampersandSelector) {
		this.ampersandSelector = null;
		return;
	}
	var first = sel.children[0];
	var combFirst = first.type === 'combinator';
	if (combFirst) {
		if (!this.selector) throw new RooleError('selector starting with a combinator is not allowed at the top level', first);
		sel.children = this.selector.children.concat(sel.children);
	} else if (this.selector) {
		var comb = {
			type: 'combinator',
			children: [' '],
			loc: sel.loc,
		};
		sel.children = this.selector.children.concat(comb, sel.children);
	}
};

SelectorJoiner.prototype.visitAmpersandSelector = function (sel) {
	if (!this.selector) {
		throw new RooleError('& selector is not allowed at the top level', sel);
	}
	this.ampersandSelector = sel;
	var val = sel.children[0];
	if (!val) return this.selector.children;

	var parts = this.selector.children;
	var last = parts[parts.length - 1];
	switch (last.type) {
	case 'classSelector':
	case 'hashSelector':
	case 'typeSelector':
		break;
	default:
		throw new RooleError('appending to ' + last.type + ' is not allowed', sel);
	}
	var clone = Node.clone(last);
	var id = clone.children[0];
	id.children[0] += val.children[0];
	var children = parts.slice(0, -1);
	children.push(clone);
	return children;
};