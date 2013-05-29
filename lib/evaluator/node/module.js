'use strict';

var RooleError = require('../../error');
var Node = require('../../node');

module.exports = function (evaulator, mod) {
	var nameVal;
	var parentName = evaulator.module || '';

	return evaulator.visit(mod.children[0]).then(function (name) {
		nameVal = Node.toString(name);
		if (nameVal === undefined) throw new RooleError(name.type + " can not be used as a module name" , name);
		return evaulator.visit(mod.children[1]);
	}).then(function (sep) {
		var sepVal = sep ? Node.toString(sep) : '-';
		if (sepVal === undefined) throw new RooleError(sep.type + " can not be used as a module name separator" , sep);
		evaulator.module = parentName + nameVal + sepVal;
		return evaulator.visit(mod.children[2]);
	}).then(function (ruleList) {
		evaulator.module = parentName;
		return ruleList.children;
	});
};