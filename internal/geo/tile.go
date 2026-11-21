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
	x, y := tilePosition(p, z)
	maxIndex := 1<<z - 1
	return Tile{
		Z: z,
		X: clamp(int(math.Floor(x)), 0, maxIndex),
		Y: clamp(int(math.Floor(y)), 0, maxIndex),
	}
}

// TilesAround returns the 2×2 block of tiles whose shared corner is the tile
// corner nearest to p. The block contains p's own tile and covers everything
// within half a tile of p, so a search near a tile edge also sees what lies
// just across it. Tiles beyond the edge of the map are left out.
func TilesAround(p Point, z int) []Tile {
	x, y := tilePosition(p, z)
	// Tile borders sit at whole numbers, so rounding finds the nearest
	// border; the block is the column and row on each side of it.
	right, bottom := int(math.Round(x)), int(math.Round(y))

	maxIndex := 1<<z - 1
	var tiles []Tile
	for _, row := range []int{bottom - 1, bottom} {
		for _, column := range []int{right - 1, right} {
			if row < 0 || row > maxIndex || column < 0 || column > maxIndex {
				continue
			}
			tiles = append(tiles, Tile{Z: z, X: column, Y: row})
		}
	}
	return tiles
}

// tilePosition is p in tile units at zoom z: the whole part is the tile
// index, the fraction is how far across that tile p lies.
func tilePosition(p Point, z int) (x, y float64) {
	n := math.Exp2(float64(z))
	latRad := p.Lat * math.Pi / 180

	x = (p.Lon + 180) / 360 * n
	y = (1 - math.Log(math.Tan(latRad)+1/math.Cos(latRad))/math.Pi) / 2 * n
	return x, y
}

func clamp(v, lo, hi int) int {
	return max(lo, min(v, hi))
}
