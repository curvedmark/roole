'use strict';

var Node = require('../../node');
var Err = require('../../err');
var bif = require('../index');

bif.oppositePosition = function(callNode) {
	var argumentListNode = callNode.children[1];
	if (!argumentListNode.children.length) {
		throw Err('no arguments passed', callNode, this.filename);
	}

	var argumentNode = argumentListNode.children[0];
	var returnNode = Node.clone(argumentNode);

	if (argumentNode.type === 'list') {
    returnNode.children[0].children[0] = oppositePositionHelperFunction(argumentNode.children[0].children[0]);
    returnNode.children[2].children[0] = oppositePositionHelperFunction(argumentNode.children[2].children[0]);
	} else {
    returnNode.children[0] = oppositePositionHelperFunction(argumentNode.children[0]);
	}

  return returnNode;
};

var oppositePositionHelperFunction = function(position) {
  switch(position)
  {
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
};
