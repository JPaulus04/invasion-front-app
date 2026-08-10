// 3D Prototype 1 — dependency-free WebGL battlefield vertical slice.
(function(){
  'use strict';
  var api={}, gl=null, view=null, sourceCanvas=null, program=null, buf=null, loc={}, active=false;
  var objects=[], last=0, fps=60, frames=0, stamp=0;
  var VS='attribute vec3 p;attribute vec3 n;uniform mat4 mvp;uniform mat4 model;varying vec3 N;varying vec3 W;void main(){vec4 w=model*vec4(p,1.0);W=w.xyz;N=mat3(model)*n;gl_Position=mvp*vec4(p,1.0);}';
  var FS='precision mediump float;varying vec3 N;varying vec3 W;uniform vec3 color;uniform float emissive;void main(){vec3 l=normalize(vec3(-.45,.9,.35));float d=max(.18,dot(normalize(N),l));float fog=clamp(1.0-length(W.xz)*.018,0.45,1.0);gl_FragColor=vec4(color*(d+emissive)*fog,1.0);}';
  function shader(type,src){var s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;}
  function init(){
    view=document.createElement('canvas');view.id='lsc-3d-prototype';view.style.cssText='position:absolute;inset:0;width:100%;height:100%;z-index:2;pointer-events:none;background:#111710';
    sourceCanvas.parentNode.insertBefore(view,sourceCanvas.nextSibling);sourceCanvas.style.visibility='hidden';
    var badge=document.createElement('div');badge.id='lsc-3d-badge';badge.textContent='3D PROTOTYPE 1';badge.style.cssText='position:absolute;z-index:38;left:12px;top:calc(env(safe-area-inset-top,0px) + 48px);padding:5px 8px;border:1px solid rgba(116,233,255,.5);border-radius:6px;background:rgba(3,10,15,.8);color:#74e9ff;font:7px "Share Tech Mono",monospace;letter-spacing:1.5px;pointer-events:none';sourceCanvas.parentNode.appendChild(badge);
    gl=view.getContext('webgl',{alpha:false,antialias:true,powerPreference:'high-performance'});if(!gl)throw Error('WebGL unavailable');
    program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,VS));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,FS));gl.linkProgram(program);gl.useProgram(program);
    ['p','n'].forEach(function(k){loc[k]=gl.getAttribLocation(program,k);});['mvp','model','color','emissive'].forEach(function(k){loc[k]=gl.getUniformLocation(program,k);});
    // 36-vertex unit cube, interleaved position + face normal.
    var a=[],faces=[[[0,0,1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]],[[0,0,-1],[1,-1,-1],[-1,-1,-1],[-1,1,-1],[1,1,-1]],[[1,0,0],[1,-1,1],[1,-1,-1],[1,1,-1],[1,1,1]],[[-1,0,0],[-1,-1,-1],[-1,-1,1],[-1,1,1],[-1,1,-1]],[[0,1,0],[-1,1,1],[1,1,1],[1,1,-1],[-1,1,-1]],[[0,-1,0],[-1,-1,-1],[1,-1,-1],[1,-1,1],[-1,-1,1]]];
    faces.forEach(function(f){[1,2,3,1,3,4].forEach(function(i){a.push(f[i][0],f[i][1],f[i][2],f[0][0],f[0][1],f[0][2]);});});
    buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(a),gl.STATIC_DRAW);gl.enableVertexAttribArray(loc.p);gl.enableVertexAttribArray(loc.n);gl.vertexAttribPointer(loc.p,3,gl.FLOAT,false,24,0);gl.vertexAttribPointer(loc.n,3,gl.FLOAT,false,24,12);
    gl.enable(gl.DEPTH_TEST);gl.enable(gl.CULL_FACE);gl.clearColor(.035,.055,.04,1);
  }
  function I(){return[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1];}
  function mul(a,b){var o=new Array(16);for(var c=0;c<4;c++)for(var r=0;r<4;r++)o[c*4+r]=a[r]*b[c*4]+a[4+r]*b[c*4+1]+a[8+r]*b[c*4+2]+a[12+r]*b[c*4+3];return o;}
  function T(x,y,z){var m=I();m[12]=x;m[13]=y;m[14]=z;return m;}function S(x,y,z){var m=I();m[0]=x;m[5]=y;m[10]=z;return m;}
  function RX(a){var m=I(),c=Math.cos(a),s=Math.sin(a);m[5]=c;m[6]=s;m[9]=-s;m[10]=c;return m;}function RY(a){var m=I(),c=Math.cos(a),s=Math.sin(a);m[0]=c;m[2]=-s;m[8]=s;m[10]=c;return m;}function RZ(a){var m=I(),c=Math.cos(a),s=Math.sin(a);m[0]=c;m[1]=s;m[4]=-s;m[5]=c;return m;}
  function perspective(f,a,n,fz){var q=1/Math.tan(f/2),m=I();m[0]=q/a;m[5]=q;m[10]=(fz+n)/(n-fz);m[11]=-1;m[14]=2*fz*n/(n-fz);m[15]=0;return m;}
  function norm(v){var l=Math.hypot(v[0],v[1],v[2])||1;return[v[0]/l,v[1]/l,v[2]/l];}function cross(a,b){return[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];}
  function look(eye,target){var z=norm([eye[0]-target[0],eye[1]-target[1],eye[2]-target[2]]),x=norm(cross([0,1,0],z)),y=cross(z,x);return[x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-x[0]*eye[0]-x[1]*eye[1]-x[2]*eye[2],-y[0]*eye[0]-y[1]*eye[1]-y[2]*eye[2],-z[0]*eye[0]-z[1]*eye[1]-z[2]*eye[2],1];}
  function color(hex){return[parseInt(hex.slice(1,3),16)/255,parseInt(hex.slice(3,5),16)/255,parseInt(hex.slice(5,7),16)/255];}
  function cube(parent,pos,scale,col,rot,emit){var m=mul(parent,T(pos[0],pos[1],pos[2]));if(rot)m=mul(m,mul(RY(rot[1]||0),mul(RX(rot[0]||0),RZ(rot[2]||0))));m=mul(m,S(scale[0],scale[1],scale[2]));gl.uniformMatrix4fv(loc.model,false,new Float32Array(m));gl.uniformMatrix4fv(loc.mvp,false,new Float32Array(mul(objects[0],m)));gl.uniform3fv(loc.color,color(col));gl.uniform1f(loc.emissive,emit||0);gl.drawArrays(gl.TRIANGLES,0,36);}
  function world(o,run){var scale=11/(Math.min(sourceCanvas.width,sourceCanvas.height)*.54+45*(window.devicePixelRatio||1));return[(o.x-run.hq.x)*scale,0,(o.y-run.hq.y)*scale];}
  function soldier(o,run,hostile,commander,heavy){var p=world(o,run),aim=-(o.aim||0)+Math.PI/2,t=run.elapsed+(o.age||0),walk=o.moving?Math.sin(t*10):0,recoil=(o.flash||0)>0?-.42:0,hit=(o.hit||0)>0?Math.sin(t*55)*.18:0,base=mul(T(p[0],0,p[2]),RY(aim+hit));var armor=hostile?'#7e3028':commander?'#a78b3e':'#35694c',skin='#b88a68',dark=hostile?'#311718':'#17271f';var k=o.kind==='boss'?2.15:heavy?1.28:1;
    cube(base,[0,1.35*k,0],[.38*k,.56*k,.25*k],armor);cube(base,[0,2.12*k,0],[.30*k,.30*k,.30*k],dark);cube(base,[0,2.13*k,-.31*k],[.27*k,.10*k,.08*k],hostile?'#ff5e45':commander?'#ffe36d':'#89e6b2',null,.12);
    cube(base,[-.21*k,.58*k,0],[.16*k,.55*k,.17*k],dark,[walk*.5,0,0]);cube(base,[.21*k,.58*k,0],[.16*k,.55*k,.17*k],dark,[-walk*.5,0,0]);
    cube(base,[-.55*k,1.45*k,-.08*k],[.13*k,.48*k,.14*k],armor,[recoil+walk*.18,0,-.25]);cube(base,[.52*k,1.45*k,-.28*k],[.13*k,.48*k,.14*k],armor,[recoil-walk*.18,0,.25]);
    cube(base,[.18*k,1.53*k,-.72*k],[.09*k,.09*k,.72*k],'#20252a',[recoil,0,0]);if((o.flash||0)>0)cube(base,[.18*k,1.53*k,-1.48*k],[.16*k,.16*k,.24*k],'#ffd166',null,.9);
  }
  function hq(run){var b=T(0,0,0);cube(b,[0,.75,0],[2.0,.75,1.7],'#334b50');cube(b,[0,1.75,0],[1.25,.35,1.05],'#536b6d');cube(b,[0,2.25,0],[.48,.18,.48],'#7b8d88');cube(b,[0,2.95,0],[.05,.75,.05],'#ffd166',null,.35);}
  function turret(o,run){var p=world(o,run),a=-(o.aim||0)+Math.PI/2,b=mul(T(p[0],0,p[2]),RY(a));cube(b,[0,.35,0],[.72,.35,.72],'#485348');cube(b,[0,.92,0],[.56,.28,.56],'#687266');var kick=(o.flash||0)>0?.22:0;cube(b,[-.20,1.02,-.85+kick],[.09,.09,.92],'#c46b26');cube(b,[.20,1.02,-.85+kick],[.09,.09,.92],'#c46b26');if((o.flash||0)>0)cube(b,[0,1.02,-1.92],[.28,.24,.30],'#ffb03b',null,1);}
  function ground(run){cube(I(),[0,-.25,0],[18,.22,18],'#263326');for(var i=-2;i<=2;i++){cube(I(),[i*1.6,.15,-5.2],[.68,.35,.24],'#756448');cube(I(),[i*1.6,.15,5.2],[.68,.35,.24],'#756448');cube(I(),[-5.2,.15,i*1.6],[.24,.35,.68],'#756448');cube(I(),[5.2,.15,i*1.6],[.24,.35,.68],'#756448');}}
  function resize(){var d=Math.min(2,window.devicePixelRatio||1),r=sourceCanvas.getBoundingClientRect(),w=Math.max(2,r.width*d|0),h=Math.max(2,r.height*d|0);if(view.width!==w||view.height!==h){view.width=w;view.height=h;}gl.viewport(0,0,w,h);objects[0]=mul(perspective(.72,w/h,.1,80),look([0,17,18],[0,0,0]));}
  api.start=function(canvas){sourceCanvas=canvas;try{if(!gl)init();active=true;view.style.display='block';var b=document.getElementById('lsc-3d-badge');if(b)b.style.display='block';sourceCanvas.style.visibility='hidden';}catch(e){console.warn('3D prototype fallback:',e);active=false;if(view)view.style.display='none';sourceCanvas.style.visibility='visible';}};
  api.stop=function(){active=false;if(view)view.style.display='none';var b=document.getElementById('lsc-3d-badge');if(b)b.style.display='none';if(sourceCanvas)sourceCanvas.style.visibility='visible';};
  api.render=function(run){if(!active||!gl)return false;resize();gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);ground(run);hq(run);turret(run.turret,run);run.squad.forEach(function(s){soldier(s,run,false,false,false);});soldier(run.hero,run,false,true,false);run.enemies.forEach(function(e){soldier(e,run,true,false,e.kind==='armored'||e.kind==='boss');});
    // Tracers are real 3D emissive bars, driven by the existing projectile simulation.
    run.bullets.forEach(function(b){var p=world(b,run),len=Math.hypot(b.vx,b.vy)/900,ang=-Math.atan2(b.vy,b.vx)+Math.PI/2,base=mul(T(p[0],.9,p[2]),RY(ang));cube(base,[0,0,-len],[.035,.035,len],b.source==='commander'?'#fff07a':b.source==='turret'?'#ff8a2a':'#8edcff',null,.85);});
    frames++;var now=performance.now();if(now-stamp>1000){fps=frames*1000/(now-stamp||1000);frames=0;stamp=now;view.dataset.fps=Math.round(fps);}return true;};
  window.LSC3DPrototype=api;
})();
