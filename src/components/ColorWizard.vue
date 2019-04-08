<template>
  <div>
    <div class="ui grid padded">
      <div class="column">
        <a href="http://github.com/hypejunction/color-wizard"><h1>Systematic Color Palette <i class="github icon"></i>
        </h1>
        </a>

        <p>
          Systematic palette generator uses a parabolic formula to autofill
          color saturation for various intervals, given color hue and luminance.
          Each color swatch also shows you the color contrast against black/white text.
          WCAG 2.0 specification requires color contrast of at least 4.5:1 for texts
          under 18pt (24px) for a contrast to be considered accessible for people
          with vision impairments.
        </p>
      </div>
    </div>

    <form class="ui form">
      <div class="ui grid padded">
        <div class="column">
          <div class="fields">
            <div class="field">
              <label>Base luminance</label>
              <div class="ui input">
                <input
                  type="number"
                  step="1"
                  min="0"
                  max="100"
                  v-model.number="model.luminance"
                  required
                />
              </div>
            </div>

            <div class="field">
              <label>Saturation</label>
              <div class="field inline">
                <div class="ui input">
                  <input
                    type="number"
                    step="0.01"
                    min="-100"
                    max="100"
                    v-model.number="model.factor"
                    required
                  />
                </div>
                <span>x Luminance<sup>2</sup></span>&nbsp;<span>+</span>
                                                    &nbsp;
                <div class="ui input">
                  <input
                    type="number"
                    step="0.01"
                    min="-100"
                    max="100"
                    v-model.number="model.shift"
                    required
                  />
                </div>
              </div>
            </div>

            <div class="field">
              <label>Target Contrast Ratio</label>
              <div class="ui input">
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="21"
                  v-model.number="model.contrast"
                  required
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
              <th></th>
              <th v-for="(level, index) in model.levels" :key="index">
                Level {{ index }}
              </th>
            </tr>
            </thead>
            <tbody>
            <tr>
              <td></td>
              <td v-for="(level, index) in model.levels" :key="index">
                <div class="field">
                  <label>L Offset</label>
                  <input
                    type="number"
                    step="1"
                    min="-100"
                    max="100"
                    v-model.number="level.offset"
                  />
                </div>

                <div class="field">
                  <div class="ui checkbox">
                    <input type="checkbox" v-model="level.whiteText">
                    <label>White Text</label>
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

            <tr v-for="(color, index) in model.colors" :key="index" class="top aligned">
              <td>
                <div class="field">
                  <label>Name</label>
                  <input type="text" placeholder="Hue Name" v-model="color.name" required>
                </div>

                <div class="field">
                  <label>Hue</label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    max="360"
                    v-model.number="color.hue"
                    required
                  />
                </div>

                <div class="field">
                  <div class="ui checkbox">
                    <input type="checkbox" v-model="color.greyscale">
                    <label>Grayscale</label>
                  </div>
                </div>

                <div class="field">
                  <button
                    class="mini ui button basic"
                    @click.prevent="removeColor(index)"
                  >Remove
                  </button>
                </div>
              </td>

              <td
                v-for="(swatch, index2) in swatches[index]"
                :key="index2"
                :class="{ negative: swatch.contrast < model.contrast }"
              >
                <template v-if="swatch">
                  <div
                    class="color-box"
                    :style="getBoxStyle(swatch)"
                  >
                    <span class="color-name" title="Color Variant Name">
                      {{ swatch.name }}
                    </span>

                    <span class="color-contrast" title="Contrast Ratio">
                      {{ `${swatch.contrast}:1` }}
                    </span>
                  </div>

                  <div class="color-meta">
                    <div>{{ swatch.toHexString() }}</div>
                    <div>{{ swatch.toRgbString() }}</div>
                    <div>{{ swatch.toHslString() }}</div>
                  </div>

                  <div class="ui divider"></div>

                  <div class="field">
                    <label>L Offset</label>
                    <input
                      type="number"
                      step="1"
                      min="-50"
                      max="50"
                      v-model.number="color.levels[index2].offset"
                    />
                  </div>
                </template>
              </td>
            </tr>
            </tbody>
          </table>

          <a class="ui button primary" @click.prevent="addColor">Add Color</a>
        </div>
      </div>
    </form>

    <div class="ui instructive bottom attached segment">
      <ColorCode :swatches="swatches"/>
    </div>
  </div>
</template>

<script>
import tinycolor from 'tinycolor2';
import ColorCode from './ColorCode.vue';

const offsets = [44, 40, 36, 27, 18, 9, 0, -9, -18, -27];
const levels = offsets.map((offset, index) => ({
  offset,
  whiteText: index >= 6,
}));

const defaults = {
  grey: 0,
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
};

const colors = Object.keys(defaults)
  .map(e => ({
    name: e,
    hue: defaults[e],
    greyscale: e === 'grey',
    levels: offsets.map(() => ({
      offset: 0,
    })),
  }));

export default {
  name: 'ColorWizard',
  components: { ColorCode },
  data() {
    return {
      model: {
        luminance: 46,
        factor: 0.15,
        shift: 0.8,
        contrast: 4.5,
        levels,
        colors,
      },
    };
  },

  computed: {
    swatches() {
      return this.model.colors.map((color) => {
        const minmax = val => Math.max(Math.min(val, 0.99), 0.01);
        const calcSaturation = y => y * y * this.model.factor + this.model.shift;

        return Object.keys(this.model.levels)
          .map((i) => {
            const level = this.model.levels[i];
            const colorLevel = color.levels[i];
            const offset = level.offset + colorLevel.offset;
            const luminance = minmax((this.model.luminance + offset) / 100);
            const saturation = minmax(calcSaturation(luminance));

            const swatch = tinycolor({
              h: color.hue || 0,
              s: saturation,
              l: luminance,
            });

            if (color.greyscale) {
              swatch.greyscale();
            }

            swatch.name = `${color.name}-${i}`;
            swatch.offset = offset;
            swatch.text = level.whiteText ? '#ffffff' : '#000000';
            swatch.contrast = this.calcContrast(tinycolor(swatch.text), swatch);

            return swatch;
          });
      });
    },
  },

  methods: {
    getBoxStyle(swatch) {
      return {
        backgroundColor: swatch.toHslString(),
        color: swatch.text,
      };
    },

    addColor() {
      this.model.colors.push({
        name: 'other',
        hue: Math.floor(Math.random() * Math.floor(360)),
        greyscale: false,
        levels: this.levels.map(() => ({ offset: 0 })),
      });
    },

    removeColor(index) {
      this.model.colors.splice(index, 1);
    },

    removeLevel(index) {
      this.model.levels.splice(index, 1);
      this.model.colors.forEach(color => color.levels.splice(index, 1));
    },

    calcContrast(foreground, background) {
      // https://www.w3.org/TR/WCAG20-TECHS/G18.html
      const relBrightness = (light) => {
        const sRgb = light / 255;
        if (sRgb <= 0.03928) {
          return sRgb / 12.92;
        }

        return ((sRgb + 0.055) / 1.055) ** 2.4;
      };

      const relLuminance = rgb => (
        0.2126 * relBrightness(rgb.r)
        + 0.7152 * relBrightness(rgb.g)
        + 0.0722 * relBrightness(rgb.b)
      );

      const fRL = relLuminance(foreground.toRgb());
      const bRL = relLuminance(background.toRgb());

      return ((Math.max(fRL, bRL) + 0.05) / (Math.min(fRL, bRL) + 0.05)).toFixed(2);
    },
  },
};
</script>

<style>
  .color-box {
    position: relative;
    min-width: 100px;
    width: 100%;
    height: 150px;
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
    margin-top: 8px;
    white-space: nowrap;
    font-size: 12px;
    line-height: normal;
  }

  .color-meta > div {
    margin-top: 4px;
  }
</style>
