<template>
  <div>
    <div class="ui grid padded">
      <div class="column">
        <a href="http://github.com/hypejunction/color-wizard"><h1>Systematic Color Palette <i class="github icon"></i>
        </h1>
        </a>
      </div>
    </div>

    <form class="ui form">
      <div class="ui grid padded">
        <div class="column">
          <div class="fields">
            <div class="field">
              <label>Base luminance</label>
              <div class="ui input">
                <input type="number" step="1" min="0" max="100" v-model.number="model.luminance" required>
              </div>
            </div>

            <div class="field">
              <label>Saturation</label>
              <div class="field inline">
                &nbsp;
                <div class="ui right labeled input">
                  <input type="number" step="0.01" min="-100" max="100" v-model.number="model.factor" required>
                  <div class="ui label">Luminance<sup>2</sup></div>
                </div>
                <div class="ui label">+</div>
                &nbsp;
                <div class="ui input">
                  <input type="number" step="0.01" min="-100" max="100" v-model.number="model.shift" required>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="ui grid padded">
        <div class="column">
          <table class="ui celled table">
            <tr>
              <td></td>
              <td v-for="(offset, index) in model.offsets" :key="index">
                <div class="field">
                  <label>Luminance {{ index }}</label>
                  <input type="number" step="1" min="-100" max="100" v-model.number="offset.offset"/>
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
                  <input type="number" step="1" min="0" max="360" v-model.number="color.hue" required>
                </div>

                <div class="ui checkbox">
                  <input type="checkbox" v-model="color.grayscale">
                  <label>Grayscale</label>
                </div>
              </td>

              <td v-for="(step, index2) in swatches[index]" :key="index2">
                <template v-if="step">
                  <div
                    class="color-box"
                    :style="getBoxStyle(step)"
                    :data-name="step.name"
                  >
                  </div>

                  <div class="color-meta">
                    <div>{{ step.toHexString() }}</div>
                    <div>{{ step.toRgbString() }}</div>
                    <div>{{ step.toHslString() }}</div>
                  </div>
                </template>
              </td>
            </tr>
          </table>

          <a class="ui button primary" @click.prevent="addColor">Add Color</a>
        </div>
      </div>
    </form>

    <div class="ui instructive bottom attached segment">
      <pre><code class="code css">:root { {{ cssVars.join('\n') }} }</code></pre>
    </div>
  </div>
</template>

<script>
import tinycolor from 'tinycolor2';

const offsets = [44, 40, 36, 27, 18, 9, 0, -9, -18, -27].map(e => ({ offset: e }));
const defaults = {
  red: 360,
  pink: 339,
  grape: 174,
  violet: 255,
  indigo: 288,
  blue: 208,
  cyan: 188,
  teal: 162,
  green: 131,
  lime: 85,
  yellow: 39,
  orange: 24,
  gray: 210,
};

const colors = Object.keys(defaults)
  .map((e) => {
    return {
      name: e,
      hue: defaults[e],
      grayscale: e === 'gray',
    };
  });

export default {
  name: 'ColorWizard',
  data() {
    return {
      model: {
        luminance: 55,
        factor: 2.8,
        shift: 0,
        offsets,
        colors,
      },
    };
  },

  computed: {
    swatches() {
      return this.model.colors.map((color) => {
        const minmax = val => Math.max(Math.min(val, 0.99), 0.01);
        const calcSaturation = y => y * y * this.model.factor + this.model.shift;

        return Object.keys(this.model.offsets)
          .map((i) => {
            const luminance = minmax((this.model.luminance + this.model.offsets[i].offset) / 100);
            const saturation = minmax(calcSaturation(luminance));

            const swatch = tinycolor({
              h: color.hue || 0,
              s: saturation,
              l: luminance,
            });

            if (color.grayscale) {
              swatch.greyscale();
            }

            swatch.name = `${color.name}-${i}`;

            return swatch;
          });
      });
    },

    cssVars() {
      return this.swatches.reduce((result, el) => {
        console.log(result, el);

        const vars = el.map((e) => {
          const hsl = e.toHslString();

          return `--${e.name}: ${hsl};`;
        });

        result.push(...vars);

        return result;
      }, []);
    },
  },

  methods: {
    getBoxStyle(color) {
      return {
        backgroundColor: color.toHslString(),
        color: color.isDark() ? 'white' : 'black',
      };
    },

    addColor() {
      this.model.colors.push({
        name: 'other',
        hue: Math.floor(Math.random() * Math.floor(360)),
      });
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

  .color-box:after {
    content: attr(data-name);
    position: absolute;
    top: 0;
    right: 0;
    margin: 4px 8px;
    font-size: 12px;
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
