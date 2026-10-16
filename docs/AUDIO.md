# 内置西语语音包

首批 **493 段 MP3 / 4,813,654 字节**，为西班牙西语合成音（es_ES），不是教师或真人录音。覆盖 320 张课内词卡的西语文本（重复文本共用文件）、四步入门例词、32 课语法例句、24 包例句与短文、4 篇进阶文章的各段。正常播放、0.75 倍慢速和停止均在学习页操作；不会给跟读打分或自动勾选年度听力任务。

6500 词库的扩展词尚未全部收录。浏览器对未收录词尝试设备西语音色，无音色时明确提示；微信展示未收录说明。中文释义不送入西语音色。入门例句里的箭头后是拼读标注，音频只读箭头前原词；斜杠分隔的词组用停顿处理。

浏览器的 MP3 以 data URL 打包，Pages 与下载 HTML 都包含同一语音包，不需要在线语音 API、系统音色或上传学习者输入。更新的单文件会比旧版大约增加 6.5 MB。微信放在四个按需加载分包中，首次播放需先取得相应分包；分包加载或播放失败可重试，离页与切换音频取消过期加载。主包及每个分包源码分别预检 2 MiB，总体预检 20 MiB；最终以微信官方编译为准。

## 音源及生成

- 音色：Piper `es_ES-davefx-medium`，单说话人，22,050 Hz。
- 下载来源：[sherpa-onnx 的公开模型发布](https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/vits-piper-es_ES-davefx-medium.tar.bz2)。运行环境允许此依赖发布域名；没有使用在线付费语音服务。
- 上游模型卡：[仓库副本](../LICENSES/piper-davefx-MODEL_CARD.txt)。它声明训练数据来自 [NabuCasa/voice-datasets](https://github.com/NabuCasa/voice-datasets)，数据集为 CC0；也记录从 lessac 音色微调。该说明不等于人工发音质量审核。
- 模型包 SHA-256：`a3f6beb54a9cb893279f72978a22f807a4d9fc9c7848157b524d5cc7b7f58b22`。
- ONNX SHA-256：`6826f9ac3fb4aac5c89c597f76ff32e84e7a0dea9469a6f18d1d387b696163eb`。
- 本次生成：sherpa-onnx 1.13.8，CPU，2 线程，sid 0，speed 0.9；ffmpeg 输出单声道 MP3，22,050 Hz、40 kb/s。项目只发布生成音频与模型卡，不分发推理库或模型。

重建需要 Python、sherpa-onnx 与 ffmpeg。模型下载并核对哈希后：

```bash
python3 scripts/generate-audio.py --model-dir /tmp/vits-piper-es_ES-davefx-medium --output-dir /tmp/hola-audio
node scripts/package-audio.js /tmp/hola-audio
npm run package:html
```

`scripts/audio-texts.js` 从既有材料取文本；文件名是原文本 SHA-256 的前 16 位。`data/audio-manifest.js` 精确匹配文本与音频路径，包内所有文件随仓库提交。文本改动必须重建相应音频并核验，不能让旧音频冒充新文字。生成目录应为当前模型与参数专用，切换模型时清空缓存或换新目录；打包时检查分包内无废弃文件。
