'use strict';

var RooleError = require('../../error');

module.exports = function(callNode) {
	var argumentListNode = callNode.children[1];
	if (!argumentListNode.children.length) {
		throw new RooleError('no arguments passed', callNode);
	}

	var argumentNode = argumentListNode.children[0];
	var length;
	if (argumentNode.type !== 'list') {
		length = 1;
	} else {
		length = (argumentNode.children.length - 1) / 2 + 1;
	}

	return {
		type: 'number',
		children: [length],
		loc: callNode.loc,
	};
};