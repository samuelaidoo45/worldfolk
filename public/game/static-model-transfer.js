import * as T from './three.module.js';
import {applyPbrSurface} from './pbr-materials.js';
import {surfaceTexture} from './graphics-materials.js';

// Transfer exact authored geometry. Copy arrays before transfer: factories share
// geometry/textures in their worker and must remain usable for the next request.
const arrayTypes={Float32Array,Float64Array,Uint8Array,Uint8ClampedArray,Uint16Array,Uint32Array,Int8Array,Int16Array,Int32Array};
const textureFields=['name','mapping','channel','wrapS','wrapT','magFilter','minFilter','anisotropy','format','internalFormat','type','rotation','matrixAutoUpdate','generateMipmaps','premultiplyAlpha','flipY','unpackAlignment','colorSpace'];
// Material.toJSON omits these when maps are temporarily removed. Restore the
// exact authored values after rebinding shared PBR maps, which also sets defaults.
const materialMapScalars=['lightMapIntensity','aoMapIntensity','bumpScale','normalMapType','displacementScale','displacementBias','combine','alphaTest','roughness'];
const materialMapVectors=['normalScale','clearcoatNormalScale'];
const jsonCopy=value=>JSON.parse(JSON.stringify(value));
const sharedImages=new Map();

export function packStaticModel(root){
  const transfer=[],geometryIds=new Map(),materialIds=new Map(),textureIds=new Map();
  const geometries=[],materials=[],textures=[];
  const copyArray=array=>{const copy=array.slice();transfer.push(copy.buffer);return copy;};
  function texture(source){
    if(textureIds.has(source))return textureIds.get(source);
    const id=String(textures.length);textureIds.set(source,id);
    const settings=Object.fromEntries(textureFields.map(key=>[key,source[key]]));
    const image=source.image;
    let pixels;
    if(image?.data&&ArrayBuffer.isView(image.data))pixels=image.data;
    else if(image?.getContext)pixels=image.getContext('2d').getImageData(0,0,image.width,image.height).data;
    else throw Error('Unsupported static texture source: '+source.name);
    textures.push({id,sharedKey:source.userData.shared?source.uuid:null,settings,offset:source.offset.toArray(),repeat:source.repeat.toArray(),center:source.center.toArray(),matrix:source.matrix.toArray(),width:image.width,height:image.height,pixels:copyArray(pixels)});
    return id;
  }
  function material(source){
    if(materialIds.has(source))return materialIds.get(source);
    const id=materials.length;materialIds.set(source,id);
    const clone=source.clone(),maps={},colors={},mapScalars={},mapVectors={};
    for(const [key,value] of Object.entries(source)){
      if(value?.isTexture){maps[key]=texture(value);clone[key]=null;}
      if(value?.isColor)colors[key]=value.toArray();
    }
    for(const key of materialMapScalars)if(source[key]!==undefined)mapScalars[key]=source[key];
    for(const key of materialMapVectors)if(source[key])mapVectors[key]=source[key].toArray();
    const json=clone.toJSON();clone.dispose();
    materials.push({json,maps,colors,mapScalars,mapVectors});return id;
  }
  function geometry(source){
    if(geometryIds.has(source))return geometryIds.get(source);
    const id=geometries.length;geometryIds.set(source,id);
    const attribute=a=>{
      if(a.isInterleavedBufferAttribute)throw Error('Interleaved static geometry must be explicitly unpacked');
      return {array:copyArray(a.array),itemSize:a.itemSize,normalized:a.normalized,name:a.name,usage:a.usage,gpuType:a.gpuType};
    };
    source.computeBoundingBox();source.computeBoundingSphere();
    geometries.push({attributes:Object.fromEntries(Object.entries(source.attributes).map(([key,a])=>[key,attribute(a)])),index:source.index?attribute(source.index):null,groups:jsonCopy(source.groups),drawRange:{...source.drawRange},box:{min:source.boundingBox.min.toArray(),max:source.boundingBox.max.toArray()},sphere:{center:source.boundingSphere.center.toArray(),radius:source.boundingSphere.radius}});
    return id;
  }
  root.updateMatrixWorld(true);
  function node(object){
    if(object.isSkinnedMesh||object.isInstancedMesh||object.userData.dynamic)throw Error('Dynamic object in static worker package');
    if(!object.isMesh&&!object.isGroup&&object.type!=='Object3D')throw Error('Unsupported static object: '+object.type);
    return {type:object.isMesh?'Mesh':object.isGroup?'Group':'Object3D',name:object.name,matrix:object.matrix.toArray(),matrixAutoUpdate:object.matrixAutoUpdate,visible:object.visible,castShadow:object.castShadow,receiveShadow:object.receiveShadow,frustumCulled:object.frustumCulled,renderOrder:object.renderOrder,layers:object.layers.mask,userData:jsonCopy(object.userData),geometry:object.isMesh?geometry(object.geometry):null,material:object.isMesh?(Array.isArray(object.material)?object.material.map(material):material(object.material)):null,children:object.children.map(node)};
  }
  const tree=node(root);
  return {snapshot:{version:2,tree,geometries,materials,textures},transfer};
}

export function unpackStaticModel(snapshot){
  if(snapshot.version!==2)throw Error('Unsupported static model snapshot');
  const textures={},retained=[],privateTextures=[],materials=[],geometries=[];
  function releaseImages(){
    for(const key of retained.splice(0)){const item=sharedImages.get(key);if(item&&--item.refs===0){sharedImages.delete(key);item.texture.dispose();}}
  }
  try{
    for(const source of snapshot.textures){
      const name=source.settings.name;
      // The procedural library is shared across worker and main-thread models.
      // PBR maps are rebound below to the live asynchronously loaded texture pack.
      if(name?.startsWith('worldfolk-pbr-'))continue;
      const kind=name?.startsWith('worldfolk-')?name.slice(10):null;
      const cached=source.sharedKey&&!kind?sharedImages.get(source.sharedKey):null;
      if(cached){cached.refs++;retained.push(source.sharedKey);textures[source.id]=cached.texture;continue;}
      const texture=kind?surfaceTexture(kind):new T.DataTexture(source.pixels,source.width,source.height);
      if(!kind)privateTextures.push(texture);
      if(!kind){Object.assign(texture,source.settings);texture.offset.fromArray(source.offset);texture.repeat.fromArray(source.repeat);texture.center.fromArray(source.center);texture.matrix.fromArray(source.matrix);texture.needsUpdate=true;}
      if(!kind&&source.sharedKey){texture.userData.shared=true;sharedImages.set(source.sharedKey,{texture,refs:1});retained.push(source.sharedKey);privateTextures.pop();}
      textures[source.id]=texture;
    }
    const loader=new T.MaterialLoader().setTextures(textures);
    for(const source of snapshot.materials){
      const maps=Object.fromEntries(Object.entries(source.maps).filter(([,id])=>textures[id]));
      const material=loader.parse({...source.json,...maps});
      materials.push(material);
      for(const [key,color] of Object.entries(source.colors))material[key]?.fromArray(color);
      if(material.userData.pbrSurface){const surface=material.userData.pbrSurface;delete material.userData.pbrSurface;applyPbrSurface(material,surface);}
      Object.assign(material,source.mapScalars);
      for(const [key,vector] of Object.entries(source.mapVectors))material[key].fromArray(vector);
    }
    for(const source of snapshot.geometries){
      const geometry=new T.BufferGeometry();
      geometries.push(geometry);
      const attribute=a=>{if(!arrayTypes[a.array.constructor.name])throw Error('Invalid static geometry array');const value=new T.BufferAttribute(a.array,a.itemSize,a.normalized);value.name=a.name;value.setUsage(a.usage);value.gpuType=a.gpuType;return value;};
      for(const [name,a] of Object.entries(source.attributes))geometry.setAttribute(name,attribute(a));
      if(source.index)geometry.setIndex(attribute(source.index));
      for(const group of source.groups)geometry.addGroup(group.start,group.count,group.materialIndex);
      geometry.setDrawRange(source.drawRange.start,source.drawRange.count);
      geometry.boundingBox=new T.Box3(new T.Vector3().fromArray(source.box.min),new T.Vector3().fromArray(source.box.max));
      geometry.boundingSphere=new T.Sphere(new T.Vector3().fromArray(source.sphere.center),source.sphere.radius);
    }
    function node(source){
      const material=Array.isArray(source.material)?source.material.map(id=>materials[id]):materials[source.material];
      const object=source.type==='Mesh'?new T.Mesh(geometries[source.geometry],material):source.type==='Group'?new T.Group():new T.Object3D();
      for(const key of ['name','visible','castShadow','receiveShadow','frustumCulled','renderOrder','userData'])object[key]=source[key];
      object.layers.mask=source.layers;object.matrix.fromArray(source.matrix);object.matrix.decompose(object.position,object.quaternion,object.scale);object.matrixAutoUpdate=source.matrixAutoUpdate;
      for(const child of source.children)object.add(node(child));
      return object;
    }
    const group=node(snapshot.tree);
    group.userData.releaseResources=releaseImages;
    return {group};
  }catch(error){
    // A malformed/incompatible result must not retain a cache reference or a
    // partially reconstructed GPU resource before the original fallback retries.
    for(const geometry of geometries)geometry.dispose();
    for(const material of materials)material.dispose();
    for(const texture of privateTextures)texture.dispose();
    releaseImages();
    throw error;
  }
}
