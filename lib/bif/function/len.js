'use strict';

var Node = require('../../node');
var Err = require('../../err');
var bif = require('../index');

bif.len = function(callNode) {
	var argumentListNode = callNode.children[1];
	if (!argumentListNode.children.length) {
		throw Err('no arguments passed to $len()', callNode, this.filename);
	}

	var argumentNode = argumentListNode.children[0];
	var length;
	if (argumentNode.type !== 'list') {
		length = 1;
	} else {
		length = (argumentNode.children.length - 1) / 2 + 1;
	}

	return Node('number', [length], {loc: callNode.loc});
};