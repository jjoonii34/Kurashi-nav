package housing

import (
	"testing"

	"github.com/jjoonii34/kuramiru/internal/i18n"
)

// Every message must exist in every language, so a new layer can't ship
// with a missing translation.
func TestMessageCatalogIsComplete(t *testing.T) {
	if missing := messages.Missing(); len(missing) > 0 {
		t.Errorf("untranslated messages: %v", missing)
	}
	for _, l := range DefaultLayers("") {
		if _, ok := messages[i18n.EN][string(l.ID)]; !ok {
			t.Errorf("layer %s has no title", l.ID)
		}
	}
}
