<template>
  <div>
    <div class="ui grid padded">
      <div class="column">
        <a href="http://github.com/hypejunction/color-wizard"><h1>Systematic Color Palette <i class="github icon" />
        </h1>
        </a>

        <p>
          Welcome to my Palette Generator. I have built this tool as I was struggling to find
          a palette generator that was easy to use and customize. I hope you find it useful.
        </p>

        <p>
          Systematic palette generator uses a parabolic formula to autofill
          color saturation for various intervals, given color hue and luminance.
          The tools gives you a wide range of control over palette parameters and
          allows you to bulk edit HSL levels, as well as define the number of shades
          and hues in your palette. It also makes it easier to work color contrast and
          accessibility.
        </p>

        <p>
          Each color swatch also shows you the color contrast against black/white text.
          WCAG 2.0 specification requires color contrast of at least 4.5:1 for texts
          under 18pt (24px) for a contrast to be considered accessible for people
          with vision impairments.
        </p>
      </div>
    </div>

    <form class="ui form mini">
      <div class="ui stackable grid padded">
        <div class="two wide column">
          <div class="field">
            <label>Base luminance</label>

            <div class="ui left labeled input">
              <div
                class="ui label"
                title="Luminance at Level 6"
              >
                L<sub>6</sub>
              </div>
              <input
                v-model.number="model.luminance"
                type="number"
                step="1"
                min="0"
                max="100"
                required
              >
            </div>
          </div>

          <div class="field">
            <label>Preview Hue</label>

            <div class="ui left labeled input">
              <div
                class="ui label"
                title="Hue for chart preview"
              >
                H<sup>&deg;</sup>
              </div>
              <input
                v-model.number="model.hue"
                type="number"
                step="1"
                min="0"
                max="360"
                required
              >
            </div>
          </div>

          <div class="field">
            <label>Saturation</label>

            <div class="ui left labeled input">
              <div class="ui label">
                a
              </div>
              <input
                v-model.number="model.factor"
                type="number"
                step="0.01"
                min="-100"
                max="100"
                required
              >
            </div>

            <div class="ui left labeled input">
              <div class="ui label">
                b
              </div>
              <input
                v-model.number="model.adjust"
                type="number"
                step="0.01"
                min="-100"
                max="100"
                required
              >
            </div>

            <div class="ui left labeled input">
              <div class="ui label">
                c
              </div>
              <input
                v-model.number="model.shiftS"
                type="number"
                step="0.01"
                min="-100"
                max="100"
                required
              >
            </div>
          </div>

          <div class="field">
            <label>Target Contrast Ratio</label>
            <div class="ui input">
              <input
                v-model.number="model.contrast"
                type="number"
                step="0.1"
                min="1"
                max="21"
                required
              >
            </div>
          </div>

          <div class="field">
            <label>Dark Text</label>
            <div class="ui input color">
              <input
                v-model="model.dark"
                type="color"
                required
              >
            </div>
          </div>

          <div class="field">
            <label>Light Text</label>
            <div class="ui input color">
              <input
                v-model="model.light"
                type="color"
                required
              >
            </div>
          </div>
        </div>

        <div class="four wide column">
          <h3 class="ui center aligned header">
            S = a
            <small>x</small>
            L<sup>2</sup>
            <small>+</small>
            b
            <small>x</small>
            L
            <small>+</small>
            c
          </h3>
          <ColorChart
            :chart-data="chartData"
            :options="chartOptions"
          />
        </div>

        <div class="ten wide column">
          <div class="palette">
            <div
              v-for="(color, index) in model.colors"
              :key="index"
            >
              <div
                v-for="(swatch, index2) in swatches[index]"
                :key="index2"
              >
                <div
                  class="color-box small"
                  :class="{ negative: swatch.contrast < model.contrast }"
                  :style="getBoxStyle(swatch)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="ui grid padded">
        <div class="column">
          <table class="ui celled table">
            <thead>
              <tr>
                <th />
                <th
                  v-for="(level, index) in model.levels"
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

    <div class="ui instructive bottom attached segment">
      <ColorCode :swatches="swatches" />
    </div>
  </div>
</template>

<script setup>
import { reactive, computed } from 'vue';
import tinycolor from 'tinycolor2';
import ColorCode from './ColorCode.vue';
import ColorChart from './ColorChart.vue';

const offsets = [44, 40, 36, 27, 18, 9, 0, -9, -18, -27];

const createLevels = () => offsets.map((offset, index) => ({
  offset,
  lightText: index >= 6,
}));

const defaults = {
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

const createColors = () => Object.keys(defaults).map((name) => ({
  name,
  hue: defaults[name],
  saturationOffset: name === 'grey' ? -100 : 0,
  luminanceOffset: 0,
  levels: offsets.map(() => ({ offset: 0 })),
}));

const model = reactive({
  luminance: 50,
  hue: 0,
  factor: 0,
  adjust: 0,
  shiftS: 0.8,
  contrast: 4.5,
  light: '#ffffff',
  dark: '#000000',
  levels: createLevels(),
  colors: createColors(),
});

const minmax = (val) => Math.max(Math.min(val, 0.99), 0.01);

const calcLuminance = (levelIndex, color = null) => {
  const colorOffset = color ? color.levels[levelIndex].offset + color.luminanceOffset : 0;
  const offset = model.levels[levelIndex].offset + colorOffset;
  const luminance = model.luminance + offset;
  return minmax(luminance / 100);
};

const calcSaturation = (luminance) => {
  const saturation = (luminance ** 2) * model.factor
    + luminance * model.adjust
    + model.shiftS;
  return minmax(saturation);
};

const calcContrast = (foreground, background) => {
  const relBrightness = (light) => {
    const sRgb = light / 255;
    if (sRgb <= 0.03928) {
      return sRgb / 12.92;
    }
    return ((sRgb + 0.055) / 1.055) ** 2.4;
  };

  const relLuminance = (rgb) => (
    0.2126 * relBrightness(rgb.r)
    + 0.7152 * relBrightness(rgb.g)
    + 0.0722 * relBrightness(rgb.b)
  );

  const fRL = relLuminance(foreground.toRgb());
  const bRL = relLuminance(background.toRgb());

  return ((Math.max(fRL, bRL) + 0.05) / (Math.min(fRL, bRL) + 0.05)).toFixed(2);
};

const swatches = computed(() => {
  return model.colors.map((color) => (
    Object.keys(model.levels).map((i) => {
      const luminance = calcLuminance(i, color);
      const saturation = calcSaturation(luminance);
      const isLightText = model.levels[i].lightText;

      const swatch = tinycolor({
        h: color.hue || 0,
        s: saturation + color.saturationOffset / 100,
        l: luminance,
      });

      swatch.name = `${color.name}-${i}`;
      swatch.text = isLightText ? model.light : model.dark;
      swatch.contrast = calcContrast(tinycolor(swatch.text), swatch);
      swatch.baseColor = color;

      return swatch;
    })
  ));
});

const chartData = computed(() => ({
  datasets: model.levels.map((level, index) => {
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

const chartOptions = computed(() => ({
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

const getBoxStyle = (swatch) => ({
  backgroundColor: swatch.toHslString(),
  color: swatch.text,
});

const addColor = () => {
  model.colors.push({
    name: 'other',
    hue: Math.floor(Math.random() * 360),
    saturationOffset: 0,
    luminanceOffset: 0,
    levels: model.levels.map(() => ({ offset: 0 })),
  });
};

const removeColor = (index) => {
  model.colors.splice(index, 1);
};

const removeLevel = (index) => {
  model.levels.splice(index, 1);
  model.colors.forEach((color) => color.levels.splice(index, 1));
};

// Expose for testing
defineExpose({
  model,
  swatches,
  calcContrast,
  addColor,
});
</script>

<style>
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

.color-box.small {
  min-width: 32px;
  height: 32px;
  border-radius: 0;
}

.color-box.small.negative:after {
  content: "\00d7";
  font-size: 16px;
  line-height: 32px;
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

.palette {
  display: flex;
}

.ui.form.mini .ui.checkbox label {
  font-size: 0.8em;
}

.ui.input.color > input {
  padding: 0;
}
</style>
