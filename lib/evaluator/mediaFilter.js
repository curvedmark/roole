/**
 * Media Filter
 *
 * Find medias matching the passed media queries
 */
'use strict';

var _ = require('../helper');
var Node = require('../node');
var Visitor = require('../visitor');

module.exports = MediaFilter;

function MediaFilter(options) {
	this.options = options;
	this.mediaQueryList = options.mediaQueryList;
	this.medias = [];
}

MediaFilter.stop = {};

MediaFilter.prototype = new Visitor();

MediaFilter.prototype.filter = function (nodes) {
	try { this.visit(nodes); }
	catch (err) { if (err !== MediaFilter.stop) throw err; }
	return this.medias;
};

MediaFilter.prototype._visit = function (node) {
	if (node !== Object(node)) return node;
	if (node === this.options.stop) throw MediaFilter.stop;
	var name = 'visit' + _.capitalize(node.type);
	if (name in this) return this[name](node);
};

MediaFilter.prototype.visitVoid =
MediaFilter.prototype.visitRuleset =
MediaFilter.prototype.visitRuleList = function (node) {
	this.visit(node.children);
};

MediaFilter.prototype.visitMedia = function (media) {
	var mqList = media.children[0];
	if (mqList === this.mediaQueryList) {
		this.medias.push(media);
		throw MediaFilter.stop;
	}
	if (Node.equal(mqList, this.mediaQueryList)) this.medias.push(media);
	else this.visit(media.children[1]);
};