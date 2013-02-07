assert = require '../assert'

suite 'subtraction'

test 'number - number', ->
	assert.compileTo '''
		body
			-foo: 1 - 1
	''', '''
		body {
			-foo: 0;
		}
	'''

test 'number - percentage', ->
	assert.compileTo '''
		body
			-foo: 1 - 1%
	''', '''
		body {
			-foo: 0%;
		}
	'''

test 'number - dimension', ->
	assert.compileTo '''
		body
			-foo: 1 - 2px
	''', '''
		body {
			-foo: -1px;
		}
	'''

test 'percentage - number', ->
	assert.compileTo '''
		body
			-foo: 1% - 2
	''', '''
		body {
			-foo: -1%;
		}
	'''

test 'percentage - percentage', ->
	assert.compileTo '''
		body
			-foo: 1% - 1%
	''', '''
		body {
			-foo: 0%;
		}
	'''

test 'percentage - dimension', ->
	assert.compileTo '''
		body
			-foo: 1% - 2px
	''', '''
		body {
			-foo: -1%;
		}
	'''

test 'dimension - number', ->
	assert.compileTo '''
		body
			-foo: 1px - 1
	''', '''
		body {
			-foo: 0px;
		}
	'''

test 'dimension - dimension', ->
	assert.compileTo '''
		body
			-foo: 1px - 1px
	''', '''
		body {
			-foo: 0px;
		}
	'''

test 'dimension - dimension, different units', ->
	assert.compileTo '''
		body
			-foo: 1em - 2px
	''', '''
		body {
			-foo: -1em;
		}
	'''

test 'number-number', ->
	assert.compileTo '''
		body
			-foo: 1-1
	''', '''
		body {
			-foo: 0;
		}
	'''

test 'number- number', ->
	assert.compileTo '''
		body
			-foo: 1- 1
	''', '''
		body {
			-foo: 0;
		}
	'''