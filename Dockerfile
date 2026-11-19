# syntax=docker/dockerfile:1

# ---- build ----
FROM golang:1.27-bookworm AS build
WORKDIR /src

# Dependencies first so they are cached between code changes.
# (Standard library only today; add go.sum here when you add modules.)
COPY go.mod ./
RUN go mod download

COPY . .
ARG VERSION=dev
RUN CGO_ENABLED=0 GOOS=linux go build -trimpath \
    -ldflags "-s -w -X main.version=${VERSION}" \
    -o /out/api ./cmd/api

# ---- run ----
# distroless/static: no shell, no package manager, CA certificates included
# (needed for HTTPS calls to the MLIT API), runs as a non-root user.
FROM gcr.io/distroless/static-debian12:nonroot
COPY --from=build /out/api /api
USER nonroot:nonroot
ENV PORT=8080 LOG_FORMAT=json
EXPOSE 8080
ENTRYPOINT ["/api"]
