package geo

import (
	"fmt"
	"math"
)

// Tile is an XYZ (slippy map / Web Mercator) tile address.
// The MLIT API and 地理院タイル both use this scheme.
type Tile struct {
	Z, X, Y int
}

func (t Tile) String() string { return fmt.Sprintf("%d/%d/%d", t.Z, t.X, t.Y) }

// TileAt returns the tile at zoom z that contains p.
func TileAt(p Point, z int) Tile {
	n := math.Exp2(float64(z))
	latRad := p.Lat * math.Pi / 180

	x := int(math.Floor((p.Lon + 180) / 360 * n))
	y := int(math.Floor((1 - math.Log(math.Tan(latRad)+1/math.Cos(latRad))/math.Pi) / 2 * n))

	maxIndex := int(n) - 1
	return Tile{Z: z, X: clamp(x, 0, maxIndex), Y: clamp(y, 0, maxIndex)}
}

func clamp(v, lo, hi int) int {
	return max(lo, min(v, hi))
}
