// Reference-led silhouettes and colours; map footprints remain authoritative.
// These profiles are artistic reconstructions, not scans or measured interiors.
export const LANDMARKS=[
 {id:'accra-mall',match:/^accra mall$/i,palette:{wall:'#c8b49a',trim:'#deded6',accent:'#475961',roof:'#9da7a6'},detail:'mall-canopy',roof:'flat'},
 {id:'balme-library',match:/balme library/i,palette:{wall:'#ece8dc',trim:'#f4efdf',accent:'#634b39',roof:'#a55137'},detail:'clock-tower',roof:'pitched'},
 {id:'legon',match:/university of ghana|legon hall|great hall.*legon/i,palette:{wall:'#e4e1d3',trim:'#f4eedd',accent:'#69543e',roof:'#a95035'},roof:'pitched'},
 {id:'national-mosque',match:/ghana national mosque|national mosque of ghana|national mosque/i,palette:{wall:'#e4dfd2',trim:'#f0ece2',accent:'#658184',roof:'#899697'},detail:'ottoman-domes',roof:'flat'},
 {id:'holy-trinity',match:/^(?!.*school).*(holy trinity cathedral|cathedral church of the most holy trinity)/i,palette:{wall:'#a76f50',trim:'#d6c6ae',accent:'#665042',roof:'#635e59'},detail:'brick-tower',roof:'pitched'},
 {id:'independence',match:/independence square|black star square|black star gate/i,palette:{wall:'#d8cfb9',trim:'#ece6d5',accent:'#383d39',roof:'#bab8ad'}},
 {id:'labadi',match:/labadi beach|la pleasure beach/i,palette:{wall:'#cab694',trim:'#e5ddc8',accent:'#42756e',roof:'#897052'}},
 {id:'makola',match:/makola market/i,palette:{wall:'#c1aa8b',trim:'#dfd2b6',accent:'#8c5942',roof:'#838787'}}
];
export const landmarkProfile=name=>LANDMARKS.find(p=>p.match.test(String(name||'')))||null;
