'use strict';

var Node = require('../../node');
var Err = require('../../err');
var bif = require('../index');

bif.opp = function(callNode) {
	var argumentListNode = callNode.children[1];
	if (!argumentListNode.children.length) {
		throw Err('no arguments passed', callNode, this.filename);
	}

	var argumentNode = argumentListNode.children[0];
	var argumentClone = Node.clone(argumentNode);
	var oppNode = toOppNode(argumentClone);
	if (oppNode === null) {
		throw Err('invalid position', argumentClone, this.filename);
	}

	return oppNode;
};

function toOppNode(node) {
	if (node.type === 'list') {
		return toOppListNode(node);
	}

	var pos = Node.toString(node);
	if (pos === null) {
		return null;
	}

	var oppPos = toOppPos(pos);
	if (oppPos === null) {
		return null;
	}

	node.children[0] = oppPos;
	return node;
}

function toOppListNode(listNode) {
	listNode.children.forEach(function(node, i) {
		if (i % 2) {
			return node;
		}

		listNode.children[i] = toOppNode(node);
	});

	return listNode;
}

function toOppPos(pos) {
	switch(pos) {
	case 'left':
		return 'right';
	case 'right':
		return 'left';
	case 'top':
		return 'bottom';
	case 'bottom':
		return 'top';
	case 'center':
		return 'center';
	}

	return null;
}