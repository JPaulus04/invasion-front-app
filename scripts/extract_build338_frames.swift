import AppKit
import AVFoundation
import Foundation

// Extract actual simulator video frames, never reconstructed scene previews.
// The small recording-start offset is estimated from the completed tour's
// 34-second trace. The visible QA badge must be checked during human review.
let directory = URL(fileURLWithPath: "build338-review", isDirectory: true)
let asset = AVURLAsset(url: directory.appendingPathComponent("world1-tour.mp4"))
let duration = CMTimeGetSeconds(asset.duration)
precondition(duration > 25, "Tour video must include the full extended entrance hold")
let generator = AVAssetImageGenerator(asset: asset)
generator.appliesPreferredTrackTransform = true
generator.requestedTimeToleranceBefore = .zero
generator.requestedTimeToleranceAfter = .zero
let samples: [(String, Double)] = [
    ("outpost-entry",2.5), ("outpost-combat",6.5), ("swamp",9.5),
    ("toxic-caves",12.5), ("reactor",15.5), ("boss",18.5),
    ("far-wall-portal",21.5), ("portal-approach",24.5),
    ("long-camera",28.5), ("transition",32.5)
]
let offset = max(0,34-duration)
var report: [[String: Any]] = []
for (name, elapsed) in samples {
    let seconds = min(duration-0.1,max(0.2,elapsed-offset))
    var actual = CMTime.zero
    let image = try generator.copyCGImage(at: CMTime(seconds: seconds,preferredTimescale: 600),actualTime: &actual)
    let png = NSBitmapImageRep(cgImage: image).representation(using: .png,properties: [:])!
    try png.write(to: directory.appendingPathComponent(name+".png"))
    report.append(["stage":name,"video_seconds":CMTimeGetSeconds(actual),
                   "width":image.width,"height":image.height])
}
let manifest: [String: Any] = ["video_duration_seconds":duration,
    "estimated_recording_start_offset":offset,"frames":report,
    "visual_approval":false,"note":"Check visible stage badges and actual pixels; extraction is not visual approval."]
try JSONSerialization.data(withJSONObject: manifest,options: [.prettyPrinted,.sortedKeys])
    .write(to: directory.appendingPathComponent("frame-manifest.json"))
print("Extracted ten actual simulator frames for human review")
