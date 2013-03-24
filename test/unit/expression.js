'use strict';

var assert = require('../assert');

suite('expression');

test('number + number - number', function() {
	assert.compileTo([
		'body {',
		'	-foo: 1 + 2 - 1;',
		'}',
	], [
		'body {',
		'	-foo: 2;',
		'}',
	]);
});

test('number / number * number', function() {
	assert.compileTo([
		'body {',
		'	-foo: 1 / 2 * -3;',
		'}',
	], [
		'body {',
		'	-foo: -1.5;',
		'}',
	]);
});

test('number + number * number', function() {
	assert.compileTo([
		'body {',
		'	-foo: 1 + 2 * 3;',
		'}',
	], [
		'body {',
		'	-foo: 7;',
		'}',
	]);
});

test('(number + number) * number', function() {
	assert.compileTo([
		'body {',
		'	-foo: (1 + 2) * 3;',
		'}',
	], [
		'body {',
		'	-foo: 9;',
		'}',
	]);
});

test('number > number is boolean', function() {
	assert.compileTo([
		'body {',
		'	-foo: -1 > 1 is false;',
		'}',
	], [
		'body {',
		'	-foo: true;',
		'}',
	]);
});

test('number + number .. number * number', function() {
	assert.compileTo([
		'body {',
		'	-foo: 1 + 1 .. 2 * 2;',
		'}',
	], [
		'body {',
		'	-foo: 2 3 4;',
		'}',
	]);
});

test('list containing empty range', function() {
	assert.compileTo([
		'body {',
		'	-foo: 3 1 + 1 ... 1 * 2;',
		'}',
	], [
		'body {',
		'	-foo: 3 null;',
		'}',
	]);
});