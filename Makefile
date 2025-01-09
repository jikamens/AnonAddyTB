excluded=$(wildcard .??*) $(wildcard *~) $(wildcard *xpi) Makefile README.md \
  SECURITY.md node_modules package-lock.json package.json
included=LICENSE.txt $(wildcard *.js) $(wildcard *.html) manifest.json
extra=$(filter-out $(excluded) $(included),$(shell ls))
target=AnonAddyTB.xpi

$(target): $(included)
	@if [ -n "$(extra)" ]; then \
	    echo "Extra files in directory: $(extra)" 1>&2; exit 1; fi
	zip -r $@ $(included)

clean: ; -rm -f $(target) *~
