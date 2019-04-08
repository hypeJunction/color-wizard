<template>
  <Tabs :tabs="tabs">
    <div slot="css">
      <vue-code-highlight language="css">{{ css }}</vue-code-highlight>
    </div>

    <div slot="scss">
      <vue-code-highlight language="css">{{ scss }}</vue-code-highlight>
    </div>

    <div slot="json">
      <vue-code-highlight language="javascript">module.exports = {{ JSON.stringify(json, undefined, 2) }}
      </vue-code-highlight>
    </div>
  </Tabs>
</template>

<script>
import { component as VueCodeHighlight } from 'vue-code-highlight';
import Tabs from './Tabs.vue';

export default {
  name: 'ColorCode',

  components: {
    Tabs,
    VueCodeHighlight,
  },

  props: {
    swatches: {
      type: Array,
      required: true,
    },
  },

  data() {
    return {
      tabs: [
        {
          id: 'css',
          label: 'CSS',
          selected: true,
        },
        {
          id: 'scss',
          label: 'SCSS',
        },
        {
          id: 'json',
          label: 'JSON',
        },
      ],
    };
  },

  computed: {
    css() {
      const css = this.swatches.reduce((result, el) => {
        const vars = el.map((e) => {
          const hsl = e.toHslString();

          return `         --${e.name}: ${hsl};`;
        });

        result.push(...vars);

        return result;
      }, []);

      return `:root { \n${css.join('\n')} }`;
    },

    scss() {
      const scss = this.swatches.reduce((result, el) => {
        const vars = el.map((e) => {
          const hsl = e.toHslString();

          return `$color-${e.name}: ${hsl};`;
        });

        result.push(...vars);

        return result;
      }, []);

      return `${scss.join('\n')}`;
    },

    json() {
      return this.swatches.reduce((result, el) => {
        const data = Object.assign({}, result);

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
    },
  },
};
</script>

<style scoped>
  @import '~vue-code-highlight/themes/prism-tomorrow.css';
</style>
