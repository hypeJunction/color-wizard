import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import tinycolor from 'tinycolor2';
import ColorWizard from '../../src/components/ColorWizard.vue';

describe('ColorWizard.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(ColorWizard, {
      global: {
        stubs: {
          ColorChart: true,
        },
      },
    });
  });

  it('computes swatches', async () => {
    const { vm } = wrapper;

    // Update the model for testing
    vm.model.luminance = 60;
    vm.model.factor = 2.2;
    vm.model.adjust = 0;
    vm.model.shiftS = -0.2;
    vm.model.contrast = 4.5;
    vm.model.light = '#ffffff';
    vm.model.dark = '#000000';
    vm.model.levels = [{
      offset: -10,
      lightText: false,
    }];
    vm.model.colors = [{
      name: 'test',
      hue: 5,
      greyscale: false,
      levels: [{ offset: 0 }],
      saturationOffset: 0,
      luminanceOffset: 0,
    }];

    await wrapper.vm.$nextTick();

    const { swatches } = vm;

    expect(swatches.length).toBe(1);
    expect(swatches[0].length).toBe(1);

    const swatch = swatches[0][0];

    expect(swatch.name).toBe('test-0');
    expect(swatch.text).toBe('#000000');

    const hsl = tinycolor({
      h: 5,
      s: 0.5 * 0.5 * 2.2 - 0.2, // l^2 * factor + shift
      l: 0.5, // 60 - 10
      a: 1,
    }).toHsl();

    expect(swatch.toHsl()).toEqual(hsl);
  });

  it('calculates contrast', () => {
    const { vm } = wrapper;

    const tests = [
      ['#000000', '#000000', '1.00'],
      ['#000000', '#ffffff', '21.00'],
      ['#0000ff', '#ffffff', '8.59'],
      ['#ffffff', '#0000ff', '8.59'],
    ];

    tests.forEach((test) => {
      const foreground = tinycolor(test[0]);
      const background = tinycolor(test[1]);

      expect(vm.calcContrast(foreground, background)).toBe(test[2]);
    });
  });

  it('adds color', async () => {
    const { vm } = wrapper;

    vm.addColor();
    await wrapper.vm.$nextTick();

    const { swatches } = vm;

    expect(swatches.length).toBe(14);
    expect(swatches[0].length).toBe(10);

    const swatch = swatches[13][0];

    expect(swatch.name).toBe('other-0');
    expect(swatch.text).toBe('#000000');

    const hsl = tinycolor({
      h: swatch.baseColor.hue,
      s: 0.8,
      l: 0.94,
      a: 1,
    }).toHsl();

    expect(swatch.toHsl()).toEqual(hsl);
  });
});
