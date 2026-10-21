import {offsetMetres} from './motion.js';
import {FINANCE_BOUNDARIES,FINANCE_PAVING,FINANCE_TREES} from './finance-frontage-map.js';
export {FINANCE_BOUNDARIES,FINANCE_PAVING,FINANCE_TREES};

// Original reconstruction from official 2021 photography, January 2016 Street
// View and overhead context checked 21 October 2026. These are estimates, not a
// survey of current access or a claim that the ministry still operates here.
export const FINANCE_FRONTAGE_IDS=[16546541,596516562,1215731838,1017656842,1028531778];
export const FINANCE_GATES=[
 {zone:'finance',position:[-.19648,5.549381],width:7},
 {zone:'commission',position:[-.19546,5.549087],width:7},
];
export const FINANCE_OUTLINES=[
 {zone:'finance',a:[-.19666,5.549385],b:[-.19596,5.549369],height:1.45,kind:'screen'},
 {zone:'finance',a:[-.19565,5.549284],b:[-.19496,5.549233],height:1.15,kind:'garden'},
 {zone:'commission',a:[-.19579,5.549074],b:[-.19529,5.549102],height:1.25,kind:'rail'},
];
export const FINANCE_TREE_SEEDS=[
 {zone:'finance',position:[-.19655,5.54937],height:7.5,palm:true},
 {zone:'finance',position:[-.19607,5.549353],height:7,palm:true},
 {zone:'finance',position:[-.19555,5.54932],height:5.8},
 {zone:'finance',position:[-.19522,5.54930],height:6.4},
 {zone:'commission',position:[-.19525,5.54899],height:5.6},
];
export const FINANCE_CANOPY={position:[-.19600,5.54938],width:7,depth:4.5,height:3.15};
export const FINANCE_PARKING=[
 {zone:'finance',a:[-.19562,5.54943],b:[-.19512,5.54940],width:4.7},
];
export const FINANCE_ACTIVITIES=[
 {id:'finance-frontage-photo',kind:'photo',label:'Photograph the Finance Drive facade',position:[-.19635,5.5492840676],target:[-.19630,5.54946],elevation:0,text:'The patterned facade belongs to the older Finance Drive complex. The Finance Ministry moved its headquarters to Kanda in February 2026.'},
];
export function financeRect(position,w,d){return [[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2],[-w/2,-d/2]].map(([x,z])=>offsetMetres(position,x,-z));}
const colliderCache=new Map();
export function financeColliders(zone){if(!colliderCache.has(zone))colliderCache.set(zone,[...FINANCE_BOUNDARIES.filter(s=>s.zone===zone).map((s,i)=>{
 const a=s.a,b=s.b,dx=(b[0]-a[0])*110800,dy=(b[1]-a[1])*111320,len=Math.hypot(dx,dy),x=-dy/len*.16,y=dx/len*.16;
 const ring=[offsetMetres(a,x,y),offsetMetres(b,x,y),offsetMetres(b,-x,-y),offsetMetres(a,-x,-y)];ring.push(ring[0]);return {id:'finance-boundary-'+zone+'-'+i,rings:[ring],height:s.height,noDoor:true};
}),...FINANCE_GATES.filter(g=>g.zone===zone).flatMap((g,i)=>[-1,1].map(side=>({id:'finance-gate-post-'+zone+'-'+i+'-'+side,rings:[financeRect(offsetMetres(g.position,side*(g.width/2+.35),0),.6,.6)],height:2.12,noDoor:true}))),...(zone==='finance'?[-3,3].map(dx=>({id:'finance-canopy-post-'+dx,rings:[financeRect(offsetMetres(FINANCE_CANOPY.position,dx,-1.9),.16,.16)],height:3.15,noDoor:true})):[]),...FINANCE_TREES.filter(t=>t.zone===zone).map((t,i)=>({id:'finance-tree-'+zone+'-'+i,rings:[financeRect(t.position,.5,.5)],height:t.height,noDoor:true}))]);return colliderCache.get(zone);}
