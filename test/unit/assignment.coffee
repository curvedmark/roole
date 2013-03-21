assert = require '../assert'

suite 'assignment'

test 'variables are case-sensitive', ->
	assert.compileTo '''
		$width = 960px;
		$Width = 480px;
		body {
			width: $width;
		}
	''', '''
		body {
			width: 960px;
		}
	'''

test '?= after =', ->
	assert.compileTo '''
		$width = 960px;
		$width ?= 480px;
		body {
			width: $width;
		}
	''', '''
		body {
			width: 960px;
		}
	'''

test 'lone ?= ', ->
	assert.compileTo '''
		$width ?= 480px;
		body {
			width: $width;
		}
	''', '''
		body {
			width: 480px;
		}
	'''