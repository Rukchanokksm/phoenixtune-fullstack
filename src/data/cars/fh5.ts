/* ─────────────────────────────────────────────────────────────
   Forza Horizon 5 — Car Data
   Source: hardcoded (Phase 1)
   TODO Phase 2: migrate to Supabase `cars` table and fetch via API
   ────────────────────────────────────────────────────────────── */

export interface CarBrand {
  id: string
  name: string
}

export interface CarModel {
  id: string
  year: number
  label: string
}

/* ─── Car Data ───────────────────────────────────────────────── */
export const FH5_BRANDS: CarBrand[] = [
  { id: 'abarth',        name: 'Abarth' },
  { id: 'acura',         name: 'Acura' },
  { id: 'alumi-craft',   name: 'Alumi Craft' },
  { id: 'alpine',        name: 'Alpine' },
  { id: 'amc',           name: 'AMC' },
  { id: 'apollo',        name: 'Apollo' },
  { id: 'ariel',         name: 'Ariel' },
  { id: 'ascari',        name: 'Ascari' },
  { id: 'aston-martin',  name: 'Aston Martin' },
  { id: 'ats',           name: 'ATS' },
  { id: 'audi',          name: 'Audi' },
  { id: 'austin-healey', name: 'Austin-Healey' },
  { id: 'auto-union',    name: 'Auto Union' },
  { id: 'lamborghini',   name: 'Lamborghini' },
  { id: 'lancia',        name: 'Lancia' },
  { id: 'land-rover',    name: 'Land Rover' },
  { id: 'lexus',         name: 'Lexus' },
  { id: 'local-motors',  name: 'Local Motors' },
  { id: 'lola',          name: 'Lola' },
  { id: 'lotus',         name: 'Lotus' },
  { id: 'lucid',         name: 'Lucid' },
  { id: 'lynk-co',       name: 'Lynk & Co' },
  { id: 'subaru',        name: 'Subaru' },
].sort((a, b) => a.name.localeCompare(b.name))

export const FH5_MODELS: Record<string, CarModel[]> = {
  'abarth': [
    { id: '2017-abarth-124-spider',   year: 2017, label: '2017 Abarth 124 Spider' },
    { id: '2016-abarth-124-spider',   year: 2016, label: '2016 Abarth 124 Spider' },
    { id: '1980-abarth-131-abarth',   year: 1980, label: '1980 Abarth 131 Abarth' },
    { id: '1968-abarth-595-esseesse', year: 1968, label: '1968 Abarth 595 esseesse' },
  ],
  'acura': [
    { id: '2017-acura-nsx',            year: 2017, label: '2017 Acura NSX' },
    { id: '2002-acura-rsx-type-s',     year: 2002, label: '2002 Acura RSX Type-S' },
    { id: '2001-acura-integra-type-r', year: 2001, label: '2001 Acura Integra Type R' },
  ],
  'alumi-craft': [
    { id: '2015-alumi-craft-forza', year: 2015, label: '2015 Alumi Craft Class 10 Race Car Forza Edition' },
    { id: '2015-alumi-craft',       year: 2015, label: '2015 Alumi Craft Class 10 Race Car' },
  ],
  'alpine': [
    { id: '2017-alpine-a110',       year: 2017, label: '2017 Alpine A110' },
    { id: '1973-alpine-a110-1600s', year: 1973, label: '1973 Alpine A110 1600s' },
  ],
  'amc': [
    { id: '1971-amc-javelin-amx',       year: 1971, label: '1971 AMC Javelin AMX' },
    { id: '1970-amc-rebel-the-machine', year: 1970, label: "1970 AMC Rebel 'The Machine'" },
  ],
  'apollo': [
    { id: '2018-apollo-ie-wp', year: 2018, label: "2018 Apollo Intensa Emozione 'Welcome Pack'" },
    { id: '2018-apollo-ie',    year: 2018, label: '2018 Apollo Intensa Emozione' },
  ],
  'ariel': [
    { id: '2016-ariel-nomad',       year: 2016, label: '2016 Ariel Nomad' },
    { id: '2013-ariel-atom-500-v8', year: 2013, label: '2013 Ariel Atom 500 V8' },
  ],
  'ascari': [
    { id: '2012-ascari-kz1r', year: 2012, label: '2012 Ascari KZ1R' },
  ],
  'aston-martin': [
    { id: '2023-am-dbs',             year: 2023, label: '2023 Aston Martin DBS' },
    { id: '2022-am-valkyrie-amr-pro',year: 2022, label: '2022 Aston Martin Valkyrie AMR Pro' },
    { id: '2022-am-valkyrie',        year: 2022, label: '2022 Aston Martin Valkyrie' },
    { id: '2021-am-vantage-v12',     year: 2021, label: '2021 Aston Martin Vantage V12' },
    { id: '2021-am-dbx',             year: 2021, label: '2021 Aston Martin DBX' },
    { id: '2019-am-vantage',         year: 2019, label: '2019 Aston Martin Vantage' },
    { id: '2019-am-valhalla',        year: 2019, label: '2019 Aston Martin Valhalla Concept Car' },
    { id: '2019-am-dbs-superleg',    year: 2019, label: '2019 Aston Martin DBS Superleggera' },
    { id: '2017-am-vulcan-amr-pro',  year: 2017, label: '2017 Aston Martin Vulcan AMR Pro' },
    { id: '2017-am-vulcan',          year: 2017, label: '2017 Aston Martin Vulcan' },
    { id: '2017-am-vanquish-zagato', year: 2017, label: '2017 Aston Martin Vanquish Zagato Coupe' },
    { id: '2017-am-db11',            year: 2017, label: '2017 Aston Martin DB11' },
    { id: '2016-am-vantage-gt12',    year: 2016, label: '2016 Aston Martin Vantage GT12' },
    { id: '2013-am-v12-vantage-s',   year: 2013, label: '2013 Aston Martin V12 Vantage S' },
    { id: '2012-am-v12-zagato',      year: 2012, label: '2012 Aston Martin V12 Zagato' },
    { id: '2010-am-one-77',          year: 2010, label: '2010 Aston Martin One-77' },
    { id: '1986-am-v8-vantage',      year: 1986, label: '1986 Aston Martin V8 Vantage' },
    { id: '1964-am-db5',             year: 1964, label: '1964 Aston Martin DB5' },
    { id: '1960-am-db4-gt-zagato',   year: 1960, label: '1960 Aston Martin DB4 GT Zagato' },
    { id: '1958-am-dbr1',            year: 1958, label: '1958 Aston Martin DBR1' },
    { id: '1939-am-atom',            year: 1939, label: '1939 Aston Martin Atom' },
  ],
  'ats': [
    { id: '2018-ats-gt', year: 2018, label: '2018 ATS GT' },
  ],
  'audi': [
    { id: '2023-audi-rs6-avant',       year: 2023, label: '2023 Audi RS 6 Avant' },
    { id: '2021-audi-rs7-sportback',   year: 2021, label: '2021 Audi RS 7 Sportback' },
    { id: '2021-audi-rs6-avant',       year: 2021, label: '2021 Audi RS 6 Avant' },
    { id: '2021-audi-rs-etron-gt',     year: 2021, label: '2021 Audi RS e-tron GT' },
    { id: '2020-audi-rs-q8',           year: 2020, label: '2020 Audi RS Q8' },
    { id: '2020-audi-rs3-sedan',       year: 2020, label: '2020 Audi RS 3 Sedan' },
    { id: '2018-audi-rs5-coupe',       year: 2018, label: '2018 Audi RS 5 Coupé' },
    { id: '2018-audi-rs4-avant',       year: 2018, label: '2018 Audi RS 4 Avant' },
    { id: '2018-audi-tt-rs',           year: 2018, label: '2018 Audi TT RS' },
    { id: '2016-audi-r8-v10-plus-24h', year: 2016, label: '2016 Audi R8 V10 plus Selection 24h Edition' },
    { id: '2015-audi-rs6-avant',       year: 2015, label: '2015 Audi RS 6 Avant' },
    { id: '2015-audi-r8-v10-plus',     year: 2015, label: '2015 Audi R8 V10 plus' },
    { id: '2015-audi-tts-coupe',       year: 2015, label: '2015 Audi TTS Coupé' },
    { id: '2013-audi-rs7-sportback',   year: 2013, label: '2013 Audi RS 7 Sportback' },
    { id: '2013-audi-rs4-avant',       year: 2013, label: '2013 Audi RS 4 Avant' },
    { id: '2011-audi-rs5-coupe',       year: 2011, label: '2011 Audi RS 5 Coupé' },
    { id: '2011-audi-rs3-sportback',   year: 2011, label: '2011 Audi RS 3 Sportback' },
    { id: '2010-audi-tt-rs-coupe',     year: 2010, label: '2010 Audi TT RS Coupé' },
    { id: '2009-audi-rs6',             year: 2009, label: '2009 Audi RS 6' },
    { id: '2006-audi-rs4',             year: 2006, label: '2006 Audi RS 4' },
    { id: '2003-audi-rs6',             year: 2003, label: '2003 Audi RS 6' },
    { id: '2001-audi-rs4-avant',       year: 2001, label: '2001 Audi RS 4 Avant' },
    { id: '1995-audi-rs2-avant',       year: 1995, label: '1995 Audi RS 2 Avant' },
    { id: '1983-audi-sport-quattro',   year: 1983, label: '1983 Audi Sport quattro' },
  ],
  'austin-healey': [
    { id: '1965-austin-healey-3000-mkiii', year: 1965, label: '1965 Austin-Healey 3000 MKIII' },
    { id: '1958-austin-healey-sprite-mk1', year: 1958, label: '1958 Austin-Healey Sprite MK1' },
  ],
  'auto-union': [
    { id: '1939-auto-union-type-d', year: 1939, label: '1939 Auto Union Type D' },
  ],
  'lamborghini': [
    { id: '2021-lambo-countach-lpi',   year: 2021, label: '2021 Lamborghini Countach LPI 800-4' },
    { id: '2020-lambo-essenza-scv12',  year: 2020, label: '2020 Lamborghini Essenza SCV12' },
    { id: '2020-lambo-sian-roadster',  year: 2020, label: '2020 Lamborghini Sián Roadster' },
    { id: '2020-lambo-huracan-evo',    year: 2020, label: '2020 Lamborghini Huracán EVO' },
    { id: '2019-lambo-urus',           year: 2019, label: '2019 Lamborghini Urus' },
    { id: '2018-lambo-aventador-svj',  year: 2018, label: '2018 Lamborghini Aventador SVJ' },
    { id: '2018-lambo-huracan-perf',   year: 2018, label: '2018 Lamborghini Huracán Performante' },
    { id: '2016-lambo-centenario',     year: 2016, label: '2016 Lamborghini Centenario LP 770-4' },
    { id: '2016-lambo-aventador-sv',   year: 2016, label: '2016 Lamborghini Aventador Superveloce' },
    { id: '2014-lambo-huracan',        year: 2014, label: '2014 Lamborghini Huracán LP 610-4' },
    { id: '2013-lambo-veneno',         year: 2013, label: '2013 Lamborghini Veneno' },
    { id: '2012-lambo-aventador-j',    year: 2012, label: '2012 Lamborghini Aventador J' },
    { id: '2012-lambo-aventador-lp700',year: 2012, label: '2012 Lamborghini Aventador LP700-4' },
    { id: '2011-lambo-sesto-forza',    year: 2011, label: '2011 Lamborghini Sesto Elemento Forza Edition' },
    { id: '2011-lambo-sesto',          year: 2011, label: '2011 Lamborghini Sesto Elemento' },
    { id: '2011-lambo-gallardo-sl',    year: 2011, label: '2011 Lamborghini Gallardo LP 570-4 Superleggera' },
    { id: '2010-lambo-murcielago-sv',  year: 2010, label: '2010 Lamborghini Murciélago LP 670-4 SV' },
    { id: '2008-lambo-reventon',       year: 2008, label: '2008 Lamborghini Reventón' },
    { id: '2002-lambo-murcielago',     year: 2002, label: '2002 Lamborghini Murciélago' },
    { id: '1999-lambo-diablo-gtr',     year: 1999, label: '1999 Lamborghini Diablo GTR' },
    { id: '1997-lambo-diablo-sv',      year: 1997, label: '1997 Lamborghini Diablo SV' },
    { id: '1988-lambo-countach-lp5000',year: 1988, label: '1988 Lamborghini Countach LP5000 QV' },
    { id: '1986-lambo-lm002',          year: 1986, label: '1986 Lamborghini LM 002' },
    { id: '1972-lambo-jarama-s',       year: 1972, label: '1972 Lamborghini Jarama S' },
    { id: '1967-lambo-miura-p400',     year: 1967, label: '1967 Lamborghini Miura P400' },
  ],
  'lancia': [
    { id: '1992-lancia-delta-evo2',    year: 1992, label: '1992 Lancia Delta HF Integrale Evo II' },
    { id: '1986-lancia-delta-s4',      year: 1986, label: '1986 Lancia Delta S4' },
    { id: '1982-lancia-037-stradale',  year: 1982, label: '1982 Lancia 037 Stradale' },
    { id: '1974-lancia-stratos',       year: 1974, label: '1974 Lancia Stratos HF Stradale' },
    { id: '1968-lancia-fulvia',        year: 1968, label: '1968 Lancia Fulvia Coupé Rallye 1.6 HF' },
  ],
  'land-rover': [
    { id: '2020-lr-defender-110',      year: 2020, label: '2020 Land Rover Defender 110' },
    { id: '2018-lr-rr-svautobiography',year: 2018, label: '2018 Range Rover SVAutobiography Dynamic' },
    { id: '2017-lr-rr-velar',          year: 2017, label: '2017 Range Rover Velar First Edition' },
    { id: '2015-lr-defender-90',       year: 2015, label: '2015 Land Rover Defender 90' },
    { id: '2014-lr-rr-sport-svr',      year: 2014, label: '2014 Range Rover Sport SVR' },
    { id: '1997-lr-defender-90',       year: 1997, label: '1997 Land Rover Defender 90' },
    { id: '1991-lr-defender-90',       year: 1991, label: '1991 Land Rover Defender 90' },
    { id: '1973-lr-range-rover',       year: 1973, label: '1973 Land Rover Range Rover' },
    { id: '1972-lr-series-iii',        year: 1972, label: '1972 Land Rover Series III' },
  ],
  'lexus': [
    { id: '2021-lexus-lc500',   year: 2021, label: '2021 Lexus LC 500' },
    { id: '2015-lexus-rc-f',    year: 2015, label: '2015 Lexus RC F' },
    { id: '2010-lexus-lfa',     year: 2010, label: '2010 Lexus LFA' },
    { id: '1997-lexus-sc300',   year: 1997, label: '1997 Lexus SC300' },
  ],
  'local-motors': [
    { id: '2014-local-motors-rally-fighter', year: 2014, label: '2014 Local Motors Rally Fighter' },
  ],
  'lola': [
    { id: '1969-lola-t70-mkiiib', year: 1969, label: '1969 Lola #6 Penske Sunoco T70 MkIIIB' },
  ],
  'lotus': [
    { id: '2023-lotus-emira',        year: 2023, label: '2023 Lotus Emira' },
    { id: '2020-lotus-evija',        year: 2020, label: '2020 Lotus Evija' },
    { id: '2016-lotus-3-eleven',     year: 2016, label: '2016 Lotus 3-Eleven' },
    { id: '2012-lotus-exige-s',      year: 2012, label: '2012 Lotus Exige S' },
    { id: '2011-lotus-exige-s',      year: 2011, label: '2011 Lotus Exige S' },
    { id: '2002-lotus-esprit-v8',    year: 2002, label: '2002 Lotus Esprit V8' },
    { id: '1999-lotus-elise-s1-190', year: 1999, label: '1999 Lotus Elise Series 1 Sport 190' },
    { id: '1997-lotus-elise-gt1',    year: 1997, label: '1997 Lotus Elise GT1' },
    { id: '1976-lotus-esprit-s1',    year: 1976, label: '1976 Lotus Esprit S1' },
    { id: '1971-lotus-elan-sprint',  year: 1971, label: '1971 Lotus Elan Sprint' },
    { id: '1956-lotus-eleven',       year: 1956, label: '1956 Lotus Eleven' },
  ],
  'lucid': [
    { id: '2022-lucid-air-sapphire', year: 2022, label: '2022 Lucid Air Sapphire' },
  ],
  'lynk-co': [
    { id: '2021-lynkco-03-cyan',  year: 2021, label: '2021 Lynk & Co 03 Cyan Racing' },
    { id: '2020-lynkco-03-plus',  year: 2020, label: '2020 Lynk & Co 03+' },
  ],
  'subaru': [
    { id: '2022-subaru-wrx',            year: 2022, label: '2022 Subaru WRX' },
    { id: '2022-subaru-brz',            year: 2022, label: '2022 Subaru BRZ' },
    { id: '2004-subaru-impreza-wrx-sti', year: 2004, label: '2004 Subaru Impreza WRX STi' },
  ],
}
