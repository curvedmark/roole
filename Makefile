LIB_FILES = $(shell find lib -type f -name '*.js')
VERSION = $(shell node -e "console.log(require('./package.json').version)")
BIN = node_modules/.bin

all: min

#
# Generated Parser
#
parser: lib/parser/generatedParser.js

lib/parser/generatedParser.js: lib/parser/grammar.pegjs node_modules
	$(BIN)/pegjs --allowed-start-rules stylesheet,selector,mediaQuery $< $@

#
# Browser Build
#
roole: dist/roole.js

min: dist/roole.min.js

dist/roole.js: lib/parser/generatedParser.js $(LIB_FILES) node_modules
	echo '/*'                                                     >$@
	echo ' * Roole - A language that compiles to CSS v$(VERSION)' >>$@
	echo ' * http://roole.org'                                    >>$@
	echo ' *'                                                     >>$@
	echo ' * Copyright 2012 Glen Huang'                           >>$@
	echo ' * Released under the MIT license'                      >>$@
	echo ' */'                                                    >>$@
	$(BIN)/browserify --transform brpkg --standalone roole ./lib/roole.js >>$@
	cat lib/browser.js >>$@

dist/roole.min.js: dist/roole.js node_modules
	echo '// Roole v$(VERSION) | roole.org | MIT license' >$@
	$(BIN)/uglifyjs $< --compress --mangle >>$@

#
# Test
#
test: parser node_modules
	$(BIN)/mocha \
		--compilers coffee:coffee-script \
		--require test/setup.js \
		--ui qunit \
		--bail \
		test/spec/*.coffee

test-cli: parser node_modules
	$(BIN)/mocha \
		--compilers coffee:coffee-script \
		--require test/setup.js \
		--ui qunit \
		--bail \
		test/io/cli.coffee

test-browser: parser roole test/test.js
	$(BIN)/mocha-phantomjs -R dot test/index.html

test-all:
	$(MAKE) test
	$(MAKE) test-cli
	$(MAKE) test-browser

test/test.js: test/assert.js test/spec/*.coffee node_modules
	$(BIN)/browserify \
		--transform coffeeify \
		--outfile $@ \
		test/spec/*.coffee

#
# Lint
#
lint: node_modules
	@$(BIN)/jshint \
		bin/roole \
		test/assert.js \
		$(filter-out lib/parser/generatedParser.js,$(LIB_FILES))

#
# Node Module
#
node_modules:
	npm install

#
# Clean
#
clean:
	rm -rf \
		dist \
		test/test.js

.PHONY: parser roole min test test-cli test-browser test-all clean