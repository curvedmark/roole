'use strict';

var assert = require('../assert');

suite('call');

test('single argument', function() {
	assert.compileTo([
		'a {',
		'	content: attr(href);',
		'}',
	], [
		'a {',
		'	content: attr(href);',
		'}',
	]);
});

test('multiple arguments', function() {
	assert.compileTo([
		'a {',
		'	content: counters(item, ".");',
		'}',
	], [
		'a {',
		'	content: counters(item, ".");',
		'}',
	]);
});