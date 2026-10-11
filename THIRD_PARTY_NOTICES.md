# 词库来源、署名与许可

本文件适用于 `miniprogram/data/lexicon/entries.js` 中的 **6,183 个新增词元**及其派生词义、中文提示、词频和词形；不改变应用代码或原有原创课程的许可。扩展数据以 **CC BY-SA 4.0** 提供：转载应保留署名、许可链接和修改说明，发布其改编数据时使用相同许可。许可正文见 [CC-BY-SA-4.0.txt](LICENSES/CC-BY-SA-4.0.txt)。

## Wiktionary 英文释义与词形

署名：**Wiktionary contributors**，以及词典导出维护者 **Vuizur / Wiktionary-Dictionaries**。

- 原内容：https://en.wiktionary.org/ 。每个新增条目均保留 `sourceUrl`，链接到对应西班牙语词条；词条历史页可查看贡献者。
- 导出仓库：[Vuizur/Wiktionary-Dictionaries](https://github.com/Vuizur/Wiktionary-Dictionaries/tree/be0cfb8d614470bc8b9d9006ddff8b921cd5c2e3)。固定文件 `Spanish-English Wiktionary dictionary.tsv`，固定提交 `be0cfb8d614470bc8b9d9006ddff8b921cd5c2e3`。
- 导出仓库 README 声明文本可按 **CC BY-SA 3.0 / GFDL 双许可**使用。本项目选择 CC BY-SA 3.0 路径，将改编词库按后续版本 CC BY-SA 4.0 发布。原许可正文见 [CC-BY-SA-3.0.txt](LICENSES/CC-BY-SA-3.0.txt)。
- 修改：选取词元的一条适用义项，移除 HTML，筛除大写专名、纯变位或性数形式、旧用法等；仅把首个 TSV 键当作词元，其余键仅作词形；筛选、编排学习阶段和词包，并补充中文提示。英文释义为社区词典内容，未经过 RAE 逐条审核。

## ECDICT 中文辅助释义

署名：**Linwei / skywind3000 / ECDICT contributors**。

- 仓库：[skywind3000/ECDICT](https://github.com/skywind3000/ECDICT/tree/bc015ed2e24a7abef49fc6dbbb7fe32c1dadaf8b)，文件 `ecdict.csv`，提交 `bc015ed2e24a7abef49fc6dbbb7fe32c1dadaf8b`。
- 许可：MIT。保留完整版权声明与许可正文于 [ECDICT-MIT.txt](LICENSES/ECDICT-MIT.txt)。
- 修改：按西英释义提取英语对应词，匹配英中词条与词性，截取简短中文提示；部分常用结构词采用本项目原创提示。未自动生成西中直接翻译，也未生成例句。
- **中文是辅助释义，尚待逐条西班牙语语境校对**。英语的多义性可能造成中文义项偏差；应用保留英文原义、英语对应词与原词典链接，供交叉核对。

## FrequencyWords 词频

署名：**Hermit Dave / FrequencyWords**，上游语料 **OpenSubtitles2018**。

- 仓库：[hermitdave/FrequencyWords](https://github.com/hermitdave/FrequencyWords/tree/525f9b560de45753a5ea01069454e72e9aa541c6)，文件 `content/2018/es/es_50k.txt`，提交 `525f9b560de45753a5ea01069454e72e9aa541c6`。
- 仓库说明区分代码许可与数据许可：**代码 MIT，内容 CC BY-SA 4.0**；此处使用的是词频数据，因此遵守 CC BY-SA 4.0。
- 修改：仅取入选词元在词频表中的出现次数，作为排序依据。不累加变位词频，不把变位当成新的单词。字幕中的同形异义和语体会影响词频，它不等于通用语料难度或官方 CEFR 等级。

## 版本与重建

精确源文件字节数、SHA-256、下载链接见 [docs/lexicon-sources.json](docs/lexicon-sources.json)。构建统计与生成文件哈希见 [docs/lexicon-build.json](docs/lexicon-build.json)。

```sh
python3 scripts/build_lexicon.py --download
python3 scripts/check_lexicon.py
```

构建脚本采用 Python 标准库，下载后先验证完整字节数与哈希，失败即停止。A1 / A2 / B1 / B2 为本站配额与排序的学习阶段；不是 Cervantes 或 CEFR 发布的逐词分类。官方课程参考页面仍以外部链接提供，未将官方教材或 RAE 正文批量复制到应用。
