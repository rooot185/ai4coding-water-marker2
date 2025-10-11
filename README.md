# WaterMarker - 图片水印工具

一个基于 Electron 构建的 Windows 桌面应用，用于为图片批量添加文字水印。支持实时预览、多种定位选项和自定义样式。

## 功能特性

- **图片导入**
  - 单张或多张图片导入
  - 批量导入整个文件夹
  - 拖拽导入支持
  - 支持格式：JPEG、PNG、BMP、TIFF

- **水印自定义**
  - 自定义水印文字
  - 可调节字体大小（10-200px）
  - 透明度控制（0-100%）
  - 颜色选择器
  - 9宫格定位系统（上/中/下 × 左/中/右）

- **实时预览**
  - 所见即所得的水印预览
  - 支持预览区域切换不同图片
  - 实时更新水印效果

- **批量导出**
  - 批量处理多张图片
  - 自定义文件名前缀/后缀
  - 保持原始图片质量
  - 导出进度显示

## 下载安装

前往 [Releases](https://github.com/rooot185/ai4coding-water-marker2/releases) 页面下载最新版本：

- **WaterMarker Setup.exe** - Windows 安装程序（推荐，支持 x64 和 ia32）
- **WaterMarker-win.zip** - 便携版（x64）
- **WaterMarker-ia32-win.zip** - 便携版（32位）

### 系统要求

- Windows 7 或更高版本
- 推荐 4GB 内存及以上

## 使用方法

### 1. 导入图片

有三种方式导入图片：

- **单张/多张导入**：点击"导入图片"按钮，选择一张或多张图片
- **文件夹导入**：点击"导入文件夹"按钮，程序会自动识别文件夹内的所有图片
- **拖拽导入**：直接将图片或文件夹拖拽到预览区域

### 2. 设置水印

在右侧控制面板中：

1. **水印文字**：输入想要添加的水印文字
2. **字体大小**：拖动滑块调整字体大小（10-200px）
3. **透明度**：拖动滑块调整透明度（0-100%）
4. **颜色**：点击颜色选择器选择水印颜色
5. **位置**：点击9宫格选择水印位置

所有更改会实时显示在预览区域。

### 3. 导出图片

1. 点击"导出图片"按钮
2. 在弹出的对话框中选择导出目录
3. （可选）设置文件名前缀或后缀
4. 点击确认开始导出
5. 等待导出完成，查看导出进度

## 开发

### 技术栈

- **Electron** - 桌面应用框架
- **Sharp** - 高性能图片处理库
- **HTML/CSS/JavaScript** - 前端界面

### 项目结构

```
ai4coding-water-marker2/
├── main.js              # 主进程
├── src/
│   ├── index.html       # 主界面
│   ├── renderer.js      # 渲染进程
│   ├── preload.js       # 预加载脚本
│   └── styles.css       # 样式文件
├── assets/              # 资源文件（图标等）
├── doc/                 # 文档
│   └── prd.md          # 产品需求文档
└── package.json         # 项目配置
```

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm start
```

### 构建应用

构建 Windows 版本：
```bash
npm run build
```

构建其他平台：
```bash
npm run build:mac    # macOS
npm run build:linux  # Linux
```

### 发布到 GitHub Release

```bash
npm run release
```

注意：发布前需要设置 `GH_TOKEN` 环境变量（GitHub Personal Access Token）。

## 架构说明

本应用采用 Electron 的多进程架构：

- **主进程（main.js）**：管理窗口创建、文件系统操作、原生对话框
- **预加载脚本（preload.js）**：通过 `contextBridge` 安全地暴露 API 给渲染进程
- **渲染进程（renderer.js）**：处理 UI 交互、状态管理、预览功能

进程间通信使用 IPC（Inter-Process Communication）：
- `invoke` 用于双向通信（请求-响应）
- `send` 用于单向通信
- `on` 用于监听事件

## 已知限制

当前版本（v1.0.1）仅实现了基础功能，以下特性尚未实现：

- 图片水印（仅支持文字水印）
- 水印模板保存/加载
- JPEG 质量调整
- 图片尺寸调整
- 拖拽方式重新定位水印
- 水印旋转

更多详细信息请查看 [产品需求文档](doc/prd.md)。

## 更新日志

### v1.0.1 (2025-10-11)
- 修复：解决安装版本中 "Cannot find module 'sharp'" 错误
- 改进：优化 sharp 原生模块的打包配置

### v1.0.0 (2025-10-11)
- 首次发布
- 基础功能：图片导入、文字水印、实时预览、批量导出

## 许可证

本项目仅供学习和研究使用。

## 作者

QYF

## 问题反馈

如果遇到问题或有功能建议，请在 [Issues](https://github.com/rooot185/ai4coding-water-marker2/issues) 页面提交。
