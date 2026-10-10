
// =====================================================================
//  MUSIC: NES-style chiptune BGM, synthesized live with Web Audio (no audio files).
//  4 channels like the NES APU: pulse 1 (lead), pulse 2 (echo / harmony / arpeggio), triangle (bass), noise (drums).
//  Songs are written as chord charts + melody bars (MUSIC_SONGS); bass, pulse-2 parts and drums are generated
//  from the chords by style. One sequencer (musicSchedule) drives both live play and the offline WAV render.
//  Live: routed into Snd.master (respects SOUND ON/OFF), starts only after a user gesture (Snd.init).
//  Scene -> track: musicWanted(). SOUND TEST: title "SOUND TEST" button / T key / ?soundtest=1.
//  All melodies are original compositions for ROCKSIDE.
// =====================================================================
// melody token: <note><octave>[:len in 16ths] (len carries over), r = rest. e.g. 'E5:2 G5 B5:4 r:2'
// drum chars per 16th: k kick, s snare, x kick+snare, h closed hat, o open hat, c crash, t taiko, r rim/woodblock, . none
const MUSIC_SONGS = {
  stage: { no: 1, name: 'ROCKSIDE ROAD', jp: '道中：みなとの冒険', mood: 'bright, adventurous D major road theme', bpm: 150,
    lead: { duty: 0.25, vol: 0.07, gate: 0.9 }, p2v: { duty: 0.125, vol: 0.045 },
    sections: {
      A: { chords: ['D', 'D', 'G', 'A', 'Bm', 'G', 'Em,A', 'D,A'], p2: 'echo', bass: 'oct8',
        drums: ['k.h.s.h.k.k.s.h.'], fill: 'k.h.s.h.k.s.ssss',
        mel: ['A4:2 D5 F#5 A5:4 F#5:2 G5 A5', 'B5:4 A5:2 F#5 E5:4 D5', 'G5:2 B5 D6:4 B5:2 A5 G5 B5', 'A5:6 E5:2 C#5:4 E5',
              'F#5:2 D5 B4 D5 F#5:4 B5', 'A5:2 G5 F#5 G5 B5:4 G5', 'E5:4 G5:2 B5 A5:4 C#6', 'D6:6 r:2 A5 B5 C#6:4'] },
      B: { chords: ['G', 'A', 'F#m', 'Bm', 'G', 'A', 'Bb', 'A'], p2: 'harm3', bass: 'pop',
        drums: ['k.h.s.hkk.hks.h.'], fill: 'k.s.s.s.kkssx.c.',
        mel: ['B5:4 A5:2 G5 D5:4 G5', 'A5:4 G5:2 F#5 E5:8', 'F#5:4 E5:2 C#5 A4:4 C#5', 'D5:2 E5 F#5:4 B5:8',
              'D6:4 B5:2 G5 D6:4 E6', 'C#6:4 A5:2 E5 A5:4 C#6', 'D6:4 F6 D6:2 Bb5 F5:4', 'E6:8 C#6:4 A5'] },
      C: { chords: ['Bm', 'G', 'Em', 'A'], p2: 'arp16', bass: 'oct8',
        drums: ['k.h.k.h.k.h.k.h.'], fill: 'k.s.k.s.sssscsss',
        mel: ['B4:4 r F#5 r', 'G5:4 r D5 r', 'E5:4 G5 B5 E6', 'C#6:2 B5 A5 G5 F#5 E5 D5 C#5'] } },
    order: ['A', 'B', 'C'] },

  tobiume: { no: 2, name: 'PLUM PETAL STORM', jp: '闇落ち飛梅のテーマ', mood: 'bouncy but menacing E minor, fast and playful like her flying kicks', bpm: 168,
    lead: { duty: 0.25, vol: 0.07, gate: 0.75 }, p2v: { duty: 0.5, vol: 0.035 },
    sections: {
      A: { chords: ['Em', 'C', 'D', 'B7', 'Em', 'C', 'Am,B7', 'Em'], p2: 'arp16', bass: 'gallop',
        drums: ['k.hhs.hhk.hhs.hk'], fill: 'k.hhs.hhk.s.ssss',
        mel: ['E5:1 r E5 r G5:2 B5 A5 G5 F#5 G5', 'E5:2 G5 C6:4 B5:2 G5 E5:4', 'F#5:2 A5 D6:4 C6:2 A5 F#5 D5', 'D#5:4 F#5:2 A5 B5:6 r:2',
              'B5:1 r B5 r A5:2 G5 E5 G5 B5:4', 'C6:4 B5:2 A5 G5:4 E5', 'A5:2 C6 B5 A5 F#5 A5 D#5:4', 'E5:6 G5:2 F#5 E5 D#5 E5'] },
      B: { chords: ['C', 'D', 'Bm', 'Em', 'Am', 'D', 'B', 'B7'], p2: 'harm3', bass: 'oct8',
        drums: ['k.h.s.hkk.h.s.hk'], fill: 'k.s.k.s.ssssx.x.',
        mel: ['G5:2 G5 G5 A5 B5:4 C6', 'A5:2 A5 A5 B5 C6:4 D6', 'F#6:4 D6:2 B5 F#5:4 B5', 'G6:4 E6:2 B5 G5:4 E5',
              'A5:2 B5 C6 E6 D6:4 C6', 'B5:2 C6 D6 F#6 E6:4 D6', 'D#6:8 F#6', 'B6:2 A6 F#6 D#6 B5 A5 F#5 D#5'] },
      A2: { base: 'A', p2: 'echo' } },
    order: ['A', 'B', 'A2'] },

  disaster: { no: 3, name: 'CRIMSON OVERLORD', jp: '魔王ディザスターのテーマ', mood: 'heavy demon-lord march in C harmonic minor, ominous and grand', bpm: 138,
    lead: { duty: 0.5, vol: 0.06, gate: 0.95 }, p2v: { duty: 0.125, vol: 0.04 },
    sections: {
      A: { chords: ['Cm', 'Cm', 'Ab', 'G', 'Cm', 'Fm', 'Db', 'G7'], p2: 'arp16', bass: 'march',
        drums: ['k..ks...k.k.s...'], fill: 'k..ks...ssssxxxx',
        mel: ['C5:6 Eb5:2 G5:8', 'Ab5:4 G5 Eb5 D5', 'C5:6 Eb5:2 Ab5:8', 'B4:4 D5 F5 G5',
              'C6:6 B5:2 C6:4 G5', 'Ab5:6 G5:2 F5:4 C5', 'Db5:4 F5 Ab5 Db6', 'B5:8 G5:4 F5:2 D5'] },
      B: { chords: ['Fm', 'G', 'Cm', 'Cm', 'Fm', 'G', 'Ab', 'Bdim'], p2: 'harm3', bass: 'oct8',
        drums: ['k.hks.hkk.hks.hk'], fill: 'k.k.s.k.ssssxcx.',
        mel: ['F5:2 Ab5 C6 Ab5 F5 Ab5 C6 F6', 'G6:4 F6:2 Eb6 D6:4 B5', 'C6:2 D6 Eb6:4 D6:2 C6 B5 G5', 'C6:12 r:4',
              'Ab6:4 G6:2 F6 Eb6:4 C6', 'D6:4 Eb6:2 F6 G6:4 B5', 'C6:4 Eb6 Ab6 G6', 'F6:4 D6 B5 Ab5'] } },
    order: ['A', 'B', 'A'] },

  neenia: { no: 4, name: 'MOONWOOD ARCHER', jp: '闇落ちネーニアのテーマ', mood: 'cool, swift A dorian under the moonlit trees; flowing arps like loosed arrows', bpm: 146,
    lead: { duty: 0.125, vol: 0.07, gate: 0.9 }, p2v: { duty: 0.25, vol: 0.035 },
    sections: {
      A: { chords: ['Am', 'G', 'Am', 'D', 'Am', 'G', 'F', 'E'], p2: 'arp16', bass: 'root8',
        drums: ['k.h.s.hhk.h.s.hh'], fill: 'k.h.s.hhk.s.ssss',
        mel: ['E5:4 A5:2 B5 C6:4 B5:2 A5', 'G5:2 D5 G5:4 B5 A5:2 G5', 'A5:6 E5:2 A5 B5 C6 D6', 'F#5:8 D5:4 A5',
              'E6:4 D6:2 C6 B5:4 A5', 'D6:4 B5:2 G5 D5:4 G5', 'A5:4 C6 F6 E6:2 D6', 'E6:8 G#5:4 B5'] },
      B: { chords: ['F', 'G', 'Em', 'Am', 'F', 'G', 'E', 'E7'], p2: 'echo', bass: 'oct8',
        drums: ['k.hhs.hhk.hhs.hh'], fill: 'k.hhs.hhs.ssx.c.',
        mel: ['C6:2 A5 F5:4 C6 D6', 'B5:2 G5 D5:4 B5 D6', 'E6:4 G5 B5 E6', 'C6:8 A5',
              'F6:4 E6:2 D6 C6:4 A5', 'G6:4 F6:2 E6 D6:4 B5', 'G#5:4 B5 E6 G#6', 'B6:4 G#6:2 E6 D6:4 B5'] },
      A2: { base: 'A', p2: 'harm3' } },
    order: ['A', 'B', 'A2'] },

  lily: { no: 5, name: 'MOONLIGHT IDOL', jp: '闇落ちリリィのテーマ', mood: 'idol-pop stage show: D minor verse into a sparkly F major chorus, four-on-the-floor', bpm: 160,
    lead: { duty: 0.25, vol: 0.07, gate: 0.85 }, p2v: { duty: 0.125, vol: 0.04 },
    sections: {
      V: { chords: ['Dm', 'Bb', 'C', 'A7', 'Dm', 'Bb', 'Gm', 'A'], p2: 'stab', bass: 'oct8',
        drums: ['k.h.x.h.k.h.x.ho'], fill: 'k.h.x.h.x.xxxxxx',
        mel: ['D5:2 F5 A5 F5 D5 F5 A5 C6', 'Bb5:4 A5:2 G5 F5:4 D5', 'E5:2 G5 C6 G5 E5 G5 C6 E6', 'C#6:6 A5:2 E5:4 G5',
              'F5:2 A5 D6:4 C6:2 A5 F5:4', 'G5:2 Bb5 D6:4 F6 D6', 'Bb5:4 A5:2 G5 D6:4 Bb5', 'A5:8 C#6:4 E6'] },
      C: { chords: ['Bb', 'C', 'Am', 'Dm', 'Bb', 'C', 'F', 'F'], p2: 'harm3', bass: 'oct8',
        drums: ['k.hox.hok.hox.ho'], fill: 'k.hox.hox.x.xcx.',
        mel: ['F6:2 F6 D6 F6:4 G6:2 F6:4', 'E6:2 E6 C6 E6:4 F6:2 G6:4', 'A6:4 G6:2 E6 C6:4 E6', 'D6:6 C6:2 A5:4 F5',
              'F6:2 F6 D6 F6:4 G6:2 A6:4', 'G6:4 F6:2 E6 G6:4 C6', 'F6:8 A6:4 C7', 'A6:4 G6 F6:8'] },
      C2: { base: 'C', p2: 'echo' } },
    order: ['V', 'C', 'C2'] },

  shiranui: { no: 6, name: 'FOXFIRE PROCESSION', jp: 'シラヌイのテーマ', mood: 'night-shrine procession in the Japanese miyako-bushi scale; taiko, woodblocks and a shamisen-like pulse', bpm: 136,
    lead: { duty: 0.125, vol: 0.075, gate: 0.85 }, p2v: { duty: 0.25, vol: 0.04 },
    sections: {
      A: { chords: ['D5', 'D5', 'Bb', 'A5', 'Gm', 'Bb', 'A5', 'D5'], bass: 'drone',
        p2line: 'D5:1 r A5 r Bb5 r A5 r D5 r A5 r Eb5:2 D5',
        drums: ['t.rt..r.t.rts...'], fill: 't.rt..r.t.t.tttt',
        mel: ['D5:4 Eb5:2 G5 A5:6 r:2', 'Bb5:4 A5:2 G5 Eb5:4 D5', 'Bb5:2 C6 D6:4 C6:2 Bb5 A5:4', 'A5:8 G5:2 A5 Bb5 A5',
              'G5:4 Bb5:2 A5 G5 Eb5 D5:4', 'D6:4 C6:2 Bb5 A5 Bb5 G5:4', 'A5:6 Bb5:1 A5 G5:4 Eb5', 'D5:12 r:4'] },
      B: { chords: ['Gm', 'A5', 'Bb', 'A5', 'Gm', 'Eb', 'A5', 'D5'], bass: 'drone',
        p2line: 'G5:1 r D6 r Bb5 r A5 r G5 r D6 r Eb6:2 D6',
        drums: ['t.rts.r.t.rts.rr'], fill: 't.t.t.ttsssscs..',
        mel: ['G5:2 A5 Bb5 D6 Eb6:4 D6', 'C6:2 Bb5 A5 G5 A5:8', 'D6:2 Eb6 G6:4 A6 G6', 'Eb6:4 D6 A5:8',
              'Bb5:2 A5 G5 A5 Bb5:4 D6', 'Eb6:6 D6:2 Bb5:4 G5', 'A5:2 Bb5 A5 G5 Eb5 D5 Eb5:4', 'D5:8 A4:4 D5'] } },
    order: ['A', 'B', 'A'] },

  seiten: { no: 7, name: 'NOCTURNE FOR A HEALER', jp: '闇落ち青天のテーマ', mood: 'bittersweet B minor night-city song; a lyrical, singing lead over a soft groove', bpm: 138,
    lead: { duty: 0.5, vol: 0.06, gate: 0.97 }, p2v: { duty: 0.125, vol: 0.04 },
    sections: {
      A: { chords: ['Bm', 'G', 'D', 'A', 'Bm', 'G', 'Em', 'F#'], p2: 'arp8', bass: 'pop',
        drums: ['k.h.s.hkh.hks.h.'], fill: 'k.h.s.hks.s.sscs',
        mel: ['F#5:6 E5:2 D5:4 C#5', 'B4:4 D5 G5:6 F#5:2', 'F#5:4 E5:2 D5 A5:8', 'E5:6 F#5:2 E5:4 C#5',
              'D5:2 E5 F#5:4 B5:6 A5:2', 'G5:4 F#5:2 E5 D5:4 G5', 'E5:4 F#5:2 G5 B5:4 E6', 'C#6:8 A#5'] },
      B: { chords: ['G', 'A', 'F#m', 'Bm', 'Em', 'A', 'D', 'F#7'], p2: 'harm3', bass: 'oct8',
        drums: ['k.hhs.hhk.hhs.hk'], fill: 'k.hhs.hhs.s.x.c.',
        mel: ['D6:4 B5:2 G5 D6:4 E6', 'C#6:4 A5:2 E5 C#6:4 D6', 'A5:6 F#5:2 C#6:4 A5', 'B5:12 r:4',
              'G5:2 B5 E6:4 D6:2 B5 G5:4', 'A5:2 C#6 E6:4 D6:2 C#6 A5:4', 'F#6:6 E6:2 D6:4 A5', 'A#5:4 C#6 E6 F#6'] } },
    order: ['A', 'B', 'A'] },

  diceroll: { no: 8, name: 'MIDNIGHT ROULETTE', jp: 'ダイスロールのテーマ', mood: 'lazy late-night casino jazz: swing shuffle, walking bass, a cool sleepy lead', bpm: 132, swing: 0.34,
    lead: { duty: 0.5, vol: 0.06, gate: 0.8 }, p2v: { duty: 0.125, vol: 0.035 },
    sections: {
      A: { chords: ['Dm7', 'G7', 'Cmaj7', 'A7', 'Dm7', 'G7', 'Em7,A7', 'Dm7'], p2: 'comp', bass: 'walk',
        drums: ['h...s.h.h...s.h.'], fill: 'h...s.h.s.s.sss.',
        mel: ['r:2 F5 A5 C6:4 A5:2 G5:4', 'F5:2 G5 B5:4 r:2 A5 F5:4', 'E5:6 G5:2 B5:4 A5', 'C#6:2 Bb5 A5 G5 E5:4 C#5',
              'r:2 D6 C6 A5 F5:4 A5', 'B5:2 C6 D6 F6 E6:4 D6', 'G5:4 Bb5 C#6 E6', 'D6:8 r'] },
      B: { chords: ['Gm7', 'C7', 'Fmaj7', 'Bbmaj7', 'Em7b5', 'A7', 'Dm7', 'A7'], p2: 'comp', bass: 'walk',
        drums: ['h..kh.h.h..kh.hh'], fill: 'h..kh.h.s.s.ssc.',
        mel: ['Bb5:2 D6 F6:4 D6:2 Bb5 G5:4', 'E5:2 G5 Bb5:4 C6 r', 'A5:6 C6:2 E6:8', 'D6:4 C6:2 Bb5 A5:4 F5',
              'G5:2 Bb5 D6:4 C6:2 Bb5 G5:4', 'C#6:4 E6:2 G6 F6:4 E6', 'D6:2 F6 A6:4 F6:2 D6 A5:4', 'G5:2 E5 C#5:4 A4:8'] } },
    order: ['A', 'B', 'A'] },

  astarte: { no: 9, name: 'ECLIPSE CATHEDRAL', jp: '闇落ちアスターテのテーマ', mood: 'solemn, majestic G minor; organ-like arpeggios under the star-shrine vaults', bpm: 128,
    lead: { duty: 0.25, vol: 0.065, gate: 0.97 }, p2v: { duty: 0.125, vol: 0.04 },
    sections: {
      A: { chords: ['Gm', 'Eb', 'F', 'D', 'Gm', 'Cm', 'D', 'D7'], p2: 'arp16', bass: 'half',
        drums: ['k.......s.......', 'k.....k.s.......'], fill: 'k.......s.s.ssss',
        mel: ['G5:8 Bb5:4 D6', 'Eb6:6 D6:2 C6:4 Bb5', 'A5:4 C6 F6:8', 'F#5:8 A5:4 D6',
              'D6:6 Eb6:2 D6:4 Bb5', 'C6:4 Eb6 G6:8', 'F#6:6 E6:2 D6:4 C6', 'A5:8 F#5:4 D5'] },
      B: { chords: ['Eb', 'F', 'Bb', 'Gm', 'Cm', 'D', 'Eb', 'D'], p2: 'harm3', bass: 'oct8',
        drums: ['k.h.s.h.k.h.s.hk'], fill: 'k.h.s.h.s.s.xcx.',
        mel: ['G6:4 Eb6:2 Bb5 G5:4 Bb5', 'A5:4 C6 F6 Eb6', 'D6:6 F6:2 Bb6:8', 'G6:4 F6:2 D6 Bb5:4 G5',
              'C6:2 D6 Eb6:4 G6 Eb6', 'F#6:8 D6:4 A5', 'Bb5:4 Eb6 G6 Bb6', 'A6:8 F#6:4 D6'] } },
    order: ['A', 'B', 'A'] },

  final: { no: 10, name: 'BACKSTAGE MANSION', jp: '幽境の掃除館（最終ステージ）', mood: 'hot, driving last-stage rock in E minor with a heroic major lift', bpm: 168,
    lead: { duty: 0.25, vol: 0.07, gate: 0.88 }, p2v: { duty: 0.125, vol: 0.042 },
    sections: {
      A: { chords: ['Em', 'C', 'D', 'Em', 'Em', 'C', 'D', 'B'], p2: 'echo', bass: 'oct8',
        drums: ['k.h.s.hkk.hks.h.'], fill: 'k.h.s.hks.s.ssss',
        mel: ['E5:2 E5 G5 B5:4 A5:2 G5 A5', 'G5:4 E5 C5:2 E5 G5:4', 'F#5:2 F#5 A5 D6:4 C6:2 B5 A5', 'B5:12 r:2 B5:1 C6',
              'D6:2 B5 G5 B5:4 A5:2 G5 E5', 'G5:4 C6 E6 D6:2 C6', 'D6:4 F#6 A6 F#6:2 D6', 'D#6:8 F#6:4 B6'] },
      B: { chords: ['C', 'D', 'G', 'Em', 'C', 'D', 'B', 'B7'], p2: 'harm3', bass: 'oct8',
        drums: ['k.hks.hkk.hks.hk'], fill: 'k.k.s.k.ssssxcx.',
        mel: ['E6:6 D6:2 C6:4 G5', 'F#6:6 E6:2 D6:4 A5', 'G6:4 D6:2 B5 G5:4 B5', 'E6:12 r:2 E6:1 F#6',
              'G6:4 F#6:2 E6 G6:4 E6', 'F#6:4 E6:2 D6 A6:4 F#6', 'D#6:2 E6 F#6:4 B6:6 A6:2', 'A6:4 F#6 D#6 B5'] },
      A2: { base: 'A', p2: 'harm3' } },
    order: ['A', 'B', 'A2'] },

  // arrangement variant (not a new song): faster, harmony all the way, busier drums - 闇海音 / 清掃員カナタ / 暴走ミミック
  final_fast: { no: 10, variant: 'final', name: 'BACKSTAGE MANSION -SHOWDOWN-', jp: '最終決戦アレンジ（闇海音・カナタ・ミミック）', mood: 'the last-stage theme, faster and fully harmonized for the final fights', bpm: 184,
    lead: { duty: 0.25, vol: 0.07, gate: 0.85 }, p2v: { duty: 0.25, vol: 0.04 },
    sections: { A: { base: 'final.A', p2: 'harm3', drums: ['k.hkx.hkk.hkx.hk'] }, B: { base: 'final.B', p2: 'harm3', drums: ['khhkx.hkkhhkx.hk'] }, A2: { base: 'final.A', p2: 'echo', drums: ['k.hkx.hkk.hkx.hk'] } },
    order: ['A', 'B', 'A2'] },

  ending: { no: 11, name: 'BACKSTAGE PARTY!', jp: 'エンディング：みんなでパーティー', mood: 'bright, bouncy C major party song for the karaoke and credits', bpm: 132,
    lead: { duty: 0.5, vol: 0.06, gate: 0.85 }, p2v: { duty: 0.25, vol: 0.038 },
    sections: {
      A: { chords: ['C', 'Am', 'F', 'G', 'C', 'Am', 'Dm,G', 'C'], p2: 'stab', bass: 'pop',
        drums: ['k.h.x.h.k.hkx.h.'], fill: 'k.h.x.h.x.x.xxx.',
        mel: ['E5:2 G5 C6 G5 E5 G5 C6:4', 'C6:2 B5 A5 E5 A5:4 C6', 'A5:2 C6 F6 C6 A5 C6 F6:4', 'G6:4 F6:2 D6 B5:4 G5',
              'C6:2 D6 E6:4 G6 E6', 'A6:4 G6:2 E6 C6:4 A5', 'D6:4 F6 B5 D6', 'C6:8 r:4 G5:2 G5'] },
      B: { chords: ['F', 'G', 'Em', 'Am', 'Dm', 'G', 'E7', 'G7'], p2: 'harm3', bass: 'oct8',
        drums: ['k.hox.hok.hox.ho'], fill: 'k.hox.hox.x.xcx.',
        mel: ['A5:2 A5 C6:4 A5:2 C6 F6:4', 'G6:2 G6 F6:4 E6:2 D6 B5:4', 'G6:4 E6:2 B5 E6:4 G6', 'A6:8 E6:4 C6',
              'F6:2 E6 D6 C6 A5:4 D6', 'B5:2 C6 D6 G6 F6:4 D6', 'G#5:4 B5 D6 E6', 'G6:4 F6:2 D6 B5:4 G5'] },
      A2: { base: 'A', p2: 'echo' } },
    order: ['A', 'B', 'A2'] },
};
const MUSIC_LIST = ['stage', 'tobiume', 'disaster', 'neenia', 'lily', 'shiranui', 'seiten', 'diceroll', 'astarte', 'final', 'ending', 'final_fast'];
const BOSS_MUSIC = { tobiume: 'tobiume', disaster: 'disaster', neenia: 'neenia', lily: 'lily', shiranui: 'shiranui', seiten: 'seiten', diceroll: 'diceroll', astarte: 'astarte',
  darkumine: 'final_fast', kanata: 'final_fast', mimic: 'final_fast' };

// ---------------------------------------------------------------------
//  compiler: song -> events per 16th step  { ch: 'p1'|'p2'|'tri'|'noi', m: midi, len (steps), vol, duty, kind }
// ---------------------------------------------------------------------
const NOTE_PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
function noteMidi(s) { const m = /^([A-G])([#b]?)(-?\d)$/.exec(s); if (!m) return null; return 12 * (+m[3] + 1) + NOTE_PC[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0); }
const CHORD_Q = { '': [0, 4, 7], m: [0, 3, 7], '7': [0, 4, 7, 10], m7: [0, 3, 7, 10], maj7: [0, 4, 7, 11], dim: [0, 3, 6], m7b5: [0, 3, 6, 10], '5': [0, 7, 12], sus4: [0, 5, 7], aug: [0, 4, 8] };
function parseChord(c) { const m = /^([A-G])([#b]?)(.*)$/.exec(c); const pc = NOTE_PC[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0); return { pc: (pc + 12) % 12, iv: CHORD_Q[m[3]] || CHORD_Q[''] }; }
function parseMel(str) { // -> [{m|null, len}]
  const out = []; let len = 2;
  for (const tok of str.trim().split(/\s+/)) { const [n, l] = tok.split(':'); if (l) len = +l; out.push({ m: n === 'r' ? null : noteMidi(n), len }); }
  return out;
}
function musicSection(song, key) {
  let s = song.sections[key]; if (!s.base) return s;
  const [sid, sk] = s.base.includes('.') ? s.base.split('.') : [null, s.base];
  const src = sid ? MUSIC_SONGS[sid].sections[sk] : song.sections[sk];
  return Object.assign({}, src, s, { base: undefined });
}
const MUSIC_CACHE = {};
function compileSong(id) {
  if (MUSIC_CACHE[id]) return MUSIC_CACHE[id];
  const song = MUSIC_SONGS[id], ev = [], push = (step, e) => { (ev[step] = ev[step] || []).push(e); };
  let bar0 = 0;
  for (const key of song.order) {
    const S = musicSection(song, key), bars = S.chords.length, L = song.lead, V = song.p2v;
    // chord segments
    const segs = []; S.chords.forEach((c, b) => { const parts = c.split(','), n = parts.length; parts.forEach((p, i) => segs.push({ s: (bar0 + b) * 16 + i * 16 / n, len: 16 / n, ch: parseChord(p) })); });
    const chordAt = st => { let r = segs[0]; for (const g of segs) if (g.s <= st) r = g; return r; };
    // lead
    const lead = []; let st = bar0 * 16;
    for (const barStr of S.mel) for (const n of parseMel(barStr)) { if (n.m !== null) { lead.push({ s: st, m: n.m, len: n.len }); push(st, { ch: 'p1', m: n.m, len: n.len * L.gate, vol: L.vol, duty: L.duty }); } st += n.len; }
    // pulse 2
    if (S.p2line) { for (let b = 0; b < bars; b++) { let t = (bar0 + b) * 16; for (const n of parseMel(S.p2line)) { if (n.m !== null) push(t, { ch: 'p2', m: n.m, len: n.len * 0.7, vol: V.vol, duty: V.duty }); t += n.len; } } }
    else if (S.p2 === 'echo') for (const n of lead) push(n.s + 3, { ch: 'p2', m: n.m, len: Math.max(1, n.len * L.gate - 0.5), vol: V.vol, duty: V.duty });
    else if (S.p2 === 'harm3') for (const n of lead) { // closest chord tone at least a minor third below the lead
      const c = chordAt(n.s).ch; let best = n.m - 3;
      for (let m = n.m - 3; m > n.m - 10; m--) if (c.iv.some(iv => ((m - c.pc - iv) % 12 + 12) % 12 === 0)) { best = m; break; }
      push(n.s, { ch: 'p2', m: best, len: n.len * L.gate, vol: V.vol, duty: V.duty });
    }
    else for (const g of segs) {
      const tones = g.ch.iv.map(iv => 60 + ((g.ch.pc + iv) % 12));  // octave 4..5
      tones.sort((a, b) => a - b);
      if (S.p2 === 'arp16' || S.p2 === 'arp8') { const d = S.p2 === 'arp16' ? 1 : 2, seq = tones.concat([tones[0] + 12]); for (let k = 0; k < g.len; k += d) push(g.s + k, { ch: 'p2', m: seq[(k / d) % seq.length], len: d * 0.9, vol: V.vol, duty: V.duty }); }
      else if (S.p2 === 'stab') for (let k = 2; k < g.len; k += 4) push(g.s + k, { ch: 'p2', m: tones[(k >> 2) % 2 ? 2 : 1] || tones[1], len: 1, vol: V.vol, duty: V.duty });
      else if (S.p2 === 'comp') for (let k = 4; k < g.len; k += 8) { push(g.s + k, { ch: 'p2', m: tones[1], len: 1.5, vol: V.vol, duty: V.duty }); }
    }
    // triangle bass
    for (const g of segs) {
      const r = 36 + g.ch.pc + (g.ch.pc < 4 ? 12 : 0), f = r + (g.ch.iv[2] === 12 ? 7 : g.ch.iv[2]), b = (k, m, l) => push(g.s + k, { ch: 'tri', m, len: l });
      const st2 = S.bass;
      if (st2 === 'oct8') for (let k = 0; k < g.len; k += 2) b(k, (k >> 1) & 1 ? r + 12 : r, 1.6);
      else if (st2 === 'root8') for (let k = 0; k < g.len; k += 2) b(k, k === g.len - 2 ? f : r, 1.7);
      else if (st2 === 'gallop') for (let k = 0; k < g.len; k += 4) { b(k, r, 1.6); b(k + 2, r + 12, 0.8); b(k + 3, r + 12, 0.8); }
      else if (st2 === 'pop') { for (const k of [0, 3, 6, 8, 11, 14]) if (k < g.len) b(k, k === 8 ? f : k === 14 ? r + 12 : r, k === 8 || k === 0 ? 2.5 : 1.5); }
      else if (st2 === 'march') for (let k = 0; k < g.len; k += 4) { b(k, r, 1.8); b(k + 2, k % 8 ? f : r + 12, 1.6); }
      else if (st2 === 'half') for (let k = 0; k < g.len; k += 8) b(k, k ? f : r, 7.5);
      else if (st2 === 'drone') for (let k = 0; k < g.len; k += 4) b(k, k % 8 ? f : r, 3.6);
      else if (st2 === 'walk') { const nx = chordAt(g.s + g.len) || g, nr = 36 + nx.ch.pc + (nx.ch.pc < 4 ? 12 : 0); const third = r + g.ch.iv[1];
        const line = [r, third, f, nr + (nr > f ? -1 : 1)]; for (let k = 0; k < g.len; k += 4) b(k, line[(k >> 2) % 4], 3.2); }
    }
    // drums
    for (let b = 0; b < bars; b++) {
      const pat = (b === bars - 1 && S.fill) ? S.fill : S.drums[b % S.drums.length];
      for (let k = 0; k < 16; k++) { const c = pat[k]; if (c && c !== '.') push((bar0 + b) * 16 + k, { ch: 'noi', kind: c }); }
    }
    bar0 += bars;
  }
  const steps = bar0 * 16, stepDur = 60 / song.bpm / 4;
  return (MUSIC_CACHE[id] = { id, ev, steps, stepDur, dur: steps * stepDur, swing: song.swing || 0 });
}
function musicStepTime(C, k) { return k * C.stepDur + ((k & 3) === 2 ? C.swing * C.stepDur * 2 : (k & 3) === 3 ? C.swing * C.stepDur : 0); }

// ---------------------------------------------------------------------
//  voices (work on any AudioContext / OfflineAudioContext)
// ---------------------------------------------------------------------
const MUSIC_WAVES = new WeakMap();
function pulseWave(ctx, duty) {
  let W = MUSIC_WAVES.get(ctx); if (!W) { W = {}; MUSIC_WAVES.set(ctx, W); }
  if (W[duty]) return W[duty];
  const N = 32, re = new Float32Array(N), im = new Float32Array(N);
  for (let n = 1; n < N; n++) { re[n] = Math.sin(2 * Math.PI * n * duty) / (n * Math.PI); im[n] = (1 - Math.cos(2 * Math.PI * n * duty)) / (n * Math.PI); } // pulse of width 'duty'
  return (W[duty] = ctx.createPeriodicWave(re, im));
}
function noiseBuf(ctx) {
  let W = MUSIC_WAVES.get(ctx); if (!W) { W = {}; MUSIC_WAVES.set(ctx, W); }
  if (W.noise) return W.noise;
  const n = Math.floor(ctx.sampleRate * 0.6), b = ctx.createBuffer(1, n, ctx.sampleRate), d = b.getChannelData(0);
  let lfsr = 1; for (let i = 0; i < n; i++) { if (i % 2 === 0) { const bit = (lfsr ^ (lfsr >> 1)) & 1; lfsr = (lfsr >> 1) | (bit << 14); } d[i] = (lfsr & 1) ? 0.9 : -0.9; } // NES-style LFSR noise
  return (W.noise = b);
}
const midiHz = m => 440 * Math.pow(2, (m - 69) / 12);
function musicNote(ctx, dest, e, t, stepDur) {
  const dur = Math.max(0.03, e.len * stepDur), end = t + dur;
  if (e.ch === 'noi') return musicDrum(ctx, dest, e.kind, t);
  const o = ctx.createOscillator(), gn = ctx.createGain();
  if (e.ch === 'tri') { o.type = 'triangle'; } else o.setPeriodicWave(pulseWave(ctx, e.duty));
  o.frequency.setValueAtTime(midiHz(e.m), t);
  const v = e.ch === 'tri' ? 0.16 : e.vol;
  gn.gain.setValueAtTime(0, t); gn.gain.linearRampToValueAtTime(v, t + 0.004);
  if (e.ch !== 'tri') gn.gain.linearRampToValueAtTime(v * 0.62, t + Math.min(dur, 0.18));
  gn.gain.setValueAtTime(e.ch === 'tri' ? v : v * 0.62, Math.max(t + 0.005, end - 0.012)); gn.gain.linearRampToValueAtTime(0, end);
  if (e.ch === 'p1' && dur > 0.32) { // gentle delayed vibrato on long lead notes
    const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = 5.6; lg.gain.setValueAtTime(0, t); lg.gain.linearRampToValueAtTime(14, t + 0.3);
    lfo.connect(lg); lg.connect(o.detune); lfo.start(t + 0.15); lfo.stop(end + 0.02);
  }
  o.connect(gn); gn.connect(dest); o.start(t); o.stop(end + 0.02);
}
function musicDrum(ctx, dest, k, t) {
  const hit = (dur, vol, type, freq, q) => {
    const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), gn = ctx.createGain();
    s.buffer = noiseBuf(ctx); s.playbackRate.value = k === 't' || k === 'k' ? 0.5 : 1; f.type = type; f.frequency.value = freq; if (q) f.Q.value = q;
    gn.gain.setValueAtTime(vol, t); gn.gain.exponentialRampToValueAtTime(0.001, t + dur);
    s.connect(f); f.connect(gn); gn.connect(dest); s.start(t, Math.random() * 0.3); s.stop(t + dur + 0.01);
  };
  const thump = (f0, f1, dur, vol) => { const o = ctx.createOscillator(), gn = ctx.createGain(); o.type = 'triangle'; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    gn.gain.setValueAtTime(vol, t); gn.gain.exponentialRampToValueAtTime(0.001, t + dur); o.connect(gn); gn.connect(dest); o.start(t); o.stop(t + dur + 0.01); };
  if (k === 'k' || k === 'x') { thump(160, 45, 0.11, 0.22); hit(0.05, 0.08, 'lowpass', 900); }
  if (k === 's' || k === 'x') { hit(0.13, 0.11, 'bandpass', 1900, 0.8); }
  if (k === 'h') hit(0.035, 0.05, 'highpass', 7000);
  if (k === 'o') hit(0.16, 0.05, 'highpass', 6000);
  if (k === 'c') hit(0.7, 0.07, 'highpass', 4000);
  if (k === 'r') hit(0.03, 0.09, 'bandpass', 2600, 4);
  if (k === 't') { thump(110, 55, 0.28, 0.26); hit(0.2, 0.09, 'lowpass', 500); }
}
// schedule steps [k0, k1) of a compiled song, step k at time t0 + musicStepTime(k)
function musicSchedule(ctx, dest, C, k0, k1, t0) {
  for (let k = k0; k < k1; k++) { const L = C.ev[k]; if (!L) continue; const t = t0 + musicStepTime(C, k); for (const e of L) musicNote(ctx, dest, e, t, C.stepDur); }
}

// ---------------------------------------------------------------------
//  live player (Snd.ctx, under Snd.master so SOUND OFF mutes it)
// ---------------------------------------------------------------------
const Music = { id: null, C: null, bus: null, step: 0, loopT0: 0, vol: 0.85, plays: 0, history: [] };
function musicPlay(id) {
  if (Music.id === id) return;
  musicStopBus();
  Music.id = id; Music.C = null;
  if (id) { Music.plays++; Music.history.push(id); if (Music.history.length > 40) Music.history.shift(); }
}
function musicStopBus() {
  const c = Snd.ctx; if (!c || !Music.bus) { Music.bus = null; return; }
  const b = Music.bus, t = c.currentTime; b.gain.cancelScheduledValues(t); b.gain.setValueAtTime(b.gain.value, t); b.gain.linearRampToValueAtTime(0, t + 0.25);
  setTimeout(() => { try { b.disconnect(); } catch (_) {} }, 1500); Music.bus = null;
}
function musicTick() {
  const want = musicWanted(); if (want !== Music.id) musicPlay(want);
  const c = Snd.ctx; if (!c || !Music.id || c.state !== 'running') return;
  if (!Music.bus) { // (re)start the current track
    Music.C = compileSong(Music.id); Music.bus = c.createGain(); Music.bus.gain.value = Music.vol; Music.bus.connect(Snd.master);
    Music.step = 0; Music.loopT0 = c.currentTime + 0.06;
  }
  const C = Music.C, ahead = c.currentTime + 0.18;
  if (Music.loopT0 + musicStepTime(C, Music.step) < c.currentTime - 0.3) { // tab was hidden: resync instead of a burst
    Music.loopT0 = c.currentTime + 0.05 - musicStepTime(C, Music.step);
  }
  let n = 0;
  while (Music.loopT0 + musicStepTime(C, Music.step) < ahead && n++ < 64) {
    musicSchedule(c, Music.bus, C, Music.step, Music.step + 1, Music.loopT0);
    if (++Music.step >= C.steps) { Music.step = 0; Music.loopT0 += C.dur; }
  }
}
// which track each scene wants
function musicWanted() {
  if (state === 'soundtest') return SOUNDTEST.playing;
  if (state === 'ending') return 'ending';
  if (state === 'title' || state === 'select' || state === 'areaIntro' || state === 'theEnd' || state === 'finale' || state === 'dying' || state === 'gameover' || state === 'clear') return null;
  if (!curArea || !curArea.map) return null;
  if (state === 'climax') return 'final_fast';
  if (boss.triggered && boss.state !== 'off') {
    if (boss.state === 'rescue' && !curArea.final) return null; // the rescue moment is left to the SFX
    return BOSS_MUSIC[curArea.boss] || 'final_fast';
  }
  return curArea.final ? 'final' : 'stage';
}

// ---------------------------------------------------------------------
//  SOUND TEST (title -> SOUND TEST / T key, ?soundtest=1)
// ---------------------------------------------------------------------
const SOUNDTEST = { cur: 0, playing: null };
const ST_ROW0 = 30, ST_ROWH = 15, ST_BACK = { x: 88, y: 214, w: 80, h: 16 };
const TITLE_SOUND = { x: 70, y: 3, w: 68, h: 13 };
function openSoundTest() { SOUNDTEST.playing = null; setState('soundtest'); sfx('start'); }
function soundTestToggle(i) { const id = MUSIC_LIST[i]; SOUNDTEST.cur = i; SOUNDTEST.playing = SOUNDTEST.playing === id ? null : id; sfx('cursor'); }
function updateSoundTest() {
  const n = MUSIC_LIST.length;
  if (inp.upPressed || inp.leftPressed) { SOUNDTEST.cur = (SOUNDTEST.cur + n - 1) % n; sfx('cursor'); }
  if (inp.downPressed || inp.rightPressed) { SOUNDTEST.cur = (SOUNDTEST.cur + 1) % n; sfx('cursor'); }
  if ((inp.startPressed || inp.shootPressed) && stateT > 8) soundTestToggle(SOUNDTEST.cur);
  if (inp.backPressed) { SOUNDTEST.playing = null; setState('title'); }
}
function soundTestTap(x, y) {
  if (stateT < 8) return true;
  if (x >= ST_BACK.x && x < ST_BACK.x + ST_BACK.w && y >= ST_BACK.y && y < ST_BACK.y + ST_BACK.h) { inp.backPressed = true; return true; }
  const i = Math.floor((y - ST_ROW0 + 2) / ST_ROWH);
  if (i >= 0 && i < MUSIC_LIST.length && x > 6 && x < VW - 6) soundTestToggle(i);
  return true;
}
function renderSoundTest() {
  g.fillStyle = '#0c0a1e'; g.fillRect(0, 0, VW, VH);
  for (let i = 0; i < 30; i++) { const h = hash(i, 9); g.fillStyle = (h >> 8) & 1 ? '#2a3060' : '#5a6098'; g.fillRect(h % VW, (h >>> 9) % VH, 1, 1); }
  drawTextShadow('SOUND TEST', VW / 2, 8, 'y', 2, 'c');
  for (let i = 0; i < MUSIC_LIST.length; i++) {
    const S = MUSIC_SONGS[MUSIC_LIST[i]], y = ST_ROW0 + i * ST_ROWH, sel = i === SOUNDTEST.cur, on = SOUNDTEST.playing === MUSIC_LIST[i];
    if (sel) { g.fillStyle = '#20204a'; g.fillRect(6, y - 2, VW - 12, ST_ROWH - 1); rectLine(6, y - 2, VW - 12, ST_ROWH - 1, '#5a6aa8'); }
    const no = S.variant ? '10B' : String(S.no).padStart(2, '0');
    drawText(no, 12, y + 3, on ? 'g' : 'b', 1);
    drawText(S.name.length > 24 ? S.name.slice(0, 24) : S.name, 34, y + 3, on ? 'g' : sel ? 'w' : 'c', 1);
    if (on) { const k = (frame >> 3) & 3; g.fillStyle = '#8be07a'; for (let b = 0; b < 4; b++) { const h = 2 + ((hash(frame >> 3, b) >> 3) % 7); g.fillRect(VW - 30 + b * 4, y + 9 - h, 3, h); } }
    else if (sel) drawText('>', VW - 22, y + 3, 'y', 1);
  }
  rectLine(ST_BACK.x, ST_BACK.y, ST_BACK.w, ST_BACK.h, '#8fa2d8'); drawText('BACK', ST_BACK.x + ST_BACK.w / 2, ST_BACK.y + 6, 'w', 1, 'c');
  drawText('TAP / ENTER: PLAY-STOP', VW / 2, 234, 'b', 1, 'c');
  blit();
  const S = MUSIC_SONGS[MUSIC_LIST[SOUNDTEST.cur]];
  drawHiText(S.jp, VW / 2, 196, 7.5, '#ffd6ec', '#0c0a1e');
}
// offline render of one loop (same synth): returns a 16-bit mono WAV as base64. Used by tools/render_bgm.js.
async function musicRenderWav(id, sampleRate, normalize) {
  const C = compileSong(id), sr = sampleRate || 44100, AC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
  const len = Math.ceil(C.dur * 2 * sr), ctx = new AC(1, len, sr), bus = ctx.createGain(); bus.gain.value = Music.vol * 0.3 * 2.2; bus.connect(ctx.destination);
  musicSchedule(ctx, bus, C, 0, C.steps, 0); musicSchedule(ctx, bus, C, 0, C.steps, C.dur); // 2 loops; keep the 2nd (it carries the 1st loop's tails = seamless)
  const buf = await ctx.startRendering(), d = buf.getChannelData(0), s0 = Math.round(C.dur * sr), n = Math.round(C.dur * sr);
  const out = new DataView(new ArrayBuffer(44 + n * 2)), w = (o, s) => { for (let i = 0; i < s.length; i++) out.setUint8(o + i, s.charCodeAt(i)); };
  w(0, 'RIFF'); out.setUint32(4, 36 + n * 2, true); w(8, 'WAVE'); w(12, 'fmt '); out.setUint32(16, 16, true); out.setUint16(20, 1, true); out.setUint16(22, 1, true);
  out.setUint32(24, sr, true); out.setUint32(28, sr * 2, true); out.setUint16(32, 2, true); out.setUint16(34, 16, true); w(36, 'data'); out.setUint32(40, n * 2, true);
  let peak = 0; for (let i = 0; i < n; i++) peak = Math.max(peak, Math.abs(d[s0 + i] || 0));
  const gain = normalize && peak > 0 ? normalize / peak : 1; // e.g. 0.8 -> files peak at -2 dBFS
  for (let i = 0; i < n; i++) out.setInt16(44 + i * 2, Math.max(-1, Math.min(1, (d[s0 + i] || 0) * gain)) * 32767, true);
  const bytes = new Uint8Array(out.buffer); let bin = ''; for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return { b64: btoa(bin), dur: C.dur, peak: peak * gain, rawPeak: peak };
}
