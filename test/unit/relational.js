'use strict';

var assert = require('../assert');

suite('relational');

test('number < number', function() {
	assert.compileTo([
		'body {',
		'	-foo: 1 < 2;',
		'}',
	], [
		'body {',
		'	-foo: true;',
		'}',
	]);
});

test('number <= number', function() {
	assert.compileTo([
		'body {',
		'	-foo: 2 <= 2;',
		'}',
	], [
		'body {',
		'	-foo: true;',
		'}',
	]);
});

test('number > number', function() {
	assert.compileTo([
		'body {',
		'	-foo: 2 > 2;',
		'}',
	], [
		'body {',
		'	-foo: false;',
		'}',
	]);
});

test('number >= number', function() {
	assert.compileTo([
		'body {',
		'	-foo: 2 >= 3;',
		'}',
	], [
		'body {',
		'	-foo: false;',
		'}',
	]);
});

test('number >= identifer', function() {
	assert.compileTo([
		'body {',
		'	-foo: 2 >= abc;',
		'}',
	], [
		'body {',
		'	-foo: false;',
		'}',
	]);
});

test('identifer < number', function() {
	assert.compileTo([
		'body {',
		'	-foo: abc < 2;',
		'}',
	], [
		'body {',
		'	-foo: false;',
		'}',
	]);
});

test('identifier < identifier', function() {
	assert.compileTo([
		'body {',
		'	-foo: a < b;',
		'}',
	], [
		'body {',
		'	-foo: true;',
		'}',
	]);
});

test('string > string', function() {
	assert.compileTo([
		'body {',
		'	-foo: "b" > "a";',
		'}',
	], [
		'body {',
		'	-foo: true;',
		'}',
	]);
});