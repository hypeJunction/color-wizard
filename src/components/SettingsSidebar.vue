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
      <div class="formula-display">
        S = a × L² + b × L + c
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
          <label>Saturation Coefficients</label>
          <div class="coefficients-row">
            <div class="ui left labeled input">
              <div class="ui label">a</div>
              <input
                :value="model.factor"
                type="number"
                step="0.01"
                min="-100"
                max="100"
                @input="$emit('update:model', { ...model, factor: Number(($event.target as HTMLInputElement).value) })"
              >
            </div>
            <div class="ui left labeled input">
              <div class="ui label">b</div>
              <input
                :value="model.adjust"
                type="number"
                step="0.01"
                min="-100"
                max="100"
                @input="$emit('update:model', { ...model, adjust: Number(($event.target as HTMLInputElement).value) })"
              >
            </div>
            <div class="ui left labeled input">
              <div class="ui label">c</div>
              <input
                :value="model.shiftS"
                type="number"
                step="0.01"
                min="-100"
                max="100"
                @input="$emit('update:model', { ...model, shiftS: Number(($event.target as HTMLInputElement).value) })"
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
import type { ChartData, ChartOptions } from 'chart.js';
import ColorChart from './ColorChart.vue';

interface Model {
  luminance: number;
  hue: number;
  factor: number;
  adjust: number;
  shiftS: number;
  contrast: number;
  light: string;
  dark: string;
}

defineProps<{
  model: Model;
  chartData: ChartData<'scatter'>;
  chartOptions: ChartOptions<'scatter'>;
}>();

defineEmits<{
  (e: 'update:model', value: Model): void;
}>();
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

.two-fields-row .ui.left.labeled.input,
.coefficients-row .ui.left.labeled.input {
  flex: 1;
  min-width: 0;
}

.coefficients-row .ui.label {
  flex-shrink: 0;
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
