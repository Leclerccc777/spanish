# Hola 西语安卓安装包

Android APK 单独保存在 `android-apk` 分支的本目录。

[下载 Hola-Spanish-0.2.1.apk](https://github.com/Leclerccc777/spanish/raw/refs/heads/android-apk/releases/android/Hola-Spanish-0.2.1.apk)

- 版本：0.2.1（versionCode 2），包名 `com.leclerccc777.hola`。
- 最低 Android 8.0，需要较新的 Android System WebView。
- 包含 6500 词库和 6788 段内置语音，可离线学习。
- 当前账号服务未启用；进度保存在手机，可用 JSON 备份导入导出。
- 下载后在手机上打开，按系统提示允许该来源安装。网页版进度须先导出 JSON，再在应用中导入。
- 已通过编译、签名、对齐和静态检查；尚未完成安卓真机测试。

安装包大小：16,887,106 字节。校验值见 [SHA256SUMS](SHA256SUMS)。
后续版本应使用相同签名和包名，并递增版本号后覆盖安装。卸载或清除数据前请先导出备份。
私钥和签名密码保留在仓库外的私有备份中，不随 APK 发布。

[构建与维护说明](../../docs/ANDROID.md)

0.2.1 修复底部导航误打开浏览器的问题。可使用原签名覆盖安装，无需卸载。
