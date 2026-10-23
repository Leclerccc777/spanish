# 安卓离线 APK

首个 Android 包复用浏览器体验版、共享学习引擎和原有 version 1 JSON 备份。包含 6500 词库、四步入门、年度计划、分级练习与 6788 段合成音，安装后可离线学习。应用名为 **Hola 西语**，包名 `com.leclerccc777.hola`，版本 `0.2.1` / versionCode `2`，最低 Android 8.0（API 26）；需要较新的 Android System WebView。

## 安装和迁移

1. 将 APK 下载到安卓手机，打开文件，按手机提示允许本次安装来源安装应用。
2. 打开“Hola 西语”，先练一课、播放语音，再退出重开检查记录。
3. 已使用网页版时，先在旧入口的“学习进度”导出 JSON；在 APK 的同一页面点击“导入备份”，用系统文件选择器选择 JSON，确认后迁入。浏览器记录不会自动进入 APK。
4. 定期点击“导出备份”，在系统窗口选择保存位置。只有看到“JSON 备份已保存”才表示导出完成；取消不会删除手机记录。

后续升级应直接安装**相同包名、相同签名且版本号递增**的 APK，避免卸载。卸载或清除应用数据会删除本机进度，操作前必须导出。不要用不同签名的开发包覆盖正式签名包。此次为离线体验交付，尚未做安卓真机验收，也没有上架应用商店。

本包禁用账号服务，不申请联网、存储、麦克风或联系人权限。网页中的账号入口说明服务未启用；官方参考链接交给手机浏览器，需要网络。未来接通账号服务需单独调整构建、原生网络权限和来源限制，不能只填写 API 地址就声称同步已开通。

## 可复现构建

需要 Node.js 24、JDK 17、Android SDK Platform 35 和 Build Tools 35.0.0。Gradle wrapper 固定 8.11.1，Android Gradle Plugin 固定 8.9.2，AndroidX WebKit 固定 1.12.1。

```sh
npm ci
npm test
npm run check
cd android
# ANDROID_HOME 指向自己的 SDK；首次构建需网络下载 Gradle 与依赖。
./gradlew assembleDebug
```

开发包输出 `android/app/build/outputs/apk/debug/app-debug.apk`。`preBuild` 自动执行 `scripts/package-android.js`，从最新源码生成离线 assets，不依赖仓库内可能较旧的 releases HTML。生成目录、临时安装包和密钥均被 Git 忽略。用户确认发布的安装包单独复制到 `android-apk` 分支的 `releases/android/`，并记录 SHA-256。

正式签名通过环境变量传入 `HOLA_KEYSTORE`、`HOLA_STORE_PASSWORD`、`HOLA_KEY_ALIAS`、`HOLA_KEY_PASSWORD` 后运行 `./gradlew assembleRelease`，得到 `android/app/build/outputs/apk/release/app-release.apk`。没有私钥配置时 release 为未签名包，不可直接安装。密钥和密码必须放在私有备份中，禁止进入 Git；丢失密钥将无法覆盖升级已有安装。本次交付另附私有签名备份 ZIP。

## 平台边界与安全

页面始终从 `https://appassets.androidplatform.net/assets/index.html` 的本地 assets 加载；不要改变该 origin / 路径，否则浏览器存储会变成另一份。使用官方 `WebViewAssetLoader`，关闭 file/content 任意访问、明文和混合内容；只允许内置页面，CSP 拒绝外部脚本、连接、iframe 和表单提交。外部 HTTPS 链接交给系统浏览器，不能在带原生接口的 WebView 中打开。没有 INTERNET 权限。

唯一的业务桥接是经过大小与结构校验的 JSON 导出和 HTTPS 参考链接打开。导入继续沿用网页的 8 MB 限制、version 校验、学习状态恢复和替换前保护。系统文档选择器授予单个文件访问，不请求整个存储权限。保存取消、写入失败与活动中断均不给出虚假成功。横竖屏保持当前 WebView；返回键先关闭登录弹窗，再检查未保存练习 / 草稿，首页返回只将应用置于后台；切后台停止音频。

## 验证范围

- Node 共享学习逻辑与浏览器自动化负责旧进度、备份兼容、练习、音频和界面回归。
- `tests/e2e/android.spec.js` 在同一虚拟 HTTPS 来源、离线和相同 CSP 下测试网页桥接协议；原生接口在这里是模拟对象，不能替代设备测试。
- Android Gradle 编译 / lint、`apksigner verify --verbose --print-certs`、`zipalign -c`、APK manifest 和内置 assets 内容检查负责安装包静态验证。
- **仍需真机**：安装 / 覆盖升级、WebView 启动、中文 / 西语输入、系统返回与键盘、文件选择与保存取消、音频、横屏 / 挖孔 / 手势栏、强杀重启后记录。云环境没有连接安卓设备，不能将浏览器测试写成真机通过。

参考：[Android 官方本地内容加载](https://developer.android.com/develop/ui/views/layout/webapps/load-local-content)、[AGP 8.9 兼容表](https://developer.android.com/build/releases/agp-8-9-0-release-notes)。

## 0.2.1 导航修复

内部锚点的 DOM href 会被补全为虚拟来源的 HTTPS 地址，0.2.0 因仅检查协议而将其误交给浏览器。现在仅不同 origin 的 HTTPS 资料链接进入浏览器，底部导航和内部课程链接走原 hash 路由。沿用原签名、包名与存储来源，versionCode 增至 2，直接覆盖安装即可。

本次只更新 HTML 和 manifest 版本，原生类与资源保持相同。`scripts/update-android-assets.py` 可更新同长度版本名的二进制 manifest 与页面 assets，再使用 Android SDK 的 zipalign / apksigner 对齐、签名；不适用于原生代码或资源变更，后者必须执行正常 Gradle 构建。
