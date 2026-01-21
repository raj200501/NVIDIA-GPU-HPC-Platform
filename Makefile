SHELL := /bin/bash

.PHONY: setup test lint fmt verify run doctor

setup:
	@npm install

test:
	@npm test

lint:
	@bash scripts/lint.sh

fmt:
	@node -e "const pkg=require('./package.json'); if (pkg.scripts && (pkg.scripts.format || pkg.scripts.fmt)) { process.exit(0); } else { process.exit(1); }" \
		&& npm run format || npm run fmt || echo "No formatter configured."

verify:
	@bash scripts/verify.sh

run:
	@npm start

doctor:
	@bash scripts/doctor.sh
