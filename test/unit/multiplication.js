'use strict';

var assert = require('../assert');

suite('multiplication');

test('number * number', function() {
	assert.compileTo([
		'body {',
		'	-foo: 1 * 2;',
		'}',
	], [
		'body {',
		'	-foo: 2;',
		'}',
	]);
});

test('number * percentage', function() {
	assert.compileTo([
		'body {',
		'	-foo: 2 * 1%;',
		'}',
	], [
		'body {',
		'	-foo: 2%;',
		'}',
	]);
});

test('number * dimension', function() {
	assert.compileTo([
		'body {',
		'	-foo: 1 * 2px;',
		'}',
	], [
		'body {',
		'	-foo: 2px;',
		'}',
	]);
});

test('percentage * number', function() {
	assert.compileTo([
		'body {',
		'	-foo: 1% * 2;',
		'}',
	], [
		'body {',
		'	-foo: 2%;',
		'}',
	]);
});

test('percentage * percentage', function() {
	assert.compileTo([
		'body {',
		'	-foo: 1% * 1%;',
		'}',
	], [
		'body {',
		'	-foo: 1%;',
		'}',
	]);
});

test('percentage * dimension', function() {
	assert.compileTo([
		'body {',
		'	-foo: 1% * 2px;',
		'}',
	], [
		'body {',
		'	-foo: 2%;',
		'}',
	]);
});

test('dimension * number', function() {
	assert.compileTo([
		'body {',
		'	-foo: 1px * 1;',
		'}',
	], [
		'body {',
		'	-foo: 1px;',
		'}',
	]);
});

test('dimension * dimension', function() {
	assert.compileTo([
		'body {',
		'	-foo: 1px * 1px;',
		'}',
	], [
		'body {',
		'	-foo: 1px;',
		'}',
	]);
});

test('dimension * dimension, different units', function() {
	assert.compileTo([
		'body {',
		'	-foo: 1em * 2px;',
		'}',
	], [
		'body {',
		'	-foo: 2em;',
		'}',
	]);
});

test('number*number', function() {
	assert.compileTo([
		'body {',
		'	-foo: 1*2;',
		'}',
	], [
		'body {',
		'	-foo: 2;',
		'}',
	]);
});

test('number* number', function() {
	assert.compileTo([
		'body {',
		'	-foo: 1* 2;',
		'}',
	], [
		'body {',
		'	-foo: 2;',
		'}',
	]);
});

test('number *number', function() {
	assert.compileTo([
		'body {',
		'	-foo: 1 *2;',
		'}',
	], [
		'body {',
		'	-foo: 2;',
		'}',
	]);
});