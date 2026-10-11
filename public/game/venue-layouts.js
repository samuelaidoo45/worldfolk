// Venue dimensions are designed game spaces, not surveyed building interiors.
export const LARGE_VENUES={
 stadium:{bounds:{left:-43,right:43,back:-64,front:68},spawn:[40,64],exit:[40,66],description:'Walk the concourse to a pitch-side viewing spot · E watch match'},
 mall:{bounds:{left:-29,right:29,back:-37,front:37},spawn:[0,33],exit:[0,35.5],description:'Explore individual shops, the supermarket and food court'},
 terminal:{bounds:{left:-25,right:25,back:-33,front:33},spawn:[0,29],exit:[0,31],description:'Check-in desks, seating lounge and departure gates'},
 theatre:{bounds:{left:-16,right:16,back:-22,front:24},spawn:[0,21],exit:[0,22.5],description:'Walk the aisles to watch the performance from the front row'}
};
export function interiorKind(place){const t=`${place?.name||''} ${place?.type||''}`.toLowerCase();
 if(/school|university|college|polytechnic/.test(String(place?.type||''))||/\bschool\b/.test(String(place?.name||'').toLowerCase()))return /university|college|polytechnic/.test(t)?'campus':'classroom';
 if(/stadium|sports ground|football ground|arena/.test(t))return 'stadium';
 if(/mall|shopping cent[er]+|shopping complex/.test(t))return 'mall';
 if(/terminal|aerodrome|international airport/.test(t))return 'terminal';
 if(/theatre|theater|cinema|auditorium/.test(t))return 'theatre';
 if(/hotel|lodge|guesthouse/.test(t))return 'hotel';if(/gym|fitness/.test(t))return 'gym';if(/museum|gallery|arts centre/.test(t))return 'gallery';
 if(/mosque|masjid/.test(t))return 'mosque';if(/church|cathedral|chapel/.test(t))return 'church';if(/market/.test(t))return 'market';if(/beach|coast/.test(t))return 'beach';
 if(/jubilee|presiden|government|parliament|civic|ministry/.test(t))return 'civic';if(/independence|black star|square|memorial park/.test(t))return 'square';if(/university|college|campus|polytechnic/.test(t))return 'campus';if(/bank|financial institution/.test(t))return 'bank';if(/nightclub|night club|nightlife|disco|pub/.test(t))return 'nightclub';if(/pitch|playing field|sports field|recreation ground/.test(t))return 'field';if(/restaurant|food court|eatery/.test(t))return 'restaurant';
 if(/home|residen|house|apartment/.test(t))return 'home';if(/library|museum|gallery|arts centre|du bois/.test(t))return 'library';if(/school|university|study|education/.test(t))return 'classroom';if(/clinic|hospital|health/.test(t))return 'clinic';if(/cafe|coffee|restaurant|food|bar|nightlife/.test(t))return 'cafe';if(/shop|store|retail/.test(t))return 'shop';if(/office|work|business/.test(t))return 'office';return 'generic';
}
