# 0.3.0 delivery verification — 2026-10-29

Source: android-apk commit 6273290.
APK supplied by user, 16,903,490 bytes. ZIP CRC integrity passed.
JAR/v1 signature verification passed. Signing certificate SHA-256 matches 0.2.1:
8EA490450208B44F1747C7A087B51101854572EBF7438EFC6B3EE15F481D3224.
Embedded HTML matches a fresh source build after normalizing line endings and whitespace immediately before </head>; no other differences.

Static checks: 128 JS/JSON files and 29 mini-program registrations passed.
Node tests: 111 passed, 1 failed on Windows SIGTERM exit-code expectations in the optional account-server test. Prior network failures were caused by restricted localhost access; the lexicon checksum failure was caused by checkout line endings and passes using original Git bytes.

Limitations: Android v2/v3 signature and zip alignment have not been independently checked with Android SDK tools. No connected Android device; install/upgrade, status bar, navigation, selects and full learning flow still require device acceptance. Comprehensive code simplification and browser regression review remain unfinished. This delivery is not a claim of complete acceptance.
