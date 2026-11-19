package room

import (
	"fmt"
	"regexp"
	"strings"
	"unicode"

	"github.com/jjoonii34/kurashi-nav/internal/i18n"
)

// Part explains one element of a layout code.
type Part struct {
	Code        string `json:"code"`
	Explanation string `json:"explanation"`
}

// Guideline is the minimum size a space must have to be advertised as DK or
// LDK, set by the real-estate fair trade councils (不動産公正取引協議会).
type Guideline struct {
	Code   string  `json:"code"`
	MinJo  float64 `json:"min_jo"`
	MinSqm float64 `json:"min_sqm"`
	Note   string  `json:"note"`
}

// Layout is the response of GET /v1/room/layout.
type Layout struct {
	Code        string     `json:"code"`  // normalised, e.g. "2SLDK"
	Rooms       int        `json:"rooms"` // 居室 (habitable rooms), not counting a service room
	Kitchen     string     `json:"kitchen"`
	ServiceRoom bool       `json:"service_room"`
	Summary     string     `json:"summary"`
	Parts       []Part     `json:"parts"`
	Guideline   *Guideline `json:"min_size_guideline,omitempty"`
}

// rooms (1-9), optional S (service room), then R / K / DK / LDK.
var layoutPattern = regexp.MustCompile(`^([1-9])(S?)(R|K|DK|LDK)$`)

// ParseLayout explains a layout code such as "1K", "2LDK", "3SLDK",
// "2LDK+S", "ワンルーム" or full-width "１ＬＤＫ".
func ParseLayout(code string, lang i18n.Lang) (Layout, error) {
	norm := normalizeLayout(code)
	m := layoutPattern.FindStringSubmatch(norm)
	if m == nil {
		return Layout{}, fmt.Errorf("%w: unknown layout code; expected forms like 1R, 1K, 1DK, 2LDK, 3SLDK", ErrInvalid)
	}
	rooms := int(m[1][0] - '0')
	service := m[2] == "S"
	kitchen := m[3]
	if kitchen == "R" && (rooms != 1 || service) {
		return Layout{}, fmt.Errorf("%w: R (one room) is only valid as 1R", ErrInvalid)
	}

	l := Layout{
		Code:        norm,
		Rooms:       rooms,
		Kitchen:     kitchen,
		ServiceRoom: service,
		Parts:       []Part{{Code: kitchen, Explanation: messages.T(lang, "part_"+kitchen)}},
		Guideline:   guideline(rooms, kitchen, lang),
	}
	if service {
		l.Parts = append(l.Parts, Part{Code: "S", Explanation: messages.T(lang, "part_S")})
	}
	if kitchen == "R" {
		l.Summary = messages.T(lang, "summary_one_room")
	} else {
		l.Summary = fmt.Sprintf(messages.T(lang, "summary_rooms"), rooms)
	}
	return l, nil
}

func guideline(rooms int, kitchen string, lang i18n.Lang) *Guideline {
	var minJo float64
	switch {
	case kitchen == "DK" && rooms == 1:
		minJo = 4.5
	case kitchen == "DK":
		minJo = 6
	case kitchen == "LDK" && rooms == 1:
		minJo = 8
	case kitchen == "LDK":
		minJo = 10
	default:
		return nil
	}
	return &Guideline{
		Code:   kitchen,
		MinJo:  minJo,
		MinSqm: round2(minJo * SqmPerJo),
		Note:   messages.T(lang, "guideline_note"),
	}
}

// normalizeLayout converts full-width letters and digits, drops spaces,
// upper-cases, and rewrites common variants:
// "ワンルーム" → "1R", "2LDK+S" / "2LDK+納戸" / "2LDK+N" → "2SLDK".
func normalizeLayout(s string) string {
	var b strings.Builder
	for _, r := range s {
		if r >= '！' && r <= '～' { // full-width ASCII block
			r -= 0xFEE0
		}
		if unicode.IsSpace(r) {
			continue
		}
		b.WriteRune(unicode.ToUpper(r))
	}
	out := b.String()

	if out == "ワンルーム" {
		return "1R"
	}
	for _, suffix := range []string{"+S", "+納戸", "+N"} {
		if base, ok := strings.CutSuffix(out, suffix); ok {
			digits := strings.IndexFunc(base, func(r rune) bool { return r < '0' || r > '9' })
			if digits > 0 && !strings.Contains(base, "S") {
				return base[:digits] + "S" + base[digits:]
			}
		}
	}
	return out
}
