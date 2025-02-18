# pnpm-monorepo-template

个人开发使用的 pnpm monorepo 模板，用于快速启动一个面向 npm 包的项目

## 开发指南

### 基础环境依赖

> 不想再做奇奇怪怪的向前兼容处理了，node22 起步

- node 22
- pnpm 10

### 项目初始化

1. 全局搜索 `@example` 字符串，替换成你喜欢的项目名称，这会作为全局的 npm scope 名称
2. 适当修改本 README 文件，以适配你的项目介绍
3. `pnpm install` 安装依赖，OK 了，请开始你的操作

### 常用命令

```shell
# 开发调试特定的包
# e.g. pnpm -F @example/shared dev
pnpm -F <package-name> dev

# 构建特定的包
# e.g. pnpm -F @example/shared build
pnpm -F <package-name> build

# 新增本地包
# e.g. pnpm add-package @example/shared
pnpm add-package <package-name>
```
