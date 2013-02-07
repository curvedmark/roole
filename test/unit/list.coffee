assert = require '../assert'

suite 'list'

test 'space-separated list', ->
	assert.compileTo '''
		body
			margin: 10px 0 30px
	''', '''
		body {
			margin: 10px 0 30px;
		}
	'''

test 'comma-separated list', ->
	assert.compileTo '''
		body
			font-family: font1, font2, font3
	''', '''
		body {
			font-family: font1, font2, font3;
		}
	'''

test 'slash-separated list', ->
	assert.compileTo '''
		body
			font: 14px/1.2
	''', '''
		body {
			font: 14px/1.2;
		}
	'''

test 'mix-separated list', ->
	assert.compileTo '''
		body
			font: normal 12px/1.25 font1, font2
	''', '''
		body {
			font: normal 12px/1.25 font1, font2;
		}
	'''