'use strict';

var assert = require('../assert');

suite('@keyframes');

test('remove empty @keyframes', function() {
	assert.compileTo([
		'@keyframes name {}',
	], [
		'',
	]);
});

test('remove empty keyframe block', function() {
	assert.compileTo([
		'@keyframes name {',
		'	0% {}',
		'}',
	], [
		'',
	]);
});

test('prefixed @keyframes', function() {
	assert.compileTo([
		'@-webkit-keyframes name {',
		'	0% {',
		'		top: 0;',
		'	}',
		'	100% {',
		'		top: 100px;',
		'	}',
		'}',
	], [
		'@-webkit-keyframes name {',
		'	0% {',
		'		top: 0;',
		'	}',
		'	100% {',
		'		top: 100px;',
		'	}',
		'}',
	]);
});

test('from to', function() {
	assert.compileTo([
		'@-webkit-keyframes name {',
		'	from {',
		'		top: 0;',
		'	}',
		'	to {',
		'		top: 100px;',
		'	}',
		'}',
	], [
		'@-webkit-keyframes name {',
		'	from {',
		'		top: 0;',
		'	}',
		'	to {',
		'		top: 100px;',
		'	}',
		'}',
	]);
});

test('keyframe selector list', function() {
	assert.compileTo([
		'@-webkit-keyframes name {',
		'	0% {',
		'		top: 0;',
		'	}',
		'	50%, 60% {',
		'		top: 50px;',
		'	}',
		'	100% {',
		'		top: 100px;',
		'	}',
		'}',
	], [
		'@-webkit-keyframes name {',
		'	0% {',
		'		top: 0;',
		'	}',
		'	50%, 60% {',
		'		top: 50px;',
		'	}',
		'	100% {',
		'		top: 100px;',
		'	}',
		'}',
	]);
});

test('unprefixed @keyframes', function() {
	assert.compileTo([
		'@keyframes name {',
		'	0% {',
		'		top: 0;',
		'	}',
		'	100% {',
		'		top: 100px;',
		'	}',
		'}',
	], [
		'@-webkit-keyframes name {',
		'	0% {',
		'		top: 0;',
		'	}',
		'	100% {',
		'		top: 100px;',
		'	}',
		'}',
		'',
		'@-moz-keyframes name {',
		'	0% {',
		'		top: 0;',
		'	}',
		'	100% {',
		'		top: 100px;',
		'	}',
		'}',
		'',
		'@-o-keyframes name {',
		'	0% {',
		'		top: 0;',
		'	}',
		'	100% {',
		'		top: 100px;',
		'	}',
		'}',
		'',
		'@keyframes name {',
		'	0% {',
		'		top: 0;',
		'	}',
		'	100% {',
		'		top: 100px;',
		'	}',
		'}',
	]);
});

test('contain property needs to be prefixed', function() {
	assert.compileTo([
		'@keyframes name {',
		'	from {',
		'		border-radius: 0;',
		'	}',
		'	to {',
		'		border-radius: 10px;',
		'	}',
		'}',
	], [
		'@-webkit-keyframes name {',
		'	from {',
		'		-webkit-border-radius: 0;',
		'		border-radius: 0;',
		'	}',
		'	to {',
		'		-webkit-border-radius: 10px;',
		'		border-radius: 10px;',
		'	}',
		'}',
		'',
		'@-moz-keyframes name {',
		'	from {',
		'		-moz-border-radius: 0;',
		'		border-radius: 0;',
		'	}',
		'	to {',
		'		-moz-border-radius: 10px;',
		'		border-radius: 10px;',
		'	}',
		'}',
		'',
		'@-o-keyframes name {',
		'	from {',
		'		border-radius: 0;',
		'	}',
		'	to {',
		'		border-radius: 10px;',
		'	}',
		'}',
		'',
		'@keyframes name {',
		'	from {',
		'		border-radius: 0;',
		'	}',
		'	to {',
		'		border-radius: 10px;',
		'	}',
		'}',
	]);
});