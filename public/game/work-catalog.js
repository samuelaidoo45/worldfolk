// Fictional professions and assignments using the game's existing Accra destinations.
const step=(label,place,prompt,choices,answer=0)=>({label,place,prompt,choices,answer});
const drive=(id,name,place,to,wage,vehicle='car')=>({id,name,place,wage,seconds:60,energy:11,category:'Driving',vehicle,mobile:true,task:'Collect passengers, drive the route, park and complete the fare.',steps:[step('Collect passengers',place,'Your passengers are waiting. What do you do?',['Confirm their destination and seat them','Leave without the passengers']),step('Drop off passengers',to,'Park safely at the destination.',['Help passengers get out safely','Stop in moving traffic']),step('Close the fare',to,'Finish this journey.',['Record the completed fare','Charge the same fare twice'])]});
export const EXTRA_JOBS=[
 drive('trotro','Tro-tro driver','kaneshie','makola',160,'bus'),
 drive('uber','Uber driver (game role)','airport','mall',150),
 drive('bolt','Bolt driver (game role)','osu','airport',140),
 {id:'police',name:'Police officer',place:'airport',wage:165,seconds:75,energy:14,category:'Public service',mobile:true,task:'Patrol public places, assist an NPC and file a report. No power over other players.',steps:[step('Attend briefing','airport','A pedestrian needs help crossing.',['Assist safely','Stop random players']),step('Help at the crossing','osu','Traffic is flowing. What is safest?',['Wait for a safe gap and guide the pedestrian','Push the pedestrian into traffic']),step('File patrol report','airport','Record what happened.',['Write a factual incident report','Invent an arrest'])]},
 {id:'momo-agent',name:'MoMo agent',place:'osu',wage:120,seconds:60,energy:9,category:'Trade',task:'Serve fictional NPC cash customers and reconcile your till.',steps:[step('Verify customer','osu','An NPC requests a withdrawal.',['Confirm the amount and transaction','Ask for their real mobile-money PIN']),step('Count the cash','osu','Give ₵70 using ₵20 and ₵10 notes.',['Three ₵20 notes and one ₵10 note','Two ₵20 notes and one ₵10 note']),step('Reconcile till','osu','Opening cash ₵200, withdrawal ₵70: closing cash?',['₵130','₵270'])]},
 {id:'footballer',name:'Footballer',place:'g_-1732_55864',wage:180,seconds:90,energy:20,category:'Sport & creative',task:'Complete training, a passing drill and a match decision.',steps:[step('Warm up','g_-1732_55864','Prepare for training.',['Stretch and warm up','Sprint without warming up']),step('Passing drill','g_-1732_55864','A teammate is free in space.',['Pass into their path','Pass to the marked opponent']),step('Match play','g_-1732_55864','The goalkeeper leaves the far corner open.',['Aim at the open corner','Kick directly at the keeper'])]},
 {id:'market-seller',name:'Market seller',place:'makola',wage:110,seconds:55,energy:10,category:'Trade',task:'Stock produce, serve customers and balance sales.'},
 {id:'street-hawker',name:'Street hawker',place:'kaneshie',wage:100,seconds:50,energy:13,category:'Trade',mobile:true,task:'Sell water from safe pedestrian areas at two market stops.',steps:[step('Prepare stock','kaneshie','Where should you serve customers?',['On the pavement, clear of traffic','In an active traffic lane']),step('Serve a customer','makola','Water costs ₵4; customer gives ₵10.',['Return ₵6 change','Return ₵4 change']),step('Record sales','makola','You sold five bottles at ₵4.',['Record ₵20 in sales','Record ₵40 in sales'])]},
 {id:'courier',name:'Delivery rider',place:'mall',wage:145,seconds:65,energy:12,category:'Driving',vehicle:'motorcycle',mobile:true,task:'Collect a package and deliver it to Airport City.',steps:[step('Collect parcel','mall','Check the delivery.',['Match parcel and destination','Take an unlabelled parcel']),step('Deliver parcel','airport','Hand over the package.',['Confirm the recipient','Leave it in the road']),step('Finish delivery','airport','Complete your delivery record.',['Record delivery confirmation','Mark an undelivered package complete'])]},
 {id:'mechanic',name:'Mechanic',place:'kaneshie',wage:155,seconds:80,energy:15,category:'Skilled work',task:'Inspect a vehicle, replace a worn part and test it.'},
 {id:'nurse',name:'Clinic nurse',place:'legon',wage:160,seconds:80,energy:14,category:'Public service',task:'Help fictional NPC patients with a basic clinic workflow.'},
 {id:'barber',name:'Barber / hairstylist',place:'osu',wage:115,seconds:60,energy:10,category:'Skilled work',task:'Prepare your station, serve a client and clean up.'},
 {id:'musician',name:'Musician',place:'theatre',wage:170,seconds:85,energy:16,category:'Sport & creative',task:'Sound-check, perform a set and close the show.'},
 {id:'photographer',name:'Photographer',place:'arts',wage:135,seconds:65,energy:11,category:'Sport & creative',task:'Plan a shoot, frame a picture and deliver the selection.'}
];
const templates={
 office:[['Organise requests','Several requests arrive at the desk.',['Sort them by urgency and deadline','Delete the requests']],['Update records','You notice an incorrect entry.',['Check the source and correct it','Copy the error into another record']],['Handover','Your shift is ending.',['Record completed and pending work','Leave no notes']]],
 cafe:[['Prepare the order','A customer orders a meal.',['Confirm the order and dietary needs','Prepare a random order']],['Serve the meal','Before serving the food…',['Check the order and use clean utensils','Skip the order check']],['Close the bill','The meal is ₵12 and the customer pays ₵20.',['Return ₵8','Return ₵12']]],
 retail:[['Check stock','A delivery arrives.',['Match the stock to the delivery note','Guess the quantities']],['Assist a shopper','A customer needs help finding an item.',['Check the aisle and guide them','Ignore them']],['Close the till','A ₵12 item is paid with ₵20.',['Return ₵8','Return ₵12']]],
 coder:[['Read the brief','A client needs a working contact form.',['Confirm required fields and behaviour','Start without reading the requirements']],['Fix the bug','A total is wrong. What comes first?',['Reproduce it and inspect the calculation','Hide the incorrect total']],['Test and deliver','Before handing over the website…',['Run tests and check the form','Skip testing']]],
 teacher:[['Prepare the lesson','What helps learners follow the lesson?',['Set a clear learning objective','Start an unrelated topic']],['Help a pupil','A pupil asks: what is 6 × 7?',['42','36']],['Check understanding','How do you check learning?',['Ask pupils to explain and practise','Assume everyone understood']]],
 mechanic:[['Inspect vehicle','Before starting repairs…',['Secure the parked vehicle','Work beneath an unsecured vehicle']],['Replace worn part','A tyre is badly worn.',['Fit a suitable replacement','Paint over the damage']],['Final check','Before returning the vehicle…',['Check and test the repair','Skip the checks']]],
 nurse:[['Prepare station','Before helping a patient…',['Clean hands and prepare equipment','Reuse unclean equipment']],['Record observations','The patient describes symptoms.',['Record them accurately for the clinician','Invent a diagnosis']],['Handover','Finish the task.',['Give a clear handover to the clinician','Discard the observations']]],
 barber:[['Prepare tools','Before serving a client…',['Clean the tools','Use dirty tools']],['Serve client','Choose a style.',['Confirm what the client wants','Ignore the client']],['Clean station','Before the next customer…',['Clean and reset the station','Leave clippings everywhere']]],
 musician:[['Sound check','Before the set…',['Check levels with the crew','Ignore the sound system']],['Perform','Stay with the band.',['Follow the rhythm and cues','Ignore every cue']],['Finish set','End the performance.',['Thank the audience and pack up','Leave equipment in the exit']]],
 photographer:[['Plan shoot','Before taking a portrait…',['Ask permission and agree the shot','Ignore the subject']],['Frame the shot','Your subject is backlit.',['Adjust exposure and composition','Cover the lens']],['Deliver selection','Finish the commission.',['Choose and deliver the agreed photos','Delete the whole shoot']]]
};
/**
 * @typedef {{label:string,place:string,prompt:string,choices:string[],answer:number}} WorkStep
 * @typedef {{id:string,name:string,place:string,wage:number,seconds:number,energy:number,task:string,category?:string,vehicle?:string,mobile?:boolean,steps?:WorkStep[]}} WorkJob
 * @param {WorkJob[]} jobs
 * @returns {(WorkJob & {steps:WorkStep[],category:string})[]}
 */
export function prepareJobs(jobs){return jobs.map(job=>{
 if(job.id==='driver')return {...drive('driver','Taxi driver','airport','osu',115),seconds:65};
 const name=job.id==='teacher'?'Teacher':job.name,category=job.category||(['teacher','school-assistant'].includes(job.id)?'Public service':['coder','office','bank-clerk'].includes(job.id)?'Skilled work':'Trade');
 const tasks=templates[job.id]||templates[{'restaurant-crew':'cafe','school-assistant':'teacher','mall-stock':'retail','bank-clerk':'office'}[job.id]]||[['Prepare your station','A customer arrives.',['Prepare the workstation and check the order','Ignore the order']],['Serve the customer','The customer pays ₵20 for an ₵12 item.',['Give ₵8 change','Give ₵12 change']],['Complete the work','Before finishing the shift…',['Check the work and record it','Leave the task unfinished']]];
 return {...job,name,category,steps:job.steps||tasks.map(([label,prompt,choices])=>step(label,job.place,prompt,choices))};
})}
export const shiftCanMove=shift=>!shift||shift.version===2||shift.jobId==='driver';
export const canUseVehicle=life=>!!life&&(life.vehicles?.includes(life.vehicle)||!!life.shift?.vehicle&&life.shift.vehicle===life.vehicle);
export const taskSeconds=job=>Math.max(3,Math.ceil(job.seconds/job.steps.length));
export const workStep=(job,shift)=>job?.steps?.[shift?.step||0];
export const workReady=(job,shift,now=Date.now())=>!!shift&&now>=shift.endsAt&&(shift.version!==2||shift.step>=job.steps.length);
export function restoreWorkVehicle(life){if(life.shift?.vehicle)life.vehicle=life.shift.previousVehicle||life.vehicles?.[0]||'car'}
export const EXPERIENCES=[
 {id:'haircut',name:'Haircut and styling',place:'osu',price:35,fun:12,hygiene:30,description:'Freshen up at the salon.'},
 {id:'restaurant-meal',name:'Restaurant meal',place:'osu',price:28,hunger:60,social:8,description:'Enjoy a full meal.'},
 {id:'beach-day',name:'Beach day',place:'labadi',price:20,fun:40,energy:10,description:'Relax by the coast.'},
 {id:'live-show',name:'Live music show',place:'theatre',price:60,fun:55,social:20,description:'Enjoy an evening performance.'},
 {id:'museum-ticket',name:'Museum visit',place:'dubois',price:25,fun:20,xp:20,description:'Explore culture and history.'},
 {id:'match-ticket',name:'Football match ticket',place:'g_-1732_55864',price:45,fun:45,social:15,description:'Watch the game from the stands.'},
 {id:'coding-class',name:'Coding workshop',place:'airport',price:80,xp:45,fun:10,description:'Practise your technical skills.'},
 {id:'fitness-session',name:'Fitness session',place:'legon',price:30,fun:20,health:15,description:'Train and recover with a guided session.'}
];

export const jobPay=(job,career={})=>job.wage+Math.min(30,Math.floor((career[job.id]?.shifts||0)/5)*5);
