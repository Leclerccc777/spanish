# 开发说明

原生微信小程序与浏览器体验版共享 `miniprogram/data/` 和 `miniprogram/lib/learning.js`，避免课程与算法分叉。浏览器构建脚本把共享 CommonJS 模块包装进本地 bundle；无需前端框架或远程 CDN。

## 修改课程

A1 在 `data/course.js`，后续阶段在 `data/course-extension.js` 添加单元、词条、课程与题目，给它们稳定且唯一的 ID，并补充 `sourceIds`、`references`。已有 ID 不要重新分配，否则已有学习记录会指向错误内容。更新测试中的数量与解锁要求；题目正确答案用从 0 开始的选项索引。

`expression-tasks.js` 生成各单元目标词、复习词、表达框架、允许检查的词形与原创范文。变位和复数需显式加入 `forms`；本地检查不做词干猜测，不得包装成语法评分。新增输出任务后验证范文符合公开形式要求。

新增权威参考页时，在 `data/sources.js` 记录官方 URL、机构、角色、核验范围和日期。先阅读正文，再填写核验状态。运行资料检查脚本只能验证当前网页响应，不替代课程专家审阅；若标题不符或出现挑战页，应人工诊断而非标为已核验。

## 记录格式

`version: 1` 下包含：

- `track`：`course`（默认）或 `bank`；旧备份缺省保持课内范围。
- `foundations[id]`：四步入门规则测验最佳分与次数；与每日打卡独立。
- `journey`：本地开始日期、`weekChecks[weekNumber]` 的日期和五项手工自检；未来周不允许记录。
- `goal`：后续学习日的词汇数量目标。
- `reviews[wordId]`：间隔、到期日期、最后复习日期、复习次数。
- `lessons[lessonId]`：历史最佳分与练习次数。
- `days[YYYY-MM-DD]`：固定的当日目标、不同词元 canonicalId、达标课程 ID；恢复旧备份时合并重复语境。
- `mistakes[questionId]`：待订正答案、课程和日期。
- `wordPractice[wordId]` / `wordMistakes[wordId]`：词汇测验次数、答对次数与待订正答案。
- `expressions[taskId]`：当前草稿 `text`、最后提交 `submittedText`、更新时间、提交次数。保存草稿不会替换最后提交记录。
- `reviews[wordId].confirmed`：曾确认记住或测验答对，支持稳定解锁；之后遗忘会重排复习但不锁回后续单元。旧备份的非零间隔可恢复这个确认标记。

打卡由每日记录推导，不存储可直接点击改变的打卡标记。存储写入失败时，前端保留当前词卡或练习结果提交入口，不显示虚假的已保存进度。本次新增字段保持 version 1，旧备份缺少可选字段时补空；将来不兼容地修改 schema 时应实现迁移并提高 version，不能直接丢弃已有记录。

## 微信验证

Node 测试中用模拟 `wx` 对象验证页面控制逻辑，不等同于微信运行时。WXML、WXSS 和平台 API 的最终兼容性须在微信开发者工具与真机检查。当前无微信账号接入、云函数、服务器或外部音频 API。

原生页面采用默认导航栏与 5 个原生 tab，额外词卡、语法、词汇测验和表达页通过 `navigateTo` 打开。后续加入音频时，应使用授权音源、配置真实 HTTPS 域名并验证微信平台播放行为。

## 云环境

使用 `/workspace/spanish` 现有检出。每个云任务已隔离，除非用户明确要求，不创建额外 Git worktree。`dist/`、依赖与 npm 缓存可重建；开发服务器进程在新任务中需要重新启动。运行命令见 README。

## 扩展库重建与兼容

`scripts/build_lexicon.py` 只下载 `docs/lexicon-sources.json` 固定提交的三个文件，验证大小和 SHA-256 后再处理。输入在 `/tmp/hola-lexicon-sources`，不提交几十 MB 的原始词典。生成 `data/lexicon/entries.js` 紧凑行数组与 `docs/lexicon-build.json`；`check_lexicon.py` 检查去重计数、生成哈希、表达覆盖和小程序源码包预检。

新词 ID 为词元 NFC 字符串的 SHA-256 前 12 位，排序变化不重编号；原 `w1`–`w320` ID 保留。`course.curriculumWords` 是课内 320 词卡，`course.words` 包含全部可学习卡片（6503 张，含 3 张复用卡），统计使用 `course.lexicon.catalogue`（6500 个词元），不可用卡片总数充当词汇量。

`data/lexicon/index.js` 构造阶段与词包；`tasks.js` 每 5 个新词生成一组表达任务。首组用词包 ID，后续组追加 `-2` 等后缀，每组草稿独立保存。扩展 `modelKind: scaffold` 只能标为待填写框架，不能当作完成范文；检查所有新增词有目标任务，框架不能通过完整输出条件。

词库页面每次仅渲染 30 词及 6 个词包，微信 `setData` 不一次传入全部词库。扩展词义采用英文原义和英中提示，来源文件校验与内容人工校对状态分开；不要自动将新词标成 `reviewed`。许可证保留在仓库 `LICENSES/`，应用资料库提供署名说明链接。

## 新手与年度路线

`data/foundations.js` 提供 4 个原创微课和 16 题，内容参考 PCIC 发音/语法与 DPD tilde/el。`data/year-plan.js` 将已有 A1–B1 24 个单元分配到前 48 周，再安排 4 周复盘；第 365 天单独作学习档案与外部评价建议。`lib/journey.js` 处理基础评分、合法日历日期、开始日期、周自检、旧备份恢复。避免用日历直接解锁单元或把周自检认定为等级达标。

两个入口分别是 `pages/foundations/index` / `pages/year/index` 和浏览器 `#foundations` / `#year`。基础练习最佳分不回退；存储失败必须留在可再次提交的位置。年度周次是预览与建议，实际课程仍使用 `isUnlocked`；五项自检可反选且不改变日打卡。

更新课程或模块后同步 `scripts/build-web.js` 的模块表；独立新增内容不应改变原词元稳定 ID 或旧备份 version。原生发音练习没有播放与自动评分，浏览器使用设备合成语音并处理缺少音色的情况。

## 视觉主题

浏览器样式在 `web/styles.css`，微信共用样式在 `miniprogram/app.wxss`；原生导航栏和 tab 配色另在 `app.json`。当前采用亮绿 `#58cc02`、白色、浅蓝 `#e9f7ff`，主按钮用深色字 `#173d00` 保证清晰，次按钮和导航使用蓝色文字 `#075b86`。卡片及按钮用底部阴影建立层次，按下时降低阴影；原生按钮通过 `hover-class="button-press"` 实现反馈。

保持正确、错误与未解锁状态文字明确，避免仅靠颜色区分。浏览器键盘焦点使用深蓝轮廓，减少动态效果偏好下取消过渡；禁用按钮不使用主色或按压动画。配色修改后运行浏览器交互测试、检查手机布局并用 `capture-preview.js` 更新截图；截图使用 Asia/Shanghai 时区，应用仍按实际设备的本地日期记录。
