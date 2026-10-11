// Original fictional programmes; these are not recordings of real institutions.
export const VENUE_PROGRAMS={
 church:{title:'Church service · sermon',speaker:'Minister',sound:'speech',lines:[
  'Welcome, everyone. Today we reflect on loving our neighbours: noticing who needs help and choosing kindness in our daily lives.',
  'Faith is lived through service. This week, make time to listen to someone, share a meal, or help a neighbour who is struggling.',
  'Let us take a quiet moment to reflect and give thanks. Our stewards are here to welcome visitors and help you find a seat.'
 ]},
 mosque:{title:'Prayer hall · community teaching',speaker:'Community teacher',sound:'speech',lines:[
  'Peace be upon you. Welcome to this community gathering. Please leave footwear at the entrance and keep the prayer rows clear.',
  'Today our discussion is about generosity, honesty and care for our neighbours. Small acts of service strengthen a community.',
  'There is space for quiet prayer and reflection. Please respect those praying, and ask the steward if you need guidance.'
 ]},
 campus:{title:'Open lecture · computing',speaker:'Lecturer',sound:'speech',lines:[
  'Welcome to our open computing lecture. An algorithm is a clear sequence of steps used to solve a problem.',
  'Consider planning a journey across Accra. We represent intersections as nodes, roads as edges, and travel time as the cost of an edge.',
  'The shortest route in distance is not always the quickest. Congestion changes travel time. A useful route planner updates those costs.',
  'Try the learning station: explain why a longer route can be faster. Compare distance with travel time, then check your answer.'
 ]},
 classroom:{title:'Class in session · everyday mathematics',speaker:'Teacher',sound:'speech',lines:[
  'Welcome to class. Today we are learning how to calculate change when shopping at a market.',
  'If you pay fifty cedis for goods costing thirty five cedis, subtract thirty five from fifty. Your change is fifteen cedis.',
  'You can check subtraction using addition. Thirty five plus fifteen equals fifty. Try the practice question at the learning station.'
 ]},
 nightclub:{title:'DJ set · dance floor open',speaker:'DJ',sound:'music',lines:['An original instrumental club rhythm. Join the dance floor, relax in the lounge or meet other players.']},
 beach:{title:'Beachfront · ocean breeze',speaker:'Beach host',sound:'surf',lines:['Walk along the shore, listen to the waves and relax under the shade.']}
};
export function venueProgramme(kind,seconds=0){const p=VENUE_PROGRAMS[kind];if(!p)return null;const index=Math.floor(Math.max(0,seconds)/24)%p.lines.length;return {...p,id:`${kind}:${index}`,kind,text:p.lines[index]}}
export function venueCast(kind,count){
 const cast=[];for(let i=0;i<count;i++){
  if(i===0){cast.push(null);continue}
  if(kind==='church')cast.push(i===1?{role:'Minister',pose:'speak',point:[0,-15.7],yaw:Math.PI}:{role:'Congregant',pose:'sit',point:[(i%2?1:-1)*(4+(i%3)), -8+Math.floor((i-2)/4)*3],yaw:0});
  else if(kind==='mosque')cast.push(i===1?{role:'Community teacher',pose:'speak',point:[0,-16],yaw:Math.PI}:{role:'Worshipper',pose:'reflect',point:[((i-2)%5-2)*2.5,-12+Math.floor((i-2)/5)*3],yaw:0});
  else if(kind==='campus')cast.push(i>7?null:i===1?{role:'Lecturer',pose:'speak',point:[-14,-16],yaw:Math.PI}:{role:'Student',pose:'sit',point:[i%2?-18:-11,-12.7+Math.floor((i-2)/2)*6],yaw:0});
  else if(kind==='classroom')cast.push(i===1?{role:'Teacher',pose:'speak',point:[0,-12],yaw:Math.PI}:{role:'Learner',pose:'sit',point:[((i-2)%4-1.5)*4,-7+Math.floor((i-2)/4)*4],yaw:0});
  else if(kind==='nightclub')cast.push(i===1?{role:'DJ',pose:'mix',point:[0,-11],yaw:Math.PI}:{role:'Dancer',pose:'dance',point:[((i-2)%4-1.5)*2.5,-5+Math.floor((i-2)/4)*3],yaw:(i%3)*1.2});
  else cast.push(null);
 }return cast;
}
export function learningExercise(kind){return kind==='classroom'?{question:'You pay GH₵100 for goods costing GH₵65. How much change should you receive?',answer:'GH₵35. Check: 65 + 35 = 100.'}:{question:'Why might a longer route through Accra get you there sooner?',answer:'Travel time depends on speed and delays as well as distance. A longer road with less traffic can take less time.'}}
