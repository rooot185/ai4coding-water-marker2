# GitHub Release 发布指南

本文档说明如何使用 GitHub Release 发布 WaterMarker 应用程序。

## 配置说明

项目已配置好 `electron-builder` 和 GitHub Actions 自动化发布流程。

### package.json 配置

- `build` 脚本：构建 Windows 安装包（本地使用）
- `release` 脚本：构建并发布到 GitHub Release（由 CI/CD 使用）

## 发布步骤

### 方法一：自动发布（推荐）

1. **更新版本号**

   编辑 `package.json` 中的 `version` 字段：
   ```json
   "version": "1.0.1"
   ```

2. **创建并推送 Git Tag**

   ```bash
   git add package.json
   git commit -m "chore: bump version to 1.0.1"
   git tag v1.0.1
   git push origin main
   git push origin v1.0.1
   ```

3. **自动构建**

   推送 tag 后，GitHub Actions 会自动：
   - 检出代码
   - 安装依赖
   - 构建 Windows 安装包（NSIS 和 ZIP 格式）
   - 创建 GitHub Release
   - 上传安装包到 Release

4. **查看 Release**

   访问仓库的 Releases 页面查看发布结果：
   ```
   https://github.com/rooot185/ai4coding-water-marker2/releases
   ```

### 方法二：手动发布

1. **配置 GitHub Token**

   ```bash
   # Windows PowerShell
   $env:GH_TOKEN="your_github_personal_access_token"

   # Windows CMD
   set GH_TOKEN=your_github_personal_access_token
   ```

2. **执行发布命令**

   ```bash
   npm run release
   ```

3. **手动创建 Tag**

   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

## 本地构建（不发布）

如果只想本地构建安装包而不发布到 GitHub：

```bash
npm run build
```

构建产物将输出到 `dist` 目录。

## 构建产物说明

### Windows 平台

- `WaterMarker-Setup-1.0.0.exe` - NSIS 安装程序（推荐用户下载）
- `WaterMarker-1.0.0-win.zip` - 便携版（解压即用）

构建目标包括：
- x64 (64位)
- ia32 (32位)

### 跨平台构建（可选）

```bash
# macOS 平台
npm run build:mac

# Linux 平台
npm run build:linux
```

注意：跨平台构建需要在对应的操作系统上执行。

## 配置项说明

### 修改 GitHub 仓库信息

编辑 `package.json` 中的 `build.publish` 部分：

```json
"publish": {
  "provider": "github",
  "owner": "YOUR_GITHUB_USERNAME",  // 替换为你的 GitHub 用户名
  "repo": "ai4coding-water-marker2"
}
```

### 自定义应用图标

将图标文件放置在以下位置：

- Windows: `assets/icon.ico` (256x256 或更大)
- macOS: `assets/icon.icns`
- Linux: `assets/icon.png` (512x512)

## 常见问题

### 1. GitHub Actions 构建失败

检查：
- GitHub Token 权限是否正确
- 仓库设置中是否启用了 Actions
- 工作流日志中的具体错误信息

### 2. 本地构建失败

确保：
- Node.js 版本 >= 16
- 已运行 `npm install`
- Windows Defender 或杀毒软件未阻止构建

### 3. Release 未自动创建

确认：
- Tag 格式正确（必须以 `v` 开头，如 `v1.0.0`）
- GitHub Actions 工作流已正确触发
- `GH_TOKEN` 具有创建 Release 的权限

## 版本管理建议

遵循语义化版本规范（Semantic Versioning）：

- **主版本号（Major）**：不兼容的 API 更改
- **次版本号（Minor）**：向后兼容的功能新增
- **修订号（Patch）**：向后兼容的问题修正

示例：
- `v1.0.0` - 首个正式版本
- `v1.0.1` - 修复 bug
- `v1.1.0` - 新增功能
- `v2.0.0` - 重大更新

## 相关资源

- [electron-builder 文档](https://www.electron.build/)
- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [GitHub Releases 文档](https://docs.github.com/en/repositories/releasing-projects-on-github)
