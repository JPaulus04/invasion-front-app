import AVFoundation
import Foundation

/// Original synthesized chiptune score. One player node owns the soundtrack,
/// preventing overlapping tracks when changing menus or restarting a world.
final class ArcadeMusic {
    static let shared = ArcadeMusic()
    enum Theme: Int { case headquarters, forest, boss }

    private let engine = AVAudioEngine()
    private let player = AVAudioPlayerNode()
    private var current: Theme?
    private var enabled = UserDefaults.standard.object(forKey: "musicEnabled") as? Bool ?? true
    private let sampleRate: Double = 22050
    private var buffers: [Theme: AVAudioPCMBuffer] = [:]

    private init() {
        engine.attach(player)
        let format = AVAudioFormat(standardFormatWithSampleRate: sampleRate, channels: 1)!
        engine.connect(player, to: engine.mainMixerNode, format: format)
        engine.mainMixerNode.outputVolume = 0.23
    }

    var isEnabled: Bool { enabled }

    func toggle() {
        enabled.toggle()
        UserDefaults.standard.set(enabled, forKey: "musicEnabled")
        if enabled {
            if let current { play(current, force: true) }
        } else {
            player.stop()
        }
    }

    func play(_ theme: Theme, force: Bool = false) {
        if current == theme && !force && player.isPlaying { return }
        current = theme
        guard enabled else { return }
        if !engine.isRunning {
            do { try engine.start() } catch { return }
        }
        player.stop()
        let buffer = buffers[theme] ?? compose(theme)
        buffers[theme] = buffer
        player.scheduleBuffer(buffer, at: nil, options: .loops)
        player.play()
    }

    private func compose(_ theme: Theme) -> AVAudioPCMBuffer {
        let tempo: Double = theme == .boss ? 164 : (theme == .forest ? 148 : 124)
        let stepDuration = 60.0 / tempo / 2.0
        // Original eight-bar phrases. -1 is a rest; notes are MIDI pitches.
        let melody: [Int] = {
            switch theme {
            case .headquarters:
                return [64, 67, 71, 76, 74, 71, 67, -1, 69, 72, 76, 79, 76, 72, 69, -1,
                        67, 71, 74, 79, 76, 74, 71, 67, 69, 72, 71, 67, 64, -1, 64, -1]
            case .forest:
                return [76, 79, 81, 79, 76, 72, 74, 76, 79, 76, 74, 72, 71, 74, 76, -1,
                        81, 83, 84, 81, 79, 76, 79, 81, 76, 74, 72, 74, 76, -1, 72, -1]
            case .boss:
                return [57, 69, 60, 72, 62, 74, 60, 72, 57, 69, 55, 67, 53, 65, 55, 67,
                        57, 69, 60, 72, 64, 76, 62, 74, 60, 72, 57, 69, 55, 67, 52, 64]
            }
        }()
        let bass: [Int] = theme == .boss ? [33, 33, 36, 36, 38, 38, 31, 31] :
            (theme == .forest ? [48, 48, 45, 45, 41, 41, 43, 43] : [40, 40, 45, 45, 43, 43, 40, 40])
        let frameCount = AVAudioFrameCount(Double(melody.count) * stepDuration * sampleRate)
        let format = AVAudioFormat(standardFormatWithSampleRate: sampleRate, channels: 1)!
        let buffer = AVAudioPCMBuffer(pcmFormat: format, frameCapacity: frameCount)!
        buffer.frameLength = frameCount
        guard let output = buffer.floatChannelData?[0] else { return buffer }
        let noteSamples = stepDuration * sampleRate
        for frame in 0..<Int(frameCount) {
            let time = Double(frame) / sampleRate
            let step = min(melody.count - 1, Int(Double(frame) / noteSamples))
            let local = Double(frame) / noteSamples - Double(step)
            let envelope = min(1, local * 18) * min(1, (1 - local) * 8)
            var value = 0.0
            if melody[step] >= 0 {
                let frequency = 440 * pow(2, Double(melody[step] - 69) / 12)
                let phase = (time * frequency).truncatingRemainder(dividingBy: 1)
                let lead = phase < 0.5 ? 1.0 : -1.0
                value += lead * envelope * 0.21
            }
            let bassNote = bass[(step / 4) % bass.count]
            let bassFrequency = 440 * pow(2, Double(bassNote - 69) / 12)
            let bassPhase = (time * bassFrequency).truncatingRemainder(dividingBy: 1)
            value += (bassPhase * 2 - 1) * 0.12
            // Short, deterministic noise-like hi-hat accents.
            let beatPosition = Double(frame).truncatingRemainder(dividingBy: noteSamples) / noteSamples
            if step % 2 == 0 && beatPosition < 0.13 {
                let tick = sin(time * 9123) * sin(time * 7117)
                value += tick * (0.13 - beatPosition) * 0.25
            }
            output[frame] = Float(max(-0.8, min(0.8, value)))
        }
        return buffer
    }
}
