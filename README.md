基于 VSCODE 做的改造

## MAC 安装

mac 下使用 [Hyper](https://hyper.is/), 用 Terminal 好像是 VPN 不生效

`yarn install`

`sudo chmod a+x ./scripts/code.sh`

`yarn vscode-darwin` 生成 VS CODE MAC 模拟 APP

## windows 安装

开代理

`yarn install`

`yarn vscode-win32-x64` 生成 VS CODE win 模拟 APP

## 调试

要安装 debugger for Chrome 插件

`yarn watch`

开 vscode debug
