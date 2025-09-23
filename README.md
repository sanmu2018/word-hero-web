# Word Hero Web

## 项目简介

Word Hero Web 是基于 React 和 Ant Design 框架的雅思词汇学习前端应用。它提供了现代化的用户界面，支持词汇学习、搜索、统计等功能。

## 技术栈

- **前端框架**: React 18 + TypeScript
- **UI 组件库**: Ant Design 5.x
- **路由管理**: React Router
- **HTTP 客户端**: Axios
- **构建工具**: Create React App

## 功能特性

- 📚 词汇学习和分页浏览
- 🔍 实时搜索功能
- 🎵 单词发音（支持美式和英式发音）
- 👤 用户注册和登录
- 📊 学习统计
- 📱 响应式设计，支持移动端
- 🎨 现代化的 Ant Design 界面

## 开始使用

### 环境要求

- Node.js 16+
- npm 或 yarn

### 安装依赖

```bash
npm install
```

### 开发环境运行

```bash
npm start
```

应用将在 http://localhost:3000 启动。

### 构建生产版本

```bash
npm run build
```

### 运行测试

```bash
npm test
```

## 后端 API 配置

前端应用通过环境变量配置后端 API 地址：

- 开发环境：`.env` 文件中的 `REACT_APP_API_URL`
- 生产环境：根据实际部署的后端地址配置

默认配置为 `http://localhost:8080`，指向原 word-hero 后端服务。

## 项目结构

```
src/
├── components/          # 公共组件
├── pages/              # 页面组件
│   └── VocabularyPage.tsx  # 主要词汇学习页面
├── services/           # API 服务
│   ├── authService.ts      # 用户认证服务
│   └── vocabularyService.ts # 词汇相关服务
├── types/              # TypeScript 类型定义
│   └── index.ts
├── App.tsx             # 应用根组件
└── App.css             # 全局样式
```

## API 接口

### 词汇相关
- `GET /api/words` - 获取分页词汇列表
- `GET /api/search` - 搜索词汇
- `GET /api/stats` - 获取学习统计
- `POST /api/words/mark` - 标记单词认识状态
- `POST /api/words/reset` - 重置所有标记

### 用户认证
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/register` - 用户注册
- `GET /api/auth/profile` - 获取用户信息
- `PUT /api/auth/profile` - 更新用户信息
- `POST /api/auth/logout` - 用户登出

## 注意事项

1. 此前端项目依赖于原 word-hero 后端服务
2. 确保后端服务在 http://localhost:8080 运行
3. 前端应用通过代理配置访问后端 API
4. 用户数据存储在 localStorage 中，包括认证 token

## 浏览器支持

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 开发指南

### 添加新功能

1. 在 `src/types/index.ts` 中定义相关类型
2. 在 `src/services/` 中添加 API 服务方法
3. 在页面组件中实现业务逻辑
4. 使用 Ant Design 组件构建界面

### 样式规范

- 使用 Ant Design 的设计系统
- 自定义样式写在 `src/App.css` 中
- 遵循响应式设计原则

### 代码规范

- 使用 TypeScript 进行类型检查
- 遵循 React Hooks 使用规范
- 使用 ESLint 进行代码检查

## 许可证

MIT License