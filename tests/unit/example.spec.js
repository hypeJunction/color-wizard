import { expect } from 'chai';
import { shallowMount } from '@vue/test-utils';
import tinycolor from 'tinycolor2';
import ColorWizard from '../../src/components/ColorWizard.vue';

describe('ColorWizard.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(ColorWizard);
  });

  afterEach(() => {
    wrapper.destroy();
    wrapper = null;
  });

  it('computes swatches', () => {
    wrapper.setData({
      model: {
        luminance: 60,
        factor: 2.2,
        shift: -0.2,
        contrast: 4.5,
        levels: [{
          offset: -10,
          whiteText: false,
        }],
        colors: [{
          name: 'test',
          hue: 5,
          grayscale: false,
        }],
      },
    });

    const { vm } = wrapper;
    const { swatches } = vm;

    expect(swatches.length)
      .to
      .equal(1);
    expect(swatches[0].length)
      .to
      .equal(1);

    const swatch = swatches[0][0];

    expect(swatch.name)
      .to
      .equals('test-0');
    expect(swatch.offset)
      .to
      .equals(-10);
    expect(swatch.text)
      .to
      .equals('#000000');

    const hsl = tinycolor(
      {
        h: 5,
        s: 0.5 * 0.5 * 2.2 - 0.2, // l^2 * factor + shift
        l: 0.5, // 60 - 10
        a: 1,
      },
    )
      .toHsl();

    expect(swatch.toHsl())
      .to
      .eql(hsl);
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

      expect(vm.calcContrast(foreground, background))
        .to
        .equal(test[2]);
    });
  });
});
