export const Characters = {
  CAPTAIN_FALCON: 0,
  DONKEY_KONG: 1,
  FOX: 2,
  GAME_AND_WATCH: 3,
  KIRBY: 4,
  BOWSER: 5,
  LINK: 6,
  LUIGI: 7,
  MARIO: 8,
  MARTH: 9,
  MEWTWO: 10,
  NESS: 11,
  PEACH: 12,
  PIKACHU: 13,
  ICE_CLIMBERS: 14,
  JIGGLYPUFF: 15,
  SAMUS: 16,
  YOSHI: 17,
  ZELDA: 18,
  SHEIK: 19,
  FALCO: 20,
  YOUNG_LINK: 21,
  DR_MARIO: 22,
  ROY: 23,
  PICHU: 24,
  GANONDORF: 25
}

export const CharacterStrings = [
  'Captain Falcon',
  'Donkey Kong',
  'Fox',
  'Game & Watch',
  'Kirby',
  'Bowser',
  'Link',
  'Luigi',
  'Mario',
  'Marth',
  'Mewtwo',
  'Ness',
  'Peach',
  'Pikachu',
  'Ice Climbers',
  'Jigglypuff',
  'Samus',
  'Yoshi',
  'Zelda',
  'Sheik',
  'Falco',
  'Young Link',
  'Dr. Mario',
  'Roy',
  'Pichu',
  'Ganondorf'
]

export const STAGES = [
  { id: 2, stageSlug: 'FOUNTAIN_OF_DREAMS' },
  { id: 3, stageSlug: 'POKEMON_STADIUM' },
  { id: 4, stageSlug: 'PEACHS_CASTLE' },
  { id: 5, stageSlug: 'KONGO_JUNGLE' },
  { id: 6, stageSlug: 'BRINSTAR' },
  { id: 7, stageSlug: 'CORNERIA' },
  { id: 8, stageSlug: 'YOSHIS_STORY' },
  { id: 9, stageSlug: 'ONETT' },
  { id: 10, stageSlug: 'MUTE_CITY' },
  { id: 11, stageSlug: 'RAINBOW_CRUISE' },
  { id: 12, stageSlug: 'JUNGLE_JAPES' },
  { id: 13, stageSlug: 'GREAT_BAY' },
  { id: 14, stageSlug: 'HYRULE_TEMPLE' },
  { id: 15, stageSlug: 'BRINSTAR_DEPTHS' },
  { id: 16, stageSlug: 'YOSHIS_ISLAND' },
  { id: 17, stageSlug: 'GREEN_GREENS' },
  { id: 18, stageSlug: 'FOURSIDE' },
  { id: 19, stageSlug: 'MUSHROOM_KINGDOM' },
  { id: 20, stageSlug: 'MUSHROOM_KINGDOM_2' },
  { id: 22, stageSlug: 'VENOM' },
  { id: 23, stageSlug: 'POKE_FLOATS' },
  { id: 24, stageSlug: 'BIG_BLUE' },
  { id: 25, stageSlug: 'ICICLE_MOUNTAIN' },
  { id: 26, stageSlug: 'ICETOP' },
  { id: 27, stageSlug: 'FLAT_ZONE' },
  { id: 28, stageSlug: 'DREAMLAND' },
  { id: 29, stageSlug: 'YOSHIS_ISLAND_N64' },
  { id: 30, stageSlug: 'KONGO_JUNGLE_N64' },
  { id: 31, stageSlug: 'BATTLEFIELD' },
  { id: 32, stageSlug: 'FINAL_DESTINATION' }
]
export const moves = [
  {
    // This includes all thrown items, zair, luigi's taunt, samus bombs, etc
    id: 1,
    name: 'Miscellaneous',
    shortName: 'misc'
  },
  {
    id: 2,
    name: 'Jab1',
    shortName: 'jab1'
  },
  {
    id: 3,
    name: 'Jab2',
    shortName: 'jab2'
  },
  {
    id: 4,
    name: 'Jab3',
    shortName: 'jab3'
  },
  {
    id: 5,
    name: 'Rapid Jabs',
    shortName: 'rapid-jabs'
  },
  {
    id: 6,
    name: 'Dash Attack',
    shortName: 'dash'
  },
  {
    id: 7,
    name: 'Forward Tilt',
    shortName: 'ftilt'
  },
  {
    id: 8,
    name: 'Up Tilt',
    shortName: 'utilt'
  },
  {
    id: 9,
    name: 'Down Tilt',
    shortName: 'dtilt'
  },
  {
    id: 10,
    name: 'Forward Smash',
    shortName: 'fsmash'
  },
  {
    id: 11,
    name: 'Up Smash',
    shortName: 'usmash'
  },
  {
    id: 12,
    name: 'Down Smash',
    shortName: 'dsmash'
  },
  {
    id: 13,
    name: 'Neutral Air',
    shortName: 'nair'
  },
  {
    id: 14,
    name: 'Forward Air',
    shortName: 'fair'
  },
  {
    id: 15,
    name: 'Back Air',
    shortName: 'bair'
  },
  {
    id: 16,
    name: 'Up Air',
    shortName: 'uair'
  },
  {
    id: 17,
    name: 'Down Air',
    shortName: 'dair'
  },
  {
    id: 18,
    name: 'Neutral B',
    shortName: 'neutral-b'
  },
  {
    id: 19,
    name: 'Side B',
    shortName: 'side-b'
  },
  {
    id: 20,
    name: 'Up B',
    shortName: 'up-b'
  },
  {
    id: 21,
    name: 'Down B',
    shortName: 'down-b'
  },
  {
    id: 50,
    name: 'Getup Attack',
    shortName: 'getup'
  },
  {
    id: 51,
    name: 'Getup Attack (Slow)',
    shortName: 'getup-slow'
  },
  {
    id: 52,
    name: 'Grab Pummel',
    shortName: 'pummel'
  },
  {
    id: 53,
    name: 'Forward Throw',
    shortName: 'fthrow'
  },
  {
    id: 54,
    name: 'Back Throw',
    shortName: 'bthrow'
  },
  {
    id: 55,
    name: 'Up Throw',
    shortName: 'uthrow'
  },
  {
    id: 56,
    name: 'Down Throw',
    shortName: 'dthrow'
  },
  {
    id: 61,
    name: 'Edge Attack (Slow)',
    shortName: 'edge-slow'
  },
  {
    id: 62,
    name: 'Edge Attack',
    shortName: 'edge'
  }
]
