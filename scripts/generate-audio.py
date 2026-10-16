import sys,json,hashlib,subprocess,wave,argparse
from pathlib import Path
import sherpa_onnx
parser=argparse.ArgumentParser(description='Build Spanish MP3 clips with the documented Piper voice and sherpa-onnx.')
parser.add_argument('--model-dir',type=Path,required=True)
parser.add_argument('--output-dir',type=Path,required=True)
args=parser.parse_args()
model=args.model_dir
config=sherpa_onnx.OfflineTtsConfig(model=sherpa_onnx.OfflineTtsModelConfig(vits=sherpa_onnx.OfflineTtsVitsModelConfig(model=str(model/'es_ES-davefx-medium.onnx'),tokens=str(model/'tokens.txt'),data_dir=str(model/'espeak-ng-data')),num_threads=2,provider='cpu'),max_num_sentences=1)
tts=sherpa_onnx.OfflineTts(config)
root=Path(__file__).resolve().parents[1]
texts=json.loads(subprocess.check_output(['node',str(root/'scripts/audio-texts.js')],text=True))
dest=args.output_dir;dest.mkdir(parents=True,exist_ok=True)
for i,text in enumerate(texts):
    key=hashlib.sha256(text.encode()).hexdigest()[:16];out=dest/(key+'.mp3')
    if not out.exists():
        samples=tts.generate(text.replace(' / ','. '),sid=0,speed=.9)
        import array
        pcm=array.array('h',(max(-32768,min(32767,round(s*32767))) for s in samples.samples))
        with wave.open(str(dest/'working.wav'),'wb') as f:
            f.setnchannels(1);f.setsampwidth(2);f.setframerate(samples.sample_rate);f.writeframes(pcm.tobytes())
        subprocess.run(['ffmpeg','-v','error','-y','-i',str(dest/'working.wav'),'-codec:a','libmp3lame','-b:a','40k','-ar','22050',str(out)],check=True)
    if i%25==0: print(i+1,len(texts),flush=True)
print('Finished',len(texts),sum(p.stat().st_size for p in dest.glob('*.mp3')),flush=True)

(dest/'working.wav').unlink(missing_ok=True)
