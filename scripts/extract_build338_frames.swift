import AppKit
import AVFoundation
import Foundation

// Extract actual simulator video frames, never reconstructed scene previews.
// Recorder startup and scene time have different origins. Sample the actual
// media timeline, then identify views by their visible QA badges in review.
let directory = URL(fileURLWithPath: "build338-review", isDirectory: true)
let asset = AVURLAsset(url: directory.appendingPathComponent("world1-tour.mp4"))
let duration = CMTimeGetSeconds(asset.duration)
precondition(duration.isFinite && duration > 1, "Missing or unreadable simulator video")
let generator = AVAssetImageGenerator(asset: asset)
generator.appliesPreferredTrackTransform = true
generator.requestedTimeToleranceBefore = .zero
generator.requestedTimeToleranceAfter = .zero
var report: [[String: Any]] = []
for (index,seconds) in stride(from: 0.25,to: duration,by: 1.0).enumerated() {
    let name=String(format: "frame-%03d.png",index)
    var actual = CMTime.zero
    let image = try generator.copyCGImage(at: CMTime(seconds: seconds,preferredTimescale: 600),actualTime: &actual)
    let png = NSBitmapImageRep(cgImage: image).representation(using: .png,properties: [:])!
    try png.write(to: directory.appendingPathComponent(name))
    report.append(["file":name,"video_seconds":CMTimeGetSeconds(actual),
                   "width":image.width,"height":image.height])
}
let manifest: [String: Any] = ["video_duration_seconds":duration,
    "frames":report,
    "visual_approval":false,"note":"Check visible stage badges and actual pixels; extraction is not visual approval."]
try JSONSerialization.data(withJSONObject: manifest,options: [.prettyPrinted,.sortedKeys])
    .write(to: directory.appendingPathComponent("frame-manifest.json"))
print("Extracted \(report.count) actual simulator frames for human stage/visual review")
