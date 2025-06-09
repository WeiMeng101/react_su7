# Tailwind + React + Vite 项目

这是一个使用 Vite 构建的 React 项目，已集成 Tailwind CSS。

## 技术栈

- React 18
- Vite
- Tailwind CSS 4
- PostCSS
- Autoprefixer

## 开始使用

### 安装依赖

```bash
yarn install
```

### 启动开发服务器

```bash
yarn dev
```

### 构建生产版本

```bash
yarn build
```

### 预览生产构建

```bash
yarn preview
```

## 项目结构

```
tailwind-react-app/
├── src/
│   ├── App.jsx          # 主应用组件
│   ├── main.jsx         # 应用入口
│   └── index.css        # Tailwind CSS 指令
├── public/              # 静态资源
├── index.html           # HTML 模板
├── tailwind.config.js   # Tailwind 配置
├── postcss.config.js    # PostCSS 配置
├── vite.config.js       # Vite 配置
└── package.json         # 项目依赖
```

## Tailwind CSS 使用

项目已配置好 Tailwind CSS，您可以直接在组件中使用 Tailwind 的实用类：

```jsx
<div className="bg-blue-500 text-white p-4 rounded-lg">
  Hello Tailwind!
</div>
```

## 自定义配置

- 修改 `tailwind.config.js` 来自定义 Tailwind 配置
- 修改 `vite.config.js` 来自定义 Vite 构建配置
