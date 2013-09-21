assert = require 'assert'
fs = require 'fs-extra'
path = require 'path'
exec = require('child_process').exec
Promise = require 'promise-now'
tmpdir = path.resolve __dirname, 'tmp'
bindir = path.resolve __dirname, '../bin'

assert = Object.create assert

assert.file = (filename, content) ->
	filename = path.resolve tmpdir, filename

	try
		data = fs.readFileSync filename, 'utf8'
	catch err
		throw new Error "no such file '" + filename + "'" if err.errno is 34
		throw err

	assert.strictEqual data, content

assert.fileNotExists = (filename) ->
	filename = path.resolve tmpdir, filename

	try
		stat = fs.statSync filename

	throw new Error "exists '" + filename + "'" if stat

create = (filename, data) ->
	filename = path.resolve tmpdir, filename
	fs.createFileSync filename
	fs.writeFileSync filename, data

append = (filename, data) ->
	filename = path.resolve tmpdir, filename
	fs.appendFileSync filename, data

run = (cmd, cb) ->
	opts = { cwd: tmpdir, env: { PATH: bindir + ':' + process.env.PATH } }

	return exec cmd, opts if not cb

	promise = new Promise();

	exec cmd, opts, (err, stdout, stderr) ->
		return promise.reject err if err
		promise.fulfill stdout

	promise.then cb

delay = (timeout, cb) ->
	promise = new Promise();
	setTimeout promise.fulfill.bind(promise), timeout
	promise.then cb

beforeEach ->
	fs.removeSync tmpdir
afterEach ->
	fs.removeSync tmpdir

test "compile file", ->
	create 'a.roo', 'body {}'
	create 'b', 'div {}'
	create 'c.roo', '// comment'

	run 'roole a.roo b c.roo', ->
		assert.file 'a.css', 'body {}\n'
		assert.file 'b.css', 'div {}\n'
		assert.fileNotExists 'c.css'

test "compile dir", ->
	create 'foo/a/a.roo', 'body {}'
	create 'foo/b', 'div {}'
	create 'foo/c.roo', ''

	run 'roole foo', ->
		assert.file 'foo/a/a.css', 'body {}\n'
		assert.fileNotExists 'foo/b.css'
		assert.fileNotExists 'foo/c.css'

test "compile file with --out", ->
	create 'foo/a.roo', 'body {}'
	create 'foo/b/b.roo', 'div {}'

	run 'roole --out bar foo/a.roo foo/b/b.roo', ->
		assert.file 'bar/a.css', 'body {}\n'
		assert.file 'bar/b.css', 'div {}\n'

test "compile dir with --out", ->
	create 'foo/a.roo', 'body {}'
	create 'foo/b/b.roo', 'div {}'

	run 'roole --out bar foo', ->
		assert.file 'bar/a.css', 'body {}\n'
		assert.file 'bar/b/b.css', 'div {}\n'

test "compile file with --force", ->
	create 'a.roo', ''
	create 'foo/b/b.roo', ''

	run 'roole --force a.roo foo/b/b.roo', ->
		assert.file 'a.css', ''
		assert.file 'foo/b/b.css', ''

test "compile dir with --force", ->
	create 'foo/a.roo', ''
	create 'foo/b/b.roo', ''

	run 'roole --force foo', ->
		assert.file 'foo/a.css', ''
		assert.file 'foo/b/b.css', ''

test "compile to stdout", ->
	create 'a.roo', 'body {}'

	run 'roole --stdout a.roo', (stdout) ->
		assert.equal stdout, 'body {}\n'

test "compile from stdin", ->
	create 'a.roo', 'body {}'

	run 'cat a.roo | roole', (stdout) ->
		assert.equal stdout, 'body {}\n'


test "compile file importing other files", ->
	create 'foo/a.roo', '@import "./b.roo";'
	create 'foo/b.roo', 'a {}'

	run 'roole foo/a.roo', () ->
		assert.file 'foo/a.css', '''
			a {}

		'''
		assert.fileNotExists 'foo/b.css'

test "compile file containing relative url", ->
	create 'a.roo', '@import "./b";'
	create 'b/index.roo', 'a { content: url(b.png) }'

	run 'roole a.roo', () ->
		assert.file 'a.css', '''
			a {
				content: url(b.png);
			}

		'''

test "compile file containing prefixed relative url", ->
	create 'a.roo', '@import "./b";'
	create 'b/index.roo', 'a { content: url(./b.png) }'

	run 'roole a.roo', () ->
		assert.file 'a.css', '''
			a {
				content: url(b/b.png);
			}

		'''

test "compile file containing relative url to stdout", ->
	create 'a.roo', '@import "./b";'
	create 'b/index.roo', 'a { content: url(b.png) }'

	run 'roole --stdout a.roo', (stdout) ->
		assert.equal stdout, '''
			a {
				content: url(b.png);
			}

		'''

test "compile file containing prefixed relative url to stdout", ->
	create 'a.roo', '@import "./b";'
	create 'b/index.roo', 'a { content: url(./b.png) }'

	run 'roole --stdout a.roo', (stdout) ->
		assert.equal stdout, '''
			a {
				content: url(b/b.png);
			}

		'''

test "compile stdin containing relative url", ->
	create 'a.roo', '@import "./b";'
	create 'b/index.roo', 'a { content: url(b.png) }'

	run 'cat a.roo | roole', (stdout) ->
		assert.equal stdout, '''
			a {
				content: url(b.png);
			}

		'''

test "compile stdin containing prefixed relative url", ->
	create 'a.roo', '@import "./b";'
	create 'b/index.roo', 'a { content: url(./b.png) }'

	run 'cat a.roo | roole', (stdout) ->
		assert.equal stdout, '''
			a {
				content: url(b/b.png);
			}

		'''