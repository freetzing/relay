ifeq ($(OS),Windows_NT)
	BIN=node_modules\.bin
	PATHSEP2=\\
	RM=del -r
else
	BIN=./node_modules/.bin
	PATHSEP2=/
	RM=rm -rf
endif

# make <target> LOG=yes
ifeq "$(LOG)" ""
	LOG=no
endif

ifeq "$(LOG)" "no"
	L=@
endif

PATHSEP=$(strip $(PATHSEP2))

all: lint test build docs

# BIN ?= ./node_modules/.bin
# DIR ?= $(dir $(lastword $(MAKEFILE_LIST)))
LINT_SRC_JS ?= .

lint:
	$(L)$(BIN)$(PATHSEP)eslint $(LINT_SRC_JS)
lint-fix:
	$(L)$(BIN)$(PATHSEP)eslint $(LINT_SRC_JS) --fix
.PHONY: lint lint-fix

vars:
	@echo $(OS)
	@echo $(LOG)
	@echo $(BIN)
	@echo $(PATHSEP)
	@echo $(RM)

test:
	$(L)$(BIN)$(PATHSEP)jest
open-coverage: test
	$(L)open coverage$(PATHSEP)lcov-report$(PATHSEP)index.html
.PHONY: test open-coverage

build:
	$(L)$(BIN)$(PATHSEP)babel -o lib$(PATHSEP)index.js src$(PATHSEP)index.js
.PHONY: build

docs:
	$(L)$(BIN)$(PATHSEP)esdoc
docs-open: docs
	$(L)open docs$(PATHSEP)index.html
.PHONY: docs docs-open

release-commit: build docs
	git add lib
	git add docs
	git commit -m "Updated build artifacts (lib and docs)"
.PHONY: release-commit

clean:
	$(L)$(RM) coverage
.PHONY: clean
