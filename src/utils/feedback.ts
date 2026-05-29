// Beep sound using Web Audio API
let audioContext: AudioContext | null = null

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext()
  }
  return audioContext
}

/**
 * Play a short beep sound to confirm scan.
 */
export function playBeep(): void {
  try {
    const ctx = getAudioContext()
    const oscillator = ctx.createOscillator()
    const gain = ctx.createGain()

    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(1200, ctx.currentTime)
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15)

    oscillator.connect(gain)
    gain.connect(ctx.destination)

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.15)
  } catch {
    // Silently fail if audio is not supported
  }
}

/**
 * Vibrate the device if supported.
 */
export function vibrate(): void {
  try {
    if (navigator.vibrate) {
      navigator.vibrate(100)
    }
  } catch {
    // Silently fail
  }
}

/**
 * Play beep + vibrate on scan success.
 */
export function scanFeedback(): void {
  playBeep()
  vibrate()
}
