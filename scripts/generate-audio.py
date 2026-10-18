"""Generate the exact Spanish corpus with resumable PCM and MP3 caches."""
import argparse
import array
import hashlib
import json
import subprocess
import wave
from concurrent.futures import ProcessPoolExecutor
from pathlib import Path
import sherpa_onnx

MODEL_SHA = '6826f9ac3fb4aac5c89c597f76ff32e84e7a0dea9469a6f18d1d387b696163eb'
SETTINGS = {'model': MODEL_SHA, 'runtime': sherpa_onnx.__version__, 'speed': .9,
            'threadsPerWorker': 1, 'sampleRate': 16000, 'bitrate': '24k',
            'edgeSilence': .08, 'slashPause': .18, 'shortThreshold': .25, 'shortTarget': .3}


def initialize(model_dir):
    global tts
    config = sherpa_onnx.OfflineTtsConfig(model=sherpa_onnx.OfflineTtsModelConfig(
        vits=sherpa_onnx.OfflineTtsVitsModelConfig(
            model=str(model_dir / 'es_ES-davefx-medium.onnx'),
            tokens=str(model_dir / 'tokens.txt'), data_dir=str(model_dir / 'espeak-ng-data')),
        num_threads=1, provider='cpu'), max_num_sentences=1)
    tts = sherpa_onnx.OfflineTts(config)


def generate(job):
    text, dest = job
    key = hashlib.sha256(text.encode()).hexdigest()[:16]
    out, pcm_file = dest / (key + '.mp3'), dest / (key + '.wav')
    if out.exists():
        return out.stat().st_size
    if not pcm_file.exists():
        pcm = array.array('h')
        # Generate slash-separated forms individually: a sentence boundary can
        # otherwise cause the model to omit an unterminated second form.
        for part in text.split(' / '):
            samples = tts.generate(part, sid=0, speed=SETTINGS['speed'])
            if not len(samples.samples):
                raise ValueError('Empty speech: ' + part)
            duration = len(samples.samples) / samples.sample_rate
            if duration < SETTINGS['shortThreshold']:
                # Isolated a / y can otherwise last under 100 ms. Resynthesize
                # the speech more slowly; adding silence would not help learners.
                speed = max(.2, SETTINGS['speed'] * duration / SETTINGS['shortTarget'])
                ending = '' if part.endswith(('.', '!', '?')) else '.'
                samples = tts.generate(part + ending, sid=0, speed=speed)
                if len(samples.samples) / samples.sample_rate < .12:
                    # Give isolated function words their own spoken emphasis.
                    samples = tts.generate('¡' + part + '!', sid=0, speed=.5)
                if len(samples.samples) / samples.sample_rate < .12:
                    raise ValueError('Speech still too short: ' + part)
            if pcm:
                pcm.extend([0] * round(samples.sample_rate * SETTINGS['slashPause']))
            pcm.extend(max(-32768, min(32767, round(s * 32767))) for s in samples.samples)
        temporary = dest / (key + '.working.wav')
        with wave.open(str(temporary), 'wb') as f:
            f.setnchannels(1)
            f.setsampwidth(2)
            f.setframerate(samples.sample_rate)
            f.writeframes(pcm.tobytes())
        temporary.replace(pcm_file)
    # Trim only the edges; keep internal pauses and 80 ms around quiet consonants.
    trim = 'silenceremove=start_periods=1:start_duration=0.02:start_threshold=-50dB:start_silence=0.08'
    temporary = dest / (key + '.working.mp3')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(pcm_file), '-af',
                    f'{trim},areverse,{trim},areverse', '-codec:a', 'libmp3lame',
                    '-b:a', SETTINGS['bitrate'], '-ar', str(SETTINGS['sampleRate']),
                    str(temporary)], check=True)
    temporary.replace(out)
    return out.stat().st_size


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--model-dir', type=Path, required=True)
    parser.add_argument('--output-dir', type=Path, required=True)
    parser.add_argument('--workers', type=int, choices=[1, 2], default=2)
    args = parser.parse_args()
    model = args.model_dir / 'es_ES-davefx-medium.onnx'
    if hashlib.sha256(model.read_bytes()).hexdigest() != MODEL_SHA:
        raise SystemExit('Unexpected voice model: verify the documented source first.')
    dest = args.output_dir
    dest.mkdir(parents=True, exist_ok=True)
    metadata = dest / 'settings.json'
    if metadata.exists() and json.loads(metadata.read_text()) != SETTINGS:
        raise SystemExit('Audio settings changed: use a new output directory.')
    metadata.write_text(json.dumps(SETTINGS, indent=2) + '\n')
    root = Path(__file__).resolve().parents[1]
    texts = json.loads(subprocess.check_output(['node', str(root / 'scripts/audio-texts.js')], text=True))
    total = 0
    with ProcessPoolExecutor(max_workers=args.workers, initializer=initialize,
                             initargs=(args.model_dir,)) as pool:
        for i, size in enumerate(pool.map(generate, ((t, dest) for t in texts)), 1):
            total += size
            if i % 100 == 0:
                print(i, '/', len(texts), flush=True)
    print('Finished', len(texts), total, flush=True)


if __name__ == '__main__':
    main()
