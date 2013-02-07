assert = require '../assert'

suite 'division'

test 'number / number', ->
	assert.compileTo '''
		body
			-foo: 1 / 2
	''', '''
		body {
			-foo: 0.5;
		}
	'''

test 'number / 0, not allowed', ->
	assert.failAt '''
		body
			-foo: 1 / 0
	''', 2, 12

test 'number / number, result in fraction', ->
	assert.compileTo '''
		body
			-foo: 1 / 3
	''', '''
		body {
			-foo: 0.333;
		}
	'''

test 'number / percentage', ->
	assert.compileTo '''
		body
			-foo: 2 / 1%
	''', '''
		body {
			-foo: 2%;
		}
	'''

test 'number / 0%, not allowed', ->
	assert.failAt '''
		body
			-foo: 1 / 0%
	''', 2, 12

test 'number / dimension', ->
	assert.compileTo '''
		body
			-foo: 1 / 2px
	''', '''
		body {
			-foo: 0.5px;
		}
	'''

test 'number / 0px, not allowed', ->
	assert.failAt '''
		body
			-foo: 1 / 0px
	''', 2, 12

test 'percentage / number', ->
	assert.compileTo '''
		body
			-foo: 1% / 2
	''', '''
		body {
			-foo: 0.5%;
		}
	'''

test 'percentage / 0, not allowed', ->
	assert.failAt '''
		body
			-foo: 1% / 0
	''', 2, 13

test 'percentage / percentage', ->
	assert.compileTo '''
		body
			-foo: 1% / 1%
	''', '''
		body {
			-foo: 1%;
		}
	'''

test 'percentage / 0%, not allowed', ->
	assert.failAt '''
		body
			-foo: 1% / 0%
	''', 2, 13

test 'percentage / dimension', ->
	assert.compileTo '''
		body
			-foo: 1% / 2px
	''', '''
		body {
			-foo: 0.5%;
		}
	'''

test 'percentage / 0px, not allowed', ->
	assert.failAt '''
		body
			-foo: 1% / 0px
	''', 2, 13

test 'dimension / number', ->
	assert.compileTo '''
		body
			-foo: 1px / 1
	''', '''
		body {
			-foo: 1px;
		}
	'''

test 'dimension / 0, not allowed', ->
	assert.failAt '''
		body
			-foo: 1px / 0
	''', 2, 14

test 'dimension / percentage', ->
	assert.compileTo '''
		body
			-foo: 1px / 2%
	''', '''
		body {
			-foo: 0.5px;
		}
	'''

test 'dimension / 0%, not allowed', ->
	assert.failAt '''
		body
			-foo: 1px / 0%
	''', 2, 14

test 'dimension / dimension', ->
	assert.compileTo '''
		body
			-foo: 1px / 1px
	''', '''
		body {
			-foo: 1px;
		}
	'''

test 'dimension / dimension, different units', ->
	assert.compileTo '''
		body
			-foo: 1em / 2px
	''', '''
		body {
			-foo: 0.5em;
		}
	'''

test 'dimension / 0px, not allowed', ->
	assert.failAt '''
		body
			-foo: 1px / 0px
	''', 2, 14

test 'number/ number', ->
	assert.compileTo '''
		body
			-foo: 1/ 2
	''', '''
		body {
			-foo: 0.5;
		}
	'''

test 'number /number', ->
	assert.compileTo '''
		body
			-foo: 1 /2
	''', '''
		body {
			-foo: 0.5;
		}
	'''