.PHONY: smoke docs-check
docs-check:
	@test -f README.md && test -f LICENSE
	@test -f ARCHITECTURE.md && test -f THIRD_PARTY.md && test -f SECURITY.md && test -f CONTRACTS.md
	@test -f docs/linear-map.md
	@echo docs-check ok
smoke: docs-check
	@test -f package.json
	@node -e "JSON.parse(require('fs').readFileSync('package.json','utf8')); console.log('package.json ok')"
	@echo 'cli-scaffold-tool smoke ok'
