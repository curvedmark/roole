'use strict';

var assert = require('../assert');

suite('subtraction');

test('number - number', function() {
	assert.compileTo([
		'body {',
		'	-foo: 1 - 1;',
		'}',
	], [
		'body {',
		'	-foo: 0;',
		'}',
	]);
});

test('number - percentage', function() {
	assert.compileTo([
		'body {',
		'	-foo: 1 - 1%;',
		'}',
	], [
		'body {',
		'	-foo: 0%;',
		'}',
	]);
});

test('number - dimension', function() {
	assert.compileTo([
		'body {',
		'	-foo: 1 - 2px;',
		'}',
	], [
		'body {',
		'	-foo: -1px;',
		'}',
	]);
});

test('percentage - number', function() {
	assert.compileTo([
		'body {',
		'	-foo: 1% - 2;',
		'}',
	], [
		'body {',
		'	-foo: -1%;',
		'}',
	]);
});

test('percentage - percentage', function() {
	assert.compileTo([
		'body {',
		'	-foo: 1% - 1%;',
		'}',
	], [
		'body {',
		'	-foo: 0%;',
		'}',
	]);
});

test('percentage - dimension', function() {
	assert.compileTo([
		'body {',
		'	-foo: 1% - 2px;',
		'}',
	], [
		'body {',
		'	-foo: -1%;',
		'}',
	]);
});

test('dimension - number', function() {
	assert.compileTo([
		'body {',
		'	-foo: 1px - 1;',
		'}',
	], [
		'body {',
		'	-foo: 0px;',
		'}',
	]);
});

test('dimension - dimension', function() {
	assert.compileTo([
		'body {',
		'	-foo: 1px - 1px;',
		'}',
	], [
		'body {',
		'	-foo: 0px;',
		'}',
	]);
});

test('dimension - dimension, different units', function() {
	assert.compileTo([
		'body {',
		'	-foo: 1em - 2px;',
		'}',
	], [
		'body {',
		'	-foo: -1em;',
		'}',
	]);
});

test('number-number', function() {
	assert.compileTo([
		'body {',
		'	-foo: 1-1;',
		'}',
	], [
		'body {',
		'	-foo: 0;',
		'}',
	]);
});

test('number- number', function() {
	assert.compileTo([
		'body {',
		'	-foo: 1- 1;',
		'}',
	], [
		'body {',
		'	-foo: 0;',
		'}',
	]);
});