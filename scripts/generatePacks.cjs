/**
 * Generate mythology pack JSON files from seed data.
 * Run: node scripts/generatePacks.cjs
 */

const fs = require('fs')
const path = require('path')

// Seed data - inlined to avoid TS/module resolution
const now = '2025-01-01T00:00:00Z'

const mythologies = [
  { id: 'greek', entityType: 'mythology', name: 'Greek Mythology', alternateNames: ['Hellenic mythology', 'Graeco-Roman'], slug: 'greek', mythologyIds: ['greek'], summary: 'The body of myths and teachings belonging to the ancient Greeks concerning their gods and heroes.', region: 'Eastern Mediterranean', subregions: ['Greece', 'Anatolia', 'Magna Graecia'], associatedCultures: ['Ancient Greece', 'Hellenistic world'], historicalPeriod: 'c. 1200 BCE – 400 CE', traditionType: 'polytheistic', overview: 'Greek mythology encompasses the cosmogony, pantheon, heroic sagas, and ritual practices of ancient Greek religion. It influenced Roman mythology and Western culture profoundly.', worldviewSummary: 'Gods and humans exist in a hierarchical cosmos. Fate (Moira) governs mortals; gods are powerful but not omnipotent. The world is ordered yet capricious.', cosmologySummary: 'Three realms: Olympus (gods), Earth (mortals), Underworld (Hades). Tartarus below; primordial Chaos at origin. Ocean surrounds the flat earth.', centralThemes: ['heroism', 'fate', 'hubris', 'hospitality', 'honor', 'reciprocity'], majorBeingIds: ['zeus', 'poseidon', 'hades', 'athena', 'apollo', 'artemis', 'hera', 'aphrodite', 'hermes', 'ares', 'hephaestus', 'demeter', 'persephone', 'dionysus', 'odysseus', 'achilles', 'herakles'], majorStoryIds: ['titanomachy', 'theogony', 'odyssey-journey', 'iliad-achilles', 'persephone-abduction'], majorPlaceIds: ['olympus', 'underworld', 'delphi', 'olympus-mt'], majorMotifIds: ['hubris-nemesis', 'katabasis', 'xenia'], majorGroupIds: ['olympians', 'titans'], majorObjectIds: ['lightning-bolt', 'trident', 'aegis'], tags: ['polytheism', 'heroes', 'oracles'], status: 'active', confidence: 'certain', sourceRefIds: [], noteIds: [], createdAt: now, updatedAt: now },
  { id: 'norse', entityType: 'mythology', name: 'Norse Mythology', alternateNames: ['Germanic mythology', 'North Germanic'], slug: 'norse', mythologyIds: ['norse'], summary: 'The body of myths of the North Germanic peoples, stemming from Norse paganism and continuing through the Scandinavian folk tradition.', region: 'Scandinavia', subregions: ['Iceland', 'Norway', 'Sweden', 'Denmark'], associatedCultures: ['Vikings', 'Germanic peoples'], historicalPeriod: 'c. 800 CE – 1300 CE (recorded)', traditionType: 'polytheistic', overview: 'Norse mythology centers on the gods of the Æsir and Vanir, the world tree Yggdrasil, and the coming of Ragnarök. Preserved mainly in Icelandic Eddas.', worldviewSummary: 'Cyclical view of time. Gods are mortal; Ragnarök will destroy the world, which will be reborn. Honor, fame, and fate are central.', cosmologySummary: 'Nine worlds connected by Yggdrasil. Asgard (gods), Midgard (humans), Jotunheim (giants), Hel (dead), etc. Bifröst links Asgard and Midgard.', centralThemes: ['fate', 'honor', 'doom', 'wisdom', 'sacrifice', 'courage'], majorBeingIds: ['odin', 'thor', 'loki', 'freyja', 'freyr', 'tyr', 'heimdall', 'baldr', 'hel', 'fenrir', 'jormungandr'], majorStoryIds: ['creation-norse', 'ragnarok', 'thor-hymnir', 'binding-fenrir'], majorPlaceIds: ['asgard', 'midgard', 'yggdrasil', 'valhalla'], majorMotifIds: ['ragnarok-doom', 'wisdom-sacrifice', 'binding-monster'], majorGroupIds: ['aesir', 'vanir', 'jotnar'], majorObjectIds: ['mjolnir', 'gungnir', 'glaive'], tags: ['polytheism', 'Eddas', 'Ragnarök'], status: 'active', confidence: 'certain', sourceRefIds: [], noteIds: [], createdAt: now, updatedAt: now },
]

// Minimal seed references - we'll build packs by filtering
// For full packs, we need to read the actual seed files. Use dynamic import for ESM or require for CJS.
// This script uses a simplified approach: we output the structure and the user can verify.

function filterByMythology(arr, mythId) {
  return arr.filter((x) => x.mythologyIds && x.mythologyIds.includes(mythId))
}

function filterRelationshipsByEntities(rels, entityIds) {
  return rels.filter((r) => entityIds.has(r.fromEntityId) && entityIds.has(r.toEntityId))
}

function createPack(name, version, desc, mythIds, mythArr, beingArr, storyArr, placeArr, motifArr, groupArr, objectArr, relArr, sourceArr, noteArr) {
  const pack = {
    packageFormat: 1,
    packageType: 'mythology-pack',
    packName: name,
    packVersion: version,
    description: desc,
    mythologies: mythArr,
    beings: beingArr,
    stories: storyArr,
    places: placeArr,
    motifs: motifArr,
    groups: groupArr,
    objects: objectArr,
    relationships: relArr,
    sources: sourceArr,
    notes: noteArr || [],
  }
  return pack
}

// Read seed from TS files via require with a loader - not straightforward in CJS.
// Instead, output a stub that tells us the script ran, and we'll populate packs manually.
const outDir = path.join(__dirname, '..', 'public', 'packs')
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true })
}

console.log('Pack output directory:', outDir)
console.log('Run this script after seed data is available. For now, packs will be created manually.')
fs.writeFileSync(path.join(outDir, '.gitkeep'), '')
