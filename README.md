# 篮球经理：征服联盟 — 本地镜像

虎扑 H5 游戏 `app_2eeb0a1013` 的静态资源完整镜像。

- 来源：https://activity-static.hupu.com/shaper/published/app_2eeb0a1013/index.html?night=0
- 应用 ID：`app_2eeb0a1013`
- 发布版本：`appv_705c892ee95b448aaea8506fbde61741`
- 游戏版本：`source-888fd158a8d64f86`
- 抓取时间：2026-10-26

## 运行

**双击 `start.bat`**，会弹出一个黑色命令行窗口（这是服务器，不要关掉）并自动打开浏览器。

- 地址：<http://127.0.0.1:8712/index.html?night=0>
- 直接访问 <http://127.0.0.1:8712/> 也会自动跳转到游戏页。
- 需要关闭游戏服务时，关掉那个黑色窗口即可。

也可以手动运行：

```bash
cd "C:\Users\houboxuan\Desktop\篮球经理"
python serve.py
```

> 必须通过 HTTP 服务访问，直接双击 `index.html`（file://）无法运行。
> 需要 Python 3；本机已在 `C:\Python314`。

## 打不开时怎么排查

1. 看黑色窗口是否还在。窗口关了 = 服务停了，游戏页面就会显示"页面无法加载"。
2. 窗口里应显示实际地址。8712 被占用时会自动顺延到 8713–8721，以窗口里显示的为准。
3. 若窗口一闪而过或提示"没有找到 Python"，说明 Python 未加入 PATH，重装时勾选 *Add Python to PATH*。
4. 已在运行时重复双击 `start.bat` 不会起第二个服务，会直接打开已有地址。

## 目录结构

```
index.html                 外框壳（shell），加载 iframe 与桥接脚本
__ai_app.html              游戏本体页面
serve.py                   本地静态服务器启动器
start.bat                  Windows 一键启动
assets/
  game.js                  主逻辑（React，约 3.6 MB）
  worker-codec-*.js        存档编解码 Worker
  worker-simulation-*.js   比赛模拟 Worker
branding/                  图标、Logo、启动图
story/                     开场剧情图
expansion-logos/           两支扩军队默认队徽
team-logos/                30 支 NBA 球队队徽
team-statues/              球队雕像精灵图
player-portraits/          26 张球员头像图集（每张 25 帧）
retired-portraits/         32 个懒加载分片，退役球员头像（内嵌 base64 WebP）
historical-intros/         32 个懒加载分片，历史球员介绍文案
leaderboard/               独立排行榜页（index.html），榜单通过 Lamps 桥接
vendor/                    原本从 CDN 加载的第三方脚本（已改为本地引用）
```

## 已做的本地化改动

`index.html` 与 `__ai_app.html` 中原本指向虎扑 CDN / jsDelivr 的脚本和外链，已改为 `./vendor/...` 与 `./branding/...` 本地路径，离线可正常启动。

## 关于启动时的"虎扑账号状态暂不可用"弹窗

这是游戏的虎扑账号 / 云存档模块在检测登录状态时的提示，不是游戏崩溃。

本地运行时控制台会打印：

```
[ColorboxAI.Auth] Sync check returned no token. userInfo exists: false HupuBridge exists: false
[ColorboxAI.Auth] Not in App environment. Skipping bridgeReady.
```

即：当前不在虎扑 App 内、也没有登录态，拿不到账号信息。提示里的"存档未被覆盖"是安全说明——遇到这种情况它不会拿云端存档覆盖本地存档。

已在本镜像的 `index.html` 和 `__ai_app.html` 顶部加入拦截脚本：页面级的阻塞式 `alert` 会转为控制台警告（搜索 `[本地镜像] 已拦截弹窗` 可看到），不会再卡住启动。云存档/排行榜本来就需要虎扑服务端，离线不可用，不影响单机玩法。

## 换皮版本（COMIC RED / WHITE）

已附带一套“美漫红白”视觉皮肤，放在 `skins/comic-red/`，不修改原版文件。

```bash
python build_skin.py
```

然后双击 `start_comic.bat`：

- 默认用 **8712** 端口，与原版同源，**原存档可直接读取**。
- 若 8712 被原版服务占用，会自动改用 8713–8721，并在窗口里提示存档不互通。
- 原版仍可用 `start.bat` 启动，两套互不影响。

皮肤只替换配色、字体、Logo、队徽、球队素材、剧情图和面板样式；球员头像保持原图，玩法、流程、数值、球员 ID、存档结构均未改动。详见 `skins/comic-red/README.md`。

## Lamps 平台接入

已接入 Lamps 的激励视频、排行榜、游戏进度（云存档）三项能力，接入代码在 `vendor/lamps/`；构建阶段还会对 `assets/game.js` 做合规补丁，关闭原版直连云存档/榜单。

- 正式环境：UA 含 `LampsSDK` 时自动启用
- 本地调试：`localStorage.setItem('lamps:force', '1')` 后刷新；没有 Lamps 宿主时调用会失败，属于正常现象
- 云存档入口在「设置 → 云存档」，保存所选槽位主存档，恢复前会二次确认
- 认证 Key 只在 `.lamps/auth-key`，不会进入游戏前端或构建产物
- 构建产物已移除自由文本输入：搜索框改为隐藏，薪资报价和轮换分钟改为滑杆；原版 `start.bat` 不受影响
- 构建产物已移除 Hupu 调试登录、WebGuard、Hupu 埋点信标、直连腾讯云开发域名与外部字体；`dist/comic-red` 只请求本地资源

### 平台安全整改

1. 删除 `hupu_debug` 调试入口、`debug_code` 交换、`originalFetch` 包装、actorToken 登录桥与 `shaper.hupu.com` 调试接口。
2. 删除 `ACTIVITY_API_BASE` / `ACTIVITY_ENV_ID` 直连腾讯云开发域名；排行榜只走 Lamps 榜单桥接，非内嵌模式直接提示从游戏内打开。
3. 删除 WebGuard 初始化与设备信息上报、Hupu HpTracer / `hermes.hupu.com` 埋点信标；ColorboxAI SDK 的旧云登录地址和 WebGuard 钩子也在构建时置空。
4. iframe 消息入口校验 `event.origin` 与 `event.source`，只接受主游戏 iframe；`navigation.open` 直接拒绝，不再执行顶层跳转、`window.open` 或 `huputiyu://` 自定义 scheme 唤起。
5. 删除 ColorboxAI OSS Shell 与硬编码 `appId` / `sk`，不再打包 Kaleido / 阿里云 OSS SDK；海报分享只在本机生成并提示截图，不再上传到外部 OSS 桶。
6. 删除壳层通用 `http.request` 任意 URL 代理与 `X-Hupu-Token` 注入，移除安全审核代理；iframe 消息只接受主游戏 iframe，不再具备跨域请求或令牌转发能力。
7. 移除 ColorboxAI SDK 与 Hupu 原生 Bridge（`hupu-js-bridge`），发布包不再包含 `relay.hupu.com`、`enterprise.hupu.com`、`bbs.mobileapi.hupu.com`、`games.mobileapi.hupu.com` 等外部域名；`ColorboxAI.storage` 改为纯本地 localStorage，云端进度只走 `LampsPlatform.saveGameProgress` / `getGameProgress`。

详见 `skins/comic-red/README.md`。

## 说明

- 单机玩法（建队、扩军选秀、赛季模拟、交易等）完整可用，已在本地实测。
- 球员头像不是 `./player-portraits/nba-<id>.png`（这些文件在线上就是 404，属于代码里的旧兜底路径），实际使用 `player-portraits/nba-atlas-*.webp` 精灵图。
- 原版排行榜、云存档、登录依赖虎扑服务端；构建产物已关闭这些直连，排行榜和云存档改用 Lamps 平台能力。构建产物不再发送 Hupu 埋点。
- 资源版权归虎扑所有，本镜像仅供个人学习与离线备份，请勿二次分发或商用。
