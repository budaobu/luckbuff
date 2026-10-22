<template>
  <section class="va3d" data-testid="vedic-astro-3d">
    <div ref="stageRoot" class="stage" aria-hidden="true" />
    <div class="vignette" />

    <div id="hud" class="hud">
      <h1>吠陀星象 · 宇宙排盘</h1>
      <div class="sub">{{ birthLine }}</div>
    </div>

    <div class="project-toolbar">
      <button type="button" data-testid="vedic-astro-back" @click="emit('back')">
        <UIcon name="i-lucide-arrow-left" />
        <span>返回</span>
      </button>
      <button type="button" data-testid="vedic-astro-recalculate" @click="emit('recalculate')">
        <UIcon name="i-lucide-rotate-ccw" />
        <span>重新排盘</span>
      </button>
      <AppShareButton
        tool="vedic"
        :summary="shareSummary"
        filename="vedic-astro-3d-poster.png"
      />
      <button
        id="openModalBtn"
        type="button"
        title="打开星盘详情 (快捷键 D)"
        @click="openModal('overview')"
      >
        <span class="icon">✦</span>
        <span>星盘详情</span>
      </button>
    </div>

    <div v-if="webglError" class="webgl-error">
      <strong>3D 渲染不可用</strong>
      <span>{{ webglError }}</span>
    </div>

    <Teleport to="body">
      <div id="astroModal" class="modal" :class="{ show: modalOpen }" :aria-hidden="!modalOpen">
        <div class="modal-backdrop" @click="closeModal" />
        <div class="modal-content" role="dialog" aria-modal="true">
          <header class="modal-header">
            <div class="modal-title">✦ 星盘详情 · {{ TAB_LABELS[activeTab] }}</div>
            <button class="modal-close" type="button" title="关闭 (Esc)" @click="closeModal">×</button>
          </header>
          <div class="modal-body">
            <nav class="modal-nav">
              <button
                v-for="tab in tabs"
                :key="tab"
                type="button"
                :class="{ active: activeTab === tab, dynamic: tab === 'detail', show: tab === 'detail' && hasDetail }"
                @click="switchTab(tab)"
              >
                {{ tab === 'detail' ? detailNavLabel || TAB_LABELS.detail : TAB_LABELS[tab] }}
              </button>
            </nav>
            <div class="modal-panels">
              <section v-show="activeTab === 'overview'" class="tab-panel active">
                <div class="section-heading">出生信息</div>
                <div class="row"><span class="k">出生地</span><span class="v">{{ result.birth.location.name }}</span></div>
                <div class="row"><span class="k">出生时间</span><span class="v">{{ birthTimeText }} ({{ timezoneText }})</span></div>
                <div class="row"><span class="k">坐标</span><span class="v">{{ coordinates }}</span></div>
                <div class="section-heading">关键盘位</div>
                <div class="row"><span class="k">上升 Lagna</span><span class="v">{{ signCn(astro.lagnaSign) }}座 · {{ result.ascendant.longitude.toFixed(2) }}°</span></div>
                <div class="row"><span class="k">上升星宿</span><span class="v">{{ ascendantNak }} · 第{{ result.ascendant.pada }}分度</span></div>
                <div class="row"><span class="k">月亮星座</span><span class="v">{{ signCn(moonPlanet?.sign ?? 0) }}座 · {{ moonPlanet?.degreeText }}</span></div>
                <div class="row"><span class="k">月亮星宿</span><span class="v">{{ moonPlanet?.nakshatraCn }} · 第{{ moonPlanet?.pada }}分度</span></div>
                <div class="row"><span class="k">映像上升 AL</span><span class="v">{{ signCn(astro.arudhaByHouse[1] ?? 0) }}座 <span class="tag gold">AL</span></span></div>
                <div class="section-heading">当前时运</div>
                <div class="row"><span class="k">Vimshottari</span><span class="v">{{ currentDashaText }}</span></div>
                <div class="row"><span class="k">过运土星</span><span class="v">{{ signCn(result.transits.saturn.sign - 1) }}座</span></div>
                <div class="row"><span class="k">过运标记</span><span class="v">{{ currentTransitText }}</span></div>
                <div class="section-heading">快速跳转</div>
                <div class="jump-row">
                  <button v-for="tab in quickTabs" :key="tab" class="tag gold jump" type="button" @click="switchTab(tab)">→ {{ TAB_LABELS[tab] }}</button>
                </div>
              </section>

              <section v-show="activeTab === 'lagna'" class="tab-panel active">
                <div class="section-heading">上升 Lagna · D1</div>
                <div class="row"><span class="k">上升星座</span><span class="v">{{ signCn(astro.lagnaSign) }}座 <span class="tag">{{ result.ascendant.signName }}</span></span></div>
                <div class="row"><span class="k">上升度数</span><span class="v">{{ result.ascendant.longitude.toFixed(2) }}°</span></div>
                <div class="row"><span class="k">上升星宿</span><span class="v">{{ ascendantNak }} · 第 {{ result.ascendant.pada }} 分度</span></div>
                <div class="row"><span class="k">上升主星</span><span class="v">{{ SIGN_LORDS[astro.lagnaSign] }}</span></div>
                <div class="row"><span class="k">映像上升 AL</span><span class="v">{{ signCn(astro.arudhaByHouse[1] ?? 0) }}座 <span class="tag gold">AL</span></span></div>
                <div class="section-heading">其他上升</div>
                <div class="row"><span class="k">D9 婚姻盘上升</span><span class="v">{{ signCn(astro.vargaMap.d9?.lagnaSign ?? 0) }}座</span></div>
                <div class="row"><span class="k">D10 事业盘上升</span><span class="v">{{ signCn(astro.vargaMap.d10?.lagnaSign ?? 0) }}座</span></div>
                <div class="row"><span class="k">特殊上升</span><span class="v small">命息上升 · 月露上升 · 时刻上升 · 刻分上升 · 宫位上升 · 种姓上升</span></div>
              </section>

              <section v-show="activeTab === 'planets'" class="tab-panel active">
                <div class="section-heading">D1 九曜位置 · 按宫位排序</div>
                <div v-for="planet in planetRows" :key="planet.name" class="row">
                  <span class="k"><b :style="{ color: planetHex(planet.name) }">{{ planet.cn }}</b> · {{ planet.name }}</span>
                  <span class="v">
                    {{ signCn(planet.sign) }}座 · 第{{ planet.house }}宫
                    <span class="tag">{{ planet.nakshatraCn }} · 第{{ planet.pada }}分度</span>
                    <span v-if="planet.dignityCn" class="tag violet">{{ planet.dignityCn }}</span>
                  </span>
                </div>
                <div class="section-heading">提示</div>
                <div class="empty-hint">在 3D 星盘上点击任意行星，可查看该行星的三层分盘与详细解读。</div>
              </section>

              <section v-show="activeTab === 'vargas'" class="tab-panel active">
                <div class="section-heading">全部分盘 · D1–D60</div>
                <div class="empty-hint left">点击任意分盘展开查看该分盘中的行星位置。分盘上升与 D1 不同，代表该领域的独立宫位系统。</div>
                <article
                  v-for="varga in result.vargas"
                  :key="varga.key"
                  class="dasha-maha"
                  :class="{ open: expandedVargas.has(varga.key) }"
                >
                  <button class="dasha-maha-header" type="button" @click="toggleVarga(varga.key)">
                    <span class="m-arrow">▶</span>
                    <span class="m-lord">{{ varga.label }}</span>
                    <span class="m-years">上升 {{ signCn(astro.vargaMap[varga.key]?.lagnaSign ?? 0) }}座</span>
                    <span class="m-range">{{ vargaSummary(varga.key) }}</span>
                  </button>
                  <div class="dasha-antars">
                    <div
                      v-for="planet in varga.planets"
                      :key="`${varga.key}-${planet.name}`"
                      class="row compact"
                    >
                      <span class="k"><b :style="{ color: planetHex(planet.name) }">{{ planetCn(planet.name) }}</b></span>
                      <span class="v">{{ signCn(planet.sign - 1) }}座 · 第{{ planet.house }}宫</span>
                    </div>
                  </div>
                </article>
              </section>

              <section v-show="activeTab === 'panchang'" class="tab-panel active">
                <div class="section-heading">出生时 Panchang · 五支</div>
                <div class="row"><span class="k">月相日 Tithi</span><span class="v">{{ panchangDisplay.tithi }}</span></div>
                <div class="row"><span class="k">星宿 Nakshatra</span><span class="v">{{ moonPlanet?.nakshatraCn }} / {{ result.panchang.nakshatraName }} · 第{{ moonPlanet?.pada }}分度</span></div>
                <div class="row"><span class="k">瑜伽 Yoga</span><span class="v">{{ panchangDisplay.yoga }} / {{ result.panchang.yogaName }}</span></div>
                <div class="row"><span class="k">半日 Karana</span><span class="v">{{ panchangDisplay.karana }} / {{ result.panchang.karana }}</span></div>
                <div class="row"><span class="k">星期 Vara</span><span class="v">{{ panchangDisplay.vara }} / {{ result.panchang.varaName }}</span></div>
                <div class="section-heading">补充</div>
                <div class="row"><span class="k">太阳黄经</span><span class="v">{{ sunPlanet?.degreeText }} · {{ signCn(sunPlanet?.sign ?? 0) }}座</span></div>
                <div class="row"><span class="k">月亮黄经</span><span class="v">{{ moonPlanet?.degreeText }} · {{ signCn(moonPlanet?.sign ?? 0) }}座</span></div>
                <div class="row"><span class="k">日月差</span><span class="v">{{ sunMoonDiff }}°</span></div>
              </section>

              <section v-show="activeTab === 'arudha'" class="tab-panel active">
                <div class="section-heading">十二映像宫 · Arudha Padas</div>
                <div v-for="(item, index) in result.arudhaPadas" :key="item.key" class="row">
                  <span class="k">{{ item.key }} · {{ arudhaNames[index] }}</span>
                  <span class="v">
                    {{ signCn(item.sign - 1) }}座
                    <span v-if="item.key === 'A1'" class="tag gold">AL</span>
                    <span v-if="item.key === 'A7'" class="tag">UL</span>
                  </span>
                </div>
                <div class="section-heading">特殊上升</div>
                <div class="jump-row">
                  <span v-for="item in result.specialLagnas" :key="item.key" class="tag violet">{{ SPECIAL_LAGNA_CN[item.key] || item.key }}</span>
                </div>
              </section>

              <section v-show="activeTab === 'ashtaka'" class="tab-panel active">
                <div class="section-heading">太阳单星八分点 BAV</div>
                <div v-if="!sunBavBySign.length" class="empty-hint">暂无数据</div>
                <div v-for="(value, index) in sunBavBySign" :key="index" class="row"><span class="k">{{ signCn(index) }}座</span><span class="v">{{ value }} 点</span></div>
                <div class="section-heading">总和八分点 SAV · 逐宫</div>
                <div v-for="(value, index) in astro.savByHouse" :key="index" class="row"><span class="k">第{{ index + 1 }}宫 · {{ signCn(signOfHouse(astro, index + 1)) }}座</span><span class="v">{{ value }} 点</span></div>
                <div class="section-heading">说明</div>
                <div class="empty-hint left">Ashtakavarga 评估每个宫位的能量支持度。SAV 越高，该宫位越容易顺遂、被支持。</div>
              </section>

              <section v-show="activeTab === 'transit'" class="tab-panel active">
                <div class="section-heading">当前时刻过运</div>
                <div class="row"><span class="k">本命月亮</span><span class="v">{{ signCn(moonPlanet?.sign ?? 0) }}座</span></div>
                <div class="row"><span class="k">过运土星</span><span class="v">{{ signCn(result.transits.saturn.sign - 1) }}座</span></div>
                <div class="row"><span class="k">过运月亮</span><span class="v">{{ signCn(result.transits.moon.sign - 1) }}座</span></div>
                <div class="section-heading">萨德萨提 Sade Sati</div>
                <div class="row"><span class="k">状态</span><span class="v"><span v-if="result.transits.sadeSati.status" class="tag gold">{{ sadeSatiLabel }}</span><template v-else>—</template></span></div>
                <div class="section-heading">达亚 Dhaiya</div>
                <div class="row"><span class="k">状态</span><span class="v"><span v-if="result.transits.dhaiya.status" class="tag gold">{{ dhaiyaLabel }}</span><template v-else>无</template></span></div>
                <div class="section-heading">月八宫 Chandrashtama</div>
                <div class="row"><span class="k">状态</span><span class="v"><span v-if="result.transits.chandrashtama.isActive" class="tag violet">月八宫激活</span><template v-else>无</template></span></div>
              </section>

              <section v-show="activeTab === 'drishti'" class="tab-panel active">
                <div class="section-heading">Graha Drishti · 全相位</div>
                <div v-for="row in drishtiRows" :key="row.planet" class="row">
                  <span class="k"><b :style="{ color: planetHex(row.planet) }">{{ planetCn(row.planet) }}</b></span>
                  <span class="v small">→ {{ row.text }}</span>
                </div>
                <div class="section-heading">规则</div>
                <div class="empty-hint left">所有行星对第 7 宫投射全相位；火星额外对第 4、8 宫；木星额外对第 5、9 宫；土星额外对第 3、10 宫。</div>
              </section>

              <section v-show="activeTab === 'dasha'" class="tab-panel active">
                <div class="section-heading">Vimshottari 大运 · 120 年周期</div>
                <div class="dasha-timeline">
                  <button
                    v-for="(maha, index) in astro.dasha.periods"
                    :key="`${maha.planet}-${maha.start.toISOString()}`"
                    class="seg"
                    :class="{ active: astro.dasha.currentMaha?.planet === maha.planet }"
                    :style="{ flex: String(maha.years), background: `linear-gradient(90deg,${dashaColor(maha.planet)}aa,${dashaColor(maha.planet)}55)` }"
                    :title="`${maha.cn}大运 ${maha.years}年 · ${fmtDate(maha.start)} – ${fmtDate(maha.end)}`"
                    @click="scrollToMaha(index)"
                  >
                    <span class="lbl">{{ maha.cn }}</span>
                  </button>
                </div>
                <div class="legend">
                  <span>● 大运 Mahadasha</span><span>● 中运 Antardasha（点击大运展开）</span><span>● 小运 Pratyantardasha（点击中运展开）</span>
                </div>
                <article
                  v-for="(maha, index) in astro.dasha.periods"
                  :key="`row-${maha.planet}-${maha.start.toISOString()}`"
                  class="dasha-maha"
                  :class="{ active: astro.dasha.currentMaha?.planet === maha.planet, open: expandedMahas.has(index) || astro.dasha.currentMaha?.planet === maha.planet }"
                >
                  <button class="dasha-maha-header" type="button" @click="toggleMaha(index)">
                    <span class="m-arrow">▶</span>
                    <span class="m-lord" :style="{ color: planetHex(maha.planet) }">{{ maha.cn }}大运</span>
                    <span class="m-years">{{ maha.years.toFixed(2) }} 年</span>
                    <span v-if="astro.dasha.currentMaha?.planet === maha.planet" class="m-badge">当前</span>
                    <span class="m-range">{{ fmtDateShort(maha.start) }} – {{ fmtDateShort(maha.end) }}</span>
                  </button>
                  <div class="dasha-antars">
                    <div class="dasha-theme">
                      主星在 {{ signCn(astro.planetMap[maha.planet]?.sign ?? 0) }}座 · 第{{ astro.planetMap[maha.planet]?.house }}宫 · 主题：{{ DASHA_THEMES[maha.planet] || '—' }}
                    </div>
                    <div
                      v-for="antar in maha.pratys || []"
                      :key="`${maha.planet}-${antar.planet}-${antar.start.toISOString()}`"
                      class="dasha-antar"
                      :class="{ active: astro.dasha.currentAntar === antar, open: expandedAntars.has(`${index}-${antar.planet}-${antar.start.toISOString()}`) || astro.dasha.currentAntar === antar }"
                    >
                      <button class="dasha-antar-header" type="button" @click.stop="toggleAntar(index, antar)">
                        <span class="a-arrow">▶</span>
                        <span class="a-lord">{{ maha.cn }} – {{ antar.cn }}</span>
                        <span class="a-years">{{ antar.years.toFixed(2) }}年</span>
                        <span v-if="astro.dasha.currentAntar === antar" class="a-badge">当前</span>
                        <span class="a-range">{{ fmtDateShort(antar.start) }} – {{ fmtDateShort(antar.end) }}</span>
                      </button>
                      <div class="dasha-pratys">
                        <div
                          v-for="praty in antar.pratys || []"
                          :key="`${antar.planet}-${praty.planet}-${praty.start.toISOString()}`"
                          class="dasha-praty"
                          :class="{ active: astro.dasha.currentPraty === praty }"
                        >
                          <span>{{ maha.cn }}-{{ antar.cn }}-{{ praty.cn }}</span>
                          <span>{{ fmtDateShort(praty.start) }} – {{ fmtDateShort(praty.end) }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              </section>

              <section v-show="activeTab === 'detail'" class="tab-panel active">
                <template v-if="detailKind === 'planet' && selectedPlanet">
                  <div class="dp-title-row">
                    <span class="dp-planet-name" :style="{ color: planetHex(selectedPlanet.name) }">{{ selectedPlanet.cn }}</span>
                    <span class="dp-planet-en">{{ selectedPlanet.name }}</span>
                    <span v-if="isPlanetInCurrentDasha(selectedPlanet.name)" class="tag gold">大运运行中</span>
                  </div>
                  <div class="section-heading">D1 本命盘</div>
                  <div class="row"><span class="k">星座</span><span class="v">{{ signCn(selectedPlanet.sign) }}座 · {{ selectedPlanet.degreeText }}</span></div>
                  <div class="row"><span class="k">宫位</span><span class="v">第 {{ selectedPlanet.house }} 宫</span></div>
                  <div class="row"><span class="k">星宿</span><span class="v">{{ selectedPlanet.nakshatraCn }} / {{ selectedPlanet.nakshatra }} · 第 {{ selectedPlanet.pada }} 分度</span></div>
                  <div class="row"><span class="k">星座主星</span><span class="v">{{ SIGN_LORDS[selectedPlanet.sign] }}</span></div>
                  <div v-if="selectedPlanet.dignityCn" class="row"><span class="k">庙旺状态</span><span class="v"><span class="tag violet">{{ selectedPlanet.dignityCn }}</span></span></div>
                  <div class="row"><span class="k">相位投射</span><span class="v small">→ {{ planetAspects(selectedPlanet.name) || '—' }}</span></div>
                  <div class="dp-section"><div class="dp-section-title">D9 婚姻盘视角</div>
                    <div class="row"><span class="k">位置</span><span class="v">{{ vargaPositionText('d9', selectedPlanet.name) }}</span></div>
                    <div class="row"><span class="k">婚姻含义</span><span class="v small">{{ D9_THEMES[selectedPlanet.name] || '现代星体无传统九曜主题' }}</span></div>
                  </div>
                  <div class="dp-section"><div class="dp-section-title">D10 事业盘视角</div>
                    <div class="row"><span class="k">位置</span><span class="v">{{ vargaPositionText('d10', selectedPlanet.name) }}</span></div>
                    <div class="row"><span class="k">事业含义</span><span class="v small">{{ D10_THEMES[selectedPlanet.name] || '现代星体无传统九曜主题' }}</span></div>
                  </div>
                </template>

                <template v-else-if="detailKind === 'house'">
                  <div class="dp-title-row">
                    <span class="dp-planet-name">{{ signCn(selectedSign) }}座</span>
                    <span class="dp-planet-en">{{ SIGN_EN[selectedSign] }}</span>
                    <span v-if="selectedSign === astro.lagnaSign" class="tag gold">上升</span>
                  </div>
                  <div class="section-heading">D1 本命盘</div>
                  <div class="row"><span class="k">宫位</span><span class="v">第 {{ selectedHouse }} 宫</span></div>
                  <div class="row"><span class="k">宫主星</span><span class="v">{{ SIGN_LORDS[selectedSign] }}（在 {{ houseLordText }}）</span></div>
                  <div class="row"><span class="k">宫内行星</span><span class="v">{{ signPlanetNames(selectedSign) || '空宫' }}</span></div>
                  <div class="row"><span class="k">映像宫 A{{ selectedHouse }}</span><span class="v">{{ signCn(astro.arudhaByHouse[selectedHouse] ?? 0) }}座</span></div>
                  <div class="row"><span class="k">八分点 SAV</span><span class="v">{{ astro.savByHouse[selectedHouse - 1] }} 点</span></div>
                  <div class="row"><span class="k">受相位</span><span class="v small">{{ aspectsToHouse(selectedHouse) || '无' }}</span></div>
                  <div class="dp-section"><div class="dp-section-title">D9 婚姻盘视角</div>
                    <div class="row"><span class="k">D9 宫位</span><span class="v">第 {{ vargaHouseBySign('d9', selectedSign) }} 宫 <span v-if="vargaHouseBySign('d9', selectedSign) === 7" class="tag gold">婚姻核心</span></span></div>
                    <div class="row"><span class="k">D9 宫内行星</span><span class="v">{{ vargaPlanetsInSign('d9', selectedSign) || '空宫' }}</span></div>
                  </div>
                  <div class="dp-section"><div class="dp-section-title">D10 事业盘视角</div>
                    <div class="row"><span class="k">D10 宫位</span><span class="v">第 {{ vargaHouseBySign('d10', selectedSign) }} 宫 <span v-if="vargaHouseBySign('d10', selectedSign) === 10" class="tag gold">事业核心</span></span></div>
                    <div class="row"><span class="k">D10 宫内行星</span><span class="v">{{ vargaPlanetsInSign('d10', selectedSign) || '空宫' }}</span></div>
                  </div>
                </template>
              </section>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <div id="dashaBar" class="dasha-bar" :class="{ show: showDashaBar }">
      <div class="dasha-track">
        <button
          v-for="(maha, index) in astro.dasha.periods"
          :key="`bar-${maha.planet}-${maha.start.toISOString()}`"
          type="button"
          class="dasha-seg"
          :class="{ active: astro.dasha.currentMaha?.planet === maha.planet }"
          :style="{ flex: String(maha.years), background: `linear-gradient(90deg,${dashaColor(maha.planet)}aa,${dashaColor(maha.planet)}55)` }"
          :title="`${maha.cn}大运 ${maha.years}年 · ${fmtDate(maha.start)} – ${fmtDate(maha.end)}（点击查看详情）`"
          @click="openDashaDetail(index)"
        >
          <span class="lbl">{{ maha.cn }}</span>
        </button>
      </div>
      <div class="dasha-info">
        <span>{{ dashaLeft }}</span>
        <span>当前 {{ fmtDateShort(new Date(result.transits.asAt)) }}</span>
      </div>
    </div>

    <div class="controls">
      <button
        v-for="mode in ['d1', 'd9', 'd10'] as const"
        :key="mode"
        type="button"
        :class="{ on: currentMode === mode }"
        @click="switchMode(mode)"
      >
        {{ MODE_NAMES[mode] }}
      </button>
      <button type="button" :class="{ on: showDashaBar }" @click="showDashaBar = !showDashaBar">大运时间轴</button>
      <button type="button" @click="mount?.resetView()">重置视角</button>
    </div>

    <div id="loading" class="loading" :class="{ hidden: loadingHidden }">
      <div class="ring" />
      <p>正在计算星历……</p>
    </div>
    <div
      v-if="tooltip"
      class="tooltip"
      :style="{ left: `${tooltip.x + 14}px`, top: `${tooltip.y - 10}px` }"
      v-html="tooltip.text"
    />
  </section>
</template>

<script setup lang="ts">
import type { VedicPaipanResult } from '~/types/vedic-paipan'
import type { VedicAstro3DMount } from '~/utils/vedic-astro-3d/renderer'
import {
  D10_THEMES,
  D9_THEMES,
  DASHA_ORDER,
  DASHA_THEMES,
  MODE_NAMES,
  PLANET_COLORS,
  SIGN_EN,
  SIGN_LORDS,
  SIGN_LORDS_EN,
  SPECIAL_LAGNA_CN,
  TAB_LABELS,
  buildVedicAstroModel,
  fmtDate,
  fmtDateShort,
  nakshatraFromLongitude,
  signOfHouse,
  type VedicAstroDetailKind,
  type VedicAstroMode,
  type VedicAstroTab,
} from '~/utils/vedic-astro-3d/model'
import {
  KARANA_CN,
  TITHI_CN,
  VARA_CN,
  YOGA_CN,
} from '~/utils/vedic-astro-3d/constants'

const props = defineProps<{ result: VedicPaipanResult }>()
const emit = defineEmits<{ back: [], recalculate: [] }>()

const stageRoot = ref<HTMLElement | null>(null)
const mount = shallowRef<VedicAstro3DMount | null>(null)
const loadingHidden = ref(false)
const webglError = ref('')
const modalOpen = ref(false)
const activeTab = ref<VedicAstroTab>('overview')
const currentMode = ref<VedicAstroMode>('d1')
const showDashaBar = ref(false)
const tooltip = ref<{ text: string, x: number, y: number } | null>(null)
const detailKind = ref<VedicAstroDetailKind>('planet')
const detailKey = ref<string | number | null>(null)
const hasDetail = ref(false)
const expandedVargas = reactive(new Set<string>())
const expandedMahas = reactive(new Set<number>())
const expandedAntars = reactive(new Set<string>())

const astro = buildVedicAstroModel(props.result)
const tabs = Object.keys(TAB_LABELS) as VedicAstroTab[]
const quickTabs = ['lagna', 'planets', 'vargas', 'dasha', 'transit'] as const
const moonPlanet = computed(() => astro.planetMap.Moon)
const sunPlanet = computed(() => astro.planetMap.Sun)
const ascendantNak = computed(() => nakshatraFromLongitude(props.result.ascendant.longitude))
const selectedPlanet = computed(() => hasDetail.value && detailKind.value === 'planet' ? astro.planetMap[String(detailKey.value)] : undefined)
const selectedSign = computed(() => hasDetail.value && detailKind.value === 'house' ? Number(detailKey.value) : astro.lagnaSign)
const selectedHouse = computed(() => props.result.houses[selectedSign.value]?.number || selectedSign.value + 1)
const detailNavLabel = computed(() => detailKind.value === 'planet'
  ? `行星详情 · ${selectedPlanet.value?.cn}`
  : `宫位详情 · ${SIGN_EN[selectedSign.value]}`)

const birthLine = computed(() => `${props.result.birth.location.name} · ${fmtDate(astro.birthDate)} ${birthClock.value}`)
const birthClock = computed(() => astro.birthDate.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }))
const birthTimeText = computed(() => `${fmtDate(astro.birthDate)} ${birthClock.value}`)
const timezoneText = computed(() => {
  const offset = props.result.birth.location.utcOffsetMinutes
  const sign = offset >= 0 ? '+' : '-'
  return `UTC${sign}${String(Math.floor(Math.abs(offset) / 60)).padStart(2, '0')}:${String(Math.abs(offset) % 60).padStart(2, '0')}`
})
const coordinates = computed(() => `${Math.abs(props.result.birth.location.latitude).toFixed(2)}°${props.result.birth.location.latitude >= 0 ? 'N' : 'S'}, ${Math.abs(props.result.birth.location.longitude).toFixed(2)}°${props.result.birth.location.longitude >= 0 ? 'E' : 'W'}`)
const currentDashaText = computed(() => astro.dasha.currentMaha
  ? `大运 ${astro.dasha.currentMaha.cn} / 中运 ${astro.dasha.currentAntar?.cn ?? '—'} / 小运 ${astro.dasha.currentPraty?.cn ?? '—'}`
  : '—')
const currentTransitText = computed(() => {
  if (props.result.transits.sadeSati.status) return sadeSatiLabel.value
  if (props.result.transits.chandrashtama.isActive) return `月八宫 · 过${props.result.transits.chandrashtama.signName}`
  return '无特殊过运'
})
const dashaLeft = computed(() => astro.dasha.currentMaha
  ? `大运：${astro.dasha.currentMaha.cn}　中运：${astro.dasha.currentAntar?.cn ?? '—'}　小运：${astro.dasha.currentPraty?.cn ?? '—'}`
  : '当前不在大运序列内')
const shareSummary = computed(() => `${props.result.ascendant.signName} · ${currentDashaText.value}`)
const sadeSatiLabel = computed(() => {
  const phase = props.result.transits.sadeSati.phase
  return phase === 1 ? '萨德萨提 · 上升段'
    : phase === 2 ? '萨德萨提 · 峰值段'
      : phase === 3 ? '萨德萨提 · 消退段'
        : props.result.transits.sadeSati.phaseName
})
const dhaiyaLabel = computed(() => String(props.result.transits.dhaiya.type || '').includes('8')
  ? '阿湿塔玛达亚（第8宫）'
  : '坎塔卡达亚（第4宫）')
const panchangDisplay = computed(() => computePanchangDisplay(
  sunPlanet.value?.longitude || 0,
  moonPlanet.value?.longitude || 0,
  astro.birthDate,
))

const planetRows = computed(() => Object.values(astro.planetMap))
const sunBavBySign = computed(() => {
  const sun = props.result.ashtakavarga.bav.Sun
  if (!sun) return []
  return Array.from({ length: 12 }, (_, signIndex) => {
    const house = props.result.houses.find(item => item.sign === signIndex + 1)
    return house ? (sun.byHouse[house.number - 1] || 0) : 0
  })
})
const drishtiRows = computed(() => {
  const summary: Record<string, string[]> = {}
  for (const item of astro.drishti) {
    ;(summary[item.from] ||= []).push(`${signCn(item.toSign)}座${item.strength === 1 ? '' : ` <span class="tag">${Math.round(item.strength * 100)}%</span>`}`)
  }
  return Object.entries(summary).map(([planet, targets]) => ({ planet, text: targets.join('、') }))
})
const sunMoonDiff = computed(() => {
  const value = (((((moonPlanet.value?.longitude || 0) - (sunPlanet.value?.longitude || 0)) % 360) + 360) % 360)
  return value.toFixed(2)
})
const arudhaNames = [
  '映像上升', '财富映像', '兄弟映像', '家宅映像', '子女映像', '敌人映像',
  '配偶映像', '变化映像', '福德映像', '事业映像', '收获映像', '损失映像',
]
const houseLordText = computed(() => {
  const lord = SIGN_LORDS_EN[selectedSign.value] || ''
  const position = astro.planetMap[lord]
  return position ? `${signCn(position.sign)}座` : '—'
})

function signCn(index: number) {
  const normalized = ((Number(index) % 12) + 12) % 12
  return ['白羊', '金牛', '双子', '巨蟹', '狮子', '处女', '天秤', '天蝎', '射手', '摩羯', '水瓶', '双鱼'][normalized] || ''
}

function planetCn(name: string) {
  return astro.planetMap[name]?.cn || name
}

function planetHex(name: string) {
  const value = PLANET_COLORS[name] || 0xffffff
  return `#${value.toString(16).padStart(6, '0')}`
}

function dashaColor(name: string) {
  return DASHA_ORDER.find(item => item.lord === name)?.color || '#e8b860'
}

function varga(key: string) {
  return props.result.vargas.find(item => item.key === key)
}

function vargaSummary(key: string) {
  const item = astro.vargaMap[key]
  if (!item) return '—'
  const planets = Object.entries(item.planetSigns)
    .filter(([, sign]) => sign === item.lagnaSign)
    .map(([name]) => planetCn(name))
  return planets.length ? `宫内：${planets.join('、')}` : '上升宫空'
}

function vargaPositionText(key: 'd9' | 'd10', planet: string) {
  const item = astro.vargaMap[key]
  const sign = item?.planetSigns[planet]
  if (!item || sign === undefined) return '—'
  const house = ((sign - item.lagnaSign) % 12 + 12) % 12 + 1
  return `${signCn(sign)}座 · 第${house}宫`
}

function vargaHouseBySign(key: 'd9' | 'd10', sign: number) {
  const item = astro.vargaMap[key]
  if (!item) return 1
  return ((sign - item.lagnaSign) % 12 + 12) % 12 + 1
}

function vargaPlanetsInSign(key: 'd9' | 'd10', sign: number) {
  const item = astro.vargaMap[key]
  if (!item) return ''
  return Object.entries(item.planetSigns)
    .filter(([, value]) => value === sign)
    .map(([name]) => planetCn(name))
    .join('、')
}

function signPlanetNames(sign: number) {
  return (astro.planetsBySign[sign] || []).map(item => item.cn).join('、')
}

function computePanchangDisplay(sunLongitude: number, moonLongitude: number, date: Date) {
  const diff = norm360(moonLongitude - sunLongitude)
  const tithiIndex = Math.floor(diff / 12)
  const tithi = tithiIndex < 15
    ? (tithiIndex === 14 ? '白月 · 满月' : `白月 · ${TITHI_CN[tithiIndex]}`)
    : tithiIndex === 29 ? '黑月 · 新月'
      : `黑月 · ${TITHI_CN[tithiIndex - 15]}`
  const yogaIndex = Math.floor(norm360(sunLongitude + moonLongitude) / 13.333333333333334)
  const karanaIndex = Math.floor(diff / 6)
  const karana = karanaIndex === 0 ? KARANA_CN[0]!
    : karanaIndex === 57 ? KARANA_CN[8]!
      : karanaIndex === 58 ? KARANA_CN[9]!
        : karanaIndex === 59 ? KARANA_CN[10]!
          : KARANA_CN[((karanaIndex - 1) % 7) + 1]!
  return {
    tithi,
    yoga: YOGA_CN[yogaIndex % 27] || '',
    karana,
    vara: VARA_CN[date.getDay()] || '',
  }
}

function norm360(value: number) {
  return ((value % 360) + 360) % 360
}

function planetAspects(planet: string) {
  return astro.drishti
    .filter(item => item.from === planet)
    .map(item => `${signCn(item.toSign)}座`)
    .join('、')
}

function aspectsToHouse(house: number) {
  return astro.drishti
    .filter(item => props.result.houses[item.toSign]?.house === house)
    .map(item => planetCn(item.from))
    .join('、')
}

function isPlanetInCurrentDasha(planet: string) {
  return [astro.dasha.currentMaha?.planet, astro.dasha.currentAntar?.planet, astro.dasha.currentPraty?.planet]
    .includes(planet)
}

function toggleVarga(key: string) {
  if (expandedVargas.has(key)) expandedVargas.delete(key)
  else expandedVargas.add(key)
}

function toggleMaha(index: number) {
  if (expandedMahas.has(index)) expandedMahas.delete(index)
  else expandedMahas.add(index)
}

function toggleAntar(index: number, antar: { planet: string, start: Date }) {
  const key = `${index}-${antar.planet}-${antar.start.toISOString()}`
  if (expandedAntars.has(key)) expandedAntars.delete(key)
  else expandedAntars.add(key)
}

function switchTab(tab: VedicAstroTab) {
  activeTab.value = tab
  modalOpen.value = true
  nextTick(() => {
    document.querySelector('.modal-panels')?.scrollTo({ top: 0 })
  })
}

function openModal(tab: VedicAstroTab = 'overview') {
  modalOpen.value = true
  void switchTab(tab)
}

function closeModal() {
  modalOpen.value = false
}

function switchMode(mode: VedicAstroMode) {
  currentMode.value = mode
  mount.value?.switchMode(mode)
}

function scrollToMaha(index: number) {
  expandedMahas.add(index)
  nextTick(() => {
    document.querySelector(`.modal-panels .dasha-maha:nth-of-type(${index + 1})`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

function openDashaDetail(index: number) {
  switchTab('dasha')
  setTimeout(() => scrollToMaha(index), 100)
}

async function setupRenderer() {
  if (!stageRoot.value) return
  const { mountVedicAstro3D } = await import('~/utils/vedic-astro-3d/renderer')
  mount.value = await mountVedicAstro3D(stageRoot.value, astro, {
    onSelect: ({ kind, key }) => {
      detailKind.value = kind
      detailKey.value = key
      hasDetail.value = true
      switchTab('detail')
    },
    onHover: (payload) => {
      if (payload && !modalOpen.value) tooltip.value = payload
      else tooltip.value = null
    },
    onReady: () => {
      loadingHidden.value = true
    },
    onError: (message) => {
      webglError.value = message
      loadingHidden.value = true
    },
  })
}

function handleKeydown(event: KeyboardEvent) {
  if (['INPUT', 'TEXTAREA'].includes((event.target as HTMLElement)?.tagName || '')) return
  if (event.key === 'Escape' && modalOpen.value) closeModal()
  if (event.key === 'd' || event.key === 'D') {
    if (modalOpen.value) closeModal()
    else openModal('overview')
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
  void setupRenderer()
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
  mount.value?.dispose()
  mount.value = null
})
</script>

<style scoped>
.va3d { position: fixed; inset: 0; z-index: 1100; overflow: hidden; background: #03040a; color: #e8e6df; font-family: 'Inter','PingFang SC','Microsoft YaHei','Noto Sans SC',system-ui,sans-serif; }
.stage, .stage :deep(canvas) { position: absolute; inset: 0; display: block; width: 100%; height: 100%; }
.vignette { position: absolute; inset: 0; pointer-events: none; background: radial-gradient(ellipse at 50% 45%, transparent 30%, rgba(3,4,10,.78) 100%); }
.hud { position: absolute; top: 20px; left: 24px; z-index: 10; pointer-events: none; display: flex; flex-direction: column; gap: 6px; }
.hud h1 { margin: 0; font-size: 15px; font-weight: 600; letter-spacing: .18em; color: #e8b860; }
.hud .sub { font-size: 11px; color: #8a8fa8; letter-spacing: .08em; }
.project-toolbar { position: absolute; top: 20px; right: 20px; z-index: 20; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; justify-content: flex-end; max-width: min(760px, calc(100vw - 180px)); }
.project-toolbar :deep(.u-button) { height: 34px; border-radius: 999px; background: rgba(8,12,24,.94); border: 1px solid rgba(232,184,96,.28); color: #e8b860; font-size: 12px; letter-spacing: .06em; backdrop-filter: blur(18px); }
.project-toolbar :deep(.u-button:hover) { border-color: #e8b860; color: #e8e6df; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(232,184,96,.25); }
.project-toolbar > button, #openModalBtn { display: inline-flex; align-items: center; gap: 7px; min-height: 34px; background: rgba(8,12,24,.94); border: 1px solid rgba(232,184,96,.28); color: #e8b860; font-family: inherit; font-size: 12px; padding: 7px 14px; border-radius: 999px; cursor: pointer; backdrop-filter: blur(18px); letter-spacing: .06em; transition: all .25s; }
.project-toolbar > button:hover, #openModalBtn:hover { border-color: #e8b860; color: #e8e6df; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(232,184,96,.25); }
.project-toolbar svg { width: 14px; height: 14px; }
.webgl-error { position: absolute; top: 72px; right: 20px; z-index: 25; display: grid; gap: 4px; max-width: 300px; padding: 12px 14px; border: 1px solid rgba(232,184,96,.32); border-radius: 12px; background: rgba(8,12,24,.94); backdrop-filter: blur(18px); }
.webgl-error strong { color: #e8b860; font-size: 13px; }
.webgl-error span { color: #8a8fa8; font-size: 11px; line-height: 1.5; }
.controls { position: absolute; bottom: 24px; left: 50%; transform: translateX(-50%); z-index: 10; display: flex; gap: 8px; align-items: center; background: rgba(8,12,24,.94); border: 1px solid rgba(232,184,96,.28); border-radius: 999px; padding: 8px 12px; backdrop-filter: blur(18px); flex-wrap: wrap; justify-content: center; max-width: min(96vw, 780px); }
.controls button { background: none; border: 1px solid rgba(255,255,255,.1); color: #8a8fa8; font-size: 11px; padding: 6px 12px; border-radius: 999px; cursor: pointer; transition: .2s; letter-spacing: .04em; font-family: inherit; }
.controls button:hover { color: #e8e6df; border-color: #e8b860; }
.controls button.on { color: #03040a; background: #e8b860; border-color: #e8b860; font-weight: 600; }
.dasha-bar { position: absolute; bottom: 82px; left: 50%; transform: translateX(-50%); z-index: 11; width: min(660px,86vw); display: none; }
.dasha-bar.show { display: block; }
.dasha-track { display: flex; height: 12px; border-radius: 999px; overflow: hidden; background: rgba(255,255,255,.06); margin-bottom: 8px; }
.dasha-seg { height: 100%; transition: flex .3s, box-shadow .3s; position: relative; cursor: pointer; border: 0; padding: 0; }
.dasha-seg .lbl { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: 700; color: #03040a; opacity: 0; transition: opacity .2s; white-space: nowrap; }
.dasha-seg:hover .lbl { opacity: 1; }
.dasha-seg.active { box-shadow: 0 0 14px rgba(232,184,96,.9), inset 0 0 8px rgba(255,255,255,.55); }
.dasha-info { display: flex; justify-content: space-between; font-size: 10px; color: #8a8fa8; padding: 0 4px; gap: 12px; }
.loading { position: absolute; inset: 0; z-index: 1000; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #03040a; gap: 18px; transition: opacity .5s; }
.loading.hidden { opacity: 0; pointer-events: none; }
.loading .ring { width: 48px; height: 48px; border: 2px solid rgba(232,184,96,.15); border-top-color: #e8b860; border-radius: 50%; animation: spin 1s linear infinite; }
.loading p { font-size: 12px; letter-spacing: .2em; color: #8a8fa8; }
.tooltip { position: fixed; z-index: 300; pointer-events: none; background: rgba(8,12,24,.95); border: 1px solid rgba(232,184,96,.28); border-radius: 8px; padding: 6px 10px; font-size: 11px; color: #e8e6df; backdrop-filter: blur(12px); white-space: nowrap; }
.modal { position: fixed; inset: 0; z-index: 1200; display: none; }
.modal.show { display: flex; align-items: center; justify-content: center; padding: 20px; }
.modal-backdrop { position: absolute; inset: 0; background: rgba(3,4,10,.8); backdrop-filter: blur(8px); animation: backdropIn .3s; }
.modal-content { position: relative; width: min(1100px,94vw); height: min(780px,88vh); background: rgba(8,12,24,.96); border: 1px solid rgba(232,184,96,.28); border-radius: 18px; box-shadow: 0 24px 80px rgba(0,0,0,.7),0 0 0 1px rgba(232,184,96,.1),0 0 60px rgba(232,184,96,.08); display: flex; flex-direction: column; overflow: hidden; animation: modalIn .35s cubic-bezier(.22,.61,.36,1); }
.modal-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 22px; border-bottom: 1px solid rgba(232,184,96,.28); background: rgba(232,184,96,.03); flex-shrink: 0; }
.modal-title { font-size: 12px; font-weight: 600; letter-spacing: .16em; color: #e8b860; text-transform: uppercase; }
.modal-close { background: none; border: 1px solid rgba(255,255,255,.1); color: #8a8fa8; width: 30px; height: 30px; border-radius: 50%; cursor: pointer; font-family: inherit; font-size: 16px; line-height: 1; transition: .2s; display: flex; align-items: center; justify-content: center; }
.modal-close:hover { color: #e8e6df; border-color: #e8b860; background: rgba(232,184,96,.1); }
.modal-body { flex: 1; display: flex; overflow: hidden; min-height: 0; }
.modal-nav { width: 190px; flex-shrink: 0; border-right: 1px solid rgba(232,184,96,.28); overflow-y: auto; padding: 12px 8px; scrollbar-width: thin; scrollbar-color: #e8b860 transparent; }
.modal-nav button { display: block; width: 100%; text-align: left; background: none; border: none; color: #8a8fa8; font-family: inherit; font-size: 12px; padding: 10px 14px; border-radius: 8px; cursor: pointer; transition: .2s; letter-spacing: .04em; margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.modal-nav button:hover { background: rgba(232,184,96,.08); color: #e8e6df; }
.modal-nav button.active { background: rgba(232,184,96,.16); color: #e8b860; font-weight: 600; }
.modal-nav button.dynamic { display: none; }
.modal-nav button.dynamic.show { display: block; }
.modal-panels { flex: 1; overflow-y: auto; padding: 22px 26px; min-width: 0; scrollbar-width: thin; scrollbar-color: #e8b860 transparent; }
.tab-panel { animation: tabIn .25s ease; }
.row { display: flex; justify-content: space-between; font-size: 13px; padding: 7px 0; border-bottom: 1px solid rgba(255,255,255,.04); gap: 10px; align-items: baseline; }
.row:last-child { border-bottom: none; }
.row.compact { padding: 4px 8px; }
.row .k { color: #8a8fa8; flex-shrink: 0; }
.row .v { color: #e8e6df; text-align: right; flex: 1; max-width: 70%; }
.row .v.small, .small { font-size: 11px; line-height: 1.6; }
.tag { display: inline-block; font-size: 10px; padding: 2px 7px; border-radius: 999px; background: rgba(79,216,255,.12); color: #4fd8ff; margin-left: 4px; font-weight: 500; }
.tag.gold { background: rgba(232,184,96,.15); color: #e8b860; }
.tag.violet { background: rgba(167,139,250,.15); color: #a78bfa; }
.jump-row { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
.jump { cursor: pointer; border: 0; font-family: inherit; }
.dp-section { margin-top: 14px; padding-top: 14px; border-top: 1px dashed rgba(232,184,96,.2); }
.dp-section-title { font-size: 10px; color: #e8b860; letter-spacing: .14em; text-transform: uppercase; margin-bottom: 8px; font-weight: 600; }
.dp-title-row { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; margin-bottom: 14px; padding-bottom: 12px; border-bottom: 1px solid rgba(232,184,96,.2); }
.dp-planet-name { font-size: 22px; font-weight: 600; letter-spacing: .04em; }
.dp-planet-en { font-size: 12px; color: #8a8fa8; letter-spacing: .04em; }
.section-heading { font-size: 13px; font-weight: 600; color: #e8b860; margin: 20px 0 10px; letter-spacing: .08em; display: flex; align-items: center; gap: 8px; }
.tab-panel > .section-heading:first-child { margin-top: 0; }
.section-heading::before { content: ''; width: 3px; height: 14px; background: #e8b860; border-radius: 2px; }
.empty-hint { color: #8a8fa8; font-size: 12px; padding: 20px; text-align: center; }
.empty-hint.left { color: #c8cfdf; text-align: left; padding: 8px 0 16px; }
.dasha-maha { margin-bottom: 10px; background: rgba(255,255,255,.02); border: 1px solid rgba(232,184,96,.12); border-radius: 10px; overflow: hidden; transition: border-color .2s; }
.dasha-maha:hover { border-color: rgba(232,184,96,.3); }
.dasha-maha.active { border-color: rgba(232,184,96,.6); box-shadow: 0 0 16px rgba(232,184,96,.15); }
.dasha-maha-header { display: flex; align-items: center; gap: 10px; width: 100%; padding: 10px 14px; cursor: pointer; font-size: 12px; transition: background .2s; background: none; border: 0; color: inherit; font-family: inherit; text-align: left; }
.modal .dasha-maha-header { color: #e8e6df; }
.modal .m-lord { color: #f5e9cf; }
.dasha-maha-header:hover { background: rgba(232,184,96,.06); }
.m-arrow { font-size: 9px; color: #adb6cc; transition: transform .2s; flex-shrink: 0; }
.dasha-maha.open .m-arrow { transform: rotate(90deg); color: #e8b860; }
.m-lord { font-weight: 600; flex-shrink: 0; }
.m-years { color: #d5dbea; font-size: 11px; flex-shrink: 0; }
.m-range { margin-left: auto; font-size: 10.5px; color: #d5dbea; font-variant-numeric: tabular-nums; flex-shrink: 0; }
.m-badge { font-size: 9px; color: #03040a; background: #e8b860; padding: 2px 6px; border-radius: 4px; font-weight: 600; flex-shrink: 0; }
.dasha-antars { display: none; padding: 0 10px 8px; }
.dasha-maha.open .dasha-antars { display: block; }
.dasha-theme { padding: 6px 10px; font-size: 11px; color: #c9d0e2; line-height: 1.6; }
.row.compact .k { color: #b8c1d5; }
.dasha-antar { margin: 4px 0; border-radius: 6px; background: rgba(255,255,255,.02); }
.dasha-antar-header { display: flex; align-items: center; gap: 8px; width: 100%; padding: 7px 10px; cursor: pointer; font-size: 11.5px; border-radius: 6px; transition: background .2s; background: none; border: 0; color: inherit; font-family: inherit; text-align: left; }
.dasha-antar-header:hover { background: rgba(232,184,96,.08); }
.dasha-antar.active .dasha-antar-header { background: rgba(232,184,96,.15); color: #e8b860; }
.a-arrow { font-size: 8px; color: #8a8fa8; transition: transform .2s; }
.dasha-antar.open .a-arrow { transform: rotate(90deg); color: #e8b860; }
.a-lord { font-weight: 500; }
.a-years { color: #8a8fa8; font-size: 10px; margin-left: 4px; }
.a-range { margin-left: auto; font-size: 10px; color: #8a8fa8; font-variant-numeric: tabular-nums; }
.a-badge { font-size: 9px; color: #03040a; background: #e8b860; padding: 1px 5px; border-radius: 3px; font-weight: 600; }
.dasha-pratys { display: none; padding: 4px 10px 4px 28px; }
.dasha-antar.open .dasha-pratys { display: block; }
.dasha-praty { display: flex; justify-content: space-between; gap: 8px; font-size: 10.5px; color: #8a8fa8; padding: 2px 0; line-height: 1.6; }
.dasha-praty.active { color: #e8b860; font-weight: 600; }
.dasha-timeline { display: flex; height: 18px; border-radius: 999px; overflow: hidden; background: rgba(255,255,255,.06); margin-bottom: 16px; }
.dasha-timeline .seg { height: 100%; position: relative; cursor: pointer; transition: flex .3s; border: 0; padding: 0; }
.dasha-timeline .seg .lbl { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: 700; color: #03040a; opacity: 0; transition: opacity .2s; }
.dasha-timeline .seg:hover .lbl { opacity: 1; }
.dasha-timeline .seg.active { box-shadow: inset 0 0 0 2px rgba(232,184,96,.9); }
.legend { display: flex; gap: 14px; font-size: 10px; color: #8a8fa8; margin-bottom: 16px; flex-wrap: wrap; }
@keyframes backdropIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes modalIn { from { opacity: 0; transform: scale(.94); } to { opacity: 1; transform: none; } }
@keyframes tabIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
@keyframes spin { to { transform: rotate(360deg); } }
@media (max-width: 900px) {
  .modal-content { width: 96vw; height: 92vh; border-radius: 14px; }
  .modal-body { flex-direction: column; }
  .modal-nav { width: 100%; display: flex; overflow-x: auto; overflow-y: hidden; border-right: none; border-bottom: 1px solid rgba(232,184,96,.28); padding: 8px 6px; flex-shrink: 0; gap: 2px; }
  .modal-nav button { display: inline-block; width: auto; white-space: nowrap; font-size: 11px; padding: 7px 10px; margin-bottom: 0; }
  .modal-nav button.dynamic.show { display: inline-block; }
  .modal-panels { padding: 16px 18px; }
  .hud { top: 12px; left: 12px; }
  .hud h1 { font-size: 13px; }
  .project-toolbar { top: auto; bottom: 76px; right: 12px; left: 12px; max-width: none; justify-content: center; }
  .project-toolbar :deep(.u-button), .project-toolbar > button, #openModalBtn { min-height: 32px; font-size: 11px; padding: 6px 10px; }
  .project-toolbar :deep(.u-button span:empty) { display: none; }
  .controls { bottom: 16px; }
  .dasha-bar { bottom: 136px; }
}
</style>
