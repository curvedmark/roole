'use strict';

var assert = require('../assert');

suite('dimension');

test('time', function() {
	assert.compileTo([
		'body {',
		'	-webkit-transition-duration: .24s;',
		'}',
	], [
		'body {',
		'	-webkit-transition-duration: 0.24s;',
		'}',
	]);
});