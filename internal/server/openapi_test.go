package server

import (
	"encoding/json"
	"math"
	"net/http"
	"os"
	"slices"
	"strconv"
	"strings"
	"testing"
)

const specPath = "../../docs/openapi.json"

// apiSpec is docs/openapi.json decoded into plain maps.
type apiSpec map[string]any

func loadSpec(t *testing.T) apiSpec {
	t.Helper()
	raw, err := os.ReadFile(specPath)
	if err != nil {
		t.Fatal(err)
	}
	var s apiSpec
	if err := json.Unmarshal(raw, &s); err != nil {
		t.Fatalf("%s is not valid JSON: %v", specPath, err)
	}
	return s
}

// deref follows {"$ref": "#/components/schemas/Report"} to the object it names.
func (s apiSpec) deref(node map[string]any) map[string]any {
	ref, ok := node["$ref"].(string)
	if !ok {
		return node
	}
	target := map[string]any(s)
	for _, key := range strings.Split(strings.TrimPrefix(ref, "#/"), "/") {
		target, _ = target[key].(map[string]any)
	}
	return s.deref(target)
}

// child returns node[key] as an object, following a $ref. It is nil if absent.
func (s apiSpec) child(node map[string]any, key string) map[string]any {
	next, ok := node[key].(map[string]any)
	if !ok {
		return nil
	}
	return s.deref(next)
}

func (s apiSpec) operation(method, path string) map[string]any {
	return s.child(s.child(s.child(s, "paths"), path), strings.ToLower(method))
}

func (s apiSpec) jsonSchema(node map[string]any) map[string]any {
	return s.child(s.child(s.child(node, "content"), "application/json"), "schema")
}

// mismatches lists every way value differs from schema. It understands the
// keywords the spec uses: type, properties, required, additionalProperties,
// items and enum.
func (s apiSpec) mismatches(schema map[string]any, value any, at string) []string {
	schema = s.deref(schema)

	switch schema["type"] {
	case "object":
		obj, ok := value.(map[string]any)
		if !ok {
			return []string{at + ": want an object"}
		}
		var out []string
		required, _ := schema["required"].([]any)
		for _, name := range required {
			if _, present := obj[name.(string)]; !present {
				out = append(out, at+"."+name.(string)+": required by the spec but missing")
			}
		}
		properties, _ := schema["properties"].(map[string]any)
		for name, v := range obj {
			property, declared := properties[name].(map[string]any)
			if !declared {
				if schema["additionalProperties"] != true {
					out = append(out, at+"."+name+": not in the spec")
				}
				continue
			}
			out = append(out, s.mismatches(property, v, at+"."+name)...)
		}
		return out

	case "array":
		list, ok := value.([]any)
		if !ok {
			return []string{at + ": want an array"}
		}
		items, _ := schema["items"].(map[string]any)
		var out []string
		for i, v := range list {
			out = append(out, s.mismatches(items, v, at+"["+strconv.Itoa(i)+"]")...)
		}
		return out

	case "string":
		text, ok := value.(string)
		if !ok {
			return []string{at + ": want a string"}
		}
		if allowed, hasEnum := schema["enum"].([]any); hasEnum && !slices.Contains(allowed, any(text)) {
			return []string{at + ": " + strconv.Quote(text) + " is not in the enum"}
		}

	case "boolean":
		if _, ok := value.(bool); !ok {
			return []string{at + ": want a boolean"}
		}

	case "number":
		if _, ok := value.(float64); !ok {
			return []string{at + ": want a number"}
		}

	case "integer":
		number, ok := value.(float64)
		if !ok || number != math.Trunc(number) {
			return []string{at + ": want an integer"}
		}
	}
	return nil
}

func TestResponsesMatchOpenAPISpec(t *testing.T) {
	spec := loadSpec(t)
	h, _ := newTestServer(t)

	tests := []struct {
		name   string
		method string
		path   string
		query  string
		body   string
		status int
	}{
		{"health", "GET", "/healthz", "", "", 200},
		{"sources", "GET", "/v1/meta/sources", "", "", 200},
		{"housing, location only", "POST", "/v1/housing/check", "", `{"lat":35.681236,"lon":139.767125,"lang":"ko"}`, 200},
		{
			"housing with cost", "POST", "/v1/housing/check", "",
			`{"lat":35.681236,"lon":139.767125,"cost":{"rent_yen":80000,"management_fee_yen":5000,` +
				`"deposit_months":1,"key_money_months":1,"brokerage_months":2,"guarantee_rate":0.5,` +
				`"fire_insurance_yen":20000,"other_fees":[{"name":"消毒料","amount_yen":16500}],` +
				`"move_in_date":"2026-04-15","prepay_next_month":true}}`,
			200,
		},
		{"housing, invalid input", "POST", "/v1/housing/check", "", `{}`, 400},
		{"housing, address without geocoder", "POST", "/v1/housing/check", "", `{"address":"東京都"}`, 422},
		{"room size", "GET", "/v1/room/size", "?jo=6&lang=ko", "", 200},
		{"room size, invalid input", "GET", "/v1/room/size", "", "", 400},
		{"room layout with guideline", "GET", "/v1/room/layout", "?code=1LDK", "", 200},
		{"room layout without guideline", "GET", "/v1/room/layout", "?code=1K", "", 200},
		{"room layout, invalid input", "GET", "/v1/room/layout", "?code=5R", "", 400},
	}

	covered := map[string]bool{}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			op := spec.operation(tt.method, tt.path)
			if op == nil {
				t.Fatalf("%s %s is not in %s", tt.method, tt.path, specPath)
			}
			covered[tt.method+" "+tt.path] = true

			if tt.body != "" && tt.status == http.StatusOK {
				var sent any
				if err := json.Unmarshal([]byte(tt.body), &sent); err != nil {
					t.Fatal(err)
				}
				requestSchema := spec.jsonSchema(spec.child(op, "requestBody"))
				for _, m := range spec.mismatches(requestSchema, sent, "request") {
					t.Error(m)
				}
			}

			rec := do(t, h, tt.method, tt.path+tt.query, tt.body)
			if rec.Code != tt.status {
				t.Fatalf("status = %d, want %d (body %s)", rec.Code, tt.status, rec.Body)
			}
			response := spec.child(spec.child(op, "responses"), strconv.Itoa(tt.status))
			if response == nil {
				t.Fatalf("the spec has no %d response for %s %s", tt.status, tt.method, tt.path)
			}
			var got any
			if err := json.Unmarshal(rec.Body.Bytes(), &got); err != nil {
				t.Fatal(err)
			}
			for _, m := range spec.mismatches(spec.jsonSchema(response), got, "response") {
				t.Error(m)
			}
		})
	}

	for path, item := range spec.child(spec, "paths") {
		for method := range item.(map[string]any) {
			if key := strings.ToUpper(method) + " " + path; !covered[key] {
				t.Errorf("%s is in the spec but no case above calls it", key)
			}
		}
	}
}

// The checker itself must reject a wrong response, or the test above proves nothing.
func TestSpecMismatches(t *testing.T) {
	spec := apiSpec{"components": map[string]any{"schemas": map[string]any{
		"Item": map[string]any{
			"type":     "object",
			"required": []any{"id"},
			"properties": map[string]any{
				"id":    map[string]any{"type": "integer"},
				"kind":  map[string]any{"type": "string", "enum": []any{"a", "b"}},
				"tags":  map[string]any{"type": "array", "items": map[string]any{"type": "string"}},
				"extra": map[string]any{"type": "object", "additionalProperties": true},
			},
		},
	}}}
	schema := map[string]any{"$ref": "#/components/schemas/Item"}

	tests := []struct {
		name  string
		value string
		want  []string
	}{
		{"valid", `{"id":1,"kind":"a","tags":["x"],"extra":{"anything":true}}`, nil},
		{"missing required field", `{"kind":"a"}`, []string{"v.id: required by the spec but missing"}},
		{"field not in the spec", `{"id":1,"name":"x"}`, []string{"v.name: not in the spec"}},
		{"wrong type", `{"id":"1"}`, []string{"v.id: want an integer"}},
		{"fraction is not an integer", `{"id":1.5}`, []string{"v.id: want an integer"}},
		{"value outside the enum", `{"id":1,"kind":"c"}`, []string{`v.kind: "c" is not in the enum`}},
		{"wrong type inside an array", `{"id":1,"tags":["x",2]}`, []string{"v.tags[1]: want a string"}},
		{"null instead of an array", `{"id":1,"tags":null}`, []string{"v.tags: want an array"}},
		{"not an object", `[]`, []string{"v: want an object"}},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			var value any
			if err := json.Unmarshal([]byte(tt.value), &value); err != nil {
				t.Fatal(err)
			}
			if got := spec.mismatches(schema, value, "v"); !slices.Equal(got, tt.want) {
				t.Errorf("mismatches = %q, want %q", got, tt.want)
			}
		})
	}
}
