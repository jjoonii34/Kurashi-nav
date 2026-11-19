package housing

import "testing"

// Every message must exist in every language, so a new layer can't ship
// with a missing translation.
func TestMessageCatalogIsComplete(t *testing.T) {
	keys := []string{"unavailable", "disclaimer"}
	for _, l := range DefaultLayers("") {
		keys = append(keys, string(l.ID))
	}
	for _, lang := range []Lang{LangEN, LangKO, LangJAEasy} {
		for _, k := range keys {
			if _, ok := messages[lang][k]; !ok {
				t.Errorf("missing %s translation for %q", lang, k)
			}
		}
	}
}

func TestParseLang(t *testing.T) {
	tests := map[string]Lang{
		"":        LangEN,
		"en":      LangEN,
		"fr":      LangEN,
		"KO":      LangKO,
		"ko-KR":   LangKO,
		"ja":      LangJAEasy,
		"ja-easy": LangJAEasy,
	}
	for in, want := range tests {
		if got := ParseLang(in); got != want {
			t.Errorf("ParseLang(%q) = %s, want %s", in, got, want)
		}
	}
}
