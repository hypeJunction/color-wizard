<template>
  <aside class="settings-sidebar">
    <div class="sidebar-header">
      <a
        href="https://github.com/hypejunction/color-wizard"
        class="header-title"
      >
        <i class="github icon" />
        Color Wizard
      </a>
    </div>

    <div class="sidebar-body">
      <div class="field formula-selector">
        <select
          :value="model.formulaType"
          class="ui dropdown"
          @change="handleFormulaChange"
        >
          <option
            v-for="option in formulaOptions"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>
      </div>

      <div class="formula-display">
        {{ currentFormula.display }}
      </div>

      <div class="chart-section">
        <ColorChart
          :chart-data="chartData"
          :options="chartOptions"
        />
      </div>

      <form class="ui form mini">
        <div class="field">
          <label>Base Luminance / Preview Hue</label>
          <div class="two-fields-row">
            <div class="ui left labeled input">
              <div
                class="ui label"
                title="Luminance at Level 6"
              >
                L<sub>6</sub>
              </div>
              <input
                :value="model.luminance"
                type="number"
                step="1"
                min="0"
                max="100"
                @input="$emit('update:model', { ...model, luminance: Number(($event.target as HTMLInputElement).value) })"
              >
            </div>
            <div class="ui left labeled input">
              <div
                class="ui label"
                title="Hue for chart preview"
              >
                H<sup>°</sup>
              </div>
              <input
                :value="model.hue"
                type="number"
                step="1"
                min="0"
                max="360"
                @input="$emit('update:model', { ...model, hue: Number(($event.target as HTMLInputElement).value) })"
              >
            </div>
          </div>
        </div>

        <div class="field">
          <label>Formula Parameters</label>
          <div
            v-for="(row, rowIndex) in paramRows"
            :key="rowIndex"
            class="coefficients-row"
            :class="{ 'coefficients-row-extra': rowIndex > 0 }"
          >
            <div
              v-for="param in row"
              :key="param.key"
              class="ui left labeled input"
            >
              <div
                class="ui label"
                :title="param.title"
              >
                {{ param.label }}
              </div>
              <input
                :value="model.formulaParams[param.key]"
                type="number"
                step="0.01"
                min="-100"
                max="100"
                @input="updateParam(param.key, Number(($event.target as HTMLInputElement).value))"
              >
            </div>
          </div>
        </div>

        <div class="field">
          <label>Contrast / Text Colors</label>
          <div class="contrast-colors-row">
            <div class="ui left labeled input">
              <div
                class="ui label"
                title="Target Contrast Ratio"
              >
                CR
              </div>
              <input
                :value="model.contrast"
                type="number"
                step="0.1"
                min="1"
                max="21"
                @input="$emit('update:model', { ...model, contrast: Number(($event.target as HTMLInputElement).value) })"
              >
            </div>
            <div class="color-input">
              <input
                :value="model.dark"
                type="color"
                title="Dark Text"
                @input="$emit('update:model', { ...model, dark: ($event.target as HTMLInputElement).value })"
              >
            </div>
            <div class="color-input">
              <input
                :value="model.light"
                type="color"
                title="Light Text"
                @input="$emit('update:model', { ...model, light: ($event.target as HTMLInputElement).value })"
              >
            </div>
          </div>
        </div>
      </form>
    </div>

    <div class="sidebar-footer">
      <slot name="palette" />
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ChartData, ChartOptions } from 'chart.js';
import ColorChart from './ColorChart.vue';

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
}

interface FormulaDefinition {
  label: string;
  display: string;
  params: Array<{ key: keyof FormulaParams; label: string; title: string }>;
  defaults: FormulaParams;
}

const formulaDefinitions: Record<FormulaType, FormulaDefinition> = {
  parabolic: {
    label: 'Parabolic',
    display: 'S = aL² + bL + c',
    params: [
      { key: 'a', label: 'a', title: 'Quadratic coefficient' },
      { key: 'b', label: 'b', title: 'Linear coefficient' },
      { key: 'c', label: 'c', title: 'Constant term' },
    ],
    defaults: { a: 0, b: 0, c: 0.8, d: 0 },
  },
  linear: {
    label: 'Linear',
    display: 'S = aL + b',
    params: [
      { key: 'a', label: 'a', title: 'Slope' },
      { key: 'b', label: 'b', title: 'Intercept' },
    ],
    defaults: { a: 0, b: 0.8, c: 0, d: 0 },
  },
  constant: {
    label: 'Constant',
    display: 'S = c',
    params: [
      { key: 'c', label: 'c', title: 'Constant saturation value' },
    ],
    defaults: { a: 0, b: 0, c: 0.8, d: 0 },
  },
  sinusoidal: {
    label: 'Sinusoidal',
    display: 'S = a×sin(bL + c) + d',
    params: [
      { key: 'a', label: 'a', title: 'Amplitude' },
      { key: 'b', label: 'b', title: 'Frequency' },
      { key: 'c', label: 'c', title: 'Phase shift' },
      { key: 'd', label: 'd', title: 'Vertical offset' },
    ],
    defaults: { a: 0.3, b: Math.PI, c: 0, d: 0.5 },
  },
  exponential: {
    label: 'Exponential',
    display: 'S = a×eᵇᴸ + c',
    params: [
      { key: 'a', label: 'a', title: 'Scale factor' },
      { key: 'b', label: 'b', title: 'Growth rate' },
      { key: 'c', label: 'c', title: 'Vertical offset' },
    ],
    defaults: { a: 0.3, b: 1, c: 0.5, d: 0 },
  },
  power: {
    label: 'Power',
    display: 'S = aLᵇ + c',
    params: [
      { key: 'a', label: 'a', title: 'Scale factor' },
      { key: 'b', label: 'b', title: 'Exponent' },
      { key: 'c', label: 'c', title: 'Vertical offset' },
    ],
    defaults: { a: 0.5, b: 1, c: 0.3, d: 0 },
  },
  gaussian: {
    label: 'Gaussian',
    display: 'S = a×e^(-(L-b)²/c²) + d',
    params: [
      { key: 'a', label: 'a', title: 'Peak height' },
      { key: 'b', label: 'b', title: 'Peak position (luminance)' },
      { key: 'c', label: 'c', title: 'Width (spread)' },
      { key: 'd', label: 'd', title: 'Base offset' },
    ],
    defaults: { a: 0.6, b: 0.5, c: 0.3, d: 0.2 },
  },
  sigmoid: {
    label: 'Sigmoid',
    display: 'S = a/(1 + e^(-b(L-c))) + d',
    params: [
      { key: 'a', label: 'a', title: 'Curve height' },
      { key: 'b', label: 'b', title: 'Steepness' },
      { key: 'c', label: 'c', title: 'Midpoint (luminance)' },
      { key: 'd', label: 'd', title: 'Base offset' },
    ],
    defaults: { a: 0.6, b: 10, c: 0.5, d: 0.2 },
  },
  logarithmic: {
    label: 'Logarithmic',
    display: 'S = a×ln(bL + 1) + c',
    params: [
      { key: 'a', label: 'a', title: 'Scale factor' },
      { key: 'b', label: 'b', title: 'Input scale' },
      { key: 'c', label: 'c', title: 'Vertical offset' },
    ],
    defaults: { a: 0.5, b: 2, c: 0.3, d: 0 },
  },
  cubic: {
    label: 'Cubic',
    display: 'S = aL³ + bL² + cL + d',
    params: [
      { key: 'a', label: 'a', title: 'Cubic coefficient' },
      { key: 'b', label: 'b', title: 'Quadratic coefficient' },
      { key: 'c', label: 'c', title: 'Linear coefficient' },
      { key: 'd', label: 'd', title: 'Constant term' },
    ],
    defaults: { a: 0, b: 0, c: 0, d: 0.8 },
  },
  inverse: {
    label: 'Inverse',
    display: 'S = a/(L + b) + c',
    params: [
      { key: 'a', label: 'a', title: 'Numerator' },
      { key: 'b', label: 'b', title: 'Denominator offset' },
      { key: 'c', label: 'c', title: 'Vertical offset' },
    ],
    defaults: { a: 0.3, b: 0.5, c: 0.3, d: 0 },
  },
};

const formulaOptions: Array<{ value: FormulaType; label: string }> = [
  { value: 'parabolic', label: 'Parabolic' },
  { value: 'linear', label: 'Linear' },
  { value: 'constant', label: 'Constant' },
  { value: 'cubic', label: 'Cubic' },
  { value: 'power', label: 'Power' },
  { value: 'exponential', label: 'Exponential' },
  { value: 'logarithmic', label: 'Logarithmic' },
  { value: 'gaussian', label: 'Gaussian' },
  { value: 'sigmoid', label: 'Sigmoid' },
  { value: 'sinusoidal', label: 'Sinusoidal' },
  { value: 'inverse', label: 'Inverse' },
];

const props = defineProps<{
  model: Model;
  chartData: ChartData<'scatter'>;
  chartOptions: ChartOptions<'scatter'>;
}>();

const emit = defineEmits<{
  (e: 'update:model', value: Model): void;
}>();

const currentFormula = computed(() => formulaDefinitions[props.model.formulaType]);

const paramRows = computed(() => {
  const params = currentFormula.value.params;
  const rows: Array<typeof params> = [];
  for (let i = 0; i < params.length; i += 2) {
    rows.push(params.slice(i, i + 2));
  }
  return rows;
});

const handleFormulaChange = (event: Event) => {
  const newType = (event.target as HTMLSelectElement).value as FormulaType;
  const defaults = formulaDefinitions[newType].defaults;
  emit('update:model', {
    ...props.model,
    formulaType: newType,
    formulaParams: { ...defaults },
  });
};

const updateParam = (key: keyof FormulaParams, value: number) => {
  emit('update:model', {
    ...props.model,
    formulaParams: { ...props.model.formulaParams, [key]: value },
  });
};
</script>

<style scoped>
.settings-sidebar {
  width: 280px;
  height: 100vh;
  background: #fff;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 100;
}

.sidebar-header {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e0e0e0;
  background: #f9fafb;
  display: flex;
  align-items: center;
  min-height: 44px;
  box-sizing: border-box;
}

.header-title {
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.header-title:hover {
  color: #000;
}

.header-title .icon {
  font-size: 1.1rem;
}

.sidebar-body {
  flex: 1;
  overflow-y: auto;
  padding: 0.75rem;
}

.formula-selector {
  margin-bottom: 0.5rem;
}

.formula-selector select {
  width: 100%;
  padding: 0.5rem;
  font-size: 0.9rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
}

.formula-selector select:focus {
  outline: none;
  border-color: #2185d0;
}

.formula-display {
  font-size: 1.1rem;
  font-weight: 500;
  text-align: center;
  padding: 0.4rem;
  margin-bottom: 0.5rem;
  color: #555;
  font-family: 'Courier New', monospace;
  letter-spacing: 0.05em;
}

.chart-section {
  margin-bottom: 0.75rem;
  padding: 0.25rem;
  background: #f9fafb;
  border-radius: 4px;
  height: 180px;
}

.ui.form.mini .field {
  margin-bottom: 0.6rem;
}

.ui.form.mini .field > label {
  font-size: 0.8rem;
  margin-bottom: 0.25rem;
}

.ui.form.mini .ui.input,
.ui.form.mini .ui.left.labeled.input {
  width: 100%;
}

.ui.form.mini .ui.left.labeled.input > input {
  width: 100% !important;
  flex: 1;
  min-width: 0;
}

.two-fields-row,
.coefficients-row,
.contrast-colors-row {
  display: flex;
  gap: 0.4rem;
}

.coefficients-row {
  flex-wrap: nowrap;
  overflow: hidden;
}

.two-fields-row .ui.left.labeled.input {
  flex: 1;
  min-width: 0;
}

.coefficients-row .ui.left.labeled.input {
  flex: 0 0 auto;
  width: calc(50% - 0.2rem);
  max-width: calc(50% - 0.2rem);
}

.coefficients-row .ui.left.labeled.input > input {
  width: 100% !important;
  min-width: 0;
}

.coefficients-row .ui.label {
  flex-shrink: 0;
}

.coefficients-row-extra {
  margin-top: 0.4rem;
}

.contrast-colors-row .ui.left.labeled.input {
  flex: 1;
  min-width: 0;
}

.contrast-colors-row .color-input {
  flex-shrink: 0;
}

.contrast-colors-row .color-input input {
  width: 32px;
  height: 32px;
  padding: 2px;
  border: 1px solid #ddd;
  border-radius: 3px;
  cursor: pointer;
}

.sidebar-footer {
  display: flex;
}
</style>
