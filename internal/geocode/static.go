// Package geocode contains housing.Geocoder implementations.
//
// The MVP does not depend on any address-search service: the frontend lets
// the user drop a pin on the map and sends lat/lon (docs/adr/0005). Static
// exists for development and tests. A production geocoder built on the
// Digital Agency's Address Base Registry (アドレス・ベース・レジストリ) data is
// a later milestone.
package geocode

import (
	"context"
	"strings"

	"github.com/jjoonii34/kurashi-nav/internal/geo"
	"github.com/jjoonii34/kurashi-nav/internal/housing"
)

// Static resolves a fixed set of addresses.
type Static struct {
	entries map[string]geo.Point
}

// NewStatic indexes entries by their normalised address.
func NewStatic(entries map[string]geo.Point) *Static {
	s := &Static{entries: make(map[string]geo.Point, len(entries))}
	for addr, p := range entries {
		s.entries[Normalize(addr)] = p
	}
	return s
}

// Geocode implements housing.Geocoder.
func (s *Static) Geocode(_ context.Context, address string) (geo.Point, error) {
	p, ok := s.entries[Normalize(address)]
	if !ok {
		return geo.Point{}, housing.ErrAddressNotFound
	}
	return p, nil
}

// DemoEntries are public landmarks used in DATA_MODE=fake.
func DemoEntries() map[string]geo.Point {
	return map[string]geo.Point{
		"東京都千代田区丸の内1丁目": {Lat: 35.681236, Lon: 139.767125}, // 東京駅
	}
}

// Normalize makes trivially different spellings of an address compare equal:
// it drops spaces, converts full-width digits, and turns any dash-like
// character that follows a digit into "-" (so 1ー2 and 1－2 become 1-2, while
// the ー in katakana words such as センター is kept).
//
// It is intentionally minimal. Real Japanese address normalisation
// (一丁目 vs 1丁目, 丁目/番地/号 vs hyphens, 旧字体, 大字/字) is a hard problem —
// study open-source normalisers before writing your own.
func Normalize(addr string) string {
	var b strings.Builder
	var prev rune
	for _, r := range strings.TrimSpace(addr) {
		switch {
		case r == ' ' || r == '　':
			continue
		case r >= '０' && r <= '９':
			r = r - '０' + '0'
		case isDash(r) && prev >= '0' && prev <= '9':
			r = '-'
		}
		b.WriteRune(r)
		prev = r
	}
	return b.String()
}

func isDash(r rune) bool {
	switch r {
	case '-', '－', '‐', '‑', '–', '—', '―', '−', 'ー':
		return true
	}
	return false
}
