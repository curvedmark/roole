'use strict';

var _ = require('../helper');
var Node = require('../node');
var Translator = require('../visitor/translator');

module.exports = MediaQueryJoiner;

function MediaQueryJoiner(options) {
	Translator.call(this, options);
}

MediaQueryJoiner.prototype = new Translator();

MediaQueryJoiner.prototype.join = function (parentMqList, mqList) {
	if (!parentMqList) return mqList;
	var children = [];
	var mqs = parentMqList.children;
	var length = mqs.length;
	mqs.forEach(function (mq, i) {
		this.mediaQuery = mq;
		var clone = i === length - 1 ? mqList : Node.clone(mqList);
		children = children.concat(this.visit(clone.children));
	}, this);
	mqList.children = children;
	return mqList;
};

MediaQueryJoiner.prototype._visit = function (node) {
	if (node !== Object(node)) return node;
	var name = 'visit' + _.capitalize(node.type);
	if (name in this) return this[name](node);
};

MediaQueryJoiner.prototype.visitMediaQuery = function (mq) {
	mq.children = this.mediaQuery.children.concat(mq.children);
};