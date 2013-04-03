'use strict';

var Node = require('../../node');
var Err = require('../../err');
var bif = require('../index');

bif.opposite_position = function(callNode) {
	var argumentListNode = callNode.children[1];
	if (!argumentListNode.children.length) {
		throw Err('no arguments passed', callNode, this.filename);
	}

	var position = argumentListNode.children[0].children[0];

	if (position == 'left') {
  	return Node('string', 'right', {loc: callNode.loc});
	}

	if (position == 'right') {
  	return Node('string', 'left', {loc: callNode.loc});
	}

	if (position == 'top') {
  	return Node('string', 'bottom', {loc: callNode.loc});
	}

	if (position == 'bottom') {
  	return Node('string', 'tom', {loc: callNode.loc});
	}

	if (position == 'center') {
  	return Node('string', 'center', {loc: callNode.loc});
	}

};