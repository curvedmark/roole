assert = require '../assert'

suite 'property'

test 'multi-line properties', ->
	assert.compileTo '''
		body
			width: auto
			height: auto
	''', '''
		body {
			width: auto;
			height: auto;
		}
	'''

test 'single-line properties', ->
	assert.compileTo '''
		body
			width: auto; height: auto
	''', '''
		body {
			width: auto;
			height: auto;
		}
	'''

test 'mixed-line properties', ->
	assert.compileTo '''
		body
			width: auto; height: auto
			float: left
	''', '''
		body {
			width: auto;
			height: auto;
			float: left;
		}
	'''

test 'starred property', ->
	assert.compileTo '''
		body
			*zoom: 1
	''', '''
		body {
			*zoom: 1;
		}
	'''

test '!important', ->
	assert.compileTo '''
		body
			width: auto !important
	''', '''
		body {
			width: auto !important;
		}
	'''

test 'with trailing ;', ->
	assert.compileTo '''
		body
			margin: 0; padding: 0;
	''', '''
		body {
			margin: 0;
			padding: 0;
		}
	'''

test 'with multiple trailing ;', ->
	assert.compileTo '''
		body
			margin: 0;; padding: 0
	''', '''
		body {
			margin: 0;
			padding: 0;
		}
	'''

test 'with multiple trailing ; interspersed with spaces', ->
	assert.compileTo '''
		body
			margin: 0; ; padding: 0; ;  ;
	''', '''
		body {
			margin: 0;
			padding: 0;
		}
	'''

test 'with trailing ; and !important', ->
	assert.compileTo '''
		body
			margin: 0 !important; padding: 0;
	''', '''
		body {
			margin: 0 !important;
			padding: 0;
		}
	'''

test 'multi-line values', ->
	assert.compileTo '''
		body
			background:
				url(a)
				url(b)
	''', '''
		body {
			background: url(a), url(b);
		}
	'''

test 'mixed-line values', ->
	assert.compileTo '''
		body
			background:
				url(a)
				url(b), url(c)
				url(d)
	''', '''
		body {
			background: url(a), url(b), url(c), url(d);
		}
	'''

test 'multi-line values with !important', ->
	assert.compileTo '''
		body
			background:
				url(a)
				url(b)
				!important
	''', '''
		body {
			background: url(a), url(b) !important;
		}
	'''