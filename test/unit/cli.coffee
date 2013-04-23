assert = require '../assert'

suite 'Command Line'


test 'roole', (done) ->
	assert.compileToWithCmd 'roole', '''
		body {margin: 1px}
	''', '''
		body {
			margin: 1px;
		}
	''', done

test 'roole file', (done) ->
	assert.compileToWithCmd 'roole foo.roo', {
		'foo.roo': 'body {margin: 1px}'
	}, {
		'foo.css': '''
			body {
				margin: 1px;
			}
		'''
	}, done

test 'roole file file', (done) ->
	assert.compileToWithCmd 'roole foo.roo bar.roo', {
		'foo.roo': 'body {margin: 1px}'
		'bar.roo': 'body {margin: 2px}'
	}, {
		'foo.css': '''
			body {
				margin: 1px;
			}
		'''
		'bar.css': '''
			body {
				margin: 2px;
			}
		'''
	}, done

test 'roole empty-file', (done) ->
	assert.compileToWithCmd 'roole foo.roo', {
		'foo.roo': ''
	}, {
		'foo.css': null
	}, done

test 'roole file empty-files', (done) ->
	assert.compileToWithCmd 'roole foo.roo bar.roo', {
		'foo.roo': 'body {margin: 1px}'
		'bar.roo': ''
	}, {
		'foo.css': '''
			body {
				margin: 1px;
			}
		'''
		'bar.css': null
	}, done

test 'roole importing-files', (done) ->
	assert.compileToWithCmd 'roole bar.roo', {
		'foo.roo': 'body {margin: 1px}'
		'bar.roo': '@import "foo.roo";'
	}, {
		'foo.css': null
		'bar.css': '''
			body {
				margin: 1px;
			}
		'''
	}, done

test 'roole dir/importing-file', (done) ->
	assert.compileToWithCmd 'roole foo/bar.roo', {
		'foo/foo.roo': 'body {margin: 1px}'
		'foo/bar.roo': '@import "foo.roo";'
	}, {
		'foo/foo.css': null
		'foo/bar.css': '''
			body {
				margin: 1px;
			}
		'''
	}, done

test 'roole -f empty-file', (done) ->
	assert.compileToWithCmd 'roole -f foo.roo', {
		'foo.roo': ''
	}, {
		'foo.css': ''
	}, done

test 'roole dir', (done) ->
	assert.compileToWithCmd 'roole foo', {
		'foo/foo.roo': 'body {margin: 1px}'
		'foo/bar.roo': 'body {margin: 2px}'
	}, {
		'foo/foo.css': '''
			body {
				margin: 1px;
			}
		'''
		'foo/bar.css': '''
			body {
				margin: 2px;
			}
		'''
	}, done

test 'roole -o dir file', (done) ->
	assert.compileToWithCmd 'roole -o foo foo.roo', {
		'foo.roo': 'body {margin: 1px}'
	}, {
		'foo/foo.css': '''
			body {
				margin: 1px;
			}
		'''
	}, done

test 'roole -o dir dir/file', (done) ->
	assert.compileToWithCmd 'roole -o foo bar/bar.roo', {
		'bar/bar.roo': 'body {margin: 1px}'
	}, {
		'foo/bar.css': '''
			body {
				margin: 1px;
			}
		'''
	}, done

test 'roole -o dir file empty-file', (done) ->
	assert.compileToWithCmd 'roole -o foo foo.roo bar.roo', {
		'foo.roo': 'body {margin: 1px}'
		'bar.roo': ''
	}, {
		'foo/foo.css': '''
			body {
				margin: 1px;
			}
		'''
		'foo/bar.css': null
	}, done

test 'roole -o dir dir', (done) ->
	assert.compileToWithCmd 'roole -o foo bar', {
		'bar/foo.roo': 'body {margin: 1px}'
		'bar/baz/baz.roo': 'body {margin: 2px}'
	}, {
		'foo/foo.css': '''
			body {
				margin: 1px;
			}
		'''
		'foo/baz/baz.css': '''
			body {
				margin: 2px;
			}
		'''
	}, done

test 'roole -p file file', (done) ->
	assert.compileToWithCmd 'roole -p foo.roo bar.roo', {
		'foo.roo': 'body {margin: 1px}'
		'bar.roo': 'body {margin: 2px}'
	}, '''
		body {
			margin: 1px;
		}

		body {
			margin: 2px;
		}
	''', done

test 'roole --prefix "webkit"', (done) ->
	assert.compileToWithCmd 'roole --prefix "webkit"', '''
		body {box-sizing: border-box}
	''', '''
		body {
			-webkit-box-sizing: border-box;
			box-sizing: border-box;
		}
	''', done

test 'roole --prefix ""', (done) ->
	assert.compileToWithCmd 'roole --prefix ""', '''
		body {box-sizing: border-box}
	''', '''
		body {
			box-sizing: border-box;
		}
	''', done

test 'roole --indent "  "', (done) ->
	assert.compileToWithCmd 'roole --indent "  "', '''
		body {margin: 1px}
	''', '''
		body {
		  margin: 1px;
		}
	''', done

test 'roole --precision 5', (done) ->
	assert.compileToWithCmd 'roole --precision 5', '''
		body {margin: 1px / 3}
	''', '''
		body {
			margin: 0.33333px;
		}
	''', done

test 'roole --skip-prefixed', (done) ->
	assert.compileToWithCmd 'roole --skip-prefixed', '''
		body {
			-moz-box-sizing: padding-box;
			box-sizing: padding-box;
		}
	''', '''
		body {
			-moz-box-sizing: padding-box;
			-webkit-box-sizing: padding-box;
			box-sizing: padding-box;
		}
	''', done
