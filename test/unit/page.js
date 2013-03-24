'use strict';

var assert = require('../assert');

suite('@page');

test('without page selector', function() {
	assert.compileTo([
		'@page {',
		'	margin: 2em;',
		'}',
	], [
		'@page {',
		'	margin: 2em;',
		'}',
	]);
});

test('with page selector', function() {
	assert.compileTo([
		'@page :first {',
		'	margin: 2em;',
		'}',
	], [
		'@page :first {',
		'	margin: 2em;',
		'}',
	]);
});