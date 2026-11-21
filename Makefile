.DEFAULT_GOAL := help
BIN     := bin/api
# Named explicitly: ./... would also walk web/node_modules, where npm packages ship Go files.
PKGS    := ./cmd/... ./internal/...
GODIRS  := cmd internal
VERSION ?= $(shell git describe --tags --always --dirty 2>/dev/null || echo dev)

.PHONY: help run run-live test race cover vet fmt fmt-check check build docker-build docker-run clean

help: ## Show targets
	@grep -E '^[a-z-]+:.*##' $(MAKEFILE_LIST) | awk 'BEGIN{FS=":.*## "}{printf "  %-13s %s\n", $$1, $$2}'

run: ## Run locally with dummy data (no API key needed)
	go run ./cmd/api

run-live: ## Run against the real MLIT API (needs REINFOLIB_API_KEY in .env)
	set -a && . ./.env && set +a && DATA_MODE=live go run ./cmd/api

test: ## Unit tests
	go test $(PKGS)

race: ## Tests with the race detector
	go test -race -count=1 $(PKGS)

cover: ## Coverage report (opens coverage.html)
	go test -coverprofile=coverage.out $(PKGS) && go tool cover -html=coverage.out -o coverage.html

vet: ## go vet
	go vet $(PKGS)

fmt: ## Format code
	gofmt -w $(GODIRS)

fmt-check: ## Fail if code is not formatted
	@test -z "$$(gofmt -l $(GODIRS))" || (echo "not formatted:"; gofmt -l $(GODIRS); exit 1)

check: fmt-check vet race ## Everything CI runs

build: ## Build a static binary
	CGO_ENABLED=0 go build -trimpath -ldflags "-s -w -X main.version=$(VERSION)" -o $(BIN) ./cmd/api

docker-build: ## Build the container image
	docker build --build-arg VERSION=$(VERSION) -t kurashi-nav:$(VERSION) .

docker-run: ## Run the container with dummy data
	docker run --rm -p 8080:8080 kurashi-nav:$(VERSION)

clean:
	rm -rf bin coverage.out coverage.html
