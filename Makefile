TEST_FILES = \
	test/unit/comment.coffee \
	test/unit/selector.coffee \
	test/unit/property.coffee \
	test/unit/ruleset.coffee \
	test/unit/assignment.coffee \
	test/unit/identifier.coffee \
	test/unit/string.coffee \
	test/unit/number.coffee \
	test/unit/percentage.coffee \
	test/unit/dimension.coffee \
	test/unit/url.coffee \
	test/unit/color.coffee \
	test/unit/function.coffee \
	test/unit/list.coffee \
	test/unit/addition.coffee \
	test/unit/subtraction.coffee \
	test/unit/multiplication.coffee \
	test/unit/division.coffee \
	test/unit/modulus.coffee \
	test/unit/relational.coffee \
	test/unit/equality.coffee \
	test/unit/logical.coffee \
	test/unit/range.coffee \
	test/unit/unary.coffee \
	test/unit/expression.coffee \
	test/unit/mediaQuery.coffee \
	test/unit/media.coffee \
	test/unit/import.coffee \
	test/unit/extend.coffee \
	test/unit/void.coffee \
	test/unit/if.coffee \
	test/unit/for.coffee \
	test/unit/keyframes.coffee \
	test/unit/fontFace.coffee \
	test/unit/module.coffee \
	test/unit/page.coffee \
	test/unit/charset.coffee \
	test/unit/scope.coffee \
	test/unit/bif.coffee \
	test/unit/prefix.coffee

node-files = $(patsubst %,lib/$(1)/%.js,$(shell grep -oE "\./node/\w+" lib/$(1)/$(1).js))
function-files = $(patsubst %,lib/$(1)/%.js,$(shell grep -oE "\./function/\w+" lib/$(1)/index.js))

LIB_FILES = \
	lib/defaults.js \
	lib/helper.js \
	lib/err.js \
	lib/node.js \
	lib/parser/generatedParser.js \
	lib/parser/index.js \
	lib/visitor.js \
	lib/importer/xhr-loader.js \
	lib/importer/importer.js \
	lib/importer/index.js \
	lib/evaluator/scope.js \
	lib/evaluator/evaluator.js \
	$(call node-files,evaluator) \
	lib/evaluator/index.js \
	lib/bif/index.js \
	$(call function-files,bif) \
	lib/extender/extender.js \
	$(call node-files,extender) \
	lib/extender/mediaFilter.js \
	lib/extender/rulesetFilter.js \
	lib/extender/selectorExtender.js \
	lib/extender/index.js \
	lib/normalizer/normalizer.js \
	$(call node-files,normalizer) \
	lib/normalizer/index.js \
	lib/prefixer/prefixer.js \
	lib/prefixer/propertyNamePrefixer.js \
	lib/prefixer/linearGradientPrefixer.js \
	$(call node-files,prefixer) \
	lib/prefixer/index.js \
	lib/compiler/compiler.js \
	$(call node-files,compiler) \
	lib/compiler/index.js \
	lib/formatter.js \
	lib/roole.js \
	lib/browser.js

VERSION = $(shell node -e "console.log(require('./package.json').version)")

parser: lib/parser/generatedParser.js

lib/parser/generatedParser.js: \
	lib/parser/grammar.pegjs \
	node_modules/.bin/pegjs \
	build/json \
	build/mustache \
	lib/parser/generatedParser.js.mustache \
	node_modules/mustache

	cat $< | \
		$(word 2,$^) -e '' --allowed-start-rules root,selector,mediaQuery | \
		$(word 3,$^) content=- | \
		$(word 4,$^) $(word 5,$^) >$@

test: node_modules/.bin/mocha parser
	$< -bu qunit --compilers coffee:coffee-script $(TEST_FILES)
	$(MAKE) lint

cli-test: node_modules/.bin/mocha parser
	$< -bu qunit --compilers coffee:coffee-script test/unit/cli.coffee

all-test:
	$(MAKE) test
	$(MAKE) cli-test

coverage: coverage/index.html

COV_LIB_FILES = $(addprefix coverage/,$(LIB_FILES))
COV_TEST_FILES = $(addprefix coverage/,$(TEST_FILES))
coverage/index.html: \
	node_modules/.bin/mocha \
	$(COV_LIB_FILES) \
	$(COV_TEST_FILES)\
	coverage/lib/importer/fs-loader.js \
	coverage/test/assert.js \
	coverage/package.json

	$< \
		-R html-cov \
		-u qunit \
		--compilers coffee:coffee-script \
		$(COV_TEST_FILES) >$@

coverage/lib/%: node_modules/.bin/jscoverage lib/%
	$< $(word 2,$^) $@

coverage/test/%: test/% | coverage/test/unit
	cp $< $@

coverage/package.json: package.json
	cp $< $@

roole: dist/roole.js

min: dist/roole.min.js

dist/roole.js: \
	build/commonjs-stripper \
	build/json \
	build/mustache \
	dist/roole.js.mustache \
	package.json \
	$(LIB_FILES)

	$< $(LIB_FILES) | \
		$(word 2,$^) version=$(VERSION) content=- | \
		$(word 3,$^) $(word 4,$^) >$@

dist/roole.min.js: \
	node_modules/.bin/uglifyjs \
	dist/roole.js \
	build/json \
	build/mustache \
	dist/roole.min.js.mustache \
	package.json

	cd dist && \
		../$< roole.js -cm --source-map roole.min.js.map | \
	 	../build/json version=$(VERSION) content=- | \
		../build/mustache roole.min.js.mustache >roole.min.js

browser-test: parser min test/test.min.js test/vendor/mocha.js test/vendor/mocha.css

test/test.min.js: node_modules/.bin/uglifyjs test/test.js
	cd test && \
		../$< test.js -cm -o test.min.js --source-map test.min.js.map

test/test.js: \
	build/commonjs-stripper \
	test/assert.js \
	node_modules/.bin/coffee \
	$(TEST_FILES)

	echo "'use strict';" >$@
	echo >> $@
	$< $(word 2,$^) >>$@
	$< $(TEST_FILES) | $(word 3,$^) -sbp >>$@

test/vendor/mocha.js: node_modules/mocha/mocha.js | test/vendor
	cp $< $@

test/vendor/mocha.css: node_modules/mocha/mocha.css | test/vendor
	cp $< $@

node_modules/%:
	npm install

JS_FILES = $(shell find lib -type f \( -name '*.js' ! -name 'generatedParser.js' \))
lint: node_modules/.bin/jshint
	@$< bin/roole test/assert.js build/* $(JS_FILES)
	@$< --config test/unit/.jshintrc test/unit

test/vendor \
coverage/test/unit:
	mkdir -p $@

clean:
	rm -rf \
		coverage \
		dist/roole.js \
		dist/roole.min.js \
		dist/roole.min.js.map \
		test/vendor \
		test/test.js \
		test/test.min.js \
		test/test.min.js.map

.PHONY: parser test cli-test all-test browser-test coverage roole min  clean