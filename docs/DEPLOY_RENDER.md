# 用 Render 部署账号后台

此方案保留当前 Node.js + SQLite 后台，网页继续使用 GitHub Pages。仓库根目录的 `render.yaml` 已声明一个 Node.js 24 Web Service、一个实例、1 GB 持久化磁盘、HTTPS 前的公开监听和健康检查。

**配置文件准备好不代表已经部署。**必须在你的 Render 账号里创建服务并确认成功，再将真实地址接入网页。Blueprint 使用付费实例和磁盘，价格以 Render 创建页面为准，确认资源和费用后再应用；不要用没有持久化磁盘的免费临时实例承载正式学习账号。

## 创建服务

[在 Render 中载入这个仓库的部署配置](https://render.com/deploy?repo=https://github.com/Leclerccc777/spanish)

1. 登录 Render，选择 New → Blueprint，连接 GitHub 并选择 `Leclerccc777/spanish` 的 main 分支；也可以打开上面的链接。允许读取该仓库。
2. 检查创建内容为 `hola-spanish-accounts` Web Service 与 `hola-progress` 持久化磁盘。默认 Singapore 区域；若该区域不可选，在资源确认页面选择可用区域，不删除磁盘配置。
3. 核对费用后应用配置。等待构建、启动及健康检查成功。此时才可以记录 Render 返回的实际 HTTPS 服务地址，不根据服务名称猜测域名。

仓库配置如下：

| 配置 | 值 |
| --- | --- |
| Node | 24 |
| 构建命令 | `npm ci --omit=dev --ignore-scripts --no-audit --no-fund` |
| 启动命令 | `npm run start:accounts` |
| 健康检查 | `/healthz` |
| `HOST` | `0.0.0.0`，让平台代理可连接服务 |
| `PORT` | 使用 Render 注入的端口，不手工固定 |
| `HOLA_ACCOUNT_DB` | `/var/data/hola/accounts.sqlite` |
| `HOLA_ALLOWED_ORIGINS` | `https://leclerccc777.github.io`，不带 `/spanish/` |
| 持久化磁盘 | 挂载 `/var/data`，1 GB，保留现有数据 |

`GET /healthz` 仅返回 `{"status":"ready"}` 或不可用状态，不公开账号数量、用户编号、数据库路径、密码或 token。它检查数据库连接，不替代完整注册 / 同步验收。

## 接入现有 GitHub Pages

1. 打开真实服务的 `/healthz`，确认 HTTP 200 和 ready。
2. 在 GitHub 仓库 Settings → Secrets and variables → Actions → Variables，创建 **Repository variable** `HOLA_ACCOUNT_API`，值为 Render 的真实 HTTPS 地址加 `/api`。这只是公开地址，不能填写密码或 token。
3. 到 Actions → Publish browser app to GitHub Pages，运行工作流，或等待下一次 main 推送构建发布。工作流已读取这个变量，无需改学习页面。
4. 打开 `https://leclerccc777.github.io/spanish/`，必要时刷新页面。点击头像，注册 / 登录按钮应可用。
5. 用测试账号注册，保存一份草稿并确认“已与账号同步”；在另一浏览器登录同一账号，核对固定编号、草稿、关卡与成绩。
6. 在 Render 重启服务，重新登录同一账号核对记录仍保留；然后清理本机测试会话。不要通过删除服务 / 删除磁盘来测试重启。

## 数据与更新

同一实例持续使用同一磁盘。更新 main 或重新部署代码不应删除 `/var/data`；迁移平台时先用 SQLite 在线备份或停服务后连同 WAL 正确备份，复制前应演练恢复。持久化磁盘和 `previous_json` 不替代异地备份；学习者仍可导出 JSON，文件不包含会话或密码。

SQLite 方案保持单实例。多个进程、多个副本或无共享磁盘的扩容需要先迁移数据库，不要直接扩大实例数。反向代理后的认证限流目前会共享连接 IP 额度，每账号也有限流；扩大用户范围前应接入可信入口限流和容量验证。

后台只有 API，不提供学习网页。访问后台根路径返回 404 属正常现象；应检查 `/healthz`，学习网站仍是原来的 GitHub Pages 地址。旧离线 HTML 继续本机学习，不能因为云端上线就自动读取其本地记录；需要先导出，再导入到准备使用的账号中。

微信配置仍按 [账号说明](ACCOUNTS.md) 单独进行：使用符合微信要求的 HTTPS 请求域名并进行官方编译 / 真机验证。Render 平台地址通过浏览器测试不等于微信发布已获准。
