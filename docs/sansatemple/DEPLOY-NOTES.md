# 在线寺庙部署说明

本任务未修改部署脚本、PM2 或 Nginx。Nitro 内置 WebSocket 已通过 `nuxt.config.ts` 的 `nitro.experimental.websocket: true` 启用，路由是 `/sansatemple/ws`。

生产反代需要为该路径显式转发 Upgrade。示例仅交给 Joey 手动处理：

```nginx
location /sansatemple/ws {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_read_timeout 3600s;
    proxy_send_timeout 3600s;
}
```

私有环境变量（不带 `PUBLIC_` 前缀，可选）：

- `SANSATEMPLE_CHANNEL_COUNT`：频道数，默认 3，最大 100。
- `SANSATEMPLE_CAPACITY`：单频道容量，默认 50，最大 100。

服务端状态只存在进程内存，不落库、不记录 IP、不收集个人信息。重启会清空频道、化身、坐垫和香的状态。
