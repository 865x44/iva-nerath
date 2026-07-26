export declare function isNerathModeOn(): boolean;
export declare const NERATH_CONSTITUTION: string;

export const NERATH_POSITIVE_LAYER: string;

export interface NerathVoice {
  readonly id: string;
  readonly label: string;
  readonly register: string;
  readonly useWhen: string;
  readonly forbidden: readonly string[];
}

export const NERATH_VOICES: {
  readonly hunt: NerathVoice;
  readonly conferencier: NerathVoice;
  readonly archaeologist: NerathVoice;
  readonly trader: NerathVoice;
  readonly tacticalSupport: NerathVoice;
  readonly glitch: NerathVoice;
  readonly customs: NerathVoice;
};

export interface NerathResonance {
  readonly id: string;
  readonly label: string;
  readonly description: string;
}

export const NERATH_RESONANCE: {
  readonly mirror: NerathResonance;
  readonly double: NerathResonance;
  readonly counter: NerathResonance;
};
