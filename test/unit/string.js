'use strict';

var assert = require('../assert');

suite('string');

test('single-quoted string with escaped quote', function() {
	assert.compileTo([
		'a {',
		'	content: \'"a\\\'\';',
		'}',
	], [
		'a {',
		'	content: \'"a\\\'\';',
		'}',
	]);
});

test('empty single-quoted string', function() {
	assert.compileTo([
		'a {',
		'	content: \'\';',
		'}',
	], [
		'a {',
		'	content: \'\';',
		'}',
	]);
});

test('not interpolating single-quoted string', function() {
	assert.compileTo([
		'a {',
		'	content: \'a $var\';',
		'}',
	], [
		'a {',
		'	content: \'a $var\';',
		'}',
	]);
});

test('double-quoted string with escaped quote', function() {
	assert.compileTo([
		'a {',
		'	content: "\'a0\\"";',
		'}',
	], [
		'a {',
		'	content: "\'a0\\"";',
		'}',
	]);
});

test('empty double-quoted string', function() {
	assert.compileTo([
		'a {',
		'	content: "";',
		'}',
	], [
		'a {',
		'	content: "";',
		'}',
	]);
});

test('interpolate identifier', function() {
	assert.compileTo([
		'$name = guest;',
		'a {',
		'	content: "hello $name";',
		'}',
	], [
		'a {',
		'	content: "hello guest";',
		'}',
	]);
});

test('interpolate single-quoted string', function() {
	assert.compileTo([
		'$name = \'guest\';',
		'a {',
		'	content: "hello $name";',
		'}',
	], [
		'a {',
		'	content: "hello guest";',
		'}',
	]);
});

test('interpolate double-quoted string', function() {
	assert.compileTo([
		'$name = "guest";',
		'a {',
		'	content: "hello $name";',
		'}',
	], [
		'a {',
		'	content: "hello guest";',
		'}',
	]);
});

test('not allow interpolating function', function() {
	assert.failAt([
		'$name = @function {',
		'	body {',
		'		margin: auto;',
		'	}',
		'};',
		'a {',
		'	content: "hello $name";',
		'}',
	], {line: 7, column: 18});
});

test('contain braced variable', function() {
	assert.compileTo([
		'$chapter = 4;',
		'figcaption {',
		'	content: "Figure {$chapter}-12";',
		'}',
	], [
		'figcaption {',
		'	content: "Figure 4-12";',
		'}',
	]);
});

test('escape braced variable', function() {
	assert.compileTo([
		'figcaption {',
		'	content: "Figure \\{\\$chapter}-12";',
		'}',
	], [
		'figcaption {',
		'	content: "Figure \\{\\$chapter}-12";',
		'}',
	]);
});

test('contain braces but not variable', function() {
	assert.compileTo([
		'$chapter = 4;',
		'figcaption {',
		'	content: "Figure {chapter}-12";',
		'}',
	], [
		'figcaption {',
		'	content: "Figure {chapter}-12";',
		'}',
	]);
});

test('escape double quotes', function() {
	assert.compileTo([
		'$str = \'"\\""\';',
		'a {',
		'	content: "$str";',
		'}',
	], [
		'a {',
		'	content: "\\"\\"\\"";',
		'}',
	]);
});