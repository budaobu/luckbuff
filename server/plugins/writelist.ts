import { readWritelist, resetStuckWritingItems, processWritelistBatch } from '~~/server/utils/insights/writelist'

// 写作队列调度器：随 Nitro 进程常驻（PM2），不依赖额外进程或系统 crontab。
// 每轮最多消化一批；常规轮间隔 41~107 分钟随机。服务重启不立即消费，
// 但有积压时 45~90 秒后先跑一批，避免部署后长时间空转。
const DELAY_MIN_MIN = 41
const DELAY_MAX_MIN = 107
const BATCH_SIZE = Math.max(1, Math.min(Number(process.env.WRITELIST_BATCH_SIZE) || 8, 20))
const STARTUP_BACKLOG_DELAY_MIN_MS = 45_000
const STARTUP_BACKLOG_DELAY_MAX_MS = 90_000

const g = globalThis as { __writelistSchedulerStarted?: boolean; __writelistTimer?: ReturnType<typeof setTimeout> }

export default defineNitroPlugin(() => {
  if (g.__writelistSchedulerStarted) return
  g.__writelistSchedulerStarted = true

  const recovered = resetStuckWritingItems()
  if (recovered) console.log(`[writelist] recovered ${recovered} interrupted item(s) back to pending`)

  const scheduleNext = (nextDelayMs?: number) => {
    let delayMs = nextDelayMs ?? Math.round((DELAY_MIN_MIN + Math.random() * (DELAY_MAX_MIN - DELAY_MIN_MIN)) * 60_000)
    console.log(`[writelist] next run in ${(delayMs / 60_000).toFixed(1)} min`)
    g.__writelistTimer = setTimeout(() => {
      void processWritelistBatch(BATCH_SIZE)
        .then((result) => {
          console.log(`[writelist] batch processed=${result.processedCount} failed=${result.failedCount}`)
          if (result.retryAfterMs !== undefined) {
            delayMs = result.retryAfterMs
            console.log(`[writelist] transient failure; retry in ${(delayMs / 60_000).toFixed(1)} min`)
          }
        })
        .catch(err => console.error('[writelist] tick error:', err))
        .finally(() => scheduleNext(delayMs))
    }, delayMs)
    g.__writelistTimer.unref?.()
  }

  const backlogCount = readWritelist().items.filter(item => item.status === 'pending').length
  if (backlogCount > 0) {
    const delayMs = Math.round(STARTUP_BACKLOG_DELAY_MIN_MS + Math.random() * (STARTUP_BACKLOG_DELAY_MAX_MS - STARTUP_BACKLOG_DELAY_MIN_MS))
    console.log(`[writelist] startup backlog=${backlogCount}; first batch in ${(delayMs / 1000).toFixed(1)} s`)
    scheduleNext(delayMs)
    return
  }

  scheduleNext()
})
