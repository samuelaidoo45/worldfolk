// Deterministic architectural variety. These defaults are game interpretations,
// not claims about surveyed facade photographs. OSM tags take precedence.
export function facadeLayout(design={}){
 const seed=design.seed>>>0,style=design.style||'plaster',kind=design.kind||'home';
 const commercial=['shop','market','restaurant','nightclub'].includes(style),glass=['glass','office','bank'].includes(style);
 const variants=['louvre','sliding','shutter','recessed'];
 return {window:glass?'curtain':commercial?'storefront':variants[(seed>>>4)%variants.length],bayWidth:glass?2.8:commercial?3.8:[3,3.4,4.2,3.6][seed%4],floorHeight:glass?3.5:3.1,weathering:(seed%4+1)*.035,
 balcony:!commercial&&!glass&&['home','hotel'].includes(kind)&&seed%3===0,
 awning:commercial||style==='veranda'||style==='coastal',aircon:glass||seed%3===1,
 roof:design.roofMapped?design.roof:(['home','classroom','restaurant','shop'].includes(kind)&&seed%4!==0?'pitched':'flat')};
}
