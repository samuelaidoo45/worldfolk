import {offsetMetres,bearingTo,distanceMetres} from './motion.js';
// Three source footprints belong to the photographed courtyard complex.
// Heights/vertical subdivisions are photo estimates, not a measured survey.
export const GALLERY={id:'the-gallery',name:'The Gallery Apartments',position:[-.17149,5.62591],rotation:0,width:80,depth:70,height:33,sourceIds:[1483753584,1483753586,1483753588]};
export const GALLERY_ROTATION=.366;
export const galleryPoint=(x,z)=>{const a=GALLERY_ROTATION;return offsetMetres(GALLERY.position,x*Math.cos(a)+z*Math.sin(a),x*Math.sin(a)-z*Math.cos(a))};
export const galleryLocal=p=>{const x=(p[0]-GALLERY.position[0])*111320*Math.cos(GALLERY.position[1]*Math.PI/180),z=(GALLERY.position[1]-p[1])*111320,a=GALLERY_ROTATION;return [x*Math.cos(a)-z*Math.sin(a),x*Math.sin(a)+z*Math.cos(a)]};
export const GALLERY_RINGS={"1483753584": [[-0.1713271, 5.6259461], [-0.1713467, 5.6260017], [-0.1713073, 5.6260155], [-0.171313, 5.6260315], [-0.1712677, 5.6260473], [-0.1712634, 5.6260351], [-0.1712386, 5.6260437], [-0.1712229, 5.6259993], [-0.1712121, 5.6260031], [-0.1711778, 5.6259058], [-0.1711879, 5.6259022], [-0.1711788, 5.6258765], [-0.1711681, 5.6258461], [-0.1711813, 5.6258414], [-0.1711801, 5.6258379], [-0.1712737, 5.6258052], [-0.1712921, 5.6258575], [-0.1713176, 5.6258485], [-0.1713493, 5.6259384], [-0.1713271, 5.6259461]], "1483753586": [[-0.1717873, 5.6260277], [-0.1717975, 5.6260542], [-0.1717408, 5.6260758], [-0.1717469, 5.6260917], [-0.1716836, 5.6261159], [-0.1716772, 5.6260992], [-0.1715007, 5.6261668], [-0.1715065, 5.6261819], [-0.1714328, 5.6262101], [-0.1714273, 5.6261958], [-0.1713737, 5.6262163], [-0.1713582, 5.626176], [-0.1713556, 5.626177], [-0.1713292, 5.6261089], [-0.171389, 5.626086], [-0.1713798, 5.6260624], [-0.1717007, 5.6259396], [-0.1717077, 5.6259578], [-0.1717588, 5.6259383], [-0.1717743, 5.6259783], [-0.1717813, 5.6259756], [-0.1717996, 5.626023], [-0.1717873, 5.6260277]], "1483753588": [[-0.1717657, 5.6258361], [-0.1717699, 5.6258485], [-0.171717, 5.6258661], [-0.1717144, 5.6258583], [-0.1716711, 5.6258726], [-0.1716524, 5.6258168], [-0.171633, 5.6258232], [-0.1716012, 5.6257281], [-0.1716179, 5.6257225], [-0.1715992, 5.6256667], [-0.1716376, 5.625654], [-0.1716361, 5.6256496], [-0.1717023, 5.6256277], [-0.1717186, 5.6256764], [-0.1717429, 5.6256683], [-0.1717779, 5.6257726], [-0.1717657, 5.6257766], [-0.1717836, 5.6258302], [-0.1717657, 5.6258361]]};
export const GALLERY_BLOCKS=[
 {id:1483753586,x:-1.45,z:-20.25,w:52.1,d:17.7,levels:10},
 {id:1483753588,x:-27.05,z:8.3,w:17.5,d:26,levels:10},
 {id:1483753584,x:23.95,z:7.1,w:17.1,d:25.4,levels:10},
];
export const GALLERY_ARRIVAL=galleryPoint(-2,25);
export const GALLERY_PLACE={id:'gallery',name:'The Gallery Apartments',lng:GALLERY_ARRIVAL[0],lat:GALLERY_ARRIVAL[1],area:'Shiashie · behind Accra Mall',type:'Apartments',category:'apartments',emoji:'🏙️',description:'White balcony residences around a planted courtyard, with a rooftop pool and a furnished apartment to explore.',activities:['stroll','connect']};
export const isGallery=p=>p?.id==='gallery'||/^the gallery apartments$/i.test(p?.name||'')||(/^the gallery$/i.test(p?.name||'')&&(!Number.isFinite(p.lng)||distanceMetres([p.lng,p.lat],GALLERY.position)<100));
export const GALLERY_PLANTERS=[[-10,1,9,8],[7,1,9,8],[-10,14,9,8],[7,14,9,8]];
export const GALLERY_BENCH=[-11,23];
export function galleryRectangle(x,z,w,d){return [[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2],[-w/2,-d/2]].map(([dx,dz])=>galleryPoint(x+dx,z+dz))}
export function galleryColliders(){return Object.entries(GALLERY_RINGS).map(([id,ring])=>({id:'gallery:'+id,rings:[ring],height:30,noDoor:true})).concat([...GALLERY_PLANTERS,[...GALLERY_BENCH,2.4,.7],[-2,-10.25,5,.28]].map(([x,z,w,d],i)=>({id:'gallery:prop-'+i,rings:[galleryRectangle(x,z,w,d)],height:i===5?30:.8,noDoor:true})))}
export const GALLERY_ACTIVITIES=[
 {id:'gallery-photo',kind:'photo',label:'Photograph The Gallery courtyard',position:GALLERY_ARRIVAL,target:galleryPoint(-2,-20),elevation:0,text:'The Gallery · white balconies, recessed timber panels and a planted courtyard.'},
 {id:'gallery-seat',kind:'sit',label:'Sit in The Gallery garden',position:galleryPoint(-11,24.4),seatPosition:galleryPoint(...GALLERY_BENCH),heading:180+GALLERY_ROTATION*180/Math.PI,elevation:0,offset:-.45},
].map(p=>({...p,heading:p.heading??bearingTo(p.position,p.target)}));
