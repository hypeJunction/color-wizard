<template>
  <Tabs :tabs="tabs">
    <template #css>
      <pre class="code-block"><code>{{ css }}</code></pre>
    </template>

    <template #scss>
      <pre class="code-block"><code>{{ scss }}</code></pre>
    </template>

    <template #json>
      <pre class="code-block"><code>module.exports = {{ JSON.stringify(json, undefined, 2) }}</code></pre>
    </template>
  </Tabs>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Instance as TinycolorInstance } from 'tinycolor2';
import Tabs from './Tabs.vue';

interface ColorDefinition {
  name: string;
  hue: number;
  saturationOffset: number;
  luminanceOffset: number;
  levels: { offset: number }[];
}

interface Swatch extends TinycolorInstance {
  name: string;
  text: string;
  contrast: number;
  baseColor: ColorDefinition;
}

interface SwatchJson {
  rgba: { r: number; g: number; b: number; a: number };
  hsla: { h: number; s: number; l: number; a: number };
  hsva: { h: number; s: number; v: number; a: number };
  text: string;
  contrast: number;
}

const props = defineProps<{
  swatches: Swatch[][];
}>();

const tabs = [
  { id: 'css', label: 'CSS', selected: true },
  { id: 'scss', label: 'SCSS' },
  { id: 'json', label: 'JSON' },
];

const css = computed(() => {
  const vars = props.swatches.reduce<string[]>((result, el) => {
    const colorVars = el.map((e) => {
      const hsl = e.toHslString();
      return `         --${e.name}: ${hsl};`;
    });
    result.push(...colorVars);
    return result;
  }, []);

  return `:root { \n${vars.join('\n')} }`;
});

const scss = computed(() => {
  const vars = props.swatches.reduce<string[]>((result, el) => {
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
  return props.swatches.reduce<Record<string, SwatchJson>>((result, el) => {
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
</script>

<style scoped>
.code-block {
  background: #1d1f21;
  color: #c5c8c6;
  padding: 1em;
  border-radius: 4px;
  overflow-x: auto;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  line-height: 1.5;
}

.code-block code {
  white-space: pre;
}
</style>
