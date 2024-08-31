.PHONY: build
build:
	web-ext build -s ./src -n build.zip --overwrite-dest
	cd src && tar -czf ../web-ext-artifacts/build.tar.gz ./*

.PHONY: lint
lint:
	cd src && web-ext lint

.PHONY: publish
publish:
	web-ext sign \
		--source-dir src \
		--api-key $(ADDONS_MOZ_JWT_ISSUER) --api-secret $(ADDONS_MOZ_JWT_SECRET) \
		--channel listed \
		--amo-metadata ./amo-metadata.json