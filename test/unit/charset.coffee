assert = require '../assert'

suite '@charset'

test '@charset', ->
	assert.compileTo '''
		@charset 'UTF-8';
	''', '''
		@charset 'UTF-8';
	'''
