assert = require '../assert'

suite 'multiplication'

test 'number * number', ->
	assert.compileTo '''
		body {
			-foo: 1 * 2;
		}
	''', '''
		body {
			-foo: 2;
		}
	'''

test 'number * percentage', ->
	assert.compileTo '''
		body {
			-foo: 2 * 1%;
		}
	''', '''
		body {
			-foo: 2%;
		}
	'''

test 'number * dimension', ->
	assert.compileTo '''
		body {
			-foo: 1 * 2px;
		}
	''', '''
		body {
			-foo: 2px;
		}
	'''

test 'percentage * number', ->
	assert.compileTo '''
		body {
			-foo: 1% * 2;
		}
	''', '''
		body {
			-foo: 2%;
		}
	'''

test 'percentage * percentage, not allowed', ->
	assert.failAt '''
		body {
			-foo: 1% * 1%;
		}
	''', { line: 2, column: 8 }

test 'percentage * dimension, not allowed', ->
	assert.failAt '''
		body {
			-foo: 1% * 2px;
		}
	''', { line: 2, column: 8 }

test 'dimension * number', ->
	assert.compileTo '''
		body {
			-foo: 1px * 1;
		}
	''', '''
		body {
			-foo: 1px;
		}
	'''

test 'dimension * dimension, not allowed', ->
	assert.failAt '''
		body {
			-foo: 1px * 1px;
		}
	''', { line: 2, column: 8 }

test 'number*number', ->
	assert.compileTo '''
		body {
			-foo: 1*2;
		}
	''', '''
		body {
			-foo: 2;
		}
	'''

test 'number* number', ->
	assert.compileTo '''
		body {
			-foo: 1* 2;
		}
	''', '''
		body {
			-foo: 2;
		}
	'''

test 'number *number', ->
	assert.compileTo '''
		body {
			-foo: 1 *2;
		}
	''', '''
		body {
			-foo: 2;
		}
	'''
