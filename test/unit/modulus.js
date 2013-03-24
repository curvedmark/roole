'use strict';

var assert = require('../assert');

suite('modulus');

test('number % number', function() {
	assert.compileTo([
		'body {',
		'	-foo: 3 % 2;',
		'}',
	], [
		'body {',
		'	-foo: 1;',
		'}',
	]);
});

test('percentage % number', function() {
	assert.compileTo([
		'body {',
		'	-foo: 4% % 2;',
		'}',
	], [
		'body {',
		'	-foo: 0%;',
		'}',
	]);
});

test('dimension % number', function() {
	assert.compileTo([
		'body {',
		'	-foo: 3px % 2;',
		'}',
	], [
		'body {',
		'	-foo: 1px;',
		'}',
	]);
});