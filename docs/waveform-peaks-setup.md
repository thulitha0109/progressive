# Waveform Peaks Setup

## Installation

To enable waveform peak generation, you need to install `audiowaveform`:

### Ubuntu/Debian
```bash
sudo apt-get update
sudo apt-get install -y audiowaveform
```

### macOS
```bash
brew install audiowaveform
```

### Verification
```bash
which audiowaveform
audiowaveform --version
```

## Usage

Waveform peaks are automatically generated when:
1. Creating a new track with an audio file
2. Updating a track's audio file

The peaks are:
- Generated asynchronously (won't block uploads)
- Stored in the database (`Track.waveformPeaks` field)
- Used by the Waveform component for instant rendering
- Normalized to 0-1 range with 1000 data points

## Testing

1. Install audiowaveform (see above)
2. Upload a new track via the admin panel
3. Check console logs for "Waveform peaks generated for track: {id}"
4. Play the track and verify waveform renders instantly without errors
5. Check browser console - should NOT see "DOMException: The user aborted a request"

## Fallback Behavior

If audiowaveform is not installed or peak generation fails:
- The upload will still succeed
- The waveform component will show a simple progress bar instead
- No errors will be thrown
