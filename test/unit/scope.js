'use strict';

var assert = require('../assert');

suite('scope');

test('ruleset creates new scope', function() {
	assert.compileTo([
		'$width = 980px;',
		'body {',
		'	$width = 500px;',
		'	width: $width;',
		'}',
		'html {',
		'	width: $width;',
		'}',
	], [
		'body {',
		'	width: 500px;',
		'}',
		'',
		'html {',
		'	width: 980px;',
		'}',
	]);
});

test('@media creates new scope', function() {
	assert.compileTo([
		'$width = 980px;',
		'',
		'@media screen {',
		'	$width = 500px;',
		'	body {',
		'		width: $width;',
		'	}',
		'}',
		'',
		'html {',
		'	width: $width;',
		'}',
	], [
		'@media screen {',
		'	body {',
		'		width: 500px;',
		'	}',
		'}',
		'',
		'html {',
		'	width: 980px;',
		'}',
	]);
});

test('@import does not create new scope', function() {
	assert.compileTo({imports: {
		'base.roo': [
			'$width = 500px;',
			'body {',
			'	width: $width;',
			'}',
		]
	}}, [
		'$width = 980px;',
		'',
		'@import "base";',
		'',
		'html {',
		'	width: $width;',
		'}',
	], [
		'body {',
		'	width: 500px;',
		'}',
		'',
		'html {',
		'	width: 500px;',
		'}',
	]);
});

test('@void creates new scope', function() {
	assert.compileTo([
		'$width = 100px;',
		'@void {',
		'	$width = 50px;',
		'	.button {',
		'		width: $width;',
		'	}',
		'}',
		'',
		'#submit {',
		'	@extend .button;',
		'}',
		'',
		'#reset {',
		'	width: $width;',
		'}',
	], [
		'#submit {',
		'	width: 50px;',
		'}',
		'',
		'#reset {',
		'	width: 100px;',
		'}',
	]);
});

test('@block creates new scope', function() {
	assert.compileTo([
		'$width = 980px;',
		'@block {',
		'	$width = 500px;',
		'	body {',
		'		width: $width;',
		'	}',
		'}',
		'html {',
		'	width: $width;',
		'}',
	], [
		'body {',
		'	width: 500px;',
		'}',
		'',
		'html {',
		'	width: 980px;',
		'}',
	]);
});

test('@if does not create new scope', function() {
	assert.compileTo([
		'$width = 980px;',
		'',
		'@if true {',
		'	$width = 500px;',
		'}',
		'',
		'body {',
		'	width: $width;',
		'}',
	], [
		'body {',
		'	width: 500px;',
		'}',
	]);
});

test('@for does not create new scope', function() {
	assert.compileTo([
		'$width = 980px;',
		'',
		'@for $i in 1 {',
		'	$width = 500px;',
		'}',
		'',
		'body {',
		'	width: $width;',
		'}',
	], [
		'body {',
		'	width: 500px;',
		'}',
	]);
});

test('@keyframes creates new scope', function() {
	assert.compileTo([
		'$width = 960px;',
		'',
		'@-webkit-keyframes name {',
		'	$width = 400px;',
		'',
		'	from {',
		'		$width = 200px;',
		'		width: $width;',
		'	}',
		'	to {',
		'		width: $width;',
		'	}',
		'}',
		'',
		'body {',
		'	width: $width;',
		'}',
	], [
		'@-webkit-keyframes name {',
		'	from {',
		'		width: 200px;',
		'	}',
		'	to {',
		'		width: 400px;',
		'	}',
		'}',
		'',
		'body {',
		'	width: 960px;',
		'}',
	]);
});