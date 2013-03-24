'use strict';

var assert = require('../assert');

suite('percentage');

test('percentage', function() {
	assert.compileTo([
		'body {',
		'	width: 33.33%;',
		'}',
	], [
		'body {',
		'	width: 33.33%;',
		'}',
	]);
});