var assert = require('assert');
var fs = require('fs');
var roole = require('..');
require('mocha-as-promised')();

exports.compileTo = function (input, css) {
	return roole.compile(input, {
		prettyError: true
	}).then(function (output) {
		if (css) css += '\n';
		assert.equal(output, css);
	});
};