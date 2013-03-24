'use strict';

var assert = require('../assert');

suite('color');

test('3-digit #rgb', function() {
	assert.compileTo([
		'body {',
		'	color: #000;',
		'}',
	], [
		'body {',
		'	color: #000;',
		'}',
	]);
});

test('6-digit #rgb', function() {
	assert.compileTo([
		'body {',
		'	color: #ff1234;',
		'}',
	], [
		'body {',
		'	color: #ff1234;',
		'}',
	]);
});