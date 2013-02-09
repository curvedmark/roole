assert = require '../assert'

suite 'equality'

test 'is, true', ->
	assert.compileTo '''
		body
			-foo: 1 is 1
	''', '''
		body {
			-foo: true;
		}
	'''

test 'is, false', ->
	assert.compileTo '''
		body
			-foo: 1 is 2
	''', '''
		body {
			-foo: false;
		}
	'''

test 'isnt, true', ->
	assert.compileTo '''
		body
			-foo: 1 isnt 2
	''', '''
		body {
			-foo: true;
		}
	'''

test 'isnt, false', ->
	assert.compileTo '''
		body
			-foo: 1 isnt 1
	''', '''
		body {
			-foo: false;
		}
	'''

test 'inclusive range isnt exclusive range', ->
	assert.compileTo '''
		body
			-foo: 1..2 isnt 1...2
	''', '''
		body {
			-foo: true;
		}
	'''