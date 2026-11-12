import CoreGraphics

/// Measured visible ground contacts, normalized to the full PNG height.
/// Ignore faint fringe pixels: the last row with >=128 alpha across >=5%
/// of image width defines the visible base. Regenerate if source art changes.
enum WorldOneArtMetrics {
    static func groundAnchorY(for name: String) -> CGFloat {
        anchors[name] ?? 0
    }

    private static let anchors: [String: CGFloat] = [
        "world1_boss_arena_boulder": 60.0 / 491.0,
        "world1_boss_arena_crate": 26.0 / 447.0,
        "world1_boss_arena_debris": 123.0 / 485.0,
        "world1_boss_arena_lantern": 48.0 / 504.0,
        "world1_boss_arena_vegetation": 54.0 / 457.0,
        "world1_boss_arena_wall": 104.0 / 506.0,
        "world1_ruined_outpost_boulder": 23.0 / 429.0,
        "world1_ruined_outpost_crate": 26.0 / 500.0,
        "world1_ruined_outpost_debris": 21.0 / 392.0,
        "world1_ruined_outpost_lantern": 24.0 / 500.0,
        "world1_ruined_outpost_vegetation": 26.0 / 396.0,
        "world1_ruined_outpost_wall": 23.0 / 360.0,
        "world1_swamp_basin_boulder": 69.0 / 506.0,
        "world1_swamp_basin_crate": 29.0 / 493.0,
        "world1_swamp_basin_debris": 93.0 / 486.0,
        "world1_swamp_basin_lantern": 31.0 / 489.0,
        "world1_swamp_basin_vegetation": 52.0 / 486.0,
        "world1_swamp_basin_wall": 72.0 / 491.0,
        "world1_toxic_caves_boulder": 62.0 / 499.0,
        "world1_toxic_caves_crate": 30.0 / 461.0,
        "world1_toxic_caves_debris": 27.0 / 369.0,
        "world1_toxic_caves_lantern": 25.0 / 499.0,
        "world1_toxic_caves_vegetation": 55.0 / 485.0,
        "world1_toxic_caves_wall": 121.0 / 488.0,
    ]
}
