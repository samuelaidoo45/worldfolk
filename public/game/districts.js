import {distanceMetres} from './motion.js';
export const VENUES=[
 // Mapped stadium coordinates: https://www.geonames.org/6619729/accra-sports-stadium.html
 {id:'g_-1918_55516',name:'Accra Sports Stadium',lng:-.1918,lat:5.5516,type:'Stadium',emoji:'⚽',area:'Osu',description:'Walk the concourse and watch a simulated match from pitch side. Game interpretation of the venue.',activities:['explore']},
 {id:'g_-2060_55414',name:'Holy Trinity Cathedral',lng:-.2060,lat:5.5414,type:'Church',emoji:'⛪',area:'High Street',description:'A quiet church setting with pews and a central aisle. Game interpretation of the mapped venue.',activities:['explore']},
 {id:'g_-1896_55907',name:'Ghana National Mosque',lng:-.1896,lat:5.5907,type:'Mosque',emoji:'🕌',area:'Kanda',description:'A peaceful prayer hall and courtyard. Game interpretation of the mapped venue.',activities:['explore']}
];
export const DISTRICTS=[
 {kind:'market',name:'Makola · market quarter',lng:-.2141,lat:5.5485,radius:420,color:'#df9c39',detail:'Market lanes · stalls, produce and shopfronts'},
 {kind:'market',name:'Kaneshie · market quarter',lng:-.2346,lat:5.5724,radius:390,color:'#db8942',detail:'Market lanes · covered trading stalls'},
 {kind:'beach',name:'La · coastal neighbourhood',lng:-.140846,lat:5.561955,radius:650,color:'#42b3bc',detail:'Coastal setting · shade, palms and beach cafés'},
 {kind:'heritage',name:'Jamestown · old Accra',lng:-.2161,lat:5.5352,radius:650,color:'#d98665',detail:'Heritage streets · painted plaster and shutters'},
 {kind:'office',name:'Airport City · business district',lng:-.1787,lat:5.6093,radius:750,color:'#5c9eb5',detail:'Business district · glass offices and hotels'},
 {kind:'retail',name:'Osu · high street',lng:-.1819,lat:5.5598,radius:650,color:'#ba719d',detail:'High street · shops, cafés and terraces'},
 {kind:'campus',name:'Legon · campus',lng:-.1874,lat:5.651,radius:850,color:'#75a96a',detail:'Campus · shaded paths and academic buildings'},
 {kind:'retail',name:'Accra Mall · retail district',lng:-.1738,lat:5.6224,radius:450,color:'#bd8d58',detail:'Retail district · broad shopfronts and arcades'},
];
export function venueKind(place){const text=`${place?.name||''} ${place?.type||''}`.toLowerCase();if(/mosque|masjid/.test(text))return 'mosque';if(/church|cathedral|chapel/.test(text))return 'church';if(/market/.test(text))return 'market';if(/beach|coast/.test(text))return 'beach';return null}
export function districtAt(position){for(const v of VENUES)if(distanceMetres(position,[v.lng,v.lat])<85)return {kind:venueKind(v),name:v.name,color:venueKind(v)==='mosque'?'#78aa98':'#aa888d',detail:'Quiet public space · enter respectfully'};return DISTRICTS.find(d=>distanceMetres(position,[d.lng,d.lat])<d.radius)||{kind:'residential',name:'Accra · neighbourhood',color:'#8fb7ac',detail:'Neighbourhood streets · homes, gardens and local shops'}}
export function stableHash(value){let h=2166136261;for(const c of String(value)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
export function buildingStyle(feature){const ring=feature.geometry.type==='Polygon'?feature.geometry.coordinates[0]:feature.geometry.coordinates[0][0],coords=ring.slice(0,-1),center=[coords.reduce((s,p)=>s+p[0],0)/coords.length,coords.reduce((s,p)=>s+p[1],0)/coords.length],seed=stableHash(feature.id??ring[0].map(v=>v.toFixed(6)).join(',')),district=districtAt(center),type=[feature.properties?.type,feature.properties?.class,feature.properties?.building,feature.properties?.amenity,feature.properties?.religion].filter(Boolean).join(' ').toLowerCase();
 const options=district.kind==='market'?['market','shop','plaster']:district.kind==='beach'?['coastal','veranda','pastel']:district.kind==='heritage'?['heritage','pastel','plaster']:district.kind==='office'?['glass','office','apartment']:district.kind==='retail'?['shop','apartment','veranda']:district.kind==='campus'?['school','plaster','veranda']:['plaster','pastel','plaster','veranda','apartment'];
 const material=String(feature.properties?.['building:material']||'').toLowerCase();const style=material==='brick'?'brick':material==='glass'?'glass':/mosque|muslim/.test(type)?'mosque':/church|cathedral/.test(type)?'church':/office|commercial/.test(type)?'office':/house|residential|bungalow/.test(type)?'plaster':/apartments|hotel/.test(type)?'apartment':/retail|shop/.test(type)?'shop':/school|university/.test(type)?'school':options[seed%options.length];
 const height=Math.max(3,Number(feature.properties?.height)||Number(feature.properties?.['building:levels'])*3||4.5);const roof=/gabled|hipped|pyramidal/.test(feature.properties?.['roof:shape']||'')?'pitched':'flat';return {style,seed,center,height,roof,roofMapped:!!feature.properties?.['roof:shape'],district:district.kind};
}
