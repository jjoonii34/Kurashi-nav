package i18n

import (
	"slices"
	"testing"
)

func TestParse(t *testing.T) {
	tests := map[string]Lang{
		"":          EN,
		"en":        EN,
		"fr":        EN,
		"KO":        KO,
		"ko-KR":     KO,
		"ja":        JAEasy,
		" ja-easy ": JAEasy,
	}
	for in, want := range tests {
		if got := Parse(in); got != want {
			t.Errorf("Parse(%q) = %s, want %s", in, got, want)
		}
	}
}

func TestCatalog(t *testing.T) {
	c := Catalog{
		EN:     {"hello": "Hello", "bye": "Bye"},
		KO:     {"hello": "안녕하세요"},
		JAEasy: {"hello": "こんにちは", "bye": "さようなら"},
	}
	if got := c.T(KO, "hello"); got != "안녕하세요" {
		t.Errorf("T(ko, hello) = %q", got)
	}
	if got := c.T(KO, "bye"); got != "Bye" {
		t.Errorf("missing translation should fall back to English, got %q", got)
	}
	if got := c.T(EN, "unknown"); got != "unknown" {
		t.Errorf("unknown key should fall back to the key, got %q", got)
	}
	if got := c.Missing(); !slices.Equal(got, []string{"ko:bye"}) {
		t.Errorf("Missing() = %v, want [ko:bye]", got)
	}
}
