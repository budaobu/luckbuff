<template>
  <article class="thread-cover" :style="coverStyle">
    <span class="binding" aria-hidden="true">
      <i v-for="stitch in 4" :key="stitch" />
    </span>
    <span class="frame" aria-hidden="true" />
    <span class="title-slip">
      <span class="title">{{ title }}</span>
    </span>
    <span class="dynasty">{{ dynasty || '古籍' }}</span>
    <span class="author">{{ shortAuthor }}</span>
    <span class="seal" aria-hidden="true">藏</span>
  </article>
</template>

<script setup lang="ts">
const props = defineProps<{
  title: string
  author: string
  dynasty: string
  category?: string
}>()

const shortAuthor = computed(() => {
  const clean = props.author.replace(/^(旧题|托名|传)/, '').trim()
  if (clean.length <= 7) return clean || '佚名'
  return `${clean.slice(0, 7)}…`
})

const palette = computed(() => {
  const palettes = [
    { base: '#182739', edge: '#46597a', sheen: '#31486b' },
    { base: '#151618', edge: '#494d56', sheen: '#2c3038' },
    { base: '#172730', edge: '#43606c', sheen: '#2b4650' },
    { base: '#1b2130', edge: '#4d5a79', sheen: '#333f5e' },
  ]
  let seed = props.category ? 0 : 17
  const source = props.category || props.title
  for (let index = 0; index < source.length; index += 1) {
    seed = ((seed * 31) + source.charCodeAt(index)) % 9973
  }
  return palettes[seed % palettes.length]!
})

const coverStyle = computed(() => ({
  '--cover-base': palette.value.base,
  '--cover-edge': palette.value.edge,
  '--cover-sheen': palette.value.sheen,
}))
</script>

<style scoped>
.thread-cover {
  position: relative;
  display: flex;
  width: 100%;
  aspect-ratio: 5 / 7;
  overflow: hidden;
  border: 1px solid var(--cover-edge);
  border-radius: 2px 4px 4px 2px;
  background:
    linear-gradient(118deg, transparent 16%, color-mix(in srgb, var(--cover-sheen) 34%, transparent) 34%, transparent 52%),
    radial-gradient(circle at 72% 8%, color-mix(in srgb, var(--cover-sheen) 44%, transparent), transparent 42%),
    linear-gradient(145deg, color-mix(in srgb, var(--cover-base) 88%, #fff), var(--cover-base));
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.08),
    inset -1px 0 0 rgba(255, 255, 255, 0.04),
    5px 10px 24px -16px rgba(0, 0, 0, 0.78);
}

.binding {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  display: flex;
  width: 14px;
  flex-direction: column;
  align-items: center;
  justify-content: space-evenly;
  border-left: 1px solid rgba(226, 202, 154, 0.28);
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.05));
}

.binding i {
  width: 5px;
  height: 5px;
  border: 1px solid rgba(226, 202, 154, 0.58);
  border-radius: 50%;
}

.frame {
  position: absolute;
  inset: 7px 20px 7px 6px;
  pointer-events: none;
  border: 1px solid rgba(226, 202, 154, 0.18);
  border-radius: 1px;
}

.title-slip {
  position: absolute;
  top: 14px;
  left: 11px;
  display: flex;
  max-height: calc(100% - 64px);
  padding: 14px 7px;
  overflow: hidden;
  border: 1px solid rgba(238, 212, 160, 0.76);
  border-radius: 1px;
  background:
    linear-gradient(180deg, rgba(154, 41, 31, 0.95), rgba(91, 22, 18, 0.96));
  box-shadow:
    inset 0 0 0 1px rgba(247, 234, 209, 0.08),
    2px 4px 12px -8px rgba(0, 0, 0, 0.9);
}

.title {
  overflow: hidden;
  color: #f7ead1;
  font-family: var(--serif-font);
  font-size: 17px;
  font-weight: 650;
  line-height: 1.16;
  writing-mode: vertical-rl;
  text-orientation: upright;
}

.dynasty {
  position: absolute;
  top: 15px;
  right: 23px;
  color: rgba(238, 220, 184, 0.52);
  font-size: 9px;
  line-height: 1;
  letter-spacing: 0.08em;
  white-space: nowrap;
}

.author {
  position: absolute;
  right: 23px;
  bottom: 15px;
  max-width: calc(100% - 52px);
  overflow: hidden;
  color: rgba(238, 220, 184, 0.58);
  font-size: 9px;
  line-height: 1.1;
  text-align: right;
  white-space: nowrap;
}

.seal {
  position: absolute;
  left: 12px;
  bottom: 13px;
  display: grid;
  width: 19px;
  height: 19px;
  place-items: center;
  border: 1px solid rgba(228, 120, 104, 0.78);
  border-radius: 1px;
  background: rgba(140, 34, 27, 0.82);
  color: #f7ead1;
  font-family: var(--serif-font);
  font-size: 10px;
  line-height: 1;
}
</style>
