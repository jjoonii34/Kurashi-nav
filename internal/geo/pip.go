package geo

// Contains reports whether p is inside the polygon: inside the outer ring and
// outside every hole. Points exactly on an edge may go either way, which is
// acceptable for hazard lookup (the frontend still shows the official map).
func (pg Polygon) Contains(p Point) bool {
	if len(pg) == 0 || !pg[0].contains(p.Lon, p.Lat) {
		return false
	}
	for _, hole := range pg[1:] {
		if hole.contains(p.Lon, p.Lat) {
			return false
		}
	}
	return true
}

// contains is the classic ray-casting test: cast a ray to the right of the
// point and count how many edges it crosses. Odd = inside.
func (r Ring) contains(x, y float64) bool {
	inside := false
	for i, j := 0, len(r)-1; i < len(r); j, i = i, i+1 {
		xi, yi := r[i][0], r[i][1]
		xj, yj := r[j][0], r[j][1]
		if (yi > y) != (yj > y) && x < (xj-xi)*(y-yi)/(yj-yi)+xi {
			inside = !inside
		}
	}
	return inside
}
