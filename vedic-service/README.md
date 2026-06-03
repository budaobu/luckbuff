# vedic-service

吠陀占星精算微服务。独立进程跑在 luckbuff 同一台 VPS 上，监听 `127.0.0.1:8765`。

## 为什么单独起服务

`pyswisseph` 是 Swiss Ephemeris 的官方 Python 绑定（误差 < 1 arcsecond），依赖 C 扩展，无法在 Node 进程里直接调用，也没有纯 JS 等价实现。独立 FastAPI 进程是最干净的隔离。

## 本地开发

```bash
cd vedic-service
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt

# 首次启动：触发星历文件下载（约 30 秒）
mkdir -p /opt/ephe   # 或 export VEDIC_EPHE_PATH=$PWD/.ephe
VEDIC_EPHE_PATH=/opt/ephe .venv/bin/python -c "import swisseph as swe; swe.set_ephe_path('/opt/ephe'); swe.calc_ut(swe.julday(2000,1,1,12), swe.SUN, swe.FLG_SIDEREAL)"

# 跑起来
.venv/bin/uvicorn main:app --host 127.0.0.1 --port 8765
```

健康检查：

```bash
curl http://127.0.0.1:8765/health
```

冒烟测试（北京 1990-01-01 12:00）：

```bash
curl -X POST http://127.0.0.1:8765/chart \
  -H 'Content-Type: application/json' \
  -d '{"year":1990,"month":1,"day":1,"hour":12,"minute":0,"lat":39.9042,"lng":116.4074}'
```

## 生产部署

PM2 配置参见仓库根目录的 `ecosystem.config.cjs`。首次部署：

```bash
# 在 VPS 上
sudo mkdir -p /opt/vedic-service /opt/ephe
sudo chown -R deploy:deploy /opt/vedic-service /opt/ephe

# rsync 由 scripts/deploy.sh 处理
cd /opt/vedic-service
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt

# 触发 .se1 星历文件下载（pyswisseph 自动从 ftp.astro.com 拉取）
.venv/bin/python -c "import swisseph as swe; swe.set_ephe_path('/opt/ephe'); swe.calc_ut(swe.julday(2000,1,1,12), swe.SUN, swe.FLG_SIDEREAL)"

pm2 startOrReload /var/www/luckbuff/ecosystem.config.cjs --only vedic-service --update-env
```

## 环境变量

| 变量 | 默认 | 说明 |
|------|------|------|
| `VEDIC_EPHE_PATH` | `/opt/ephe` | Swiss Ephemeris `.se1` 星历文件目录 |

## 接口

### `POST /chart`

请求：

```json
{
  "year": 1990, "month": 1, "day": 1,
  "hour": 12, "minute": 0,
  "lat": 39.9042, "lng": 116.4074,
  "time_uncertain": false
}
```

返回顶层字段：`ascendant`、`planets`、`houseStartSign`、`dasha`、`ayanamsha`、`julianDay`、`timezone`、`timeUncertain`、`validations`、`birthData`。

### `GET /health`

返回 `{"status":"ok"}`。
