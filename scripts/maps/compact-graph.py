"""Keep road intersections and 80m anchors; encode intermediate road geometry losslessly to 0.1m."""
import json,sys,collections,pathlib,math
p=pathlib.Path(sys.argv[1]);g=json.loads(p.read_text());nodes=g['nodes'];edges=g['edges'];adj=collections.defaultdict(list)
for i,e in enumerate(edges):adj[e[0]].append(i);adj[e[1]].append(i)
keep={n for n,es in adj.items() if len(es)!=2 or edges[es[0]][3:6]!=edges[es[1]][3:6]}
keep.update(r[1] for r in g['restrictions'])
# Add anchors along each way so an off-road pickup never snaps kilometres away.
byway=collections.defaultdict(list)
for i,e in enumerate(edges):byway[e[5]].append(i)
for es in byway.values():
 distance=0;keep.add(edges[es[0]][0]);keep.add(edges[es[-1]][1])
 for i in es:
  e=edges[i];distance+=e[2]
  if distance>=80 or e[1] in keep:keep.add(e[1]);distance=0
ids=sorted(keep);idx={n:i for i,n in enumerate(ids)};result=[]
def encode(coords):
 out='';last=[0,0]
 for p in coords:
  for j in [1,0]:
   v=round(p[j]*1e6);d=v-last[j];last[j]=v;d=~(d<<1) if d<0 else d<<1
   while d>=32:out+=chr((32|(d&31))+63);d>>=5
   out+=chr(d+63)
 return out
for es in byway.values():
 a=None;coords=[];length=0;previous=None
 for i in es:
  e=edges[i]
  if a is None or e[0]!=previous:
   if a is not None and len(coords)>1:raise ValueError('Unexpected road discontinuity')
   a=e[0];coords=[nodes[a]];length=0
  coords.append(nodes[e[1]]);length+=e[2];previous=e[1]
  if e[1] in keep:
   if a!=e[1]:result.append([idx[a],idx[e[1]],round(length,2),e[3],e[4],e[5],encode(coords)])
   a=None;coords=[]
new={**g,'nodes':[nodes[n] for n in ids],'edges':result,'restrictions':[[a,idx[v],b,k] for a,v,b,k in g['restrictions']]}
p.write_text(json.dumps(new,separators=(',',':')));print(f'Compacted to {len(ids)} nodes, {len(result)} road edges, {p.stat().st_size/1e6:.1f} MB')
