# 탑다운 학습 가이드 — 이 저장소를 읽고 키우는 순서

> 개인 학습 노트입니다. 공개 저장소에 두기 싫으면 `.gitignore`에 추가하세요.

> Claude Code(VS Code)와 같이 공부하는 방법은 `docs/MVP.md` §9를 보세요.
> 각 단계를 읽은 뒤 `/explain <경로>`로 설명과 확인 질문을 받을 수 있습니다.

## 원칙

1. **먼저 돌려본다** → 2. **입구(main)에서 안쪽으로** 내려간다 → 3. **궁금한 곳만** 파고든다.
- 모르는 문법이 나와도 멈추지 말고 `// ?` 표시만 하고 지나갑니다. 전체 흐름이 먼저입니다.
- 각 단계의 **질문**에 말로 답할 수 있으면 다음 단계로. 답이 막히면 그 부분만 문서/책을 찾아봅니다.
- 테스트 파일이 곧 사용 설명서입니다. 코드가 어려우면 `_test.go`부터 읽으세요.

---

## 0단계 — 돌려보기 (30분)

```sh
make run                 # 더미 데이터로 :8080 실행 (API 키 불필요)
make check               # 포맷 + vet + race 테스트
```

README의 `curl` 예시를 그대로 실행하고, 응답 JSON을 훑어봅니다.
`"lang"`을 `ko` / `ja` / `en`으로 바꿔 보고, `lat`을 뉴욕 좌표로 바꿔 400 에러도 봅니다.

**질문**
- 응답의 `sections` 9개는 코드 어디서 정해지나? (힌트: `DefaultLayers`)
- 서버를 Ctrl+C로 끄면 로그에 무엇이 찍히나? 왜 그 순서인가?

## 1단계 — 입구: `cmd/api/main.go`

흐름: 설정 읽기 → 로거 → 의존성 조립(`buildHousing`) → HTTP 서버 → 종료 신호 대기 → graceful shutdown.

**키워드:** `signal.NotifyContext`, `http.Server`의 각종 Timeout, `srv.Shutdown`, 의존성 주입(DI)

**질문**
- `ReadHeaderTimeout`이 없으면 어떤 공격에 취약한가? (Slowloris)
- `DATA_MODE=fake`와 `live`에서 바뀌는 건 무엇이고, 바뀌지 않는 건 무엇인가?
- 왜 `housing` 패키지가 아니라 `main`에서 구체 구현(reinfolib, fakesource)을 고르나?

## 2단계 — HTTP 층: `internal/server`

- `server.go`: 라우트 3개(Go 1.22 메서드 패턴)와 미들웨어 체인. **감싸는 순서와 실행 순서가 반대**인 점을 확인.
- `handlers.go`: JSON 디코드 → 서비스 호출 → 도메인 에러를 HTTP 상태코드로 매핑.
- `json.go`: 바디 크기 제한, 모르는 필드 거부, 에러 응답 형식 통일.
- `server_test.go`: `httptest`로 서버를 띄우지 않고 테스트하는 법.

**질문**
- 접근 로그에 쿼리스트링·바디·IP를 남기지 않는 이유는? (ADR-0002) 그걸 보장하는 테스트는 어디?
- `GET /v1/housing/check`가 405가 되는 건 누가 처리하나?
- panic이 나도 서버가 죽지 않는 이유는?

## 3단계 — 핵심 도메인: `internal/housing/service.go`

`Check()`의 4단계: ① I/O 없는 검증 먼저 → ② 위치 해석 → ③ 병렬 조회(fan-out) → ④ 조립.

- `ports.go`: `LayerSource`, `Geocoder` 인터페이스. **housing은 reinfolib을 import하지 않는다** (의존성 역전 / 헥사고날).
- `lookupAll`: 고루틴 9개, 각자 자기 인덱스에만 씀 → mutex 불필요.
- `lookupOne`: 레이어별 타임아웃, 실패는 에러가 아니라 "unavailable 섹션"이라는 **데이터**가 됨 (ADR-0003).

**실험**
- `service_test.go`의 `TestCheck_SlowLayerTimesOut`에서 타임아웃 값을 바꿔 보며 결과 관찰.
- `TestCheck_RunsLayersInParallel`에서 `Options.MaxParallel`을 1로 바꾸면 어떻게 되나? (직렬화 → 테스트 실패)

**질문**
- 한 레이어 실패가 다른 레이어를 취소시키지 않게 만드는 코드는 정확히 어느 줄?
- 클라이언트가 연결을 끊으면 `Check`는 무엇을 반환하나? 왜?

## 4단계 — 동시성 도구: `internal/parallel`, `internal/ratelimit`, `internal/cache`

- `parallel.Group`: errgroup 재구현. `WaitGroup` + `context.WithCancelCause` + 버퍼 채널 세마포어.
- `ratelimit.Limiter`: 토큰 버킷. 데드라인 전에 토큰이 안 생기면 즉시 실패.
- `cache.TTL`: 제네릭 + mutex. 테스트에서 시계를 주입하는 법(`now func() time.Time`).

**질문**
- `go test -race`는 무엇을 잡아내나? 일부러 `cache`의 `mu.Lock()`을 지워서 race를 재현해 보기.
- 버퍼 채널이 왜 세마포어가 되나?

## 5단계 — 외부 API 어댑터: `internal/reinfolib`

- `client.go`: 키는 헤더로(URL에 넣으면 에러 메시지·로그로 샌다), 레이트리밋, 응답 크기 제한, 상태코드 처리.
- `endpoints.go`: 레이어 ↔ MLIT API ID 매핑. `(unverified)` 표시된 필드는 키 발급 후 공식 매뉴얼로 검증.
- `layersource.go`: 좌표 → 타일 → 캐시 → point-in-polygon / 최근접 점.

**질문**
- 캐시 키에 사용자 좌표가 아니라 타일 좌표를 쓰면 좋은 점 두 가지는? (개인정보, 적중률)
- 캐시된 슬라이스를 `pick()`으로 복사하는 이유는?

## 6단계 — 순수 로직: `internal/geo`, `internal/cost`

- **table-driven test** 패턴을 여기서 확실히 익힙니다 (일본 Go 커뮤니티에서 표준처럼 씀).
- `cost`: 돈은 `int64` 엔, 개월 수는 100분의 1 단위 정수로 바꿔 계산.
- `geo`: GeoJSON은 `[경도, 위도]` 순서라는 고전적 버그 포인트.

**질문**
- 금액 계산에 `float64`를 그대로 쓰면 어떤 문제가? (`0.1+0.2`)
- 중개수수료 경고 두 종류의 법적 근거는? (주석의 告示 번호를 직접 찾아 읽어 보기)

## 7단계 — 방 크기 API: `internal/room`, `internal/i18n`

`curl 'localhost:8080/v1/room/size?jo=6&lang=ko'` 와 `curl 'localhost:8080/v1/room/layout?code=2LDK%2BS&lang=ko'` 를 먼저 실행해 보고 읽습니다.

- `size.go`: 畳·㎡·평·sq ft 환산, 지역별 다다미, 3D 미리보기용 직사각형(가로:세로 = 3:4).
- `layout.go`: `regexp`로 間取り 코드 파싱. 전각 문자·`+S`·`ワンルーム` 같은 **입력 정규화**가 파싱보다 먼저.
- `furniture.go`: 공유 프리셋을 **복사해서** 반환하는 이유 (`TestReferenceFurnitureIsACopy`).
- `i18n`: 여러 패키지가 같은 언어 타입을 쓰게 되면서 `housing`에서 분리한 패키지. "공통 코드는 두 번째로 필요해질 때 분리한다"의 실제 예.
- ADR-0006: 왜 매물 사진 3D 변환이 아니라 숫자 기반 미리보기인가.

**질문**
- 6畳가 왜 2.7m × 3.6m가 되나? 직접 계산해 보기.
- `room`은 `housing`을 import하지 않는다. 그렇게 둔 이유는?
- 이 응답은 `Cache-Control: public`인데 하우징 응답은 `no-store`인 이유는?

---

## 다음 과제 (난이도 순)

각 과제는 **브랜치 1개 → PR 1개**로 진행하고, PR 설명에 "무엇을/왜/어떻게 검증했는지"를 씁니다.
면접에서 그대로 이야기할 수 있는 단위입니다.

### Level 1 — 기능 완성
- [ ] API 키 발급 → `make run-live`로 실호출 → `endpoints.go`의 `(unverified)` 필드 검증·수정
- [ ] API 이용규약의 크레딧 문구를 `internal/source`와 `DATA_SOURCES.md`에 반영
- [ ] 레이어별 해석기: 예) `A31a_205` 랭크 → "0.5m 미만" 같은 사람이 읽는 문장 (3개 언어)
- [x] 거래가격 요약: 주변 ㎡단가 중앙값·사분위수 (정렬, 백분위 계산, 테이블 테스트)
  - 읽는 순서: `housing/price_test.go` → `housing/price.go` → `reinfolib/normalize.go`
  - 질문: `percentile`은 4건(40, 50, 60, 70)의 중앙값으로 왜 55가 아니라 50을 돌려주나? (최근접 순위 방식)
  - 질문: `"3,200万円"`을 숫자로 바꾸는 코드가 `housing`이 아니라 `reinfolib`에 있는 이유는?
- [x] `docs/openapi.json` 작성 → 프론트엔드 타입 생성에 사용
  - 읽는 순서: `docs/openapi.json`의 `paths` → `internal/server/openapi_test.go`
  - 실험: 스펙에서 `price_summary` 줄을 지우고 `go test ./internal/server -run OpenAPI`를 돌려 실패 메시지 읽기
  - 질문: `mismatches`가 자기 자신을 다시 호출하는(재귀) 이유는? 어떤 경우에 호출을 멈추나?
  - 질문: 스펙이 YAML이 아니라 JSON인 이유는? (ADR-0001)
- [ ] 방 크기: 사용자가 평면도의 가로·세로(m)를 직접 넣으면 그 모양으로 미리보기 (`/v1/room/size`에 `width_m`, `depth_m` 추가)
- [ ] 가구 배치 판정: "세미더블 침대 + 책상이 6畳에 통로 60cm를 남기고 들어가나?" (직사각형 배치 알고리즘, 테이블 테스트)
- [x] 프론트엔드 뼈대: `web/`에 Next.js 정적 export + Tailwind (M2-1)
  - 읽는 순서: `web/next.config.ts` → `web/wrangler.jsonc` → `.github/workflows/ci.yml`의 `web` job
  - 실험: `next.config.ts`에 `cacheComponents: true`를 넣고 `npm run build`의 에러 메시지 읽기 (생성기 기본값인데 지운 이유)
  - 질문: `output: "export"`이면 `images.unoptimized`가 왜 필요한가? (이미지 최적화는 어디서 실행되나)
  - 질문: `.dockerignore`에 `web`이 없으면 Go 이미지 빌드에 무슨 일이 생기나? (`COPY . .`)
  - 질문: Makefile이 `./...` 대신 `./cmd/... ./internal/...`을 쓰는 이유는? (`web/node_modules` 안의 `.go` 파일)
- [ ] 프론트엔드: Three.js(react-three-fiber)로 `/v1/room/size` 응답을 그려 가구를 드래그 배치

### Level 2 — 백엔드 엔지니어링 (일본 메가벤처 면접 단골)
- [x] **singleflight**: 같은 타일 동시 요청을 1회로 합치기 (직접 구현 → `x/sync/singleflight`와 비교)
  - 읽는 순서: `reinfolib/flight_test.go` → `reinfolib/flight.go` → `layersource.go`의 `tile`
  - 질문: `do`에서 `mu.Unlock()`을 `select`보다 먼저 하는 이유는? (잠근 채로 기다리면 어떻게 되나)
  - 질문: 처음 요청한 사람이 연결을 끊어도 받아오기가 계속되는 이유는? (`context.WithoutCancel`)
  - 질문: `run`의 `recover`가 없으면 패닉이 났을 때 무슨 일이 생기나? (HTTP 미들웨어 밖의 고루틴)
  - 복습: 빈 파일에 `flight.go`를 보지 않고 다시 써 보고 `go test ./internal/reinfolib -run Flights`로 확인
- [ ] **LRU 캐시** 교체 + `go test -bench`로 전/후 비교
- [ ] **pprof** (별도 포트) + 부하 테스트(k6 등)로 병목 찾기
- [ ] **OpenTelemetry**: 레이어별 span, Cloud Trace 연동
- [x] 거래 포인트 주변 2×2 타일 조회 (타일 경계 문제 해결)
  - 읽는 순서: `geo/tile.go`의 `TilesAround` → `reinfolib/layersource.go`의 `tilesTogether`
  - 질문: `math.Round(x)`가 왜 "가장 가까운 타일 경계"를 알려 주나? x = 14552.96이면 어느 두 열을 고르나?
  - 질문: 3×3이 아니라 2×2를 고른 이유는? (호출 수 9 대 4, 레이트리밋 버스트 10)
  - 질문: 이웃 타일 하나가 실패하면 왜 받은 것만으로 결과를 만들지 않나?
- [ ] `golang.org/x/sync/errgroup`로 교체하고 ADR-0001 갱신

### Level 3 — 확장
- [ ] PostgreSQL + PostGIS에 국토수치정보 적재 → 외부 API 의존 줄이기 (`sqlc` + `pgx`)
- [ ] 제도 내비게이터 모듈 (rules YAML + 규칙 엔진 + 출처 페이지 변경 감시)
- [ ] 인프라: `infra/README.md` 체크리스트

## 커밋 메시지 예

```
feat(reinfolib): verify XKT026 property keys against API manual
fix(cost): truncate tax on brokerage fee
test(housing): cover client-cancelled requests
docs(adr): 0006 choose Cloud Run over VM
```
