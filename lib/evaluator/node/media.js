'use strict';

var MediaQueryJoiner = require('../mediaQueryJoiner');

module.exports = function (evaluator, media) {
	var parentMqList;
	return evaluator.visit(media.children[0]).then(function (mqList) {
		evaluator.scope.push();
		parentMqList = evaluator.mediaQueryList;
		new MediaQueryJoiner().join(parentMqList, mqList);
		evaluator.mediaQueryList = mqList;
		return evaluator.visit(media.children[1]);
	}).then(function () {
		evaluator.scope.pop();
		evaluator.mediaQueryList = parentMqList;
	});
};