assert = require '../assert'

suite '@import'

test 'import with string', ->
	assert.compileTo {
		'base.roo': '''
			body
				margin: 0
		'''
	}, '''
		@import 'base'
	''', '''
		body {
			margin: 0;
		}
	'''

test 'import with url()', ->
	assert.compileTo '''
		@import url(base)
	''', '''
		@import url(base);
	'''

test 'import with url starting with protocol', ->
	assert.compileTo '''
		@import 'http://example.com/style'
	''', '''
		@import 'http://example.com/style';
	'''

test 'import with url end with .css', ->
	assert.compileTo '''
		@import 'style.css'
	''', '''
		@import 'style.css';
	'''

test 'import with media query', ->
	assert.compileTo '''
		@import 'base' screen
	''', '''
		@import 'base' screen;
	'''

test 'nest under ruleset', ->
	assert.compileTo {
		'base.roo': '''
			body
				margin: 0
		'''
	}, '''
		html
			@import 'base'
	''', '''
		html body {
			margin: 0;
		}
	'''

test 'recursively import', ->
	assert.compileTo {
		'reset.roo': '''
			body
				margin: 0
		'''
		'button.roo': '''
			@import 'reset'

			.button
				display: inline-block
		'''
	}, '''
		@import 'button'
	''', '''
		body {
			margin: 0;
		}

		.button {
			display: inline-block;
		}
	'''

test 'import same file multiple times', ->
	assert.compileTo {
		'reset.roo': '''
			body
				margin: 0
		'''
		'button.roo': '''
			@import 'reset'

			.button
				display: inline-block
		'''
		'tabs.roo': '''
			@import 'reset'

			.tabs
				overflow: hidden
		'''
	}, '''
		@import 'button'
		@import 'tabs'
	''', '''
		body {
			margin: 0;
		}

		.button {
			display: inline-block;
		}

		.tabs {
			overflow: hidden;
		}
	'''

test 'recursively import files of the same directory', ->
	assert.compileTo {
		'tabs/tab.roo': '''
			.tab
				float: left
		'''
		'tabs/tabs.roo': '''
			@import 'tab'

			.tabs
				overflow: hidden
		'''
	}, '''
		@import 'tabs/tabs'
	''', '''
		.tab {
			float: left;
		}

		.tabs {
			overflow: hidden;
		}
	'''

test 'recursively import files of different directories', ->
	assert.compileTo {
		'reset.roo': '''
			body
				margin: 0
		'''
		'tabs/index.roo': '''
			@import '../reset'

			.tabs
				overflow: hidden
		'''
	}, '''
		@import 'tabs/index'
	''', '''
		body {
			margin: 0;
		}

		.tabs {
			overflow: hidden;
		}
	'''

test 'import empty file', ->
	assert.compileTo {
		'var.roo': '''
			$width = 980px
		'''
	}, '''
		@import 'var'

		body
			width: $width
	''', '''
		body {
			width: 980px;
		}
	'''

test 'not importing file with variables in the path', ->
	assert.compileTo '''
		$path = 'tabs'
		@import $path
	''', '''
		@import 'tabs';
	'''

test 'not allow importing file has syntax error', ->
	assert.failAt {
		'base.roo': '''
			body @
				margin: 0
		'''
	}, '''
		@import 'base'
	''', 1, 6, 'base.roo'