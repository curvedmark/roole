'use strict';

var assert = require('../assert');

suite('Builti-in Function');

test('$len(list)', function() {
	assert.compileTo([
		'body {',
		'	-foo: $len(a b);',
		'}',
	], [
		'body {',
		'	-foo: 2;',
		'}',
	]);
});

test('$len(value)', function() {
	assert.compileTo([
		'body {',
		'	-foo: $len(a);',
		'}',
	], [
		'body {',
		'	-foo: 1;',
		'}',
	]);
});

test('$len(), not allowed', function() {
	assert.failAt([
		'body {',
		'	-foo: $len();',
		'}',
	], {line: 2, column: 8});
});