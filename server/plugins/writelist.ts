import { resetStuckWritingItems, processNextWritelistItem } from '~~/server/utils/insights/writelist'

// 写作队列调度器：随 Nitro 进程常驻（PM2），不依赖额外进程或系统 crontab。
// 每次执行完成后随机等待 41~107 分钟再触发下一次；进程启动时不立即消费，
// 只恢复被中断的 writing 项并排定首次执行。
const DELAY_MIN_MIN = 41
const DELAY_MAX_MIN = 107

const g = globalThis as { __writelistSchedulerStarted?: boolean; __writelistTimer?: ReturnType<typeof setTimeout> }

export default defineNitroPlugin(() => {
  if (g.__writelistSchedulerStarted) return
  g.__writelistSchedulerStarted = true

  const recovered = resetStuckWritingItems()
  if (recovered) console.log(`[writelist] recovered ${recovered} interrupted item(s) back to pending`)

  const scheduleNext = () => {
    const delayMin = DELAY_MIN_MIN + Math.random() * (DELAY_MAX_MIN - DELAY_MIN_MIN)
    console.log(`[writelist] next run in ${delayMin.toFixed(1)} min`)
    g.__writelistTimer = setTimeout(() => {
      void processNextWritelistItem()
        .catch(err => console.error('[writelist] tick error:', err))
        .finally(scheduleNext)
    }, Math.round(delayMin * 60_000))
    g.__writelistTimer.unref?.()
  }
  scheduleNext()
})
