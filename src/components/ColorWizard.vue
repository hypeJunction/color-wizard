<template>
  <div class="color-wizard">
    <SettingsSidebar
      :model="settingsModel"
      :chart-data="chartData"
      :chart-options="chartOptions"
      @update:model="updateModel"
    >
      <template #palette>
        <MiniPalette
          :swatches="swatches"
          :contrast="model.contrast"
        />
      </template>
    </SettingsSidebar>

    <div class="main-area">
      <header class="app-header">
        <div class="main-tabs">
          <a
            v-for="tab in mainTabs"
            :key="tab.id"
            :class="{ active: activeTab === tab.id }"
            @click.prevent="activeTab = tab.id"
          >
            {{ tab.label }}
          </a>
        </div>
      </header>

      <main class="app-content">
        <div
          v-show="activeTab === 'palette'"
          class="tab-content"
        >
          <form class="ui form mini">
            <div class="ui grid padded">
              <div class="column">
                <table class="ui celled table">
                  <thead>
                    <tr>
                      <th />
                      <th
                        v-for="(_level, index) in model.levels"
                        :key="index"
                      >
                        Level {{ index }}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td />
                      <td
                        v-for="(level, index) in model.levels"
                        :key="index"
                      >
                        <div class="field">
                          <div class="ui left labeled input">
                            <div
                              class="ui label"
                              title="Luminance offset from Base Luminance"
                            >
                              L<sub>d</sub>
                            </div>
                            <input
                              v-model.number="level.offset"
                              type="number"
                              step="1"
                              min="-100"
                              max="100"
                            >
                          </div>
                        </div>

                        <div class="field">
                          <div class="ui checkbox">
                            <input
                              v-model="level.lightText"
                              type="checkbox"
                            >
                            <label>Light Text</label>
                          </div>
                        </div>

                        <div class="field">
                          <button
                            class="mini ui button basic"
                            @click.prevent="removeLevel(index)"
                          >
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>

                    <tr
                      v-for="(color, index) in model.colors"
                      :key="index"
                      class="top aligned"
                    >
                      <td>
                        <div class="field">
                          <div class="ui left labeled input">
                            <div
                              class="ui label"
                              title="Color Variable Name"
                            >
                              $
                            </div>
                            <input
                              v-model="color.name"
                              type="text"
                              required
                            >
                          </div>
                        </div>

                        <div class="field">
                          <div class="ui left labeled input">
                            <div
                              class="ui label"
                              title="Hue"
                            >
                              H<sup>&deg;</sup>
                            </div>
                            <input
                              v-model.number="color.hue"
                              type="number"
                              step="1"
                              min="0"
                              max="360"
                              required
                            >
                          </div>
                        </div>

                        <div class="field">
                          <div class="ui left labeled input">
                            <div
                              class="ui label"
                              title="Saturation Offset"
                            >
                              S<sub>d</sub>
                            </div>
                            <input
                              v-model.number="color.saturationOffset"
                              type="number"
                              step="1"
                              min="-100"
                              max="100"
                              required
                            >
                          </div>
                        </div>

                        <div class="field">
                          <div class="ui left labeled input">
                            <div
                              class="ui label"
                              title="Luminance Offset"
                            >
                              L<sub>d</sub>
                            </div>
                            <input
                              v-model.number="color.luminanceOffset"
                              type="number"
                              step="1"
                              min="-100"
                              max="100"
                              required
                            >
                          </div>
                        </div>

                        <div class="field">
                          <button
                            class="mini ui button basic"
                            @click.prevent="removeColor(index)"
                          >
                            Remove
                          </button>
                        </div>
                      </td>

                      <td
                        v-for="(swatch, index2) in swatches[index]"
                        :key="index2"
                        :class="{ negative: swatch.contrast < model.contrast }"
                      >
                        <div
                          class="color-box"
                          :style="getBoxStyle(swatch)"
                        >
                          <span
                            class="color-name"
                            title="Color Variant Name"
                          >
                            {{ swatch.name }}
                          </span>

                          <span
                            class="color-contrast"
                            title="Contrast Ratio"
                          >
                            {{ `${swatch.contrast}:1` }}
                          </span>
                        </div>

                        <div class="color-meta">
                          <div>{{ swatch.toHexString() }}</div>
                          <div>{{ swatch.toRgbString() }}</div>
                          <div>{{ swatch.toHslString() }}</div>
                        </div>

                        <div class="field">
                          <div class="ui left labeled input">
                            <div
                              class="ui label"
                              title="Luminance offset from Level Luminance"
                            >
                              L<sub>d</sub>
                            </div>
                            <input
                              v-model.number="color.levels[index2].offset"
                              type="number"
                              step="1"
                              min="-50"
                              max="50"
                            >
                          </div>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>

                <a
                  class="ui button primary"
                  @click.prevent="addColor"
                >Add Color</a>
              </div>
            </div>
          </form>
        </div>

        <div
          v-show="activeTab === 'css'"
          class="tab-content code-tab"
        >
          <pre class="code-block"><code>{{ css }}</code></pre>
        </div>

        <div
          v-show="activeTab === 'scss'"
          class="tab-content code-tab"
        >
          <pre class="code-block"><code>{{ scss }}</code></pre>
        </div>

        <div
          v-show="activeTab === 'json'"
          class="tab-content code-tab"
        >
          <pre class="code-block"><code>module.exports = {{ JSON.stringify(json, undefined, 2) }}</code></pre>
        </div>

        <div
          v-show="activeTab === 'tokens'"
          class="tab-content code-tab"
        >
          <pre class="code-block"><code>{{ JSON.stringify(designTokens, undefined, 2) }}</code></pre>
        </div>

        <div
          v-show="activeTab === 'about'"
          class="tab-content about-content"
        >
          <h2>Systematic Color Palette Generator</h2>

          <p>
            Welcome to Color Wizard! I built this tool because I was struggling to find
            a palette generator that was easy to use and customize. I hope you find it useful.
          </p>

          <h3>How It Works</h3>
          <p>
            This tool uses a parabolic formula to automatically calculate color saturation
            across different luminance levels. The formula <strong>S = aL² + bL + c</strong>
            creates smooth, natural-looking color transitions.
          </p>

          <h3>Features</h3>
          <ul>
            <li>Generate systematic color palettes with consistent luminance levels</li>
            <li>Fine-tune saturation curves using parabolic coefficients</li>
            <li>Bulk edit HSL values across all colors</li>
            <li>Define custom number of shades and hues</li>
            <li>Real-time contrast ratio checking for accessibility</li>
            <li>Export to CSS, SCSS, JSON, or Design Tokens formats</li>
          </ul>

          <h3>Accessibility</h3>
          <p>
            Each color swatch displays its contrast ratio against text. WCAG 2.0 requires
            a minimum contrast ratio of <strong>4.5:1</strong> for normal text (under 18pt/24px)
            to be accessible for people with vision impairments.
          </p>
          <p>
            Swatches that fail to meet your target contrast ratio are marked with an ×.
            Adjust the target in Settings to match your accessibility requirements.
          </p>

          <h3>Tips</h3>
          <ul>
            <li>Use the saturation curve chart to visualize how saturation changes with luminance</li>
            <li>Adjust coefficient <strong>a</strong> to control curve steepness</li>
            <li>Adjust coefficient <strong>b</strong> to shift the curve linearly</li>
            <li>Adjust coefficient <strong>c</strong> to set the base saturation level</li>
            <li>Per-color luminance offsets let you fine-tune individual colors</li>
          </ul>

          <div class="about-footer">
            <a href="https://github.com/hypejunction/color-wizard">
              <i class="github icon" /> View on GitHub
            </a>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import tinycolor from 'tinycolor2';
import type { Instance as TinycolorInstance } from 'tinycolor2';
import type { ChartData, ChartOptions } from 'chart.js';
import SettingsSidebar from './SettingsSidebar.vue';
import MiniPalette from './MiniPalette.vue';

interface Level {
  offset: number;
  lightText: boolean;
}

interface ColorLevel {
  offset: number;
}

interface ColorDefinition {
  name: string;
  hue: number;
  saturationOffset: number;
  luminanceOffset: number;
  levels: ColorLevel[];
}

interface Swatch extends TinycolorInstance {
  name: string;
  text: string;
  contrast: number;
  baseColor: ColorDefinition;
}

type FormulaType = 'parabolic' | 'linear' | 'constant' | 'sinusoidal' | 'exponential' | 'power' | 'gaussian' | 'sigmoid' | 'logarithmic' | 'cubic' | 'inverse';

interface FormulaParams {
  a: number;
  b: number;
  c: number;
  d: number;
}

interface Model {
  luminance: number;
  hue: number;
  formulaType: FormulaType;
  formulaParams: FormulaParams;
  contrast: number;
  light: string;
  dark: string;
  levels: Level[];
  colors: ColorDefinition[];
}

interface SwatchJson {
  rgba: { r: number; g: number; b: number; a: number };
  hsla: { h: number; s: number; l: number; a: number };
  hsva: { h: number; s: number; v: number; a: number };
  text: string;
  contrast: number;
}

const mainTabs = [
  { id: 'palette', label: 'Palette' },
  { id: 'css', label: 'CSS' },
  { id: 'scss', label: 'SCSS' },
  { id: 'json', label: 'JSON' },
  { id: 'tokens', label: 'Design Tokens' },
  { id: 'about', label: 'About' },
];

const activeTab = ref('palette');

const offsets = [44, 40, 36, 27, 18, 9, 0, -9, -18, -27];

const createLevels = (): Level[] => offsets.map((offset, index) => ({
  offset,
  lightText: index >= 6,
}));

const defaults: Record<string, number> = {
  red: 360,
  pink: 339,
  grape: 288,
  violet: 255,
  indigo: 230,
  blue: 208,
  cyan: 188,
  teal: 162,
  green: 131,
  lime: 85,
  yellow: 39,
  orange: 24,
  grey: 0,
};

const createColors = (): ColorDefinition[] => Object.keys(defaults).map((name) => ({
  name,
  hue: defaults[name],
  saturationOffset: name === 'grey' ? -100 : 0,
  luminanceOffset: 0,
  levels: offsets.map(() => ({ offset: 0 })),
}));

const model = reactive<Model>({
  luminance: 50,
  hue: 0,
  formulaType: 'parabolic',
  formulaParams: { a: 0, b: 0, c: 0.8, d: 0 },
  contrast: 4.5,
  light: '#ffffff',
  dark: '#000000',
  levels: createLevels(),
  colors: createColors(),
});

const settingsModel = computed(() => ({
  luminance: model.luminance,
  hue: model.hue,
  formulaType: model.formulaType,
  formulaParams: { ...model.formulaParams },
  contrast: model.contrast,
  light: model.light,
  dark: model.dark,
}));

interface SettingsModel {
  luminance: number;
  hue: number;
  formulaType: FormulaType;
  formulaParams: FormulaParams;
  contrast: number;
  light: string;
  dark: string;
}

const updateModel = (newModel: SettingsModel) => {
  model.luminance = newModel.luminance;
  model.hue = newModel.hue;
  model.formulaType = newModel.formulaType;
  model.formulaParams = { ...newModel.formulaParams };
  model.contrast = newModel.contrast;
  model.light = newModel.light;
  model.dark = newModel.dark;
};

const minmax = (val: number): number => Math.max(Math.min(val, 0.99), 0.01);

const calcLuminance = (levelIndex: number, color: ColorDefinition | null = null): number => {
  const colorOffset = color ? color.levels[levelIndex].offset + color.luminanceOffset : 0;
  const offset = model.levels[levelIndex].offset + colorOffset;
  const luminance = model.luminance + offset;
  return minmax(luminance / 100);
};

const calcSaturation = (luminance: number): number => {
  const { a, b, c, d } = model.formulaParams;
  let saturation: number;

  switch (model.formulaType) {
    case 'parabolic':
      // S = aL² + bL + c
      saturation = a * (luminance ** 2) + b * luminance + c;
      break;
    case 'linear':
      // S = aL + b
      saturation = a * luminance + b;
      break;
    case 'constant':
      // S = c
      saturation = c;
      break;
    case 'sinusoidal':
      // S = a × sin(bL + c) + d
      saturation = a * Math.sin(b * luminance + c) + d;
      break;
    case 'exponential':
      // S = a × e^(bL) + c
      saturation = a * Math.exp(b * luminance) + c;
      break;
    case 'power':
      // S = a × L^b + c
      saturation = a * (luminance ** b) + c;
      break;
    case 'gaussian':
      // S = a × e^(-(L-b)²/c²) + d - bell curve peaking at L=b
      saturation = a * Math.exp(-((luminance - b) ** 2) / (c ** 2)) + d;
      break;
    case 'sigmoid':
      // S = a / (1 + e^(-b(L-c))) + d - smooth S-curve
      saturation = a / (1 + Math.exp(-b * (luminance - c))) + d;
      break;
    case 'logarithmic':
      // S = a × ln(bL + 1) + c - rapid initial change
      saturation = a * Math.log(b * luminance + 1) + c;
      break;
    case 'cubic':
      // S = aL³ + bL² + cL + d
      saturation = a * (luminance ** 3) + b * (luminance ** 2) + c * luminance + d;
      break;
    case 'inverse':
      // S = a / (L + b) + c - hyperbolic decay
      saturation = a / (luminance + b) + c;
      break;
    default:
      saturation = c;
  }

  return minmax(saturation);
};

const calcContrast = (foreground: TinycolorInstance, background: TinycolorInstance): number => {
  const relBrightness = (light: number): number => {
    const sRgb = light / 255;
    if (sRgb <= 0.03928) {
      return sRgb / 12.92;
    }
    return ((sRgb + 0.055) / 1.055) ** 2.4;
  };

  const relLuminance = (rgb: { r: number; g: number; b: number }): number => (
    0.2126 * relBrightness(rgb.r)
    + 0.7152 * relBrightness(rgb.g)
    + 0.0722 * relBrightness(rgb.b)
  );

  const fRL = relLuminance(foreground.toRgb());
  const bRL = relLuminance(background.toRgb());

  return Number(((Math.max(fRL, bRL) + 0.05) / (Math.min(fRL, bRL) + 0.05)).toFixed(2));
};

const swatches = computed<Swatch[][]>(() => {
  return model.colors.map((color) => (
    Object.keys(model.levels).map((i) => {
      const levelIndex = Number(i);
      const luminance = calcLuminance(levelIndex, color);
      const saturation = calcSaturation(luminance);
      const isLightText = model.levels[levelIndex].lightText;

      const swatch = tinycolor({
        h: color.hue || 0,
        s: saturation + color.saturationOffset / 100,
        l: luminance,
      }) as Swatch;

      swatch.name = `${color.name}-${i}`;
      swatch.text = isLightText ? model.light : model.dark;
      swatch.contrast = calcContrast(tinycolor(swatch.text), swatch);
      swatch.baseColor = color;

      return swatch;
    })
  ));
});

const chartData = computed<ChartData<'scatter'>>(() => ({
  datasets: model.levels.map((_level, index) => {
    const luminance = calcLuminance(index);
    const saturation = calcSaturation(luminance);

    return {
      backgroundColor: `hsla(${model.hue}, ${saturation * 100}%, ${luminance * 100}%, 1)`,
      borderColor: 'transparent',
      fill: false,
      pointRadius: 5,
      data: [{
        y: luminance,
        x: saturation,
      }],
    };
  }),
}));

const chartOptions = computed<ChartOptions<'scatter'>>(() => ({
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    title: {
      display: false,
    },
  },
  scales: {
    x: {
      min: 0,
      max: 1,
      title: {
        display: true,
        text: 'Saturation',
      },
    },
    y: {
      min: 0,
      max: 1,
      title: {
        display: true,
        text: 'Luminance',
      },
    },
  },
}));

const getBoxStyle = (swatch: Swatch): { backgroundColor: string; color: string } => ({
  backgroundColor: swatch.toHslString(),
  color: swatch.text,
});

const addColor = (): void => {
  model.colors.push({
    name: 'other',
    hue: Math.floor(Math.random() * 360),
    saturationOffset: 0,
    luminanceOffset: 0,
    levels: model.levels.map(() => ({ offset: 0 })),
  });
};

const removeColor = (index: number): void => {
  model.colors.splice(index, 1);
};

const removeLevel = (index: number): void => {
  model.levels.splice(index, 1);
  model.colors.forEach((color) => color.levels.splice(index, 1));
};

// Export format computations
const css = computed(() => {
  const vars = swatches.value.reduce<string[]>((result, el) => {
    const colorVars = el.map((e) => {
      const hsl = e.toHslString();
      return `  --${e.name}: ${hsl};`;
    });
    result.push(...colorVars);
    return result;
  }, []);

  return `:root {\n${vars.join('\n')}\n}`;
});

const scss = computed(() => {
  const vars = swatches.value.reduce<string[]>((result, el) => {
    const colorVars = el.map((e) => {
      const hsl = e.toHslString();
      return `$color-${e.name}: ${hsl};`;
    });
    result.push(...colorVars);
    return result;
  }, []);

  return vars.join('\n');
});

const json = computed(() => {
  return swatches.value.reduce<Record<string, SwatchJson>>((result, el) => {
    const data = { ...result };
    el.forEach((e) => {
      data[e.name] = {
        rgba: e.toRgb(),
        hsla: e.toHsl(),
        hsva: e.toHsv(),
        text: e.text,
        contrast: e.contrast,
      };
    });
    return data;
  }, {});
});

interface DesignToken {
  $value: string;
  $description?: string;
}

interface DesignTokenGroup {
  $type: string;
  [key: string]: string | { [level: string]: DesignToken };
}

const designTokens = computed(() => {
  const tokens: { color: DesignTokenGroup } = {
    color: {
      $type: 'color',
    },
  };

  swatches.value.forEach((colorSwatches) => {
    const colorName = colorSwatches[0].baseColor.name;
    const colorGroup: { [level: string]: DesignToken } = {};

    colorSwatches.forEach((swatch, levelIndex) => {
      colorGroup[String(levelIndex)] = {
        $value: swatch.toHexString(),
      };
    });

    tokens.color[colorName] = colorGroup;
  });

  return tokens;
});

// Expose for testing
defineExpose({
  model,
  swatches,
  calcContrast,
  addColor,
});
</script>

<style scoped>
.color-wizard {
  display: flex;
  min-height: 100vh;
}

.main-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  margin-left: 280px;
}

.app-header {
  display: flex;
  align-items: center;
  background: #f9fafb;
  border-bottom: 1px solid #e0e0e0;
  position: sticky;
  top: 0;
  z-index: 50;
}

.main-tabs {
  display: flex;
}

.main-tabs a {
  padding: 0.75rem 1.25rem;
  text-align: center;
  color: #666;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s ease;
  font-size: 0.9rem;
  text-decoration: none;
}

.main-tabs a:hover {
  color: #333;
  background: #f0f0f0;
}

.main-tabs a.active {
  color: #2185d0;
  border-bottom-color: #2185d0;
  background: #fff;
}

.app-content {
  flex: 1;
  overflow-y: auto;
}

.tab-content {
  padding: 1rem;
}

.tab-content.code-tab {
  padding: 0;
}

.code-block {
  background: #1d1f21;
  color: #c5c8c6;
  padding: 1.5em;
  margin: 0;
  min-height: calc(100vh - 60px);
  overflow-x: auto;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  line-height: 1.5;
}

.code-block code {
  white-space: pre;
}

.color-box {
  position: relative;
  min-width: 100px;
  width: 100%;
  height: 100px;
  display: block;
  border-radius: 4px;
  text-align: center;
  font-weight: bold;
}

.color-name,
.color-contrast {
  position: absolute;
  top: 0;
  right: 0;
  margin: 4px 8px;
  font-size: 12px;
}

.color-contrast {
  top: auto;
  bottom: 0;
}

.color-meta {
  margin: 8px 0;
  white-space: nowrap;
  font-size: 12px;
  line-height: normal;
}

.color-meta > div {
  margin-top: 4px;
}

.ui.form.mini .ui.checkbox label {
  font-size: 0.8em;
}

.ui.celled.table th:first-child,
.ui.celled.table td:first-child {
  width: 140px;
  min-width: 140px;
  max-width: 140px;
}

.ui.celled.table td:first-child .ui.left.labeled.input {
  width: 100%;
}

.ui.celled.table td:first-child .ui.left.labeled.input > input {
  width: 100% !important;
  flex: 1;
  min-width: 0;
}

.about-content {
  max-width: 800px;
  padding: 2rem !important;
}

.about-content h2 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: #333;
}

.about-content h3 {
  margin-top: 2rem;
  margin-bottom: 0.75rem;
  color: #444;
}

.about-content p {
  font-size: 1rem;
  line-height: 1.7;
  color: #555;
  margin-bottom: 1rem;
}

.about-content ul {
  margin: 1rem 0;
  padding-left: 1.5rem;
}

.about-content li {
  font-size: 1rem;
  line-height: 1.7;
  color: #555;
  margin-bottom: 0.5rem;
}

.about-footer {
  margin-top: 3rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e0e0e0;
}

.about-footer a {
  color: #2185d0;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
}

.about-footer a:hover {
  text-decoration: underline;
}
</style>
