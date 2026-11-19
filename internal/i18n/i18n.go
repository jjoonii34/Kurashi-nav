// Package i18n holds the response languages and a tiny message catalogue.
//
// Most UI text lives in the frontend. The server translates only what it
// must return in API responses (section titles, explanations, disclaimers).
package i18n

import (
	"slices"
	"strings"
)

// Lang is a response language.
type Lang string

const (
	EN     Lang = "en"
	KO     Lang = "ko"
	JAEasy Lang = "ja-easy" // やさしい日本語: short sentences, common kanji (frontend adds furigana)
)

// All lists the supported languages.
var All = []Lang{EN, KO, JAEasy}

// Parse maps a user-supplied language tag to a supported Lang (default English).
func Parse(s string) Lang {
	switch strings.ToLower(strings.TrimSpace(s)) {
	case "ko", "ko-kr":
		return KO
	case "ja", "ja-jp", "ja-easy":
		return JAEasy
	default:
		return EN
	}
}

// Catalog maps language → message key → text.
type Catalog map[Lang]map[string]string

// T returns the message for key in lang, falling back to English, then to the key.
func (c Catalog) T(lang Lang, key string) string {
	if m, ok := c[lang][key]; ok {
		return m
	}
	if m, ok := c[EN][key]; ok {
		return m
	}
	return key
}

// Missing lists "lang:key" for every English key absent in another language.
// Each package's tests call it so no message ships untranslated.
func (c Catalog) Missing() []string {
	var out []string
	for key := range c[EN] {
		for _, lang := range All {
			if _, ok := c[lang][key]; !ok {
				out = append(out, string(lang)+":"+key)
			}
		}
	}
	slices.Sort(out)
	return out
}
