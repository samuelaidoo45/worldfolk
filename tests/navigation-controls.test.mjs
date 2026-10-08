import test from 'node:test';
import assert from 'node:assert/strict';
import {createNavigation} from '../public/game/navigation.js';
class Element{
 constructor(){this.children=[];this.queries=new Map();this.value='';this.classList={toggle(){},add(){},remove(){}}}
 setAttribute(){} append(...items){this.children.push(...items)}appendChild(item){this.append(item)}after(){}focus(){}blur(){}replaceChildren(){this.children=[]}
 querySelector(key){if(!this.queries.has(key))this.queries.set(key,new Element());return this.queries.get(key)}
}
test('destination auto-drive starts at 4x, manual selection stays manual and skip invokes arrival',async()=>{
 const old=globalThis.document;globalThis.document={createElement:()=>new Element(),getElementById:()=>new Element()};
 try{
 let mode='drive',rate=0,skips=0;const sources=new Map(),destination={name:'Accra Mall',lng:-.1738,lat:5.6224};
 const nav=createNavigation({map:{getSource:id=>sources.get(id),addSource:id=>sources.set(id,{setData(){}}),getLayer:()=>true},places:[],getPosition:()=>[-.1787,5.6093],getMode:()=>mode,onAutoStart:async r=>{rate=r;return true},onSkip:async p=>{assert.equal(p,destination);skips++;return true},routeService:async()=>({code:'Ok',routes:[{geometry:{coordinates:[[-.1787,5.6093],[-.1738,5.6224]]}}]})});
 await nav.to(destination,'auto');assert.equal(nav.autoDriving,true);assert.equal(rate,4);
 nav.stopAuto();assert.equal(nav.autoDriving,false);await nav.to(destination,'manual');assert.equal(nav.autoDriving,false);
 await nav.to(destination,'skip');assert.equal(skips,1);assert.equal(nav.arrived,true);
 mode='walk';await nav.to(destination,'auto');assert.equal(nav.autoDriving,false);await nav.to(destination,'skip');assert.equal(skips,1);
 nav.cancel();assert.equal(nav.coordinates.length,0);
 }finally{globalThis.document=old}
});
