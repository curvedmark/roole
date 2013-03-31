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

test('$unit(number)', function() {
	assert.compileTo([
		'body {',
		'	-foo: $unit(1);',
		'}',
	], [
		'body {',
		'	-foo: "";',
		'}',
	]);
});

test('$unit(percentage)', function() {
	assert.compileTo([
		'body {',
		'	-foo: $unit(1%);',
		'}',
	], [
		'body {',
		'	-foo: "%";',
		'}',
	]);
});

test('$unit(dimension)', function() {
	assert.compileTo([
		'body {',
		'	-foo: $unit(1px);',
		'}',
	], [
		'body {',
		'	-foo: "px";',
		'}',
	]);
});

test('$unit(identifier), not allowed', function() {
	assert.failAt([
		'body {',
		'	-foo: $unit(px);',
		'}',
	], {line: 2, column: 14});
});

test('$unit(), not allowed', function() {
	assert.failAt([
		'body {',
		'	-foo: $unit();',
		'}',
	], {line: 2, column: 8});
});

test('$unit(number, percentage)', function() {
	assert.compileTo([
		'body {',
		'	-foo: $unit(1, 2%);',
		'}',
	], [
		'body {',
		'	-foo: 1%;',
		'}',
	]);
});

test('$unit(percentage, dimension)', function() {
	assert.compileTo([
		'body {',
		'	-foo: $unit(1%, 2px);',
		'}',
	], [
		'body {',
		'	-foo: 1px;',
		'}',
	]);
});

test('$unit(dimension, string)', function() {
	assert.compileTo([
		'body {',
		'	-foo: $unit(1%, "em");',
		'}',
	], [
		'body {',
		'	-foo: 1em;',
		'}',
	]);
});

test('$unit(dimension, empty string)', function() {
	assert.compileTo([
		'body {',
		'	-foo: $unit(1%, "");',
		'}',
	], [
		'body {',
		'	-foo: 1;',
		'}',
	]);
});

test('$unit(number, percentage string)', function() {
	assert.compileTo([
		'body {',
		'	-foo: $unit(1, "%");',
		'}',
	], [
		'body {',
		'	-foo: 1%;',
		'}',
	]);
});

test('$unit(number, identifier)', function() {
	assert.compileTo([
		'body {',
		'	-foo: $unit(1, px);',
		'}',
	], [
		'body {',
		'	-foo: 1px;',
		'}',
	]);
});

test('$unit(number, null), not allowed', function() {
	assert.failAt([
		'body {',
		'	-foo: $unit(1, null);',
		'}',
	], {line: 2, column: 17});
});