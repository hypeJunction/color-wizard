import { describe, it, expect, beforeEach } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import tinycolor from 'tinycolor2';
import type { Instance as TinycolorInstance } from 'tinycolor2';
import ColorWizard from '../../src/components/ColorWizard.vue';

interface ColorDefinition {
  name: string;
  hue: number;
  saturationOffset: number;
  luminanceOffset: number;
  levels: { offset: number }[];
  greyscale?: boolean;
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

interface ColorWizardVM {
  model: {
    luminance: number;
    hue: number;
    formulaType: FormulaType;
    formulaParams: FormulaParams;
    contrast: number;
    light: string;
    dark: string;
    levels: { offset: number; lightText: boolean }[];
    colors: ColorDefinition[];
  };
  swatches: Swatch[][];
  calcContrast: (foreground: TinycolorInstance, background: TinycolorInstance) => number;
  addColor: () => void;
}

describe('ColorWizard.vue', () => {
  let wrapper: VueWrapper;

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
    const vm = wrapper.vm as unknown as ColorWizardVM;

    // Update the model for testing
    vm.model.luminance = 60;
    vm.model.formulaType = 'parabolic';
    vm.model.formulaParams = { a: 2.2, b: 0, c: -0.2, d: 0 };
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
      s: 0.5 * 0.5 * 2.2 - 0.2, // aL² + bL + c = 2.2 * 0.5² + 0 * 0.5 + (-0.2)
      l: 0.5, // 60 - 10
      a: 1,
    }).toHsl();

    expect(swatch.toHsl()).toEqual(hsl);
  });

  it('calculates contrast', () => {
    const vm = wrapper.vm as unknown as ColorWizardVM;

    const tests: [string, string, number][] = [
      ['#000000', '#000000', 1.00],
      ['#000000', '#ffffff', 21.00],
      ['#0000ff', '#ffffff', 8.59],
      ['#ffffff', '#0000ff', 8.59],
    ];

    tests.forEach((test) => {
      const foreground = tinycolor(test[0]);
      const background = tinycolor(test[1]);

      expect(vm.calcContrast(foreground, background)).toBe(test[2]);
    });
  });

  it('adds color', async () => {
    const vm = wrapper.vm as unknown as ColorWizardVM;

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

  describe('saturation formulas', () => {
    const minmax = (val: number): number => Math.max(Math.min(val, 0.99), 0.01);

    const setupSingleSwatch = async (
      vm: ColorWizardVM,
      formulaType: FormulaType,
      formulaParams: FormulaParams,
      luminance: number,
    ) => {
      vm.model.luminance = luminance;
      vm.model.formulaType = formulaType;
      vm.model.formulaParams = formulaParams;
      vm.model.levels = [{ offset: 0, lightText: false }];
      vm.model.colors = [{
        name: 'test',
        hue: 180,
        greyscale: false,
        levels: [{ offset: 0 }],
        saturationOffset: 0,
        luminanceOffset: 0,
      }];
    };

    it('calculates linear formula: S = aL + b', async () => {
      const vm = wrapper.vm as unknown as ColorWizardVM;
      const a = 0.5, b = 0.3;
      const L = 0.6;

      await setupSingleSwatch(vm, 'linear', { a, b, c: 0, d: 0 }, L * 100);
      await wrapper.vm.$nextTick();

      const expectedS = minmax(a * L + b);
      expect(vm.swatches[0][0].toHsl().s).toBeCloseTo(expectedS, 5);
    });

    it('calculates constant formula: S = c', async () => {
      const vm = wrapper.vm as unknown as ColorWizardVM;
      const c = 0.75;

      await setupSingleSwatch(vm, 'constant', { a: 0, b: 0, c, d: 0 }, 50);
      await wrapper.vm.$nextTick();

      expect(vm.swatches[0][0].toHsl().s).toBeCloseTo(c, 5);
    });

    it('calculates sinusoidal formula: S = a×sin(bL + c) + d', async () => {
      const vm = wrapper.vm as unknown as ColorWizardVM;
      const a = 0.3, b = Math.PI, c = 0, d = 0.5;
      const L = 0.5;

      await setupSingleSwatch(vm, 'sinusoidal', { a, b, c, d }, L * 100);
      await wrapper.vm.$nextTick();

      const expectedS = minmax(a * Math.sin(b * L + c) + d);
      expect(vm.swatches[0][0].toHsl().s).toBeCloseTo(expectedS, 5);
    });

    it('calculates exponential formula: S = a×e^(bL) + c', async () => {
      const vm = wrapper.vm as unknown as ColorWizardVM;
      const a = 0.2, b = 1, c = 0.3;
      const L = 0.5;

      await setupSingleSwatch(vm, 'exponential', { a, b, c, d: 0 }, L * 100);
      await wrapper.vm.$nextTick();

      const expectedS = minmax(a * Math.exp(b * L) + c);
      expect(vm.swatches[0][0].toHsl().s).toBeCloseTo(expectedS, 3);
    });

    it('calculates power formula: S = aL^b + c', async () => {
      const vm = wrapper.vm as unknown as ColorWizardVM;
      const a = 0.5, b = 2, c = 0.2;
      const L = 0.6;

      await setupSingleSwatch(vm, 'power', { a, b, c, d: 0 }, L * 100);
      await wrapper.vm.$nextTick();

      const expectedS = minmax(a * (L ** b) + c);
      expect(vm.swatches[0][0].toHsl().s).toBeCloseTo(expectedS, 5);
    });

    it('calculates gaussian formula: S = a×e^(-(L-b)²/c²) + d', async () => {
      const vm = wrapper.vm as unknown as ColorWizardVM;
      const a = 0.6, b = 0.5, c = 0.3, d = 0.2;
      const L = 0.5;

      await setupSingleSwatch(vm, 'gaussian', { a, b, c, d }, L * 100);
      await wrapper.vm.$nextTick();

      const expectedS = minmax(a * Math.exp(-((L - b) ** 2) / (c ** 2)) + d);
      expect(vm.swatches[0][0].toHsl().s).toBeCloseTo(expectedS, 5);
    });

    it('calculates sigmoid formula: S = a/(1 + e^(-b(L-c))) + d', async () => {
      const vm = wrapper.vm as unknown as ColorWizardVM;
      const a = 0.6, b = 10, c = 0.5, d = 0.2;
      const L = 0.7;

      await setupSingleSwatch(vm, 'sigmoid', { a, b, c, d }, L * 100);
      await wrapper.vm.$nextTick();

      const expectedS = minmax(a / (1 + Math.exp(-b * (L - c))) + d);
      expect(vm.swatches[0][0].toHsl().s).toBeCloseTo(expectedS, 3);
    });

    it('calculates logarithmic formula: S = a×ln(bL + 1) + c', async () => {
      const vm = wrapper.vm as unknown as ColorWizardVM;
      const a = 0.5, b = 2, c = 0.3;
      const L = 0.6;

      await setupSingleSwatch(vm, 'logarithmic', { a, b, c, d: 0 }, L * 100);
      await wrapper.vm.$nextTick();

      const expectedS = minmax(a * Math.log(b * L + 1) + c);
      expect(vm.swatches[0][0].toHsl().s).toBeCloseTo(expectedS, 3);
    });

    it('calculates cubic formula: S = aL³ + bL² + cL + d', async () => {
      const vm = wrapper.vm as unknown as ColorWizardVM;
      const a = 1, b = -1.5, c = 0.5, d = 0.5;
      const L = 0.5;

      await setupSingleSwatch(vm, 'cubic', { a, b, c, d }, L * 100);
      await wrapper.vm.$nextTick();

      const expectedS = minmax(a * (L ** 3) + b * (L ** 2) + c * L + d);
      expect(vm.swatches[0][0].toHsl().s).toBeCloseTo(expectedS, 5);
    });

    it('calculates inverse formula: S = a/(L + b) + c', async () => {
      const vm = wrapper.vm as unknown as ColorWizardVM;
      const a = 0.3, b = 0.5, c = 0.3;
      const L = 0.5;

      await setupSingleSwatch(vm, 'inverse', { a, b, c, d: 0 }, L * 100);
      await wrapper.vm.$nextTick();

      const expectedS = minmax(a / (L + b) + c);
      expect(vm.swatches[0][0].toHsl().s).toBeCloseTo(expectedS, 5);
    });

    it('clamps saturation to valid range [0.01, 0.99]', async () => {
      const vm = wrapper.vm as unknown as ColorWizardVM;

      // Test clamping to max (0.99)
      await setupSingleSwatch(vm, 'constant', { a: 0, b: 0, c: 5, d: 0 }, 50);
      await wrapper.vm.$nextTick();
      expect(vm.swatches[0][0].toHsl().s).toBeCloseTo(0.99, 5);

      // Test clamping to min (0.01)
      await setupSingleSwatch(vm, 'constant', { a: 0, b: 0, c: -5, d: 0 }, 50);
      await wrapper.vm.$nextTick();
      expect(vm.swatches[0][0].toHsl().s).toBeCloseTo(0.01, 5);
    });
  });
});
