'use strict';

var assert = require('../assert');

suite('number');

test('fraction', function() {
	assert.compileTo([
		'body {',
		'	line-height: 1.24;',
		'}',
	], [
		'body {',
		'	line-height: 1.24;',
		'}',
	]);
});

test('fraction without whole number part', function() {
	assert.compileTo([
		'body {',
		'	line-height: .24;',
		'}',
	], [
		'body {',
		'	line-height: 0.24;',
		'}',
	]);
});