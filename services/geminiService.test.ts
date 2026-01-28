import { describe, it, expect } from 'vitest';

import {
  DamageType,
  FacePreservation,
  Intensity,
  PhotoType,
  RepairType,
  RestorationOptions,
} from '../types';

import { buildPrompt } from './geminiService';

const baseOptions: RestorationOptions = {
  photoType: PhotoType.B_AND_W,
  damageTypes: [],
  intensity: Intensity.MODERATE,
  colorize: false,
  preserveGrain: true,
  facePreservation: FacePreservation.STRICT,
  localRepairRegions: [],
  preEnhance: false,
};

describe('buildPrompt', () => {
  it('includes intensity and photo type', () => {
    const prompt = buildPrompt(baseOptions);
    expect(prompt).toContain('moderate restoration');
    expect(prompt).toContain('old b&w');
  });

  it('includes damage types when specified', () => {
    const options: RestorationOptions = {
      ...baseOptions,
      damageTypes: [DamageType.SCRATCHES, DamageType.TEARS],
    };
    const prompt = buildPrompt(options);
    expect(prompt).toContain('Damage repair:');
    expect(prompt).toContain('scratches');
    expect(prompt).toContain('tears');
  });

  it('omits damage section when no damage types', () => {
    const prompt = buildPrompt(baseOptions);
    expect(prompt).not.toContain('Damage repair:');
  });

  it('includes face preservation instructions', () => {
    const strictPrompt = buildPrompt({
      ...baseOptions,
      facePreservation: FacePreservation.STRICT,
    });
    expect(strictPrompt).toContain('absolute fidelity');

    const flexiblePrompt = buildPrompt({
      ...baseOptions,
      facePreservation: FacePreservation.FLEXIBLE,
    });
    expect(flexiblePrompt).toContain('natural look');
  });

  it('includes colorization only for B&W with colorize enabled', () => {
    const colorizeEnabled = buildPrompt({
      ...baseOptions,
      photoType: PhotoType.B_AND_W,
      colorize: true,
    });
    expect(colorizeEnabled).toContain('Colorize this black-and-white');

    const colorizeDisabled = buildPrompt({
      ...baseOptions,
      photoType: PhotoType.B_AND_W,
      colorize: false,
    });
    expect(colorizeDisabled).not.toContain('Colorize');

    const notBW = buildPrompt({
      ...baseOptions,
      photoType: PhotoType.FADED_COLOR,
      colorize: true,
    });
    expect(notBW).not.toContain('Colorize');
  });

  it('handles grain preservation setting', () => {
    const preserveGrain = buildPrompt({
      ...baseOptions,
      preserveGrain: true,
    });
    expect(preserveGrain).toContain('Preserve the original film grain');

    const removeGrain = buildPrompt({
      ...baseOptions,
      preserveGrain: false,
    });
    expect(removeGrain).toContain('Reduce noise and grain');
  });

  it('includes local repair regions with coordinates', () => {
    const options: RestorationOptions = {
      ...baseOptions,
      localRepairRegions: [
        {
          x: 10,
          y: 20,
          width: 30,
          height: 40,
          type: RepairType.FIX_DAMAGE,
          instruction: 'Remove stain',
        },
      ],
    };
    const prompt = buildPrompt(options);
    expect(prompt).toContain('Local repairs needed');
    expect(prompt).toContain('x:10%');
    expect(prompt).toContain('y:20%');
    expect(prompt).toContain('w:30%');
    expect(prompt).toContain('h:40%');
    expect(prompt).toContain('Fix damage');
    expect(prompt).toContain('Remove stain');
  });

  it('handles all intensity levels', () => {
    const light = buildPrompt({ ...baseOptions, intensity: Intensity.LIGHT });
    expect(light).toContain('light restoration');

    const aggressive = buildPrompt({
      ...baseOptions,
      intensity: Intensity.AGGRESSIVE,
    });
    expect(aggressive).toContain('aggressive restoration');
  });
});
