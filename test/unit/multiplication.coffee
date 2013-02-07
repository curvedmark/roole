assert = require '../assert'

suite 'multiplication'

test 'number * number', ->
	assert.compileTo '''
		body
			-foo: 1 * 2
	''', '''
		body {
			-foo: 2;
		}
	'''

test 'number * percentage', ->
	assert.compileTo '''
		body
			-foo: 2 * 1%
	''', '''
		body {
			-foo: 2%;
		}
	'''

test 'number * dimension', ->
	assert.compileTo '''
		body
			-foo: 1 * 2px
	''', '''
		body {
			-foo: 2px;
		}
	'''

test 'percentage * number', ->
	assert.compileTo '''
		body
			-foo: 1% * 2
	''', '''
		body {
			-foo: 2%;
		}
	'''

test 'percentage * percentage', ->
	assert.compileTo '''
		body
			-foo: 1% * 1%
	''', '''
		body {
			-foo: 1%;
		}
	'''

test 'percentage * dimension', ->
	assert.compileTo '''
		body
			-foo: 1% * 2px
	''', '''
		body {
			-foo: 2%;
		}
	'''

test 'dimension * number', ->
	assert.compileTo '''
		body
			-foo: 1px * 1
	''', '''
		body {
			-foo: 1px;
		}
	'''

test 'dimension * dimension', ->
	assert.compileTo '''
		body
			-foo: 1px * 1px
	''', '''
		body {
			-foo: 1px;
		}
	'''

test 'dimension * dimension, different units', ->
	assert.compileTo '''
		body
			-foo: 1em * 2px
	''', '''
		body {
			-foo: 2em;
		}
	'''

test 'number*number', ->
	assert.compileTo '''
		body
			-foo: 1*2
	''', '''
		body {
			-foo: 2;
		}
	'''

test 'number* number', ->
	assert.compileTo '''
		body
			-foo: 1* 2
	''', '''
		body {
			-foo: 2;
		}
	'''

test 'number *number', ->
	assert.compileTo '''
		body
			-foo: 1 *2
	''', '''
		body {
			-foo: 2;
		}
	'''