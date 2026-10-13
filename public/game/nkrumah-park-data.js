import {offsetMetres} from './motion.js';
// OSM way 632287728 anchors the monument; way 413669874 is the low museum
// behind it. Metre dimensions are visual estimates, not an architectural survey.
export const NKRUMAH_PARK={id:'nkrumah-mausoleum',name:'Kwame Nkrumah Memorial Park',sourceIds:[632287728,413669874],position:[-.2026852534,5.5443538],rotation:-142,width:130,depth:195,height:22};
export const PARK_BOUNDARY=[[-.2036044,5.5450214],[-.20327,5.5453927],[-.2028174,5.5456969],[-.2024052,5.544988],[-.2017978,5.544277],[-.2027688,5.5434763],[-.2032363,5.5438336],[-.2032263,5.5438455],[-.203275,5.5438871],[-.2032554,5.5439174],[-.2034312,5.5440901],[-.2039413,5.5444886],[-.2036044,5.5450214]];
export function parkPoint(x,z){const a=NKRUMAH_PARK.rotation*Math.PI/180;return offsetMetres(NKRUMAH_PARK.position,x*Math.cos(a)+z*Math.sin(a),x*Math.sin(a)-z*Math.cos(a))}
export function parkLocal(p){const a=NKRUMAH_PARK.rotation*Math.PI/180,e=(p[0]-NKRUMAH_PARK.position[0])*111320*Math.cos(p[1]*Math.PI/180),n=(p[1]-NKRUMAH_PARK.position[1])*111320;return [e*Math.cos(a)+n*Math.sin(a),e*Math.sin(a)-n*Math.cos(a)]}
// Shared solid footprints preserve the central promenade and museum doorway.
export const PARK_SOLIDS=[
 ...[-1,1].flatMap(side=>[[side*14.5,0,8,30,.35],[side*9,49,11,40,.85],...[-1,1].flatMap(s=>[[s*7.5,side*6,9,1.1],[side*6,s*7.5,1.1,9],[s*1.25,side*6,1.05,.9],[side*6,s*1.25,.9,1.05]])]),
 [0,0,2.4,3.4,1.1],[0,23,3.4,3.4,6.4],
 [-10,-43,.35,20,3.8],[10,-43,.35,20,3.8],[0,-53,20,.35,3.8],[-6.1,-33,7.8,.35,3.8],[6.1,-33,7.8,.35,3.8],
 [-6,-42.5,3,.65,1.5],[6,-42.5,3,.65,1.5],[0,-48.5,3,.65,1.5],[-7,-48,2,2,2.1],
];
export const PARK_EXHIBITS=[
 {id:'park-history',x:-6,z:-40,label:'Explore the independence timeline',text:'Ghana became independent on 6 March 1957. Kwame Nkrumah led the independence movement and became the country’s first president in 1960.'},
 {id:'park-legacy',x:6,z:-40,label:'Explore the Pan-African gallery',text:'Nkrumah advocated African unity. The memorial museum preserves objects and documents from his life. This game gallery is an interpretation, not a replica of the museum collection.'},
 {id:'park-mausoleum-story',x:0,z:-46,label:'Read about the memorial',text:'Architect Don Arthur designed the marble mausoleum as an inverted sword, a symbol of peace. Kwame Nkrumah and Fathia Nkrumah are buried here.'},
];
export const PARK_ACTIVITIES=[
 {id:'park-photo',kind:'photo',label:'Photograph the mausoleum and statue',x:0,z:76,target:NKRUMAH_PARK.position},
 {id:'park-fountains',kind:'watch',label:'Watch the memorial fountains',x:0,z:53,target:parkPoint(-9,49),text:'The fountain figures and reflecting pools lead toward the mausoleum. Take a quiet moment here, or follow the path around the monument to the museum.'},
 {id:'park-bench',kind:'sit',label:'Sit in the memorial gardens',x:25,z:25,seatPosition:parkPoint(25,25),heading:(270-NKRUMAH_PARK.rotation+360)%360,offset:-.45},
 ...PARK_EXHIBITS.map(p=>({...p,kind:'watch',target:parkPoint(p.x,p.z-3)})),
].map(p=>({...p,position:parkPoint(p.x,p.z),elevation:0}));
