# 内置西语语音包

当前生成清单为 **6788 段 MP3**，覆盖全部 **6500 个不同词条文本**（6503 张词卡中的 3 张复用卡共用音频），以及四步入门例词、32 课语法例句、24 包例句与短文、4 篇进阶文章各段、72 组短文词语提示、21 组文章词语提示和 8 个名词的单复数 / 搭配 / 完整句。不同位置出现的相同文本共用文件，分类数量不能直接相加。音频为西班牙西语合成音（es_ES），不是教师或真人录音。

全部词库词条都有内置音频，不再依赖设备西语音色。词库详情、词卡、阅读词组和名词搭配均可试听，支持正常播放、0.75 倍慢速和停止。预览不会解锁学习内容、写入进度、自动打卡或勾选年度听力任务，也不会给跟读打分。自由输入、待填写表达框架和所有题目选项不在本次音频清单内，不将“全词库覆盖”称为任意文本语音生成。

中文释义不送入西语音色。入门例句里的箭头后是拼读标注，音频只读箭头前原词；斜杠分隔的阴阳性形式分别生成，再加入 180 ms 停顿合并，避免模型句界处理漏读后一项。阅读词组按西语原文独立生成，意思解释在页面阅读，不拼进音频。

浏览器的 MP3 以 data URL 打包，Pages 与下载 HTML 都包含同一语音包，不需要在线语音 API、系统音色或上传学习者输入。完整 HTML 比上一版更大，首次下载须等文件加载完成；随后可离线学习。微信使用按需加载的本地分包，首次播放需取得相应分包；失败可重试，搜索、翻页、关闭词组或离页取消过期播放。主包及每个分包预检 2 MiB，总体预检 20 MiB；最终以微信官方编译为准。

本次发布含 **17,685,628 字节音频、12 个微信分包**，每包含占位页后不超过 1,499,979 字节。主包源码 1,769,667 字节，全部小程序源码与音频合计 19,459,603 字节，低于 20 MiB 预检线。交付 HTML 为 25,319,004 字节（约 24.1 MiB），Pages 首页与下载文件字节一致。

## 音源及生成

- 音色：Piper `es_ES-davefx-medium`，单说话人，22,050 Hz。
- 下载来源：[sherpa-onnx 的公开模型发布](https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/vits-piper-es_ES-davefx-medium.tar.bz2)。运行环境允许此依赖发布域名；没有使用在线付费语音服务。
- 上游模型卡：[仓库副本](../LICENSES/piper-davefx-MODEL_CARD.txt)。它声明训练数据来自 [NabuCasa/voice-datasets](https://github.com/NabuCasa/voice-datasets)，数据集为 CC0；也记录从 lessac 音色微调。该说明不等于人工发音质量审核。
- 模型包 SHA-256：`a3f6beb54a9cb893279f72978a22f807a4d9fc9c7848157b524d5cc7b7f58b22`。
- ONNX SHA-256：`6826f9ac3fb4aac5c89c597f76ff32e84e7a0dea9469a6f18d1d387b696163eb`。
- 本次生成：sherpa-onnx 1.13.8，CPU，2 个生成进程、每进程 1 线程，sid 0，speed 0.9；模型原采样率为 22,050 Hz，ffmpeg 输出单声道 MP3，16,000 Hz、24 kb/s。仅去掉首尾多余静音，保留内部停顿和两端约 80 ms 余量，避免为缩小包体加速朗读。低于 250 ms 的极短词补句末标点并降低合成速度重生成；仍过短时使用独立强调的语气，无法达到最低时长则报错。不靠添加静音补时长。项目只发布生成音频与模型卡，不分发推理库或模型。

重建需要 Python、sherpa-onnx 与 ffmpeg。模型下载并核对哈希后：

```bash
python3 -m pip install --target .audio-cache/python sherpa-onnx==1.13.8
PYTHONPATH=.audio-cache/python python3 scripts/generate-audio.py --model-dir .audio-cache/vits-piper-es_ES-davefx-medium --output-dir .audio-cache/full
node scripts/package-audio.js .audio-cache/full
npm run package:html
```

`scripts/audio-texts.js` 从既有材料取文本；文件名是原文本 SHA-256 的前 16 位。`data/audio-manifest.js` 精确匹配文本与音频路径，包内所有文件随仓库提交。文本改动必须重建相应音频并核验，不能让旧音频冒充新文字。工作区内的 `.audio-cache/` 已被 Git 忽略，用来保存模型、生成参数与原始 PCM / MP3 缓存；不要把长任务唯一缓存放在可能随环境重建清空的 `/tmp`。生成目录保存 settings.json；参数不一致时拒绝复用，切换模型或编码须使用新目录。打包器先校验完整素材与包体预算，再替换清单并清除旧清单中的废弃 MP3；测试确保没有缺失或孤立文件。原始 WAV、模型与推理依赖不进入小程序包。

词组核对的范围和修改见 [词组复查](PHRASE_REVIEW.md)。全部音频仍需专业听审；自动解码与覆盖检查不能证明每个重音、停顿和语调都自然。
