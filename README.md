# 生日星空屏保 🌌

> **👉 [点这里在线预览效果](https://lydiamtier-design.github.io/birthday-skyline/)（手机 / 平板浏览器直接打开，可全屏）**
>
> 想换成自己的祝福？在链接后面加参数：`?name=小明&wish=生日快乐`
> [看示例](https://lydiamtier-design.github.io/birthday-skyline/?name=%E5%B0%8F%E6%98%8E&wish=%E7%94%9F%E6%97%A5%E5%BF%AB%E4%B9%90)

一个可以在平板、手机、电脑上全屏播放的生日祝福动态屏。星空闪烁、流星划过、萤火虫从草地升起、前景草叶随风摆动，轻触画面还能撒一把星星；点开八音盒按钮会循环播放《生日快乐》。

纯原生 HTML / CSS / JavaScript，**零依赖、零构建**，双击 `index.html` 就能用。

## 效果

- 宽幅 2.33:1 画面，自动适配横屏 / 竖屏（竖屏会提示横过来）
- 星星呼吸闪烁、随机流星、许愿星、萤火虫、飘落星尘
- 前景草叶摇曳 + 背景轻微视差，画面"活"起来
- 轻触 / 拖动撒星星，带涟漪
- Web Audio 合成的八音盒《生日快乐》，可调音量、可关闭
- 全屏按钮、屏幕常亮（Wake Lock）、控件 5 秒自动隐藏
- 自动尊重系统的"减少动态效果"设置

## 快速开始

### 本地直接打开

```bash
git clone https://github.com/<你的用户名>/birthday-skyline.git
cd birthday-skyline
# 直接用浏览器打开 index.html 即可
```

### 定制你自己的祝福

编辑根目录的 `config.js`，改 `title` 两行文字和背景图路径：

```js
window.BIRTHDAY_CONFIG = {
  title: ['小明', '生日快乐'],     // ← 改成你要的名字和祝福
  image: 'assets/sky.jpg',         // ← 换成你自己的图片（可选）
  showMusic: true,
  enableSparks: true,
  starDensity: 9200,
  fireflyDensity: 24000
};
```

**不改代码也能临时定制标题**——用 URL 参数：

```
index.html?name=小明&wish=生日快乐
```

把这条链接发给对方，打开就是专属版本。

### 换成自己的背景图

把图片放进 `assets/`，改 `config.js` 里的 `image` 路径即可。建议：

- 比例约 **2.33:1**（宽幅），左上角留出放标题的空间
- JPG / PNG 均可，建议 1~3 MB，太大影响平板加载
- 不建议用带文字的图——标题由代码渲染，改起来更方便

## 部署到 GitHub Pages（拿到一个公开链接）

1. 在 GitHub 上 `New repository`，仓库名随意（例如 `birthday-skyline`）
2. 把本仓库文件上传进去
3. 进入 `Settings` → `Pages`
4. `Build and deployment` → `Source` 选 `Deploy from a branch`
5. 分支选 `main`，目录选 `/ (root)`，保存
6. 等 1~2 分钟，访问 `https://<你的用户名>.github.io/<仓库名>/`

拿到链接后，平板浏览器打开 → 点全屏按钮即可播放。iPad 上若全屏按钮无效，用 Safari 打开后点地址栏 `AA` → 「隐藏工具栏」。

## 文件结构

```
birthday-skyline/
├── index.html          # 页面结构
├── config.js           # ★ 配置文件（你主要改这个）
├── assets/
│   ├── app.js          # 动画与交互逻辑
│   ├── style.css       # 样式
│   └── sky.jpg         # 示例背景图（AI 生成，MIT 授权）
├── LICENSE             # MIT 协议
└── README.md
```

## 常见问题

**Q：音乐点了没反应？**
浏览器的自动播放策略要求先有用户交互。点一下「音乐 关」按钮即可开启；部分浏览器需要再点一次。

**Q：iPad 上画面会自动锁屏熄灭？**
网页支持 Wake Lock（Android / 新版 Chrome 有效）。iPad Safari 暂不支持该接口，请到「设置 → 显示与亮度 → 自动锁定」临时改为「永不」。

**Q：想导出成视频？**
本仓库只提供网页版。可以用屏幕录制工具录制浏览器全屏画面，再剪辑成视频。

**Q：能商用吗？**
代码可以。MIT 协议允许商用、修改、分发，只需保留 LICENSE 文件。示例背景图见下方「素材与版权」说明。

## 素材与版权声明

> **AI 生成内容提示**：本仓库的示例背景图 `assets/sky.jpg` 由人工智能生成（腾讯混元），图片文件元数据中保留了 AIGC 隐式标识。根据《人工智能生成合成内容标识办法》（2025 年 9 月 1 日施行），转载或发布时请保留该标识，并声明其为 AI 生成内容。

**各部分权利说明：**

| 内容 | 来源 | 使用说明 |
| --- | --- | --- |
| 代码（HTML/CSS/JS） | 原创，MIT 协议 | 可自由使用、修改、商用，保留 LICENSE 即可 |
| 示例背景图 `sky.jpg` | AI 生成 | 保留元数据标识后可随本项目使用；如需商用或独立分发，请自行确认所用 AI 平台的服务条款 |
| 八音盒《生日快乐》旋律 | 传统儿歌曲调 | 旋律在多数国家属公有领域；本项目用 Web Audio 合成，未使用任何受版权保护的录音 |
| "小王子 / 狐狸"意象 | 致敬 | 《小王子》原作在多数国家已进入公有领域（中国 1995 年起）；本项目未复制任何原书插画或具体绘本文字，仅使用通用意象 |

**建议**：如果用于正式商业场合，最好把 `assets/sky.jpg` 换成自己拍摄、购买授权或明确可商用的图片，并在 `config.js` 中修改 `image` 路径即可，代码无需改动。

## 致谢

星空与小王子的意象致敬安托万·德·圣埃克苏佩里的《小王子》。

## License

代码：[MIT](LICENSE)
