assert = require '../assert'

suite '@font-face'

test 'remove empty @font-face', ->
	assert.compileTo '''
		@font-face {}
	''', ''

test '@font-face', ->
	assert.compileTo '''
		@font-face {
			font-family: font;
		}
	''', '''
		@font-face {
			font-family: font;
		}
	'''
