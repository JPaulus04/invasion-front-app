(()=>{var iu=0,_c=1,su=2;var oa=1,Lo=2,rr=3,vi=0,vn=1,Fn=2,oi=0,ii=1,Zi=2,yc=3,Mc=4,ru=5;var Bi=100,au=101,ou=102,lu=103,cu=104,hu=200,uu=201,fu=202,du=203,eo=204,to=205,pu=206,mu=207,gu=208,xu=209,vu=210,_u=211,yu=212,Mu=213,Su=214,no=0,io=1,so=2,ps=3,ro=4,ao=5,oo=6,lo=7,la=0,bu=1,Eu=2,Yn=0,Sc=1,bc=2,Ec=3,ca=4,Tc=5,wc=6,Ac=7,ac="attached",Tu="detached",Cc=300,$i=301,bs=302,ar=303,Do=304,ha=306,ms=1e3,wn=1001,co=1002,sn=1003,wu=1004;var ua=1005;var on=1006,No=1007;var Ki=1008;var yn=1009,Rc=1010,Ic=1011,or=1012,Fo=1013,Zn=1014,Un=1015,li=1016,Uo=1017,Oo=1018,lr=1020,Pc=35902,Lc=35899,Dc=1021,Nc=1022,Pn=1023,si=1026,Ji=1027,Fc=1028,Bo=1029,Qi=1030,zo=1031;var ko=1033,fa=33776,da=33777,pa=33778,ma=33779,Ho=35840,Vo=35841,Go=35842,Wo=35843,Xo=36196,qo=37492,Yo=37496,Zo=37488,$o=37489,ga=37490,Ko=37491,Jo=37808,Qo=37809,jo=37810,el=37811,tl=37812,nl=37813,il=37814,sl=37815,rl=37816,al=37817,ol=37818,ll=37819,cl=37820,hl=37821,ul=36492,fl=36494,dl=36495,pl=36283,ml=36284,xa=36285,gl=36286,va=2200,_a=2201,Au=2202,Ar=2300,ho=2301,ja=2302,oc=2303,us=2400,fs=2401,Cr=2402,xl=2500,Cu=2501;var Ru=3200;var cr=0,Iu=1,Ei="",bt="srgb",Rr="srgb-linear",Ir="linear",Et="srgb";var hs=7680;var lc=519,Pu=512,Lu=513,Du=514,vl=515,Nu=516,Fu=517,_l=518,Uu=519,cc=35044;var Uc="300 es",Gn=2e3,qs=2001;function cd(s){for(let e=s.length-1;e>=0;--e)if(s[e]>=65535)return!0;return!1}function hd(s){return ArrayBuffer.isView(s)&&!(s instanceof DataView)}function Ys(s){return document.createElementNS("http://www.w3.org/1999/xhtml",s)}function Ou(){let s=Ys("canvas");return s.style.display="block",s}var Eh={},Zs=null;function Oc(...s){let e="THREE."+s.shift();Zs?Zs("log",e,...s):console.log(e,...s)}function Bu(s){let e=s[0];if(typeof e=="string"&&e.startsWith("TSL:")){let t=s[1];t&&t.isStackTrace?s[0]+=" "+t.getLocation():s[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return s}function ke(...s){s=Bu(s);let e="THREE."+s.shift();if(Zs)Zs("warn",e,...s);else{let t=s[0];t&&t.isStackTrace?console.warn(t.getError(e)):console.warn(e,...s)}}function Ye(...s){s=Bu(s);let e="THREE."+s.shift();if(Zs)Zs("error",e,...s);else{let t=s[0];t&&t.isStackTrace?console.error(t.getError(e)):console.error(e,...s)}}function ds(...s){let e=s.join(" ");e in Eh||(Eh[e]=!0,ke(...s))}function zu(s,e,t){return new Promise(function(n,i){function r(){switch(s.clientWaitSync(e,s.SYNC_FLUSH_COMMANDS_BIT,0)){case s.WAIT_FAILED:i();break;case s.TIMEOUT_EXPIRED:setTimeout(r,t);break;default:n()}}setTimeout(r,t)})}var ku={[no]:io,[so]:oo,[ro]:lo,[ps]:ao,[io]:no,[oo]:so,[lo]:ro,[ao]:ps},Wn=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){let n=this._listeners;return n===void 0?!1:n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){let n=this._listeners;if(n===void 0)return;let i=n[e];if(i!==void 0){let r=i.indexOf(t);r!==-1&&i.splice(r,1)}}dispatchEvent(e){let t=this._listeners;if(t===void 0)return;let n=t[e.type];if(n!==void 0){e.target=this;let i=n.slice(0);for(let r=0,a=i.length;r<a;r++)i[r].call(this,e);e.target=null}}},un=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],Th=1234567,Tr=Math.PI/180,gs=180/Math.PI;function ji(){let s=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(un[s&255]+un[s>>8&255]+un[s>>16&255]+un[s>>24&255]+"-"+un[e&255]+un[e>>8&255]+"-"+un[e>>16&15|64]+un[e>>24&255]+"-"+un[t&63|128]+un[t>>8&255]+"-"+un[t>>16&255]+un[t>>24&255]+un[n&255]+un[n>>8&255]+un[n>>16&255]+un[n>>24&255]).toLowerCase()}function ut(s,e,t){return Math.max(e,Math.min(t,s))}function Bc(s,e){return(s%e+e)%e}function ud(s,e,t,n,i){return n+(s-e)*(i-n)/(t-e)}function fd(s,e,t){return s!==e?(t-s)/(e-s):0}function wr(s,e,t){return(1-t)*s+t*e}function dd(s,e,t,n){return wr(s,e,1-Math.exp(-t*n))}function pd(s,e=1){return e-Math.abs(Bc(s,e*2)-e)}function md(s,e,t){return s<=e?0:s>=t?1:(s=(s-e)/(t-e),s*s*(3-2*s))}function gd(s,e,t){return s<=e?0:s>=t?1:(s=(s-e)/(t-e),s*s*s*(s*(s*6-15)+10))}function xd(s,e){return s+Math.floor(Math.random()*(e-s+1))}function vd(s,e){return s+Math.random()*(e-s)}function _d(s){return s*(.5-Math.random())}function yd(s){s!==void 0&&(Th=s);let e=Th+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function Md(s){return s*Tr}function Sd(s){return s*gs}function bd(s){return(s&s-1)===0&&s!==0}function Ed(s){return Math.pow(2,Math.ceil(Math.log(s)/Math.LN2))}function Td(s){return Math.pow(2,Math.floor(Math.log(s)/Math.LN2))}function wd(s,e,t,n,i){let r=Math.cos,a=Math.sin,o=r(t/2),l=a(t/2),c=r((e+n)/2),u=a((e+n)/2),h=r((e-n)/2),f=a((e-n)/2),d=r((n-e)/2),m=a((n-e)/2);switch(i){case"XYX":s.set(o*u,l*h,l*f,o*c);break;case"YZY":s.set(l*f,o*u,l*h,o*c);break;case"ZXZ":s.set(l*h,l*f,o*u,o*c);break;case"XZX":s.set(o*u,l*m,l*d,o*c);break;case"YXY":s.set(l*d,o*u,l*m,o*c);break;case"ZYZ":s.set(l*m,l*d,o*u,o*c);break;default:ke("MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+i)}}function Gs(s,e){switch(e.constructor){case Float32Array:return s;case Uint32Array:return s/4294967295;case Uint16Array:return s/65535;case Uint8Array:return s/255;case Int32Array:return Math.max(s/2147483647,-1);case Int16Array:return Math.max(s/32767,-1);case Int8Array:return Math.max(s/127,-1);default:throw new Error("THREE.MathUtils: Invalid component type.")}}function xn(s,e){switch(e.constructor){case Float32Array:return s;case Uint32Array:return Math.round(s*4294967295);case Uint16Array:return Math.round(s*65535);case Uint8Array:return Math.round(s*255);case Int32Array:return Math.round(s*2147483647);case Int16Array:return Math.round(s*32767);case Int8Array:return Math.round(s*127);default:throw new Error("THREE.MathUtils: Invalid component type.")}}var cn={DEG2RAD:Tr,RAD2DEG:gs,generateUUID:ji,clamp:ut,euclideanModulo:Bc,mapLinear:ud,inverseLerp:fd,lerp:wr,damp:dd,pingpong:pd,smoothstep:md,smootherstep:gd,randInt:xd,randFloat:vd,randFloatSpread:_d,seededRandom:yd,degToRad:Md,radToDeg:Sd,isPowerOfTwo:bd,ceilPowerOfTwo:Ed,floorPowerOfTwo:Td,setQuaternionFromProperEuler:wd,normalize:xn,denormalize:Gs},Gc=class Gc{constructor(e=0,t=0){this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("THREE.Vector2: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,n=this.y,i=e.elements;return this.x=i[0]*t+i[3]*n+i[6],this.y=i[1]*t+i[4]*n+i[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=ut(this.x,e.x,t.x),this.y=ut(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=ut(this.x,e,t),this.y=ut(this.y,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(ut(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(ut(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let n=Math.cos(t),i=Math.sin(t),r=this.x-e.x,a=this.y-e.y;return this.x=r*n-a*i+e.x,this.y=r*i+a*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}};Gc.prototype.isVector2=!0;var Ke=Gc,zt=class{constructor(e=0,t=0,n=0,i=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=i}static slerpFlat(e,t,n,i,r,a,o){let l=n[i+0],c=n[i+1],u=n[i+2],h=n[i+3],f=r[a+0],d=r[a+1],m=r[a+2],y=r[a+3];if(h!==y||l!==f||c!==d||u!==m){let g=l*f+c*d+u*m+h*y;g<0&&(f=-f,d=-d,m=-m,y=-y,g=-g);let p=1-o;if(g<.9995){let E=Math.acos(g),S=Math.sin(E);p=Math.sin(p*E)/S,o=Math.sin(o*E)/S,l=l*p+f*o,c=c*p+d*o,u=u*p+m*o,h=h*p+y*o}else{l=l*p+f*o,c=c*p+d*o,u=u*p+m*o,h=h*p+y*o;let E=1/Math.sqrt(l*l+c*c+u*u+h*h);l*=E,c*=E,u*=E,h*=E}}e[t]=l,e[t+1]=c,e[t+2]=u,e[t+3]=h}static multiplyQuaternionsFlat(e,t,n,i,r,a){let o=n[i],l=n[i+1],c=n[i+2],u=n[i+3],h=r[a],f=r[a+1],d=r[a+2],m=r[a+3];return e[t]=o*m+u*h+l*d-c*f,e[t+1]=l*m+u*f+c*h-o*d,e[t+2]=c*m+u*d+o*f-l*h,e[t+3]=u*m-o*h-l*f-c*d,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,i){return this._x=e,this._y=t,this._z=n,this._w=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let n=e._x,i=e._y,r=e._z,a=e._order,o=Math.cos,l=Math.sin,c=o(n/2),u=o(i/2),h=o(r/2),f=l(n/2),d=l(i/2),m=l(r/2);switch(a){case"XYZ":this._x=f*u*h+c*d*m,this._y=c*d*h-f*u*m,this._z=c*u*m+f*d*h,this._w=c*u*h-f*d*m;break;case"YXZ":this._x=f*u*h+c*d*m,this._y=c*d*h-f*u*m,this._z=c*u*m-f*d*h,this._w=c*u*h+f*d*m;break;case"ZXY":this._x=f*u*h-c*d*m,this._y=c*d*h+f*u*m,this._z=c*u*m+f*d*h,this._w=c*u*h-f*d*m;break;case"ZYX":this._x=f*u*h-c*d*m,this._y=c*d*h+f*u*m,this._z=c*u*m-f*d*h,this._w=c*u*h+f*d*m;break;case"YZX":this._x=f*u*h+c*d*m,this._y=c*d*h+f*u*m,this._z=c*u*m-f*d*h,this._w=c*u*h-f*d*m;break;case"XZY":this._x=f*u*h-c*d*m,this._y=c*d*h-f*u*m,this._z=c*u*m+f*d*h,this._w=c*u*h+f*d*m;break;default:ke("Quaternion: .setFromEuler() encountered an unknown order: "+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let n=t/2,i=Math.sin(n);return this._x=e.x*i,this._y=e.y*i,this._z=e.z*i,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,n=t[0],i=t[4],r=t[8],a=t[1],o=t[5],l=t[9],c=t[2],u=t[6],h=t[10],f=n+o+h;if(f>0){let d=.5/Math.sqrt(f+1);this._w=.25/d,this._x=(u-l)*d,this._y=(r-c)*d,this._z=(a-i)*d}else if(n>o&&n>h){let d=2*Math.sqrt(1+n-o-h);this._w=(u-l)/d,this._x=.25*d,this._y=(i+a)/d,this._z=(r+c)/d}else if(o>h){let d=2*Math.sqrt(1+o-n-h);this._w=(r-c)/d,this._x=(i+a)/d,this._y=.25*d,this._z=(l+u)/d}else{let d=2*Math.sqrt(1+h-n-o);this._w=(a-i)/d,this._x=(r+c)/d,this._y=(l+u)/d,this._z=.25*d}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(ut(this.dot(e),-1,1)))}rotateTowards(e,t){let n=this.angleTo(e);if(n===0)return this;let i=Math.min(1,t/n);return this.slerp(e,i),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let n=e._x,i=e._y,r=e._z,a=e._w,o=t._x,l=t._y,c=t._z,u=t._w;return this._x=n*u+a*o+i*c-r*l,this._y=i*u+a*l+r*o-n*c,this._z=r*u+a*c+n*l-i*o,this._w=a*u-n*o-i*l-r*c,this._onChangeCallback(),this}slerp(e,t){let n=e._x,i=e._y,r=e._z,a=e._w,o=this.dot(e);o<0&&(n=-n,i=-i,r=-r,a=-a,o=-o);let l=1-t;if(o<.9995){let c=Math.acos(o),u=Math.sin(c);l=Math.sin(l*c)/u,t=Math.sin(t*c)/u,this._x=this._x*l+n*t,this._y=this._y*l+i*t,this._z=this._z*l+r*t,this._w=this._w*l+a*t,this._onChangeCallback()}else this._x=this._x*l+n*t,this._y=this._y*l+i*t,this._z=this._z*l+r*t,this._w=this._w*l+a*t,this.normalize();return this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),i=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(i*Math.sin(e),i*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},Wc=class Wc{constructor(e=0,t=0,n=0){this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("THREE.Vector3: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(wh.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(wh.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,n=this.y,i=this.z,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6]*i,this.y=r[1]*t+r[4]*n+r[7]*i,this.z=r[2]*t+r[5]*n+r[8]*i,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,n=this.y,i=this.z,r=e.elements,a=1/(r[3]*t+r[7]*n+r[11]*i+r[15]);return this.x=(r[0]*t+r[4]*n+r[8]*i+r[12])*a,this.y=(r[1]*t+r[5]*n+r[9]*i+r[13])*a,this.z=(r[2]*t+r[6]*n+r[10]*i+r[14])*a,this}applyQuaternion(e){let t=this.x,n=this.y,i=this.z,r=e.x,a=e.y,o=e.z,l=e.w,c=2*(a*i-o*n),u=2*(o*t-r*i),h=2*(r*n-a*t);return this.x=t+l*c+a*h-o*u,this.y=n+l*u+o*c-r*h,this.z=i+l*h+r*u-a*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,n=this.y,i=this.z,r=e.elements;return this.x=r[0]*t+r[4]*n+r[8]*i,this.y=r[1]*t+r[5]*n+r[9]*i,this.z=r[2]*t+r[6]*n+r[10]*i,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=ut(this.x,e.x,t.x),this.y=ut(this.y,e.y,t.y),this.z=ut(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=ut(this.x,e,t),this.y=ut(this.y,e,t),this.z=ut(this.z,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(ut(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let n=e.x,i=e.y,r=e.z,a=t.x,o=t.y,l=t.z;return this.x=i*l-r*o,this.y=r*a-n*l,this.z=n*o-i*a,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return Fl.copy(this).projectOnVector(e),this.sub(Fl)}reflect(e){return this.sub(Fl.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(ut(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y,i=this.z-e.z;return t*t+n*n+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){let i=Math.sin(t)*e;return this.x=i*Math.sin(n),this.y=Math.cos(t)*e,this.z=i*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),i=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=i,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}};Wc.prototype.isVector3=!0;var N=Wc,Fl=new N,wh=new zt,Xc=class Xc{constructor(e,t,n,i,r,a,o,l,c){this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,i,r,a,o,l,c)}set(e,t,n,i,r,a,o,l,c){let u=this.elements;return u[0]=e,u[1]=i,u[2]=o,u[3]=t,u[4]=r,u[5]=l,u[6]=n,u[7]=a,u[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,i=t.elements,r=this.elements,a=n[0],o=n[3],l=n[6],c=n[1],u=n[4],h=n[7],f=n[2],d=n[5],m=n[8],y=i[0],g=i[3],p=i[6],E=i[1],S=i[4],_=i[7],C=i[2],b=i[5],I=i[8];return r[0]=a*y+o*E+l*C,r[3]=a*g+o*S+l*b,r[6]=a*p+o*_+l*I,r[1]=c*y+u*E+h*C,r[4]=c*g+u*S+h*b,r[7]=c*p+u*_+h*I,r[2]=f*y+d*E+m*C,r[5]=f*g+d*S+m*b,r[8]=f*p+d*_+m*I,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[1],i=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],u=e[8];return t*a*u-t*o*c-n*r*u+n*o*l+i*r*c-i*a*l}invert(){let e=this.elements,t=e[0],n=e[1],i=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],u=e[8],h=u*a-o*c,f=o*l-u*r,d=c*r-a*l,m=t*h+n*f+i*d;if(m===0)return this.set(0,0,0,0,0,0,0,0,0);let y=1/m;return e[0]=h*y,e[1]=(i*c-u*n)*y,e[2]=(o*n-i*a)*y,e[3]=f*y,e[4]=(u*t-i*l)*y,e[5]=(i*r-o*t)*y,e[6]=d*y,e[7]=(n*l-c*t)*y,e[8]=(a*t-n*r)*y,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,i,r,a,o){let l=Math.cos(r),c=Math.sin(r);return this.set(n*l,n*c,-n*(l*a+c*o)+a+e,-i*c,i*l,-i*(-c*a+l*o)+o+t,0,0,1),this}scale(e,t){return ds("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(Ul.makeScale(e,t)),this}rotate(e){return ds("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(Ul.makeRotation(-e)),this}translate(e,t){return ds("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(Ul.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,n=e.elements;for(let i=0;i<9;i++)if(t[i]!==n[i])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}};Xc.prototype.isMatrix3=!0;var Qe=Xc,Ul=new Qe,Ah=new Qe().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Ch=new Qe().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function Ad(){let s={enabled:!0,workingColorSpace:Rr,spaces:{},convert:function(i,r,a){return this.enabled===!1||r===a||!r||!a||(this.spaces[r].transfer===Et&&(i.r=xi(i.r),i.g=xi(i.g),i.b=xi(i.b)),this.spaces[r].primaries!==this.spaces[a].primaries&&(i.applyMatrix3(this.spaces[r].toXYZ),i.applyMatrix3(this.spaces[a].fromXYZ)),this.spaces[a].transfer===Et&&(i.r=Ws(i.r),i.g=Ws(i.g),i.b=Ws(i.b))),i},workingToColorSpace:function(i,r){return this.convert(i,this.workingColorSpace,r)},colorSpaceToWorking:function(i,r){return this.convert(i,r,this.workingColorSpace)},getPrimaries:function(i){return this.spaces[i].primaries},getTransfer:function(i){return i===Ei?Ir:this.spaces[i].transfer},getToneMappingMode:function(i){return this.spaces[i].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(i,r=this.workingColorSpace){return i.fromArray(this.spaces[r].luminanceCoefficients)},define:function(i){Object.assign(this.spaces,i)},_getMatrix:function(i,r,a){return i.copy(this.spaces[r].toXYZ).multiply(this.spaces[a].fromXYZ)},_getDrawingBufferColorSpace:function(i){return this.spaces[i].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(i=this.workingColorSpace){return this.spaces[i].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(i,r){return ds("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),s.workingToColorSpace(i,r)},toWorkingColorSpace:function(i,r){return ds("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),s.colorSpaceToWorking(i,r)}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],n=[.3127,.329];return s.define({[Rr]:{primaries:e,whitePoint:n,transfer:Ir,toXYZ:Ah,fromXYZ:Ch,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:bt},outputColorSpaceConfig:{drawingBufferColorSpace:bt}},[bt]:{primaries:e,whitePoint:n,transfer:Et,toXYZ:Ah,fromXYZ:Ch,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:bt}}}),s}var et=Ad();function xi(s){return s<.04045?s*.0773993808:Math.pow(s*.9478672986+.0521327014,2.4)}function Ws(s){return s<.0031308?s*12.92:1.055*Math.pow(s,.41666)-.055}var Is,uo=class{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{Is===void 0&&(Is=Ys("canvas")),Is.width=e.width,Is.height=e.height;let i=Is.getContext("2d");e instanceof ImageData?i.putImageData(e,0,0):i.drawImage(e,0,0,e.width,e.height),n=Is}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){let t=Ys("canvas");t.width=e.width,t.height=e.height;let n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);let i=n.getImageData(0,0,e.width,e.height),r=i.data;for(let a=0;a<r.length;a++)r[a]=xi(r[a]/255)*255;return n.putImageData(i,0,0),t}else if(e.data){let t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(xi(t[n]/255)*255):t[n]=xi(t[n]);return{data:t,width:e.width,height:e.height}}else return ke("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}},Cd=0,$s=class{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:Cd++}),this.uuid=ji(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<"u"&&t instanceof VideoFrame?e.set(t.displayWidth,t.displayHeight,0):t!==null?e.set(t.width,t.height,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let n={uuid:this.uuid,url:""},i=this.data;if(i!==null){let r;if(Array.isArray(i)){r=[];for(let a=0,o=i.length;a<o;a++)i[a].isDataTexture?r.push(Ol(i[a].image)):r.push(Ol(i[a]))}else r=Ol(i);n.url=r}return t||(e.images[this.uuid]=n),n}};function Ol(s){return typeof HTMLImageElement<"u"&&s instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&s instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&s instanceof ImageBitmap?uo.getDataURL(s):s.data?{data:Array.from(s.data),width:s.width,height:s.height,type:s.data.constructor.name}:(ke("Texture: Unable to serialize Texture."),{})}var Rd=0,Bl=new N,ln=class s extends Wn{constructor(e=s.DEFAULT_IMAGE,t=s.DEFAULT_MAPPING,n=wn,i=wn,r=on,a=Ki,o=Pn,l=yn,c=s.DEFAULT_ANISOTROPY,u=Ei){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Rd++}),this.uuid=ji(),this.name="",this.source=new $s(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=i,this.magFilter=r,this.minFilter=a,this.anisotropy=c,this.format=o,this.internalFormat=null,this.type=l,this.offset=new Ke(0,0),this.repeat=new Ke(1,1),this.center=new Ke(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Qe,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(Bl).x}get height(){return this.source.getSize(Bl).y}get depth(){return this.source.getSize(Bl).z}get image(){return this.source.data}set image(e){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.normalized=e.normalized,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(let t in e){let n=e[t];if(n===void 0){ke(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}let i=this[t];if(i===void 0){ke(`Texture.setValues(): property '${t}' does not exist.`);continue}i&&n&&i.isVector2&&n.isVector2||i&&n&&i.isVector3&&n.isVector3||i&&n&&i.isMatrix3&&n.isMatrix3?i.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==Cc)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case ms:e.x=e.x-Math.floor(e.x);break;case wn:e.x=e.x<0?0:1;break;case co:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case ms:e.y=e.y-Math.floor(e.y);break;case wn:e.y=e.y<0?0:1;break;case co:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};ln.DEFAULT_IMAGE=null;ln.DEFAULT_MAPPING=Cc;ln.DEFAULT_ANISOTROPY=1;var qc=class qc{constructor(e=0,t=0,n=0,i=1){this.x=e,this.y=t,this.z=n,this.w=i}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,i){return this.x=e,this.y=t,this.z=n,this.w=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("THREE.Vector4: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,n=this.y,i=this.z,r=this.w,a=e.elements;return this.x=a[0]*t+a[4]*n+a[8]*i+a[12]*r,this.y=a[1]*t+a[5]*n+a[9]*i+a[13]*r,this.z=a[2]*t+a[6]*n+a[10]*i+a[14]*r,this.w=a[3]*t+a[7]*n+a[11]*i+a[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,i,r,l=e.elements,c=l[0],u=l[4],h=l[8],f=l[1],d=l[5],m=l[9],y=l[2],g=l[6],p=l[10];if(Math.abs(u-f)<.01&&Math.abs(h-y)<.01&&Math.abs(m-g)<.01){if(Math.abs(u+f)<.1&&Math.abs(h+y)<.1&&Math.abs(m+g)<.1&&Math.abs(c+d+p-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;let S=(c+1)/2,_=(d+1)/2,C=(p+1)/2,b=(u+f)/4,I=(h+y)/4,v=(m+g)/4;return S>_&&S>C?S<.01?(n=0,i=.707106781,r=.707106781):(n=Math.sqrt(S),i=b/n,r=I/n):_>C?_<.01?(n=.707106781,i=0,r=.707106781):(i=Math.sqrt(_),n=b/i,r=v/i):C<.01?(n=.707106781,i=.707106781,r=0):(r=Math.sqrt(C),n=I/r,i=v/r),this.set(n,i,r,t),this}let E=Math.sqrt((g-m)*(g-m)+(h-y)*(h-y)+(f-u)*(f-u));return Math.abs(E)<.001&&(E=1),this.x=(g-m)/E,this.y=(h-y)/E,this.z=(f-u)/E,this.w=Math.acos((c+d+p-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=ut(this.x,e.x,t.x),this.y=ut(this.y,e.y,t.y),this.z=ut(this.z,e.z,t.z),this.w=ut(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=ut(this.x,e,t),this.y=ut(this.y,e,t),this.z=ut(this.z,e,t),this.w=ut(this.w,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(ut(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}};qc.prototype.isVector4=!0;var dt=qc,fo=class extends Wn{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:on,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new dt(0,0,e,t),this.scissorTest=!1,this.viewport=new dt(0,0,e,t),this.textures=[];let i={width:e,height:t,depth:n.depth},r=new ln(i),a=n.count;for(let o=0;o<a;o++)this.textures[o]=r.clone(),this.textures[o].isRenderTargetTexture=!0,this.textures[o].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview,this.useArrayDepthTexture=n.useArrayDepthTexture}_setTextureOptions(e={}){let t={minFilter:on,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),e!==null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let i=0,r=this.textures.length;i<r;i++)this.textures[i].image.width=e,this.textures[i].image.height=t,this.textures[i].image.depth=n,this.textures[i].isData3DTexture!==!0&&(this.textures[i].isArrayTexture=this.textures[i].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;let i=Object.assign({},e.textures[t].image);this.textures[t].source=new $s(i)}return this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this.multiview=e.multiview,this.useArrayDepthTexture=e.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}},Cn=class extends fo{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}},Pr=class extends ln{constructor(e=null,t=1,n=1,i=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:i},this.magFilter=sn,this.minFilter=sn,this.wrapR=wn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}};var po=class extends ln{constructor(e=null,t=1,n=1,i=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:i},this.magFilter=sn,this.minFilter=sn,this.wrapR=wn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var Po=class Po{constructor(e,t,n,i,r,a,o,l,c,u,h,f,d,m,y,g){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,i,r,a,o,l,c,u,h,f,d,m,y,g)}set(e,t,n,i,r,a,o,l,c,u,h,f,d,m,y,g){let p=this.elements;return p[0]=e,p[4]=t,p[8]=n,p[12]=i,p[1]=r,p[5]=a,p[9]=o,p[13]=l,p[2]=c,p[6]=u,p[10]=h,p[14]=f,p[3]=d,p[7]=m,p[11]=y,p[15]=g,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new Po().fromArray(this.elements)}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){let t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return this.determinantAffine()===0?(e.set(1,0,0),t.set(0,1,0),n.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){if(e.determinantAffine()===0)return this.identity();let t=this.elements,n=e.elements,i=1/Ps.setFromMatrixColumn(e,0).length(),r=1/Ps.setFromMatrixColumn(e,1).length(),a=1/Ps.setFromMatrixColumn(e,2).length();return t[0]=n[0]*i,t[1]=n[1]*i,t[2]=n[2]*i,t[3]=0,t[4]=n[4]*r,t[5]=n[5]*r,t[6]=n[6]*r,t[7]=0,t[8]=n[8]*a,t[9]=n[9]*a,t[10]=n[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,n=e.x,i=e.y,r=e.z,a=Math.cos(n),o=Math.sin(n),l=Math.cos(i),c=Math.sin(i),u=Math.cos(r),h=Math.sin(r);if(e.order==="XYZ"){let f=a*u,d=a*h,m=o*u,y=o*h;t[0]=l*u,t[4]=-l*h,t[8]=c,t[1]=d+m*c,t[5]=f-y*c,t[9]=-o*l,t[2]=y-f*c,t[6]=m+d*c,t[10]=a*l}else if(e.order==="YXZ"){let f=l*u,d=l*h,m=c*u,y=c*h;t[0]=f+y*o,t[4]=m*o-d,t[8]=a*c,t[1]=a*h,t[5]=a*u,t[9]=-o,t[2]=d*o-m,t[6]=y+f*o,t[10]=a*l}else if(e.order==="ZXY"){let f=l*u,d=l*h,m=c*u,y=c*h;t[0]=f-y*o,t[4]=-a*h,t[8]=m+d*o,t[1]=d+m*o,t[5]=a*u,t[9]=y-f*o,t[2]=-a*c,t[6]=o,t[10]=a*l}else if(e.order==="ZYX"){let f=a*u,d=a*h,m=o*u,y=o*h;t[0]=l*u,t[4]=m*c-d,t[8]=f*c+y,t[1]=l*h,t[5]=y*c+f,t[9]=d*c-m,t[2]=-c,t[6]=o*l,t[10]=a*l}else if(e.order==="YZX"){let f=a*l,d=a*c,m=o*l,y=o*c;t[0]=l*u,t[4]=y-f*h,t[8]=m*h+d,t[1]=h,t[5]=a*u,t[9]=-o*u,t[2]=-c*u,t[6]=d*h+m,t[10]=f-y*h}else if(e.order==="XZY"){let f=a*l,d=a*c,m=o*l,y=o*c;t[0]=l*u,t[4]=-h,t[8]=c*u,t[1]=f*h+y,t[5]=a*u,t[9]=d*h-m,t[2]=m*h-d,t[6]=o*u,t[10]=y*h+f}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(Id,e,Pd)}lookAt(e,t,n){let i=this.elements;return En.subVectors(e,t),En.lengthSq()===0&&(En.z=1),En.normalize(),Pi.crossVectors(n,En),Pi.lengthSq()===0&&(Math.abs(n.z)===1?En.x+=1e-4:En.z+=1e-4,En.normalize(),Pi.crossVectors(n,En)),Pi.normalize(),Ca.crossVectors(En,Pi),i[0]=Pi.x,i[4]=Ca.x,i[8]=En.x,i[1]=Pi.y,i[5]=Ca.y,i[9]=En.y,i[2]=Pi.z,i[6]=Ca.z,i[10]=En.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,i=t.elements,r=this.elements,a=n[0],o=n[4],l=n[8],c=n[12],u=n[1],h=n[5],f=n[9],d=n[13],m=n[2],y=n[6],g=n[10],p=n[14],E=n[3],S=n[7],_=n[11],C=n[15],b=i[0],I=i[4],v=i[8],T=i[12],P=i[1],L=i[5],F=i[9],K=i[13],J=i[2],z=i[6],Q=i[10],$=i[14],se=i[3],oe=i[7],he=i[11],fe=i[15];return r[0]=a*b+o*P+l*J+c*se,r[4]=a*I+o*L+l*z+c*oe,r[8]=a*v+o*F+l*Q+c*he,r[12]=a*T+o*K+l*$+c*fe,r[1]=u*b+h*P+f*J+d*se,r[5]=u*I+h*L+f*z+d*oe,r[9]=u*v+h*F+f*Q+d*he,r[13]=u*T+h*K+f*$+d*fe,r[2]=m*b+y*P+g*J+p*se,r[6]=m*I+y*L+g*z+p*oe,r[10]=m*v+y*F+g*Q+p*he,r[14]=m*T+y*K+g*$+p*fe,r[3]=E*b+S*P+_*J+C*se,r[7]=E*I+S*L+_*z+C*oe,r[11]=E*v+S*F+_*Q+C*he,r[15]=E*T+S*K+_*$+C*fe,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[4],i=e[8],r=e[12],a=e[1],o=e[5],l=e[9],c=e[13],u=e[2],h=e[6],f=e[10],d=e[14],m=e[3],y=e[7],g=e[11],p=e[15],E=l*d-c*f,S=o*d-c*h,_=o*f-l*h,C=a*d-c*u,b=a*f-l*u,I=a*h-o*u;return t*(y*E-g*S+p*_)-n*(m*E-g*C+p*b)+i*(m*S-y*C+p*I)-r*(m*_-y*b+g*I)}determinantAffine(){let e=this.elements,t=e[0],n=e[4],i=e[8],r=e[1],a=e[5],o=e[9],l=e[2],c=e[6],u=e[10];return t*(a*u-o*c)-n*(r*u-o*l)+i*(r*c-a*l)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){let i=this.elements;return e.isVector3?(i[12]=e.x,i[13]=e.y,i[14]=e.z):(i[12]=e,i[13]=t,i[14]=n),this}invert(){let e=this.elements,t=e[0],n=e[1],i=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],u=e[8],h=e[9],f=e[10],d=e[11],m=e[12],y=e[13],g=e[14],p=e[15],E=t*o-n*a,S=t*l-i*a,_=t*c-r*a,C=n*l-i*o,b=n*c-r*o,I=i*c-r*l,v=u*y-h*m,T=u*g-f*m,P=u*p-d*m,L=h*g-f*y,F=h*p-d*y,K=f*p-d*g,J=E*K-S*F+_*L+C*P-b*T+I*v;if(J===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let z=1/J;return e[0]=(o*K-l*F+c*L)*z,e[1]=(i*F-n*K-r*L)*z,e[2]=(y*I-g*b+p*C)*z,e[3]=(f*b-h*I-d*C)*z,e[4]=(l*P-a*K-c*T)*z,e[5]=(t*K-i*P+r*T)*z,e[6]=(g*_-m*I-p*S)*z,e[7]=(u*I-f*_+d*S)*z,e[8]=(a*F-o*P+c*v)*z,e[9]=(n*P-t*F-r*v)*z,e[10]=(m*b-y*_+p*E)*z,e[11]=(h*_-u*b-d*E)*z,e[12]=(o*T-a*L-l*v)*z,e[13]=(t*L-n*T+i*v)*z,e[14]=(y*S-m*C-g*E)*z,e[15]=(u*C-h*S+f*E)*z,this}scale(e){let t=this.elements,n=e.x,i=e.y,r=e.z;return t[0]*=n,t[4]*=i,t[8]*=r,t[1]*=n,t[5]*=i,t[9]*=r,t[2]*=n,t[6]*=i,t[10]*=r,t[3]*=n,t[7]*=i,t[11]*=r,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],i=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,i))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let n=Math.cos(t),i=Math.sin(t),r=1-n,a=e.x,o=e.y,l=e.z,c=r*a,u=r*o;return this.set(c*a+n,c*o-i*l,c*l+i*o,0,c*o+i*l,u*o+n,u*l-i*a,0,c*l-i*o,u*l+i*a,r*l*l+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,i,r,a){return this.set(1,n,r,0,e,1,a,0,t,i,1,0,0,0,0,1),this}compose(e,t,n){let i=this.elements,r=t._x,a=t._y,o=t._z,l=t._w,c=r+r,u=a+a,h=o+o,f=r*c,d=r*u,m=r*h,y=a*u,g=a*h,p=o*h,E=l*c,S=l*u,_=l*h,C=n.x,b=n.y,I=n.z;return i[0]=(1-(y+p))*C,i[1]=(d+_)*C,i[2]=(m-S)*C,i[3]=0,i[4]=(d-_)*b,i[5]=(1-(f+p))*b,i[6]=(g+E)*b,i[7]=0,i[8]=(m+S)*I,i[9]=(g-E)*I,i[10]=(1-(f+y))*I,i[11]=0,i[12]=e.x,i[13]=e.y,i[14]=e.z,i[15]=1,this}decompose(e,t,n){let i=this.elements;e.x=i[12],e.y=i[13],e.z=i[14];let r=this.determinantAffine();if(r===0)return n.set(1,1,1),t.identity(),this;let a=Ps.set(i[0],i[1],i[2]).length(),o=Ps.set(i[4],i[5],i[6]).length(),l=Ps.set(i[8],i[9],i[10]).length();r<0&&(a=-a),kn.copy(this);let c=1/a,u=1/o,h=1/l;return kn.elements[0]*=c,kn.elements[1]*=c,kn.elements[2]*=c,kn.elements[4]*=u,kn.elements[5]*=u,kn.elements[6]*=u,kn.elements[8]*=h,kn.elements[9]*=h,kn.elements[10]*=h,t.setFromRotationMatrix(kn),n.x=a,n.y=o,n.z=l,this}makePerspective(e,t,n,i,r,a,o=Gn,l=!1){let c=this.elements,u=2*r/(t-e),h=2*r/(n-i),f=(t+e)/(t-e),d=(n+i)/(n-i),m,y;if(l)m=r/(a-r),y=a*r/(a-r);else if(o===Gn)m=-(a+r)/(a-r),y=-2*a*r/(a-r);else if(o===qs)m=-a/(a-r),y=-a*r/(a-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return c[0]=u,c[4]=0,c[8]=f,c[12]=0,c[1]=0,c[5]=h,c[9]=d,c[13]=0,c[2]=0,c[6]=0,c[10]=m,c[14]=y,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,n,i,r,a,o=Gn,l=!1){let c=this.elements,u=2/(t-e),h=2/(n-i),f=-(t+e)/(t-e),d=-(n+i)/(n-i),m,y;if(l)m=1/(a-r),y=a/(a-r);else if(o===Gn)m=-2/(a-r),y=-(a+r)/(a-r);else if(o===qs)m=-1/(a-r),y=-r/(a-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return c[0]=u,c[4]=0,c[8]=0,c[12]=f,c[1]=0,c[5]=h,c[9]=0,c[13]=d,c[2]=0,c[6]=0,c[10]=m,c[14]=y,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){let t=this.elements,n=e.elements;for(let i=0;i<16;i++)if(t[i]!==n[i])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}};Po.prototype.isMatrix4=!0;var He=Po,Ps=new N,kn=new He,Id=new N(0,0,0),Pd=new N(1,1,1),Pi=new N,Ca=new N,En=new N,Rh=new He,Ih=new zt,$t=class s{constructor(e=0,t=0,n=0,i=s.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=i}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,i=this._order){return this._x=e,this._y=t,this._z=n,this._order=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){let i=e.elements,r=i[0],a=i[4],o=i[8],l=i[1],c=i[5],u=i[9],h=i[2],f=i[6],d=i[10];switch(t){case"XYZ":this._y=Math.asin(ut(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-u,d),this._z=Math.atan2(-a,r)):(this._x=Math.atan2(f,c),this._z=0);break;case"YXZ":this._x=Math.asin(-ut(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(o,d),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-h,r),this._z=0);break;case"ZXY":this._x=Math.asin(ut(f,-1,1)),Math.abs(f)<.9999999?(this._y=Math.atan2(-h,d),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-ut(h,-1,1)),Math.abs(h)<.9999999?(this._x=Math.atan2(f,d),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-a,c));break;case"YZX":this._z=Math.asin(ut(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-u,c),this._y=Math.atan2(-h,r)):(this._x=0,this._y=Math.atan2(o,d));break;case"XZY":this._z=Math.asin(-ut(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(f,c),this._y=Math.atan2(o,r)):(this._x=Math.atan2(-u,d),this._y=0);break;default:ke("Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return Rh.makeRotationFromQuaternion(e),this.setFromRotationMatrix(Rh,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return Ih.setFromEuler(this),this.setFromQuaternion(Ih,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};$t.DEFAULT_ORDER="XYZ";var Lr=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}},Ld=0,Ph=new N,Ls=new zt,ui=new He,Ra=new N,vr=new N,Dd=new N,Nd=new zt,Lh=new N(1,0,0),Dh=new N(0,1,0),Nh=new N(0,0,1),Fh={type:"added"},Fd={type:"removed"},Ds={type:"childadded",child:null},zl={type:"childremoved",child:null},Ut=class s extends Wn{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Ld++}),this.uuid=ji(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=s.DEFAULT_UP.clone();let e=new N,t=new $t,n=new zt,i=new N(1,1,1);function r(){n.setFromEuler(t,!1)}function a(){t.setFromQuaternion(n,void 0,!1)}t._onChange(r),n._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:i},modelViewMatrix:{value:new He},normalMatrix:{value:new Qe}}),this.matrix=new He,this.matrixWorld=new He,this.matrixAutoUpdate=s.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=s.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Lr,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return Ls.setFromAxisAngle(e,t),this.quaternion.multiply(Ls),this}rotateOnWorldAxis(e,t){return Ls.setFromAxisAngle(e,t),this.quaternion.premultiply(Ls),this}rotateX(e){return this.rotateOnAxis(Lh,e)}rotateY(e){return this.rotateOnAxis(Dh,e)}rotateZ(e){return this.rotateOnAxis(Nh,e)}translateOnAxis(e,t){return Ph.copy(e).applyQuaternion(this.quaternion),this.position.add(Ph.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(Lh,e)}translateY(e){return this.translateOnAxis(Dh,e)}translateZ(e){return this.translateOnAxis(Nh,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(ui.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?Ra.copy(e):Ra.set(e,t,n);let i=this.parent;this.updateWorldMatrix(!0,!1),vr.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?ui.lookAt(vr,Ra,this.up):ui.lookAt(Ra,vr,this.up),this.quaternion.setFromRotationMatrix(ui),i&&(ui.extractRotation(i.matrixWorld),Ls.setFromRotationMatrix(ui),this.quaternion.premultiply(Ls.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(Ye("Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(Fh),Ds.child=e,this.dispatchEvent(Ds),Ds.child=null):Ye("Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(Fd),zl.child=e,this.dispatchEvent(zl),zl.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),ui.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),ui.multiply(e.parent.matrixWorld)),e.applyMatrix4(ui),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(Fh),Ds.child=e,this.dispatchEvent(Ds),Ds.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,i=this.children.length;n<i;n++){let a=this.children[n].getObjectByProperty(e,t);if(a!==void 0)return a}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);let i=this.children;for(let r=0,a=i.length;r<a;r++)i[r].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(vr,e,Dd),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(vr,Nd,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);let t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let e=this.pivot;if(e!==null){let t=e.x,n=e.y,i=e.z,r=this.matrix.elements;r[12]+=t-r[0]*t-r[4]*n-r[8]*i,r[13]+=n-r[1]*t-r[5]*n-r[9]*i,r[14]+=i-r[2]*t-r[6]*n-r[10]*i}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t,n=!1){let i=this.parent;if(e===!0&&i!==null&&i.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||n)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,n=!0),t===!0){let r=this.children;for(let a=0,o=r.length;a<o;a++)r[a].updateWorldMatrix(!1,!0,n)}}toJSON(e){let t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let i={};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.castShadow===!0&&(i.castShadow=!0),this.receiveShadow===!0&&(i.receiveShadow=!0),this.visible===!1&&(i.visible=!1),this.frustumCulled===!1&&(i.frustumCulled=!1),this.renderOrder!==0&&(i.renderOrder=this.renderOrder),this.static!==!1&&(i.static=this.static),Object.keys(this.userData).length>0&&(i.userData=this.userData),i.layers=this.layers.mask,i.matrix=this.matrix.toArray(),i.up=this.up.toArray(),this.pivot!==null&&(i.pivot=this.pivot.toArray()),this.matrixAutoUpdate===!1&&(i.matrixAutoUpdate=!1),this.morphTargetDictionary!==void 0&&(i.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(i.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(i.type="InstancedMesh",i.count=this.count,i.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(i.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(i.type="BatchedMesh",i.perObjectFrustumCulled=this.perObjectFrustumCulled,i.sortObjects=this.sortObjects,i.drawRanges=this._drawRanges,i.reservedRanges=this._reservedRanges,i.geometryInfo=this._geometryInfo.map(o=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),i.instanceInfo=this._instanceInfo.map(o=>({...o})),i.availableInstanceIds=this._availableInstanceIds.slice(),i.availableGeometryIds=this._availableGeometryIds.slice(),i.nextIndexStart=this._nextIndexStart,i.nextVertexStart=this._nextVertexStart,i.geometryCount=this._geometryCount,i.maxInstanceCount=this._maxInstanceCount,i.maxVertexCount=this._maxVertexCount,i.maxIndexCount=this._maxIndexCount,i.geometryInitialized=this._geometryInitialized,i.matricesTexture=this._matricesTexture.toJSON(e),i.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(i.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(i.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(i.boundingBox=this.boundingBox.toJSON()));function r(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?i.background=this.background.toJSON():this.background.isTexture&&(i.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(i.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){i.geometry=r(e.geometries,this.geometry);let o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){let l=o.shapes;if(Array.isArray(l))for(let c=0,u=l.length;c<u;c++){let h=l[c];r(e.shapes,h)}else r(e.shapes,l)}}if(this.isSkinnedMesh&&(i.bindMode=this.bindMode,i.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),i.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let o=[];for(let l=0,c=this.material.length;l<c;l++)o.push(r(e.materials,this.material[l]));i.material=o}else i.material=r(e.materials,this.material);if(this.children.length>0){i.children=[];for(let o=0;o<this.children.length;o++)i.children.push(this.children[o].toJSON(e).object)}if(this.animations.length>0){i.animations=[];for(let o=0;o<this.animations.length;o++){let l=this.animations[o];i.animations.push(r(e.animations,l))}}if(t){let o=a(e.geometries),l=a(e.materials),c=a(e.textures),u=a(e.images),h=a(e.shapes),f=a(e.skeletons),d=a(e.animations),m=a(e.nodes);o.length>0&&(n.geometries=o),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),u.length>0&&(n.images=u),h.length>0&&(n.shapes=h),f.length>0&&(n.skeletons=f),d.length>0&&(n.animations=d),m.length>0&&(n.nodes=m)}return n.object=i,n;function a(o){let l=[];for(let c in o){let u=o[c];delete u.metadata,l.push(u)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.pivot=e.pivot!==null?e.pivot.clone():null,this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.static=e.static,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){let i=e.children[n];this.add(i.clone())}return this}};Ut.DEFAULT_UP=new N(0,1,0);Ut.DEFAULT_MATRIX_AUTO_UPDATE=!0;Ut.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var Fe=class extends Ut{constructor(){super(),this.isGroup=!0,this.type="Group"}},Ud={type:"move"},Ks=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Fe,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Fe,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new N,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new N),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Fe,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new N,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new N,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let i=null,r=null,a=null,o=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){a=!0;for(let y of e.hand.values()){let g=t.getJointPose(y,n),p=this._getHandJoint(c,y);g!==null&&(p.matrix.fromArray(g.transform.matrix),p.matrix.decompose(p.position,p.rotation,p.scale),p.matrixWorldNeedsUpdate=!0,p.jointRadius=g.radius),p.visible=g!==null}let u=c.joints["index-finger-tip"],h=c.joints["thumb-tip"],f=u.position.distanceTo(h.position),d=.02,m=.005;c.inputState.pinching&&f>d+m?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&f<=d-m&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,n),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1,l.eventsEnabled&&l.dispatchEvent({type:"gripUpdated",data:e,target:this})));o!==null&&(i=t.getPose(e.targetRaySpace,n),i===null&&r!==null&&(i=r),i!==null&&(o.matrix.fromArray(i.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,i.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(i.linearVelocity)):o.hasLinearVelocity=!1,i.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(i.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(Ud)))}return o!==null&&(o.visible=i!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let n=new Fe;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}},Hu={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Li={h:0,s:0,l:0},Ia={h:0,s:0,l:0};function kl(s,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?s+(e-s)*6*t:t<1/2?e:t<2/3?s+(e-s)*6*(2/3-t):s}var Ve=class{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){let i=e;i&&i.isColor?this.copy(i):typeof i=="number"?this.setHex(i):typeof i=="string"&&this.setStyle(i)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=bt){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,et.colorSpaceToWorking(this,t),this}setRGB(e,t,n,i=et.workingColorSpace){return this.r=e,this.g=t,this.b=n,et.colorSpaceToWorking(this,i),this}setHSL(e,t,n,i=et.workingColorSpace){if(e=Bc(e,1),t=ut(t,0,1),n=ut(n,0,1),t===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+t):n+t-n*t,a=2*n-r;this.r=kl(a,r,e+1/3),this.g=kl(a,r,e),this.b=kl(a,r,e-1/3)}return et.colorSpaceToWorking(this,i),this}setStyle(e,t=bt){function n(r){r!==void 0&&parseFloat(r)<1&&ke("Color: Alpha component of "+e+" will be ignored.")}let i;if(i=/^(\w+)\(([^\)]*)\)/.exec(e)){let r,a=i[1],o=i[2];switch(a){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,t);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:ke("Color: Unknown color model "+e)}}else if(i=/^\#([A-Fa-f\d]+)$/.exec(e)){let r=i[1],a=r.length;if(a===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(a===6)return this.setHex(parseInt(r,16),t);ke("Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=bt){let n=Hu[e.toLowerCase()];return n!==void 0?this.setHex(n,t):ke("Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=xi(e.r),this.g=xi(e.g),this.b=xi(e.b),this}copyLinearToSRGB(e){return this.r=Ws(e.r),this.g=Ws(e.g),this.b=Ws(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=bt){return et.workingToColorSpace(fn.copy(this),e),Math.round(ut(fn.r*255,0,255))*65536+Math.round(ut(fn.g*255,0,255))*256+Math.round(ut(fn.b*255,0,255))}getHexString(e=bt){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=et.workingColorSpace){et.workingToColorSpace(fn.copy(this),t);let n=fn.r,i=fn.g,r=fn.b,a=Math.max(n,i,r),o=Math.min(n,i,r),l,c,u=(o+a)/2;if(o===a)l=0,c=0;else{let h=a-o;switch(c=u<=.5?h/(a+o):h/(2-a-o),a){case n:l=(i-r)/h+(i<r?6:0);break;case i:l=(r-n)/h+2;break;case r:l=(n-i)/h+4;break}l/=6}return e.h=l,e.s=c,e.l=u,e}getRGB(e,t=et.workingColorSpace){return et.workingToColorSpace(fn.copy(this),t),e.r=fn.r,e.g=fn.g,e.b=fn.b,e}getStyle(e=bt){et.workingToColorSpace(fn.copy(this),e);let t=fn.r,n=fn.g,i=fn.b;return e!==bt?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${i.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(i*255)})`}offsetHSL(e,t,n){return this.getHSL(Li),this.setHSL(Li.h+e,Li.s+t,Li.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(Li),e.getHSL(Ia);let n=wr(Li.h,Ia.h,t),i=wr(Li.s,Ia.s,t),r=wr(Li.l,Ia.l,t);return this.setHSL(n,i,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,n=this.g,i=this.b,r=e.elements;return this.r=r[0]*t+r[3]*n+r[6]*i,this.g=r[1]*t+r[4]*n+r[7]*i,this.b=r[2]*t+r[5]*n+r[8]*i,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},fn=new Ve;Ve.NAMES=Hu;var Dr=class s{constructor(e,t=1,n=1e3){this.isFog=!0,this.name="",this.color=new Ve(e),this.near=t,this.far=n}clone(){return new s(this.color,this.near,this.far)}toJSON(){return{type:"Fog",name:this.name,color:this.color.getHex(),near:this.near,far:this.far}}},Nr=class extends Ut{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new $t,this.environmentIntensity=1,this.environmentRotation=new $t,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}},Hn=new N,fi=new N,Hl=new N,di=new N,Ns=new N,Fs=new N,Uh=new N,Vl=new N,Gl=new N,Wl=new N,Xl=new dt,ql=new dt,Yl=new dt,Oi=class s{constructor(e=new N,t=new N,n=new N){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,i){i.subVectors(n,t),Hn.subVectors(e,t),i.cross(Hn);let r=i.lengthSq();return r>0?i.multiplyScalar(1/Math.sqrt(r)):i.set(0,0,0)}static getBarycoord(e,t,n,i,r){Hn.subVectors(i,t),fi.subVectors(n,t),Hl.subVectors(e,t);let a=Hn.dot(Hn),o=Hn.dot(fi),l=Hn.dot(Hl),c=fi.dot(fi),u=fi.dot(Hl),h=a*c-o*o;if(h===0)return r.set(0,0,0),null;let f=1/h,d=(c*l-o*u)*f,m=(a*u-o*l)*f;return r.set(1-d-m,m,d)}static containsPoint(e,t,n,i){return this.getBarycoord(e,t,n,i,di)===null?!1:di.x>=0&&di.y>=0&&di.x+di.y<=1}static getInterpolation(e,t,n,i,r,a,o,l){return this.getBarycoord(e,t,n,i,di)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,di.x),l.addScaledVector(a,di.y),l.addScaledVector(o,di.z),l)}static getInterpolatedAttribute(e,t,n,i,r,a){return Xl.setScalar(0),ql.setScalar(0),Yl.setScalar(0),Xl.fromBufferAttribute(e,t),ql.fromBufferAttribute(e,n),Yl.fromBufferAttribute(e,i),a.setScalar(0),a.addScaledVector(Xl,r.x),a.addScaledVector(ql,r.y),a.addScaledVector(Yl,r.z),a}static isFrontFacing(e,t,n,i){return Hn.subVectors(n,t),fi.subVectors(e,t),Hn.cross(fi).dot(i)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,i){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[i]),this}setFromAttributeAndIndices(e,t,n,i){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,i),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Hn.subVectors(this.c,this.b),fi.subVectors(this.a,this.b),Hn.cross(fi).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return s.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return s.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,i,r){return s.getInterpolation(e,this.a,this.b,this.c,t,n,i,r)}containsPoint(e){return s.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return s.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let n=this.a,i=this.b,r=this.c,a,o;Ns.subVectors(i,n),Fs.subVectors(r,n),Vl.subVectors(e,n);let l=Ns.dot(Vl),c=Fs.dot(Vl);if(l<=0&&c<=0)return t.copy(n);Gl.subVectors(e,i);let u=Ns.dot(Gl),h=Fs.dot(Gl);if(u>=0&&h<=u)return t.copy(i);let f=l*h-u*c;if(f<=0&&l>=0&&u<=0)return a=l/(l-u),t.copy(n).addScaledVector(Ns,a);Wl.subVectors(e,r);let d=Ns.dot(Wl),m=Fs.dot(Wl);if(m>=0&&d<=m)return t.copy(r);let y=d*c-l*m;if(y<=0&&c>=0&&m<=0)return o=c/(c-m),t.copy(n).addScaledVector(Fs,o);let g=u*m-d*h;if(g<=0&&h-u>=0&&d-m>=0)return Uh.subVectors(r,i),o=(h-u)/(h-u+(d-m)),t.copy(i).addScaledVector(Uh,o);let p=1/(g+y+f);return a=y*p,o=f*p,t.copy(n).addScaledVector(Ns,a).addScaledVector(Fs,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},dn=class{constructor(e=new N(1/0,1/0,1/0),t=new N(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(Vn.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(Vn.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let n=Vn.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let n=e.geometry;if(n!==void 0){let r=n.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let a=0,o=r.count;a<o;a++)e.isMesh===!0?e.getVertexPosition(a,Vn):Vn.fromBufferAttribute(r,a),Vn.applyMatrix4(e.matrixWorld),this.expandByPoint(Vn);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),Pa.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),Pa.copy(n.boundingBox)),Pa.applyMatrix4(e.matrixWorld),this.union(Pa)}let i=e.children;for(let r=0,a=i.length;r<a;r++)this.expandByObject(i[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,Vn),Vn.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(_r),La.subVectors(this.max,_r),Us.subVectors(e.a,_r),Os.subVectors(e.b,_r),Bs.subVectors(e.c,_r),Di.subVectors(Os,Us),Ni.subVectors(Bs,Os),as.subVectors(Us,Bs);let t=[0,-Di.z,Di.y,0,-Ni.z,Ni.y,0,-as.z,as.y,Di.z,0,-Di.x,Ni.z,0,-Ni.x,as.z,0,-as.x,-Di.y,Di.x,0,-Ni.y,Ni.x,0,-as.y,as.x,0];return!Zl(t,Us,Os,Bs,La)||(t=[1,0,0,0,1,0,0,0,1],!Zl(t,Us,Os,Bs,La))?!1:(Da.crossVectors(Di,Ni),t=[Da.x,Da.y,Da.z],Zl(t,Us,Os,Bs,La))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,Vn).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(Vn).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(pi[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),pi[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),pi[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),pi[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),pi[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),pi[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),pi[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),pi[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(pi),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},pi=[new N,new N,new N,new N,new N,new N,new N,new N],Vn=new N,Pa=new dn,Us=new N,Os=new N,Bs=new N,Di=new N,Ni=new N,as=new N,_r=new N,La=new N,Da=new N,os=new N;function Zl(s,e,t,n,i){for(let r=0,a=s.length-3;r<=a;r+=3){os.fromArray(s,r);let o=i.x*Math.abs(os.x)+i.y*Math.abs(os.y)+i.z*Math.abs(os.z),l=e.dot(os),c=t.dot(os),u=n.dot(os);if(Math.max(-Math.max(l,c,u),Math.min(l,c,u))>o)return!1}return!0}var qt=new N,Na=new Ke,Od=0,An=class extends Wn{constructor(e,t,n=!1){if(super(),Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:Od++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=cc,this.updateRanges=[],this.gpuType=Un,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let i=0,r=this.itemSize;i<r;i++)this.array[e+i]=t.array[n+i];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)Na.fromBufferAttribute(this,t),Na.applyMatrix3(e),this.setXY(t,Na.x,Na.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)qt.fromBufferAttribute(this,t),qt.applyMatrix3(e),this.setXYZ(t,qt.x,qt.y,qt.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)qt.fromBufferAttribute(this,t),qt.applyMatrix4(e),this.setXYZ(t,qt.x,qt.y,qt.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)qt.fromBufferAttribute(this,t),qt.applyNormalMatrix(e),this.setXYZ(t,qt.x,qt.y,qt.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)qt.fromBufferAttribute(this,t),qt.transformDirection(e),this.setXYZ(t,qt.x,qt.y,qt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=Gs(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=xn(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=Gs(t,this.array)),t}setX(e,t){return this.normalized&&(t=xn(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=Gs(t,this.array)),t}setY(e,t){return this.normalized&&(t=xn(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=Gs(t,this.array)),t}setZ(e,t){return this.normalized&&(t=xn(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=Gs(t,this.array)),t}setW(e,t){return this.normalized&&(t=xn(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=xn(t,this.array),n=xn(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,i){return e*=this.itemSize,this.normalized&&(t=xn(t,this.array),n=xn(n,this.array),i=xn(i,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=i,this}setXYZW(e,t,n,i,r){return e*=this.itemSize,this.normalized&&(t=xn(t,this.array),n=xn(n,this.array),i=xn(i,this.array),r=xn(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=i,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==cc&&(e.usage=this.usage),e}dispose(){this.dispatchEvent({type:"dispose"})}};var xs=class extends An{constructor(e,t,n){super(new Uint16Array(e),t,n)}};var Fr=class extends An{constructor(e,t,n){super(new Uint32Array(e),t,n)}};var ft=class extends An{constructor(e,t,n){super(new Float32Array(e),t,n)}},Bd=new dn,yr=new N,$l=new N,_i=class{constructor(e=new N,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let n=this.center;t!==void 0?n.copy(t):Bd.setFromPoints(e).getCenter(n);let i=0;for(let r=0,a=e.length;r<a;r++)i=Math.max(i,n.distanceToSquared(e[r]));return this.radius=Math.sqrt(i),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;yr.subVectors(e,this.center);let t=yr.lengthSq();if(t>this.radius*this.radius){let n=Math.sqrt(t),i=(n-this.radius)*.5;this.center.addScaledVector(yr,i/n),this.radius+=i}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):($l.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(yr.copy(e.center).add($l)),this.expandByPoint(yr.copy(e.center).sub($l))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},zd=0,Dn=new He,Kl=new Ut,zs=new N,Tn=new dn,Mr=new dn,nn=new N,Wt=class s extends Wn{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:zd++}),this.uuid=ji(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(cd(e)?Fr:xs)(e,1):this.index=e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let r=new Qe().getNormalMatrix(e);n.applyNormalMatrix(r),n.needsUpdate=!0}let i=this.attributes.tangent;return i!==void 0&&(i.transformDirection(e),i.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(e){return Dn.makeRotationFromQuaternion(e),this.applyMatrix4(Dn),this}rotateX(e){return Dn.makeRotationX(e),this.applyMatrix4(Dn),this}rotateY(e){return Dn.makeRotationY(e),this.applyMatrix4(Dn),this}rotateZ(e){return Dn.makeRotationZ(e),this.applyMatrix4(Dn),this}translate(e,t,n){return Dn.makeTranslation(e,t,n),this.applyMatrix4(Dn),this}scale(e,t,n){return Dn.makeScale(e,t,n),this.applyMatrix4(Dn),this}lookAt(e){return Kl.lookAt(e),Kl.updateMatrix(),this.applyMatrix4(Kl.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(zs).negate(),this.translate(zs.x,zs.y,zs.z),this}setFromPoints(e){let t=this.getAttribute("position");if(t===void 0){let n=[];for(let i=0,r=e.length;i<r;i++){let a=e[i];n.push(a.x,a.y,a.z||0)}this.setAttribute("position",new ft(n,3))}else{let n=Math.min(e.length,t.count);for(let i=0;i<n;i++){let r=e[i];t.setXYZ(i,r.x,r.y,r.z||0)}e.length>t.count&&ke("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new dn);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){Ye("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new N(-1/0,-1/0,-1/0),new N(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,i=t.length;n<i;n++){let r=t[n];Tn.setFromBufferAttribute(r),this.morphTargetsRelative?(nn.addVectors(this.boundingBox.min,Tn.min),this.boundingBox.expandByPoint(nn),nn.addVectors(this.boundingBox.max,Tn.max),this.boundingBox.expandByPoint(nn)):(this.boundingBox.expandByPoint(Tn.min),this.boundingBox.expandByPoint(Tn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&Ye('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new _i);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){Ye("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new N,1/0);return}if(e){let n=this.boundingSphere.center;if(Tn.setFromBufferAttribute(e),t)for(let r=0,a=t.length;r<a;r++){let o=t[r];Mr.setFromBufferAttribute(o),this.morphTargetsRelative?(nn.addVectors(Tn.min,Mr.min),Tn.expandByPoint(nn),nn.addVectors(Tn.max,Mr.max),Tn.expandByPoint(nn)):(Tn.expandByPoint(Mr.min),Tn.expandByPoint(Mr.max))}Tn.getCenter(n);let i=0;for(let r=0,a=e.count;r<a;r++)nn.fromBufferAttribute(e,r),i=Math.max(i,n.distanceToSquared(nn));if(t)for(let r=0,a=t.length;r<a;r++){let o=t[r],l=this.morphTargetsRelative;for(let c=0,u=o.count;c<u;c++)nn.fromBufferAttribute(o,c),l&&(zs.fromBufferAttribute(e,c),nn.add(zs)),i=Math.max(i,n.distanceToSquared(nn))}this.boundingSphere.radius=Math.sqrt(i),isNaN(this.boundingSphere.radius)&&Ye('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){Ye("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let n=t.position,i=t.normal,r=t.uv,a=this.getAttribute("tangent");(a===void 0||a.count!==n.count)&&(a=new An(new Float32Array(4*n.count),4),this.setAttribute("tangent",a));let o=[],l=[];for(let v=0;v<n.count;v++)o[v]=new N,l[v]=new N;let c=new N,u=new N,h=new N,f=new Ke,d=new Ke,m=new Ke,y=new N,g=new N;function p(v,T,P){c.fromBufferAttribute(n,v),u.fromBufferAttribute(n,T),h.fromBufferAttribute(n,P),f.fromBufferAttribute(r,v),d.fromBufferAttribute(r,T),m.fromBufferAttribute(r,P),u.sub(c),h.sub(c),d.sub(f),m.sub(f);let L=1/(d.x*m.y-m.x*d.y);isFinite(L)&&(y.copy(u).multiplyScalar(m.y).addScaledVector(h,-d.y).multiplyScalar(L),g.copy(h).multiplyScalar(d.x).addScaledVector(u,-m.x).multiplyScalar(L),o[v].add(y),o[T].add(y),o[P].add(y),l[v].add(g),l[T].add(g),l[P].add(g))}let E=this.groups;E.length===0&&(E=[{start:0,count:e.count}]);for(let v=0,T=E.length;v<T;++v){let P=E[v],L=P.start,F=P.count;for(let K=L,J=L+F;K<J;K+=3)p(e.getX(K+0),e.getX(K+1),e.getX(K+2))}let S=new N,_=new N,C=new N,b=new N;function I(v){C.fromBufferAttribute(i,v),b.copy(C);let T=o[v];S.copy(T),S.sub(C.multiplyScalar(C.dot(T))).normalize(),_.crossVectors(b,T);let L=_.dot(l[v])<0?-1:1;a.setXYZW(v,S.x,S.y,S.z,L)}for(let v=0,T=E.length;v<T;++v){let P=E[v],L=P.start,F=P.count;for(let K=L,J=L+F;K<J;K+=3)I(e.getX(K+0)),I(e.getX(K+1)),I(e.getX(K+2))}this._transformed=!0}computeVertexNormals(){let e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0||n.count!==t.count)n=new An(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let f=0,d=n.count;f<d;f++)n.setXYZ(f,0,0,0);let i=new N,r=new N,a=new N,o=new N,l=new N,c=new N,u=new N,h=new N;if(e)for(let f=0,d=e.count;f<d;f+=3){let m=e.getX(f+0),y=e.getX(f+1),g=e.getX(f+2);i.fromBufferAttribute(t,m),r.fromBufferAttribute(t,y),a.fromBufferAttribute(t,g),u.subVectors(a,r),h.subVectors(i,r),u.cross(h),o.fromBufferAttribute(n,m),l.fromBufferAttribute(n,y),c.fromBufferAttribute(n,g),o.add(u),l.add(u),c.add(u),n.setXYZ(m,o.x,o.y,o.z),n.setXYZ(y,l.x,l.y,l.z),n.setXYZ(g,c.x,c.y,c.z)}else for(let f=0,d=t.count;f<d;f+=3)i.fromBufferAttribute(t,f+0),r.fromBufferAttribute(t,f+1),a.fromBufferAttribute(t,f+2),u.subVectors(a,r),h.subVectors(i,r),u.cross(h),n.setXYZ(f+0,u.x,u.y,u.z),n.setXYZ(f+1,u.x,u.y,u.z),n.setXYZ(f+2,u.x,u.y,u.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)nn.fromBufferAttribute(e,t),nn.normalize(),e.setXYZ(t,nn.x,nn.y,nn.z)}toNonIndexed(){function e(o,l){let c=o.array,u=o.itemSize,h=o.normalized,f=new c.constructor(l.length*u),d=0,m=0;for(let y=0,g=l.length;y<g;y++){o.isInterleavedBufferAttribute?d=l[y]*o.data.stride+o.offset:d=l[y]*u;for(let p=0;p<u;p++)f[m++]=c[d++]}return new An(f,u,h)}if(this.index===null)return ke("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let t=new s,n=this.index.array,i=this.attributes;for(let o in i){let l=i[o],c=e(l,n);t.setAttribute(o,c)}let r=this.morphAttributes;for(let o in r){let l=[],c=r[o];for(let u=0,h=c.length;u<h;u++){let f=c[u],d=e(f,n);l.push(d)}t.morphAttributes[o]=l}t.morphTargetsRelative=this.morphTargetsRelative;let a=this.groups;for(let o=0,l=a.length;o<l;o++){let c=a[o];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){let e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let l=this.parameters;for(let c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let n=this.attributes;for(let l in n){let c=n[l];e.data.attributes[l]=c.toJSON(e.data)}let i={},r=!1;for(let l in this.morphAttributes){let c=this.morphAttributes[l],u=[];for(let h=0,f=c.length;h<f;h++){let d=c[h];u.push(d.toJSON(e.data))}u.length>0&&(i[l]=u,r=!0)}r&&(e.data.morphAttributes=i,e.data.morphTargetsRelative=this.morphTargetsRelative);let a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));let o=this.boundingSphere;return o!==null&&(e.data.boundingSphere=o.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let n=e.index;n!==null&&this.setIndex(n.clone());let i=e.attributes;for(let c in i){let u=i[c];this.setAttribute(c,u.clone(t))}let r=e.morphAttributes;for(let c in r){let u=[],h=r[c];for(let f=0,d=h.length;f<d;f++)u.push(h[f].clone(t));this.morphAttributes[c]=u}this.morphTargetsRelative=e.morphTargetsRelative;let a=e.groups;for(let c=0,u=a.length;c<u;c++){let h=a[c];this.addGroup(h.start,h.count,h.materialIndex)}let o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());let l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this._transformed=e._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}};var kd=0,Xn=class extends Wn{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:kd++}),this.uuid=ji(),this.name="",this.type="Material",this.blending=ii,this.side=vi,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=eo,this.blendDst=to,this.blendEquation=Bi,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Ve(0,0,0),this.blendAlpha=0,this.depthFunc=ps,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=lc,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=hs,this.stencilZFail=hs,this.stencilZPass=hs,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let n=e[t];if(n===void 0){ke(`Material: parameter '${t}' has value of undefined.`);continue}let i=this[t];if(i===void 0){ke(`Material: '${t}' is not a property of THREE.${this.type}.`);continue}i&&i.isColor?i.set(n):i&&i.isVector2&&n&&n.isVector2||i&&i.isEuler&&n&&n.isEuler||i&&i.isVector3&&n&&n.isVector3?i.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});let n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==ii&&(n.blending=this.blending),this.side!==vi&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==eo&&(n.blendSrc=this.blendSrc),this.blendDst!==to&&(n.blendDst=this.blendDst),this.blendEquation!==Bi&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==ps&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==lc&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==hs&&(n.stencilFail=this.stencilFail),this.stencilZFail!==hs&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==hs&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.allowOverride===!1&&(n.allowOverride=!1),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function i(r){let a=[];for(let o in r){let l=r[o];delete l.metadata,a.push(l)}return a}if(t){let r=i(e.textures),a=i(e.images);r.length>0&&(n.textures=r),a.length>0&&(n.images=a)}return n}fromJSON(e,t){if(e.uuid!==void 0&&(this.uuid=e.uuid),e.name!==void 0&&(this.name=e.name),e.color!==void 0&&this.color!==void 0&&this.color.setHex(e.color),e.roughness!==void 0&&(this.roughness=e.roughness),e.metalness!==void 0&&(this.metalness=e.metalness),e.sheen!==void 0&&(this.sheen=e.sheen),e.sheenColor!==void 0&&(this.sheenColor=new Ve().setHex(e.sheenColor)),e.sheenRoughness!==void 0&&(this.sheenRoughness=e.sheenRoughness),e.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(e.emissive),e.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(e.specular),e.specularIntensity!==void 0&&(this.specularIntensity=e.specularIntensity),e.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(e.specularColor),e.shininess!==void 0&&(this.shininess=e.shininess),e.clearcoat!==void 0&&(this.clearcoat=e.clearcoat),e.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=e.clearcoatRoughness),e.dispersion!==void 0&&(this.dispersion=e.dispersion),e.iridescence!==void 0&&(this.iridescence=e.iridescence),e.iridescenceIOR!==void 0&&(this.iridescenceIOR=e.iridescenceIOR),e.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=e.iridescenceThicknessRange),e.transmission!==void 0&&(this.transmission=e.transmission),e.thickness!==void 0&&(this.thickness=e.thickness),e.attenuationDistance!==void 0&&(this.attenuationDistance=e.attenuationDistance),e.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(e.attenuationColor),e.anisotropy!==void 0&&(this.anisotropy=e.anisotropy),e.anisotropyRotation!==void 0&&(this.anisotropyRotation=e.anisotropyRotation),e.fog!==void 0&&(this.fog=e.fog),e.flatShading!==void 0&&(this.flatShading=e.flatShading),e.blending!==void 0&&(this.blending=e.blending),e.combine!==void 0&&(this.combine=e.combine),e.side!==void 0&&(this.side=e.side),e.shadowSide!==void 0&&(this.shadowSide=e.shadowSide),e.opacity!==void 0&&(this.opacity=e.opacity),e.transparent!==void 0&&(this.transparent=e.transparent),e.alphaTest!==void 0&&(this.alphaTest=e.alphaTest),e.alphaHash!==void 0&&(this.alphaHash=e.alphaHash),e.depthFunc!==void 0&&(this.depthFunc=e.depthFunc),e.depthTest!==void 0&&(this.depthTest=e.depthTest),e.depthWrite!==void 0&&(this.depthWrite=e.depthWrite),e.colorWrite!==void 0&&(this.colorWrite=e.colorWrite),e.blendSrc!==void 0&&(this.blendSrc=e.blendSrc),e.blendDst!==void 0&&(this.blendDst=e.blendDst),e.blendEquation!==void 0&&(this.blendEquation=e.blendEquation),e.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=e.blendSrcAlpha),e.blendDstAlpha!==void 0&&(this.blendDstAlpha=e.blendDstAlpha),e.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=e.blendEquationAlpha),e.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(e.blendColor),e.blendAlpha!==void 0&&(this.blendAlpha=e.blendAlpha),e.stencilWriteMask!==void 0&&(this.stencilWriteMask=e.stencilWriteMask),e.stencilFunc!==void 0&&(this.stencilFunc=e.stencilFunc),e.stencilRef!==void 0&&(this.stencilRef=e.stencilRef),e.stencilFuncMask!==void 0&&(this.stencilFuncMask=e.stencilFuncMask),e.stencilFail!==void 0&&(this.stencilFail=e.stencilFail),e.stencilZFail!==void 0&&(this.stencilZFail=e.stencilZFail),e.stencilZPass!==void 0&&(this.stencilZPass=e.stencilZPass),e.stencilWrite!==void 0&&(this.stencilWrite=e.stencilWrite),e.wireframe!==void 0&&(this.wireframe=e.wireframe),e.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=e.wireframeLinewidth),e.wireframeLinecap!==void 0&&(this.wireframeLinecap=e.wireframeLinecap),e.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=e.wireframeLinejoin),e.rotation!==void 0&&(this.rotation=e.rotation),e.linewidth!==void 0&&(this.linewidth=e.linewidth),e.dashSize!==void 0&&(this.dashSize=e.dashSize),e.gapSize!==void 0&&(this.gapSize=e.gapSize),e.scale!==void 0&&(this.scale=e.scale),e.polygonOffset!==void 0&&(this.polygonOffset=e.polygonOffset),e.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=e.polygonOffsetFactor),e.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=e.polygonOffsetUnits),e.dithering!==void 0&&(this.dithering=e.dithering),e.alphaToCoverage!==void 0&&(this.alphaToCoverage=e.alphaToCoverage),e.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=e.premultipliedAlpha),e.forceSinglePass!==void 0&&(this.forceSinglePass=e.forceSinglePass),e.allowOverride!==void 0&&(this.allowOverride=e.allowOverride),e.visible!==void 0&&(this.visible=e.visible),e.toneMapped!==void 0&&(this.toneMapped=e.toneMapped),e.userData!==void 0&&(this.userData=e.userData),e.vertexColors!==void 0&&(typeof e.vertexColors=="number"?this.vertexColors=e.vertexColors>0:this.vertexColors=e.vertexColors),e.size!==void 0&&(this.size=e.size),e.sizeAttenuation!==void 0&&(this.sizeAttenuation=e.sizeAttenuation),e.map!==void 0&&(this.map=t[e.map]||null),e.matcap!==void 0&&(this.matcap=t[e.matcap]||null),e.alphaMap!==void 0&&(this.alphaMap=t[e.alphaMap]||null),e.bumpMap!==void 0&&(this.bumpMap=t[e.bumpMap]||null),e.bumpScale!==void 0&&(this.bumpScale=e.bumpScale),e.normalMap!==void 0&&(this.normalMap=t[e.normalMap]||null),e.normalMapType!==void 0&&(this.normalMapType=e.normalMapType),e.normalScale!==void 0){let n=e.normalScale;Array.isArray(n)===!1&&(n=[n,n]),this.normalScale=new Ke().fromArray(n)}return e.displacementMap!==void 0&&(this.displacementMap=t[e.displacementMap]||null),e.displacementScale!==void 0&&(this.displacementScale=e.displacementScale),e.displacementBias!==void 0&&(this.displacementBias=e.displacementBias),e.roughnessMap!==void 0&&(this.roughnessMap=t[e.roughnessMap]||null),e.metalnessMap!==void 0&&(this.metalnessMap=t[e.metalnessMap]||null),e.emissiveMap!==void 0&&(this.emissiveMap=t[e.emissiveMap]||null),e.emissiveIntensity!==void 0&&(this.emissiveIntensity=e.emissiveIntensity),e.specularMap!==void 0&&(this.specularMap=t[e.specularMap]||null),e.specularIntensityMap!==void 0&&(this.specularIntensityMap=t[e.specularIntensityMap]||null),e.specularColorMap!==void 0&&(this.specularColorMap=t[e.specularColorMap]||null),e.envMap!==void 0&&(this.envMap=t[e.envMap]||null),e.envMapRotation!==void 0&&this.envMapRotation.fromArray(e.envMapRotation),e.envMapIntensity!==void 0&&(this.envMapIntensity=e.envMapIntensity),e.reflectivity!==void 0&&(this.reflectivity=e.reflectivity),e.refractionRatio!==void 0&&(this.refractionRatio=e.refractionRatio),e.lightMap!==void 0&&(this.lightMap=t[e.lightMap]||null),e.lightMapIntensity!==void 0&&(this.lightMapIntensity=e.lightMapIntensity),e.aoMap!==void 0&&(this.aoMap=t[e.aoMap]||null),e.aoMapIntensity!==void 0&&(this.aoMapIntensity=e.aoMapIntensity),e.gradientMap!==void 0&&(this.gradientMap=t[e.gradientMap]||null),e.clearcoatMap!==void 0&&(this.clearcoatMap=t[e.clearcoatMap]||null),e.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=t[e.clearcoatRoughnessMap]||null),e.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=t[e.clearcoatNormalMap]||null),e.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new Ke().fromArray(e.clearcoatNormalScale)),e.iridescenceMap!==void 0&&(this.iridescenceMap=t[e.iridescenceMap]||null),e.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=t[e.iridescenceThicknessMap]||null),e.transmissionMap!==void 0&&(this.transmissionMap=t[e.transmissionMap]||null),e.thicknessMap!==void 0&&(this.thicknessMap=t[e.thicknessMap]||null),e.anisotropyMap!==void 0&&(this.anisotropyMap=t[e.anisotropyMap]||null),e.sheenColorMap!==void 0&&(this.sheenColorMap=t[e.sheenColorMap]||null),e.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=t[e.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,n=null;if(t!==null){let i=t.length;n=new Array(i);for(let r=0;r!==i;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}};var mi=new N,Jl=new N,Fa=new N,Fi=new N,Ql=new N,Ua=new N,jl=new N,Js=class{constructor(e=new N,t=new N(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,mi)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=mi.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(mi.copy(this.origin).addScaledVector(this.direction,t),mi.distanceToSquared(e))}distanceSqToSegment(e,t,n,i){Jl.copy(e).add(t).multiplyScalar(.5),Fa.copy(t).sub(e).normalize(),Fi.copy(this.origin).sub(Jl);let r=e.distanceTo(t)*.5,a=-this.direction.dot(Fa),o=Fi.dot(this.direction),l=-Fi.dot(Fa),c=Fi.lengthSq(),u=Math.abs(1-a*a),h,f,d,m;if(u>0)if(h=a*l-o,f=a*o-l,m=r*u,h>=0)if(f>=-m)if(f<=m){let y=1/u;h*=y,f*=y,d=h*(h+a*f+2*o)+f*(a*h+f+2*l)+c}else f=r,h=Math.max(0,-(a*f+o)),d=-h*h+f*(f+2*l)+c;else f=-r,h=Math.max(0,-(a*f+o)),d=-h*h+f*(f+2*l)+c;else f<=-m?(h=Math.max(0,-(-a*r+o)),f=h>0?-r:Math.min(Math.max(-r,-l),r),d=-h*h+f*(f+2*l)+c):f<=m?(h=0,f=Math.min(Math.max(-r,-l),r),d=f*(f+2*l)+c):(h=Math.max(0,-(a*r+o)),f=h>0?r:Math.min(Math.max(-r,-l),r),d=-h*h+f*(f+2*l)+c);else f=a>0?-r:r,h=Math.max(0,-(a*f+o)),d=-h*h+f*(f+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,h),i&&i.copy(Jl).addScaledVector(Fa,f),d}intersectSphere(e,t){mi.subVectors(e.center,this.origin);let n=mi.dot(this.direction),i=mi.dot(mi)-n*n,r=e.radius*e.radius;if(i>r)return null;let a=Math.sqrt(r-i),o=n-a,l=n+a;return l<0?null:o<0?this.at(l,t):this.at(o,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){let n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,i,r,a,o,l,c=1/this.direction.x,u=1/this.direction.y,h=1/this.direction.z,f=this.origin;return c>=0?(n=(e.min.x-f.x)*c,i=(e.max.x-f.x)*c):(n=(e.max.x-f.x)*c,i=(e.min.x-f.x)*c),u>=0?(r=(e.min.y-f.y)*u,a=(e.max.y-f.y)*u):(r=(e.max.y-f.y)*u,a=(e.min.y-f.y)*u),n>a||r>i||((r>n||isNaN(n))&&(n=r),(a<i||isNaN(i))&&(i=a),h>=0?(o=(e.min.z-f.z)*h,l=(e.max.z-f.z)*h):(o=(e.max.z-f.z)*h,l=(e.min.z-f.z)*h),n>l||o>i)||((o>n||n!==n)&&(n=o),(l<i||i!==i)&&(i=l),i<0)?null:this.at(n>=0?n:i,t)}intersectsBox(e){return this.intersectBox(e,mi)!==null}intersectTriangle(e,t,n,i,r){Ql.subVectors(t,e),Ua.subVectors(n,e),jl.crossVectors(Ql,Ua);let a=this.direction.dot(jl),o;if(a>0){if(i)return null;o=1}else if(a<0)o=-1,a=-a;else return null;Fi.subVectors(this.origin,e);let l=o*this.direction.dot(Ua.crossVectors(Fi,Ua));if(l<0)return null;let c=o*this.direction.dot(Ql.cross(Fi));if(c<0||l+c>a)return null;let u=-o*Fi.dot(jl);return u<0?null:this.at(u/a,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},Rn=class extends Xn{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Ve(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new $t,this.combine=la,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}},Oh=new He,ls=new Js,Oa=new _i,Bh=new N,Ba=new N,za=new N,ka=new N,ec=new N,Ha=new N,zh=new N,Va=new N,pt=class extends Ut{constructor(e=new Wt,t=new Rn){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let i=t[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=i.length;r<a;r++){let o=i[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}getVertexPosition(e,t){let n=this.geometry,i=n.attributes.position,r=n.morphAttributes.position,a=n.morphTargetsRelative;t.fromBufferAttribute(i,e);let o=this.morphTargetInfluences;if(r&&o){Ha.set(0,0,0);for(let l=0,c=r.length;l<c;l++){let u=o[l],h=r[l];u!==0&&(ec.fromBufferAttribute(h,e),a?Ha.addScaledVector(ec,u):Ha.addScaledVector(ec.sub(t),u))}t.add(Ha)}return t}raycast(e,t){let n=this.geometry,i=this.material,r=this.matrixWorld;i!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),Oa.copy(n.boundingSphere),Oa.applyMatrix4(r),ls.copy(e.ray).recast(e.near),!(Oa.containsPoint(ls.origin)===!1&&(ls.intersectSphere(Oa,Bh)===null||ls.origin.distanceToSquared(Bh)>(e.far-e.near)**2))&&(Oh.copy(r).invert(),ls.copy(e.ray).applyMatrix4(Oh),!(n.boundingBox!==null&&ls.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,ls)))}_computeIntersections(e,t,n){let i,r=this.geometry,a=this.material,o=r.index,l=r.attributes.position,c=r.attributes.uv,u=r.attributes.uv1,h=r.attributes.normal,f=r.groups,d=r.drawRange;if(o!==null)if(Array.isArray(a))for(let m=0,y=f.length;m<y;m++){let g=f[m],p=a[g.materialIndex],E=Math.max(g.start,d.start),S=Math.min(o.count,Math.min(g.start+g.count,d.start+d.count));for(let _=E,C=S;_<C;_+=3){let b=o.getX(_),I=o.getX(_+1),v=o.getX(_+2);i=Ga(this,p,e,n,c,u,h,b,I,v),i&&(i.faceIndex=Math.floor(_/3),i.face.materialIndex=g.materialIndex,t.push(i))}}else{let m=Math.max(0,d.start),y=Math.min(o.count,d.start+d.count);for(let g=m,p=y;g<p;g+=3){let E=o.getX(g),S=o.getX(g+1),_=o.getX(g+2);i=Ga(this,a,e,n,c,u,h,E,S,_),i&&(i.faceIndex=Math.floor(g/3),t.push(i))}}else if(l!==void 0)if(Array.isArray(a))for(let m=0,y=f.length;m<y;m++){let g=f[m],p=a[g.materialIndex],E=Math.max(g.start,d.start),S=Math.min(l.count,Math.min(g.start+g.count,d.start+d.count));for(let _=E,C=S;_<C;_+=3){let b=_,I=_+1,v=_+2;i=Ga(this,p,e,n,c,u,h,b,I,v),i&&(i.faceIndex=Math.floor(_/3),i.face.materialIndex=g.materialIndex,t.push(i))}}else{let m=Math.max(0,d.start),y=Math.min(l.count,d.start+d.count);for(let g=m,p=y;g<p;g+=3){let E=g,S=g+1,_=g+2;i=Ga(this,a,e,n,c,u,h,E,S,_),i&&(i.faceIndex=Math.floor(g/3),t.push(i))}}}};function Hd(s,e,t,n,i,r,a,o){let l;if(e.side===vn?l=n.intersectTriangle(a,r,i,!0,o):l=n.intersectTriangle(i,r,a,e.side===vi,o),l===null)return null;Va.copy(o),Va.applyMatrix4(s.matrixWorld);let c=t.ray.origin.distanceTo(Va);return c<t.near||c>t.far?null:{distance:c,point:Va.clone(),object:s}}function Ga(s,e,t,n,i,r,a,o,l,c){s.getVertexPosition(o,Ba),s.getVertexPosition(l,za),s.getVertexPosition(c,ka);let u=Hd(s,e,t,n,Ba,za,ka,zh);if(u){let h=new N;Oi.getBarycoord(zh,Ba,za,ka,h),i&&(u.uv=Oi.getInterpolatedAttribute(i,o,l,c,h,new Ke)),r&&(u.uv1=Oi.getInterpolatedAttribute(r,o,l,c,h,new Ke)),a&&(u.normal=Oi.getInterpolatedAttribute(a,o,l,c,h,new N),u.normal.dot(n.direction)>0&&u.normal.multiplyScalar(-1));let f={a:o,b:l,c,normal:new N,materialIndex:0};Oi.getNormal(Ba,za,ka,f.normal),u.face=f,u.barycoord=h}return u}var Sr=new dt,kh=new dt,Hh=new dt,Vd=new dt,Vh=new He,Wa=new N,tc=new _i,Gh=new He,nc=new Js,Ur=class extends pt{constructor(e,t){super(e,t),this.isSkinnedMesh=!0,this.type="SkinnedMesh",this.bindMode=ac,this.bindMatrix=new He,this.bindMatrixInverse=new He,this.boundingBox=null,this.boundingSphere=null}computeBoundingBox(){let e=this.geometry;this.boundingBox===null&&(this.boundingBox=new dn),this.boundingBox.makeEmpty();let t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,Wa),this.boundingBox.expandByPoint(Wa)}computeBoundingSphere(){let e=this.geometry;this.boundingSphere===null&&(this.boundingSphere=new _i),this.boundingSphere.makeEmpty();let t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,Wa),this.boundingSphere.expandByPoint(Wa)}copy(e,t){return super.copy(e,t),this.bindMode=e.bindMode,this.bindMatrix.copy(e.bindMatrix),this.bindMatrixInverse.copy(e.bindMatrixInverse),this.skeleton=e.skeleton,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}raycast(e,t){let n=this.material,i=this.matrixWorld;n!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),tc.copy(this.boundingSphere),tc.applyMatrix4(i),e.ray.intersectsSphere(tc)!==!1&&(Gh.copy(i).invert(),nc.copy(e.ray).applyMatrix4(Gh),!(this.boundingBox!==null&&nc.intersectsBox(this.boundingBox)===!1)&&this._computeIntersections(e,t,nc)))}getVertexPosition(e,t){return super.getVertexPosition(e,t),this.applyBoneTransform(e,t),t}bind(e,t){this.skeleton=e,t===void 0&&(this.updateMatrixWorld(!0),this.skeleton.calculateInverses(),t=this.matrixWorld),this.bindMatrix.copy(t),this.bindMatrixInverse.copy(t).invert()}pose(){this.skeleton.pose()}normalizeSkinWeights(){let e=new dt,t=this.geometry.attributes.skinWeight;for(let n=0,i=t.count;n<i;n++){e.fromBufferAttribute(t,n);let r=1/e.manhattanLength();r!==1/0?e.multiplyScalar(r):e.set(1,0,0,0),t.setXYZW(n,e.x,e.y,e.z,e.w)}}updateMatrixWorld(e){super.updateMatrixWorld(e),this.bindMode===ac?this.bindMatrixInverse.copy(this.matrixWorld).invert():this.bindMode===Tu?this.bindMatrixInverse.copy(this.bindMatrix).invert():ke("SkinnedMesh: Unrecognized bindMode: "+this.bindMode)}applyBoneTransform(e,t){let n=this.skeleton,i=this.geometry;kh.fromBufferAttribute(i.attributes.skinIndex,e),Hh.fromBufferAttribute(i.attributes.skinWeight,e),t.isVector4?(Sr.copy(t),t.set(0,0,0,0)):(Sr.set(...t,1),t.set(0,0,0)),Sr.applyMatrix4(this.bindMatrix);for(let r=0;r<4;r++){let a=Hh.getComponent(r);if(a!==0){let o=kh.getComponent(r);Vh.multiplyMatrices(n.bones[o].matrixWorld,n.boneInverses[o]),t.addScaledVector(Vd.copy(Sr).applyMatrix4(Vh),a)}}return t.isVector4&&(t.w=Sr.w),t.applyMatrix4(this.bindMatrixInverse)}},vs=class extends Ut{constructor(){super(),this.isBone=!0,this.type="Bone"}},Or=class extends ln{constructor(e=null,t=1,n=1,i,r,a,o,l,c=sn,u=sn,h,f){super(null,a,o,l,c,u,i,r,h,f),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}},Wh=new He,Gd=new He,Br=class s{constructor(e=[],t=[]){this.uuid=ji(),this.bones=e.slice(0),this.boneInverses=t,this.boneMatrices=null,this.boneTexture=null,this.init()}init(){let e=this.bones,t=this.boneInverses;if(this.boneMatrices=new Float32Array(e.length*16),t.length===0)this.calculateInverses();else if(e.length!==t.length){ke("Skeleton: Number of inverse bone matrices does not match amount of bones."),this.boneInverses=[];for(let n=0,i=this.bones.length;n<i;n++)this.boneInverses.push(new He)}}calculateInverses(){this.boneInverses.length=0;for(let e=0,t=this.bones.length;e<t;e++){let n=new He;this.bones[e]&&n.copy(this.bones[e].matrixWorld).invert(),this.boneInverses.push(n)}}pose(){for(let e=0,t=this.bones.length;e<t;e++){let n=this.bones[e];n&&n.matrixWorld.copy(this.boneInverses[e]).invert()}for(let e=0,t=this.bones.length;e<t;e++){let n=this.bones[e];n&&(n.parent&&n.parent.isBone?(n.matrix.copy(n.parent.matrixWorld).invert(),n.matrix.multiply(n.matrixWorld)):n.matrix.copy(n.matrixWorld),n.matrix.decompose(n.position,n.quaternion,n.scale))}}update(){let e=this.bones,t=this.boneInverses,n=this.boneMatrices,i=this.boneTexture;for(let r=0,a=e.length;r<a;r++){let o=e[r]?e[r].matrixWorld:Gd;Wh.multiplyMatrices(o,t[r]),Wh.toArray(n,r*16)}i!==null&&(i.needsUpdate=!0)}clone(){return new s(this.bones,this.boneInverses)}computeBoneTexture(){let e=Math.sqrt(this.bones.length*4);e=Math.ceil(e/4)*4,e=Math.max(e,4);let t=new Float32Array(e*e*4);t.set(this.boneMatrices);let n=new Or(t,e,e,Pn,Un);return n.needsUpdate=!0,this.boneMatrices=t,this.boneTexture=n,this}getBoneByName(e){for(let t=0,n=this.bones.length;t<n;t++){let i=this.bones[t];if(i.name===e)return i}}dispose(){this.boneTexture!==null&&(this.boneTexture.dispose(),this.boneTexture=null)}fromJSON(e,t){this.uuid=e.uuid;for(let n=0,i=e.bones.length;n<i;n++){let r=e.bones[n],a=t[r];a===void 0&&(ke("Skeleton: No bone found with UUID:",r),a=new vs),this.bones.push(a),this.boneInverses.push(new He().fromArray(e.boneInverses[n]))}return this.init(),this}toJSON(){let e={metadata:{version:4.7,type:"Skeleton",generator:"Skeleton.toJSON"},bones:[],boneInverses:[]};e.uuid=this.uuid;let t=this.bones,n=this.boneInverses;for(let i=0,r=t.length;i<r;i++){let a=t[i];e.bones.push(a.uuid);let o=n[i];e.boneInverses.push(o.toArray())}return e}};var ic=new N,Wd=new N,Xd=new Qe,ni=class{constructor(e=new N(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,i){return this.normal.set(e,t,n),this.constant=i,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){let i=ic.subVectors(n,t).cross(Wd.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(i,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t,n=!0){let i=e.delta(ic),r=this.normal.dot(i);if(r===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let a=-(e.start.dot(this.normal)+this.constant)/r;return n===!0&&(a<0||a>1)?null:t.copy(e.start).addScaledVector(i,a)}intersectsLine(e){let t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let n=t||Xd.getNormalMatrix(e),i=this.coplanarPoint(ic).applyMatrix4(e),r=this.normal.applyMatrix3(n).normalize();return this.constant=-i.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}},cs=new _i,qd=new Ke(.5,.5),Xa=new N,Qs=class{constructor(e=new ni,t=new ni,n=new ni,i=new ni,r=new ni,a=new ni){this.planes=[e,t,n,i,r,a]}set(e,t,n,i,r,a){let o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(n),o[3].copy(i),o[4].copy(r),o[5].copy(a),this}copy(e){let t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=Gn,n=!1){let i=this.planes,r=e.elements,a=r[0],o=r[1],l=r[2],c=r[3],u=r[4],h=r[5],f=r[6],d=r[7],m=r[8],y=r[9],g=r[10],p=r[11],E=r[12],S=r[13],_=r[14],C=r[15];if(i[0].setComponents(c-a,d-u,p-m,C-E).normalize(),i[1].setComponents(c+a,d+u,p+m,C+E).normalize(),i[2].setComponents(c+o,d+h,p+y,C+S).normalize(),i[3].setComponents(c-o,d-h,p-y,C-S).normalize(),n)i[4].setComponents(l,f,g,_).normalize(),i[5].setComponents(c-l,d-f,p-g,C-_).normalize();else if(i[4].setComponents(c-l,d-f,p-g,C-_).normalize(),t===Gn)i[5].setComponents(c+l,d+f,p+g,C+_).normalize();else if(t===qs)i[5].setComponents(l,f,g,_).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),cs.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),cs.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(cs)}intersectsSprite(e){cs.center.set(0,0,0);let t=qd.distanceTo(e.center);return cs.radius=.7071067811865476+t,cs.applyMatrix4(e.matrixWorld),this.intersectsSphere(cs)}intersectsSphere(e){let t=this.planes,n=e.center,i=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(n)<i)return!1;return!0}intersectsBox(e){let t=this.planes;for(let n=0;n<6;n++){let i=t[n];if(Xa.x=i.normal.x>0?e.max.x:e.min.x,Xa.y=i.normal.y>0?e.max.y:e.min.y,Xa.z=i.normal.z>0?e.max.z:e.min.z,i.distanceToPoint(Xa)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};var js=class extends Xn{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new Ve(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}},mo=new N,go=new N,Xh=new He,br=new Js,qa=new _i,sc=new N,qh=new N,zr=class extends Ut{constructor(e=new Wt,t=new js){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[0];for(let i=1,r=t.count;i<r;i++)mo.fromBufferAttribute(t,i-1),go.fromBufferAttribute(t,i),n[i]=n[i-1],n[i]+=mo.distanceTo(go);e.setAttribute("lineDistance",new ft(n,1))}else ke("Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(e,t){let n=this.geometry,i=this.matrixWorld,r=e.params.Line.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),qa.copy(n.boundingSphere),qa.applyMatrix4(i),qa.radius+=r,e.ray.intersectsSphere(qa)===!1)return;Xh.copy(i).invert(),br.copy(e.ray).applyMatrix4(Xh);let o=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=this.isLineSegments?2:1,u=n.index,f=n.attributes.position;if(u!==null){let d=Math.max(0,a.start),m=Math.min(u.count,a.start+a.count);for(let y=d,g=m-1;y<g;y+=c){let p=u.getX(y),E=u.getX(y+1),S=Ya(this,e,br,l,p,E,y);S&&t.push(S)}if(this.isLineLoop){let y=u.getX(m-1),g=u.getX(d),p=Ya(this,e,br,l,y,g,m-1);p&&t.push(p)}}else{let d=Math.max(0,a.start),m=Math.min(f.count,a.start+a.count);for(let y=d,g=m-1;y<g;y+=c){let p=Ya(this,e,br,l,y,y+1,y);p&&t.push(p)}if(this.isLineLoop){let y=Ya(this,e,br,l,m-1,d,m-1);y&&t.push(y)}}}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let i=t[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=i.length;r<a;r++){let o=i[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}};function Ya(s,e,t,n,i,r,a){let o=s.geometry.attributes.position;if(mo.fromBufferAttribute(o,i),go.fromBufferAttribute(o,r),t.distanceSqToSegment(mo,go,sc,qh)>n)return;sc.applyMatrix4(s.matrixWorld);let c=e.ray.origin.distanceTo(sc);if(!(c<e.near||c>e.far))return{distance:c,point:qh.clone().applyMatrix4(s.matrixWorld),index:a,face:null,faceIndex:null,barycoord:null,object:s}}var kr=class extends ln{constructor(e=[],t=$i,n,i,r,a,o,l,c,u){super(e,t,n,i,r,a,o,l,c,u),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}};var yi=class extends ln{constructor(e,t,n=Zn,i,r,a,o=sn,l=sn,c,u=si,h=1){if(u!==si&&u!==Ji)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let f={width:e,height:t,depth:h};super(f,i,r,a,o,l,u,n,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new $s(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}},xo=class extends yi{constructor(e,t=Zn,n=$i,i,r,a=sn,o=sn,l,c=si){let u={width:e,height:e,depth:1},h=[u,u,u,u,u,u];super(e,e,t,n,i,r,a,o,l,c),this.image=h,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}},Hr=class extends ln{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}},zi=class s extends Wt{constructor(e=1,t=1,n=1,i=1,r=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:i,heightSegments:r,depthSegments:a};let o=this;i=Math.floor(i),r=Math.floor(r),a=Math.floor(a);let l=[],c=[],u=[],h=[],f=0,d=0;m("z","y","x",-1,-1,n,t,e,a,r,0),m("z","y","x",1,-1,n,t,-e,a,r,1),m("x","z","y",1,1,e,n,t,i,a,2),m("x","z","y",1,-1,e,n,-t,i,a,3),m("x","y","z",1,-1,e,t,n,i,r,4),m("x","y","z",-1,-1,e,t,-n,i,r,5),this.setIndex(l),this.setAttribute("position",new ft(c,3)),this.setAttribute("normal",new ft(u,3)),this.setAttribute("uv",new ft(h,2));function m(y,g,p,E,S,_,C,b,I,v,T){let P=_/I,L=C/v,F=_/2,K=C/2,J=b/2,z=I+1,Q=v+1,$=0,se=0,oe=new N;for(let he=0;he<Q;he++){let fe=he*L-K;for(let Ae=0;Ae<z;Ae++){let st=Ae*P-F;oe[y]=st*E,oe[g]=fe*S,oe[p]=J,c.push(oe.x,oe.y,oe.z),oe[y]=0,oe[g]=0,oe[p]=b>0?1:-1,u.push(oe.x,oe.y,oe.z),h.push(Ae/I),h.push(1-he/v),$+=1}}for(let he=0;he<v;he++)for(let fe=0;fe<I;fe++){let Ae=f+fe+z*he,st=f+fe+z*(he+1),yt=f+(fe+1)+z*(he+1),rt=f+(fe+1)+z*he;l.push(Ae,st,rt),l.push(st,yt,rt),se+=6}o.addGroup(d,se,T),d+=se,f+=$}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new s(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}},er=class s extends Wt{constructor(e=1,t=1,n=4,i=8,r=1){super(),this.type="CapsuleGeometry",this.parameters={radius:e,height:t,capSegments:n,radialSegments:i,heightSegments:r},t=Math.max(0,t),n=Math.max(1,Math.floor(n)),i=Math.max(3,Math.floor(i)),r=Math.max(1,Math.floor(r));let a=[],o=[],l=[],c=[],u=t/2,h=Math.PI/2*e,f=t,d=2*h+f,m=n*2+r,y=i+1,g=new N,p=new N;for(let E=0;E<=m;E++){let S=0,_=0,C=0,b=0;if(E<=n){let T=E/n,P=T*Math.PI/2;_=-u-e*Math.cos(P),C=e*Math.sin(P),b=-e*Math.cos(P),S=T*h}else if(E<=n+r){let T=(E-n)/r;_=-u+T*t,C=e,b=0,S=h+T*f}else{let T=(E-n-r)/n,P=T*Math.PI/2;_=u+e*Math.sin(P),C=e*Math.cos(P),b=e*Math.sin(P),S=h+f+T*h}let I=Math.max(0,Math.min(1,S/d)),v=0;E===0?v=.5/i:E===m&&(v=-.5/i);for(let T=0;T<=i;T++){let P=T/i,L=P*Math.PI*2,F=Math.sin(L),K=Math.cos(L);p.x=-C*K,p.y=_,p.z=C*F,o.push(p.x,p.y,p.z),g.set(-C*K,b,C*F),g.normalize(),l.push(g.x,g.y,g.z),c.push(P+v,I)}if(E>0){let T=(E-1)*y;for(let P=0;P<i;P++){let L=T+P,F=T+P+1,K=E*y+P,J=E*y+P+1;a.push(L,F,K),a.push(F,J,K)}}}this.setIndex(a),this.setAttribute("position",new ft(o,3)),this.setAttribute("normal",new ft(l,3)),this.setAttribute("uv",new ft(c,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new s(e.radius,e.height,e.capSegments,e.radialSegments,e.heightSegments)}};var Tt=class s extends Wt{constructor(e=1,t=1,n=1,i=32,r=1,a=!1,o=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:i,heightSegments:r,openEnded:a,thetaStart:o,thetaLength:l};let c=this;i=Math.floor(i),r=Math.floor(r);let u=[],h=[],f=[],d=[],m=0,y=[],g=n/2,p=0;E(),a===!1&&(e>0&&S(!0),t>0&&S(!1)),this.setIndex(u),this.setAttribute("position",new ft(h,3)),this.setAttribute("normal",new ft(f,3)),this.setAttribute("uv",new ft(d,2));function E(){let _=new N,C=new N,b=0,I=(t-e)/n;for(let v=0;v<=r;v++){let T=[],P=v/r,L=P*(t-e)+e;for(let F=0;F<=i;F++){let K=F/i,J=K*l+o,z=Math.sin(J),Q=Math.cos(J);C.x=L*z,C.y=-P*n+g,C.z=L*Q,h.push(C.x,C.y,C.z),_.set(z,I,Q).normalize(),f.push(_.x,_.y,_.z),d.push(K,1-P),T.push(m++)}y.push(T)}for(let v=0;v<i;v++)for(let T=0;T<r;T++){let P=y[T][v],L=y[T+1][v],F=y[T+1][v+1],K=y[T][v+1];(e>0||T!==0)&&(u.push(P,L,K),b+=3),(t>0||T!==r-1)&&(u.push(L,F,K),b+=3)}c.addGroup(p,b,0),p+=b}function S(_){let C=m,b=new Ke,I=new N,v=0,T=_===!0?e:t,P=_===!0?1:-1;for(let F=1;F<=i;F++)h.push(0,g*P,0),f.push(0,P,0),d.push(.5,.5),m++;let L=m;for(let F=0;F<=i;F++){let J=F/i*l+o,z=Math.cos(J),Q=Math.sin(J);I.x=T*Q,I.y=g*P,I.z=T*z,h.push(I.x,I.y,I.z),f.push(0,P,0),b.x=z*.5+.5,b.y=Q*.5*P+.5,d.push(b.x,b.y),m++}for(let F=0;F<i;F++){let K=C+F,J=L+F;_===!0?u.push(J,J+1,K):u.push(J+1,J,K),v+=3}c.addGroup(p,v,_===!0?1:2),p+=v}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new s(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}},ri=class s extends Tt{constructor(e=1,t=1,n=32,i=1,r=!1,a=0,o=Math.PI*2){super(0,e,t,n,i,r,a,o),this.type="ConeGeometry",this.parameters={radius:e,height:t,radialSegments:n,heightSegments:i,openEnded:r,thetaStart:a,thetaLength:o}}static fromJSON(e){return new s(e.radius,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}},_s=class s extends Wt{constructor(e=[],t=[],n=1,i=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:e,indices:t,radius:n,detail:i};let r=[],a=[];o(i),c(n),u(),this.setAttribute("position",new ft(r,3)),this.setAttribute("normal",new ft(r.slice(),3)),this.setAttribute("uv",new ft(a,2)),i===0?this.computeVertexNormals():this.normalizeNormals();function o(E){let S=new N,_=new N,C=new N;for(let b=0;b<t.length;b+=3)d(t[b+0],S),d(t[b+1],_),d(t[b+2],C),l(S,_,C,E)}function l(E,S,_,C){let b=C+1,I=[];for(let v=0;v<=b;v++){I[v]=[];let T=E.clone().lerp(_,v/b),P=S.clone().lerp(_,v/b),L=b-v;for(let F=0;F<=L;F++)F===0&&v===b?I[v][F]=T:I[v][F]=T.clone().lerp(P,F/L)}for(let v=0;v<b;v++)for(let T=0;T<2*(b-v)-1;T++){let P=Math.floor(T/2);T%2===0?(f(I[v][P+1]),f(I[v+1][P]),f(I[v][P])):(f(I[v][P+1]),f(I[v+1][P+1]),f(I[v+1][P]))}}function c(E){let S=new N;for(let _=0;_<r.length;_+=3)S.x=r[_+0],S.y=r[_+1],S.z=r[_+2],S.normalize().multiplyScalar(E),r[_+0]=S.x,r[_+1]=S.y,r[_+2]=S.z}function u(){let E=new N;for(let S=0;S<r.length;S+=3){E.x=r[S+0],E.y=r[S+1],E.z=r[S+2];let _=g(E)/2/Math.PI+.5,C=p(E)/Math.PI+.5;a.push(_,1-C)}m(),h()}function h(){for(let E=0;E<a.length;E+=6){let S=a[E+0],_=a[E+2],C=a[E+4],b=Math.max(S,_,C),I=Math.min(S,_,C);b>.9&&I<.1&&(S<.2&&(a[E+0]+=1),_<.2&&(a[E+2]+=1),C<.2&&(a[E+4]+=1))}}function f(E){r.push(E.x,E.y,E.z)}function d(E,S){let _=E*3;S.x=e[_+0],S.y=e[_+1],S.z=e[_+2]}function m(){let E=new N,S=new N,_=new N,C=new N,b=new Ke,I=new Ke,v=new Ke;for(let T=0,P=0;T<r.length;T+=9,P+=6){E.set(r[T+0],r[T+1],r[T+2]),S.set(r[T+3],r[T+4],r[T+5]),_.set(r[T+6],r[T+7],r[T+8]),b.set(a[P+0],a[P+1]),I.set(a[P+2],a[P+3]),v.set(a[P+4],a[P+5]),C.copy(E).add(S).add(_).divideScalar(3);let L=g(C);y(b,P+0,E,L),y(I,P+2,S,L),y(v,P+4,_,L)}}function y(E,S,_,C){C<0&&E.x===1&&(a[S]=E.x-1),_.x===0&&_.z===0&&(a[S]=C/2/Math.PI+.5)}function g(E){return Math.atan2(E.z,-E.x)}function p(E){return Math.atan2(-E.y,Math.sqrt(E.x*E.x+E.z*E.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new s(e.vertices,e.indices,e.radius,e.detail)}},tr=class s extends _s{constructor(e=1,t=0){let n=(1+Math.sqrt(5))/2,i=1/n,r=[-1,-1,-1,-1,-1,1,-1,1,-1,-1,1,1,1,-1,-1,1,-1,1,1,1,-1,1,1,1,0,-i,-n,0,-i,n,0,i,-n,0,i,n,-i,-n,0,-i,n,0,i,-n,0,i,n,0,-n,0,-i,n,0,-i,-n,0,i,n,0,i],a=[3,11,7,3,7,15,3,15,13,7,19,17,7,17,6,7,6,15,17,4,8,17,8,10,17,10,6,8,0,16,8,16,2,8,2,10,0,12,1,0,1,18,0,18,16,6,10,2,6,2,13,6,13,15,2,16,18,2,18,3,2,3,13,18,1,9,18,9,11,18,11,3,4,14,12,4,12,0,4,0,8,11,9,5,11,5,19,11,19,7,19,5,14,19,14,4,19,4,17,1,12,14,1,14,5,1,5,9];super(r,a,e,t),this.type="DodecahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new s(e.radius,e.detail)}};var Vr=class{constructor(){this.type="Curve",this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){ke("Curve: .getPoint() not implemented.")}getPointAt(e,t){let n=this.getUtoTmapping(e);return this.getPoint(n,t)}getPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return t}getSpacedPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPointAt(n/e));return t}getLength(){let e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let t=[],n,i=this.getPoint(0),r=0;t.push(0);for(let a=1;a<=e;a++)n=this.getPoint(a/e),r+=n.distanceTo(i),t.push(r),i=n;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t=null){let n=this.getLengths(),i=0,r=n.length,a;t?a=t:a=e*n[r-1];let o=0,l=r-1,c;for(;o<=l;)if(i=Math.floor(o+(l-o)/2),c=n[i]-a,c<0)o=i+1;else if(c>0)l=i-1;else{l=i;break}if(i=l,n[i]===a)return i/(r-1);let u=n[i],f=n[i+1]-u,d=(a-u)/f;return(i+d)/(r-1)}getTangent(e,t){let i=e-1e-4,r=e+1e-4;i<0&&(i=0),r>1&&(r=1);let a=this.getPoint(i),o=this.getPoint(r),l=t||(a.isVector2?new Ke:new N);return l.copy(o).sub(a).normalize(),l}getTangentAt(e,t){let n=this.getUtoTmapping(e);return this.getTangent(n,t)}computeFrenetFrames(e,t=!1){let n=new N,i=[],r=[],a=[],o=new N,l=new He;for(let d=0;d<=e;d++){let m=d/e;i[d]=this.getTangentAt(m,new N)}r[0]=new N,a[0]=new N;let c=Number.MAX_VALUE,u=Math.abs(i[0].x),h=Math.abs(i[0].y),f=Math.abs(i[0].z);u<=c&&(c=u,n.set(1,0,0)),h<=c&&(c=h,n.set(0,1,0)),f<=c&&n.set(0,0,1),o.crossVectors(i[0],n).normalize(),r[0].crossVectors(i[0],o),a[0].crossVectors(i[0],r[0]);for(let d=1;d<=e;d++){if(r[d]=r[d-1].clone(),a[d]=a[d-1].clone(),o.crossVectors(i[d-1],i[d]),o.length()>Number.EPSILON){o.normalize();let m=Math.acos(ut(i[d-1].dot(i[d]),-1,1));r[d].applyMatrix4(l.makeRotationAxis(o,m))}a[d].crossVectors(i[d],r[d])}if(t===!0){let d=Math.acos(ut(r[0].dot(r[e]),-1,1));d/=e,i[0].dot(o.crossVectors(r[0],r[e]))>0&&(d=-d);for(let m=1;m<=e;m++)r[m].applyMatrix4(l.makeRotationAxis(i[m],d*m)),a[m].crossVectors(i[m],r[m])}return{tangents:i,normals:r,binormals:a}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){let e={metadata:{version:4.7,type:"Curve",generator:"Curve.toJSON"}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}};function Yd(s,e,t=2){let n=e&&e.length,i=n?e[0]*t:s.length,r=Vu(s,0,i,t,!0),a=[];if(!r||r.next===r.prev)return a;let o,l,c;if(n&&(r=Qd(s,e,r,t)),s.length>80*t){o=s[0],l=s[1];let u=o,h=l;for(let f=t;f<i;f+=t){let d=s[f],m=s[f+1];d<o&&(o=d),m<l&&(l=m),d>u&&(u=d),m>h&&(h=m)}c=Math.max(u-o,h-l),c=c!==0?32767/c:0}return Gr(r,a,t,o,l,c,0),a}function Vu(s,e,t,n,i){let r;if(i===cp(s,e,t,n)>0)for(let a=e;a<t;a+=n)r=Yh(a/n|0,s[a],s[a+1],r);else for(let a=t-n;a>=e;a-=n)r=Yh(a/n|0,s[a],s[a+1],r);return r&&nr(r,r.next)&&(Xr(r),r=r.next),r}function ys(s,e){if(!s)return s;e||(e=s);let t=s,n;do if(n=!1,!t.steiner&&(nr(t,t.next)||Vt(t.prev,t,t.next)===0)){if(Xr(t),t=e=t.prev,t===t.next)break;n=!0}else t=t.next;while(n||t!==e);return e}function Gr(s,e,t,n,i,r,a){if(!s)return;!a&&r&&ip(s,n,i,r);let o=s;for(;s.prev!==s.next;){let l=s.prev,c=s.next;if(r?$d(s,n,i,r):Zd(s)){e.push(l.i,s.i,c.i),Xr(s),s=c.next,o=c.next;continue}if(s=c,s===o){a?a===1?(s=Kd(ys(s),e),Gr(s,e,t,n,i,r,2)):a===2&&Jd(s,e,t,n,i,r):Gr(ys(s),e,t,n,i,r,1);break}}}function Zd(s){let e=s.prev,t=s,n=s.next;if(Vt(e,t,n)>=0)return!1;let i=e.x,r=t.x,a=n.x,o=e.y,l=t.y,c=n.y,u=Math.min(i,r,a),h=Math.min(o,l,c),f=Math.max(i,r,a),d=Math.max(o,l,c),m=n.next;for(;m!==e;){if(m.x>=u&&m.x<=f&&m.y>=h&&m.y<=d&&Er(i,o,r,l,a,c,m.x,m.y)&&Vt(m.prev,m,m.next)>=0)return!1;m=m.next}return!0}function $d(s,e,t,n){let i=s.prev,r=s,a=s.next;if(Vt(i,r,a)>=0)return!1;let o=i.x,l=r.x,c=a.x,u=i.y,h=r.y,f=a.y,d=Math.min(o,l,c),m=Math.min(u,h,f),y=Math.max(o,l,c),g=Math.max(u,h,f),p=hc(d,m,e,t,n),E=hc(y,g,e,t,n),S=s.prevZ,_=s.nextZ;for(;S&&S.z>=p&&_&&_.z<=E;){if(S.x>=d&&S.x<=y&&S.y>=m&&S.y<=g&&S!==i&&S!==a&&Er(o,u,l,h,c,f,S.x,S.y)&&Vt(S.prev,S,S.next)>=0||(S=S.prevZ,_.x>=d&&_.x<=y&&_.y>=m&&_.y<=g&&_!==i&&_!==a&&Er(o,u,l,h,c,f,_.x,_.y)&&Vt(_.prev,_,_.next)>=0))return!1;_=_.nextZ}for(;S&&S.z>=p;){if(S.x>=d&&S.x<=y&&S.y>=m&&S.y<=g&&S!==i&&S!==a&&Er(o,u,l,h,c,f,S.x,S.y)&&Vt(S.prev,S,S.next)>=0)return!1;S=S.prevZ}for(;_&&_.z<=E;){if(_.x>=d&&_.x<=y&&_.y>=m&&_.y<=g&&_!==i&&_!==a&&Er(o,u,l,h,c,f,_.x,_.y)&&Vt(_.prev,_,_.next)>=0)return!1;_=_.nextZ}return!0}function Kd(s,e){let t=s;do{let n=t.prev,i=t.next.next;!nr(n,i)&&Wu(n,t,t.next,i)&&Wr(n,i)&&Wr(i,n)&&(e.push(n.i,t.i,i.i),Xr(t),Xr(t.next),t=s=i),t=t.next}while(t!==s);return ys(t)}function Jd(s,e,t,n,i,r){let a=s;do{let o=a.next.next;for(;o!==a.prev;){if(a.i!==o.i&&ap(a,o)){let l=Xu(a,o);a=ys(a,a.next),l=ys(l,l.next),Gr(a,e,t,n,i,r,0),Gr(l,e,t,n,i,r,0);return}o=o.next}a=a.next}while(a!==s)}function Qd(s,e,t,n){let i=[];for(let r=0,a=e.length;r<a;r++){let o=e[r]*n,l=r<a-1?e[r+1]*n:s.length,c=Vu(s,o,l,n,!1);c===c.next&&(c.steiner=!0),i.push(rp(c))}i.sort(jd);for(let r=0;r<i.length;r++)t=ep(i[r],t);return t}function jd(s,e){let t=s.x-e.x;if(t===0&&(t=s.y-e.y,t===0)){let n=(s.next.y-s.y)/(s.next.x-s.x),i=(e.next.y-e.y)/(e.next.x-e.x);t=n-i}return t}function ep(s,e){let t=tp(s,e);if(!t)return e;let n=Xu(t,s);return ys(n,n.next),ys(t,t.next)}function tp(s,e){let t=e,n=s.x,i=s.y,r=-1/0,a;if(nr(s,t))return t;do{if(nr(s,t.next))return t.next;if(i<=t.y&&i>=t.next.y&&t.next.y!==t.y){let h=t.x+(i-t.y)*(t.next.x-t.x)/(t.next.y-t.y);if(h<=n&&h>r&&(r=h,a=t.x<t.next.x?t:t.next,h===n))return a}t=t.next}while(t!==e);if(!a)return null;let o=a,l=a.x,c=a.y,u=1/0;t=a;do{if(n>=t.x&&t.x>=l&&n!==t.x&&Gu(i<c?n:r,i,l,c,i<c?r:n,i,t.x,t.y)){let h=Math.abs(i-t.y)/(n-t.x);Wr(t,s)&&(h<u||h===u&&(t.x>a.x||t.x===a.x&&np(a,t)))&&(a=t,u=h)}t=t.next}while(t!==o);return a}function np(s,e){return Vt(s.prev,s,e.prev)<0&&Vt(e.next,s,s.next)<0}function ip(s,e,t,n){let i=s;do i.z===0&&(i.z=hc(i.x,i.y,e,t,n)),i.prevZ=i.prev,i.nextZ=i.next,i=i.next;while(i!==s);i.prevZ.nextZ=null,i.prevZ=null,sp(i)}function sp(s){let e,t=1;do{let n=s,i;s=null;let r=null;for(e=0;n;){e++;let a=n,o=0;for(let c=0;c<t&&(o++,a=a.nextZ,!!a);c++);let l=t;for(;o>0||l>0&&a;)o!==0&&(l===0||!a||n.z<=a.z)?(i=n,n=n.nextZ,o--):(i=a,a=a.nextZ,l--),r?r.nextZ=i:s=i,i.prevZ=r,r=i;n=a}r.nextZ=null,t*=2}while(e>1);return s}function hc(s,e,t,n,i){return s=(s-t)*i|0,e=(e-n)*i|0,s=(s|s<<8)&16711935,s=(s|s<<4)&252645135,s=(s|s<<2)&858993459,s=(s|s<<1)&1431655765,e=(e|e<<8)&16711935,e=(e|e<<4)&252645135,e=(e|e<<2)&858993459,e=(e|e<<1)&1431655765,s|e<<1}function rp(s){let e=s,t=s;do(e.x<t.x||e.x===t.x&&e.y<t.y)&&(t=e),e=e.next;while(e!==s);return t}function Gu(s,e,t,n,i,r,a,o){return(i-a)*(e-o)>=(s-a)*(r-o)&&(s-a)*(n-o)>=(t-a)*(e-o)&&(t-a)*(r-o)>=(i-a)*(n-o)}function Er(s,e,t,n,i,r,a,o){return!(s===a&&e===o)&&Gu(s,e,t,n,i,r,a,o)}function ap(s,e){return s.next.i!==e.i&&s.prev.i!==e.i&&!op(s,e)&&(Wr(s,e)&&Wr(e,s)&&lp(s,e)&&(Vt(s.prev,s,e.prev)||Vt(s,e.prev,e))||nr(s,e)&&Vt(s.prev,s,s.next)>0&&Vt(e.prev,e,e.next)>0)}function Vt(s,e,t){return(e.y-s.y)*(t.x-e.x)-(e.x-s.x)*(t.y-e.y)}function nr(s,e){return s.x===e.x&&s.y===e.y}function Wu(s,e,t,n){let i=$a(Vt(s,e,t)),r=$a(Vt(s,e,n)),a=$a(Vt(t,n,s)),o=$a(Vt(t,n,e));return!!(i!==r&&a!==o||i===0&&Za(s,t,e)||r===0&&Za(s,n,e)||a===0&&Za(t,s,n)||o===0&&Za(t,e,n))}function Za(s,e,t){return e.x<=Math.max(s.x,t.x)&&e.x>=Math.min(s.x,t.x)&&e.y<=Math.max(s.y,t.y)&&e.y>=Math.min(s.y,t.y)}function $a(s){return s>0?1:s<0?-1:0}function op(s,e){let t=s;do{if(t.i!==s.i&&t.next.i!==s.i&&t.i!==e.i&&t.next.i!==e.i&&Wu(t,t.next,s,e))return!0;t=t.next}while(t!==s);return!1}function Wr(s,e){return Vt(s.prev,s,s.next)<0?Vt(s,e,s.next)>=0&&Vt(s,s.prev,e)>=0:Vt(s,e,s.prev)<0||Vt(s,s.next,e)<0}function lp(s,e){let t=s,n=!1,i=(s.x+e.x)/2,r=(s.y+e.y)/2;do t.y>r!=t.next.y>r&&t.next.y!==t.y&&i<(t.next.x-t.x)*(r-t.y)/(t.next.y-t.y)+t.x&&(n=!n),t=t.next;while(t!==s);return n}function Xu(s,e){let t=uc(s.i,s.x,s.y),n=uc(e.i,e.x,e.y),i=s.next,r=e.prev;return s.next=e,e.prev=s,t.next=i,i.prev=t,n.next=t,t.prev=n,r.next=n,n.prev=r,n}function Yh(s,e,t,n){let i=uc(s,e,t);return n?(i.next=n.next,i.prev=n,n.next.prev=i,n.next=i):(i.prev=i,i.next=i),i}function Xr(s){s.next.prev=s.prev,s.prev.next=s.next,s.prevZ&&(s.prevZ.nextZ=s.nextZ),s.nextZ&&(s.nextZ.prevZ=s.prevZ)}function uc(s,e,t){return{i:s,x:e,y:t,prev:null,next:null,z:0,prevZ:null,nextZ:null,steiner:!1}}function cp(s,e,t,n){let i=0;for(let r=e,a=t-n;r<t;r+=n)i+=(s[a]-s[r])*(s[r+1]+s[a+1]),a=r;return i}var fc=class{static triangulate(e,t,n=2){return Yd(e,t,n)}},qr=class s{static area(e){let t=e.length,n=0;for(let i=t-1,r=0;r<t;i=r++)n+=e[i].x*e[r].y-e[r].x*e[i].y;return n*.5}static isClockWise(e){return s.area(e)<0}static triangulateShape(e,t){let n=[],i=[],r=[];Zh(e),$h(n,e);let a=e.length;t.forEach(Zh);for(let l=0;l<t.length;l++)i.push(a),a+=t[l].length,$h(n,t[l]);let o=fc.triangulate(n,i);for(let l=0;l<o.length;l+=3)r.push(o.slice(l,l+3));return r}};function Zh(s){let e=s.length;e>2&&s[e-1].equals(s[0])&&s.pop()}function $h(s,e){for(let t=0;t<e.length;t++)s.push(e[t].x),s.push(e[t].y)}var ki=class s extends _s{constructor(e=1,t=0){let n=(1+Math.sqrt(5))/2,i=[-1,n,0,1,n,0,-1,-n,0,1,-n,0,0,-1,n,0,1,n,0,-1,-n,0,1,-n,n,0,-1,n,0,1,-n,0,-1,-n,0,1],r=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(i,r,e,t),this.type="IcosahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new s(e.radius,e.detail)}};var Yr=class s extends _s{constructor(e=1,t=0){let n=[1,0,0,-1,0,0,0,1,0,0,-1,0,0,0,1,0,0,-1],i=[0,2,4,0,4,3,0,3,5,0,5,2,1,2,5,1,5,3,1,3,4,1,4,2];super(n,i,e,t),this.type="OctahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new s(e.radius,e.detail)}},ai=class s extends Wt{constructor(e=1,t=1,n=1,i=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:i};let r=e/2,a=t/2,o=Math.floor(n),l=Math.floor(i),c=o+1,u=l+1,h=e/o,f=t/l,d=[],m=[],y=[],g=[];for(let p=0;p<u;p++){let E=p*f-a;for(let S=0;S<c;S++){let _=S*h-r;m.push(_,-E,0),y.push(0,0,1),g.push(S/o),g.push(1-p/l)}}for(let p=0;p<l;p++)for(let E=0;E<o;E++){let S=E+c*p,_=E+c*(p+1),C=E+1+c*(p+1),b=E+1+c*p;d.push(S,_,b),d.push(_,C,b)}this.setIndex(d),this.setAttribute("position",new ft(m,3)),this.setAttribute("normal",new ft(y,3)),this.setAttribute("uv",new ft(g,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new s(e.width,e.height,e.widthSegments,e.heightSegments)}},Zr=class s extends Wt{constructor(e=.5,t=1,n=32,i=1,r=0,a=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:e,outerRadius:t,thetaSegments:n,phiSegments:i,thetaStart:r,thetaLength:a},n=Math.max(3,n),i=Math.max(1,i);let o=[],l=[],c=[],u=[],h=e,f=(t-e)/i,d=new N,m=new Ke;for(let y=0;y<=i;y++){for(let g=0;g<=n;g++){let p=r+g/n*a;d.x=h*Math.cos(p),d.y=h*Math.sin(p),l.push(d.x,d.y,d.z),c.push(0,0,1),m.x=(d.x/t+1)/2,m.y=(d.y/t+1)/2,u.push(m.x,m.y)}h+=f}for(let y=0;y<i;y++){let g=y*(n+1);for(let p=0;p<n;p++){let E=p+g,S=E,_=E+n+1,C=E+n+2,b=E+1;o.push(S,_,b),o.push(_,C,b)}}this.setIndex(o),this.setAttribute("position",new ft(l,3)),this.setAttribute("normal",new ft(c,3)),this.setAttribute("uv",new ft(u,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new s(e.innerRadius,e.outerRadius,e.thetaSegments,e.phiSegments,e.thetaStart,e.thetaLength)}};var Kt=class s extends Wt{constructor(e=1,t=32,n=16,i=0,r=Math.PI*2,a=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:i,phiLength:r,thetaStart:a,thetaLength:o},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));let l=Math.min(a+o,Math.PI),c=0,u=[],h=new N,f=new N,d=[],m=[],y=[],g=[];for(let p=0;p<=n;p++){let E=[],S=p/n,_=a+S*o,C=e*Math.cos(_),b=Math.sqrt(e*e-C*C),I=0;p===0&&a===0?I=.5/t:p===n&&l===Math.PI&&(I=-.5/t);for(let v=0;v<=t;v++){let T=v/t,P=i+T*r;h.x=-b*Math.cos(P),h.y=C,h.z=b*Math.sin(P),m.push(h.x,h.y,h.z),f.copy(h).normalize(),y.push(f.x,f.y,f.z),g.push(T+I,1-S),E.push(c++)}u.push(E)}for(let p=0;p<n;p++)for(let E=0;E<t;E++){let S=u[p][E+1],_=u[p][E],C=u[p+1][E],b=u[p+1][E+1];(p!==0||a>0)&&d.push(S,_,b),(p!==n-1||l<Math.PI)&&d.push(_,C,b)}this.setIndex(d),this.setAttribute("position",new ft(m,3)),this.setAttribute("normal",new ft(y,3)),this.setAttribute("uv",new ft(g,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new s(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}},$r=class s extends _s{constructor(e=1,t=0){let n=[1,1,1,-1,-1,1,-1,1,-1,1,-1,-1],i=[2,1,0,0,3,2,1,3,0,2,3,1];super(n,i,e,t),this.type="TetrahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new s(e.radius,e.detail)}},Nn=class s extends Wt{constructor(e=1,t=.4,n=12,i=48,r=Math.PI*2,a=0,o=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:e,tube:t,radialSegments:n,tubularSegments:i,arc:r,thetaStart:a,thetaLength:o},n=Math.floor(n),i=Math.floor(i);let l=[],c=[],u=[],h=[],f=new N,d=new N,m=new N;for(let y=0;y<=n;y++){let g=a+y/n*o;for(let p=0;p<=i;p++){let E=p/i*r;d.x=(e+t*Math.cos(g))*Math.cos(E),d.y=(e+t*Math.cos(g))*Math.sin(E),d.z=t*Math.sin(g),c.push(d.x,d.y,d.z),f.x=e*Math.cos(E),f.y=e*Math.sin(E),m.subVectors(d,f).normalize(),u.push(m.x,m.y,m.z),h.push(p/i),h.push(y/n)}}for(let y=1;y<=n;y++)for(let g=1;g<=i;g++){let p=(i+1)*y+g-1,E=(i+1)*(y-1)+g-1,S=(i+1)*(y-1)+g,_=(i+1)*y+g;l.push(p,E,_),l.push(E,S,_)}this.setIndex(l),this.setAttribute("position",new ft(c,3)),this.setAttribute("normal",new ft(u,3)),this.setAttribute("uv",new ft(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new s(e.radius,e.tube,e.radialSegments,e.tubularSegments,e.arc)}};function Es(s){let e={};for(let t in s){e[t]={};for(let n in s[t]){let i=s[t][n];if(Kh(i))i.isRenderTargetTexture?(ke("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=i.clone();else if(Array.isArray(i))if(Kh(i[0])){let r=[];for(let a=0,o=i.length;a<o;a++)r[a]=i[a].clone();e[t][n]=r}else e[t][n]=i.slice();else e[t][n]=i}}return e}function pn(s){let e={};for(let t=0;t<s.length;t++){let n=Es(s[t]);for(let i in n)e[i]=n[i]}return e}function Kh(s){return s&&(s.isColor||s.isMatrix3||s.isMatrix4||s.isVector2||s.isVector3||s.isVector4||s.isTexture||s.isQuaternion)}function hp(s){let e=[];for(let t=0;t<s.length;t++)e.push(s[t].clone());return e}function zc(s){let e=s.getRenderTarget();return e===null?s.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:et.workingColorSpace}var qu={clone:Es,merge:pn},up=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,fp=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,In=class extends Xn{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=up,this.fragmentShader=fp,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Es(e.uniforms),this.uniformsGroups=hp(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let i in this.uniforms){let a=this.uniforms[i].value;a&&a.isTexture?t.uniforms[i]={type:"t",value:a.toJSON(e).uuid}:a&&a.isColor?t.uniforms[i]={type:"c",value:a.getHex()}:a&&a.isVector2?t.uniforms[i]={type:"v2",value:a.toArray()}:a&&a.isVector3?t.uniforms[i]={type:"v3",value:a.toArray()}:a&&a.isVector4?t.uniforms[i]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?t.uniforms[i]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?t.uniforms[i]={type:"m4",value:a.toArray()}:t.uniforms[i]={value:a}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let n={};for(let i in this.extensions)this.extensions[i]===!0&&(n[i]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}fromJSON(e,t){if(super.fromJSON(e,t),e.uniforms!==void 0)for(let n in e.uniforms){let i=e.uniforms[n];switch(this.uniforms[n]={},i.type){case"t":this.uniforms[n].value=t[i.value]||null;break;case"c":this.uniforms[n].value=new Ve().setHex(i.value);break;case"v2":this.uniforms[n].value=new Ke().fromArray(i.value);break;case"v3":this.uniforms[n].value=new N().fromArray(i.value);break;case"v4":this.uniforms[n].value=new dt().fromArray(i.value);break;case"m3":this.uniforms[n].value=new Qe().fromArray(i.value);break;case"m4":this.uniforms[n].value=new He().fromArray(i.value);break;default:this.uniforms[n].value=i.value}}if(e.defines!==void 0&&(this.defines=e.defines),e.vertexShader!==void 0&&(this.vertexShader=e.vertexShader),e.fragmentShader!==void 0&&(this.fragmentShader=e.fragmentShader),e.glslVersion!==void 0&&(this.glslVersion=e.glslVersion),e.extensions!==void 0)for(let n in e.extensions)this.extensions[n]=e.extensions[n];return e.lights!==void 0&&(this.lights=e.lights),e.clipping!==void 0&&(this.clipping=e.clipping),this}},vo=class extends In{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}},Hi=class extends Xn{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new Ve(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ve(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=cr,this.normalScale=new Ke(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new $t,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}};var Vi=class extends Xn{constructor(e){super(),this.isMeshPhongMaterial=!0,this.type="MeshPhongMaterial",this.color=new Ve(16777215),this.specular=new Ve(1118481),this.shininess=30,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ve(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=cr,this.normalScale=new Ke(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new $t,this.combine=la,this.reflectivity=1,this.envMapIntensity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.specular.copy(e.specular),this.shininess=e.shininess,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.envMapIntensity=e.envMapIntensity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}};var Kr=class extends Xn{constructor(e){super(),this.isMeshLambertMaterial=!0,this.type="MeshLambertMaterial",this.color=new Ve(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ve(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=cr,this.normalScale=new Ke(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new $t,this.combine=la,this.reflectivity=1,this.envMapIntensity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.envMapIntensity=e.envMapIntensity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},_o=class extends Xn{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Ru,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},yo=class extends Xn{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};function Ka(s,e){return!s||s.constructor===e?s:typeof e.BYTES_PER_ELEMENT=="number"?new e(s):Array.prototype.slice.call(s)}function dp(s){function e(i,r){return s[i]-s[r]}let t=s.length,n=new Array(t);for(let i=0;i!==t;++i)n[i]=i;return n.sort(e),n}function Jh(s,e,t){let n=s.length,i=new s.constructor(n);for(let r=0,a=0;a!==n;++r){let o=t[r]*e;for(let l=0;l!==e;++l)i[a++]=s[o+l]}return i}function pp(s,e,t,n){let i=1,r=s[0];for(;r!==void 0&&r[n]===void 0;)r=s[i++];if(r===void 0)return;let a=r[n];if(a!==void 0)if(Array.isArray(a))do a=r[n],a!==void 0&&(e.push(r.time),t.push(...a)),r=s[i++];while(r!==void 0);else if(a.toArray!==void 0)do a=r[n],a!==void 0&&(e.push(r.time),a.toArray(t,t.length)),r=s[i++];while(r!==void 0);else do a=r[n],a!==void 0&&(e.push(r.time),t.push(a)),r=s[i++];while(r!==void 0)}var Gi=class{constructor(e,t,n,i){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=i!==void 0?i:new t.constructor(n),this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,n=this._cachedIndex,i=t[n],r=t[n-1];e:{t:{let a;n:{i:if(!(e<i)){for(let o=n+2;;){if(i===void 0){if(e<r)break i;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===o)break;if(r=i,i=t[++n],e<i)break t}a=t.length;break n}if(!(e>=r)){let o=t[1];e<o&&(n=2,r=o);for(let l=n-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===l)break;if(i=r,r=t[--n-1],e>=r)break t}a=n,n=0;break n}break e}for(;n<a;){let o=n+a>>>1;e<t[o]?a=o:n=o+1}if(i=t[n],r=t[n-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,r,i)}return this.interpolate_(n,r,e,i)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,i=this.valueSize,r=e*i;for(let a=0;a!==i;++a)t[a]=n[r+a];return t}interpolate_(){throw new Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}},Mo=class extends Gi{constructor(e,t,n,i){super(e,t,n,i),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:us,endingEnd:us}}intervalChanged_(e,t,n){let i=this.parameterPositions,r=e-2,a=e+1,o=i[r],l=i[a];if(o===void 0)switch(this.getSettings_().endingStart){case fs:r=e,o=2*t-n;break;case Cr:r=i.length-2,o=t+i[r]-i[r+1];break;default:r=e,o=n}if(l===void 0)switch(this.getSettings_().endingEnd){case fs:a=e,l=2*n-t;break;case Cr:a=1,l=n+i[1]-i[0];break;default:a=e-1,l=t}let c=(n-t)*.5,u=this.valueSize;this._weightPrev=c/(t-o),this._weightNext=c/(l-n),this._offsetPrev=r*u,this._offsetNext=a*u}interpolate_(e,t,n,i){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=e*o,c=l-o,u=this._offsetPrev,h=this._offsetNext,f=this._weightPrev,d=this._weightNext,m=(n-t)/(i-t),y=m*m,g=y*m,p=-f*g+2*f*y-f*m,E=(1+f)*g+(-1.5-2*f)*y+(-.5+f)*m+1,S=(-1-d)*g+(1.5+d)*y+.5*m,_=d*g-d*y;for(let C=0;C!==o;++C)r[C]=p*a[u+C]+E*a[c+C]+S*a[l+C]+_*a[h+C];return r}},Jr=class extends Gi{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e,t,n,i){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=e*o,c=l-o,u=(n-t)/(i-t),h=1-u;for(let f=0;f!==o;++f)r[f]=a[c+f]*h+a[l+f]*u;return r}},So=class extends Gi{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e){return this.copySampleValue_(e-1)}},bo=class extends Gi{interpolate_(e,t,n,i){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=e*o,c=l-o,u=this.inTangents,h=this.outTangents;if(!u||!h){let m=(n-t)/(i-t),y=1-m;for(let g=0;g!==o;++g)r[g]=a[c+g]*y+a[l+g]*m;return r}let f=o*2,d=e-1;for(let m=0;m!==o;++m){let y=a[c+m],g=a[l+m],p=d*f+m*2,E=h[p],S=h[p+1],_=e*f+m*2,C=u[_],b=u[_+1],I=(n-t)/(i-t),v,T,P,L,F;for(let K=0;K<8;K++){v=I*I,T=v*I,P=1-I,L=P*P,F=L*P;let z=F*t+3*L*I*E+3*P*v*C+T*i-n;if(Math.abs(z)<1e-10)break;let Q=3*L*(E-t)+6*P*I*(C-E)+3*v*(i-C);if(Math.abs(Q)<1e-10)break;I=I-z/Q,I=Math.max(0,Math.min(1,I))}r[m]=F*y+3*L*I*S+3*P*v*b+T*g}return r}},_n=class{constructor(e,t,n,i){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=Ka(t,this.TimeBufferType),this.values=Ka(n,this.ValueBufferType),this.setInterpolation(i||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:Ka(e.times,Array),values:Ka(e.values,Array)};let i=e.getInterpolation();i!==e.DefaultInterpolation&&(n.interpolation=i)}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new So(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new Jr(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new Mo(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodBezier(e){let t=new bo(this.times,this.values,this.getValueSize(),e);return this.settings&&(t.inTangents=this.settings.inTangents,t.outTangents=this.settings.outTangents),t}setInterpolation(e){let t;switch(e){case Ar:t=this.InterpolantFactoryMethodDiscrete;break;case ho:t=this.InterpolantFactoryMethodLinear;break;case ja:t=this.InterpolantFactoryMethodSmooth;break;case oc:t=this.InterpolantFactoryMethodBezier;break}if(t===void 0){let n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return ke("KeyframeTrack:",n),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return Ar;case this.InterpolantFactoryMethodLinear:return ho;case this.InterpolantFactoryMethodSmooth:return ja;case this.InterpolantFactoryMethodBezier:return oc}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let n=0,i=t.length;n!==i;++n)t[n]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let n=0,i=t.length;n!==i;++n)t[n]*=e}return this}trim(e,t){let n=this.times,i=n.length,r=0,a=i-1;for(;r!==i&&n[r]<e;)++r;for(;a!==-1&&n[a]>t;)--a;if(++a,r!==0||a!==i){r>=a&&(a=Math.max(a,1),r=a-1);let o=this.getValueSize();this.times=n.slice(r,a),this.values=this.values.slice(r*o,a*o)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(Ye("KeyframeTrack: Invalid value size in track.",this),e=!1);let n=this.times,i=this.values,r=n.length;r===0&&(Ye("KeyframeTrack: Track is empty.",this),e=!1);let a=null;for(let o=0;o!==r;o++){let l=n[o];if(typeof l=="number"&&isNaN(l)){Ye("KeyframeTrack: Time is not a valid number.",this,o,l),e=!1;break}if(a!==null&&a>l){Ye("KeyframeTrack: Out of order keys.",this,o,l,a),e=!1;break}a=l}if(i!==void 0&&hd(i))for(let o=0,l=i.length;o!==l;++o){let c=i[o];if(isNaN(c)){Ye("KeyframeTrack: Value is not a valid number.",this,o,c),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),i=this.getInterpolation()===ja,r=e.length-1,a=1;for(let o=1;o<r;++o){let l=!1,c=e[o],u=e[o+1];if(c!==u&&(o!==1||c!==e[0]))if(i)l=!0;else{let h=o*n,f=h-n,d=h+n;for(let m=0;m!==n;++m){let y=t[h+m];if(y!==t[f+m]||y!==t[d+m]){l=!0;break}}}if(l){if(o!==a){e[a]=e[o];let h=o*n,f=a*n;for(let d=0;d!==n;++d)t[f+d]=t[h+d]}++a}}if(r>0){e[a]=e[r];for(let o=r*n,l=a*n,c=0;c!==n;++c)t[l+c]=t[o+c];++a}return a!==e.length?(this.times=e.slice(0,a),this.values=t.slice(0,a*n)):(this.times=e,this.values=t),this}clone(){let e=this.times.slice(),t=this.values.slice(),n=this.constructor,i=new n(this.name,e,t);return i.createInterpolant=this.createInterpolant,i}};_n.prototype.ValueTypeName="";_n.prototype.TimeBufferType=Float32Array;_n.prototype.ValueBufferType=Float32Array;_n.prototype.DefaultInterpolation=ho;var Mi=class extends _n{constructor(e,t,n){super(e,t,n)}};Mi.prototype.ValueTypeName="bool";Mi.prototype.ValueBufferType=Array;Mi.prototype.DefaultInterpolation=Ar;Mi.prototype.InterpolantFactoryMethodLinear=void 0;Mi.prototype.InterpolantFactoryMethodSmooth=void 0;var Qr=class extends _n{constructor(e,t,n,i){super(e,t,n,i)}};Qr.prototype.ValueTypeName="color";var Wi=class extends _n{constructor(e,t,n,i){super(e,t,n,i)}};Wi.prototype.ValueTypeName="number";var Eo=class extends Gi{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e,t,n,i){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=(n-t)/(i-t),c=e*o;for(let u=c+o;c!==u;c+=4)zt.slerpFlat(r,0,a,c-o,a,c,l);return r}},Xi=class extends _n{constructor(e,t,n,i){super(e,t,n,i)}InterpolantFactoryMethodLinear(e){return new Eo(this.times,this.values,this.getValueSize(),e)}};Xi.prototype.ValueTypeName="quaternion";Xi.prototype.InterpolantFactoryMethodSmooth=void 0;var Si=class extends _n{constructor(e,t,n){super(e,t,n)}};Si.prototype.ValueTypeName="string";Si.prototype.ValueBufferType=Array;Si.prototype.DefaultInterpolation=Ar;Si.prototype.InterpolantFactoryMethodLinear=void 0;Si.prototype.InterpolantFactoryMethodSmooth=void 0;var Ms=class extends _n{constructor(e,t,n,i){super(e,t,n,i)}};Ms.prototype.ValueTypeName="vector";var bi=class{constructor(e="",t=-1,n=[],i=xl){this.name=e,this.tracks=n,this.duration=t,this.blendMode=i,this.uuid=ji(),this.userData={},this.duration<0&&this.resetDuration()}static parse(e){let t=[],n=e.tracks,i=1/(e.fps||1);for(let a=0,o=n.length;a!==o;++a)t.push(gp(n[a]).scale(i));let r=new this(e.name,e.duration,t,e.blendMode);return r.uuid=e.uuid,r.userData=JSON.parse(e.userData||"{}"),r}static toJSON(e){let t=[],n=e.tracks,i={name:e.name,duration:e.duration,tracks:t,uuid:e.uuid,blendMode:e.blendMode,userData:JSON.stringify(e.userData)};for(let r=0,a=n.length;r!==a;++r)t.push(_n.toJSON(n[r]));return i}static CreateFromMorphTargetSequence(e,t,n,i){let r=t.length,a=[];for(let o=0;o<r;o++){let l=[],c=[];l.push((o+r-1)%r,o,(o+1)%r),c.push(0,1,0);let u=dp(l);l=Jh(l,1,u),c=Jh(c,1,u),!i&&l[0]===0&&(l.push(r),c.push(c[0])),a.push(new Wi(".morphTargetInfluences["+t[o].name+"]",l,c).scale(1/n))}return new this(e,-1,a)}static findByName(e,t){let n=e;if(!Array.isArray(e)){let i=e;n=i.geometry&&i.geometry.animations||i.animations}for(let i=0;i<n.length;i++)if(n[i].name===t)return n[i];return null}static CreateClipsFromMorphTargetSequences(e,t,n){let i={},r=/^([\w-]*?)([\d]+)$/;for(let o=0,l=e.length;o<l;o++){let c=e[o],u=c.name.match(r);if(u&&u.length>1){let h=u[1],f=i[h];f||(i[h]=f=[]),f.push(c)}}let a=[];for(let o in i)a.push(this.CreateFromMorphTargetSequence(o,i[o],t,n));return a}resetDuration(){let e=this.tracks,t=0;for(let n=0,i=e.length;n!==i;++n){let r=this.tracks[n];t=Math.max(t,r.times[r.times.length-1])}return this.duration=t,this}trim(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].trim(0,this.duration);return this}validate(){let e=!0;for(let t=0;t<this.tracks.length;t++)e=e&&this.tracks[t].validate();return e}optimize(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].optimize();return this}clone(){let e=[];for(let n=0;n<this.tracks.length;n++)e.push(this.tracks[n].clone());let t=new this.constructor(this.name,this.duration,e,this.blendMode);return t.userData=JSON.parse(JSON.stringify(this.userData)),t}toJSON(){return this.constructor.toJSON(this)}};function mp(s){switch(s.toLowerCase()){case"scalar":case"double":case"float":case"number":case"integer":return Wi;case"vector":case"vector2":case"vector3":case"vector4":return Ms;case"color":return Qr;case"quaternion":return Xi;case"bool":case"boolean":return Mi;case"string":return Si}throw new Error("THREE.KeyframeTrack: Unsupported typeName: "+s)}function gp(s){if(s.type===void 0)throw new Error("THREE.KeyframeTrack: track type undefined, can not parse");let e=mp(s.type);if(s.times===void 0){let t=[],n=[];pp(s.keys,t,n,"value"),s.times=t,s.values=n}return e.parse!==void 0?e.parse(s):new e(s.name,s.times,s.values,s.interpolation)}var Xs={enabled:!1,files:{},add:function(s,e){this.enabled!==!1&&(Qh(s)||(this.files[s]=e))},get:function(s){if(this.enabled!==!1&&!Qh(s))return this.files[s]},remove:function(s){delete this.files[s]},clear:function(){this.files={}}};function Qh(s){try{let e=s.slice(s.indexOf(":")+1);return new URL(e).protocol==="blob:"}catch{return!1}}var To=class{constructor(e,t,n){let i=this,r=!1,a=0,o=0,l,c=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this._abortController=null,this.itemStart=function(u){o++,r===!1&&i.onStart!==void 0&&i.onStart(u,a,o),r=!0},this.itemEnd=function(u){a++,i.onProgress!==void 0&&i.onProgress(u,a,o),a===o&&(r=!1,i.onLoad!==void 0&&i.onLoad())},this.itemError=function(u){i.onError!==void 0&&i.onError(u)},this.resolveURL=function(u){return u=u.normalize("NFC"),l?l(u):u},this.setURLModifier=function(u){return l=u,this},this.addHandler=function(u,h){return c.push(u,h),this},this.removeHandler=function(u){let h=c.indexOf(u);return h!==-1&&c.splice(h,2),this},this.getHandler=function(u){for(let h=0,f=c.length;h<f;h+=2){let d=c[h],m=c[h+1];if(d.global&&(d.lastIndex=0),d.test(u))return m}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}},Yu=new To,qn=class{constructor(e){this.manager=e!==void 0?e:Yu,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(e,t){let n=this;return new Promise(function(i,r){n.load(e,i,t,r)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}abort(){return this}};qn.DEFAULT_MATERIAL_NAME="__DEFAULT";var gi={},dc=class extends Error{constructor(e,t){super(e),this.response=t}},jr=class extends qn{constructor(e){super(e),this.mimeType="",this.responseType="",this._abortController=new AbortController}load(e,t,n,i){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let r=Xs.get(`file:${e}`);if(r!==void 0){this.manager.itemStart(e),setTimeout(()=>{t&&t(r),this.manager.itemEnd(e)},0);return}if(gi[e]!==void 0){gi[e].push({onLoad:t,onProgress:n,onError:i});return}gi[e]=[],gi[e].push({onLoad:t,onProgress:n,onError:i});let a=new Request(e,{headers:new Headers(this.requestHeader),credentials:this.withCredentials?"include":"same-origin",signal:typeof AbortSignal.any=="function"?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal}),o=this.mimeType,l=this.responseType;fetch(a).then(c=>{if(c.status===200||c.status===0){if(c.status===0&&ke("FileLoader: HTTP Status 0 received."),typeof ReadableStream>"u"||c.body===void 0||c.body.getReader===void 0)return c;let u=gi[e],h=c.body.getReader(),f=c.headers.get("X-File-Size")||c.headers.get("Content-Length"),d=f?parseInt(f):0,m=d!==0,y=0,g=new ReadableStream({start(p){E();function E(){h.read().then(({done:S,value:_})=>{if(S)p.close();else{y+=_.byteLength;let C=new ProgressEvent("progress",{lengthComputable:m,loaded:y,total:d});for(let b=0,I=u.length;b<I;b++){let v=u[b];v.onProgress&&v.onProgress(C)}p.enqueue(_),E()}},S=>{p.error(S)})}}});return new Response(g)}else throw new dc(`fetch for "${c.url}" responded with ${c.status}: ${c.statusText}`,c)}).then(c=>{switch(l){case"arraybuffer":return c.arrayBuffer();case"blob":return c.blob();case"document":return c.text().then(u=>new DOMParser().parseFromString(u,o));case"json":return c.json();default:if(o==="")return c.text();{let h=/charset="?([^;"\s]*)"?/i.exec(o),f=h&&h[1]?h[1].toLowerCase():void 0,d=new TextDecoder(f);return c.arrayBuffer().then(m=>d.decode(m))}}}).then(c=>{Xs.add(`file:${e}`,c);let u=gi[e];delete gi[e];for(let h=0,f=u.length;h<f;h++){let d=u[h];d.onLoad&&d.onLoad(c)}}).catch(c=>{let u=gi[e];if(u===void 0)throw this.manager.itemError(e),c;delete gi[e];for(let h=0,f=u.length;h<f;h++){let d=u[h];d.onError&&d.onError(c)}this.manager.itemError(e)}).finally(()=>{this.manager.itemEnd(e)}),this.manager.itemStart(e)}setResponseType(e){return this.responseType=e,this}setMimeType(e){return this.mimeType=e,this}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}};var ks=new WeakMap,wo=class extends qn{constructor(e){super(e)}load(e,t,n,i){this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let r=this,a=Xs.get(`image:${e}`);if(a!==void 0){if(a.complete===!0)r.manager.itemStart(e),setTimeout(function(){t&&t(a),r.manager.itemEnd(e)},0);else{let h=ks.get(a);h===void 0&&(h=[],ks.set(a,h)),h.push({onLoad:t,onError:i})}return a}let o=Ys("img");function l(){u(),t&&t(this);let h=ks.get(this)||[];for(let f=0;f<h.length;f++){let d=h[f];d.onLoad&&d.onLoad(this)}ks.delete(this),r.manager.itemEnd(e)}function c(h){u(),i&&i(h),Xs.remove(`image:${e}`);let f=ks.get(this)||[];for(let d=0;d<f.length;d++){let m=f[d];m.onError&&m.onError(h)}ks.delete(this),r.manager.itemError(e),r.manager.itemEnd(e)}function u(){o.removeEventListener("load",l,!1),o.removeEventListener("error",c,!1)}return o.addEventListener("load",l,!1),o.addEventListener("error",c,!1),e.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(o.crossOrigin=this.crossOrigin),Xs.add(`image:${e}`,o),r.manager.itemStart(e),o.src=e,o}};var Ss=class extends qn{constructor(e){super(e)}load(e,t,n,i){let r=new ln,a=new wo(this.manager);return a.setCrossOrigin(this.crossOrigin),a.setPath(this.path),a.load(e,function(o){r.image=o,r.needsUpdate=!0,t!==void 0&&t(r)},n,i),r}},qi=class extends Ut{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new Ve(e),this.intensity=t}dispose(){this.dispatchEvent({type:"dispose"})}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,t}},ea=class extends qi{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(Ut.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Ve(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}toJSON(e){let t=super.toJSON(e);return t.object.groundColor=this.groundColor.getHex(),t}},rc=new He,jh=new N,eu=new N,ta=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Ke(512,512),this.mapType=yn,this.map=null,this.mapPass=null,this.matrix=new He,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Qs,this._frameExtents=new Ke(1,1),this._viewportCount=1,this._viewports=[new dt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera,n=this.matrix;jh.setFromMatrixPosition(e.matrixWorld),t.position.copy(jh),eu.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(eu),t.updateMatrixWorld(),rc.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(rc,t.coordinateSystem,t.reversedDepth),t.coordinateSystem===qs||t.reversedDepth?n.set(.5,0,0,.5,0,.5,0,.5,0,0,1,0,0,0,0,1):n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(rc)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this.biasNode=e.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}},Ja=new N,Qa=new zt,ti=new N,na=class extends Ut{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new He,this.projectionMatrix=new He,this.projectionMatrixInverse=new He,this.coordinateSystem=Gn,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(Ja,Qa,ti),ti.x===1&&ti.y===1&&ti.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Ja,Qa,ti.set(1,1,1)).invert()}updateWorldMatrix(e,t,n=!1){super.updateWorldMatrix(e,t,n),this.matrixWorld.decompose(Ja,Qa,ti),ti.x===1&&ti.y===1&&ti.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Ja,Qa,ti.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},Ui=new N,tu=new Ke,nu=new Ke,Yt=class extends na{constructor(e=50,t=1,n=.1,i=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=i,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=gs*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(Tr*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return gs*2*Math.atan(Math.tan(Tr*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){Ui.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Ui.x,Ui.y).multiplyScalar(-e/Ui.z),Ui.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Ui.x,Ui.y).multiplyScalar(-e/Ui.z)}getViewSize(e,t){return this.getViewBounds(e,tu,nu),t.subVectors(nu,tu)}setViewOffset(e,t,n,i,r,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=i,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(Tr*.5*this.fov)/this.zoom,n=2*t,i=this.aspect*n,r=-.5*i,a=this.view;if(this.view!==null&&this.view.enabled){let l=a.fullWidth,c=a.fullHeight;r+=a.offsetX*i/l,t-=a.offsetY*n/c,i*=a.width/l,n*=a.height/c}let o=this.filmOffset;o!==0&&(r+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+i,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}},pc=class extends ta{constructor(){super(new Yt(50,1,.5,500)),this.isSpotLightShadow=!0,this.focus=1,this.aspect=1}updateMatrices(e){let t=this.camera,n=gs*2*e.angle*this.focus,i=this.mapSize.width/this.mapSize.height*this.aspect,r=e.distance||t.far;(n!==t.fov||i!==t.aspect||r!==t.far)&&(t.fov=n,t.aspect=i,t.far=r,t.updateProjectionMatrix()),super.updateMatrices(e)}copy(e){return super.copy(e),this.focus=e.focus,this}},ia=class extends qi{constructor(e,t,n=0,i=Math.PI/3,r=0,a=2){super(e,t),this.isSpotLight=!0,this.type="SpotLight",this.position.copy(Ut.DEFAULT_UP),this.updateMatrix(),this.target=new Ut,this.distance=n,this.angle=i,this.penumbra=r,this.decay=a,this.map=null,this.shadow=new pc}get power(){return this.intensity*Math.PI}set power(e){this.intensity=e/Math.PI}dispose(){super.dispose(),this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.angle=e.angle,this.penumbra=e.penumbra,this.decay=e.decay,this.target=e.target.clone(),this.map=e.map,this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.distance=this.distance,t.object.angle=this.angle,t.object.decay=this.decay,t.object.penumbra=this.penumbra,t.object.target=this.target.uuid,this.map&&this.map.isTexture&&(t.object.map=this.map.toJSON(e).uuid),t.object.shadow=this.shadow.toJSON(),t}},mc=class extends ta{constructor(){super(new Yt(90,1,.5,500)),this.isPointLightShadow=!0}},Jt=class extends qi{constructor(e,t,n=0,i=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=i,this.shadow=new mc}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){super.dispose(),this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.distance=this.distance,t.object.decay=this.decay,t.object.shadow=this.shadow.toJSON(),t}},ir=class extends na{constructor(e=-1,t=1,n=1,i=-1,r=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=i,this.near=r,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,i,r,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=i,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,i=(this.top+this.bottom)/2,r=n-e,a=n+e,o=i+t,l=i-t;if(this.view!==null&&this.view.enabled){let c=(this.right-this.left)/this.view.fullWidth/this.zoom,u=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,a=r+c*this.view.width,o-=u*this.view.offsetY,l=o-u*this.view.height}this.projectionMatrix.makeOrthographic(r,a,o,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},gc=class extends ta{constructor(){super(new ir(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},Yi=class extends qi{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Ut.DEFAULT_UP),this.updateMatrix(),this.target=new Ut,this.shadow=new gc}dispose(){super.dispose(),this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.shadow=this.shadow.toJSON(),t.object.target=this.target.uuid,t}},sa=class extends qi{constructor(e,t){super(e,t),this.isAmbientLight=!0,this.type="AmbientLight"}};var ra=class{static extractUrlBase(e){let t=e.lastIndexOf("/");return t===-1?"./":e.slice(0,t+1)}static resolveURL(e,t){return typeof e!="string"||e===""?"":(/^https?:\/\//i.test(t)&&/^\//.test(e)&&(t=t.replace(/(^https?:\/\/[^\/]+).*/i,"$1")),/^(https?:)?\/\//i.test(e)||/^data:.*,.*$/i.test(e)||/^blob:.*$/i.test(e)?e:t+e)}};var Hs=-90,Vs=1,Ao=class extends Ut{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let i=new Yt(Hs,Vs,e,t);i.layers=this.layers,this.add(i);let r=new Yt(Hs,Vs,e,t);r.layers=this.layers,this.add(r);let a=new Yt(Hs,Vs,e,t);a.layers=this.layers,this.add(a);let o=new Yt(Hs,Vs,e,t);o.layers=this.layers,this.add(o);let l=new Yt(Hs,Vs,e,t);l.layers=this.layers,this.add(l);let c=new Yt(Hs,Vs,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[n,i,r,a,o,l]=t;for(let c of t)this.remove(c);if(e===Gn)n.up.set(0,1,0),n.lookAt(1,0,0),i.up.set(0,1,0),i.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===qs)n.up.set(0,-1,0),n.lookAt(-1,0,0),i.up.set(0,-1,0),i.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(let c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:i}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[r,a,o,l,c,u]=this.children,h=e.getRenderTarget(),f=e.getActiveCubeFace(),d=e.getActiveMipmapLevel(),m=e.xr.enabled;e.xr.enabled=!1;let y=n.texture.generateMipmaps;n.texture.generateMipmaps=!1;let g=!1;e.isWebGLRenderer===!0?g=e.state.buffers.depth.getReversed():g=e.reversedDepthBuffer,e.setRenderTarget(n,0,i),g&&e.autoClear===!1&&e.clearDepth(),e.render(t,r),e.setRenderTarget(n,1,i),g&&e.autoClear===!1&&e.clearDepth(),e.render(t,a),e.setRenderTarget(n,2,i),g&&e.autoClear===!1&&e.clearDepth(),e.render(t,o),e.setRenderTarget(n,3,i),g&&e.autoClear===!1&&e.clearDepth(),e.render(t,l),e.setRenderTarget(n,4,i),g&&e.autoClear===!1&&e.clearDepth(),e.render(t,c),n.texture.generateMipmaps=y,e.setRenderTarget(n,5,i),g&&e.autoClear===!1&&e.clearDepth(),e.render(t,u),e.setRenderTarget(h,f,d),e.xr.enabled=m,n.texture.needsPMREMUpdate=!0}},Co=class extends Yt{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}};var Ro=class{constructor(e,t,n){this.binding=e,this.valueSize=n;let i,r,a;switch(t){case"quaternion":i=this._slerp,r=this._slerpAdditive,a=this._setAdditiveIdentityQuaternion,this.buffer=new Float64Array(n*6),this._workIndex=5;break;case"string":case"bool":i=this._select,r=this._select,a=this._setAdditiveIdentityOther,this.buffer=new Array(n*5);break;default:i=this._lerp,r=this._lerpAdditive,a=this._setAdditiveIdentityNumeric,this.buffer=new Float64Array(n*5)}this._mixBufferRegion=i,this._mixBufferRegionAdditive=r,this._setIdentity=a,this._origIndex=3,this._addIndex=4,this.cumulativeWeight=0,this.cumulativeWeightAdditive=0,this.useCount=0,this.referenceCount=0}accumulate(e,t){let n=this.buffer,i=this.valueSize,r=e*i+i,a=this.cumulativeWeight;if(a===0){for(let o=0;o!==i;++o)n[r+o]=n[o];a=t}else{a+=t;let o=t/a;this._mixBufferRegion(n,r,0,o,i)}this.cumulativeWeight=a}accumulateAdditive(e){let t=this.buffer,n=this.valueSize,i=n*this._addIndex;this.cumulativeWeightAdditive===0&&this._setIdentity(),this._mixBufferRegionAdditive(t,i,0,e,n),this.cumulativeWeightAdditive+=e}apply(e){let t=this.valueSize,n=this.buffer,i=e*t+t,r=this.cumulativeWeight,a=this.cumulativeWeightAdditive,o=this.binding;if(this.cumulativeWeight=0,this.cumulativeWeightAdditive=0,r<1){let l=t*this._origIndex;this._mixBufferRegion(n,i,l,1-r,t)}a>0&&this._mixBufferRegionAdditive(n,i,this._addIndex*t,1,t);for(let l=t,c=t+t;l!==c;++l)if(n[l]!==n[l+t]){o.setValue(n,i);break}}saveOriginalState(){let e=this.binding,t=this.buffer,n=this.valueSize,i=n*this._origIndex;e.getValue(t,i);for(let r=n,a=i;r!==a;++r)t[r]=t[i+r%n];this._setIdentity(),this.cumulativeWeight=0,this.cumulativeWeightAdditive=0}restoreOriginalState(){let e=this.valueSize*3;this.binding.setValue(this.buffer,e)}_setAdditiveIdentityNumeric(){let e=this._addIndex*this.valueSize,t=e+this.valueSize;for(let n=e;n<t;n++)this.buffer[n]=0}_setAdditiveIdentityQuaternion(){this._setAdditiveIdentityNumeric(),this.buffer[this._addIndex*this.valueSize+3]=1}_setAdditiveIdentityOther(){let e=this._origIndex*this.valueSize,t=this._addIndex*this.valueSize;for(let n=0;n<this.valueSize;n++)this.buffer[t+n]=this.buffer[e+n]}_select(e,t,n,i,r){if(i>=.5)for(let a=0;a!==r;++a)e[t+a]=e[n+a]}_slerp(e,t,n,i){zt.slerpFlat(e,t,e,t,e,n,i)}_slerpAdditive(e,t,n,i,r){let a=this._workIndex*r;zt.multiplyQuaternionsFlat(e,a,e,t,e,n),zt.slerpFlat(e,t,e,t,e,a,i)}_lerp(e,t,n,i,r){let a=1-i;for(let o=0;o!==r;++o){let l=t+o;e[l]=e[l]*a+e[n+o]*i}}_lerpAdditive(e,t,n,i,r){for(let a=0;a!==r;++a){let o=t+a;e[o]=e[o]+e[n+a]*i}}},kc="\\[\\]\\.:\\/",xp=new RegExp("["+kc+"]","g"),Hc="[^"+kc+"]",vp="[^"+kc.replace("\\.","")+"]",_p=/((?:WC+[\/:])*)/.source.replace("WC",Hc),yp=/(WCOD+)?/.source.replace("WCOD",vp),Mp=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",Hc),Sp=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",Hc),bp=new RegExp("^"+_p+yp+Mp+Sp+"$"),Ep=["material","materials","bones","map"],xc=class{constructor(e,t,n){let i=n||vt.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,i)}getValue(e,t){this.bind();let n=this._targetGroup.nCachedObjects_,i=this._bindings[n];i!==void 0&&i.getValue(e,t)}setValue(e,t){let n=this._bindings;for(let i=this._targetGroup.nCachedObjects_,r=n.length;i!==r;++i)n[i].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}},vt=class s{constructor(e,t,n){this.path=t,this.parsedPath=n||s.parseTrackName(t),this.node=s.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,n){return e&&e.isAnimationObjectGroup?new s.Composite(e,t,n):new s(e,t,n)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(xp,"")}static parseTrackName(e){let t=bp.exec(e);if(t===null)throw new Error("THREE.PropertyBinding: Cannot parse trackName: "+e);let n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},i=n.nodeName&&n.nodeName.lastIndexOf(".");if(i!==void 0&&i!==-1){let r=n.nodeName.substring(i+1);Ep.indexOf(r)!==-1&&(n.nodeName=n.nodeName.substring(0,i),n.objectName=r)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("THREE.PropertyBinding: can not parse propertyName from trackName: "+e);return n}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){let n=function(r){for(let a=0;a<r.length;a++){let o=r[a];if(o.name===t||o.uuid===t)return o;let l=n(o.children);if(l)return l}return null},i=n(e.children);if(i)return i}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let n=this.resolvedProperty;for(let i=0,r=n.length;i!==r;++i)e[t++]=n[i]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let n=this.resolvedProperty;for(let i=0,r=n.length;i!==r;++i)n[i]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let n=this.resolvedProperty;for(let i=0,r=n.length;i!==r;++i)n[i]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let n=this.resolvedProperty;for(let i=0,r=n.length;i!==r;++i)n[i]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node,t=this.parsedPath,n=t.objectName,i=t.propertyName,r=t.propertyIndex;if(e||(e=s.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){ke("PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let c=t.objectIndex;switch(n){case"materials":if(!e.material){Ye("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){Ye("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){Ye("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let u=0;u<e.length;u++)if(e[u].name===c){c=u;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){Ye("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){Ye("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[n]===void 0){Ye("PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[n]}if(c!==void 0){if(e[c]===void 0){Ye("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[c]}}let a=e[i];if(a===void 0){let c=t.nodeName;Ye("PropertyBinding: Trying to update property for track: "+c+"."+i+" but it wasn't found.",e);return}let o=this.Versioning.None;this.targetObject=e,e.isMaterial===!0?o=this.Versioning.NeedsUpdate:e.isObject3D===!0&&(o=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(r!==void 0){if(i==="morphTargetInfluences"){if(!e.geometry){Ye("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){Ye("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[r]!==void 0&&(r=e.morphTargetDictionary[r])}l=this.BindingType.ArrayElement,this.resolvedProperty=a,this.propertyIndex=r}else a.fromArray!==void 0&&a.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=a):Array.isArray(a)?(l=this.BindingType.EntireArray,this.resolvedProperty=a):this.propertyName=i;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][o]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};vt.Composite=xc;vt.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};vt.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};vt.prototype.GetterByBindingType=[vt.prototype._getValue_direct,vt.prototype._getValue_array,vt.prototype._getValue_arrayElement,vt.prototype._getValue_toArray];vt.prototype.SetterByBindingTypeAndVersioning=[[vt.prototype._setValue_direct,vt.prototype._setValue_direct_setNeedsUpdate,vt.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[vt.prototype._setValue_array,vt.prototype._setValue_array_setNeedsUpdate,vt.prototype._setValue_array_setMatrixWorldNeedsUpdate],[vt.prototype._setValue_arrayElement,vt.prototype._setValue_arrayElement_setNeedsUpdate,vt.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[vt.prototype._setValue_fromArray,vt.prototype._setValue_fromArray_setNeedsUpdate,vt.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var Io=class{constructor(e,t,n=null,i=t.blendMode){this._mixer=e,this._clip=t,this._localRoot=n,this.blendMode=i;let r=t.tracks,a=r.length,o=new Array(a),l={endingStart:us,endingEnd:us};for(let c=0;c!==a;++c){let u=r[c].createInterpolant(null);o[c]=u,u.settings=l}this._interpolantSettings=l,this._interpolants=o,this._propertyBindings=new Array(a),this._cacheIndex=null,this._byClipCacheIndex=null,this._timeScaleInterpolant=null,this._restoreTimeScale=null,this._weightInterpolant=null,this.loop=_a,this._loopCount=-1,this._startTime=null,this.time=0,this.timeScale=1,this._effectiveTimeScale=1,this.weight=1,this._effectiveWeight=1,this.repetitions=1/0,this.paused=!1,this.enabled=!0,this.clampWhenFinished=!1,this.zeroSlopeAtStart=!0,this.zeroSlopeAtEnd=!0}play(){return this._mixer._activateAction(this),this}stop(){return this._mixer._deactivateAction(this),this.reset()}reset(){return this.paused=!1,this.enabled=!0,this.time=0,this._loopCount=-1,this._startTime=null,this.stopFading().stopWarping()}isRunning(){return this.enabled&&!this.paused&&this.timeScale!==0&&this._startTime===null&&this._mixer._isActiveAction(this)}isScheduled(){return this._mixer._isActiveAction(this)}startAt(e){return this._startTime=e,this}setLoop(e,t){return this.loop=e,this.repetitions=t,this}setEffectiveWeight(e){return this.weight=e,this._effectiveWeight=this.enabled?e:0,this.stopFading()}getEffectiveWeight(){return this._effectiveWeight}fadeIn(e){return this._scheduleFading(e,0,1)}fadeOut(e){return this._scheduleFading(e,1,0)}crossFadeFrom(e,t,n=!1){if(e.fadeOut(t),this.fadeIn(t),n===!0){let i=this._clip.duration,r=e._clip.duration,a=r/i,o=i/r;e._restoreTimeScale=e.timeScale,this._restoreTimeScale=this.timeScale,e.warp(1,a,t),this.warp(o,1,t)}return this}crossFadeTo(e,t,n=!1){return e.crossFadeFrom(this,t,n)}stopFading(){let e=this._weightInterpolant;return e!==null&&(this._weightInterpolant=null,this._mixer._takeBackControlInterpolant(e)),this}setEffectiveTimeScale(e){return this.timeScale=e,this._effectiveTimeScale=this.paused?0:e,this.stopWarping()}getEffectiveTimeScale(){return this._effectiveTimeScale}setDuration(e){return this.timeScale=this._clip.duration/e,this.stopWarping()}syncWith(e){return this.time=e.time,this.timeScale=e.timeScale,this.stopWarping()}halt(e){return this.warp(this._effectiveTimeScale,0,e)}warp(e,t,n){let i=this._mixer,r=i.time,a=this.timeScale,o=this._timeScaleInterpolant;o===null&&(o=i._lendControlInterpolant(),this._timeScaleInterpolant=o);let l=o.parameterPositions,c=o.sampleValues;return l[0]=r,l[1]=r+n,c[0]=e/a,c[1]=t/a,this}stopWarping(){let e=this._timeScaleInterpolant;return e!==null&&(this._timeScaleInterpolant=null,this._mixer._takeBackControlInterpolant(e)),this._restoreTimeScale=null,this}getMixer(){return this._mixer}getClip(){return this._clip}getRoot(){return this._localRoot||this._mixer._root}_update(e,t,n,i){if(!this.enabled){this._updateWeight(e);return}let r=this._startTime;if(r!==null){let l=(e-r)*n;l<0||n===0?t=0:(this._startTime=null,t=n*l)}t*=this._updateTimeScale(e);let a=this._updateTime(t),o=this._updateWeight(e);if(o>0){let l=this._interpolants,c=this._propertyBindings;switch(this.blendMode){case Cu:for(let u=0,h=l.length;u!==h;++u)l[u].evaluate(a),c[u].accumulateAdditive(o);break;case xl:default:for(let u=0,h=l.length;u!==h;++u)l[u].evaluate(a),c[u].accumulate(i,o)}}}_updateWeight(e){let t=0;if(this.enabled){t=this.weight;let n=this._weightInterpolant;if(n!==null){let i=n.evaluate(e)[0];t*=i,e>n.parameterPositions[1]&&(this.stopFading(),i===0&&(this.enabled=!1))}}return this._effectiveWeight=t,t}_updateTimeScale(e){let t=0;if(!this.paused){t=this.timeScale;let n=this._timeScaleInterpolant;if(n!==null){let i=n.evaluate(e)[0];t*=i,e>n.parameterPositions[1]&&(t===0?this.paused=!0:(this._restoreTimeScale!==null&&(t=this._restoreTimeScale),this.timeScale=t),this.stopWarping())}}return this._effectiveTimeScale=t,t}_updateTime(e){let t=this._clip.duration,n=this.loop,i=this.time+e,r=this._loopCount,a=n===Au;if(e===0)return r===-1?i:a&&(r&1)===1?t-i:i;if(n===va){r===-1&&(this._loopCount=0,this._setEndings(!0,!0,!1));e:{if(i>=t)i=t;else if(i<0)i=0;else{this.time=i;break e}this.clampWhenFinished?this.paused=!0:this.enabled=!1,this.time=i,this._mixer.dispatchEvent({type:"finished",action:this,direction:e<0?-1:1})}}else{if(r===-1&&(e>=0?(r=0,this._setEndings(!0,this.repetitions===0,a)):this._setEndings(this.repetitions===0,!0,a)),i>=t||i<0){let o=Math.floor(i/t);i-=t*o,r+=Math.abs(o);let l=this.repetitions-r;if(l<=0)this.clampWhenFinished?this.paused=!0:this.enabled=!1,i=e>0?t:0,this.time=i,this._mixer.dispatchEvent({type:"finished",action:this,direction:e>0?1:-1});else{if(l===1){let c=e<0;this._setEndings(c,!c,a)}else this._setEndings(!1,!1,a);this._loopCount=r,this.time=i,this._mixer.dispatchEvent({type:"loop",action:this,loopDelta:o})}}else this._loopCount=r,this.time=i;if(a&&(r&1)===1)return t-i}return i}_setEndings(e,t,n){let i=this._interpolantSettings;n?(i.endingStart=fs,i.endingEnd=fs):(e?i.endingStart=this.zeroSlopeAtStart?fs:us:i.endingStart=Cr,t?i.endingEnd=this.zeroSlopeAtEnd?fs:us:i.endingEnd=Cr)}_scheduleFading(e,t,n){let i=this._mixer,r=i.time,a=this._weightInterpolant;a===null&&(a=i._lendControlInterpolant(),this._weightInterpolant=a);let o=a.parameterPositions,l=a.sampleValues;return o[0]=r,l[0]=t,o[1]=r+e,l[1]=n,this}},Tp=new Float32Array(1),sr=class extends Wn{constructor(e){super(),this._root=e,this._initMemoryManager(),this._accuIndex=0,this.time=0,this.timeScale=1,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}_bindAction(e,t){let n=e._localRoot||this._root,i=e._clip.tracks,r=i.length,a=e._propertyBindings,o=e._interpolants,l=n.uuid,c=this._bindingsByRootAndName,u=c[l];u===void 0&&(u={},c[l]=u);for(let h=0;h!==r;++h){let f=i[h],d=f.name,m=u[d];if(m!==void 0)++m.referenceCount,a[h]=m;else{if(m=a[h],m!==void 0){m._cacheIndex===null&&(++m.referenceCount,this._addInactiveBinding(m,l,d));continue}let y=t&&t._propertyBindings[h].binding.parsedPath;m=new Ro(vt.create(n,d,y),f.ValueTypeName,f.getValueSize()),++m.referenceCount,this._addInactiveBinding(m,l,d),a[h]=m}o[h].resultBuffer=m.buffer}}_activateAction(e){if(!this._isActiveAction(e)){if(e._cacheIndex===null){let n=(e._localRoot||this._root).uuid,i=e._clip.uuid,r=this._actionsByClip[i];this._bindAction(e,r&&r.knownActions[0]),this._addInactiveAction(e,i,n)}let t=e._propertyBindings;for(let n=0,i=t.length;n!==i;++n){let r=t[n];r.useCount++===0&&(this._lendBinding(r),r.saveOriginalState())}this._lendAction(e)}}_deactivateAction(e){if(this._isActiveAction(e)){let t=e._propertyBindings;for(let n=0,i=t.length;n!==i;++n){let r=t[n];--r.useCount===0&&(r.restoreOriginalState(),this._takeBackBinding(r))}this._takeBackAction(e)}}_initMemoryManager(){this._actions=[],this._nActiveActions=0,this._actionsByClip={},this._bindings=[],this._nActiveBindings=0,this._bindingsByRootAndName={},this._controlInterpolants=[],this._nActiveControlInterpolants=0;let e=this;this.stats={actions:{get total(){return e._actions.length},get inUse(){return e._nActiveActions}},bindings:{get total(){return e._bindings.length},get inUse(){return e._nActiveBindings}},controlInterpolants:{get total(){return e._controlInterpolants.length},get inUse(){return e._nActiveControlInterpolants}}}}_isActiveAction(e){let t=e._cacheIndex;return t!==null&&t<this._nActiveActions}_addInactiveAction(e,t,n){let i=this._actions,r=this._actionsByClip,a=r[t];if(a===void 0)a={knownActions:[e],actionByRoot:{}},e._byClipCacheIndex=0,r[t]=a;else{let o=a.knownActions;e._byClipCacheIndex=o.length,o.push(e)}e._cacheIndex=i.length,i.push(e),a.actionByRoot[n]=e}_removeInactiveAction(e){let t=this._actions,n=t[t.length-1],i=e._cacheIndex;n._cacheIndex=i,t[i]=n,t.pop(),e._cacheIndex=null;let r=e._clip.uuid,a=this._actionsByClip,o=a[r],l=o.knownActions,c=l[l.length-1],u=e._byClipCacheIndex;c._byClipCacheIndex=u,l[u]=c,l.pop(),e._byClipCacheIndex=null;let h=o.actionByRoot,f=(e._localRoot||this._root).uuid;delete h[f],l.length===0&&delete a[r],this._removeInactiveBindingsForAction(e)}_removeInactiveBindingsForAction(e){let t=e._propertyBindings;for(let n=0,i=t.length;n!==i;++n){let r=t[n];--r.referenceCount===0&&this._removeInactiveBinding(r)}}_lendAction(e){let t=this._actions,n=e._cacheIndex,i=this._nActiveActions++,r=t[i];e._cacheIndex=i,t[i]=e,r._cacheIndex=n,t[n]=r}_takeBackAction(e){let t=this._actions,n=e._cacheIndex,i=--this._nActiveActions,r=t[i];e._cacheIndex=i,t[i]=e,r._cacheIndex=n,t[n]=r}_addInactiveBinding(e,t,n){let i=this._bindingsByRootAndName,r=this._bindings,a=i[t];a===void 0&&(a={},i[t]=a),a[n]=e,e._cacheIndex=r.length,r.push(e)}_removeInactiveBinding(e){let t=this._bindings,n=e.binding,i=n.rootNode.uuid,r=n.path,a=this._bindingsByRootAndName,o=a[i],l=t[t.length-1],c=e._cacheIndex;l._cacheIndex=c,t[c]=l,t.pop(),delete o[r],Object.keys(o).length===0&&delete a[i]}_lendBinding(e){let t=this._bindings,n=e._cacheIndex,i=this._nActiveBindings++,r=t[i];e._cacheIndex=i,t[i]=e,r._cacheIndex=n,t[n]=r}_takeBackBinding(e){let t=this._bindings,n=e._cacheIndex,i=--this._nActiveBindings,r=t[i];e._cacheIndex=i,t[i]=e,r._cacheIndex=n,t[n]=r}_lendControlInterpolant(){let e=this._controlInterpolants,t=this._nActiveControlInterpolants++,n=e[t];return n===void 0&&(n=new Jr(new Float32Array(2),new Float32Array(2),1,Tp),n.__cacheIndex=t,e[t]=n),n}_takeBackControlInterpolant(e){let t=this._controlInterpolants,n=e.__cacheIndex,i=--this._nActiveControlInterpolants,r=t[i];e.__cacheIndex=i,t[i]=e,r.__cacheIndex=n,t[n]=r}clipAction(e,t,n){let i=t||this._root,r=i.uuid,a=typeof e=="string"?bi.findByName(i,e):e,o=a!==null?a.uuid:e,l=this._actionsByClip[o],c=null;if(n===void 0&&(a!==null?n=a.blendMode:n=xl),l!==void 0){let h=l.actionByRoot[r];if(h!==void 0&&h.blendMode===n)return h;c=l.knownActions[0],a===null&&(a=c._clip)}if(a===null)return null;let u=new Io(this,a,t,n);return this._bindAction(u,c),this._addInactiveAction(u,o,r),u}existingAction(e,t){let n=t||this._root,i=n.uuid,r=typeof e=="string"?bi.findByName(n,e):e,a=r?r.uuid:e,o=this._actionsByClip[a];return o!==void 0&&o.actionByRoot[i]||null}stopAllAction(){let e=this._actions,t=this._nActiveActions;for(let n=t-1;n>=0;--n)e[n].stop();return this}update(e){e*=this.timeScale;let t=this._actions,n=this._nActiveActions,i=this.time+=e,r=Math.sign(e),a=this._accuIndex^=1;for(let c=0;c!==n;++c)t[c]._update(i,e,r,a);let o=this._bindings,l=this._nActiveBindings;for(let c=0;c!==l;++c)o[c].apply(a);return this}setTime(e){this.time=0;for(let t=0;t<this._actions.length;t++)this._actions[t].time=0;return this.update(e)}getRoot(){return this._root}uncacheClip(e){let t=this._actions,n=e.uuid,i=this._actionsByClip,r=i[n];if(r!==void 0){let a=r.knownActions;for(let o=0,l=a.length;o!==l;++o){let c=a[o];this._deactivateAction(c);let u=c._cacheIndex,h=t[t.length-1];c._cacheIndex=null,c._byClipCacheIndex=null,h._cacheIndex=u,t[u]=h,t.pop(),this._removeInactiveBindingsForAction(c)}delete i[n]}}uncacheRoot(e){let t=e.uuid,n=this._actionsByClip;for(let a in n){let o=n[a].actionByRoot,l=o[t];l!==void 0&&(this._deactivateAction(l),this._removeInactiveAction(l))}let i=this._bindingsByRootAndName,r=i[t];if(r!==void 0)for(let a in r){let o=r[a];o.restoreOriginalState(),this._removeInactiveBinding(o)}}uncacheAction(e,t){let n=this.existingAction(e,t);n!==null&&(this._deactivateAction(n),this._removeInactiveAction(n))}};var aa=class{constructor(e=!0){this.autoStart=e,this.startTime=0,this.oldTime=0,this.elapsedTime=0,this.running=!1,ke("Clock: This module has been deprecated. Please use THREE.Timer instead.")}start(){this.startTime=performance.now(),this.oldTime=this.startTime,this.elapsedTime=0,this.running=!0}stop(){this.getElapsedTime(),this.running=!1,this.autoStart=!1}getElapsedTime(){return this.getDelta(),this.elapsedTime}getDelta(){let e=0;if(this.autoStart&&!this.running)return this.start(),0;if(this.running){let t=performance.now();e=(t-this.oldTime)/1e3,this.oldTime=t,this.elapsedTime+=e}return e}};var Yc=class Yc{constructor(e,t,n,i){this.elements=[1,0,0,1],e!==void 0&&this.set(e,t,n,i)}identity(){return this.set(1,0,0,1),this}fromArray(e,t=0){for(let n=0;n<4;n++)this.elements[n]=e[n+t];return this}set(e,t,n,i){let r=this.elements;return r[0]=e,r[2]=t,r[1]=n,r[3]=i,this}};Yc.prototype.isMatrix2=!0;var vc=Yc;function Vc(s,e,t,n){let i=wp(n);switch(t){case Dc:return s*e;case Fc:return s*e/i.components*i.byteLength;case Bo:return s*e/i.components*i.byteLength;case Qi:return s*e*2/i.components*i.byteLength;case zo:return s*e*2/i.components*i.byteLength;case Nc:return s*e*3/i.components*i.byteLength;case Pn:return s*e*4/i.components*i.byteLength;case ko:return s*e*4/i.components*i.byteLength;case fa:case da:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*8;case pa:case ma:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*16;case Vo:case Wo:return Math.max(s,16)*Math.max(e,8)/4;case Ho:case Go:return Math.max(s,8)*Math.max(e,8)/2;case Xo:case qo:case Zo:case $o:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*8;case Yo:case ga:case Ko:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*16;case Jo:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*16;case Qo:return Math.floor((s+4)/5)*Math.floor((e+3)/4)*16;case jo:return Math.floor((s+4)/5)*Math.floor((e+4)/5)*16;case el:return Math.floor((s+5)/6)*Math.floor((e+4)/5)*16;case tl:return Math.floor((s+5)/6)*Math.floor((e+5)/6)*16;case nl:return Math.floor((s+7)/8)*Math.floor((e+4)/5)*16;case il:return Math.floor((s+7)/8)*Math.floor((e+5)/6)*16;case sl:return Math.floor((s+7)/8)*Math.floor((e+7)/8)*16;case rl:return Math.floor((s+9)/10)*Math.floor((e+4)/5)*16;case al:return Math.floor((s+9)/10)*Math.floor((e+5)/6)*16;case ol:return Math.floor((s+9)/10)*Math.floor((e+7)/8)*16;case ll:return Math.floor((s+9)/10)*Math.floor((e+9)/10)*16;case cl:return Math.floor((s+11)/12)*Math.floor((e+9)/10)*16;case hl:return Math.floor((s+11)/12)*Math.floor((e+11)/12)*16;case ul:case fl:case dl:return Math.ceil(s/4)*Math.ceil(e/4)*16;case pl:case ml:return Math.ceil(s/4)*Math.ceil(e/4)*8;case xa:case gl:return Math.ceil(s/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function wp(s){switch(s){case yn:case Rc:return{byteLength:1,components:1};case or:case Ic:case li:return{byteLength:2,components:1};case Uo:case Oo:return{byteLength:2,components:4};case Zn:case Fo:case Un:return{byteLength:4,components:1};case Pc:case Lc:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${s}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"185"}}));typeof window<"u"&&(window.__THREE__?ke("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="185");function xf(){let s=null,e=!1,t=null,n=null;function i(r,a){t(r,a),n=s.requestAnimationFrame(i)}return{start:function(){e!==!0&&t!==null&&s!==null&&(n=s.requestAnimationFrame(i),e=!0)},stop:function(){s!==null&&s.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){s=r}}}function Cp(s){let e=new WeakMap;function t(o,l){let c=o.array,u=o.usage,h=c.byteLength,f=s.createBuffer();s.bindBuffer(l,f),s.bufferData(l,c,u),o.onUploadCallback();let d;if(c instanceof Float32Array)d=s.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)d=s.HALF_FLOAT;else if(c instanceof Uint16Array)o.isFloat16BufferAttribute?d=s.HALF_FLOAT:d=s.UNSIGNED_SHORT;else if(c instanceof Int16Array)d=s.SHORT;else if(c instanceof Uint32Array)d=s.UNSIGNED_INT;else if(c instanceof Int32Array)d=s.INT;else if(c instanceof Int8Array)d=s.BYTE;else if(c instanceof Uint8Array)d=s.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)d=s.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:f,type:d,bytesPerElement:c.BYTES_PER_ELEMENT,version:o.version,size:h}}function n(o,l,c){let u=l.array,h=l.updateRanges;if(s.bindBuffer(c,o),h.length===0)s.bufferSubData(c,0,u);else{h.sort((d,m)=>d.start-m.start);let f=0;for(let d=1;d<h.length;d++){let m=h[f],y=h[d];y.start<=m.start+m.count+1?m.count=Math.max(m.count,y.start+y.count-m.start):(++f,h[f]=y)}h.length=f+1;for(let d=0,m=h.length;d<m;d++){let y=h[d];s.bufferSubData(c,y.start*u.BYTES_PER_ELEMENT,u,y.start,y.count)}l.clearUpdateRanges()}l.onUploadCallback()}function i(o){return o.isInterleavedBufferAttribute&&(o=o.data),e.get(o)}function r(o){o.isInterleavedBufferAttribute&&(o=o.data);let l=e.get(o);l&&(s.deleteBuffer(l.buffer),e.delete(o))}function a(o,l){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){let u=e.get(o);(!u||u.version<o.version)&&e.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}let c=e.get(o);if(c===void 0)e.set(o,t(o,l));else if(c.version<o.version){if(c.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,o,l),c.version=o.version}}return{get:i,remove:r,update:a}}var Rp=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Ip=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,Pp=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Lp=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Dp=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Np=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Fp=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,Up=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Op=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,Bp=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,zp=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,kp=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Hp=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,Vp=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,Gp=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,Wp=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,Xp=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,qp=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Yp=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Zp=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,$p=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,Kp=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,Jp=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,Qp=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
#define inverseTransformDirection transformDirectionByInverseViewMatrix
vec3 transformNormalByInverseViewMatrix( in vec3 normal, in mat4 viewMatrix ) {
	return normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );
}
vec3 transformDirectionByInverseViewMatrix( in vec3 dir, in mat4 viewMatrix ) {
	return normalize( ( vec4( dir, 0.0 ) * viewMatrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,jp=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,em=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
#endif`,tm=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,nm=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,im=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,sm=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,rm="gl_FragColor = linearToOutputTexel( gl_FragColor );",am=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,om=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,lm=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,cm=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,hm=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,um=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,fm=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,dm=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,pm=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,mm=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,gm=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,xm=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,vm=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,_m=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,ym=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
#include <lightprobes_pars_fragment>`,Mm=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = transformDirectionByInverseViewMatrix( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,Sm=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,bm=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Em=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Tm=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,wm=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,Am=`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
		vec3 iridescenceFresnelDielectric;
		vec3 iridescenceFresnelMetallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		return 0.5 / max( gv + gl, EPSILON );
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
vec3 BRDF_GGX_Multiscatter( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 singleScatter = BRDF_GGX( lightDir, viewDir, normal, material );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 dfgV = texture2D( dfgLUT, vec2( material.roughness, dotNV ) ).rg;
	vec2 dfgL = texture2D( dfgLUT, vec2( material.roughness, dotNL ) ).rg;
	vec3 FssEss_V = material.specularColorBlended * dfgV.x + material.specularF90 * dfgV.y;
	vec3 FssEss_L = material.specularColorBlended * dfgL.x + material.specularF90 * dfgL.y;
	float Ess_V = dfgV.x + dfgV.y;
	float Ess_L = dfgL.x + dfgL.y;
	float Ems_V = 1.0 - Ess_V;
	float Ems_L = 1.0 - Ess_L;
	vec3 Favg = material.specularColorBlended + ( 1.0 - material.specularColorBlended ) * 0.047619;
	vec3 Fms = FssEss_V * FssEss_L * Favg / ( 1.0 - Ems_V * Ems_L * Favg + EPSILON );
	float compensationFactor = Ems_V * Ems_L;
	vec3 multiScatter = Fms * compensationFactor;
	return singleScatter + multiScatter;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX_Multiscatter( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseContribution );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution );
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnelDielectric, material.roughness, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceFresnelMetallic, material.roughness, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( geometryNormal, geometryViewDir, material.diffuseColor, material.specularF90, material.roughness, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,Cm=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( material.iridescenceFresnelDielectric, material.iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
	#ifdef USE_LIGHT_PROBES_GRID
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = transformNormalByInverseViewMatrix( geometryNormal, viewMatrix );
		irradiance += getLightProbeGridIrradiance( probeWorldPos, probeWorldNormal );
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,Rm=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_CUBE_UV )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,Im=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Pm=`#ifdef USE_LIGHT_PROBES_GRID
uniform highp sampler3D probesSH;
uniform vec3 probesMin;
uniform vec3 probesMax;
uniform vec3 probesResolution;
vec3 getLightProbeGridIrradiance( vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 resMinusOne = res - 1.0;
	vec3 probeSpacing = gridRange / resMinusOne;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.0, 1.0 );
	uvw = uvw * resMinusOne / res + 0.5 / res;
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,Lm=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Dm=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Nm=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Fm=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Um=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Om=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Bm=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,zm=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,km=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Hm=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Vm=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Gm=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Wm=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Xm=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,qm=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Ym=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#ifdef DOUBLE_SIDED
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#ifdef DOUBLE_SIDED
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,Zm=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,$m=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Km=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Jm=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,Qm=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,jm=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,eg=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,tg=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,ng=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,ig=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,sg=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,rg=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,ag=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,og=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,lg=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,cg=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,hg=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,ug=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				float radius = shadowRadius * texelSize.x;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float dp = ( shadowCameraNear * ( shadowCameraFar - viewSpaceZ ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp -= shadowBias;
			#else
				float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp += shadowBias;
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			vec2 sample0 = vogelDiskSample( 0, 5, phi );
			vec2 sample1 = vogelDiskSample( 1, 5, phi );
			vec2 sample2 = vogelDiskSample( 2, 5, phi );
			vec2 sample3 = vogelDiskSample( 3, 5, phi );
			vec2 sample4 = vogelDiskSample( 4, 5, phi );
			shadow = (
				texture( shadowMap, vec4( bd3D + ( tangent * sample0.x + bitangent * sample0.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample1.x + bitangent * sample1.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample2.x + bitangent * sample2.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample3.x + bitangent * sample3.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample4.x + bitangent * sample4.y ) * texelSize, dp ) )
			) * 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,fg=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,dg=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,pg=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,mg=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,gg=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,xg=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,vg=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,_g=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,yg=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,Mg=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,Sg=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,bg=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,Eg=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,Tg=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,wg=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Ag=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,Cg=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,Rg=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,Ig=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Pg=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Lg=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Dg=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Ng=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Fg=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,Ug=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,Og=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,Bg=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,zg=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,kg=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Hg=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Vg=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Gg=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,Wg=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Xg=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,qg=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Yg=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,Zg=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,$g=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,Kg=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,Jg=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Qg=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,jg=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,e0=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,t0=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,n0=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,i0=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,s0=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,r0=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,a0=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,o0=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,l0=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,ct={alphahash_fragment:Rp,alphahash_pars_fragment:Ip,alphamap_fragment:Pp,alphamap_pars_fragment:Lp,alphatest_fragment:Dp,alphatest_pars_fragment:Np,aomap_fragment:Fp,aomap_pars_fragment:Up,batching_pars_vertex:Op,batching_vertex:Bp,begin_vertex:zp,beginnormal_vertex:kp,bsdfs:Hp,iridescence_fragment:Vp,bumpmap_pars_fragment:Gp,clipping_planes_fragment:Wp,clipping_planes_pars_fragment:Xp,clipping_planes_pars_vertex:qp,clipping_planes_vertex:Yp,color_fragment:Zp,color_pars_fragment:$p,color_pars_vertex:Kp,color_vertex:Jp,common:Qp,cube_uv_reflection_fragment:jp,defaultnormal_vertex:em,displacementmap_pars_vertex:tm,displacementmap_vertex:nm,emissivemap_fragment:im,emissivemap_pars_fragment:sm,colorspace_fragment:rm,colorspace_pars_fragment:am,envmap_fragment:om,envmap_common_pars_fragment:lm,envmap_pars_fragment:cm,envmap_pars_vertex:hm,envmap_physical_pars_fragment:Mm,envmap_vertex:um,fog_vertex:fm,fog_pars_vertex:dm,fog_fragment:pm,fog_pars_fragment:mm,gradientmap_pars_fragment:gm,lightmap_pars_fragment:xm,lights_lambert_fragment:vm,lights_lambert_pars_fragment:_m,lights_pars_begin:ym,lights_toon_fragment:Sm,lights_toon_pars_fragment:bm,lights_phong_fragment:Em,lights_phong_pars_fragment:Tm,lights_physical_fragment:wm,lights_physical_pars_fragment:Am,lights_fragment_begin:Cm,lights_fragment_maps:Rm,lights_fragment_end:Im,lightprobes_pars_fragment:Pm,logdepthbuf_fragment:Lm,logdepthbuf_pars_fragment:Dm,logdepthbuf_pars_vertex:Nm,logdepthbuf_vertex:Fm,map_fragment:Um,map_pars_fragment:Om,map_particle_fragment:Bm,map_particle_pars_fragment:zm,metalnessmap_fragment:km,metalnessmap_pars_fragment:Hm,morphinstance_vertex:Vm,morphcolor_vertex:Gm,morphnormal_vertex:Wm,morphtarget_pars_vertex:Xm,morphtarget_vertex:qm,normal_fragment_begin:Ym,normal_fragment_maps:Zm,normal_pars_fragment:$m,normal_pars_vertex:Km,normal_vertex:Jm,normalmap_pars_fragment:Qm,clearcoat_normal_fragment_begin:jm,clearcoat_normal_fragment_maps:eg,clearcoat_pars_fragment:tg,iridescence_pars_fragment:ng,opaque_fragment:ig,packing:sg,premultiplied_alpha_fragment:rg,project_vertex:ag,dithering_fragment:og,dithering_pars_fragment:lg,roughnessmap_fragment:cg,roughnessmap_pars_fragment:hg,shadowmap_pars_fragment:ug,shadowmap_pars_vertex:fg,shadowmap_vertex:dg,shadowmask_pars_fragment:pg,skinbase_vertex:mg,skinning_pars_vertex:gg,skinning_vertex:xg,skinnormal_vertex:vg,specularmap_fragment:_g,specularmap_pars_fragment:yg,tonemapping_fragment:Mg,tonemapping_pars_fragment:Sg,transmission_fragment:bg,transmission_pars_fragment:Eg,uv_pars_fragment:Tg,uv_pars_vertex:wg,uv_vertex:Ag,worldpos_vertex:Cg,background_vert:Rg,background_frag:Ig,backgroundCube_vert:Pg,backgroundCube_frag:Lg,cube_vert:Dg,cube_frag:Ng,depth_vert:Fg,depth_frag:Ug,distance_vert:Og,distance_frag:Bg,equirect_vert:zg,equirect_frag:kg,linedashed_vert:Hg,linedashed_frag:Vg,meshbasic_vert:Gg,meshbasic_frag:Wg,meshlambert_vert:Xg,meshlambert_frag:qg,meshmatcap_vert:Yg,meshmatcap_frag:Zg,meshnormal_vert:$g,meshnormal_frag:Kg,meshphong_vert:Jg,meshphong_frag:Qg,meshphysical_vert:jg,meshphysical_frag:e0,meshtoon_vert:t0,meshtoon_frag:n0,points_vert:i0,points_frag:s0,shadow_vert:r0,shadow_frag:a0,sprite_vert:o0,sprite_frag:l0},we={common:{diffuse:{value:new Ve(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Qe},alphaMap:{value:null},alphaMapTransform:{value:new Qe},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Qe}},envmap:{envMap:{value:null},envMapRotation:{value:new Qe},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Qe}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Qe}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Qe},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Qe},normalScale:{value:new Ke(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Qe},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Qe}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Qe}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Qe}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Ve(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new N},probesMax:{value:new N},probesResolution:{value:new N}},points:{diffuse:{value:new Ve(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Qe},alphaTest:{value:0},uvTransform:{value:new Qe}},sprite:{diffuse:{value:new Ve(16777215)},opacity:{value:1},center:{value:new Ke(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Qe},alphaMap:{value:null},alphaMapTransform:{value:new Qe},alphaTest:{value:0}}},hi={basic:{uniforms:pn([we.common,we.specularmap,we.envmap,we.aomap,we.lightmap,we.fog]),vertexShader:ct.meshbasic_vert,fragmentShader:ct.meshbasic_frag},lambert:{uniforms:pn([we.common,we.specularmap,we.envmap,we.aomap,we.lightmap,we.emissivemap,we.bumpmap,we.normalmap,we.displacementmap,we.fog,we.lights,{emissive:{value:new Ve(0)},envMapIntensity:{value:1}}]),vertexShader:ct.meshlambert_vert,fragmentShader:ct.meshlambert_frag},phong:{uniforms:pn([we.common,we.specularmap,we.envmap,we.aomap,we.lightmap,we.emissivemap,we.bumpmap,we.normalmap,we.displacementmap,we.fog,we.lights,{emissive:{value:new Ve(0)},specular:{value:new Ve(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:ct.meshphong_vert,fragmentShader:ct.meshphong_frag},standard:{uniforms:pn([we.common,we.envmap,we.aomap,we.lightmap,we.emissivemap,we.bumpmap,we.normalmap,we.displacementmap,we.roughnessmap,we.metalnessmap,we.fog,we.lights,{emissive:{value:new Ve(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:ct.meshphysical_vert,fragmentShader:ct.meshphysical_frag},toon:{uniforms:pn([we.common,we.aomap,we.lightmap,we.emissivemap,we.bumpmap,we.normalmap,we.displacementmap,we.gradientmap,we.fog,we.lights,{emissive:{value:new Ve(0)}}]),vertexShader:ct.meshtoon_vert,fragmentShader:ct.meshtoon_frag},matcap:{uniforms:pn([we.common,we.bumpmap,we.normalmap,we.displacementmap,we.fog,{matcap:{value:null}}]),vertexShader:ct.meshmatcap_vert,fragmentShader:ct.meshmatcap_frag},points:{uniforms:pn([we.points,we.fog]),vertexShader:ct.points_vert,fragmentShader:ct.points_frag},dashed:{uniforms:pn([we.common,we.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:ct.linedashed_vert,fragmentShader:ct.linedashed_frag},depth:{uniforms:pn([we.common,we.displacementmap]),vertexShader:ct.depth_vert,fragmentShader:ct.depth_frag},normal:{uniforms:pn([we.common,we.bumpmap,we.normalmap,we.displacementmap,{opacity:{value:1}}]),vertexShader:ct.meshnormal_vert,fragmentShader:ct.meshnormal_frag},sprite:{uniforms:pn([we.sprite,we.fog]),vertexShader:ct.sprite_vert,fragmentShader:ct.sprite_frag},background:{uniforms:{uvTransform:{value:new Qe},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:ct.background_vert,fragmentShader:ct.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Qe}},vertexShader:ct.backgroundCube_vert,fragmentShader:ct.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:ct.cube_vert,fragmentShader:ct.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:ct.equirect_vert,fragmentShader:ct.equirect_frag},distance:{uniforms:pn([we.common,we.displacementmap,{referencePosition:{value:new N},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:ct.distance_vert,fragmentShader:ct.distance_frag},shadow:{uniforms:pn([we.lights,we.fog,{color:{value:new Ve(0)},opacity:{value:1}}]),vertexShader:ct.shadow_vert,fragmentShader:ct.shadow_frag}};hi.physical={uniforms:pn([hi.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Qe},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Qe},clearcoatNormalScale:{value:new Ke(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Qe},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Qe},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Qe},sheen:{value:0},sheenColor:{value:new Ve(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Qe},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Qe},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Qe},transmissionSamplerSize:{value:new Ke},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Qe},attenuationDistance:{value:0},attenuationColor:{value:new Ve(0)},specularColor:{value:new Ve(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Qe},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Qe},anisotropyVector:{value:new Ke},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Qe}}]),vertexShader:ct.meshphysical_vert,fragmentShader:ct.meshphysical_frag};var yl={r:0,b:0,g:0},c0=new He,vf=new Qe;vf.set(-1,0,0,0,1,0,0,0,1);function h0(s,e,t,n,i,r){let a=new Ve(0),o=i===!0?0:1,l,c,u=null,h=0,f=null;function d(E){let S=E.isScene===!0?E.background:null;if(S&&S.isTexture){let _=E.backgroundBlurriness>0;S=e.get(S,_)}return S}function m(E){let S=!1,_=d(E);_===null?g(a,o):_&&_.isColor&&(g(_,1),S=!0);let C=s.xr.getEnvironmentBlendMode();C==="additive"?t.buffers.color.setClear(0,0,0,1,r):C==="alpha-blend"&&t.buffers.color.setClear(0,0,0,0,r),(s.autoClear||S)&&(t.buffers.depth.setTest(!0),t.buffers.depth.setMask(!0),t.buffers.color.setMask(!0),s.clear(s.autoClearColor,s.autoClearDepth,s.autoClearStencil))}function y(E,S){let _=d(S);_&&(_.isCubeTexture||_.mapping===ha)?(c===void 0&&(c=new pt(new zi(1,1,1),new In({name:"BackgroundCubeMaterial",uniforms:Es(hi.backgroundCube.uniforms),vertexShader:hi.backgroundCube.vertexShader,fragmentShader:hi.backgroundCube.fragmentShader,side:vn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),c.geometry.deleteAttribute("uv"),c.onBeforeRender=function(C,b,I){this.matrixWorld.copyPosition(I.matrixWorld)},Object.defineProperty(c.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),n.update(c)),c.material.uniforms.envMap.value=_,c.material.uniforms.backgroundBlurriness.value=S.backgroundBlurriness,c.material.uniforms.backgroundIntensity.value=S.backgroundIntensity,c.material.uniforms.backgroundRotation.value.setFromMatrix4(c0.makeRotationFromEuler(S.backgroundRotation)).transpose(),_.isCubeTexture&&_.isRenderTargetTexture===!1&&c.material.uniforms.backgroundRotation.value.premultiply(vf),c.material.toneMapped=et.getTransfer(_.colorSpace)!==Et,(u!==_||h!==_.version||f!==s.toneMapping)&&(c.material.needsUpdate=!0,u=_,h=_.version,f=s.toneMapping),c.layers.enableAll(),E.unshift(c,c.geometry,c.material,0,0,null)):_&&_.isTexture&&(l===void 0&&(l=new pt(new ai(2,2),new In({name:"BackgroundMaterial",uniforms:Es(hi.background.uniforms),vertexShader:hi.background.vertexShader,fragmentShader:hi.background.fragmentShader,side:vi,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),n.update(l)),l.material.uniforms.t2D.value=_,l.material.uniforms.backgroundIntensity.value=S.backgroundIntensity,l.material.toneMapped=et.getTransfer(_.colorSpace)!==Et,_.matrixAutoUpdate===!0&&_.updateMatrix(),l.material.uniforms.uvTransform.value.copy(_.matrix),(u!==_||h!==_.version||f!==s.toneMapping)&&(l.material.needsUpdate=!0,u=_,h=_.version,f=s.toneMapping),l.layers.enableAll(),E.unshift(l,l.geometry,l.material,0,0,null))}function g(E,S){E.getRGB(yl,zc(s)),t.buffers.color.setClear(yl.r,yl.g,yl.b,S,r)}function p(){c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return a},setClearColor:function(E,S=1){a.set(E),o=S,g(a,o)},getClearAlpha:function(){return o},setClearAlpha:function(E){o=E,g(a,o)},render:m,addToRenderList:y,dispose:p}}function u0(s,e){let t=s.getParameter(s.MAX_VERTEX_ATTRIBS),n={},i=f(null),r=i,a=!1;function o(L,F,K,J,z){let Q=!1,$=h(L,J,K,F);r!==$&&(r=$,c(r.object)),Q=d(L,J,K,z),Q&&m(L,J,K,z),z!==null&&e.update(z,s.ELEMENT_ARRAY_BUFFER),(Q||a)&&(a=!1,_(L,F,K,J),z!==null&&s.bindBuffer(s.ELEMENT_ARRAY_BUFFER,e.get(z).buffer))}function l(){return s.createVertexArray()}function c(L){return s.bindVertexArray(L)}function u(L){return s.deleteVertexArray(L)}function h(L,F,K,J){let z=J.wireframe===!0,Q=n[F.id];Q===void 0&&(Q={},n[F.id]=Q);let $=L.isInstancedMesh===!0?L.id:0,se=Q[$];se===void 0&&(se={},Q[$]=se);let oe=se[K.id];oe===void 0&&(oe={},se[K.id]=oe);let he=oe[z];return he===void 0&&(he=f(l()),oe[z]=he),he}function f(L){let F=[],K=[],J=[];for(let z=0;z<t;z++)F[z]=0,K[z]=0,J[z]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:F,enabledAttributes:K,attributeDivisors:J,object:L,attributes:{},index:null}}function d(L,F,K,J){let z=r.attributes,Q=F.attributes,$=0,se=K.getAttributes();for(let oe in se)if(se[oe].location>=0){let fe=z[oe],Ae=Q[oe];if(Ae===void 0&&(oe==="instanceMatrix"&&L.instanceMatrix&&(Ae=L.instanceMatrix),oe==="instanceColor"&&L.instanceColor&&(Ae=L.instanceColor)),fe===void 0||fe.attribute!==Ae||Ae&&fe.data!==Ae.data)return!0;$++}return r.attributesNum!==$||r.index!==J}function m(L,F,K,J){let z={},Q=F.attributes,$=0,se=K.getAttributes();for(let oe in se)if(se[oe].location>=0){let fe=Q[oe];fe===void 0&&(oe==="instanceMatrix"&&L.instanceMatrix&&(fe=L.instanceMatrix),oe==="instanceColor"&&L.instanceColor&&(fe=L.instanceColor));let Ae={};Ae.attribute=fe,fe&&fe.data&&(Ae.data=fe.data),z[oe]=Ae,$++}r.attributes=z,r.attributesNum=$,r.index=J}function y(){let L=r.newAttributes;for(let F=0,K=L.length;F<K;F++)L[F]=0}function g(L){p(L,0)}function p(L,F){let K=r.newAttributes,J=r.enabledAttributes,z=r.attributeDivisors;K[L]=1,J[L]===0&&(s.enableVertexAttribArray(L),J[L]=1),z[L]!==F&&(s.vertexAttribDivisor(L,F),z[L]=F)}function E(){let L=r.newAttributes,F=r.enabledAttributes;for(let K=0,J=F.length;K<J;K++)F[K]!==L[K]&&(s.disableVertexAttribArray(K),F[K]=0)}function S(L,F,K,J,z,Q,$){$===!0?s.vertexAttribIPointer(L,F,K,z,Q):s.vertexAttribPointer(L,F,K,J,z,Q)}function _(L,F,K,J){y();let z=J.attributes,Q=K.getAttributes(),$=F.defaultAttributeValues;for(let se in Q){let oe=Q[se];if(oe.location>=0){let he=z[se];if(he===void 0&&(se==="instanceMatrix"&&L.instanceMatrix&&(he=L.instanceMatrix),se==="instanceColor"&&L.instanceColor&&(he=L.instanceColor)),he!==void 0){let fe=he.normalized,Ae=he.itemSize,st=e.get(he);if(st===void 0)continue;let yt=st.buffer,rt=st.type,ie=st.bytesPerElement,de=rt===s.INT||rt===s.UNSIGNED_INT||he.gpuType===Fo;if(he.isInterleavedBufferAttribute){let le=he.data,Pe=le.stride,qe=he.offset;if(le.isInstancedInterleavedBuffer){for(let Le=0;Le<oe.locationSize;Le++)p(oe.location+Le,le.meshPerAttribute);L.isInstancedMesh!==!0&&J._maxInstanceCount===void 0&&(J._maxInstanceCount=le.meshPerAttribute*le.count)}else for(let Le=0;Le<oe.locationSize;Le++)g(oe.location+Le);s.bindBuffer(s.ARRAY_BUFFER,yt);for(let Le=0;Le<oe.locationSize;Le++)S(oe.location+Le,Ae/oe.locationSize,rt,fe,Pe*ie,(qe+Ae/oe.locationSize*Le)*ie,de)}else{if(he.isInstancedBufferAttribute){for(let le=0;le<oe.locationSize;le++)p(oe.location+le,he.meshPerAttribute);L.isInstancedMesh!==!0&&J._maxInstanceCount===void 0&&(J._maxInstanceCount=he.meshPerAttribute*he.count)}else for(let le=0;le<oe.locationSize;le++)g(oe.location+le);s.bindBuffer(s.ARRAY_BUFFER,yt);for(let le=0;le<oe.locationSize;le++)S(oe.location+le,Ae/oe.locationSize,rt,fe,Ae*ie,Ae/oe.locationSize*le*ie,de)}}else if($!==void 0){let fe=$[se];if(fe!==void 0)switch(fe.length){case 2:s.vertexAttrib2fv(oe.location,fe);break;case 3:s.vertexAttrib3fv(oe.location,fe);break;case 4:s.vertexAttrib4fv(oe.location,fe);break;default:s.vertexAttrib1fv(oe.location,fe)}}}}E()}function C(){T();for(let L in n){let F=n[L];for(let K in F){let J=F[K];for(let z in J){let Q=J[z];for(let $ in Q)u(Q[$].object),delete Q[$];delete J[z]}}delete n[L]}}function b(L){if(n[L.id]===void 0)return;let F=n[L.id];for(let K in F){let J=F[K];for(let z in J){let Q=J[z];for(let $ in Q)u(Q[$].object),delete Q[$];delete J[z]}}delete n[L.id]}function I(L){for(let F in n){let K=n[F];for(let J in K){let z=K[J];if(z[L.id]===void 0)continue;let Q=z[L.id];for(let $ in Q)u(Q[$].object),delete Q[$];delete z[L.id]}}}function v(L){for(let F in n){let K=n[F],J=L.isInstancedMesh===!0?L.id:0,z=K[J];if(z!==void 0){for(let Q in z){let $=z[Q];for(let se in $)u($[se].object),delete $[se];delete z[Q]}delete K[J],Object.keys(K).length===0&&delete n[F]}}}function T(){P(),a=!0,r!==i&&(r=i,c(r.object))}function P(){i.geometry=null,i.program=null,i.wireframe=!1}return{setup:o,reset:T,resetDefaultState:P,dispose:C,releaseStatesOfGeometry:b,releaseStatesOfObject:v,releaseStatesOfProgram:I,initAttributes:y,enableAttribute:g,disableUnusedAttributes:E}}function f0(s,e,t){let n;function i(l){n=l}function r(l,c){s.drawArrays(n,l,c),t.update(c,n,1)}function a(l,c,u){u!==0&&(s.drawArraysInstanced(n,l,c,u),t.update(c,n,u))}function o(l,c,u){if(u===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,l,0,c,0,u);let f=0;for(let d=0;d<u;d++)f+=c[d];t.update(f,n,1)}this.setMode=i,this.render=r,this.renderInstances=a,this.renderMultiDraw=o}function d0(s,e,t,n){let i;function r(){if(i!==void 0)return i;if(e.has("EXT_texture_filter_anisotropic")===!0){let I=e.get("EXT_texture_filter_anisotropic");i=s.getParameter(I.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else i=0;return i}function a(I){return!(I!==Pn&&n.convert(I)!==s.getParameter(s.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(I){let v=I===li&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(I!==yn&&n.convert(I)!==s.getParameter(s.IMPLEMENTATION_COLOR_READ_TYPE)&&I!==Un&&!v)}function l(I){if(I==="highp"){if(s.getShaderPrecisionFormat(s.VERTEX_SHADER,s.HIGH_FLOAT).precision>0&&s.getShaderPrecisionFormat(s.FRAGMENT_SHADER,s.HIGH_FLOAT).precision>0)return"highp";I="mediump"}return I==="mediump"&&s.getShaderPrecisionFormat(s.VERTEX_SHADER,s.MEDIUM_FLOAT).precision>0&&s.getShaderPrecisionFormat(s.FRAGMENT_SHADER,s.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=t.precision!==void 0?t.precision:"highp",u=l(c);u!==c&&(ke("WebGLRenderer:",c,"not supported, using",u,"instead."),c=u);let h=t.logarithmicDepthBuffer===!0,f=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control");t.reversedDepthBuffer===!0&&f===!1&&ke("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");let d=s.getParameter(s.MAX_TEXTURE_IMAGE_UNITS),m=s.getParameter(s.MAX_VERTEX_TEXTURE_IMAGE_UNITS),y=s.getParameter(s.MAX_TEXTURE_SIZE),g=s.getParameter(s.MAX_CUBE_MAP_TEXTURE_SIZE),p=s.getParameter(s.MAX_VERTEX_ATTRIBS),E=s.getParameter(s.MAX_VERTEX_UNIFORM_VECTORS),S=s.getParameter(s.MAX_VARYING_VECTORS),_=s.getParameter(s.MAX_FRAGMENT_UNIFORM_VECTORS),C=s.getParameter(s.MAX_SAMPLES),b=s.getParameter(s.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:a,textureTypeReadable:o,precision:c,logarithmicDepthBuffer:h,reversedDepthBuffer:f,maxTextures:d,maxVertexTextures:m,maxTextureSize:y,maxCubemapSize:g,maxAttributes:p,maxVertexUniforms:E,maxVaryings:S,maxFragmentUniforms:_,maxSamples:C,samples:b}}function p0(s){let e=this,t=null,n=0,i=!1,r=!1,a=new ni,o=new Qe,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(h,f){let d=h.length!==0||f||n!==0||i;return i=f,n=h.length,d},this.beginShadows=function(){r=!0,u(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(h,f){t=u(h,f,0)},this.setState=function(h,f,d){let m=h.clippingPlanes,y=h.clipIntersection,g=h.clipShadows,p=s.get(h);if(!i||m===null||m.length===0||r&&!g)r?u(null):c();else{let E=r?0:n,S=E*4,_=p.clippingState||null;l.value=_,_=u(m,f,S,d);for(let C=0;C!==S;++C)_[C]=t[C];p.clippingState=_,this.numIntersection=y?this.numPlanes:0,this.numPlanes+=E}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function u(h,f,d,m){let y=h!==null?h.length:0,g=null;if(y!==0){if(g=l.value,m!==!0||g===null){let p=d+y*4,E=f.matrixWorldInverse;o.getNormalMatrix(E),(g===null||g.length<p)&&(g=new Float32Array(p));for(let S=0,_=d;S!==y;++S,_+=4)a.copy(h[S]).applyMatrix4(E,o),a.normal.toArray(g,_),g[_+3]=a.constant}l.value=g,l.needsUpdate=!0}return e.numPlanes=y,e.numIntersection=0,g}}var es=4,Zu=[.125,.215,.35,.446,.526,.582],Ts=20,m0=256,ya=new ir,$u=new Ve,Zc=null,$c=0,Kc=0,Jc=!1,g0=new N,Sl=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._sigmas=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(e,t=0,n=.1,i=100,r={}){let{size:a=256,position:o=g0}=r;Zc=this._renderer.getRenderTarget(),$c=this._renderer.getActiveCubeFace(),Kc=this._renderer.getActiveMipmapLevel(),Jc=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(a);let l=this._allocateTargets();return l.depthBuffer=!0,this._sceneToCubeUV(e,n,i,l,o),t>0&&this._blur(l,0,0,t),this._applyPMREM(l),this._cleanup(l),l}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Qu(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Ju(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodMeshes.length;e++)this._lodMeshes[e].geometry.dispose()}_cleanup(e){this._renderer.setRenderTarget(Zc,$c,Kc),this._renderer.xr.enabled=Jc,e.scissorTest=!1,hr(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===$i||e.mapping===bs?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),Zc=this._renderer.getRenderTarget(),$c=this._renderer.getActiveCubeFace(),Kc=this._renderer.getActiveMipmapLevel(),Jc=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:on,minFilter:on,generateMipmaps:!1,type:li,format:Pn,colorSpace:Rr,depthBuffer:!1},i=Ku(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Ku(e,t,n);let{_lodMax:r}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods,sigmas:this._sigmas}=x0(r)),this._blurMaterial=_0(r,e,t),this._ggxMaterial=v0(r,e,t)}return i}_compileMaterial(e){let t=new pt(new Wt,e);this._renderer.compile(t,ya)}_sceneToCubeUV(e,t,n,i,r){let l=new Yt(90,1,t,n),c=[1,-1,1,1,1,1],u=[1,1,1,-1,-1,-1],h=this._renderer,f=h.autoClear,d=h.toneMapping;h.getClearColor($u),h.toneMapping=Yn,h.autoClear=!1,h.state.buffers.depth.getReversed()&&(h.setRenderTarget(i),h.clearDepth(),h.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new pt(new zi,new Rn({name:"PMREM.Background",side:vn,depthWrite:!1,depthTest:!1})));let y=this._backgroundBox,g=y.material,p=!1,E=e.background;E?E.isColor&&(g.color.copy(E),e.background=null,p=!0):(g.color.copy($u),p=!0);for(let S=0;S<6;S++){let _=S%3;_===0?(l.up.set(0,c[S],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x+u[S],r.y,r.z)):_===1?(l.up.set(0,0,c[S]),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y+u[S],r.z)):(l.up.set(0,c[S],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y,r.z+u[S]));let C=this._cubeSize;hr(i,_*C,S>2?C:0,C,C),h.setRenderTarget(i),p&&h.render(y,l),h.render(e,l)}h.toneMapping=d,h.autoClear=f,e.background=E}_textureToCubeUV(e,t){let n=this._renderer,i=e.mapping===$i||e.mapping===bs;i?(this._cubemapMaterial===null&&(this._cubemapMaterial=Qu()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Ju());let r=i?this._cubemapMaterial:this._equirectMaterial,a=this._lodMeshes[0];a.material=r;let o=r.uniforms;o.envMap.value=e;let l=this._cubeSize;hr(t,0,0,3*l,2*l),n.setRenderTarget(t),n.render(a,ya)}_applyPMREM(e){let t=this._renderer,n=t.autoClear;t.autoClear=!1;let i=this._lodMeshes.length;for(let r=1;r<i;r++)this._applyGGXFilter(e,r-1,r);t.autoClear=n}_applyGGXFilter(e,t,n){let i=this._renderer,r=this._pingPongRenderTarget,a=this._ggxMaterial,o=this._lodMeshes[n];o.material=a;let l=a.uniforms,c=n/(this._lodMeshes.length-1),u=t/(this._lodMeshes.length-1),h=Math.sqrt(c*c-u*u),f=0+c*1.25,d=h*f,{_lodMax:m}=this,y=this._sizeLods[n],g=3*y*(n>m-es?n-m+es:0),p=4*(this._cubeSize-y);l.envMap.value=e.texture,l.roughness.value=d,l.mipInt.value=m-t,hr(r,g,p,3*y,2*y),i.setRenderTarget(r),i.render(o,ya),l.envMap.value=r.texture,l.roughness.value=0,l.mipInt.value=m-n,hr(e,g,p,3*y,2*y),i.setRenderTarget(e),i.render(o,ya)}_blur(e,t,n,i,r){let a=this._pingPongRenderTarget;this._halfBlur(e,a,t,n,i,"latitudinal",r),this._halfBlur(a,e,n,n,i,"longitudinal",r)}_halfBlur(e,t,n,i,r,a,o){let l=this._renderer,c=this._blurMaterial;a!=="latitudinal"&&a!=="longitudinal"&&Ye("blur direction must be either latitudinal or longitudinal!");let u=3,h=this._lodMeshes[i];h.material=c;let f=c.uniforms,d=this._sizeLods[n]-1,m=isFinite(r)?Math.PI/(2*d):2*Math.PI/(2*Ts-1),y=r/m,g=isFinite(r)?1+Math.floor(u*y):Ts;g>Ts&&ke(`sigmaRadians, ${r}, is too large and will clip, as it requested ${g} samples when the maximum is set to ${Ts}`);let p=[],E=0;for(let I=0;I<Ts;++I){let v=I/y,T=Math.exp(-v*v/2);p.push(T),I===0?E+=T:I<g&&(E+=2*T)}for(let I=0;I<p.length;I++)p[I]=p[I]/E;f.envMap.value=e.texture,f.samples.value=g,f.weights.value=p,f.latitudinal.value=a==="latitudinal",o&&(f.poleAxis.value=o);let{_lodMax:S}=this;f.dTheta.value=m,f.mipInt.value=S-n;let _=this._sizeLods[i],C=3*_*(i>S-es?i-S+es:0),b=4*(this._cubeSize-_);hr(t,C,b,3*_,2*_),l.setRenderTarget(t),l.render(h,ya)}};function x0(s){let e=[],t=[],n=[],i=s,r=s-es+1+Zu.length;for(let a=0;a<r;a++){let o=Math.pow(2,i);e.push(o);let l=1/o;a>s-es?l=Zu[a-s+es-1]:a===0&&(l=0),t.push(l);let c=1/(o-2),u=-c,h=1+c,f=[u,u,h,u,h,h,u,u,h,h,u,h],d=6,m=6,y=3,g=2,p=1,E=new Float32Array(y*m*d),S=new Float32Array(g*m*d),_=new Float32Array(p*m*d);for(let b=0;b<d;b++){let I=b%3*2/3-1,v=b>2?0:-1,T=[I,v,0,I+2/3,v,0,I+2/3,v+1,0,I,v,0,I+2/3,v+1,0,I,v+1,0];E.set(T,y*m*b),S.set(f,g*m*b);let P=[b,b,b,b,b,b];_.set(P,p*m*b)}let C=new Wt;C.setAttribute("position",new An(E,y)),C.setAttribute("uv",new An(S,g)),C.setAttribute("faceIndex",new An(_,p)),n.push(new pt(C,null)),i>es&&i--}return{lodMeshes:n,sizeLods:e,sigmas:t}}function Ku(s,e,t){let n=new Cn(s,e,t);return n.texture.mapping=ha,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function hr(s,e,t,n,i){s.viewport.set(e,t,n,i),s.scissor.set(e,t,n,i)}function v0(s,e,t){return new In({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:m0,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${s}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:Tl(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float roughness;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359

			// Van der Corput radical inverse
			float radicalInverse_VdC(uint bits) {
				bits = (bits << 16u) | (bits >> 16u);
				bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
				bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
				bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
				bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
				return float(bits) * 2.3283064365386963e-10; // / 0x100000000
			}

			// Hammersley sequence
			vec2 hammersley(uint i, uint N) {
				return vec2(float(i) / float(N), radicalInverse_VdC(i));
			}

			// GGX VNDF importance sampling (Eric Heitz 2018)
			// "Sampling the GGX Distribution of Visible Normals"
			// https://jcgt.org/published/0007/04/01/
			vec3 importanceSampleGGX_VNDF(vec2 Xi, vec3 V, float roughness) {
				float alpha = roughness * roughness;

				// Section 4.1: Orthonormal basis
				vec3 T1 = vec3(1.0, 0.0, 0.0);
				vec3 T2 = cross(V, T1);

				// Section 4.2: Parameterization of projected area
				float r = sqrt(Xi.x);
				float phi = 2.0 * PI * Xi.y;
				float t1 = r * cos(phi);
				float t2 = r * sin(phi);
				float s = 0.5 * (1.0 + V.z);
				t2 = (1.0 - s) * sqrt(1.0 - t1 * t1) + s * t2;

				// Section 4.3: Reprojection onto hemisphere
				vec3 Nh = t1 * T1 + t2 * T2 + sqrt(max(0.0, 1.0 - t1 * t1 - t2 * t2)) * V;

				// Section 3.4: Transform back to ellipsoid configuration
				return normalize(vec3(alpha * Nh.x, alpha * Nh.y, max(0.0, Nh.z)));
			}

			void main() {
				vec3 N = normalize(vOutputDirection);
				vec3 V = N; // Assume view direction equals normal for pre-filtering

				vec3 prefilteredColor = vec3(0.0);
				float totalWeight = 0.0;

				// For very low roughness, just sample the environment directly
				if (roughness < 0.001) {
					gl_FragColor = vec4(bilinearCubeUV(envMap, N, mipInt), 1.0);
					return;
				}

				// Tangent space basis for VNDF sampling
				vec3 up = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
				vec3 tangent = normalize(cross(up, N));
				vec3 bitangent = cross(N, tangent);

				for(uint i = 0u; i < uint(GGX_SAMPLES); i++) {
					vec2 Xi = hammersley(i, uint(GGX_SAMPLES));

					// For PMREM, V = N, so in tangent space V is always (0, 0, 1)
					vec3 H_tangent = importanceSampleGGX_VNDF(Xi, vec3(0.0, 0.0, 1.0), roughness);

					// Transform H back to world space
					vec3 H = normalize(tangent * H_tangent.x + bitangent * H_tangent.y + N * H_tangent.z);
					vec3 L = normalize(2.0 * dot(V, H) * H - V);

					float NdotL = max(dot(N, L), 0.0);

					if(NdotL > 0.0) {
						// Sample environment at fixed mip level
						// VNDF importance sampling handles the distribution filtering
						vec3 sampleColor = bilinearCubeUV(envMap, L, mipInt);

						// Weight by NdotL for the split-sum approximation
						// VNDF PDF naturally accounts for the visible microfacet distribution
						prefilteredColor += sampleColor * NdotL;
						totalWeight += NdotL;
					}
				}

				if (totalWeight > 0.0) {
					prefilteredColor = prefilteredColor / totalWeight;
				}

				gl_FragColor = vec4(prefilteredColor, 1.0);
			}
		`,blending:oi,depthTest:!1,depthWrite:!1})}function _0(s,e,t){let n=new Float32Array(Ts),i=new N(0,1,0);return new In({name:"SphericalGaussianBlur",defines:{n:Ts,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${s}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:i}},vertexShader:Tl(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:oi,depthTest:!1,depthWrite:!1})}function Ju(){return new In({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Tl(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:oi,depthTest:!1,depthWrite:!1})}function Qu(){return new In({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Tl(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:oi,depthTest:!1,depthWrite:!1})}function Tl(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}var bl=class extends Cn{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let n={width:e,height:e,depth:1},i=[n,n,n,n,n,n];this.texture=new kr(i),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},i=new zi(5,5,5),r=new In({name:"CubemapFromEquirect",uniforms:Es(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:vn,blending:oi});r.uniforms.tEquirect.value=t;let a=new pt(i,r),o=t.minFilter;return t.minFilter===Ki&&(t.minFilter=on),new Ao(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t=!0,n=!0,i=!0){let r=e.getRenderTarget();for(let a=0;a<6;a++)e.setRenderTarget(this,a),e.clear(t,n,i);e.setRenderTarget(r)}};function y0(s){let e=new WeakMap,t=new WeakMap,n=null;function i(f,d=!1){return f==null?null:d?a(f):r(f)}function r(f){if(f&&f.isTexture){let d=f.mapping;if(d===ar||d===Do)if(e.has(f)){let m=e.get(f).texture;return o(m,f.mapping)}else{let m=f.image;if(m&&m.height>0){let y=new bl(m.height);return y.fromEquirectangularTexture(s,f),e.set(f,y),f.addEventListener("dispose",c),o(y.texture,f.mapping)}else return null}}return f}function a(f){if(f&&f.isTexture){let d=f.mapping,m=d===ar||d===Do,y=d===$i||d===bs;if(m||y){let g=t.get(f),p=g!==void 0?g.texture.pmremVersion:0;if(f.isRenderTargetTexture&&f.pmremVersion!==p)return n===null&&(n=new Sl(s)),g=m?n.fromEquirectangular(f,g):n.fromCubemap(f,g),g.texture.pmremVersion=f.pmremVersion,t.set(f,g),g.texture;if(g!==void 0)return g.texture;{let E=f.image;return m&&E&&E.height>0||y&&E&&l(E)?(n===null&&(n=new Sl(s)),g=m?n.fromEquirectangular(f):n.fromCubemap(f),g.texture.pmremVersion=f.pmremVersion,t.set(f,g),f.addEventListener("dispose",u),g.texture):null}}}return f}function o(f,d){return d===ar?f.mapping=$i:d===Do&&(f.mapping=bs),f}function l(f){let d=0,m=6;for(let y=0;y<m;y++)f[y]!==void 0&&d++;return d===m}function c(f){let d=f.target;d.removeEventListener("dispose",c);let m=e.get(d);m!==void 0&&(e.delete(d),m.dispose())}function u(f){let d=f.target;d.removeEventListener("dispose",u);let m=t.get(d);m!==void 0&&(t.delete(d),m.dispose())}function h(){e=new WeakMap,t=new WeakMap,n!==null&&(n.dispose(),n=null)}return{get:i,dispose:h}}function M0(s){let e={};function t(n){if(e[n]!==void 0)return e[n];let i=s.getExtension(n);return e[n]=i,i}return{has:function(n){return t(n)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(n){let i=t(n);return i===null&&ds("WebGLRenderer: "+n+" extension not supported."),i}}}function S0(s,e,t,n){let i={},r=new WeakMap;function a(h){let f=h.target;f.index!==null&&e.remove(f.index);for(let m in f.attributes)e.remove(f.attributes[m]);f.removeEventListener("dispose",a),delete i[f.id];let d=r.get(f);d&&(e.remove(d),r.delete(f)),n.releaseStatesOfGeometry(f),f.isInstancedBufferGeometry===!0&&delete f._maxInstanceCount,t.memory.geometries--}function o(h,f){return i[f.id]===!0||(f.addEventListener("dispose",a),i[f.id]=!0,t.memory.geometries++),f}function l(h){let f=h.attributes;for(let d in f)e.update(f[d],s.ARRAY_BUFFER)}function c(h){let f=[],d=h.index,m=h.attributes.position,y=0;if(m===void 0)return;if(d!==null){let E=d.array;y=d.version;for(let S=0,_=E.length;S<_;S+=3){let C=E[S+0],b=E[S+1],I=E[S+2];f.push(C,b,b,I,I,C)}}else{let E=m.array;y=m.version;for(let S=0,_=E.length/3-1;S<_;S+=3){let C=S+0,b=S+1,I=S+2;f.push(C,b,b,I,I,C)}}let g=new(m.count>=65535?Fr:xs)(f,1);g.version=y;let p=r.get(h);p&&e.remove(p),r.set(h,g)}function u(h){let f=r.get(h);if(f){let d=h.index;d!==null&&f.version<d.version&&c(h)}else c(h);return r.get(h)}return{get:o,update:l,getWireframeAttribute:u}}function b0(s,e,t){let n;function i(h){n=h}let r,a;function o(h){r=h.type,a=h.bytesPerElement}function l(h,f){s.drawElements(n,f,r,h*a),t.update(f,n,1)}function c(h,f,d){d!==0&&(s.drawElementsInstanced(n,f,r,h*a,d),t.update(f,n,d))}function u(h,f,d){if(d===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,f,0,r,h,0,d);let y=0;for(let g=0;g<d;g++)y+=f[g];t.update(y,n,1)}this.setMode=i,this.setIndex=o,this.render=l,this.renderInstances=c,this.renderMultiDraw=u}function E0(s){let e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,a,o){switch(t.calls++,a){case s.TRIANGLES:t.triangles+=o*(r/3);break;case s.LINES:t.lines+=o*(r/2);break;case s.LINE_STRIP:t.lines+=o*(r-1);break;case s.LINE_LOOP:t.lines+=o*r;break;case s.POINTS:t.points+=o*r;break;default:Ye("WebGLInfo: Unknown draw mode:",a);break}}function i(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:i,update:n}}function T0(s,e,t){let n=new WeakMap,i=new dt;function r(a,o,l){let c=a.morphTargetInfluences,u=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,h=u!==void 0?u.length:0,f=n.get(o);if(f===void 0||f.count!==h){let T=function(){I.dispose(),n.delete(o),o.removeEventListener("dispose",T)};f!==void 0&&f.texture.dispose();let d=o.morphAttributes.position!==void 0,m=o.morphAttributes.normal!==void 0,y=o.morphAttributes.color!==void 0,g=o.morphAttributes.position||[],p=o.morphAttributes.normal||[],E=o.morphAttributes.color||[],S=0;d===!0&&(S=1),m===!0&&(S=2),y===!0&&(S=3);let _=o.attributes.position.count*S,C=1;_>e.maxTextureSize&&(C=Math.ceil(_/e.maxTextureSize),_=e.maxTextureSize);let b=new Float32Array(_*C*4*h),I=new Pr(b,_,C,h);I.type=Un,I.needsUpdate=!0;let v=S*4;for(let P=0;P<h;P++){let L=g[P],F=p[P],K=E[P],J=_*C*4*P;for(let z=0;z<L.count;z++){let Q=z*v;d===!0&&(i.fromBufferAttribute(L,z),b[J+Q+0]=i.x,b[J+Q+1]=i.y,b[J+Q+2]=i.z,b[J+Q+3]=0),m===!0&&(i.fromBufferAttribute(F,z),b[J+Q+4]=i.x,b[J+Q+5]=i.y,b[J+Q+6]=i.z,b[J+Q+7]=0),y===!0&&(i.fromBufferAttribute(K,z),b[J+Q+8]=i.x,b[J+Q+9]=i.y,b[J+Q+10]=i.z,b[J+Q+11]=K.itemSize===4?i.w:1)}}f={count:h,texture:I,size:new Ke(_,C)},n.set(o,f),o.addEventListener("dispose",T)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)l.getUniforms().setValue(s,"morphTexture",a.morphTexture,t);else{let d=0;for(let y=0;y<c.length;y++)d+=c[y];let m=o.morphTargetsRelative?1:1-d;l.getUniforms().setValue(s,"morphTargetBaseInfluence",m),l.getUniforms().setValue(s,"morphTargetInfluences",c)}l.getUniforms().setValue(s,"morphTargetsTexture",f.texture,t),l.getUniforms().setValue(s,"morphTargetsTextureSize",f.size)}return{update:r}}function w0(s,e,t,n,i){let r=new WeakMap;function a(c){let u=i.render.frame,h=c.geometry,f=e.get(c,h);if(r.get(f)!==u&&(e.update(f),r.set(f,u)),c.isInstancedMesh&&(c.hasEventListener("dispose",l)===!1&&c.addEventListener("dispose",l),r.get(c)!==u&&(t.update(c.instanceMatrix,s.ARRAY_BUFFER),c.instanceColor!==null&&t.update(c.instanceColor,s.ARRAY_BUFFER),r.set(c,u))),c.isSkinnedMesh){let d=c.skeleton;r.get(d)!==u&&(d.update(),r.set(d,u))}return f}function o(){r=new WeakMap}function l(c){let u=c.target;u.removeEventListener("dispose",l),n.releaseStatesOfObject(u),t.remove(u.instanceMatrix),u.instanceColor!==null&&t.remove(u.instanceColor)}return{update:a,dispose:o}}var A0={[Sc]:"LINEAR_TONE_MAPPING",[bc]:"REINHARD_TONE_MAPPING",[Ec]:"CINEON_TONE_MAPPING",[ca]:"ACES_FILMIC_TONE_MAPPING",[wc]:"AGX_TONE_MAPPING",[Ac]:"NEUTRAL_TONE_MAPPING",[Tc]:"CUSTOM_TONE_MAPPING"};function C0(s,e,t,n,i,r){let a=new Cn(e,t,{type:s,depthBuffer:i,stencilBuffer:r,samples:n?4:0,depthTexture:i?new yi(e,t):void 0}),o=new Cn(e,t,{type:li,depthBuffer:!1,stencilBuffer:!1}),l=new Wt;l.setAttribute("position",new ft([-1,3,0,-1,-1,0,3,-1,0],3)),l.setAttribute("uv",new ft([0,2,0,0,2,0],2));let c=new vo({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),u=new pt(l,c),h=new ir(-1,1,1,-1,0,1),f=null,d=null,m=!1,y,g=null,p=[],E=!1;this.setSize=function(S,_){a.setSize(S,_),o.setSize(S,_);for(let C=0;C<p.length;C++){let b=p[C];b.setSize&&b.setSize(S,_)}},this.setEffects=function(S){p=S,E=p.length>0&&p[0].isRenderPass===!0;let _=a.width,C=a.height;for(let b=0;b<p.length;b++){let I=p[b];I.setSize&&I.setSize(_,C)}},this.begin=function(S,_){if(m||S.toneMapping===Yn&&p.length===0)return!1;if(g=_,_!==null){let C=_.width,b=_.height;(a.width!==C||a.height!==b)&&this.setSize(C,b)}return E===!1&&S.setRenderTarget(a),y=S.toneMapping,S.toneMapping=Yn,!0},this.hasRenderPass=function(){return E},this.end=function(S,_){S.toneMapping=y,m=!0;let C=a,b=o;for(let I=0;I<p.length;I++){let v=p[I];if(v.enabled!==!1&&(v.render(S,b,C,_),v.needsSwap!==!1)){let T=C;C=b,b=T}}if(f!==S.outputColorSpace||d!==S.toneMapping){f=S.outputColorSpace,d=S.toneMapping,c.defines={},et.getTransfer(f)===Et&&(c.defines.SRGB_TRANSFER="");let I=A0[d];I&&(c.defines[I]=""),c.needsUpdate=!0}c.uniforms.tDiffuse.value=C.texture,S.setRenderTarget(g),S.render(u,h),g=null,m=!1},this.isCompositing=function(){return m},this.dispose=function(){a.depthTexture&&a.depthTexture.dispose(),a.dispose(),o.dispose(),l.dispose(),c.dispose()}}var _f=new ln,eh=new yi(1,1),yf=new Pr,Mf=new po,Sf=new kr,ju=[],ef=[],tf=new Float32Array(16),nf=new Float32Array(9),sf=new Float32Array(4);function fr(s,e,t){let n=s[0];if(n<=0||n>0)return s;let i=e*t,r=ju[i];if(r===void 0&&(r=new Float32Array(i),ju[i]=r),e!==0){n.toArray(r,0);for(let a=1,o=0;a!==e;++a)o+=t,s[a].toArray(r,o)}return r}function Qt(s,e){if(s.length!==e.length)return!1;for(let t=0,n=s.length;t<n;t++)if(s[t]!==e[t])return!1;return!0}function jt(s,e){for(let t=0,n=e.length;t<n;t++)s[t]=e[t]}function wl(s,e){let t=ef[e];t===void 0&&(t=new Int32Array(e),ef[e]=t);for(let n=0;n!==e;++n)t[n]=s.allocateTextureUnit();return t}function R0(s,e){let t=this.cache;t[0]!==e&&(s.uniform1f(this.addr,e),t[0]=e)}function I0(s,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(s.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Qt(t,e))return;s.uniform2fv(this.addr,e),jt(t,e)}}function P0(s,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(s.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(s.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(Qt(t,e))return;s.uniform3fv(this.addr,e),jt(t,e)}}function L0(s,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(s.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Qt(t,e))return;s.uniform4fv(this.addr,e),jt(t,e)}}function D0(s,e){let t=this.cache,n=e.elements;if(n===void 0){if(Qt(t,e))return;s.uniformMatrix2fv(this.addr,!1,e),jt(t,e)}else{if(Qt(t,n))return;sf.set(n),s.uniformMatrix2fv(this.addr,!1,sf),jt(t,n)}}function N0(s,e){let t=this.cache,n=e.elements;if(n===void 0){if(Qt(t,e))return;s.uniformMatrix3fv(this.addr,!1,e),jt(t,e)}else{if(Qt(t,n))return;nf.set(n),s.uniformMatrix3fv(this.addr,!1,nf),jt(t,n)}}function F0(s,e){let t=this.cache,n=e.elements;if(n===void 0){if(Qt(t,e))return;s.uniformMatrix4fv(this.addr,!1,e),jt(t,e)}else{if(Qt(t,n))return;tf.set(n),s.uniformMatrix4fv(this.addr,!1,tf),jt(t,n)}}function U0(s,e){let t=this.cache;t[0]!==e&&(s.uniform1i(this.addr,e),t[0]=e)}function O0(s,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(s.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Qt(t,e))return;s.uniform2iv(this.addr,e),jt(t,e)}}function B0(s,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(s.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Qt(t,e))return;s.uniform3iv(this.addr,e),jt(t,e)}}function z0(s,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(s.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Qt(t,e))return;s.uniform4iv(this.addr,e),jt(t,e)}}function k0(s,e){let t=this.cache;t[0]!==e&&(s.uniform1ui(this.addr,e),t[0]=e)}function H0(s,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(s.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Qt(t,e))return;s.uniform2uiv(this.addr,e),jt(t,e)}}function V0(s,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(s.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Qt(t,e))return;s.uniform3uiv(this.addr,e),jt(t,e)}}function G0(s,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(s.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Qt(t,e))return;s.uniform4uiv(this.addr,e),jt(t,e)}}function W0(s,e,t){let n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i);let r;this.type===s.SAMPLER_2D_SHADOW?(eh.compareFunction=t.isReversedDepthBuffer()?_l:vl,r=eh):r=_f,t.setTexture2D(e||r,i)}function X0(s,e,t){let n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i),t.setTexture3D(e||Mf,i)}function q0(s,e,t){let n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i),t.setTextureCube(e||Sf,i)}function Y0(s,e,t){let n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i),t.setTexture2DArray(e||yf,i)}function Z0(s){switch(s){case 5126:return R0;case 35664:return I0;case 35665:return P0;case 35666:return L0;case 35674:return D0;case 35675:return N0;case 35676:return F0;case 5124:case 35670:return U0;case 35667:case 35671:return O0;case 35668:case 35672:return B0;case 35669:case 35673:return z0;case 5125:return k0;case 36294:return H0;case 36295:return V0;case 36296:return G0;case 35678:case 36198:case 36298:case 36306:case 35682:return W0;case 35679:case 36299:case 36307:return X0;case 35680:case 36300:case 36308:case 36293:return q0;case 36289:case 36303:case 36311:case 36292:return Y0}}function $0(s,e){s.uniform1fv(this.addr,e)}function K0(s,e){let t=fr(e,this.size,2);s.uniform2fv(this.addr,t)}function J0(s,e){let t=fr(e,this.size,3);s.uniform3fv(this.addr,t)}function Q0(s,e){let t=fr(e,this.size,4);s.uniform4fv(this.addr,t)}function j0(s,e){let t=fr(e,this.size,4);s.uniformMatrix2fv(this.addr,!1,t)}function ex(s,e){let t=fr(e,this.size,9);s.uniformMatrix3fv(this.addr,!1,t)}function tx(s,e){let t=fr(e,this.size,16);s.uniformMatrix4fv(this.addr,!1,t)}function nx(s,e){s.uniform1iv(this.addr,e)}function ix(s,e){s.uniform2iv(this.addr,e)}function sx(s,e){s.uniform3iv(this.addr,e)}function rx(s,e){s.uniform4iv(this.addr,e)}function ax(s,e){s.uniform1uiv(this.addr,e)}function ox(s,e){s.uniform2uiv(this.addr,e)}function lx(s,e){s.uniform3uiv(this.addr,e)}function cx(s,e){s.uniform4uiv(this.addr,e)}function hx(s,e,t){let n=this.cache,i=e.length,r=wl(t,i);Qt(n,r)||(s.uniform1iv(this.addr,r),jt(n,r));let a;this.type===s.SAMPLER_2D_SHADOW?a=eh:a=_f;for(let o=0;o!==i;++o)t.setTexture2D(e[o]||a,r[o])}function ux(s,e,t){let n=this.cache,i=e.length,r=wl(t,i);Qt(n,r)||(s.uniform1iv(this.addr,r),jt(n,r));for(let a=0;a!==i;++a)t.setTexture3D(e[a]||Mf,r[a])}function fx(s,e,t){let n=this.cache,i=e.length,r=wl(t,i);Qt(n,r)||(s.uniform1iv(this.addr,r),jt(n,r));for(let a=0;a!==i;++a)t.setTextureCube(e[a]||Sf,r[a])}function dx(s,e,t){let n=this.cache,i=e.length,r=wl(t,i);Qt(n,r)||(s.uniform1iv(this.addr,r),jt(n,r));for(let a=0;a!==i;++a)t.setTexture2DArray(e[a]||yf,r[a])}function px(s){switch(s){case 5126:return $0;case 35664:return K0;case 35665:return J0;case 35666:return Q0;case 35674:return j0;case 35675:return ex;case 35676:return tx;case 5124:case 35670:return nx;case 35667:case 35671:return ix;case 35668:case 35672:return sx;case 35669:case 35673:return rx;case 5125:return ax;case 36294:return ox;case 36295:return lx;case 36296:return cx;case 35678:case 36198:case 36298:case 36306:case 35682:return hx;case 35679:case 36299:case 36307:return ux;case 35680:case 36300:case 36308:case 36293:return fx;case 36289:case 36303:case 36311:case 36292:return dx}}var th=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=Z0(t.type)}},nh=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=px(t.type)}},ih=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let i=this.seq;for(let r=0,a=i.length;r!==a;++r){let o=i[r];o.setValue(e,t[o.id],n)}}},Qc=/(\w+)(\])?(\[|\.)?/g;function rf(s,e){s.seq.push(e),s.map[e.id]=e}function mx(s,e,t){let n=s.name,i=n.length;for(Qc.lastIndex=0;;){let r=Qc.exec(n),a=Qc.lastIndex,o=r[1],l=r[2]==="]",c=r[3];if(l&&(o=o|0),c===void 0||c==="["&&a+2===i){rf(t,c===void 0?new th(o,s,e):new nh(o,s,e));break}else{let h=t.map[o];h===void 0&&(h=new ih(o),rf(t,h)),t=h}}}var ur=class{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let a=0;a<n;++a){let o=e.getActiveUniform(t,a),l=e.getUniformLocation(t,o.name);mx(o,l,this)}let i=[],r=[];for(let a of this.seq)a.type===e.SAMPLER_2D_SHADOW||a.type===e.SAMPLER_CUBE_SHADOW||a.type===e.SAMPLER_2D_ARRAY_SHADOW?i.push(a):r.push(a);i.length>0&&(this.seq=i.concat(r))}setValue(e,t,n,i){let r=this.map[t];r!==void 0&&r.setValue(e,n,i)}setOptional(e,t,n){let i=t[n];i!==void 0&&this.setValue(e,n,i)}static upload(e,t,n,i){for(let r=0,a=t.length;r!==a;++r){let o=t[r],l=n[o.id];l.needsUpdate!==!1&&o.setValue(e,l.value,i)}}static seqWithValue(e,t){let n=[];for(let i=0,r=e.length;i!==r;++i){let a=e[i];a.id in t&&n.push(a)}return n}};function af(s,e,t){let n=s.createShader(e);return s.shaderSource(n,t),s.compileShader(n),n}var gx=37297,xx=0;function vx(s,e){let t=s.split(`
`),n=[],i=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let a=i;a<r;a++){let o=a+1;n.push(`${o===e?">":" "} ${o}: ${t[a]}`)}return n.join(`
`)}var of=new Qe;function _x(s){et._getMatrix(of,et.workingColorSpace,s);let e=`mat3( ${of.elements.map(t=>t.toFixed(4))} )`;switch(et.getTransfer(s)){case Ir:return[e,"LinearTransferOETF"];case Et:return[e,"sRGBTransferOETF"];default:return ke("WebGLProgram: Unsupported color space: ",s),[e,"LinearTransferOETF"]}}function lf(s,e,t){let n=s.getShaderParameter(e,s.COMPILE_STATUS),r=(s.getShaderInfoLog(e)||"").trim();if(n&&r==="")return"";let a=/ERROR: 0:(\d+)/.exec(r);if(a){let o=parseInt(a[1]);return t.toUpperCase()+`

`+r+`

`+vx(s.getShaderSource(e),o)}else return r}function yx(s,e){let t=_x(e);return[`vec4 ${s}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}var Mx={[Sc]:"Linear",[bc]:"Reinhard",[Ec]:"Cineon",[ca]:"ACESFilmic",[wc]:"AgX",[Ac]:"Neutral",[Tc]:"Custom"};function Sx(s,e){let t=Mx[e];return t===void 0?(ke("WebGLProgram: Unsupported toneMapping:",e),"vec3 "+s+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+s+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}var Ml=new N;function bx(){et.getLuminanceCoefficients(Ml);let s=Ml.x.toFixed(4),e=Ml.y.toFixed(4),t=Ml.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${s}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function Ex(s){return[s.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",s.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Sa).join(`
`)}function Tx(s){let e=[];for(let t in s){let n=s[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function wx(s,e){let t={},n=s.getProgramParameter(e,s.ACTIVE_ATTRIBUTES);for(let i=0;i<n;i++){let r=s.getActiveAttrib(e,i),a=r.name,o=1;r.type===s.FLOAT_MAT2&&(o=2),r.type===s.FLOAT_MAT3&&(o=3),r.type===s.FLOAT_MAT4&&(o=4),t[a]={type:r.type,location:s.getAttribLocation(e,a),locationSize:o}}return t}function Sa(s){return s!==""}function cf(s,e){let t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return s.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function hf(s,e){return s.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}var Ax=/^[ \t]*#include +<([\w\d./]+)>/gm;function sh(s){return s.replace(Ax,Rx)}var Cx=new Map;function Rx(s,e){let t=ct[e];if(t===void 0){let n=Cx.get(e);if(n!==void 0)t=ct[n],ke('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,n);else throw new Error("THREE.WebGLProgram: Can not resolve #include <"+e+">")}return sh(t)}var Ix=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function uf(s){return s.replace(Ix,Px)}function Px(s,e,t,n){let i="";for(let r=parseInt(e);r<parseInt(t);r++)i+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return i}function ff(s){let e=`precision ${s.precision} float;
	precision ${s.precision} int;
	precision ${s.precision} sampler2D;
	precision ${s.precision} samplerCube;
	precision ${s.precision} sampler3D;
	precision ${s.precision} sampler2DArray;
	precision ${s.precision} sampler2DShadow;
	precision ${s.precision} samplerCubeShadow;
	precision ${s.precision} sampler2DArrayShadow;
	precision ${s.precision} isampler2D;
	precision ${s.precision} isampler3D;
	precision ${s.precision} isamplerCube;
	precision ${s.precision} isampler2DArray;
	precision ${s.precision} usampler2D;
	precision ${s.precision} usampler3D;
	precision ${s.precision} usamplerCube;
	precision ${s.precision} usampler2DArray;
	`;return s.precision==="highp"?e+=`
#define HIGH_PRECISION`:s.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:s.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}var Lx={[oa]:"SHADOWMAP_TYPE_PCF",[rr]:"SHADOWMAP_TYPE_VSM"};function Dx(s){return Lx[s.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var Nx={[$i]:"ENVMAP_TYPE_CUBE",[bs]:"ENVMAP_TYPE_CUBE",[ha]:"ENVMAP_TYPE_CUBE_UV"};function Fx(s){return s.envMap===!1?"ENVMAP_TYPE_CUBE":Nx[s.envMapMode]||"ENVMAP_TYPE_CUBE"}var Ux={[bs]:"ENVMAP_MODE_REFRACTION"};function Ox(s){return s.envMap===!1?"ENVMAP_MODE_REFLECTION":Ux[s.envMapMode]||"ENVMAP_MODE_REFLECTION"}var Bx={[la]:"ENVMAP_BLENDING_MULTIPLY",[bu]:"ENVMAP_BLENDING_MIX",[Eu]:"ENVMAP_BLENDING_ADD"};function zx(s){return s.envMap===!1?"ENVMAP_BLENDING_NONE":Bx[s.combine]||"ENVMAP_BLENDING_NONE"}function kx(s){let e=s.envMapCubeUVHeight;if(e===null)return null;let t=Math.log2(e)-2,n=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:n,maxMip:t}}function Hx(s,e,t,n){let i=s.getContext(),r=t.defines,a=t.vertexShader,o=t.fragmentShader,l=Dx(t),c=Fx(t),u=Ox(t),h=zx(t),f=kx(t),d=Ex(t),m=Tx(r),y=i.createProgram(),g,p,E=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(g=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,m].filter(Sa).join(`
`),g.length>0&&(g+=`
`),p=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,m].filter(Sa).join(`
`),p.length>0&&(p+=`
`)):(g=[ff(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,m,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+u:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexNormals?"#define HAS_NORMAL":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Sa).join(`
`),p=[ff(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,m,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+u:"",t.envMap?"#define "+h:"",f?"#define CUBEUV_TEXEL_WIDTH "+f.texelWidth:"",f?"#define CUBEUV_TEXEL_HEIGHT "+f.texelHeight:"",f?"#define CUBEUV_MAX_MIP "+f.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor?"#define USE_COLOR":"",t.vertexAlphas||t.batchingColor?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.numLightProbeGrids>0?"#define USE_LIGHT_PROBES_GRID":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==Yn?"#define TONE_MAPPING":"",t.toneMapping!==Yn?ct.tonemapping_pars_fragment:"",t.toneMapping!==Yn?Sx("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",ct.colorspace_pars_fragment,yx("linearToOutputTexel",t.outputColorSpace),bx(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(Sa).join(`
`)),a=sh(a),a=cf(a,t),a=hf(a,t),o=sh(o),o=cf(o,t),o=hf(o,t),a=uf(a),o=uf(o),t.isRawShaderMaterial!==!0&&(E=`#version 300 es
`,g=[d,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+g,p=["#define varying in",t.glslVersion===Uc?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===Uc?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+p);let S=E+g+a,_=E+p+o,C=af(i,i.VERTEX_SHADER,S),b=af(i,i.FRAGMENT_SHADER,_);i.attachShader(y,C),i.attachShader(y,b),t.index0AttributeName!==void 0?i.bindAttribLocation(y,0,t.index0AttributeName):t.hasPositionAttribute===!0&&i.bindAttribLocation(y,0,"position"),i.linkProgram(y);function I(L){if(s.debug.checkShaderErrors){let F=i.getProgramInfoLog(y)||"",K=i.getShaderInfoLog(C)||"",J=i.getShaderInfoLog(b)||"",z=F.trim(),Q=K.trim(),$=J.trim(),se=!0,oe=!0;if(i.getProgramParameter(y,i.LINK_STATUS)===!1)if(se=!1,typeof s.debug.onShaderError=="function")s.debug.onShaderError(i,y,C,b);else{let he=lf(i,C,"vertex"),fe=lf(i,b,"fragment");Ye("WebGLProgram: Shader Error "+i.getError()+" - VALIDATE_STATUS "+i.getProgramParameter(y,i.VALIDATE_STATUS)+`

Material Name: `+L.name+`
Material Type: `+L.type+`

Program Info Log: `+z+`
`+he+`
`+fe)}else z!==""?ke("WebGLProgram: Program Info Log:",z):(Q===""||$==="")&&(oe=!1);oe&&(L.diagnostics={runnable:se,programLog:z,vertexShader:{log:Q,prefix:g},fragmentShader:{log:$,prefix:p}})}i.deleteShader(C),i.deleteShader(b),v=new ur(i,y),T=wx(i,y)}let v;this.getUniforms=function(){return v===void 0&&I(this),v};let T;this.getAttributes=function(){return T===void 0&&I(this),T};let P=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return P===!1&&(P=i.getProgramParameter(y,gx)),P},this.destroy=function(){n.releaseStatesOfProgram(this),i.deleteProgram(y),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=xx++,this.cacheKey=e,this.usedTimes=1,this.program=y,this.vertexShader=C,this.fragmentShader=b,this}var Vx=0,rh=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e,t,n){let i=this._getShaderCacheForMaterial(e);return i.has(t)===!1&&(i.add(t),t.usedTimes++),i.has(n)===!1&&(i.add(n),n.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderStage(e){return this._getShaderStage(e.vertexShader)}getFragmentShaderStage(e){return this._getShaderStage(e.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);return n===void 0&&(n=new ah(e),t.set(e,n)),n}},ah=class{constructor(e){this.id=Vx++,this.code=e,this.usedTimes=0}};function Gx(s){return s===Qi||s===ga||s===xa}function Wx(s,e,t,n,i,r){let a=new Lr,o=new rh,l=new Set,c=[],u=new Map,h=n.logarithmicDepthBuffer,f=n.precision,d={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function m(v){return l.add(v),v===0?"uv":`uv${v}`}function y(v,T,P,L,F,K){let J=L.fog,z=F.geometry,Q=v.isMeshStandardMaterial||v.isMeshLambertMaterial||v.isMeshPhongMaterial?L.environment:null,$=v.isMeshStandardMaterial||v.isMeshLambertMaterial&&!v.envMap||v.isMeshPhongMaterial&&!v.envMap,se=e.get(v.envMap||Q,$),oe=se&&se.mapping===ha?se.image.height:null,he=d[v.type];v.precision!==null&&(f=n.getMaxPrecision(v.precision),f!==v.precision&&ke("WebGLProgram.getParameters:",v.precision,"not supported, using",f,"instead."));let fe=z.morphAttributes.position||z.morphAttributes.normal||z.morphAttributes.color,Ae=fe!==void 0?fe.length:0,st=0;z.morphAttributes.position!==void 0&&(st=1),z.morphAttributes.normal!==void 0&&(st=2),z.morphAttributes.color!==void 0&&(st=3);let yt,rt,ie,de;if(he){let Ie=hi[he];yt=Ie.vertexShader,rt=Ie.fragmentShader}else{yt=v.vertexShader,rt=v.fragmentShader;let Ie=o.getVertexShaderStage(v),Lt=o.getFragmentShaderStage(v);o.update(v,Ie,Lt),ie=Ie.id,de=Lt.id}let le=s.getRenderTarget(),Pe=s.state.buffers.depth.getReversed(),qe=F.isInstancedMesh===!0,Le=F.isBatchedMesh===!0,mt=!!v.map,Ze=!!v.matcap,at=!!se,ot=!!v.aoMap,nt=!!v.lightMap,Mt=!!v.bumpMap&&v.wireframe===!1,St=!!v.normalMap,xt=!!v.displacementMap,wt=!!v.emissiveMap,Pt=!!v.metalnessMap,Nt=!!v.roughnessMap,B=v.anisotropy>0,Ot=v.clearcoat>0,Je=v.dispersion>0,R=v.iridescence>0,x=v.sheen>0,k=v.transmission>0,q=B&&!!v.anisotropyMap,te=Ot&&!!v.clearcoatMap,ue=Ot&&!!v.clearcoatNormalMap,ge=Ot&&!!v.clearcoatRoughnessMap,ne=R&&!!v.iridescenceMap,j=R&&!!v.iridescenceThicknessMap,ce=x&&!!v.sheenColorMap,xe=x&&!!v.sheenRoughnessMap,Me=!!v.specularMap,ve=!!v.specularColorMap,Ge=!!v.specularIntensityMap,We=k&&!!v.transmissionMap,$e=k&&!!v.thicknessMap,U=!!v.gradientMap,me=!!v.alphaMap,re=v.alphaTest>0,_e=!!v.alphaHash,be=!!v.extensions,ae=Yn;v.toneMapped&&(le===null||le.isXRRenderTarget===!0)&&(ae=s.toneMapping);let Ne={shaderID:he,shaderType:v.type,shaderName:v.name,vertexShader:yt,fragmentShader:rt,defines:v.defines,customVertexShaderID:ie,customFragmentShaderID:de,isRawShaderMaterial:v.isRawShaderMaterial===!0,glslVersion:v.glslVersion,precision:f,batching:Le,batchingColor:Le&&F._colorsTexture!==null,instancing:qe,instancingColor:qe&&F.instanceColor!==null,instancingMorph:qe&&F.morphTexture!==null,outputColorSpace:le===null?s.outputColorSpace:le.isXRRenderTarget===!0?le.texture.colorSpace:et.workingColorSpace,alphaToCoverage:!!v.alphaToCoverage,map:mt,matcap:Ze,envMap:at,envMapMode:at&&se.mapping,envMapCubeUVHeight:oe,aoMap:ot,lightMap:nt,bumpMap:Mt,normalMap:St,displacementMap:xt,emissiveMap:wt,normalMapObjectSpace:St&&v.normalMapType===Iu,normalMapTangentSpace:St&&v.normalMapType===cr,packedNormalMap:St&&v.normalMapType===cr&&Gx(v.normalMap.format),metalnessMap:Pt,roughnessMap:Nt,anisotropy:B,anisotropyMap:q,clearcoat:Ot,clearcoatMap:te,clearcoatNormalMap:ue,clearcoatRoughnessMap:ge,dispersion:Je,iridescence:R,iridescenceMap:ne,iridescenceThicknessMap:j,sheen:x,sheenColorMap:ce,sheenRoughnessMap:xe,specularMap:Me,specularColorMap:ve,specularIntensityMap:Ge,transmission:k,transmissionMap:We,thicknessMap:$e,gradientMap:U,opaque:v.transparent===!1&&v.blending===ii&&v.alphaToCoverage===!1,alphaMap:me,alphaTest:re,alphaHash:_e,combine:v.combine,mapUv:mt&&m(v.map.channel),aoMapUv:ot&&m(v.aoMap.channel),lightMapUv:nt&&m(v.lightMap.channel),bumpMapUv:Mt&&m(v.bumpMap.channel),normalMapUv:St&&m(v.normalMap.channel),displacementMapUv:xt&&m(v.displacementMap.channel),emissiveMapUv:wt&&m(v.emissiveMap.channel),metalnessMapUv:Pt&&m(v.metalnessMap.channel),roughnessMapUv:Nt&&m(v.roughnessMap.channel),anisotropyMapUv:q&&m(v.anisotropyMap.channel),clearcoatMapUv:te&&m(v.clearcoatMap.channel),clearcoatNormalMapUv:ue&&m(v.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:ge&&m(v.clearcoatRoughnessMap.channel),iridescenceMapUv:ne&&m(v.iridescenceMap.channel),iridescenceThicknessMapUv:j&&m(v.iridescenceThicknessMap.channel),sheenColorMapUv:ce&&m(v.sheenColorMap.channel),sheenRoughnessMapUv:xe&&m(v.sheenRoughnessMap.channel),specularMapUv:Me&&m(v.specularMap.channel),specularColorMapUv:ve&&m(v.specularColorMap.channel),specularIntensityMapUv:Ge&&m(v.specularIntensityMap.channel),transmissionMapUv:We&&m(v.transmissionMap.channel),thicknessMapUv:$e&&m(v.thicknessMap.channel),alphaMapUv:me&&m(v.alphaMap.channel),vertexTangents:!!z.attributes.tangent&&(St||B),vertexNormals:!!z.attributes.normal,vertexColors:v.vertexColors,vertexAlphas:v.vertexColors===!0&&!!z.attributes.color&&z.attributes.color.itemSize===4,pointsUvs:F.isPoints===!0&&!!z.attributes.uv&&(mt||me),fog:!!J,useFog:v.fog===!0,fogExp2:!!J&&J.isFogExp2,flatShading:v.wireframe===!1&&(v.flatShading===!0||z.attributes.normal===void 0&&St===!1&&(v.isMeshLambertMaterial||v.isMeshPhongMaterial||v.isMeshStandardMaterial||v.isMeshPhysicalMaterial)),sizeAttenuation:v.sizeAttenuation===!0,logarithmicDepthBuffer:h,reversedDepthBuffer:Pe,skinning:F.isSkinnedMesh===!0,hasPositionAttribute:z.attributes.position!==void 0,morphTargets:z.morphAttributes.position!==void 0,morphNormals:z.morphAttributes.normal!==void 0,morphColors:z.morphAttributes.color!==void 0,morphTargetsCount:Ae,morphTextureStride:st,numDirLights:T.directional.length,numPointLights:T.point.length,numSpotLights:T.spot.length,numSpotLightMaps:T.spotLightMap.length,numRectAreaLights:T.rectArea.length,numHemiLights:T.hemi.length,numDirLightShadows:T.directionalShadowMap.length,numPointLightShadows:T.pointShadowMap.length,numSpotLightShadows:T.spotShadowMap.length,numSpotLightShadowsWithMaps:T.numSpotLightShadowsWithMaps,numLightProbes:T.numLightProbes,numLightProbeGrids:K.length,numClippingPlanes:r.numPlanes,numClipIntersection:r.numIntersection,dithering:v.dithering,shadowMapEnabled:s.shadowMap.enabled&&P.length>0,shadowMapType:s.shadowMap.type,toneMapping:ae,decodeVideoTexture:mt&&v.map.isVideoTexture===!0&&et.getTransfer(v.map.colorSpace)===Et,decodeVideoTextureEmissive:wt&&v.emissiveMap.isVideoTexture===!0&&et.getTransfer(v.emissiveMap.colorSpace)===Et,premultipliedAlpha:v.premultipliedAlpha,doubleSided:v.side===Fn,flipSided:v.side===vn,useDepthPacking:v.depthPacking>=0,depthPacking:v.depthPacking||0,index0AttributeName:v.index0AttributeName,extensionClipCullDistance:be&&v.extensions.clipCullDistance===!0&&t.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(be&&v.extensions.multiDraw===!0||Le)&&t.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:t.has("KHR_parallel_shader_compile"),customProgramCacheKey:v.customProgramCacheKey()};return Ne.vertexUv1s=l.has(1),Ne.vertexUv2s=l.has(2),Ne.vertexUv3s=l.has(3),l.clear(),Ne}function g(v){let T=[];if(v.shaderID?T.push(v.shaderID):(T.push(v.customVertexShaderID),T.push(v.customFragmentShaderID)),v.defines!==void 0)for(let P in v.defines)T.push(P),T.push(v.defines[P]);return v.isRawShaderMaterial===!1&&(p(T,v),E(T,v),T.push(s.outputColorSpace)),T.push(v.customProgramCacheKey),T.join()}function p(v,T){v.push(T.precision),v.push(T.outputColorSpace),v.push(T.envMapMode),v.push(T.envMapCubeUVHeight),v.push(T.mapUv),v.push(T.alphaMapUv),v.push(T.lightMapUv),v.push(T.aoMapUv),v.push(T.bumpMapUv),v.push(T.normalMapUv),v.push(T.displacementMapUv),v.push(T.emissiveMapUv),v.push(T.metalnessMapUv),v.push(T.roughnessMapUv),v.push(T.anisotropyMapUv),v.push(T.clearcoatMapUv),v.push(T.clearcoatNormalMapUv),v.push(T.clearcoatRoughnessMapUv),v.push(T.iridescenceMapUv),v.push(T.iridescenceThicknessMapUv),v.push(T.sheenColorMapUv),v.push(T.sheenRoughnessMapUv),v.push(T.specularMapUv),v.push(T.specularColorMapUv),v.push(T.specularIntensityMapUv),v.push(T.transmissionMapUv),v.push(T.thicknessMapUv),v.push(T.combine),v.push(T.fogExp2),v.push(T.sizeAttenuation),v.push(T.morphTargetsCount),v.push(T.morphAttributeCount),v.push(T.numDirLights),v.push(T.numPointLights),v.push(T.numSpotLights),v.push(T.numSpotLightMaps),v.push(T.numHemiLights),v.push(T.numRectAreaLights),v.push(T.numDirLightShadows),v.push(T.numPointLightShadows),v.push(T.numSpotLightShadows),v.push(T.numSpotLightShadowsWithMaps),v.push(T.numLightProbes),v.push(T.shadowMapType),v.push(T.toneMapping),v.push(T.numClippingPlanes),v.push(T.numClipIntersection),v.push(T.depthPacking)}function E(v,T){a.disableAll(),T.instancing&&a.enable(0),T.instancingColor&&a.enable(1),T.instancingMorph&&a.enable(2),T.matcap&&a.enable(3),T.envMap&&a.enable(4),T.normalMapObjectSpace&&a.enable(5),T.normalMapTangentSpace&&a.enable(6),T.clearcoat&&a.enable(7),T.iridescence&&a.enable(8),T.alphaTest&&a.enable(9),T.vertexColors&&a.enable(10),T.vertexAlphas&&a.enable(11),T.vertexUv1s&&a.enable(12),T.vertexUv2s&&a.enable(13),T.vertexUv3s&&a.enable(14),T.vertexTangents&&a.enable(15),T.anisotropy&&a.enable(16),T.alphaHash&&a.enable(17),T.batching&&a.enable(18),T.dispersion&&a.enable(19),T.batchingColor&&a.enable(20),T.gradientMap&&a.enable(21),T.packedNormalMap&&a.enable(22),T.vertexNormals&&a.enable(23),v.push(a.mask),a.disableAll(),T.fog&&a.enable(0),T.useFog&&a.enable(1),T.flatShading&&a.enable(2),T.logarithmicDepthBuffer&&a.enable(3),T.reversedDepthBuffer&&a.enable(4),T.skinning&&a.enable(5),T.morphTargets&&a.enable(6),T.morphNormals&&a.enable(7),T.morphColors&&a.enable(8),T.premultipliedAlpha&&a.enable(9),T.shadowMapEnabled&&a.enable(10),T.doubleSided&&a.enable(11),T.flipSided&&a.enable(12),T.useDepthPacking&&a.enable(13),T.dithering&&a.enable(14),T.transmission&&a.enable(15),T.sheen&&a.enable(16),T.opaque&&a.enable(17),T.pointsUvs&&a.enable(18),T.decodeVideoTexture&&a.enable(19),T.decodeVideoTextureEmissive&&a.enable(20),T.alphaToCoverage&&a.enable(21),T.numLightProbeGrids>0&&a.enable(22),T.hasPositionAttribute&&a.enable(23),v.push(a.mask)}function S(v){let T=d[v.type],P;if(T){let L=hi[T];P=qu.clone(L.uniforms)}else P=v.uniforms;return P}function _(v,T){let P=u.get(T);return P!==void 0?++P.usedTimes:(P=new Hx(s,T,v,i),c.push(P),u.set(T,P)),P}function C(v){if(--v.usedTimes===0){let T=c.indexOf(v);c[T]=c[c.length-1],c.pop(),u.delete(v.cacheKey),v.destroy()}}function b(v){o.remove(v)}function I(){o.dispose()}return{getParameters:y,getProgramCacheKey:g,getUniforms:S,acquireProgram:_,releaseProgram:C,releaseShaderCache:b,programs:c,dispose:I}}function Xx(){let s=new WeakMap;function e(a){return s.has(a)}function t(a){let o=s.get(a);return o===void 0&&(o={},s.set(a,o)),o}function n(a){s.delete(a)}function i(a,o,l){s.get(a)[o]=l}function r(){s=new WeakMap}return{has:e,get:t,remove:n,update:i,dispose:r}}function qx(s,e){return s.groupOrder!==e.groupOrder?s.groupOrder-e.groupOrder:s.renderOrder!==e.renderOrder?s.renderOrder-e.renderOrder:s.material.id!==e.material.id?s.material.id-e.material.id:s.materialVariant!==e.materialVariant?s.materialVariant-e.materialVariant:s.z!==e.z?s.z-e.z:s.id-e.id}function df(s,e){return s.groupOrder!==e.groupOrder?s.groupOrder-e.groupOrder:s.renderOrder!==e.renderOrder?s.renderOrder-e.renderOrder:s.z!==e.z?e.z-s.z:s.id-e.id}function pf(){let s=[],e=0,t=[],n=[],i=[];function r(){e=0,t.length=0,n.length=0,i.length=0}function a(f){let d=0;return f.isInstancedMesh&&(d+=2),f.isSkinnedMesh&&(d+=1),d}function o(f,d,m,y,g,p){let E=s[e];return E===void 0?(E={id:f.id,object:f,geometry:d,material:m,materialVariant:a(f),groupOrder:y,renderOrder:f.renderOrder,z:g,group:p},s[e]=E):(E.id=f.id,E.object=f,E.geometry=d,E.material=m,E.materialVariant=a(f),E.groupOrder=y,E.renderOrder=f.renderOrder,E.z=g,E.group=p),e++,E}function l(f,d,m,y,g,p){let E=o(f,d,m,y,g,p);m.transmission>0?n.push(E):m.transparent===!0?i.push(E):t.push(E)}function c(f,d,m,y,g,p){let E=o(f,d,m,y,g,p);m.transmission>0?n.unshift(E):m.transparent===!0?i.unshift(E):t.unshift(E)}function u(f,d,m){t.length>1&&t.sort(f||qx),n.length>1&&n.sort(d||df),i.length>1&&i.sort(d||df),m&&(t.reverse(),n.reverse(),i.reverse())}function h(){for(let f=e,d=s.length;f<d;f++){let m=s[f];if(m.id===null)break;m.id=null,m.object=null,m.geometry=null,m.material=null,m.group=null}}return{opaque:t,transmissive:n,transparent:i,init:r,push:l,unshift:c,finish:h,sort:u}}function Yx(){let s=new WeakMap;function e(n,i){let r=s.get(n),a;return r===void 0?(a=new pf,s.set(n,[a])):i>=r.length?(a=new pf,r.push(a)):a=r[i],a}function t(){s=new WeakMap}return{get:e,dispose:t}}function Zx(){let s={};return{get:function(e){if(s[e.id]!==void 0)return s[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new N,color:new Ve};break;case"SpotLight":t={position:new N,direction:new N,color:new Ve,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new N,color:new Ve,distance:0,decay:0};break;case"HemisphereLight":t={direction:new N,skyColor:new Ve,groundColor:new Ve};break;case"RectAreaLight":t={color:new Ve,position:new N,halfWidth:new N,halfHeight:new N};break}return s[e.id]=t,t}}}function $x(){let s={};return{get:function(e){if(s[e.id]!==void 0)return s[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ke};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ke};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ke,shadowCameraNear:1,shadowCameraFar:1e3};break}return s[e.id]=t,t}}}var Kx=0;function Jx(s,e){return(e.castShadow?2:0)-(s.castShadow?2:0)+(e.map?1:0)-(s.map?1:0)}function Qx(s){let e=new Zx,t=$x(),n={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new N);let i=new N,r=new He,a=new He;function o(c){let u=0,h=0,f=0;for(let T=0;T<9;T++)n.probe[T].set(0,0,0);let d=0,m=0,y=0,g=0,p=0,E=0,S=0,_=0,C=0,b=0,I=0;c.sort(Jx);for(let T=0,P=c.length;T<P;T++){let L=c[T],F=L.color,K=L.intensity,J=L.distance,z=null;if(L.shadow&&L.shadow.map&&(L.shadow.map.texture.format===Qi?z=L.shadow.map.texture:z=L.shadow.map.depthTexture||L.shadow.map.texture),L.isAmbientLight)u+=F.r*K,h+=F.g*K,f+=F.b*K;else if(L.isLightProbe){for(let Q=0;Q<9;Q++)n.probe[Q].addScaledVector(L.sh.coefficients[Q],K);I++}else if(L.isDirectionalLight){let Q=e.get(L);if(Q.color.copy(L.color).multiplyScalar(L.intensity),L.castShadow){let $=L.shadow,se=t.get(L);se.shadowIntensity=$.intensity,se.shadowBias=$.bias,se.shadowNormalBias=$.normalBias,se.shadowRadius=$.radius,se.shadowMapSize=$.mapSize,n.directionalShadow[d]=se,n.directionalShadowMap[d]=z,n.directionalShadowMatrix[d]=L.shadow.matrix,E++}n.directional[d]=Q,d++}else if(L.isSpotLight){let Q=e.get(L);Q.position.setFromMatrixPosition(L.matrixWorld),Q.color.copy(F).multiplyScalar(K),Q.distance=J,Q.coneCos=Math.cos(L.angle),Q.penumbraCos=Math.cos(L.angle*(1-L.penumbra)),Q.decay=L.decay,n.spot[y]=Q;let $=L.shadow;if(L.map&&(n.spotLightMap[C]=L.map,C++,$.updateMatrices(L),L.castShadow&&b++),n.spotLightMatrix[y]=$.matrix,L.castShadow){let se=t.get(L);se.shadowIntensity=$.intensity,se.shadowBias=$.bias,se.shadowNormalBias=$.normalBias,se.shadowRadius=$.radius,se.shadowMapSize=$.mapSize,n.spotShadow[y]=se,n.spotShadowMap[y]=z,_++}y++}else if(L.isRectAreaLight){let Q=e.get(L);Q.color.copy(F).multiplyScalar(K),Q.halfWidth.set(L.width*.5,0,0),Q.halfHeight.set(0,L.height*.5,0),n.rectArea[g]=Q,g++}else if(L.isPointLight){let Q=e.get(L);if(Q.color.copy(L.color).multiplyScalar(L.intensity),Q.distance=L.distance,Q.decay=L.decay,L.castShadow){let $=L.shadow,se=t.get(L);se.shadowIntensity=$.intensity,se.shadowBias=$.bias,se.shadowNormalBias=$.normalBias,se.shadowRadius=$.radius,se.shadowMapSize=$.mapSize,se.shadowCameraNear=$.camera.near,se.shadowCameraFar=$.camera.far,n.pointShadow[m]=se,n.pointShadowMap[m]=z,n.pointShadowMatrix[m]=L.shadow.matrix,S++}n.point[m]=Q,m++}else if(L.isHemisphereLight){let Q=e.get(L);Q.skyColor.copy(L.color).multiplyScalar(K),Q.groundColor.copy(L.groundColor).multiplyScalar(K),n.hemi[p]=Q,p++}}g>0&&(s.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=we.LTC_FLOAT_1,n.rectAreaLTC2=we.LTC_FLOAT_2):(n.rectAreaLTC1=we.LTC_HALF_1,n.rectAreaLTC2=we.LTC_HALF_2)),n.ambient[0]=u,n.ambient[1]=h,n.ambient[2]=f;let v=n.hash;(v.directionalLength!==d||v.pointLength!==m||v.spotLength!==y||v.rectAreaLength!==g||v.hemiLength!==p||v.numDirectionalShadows!==E||v.numPointShadows!==S||v.numSpotShadows!==_||v.numSpotMaps!==C||v.numLightProbes!==I)&&(n.directional.length=d,n.spot.length=y,n.rectArea.length=g,n.point.length=m,n.hemi.length=p,n.directionalShadow.length=E,n.directionalShadowMap.length=E,n.pointShadow.length=S,n.pointShadowMap.length=S,n.spotShadow.length=_,n.spotShadowMap.length=_,n.directionalShadowMatrix.length=E,n.pointShadowMatrix.length=S,n.spotLightMatrix.length=_+C-b,n.spotLightMap.length=C,n.numSpotLightShadowsWithMaps=b,n.numLightProbes=I,v.directionalLength=d,v.pointLength=m,v.spotLength=y,v.rectAreaLength=g,v.hemiLength=p,v.numDirectionalShadows=E,v.numPointShadows=S,v.numSpotShadows=_,v.numSpotMaps=C,v.numLightProbes=I,n.version=Kx++)}function l(c,u){let h=0,f=0,d=0,m=0,y=0,g=u.matrixWorldInverse;for(let p=0,E=c.length;p<E;p++){let S=c[p];if(S.isDirectionalLight){let _=n.directional[h];_.direction.setFromMatrixPosition(S.matrixWorld),i.setFromMatrixPosition(S.target.matrixWorld),_.direction.sub(i),_.direction.transformDirection(g),h++}else if(S.isSpotLight){let _=n.spot[d];_.position.setFromMatrixPosition(S.matrixWorld),_.position.applyMatrix4(g),_.direction.setFromMatrixPosition(S.matrixWorld),i.setFromMatrixPosition(S.target.matrixWorld),_.direction.sub(i),_.direction.transformDirection(g),d++}else if(S.isRectAreaLight){let _=n.rectArea[m];_.position.setFromMatrixPosition(S.matrixWorld),_.position.applyMatrix4(g),a.identity(),r.copy(S.matrixWorld),r.premultiply(g),a.extractRotation(r),_.halfWidth.set(S.width*.5,0,0),_.halfHeight.set(0,S.height*.5,0),_.halfWidth.applyMatrix4(a),_.halfHeight.applyMatrix4(a),m++}else if(S.isPointLight){let _=n.point[f];_.position.setFromMatrixPosition(S.matrixWorld),_.position.applyMatrix4(g),f++}else if(S.isHemisphereLight){let _=n.hemi[y];_.direction.setFromMatrixPosition(S.matrixWorld),_.direction.transformDirection(g),y++}}}return{setup:o,setupView:l,state:n}}function mf(s){let e=new Qx(s),t=[],n=[],i=[];function r(f){h.camera=f,t.length=0,n.length=0,i.length=0}function a(f){t.push(f)}function o(f){n.push(f)}function l(f){i.push(f)}function c(){e.setup(t)}function u(f){e.setupView(t,f)}let h={lightsArray:t,shadowsArray:n,lightProbeGridArray:i,camera:null,lights:e,transmissionRenderTarget:{},textureUnits:0};return{init:r,state:h,setupLights:c,setupLightsView:u,pushLight:a,pushShadow:o,pushLightProbeGrid:l}}function jx(s){let e=new WeakMap;function t(i,r=0){let a=e.get(i),o;return a===void 0?(o=new mf(s),e.set(i,[o])):r>=a.length?(o=new mf(s),a.push(o)):o=a[r],o}function n(){e=new WeakMap}return{get:t,dispose:n}}var ev=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,tv=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,nv=[new N(1,0,0),new N(-1,0,0),new N(0,1,0),new N(0,-1,0),new N(0,0,1),new N(0,0,-1)],iv=[new N(0,-1,0),new N(0,-1,0),new N(0,0,1),new N(0,0,-1),new N(0,-1,0),new N(0,-1,0)],gf=new He,Ma=new N,jc=new N;function sv(s,e,t){let n=new Qs,i=new Ke,r=new Ke,a=new dt,o=new _o,l=new yo,c={},u=t.maxTextureSize,h={[vi]:vn,[vn]:vi,[Fn]:Fn},f=new In({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Ke},radius:{value:4}},vertexShader:ev,fragmentShader:tv}),d=f.clone();d.defines.HORIZONTAL_PASS=1;let m=new Wt;m.setAttribute("position",new An(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let y=new pt(m,f),g=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=oa;let p=this.type;this.render=function(b,I,v){if(g.enabled===!1||g.autoUpdate===!1&&g.needsUpdate===!1||b.length===0)return;this.type===Lo&&(ke("WebGLShadowMap: PCFSoftShadowMap has been deprecated. Using PCFShadowMap instead."),this.type=oa);let T=s.getRenderTarget(),P=s.getActiveCubeFace(),L=s.getActiveMipmapLevel(),F=s.state;F.setBlending(oi),F.buffers.depth.getReversed()===!0?F.buffers.color.setClear(0,0,0,0):F.buffers.color.setClear(1,1,1,1),F.buffers.depth.setTest(!0),F.setScissorTest(!1);let K=p!==this.type;K&&I.traverse(function(J){J.material&&(Array.isArray(J.material)?J.material.forEach(z=>z.needsUpdate=!0):J.material.needsUpdate=!0)});for(let J=0,z=b.length;J<z;J++){let Q=b[J],$=Q.shadow;if($===void 0){ke("WebGLShadowMap:",Q,"has no shadow.");continue}if($.autoUpdate===!1&&$.needsUpdate===!1)continue;i.copy($.mapSize);let se=$.getFrameExtents();i.multiply(se),r.copy($.mapSize),(i.x>u||i.y>u)&&(i.x>u&&(r.x=Math.floor(u/se.x),i.x=r.x*se.x,$.mapSize.x=r.x),i.y>u&&(r.y=Math.floor(u/se.y),i.y=r.y*se.y,$.mapSize.y=r.y));let oe=s.state.buffers.depth.getReversed();if($.camera._reversedDepth=oe,$.map===null||K===!0){if($.map!==null&&($.map.depthTexture!==null&&($.map.depthTexture.dispose(),$.map.depthTexture=null),$.map.dispose()),this.type===rr){if(Q.isPointLight){ke("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}$.map=new Cn(i.x,i.y,{format:Qi,type:li,minFilter:on,magFilter:on,generateMipmaps:!1}),$.map.texture.name=Q.name+".shadowMap",$.map.depthTexture=new yi(i.x,i.y,Un),$.map.depthTexture.name=Q.name+".shadowMapDepth",$.map.depthTexture.format=si,$.map.depthTexture.compareFunction=null,$.map.depthTexture.minFilter=sn,$.map.depthTexture.magFilter=sn}else Q.isPointLight?($.map=new bl(i.x),$.map.depthTexture=new xo(i.x,Zn)):($.map=new Cn(i.x,i.y),$.map.depthTexture=new yi(i.x,i.y,Zn)),$.map.depthTexture.name=Q.name+".shadowMap",$.map.depthTexture.format=si,this.type===oa?($.map.depthTexture.compareFunction=oe?_l:vl,$.map.depthTexture.minFilter=on,$.map.depthTexture.magFilter=on):($.map.depthTexture.compareFunction=null,$.map.depthTexture.minFilter=sn,$.map.depthTexture.magFilter=sn);$.camera.updateProjectionMatrix()}let he=$.map.isWebGLCubeRenderTarget?6:1;for(let fe=0;fe<he;fe++){if($.map.isWebGLCubeRenderTarget)s.setRenderTarget($.map,fe),s.clear();else{fe===0&&(s.setRenderTarget($.map),s.clear());let Ae=$.getViewport(fe);a.set(r.x*Ae.x,r.y*Ae.y,r.x*Ae.z,r.y*Ae.w),F.viewport(a)}if(Q.isPointLight){let Ae=$.camera,st=$.matrix,yt=Q.distance||Ae.far;yt!==Ae.far&&(Ae.far=yt,Ae.updateProjectionMatrix()),Ma.setFromMatrixPosition(Q.matrixWorld),Ae.position.copy(Ma),jc.copy(Ae.position),jc.add(nv[fe]),Ae.up.copy(iv[fe]),Ae.lookAt(jc),Ae.updateMatrixWorld(),st.makeTranslation(-Ma.x,-Ma.y,-Ma.z),gf.multiplyMatrices(Ae.projectionMatrix,Ae.matrixWorldInverse),$._frustum.setFromProjectionMatrix(gf,Ae.coordinateSystem,Ae.reversedDepth)}else $.updateMatrices(Q);n=$.getFrustum(),_(I,v,$.camera,Q,this.type)}$.isPointLightShadow!==!0&&this.type===rr&&E($,v),$.needsUpdate=!1}p=this.type,g.needsUpdate=!1,s.setRenderTarget(T,P,L)};function E(b,I){let v=e.update(y);f.defines.VSM_SAMPLES!==b.blurSamples&&(f.defines.VSM_SAMPLES=b.blurSamples,d.defines.VSM_SAMPLES=b.blurSamples,f.needsUpdate=!0,d.needsUpdate=!0),b.mapPass===null&&(b.mapPass=new Cn(i.x,i.y,{format:Qi,type:li})),f.uniforms.shadow_pass.value=b.map.depthTexture,f.uniforms.resolution.value=b.mapSize,f.uniforms.radius.value=b.radius,s.setRenderTarget(b.mapPass),s.clear(),s.renderBufferDirect(I,null,v,f,y,null),d.uniforms.shadow_pass.value=b.mapPass.texture,d.uniforms.resolution.value=b.mapSize,d.uniforms.radius.value=b.radius,s.setRenderTarget(b.map),s.clear(),s.renderBufferDirect(I,null,v,d,y,null)}function S(b,I,v,T){let P=null,L=v.isPointLight===!0?b.customDistanceMaterial:b.customDepthMaterial;if(L!==void 0)P=L;else if(P=v.isPointLight===!0?l:o,s.localClippingEnabled&&I.clipShadows===!0&&Array.isArray(I.clippingPlanes)&&I.clippingPlanes.length!==0||I.displacementMap&&I.displacementScale!==0||I.alphaMap&&I.alphaTest>0||I.map&&I.alphaTest>0||I.alphaToCoverage===!0){let F=P.uuid,K=I.uuid,J=c[F];J===void 0&&(J={},c[F]=J);let z=J[K];z===void 0&&(z=P.clone(),J[K]=z,I.addEventListener("dispose",C)),P=z}if(P.visible=I.visible,P.wireframe=I.wireframe,T===rr?P.side=I.shadowSide!==null?I.shadowSide:I.side:P.side=I.shadowSide!==null?I.shadowSide:h[I.side],P.alphaMap=I.alphaMap,P.alphaTest=I.alphaToCoverage===!0?.5:I.alphaTest,P.map=I.map,P.clipShadows=I.clipShadows,P.clippingPlanes=I.clippingPlanes,P.clipIntersection=I.clipIntersection,P.displacementMap=I.displacementMap,P.displacementScale=I.displacementScale,P.displacementBias=I.displacementBias,P.wireframeLinewidth=I.wireframeLinewidth,P.linewidth=I.linewidth,v.isPointLight===!0&&P.isMeshDistanceMaterial===!0){let F=s.properties.get(P);F.light=v}return P}function _(b,I,v,T,P){if(b.visible===!1)return;if(b.layers.test(I.layers)&&(b.isMesh||b.isLine||b.isPoints)&&(b.castShadow||b.receiveShadow&&P===rr)&&(!b.frustumCulled||n.intersectsObject(b))){b.modelViewMatrix.multiplyMatrices(v.matrixWorldInverse,b.matrixWorld);let K=e.update(b),J=b.material;if(Array.isArray(J)){let z=K.groups;for(let Q=0,$=z.length;Q<$;Q++){let se=z[Q],oe=J[se.materialIndex];if(oe&&oe.visible){let he=S(b,oe,T,P);b.onBeforeShadow(s,b,I,v,K,he,se),s.renderBufferDirect(v,null,K,he,b,se),b.onAfterShadow(s,b,I,v,K,he,se)}}}else if(J.visible){let z=S(b,J,T,P);b.onBeforeShadow(s,b,I,v,K,z,null),s.renderBufferDirect(v,null,K,z,b,null),b.onAfterShadow(s,b,I,v,K,z,null)}}let F=b.children;for(let K=0,J=F.length;K<J;K++)_(F[K],I,v,T,P)}function C(b){b.target.removeEventListener("dispose",C);for(let v in c){let T=c[v],P=b.target.uuid;P in T&&(T[P].dispose(),delete T[P])}}}function rv(s,e){function t(){let U=!1,me=new dt,re=null,_e=new dt(0,0,0,0);return{setMask:function(be){re!==be&&!U&&(s.colorMask(be,be,be,be),re=be)},setLocked:function(be){U=be},setClear:function(be,ae,Ne,Ie,Lt){Lt===!0&&(be*=Ie,ae*=Ie,Ne*=Ie),me.set(be,ae,Ne,Ie),_e.equals(me)===!1&&(s.clearColor(be,ae,Ne,Ie),_e.copy(me))},reset:function(){U=!1,re=null,_e.set(-1,0,0,0)}}}function n(){let U=!1,me=!1,re=null,_e=null,be=null;return{setReversed:function(ae){if(me!==ae){let Ne=e.get("EXT_clip_control");ae?Ne.clipControlEXT(Ne.LOWER_LEFT_EXT,Ne.ZERO_TO_ONE_EXT):Ne.clipControlEXT(Ne.LOWER_LEFT_EXT,Ne.NEGATIVE_ONE_TO_ONE_EXT),me=ae;let Ie=be;be=null,this.setClear(Ie)}},getReversed:function(){return me},setTest:function(ae){ae?le(s.DEPTH_TEST):Pe(s.DEPTH_TEST)},setMask:function(ae){re!==ae&&!U&&(s.depthMask(ae),re=ae)},setFunc:function(ae){if(me&&(ae=ku[ae]),_e!==ae){switch(ae){case no:s.depthFunc(s.NEVER);break;case io:s.depthFunc(s.ALWAYS);break;case so:s.depthFunc(s.LESS);break;case ps:s.depthFunc(s.LEQUAL);break;case ro:s.depthFunc(s.EQUAL);break;case ao:s.depthFunc(s.GEQUAL);break;case oo:s.depthFunc(s.GREATER);break;case lo:s.depthFunc(s.NOTEQUAL);break;default:s.depthFunc(s.LEQUAL)}_e=ae}},setLocked:function(ae){U=ae},setClear:function(ae){be!==ae&&(be=ae,me&&(ae=1-ae),s.clearDepth(ae))},reset:function(){U=!1,re=null,_e=null,be=null,me=!1}}}function i(){let U=!1,me=null,re=null,_e=null,be=null,ae=null,Ne=null,Ie=null,Lt=null;return{setTest:function(gt){U||(gt?le(s.STENCIL_TEST):Pe(s.STENCIL_TEST))},setMask:function(gt){me!==gt&&!U&&(s.stencilMask(gt),me=gt)},setFunc:function(gt,rn,Xe){(re!==gt||_e!==rn||be!==Xe)&&(s.stencilFunc(gt,rn,Xe),re=gt,_e=rn,be=Xe)},setOp:function(gt,rn,Xe){(ae!==gt||Ne!==rn||Ie!==Xe)&&(s.stencilOp(gt,rn,Xe),ae=gt,Ne=rn,Ie=Xe)},setLocked:function(gt){U=gt},setClear:function(gt){Lt!==gt&&(s.clearStencil(gt),Lt=gt)},reset:function(){U=!1,me=null,re=null,_e=null,be=null,ae=null,Ne=null,Ie=null,Lt=null}}}let r=new t,a=new n,o=new i,l=new WeakMap,c=new WeakMap,u={},h={},f={},d=new WeakMap,m=[],y=null,g=!1,p=null,E=null,S=null,_=null,C=null,b=null,I=null,v=new Ve(0,0,0),T=0,P=!1,L=null,F=null,K=null,J=null,z=null,Q=s.getParameter(s.MAX_COMBINED_TEXTURE_IMAGE_UNITS),$=!1,se=0,oe=s.getParameter(s.VERSION);oe.indexOf("WebGL")!==-1?(se=parseFloat(/^WebGL (\d)/.exec(oe)[1]),$=se>=1):oe.indexOf("OpenGL ES")!==-1&&(se=parseFloat(/^OpenGL ES (\d)/.exec(oe)[1]),$=se>=2);let he=null,fe={},Ae=s.getParameter(s.SCISSOR_BOX),st=s.getParameter(s.VIEWPORT),yt=new dt().fromArray(Ae),rt=new dt().fromArray(st);function ie(U,me,re,_e){let be=new Uint8Array(4),ae=s.createTexture();s.bindTexture(U,ae),s.texParameteri(U,s.TEXTURE_MIN_FILTER,s.NEAREST),s.texParameteri(U,s.TEXTURE_MAG_FILTER,s.NEAREST);for(let Ne=0;Ne<re;Ne++)U===s.TEXTURE_3D||U===s.TEXTURE_2D_ARRAY?s.texImage3D(me,0,s.RGBA,1,1,_e,0,s.RGBA,s.UNSIGNED_BYTE,be):s.texImage2D(me+Ne,0,s.RGBA,1,1,0,s.RGBA,s.UNSIGNED_BYTE,be);return ae}let de={};de[s.TEXTURE_2D]=ie(s.TEXTURE_2D,s.TEXTURE_2D,1),de[s.TEXTURE_CUBE_MAP]=ie(s.TEXTURE_CUBE_MAP,s.TEXTURE_CUBE_MAP_POSITIVE_X,6),de[s.TEXTURE_2D_ARRAY]=ie(s.TEXTURE_2D_ARRAY,s.TEXTURE_2D_ARRAY,1,1),de[s.TEXTURE_3D]=ie(s.TEXTURE_3D,s.TEXTURE_3D,1,1),r.setClear(0,0,0,1),a.setClear(1),o.setClear(0),le(s.DEPTH_TEST),a.setFunc(ps),Mt(!1),St(_c),le(s.CULL_FACE),ot(oi);function le(U){u[U]!==!0&&(s.enable(U),u[U]=!0)}function Pe(U){u[U]!==!1&&(s.disable(U),u[U]=!1)}function qe(U,me){return f[U]!==me?(s.bindFramebuffer(U,me),f[U]=me,U===s.DRAW_FRAMEBUFFER&&(f[s.FRAMEBUFFER]=me),U===s.FRAMEBUFFER&&(f[s.DRAW_FRAMEBUFFER]=me),!0):!1}function Le(U,me){let re=m,_e=!1;if(U){re=d.get(me),re===void 0&&(re=[],d.set(me,re));let be=U.textures;if(re.length!==be.length||re[0]!==s.COLOR_ATTACHMENT0){for(let ae=0,Ne=be.length;ae<Ne;ae++)re[ae]=s.COLOR_ATTACHMENT0+ae;re.length=be.length,_e=!0}}else re[0]!==s.BACK&&(re[0]=s.BACK,_e=!0);_e&&s.drawBuffers(re)}function mt(U){return y!==U?(s.useProgram(U),y=U,!0):!1}let Ze={[Bi]:s.FUNC_ADD,[au]:s.FUNC_SUBTRACT,[ou]:s.FUNC_REVERSE_SUBTRACT};Ze[lu]=s.MIN,Ze[cu]=s.MAX;let at={[hu]:s.ZERO,[uu]:s.ONE,[fu]:s.SRC_COLOR,[eo]:s.SRC_ALPHA,[vu]:s.SRC_ALPHA_SATURATE,[gu]:s.DST_COLOR,[pu]:s.DST_ALPHA,[du]:s.ONE_MINUS_SRC_COLOR,[to]:s.ONE_MINUS_SRC_ALPHA,[xu]:s.ONE_MINUS_DST_COLOR,[mu]:s.ONE_MINUS_DST_ALPHA,[_u]:s.CONSTANT_COLOR,[yu]:s.ONE_MINUS_CONSTANT_COLOR,[Mu]:s.CONSTANT_ALPHA,[Su]:s.ONE_MINUS_CONSTANT_ALPHA};function ot(U,me,re,_e,be,ae,Ne,Ie,Lt,gt){if(U===oi){g===!0&&(Pe(s.BLEND),g=!1);return}if(g===!1&&(le(s.BLEND),g=!0),U!==ru){if(U!==p||gt!==P){if((E!==Bi||C!==Bi)&&(s.blendEquation(s.FUNC_ADD),E=Bi,C=Bi),gt)switch(U){case ii:s.blendFuncSeparate(s.ONE,s.ONE_MINUS_SRC_ALPHA,s.ONE,s.ONE_MINUS_SRC_ALPHA);break;case Zi:s.blendFunc(s.ONE,s.ONE);break;case yc:s.blendFuncSeparate(s.ZERO,s.ONE_MINUS_SRC_COLOR,s.ZERO,s.ONE);break;case Mc:s.blendFuncSeparate(s.DST_COLOR,s.ONE_MINUS_SRC_ALPHA,s.ZERO,s.ONE);break;default:Ye("WebGLState: Invalid blending: ",U);break}else switch(U){case ii:s.blendFuncSeparate(s.SRC_ALPHA,s.ONE_MINUS_SRC_ALPHA,s.ONE,s.ONE_MINUS_SRC_ALPHA);break;case Zi:s.blendFuncSeparate(s.SRC_ALPHA,s.ONE,s.ONE,s.ONE);break;case yc:Ye("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case Mc:Ye("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:Ye("WebGLState: Invalid blending: ",U);break}S=null,_=null,b=null,I=null,v.set(0,0,0),T=0,p=U,P=gt}return}be=be||me,ae=ae||re,Ne=Ne||_e,(me!==E||be!==C)&&(s.blendEquationSeparate(Ze[me],Ze[be]),E=me,C=be),(re!==S||_e!==_||ae!==b||Ne!==I)&&(s.blendFuncSeparate(at[re],at[_e],at[ae],at[Ne]),S=re,_=_e,b=ae,I=Ne),(Ie.equals(v)===!1||Lt!==T)&&(s.blendColor(Ie.r,Ie.g,Ie.b,Lt),v.copy(Ie),T=Lt),p=U,P=!1}function nt(U,me){U.side===Fn?Pe(s.CULL_FACE):le(s.CULL_FACE);let re=U.side===vn;me&&(re=!re),Mt(re),U.blending===ii&&U.transparent===!1?ot(oi):ot(U.blending,U.blendEquation,U.blendSrc,U.blendDst,U.blendEquationAlpha,U.blendSrcAlpha,U.blendDstAlpha,U.blendColor,U.blendAlpha,U.premultipliedAlpha),a.setFunc(U.depthFunc),a.setTest(U.depthTest),a.setMask(U.depthWrite),r.setMask(U.colorWrite);let _e=U.stencilWrite;o.setTest(_e),_e&&(o.setMask(U.stencilWriteMask),o.setFunc(U.stencilFunc,U.stencilRef,U.stencilFuncMask),o.setOp(U.stencilFail,U.stencilZFail,U.stencilZPass)),wt(U.polygonOffset,U.polygonOffsetFactor,U.polygonOffsetUnits),U.alphaToCoverage===!0?le(s.SAMPLE_ALPHA_TO_COVERAGE):Pe(s.SAMPLE_ALPHA_TO_COVERAGE)}function Mt(U){L!==U&&(U?s.frontFace(s.CW):s.frontFace(s.CCW),L=U)}function St(U){U!==iu?(le(s.CULL_FACE),U!==F&&(U===_c?s.cullFace(s.BACK):U===su?s.cullFace(s.FRONT):s.cullFace(s.FRONT_AND_BACK))):Pe(s.CULL_FACE),F=U}function xt(U){U!==K&&($&&s.lineWidth(U),K=U)}function wt(U,me,re){U?(le(s.POLYGON_OFFSET_FILL),(J!==me||z!==re)&&(J=me,z=re,a.getReversed()&&(me=-me),s.polygonOffset(me,re))):Pe(s.POLYGON_OFFSET_FILL)}function Pt(U){U?le(s.SCISSOR_TEST):Pe(s.SCISSOR_TEST)}function Nt(U){U===void 0&&(U=s.TEXTURE0+Q-1),he!==U&&(s.activeTexture(U),he=U)}function B(U,me,re){re===void 0&&(he===null?re=s.TEXTURE0+Q-1:re=he);let _e=fe[re];_e===void 0&&(_e={type:void 0,texture:void 0},fe[re]=_e),(_e.type!==U||_e.texture!==me)&&(he!==re&&(s.activeTexture(re),he=re),s.bindTexture(U,me||de[U]),_e.type=U,_e.texture=me)}function Ot(){let U=fe[he];U!==void 0&&U.type!==void 0&&(s.bindTexture(U.type,null),U.type=void 0,U.texture=void 0)}function Je(){try{s.compressedTexImage2D(...arguments)}catch(U){Ye("WebGLState:",U)}}function R(){try{s.compressedTexImage3D(...arguments)}catch(U){Ye("WebGLState:",U)}}function x(){try{s.texSubImage2D(...arguments)}catch(U){Ye("WebGLState:",U)}}function k(){try{s.texSubImage3D(...arguments)}catch(U){Ye("WebGLState:",U)}}function q(){try{s.compressedTexSubImage2D(...arguments)}catch(U){Ye("WebGLState:",U)}}function te(){try{s.compressedTexSubImage3D(...arguments)}catch(U){Ye("WebGLState:",U)}}function ue(){try{s.texStorage2D(...arguments)}catch(U){Ye("WebGLState:",U)}}function ge(){try{s.texStorage3D(...arguments)}catch(U){Ye("WebGLState:",U)}}function ne(){try{s.texImage2D(...arguments)}catch(U){Ye("WebGLState:",U)}}function j(){try{s.texImage3D(...arguments)}catch(U){Ye("WebGLState:",U)}}function ce(U){return h[U]!==void 0?h[U]:s.getParameter(U)}function xe(U,me){h[U]!==me&&(s.pixelStorei(U,me),h[U]=me)}function Me(U){yt.equals(U)===!1&&(s.scissor(U.x,U.y,U.z,U.w),yt.copy(U))}function ve(U){rt.equals(U)===!1&&(s.viewport(U.x,U.y,U.z,U.w),rt.copy(U))}function Ge(U,me){let re=c.get(me);re===void 0&&(re=new WeakMap,c.set(me,re));let _e=re.get(U);_e===void 0&&(_e=s.getUniformBlockIndex(me,U.name),re.set(U,_e))}function We(U,me){let _e=c.get(me).get(U);l.get(me)!==_e&&(s.uniformBlockBinding(me,_e,U.__bindingPointIndex),l.set(me,_e))}function $e(){s.disable(s.BLEND),s.disable(s.CULL_FACE),s.disable(s.DEPTH_TEST),s.disable(s.POLYGON_OFFSET_FILL),s.disable(s.SCISSOR_TEST),s.disable(s.STENCIL_TEST),s.disable(s.SAMPLE_ALPHA_TO_COVERAGE),s.blendEquation(s.FUNC_ADD),s.blendFunc(s.ONE,s.ZERO),s.blendFuncSeparate(s.ONE,s.ZERO,s.ONE,s.ZERO),s.blendColor(0,0,0,0),s.colorMask(!0,!0,!0,!0),s.clearColor(0,0,0,0),s.depthMask(!0),s.depthFunc(s.LESS),a.setReversed(!1),s.clearDepth(1),s.stencilMask(4294967295),s.stencilFunc(s.ALWAYS,0,4294967295),s.stencilOp(s.KEEP,s.KEEP,s.KEEP),s.clearStencil(0),s.cullFace(s.BACK),s.frontFace(s.CCW),s.polygonOffset(0,0),s.activeTexture(s.TEXTURE0),s.bindFramebuffer(s.FRAMEBUFFER,null),s.bindFramebuffer(s.DRAW_FRAMEBUFFER,null),s.bindFramebuffer(s.READ_FRAMEBUFFER,null),s.useProgram(null),s.lineWidth(1),s.scissor(0,0,s.canvas.width,s.canvas.height),s.viewport(0,0,s.canvas.width,s.canvas.height),s.pixelStorei(s.PACK_ALIGNMENT,4),s.pixelStorei(s.UNPACK_ALIGNMENT,4),s.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,!1),s.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),s.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,s.BROWSER_DEFAULT_WEBGL),s.pixelStorei(s.PACK_ROW_LENGTH,0),s.pixelStorei(s.PACK_SKIP_PIXELS,0),s.pixelStorei(s.PACK_SKIP_ROWS,0),s.pixelStorei(s.UNPACK_ROW_LENGTH,0),s.pixelStorei(s.UNPACK_IMAGE_HEIGHT,0),s.pixelStorei(s.UNPACK_SKIP_PIXELS,0),s.pixelStorei(s.UNPACK_SKIP_ROWS,0),s.pixelStorei(s.UNPACK_SKIP_IMAGES,0),u={},h={},he=null,fe={},f={},d=new WeakMap,m=[],y=null,g=!1,p=null,E=null,S=null,_=null,C=null,b=null,I=null,v=new Ve(0,0,0),T=0,P=!1,L=null,F=null,K=null,J=null,z=null,yt.set(0,0,s.canvas.width,s.canvas.height),rt.set(0,0,s.canvas.width,s.canvas.height),r.reset(),a.reset(),o.reset()}return{buffers:{color:r,depth:a,stencil:o},enable:le,disable:Pe,bindFramebuffer:qe,drawBuffers:Le,useProgram:mt,setBlending:ot,setMaterial:nt,setFlipSided:Mt,setCullFace:St,setLineWidth:xt,setPolygonOffset:wt,setScissorTest:Pt,activeTexture:Nt,bindTexture:B,unbindTexture:Ot,compressedTexImage2D:Je,compressedTexImage3D:R,texImage2D:ne,texImage3D:j,pixelStorei:xe,getParameter:ce,updateUBOMapping:Ge,uniformBlockBinding:We,texStorage2D:ue,texStorage3D:ge,texSubImage2D:x,texSubImage3D:k,compressedTexSubImage2D:q,compressedTexSubImage3D:te,scissor:Me,viewport:ve,reset:$e}}function av(s,e,t,n,i,r,a){let o=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new Ke,u=new WeakMap,h=new Set,f,d=new WeakMap,m=!1;try{m=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function y(R,x){return m?new OffscreenCanvas(R,x):Ys("canvas")}function g(R,x,k){let q=1,te=Je(R);if((te.width>k||te.height>k)&&(q=k/Math.max(te.width,te.height)),q<1)if(typeof HTMLImageElement<"u"&&R instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&R instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&R instanceof ImageBitmap||typeof VideoFrame<"u"&&R instanceof VideoFrame){let ue=Math.floor(q*te.width),ge=Math.floor(q*te.height);f===void 0&&(f=y(ue,ge));let ne=x?y(ue,ge):f;return ne.width=ue,ne.height=ge,ne.getContext("2d").drawImage(R,0,0,ue,ge),ke("WebGLRenderer: Texture has been resized from ("+te.width+"x"+te.height+") to ("+ue+"x"+ge+")."),ne}else return"data"in R&&ke("WebGLRenderer: Image in DataTexture is too big ("+te.width+"x"+te.height+")."),R;return R}function p(R){return R.generateMipmaps}function E(R){s.generateMipmap(R)}function S(R){return R.isWebGLCubeRenderTarget?s.TEXTURE_CUBE_MAP:R.isWebGL3DRenderTarget?s.TEXTURE_3D:R.isWebGLArrayRenderTarget||R.isCompressedArrayTexture?s.TEXTURE_2D_ARRAY:s.TEXTURE_2D}function _(R,x,k,q,te,ue=!1){if(R!==null){if(s[R]!==void 0)return s[R];ke("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+R+"'")}let ge;q&&(ge=e.get("EXT_texture_norm16"),ge||ke("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let ne=x;if(x===s.RED&&(k===s.FLOAT&&(ne=s.R32F),k===s.HALF_FLOAT&&(ne=s.R16F),k===s.UNSIGNED_BYTE&&(ne=s.R8),k===s.UNSIGNED_SHORT&&ge&&(ne=ge.R16_EXT),k===s.SHORT&&ge&&(ne=ge.R16_SNORM_EXT)),x===s.RED_INTEGER&&(k===s.UNSIGNED_BYTE&&(ne=s.R8UI),k===s.UNSIGNED_SHORT&&(ne=s.R16UI),k===s.UNSIGNED_INT&&(ne=s.R32UI),k===s.BYTE&&(ne=s.R8I),k===s.SHORT&&(ne=s.R16I),k===s.INT&&(ne=s.R32I)),x===s.RG&&(k===s.FLOAT&&(ne=s.RG32F),k===s.HALF_FLOAT&&(ne=s.RG16F),k===s.UNSIGNED_BYTE&&(ne=s.RG8),k===s.UNSIGNED_SHORT&&ge&&(ne=ge.RG16_EXT),k===s.SHORT&&ge&&(ne=ge.RG16_SNORM_EXT)),x===s.RG_INTEGER&&(k===s.UNSIGNED_BYTE&&(ne=s.RG8UI),k===s.UNSIGNED_SHORT&&(ne=s.RG16UI),k===s.UNSIGNED_INT&&(ne=s.RG32UI),k===s.BYTE&&(ne=s.RG8I),k===s.SHORT&&(ne=s.RG16I),k===s.INT&&(ne=s.RG32I)),x===s.RGB_INTEGER&&(k===s.UNSIGNED_BYTE&&(ne=s.RGB8UI),k===s.UNSIGNED_SHORT&&(ne=s.RGB16UI),k===s.UNSIGNED_INT&&(ne=s.RGB32UI),k===s.BYTE&&(ne=s.RGB8I),k===s.SHORT&&(ne=s.RGB16I),k===s.INT&&(ne=s.RGB32I)),x===s.RGBA_INTEGER&&(k===s.UNSIGNED_BYTE&&(ne=s.RGBA8UI),k===s.UNSIGNED_SHORT&&(ne=s.RGBA16UI),k===s.UNSIGNED_INT&&(ne=s.RGBA32UI),k===s.BYTE&&(ne=s.RGBA8I),k===s.SHORT&&(ne=s.RGBA16I),k===s.INT&&(ne=s.RGBA32I)),x===s.RGB&&(k===s.UNSIGNED_SHORT&&ge&&(ne=ge.RGB16_EXT),k===s.SHORT&&ge&&(ne=ge.RGB16_SNORM_EXT),k===s.UNSIGNED_INT_5_9_9_9_REV&&(ne=s.RGB9_E5),k===s.UNSIGNED_INT_10F_11F_11F_REV&&(ne=s.R11F_G11F_B10F)),x===s.RGBA){let j=ue?Ir:et.getTransfer(te);k===s.FLOAT&&(ne=s.RGBA32F),k===s.HALF_FLOAT&&(ne=s.RGBA16F),k===s.UNSIGNED_BYTE&&(ne=j===Et?s.SRGB8_ALPHA8:s.RGBA8),k===s.UNSIGNED_SHORT&&ge&&(ne=ge.RGBA16_EXT),k===s.SHORT&&ge&&(ne=ge.RGBA16_SNORM_EXT),k===s.UNSIGNED_SHORT_4_4_4_4&&(ne=s.RGBA4),k===s.UNSIGNED_SHORT_5_5_5_1&&(ne=s.RGB5_A1)}return(ne===s.R16F||ne===s.R32F||ne===s.RG16F||ne===s.RG32F||ne===s.RGBA16F||ne===s.RGBA32F)&&e.get("EXT_color_buffer_float"),ne}function C(R,x){let k;return R?x===null||x===Zn||x===lr?k=s.DEPTH24_STENCIL8:x===Un?k=s.DEPTH32F_STENCIL8:x===or&&(k=s.DEPTH24_STENCIL8,ke("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):x===null||x===Zn||x===lr?k=s.DEPTH_COMPONENT24:x===Un?k=s.DEPTH_COMPONENT32F:x===or&&(k=s.DEPTH_COMPONENT16),k}function b(R,x){return p(R)===!0||R.isFramebufferTexture&&R.minFilter!==sn&&R.minFilter!==on?Math.log2(Math.max(x.width,x.height))+1:R.mipmaps!==void 0&&R.mipmaps.length>0?R.mipmaps.length:R.isCompressedTexture&&Array.isArray(R.image)?x.mipmaps.length:1}function I(R){let x=R.target;x.removeEventListener("dispose",I),T(x),x.isVideoTexture&&u.delete(x),x.isHTMLTexture&&h.delete(x)}function v(R){let x=R.target;x.removeEventListener("dispose",v),L(x)}function T(R){let x=n.get(R);if(x.__webglInit===void 0)return;let k=R.source,q=d.get(k);if(q){let te=q[x.__cacheKey];te.usedTimes--,te.usedTimes===0&&P(R),Object.keys(q).length===0&&d.delete(k)}n.remove(R)}function P(R){let x=n.get(R);s.deleteTexture(x.__webglTexture);let k=R.source,q=d.get(k);delete q[x.__cacheKey],a.memory.textures--}function L(R){let x=n.get(R);if(R.depthTexture&&(R.depthTexture.dispose(),n.remove(R.depthTexture)),R.isWebGLCubeRenderTarget)for(let q=0;q<6;q++){if(Array.isArray(x.__webglFramebuffer[q]))for(let te=0;te<x.__webglFramebuffer[q].length;te++)s.deleteFramebuffer(x.__webglFramebuffer[q][te]);else s.deleteFramebuffer(x.__webglFramebuffer[q]);x.__webglDepthbuffer&&s.deleteRenderbuffer(x.__webglDepthbuffer[q])}else{if(Array.isArray(x.__webglFramebuffer))for(let q=0;q<x.__webglFramebuffer.length;q++)s.deleteFramebuffer(x.__webglFramebuffer[q]);else s.deleteFramebuffer(x.__webglFramebuffer);if(x.__webglDepthbuffer&&s.deleteRenderbuffer(x.__webglDepthbuffer),x.__webglMultisampledFramebuffer&&s.deleteFramebuffer(x.__webglMultisampledFramebuffer),x.__webglColorRenderbuffer)for(let q=0;q<x.__webglColorRenderbuffer.length;q++)x.__webglColorRenderbuffer[q]&&s.deleteRenderbuffer(x.__webglColorRenderbuffer[q]);x.__webglDepthRenderbuffer&&s.deleteRenderbuffer(x.__webglDepthRenderbuffer)}let k=R.textures;for(let q=0,te=k.length;q<te;q++){let ue=n.get(k[q]);ue.__webglTexture&&(s.deleteTexture(ue.__webglTexture),a.memory.textures--),n.remove(k[q])}n.remove(R)}let F=0;function K(){F=0}function J(){return F}function z(R){F=R}function Q(){let R=F;return R>=i.maxTextures&&ke("WebGLTextures: Trying to use "+R+" texture units while this GPU supports only "+i.maxTextures),F+=1,R}function $(R){let x=[];return x.push(R.wrapS),x.push(R.wrapT),x.push(R.wrapR||0),x.push(R.magFilter),x.push(R.minFilter),x.push(R.anisotropy),x.push(R.internalFormat),x.push(R.format),x.push(R.type),x.push(R.generateMipmaps),x.push(R.premultiplyAlpha),x.push(R.flipY),x.push(R.unpackAlignment),x.push(R.colorSpace),x.join()}function se(R,x){let k=n.get(R);if(R.isVideoTexture&&B(R),R.isRenderTargetTexture===!1&&R.isExternalTexture!==!0&&R.version>0&&k.__version!==R.version){let q=R.image;if(q===null)ke("WebGLRenderer: Texture marked for update but no image data found.");else if(q.complete===!1)ke("WebGLRenderer: Texture marked for update but image is incomplete");else{Pe(k,R,x);return}}else R.isExternalTexture&&(k.__webglTexture=R.sourceTexture?R.sourceTexture:null);t.bindTexture(s.TEXTURE_2D,k.__webglTexture,s.TEXTURE0+x)}function oe(R,x){let k=n.get(R);if(R.isRenderTargetTexture===!1&&R.version>0&&k.__version!==R.version){Pe(k,R,x);return}else R.isExternalTexture&&(k.__webglTexture=R.sourceTexture?R.sourceTexture:null);t.bindTexture(s.TEXTURE_2D_ARRAY,k.__webglTexture,s.TEXTURE0+x)}function he(R,x){let k=n.get(R);if(R.isRenderTargetTexture===!1&&R.version>0&&k.__version!==R.version){Pe(k,R,x);return}t.bindTexture(s.TEXTURE_3D,k.__webglTexture,s.TEXTURE0+x)}function fe(R,x){let k=n.get(R);if(R.isCubeDepthTexture!==!0&&R.version>0&&k.__version!==R.version){qe(k,R,x);return}t.bindTexture(s.TEXTURE_CUBE_MAP,k.__webglTexture,s.TEXTURE0+x)}let Ae={[ms]:s.REPEAT,[wn]:s.CLAMP_TO_EDGE,[co]:s.MIRRORED_REPEAT},st={[sn]:s.NEAREST,[wu]:s.NEAREST_MIPMAP_NEAREST,[ua]:s.NEAREST_MIPMAP_LINEAR,[on]:s.LINEAR,[No]:s.LINEAR_MIPMAP_NEAREST,[Ki]:s.LINEAR_MIPMAP_LINEAR},yt={[Pu]:s.NEVER,[Uu]:s.ALWAYS,[Lu]:s.LESS,[vl]:s.LEQUAL,[Du]:s.EQUAL,[_l]:s.GEQUAL,[Nu]:s.GREATER,[Fu]:s.NOTEQUAL};function rt(R,x){if(x.type===Un&&e.has("OES_texture_float_linear")===!1&&(x.magFilter===on||x.magFilter===No||x.magFilter===ua||x.magFilter===Ki||x.minFilter===on||x.minFilter===No||x.minFilter===ua||x.minFilter===Ki)&&ke("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),s.texParameteri(R,s.TEXTURE_WRAP_S,Ae[x.wrapS]),s.texParameteri(R,s.TEXTURE_WRAP_T,Ae[x.wrapT]),(R===s.TEXTURE_3D||R===s.TEXTURE_2D_ARRAY)&&s.texParameteri(R,s.TEXTURE_WRAP_R,Ae[x.wrapR]),s.texParameteri(R,s.TEXTURE_MAG_FILTER,st[x.magFilter]),s.texParameteri(R,s.TEXTURE_MIN_FILTER,st[x.minFilter]),x.compareFunction&&(s.texParameteri(R,s.TEXTURE_COMPARE_MODE,s.COMPARE_REF_TO_TEXTURE),s.texParameteri(R,s.TEXTURE_COMPARE_FUNC,yt[x.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(x.magFilter===sn||x.minFilter!==ua&&x.minFilter!==Ki||x.type===Un&&e.has("OES_texture_float_linear")===!1)return;if(x.anisotropy>1||n.get(x).__currentAnisotropy){let k=e.get("EXT_texture_filter_anisotropic");s.texParameterf(R,k.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(x.anisotropy,i.getMaxAnisotropy())),n.get(x).__currentAnisotropy=x.anisotropy}}}function ie(R,x){let k=!1;R.__webglInit===void 0&&(R.__webglInit=!0,x.addEventListener("dispose",I));let q=x.source,te=d.get(q);te===void 0&&(te={},d.set(q,te));let ue=$(x);if(ue!==R.__cacheKey){te[ue]===void 0&&(te[ue]={texture:s.createTexture(),usedTimes:0},a.memory.textures++,k=!0),te[ue].usedTimes++;let ge=te[R.__cacheKey];ge!==void 0&&(te[R.__cacheKey].usedTimes--,ge.usedTimes===0&&P(x)),R.__cacheKey=ue,R.__webglTexture=te[ue].texture}return k}function de(R,x,k){return Math.floor(Math.floor(R/k)/x)}function le(R,x,k,q){let ue=R.updateRanges;if(ue.length===0)t.texSubImage2D(s.TEXTURE_2D,0,0,0,x.width,x.height,k,q,x.data);else{ue.sort((xe,Me)=>xe.start-Me.start);let ge=0;for(let xe=1;xe<ue.length;xe++){let Me=ue[ge],ve=ue[xe],Ge=Me.start+Me.count,We=de(ve.start,x.width,4),$e=de(Me.start,x.width,4);ve.start<=Ge+1&&We===$e&&de(ve.start+ve.count-1,x.width,4)===We?Me.count=Math.max(Me.count,ve.start+ve.count-Me.start):(++ge,ue[ge]=ve)}ue.length=ge+1;let ne=t.getParameter(s.UNPACK_ROW_LENGTH),j=t.getParameter(s.UNPACK_SKIP_PIXELS),ce=t.getParameter(s.UNPACK_SKIP_ROWS);t.pixelStorei(s.UNPACK_ROW_LENGTH,x.width);for(let xe=0,Me=ue.length;xe<Me;xe++){let ve=ue[xe],Ge=Math.floor(ve.start/4),We=Math.ceil(ve.count/4),$e=Ge%x.width,U=Math.floor(Ge/x.width),me=We,re=1;t.pixelStorei(s.UNPACK_SKIP_PIXELS,$e),t.pixelStorei(s.UNPACK_SKIP_ROWS,U),t.texSubImage2D(s.TEXTURE_2D,0,$e,U,me,re,k,q,x.data)}R.clearUpdateRanges(),t.pixelStorei(s.UNPACK_ROW_LENGTH,ne),t.pixelStorei(s.UNPACK_SKIP_PIXELS,j),t.pixelStorei(s.UNPACK_SKIP_ROWS,ce)}}function Pe(R,x,k){let q=s.TEXTURE_2D;(x.isDataArrayTexture||x.isCompressedArrayTexture)&&(q=s.TEXTURE_2D_ARRAY),x.isData3DTexture&&(q=s.TEXTURE_3D);let te=ie(R,x),ue=x.source;t.bindTexture(q,R.__webglTexture,s.TEXTURE0+k);let ge=n.get(ue);if(ue.version!==ge.__version||te===!0){if(t.activeTexture(s.TEXTURE0+k),(typeof ImageBitmap<"u"&&x.image instanceof ImageBitmap)===!1){let re=et.getPrimaries(et.workingColorSpace),_e=x.colorSpace===Ei?null:et.getPrimaries(x.colorSpace),be=x.colorSpace===Ei||re===_e?s.NONE:s.BROWSER_DEFAULT_WEBGL;t.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,x.flipY),t.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,x.premultiplyAlpha),t.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,be)}t.pixelStorei(s.UNPACK_ALIGNMENT,x.unpackAlignment);let j=g(x.image,!1,i.maxTextureSize);j=Ot(x,j);let ce=r.convert(x.format,x.colorSpace),xe=r.convert(x.type),Me=_(x.internalFormat,ce,xe,x.normalized,x.colorSpace,x.isVideoTexture);rt(q,x);let ve,Ge=x.mipmaps,We=x.isVideoTexture!==!0,$e=ge.__version===void 0||te===!0,U=ue.dataReady,me=b(x,j);if(x.isDepthTexture)Me=C(x.format===Ji,x.type),$e&&(We?t.texStorage2D(s.TEXTURE_2D,1,Me,j.width,j.height):t.texImage2D(s.TEXTURE_2D,0,Me,j.width,j.height,0,ce,xe,null));else if(x.isDataTexture)if(Ge.length>0){We&&$e&&t.texStorage2D(s.TEXTURE_2D,me,Me,Ge[0].width,Ge[0].height);for(let re=0,_e=Ge.length;re<_e;re++)ve=Ge[re],We?U&&t.texSubImage2D(s.TEXTURE_2D,re,0,0,ve.width,ve.height,ce,xe,ve.data):t.texImage2D(s.TEXTURE_2D,re,Me,ve.width,ve.height,0,ce,xe,ve.data);x.generateMipmaps=!1}else We?($e&&t.texStorage2D(s.TEXTURE_2D,me,Me,j.width,j.height),U&&le(x,j,ce,xe)):t.texImage2D(s.TEXTURE_2D,0,Me,j.width,j.height,0,ce,xe,j.data);else if(x.isCompressedTexture)if(x.isCompressedArrayTexture){We&&$e&&t.texStorage3D(s.TEXTURE_2D_ARRAY,me,Me,Ge[0].width,Ge[0].height,j.depth);for(let re=0,_e=Ge.length;re<_e;re++)if(ve=Ge[re],x.format!==Pn)if(ce!==null)if(We){if(U)if(x.layerUpdates.size>0){let be=Vc(ve.width,ve.height,x.format,x.type);for(let ae of x.layerUpdates){let Ne=ve.data.subarray(ae*be/ve.data.BYTES_PER_ELEMENT,(ae+1)*be/ve.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY,re,0,0,ae,ve.width,ve.height,1,ce,Ne)}x.clearLayerUpdates()}else t.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY,re,0,0,0,ve.width,ve.height,j.depth,ce,ve.data)}else t.compressedTexImage3D(s.TEXTURE_2D_ARRAY,re,Me,ve.width,ve.height,j.depth,0,ve.data,0,0);else ke("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else We?U&&t.texSubImage3D(s.TEXTURE_2D_ARRAY,re,0,0,0,ve.width,ve.height,j.depth,ce,xe,ve.data):t.texImage3D(s.TEXTURE_2D_ARRAY,re,Me,ve.width,ve.height,j.depth,0,ce,xe,ve.data)}else{We&&$e&&t.texStorage2D(s.TEXTURE_2D,me,Me,Ge[0].width,Ge[0].height);for(let re=0,_e=Ge.length;re<_e;re++)ve=Ge[re],x.format!==Pn?ce!==null?We?U&&t.compressedTexSubImage2D(s.TEXTURE_2D,re,0,0,ve.width,ve.height,ce,ve.data):t.compressedTexImage2D(s.TEXTURE_2D,re,Me,ve.width,ve.height,0,ve.data):ke("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):We?U&&t.texSubImage2D(s.TEXTURE_2D,re,0,0,ve.width,ve.height,ce,xe,ve.data):t.texImage2D(s.TEXTURE_2D,re,Me,ve.width,ve.height,0,ce,xe,ve.data)}else if(x.isDataArrayTexture)if(We){if($e&&t.texStorage3D(s.TEXTURE_2D_ARRAY,me,Me,j.width,j.height,j.depth),U)if(x.layerUpdates.size>0){let re=Vc(j.width,j.height,x.format,x.type);for(let _e of x.layerUpdates){let be=j.data.subarray(_e*re/j.data.BYTES_PER_ELEMENT,(_e+1)*re/j.data.BYTES_PER_ELEMENT);t.texSubImage3D(s.TEXTURE_2D_ARRAY,0,0,0,_e,j.width,j.height,1,ce,xe,be)}x.clearLayerUpdates()}else t.texSubImage3D(s.TEXTURE_2D_ARRAY,0,0,0,0,j.width,j.height,j.depth,ce,xe,j.data)}else t.texImage3D(s.TEXTURE_2D_ARRAY,0,Me,j.width,j.height,j.depth,0,ce,xe,j.data);else if(x.isData3DTexture)We?($e&&t.texStorage3D(s.TEXTURE_3D,me,Me,j.width,j.height,j.depth),U&&t.texSubImage3D(s.TEXTURE_3D,0,0,0,0,j.width,j.height,j.depth,ce,xe,j.data)):t.texImage3D(s.TEXTURE_3D,0,Me,j.width,j.height,j.depth,0,ce,xe,j.data);else if(x.isFramebufferTexture){if($e)if(We)t.texStorage2D(s.TEXTURE_2D,me,Me,j.width,j.height);else{let re=j.width,_e=j.height;for(let be=0;be<me;be++)t.texImage2D(s.TEXTURE_2D,be,Me,re,_e,0,ce,xe,null),re>>=1,_e>>=1}}else if(x.isHTMLTexture){if("texElementImage2D"in s){let re=s.canvas;if(re.hasAttribute("layoutsubtree")||re.setAttribute("layoutsubtree","true"),j.parentNode!==re){re.appendChild(j),h.add(x),re.onpaint=_e=>{let be=_e.changedElements;for(let ae of h)be.includes(ae.image)&&(ae.needsUpdate=!0)},re.requestPaint();return}if(s.texElementImage2D.length===3)s.texElementImage2D(s.TEXTURE_2D,s.RGBA8,j);else{let be=s.RGBA,ae=s.RGBA,Ne=s.UNSIGNED_BYTE;s.texElementImage2D(s.TEXTURE_2D,0,be,ae,Ne,j)}s.texParameteri(s.TEXTURE_2D,s.TEXTURE_MIN_FILTER,s.LINEAR),s.texParameteri(s.TEXTURE_2D,s.TEXTURE_WRAP_S,s.CLAMP_TO_EDGE),s.texParameteri(s.TEXTURE_2D,s.TEXTURE_WRAP_T,s.CLAMP_TO_EDGE)}}else if(Ge.length>0){if(We&&$e){let re=Je(Ge[0]);t.texStorage2D(s.TEXTURE_2D,me,Me,re.width,re.height)}for(let re=0,_e=Ge.length;re<_e;re++)ve=Ge[re],We?U&&t.texSubImage2D(s.TEXTURE_2D,re,0,0,ce,xe,ve):t.texImage2D(s.TEXTURE_2D,re,Me,ce,xe,ve);x.generateMipmaps=!1}else if(We){if($e){let re=Je(j);t.texStorage2D(s.TEXTURE_2D,me,Me,re.width,re.height)}U&&t.texSubImage2D(s.TEXTURE_2D,0,0,0,ce,xe,j)}else t.texImage2D(s.TEXTURE_2D,0,Me,ce,xe,j);p(x)&&E(q),ge.__version=ue.version,x.onUpdate&&x.onUpdate(x)}R.__version=x.version}function qe(R,x,k){if(x.image.length!==6)return;let q=ie(R,x),te=x.source;t.bindTexture(s.TEXTURE_CUBE_MAP,R.__webglTexture,s.TEXTURE0+k);let ue=n.get(te);if(te.version!==ue.__version||q===!0){t.activeTexture(s.TEXTURE0+k);let ge=et.getPrimaries(et.workingColorSpace),ne=x.colorSpace===Ei?null:et.getPrimaries(x.colorSpace),j=x.colorSpace===Ei||ge===ne?s.NONE:s.BROWSER_DEFAULT_WEBGL;t.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,x.flipY),t.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,x.premultiplyAlpha),t.pixelStorei(s.UNPACK_ALIGNMENT,x.unpackAlignment),t.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,j);let ce=x.isCompressedTexture||x.image[0].isCompressedTexture,xe=x.image[0]&&x.image[0].isDataTexture,Me=[];for(let ae=0;ae<6;ae++)!ce&&!xe?Me[ae]=g(x.image[ae],!0,i.maxCubemapSize):Me[ae]=xe?x.image[ae].image:x.image[ae],Me[ae]=Ot(x,Me[ae]);let ve=Me[0],Ge=r.convert(x.format,x.colorSpace),We=r.convert(x.type),$e=_(x.internalFormat,Ge,We,x.normalized,x.colorSpace),U=x.isVideoTexture!==!0,me=ue.__version===void 0||q===!0,re=te.dataReady,_e=b(x,ve);rt(s.TEXTURE_CUBE_MAP,x);let be;if(ce){U&&me&&t.texStorage2D(s.TEXTURE_CUBE_MAP,_e,$e,ve.width,ve.height);for(let ae=0;ae<6;ae++){be=Me[ae].mipmaps;for(let Ne=0;Ne<be.length;Ne++){let Ie=be[Ne];x.format!==Pn?Ge!==null?U?re&&t.compressedTexSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ae,Ne,0,0,Ie.width,Ie.height,Ge,Ie.data):t.compressedTexImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ae,Ne,$e,Ie.width,Ie.height,0,Ie.data):ke("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):U?re&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ae,Ne,0,0,Ie.width,Ie.height,Ge,We,Ie.data):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ae,Ne,$e,Ie.width,Ie.height,0,Ge,We,Ie.data)}}}else{if(be=x.mipmaps,U&&me){be.length>0&&_e++;let ae=Je(Me[0]);t.texStorage2D(s.TEXTURE_CUBE_MAP,_e,$e,ae.width,ae.height)}for(let ae=0;ae<6;ae++)if(xe){U?re&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ae,0,0,0,Me[ae].width,Me[ae].height,Ge,We,Me[ae].data):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ae,0,$e,Me[ae].width,Me[ae].height,0,Ge,We,Me[ae].data);for(let Ne=0;Ne<be.length;Ne++){let Lt=be[Ne].image[ae].image;U?re&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ae,Ne+1,0,0,Lt.width,Lt.height,Ge,We,Lt.data):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ae,Ne+1,$e,Lt.width,Lt.height,0,Ge,We,Lt.data)}}else{U?re&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ae,0,0,0,Ge,We,Me[ae]):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ae,0,$e,Ge,We,Me[ae]);for(let Ne=0;Ne<be.length;Ne++){let Ie=be[Ne];U?re&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ae,Ne+1,0,0,Ge,We,Ie.image[ae]):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ae,Ne+1,$e,Ge,We,Ie.image[ae])}}}p(x)&&E(s.TEXTURE_CUBE_MAP),ue.__version=te.version,x.onUpdate&&x.onUpdate(x)}R.__version=x.version}function Le(R,x,k,q,te,ue){let ge=r.convert(k.format,k.colorSpace),ne=r.convert(k.type),j=_(k.internalFormat,ge,ne,k.normalized,k.colorSpace),ce=n.get(x),xe=n.get(k);if(xe.__renderTarget=x,!ce.__hasExternalTextures){let Me=Math.max(1,x.width>>ue),ve=Math.max(1,x.height>>ue);te===s.TEXTURE_3D||te===s.TEXTURE_2D_ARRAY?t.texImage3D(te,ue,j,Me,ve,x.depth,0,ge,ne,null):t.texImage2D(te,ue,j,Me,ve,0,ge,ne,null)}t.bindFramebuffer(s.FRAMEBUFFER,R),Nt(x)?o.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,q,te,xe.__webglTexture,0,Pt(x)):(te===s.TEXTURE_2D||te>=s.TEXTURE_CUBE_MAP_POSITIVE_X&&te<=s.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&s.framebufferTexture2D(s.FRAMEBUFFER,q,te,xe.__webglTexture,ue),t.bindFramebuffer(s.FRAMEBUFFER,null)}function mt(R,x,k){if(s.bindRenderbuffer(s.RENDERBUFFER,R),x.depthBuffer){let q=x.depthTexture,te=q&&q.isDepthTexture?q.type:null,ue=C(x.stencilBuffer,te),ge=x.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT;Nt(x)?o.renderbufferStorageMultisampleEXT(s.RENDERBUFFER,Pt(x),ue,x.width,x.height):k?s.renderbufferStorageMultisample(s.RENDERBUFFER,Pt(x),ue,x.width,x.height):s.renderbufferStorage(s.RENDERBUFFER,ue,x.width,x.height),s.framebufferRenderbuffer(s.FRAMEBUFFER,ge,s.RENDERBUFFER,R)}else{let q=x.textures;for(let te=0;te<q.length;te++){let ue=q[te],ge=r.convert(ue.format,ue.colorSpace),ne=r.convert(ue.type),j=_(ue.internalFormat,ge,ne,ue.normalized,ue.colorSpace);Nt(x)?o.renderbufferStorageMultisampleEXT(s.RENDERBUFFER,Pt(x),j,x.width,x.height):k?s.renderbufferStorageMultisample(s.RENDERBUFFER,Pt(x),j,x.width,x.height):s.renderbufferStorage(s.RENDERBUFFER,j,x.width,x.height)}}s.bindRenderbuffer(s.RENDERBUFFER,null)}function Ze(R,x,k){let q=x.isWebGLCubeRenderTarget===!0;if(t.bindFramebuffer(s.FRAMEBUFFER,R),!(x.depthTexture&&x.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");let te=n.get(x.depthTexture);if(te.__renderTarget=x,(!te.__webglTexture||x.depthTexture.image.width!==x.width||x.depthTexture.image.height!==x.height)&&(x.depthTexture.image.width=x.width,x.depthTexture.image.height=x.height,x.depthTexture.needsUpdate=!0),q){if(te.__webglInit===void 0&&(te.__webglInit=!0,x.depthTexture.addEventListener("dispose",I)),te.__webglTexture===void 0){te.__webglTexture=s.createTexture(),t.bindTexture(s.TEXTURE_CUBE_MAP,te.__webglTexture),rt(s.TEXTURE_CUBE_MAP,x.depthTexture);let ce=r.convert(x.depthTexture.format),xe=r.convert(x.depthTexture.type),Me;x.depthTexture.format===si?Me=s.DEPTH_COMPONENT24:x.depthTexture.format===Ji&&(Me=s.DEPTH24_STENCIL8);for(let ve=0;ve<6;ve++)s.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ve,0,Me,x.width,x.height,0,ce,xe,null)}}else se(x.depthTexture,0);let ue=te.__webglTexture,ge=Pt(x),ne=q?s.TEXTURE_CUBE_MAP_POSITIVE_X+k:s.TEXTURE_2D,j=x.depthTexture.format===Ji?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT;if(x.depthTexture.format===si)Nt(x)?o.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,j,ne,ue,0,ge):s.framebufferTexture2D(s.FRAMEBUFFER,j,ne,ue,0);else if(x.depthTexture.format===Ji)Nt(x)?o.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,j,ne,ue,0,ge):s.framebufferTexture2D(s.FRAMEBUFFER,j,ne,ue,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function at(R){let x=n.get(R),k=R.isWebGLCubeRenderTarget===!0;if(x.__boundDepthTexture!==R.depthTexture){let q=R.depthTexture;if(x.__depthDisposeCallback&&x.__depthDisposeCallback(),q){let te=()=>{delete x.__boundDepthTexture,delete x.__depthDisposeCallback,q.removeEventListener("dispose",te)};q.addEventListener("dispose",te),x.__depthDisposeCallback=te}x.__boundDepthTexture=q}if(R.depthTexture&&!x.__autoAllocateDepthBuffer)if(k)for(let q=0;q<6;q++)Ze(x.__webglFramebuffer[q],R,q);else{let q=R.texture.mipmaps;q&&q.length>0?Ze(x.__webglFramebuffer[0],R,0):Ze(x.__webglFramebuffer,R,0)}else if(k){x.__webglDepthbuffer=[];for(let q=0;q<6;q++)if(t.bindFramebuffer(s.FRAMEBUFFER,x.__webglFramebuffer[q]),x.__webglDepthbuffer[q]===void 0)x.__webglDepthbuffer[q]=s.createRenderbuffer(),mt(x.__webglDepthbuffer[q],R,!1);else{let te=R.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,ue=x.__webglDepthbuffer[q];s.bindRenderbuffer(s.RENDERBUFFER,ue),s.framebufferRenderbuffer(s.FRAMEBUFFER,te,s.RENDERBUFFER,ue)}}else{let q=R.texture.mipmaps;if(q&&q.length>0?t.bindFramebuffer(s.FRAMEBUFFER,x.__webglFramebuffer[0]):t.bindFramebuffer(s.FRAMEBUFFER,x.__webglFramebuffer),x.__webglDepthbuffer===void 0)x.__webglDepthbuffer=s.createRenderbuffer(),mt(x.__webglDepthbuffer,R,!1);else{let te=R.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,ue=x.__webglDepthbuffer;s.bindRenderbuffer(s.RENDERBUFFER,ue),s.framebufferRenderbuffer(s.FRAMEBUFFER,te,s.RENDERBUFFER,ue)}}t.bindFramebuffer(s.FRAMEBUFFER,null)}function ot(R,x,k){let q=n.get(R);x!==void 0&&Le(q.__webglFramebuffer,R,R.texture,s.COLOR_ATTACHMENT0,s.TEXTURE_2D,0),k!==void 0&&at(R)}function nt(R){let x=R.texture,k=n.get(R),q=n.get(x);R.addEventListener("dispose",v);let te=R.textures,ue=R.isWebGLCubeRenderTarget===!0,ge=te.length>1;if(ge||(q.__webglTexture===void 0&&(q.__webglTexture=s.createTexture()),q.__version=x.version,a.memory.textures++),ue){k.__webglFramebuffer=[];for(let ne=0;ne<6;ne++)if(x.mipmaps&&x.mipmaps.length>0){k.__webglFramebuffer[ne]=[];for(let j=0;j<x.mipmaps.length;j++)k.__webglFramebuffer[ne][j]=s.createFramebuffer()}else k.__webglFramebuffer[ne]=s.createFramebuffer()}else{if(x.mipmaps&&x.mipmaps.length>0){k.__webglFramebuffer=[];for(let ne=0;ne<x.mipmaps.length;ne++)k.__webglFramebuffer[ne]=s.createFramebuffer()}else k.__webglFramebuffer=s.createFramebuffer();if(ge)for(let ne=0,j=te.length;ne<j;ne++){let ce=n.get(te[ne]);ce.__webglTexture===void 0&&(ce.__webglTexture=s.createTexture(),a.memory.textures++)}if(R.samples>0&&Nt(R)===!1){k.__webglMultisampledFramebuffer=s.createFramebuffer(),k.__webglColorRenderbuffer=[],t.bindFramebuffer(s.FRAMEBUFFER,k.__webglMultisampledFramebuffer);for(let ne=0;ne<te.length;ne++){let j=te[ne];k.__webglColorRenderbuffer[ne]=s.createRenderbuffer(),s.bindRenderbuffer(s.RENDERBUFFER,k.__webglColorRenderbuffer[ne]);let ce=r.convert(j.format,j.colorSpace),xe=r.convert(j.type),Me=_(j.internalFormat,ce,xe,j.normalized,j.colorSpace,R.isXRRenderTarget===!0),ve=Pt(R);s.renderbufferStorageMultisample(s.RENDERBUFFER,ve,Me,R.width,R.height),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+ne,s.RENDERBUFFER,k.__webglColorRenderbuffer[ne])}s.bindRenderbuffer(s.RENDERBUFFER,null),R.depthBuffer&&(k.__webglDepthRenderbuffer=s.createRenderbuffer(),mt(k.__webglDepthRenderbuffer,R,!0)),t.bindFramebuffer(s.FRAMEBUFFER,null)}}if(ue){t.bindTexture(s.TEXTURE_CUBE_MAP,q.__webglTexture),rt(s.TEXTURE_CUBE_MAP,x);for(let ne=0;ne<6;ne++)if(x.mipmaps&&x.mipmaps.length>0)for(let j=0;j<x.mipmaps.length;j++)Le(k.__webglFramebuffer[ne][j],R,x,s.COLOR_ATTACHMENT0,s.TEXTURE_CUBE_MAP_POSITIVE_X+ne,j);else Le(k.__webglFramebuffer[ne],R,x,s.COLOR_ATTACHMENT0,s.TEXTURE_CUBE_MAP_POSITIVE_X+ne,0);p(x)&&E(s.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(ge){for(let ne=0,j=te.length;ne<j;ne++){let ce=te[ne],xe=n.get(ce),Me=s.TEXTURE_2D;(R.isWebGL3DRenderTarget||R.isWebGLArrayRenderTarget)&&(Me=R.isWebGL3DRenderTarget?s.TEXTURE_3D:s.TEXTURE_2D_ARRAY),t.bindTexture(Me,xe.__webglTexture),rt(Me,ce),Le(k.__webglFramebuffer,R,ce,s.COLOR_ATTACHMENT0+ne,Me,0),p(ce)&&E(Me)}t.unbindTexture()}else{let ne=s.TEXTURE_2D;if((R.isWebGL3DRenderTarget||R.isWebGLArrayRenderTarget)&&(ne=R.isWebGL3DRenderTarget?s.TEXTURE_3D:s.TEXTURE_2D_ARRAY),t.bindTexture(ne,q.__webglTexture),rt(ne,x),x.mipmaps&&x.mipmaps.length>0)for(let j=0;j<x.mipmaps.length;j++)Le(k.__webglFramebuffer[j],R,x,s.COLOR_ATTACHMENT0,ne,j);else Le(k.__webglFramebuffer,R,x,s.COLOR_ATTACHMENT0,ne,0);p(x)&&E(ne),t.unbindTexture()}R.depthBuffer&&at(R)}function Mt(R){let x=R.textures;for(let k=0,q=x.length;k<q;k++){let te=x[k];if(p(te)){let ue=S(R),ge=n.get(te).__webglTexture;t.bindTexture(ue,ge),E(ue),t.unbindTexture()}}}let St=[],xt=[];function wt(R){if(R.samples>0){if(Nt(R)===!1){let x=R.textures,k=R.width,q=R.height,te=s.COLOR_BUFFER_BIT,ue=R.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,ge=n.get(R),ne=x.length>1;if(ne)for(let ce=0;ce<x.length;ce++)t.bindFramebuffer(s.FRAMEBUFFER,ge.__webglMultisampledFramebuffer),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+ce,s.RENDERBUFFER,null),t.bindFramebuffer(s.FRAMEBUFFER,ge.__webglFramebuffer),s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0+ce,s.TEXTURE_2D,null,0);t.bindFramebuffer(s.READ_FRAMEBUFFER,ge.__webglMultisampledFramebuffer);let j=R.texture.mipmaps;j&&j.length>0?t.bindFramebuffer(s.DRAW_FRAMEBUFFER,ge.__webglFramebuffer[0]):t.bindFramebuffer(s.DRAW_FRAMEBUFFER,ge.__webglFramebuffer);for(let ce=0;ce<x.length;ce++){if(R.resolveDepthBuffer&&(R.depthBuffer&&(te|=s.DEPTH_BUFFER_BIT),R.stencilBuffer&&R.resolveStencilBuffer&&(te|=s.STENCIL_BUFFER_BIT)),ne){s.framebufferRenderbuffer(s.READ_FRAMEBUFFER,s.COLOR_ATTACHMENT0,s.RENDERBUFFER,ge.__webglColorRenderbuffer[ce]);let xe=n.get(x[ce]).__webglTexture;s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0,s.TEXTURE_2D,xe,0)}s.blitFramebuffer(0,0,k,q,0,0,k,q,te,s.NEAREST),l===!0&&(St.length=0,xt.length=0,St.push(s.COLOR_ATTACHMENT0+ce),R.depthBuffer&&R.resolveDepthBuffer===!1&&(St.push(ue),xt.push(ue),s.invalidateFramebuffer(s.DRAW_FRAMEBUFFER,xt)),s.invalidateFramebuffer(s.READ_FRAMEBUFFER,St))}if(t.bindFramebuffer(s.READ_FRAMEBUFFER,null),t.bindFramebuffer(s.DRAW_FRAMEBUFFER,null),ne)for(let ce=0;ce<x.length;ce++){t.bindFramebuffer(s.FRAMEBUFFER,ge.__webglMultisampledFramebuffer),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+ce,s.RENDERBUFFER,ge.__webglColorRenderbuffer[ce]);let xe=n.get(x[ce]).__webglTexture;t.bindFramebuffer(s.FRAMEBUFFER,ge.__webglFramebuffer),s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0+ce,s.TEXTURE_2D,xe,0)}t.bindFramebuffer(s.DRAW_FRAMEBUFFER,ge.__webglMultisampledFramebuffer)}else if(R.depthBuffer&&R.resolveDepthBuffer===!1&&l){let x=R.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT;s.invalidateFramebuffer(s.DRAW_FRAMEBUFFER,[x])}}}function Pt(R){return Math.min(i.maxSamples,R.samples)}function Nt(R){let x=n.get(R);return R.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&x.__useRenderToTexture!==!1}function B(R){let x=a.render.frame;u.get(R)!==x&&(u.set(R,x),R.update())}function Ot(R,x){let k=R.colorSpace,q=R.format,te=R.type;return R.isCompressedTexture===!0||R.isVideoTexture===!0||k!==Rr&&k!==Ei&&(et.getTransfer(k)===Et?(q!==Pn||te!==yn)&&ke("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):Ye("WebGLTextures: Unsupported texture color space:",k)),x}function Je(R){return typeof HTMLImageElement<"u"&&R instanceof HTMLImageElement?(c.width=R.naturalWidth||R.width,c.height=R.naturalHeight||R.height):typeof VideoFrame<"u"&&R instanceof VideoFrame?(c.width=R.displayWidth,c.height=R.displayHeight):(c.width=R.width,c.height=R.height),c}this.allocateTextureUnit=Q,this.resetTextureUnits=K,this.getTextureUnits=J,this.setTextureUnits=z,this.setTexture2D=se,this.setTexture2DArray=oe,this.setTexture3D=he,this.setTextureCube=fe,this.rebindTextures=ot,this.setupRenderTarget=nt,this.updateRenderTargetMipmap=Mt,this.updateMultisampleRenderTarget=wt,this.setupDepthRenderbuffer=at,this.setupFrameBufferTexture=Le,this.useMultisampledRTT=Nt,this.isReversedDepthBuffer=function(){return t.buffers.depth.getReversed()}}function ov(s,e){function t(n,i=Ei){let r,a=et.getTransfer(i);if(n===yn)return s.UNSIGNED_BYTE;if(n===Uo)return s.UNSIGNED_SHORT_4_4_4_4;if(n===Oo)return s.UNSIGNED_SHORT_5_5_5_1;if(n===Pc)return s.UNSIGNED_INT_5_9_9_9_REV;if(n===Lc)return s.UNSIGNED_INT_10F_11F_11F_REV;if(n===Rc)return s.BYTE;if(n===Ic)return s.SHORT;if(n===or)return s.UNSIGNED_SHORT;if(n===Fo)return s.INT;if(n===Zn)return s.UNSIGNED_INT;if(n===Un)return s.FLOAT;if(n===li)return s.HALF_FLOAT;if(n===Dc)return s.ALPHA;if(n===Nc)return s.RGB;if(n===Pn)return s.RGBA;if(n===si)return s.DEPTH_COMPONENT;if(n===Ji)return s.DEPTH_STENCIL;if(n===Fc)return s.RED;if(n===Bo)return s.RED_INTEGER;if(n===Qi)return s.RG;if(n===zo)return s.RG_INTEGER;if(n===ko)return s.RGBA_INTEGER;if(n===fa||n===da||n===pa||n===ma)if(a===Et)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===fa)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===da)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===pa)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===ma)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===fa)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===da)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===pa)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===ma)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===Ho||n===Vo||n===Go||n===Wo)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===Ho)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===Vo)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===Go)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===Wo)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===Xo||n===qo||n===Yo||n===Zo||n===$o||n===ga||n===Ko)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(n===Xo||n===qo)return a===Et?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===Yo)return a===Et?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC;if(n===Zo)return r.COMPRESSED_R11_EAC;if(n===$o)return r.COMPRESSED_SIGNED_R11_EAC;if(n===ga)return r.COMPRESSED_RG11_EAC;if(n===Ko)return r.COMPRESSED_SIGNED_RG11_EAC}else return null;if(n===Jo||n===Qo||n===jo||n===el||n===tl||n===nl||n===il||n===sl||n===rl||n===al||n===ol||n===ll||n===cl||n===hl)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(n===Jo)return a===Et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===Qo)return a===Et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===jo)return a===Et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===el)return a===Et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===tl)return a===Et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===nl)return a===Et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===il)return a===Et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===sl)return a===Et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===rl)return a===Et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===al)return a===Et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===ol)return a===Et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===ll)return a===Et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===cl)return a===Et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===hl)return a===Et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===ul||n===fl||n===dl)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(n===ul)return a===Et?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===fl)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===dl)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===pl||n===ml||n===xa||n===gl)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(n===pl)return r.COMPRESSED_RED_RGTC1_EXT;if(n===ml)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===xa)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===gl)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===lr?s.UNSIGNED_INT_24_8:s[n]!==void 0?s[n]:null}return{convert:t}}var lv=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,cv=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,oh=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let n=new Hr(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,n=new In({vertexShader:lv,fragmentShader:cv,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new pt(new ai(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},lh=class extends Wn{constructor(e,t){super();let n=this,i=null,r=1,a=null,o="local-floor",l=1,c=null,u=null,h=null,f=null,d=null,m=null,y=typeof XRWebGLBinding<"u",g=new oh,p={},E=t.getContextAttributes(),S=null,_=null,C=[],b=[],I=new Ke,v=null,T=new Yt;T.viewport=new dt;let P=new Yt;P.viewport=new dt;let L=[T,P],F=new Co,K=null,J=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(ie){let de=C[ie];return de===void 0&&(de=new Ks,C[ie]=de),de.getTargetRaySpace()},this.getControllerGrip=function(ie){let de=C[ie];return de===void 0&&(de=new Ks,C[ie]=de),de.getGripSpace()},this.getHand=function(ie){let de=C[ie];return de===void 0&&(de=new Ks,C[ie]=de),de.getHandSpace()};function z(ie){let de=b.indexOf(ie.inputSource);if(de===-1)return;let le=C[de];le!==void 0&&(le.update(ie.inputSource,ie.frame,c||a),le.dispatchEvent({type:ie.type,data:ie.inputSource}))}function Q(){i.removeEventListener("select",z),i.removeEventListener("selectstart",z),i.removeEventListener("selectend",z),i.removeEventListener("squeeze",z),i.removeEventListener("squeezestart",z),i.removeEventListener("squeezeend",z),i.removeEventListener("end",Q),i.removeEventListener("inputsourceschange",$);for(let ie=0;ie<C.length;ie++){let de=b[ie];de!==null&&(b[ie]=null,C[ie].disconnect(de))}K=null,J=null,g.reset();for(let ie in p)delete p[ie];e.setRenderTarget(S),d=null,f=null,h=null,i=null,_=null,rt.stop(),n.isPresenting=!1,e.setPixelRatio(v),e.setSize(I.width,I.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(ie){r=ie,n.isPresenting===!0&&ke("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(ie){o=ie,n.isPresenting===!0&&ke("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(ie){c=ie},this.getBaseLayer=function(){return f!==null?f:d},this.getBinding=function(){return h===null&&y&&(h=new XRWebGLBinding(i,t)),h},this.getFrame=function(){return m},this.getSession=function(){return i},this.setSession=async function(ie){if(i=ie,i!==null){if(S=e.getRenderTarget(),i.addEventListener("select",z),i.addEventListener("selectstart",z),i.addEventListener("selectend",z),i.addEventListener("squeeze",z),i.addEventListener("squeezestart",z),i.addEventListener("squeezeend",z),i.addEventListener("end",Q),i.addEventListener("inputsourceschange",$),E.xrCompatible!==!0&&await t.makeXRCompatible(),v=e.getPixelRatio(),e.getSize(I),y&&"createProjectionLayer"in XRWebGLBinding.prototype){let le=null,Pe=null,qe=null;E.depth&&(qe=E.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,le=E.stencil?Ji:si,Pe=E.stencil?lr:Zn);let Le={colorFormat:t.RGBA8,depthFormat:qe,scaleFactor:r};h=this.getBinding(),f=h.createProjectionLayer(Le),i.updateRenderState({layers:[f]}),e.setPixelRatio(1),e.setSize(f.textureWidth,f.textureHeight,!1),_=new Cn(f.textureWidth,f.textureHeight,{format:Pn,type:yn,depthTexture:new yi(f.textureWidth,f.textureHeight,Pe,void 0,void 0,void 0,void 0,void 0,void 0,le),stencilBuffer:E.stencil,colorSpace:e.outputColorSpace,samples:E.antialias?4:0,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1})}else{let le={antialias:E.antialias,alpha:!0,depth:E.depth,stencil:E.stencil,framebufferScaleFactor:r};d=new XRWebGLLayer(i,t,le),i.updateRenderState({baseLayer:d}),e.setPixelRatio(1),e.setSize(d.framebufferWidth,d.framebufferHeight,!1),_=new Cn(d.framebufferWidth,d.framebufferHeight,{format:Pn,type:yn,colorSpace:e.outputColorSpace,stencilBuffer:E.stencil,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1})}_.isXRRenderTarget=!0,this.setFoveation(l),c=null,a=await i.requestReferenceSpace(o),rt.setContext(i),rt.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(i!==null)return i.environmentBlendMode},this.getDepthTexture=function(){return g.getDepthTexture()};function $(ie){for(let de=0;de<ie.removed.length;de++){let le=ie.removed[de],Pe=b.indexOf(le);Pe>=0&&(b[Pe]=null,C[Pe].disconnect(le))}for(let de=0;de<ie.added.length;de++){let le=ie.added[de],Pe=b.indexOf(le);if(Pe===-1){for(let Le=0;Le<C.length;Le++)if(Le>=b.length){b.push(le),Pe=Le;break}else if(b[Le]===null){b[Le]=le,Pe=Le;break}if(Pe===-1)break}let qe=C[Pe];qe&&qe.connect(le)}}let se=new N,oe=new N;function he(ie,de,le){se.setFromMatrixPosition(de.matrixWorld),oe.setFromMatrixPosition(le.matrixWorld);let Pe=se.distanceTo(oe),qe=de.projectionMatrix.elements,Le=le.projectionMatrix.elements,mt=qe[14]/(qe[10]-1),Ze=qe[14]/(qe[10]+1),at=(qe[9]+1)/qe[5],ot=(qe[9]-1)/qe[5],nt=(qe[8]-1)/qe[0],Mt=(Le[8]+1)/Le[0],St=mt*nt,xt=mt*Mt,wt=Pe/(-nt+Mt),Pt=wt*-nt;if(de.matrixWorld.decompose(ie.position,ie.quaternion,ie.scale),ie.translateX(Pt),ie.translateZ(wt),ie.matrixWorld.compose(ie.position,ie.quaternion,ie.scale),ie.matrixWorldInverse.copy(ie.matrixWorld).invert(),qe[10]===-1)ie.projectionMatrix.copy(de.projectionMatrix),ie.projectionMatrixInverse.copy(de.projectionMatrixInverse);else{let Nt=mt+wt,B=Ze+wt,Ot=St-Pt,Je=xt+(Pe-Pt),R=at*Ze/B*Nt,x=ot*Ze/B*Nt;ie.projectionMatrix.makePerspective(Ot,Je,R,x,Nt,B),ie.projectionMatrixInverse.copy(ie.projectionMatrix).invert()}}function fe(ie,de){de===null?ie.matrixWorld.copy(ie.matrix):ie.matrixWorld.multiplyMatrices(de.matrixWorld,ie.matrix),ie.matrixWorldInverse.copy(ie.matrixWorld).invert()}this.updateCamera=function(ie){if(i===null)return;let de=ie.near,le=ie.far;g.texture!==null&&(g.depthNear>0&&(de=g.depthNear),g.depthFar>0&&(le=g.depthFar)),F.near=P.near=T.near=de,F.far=P.far=T.far=le,(K!==F.near||J!==F.far)&&(i.updateRenderState({depthNear:F.near,depthFar:F.far}),K=F.near,J=F.far),F.layers.mask=ie.layers.mask|6,T.layers.mask=F.layers.mask&-5,P.layers.mask=F.layers.mask&-3;let Pe=ie.parent,qe=F.cameras;fe(F,Pe);for(let Le=0;Le<qe.length;Le++)fe(qe[Le],Pe);qe.length===2?he(F,T,P):F.projectionMatrix.copy(T.projectionMatrix),Ae(ie,F,Pe)};function Ae(ie,de,le){le===null?ie.matrix.copy(de.matrixWorld):(ie.matrix.copy(le.matrixWorld),ie.matrix.invert(),ie.matrix.multiply(de.matrixWorld)),ie.matrix.decompose(ie.position,ie.quaternion,ie.scale),ie.updateMatrixWorld(!0),ie.projectionMatrix.copy(de.projectionMatrix),ie.projectionMatrixInverse.copy(de.projectionMatrixInverse),ie.isPerspectiveCamera&&(ie.fov=gs*2*Math.atan(1/ie.projectionMatrix.elements[5]),ie.zoom=1)}this.getCamera=function(){return F},this.getFoveation=function(){if(!(f===null&&d===null))return l},this.setFoveation=function(ie){l=ie,f!==null&&(f.fixedFoveation=ie),d!==null&&d.fixedFoveation!==void 0&&(d.fixedFoveation=ie)},this.hasDepthSensing=function(){return g.texture!==null},this.getDepthSensingMesh=function(){return g.getMesh(F)},this.getCameraTexture=function(ie){return p[ie]};let st=null;function yt(ie,de){if(u=de.getViewerPose(c||a),m=de,u!==null){let le=u.views;d!==null&&(e.setRenderTargetFramebuffer(_,d.framebuffer),e.setRenderTarget(_));let Pe=!1;le.length!==F.cameras.length&&(F.cameras.length=0,Pe=!0);for(let Ze=0;Ze<le.length;Ze++){let at=le[Ze],ot=null;if(d!==null)ot=d.getViewport(at);else{let Mt=h.getViewSubImage(f,at);ot=Mt.viewport,Ze===0&&(e.setRenderTargetTextures(_,Mt.colorTexture,Mt.depthStencilTexture),e.setRenderTarget(_))}let nt=L[Ze];nt===void 0&&(nt=new Yt,nt.layers.enable(Ze),nt.viewport=new dt,L[Ze]=nt),nt.matrix.fromArray(at.transform.matrix),nt.matrix.decompose(nt.position,nt.quaternion,nt.scale),nt.projectionMatrix.fromArray(at.projectionMatrix),nt.projectionMatrixInverse.copy(nt.projectionMatrix).invert(),nt.viewport.set(ot.x,ot.y,ot.width,ot.height),Ze===0&&(F.matrix.copy(nt.matrix),F.matrix.decompose(F.position,F.quaternion,F.scale)),Pe===!0&&F.cameras.push(nt)}let qe=i.enabledFeatures;if(qe&&qe.includes("depth-sensing")&&i.depthUsage=="gpu-optimized"&&y){h=n.getBinding();let Ze=h.getDepthInformation(le[0]);Ze&&Ze.isValid&&Ze.texture&&g.init(Ze,i.renderState)}if(qe&&qe.includes("camera-access")&&y){e.state.unbindTexture(),h=n.getBinding();for(let Ze=0;Ze<le.length;Ze++){let at=le[Ze].camera;if(at){let ot=p[at];ot||(ot=new Hr,p[at]=ot);let nt=h.getCameraImage(at);ot.sourceTexture=nt}}}}for(let le=0;le<C.length;le++){let Pe=b[le],qe=C[le];Pe!==null&&qe!==void 0&&qe.update(Pe,de,c||a)}st&&st(ie,de),de.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:de}),m=null}let rt=new xf;rt.setAnimationLoop(yt),this.setAnimationLoop=function(ie){st=ie},this.dispose=function(){}}},hv=new He,bf=new Qe;bf.set(-1,0,0,0,1,0,0,0,1);function uv(s,e){function t(g,p){g.matrixAutoUpdate===!0&&g.updateMatrix(),p.value.copy(g.matrix)}function n(g,p){p.color.getRGB(g.fogColor.value,zc(s)),p.isFog?(g.fogNear.value=p.near,g.fogFar.value=p.far):p.isFogExp2&&(g.fogDensity.value=p.density)}function i(g,p,E,S,_){p.isNodeMaterial?p.uniformsNeedUpdate=!1:p.isMeshBasicMaterial?r(g,p):p.isMeshLambertMaterial?(r(g,p),p.envMap&&(g.envMapIntensity.value=p.envMapIntensity)):p.isMeshToonMaterial?(r(g,p),h(g,p)):p.isMeshPhongMaterial?(r(g,p),u(g,p),p.envMap&&(g.envMapIntensity.value=p.envMapIntensity)):p.isMeshStandardMaterial?(r(g,p),f(g,p),p.isMeshPhysicalMaterial&&d(g,p,_)):p.isMeshMatcapMaterial?(r(g,p),m(g,p)):p.isMeshDepthMaterial?r(g,p):p.isMeshDistanceMaterial?(r(g,p),y(g,p)):p.isMeshNormalMaterial?r(g,p):p.isLineBasicMaterial?(a(g,p),p.isLineDashedMaterial&&o(g,p)):p.isPointsMaterial?l(g,p,E,S):p.isSpriteMaterial?c(g,p):p.isShadowMaterial?(g.color.value.copy(p.color),g.opacity.value=p.opacity):p.isShaderMaterial&&(p.uniformsNeedUpdate=!1)}function r(g,p){g.opacity.value=p.opacity,p.color&&g.diffuse.value.copy(p.color),p.emissive&&g.emissive.value.copy(p.emissive).multiplyScalar(p.emissiveIntensity),p.map&&(g.map.value=p.map,t(p.map,g.mapTransform)),p.alphaMap&&(g.alphaMap.value=p.alphaMap,t(p.alphaMap,g.alphaMapTransform)),p.bumpMap&&(g.bumpMap.value=p.bumpMap,t(p.bumpMap,g.bumpMapTransform),g.bumpScale.value=p.bumpScale,p.side===vn&&(g.bumpScale.value*=-1)),p.normalMap&&(g.normalMap.value=p.normalMap,t(p.normalMap,g.normalMapTransform),g.normalScale.value.copy(p.normalScale),p.side===vn&&g.normalScale.value.negate()),p.displacementMap&&(g.displacementMap.value=p.displacementMap,t(p.displacementMap,g.displacementMapTransform),g.displacementScale.value=p.displacementScale,g.displacementBias.value=p.displacementBias),p.emissiveMap&&(g.emissiveMap.value=p.emissiveMap,t(p.emissiveMap,g.emissiveMapTransform)),p.specularMap&&(g.specularMap.value=p.specularMap,t(p.specularMap,g.specularMapTransform)),p.alphaTest>0&&(g.alphaTest.value=p.alphaTest);let E=e.get(p),S=E.envMap,_=E.envMapRotation;S&&(g.envMap.value=S,g.envMapRotation.value.setFromMatrix4(hv.makeRotationFromEuler(_)).transpose(),S.isCubeTexture&&S.isRenderTargetTexture===!1&&g.envMapRotation.value.premultiply(bf),g.reflectivity.value=p.reflectivity,g.ior.value=p.ior,g.refractionRatio.value=p.refractionRatio),p.lightMap&&(g.lightMap.value=p.lightMap,g.lightMapIntensity.value=p.lightMapIntensity,t(p.lightMap,g.lightMapTransform)),p.aoMap&&(g.aoMap.value=p.aoMap,g.aoMapIntensity.value=p.aoMapIntensity,t(p.aoMap,g.aoMapTransform))}function a(g,p){g.diffuse.value.copy(p.color),g.opacity.value=p.opacity,p.map&&(g.map.value=p.map,t(p.map,g.mapTransform))}function o(g,p){g.dashSize.value=p.dashSize,g.totalSize.value=p.dashSize+p.gapSize,g.scale.value=p.scale}function l(g,p,E,S){g.diffuse.value.copy(p.color),g.opacity.value=p.opacity,g.size.value=p.size*E,g.scale.value=S*.5,p.map&&(g.map.value=p.map,t(p.map,g.uvTransform)),p.alphaMap&&(g.alphaMap.value=p.alphaMap,t(p.alphaMap,g.alphaMapTransform)),p.alphaTest>0&&(g.alphaTest.value=p.alphaTest)}function c(g,p){g.diffuse.value.copy(p.color),g.opacity.value=p.opacity,g.rotation.value=p.rotation,p.map&&(g.map.value=p.map,t(p.map,g.mapTransform)),p.alphaMap&&(g.alphaMap.value=p.alphaMap,t(p.alphaMap,g.alphaMapTransform)),p.alphaTest>0&&(g.alphaTest.value=p.alphaTest)}function u(g,p){g.specular.value.copy(p.specular),g.shininess.value=Math.max(p.shininess,1e-4)}function h(g,p){p.gradientMap&&(g.gradientMap.value=p.gradientMap)}function f(g,p){g.metalness.value=p.metalness,p.metalnessMap&&(g.metalnessMap.value=p.metalnessMap,t(p.metalnessMap,g.metalnessMapTransform)),g.roughness.value=p.roughness,p.roughnessMap&&(g.roughnessMap.value=p.roughnessMap,t(p.roughnessMap,g.roughnessMapTransform)),p.envMap&&(g.envMapIntensity.value=p.envMapIntensity)}function d(g,p,E){g.ior.value=p.ior,p.sheen>0&&(g.sheenColor.value.copy(p.sheenColor).multiplyScalar(p.sheen),g.sheenRoughness.value=p.sheenRoughness,p.sheenColorMap&&(g.sheenColorMap.value=p.sheenColorMap,t(p.sheenColorMap,g.sheenColorMapTransform)),p.sheenRoughnessMap&&(g.sheenRoughnessMap.value=p.sheenRoughnessMap,t(p.sheenRoughnessMap,g.sheenRoughnessMapTransform))),p.clearcoat>0&&(g.clearcoat.value=p.clearcoat,g.clearcoatRoughness.value=p.clearcoatRoughness,p.clearcoatMap&&(g.clearcoatMap.value=p.clearcoatMap,t(p.clearcoatMap,g.clearcoatMapTransform)),p.clearcoatRoughnessMap&&(g.clearcoatRoughnessMap.value=p.clearcoatRoughnessMap,t(p.clearcoatRoughnessMap,g.clearcoatRoughnessMapTransform)),p.clearcoatNormalMap&&(g.clearcoatNormalMap.value=p.clearcoatNormalMap,t(p.clearcoatNormalMap,g.clearcoatNormalMapTransform),g.clearcoatNormalScale.value.copy(p.clearcoatNormalScale),p.side===vn&&g.clearcoatNormalScale.value.negate())),p.dispersion>0&&(g.dispersion.value=p.dispersion),p.iridescence>0&&(g.iridescence.value=p.iridescence,g.iridescenceIOR.value=p.iridescenceIOR,g.iridescenceThicknessMinimum.value=p.iridescenceThicknessRange[0],g.iridescenceThicknessMaximum.value=p.iridescenceThicknessRange[1],p.iridescenceMap&&(g.iridescenceMap.value=p.iridescenceMap,t(p.iridescenceMap,g.iridescenceMapTransform)),p.iridescenceThicknessMap&&(g.iridescenceThicknessMap.value=p.iridescenceThicknessMap,t(p.iridescenceThicknessMap,g.iridescenceThicknessMapTransform))),p.transmission>0&&(g.transmission.value=p.transmission,g.transmissionSamplerMap.value=E.texture,g.transmissionSamplerSize.value.set(E.width,E.height),p.transmissionMap&&(g.transmissionMap.value=p.transmissionMap,t(p.transmissionMap,g.transmissionMapTransform)),g.thickness.value=p.thickness,p.thicknessMap&&(g.thicknessMap.value=p.thicknessMap,t(p.thicknessMap,g.thicknessMapTransform)),g.attenuationDistance.value=p.attenuationDistance,g.attenuationColor.value.copy(p.attenuationColor)),p.anisotropy>0&&(g.anisotropyVector.value.set(p.anisotropy*Math.cos(p.anisotropyRotation),p.anisotropy*Math.sin(p.anisotropyRotation)),p.anisotropyMap&&(g.anisotropyMap.value=p.anisotropyMap,t(p.anisotropyMap,g.anisotropyMapTransform))),g.specularIntensity.value=p.specularIntensity,g.specularColor.value.copy(p.specularColor),p.specularColorMap&&(g.specularColorMap.value=p.specularColorMap,t(p.specularColorMap,g.specularColorMapTransform)),p.specularIntensityMap&&(g.specularIntensityMap.value=p.specularIntensityMap,t(p.specularIntensityMap,g.specularIntensityMapTransform))}function m(g,p){p.matcap&&(g.matcap.value=p.matcap)}function y(g,p){let E=e.get(p).light;g.referencePosition.value.setFromMatrixPosition(E.matrixWorld),g.nearDistance.value=E.shadow.camera.near,g.farDistance.value=E.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:i}}function fv(s,e,t,n){let i={},r={},a=[],o=s.getParameter(s.MAX_UNIFORM_BUFFER_BINDINGS);function l(_,C){let b=C.program;n.uniformBlockBinding(_,b)}function c(_,C){let b=i[_.id];b===void 0&&(g(_),b=u(_),i[_.id]=b,_.addEventListener("dispose",E));let I=C.program;n.updateUBOMapping(_,I);let v=e.render.frame;r[_.id]!==v&&(f(_),r[_.id]=v)}function u(_){let C=h();_.__bindingPointIndex=C;let b=s.createBuffer(),I=_.__size,v=_.usage;return s.bindBuffer(s.UNIFORM_BUFFER,b),s.bufferData(s.UNIFORM_BUFFER,I,v),s.bindBuffer(s.UNIFORM_BUFFER,null),s.bindBufferBase(s.UNIFORM_BUFFER,C,b),b}function h(){for(let _=0;_<o;_++)if(a.indexOf(_)===-1)return a.push(_),_;return Ye("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function f(_){let C=i[_.id],b=_.uniforms,I=_.__cache;s.bindBuffer(s.UNIFORM_BUFFER,C);for(let v=0,T=b.length;v<T;v++){let P=b[v];if(Array.isArray(P))for(let L=0,F=P.length;L<F;L++)d(P[L],v,L,I);else d(P,v,0,I)}s.bindBuffer(s.UNIFORM_BUFFER,null)}function d(_,C,b,I){if(y(_,C,b,I)===!0){let v=_.__offset,T=_.value;if(Array.isArray(T)){let P=0;for(let L=0;L<T.length;L++){let F=T[L],K=p(F);m(F,_.__data,P),typeof F!="number"&&typeof F!="boolean"&&!F.isMatrix3&&!ArrayBuffer.isView(F)&&(P+=K.storage/Float32Array.BYTES_PER_ELEMENT)}}else m(T,_.__data,0);s.bufferSubData(s.UNIFORM_BUFFER,v,_.__data)}}function m(_,C,b){typeof _=="number"||typeof _=="boolean"?C[0]=_:_.isMatrix3?(C[0]=_.elements[0],C[1]=_.elements[1],C[2]=_.elements[2],C[3]=0,C[4]=_.elements[3],C[5]=_.elements[4],C[6]=_.elements[5],C[7]=0,C[8]=_.elements[6],C[9]=_.elements[7],C[10]=_.elements[8],C[11]=0):ArrayBuffer.isView(_)?C.set(new _.constructor(_.buffer,_.byteOffset,C.length)):_.toArray(C,b)}function y(_,C,b,I){let v=_.value,T=C+"_"+b;if(I[T]===void 0)return typeof v=="number"||typeof v=="boolean"?I[T]=v:ArrayBuffer.isView(v)?I[T]=v.slice():I[T]=v.clone(),!0;{let P=I[T];if(typeof v=="number"||typeof v=="boolean"){if(P!==v)return I[T]=v,!0}else{if(ArrayBuffer.isView(v))return!0;if(P.equals(v)===!1)return P.copy(v),!0}}return!1}function g(_){let C=_.uniforms,b=0,I=16;for(let T=0,P=C.length;T<P;T++){let L=Array.isArray(C[T])?C[T]:[C[T]];for(let F=0,K=L.length;F<K;F++){let J=L[F],z=Array.isArray(J.value)?J.value:[J.value];for(let Q=0,$=z.length;Q<$;Q++){let se=z[Q],oe=p(se),he=b%I,fe=he%oe.boundary,Ae=he+fe;b+=fe,Ae!==0&&I-Ae<oe.storage&&(b+=I-Ae),J.__data=new Float32Array(oe.storage/Float32Array.BYTES_PER_ELEMENT),J.__offset=b,b+=oe.storage}}}let v=b%I;return v>0&&(b+=I-v),_.__size=b,_.__cache={},this}function p(_){let C={boundary:0,storage:0};return typeof _=="number"||typeof _=="boolean"?(C.boundary=4,C.storage=4):_.isVector2?(C.boundary=8,C.storage=8):_.isVector3||_.isColor?(C.boundary=16,C.storage=12):_.isVector4?(C.boundary=16,C.storage=16):_.isMatrix3?(C.boundary=48,C.storage=48):_.isMatrix4?(C.boundary=64,C.storage=64):_.isTexture?ke("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(_)?(C.boundary=16,C.storage=_.byteLength):ke("WebGLRenderer: Unsupported uniform value type.",_),C}function E(_){let C=_.target;C.removeEventListener("dispose",E);let b=a.indexOf(C.__bindingPointIndex);a.splice(b,1),s.deleteBuffer(i[C.id]),delete i[C.id],delete r[C.id]}function S(){for(let _ in i)s.deleteBuffer(i[_]);a=[],i={},r={}}return{bind:l,update:c,dispose:S}}var dv=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),ci=null;function pv(){return ci===null&&(ci=new Or(dv,16,16,Qi,li),ci.name="DFG_LUT",ci.minFilter=on,ci.magFilter=on,ci.wrapS=wn,ci.wrapT=wn,ci.generateMipmaps=!1,ci.needsUpdate=!0),ci}var El=class{constructor(e={}){let{canvas:t=Ou(),context:n=null,depth:i=!0,stencil:r=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:u="default",failIfMajorPerformanceCaveat:h=!1,reversedDepthBuffer:f=!1,outputBufferType:d=yn}=e;this.isWebGLRenderer=!0;let m;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");m=n.getContextAttributes().alpha}else m=a;let y=d,g=new Set([ko,zo,Bo]),p=new Set([yn,Zn,or,lr,Uo,Oo]),E=new Uint32Array(4),S=new Int32Array(4),_=new N,C=null,b=null,I=[],v=[],T=null;this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=Yn,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let P=this,L=!1,F=null,K=null,J=null,z=null;this._outputColorSpace=bt;let Q=0,$=0,se=null,oe=-1,he=null,fe=new dt,Ae=new dt,st=null,yt=new Ve(0),rt=0,ie=t.width,de=t.height,le=1,Pe=null,qe=null,Le=new dt(0,0,ie,de),mt=new dt(0,0,ie,de),Ze=!1,at=new Qs,ot=!1,nt=!1,Mt=new He,St=new N,xt=new dt,wt={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},Pt=!1;function Nt(){return se===null?le:1}let B=n;function Ot(M,w){return t.getContext(M,w)}try{let M={alpha:!0,depth:i,stencil:r,antialias:o,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:u,failIfMajorPerformanceCaveat:h};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${"185"}`),t.addEventListener("webglcontextlost",Lt,!1),t.addEventListener("webglcontextrestored",gt,!1),t.addEventListener("webglcontextcreationerror",rn,!1),B===null){let w="webgl2";if(B=Ot(w,M),B===null)throw Ot(w)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}}catch(M){throw Ye("WebGLRenderer: "+M.message),M}let Je,R,x,k,q,te,ue,ge,ne,j,ce,xe,Me,ve,Ge,We,$e,U,me,re,_e,be,ae;function Ne(){Je=new M0(B),Je.init(),_e=new ov(B,Je),R=new d0(B,Je,e,_e),x=new rv(B,Je),R.reversedDepthBuffer&&f&&x.buffers.depth.setReversed(!0),K=B.createFramebuffer(),J=B.createFramebuffer(),z=B.createFramebuffer(),k=new E0(B),q=new Xx,te=new av(B,Je,x,q,R,_e,k),ue=new y0(P),ge=new Cp(B),be=new u0(B,ge),ne=new S0(B,ge,k,be),j=new w0(B,ne,ge,be,k),U=new T0(B,R,te),Ge=new p0(q),ce=new Wx(P,ue,Je,R,be,Ge),xe=new uv(P,q),Me=new Yx,ve=new jx(Je),$e=new h0(P,ue,x,j,m,l),We=new sv(P,j,R),ae=new fv(B,k,R,x),me=new f0(B,Je,k),re=new b0(B,Je,k),k.programs=ce.programs,P.capabilities=R,P.extensions=Je,P.properties=q,P.renderLists=Me,P.shadowMap=We,P.state=x,P.info=k}Ne(),y!==yn&&(T=new C0(y,t.width,t.height,o,i,r));let Ie=new lh(P,B);this.xr=Ie,this.getContext=function(){return B},this.getContextAttributes=function(){return B.getContextAttributes()},this.forceContextLoss=function(){let M=Je.get("WEBGL_lose_context");M&&M.loseContext()},this.forceContextRestore=function(){let M=Je.get("WEBGL_lose_context");M&&M.restoreContext()},this.getPixelRatio=function(){return le},this.setPixelRatio=function(M){M!==void 0&&(le=M,this.setSize(ie,de,!1))},this.getSize=function(M){return M.set(ie,de)},this.setSize=function(M,w,O=!0){if(Ie.isPresenting){ke("WebGLRenderer: Can't change size while VR device is presenting.");return}ie=M,de=w,t.width=Math.floor(M*le),t.height=Math.floor(w*le),O===!0&&(t.style.width=M+"px",t.style.height=w+"px"),T!==null&&T.setSize(t.width,t.height),this.setViewport(0,0,M,w)},this.getDrawingBufferSize=function(M){return M.set(ie*le,de*le).floor()},this.setDrawingBufferSize=function(M,w,O){ie=M,de=w,le=O,t.width=Math.floor(M*O),t.height=Math.floor(w*O),this.setViewport(0,0,M,w)},this.setEffects=function(M){if(y===yn){Ye("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(M){for(let w=0;w<M.length;w++)if(M[w].isOutputPass===!0){ke("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}T.setEffects(M||[])},this.getCurrentViewport=function(M){return M.copy(fe)},this.getViewport=function(M){return M.copy(Le)},this.setViewport=function(M,w,O,Z){M.isVector4?Le.set(M.x,M.y,M.z,M.w):Le.set(M,w,O,Z),x.viewport(fe.copy(Le).multiplyScalar(le).round())},this.getScissor=function(M){return M.copy(mt)},this.setScissor=function(M,w,O,Z){M.isVector4?mt.set(M.x,M.y,M.z,M.w):mt.set(M,w,O,Z),x.scissor(Ae.copy(mt).multiplyScalar(le).round())},this.getScissorTest=function(){return Ze},this.setScissorTest=function(M){x.setScissorTest(Ze=M)},this.setOpaqueSort=function(M){Pe=M},this.setTransparentSort=function(M){qe=M},this.getClearColor=function(M){return M.copy($e.getClearColor())},this.setClearColor=function(){$e.setClearColor(...arguments)},this.getClearAlpha=function(){return $e.getClearAlpha()},this.setClearAlpha=function(){$e.setClearAlpha(...arguments)},this.clear=function(M=!0,w=!0,O=!0){let Z=0;if(M){let Y=!1;if(se!==null){let Te=se.texture.format;Y=g.has(Te)}if(Y){let Te=se.texture.type,Re=p.has(Te),Ee=$e.getClearColor(),De=$e.getClearAlpha(),Ue=Ee.r,tt=Ee.g,lt=Ee.b;Re?(E[0]=Ue,E[1]=tt,E[2]=lt,E[3]=De,B.clearBufferuiv(B.COLOR,0,E)):(S[0]=Ue,S[1]=tt,S[2]=lt,S[3]=De,B.clearBufferiv(B.COLOR,0,S))}else Z|=B.COLOR_BUFFER_BIT}w&&(Z|=B.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),O&&(Z|=B.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),Z!==0&&B.clear(Z)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(M){M.setRenderer(this),F=M},this.dispose=function(){t.removeEventListener("webglcontextlost",Lt,!1),t.removeEventListener("webglcontextrestored",gt,!1),t.removeEventListener("webglcontextcreationerror",rn,!1),$e.dispose(),Me.dispose(),ve.dispose(),q.dispose(),ue.dispose(),j.dispose(),be.dispose(),ae.dispose(),ce.dispose(),Ie.dispose(),Ie.removeEventListener("sessionstart",ts),Ie.removeEventListener("sessionend",ns),Mn.stop()};function Lt(M){M.preventDefault(),Oc("WebGLRenderer: Context Lost."),L=!0}function gt(){Oc("WebGLRenderer: Context Restored."),L=!1;let M=k.autoReset,w=We.enabled,O=We.autoUpdate,Z=We.needsUpdate,Y=We.type;Ne(),k.autoReset=M,We.enabled=w,We.autoUpdate=O,We.needsUpdate=Z,We.type=Y}function rn(M){Ye("WebGLRenderer: A WebGL context could not be created. Reason: ",M.statusMessage)}function Xe(M){let w=M.target;w.removeEventListener("dispose",Xe),Ll(w)}function Ll(M){Dl(M),q.remove(M)}function Dl(M){let w=q.get(M).programs;w!==void 0&&(w.forEach(function(O){ce.releaseProgram(O)}),M.isShaderMaterial&&ce.releaseShaderCache(M))}this.renderBufferDirect=function(M,w,O,Z,Y,Te){w===null&&(w=wt);let Re=Y.isMesh&&Y.matrixWorld.determinantAffine()<0,Ee=Nl(M,w,O,Z,Y);x.setMaterial(Z,Re);let De=O.index,Ue=1;if(Z.wireframe===!0){if(De=ne.getWireframeAttribute(O),De===void 0)return;Ue=2}let tt=O.drawRange,lt=O.attributes.position,Be=tt.start*Ue,At=(tt.start+tt.count)*Ue;Te!==null&&(Be=Math.max(Be,Te.start*Ue),At=Math.min(At,(Te.start+Te.count)*Ue)),De!==null?(Be=Math.max(Be,0),At=Math.min(At,De.count)):lt!=null&&(Be=Math.max(Be,0),At=Math.min(At,lt.count));let kt=At-Be;if(kt<0||kt===1/0)return;be.setup(Y,Z,Ee,O,De);let Bt,Ct=me;if(De!==null&&(Bt=ge.get(De),Ct=re,Ct.setIndex(Bt)),Y.isMesh)Z.wireframe===!0?(x.setLineWidth(Z.wireframeLinewidth*Nt()),Ct.setMode(B.LINES)):Ct.setMode(B.TRIANGLES);else if(Y.isLine){let en=Z.linewidth;en===void 0&&(en=1),x.setLineWidth(en*Nt()),Y.isLineSegments?Ct.setMode(B.LINES):Y.isLineLoop?Ct.setMode(B.LINE_LOOP):Ct.setMode(B.LINE_STRIP)}else Y.isPoints?Ct.setMode(B.POINTS):Y.isSprite&&Ct.setMode(B.TRIANGLES);if(Y.isBatchedMesh)if(Je.get("WEBGL_multi_draw"))Ct.renderMultiDraw(Y._multiDrawStarts,Y._multiDrawCounts,Y._multiDrawCount);else{let en=Y._multiDrawStarts,Ce=Y._multiDrawCounts,Ft=Y._multiDrawCount,ht=De?ge.get(De).bytesPerElement:1,tn=q.get(Z).currentProgram.getUniforms();for(let Ln=0;Ln<Ft;Ln++)tn.setValue(B,"_gl_DrawID",Ln),Ct.render(en[Ln]/ht,Ce[Ln])}else if(Y.isInstancedMesh)Ct.renderInstances(Be,kt,Y.count);else if(O.isInstancedBufferGeometry){let en=O._maxInstanceCount!==void 0?O._maxInstanceCount:1/0,Ce=Math.min(O.instanceCount,en);Ct.renderInstances(Be,kt,Ce)}else Ct.render(Be,kt)};function wi(M,w,O){M.transparent===!0&&M.side===Fn&&M.forceSinglePass===!1?(M.side=vn,M.needsUpdate=!0,Ai(M,w,O),M.side=vi,M.needsUpdate=!0,Ai(M,w,O),M.side=Fn):Ai(M,w,O)}this.compile=function(M,w,O=null){O===null&&(O=M),b=ve.get(O),b.init(w),v.push(b),O.traverseVisible(function(Y){Y.isLight&&Y.layers.test(w.layers)&&(b.pushLight(Y),Y.castShadow&&b.pushShadow(Y))}),M!==O&&M.traverseVisible(function(Y){Y.isLight&&Y.layers.test(w.layers)&&(b.pushLight(Y),Y.castShadow&&b.pushShadow(Y))}),b.setupLights();let Z=new Set;return M.traverse(function(Y){if(!(Y.isMesh||Y.isPoints||Y.isLine||Y.isSprite))return;let Te=Y.material;if(Te)if(Array.isArray(Te))for(let Re=0;Re<Te.length;Re++){let Ee=Te[Re];wi(Ee,O,Y),Z.add(Ee)}else wi(Te,O,Y),Z.add(Te)}),b=v.pop(),Z},this.compileAsync=function(M,w,O=null){let Z=this.compile(M,w,O);return new Promise(Y=>{function Te(){if(Z.forEach(function(Re){q.get(Re).currentProgram.isReady()&&Z.delete(Re)}),Z.size===0){Y(M);return}setTimeout(Te,10)}Je.get("KHR_parallel_shader_compile")!==null?Te():setTimeout(Te,10)})};let ws=null;function As(M){ws&&ws(M)}function ts(){Mn.stop()}function ns(){Mn.start()}let Mn=new xf;Mn.setAnimationLoop(As),typeof self<"u"&&Mn.setContext(self),this.setAnimationLoop=function(M){ws=M,Ie.setAnimationLoop(M),M===null?Mn.stop():Mn.start()},Ie.addEventListener("sessionstart",ts),Ie.addEventListener("sessionend",ns),this.render=function(M,w){if(w!==void 0&&w.isCamera!==!0){Ye("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(L===!0)return;F!==null&&F.renderStart(M,w);let O=Ie.enabled===!0&&Ie.isPresenting===!0,Z=T!==null&&(se===null||O)&&T.begin(P,se);if(M.matrixWorldAutoUpdate===!0&&M.updateMatrixWorld(),w.parent===null&&w.matrixWorldAutoUpdate===!0&&w.updateMatrixWorld(),Ie.enabled===!0&&Ie.isPresenting===!0&&(T===null||T.isCompositing()===!1)&&(Ie.cameraAutoUpdate===!0&&Ie.updateCamera(w),w=Ie.getCamera()),M.isScene===!0&&M.onBeforeRender(P,M,w,se),b=ve.get(M,v.length),b.init(w),b.state.textureUnits=te.getTextureUnits(),v.push(b),Mt.multiplyMatrices(w.projectionMatrix,w.matrixWorldInverse),at.setFromProjectionMatrix(Mt,Gn,w.reversedDepth),nt=this.localClippingEnabled,ot=Ge.init(this.clippingPlanes,nt),C=Me.get(M,I.length),C.init(),I.push(C),Ie.enabled===!0&&Ie.isPresenting===!0){let Re=P.xr.getDepthSensingMesh();Re!==null&&Jn(Re,w,-1/0,P.sortObjects)}Jn(M,w,0,P.sortObjects),C.finish(),P.sortObjects===!0&&C.sort(Pe,qe,w.reversedDepth),Pt=Ie.enabled===!1||Ie.isPresenting===!1||Ie.hasDepthSensing()===!1,Pt&&$e.addToRenderList(C,M),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),ot===!0&&Ge.beginShadows();let Y=b.state.shadowsArray;if(We.render(Y,M,w),ot===!0&&Ge.endShadows(),(Z&&T.hasRenderPass())===!1){let Re=C.opaque,Ee=C.transmissive;if(b.setupLights(),w.isArrayCamera){let De=w.cameras;if(Ee.length>0)for(let Ue=0,tt=De.length;Ue<tt;Ue++){let lt=De[Ue];Rs(Re,Ee,M,lt)}Pt&&$e.render(M);for(let Ue=0,tt=De.length;Ue<tt;Ue++){let lt=De[Ue];Cs(C,M,lt,lt.viewport)}}else Ee.length>0&&Rs(Re,Ee,M,w),Pt&&$e.render(M),Cs(C,M,w)}se!==null&&$===0&&(te.updateMultisampleRenderTarget(se),te.updateRenderTargetMipmap(se)),Z&&T.end(P),M.isScene===!0&&M.onAfterRender(P,M,w),be.resetDefaultState(),oe=-1,he=null,v.pop(),v.length>0?(b=v[v.length-1],te.setTextureUnits(b.state.textureUnits),ot===!0&&Ge.setGlobalState(P.clippingPlanes,b.state.camera)):b=null,I.pop(),I.length>0?C=I[I.length-1]:C=null,F!==null&&F.renderEnd()};function Jn(M,w,O,Z){if(M.visible===!1)return;if(M.layers.test(w.layers)){if(M.isGroup)O=M.renderOrder;else if(M.isLOD)M.autoUpdate===!0&&M.update(w);else if(M.isLightProbeGrid)b.pushLightProbeGrid(M);else if(M.isLight)b.pushLight(M),M.castShadow&&b.pushShadow(M);else if(M.isSprite){if(!M.frustumCulled||at.intersectsSprite(M)){Z&&xt.setFromMatrixPosition(M.matrixWorld).applyMatrix4(Mt);let Re=j.update(M),Ee=M.material;Ee.visible&&C.push(M,Re,Ee,O,xt.z,null)}}else if((M.isMesh||M.isLine||M.isPoints)&&(!M.frustumCulled||at.intersectsObject(M))){let Re=j.update(M),Ee=M.material;if(Z&&(M.boundingSphere!==void 0?(M.boundingSphere===null&&M.computeBoundingSphere(),xt.copy(M.boundingSphere.center)):(Re.boundingSphere===null&&Re.computeBoundingSphere(),xt.copy(Re.boundingSphere.center)),xt.applyMatrix4(M.matrixWorld).applyMatrix4(Mt)),Array.isArray(Ee)){let De=Re.groups;for(let Ue=0,tt=De.length;Ue<tt;Ue++){let lt=De[Ue],Be=Ee[lt.materialIndex];Be&&Be.visible&&C.push(M,Re,Be,O,xt.z,lt)}}else Ee.visible&&C.push(M,Re,Ee,O,xt.z,null)}}let Te=M.children;for(let Re=0,Ee=Te.length;Re<Ee;Re++)Jn(Te[Re],w,O,Z)}function Cs(M,w,O,Z){let{opaque:Y,transmissive:Te,transparent:Re}=M;b.setupLightsView(O),ot===!0&&Ge.setGlobalState(P.clippingPlanes,O),Z&&x.viewport(fe.copy(Z)),Y.length>0&&mn(Y,w,O),Te.length>0&&mn(Te,w,O),Re.length>0&&mn(Re,w,O),x.buffers.depth.setTest(!0),x.buffers.depth.setMask(!0),x.buffers.color.setMask(!0),x.setPolygonOffset(!1)}function Rs(M,w,O,Z){if((O.isScene===!0?O.overrideMaterial:null)!==null)return;if(b.state.transmissionRenderTarget[Z.id]===void 0){let Be=Je.has("EXT_color_buffer_half_float")||Je.has("EXT_color_buffer_float");b.state.transmissionRenderTarget[Z.id]=new Cn(1,1,{generateMipmaps:!0,type:Be?li:yn,minFilter:Ki,samples:Math.max(4,R.samples),stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:et.workingColorSpace})}let Te=b.state.transmissionRenderTarget[Z.id],Re=Z.viewport||fe;Te.setSize(Re.z*P.transmissionResolutionScale,Re.w*P.transmissionResolutionScale);let Ee=P.getRenderTarget(),De=P.getActiveCubeFace(),Ue=P.getActiveMipmapLevel();P.setRenderTarget(Te),P.getClearColor(yt),rt=P.getClearAlpha(),rt<1&&P.setClearColor(16777215,.5),P.clear(),Pt&&$e.render(O);let tt=P.toneMapping;P.toneMapping=Yn;let lt=Z.viewport;if(Z.viewport!==void 0&&(Z.viewport=void 0),b.setupLightsView(Z),ot===!0&&Ge.setGlobalState(P.clippingPlanes,Z),mn(M,O,Z),te.updateMultisampleRenderTarget(Te),te.updateRenderTargetMipmap(Te),Je.has("WEBGL_multisampled_render_to_texture")===!1){let Be=!1;for(let At=0,kt=w.length;At<kt;At++){let Bt=w[At],{object:Ct,geometry:en,material:Ce,group:Ft}=Bt;if(Ce.side===Fn&&Ct.layers.test(Z.layers)){let ht=Ce.side;Ce.side=vn,Ce.needsUpdate=!0,mr(Ct,O,Z,en,Ce,Ft),Ce.side=ht,Ce.needsUpdate=!0,Be=!0}}Be===!0&&(te.updateMultisampleRenderTarget(Te),te.updateRenderTargetMipmap(Te))}P.setRenderTarget(Ee,De,Ue),P.setClearColor(yt,rt),lt!==void 0&&(Z.viewport=lt),P.toneMapping=tt}function mn(M,w,O){let Z=w.isScene===!0?w.overrideMaterial:null;for(let Y=0,Te=M.length;Y<Te;Y++){let Re=M[Y],{object:Ee,geometry:De,group:Ue}=Re,tt=Re.material;tt.allowOverride===!0&&Z!==null&&(tt=Z),Ee.layers.test(O.layers)&&mr(Ee,w,O,De,tt,Ue)}}function mr(M,w,O,Z,Y,Te){M.onBeforeRender(P,w,O,Z,Y,Te),M.modelViewMatrix.multiplyMatrices(O.matrixWorldInverse,M.matrixWorld),M.normalMatrix.getNormalMatrix(M.modelViewMatrix),Y.onBeforeRender(P,w,O,Z,M,Te),Y.transparent===!0&&Y.side===Fn&&Y.forceSinglePass===!1?(Y.side=vn,Y.needsUpdate=!0,P.renderBufferDirect(O,w,Z,Y,M,Te),Y.side=vi,Y.needsUpdate=!0,P.renderBufferDirect(O,w,Z,Y,M,Te),Y.side=Fn):P.renderBufferDirect(O,w,Z,Y,M,Te),M.onAfterRender(P,w,O,Z,Y,Te)}function Ai(M,w,O){w.isScene!==!0&&(w=wt);let Z=q.get(M),Y=b.state.lights,Te=b.state.shadowsArray,Re=Y.state.version,Ee=ce.getParameters(M,Y.state,Te,w,O,b.state.lightProbeGridArray),De=ce.getProgramCacheKey(Ee),Ue=Z.programs;Z.environment=M.isMeshStandardMaterial||M.isMeshLambertMaterial||M.isMeshPhongMaterial?w.environment:null,Z.fog=w.fog;let tt=M.isMeshStandardMaterial||M.isMeshLambertMaterial&&!M.envMap||M.isMeshPhongMaterial&&!M.envMap;Z.envMap=ue.get(M.envMap||Z.environment,tt),Z.envMapRotation=Z.environment!==null&&M.envMap===null?w.environmentRotation:M.envMapRotation,Ue===void 0&&(M.addEventListener("dispose",Xe),Ue=new Map,Z.programs=Ue);let lt=Ue.get(De);if(lt!==void 0){if(Z.currentProgram===lt&&Z.lightsStateVersion===Re)return Ci(M,Ee),lt}else Ee.uniforms=ce.getUniforms(M),F!==null&&M.isNodeMaterial&&F.build(M,O,Ee),M.onBeforeCompile(Ee,P),lt=ce.acquireProgram(Ee,De),Ue.set(De,lt),Z.uniforms=Ee.uniforms;let Be=Z.uniforms;return(!M.isShaderMaterial&&!M.isRawShaderMaterial||M.clipping===!0)&&(Be.clippingPlanes=Ge.uniform),Ci(M,Ee),Z.needsLights=Bn(M),Z.lightsStateVersion=Re,Z.needsLights&&(Be.ambientLightColor.value=Y.state.ambient,Be.lightProbe.value=Y.state.probe,Be.directionalLights.value=Y.state.directional,Be.directionalLightShadows.value=Y.state.directionalShadow,Be.spotLights.value=Y.state.spot,Be.spotLightShadows.value=Y.state.spotShadow,Be.rectAreaLights.value=Y.state.rectArea,Be.ltc_1.value=Y.state.rectAreaLTC1,Be.ltc_2.value=Y.state.rectAreaLTC2,Be.pointLights.value=Y.state.point,Be.pointLightShadows.value=Y.state.pointShadow,Be.hemisphereLights.value=Y.state.hemi,Be.directionalShadowMatrix.value=Y.state.directionalShadowMatrix,Be.spotLightMatrix.value=Y.state.spotLightMatrix,Be.spotLightMap.value=Y.state.spotLightMap,Be.pointShadowMatrix.value=Y.state.pointShadowMatrix),Z.lightProbeGrid=b.state.lightProbeGridArray.length>0,Z.currentProgram=lt,Z.uniformsList=null,lt}function is(M){if(M.uniformsList===null){let w=M.currentProgram.getUniforms();M.uniformsList=ur.seqWithValue(w.seq,M.uniforms)}return M.uniformsList}function Ci(M,w){let O=q.get(M);O.outputColorSpace=w.outputColorSpace,O.batching=w.batching,O.batchingColor=w.batchingColor,O.instancing=w.instancing,O.instancingColor=w.instancingColor,O.instancingMorph=w.instancingMorph,O.skinning=w.skinning,O.morphTargets=w.morphTargets,O.morphNormals=w.morphNormals,O.morphColors=w.morphColors,O.morphTargetsCount=w.morphTargetsCount,O.numClippingPlanes=w.numClippingPlanes,O.numIntersection=w.numClipIntersection,O.vertexAlphas=w.vertexAlphas,O.vertexTangents=w.vertexTangents,O.toneMapping=w.toneMapping}function wa(M,w){if(M.length===0)return null;if(M.length===1)return M[0].texture!==null?M[0]:null;_.setFromMatrixPosition(w.matrixWorld);for(let O=0,Z=M.length;O<Z;O++){let Y=M[O];if(Y.texture!==null&&Y.boundingBox.containsPoint(_))return Y}return null}function Nl(M,w,O,Z,Y){w.isScene!==!0&&(w=wt),te.resetTextureUnits();let Te=w.fog,Re=Z.isMeshStandardMaterial||Z.isMeshLambertMaterial||Z.isMeshPhongMaterial?w.environment:null,Ee=se===null?P.outputColorSpace:se.isXRRenderTarget===!0?se.texture.colorSpace:et.workingColorSpace,De=Z.isMeshStandardMaterial||Z.isMeshLambertMaterial&&!Z.envMap||Z.isMeshPhongMaterial&&!Z.envMap,Ue=ue.get(Z.envMap||Re,De),tt=Z.vertexColors===!0&&!!O.attributes.color&&O.attributes.color.itemSize===4,lt=!!O.attributes.tangent&&(!!Z.normalMap||Z.anisotropy>0),Be=!!O.morphAttributes.position,At=!!O.morphAttributes.normal,kt=!!O.morphAttributes.color,Bt=Yn;Z.toneMapped&&(se===null||se.isXRRenderTarget===!0)&&(Bt=P.toneMapping);let Ct=O.morphAttributes.position||O.morphAttributes.normal||O.morphAttributes.color,en=Ct!==void 0?Ct.length:0,Ce=q.get(Z),Ft=b.state.lights;if(ot===!0&&(nt===!0||M!==he)){let Dt=M===he&&Z.id===oe;Ge.setState(Z,M,Dt)}let ht=!1;Z.version===Ce.__version?(Ce.needsLights&&Ce.lightsStateVersion!==Ft.state.version||Ce.outputColorSpace!==Ee||Y.isBatchedMesh&&Ce.batching===!1||!Y.isBatchedMesh&&Ce.batching===!0||Y.isBatchedMesh&&Ce.batchingColor===!0&&Y.colorTexture===null||Y.isBatchedMesh&&Ce.batchingColor===!1&&Y.colorTexture!==null||Y.isInstancedMesh&&Ce.instancing===!1||!Y.isInstancedMesh&&Ce.instancing===!0||Y.isSkinnedMesh&&Ce.skinning===!1||!Y.isSkinnedMesh&&Ce.skinning===!0||Y.isInstancedMesh&&Ce.instancingColor===!0&&Y.instanceColor===null||Y.isInstancedMesh&&Ce.instancingColor===!1&&Y.instanceColor!==null||Y.isInstancedMesh&&Ce.instancingMorph===!0&&Y.morphTexture===null||Y.isInstancedMesh&&Ce.instancingMorph===!1&&Y.morphTexture!==null||Ce.envMap!==Ue||Z.fog===!0&&Ce.fog!==Te||Ce.numClippingPlanes!==void 0&&(Ce.numClippingPlanes!==Ge.numPlanes||Ce.numIntersection!==Ge.numIntersection)||Ce.vertexAlphas!==tt||Ce.vertexTangents!==lt||Ce.morphTargets!==Be||Ce.morphNormals!==At||Ce.morphColors!==kt||Ce.toneMapping!==Bt||Ce.morphTargetsCount!==en||!!Ce.lightProbeGrid!=b.state.lightProbeGridArray.length>0)&&(ht=!0):(ht=!0,Ce.__version=Z.version);let tn=Ce.currentProgram;ht===!0&&(tn=Ai(Z,w,Y),F&&Z.isNodeMaterial&&F.onUpdateProgram(Z,tn,Ce));let Ln=!1,zn=!1,Qn=!1,Rt=tn.getUniforms(),Ht=Ce.uniforms;if(x.useProgram(tn.program)&&(Ln=!0,zn=!0,Qn=!0),Z.id!==oe&&(oe=Z.id,zn=!0),Ce.needsLights){let Dt=wa(b.state.lightProbeGridArray,Y);Ce.lightProbeGrid!==Dt&&(Ce.lightProbeGrid=Dt,zn=!0)}if(Ln||he!==M){x.buffers.depth.getReversed()&&M.reversedDepth!==!0&&(M._reversedDepth=!0,M.updateProjectionMatrix()),Rt.setValue(B,"projectionMatrix",M.projectionMatrix),Rt.setValue(B,"viewMatrix",M.matrixWorldInverse);let ei=Rt.map.cameraPosition;ei!==void 0&&ei.setValue(B,St.setFromMatrixPosition(M.matrixWorld)),R.logarithmicDepthBuffer&&Rt.setValue(B,"logDepthBufFC",2/(Math.log(M.far+1)/Math.LN2)),(Z.isMeshPhongMaterial||Z.isMeshToonMaterial||Z.isMeshLambertMaterial||Z.isMeshBasicMaterial||Z.isMeshStandardMaterial||Z.isShaderMaterial)&&Rt.setValue(B,"isOrthographic",M.isOrthographicCamera===!0),he!==M&&(he=M,zn=!0,Qn=!0)}if(Ce.needsLights&&(Ft.state.directionalShadowMap.length>0&&Rt.setValue(B,"directionalShadowMap",Ft.state.directionalShadowMap,te),Ft.state.spotShadowMap.length>0&&Rt.setValue(B,"spotShadowMap",Ft.state.spotShadowMap,te),Ft.state.pointShadowMap.length>0&&Rt.setValue(B,"pointShadowMap",Ft.state.pointShadowMap,te)),Y.isSkinnedMesh){Rt.setOptional(B,Y,"bindMatrix"),Rt.setOptional(B,Y,"bindMatrixInverse");let Dt=Y.skeleton;Dt&&(Dt.boneTexture===null&&Dt.computeBoneTexture(),Rt.setValue(B,"boneTexture",Dt.boneTexture,te))}Y.isBatchedMesh&&(Rt.setOptional(B,Y,"batchingTexture"),Rt.setValue(B,"batchingTexture",Y._matricesTexture,te),Rt.setOptional(B,Y,"batchingIdTexture"),Rt.setValue(B,"batchingIdTexture",Y._indirectTexture,te),Rt.setOptional(B,Y,"batchingColorTexture"),Y._colorsTexture!==null&&Rt.setValue(B,"batchingColorTexture",Y._colorsTexture,te));let jn=O.morphAttributes;if((jn.position!==void 0||jn.normal!==void 0||jn.color!==void 0)&&U.update(Y,O,tn),(zn||Ce.receiveShadow!==Y.receiveShadow)&&(Ce.receiveShadow=Y.receiveShadow,Rt.setValue(B,"receiveShadow",Y.receiveShadow)),(Z.isMeshStandardMaterial||Z.isMeshLambertMaterial||Z.isMeshPhongMaterial)&&Z.envMap===null&&w.environment!==null&&(Ht.envMapIntensity.value=w.environmentIntensity),Ht.dfgLUT!==void 0&&(Ht.dfgLUT.value=pv()),zn){if(Rt.setValue(B,"toneMappingExposure",P.toneMappingExposure),Ce.needsLights&&ss(Ht,Qn),Te&&Z.fog===!0&&xe.refreshFogUniforms(Ht,Te),xe.refreshMaterialUniforms(Ht,Z,le,de,b.state.transmissionRenderTarget[M.id]),Ce.needsLights&&Ce.lightProbeGrid){let Dt=Ce.lightProbeGrid;Ht.probesSH.value=Dt.texture,Ht.probesMin.value.copy(Dt.boundingBox.min),Ht.probesMax.value.copy(Dt.boundingBox.max),Ht.probesResolution.value.copy(Dt.resolution)}ur.upload(B,is(Ce),Ht,te)}if(Z.isShaderMaterial&&Z.uniformsNeedUpdate===!0&&(ur.upload(B,is(Ce),Ht,te),Z.uniformsNeedUpdate=!1),Z.isSpriteMaterial&&Rt.setValue(B,"center",Y.center),Rt.setValue(B,"modelViewMatrix",Y.modelViewMatrix),Rt.setValue(B,"normalMatrix",Y.normalMatrix),Rt.setValue(B,"modelMatrix",Y.matrixWorld),Z.uniformsGroups!==void 0){let Dt=Z.uniformsGroups;for(let ei=0,Ri=Dt.length;ei<Ri;ei++){let Aa=Dt[ei];ae.update(Aa,tn),ae.bind(Aa,tn)}}return tn}function ss(M,w){M.ambientLightColor.needsUpdate=w,M.lightProbe.needsUpdate=w,M.directionalLights.needsUpdate=w,M.directionalLightShadows.needsUpdate=w,M.pointLights.needsUpdate=w,M.pointLightShadows.needsUpdate=w,M.spotLights.needsUpdate=w,M.spotLightShadows.needsUpdate=w,M.rectAreaLights.needsUpdate=w,M.hemisphereLights.needsUpdate=w}function Bn(M){return M.isMeshLambertMaterial||M.isMeshToonMaterial||M.isMeshPhongMaterial||M.isMeshStandardMaterial||M.isShadowMaterial||M.isShaderMaterial&&M.lights===!0}this.getActiveCubeFace=function(){return Q},this.getActiveMipmapLevel=function(){return $},this.getRenderTarget=function(){return se},this.setRenderTargetTextures=function(M,w,O){let Z=q.get(M);Z.__autoAllocateDepthBuffer=M.resolveDepthBuffer===!1,Z.__autoAllocateDepthBuffer===!1&&(Z.__useRenderToTexture=!1),q.get(M.texture).__webglTexture=w,q.get(M.depthTexture).__webglTexture=Z.__autoAllocateDepthBuffer?void 0:O,Z.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(M,w){let O=q.get(M);O.__webglFramebuffer=w,O.__useDefaultFramebuffer=w===void 0},this.setRenderTarget=function(M,w=0,O=0){se=M,Q=w,$=O;let Z=null,Y=!1,Te=!1;if(M){let Ee=q.get(M);if(Ee.__useDefaultFramebuffer!==void 0){x.bindFramebuffer(B.FRAMEBUFFER,Ee.__webglFramebuffer),fe.copy(M.viewport),Ae.copy(M.scissor),st=M.scissorTest,x.viewport(fe),x.scissor(Ae),x.setScissorTest(st),oe=-1;return}else if(Ee.__webglFramebuffer===void 0)te.setupRenderTarget(M);else if(Ee.__hasExternalTextures)te.rebindTextures(M,q.get(M.texture).__webglTexture,q.get(M.depthTexture).__webglTexture);else if(M.depthBuffer){let tt=M.depthTexture;if(Ee.__boundDepthTexture!==tt){if(tt!==null&&q.has(tt)&&(M.width!==tt.image.width||M.height!==tt.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");te.setupDepthRenderbuffer(M)}}let De=M.texture;(De.isData3DTexture||De.isDataArrayTexture||De.isCompressedArrayTexture)&&(Te=!0);let Ue=q.get(M).__webglFramebuffer;M.isWebGLCubeRenderTarget?(Array.isArray(Ue[w])?Z=Ue[w][O]:Z=Ue[w],Y=!0):M.samples>0&&te.useMultisampledRTT(M)===!1?Z=q.get(M).__webglMultisampledFramebuffer:Array.isArray(Ue)?Z=Ue[O]:Z=Ue,fe.copy(M.viewport),Ae.copy(M.scissor),st=M.scissorTest}else fe.copy(Le).multiplyScalar(le).floor(),Ae.copy(mt).multiplyScalar(le).floor(),st=Ze;if(O!==0&&(Z=K),x.bindFramebuffer(B.FRAMEBUFFER,Z)&&x.drawBuffers(M,Z),x.viewport(fe),x.scissor(Ae),x.setScissorTest(st),Y){let Ee=q.get(M.texture);B.framebufferTexture2D(B.FRAMEBUFFER,B.COLOR_ATTACHMENT0,B.TEXTURE_CUBE_MAP_POSITIVE_X+w,Ee.__webglTexture,O)}else if(Te){let Ee=w;for(let De=0;De<M.textures.length;De++){let Ue=q.get(M.textures[De]);B.framebufferTextureLayer(B.FRAMEBUFFER,B.COLOR_ATTACHMENT0+De,Ue.__webglTexture,O,Ee)}}else if(M!==null&&O!==0){let Ee=q.get(M.texture);B.framebufferTexture2D(B.FRAMEBUFFER,B.COLOR_ATTACHMENT0,B.TEXTURE_2D,Ee.__webglTexture,O)}oe=-1},this.readRenderTargetPixels=function(M,w,O,Z,Y,Te,Re,Ee=0){if(!(M&&M.isWebGLRenderTarget)){Ye("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let De=q.get(M).__webglFramebuffer;if(M.isWebGLCubeRenderTarget&&Re!==void 0&&(De=De[Re]),De){x.bindFramebuffer(B.FRAMEBUFFER,De);try{let Ue=M.textures[Ee],tt=Ue.format,lt=Ue.type;if(M.textures.length>1&&B.readBuffer(B.COLOR_ATTACHMENT0+Ee),!R.textureFormatReadable(tt)){Ye("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!R.textureTypeReadable(lt)){Ye("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}w>=0&&w<=M.width-Z&&O>=0&&O<=M.height-Y&&B.readPixels(w,O,Z,Y,_e.convert(tt),_e.convert(lt),Te)}finally{let Ue=se!==null?q.get(se).__webglFramebuffer:null;x.bindFramebuffer(B.FRAMEBUFFER,Ue)}}},this.readRenderTargetPixelsAsync=async function(M,w,O,Z,Y,Te,Re,Ee=0){if(!(M&&M.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let De=q.get(M).__webglFramebuffer;if(M.isWebGLCubeRenderTarget&&Re!==void 0&&(De=De[Re]),De)if(w>=0&&w<=M.width-Z&&O>=0&&O<=M.height-Y){x.bindFramebuffer(B.FRAMEBUFFER,De);let Ue=M.textures[Ee],tt=Ue.format,lt=Ue.type;if(M.textures.length>1&&B.readBuffer(B.COLOR_ATTACHMENT0+Ee),!R.textureFormatReadable(tt))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!R.textureTypeReadable(lt))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let Be=B.createBuffer();B.bindBuffer(B.PIXEL_PACK_BUFFER,Be),B.bufferData(B.PIXEL_PACK_BUFFER,Te.byteLength,B.STREAM_READ),B.readPixels(w,O,Z,Y,_e.convert(tt),_e.convert(lt),0);let At=se!==null?q.get(se).__webglFramebuffer:null;x.bindFramebuffer(B.FRAMEBUFFER,At);let kt=B.fenceSync(B.SYNC_GPU_COMMANDS_COMPLETE,0);return B.flush(),await zu(B,kt,4),B.bindBuffer(B.PIXEL_PACK_BUFFER,Be),B.getBufferSubData(B.PIXEL_PACK_BUFFER,0,Te),B.deleteBuffer(Be),B.deleteSync(kt),Te}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(M,w=null,O=0){let Z=Math.pow(2,-O),Y=Math.floor(M.image.width*Z),Te=Math.floor(M.image.height*Z),Re=w!==null?w.x:0,Ee=w!==null?w.y:0;te.setTexture2D(M,0),B.copyTexSubImage2D(B.TEXTURE_2D,O,0,0,Re,Ee,Y,Te),x.unbindTexture()},this.copyTextureToTexture=function(M,w,O=null,Z=null,Y=0,Te=0){let Re,Ee,De,Ue,tt,lt,Be,At,kt,Bt=M.isCompressedTexture?M.mipmaps[Te]:M.image;if(O!==null)Re=O.max.x-O.min.x,Ee=O.max.y-O.min.y,De=O.isBox3?O.max.z-O.min.z:1,Ue=O.min.x,tt=O.min.y,lt=O.isBox3?O.min.z:0;else{let Ht=Math.pow(2,-Y);Re=Math.floor(Bt.width*Ht),Ee=Math.floor(Bt.height*Ht),M.isDataArrayTexture?De=Bt.depth:M.isData3DTexture?De=Math.floor(Bt.depth*Ht):De=1,Ue=0,tt=0,lt=0}Z!==null?(Be=Z.x,At=Z.y,kt=Z.z):(Be=0,At=0,kt=0);let Ct=_e.convert(w.format),en=_e.convert(w.type),Ce;w.isData3DTexture?(te.setTexture3D(w,0),Ce=B.TEXTURE_3D):w.isDataArrayTexture||w.isCompressedArrayTexture?(te.setTexture2DArray(w,0),Ce=B.TEXTURE_2D_ARRAY):(te.setTexture2D(w,0),Ce=B.TEXTURE_2D),x.activeTexture(B.TEXTURE0),x.pixelStorei(B.UNPACK_FLIP_Y_WEBGL,w.flipY),x.pixelStorei(B.UNPACK_PREMULTIPLY_ALPHA_WEBGL,w.premultiplyAlpha),x.pixelStorei(B.UNPACK_ALIGNMENT,w.unpackAlignment);let Ft=x.getParameter(B.UNPACK_ROW_LENGTH),ht=x.getParameter(B.UNPACK_IMAGE_HEIGHT),tn=x.getParameter(B.UNPACK_SKIP_PIXELS),Ln=x.getParameter(B.UNPACK_SKIP_ROWS),zn=x.getParameter(B.UNPACK_SKIP_IMAGES);x.pixelStorei(B.UNPACK_ROW_LENGTH,Bt.width),x.pixelStorei(B.UNPACK_IMAGE_HEIGHT,Bt.height),x.pixelStorei(B.UNPACK_SKIP_PIXELS,Ue),x.pixelStorei(B.UNPACK_SKIP_ROWS,tt),x.pixelStorei(B.UNPACK_SKIP_IMAGES,lt);let Qn=M.isDataArrayTexture||M.isData3DTexture,Rt=w.isDataArrayTexture||w.isData3DTexture;if(M.isDepthTexture){let Ht=q.get(M),jn=q.get(w),Dt=q.get(Ht.__renderTarget),ei=q.get(jn.__renderTarget);x.bindFramebuffer(B.READ_FRAMEBUFFER,Dt.__webglFramebuffer),x.bindFramebuffer(B.DRAW_FRAMEBUFFER,ei.__webglFramebuffer);for(let Ri=0;Ri<De;Ri++)Qn&&(B.framebufferTextureLayer(B.READ_FRAMEBUFFER,B.COLOR_ATTACHMENT0,q.get(M).__webglTexture,Y,lt+Ri),B.framebufferTextureLayer(B.DRAW_FRAMEBUFFER,B.COLOR_ATTACHMENT0,q.get(w).__webglTexture,Te,kt+Ri)),B.blitFramebuffer(Ue,tt,Re,Ee,Be,At,Re,Ee,B.DEPTH_BUFFER_BIT,B.NEAREST);x.bindFramebuffer(B.READ_FRAMEBUFFER,null),x.bindFramebuffer(B.DRAW_FRAMEBUFFER,null)}else if(Y!==0||M.isRenderTargetTexture||q.has(M)){let Ht=q.get(M),jn=q.get(w);x.bindFramebuffer(B.READ_FRAMEBUFFER,J),x.bindFramebuffer(B.DRAW_FRAMEBUFFER,z);for(let Dt=0;Dt<De;Dt++)Qn?B.framebufferTextureLayer(B.READ_FRAMEBUFFER,B.COLOR_ATTACHMENT0,Ht.__webglTexture,Y,lt+Dt):B.framebufferTexture2D(B.READ_FRAMEBUFFER,B.COLOR_ATTACHMENT0,B.TEXTURE_2D,Ht.__webglTexture,Y),Rt?B.framebufferTextureLayer(B.DRAW_FRAMEBUFFER,B.COLOR_ATTACHMENT0,jn.__webglTexture,Te,kt+Dt):B.framebufferTexture2D(B.DRAW_FRAMEBUFFER,B.COLOR_ATTACHMENT0,B.TEXTURE_2D,jn.__webglTexture,Te),Y!==0?B.blitFramebuffer(Ue,tt,Re,Ee,Be,At,Re,Ee,B.COLOR_BUFFER_BIT,B.NEAREST):Rt?B.copyTexSubImage3D(Ce,Te,Be,At,kt+Dt,Ue,tt,Re,Ee):B.copyTexSubImage2D(Ce,Te,Be,At,Ue,tt,Re,Ee);x.bindFramebuffer(B.READ_FRAMEBUFFER,null),x.bindFramebuffer(B.DRAW_FRAMEBUFFER,null)}else Rt?M.isDataTexture||M.isData3DTexture?B.texSubImage3D(Ce,Te,Be,At,kt,Re,Ee,De,Ct,en,Bt.data):w.isCompressedArrayTexture?B.compressedTexSubImage3D(Ce,Te,Be,At,kt,Re,Ee,De,Ct,Bt.data):B.texSubImage3D(Ce,Te,Be,At,kt,Re,Ee,De,Ct,en,Bt):M.isDataTexture?B.texSubImage2D(B.TEXTURE_2D,Te,Be,At,Re,Ee,Ct,en,Bt.data):M.isCompressedTexture?B.compressedTexSubImage2D(B.TEXTURE_2D,Te,Be,At,Bt.width,Bt.height,Ct,Bt.data):B.texSubImage2D(B.TEXTURE_2D,Te,Be,At,Re,Ee,Ct,en,Bt);x.pixelStorei(B.UNPACK_ROW_LENGTH,Ft),x.pixelStorei(B.UNPACK_IMAGE_HEIGHT,ht),x.pixelStorei(B.UNPACK_SKIP_PIXELS,tn),x.pixelStorei(B.UNPACK_SKIP_ROWS,Ln),x.pixelStorei(B.UNPACK_SKIP_IMAGES,zn),Te===0&&w.generateMipmaps&&B.generateMipmap(Ce),x.unbindTexture()},this.initRenderTarget=function(M){q.get(M).__webglFramebuffer===void 0&&te.setupRenderTarget(M)},this.initTexture=function(M){M.isCubeTexture?te.setTextureCube(M,0):M.isData3DTexture?te.setTexture3D(M,0):M.isDataArrayTexture||M.isCompressedArrayTexture?te.setTexture2DArray(M,0):te.setTexture2D(M,0),x.unbindTexture()},this.resetState=function(){Q=0,$=0,se=null,x.reset(),be.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Gn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=et._getDrawingBufferColorSpace(e),t.unpackColorSpace=et._getUnpackColorSpace()}};var On=Uint8Array,dr=Uint16Array,gv=Int32Array,Ef=new On([0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0,0,0,0]),Tf=new On([0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13,0,0]),xv=new On([16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15]),wf=function(s,e){for(var t=new dr(31),n=0;n<31;++n)t[n]=e+=1<<s[n-1];for(var i=new gv(t[30]),n=1;n<30;++n)for(var r=t[n];r<t[n+1];++r)i[r]=r-t[n]<<5|n;return{b:t,r:i}},Af=wf(Ef,2),Cf=Af.b,vv=Af.r;Cf[28]=258,vv[258]=28;var Rf=wf(Tf,0),_v=Rf.b,zM=Rf.r,uh=new dr(32768);for(_t=0;_t<32768;++_t)Ti=(_t&43690)>>1|(_t&21845)<<1,Ti=(Ti&52428)>>2|(Ti&13107)<<2,Ti=(Ti&61680)>>4|(Ti&3855)<<4,uh[_t]=((Ti&65280)>>8|(Ti&255)<<8)>>1;var Ti,_t,ba=(function(s,e,t){for(var n=s.length,i=0,r=new dr(e);i<n;++i)s[i]&&++r[s[i]-1];var a=new dr(e);for(i=1;i<e;++i)a[i]=a[i-1]+r[i-1]<<1;var o;if(t){o=new dr(1<<e);var l=15-e;for(i=0;i<n;++i)if(s[i])for(var c=i<<4|s[i],u=e-s[i],h=a[s[i]-1]++<<u,f=h|(1<<u)-1;h<=f;++h)o[uh[h]>>l]=c}else for(o=new dr(n),i=0;i<n;++i)s[i]&&(o[i]=uh[a[s[i]-1]++]>>15-s[i]);return o}),Ea=new On(288);for(_t=0;_t<144;++_t)Ea[_t]=8;var _t;for(_t=144;_t<256;++_t)Ea[_t]=9;var _t;for(_t=256;_t<280;++_t)Ea[_t]=7;var _t;for(_t=280;_t<288;++_t)Ea[_t]=8;var _t,If=new On(32);for(_t=0;_t<32;++_t)If[_t]=5;var _t;var yv=ba(Ea,9,1);var Mv=ba(If,5,1),ch=function(s){for(var e=s[0],t=1;t<s.length;++t)s[t]>e&&(e=s[t]);return e},$n=function(s,e,t){var n=e/8|0;return(s[n]|s[n+1]<<8)>>(e&7)&t},hh=function(s,e){var t=e/8|0;return(s[t]|s[t+1]<<8|s[t+2]<<16)>>(e&7)},Sv=function(s){return(s+7)/8|0},bv=function(s,e,t){return(e==null||e<0)&&(e=0),(t==null||t>s.length)&&(t=s.length),new On(s.subarray(e,t))};var Ev=["unexpected EOF","invalid block type","invalid length/literal","invalid distance","stream finished","no stream handler",,"no callback","invalid UTF-8 data","extra field too long","date not in range 1980-2099","filename too long","stream finishing","invalid zip data"],Kn=function(s,e,t){var n=new Error(e||Ev[s]);if(n.code=s,Error.captureStackTrace&&Error.captureStackTrace(n,Kn),!t)throw n;return n},Tv=function(s,e,t,n){var i=s.length,r=n?n.length:0;if(!i||e.f&&!e.l)return t||new On(0);var a=!t,o=a||e.i!=2,l=e.i;a&&(t=new On(i*3));var c=function(Le){var mt=t.length;if(Le>mt){var Ze=new On(Math.max(mt*2,Le));Ze.set(t),t=Ze}},u=e.f||0,h=e.p||0,f=e.b||0,d=e.l,m=e.d,y=e.m,g=e.n,p=i*8;do{if(!d){u=$n(s,h,1);var E=$n(s,h+1,3);if(h+=3,E)if(E==1)d=yv,m=Mv,y=9,g=5;else if(E==2){var b=$n(s,h,31)+257,I=$n(s,h+10,15)+4,v=b+$n(s,h+5,31)+1;h+=14;for(var T=new On(v),P=new On(19),L=0;L<I;++L)P[xv[L]]=$n(s,h+L*3,7);h+=I*3;for(var F=ch(P),K=(1<<F)-1,J=ba(P,F,1),L=0;L<v;){var z=J[$n(s,h,K)];h+=z&15;var S=z>>4;if(S<16)T[L++]=S;else{var Q=0,$=0;for(S==16?($=3+$n(s,h,3),h+=2,Q=T[L-1]):S==17?($=3+$n(s,h,7),h+=3):S==18&&($=11+$n(s,h,127),h+=7);$--;)T[L++]=Q}}var se=T.subarray(0,b),oe=T.subarray(b);y=ch(se),g=ch(oe),d=ba(se,y,1),m=ba(oe,g,1)}else Kn(1);else{var S=Sv(h)+4,_=s[S-4]|s[S-3]<<8,C=S+_;if(C>i){l&&Kn(0);break}o&&c(f+_),t.set(s.subarray(S,C),f),e.b=f+=_,e.p=h=C*8,e.f=u;continue}if(h>p){l&&Kn(0);break}}o&&c(f+131072);for(var he=(1<<y)-1,fe=(1<<g)-1,Ae=h;;Ae=h){var Q=d[hh(s,h)&he],st=Q>>4;if(h+=Q&15,h>p){l&&Kn(0);break}if(Q||Kn(2),st<256)t[f++]=st;else if(st==256){Ae=h,d=null;break}else{var yt=st-254;if(st>264){var L=st-257,rt=Ef[L];yt=$n(s,h,(1<<rt)-1)+Cf[L],h+=rt}var ie=m[hh(s,h)&fe],de=ie>>4;ie||Kn(3),h+=ie&15;var oe=_v[de];if(de>3){var rt=Tf[de];oe+=hh(s,h)&(1<<rt)-1,h+=rt}if(h>p){l&&Kn(0);break}o&&c(f+131072);var le=f+yt;if(f<oe){var Pe=r-oe,qe=Math.min(oe,le);for(Pe+f<0&&Kn(3);f<qe;++f)t[f]=n[Pe+f]}for(;f<le;++f)t[f]=t[f-oe]}}e.l=d,e.p=Ae,e.b=f,e.f=u,d&&(u=1,e.m=y,e.d=m,e.n=g)}while(!u);return f!=t.length&&a?bv(t,0,f):t.subarray(0,f)};var wv=new On(0);var Av=function(s,e){return((s[0]&15)!=8||s[0]>>4>7||(s[0]<<8|s[1])%31)&&Kn(6,"invalid zlib data"),(s[1]>>5&1)==+!e&&Kn(6,"invalid zlib data: "+(s[1]&32?"need":"unexpected")+" dictionary"),(s[1]>>3&4)+2};function Pf(s,e){return Tv(s.subarray(Av(s,e&&e.dictionary),-4),{i:2},e&&e.out,e&&e.dictionary)}var Cv=typeof TextDecoder<"u"&&new TextDecoder,Rv=0;try{Cv.decode(wv,{stream:!0}),Rv=1}catch{}function Lf(s,e,t){let n=t.length-s-1;if(e>=t[n])return n-1;if(e<=t[s])return s;let i=s,r=n,a=Math.floor((i+r)/2);for(;e<t[a]||e>=t[a+1];)e<t[a]?r=a:i=a,a=Math.floor((i+r)/2);return a}function Iv(s,e,t,n){let i=[],r=[],a=[];i[0]=1;for(let o=1;o<=t;++o){r[o]=e-n[s+1-o],a[o]=n[s+o]-e;let l=0;for(let c=0;c<o;++c){let u=a[c+1],h=r[o-c],f=i[c]/(u+h);i[c]=l+u*f,l=h*f}i[o]=l}return i}function Df(s,e,t,n){let i=Lf(s,n,e),r=Iv(i,n,s,e),a=new dt(0,0,0,0);for(let o=0;o<=s;++o){let l=t[i-s+o],c=r[o],u=l.w*c;a.x+=l.x*u,a.y+=l.y*u,a.z+=l.z*u,a.w+=l.w*c}return a}function Pv(s,e,t,n,i){let r=[];for(let h=0;h<=t;++h)r[h]=0;let a=[];for(let h=0;h<=n;++h)a[h]=r.slice(0);let o=[];for(let h=0;h<=t;++h)o[h]=r.slice(0);o[0][0]=1;let l=r.slice(0),c=r.slice(0);for(let h=1;h<=t;++h){l[h]=e-i[s+1-h],c[h]=i[s+h]-e;let f=0;for(let d=0;d<h;++d){let m=c[d+1],y=l[h-d];o[h][d]=m+y;let g=o[d][h-1]/o[h][d];o[d][h]=f+m*g,f=y*g}o[h][h]=f}for(let h=0;h<=t;++h)a[0][h]=o[h][t];for(let h=0;h<=t;++h){let f=0,d=1,m=[];for(let y=0;y<=t;++y)m[y]=r.slice(0);m[0][0]=1;for(let y=1;y<=n;++y){let g=0,p=h-y,E=t-y;h>=y&&(m[d][0]=m[f][0]/o[E+1][p],g=m[d][0]*o[p][E]);let S=p>=-1?1:-p,_=h-1<=E?y-1:t-h;for(let b=S;b<=_;++b)m[d][b]=(m[f][b]-m[f][b-1])/o[E+1][p+b],g+=m[d][b]*o[p+b][E];h<=E&&(m[d][y]=-m[f][y-1]/o[E+1][h],g+=m[d][y]*o[h][E]),a[y][h]=g;let C=f;f=d,d=C}}let u=t;for(let h=1;h<=n;++h){for(let f=0;f<=t;++f)a[h][f]*=u;u*=t-h}return a}function Lv(s,e,t,n,i){let r=i<s?i:s,a=[],o=Lf(s,n,e),l=Pv(o,n,s,r,e),c=[];for(let u=0;u<t.length;++u){let h=t[u].clone(),f=h.w;h.x*=f,h.y*=f,h.z*=f,c[u]=h}for(let u=0;u<=r;++u){let h=c[o-s].clone().multiplyScalar(l[u][0]);for(let f=1;f<=s;++f)h.add(c[o-s+f].clone().multiplyScalar(l[u][f]));a[u]=h}for(let u=r+1;u<=i+1;++u)a[u]=new dt(0,0,0);return a}function Dv(s,e){let t=1;for(let i=2;i<=s;++i)t*=i;let n=1;for(let i=2;i<=e;++i)n*=i;for(let i=2;i<=s-e;++i)n*=i;return t/n}function Nv(s){let e=s.length,t=[],n=[];for(let r=0;r<e;++r){let a=s[r];t[r]=new N(a.x,a.y,a.z),n[r]=a.w}let i=[];for(let r=0;r<e;++r){let a=t[r].clone();for(let o=1;o<=r;++o)a.sub(i[r-o].clone().multiplyScalar(Dv(r,o)*n[o]));i[r]=a.divideScalar(n[0])}return i}function Nf(s,e,t,n,i){let r=Lv(s,e,t,n,i);return Nv(r)}var Al=class extends Vr{constructor(e,t,n,i,r){super();let a=t?t.length-1:0,o=n?n.length:0;this.degree=e,this.knots=t,this.controlPoints=[],this.startKnot=i||0,this.endKnot=r||a;for(let l=0;l<o;++l){let c=n[l];this.controlPoints[l]=new dt(c.x,c.y,c.z,c.w)}}getPoint(e,t=new N){let n=t,i=this.knots[this.startKnot]+e*(this.knots[this.endKnot]-this.knots[this.startKnot]),r=Df(this.degree,this.knots,this.controlPoints,i);return r.w!==1&&r.divideScalar(r.w),n.set(r.x,r.y,r.z)}getTangent(e,t=new N){let n=t,i=this.knots[0]+e*(this.knots[this.knots.length-1]-this.knots[0]),r=Nf(this.degree,this.knots,this.controlPoints,i,1);return n.copy(r[1]).normalize(),n}toJSON(){let e=super.toJSON();return e.degree=this.degree,e.knots=[...this.knots],e.controlPoints=this.controlPoints.map(t=>t.toArray()),e.startKnot=this.startKnot,e.endKnot=this.endKnot,e}fromJSON(e){return super.fromJSON(e),this.degree=e.degree,this.knots=[...e.knots],this.controlPoints=e.controlPoints.map(t=>new dt(t[0],t[1],t[2],t[3])),this.startKnot=e.startKnot,this.endKnot=e.endKnot,this}};var it,Xt,hn,Rl=class extends qn{constructor(e){super(e)}load(e,t,n,i){let r=this,a=r.path===""?ra.extractUrlBase(e):r.path,o=new jr(this.manager);o.setPath(r.path),o.setResponseType("arraybuffer"),o.setRequestHeader(r.requestHeader),o.setWithCredentials(r.withCredentials),o.load(e,function(l){try{t(r.parse(l,a))}catch(c){i?i(c):console.error(c),r.manager.itemError(e)}},n,i)}parse(e,t){if(Uv(e))it=new vh().parse(e);else{let i=Of(e);if(!Ov(i))throw new Error("THREE.FBXLoader: Unknown format.");if(Ff(i)<7e3)throw new Error("THREE.FBXLoader: FBX version not supported, FileVersion: "+Ff(i));it=new xh().parse(i)}let n=new Ss(this.manager).setPath(this.resourcePath||t).setCrossOrigin(this.crossOrigin);return new ph(n,this.manager).parse(it)}},ph=class{constructor(e,t){this.textureLoader=e,this.manager=t}parse(){Xt=this.parseConnections();let e=this.parseImages(),t=this.parseTextures(e),n=this.parseMaterials(t),i=this.parseDeformers(),r=new mh().parse(i);return this.parseScene(i,r,n),hn}parseConnections(){let e=new Map;return"Connections"in it&&it.Connections.connections.forEach(function(n){let i=n[0],r=n[1],a=n[2];e.has(i)||e.set(i,{parents:[],children:[]});let o={ID:r,relationship:a};e.get(i).parents.push(o),e.has(r)||e.set(r,{parents:[],children:[]});let l={ID:i,relationship:a};e.get(r).children.push(l)}),e}parseImages(){let e={},t={};if("Video"in it.Objects){let n=it.Objects.Video;for(let i in n){let r=n[i],a=parseInt(i);if(e[a]=r.RelativeFilename||r.Filename,"Content"in r){let o=r.Content instanceof ArrayBuffer&&r.Content.byteLength>0,l=typeof r.Content=="string"&&r.Content!=="";if(o||l){let c=this.parseImage(n[i]);t[r.RelativeFilename||r.Filename]=c}}}}for(let n in e){let i=e[n];t[i]!==void 0?e[n]=t[i]:e[n]=e[n].split("\\").pop()}return e}parseImage(e){let t=e.Content,n=e.RelativeFilename||e.Filename,i=n.slice(n.lastIndexOf(".")+1).toLowerCase(),r;switch(i){case"bmp":r="image/bmp";break;case"jpg":case"jpeg":r="image/jpeg";break;case"png":r="image/png";break;case"tif":r="image/tiff";break;case"tga":this.manager.getHandler(".tga")===null&&console.warn("FBXLoader: TGA loader not found, skipping ",n),r="image/tga";break;case"webp":r="image/webp";break;default:console.warn('FBXLoader: Image type "'+i+'" is not supported.');return}if(typeof t=="string")return"data:"+r+";base64,"+t;{let a=new Uint8Array(t);return window.URL.createObjectURL(new Blob([a],{type:r}))}}parseTextures(e){let t=new Map;if("Texture"in it.Objects){let n=it.Objects.Texture;for(let i in n){let r=this.parseTexture(n[i],e);t.set(parseInt(i),r)}}return t}parseTexture(e,t){let n=this.loadTexture(e,t);n.ID=e.id,n.name=e.attrName;let i=e.WrapModeU,r=e.WrapModeV,a=i!==void 0?i.value:0,o=r!==void 0?r.value:0;if(n.wrapS=a===0?ms:wn,n.wrapT=o===0?ms:wn,"Scaling"in e){let l=e.Scaling.value;n.repeat.x=l[0],n.repeat.y=l[1]}if("Translation"in e){let l=e.Translation.value;n.offset.x=l[0],n.offset.y=l[1]}return n}loadTexture(e,t){let n=e.FileName.split(".").pop().toLowerCase(),i=this.manager.getHandler(`.${n}`);i===null&&(i=this.textureLoader);let r=i.path;r||i.setPath(this.textureLoader.path);let a=Xt.get(e.id).children,o;if(a!==void 0&&a.length>0&&t[a[0].ID]!==void 0&&(o=t[a[0].ID],(o.indexOf("blob:")===0||o.indexOf("data:")===0)&&i.setPath(void 0)),o===void 0)return console.warn("FBXLoader: Undefined filename, creating placeholder texture."),new ln;let l=i.load(o);return i.setPath(r),l}parseMaterials(e){let t=new Map;if("Material"in it.Objects){let n=it.Objects.Material;for(let i in n){let r=this.parseMaterial(n[i],e);r!==null&&t.set(parseInt(i),r)}}return t}parseMaterial(e,t){let n=e.id,i=e.attrName,r=e.ShadingModel;if(typeof r=="object"&&(r=r.value),!Xt.has(n))return null;let a=this.parseParameters(e,t,n),o;switch(r.toLowerCase()){case"phong":o=new Vi;break;case"lambert":o=new Kr;break;default:console.warn('THREE.FBXLoader: unknown material type "%s". Defaulting to MeshPhongMaterial.',r),o=new Vi;break}return o.setValues(a),o.name=i,o}parseParameters(e,t,n){let i={};e.BumpFactor&&(i.bumpScale=e.BumpFactor.value),e.Diffuse?i.color=et.colorSpaceToWorking(new Ve().fromArray(e.Diffuse.value),bt):e.DiffuseColor&&(e.DiffuseColor.type==="Color"||e.DiffuseColor.type==="ColorRGB")&&(i.color=et.colorSpaceToWorking(new Ve().fromArray(e.DiffuseColor.value),bt)),e.DisplacementFactor&&(i.displacementScale=e.DisplacementFactor.value),e.Emissive?i.emissive=et.colorSpaceToWorking(new Ve().fromArray(e.Emissive.value),bt):e.EmissiveColor&&(e.EmissiveColor.type==="Color"||e.EmissiveColor.type==="ColorRGB")&&(i.emissive=et.colorSpaceToWorking(new Ve().fromArray(e.EmissiveColor.value),bt)),e.EmissiveFactor&&(i.emissiveIntensity=parseFloat(e.EmissiveFactor.value)),i.opacity=1-(e.TransparencyFactor?parseFloat(e.TransparencyFactor.value):0),(i.opacity===1||i.opacity===0)&&(i.opacity=e.Opacity?parseFloat(e.Opacity.value):null,i.opacity===null&&(i.opacity=1)),i.opacity<1&&(i.transparent=!0),e.ReflectionFactor&&(i.reflectivity=e.ReflectionFactor.value),e.Shininess&&(i.shininess=e.Shininess.value),e.Specular?i.specular=et.colorSpaceToWorking(new Ve().fromArray(e.Specular.value),bt):e.SpecularColor&&e.SpecularColor.type==="Color"&&(i.specular=et.colorSpaceToWorking(new Ve().fromArray(e.SpecularColor.value),bt));let r=this;return Xt.get(n).children.forEach(function(a){let o=a.relationship;switch(o){case"Bump":i.bumpMap=r.getTexture(t,a.ID);break;case"Maya|TEX_ao_map":i.aoMap=r.getTexture(t,a.ID);break;case"DiffuseColor":case"Maya|TEX_color_map":i.map=r.getTexture(t,a.ID),i.map!==void 0&&(i.map.colorSpace=bt);break;case"DisplacementColor":i.displacementMap=r.getTexture(t,a.ID);break;case"EmissiveColor":i.emissiveMap=r.getTexture(t,a.ID),i.emissiveMap!==void 0&&(i.emissiveMap.colorSpace=bt);break;case"NormalMap":case"Maya|TEX_normal_map":i.normalMap=r.getTexture(t,a.ID);break;case"ReflectionColor":i.envMap=r.getTexture(t,a.ID),i.envMap!==void 0&&(i.envMap.mapping=ar,i.envMap.colorSpace=bt);break;case"SpecularColor":i.specularMap=r.getTexture(t,a.ID),i.specularMap!==void 0&&(i.specularMap.colorSpace=bt);break;case"TransparentColor":case"TransparencyFactor":i.alphaMap=r.getTexture(t,a.ID),i.transparent=!0;break;default:console.warn("THREE.FBXLoader: %s map is not supported in three.js, skipping texture.",o);break}}),i}getTexture(e,t){return"LayeredTexture"in it.Objects&&t in it.Objects.LayeredTexture&&(console.warn("THREE.FBXLoader: layered textures are not supported in three.js. Discarding all but first layer."),t=Xt.get(t).children[0].ID),e.get(t)}parseDeformers(){let e={},t={};if("Deformer"in it.Objects){let n=it.Objects.Deformer;for(let i in n){let r=n[i],a=Xt.get(parseInt(i));if(r.attrType==="Skin"){let o=this.parseSkeleton(a,n);o.ID=i,a.parents.length>1&&console.warn("THREE.FBXLoader: skeleton attached to more than one geometry is not supported."),o.geometryID=a.parents[0].ID,e[i]=o}else if(r.attrType==="BlendShape"){let o={id:i};o.rawTargets=this.parseMorphTargets(a,n),o.id=i,a.parents.length>1&&console.warn("THREE.FBXLoader: morph target attached to more than one geometry is not supported."),t[i]=o}}}return{skeletons:e,morphTargets:t}}parseSkeleton(e,t){let n=[];return e.children.forEach(function(i){let r=t[i.ID];if(r.attrType!=="Cluster")return;let a={ID:i.ID,indices:[],weights:[],transformLink:new He().fromArray(r.TransformLink.a)};"Indexes"in r&&(a.indices=r.Indexes.a,a.weights=r.Weights.a),n.push(a)}),{rawBones:n,bones:[]}}parseMorphTargets(e,t){let n=[];for(let i=0;i<e.children.length;i++){let r=e.children[i],a=t[r.ID],o={name:a.attrName,initialWeight:a.DeformPercent,id:a.id,fullWeights:a.FullWeights.a};if(a.attrType!=="BlendShapeChannel")return;o.geoID=Xt.get(parseInt(r.ID)).children.filter(function(l){return l.relationship===void 0})[0].ID,n.push(o)}return n}parseScene(e,t,n){hn=new Fe;let i=this.parseModels(e.skeletons,t,n),r=it.Objects.Model,a=this;i.forEach(function(h){let f=r[h.ID];a.setLookAtProperties(h,f),Xt.get(h.ID).parents.forEach(function(m){let y=i.get(m.ID);y!==void 0&&y.add(h)}),h.parent===null&&hn.add(h)}),this.addGlobalSceneSettings(),hn.traverse(function(h){if(h.userData.transformData){h.parent&&(h.userData.transformData.parentMatrix=h.parent.matrix,h.userData.transformData.parentMatrixWorld=h.parent.matrixWorld);let f=Uf(h.userData.transformData);h.applyMatrix4(f),h.updateWorldMatrix()}});let o=this.parsePoseNodes(),l=new Set;for(let h in e.skeletons)e.skeletons[h].rawBones.forEach(function(f,d){let m=e.skeletons[h].bones[d];m&&l.add(m.ID)});let c=new He;hn.traverse(function(h){if(h.isBone&&h.ID!==void 0&&!l.has(h.ID)){let f=o[h.ID];f!==void 0&&(h.parent?(c.copy(h.parent.matrixWorld).invert(),c.multiply(f)):c.copy(f),c.decompose(h.position,h.quaternion,h.scale),h.updateMatrix(),h.matrixWorld.copy(f))}}),this.bindSkeleton(e.skeletons,t,i);let u=new gh().parse();hn.children.length===1&&hn.children[0].isGroup&&(hn.children[0].animations=u,hn=hn.children[0]),hn.animations=u,"GlobalSettings"in it&&"UpAxis"in it.GlobalSettings&&it.GlobalSettings.UpAxis.value===2&&(console.warn("THREE.FBXLoader: You are loading an asset with a Z-UP coordinate system. The loader just rotates the asset to transform it into Y-UP. The vertex data are not converted."),hn.rotation.set(-Math.PI/2,0,0))}parseModels(e,t,n){let i=new Map,r=it.Objects.Model;for(let a in r){let o=parseInt(a),l=r[a],c=Xt.get(o),u=this.buildSkeleton(c,e,o,l.attrName);if(!u){switch(l.attrType){case"Camera":u=this.createCamera(c);break;case"Light":u=this.createLight(c);break;case"Mesh":u=this.createMesh(c,t,n);break;case"NurbsCurve":u=this.createCurve(c,t);break;case"LimbNode":case"Root":u=new vs;break;default:u=new Fe;break}u.name=l.attrName?vt.sanitizeNodeName(l.attrName):"",u.userData.originalName=l.attrName,u.ID=o}this.getTransformData(u,l),i.set(o,u)}return i}buildSkeleton(e,t,n,i){let r=null;return e.parents.forEach(function(a){for(let o in t){let l=t[o];l.rawBones.forEach(function(c,u){if(c.ID===a.ID){let h=r;r=new vs,r.matrixWorld.copy(c.transformLink),r.name=i?vt.sanitizeNodeName(i):"",r.userData.originalName=i,r.ID=n,l.bones[u]=r,h!==null&&r.add(h)}})}}),r}createCamera(e){let t,n;if(e.children.forEach(function(i){let r=it.Objects.NodeAttribute[i.ID];r!==void 0&&(n=r)}),n===void 0)t=new Ut;else{let i=0;n.CameraProjectionType!==void 0&&n.CameraProjectionType.value===1&&(i=1);let r=1;n.NearPlane!==void 0&&(r=n.NearPlane.value/1e3);let a=1e3;n.FarPlane!==void 0&&(a=n.FarPlane.value/1e3);let o=window.innerWidth,l=window.innerHeight;n.AspectWidth!==void 0&&n.AspectHeight!==void 0&&(o=n.AspectWidth.value,l=n.AspectHeight.value);let c=o/l,u=45;n.FieldOfView!==void 0&&(u=n.FieldOfView.value);let h=n.FocalLength?n.FocalLength.value:null;switch(i){case 0:t=new Yt(u,c,r,a),h!==null&&t.setFocalLength(h);break;case 1:console.warn("THREE.FBXLoader: Orthographic cameras not supported yet."),t=new Ut;break;default:console.warn("THREE.FBXLoader: Unknown camera type "+i+"."),t=new Ut;break}}return t}createLight(e){let t,n;if(e.children.forEach(function(i){let r=it.Objects.NodeAttribute[i.ID];r!==void 0&&(n=r)}),n===void 0)t=new Ut;else{let i;n.LightType===void 0?i=0:i=n.LightType.value;let r=16777215;n.Color!==void 0&&(r=et.colorSpaceToWorking(new Ve().fromArray(n.Color.value),bt));let a=n.Intensity===void 0?1:n.Intensity.value/100;n.CastLightOnObject!==void 0&&n.CastLightOnObject.value===0&&(a=0);let o=0;n.FarAttenuationEnd!==void 0&&(n.EnableFarAttenuation!==void 0&&n.EnableFarAttenuation.value===0?o=0:o=n.FarAttenuationEnd.value);let l=1;switch(i){case 0:t=new Jt(r,a,o,l);break;case 1:t=new Yi(r,a);break;case 2:let c=Math.PI/3,u=0;n.OuterAngle!==void 0?(c=cn.degToRad(n.OuterAngle.value),n.InnerAngle!==void 0&&(u=1-n.InnerAngle.value/n.OuterAngle.value,u=Math.max(0,u))):n.InnerAngle!==void 0&&(c=cn.degToRad(n.InnerAngle.value)),t=new ia(r,a,o,c,u,l);break;default:console.warn("THREE.FBXLoader: Unknown light type "+n.LightType.value+", defaulting to a PointLight."),t=new Jt(r,a);break}n.CastShadows!==void 0&&n.CastShadows.value===1&&(t.castShadow=!0)}return t}createMesh(e,t,n){let i,r=null,a=null,o=[];if(e.children.forEach(function(l){t.has(l.ID)&&(r=t.get(l.ID)),n.has(l.ID)&&o.push(n.get(l.ID))}),o.length>1?a=o:o.length>0?a=o[0]:(a=new Vi({name:qn.DEFAULT_MATERIAL_NAME,color:13421772}),o.push(a)),"color"in r.attributes&&o.forEach(function(l){l.vertexColors=!0}),r.groups.length>0){let l=!1;for(let c=0,u=r.groups.length;c<u;c++){let h=r.groups[c];(h.materialIndex<0||h.materialIndex>=o.length)&&(h.materialIndex=o.length,l=!0)}if(l){let c=new Vi;o.push(c)}}return r.FBX_Deformer?(i=new Ur(r,a),i.normalizeSkinWeights()):i=new pt(r,a),i}createCurve(e,t){let n=e.children.reduce(function(r,a){return t.has(a.ID)&&(r=t.get(a.ID)),r},null),i=new js({name:qn.DEFAULT_MATERIAL_NAME,color:3342591,linewidth:1});return new zr(n,i)}getTransformData(e,t){let n={};"InheritType"in t&&(n.inheritType=parseInt(t.InheritType.value)),"RotationOrder"in t?n.eulerOrder=Ta(t.RotationOrder.value):n.eulerOrder=Ta(0),"Lcl_Translation"in t&&(n.translation=t.Lcl_Translation.value),"PreRotation"in t&&(n.preRotation=t.PreRotation.value),"Lcl_Rotation"in t&&(n.rotation=t.Lcl_Rotation.value),"PostRotation"in t&&(n.postRotation=t.PostRotation.value),"Lcl_Scaling"in t&&(n.scale=t.Lcl_Scaling.value),"ScalingOffset"in t&&(n.scalingOffset=t.ScalingOffset.value),"ScalingPivot"in t&&(n.scalingPivot=t.ScalingPivot.value),"RotationOffset"in t&&(n.rotationOffset=t.RotationOffset.value),"RotationPivot"in t&&(n.rotationPivot=t.RotationPivot.value),e.userData.transformData=n}setLookAtProperties(e,t){"LookAtProperty"in t&&Xt.get(e.ID).children.forEach(function(i){if(i.relationship==="LookAtProperty"){let r=it.Objects.Model[i.ID];if("Lcl_Translation"in r){let a=r.Lcl_Translation.value;e.target!==void 0?(e.target.position.fromArray(a),hn.add(e.target)):e.lookAt(new N().fromArray(a))}}})}bindSkeleton(e,t,n){for(let i in e){let r=e[i],a=[];for(let l=0,c=r.bones.length;l<c;l++){let u=new He;r.bones[l]&&r.rawBones[l]&&u.copy(r.rawBones[l].transformLink).invert(),a.push(u)}Xt.get(parseInt(r.ID)).parents.forEach(function(l){if(t.has(l.ID)){let c=l.ID;Xt.get(c).parents.forEach(function(h){if(n.has(h.ID)){let f=n.get(h.ID);f.updateMatrixWorld(!0),f.bind(new Br(r.bones,a),f.matrixWorld)}})}})}}parsePoseNodes(){let e={};if("Pose"in it.Objects){let t=it.Objects.Pose;for(let n in t)if(t[n].attrType==="BindPose"&&t[n].NbPoseNodes>0){let i=t[n].PoseNode;Array.isArray(i)?i.forEach(function(r){e[r.Node]=new He().fromArray(r.Matrix.a)}):e[i.Node]=new He().fromArray(i.Matrix.a)}}return e}addGlobalSceneSettings(){if("GlobalSettings"in it){if("AmbientColor"in it.GlobalSettings){let e=it.GlobalSettings.AmbientColor.value,t=e[0],n=e[1],i=e[2];if(t!==0||n!==0||i!==0){let r=new Ve().setRGB(t,n,i,bt);hn.add(new sa(r,1))}}"UnitScaleFactor"in it.GlobalSettings&&(hn.userData.unitScaleFactor=it.GlobalSettings.UnitScaleFactor.value)}}},mh=class{constructor(){this.negativeMaterialIndices=!1}parse(e){let t=new Map;if("Geometry"in it.Objects){let n=it.Objects.Geometry;for(let i in n){let r=Xt.get(parseInt(i)),a=this.parseGeometry(r,n[i],e);t.set(parseInt(i),a)}}return this.negativeMaterialIndices===!0&&console.warn("THREE.FBXLoader: The FBX file contains invalid (negative) material indices. The asset might not render as expected."),t}parseGeometry(e,t,n){switch(t.attrType){case"Mesh":return this.parseMeshGeometry(e,t,n);case"NurbsCurve":return this.parseNurbsGeometry(t)}}parseMeshGeometry(e,t,n){let i=n.skeletons,r=[],a=e.parents.map(function(h){return it.Objects.Model[h.ID]});if(a.length===0)return;let o=e.children.reduce(function(h,f){return i[f.ID]!==void 0&&(h=i[f.ID]),h},null);e.children.forEach(function(h){n.morphTargets[h.ID]!==void 0&&r.push(n.morphTargets[h.ID])});let l=a[0],c={};"RotationOrder"in l&&(c.eulerOrder=Ta(l.RotationOrder.value)),"InheritType"in l&&(c.inheritType=parseInt(l.InheritType.value)),"GeometricTranslation"in l&&(c.translation=l.GeometricTranslation.value),"GeometricRotation"in l&&(c.rotation=l.GeometricRotation.value),"GeometricScaling"in l&&(c.scale=l.GeometricScaling.value);let u=Uf(c);return this.genGeometry(t,o,r,u)}genGeometry(e,t,n,i){let r=new Wt;e.attrName&&(r.name=e.attrName);let a=this.parseGeoNode(e,t),o=this.genBuffers(a),l=new ft(o.vertex,3);if(l.applyMatrix4(i),r.setAttribute("position",l),o.colors.length>0&&r.setAttribute("color",new ft(o.colors,3)),t&&(r.setAttribute("skinIndex",new xs(o.weightsIndices,4)),r.setAttribute("skinWeight",new ft(o.vertexWeights,4)),r.FBX_Deformer=t),o.normal.length>0){let c=new Qe().getNormalMatrix(i),u=new ft(o.normal,3);u.applyNormalMatrix(c),r.setAttribute("normal",u)}if(o.uvs.forEach(function(c,u){let h=u===0?"uv":`uv${u}`;r.setAttribute(h,new ft(o.uvs[u],2))}),a.material&&a.material.mappingType!=="AllSame"){let c=o.materialIndex[0],u=0;if(o.materialIndex.forEach(function(h,f){h!==c&&(r.addGroup(u,f-u,c),c=h,u=f)}),r.groups.length>0){let h=r.groups[r.groups.length-1],f=h.start+h.count;f!==o.materialIndex.length&&r.addGroup(f,o.materialIndex.length-f,c)}r.groups.length===0&&r.addGroup(0,o.materialIndex.length,o.materialIndex[0])}return this.addMorphTargets(r,e,n,i),r}parseGeoNode(e,t){let n={};if(n.vertexPositions=e.Vertices!==void 0?e.Vertices.a:[],n.vertexIndices=e.PolygonVertexIndex!==void 0?e.PolygonVertexIndex.a:[],e.LayerElementColor&&e.LayerElementColor[0].Colors&&(n.color=this.parseVertexColors(e.LayerElementColor[0])),e.LayerElementMaterial&&(n.material=this.parseMaterialIndices(e.LayerElementMaterial[0])),e.LayerElementNormal&&(n.normal=this.parseNormals(e.LayerElementNormal[0])),e.LayerElementUV){n.uv=[];let i=0;for(;e.LayerElementUV[i];)e.LayerElementUV[i].UV&&n.uv.push(this.parseUVs(e.LayerElementUV[i])),i++}return n.weightTable={},t!==null&&(n.skeleton=t,t.rawBones.forEach(function(i,r){i.indices.forEach(function(a,o){n.weightTable[a]===void 0&&(n.weightTable[a]=[]),n.weightTable[a].push({id:r,weight:i.weights[o]})})})),n}genBuffers(e){let t={vertex:[],normal:[],colors:[],uvs:[],materialIndex:[],vertexWeights:[],weightsIndices:[]},n=0,i=0,r=!1,a=[],o=[],l=[],c=[],u=[],h=[],f=this;return e.vertexIndices.forEach(function(d,m){let y,g=!1;d<0&&(d=d^-1,g=!0);let p=[],E=[];if(a.push(d*3,d*3+1,d*3+2),e.color){let S=Cl(m,n,d,e.color);l.push(S[0],S[1],S[2])}if(e.skeleton){if(e.weightTable[d]!==void 0&&e.weightTable[d].forEach(function(S){E.push(S.weight),p.push(S.id)}),E.length>4){r||(console.warn("THREE.FBXLoader: Vertex has more than 4 skinning weights assigned to vertex. Deleting additional weights."),r=!0);let S=[0,0,0,0],_=[0,0,0,0];E.forEach(function(C,b){let I=C,v=p[b];_.forEach(function(T,P,L){if(I>T){L[P]=I,I=T;let F=S[P];S[P]=v,v=F}})}),p=S,E=_}for(;E.length<4;)E.push(0),p.push(0);for(let S=0;S<4;++S)u.push(E[S]),h.push(p[S])}if(e.normal){let S=Cl(m,n,d,e.normal);o.push(S[0],S[1],S[2])}e.material&&e.material.mappingType!=="AllSame"&&(y=Cl(m,n,d,e.material)[0],y<0&&(f.negativeMaterialIndices=!0,y=0)),e.uv&&e.uv.forEach(function(S,_){let C=Cl(m,n,d,S);c[_]===void 0&&(c[_]=[]),c[_].push(C[0]),c[_].push(C[1])}),i++,g&&(f.genFace(t,e,a,y,o,l,c,u,h,i),n++,i=0,a=[],o=[],l=[],c=[],u=[],h=[])}),t}getNormalNewell(e){let t=new N(0,0,0);for(let n=0;n<e.length;n++){let i=e[n],r=e[(n+1)%e.length];t.x+=(i.y-r.y)*(i.z+r.z),t.y+=(i.z-r.z)*(i.x+r.x),t.z+=(i.x-r.x)*(i.y+r.y)}return t.normalize(),t}getNormalTangentAndBitangent(e){let t=this.getNormalNewell(e),i=(Math.abs(t.z)>.5?new N(0,1,0):new N(0,0,1)).cross(t).normalize(),r=t.clone().cross(i).normalize();return{normal:t,tangent:i,bitangent:r}}flattenVertex(e,t,n){return new Ke(e.dot(t),e.dot(n))}genFace(e,t,n,i,r,a,o,l,c,u){let h;if(u>3){let f=[],d=t.baseVertexPositions||t.vertexPositions;for(let p=0;p<n.length;p+=3)f.push(new N(d[n[p]],d[n[p+1]],d[n[p+2]]));let{tangent:m,bitangent:y}=this.getNormalTangentAndBitangent(f),g=[];for(let p of f)g.push(this.flattenVertex(p,m,y));h=qr.triangulateShape(g,[])}else h=[[0,1,2]];for(let[f,d,m]of h)e.vertex.push(t.vertexPositions[n[f*3]]),e.vertex.push(t.vertexPositions[n[f*3+1]]),e.vertex.push(t.vertexPositions[n[f*3+2]]),e.vertex.push(t.vertexPositions[n[d*3]]),e.vertex.push(t.vertexPositions[n[d*3+1]]),e.vertex.push(t.vertexPositions[n[d*3+2]]),e.vertex.push(t.vertexPositions[n[m*3]]),e.vertex.push(t.vertexPositions[n[m*3+1]]),e.vertex.push(t.vertexPositions[n[m*3+2]]),t.skeleton&&(e.vertexWeights.push(l[f*4]),e.vertexWeights.push(l[f*4+1]),e.vertexWeights.push(l[f*4+2]),e.vertexWeights.push(l[f*4+3]),e.vertexWeights.push(l[d*4]),e.vertexWeights.push(l[d*4+1]),e.vertexWeights.push(l[d*4+2]),e.vertexWeights.push(l[d*4+3]),e.vertexWeights.push(l[m*4]),e.vertexWeights.push(l[m*4+1]),e.vertexWeights.push(l[m*4+2]),e.vertexWeights.push(l[m*4+3]),e.weightsIndices.push(c[f*4]),e.weightsIndices.push(c[f*4+1]),e.weightsIndices.push(c[f*4+2]),e.weightsIndices.push(c[f*4+3]),e.weightsIndices.push(c[d*4]),e.weightsIndices.push(c[d*4+1]),e.weightsIndices.push(c[d*4+2]),e.weightsIndices.push(c[d*4+3]),e.weightsIndices.push(c[m*4]),e.weightsIndices.push(c[m*4+1]),e.weightsIndices.push(c[m*4+2]),e.weightsIndices.push(c[m*4+3])),t.color&&(e.colors.push(a[f*3]),e.colors.push(a[f*3+1]),e.colors.push(a[f*3+2]),e.colors.push(a[d*3]),e.colors.push(a[d*3+1]),e.colors.push(a[d*3+2]),e.colors.push(a[m*3]),e.colors.push(a[m*3+1]),e.colors.push(a[m*3+2])),t.material&&t.material.mappingType!=="AllSame"&&(e.materialIndex.push(i),e.materialIndex.push(i),e.materialIndex.push(i)),t.normal&&(e.normal.push(r[f*3]),e.normal.push(r[f*3+1]),e.normal.push(r[f*3+2]),e.normal.push(r[d*3]),e.normal.push(r[d*3+1]),e.normal.push(r[d*3+2]),e.normal.push(r[m*3]),e.normal.push(r[m*3+1]),e.normal.push(r[m*3+2])),t.uv&&t.uv.forEach(function(y,g){e.uvs[g]===void 0&&(e.uvs[g]=[]),e.uvs[g].push(o[g][f*2]),e.uvs[g].push(o[g][f*2+1]),e.uvs[g].push(o[g][d*2]),e.uvs[g].push(o[g][d*2+1]),e.uvs[g].push(o[g][m*2]),e.uvs[g].push(o[g][m*2+1])})}addMorphTargets(e,t,n,i){if(n.length===0)return;e.morphTargetsRelative=!0,e.morphAttributes.position=[];let r=i.clone().setPosition(0,0,0),a=this;n.forEach(function(o){o.rawTargets.forEach(function(l){let c=it.Objects.Geometry[l.geoID];c!==void 0&&a.genMorphGeometry(e,t,c,r,l.name)})})}genMorphGeometry(e,t,n,i,r){let a=t.Vertices!==void 0?t.Vertices.a:[],o=t.PolygonVertexIndex!==void 0?t.PolygonVertexIndex.a:[],l=n.Vertices!==void 0?n.Vertices.a:[],c=n.Indexes!==void 0?n.Indexes.a:[],u=e.attributes.position.count*3,h=new Float32Array(u);for(let y=0;y<c.length;y++){let g=c[y]*3;h[g]=l[y*3],h[g+1]=l[y*3+1],h[g+2]=l[y*3+2]}let f={vertexIndices:o,vertexPositions:h,baseVertexPositions:a},d=this.genBuffers(f),m=new ft(d.vertex,3);m.name=r||n.attrName,m.applyMatrix4(i),e.morphAttributes.position.push(m)}parseNormals(e){let t=e.MappingInformationType,n=e.ReferenceInformationType,i=e.Normals.a,r=[];return n==="IndexToDirect"&&("NormalIndex"in e?r=e.NormalIndex.a:"NormalsIndex"in e&&(r=e.NormalsIndex.a)),{dataSize:3,buffer:i,indices:r,mappingType:t,referenceType:n}}parseUVs(e){let t=e.MappingInformationType,n=e.ReferenceInformationType,i=e.UV.a,r=[];return n==="IndexToDirect"&&(r=e.UVIndex.a),{dataSize:2,buffer:i,indices:r,mappingType:t,referenceType:n}}parseVertexColors(e){let t=e.MappingInformationType,n=e.ReferenceInformationType,i=e.Colors.a,r=[];n==="IndexToDirect"&&(r=e.ColorIndex.a);for(let a=0,o=new Ve;a<i.length;a+=4)o.fromArray(i,a),et.colorSpaceToWorking(o,bt),o.toArray(i,a);return{dataSize:4,buffer:i,indices:r,mappingType:t,referenceType:n}}parseMaterialIndices(e){let t=e.MappingInformationType,n=e.ReferenceInformationType;if(t==="NoMappingInformation")return{dataSize:1,buffer:[0],indices:[0],mappingType:"AllSame",referenceType:n};let i=e.Materials.a,r=[];for(let a=0;a<i.length;++a)r.push(a);return{dataSize:1,buffer:i,indices:r,mappingType:t,referenceType:n}}parseNurbsGeometry(e){let t=parseInt(e.Order);if(isNaN(t))return console.error("THREE.FBXLoader: Invalid Order %s given for geometry ID: %s",e.Order,e.id),new Wt;let n=t-1,i=e.KnotVector.a,r=[],a=e.Points.a;for(let h=0,f=a.length;h<f;h+=4)r.push(new dt().fromArray(a,h));let o,l;if(e.Form==="Closed")r.push(r[0]);else if(e.Form==="Periodic"){o=n,l=i.length-1-o;for(let h=0;h<n;++h)r.push(r[h])}let u=new Al(n,i,r,o,l).getPoints(r.length*12);return new Wt().setFromPoints(u)}},gh=class{parse(){let e=[],t=this.parseClips();if(t!==void 0)for(let n in t){let i=t[n],r=this.addClip(i);e.push(r)}return e}parseClips(){if(it.Objects.AnimationCurve===void 0)return;let e=this.parseAnimationCurveNodes();this.parseAnimationCurves(e);let t=this.parseAnimationLayers(e);return this.parseAnimStacks(t)}parseAnimationCurveNodes(){let e=it.Objects.AnimationCurveNode,t=new Map;for(let n in e){let i=e[n];if(i.attrName.match(/S|R|T|DeformPercent/)!==null){let r={id:i.id,attr:i.attrName,curves:{}};t.set(r.id,r)}}return t}parseAnimationCurves(e){let t=it.Objects.AnimationCurve;for(let n in t){let i={id:t[n].id,times:t[n].KeyTime.a.map(Bv),values:t[n].KeyValueFloat.a},r=Xt.get(i.id);if(r!==void 0){let a=r.parents[0].ID,o=r.parents[0].relationship;o.match(/X/)?e.get(a).curves.x=i:o.match(/Y/)?e.get(a).curves.y=i:o.match(/Z/)?e.get(a).curves.z=i:o.match(/DeformPercent/)&&e.has(a)&&(e.get(a).curves.morph=i)}}}parseAnimationLayers(e){let t=it.Objects.AnimationLayer,n=new Map;for(let i in t){let r=[],a=Xt.get(parseInt(i));a!==void 0&&(a.children.forEach(function(l,c){if(e.has(l.ID)){let u=e.get(l.ID);if(u.curves.x!==void 0||u.curves.y!==void 0||u.curves.z!==void 0){if(r[c]===void 0){let h=Xt.get(l.ID).parents.filter(function(d){return d.relationship!==void 0});if(h.length===0)return;let f=h[0].ID;if(f!==void 0){let d=it.Objects.Model[f.toString()];if(d===void 0){console.warn("THREE.FBXLoader: Encountered a unused curve.",l);return}let m={modelName:d.attrName?vt.sanitizeNodeName(d.attrName):"",ID:d.id,initialPosition:[0,0,0],initialRotation:[0,0,0],initialScale:[1,1,1]};hn.traverse(function(y){y.ID===d.id&&(m.transform=y.matrix,y.userData.transformData&&(m.eulerOrder=y.userData.transformData.eulerOrder,y.userData.transformData.rotation&&(m.initialRotation=y.userData.transformData.rotation)))}),m.transform||(m.transform=new He),"PreRotation"in d&&(m.preRotation=d.PreRotation.value),"PostRotation"in d&&(m.postRotation=d.PostRotation.value),r[c]=m}}r[c]&&(r[c][u.attr]=u)}else if(u.curves.morph!==void 0){if(r[c]===void 0){let h=Xt.get(l.ID).parents.filter(function(E){return E.relationship!==void 0});if(h.length===0)return;let f=h[0].ID,d=Xt.get(f).parents[0].ID,m=Xt.get(d).parents[0].ID,y=Xt.get(m).parents[0].ID,g=it.Objects.Model[y],p={modelName:g.attrName?vt.sanitizeNodeName(g.attrName):"",morphName:it.Objects.Deformer[f].attrName};r[c]=p}r[c][u.attr]=u}}}),n.set(parseInt(i),r))}return n}parseAnimStacks(e){let t=it.Objects.AnimationStack,n={};for(let i in t){let r=Xt.get(parseInt(i)).children;r.length>1&&console.warn("THREE.FBXLoader: Encountered an animation stack with multiple layers, this is currently not supported. Ignoring subsequent layers.");let a=e.get(r[0].ID);n[i]={name:t[i].attrName,layer:a}}return n}addClip(e){let t=[],n=this;return e.layer.forEach(function(i){t=t.concat(n.generateTracks(i))}),new bi(e.name,-1,t)}generateTracks(e){let t=[],n=new N,i=new N;if(e.transform&&e.transform.decompose(n,new zt,i),n=n.toArray(),i=i.toArray(),e.T!==void 0&&Object.keys(e.T.curves).length>0){let r=this.generateVectorTrack(e.modelName,e.T.curves,n,"position");r!==void 0&&t.push(r)}if(e.R!==void 0&&Object.keys(e.R.curves).length>0){let r=this.generateRotationTrack(e.modelName,e.R.curves,e.preRotation,e.postRotation,e.eulerOrder,e.initialRotation);r!==void 0&&t.push(r)}if(e.S!==void 0&&Object.keys(e.S.curves).length>0){let r=this.generateVectorTrack(e.modelName,e.S.curves,i,"scale");r!==void 0&&t.push(r)}if(e.DeformPercent!==void 0){let r=this.generateMorphTrack(e);r!==void 0&&t.push(r)}return t}generateVectorTrack(e,t,n,i){let r=this.getTimesForAllAxes(t),a=this.getKeyframeTrackValues(r,t,n);return new Ms(e+"."+i,r,a)}generateRotationTrack(e,t,n,i,r,a){let o,l;if(t.x!==void 0||t.y!==void 0||t.z!==void 0){let d=this.getTimesForAllAxes(t);if(d.length>0){let m=a||[0,0,0],y=this.synchronizeCurve(t.x,d,m[0]),g=this.synchronizeCurve(t.y,d,m[1]),p=this.synchronizeCurve(t.z,d,m[2]),E=this.interpolateRotations(y,g,p,r);o=E[0],l=E[1]}}let c=Ta(0);n!==void 0&&(n=n.map(cn.degToRad),n.push(c),n=new $t().fromArray(n),n=new zt().setFromEuler(n)),i!==void 0&&(i=i.map(cn.degToRad),i.push(c),i=new $t().fromArray(i),i=new zt().setFromEuler(i).invert());let u=new zt,h=new $t,f=[];if(!(!l||!o)){for(let d=0;d<l.length;d+=3)h.set(l[d],l[d+1],l[d+2],r),u.setFromEuler(h),n!==void 0&&u.premultiply(n),i!==void 0&&u.multiply(i),d>2&&new zt().fromArray(f,(d-3)/3*4).dot(u)<0&&u.set(-u.x,-u.y,-u.z,-u.w),u.toArray(f,d/3*4);return new Xi(e+".quaternion",o,f)}}generateMorphTrack(e){let t=e.DeformPercent.curves.morph,n=t.values.map(function(r){return r/100}),i=hn.getObjectByName(e.modelName).morphTargetDictionary[e.morphName];return new Wi(e.modelName+".morphTargetInfluences["+i+"]",t.times,n)}getTimesForAllAxes(e){let t=[];if(e.x!==void 0&&(t=t.concat(e.x.times)),e.y!==void 0&&(t=t.concat(e.y.times)),e.z!==void 0&&(t=t.concat(e.z.times)),t=t.sort(function(n,i){return n-i}),t.length>1){let n=1,i=t[0];for(let r=1;r<t.length;r++){let a=t[r];a!==i&&(t[n]=a,i=a,n++)}t=t.slice(0,n)}return t}getKeyframeTrackValues(e,t,n){let i=n,r=[],a=-1,o=-1,l=-1;return e.forEach(function(c){if(t.x&&(a=t.x.times.indexOf(c)),t.y&&(o=t.y.times.indexOf(c)),t.z&&(l=t.z.times.indexOf(c)),a!==-1){let u=t.x.values[a];r.push(u),i[0]=u}else r.push(i[0]);if(o!==-1){let u=t.y.values[o];r.push(u),i[1]=u}else r.push(i[1]);if(l!==-1){let u=t.z.values[l];r.push(u),i[2]=u}else r.push(i[2])}),r}synchronizeCurve(e,t,n){if(e===void 0)return{times:t,values:t.map(()=>n)};if(e.times.length===t.length)return e;let i=[];for(let r=0;r<t.length;r++)i.push(this.sampleCurveValue(e,t[r],n));return{times:t,values:i}}sampleCurveValue(e,t,n){let i=e.times,r=e.values;if(t<=i[0])return r[0];if(t>=i[i.length-1])return r[r.length-1];for(let a=0;a<i.length-1;a++)if(t>=i[a]&&t<=i[a+1]){if(i[a]===t)return r[a];let o=(t-i[a])/(i[a+1]-i[a]);return r[a]*(1-o)+r[a+1]*o}return n}interpolateRotations(e,t,n,i){let r=[],a=[];r.push(e.times[0]),a.push(cn.degToRad(e.values[0])),a.push(cn.degToRad(t.values[0])),a.push(cn.degToRad(n.values[0]));for(let o=1;o<e.values.length;o++){let l=[e.values[o-1],t.values[o-1],n.values[o-1]];if(isNaN(l[0])||isNaN(l[1])||isNaN(l[2]))continue;let c=l.map(cn.degToRad),u=[e.values[o],t.values[o],n.values[o]];if(isNaN(u[0])||isNaN(u[1])||isNaN(u[2]))continue;let h=u.map(cn.degToRad),f=[u[0]-l[0],u[1]-l[1],u[2]-l[2]],d=[Math.abs(f[0]),Math.abs(f[1]),Math.abs(f[2])];if(d[0]>=180||d[1]>=180||d[2]>=180){let y=Math.max(...d)/180,g=new $t(...c,i),p=new $t(...h,i),E=new zt().setFromEuler(g),S=new zt().setFromEuler(p);E.dot(S)<0&&S.set(-S.x,-S.y,-S.z,-S.w);let _=e.times[o-1],C=e.times[o]-_,b=new zt,I=new $t;for(let v=0;v<1;v+=1/y)b.copy(E.clone().slerp(S.clone(),v)),r.push(_+v*C),I.setFromQuaternion(b,i),a.push(I.x),a.push(I.y),a.push(I.z)}else r.push(e.times[o]),a.push(cn.degToRad(e.values[o])),a.push(cn.degToRad(t.values[o])),a.push(cn.degToRad(n.values[o]))}return[r,a]}},xh=class{getPrevNode(){return this.nodeStack[this.currentIndent-2]}getCurrentNode(){return this.nodeStack[this.currentIndent-1]}getCurrentProp(){return this.currentProp}pushStack(e){this.nodeStack.push(e),this.currentIndent+=1}popStack(){this.nodeStack.pop(),this.currentIndent-=1}setCurrentProp(e,t){this.currentProp=e,this.currentPropName=t}parse(e){this.currentIndent=0,this.allNodes=new Pl,this.nodeStack=[],this.currentProp=[],this.currentPropName="";let t=this,n=e.split(/[\r\n]+/);return n.forEach(function(i,r){let a=i.match(/^[\s\t]*;/),o=i.match(/^[\s\t]*$/);if(a||o)return;let l=i.match("^\\t{"+t.currentIndent+"}(\\w+):(.*){",""),c=i.match("^\\t{"+t.currentIndent+"}(\\w+):[\\s\\t\\r\\n](.*)"),u=i.match("^\\t{"+(t.currentIndent-1)+"}}");l?t.parseNodeBegin(i,l):c?t.parseNodeProperty(i,c,n[++r]):u?t.popStack():i.match(/^[^\s\t}]/)&&t.parseNodePropertyContinued(i)}),this.allNodes}parseNodeBegin(e,t){let n=t[1].trim().replace(/^"/,"").replace(/"$/,""),i=t[2].split(",").map(function(l){return l.trim().replace(/^"/,"").replace(/"$/,"")}),r={name:n},a=this.parseNodeAttr(i),o=this.getCurrentNode();this.currentIndent===0?this.allNodes.add(n,r):n in o?(n==="PoseNode"?o.PoseNode.push(r):o[n].id!==void 0&&(o[n]={},o[n][o[n].id]=o[n]),a.id!==""&&(o[n][a.id]=r)):typeof a.id=="number"?(o[n]={},o[n][a.id]=r):n!=="Properties70"&&(n==="PoseNode"?o[n]=[r]:o[n]=r),typeof a.id=="number"&&(r.id=a.id),a.name!==""&&(r.attrName=a.name),a.type!==""&&(r.attrType=a.type),this.pushStack(r)}parseNodeAttr(e){let t=e[0];e[0]!==""&&(t=parseInt(e[0]),isNaN(t)&&(t=e[0]));let n="",i="";return e.length>1&&(n=e[1].replace(/^(\w+)::/,""),i=e[2]),{id:t,name:n,type:i}}parseNodeProperty(e,t,n){let i=t[1].replace(/^"/,"").replace(/"$/,"").trim(),r=t[2].replace(/^"/,"").replace(/"$/,"").trim();i==="Content"&&r===","&&(r=n.replace(/"/g,"").replace(/,$/,"").trim());let a=this.getCurrentNode();if(a.name==="Properties70"){this.parseNodeSpecialProperty(e,i,r);return}if(i==="C"){let l=r.split(",").slice(1),c=parseInt(l[0]),u=parseInt(l[1]),h=r.split(",").slice(3);h=h.map(function(f){return f.trim().replace(/^"/,"")}),i="connections",r=[c,u],kv(r,h),a[i]===void 0&&(a[i]=[])}i==="Node"&&(a.id=r),i in a&&Array.isArray(a[i])?a[i].push(r):i!=="a"?a[i]=r:a.a=r,this.setCurrentProp(a,i),i==="a"&&r.slice(-1)!==","&&(a.a=dh(r))}parseNodePropertyContinued(e){let t=this.getCurrentNode();t.a+=e,e.slice(-1)!==","&&(t.a=dh(t.a))}parseNodeSpecialProperty(e,t,n){let i=n.split('",').map(function(u){return u.trim().replace(/^\"/,"").replace(/\s/,"_")}),r=i[0],a=i[1],o=i[2],l=i[3],c=i[4];switch(a){case"int":case"enum":case"bool":case"ULongLong":case"double":case"Number":case"FieldOfView":c=parseFloat(c);break;case"Color":case"ColorRGB":case"Vector3D":case"Lcl_Translation":case"Lcl_Rotation":case"Lcl_Scaling":c=dh(c);break}this.getPrevNode()[r]={type:a,type2:o,flag:l,value:c},this.setCurrentProp(this.getPrevNode(),r)}},vh=class{parse(e){let t=new Il(e);t.skip(23);let n=t.getUint32();if(n<6400)throw new Error("THREE.FBXLoader: FBX version not supported, FileVersion: "+n);let i=new Pl;for(;!this.endOfContent(t);){let r=this.parseNode(t,n);r!==null&&i.add(r.name,r)}return i}endOfContent(e){return e.size()%16===0?(e.getOffset()+160+16&-16)>=e.size():e.getOffset()+160+16>=e.size()}parseNode(e,t){let n={},i=t>=7500?e.getUint64():e.getUint32(),r=t>=7500?e.getUint64():e.getUint32();t>=7500?e.getUint64():e.getUint32();let a=e.getUint8(),o=e.getString(a);if(i===0)return null;let l=[];for(let f=0;f<r;f++)l.push(this.parseProperty(e));let c=l.length>0?l[0]:"",u=l.length>1?l[1]:"",h=l.length>2?l[2]:"";for(n.singleProperty=r===1&&e.getOffset()===i;i>e.getOffset();){let f=this.parseNode(e,t);f!==null&&this.parseSubNode(o,n,f)}return n.propertyList=l,typeof c=="number"&&(n.id=c),u!==""&&(n.attrName=u),h!==""&&(n.attrType=h),o!==""&&(n.name=o),n}parseSubNode(e,t,n){if(n.singleProperty===!0){let i=n.propertyList[0];Array.isArray(i)?(t[n.name]=n,n.a=i):t[n.name]=i}else if(e==="Connections"&&n.name==="C"){let i=[];n.propertyList.forEach(function(r,a){a!==0&&i.push(r)}),t.connections===void 0&&(t.connections=[]),t.connections.push(i)}else if(n.name==="Properties70")Object.keys(n).forEach(function(r){t[r]=n[r]});else if(e==="Properties70"&&n.name==="P"){let i=n.propertyList[0],r=n.propertyList[1],a=n.propertyList[2],o=n.propertyList[3],l;i.indexOf("Lcl ")===0&&(i=i.replace("Lcl ","Lcl_")),r.indexOf("Lcl ")===0&&(r=r.replace("Lcl ","Lcl_")),r==="Color"||r==="ColorRGB"||r==="Vector"||r==="Vector3D"||r.indexOf("Lcl_")===0?l=[n.propertyList[4],n.propertyList[5],n.propertyList[6]]:l=n.propertyList[4],t[i]={type:r,type2:a,flag:o,value:l}}else t[n.name]===void 0?typeof n.id=="number"?(t[n.name]={},t[n.name][n.id]=n):t[n.name]=n:n.name==="PoseNode"?(Array.isArray(t[n.name])||(t[n.name]=[t[n.name]]),t[n.name].push(n)):t[n.name][n.id]===void 0&&(t[n.name][n.id]=n)}parseProperty(e){let t=e.getString(1),n;switch(t){case"C":return e.getBoolean();case"D":return e.getFloat64();case"F":return e.getFloat32();case"I":return e.getInt32();case"L":return e.getInt64();case"R":return n=e.getUint32(),e.getArrayBuffer(n);case"S":return n=e.getUint32(),e.getString(n);case"Y":return e.getInt16();case"b":case"c":case"d":case"f":case"i":case"l":let i=e.getUint32(),r=e.getUint32(),a=e.getUint32();if(r===0)switch(t){case"b":case"c":return e.getBooleanArray(i);case"d":return e.getFloat64Array(i);case"f":return e.getFloat32Array(i);case"i":return e.getInt32Array(i);case"l":return e.getInt64Array(i)}let o=Pf(new Uint8Array(e.getArrayBuffer(a))),l=new Il(o.buffer);switch(t){case"b":case"c":return l.getBooleanArray(i);case"d":return l.getFloat64Array(i);case"f":return l.getFloat32Array(i);case"i":return l.getInt32Array(i);case"l":return l.getInt64Array(i)}break;default:throw new Error("THREE.FBXLoader: Unknown property type "+t)}}},Il=class{constructor(e,t){this.dv=new DataView(e),this.offset=0,this.littleEndian=t!==void 0?t:!0,this._textDecoder=new TextDecoder}getOffset(){return this.offset}size(){return this.dv.buffer.byteLength}skip(e){this.offset+=e}getBoolean(){return(this.getUint8()&1)===1}getBooleanArray(e){let t=[];for(let n=0;n<e;n++)t.push(this.getBoolean());return t}getUint8(){let e=this.dv.getUint8(this.offset);return this.offset+=1,e}getInt16(){let e=this.dv.getInt16(this.offset,this.littleEndian);return this.offset+=2,e}getInt32(){let e=this.dv.getInt32(this.offset,this.littleEndian);return this.offset+=4,e}getInt32Array(e){let t=[];for(let n=0;n<e;n++)t.push(this.getInt32());return t}getUint32(){let e=this.dv.getUint32(this.offset,this.littleEndian);return this.offset+=4,e}getInt64(){let e,t;return this.littleEndian?(e=this.getUint32(),t=this.getUint32()):(t=this.getUint32(),e=this.getUint32()),t&2147483648?(t=~t&4294967295,e=~e&4294967295,e===4294967295&&(t=t+1&4294967295),e=e+1&4294967295,-(t*4294967296+e)):t*4294967296+e}getInt64Array(e){let t=[];for(let n=0;n<e;n++)t.push(this.getInt64());return t}getUint64(){let e,t;return this.littleEndian?(e=this.getUint32(),t=this.getUint32()):(t=this.getUint32(),e=this.getUint32()),t*4294967296+e}getFloat32(){let e=this.dv.getFloat32(this.offset,this.littleEndian);return this.offset+=4,e}getFloat32Array(e){let t=[];for(let n=0;n<e;n++)t.push(this.getFloat32());return t}getFloat64(){let e=this.dv.getFloat64(this.offset,this.littleEndian);return this.offset+=8,e}getFloat64Array(e){let t=[];for(let n=0;n<e;n++)t.push(this.getFloat64());return t}getArrayBuffer(e){let t=this.dv.buffer.slice(this.offset,this.offset+e);return this.offset+=e,t}getString(e){let t=this.offset,n=new Uint8Array(this.dv.buffer,t,e);this.skip(e);let i=n.indexOf(0);return i>=0&&(n=new Uint8Array(this.dv.buffer,t,i)),this._textDecoder.decode(n)}},Pl=class{add(e,t){this[e]=t}};function Uv(s){let e="Kaydara FBX Binary  \0";return s.byteLength>=e.length&&e===Of(s,0,e.length)}function Ov(s){let e=["K","a","y","d","a","r","a","\\","F","B","X","\\","B","i","n","a","r","y","\\","\\"],t=0;function n(i){let r=s[i-1];return s=s.slice(t+i),t++,r}for(let i=0;i<e.length;++i)if(n(1)===e[i])return!1;return!0}function Ff(s){let e=/FBXVersion: (\d+)/,t=s.match(e);if(t)return parseInt(t[1]);throw new Error("THREE.FBXLoader: Cannot find the version number for the file given.")}function Bv(s){return s/46186158e3}var zv=[];function Cl(s,e,t,n){let i;switch(n.mappingType){case"ByPolygonVertex":i=s;break;case"ByPolygon":i=e;break;case"ByVertice":i=t;break;case"AllSame":i=n.indices[0];break;default:console.warn("THREE.FBXLoader: unknown attribute mapping type "+n.mappingType)}n.referenceType==="IndexToDirect"&&(i=n.indices[i]);let r=i*n.dataSize,a=r+n.dataSize;return Hv(zv,n.buffer,r,a)}var fh=new $t,pr=new N;function Uf(s){let e=new He,t=new He,n=new He,i=new He,r=new He,a=new He,o=new He,l=new He,c=new He,u=new He,h=new He,f=new He,d=s.inheritType?s.inheritType:0;s.translation&&e.setPosition(pr.fromArray(s.translation));let m=Ta(0);if(s.preRotation){let L=s.preRotation.map(cn.degToRad);L.push(m),t.makeRotationFromEuler(fh.fromArray(L))}if(s.rotation){let L=s.rotation.map(cn.degToRad);L.push(s.eulerOrder||m),n.makeRotationFromEuler(fh.fromArray(L))}if(s.postRotation){let L=s.postRotation.map(cn.degToRad);L.push(m),i.makeRotationFromEuler(fh.fromArray(L)),i.invert()}s.scale&&r.scale(pr.fromArray(s.scale)),s.scalingOffset&&o.setPosition(pr.fromArray(s.scalingOffset)),s.scalingPivot&&a.setPosition(pr.fromArray(s.scalingPivot)),s.rotationOffset&&l.setPosition(pr.fromArray(s.rotationOffset)),s.rotationPivot&&c.setPosition(pr.fromArray(s.rotationPivot)),s.parentMatrixWorld&&(h.copy(s.parentMatrix),u.copy(s.parentMatrixWorld));let y=t.clone().multiply(n).multiply(i),g=new He;g.extractRotation(u);let p=new He;p.copyPosition(u);let E=p.clone().invert().multiply(u),S=g.clone().invert().multiply(E),_=r,C=new He;if(d===0)C.copy(g).multiply(y).multiply(S).multiply(_);else if(d===1)C.copy(g).multiply(S).multiply(y).multiply(_);else{let F=new He().scale(new N().setFromMatrixScale(h)).clone().invert(),K=S.clone().multiply(F);C.copy(g).multiply(y).multiply(K).multiply(_)}let b=c.clone().invert(),I=a.clone().invert(),v=e.clone().multiply(l).multiply(c).multiply(t).multiply(n).multiply(i).multiply(b).multiply(o).multiply(a).multiply(r).multiply(I),T=new He().copyPosition(v),P=u.clone().multiply(T);return f.copyPosition(P),v=f.clone().multiply(C),v.premultiply(u.invert()),v}function Ta(s){s=s||0;let e=["ZYX","YZX","XZY","ZXY","YXZ","XYZ"];return s===6?(console.warn("THREE.FBXLoader: unsupported Euler Order: Spherical XYZ. Animations and rotations may be incorrect."),e[0]):e[s]}function dh(s){return s.split(",").map(function(t){return parseFloat(t)})}function Of(s,e,t){return e===void 0&&(e=0),t===void 0&&(t=s.byteLength),new TextDecoder().decode(new Uint8Array(s,e,t))}function kv(s,e){for(let t=0,n=s.length,i=e.length;t<i;t++,n++)s[n]=e[t]}function Hv(s,e,t,n){for(let i=t,r=0;i<n;i++,r++)s[r]=e[i];return s}function Bf(s){let e=new Map,t=new Map,n=s.clone();return zf(s,n,function(i,r){e.set(r,i),t.set(i,r)}),n.traverse(function(i){if(!i.isSkinnedMesh)return;let r=i,a=e.get(i),o=a.skeleton.bones;r.skeleton=a.skeleton.clone(),r.bindMatrix.copy(a.bindMatrix),r.skeleton.bones=o.map(function(l){return t.get(l)}),r.bind(r.skeleton,r.bindMatrix)}),n}function zf(s,e,t){t(s,e);for(let n=0;n<s.children.length;n++)zf(s.children[n],e.children[n],t)}(function(){"use strict";let s={},e="assets/prototype4/",t="assets/prototype4/hq/",n="assets/prototype4/holt/",h=[{x:-2.15,z:-5.1},{x:0,z:-5.35},{x:2.15,z:-5.1}],f=[{x:-1.55,z:-5.05,rotation:0,side:"north"},{x:1.55,z:-5.05,rotation:0,side:"north"},{x:3.15,z:-2.4,rotation:Math.PI/2,side:"east"},{x:3.15,z:2.4,rotation:Math.PI/2,side:"east"},{x:1.55,z:5.05,rotation:0,side:"south"},{x:-1.55,z:5.05,rotation:0,side:"south"},{x:-3.15,z:2.4,rotation:Math.PI/2,side:"west"},{x:-3.15,z:-2.4,rotation:Math.PI/2,side:"west"}],d=1.05,m=!!(window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches),y=window.LSCBalance.performanceBudget({cores:navigator.hardwareConcurrency,memory:navigator.deviceMemory,reducedMotion:m}),g={model:"Zombie-Soldier.fbx",scout:"Zombie-Scout.fbx",run:"Zombie-Run.fbx",attack:"Zombie-Punch.fbx",death:"Zombie-Death.fbx",holtModel:"Idle-Aiming.fbx",holtFire:"Firing-Rifle.fbx"},p={base:["Center-Base.fbx","Center-Base-BaseColor.jpg"],radio:["Radio-Tower.fbx","Radio-Tower-BaseColor.jpg"],tower:["Security-Tower.fbx","Security-Tower-BaseColor.jpg"]},E={weapon:"M4A1.fbx",texture:"texture.png"},S,_,C,b,I,v,T,P=!1,L=null,F={},K={},J=null,z=null,Q=new N(1,1,1),$=null,se=null,oe=null,he=null,fe=null,Ae=null,st=null,yt=null,rt=null,ie=0,de=!1,le=null,Pe=null,qe=null,Le=null,mt=null,Ze=null,at=null,ot=null,nt=null,Mt=null,St=null,xt=null,wt=null,Pt=null,Nt=null,B=[],Ot=null,Je=null,R=null,x=null,k=null,q=null,te=null,ue=0,ge=[],ne=[],j=null,ce=null,xe=null,Me=[],ve=null,Ge=[],We=[],$e=null,U=[],me=[],re=[],_e=[],be=null,ae=[],Ne=0,Ie="",Lt=new Map,gt=new Map,rn=new Map,Xe=new Fe,Ll=new N(0,1,0),Dl=new N(1,0,0),wi=new N,ws=new zt,As=new N(0,24.5,24.2),ts=new N(0,0,-1.1),ns=new N,Mn=null,Jn=0,Cs=0,Rs=0,mn=Math.min(y.maxPixelRatio,devicePixelRatio||1),mr=Math.min(mn,y.minPixelRatio),Ai=0,is=0,Ci=0,wa={turret:new Tt(.038,.038*.72,1,6),standard:new Tt(.026,.026*.72,1,6)},Nl={artillery:new Tt(.16,.48,3.8,10,1,!0),shockwave:new Zr(.48,1,28),fireball:new ki(1,1),smoke:new tr(1,0),"vehicle-explosion":new ki(1,2),debris:new $r(1,0),impact:new Yr(1,1)},ss={artillery:[],shockwave:[],fireball:[],smoke:[],"vehicle-explosion":[],debris:[],impact:[]};function Bn(A){T&&T.textContent!==A&&(T.textContent=A)}function M(A,D={}){return new Hi({color:A,roughness:D.roughness==null?.76:D.roughness,metalness:D.metalness==null?.08:D.metalness,emissive:D.emissive||0,emissiveIntensity:D.emissiveIntensity||0})}function w(A,D,V,G,X=Xe,H){let W=new pt(new zi(D[0],D[1],D[2]),M(G,H));return W.name=A,W.position.set(V[0],V[1],V[2]),W.castShadow=y.shadows,W.receiveShadow=!0,X.add(W),W}function O(A,D,V,G,X,H,W){let ee=new pt(D,M(G,H));return ee.name=A,ee.position.set(V[0],V[1],V[2]),W&&ee.rotation.set(W[0],W[1],W[2]),ee.castShadow=y.shadows,ee.receiveShadow=!0,X.add(ee),ee}function Z(){T=document.createElement("div"),T.id="lsc-3d-badge",T.textContent="CENTRAL HQ \xB7 LOADING CONTACT",T.style.cssText='position:absolute;z-index:38;left:12px;top:calc(env(safe-area-inset-top,0px) + 48px);padding:5px 8px;border:1px solid rgba(116,233,255,.5);border-radius:6px;background:rgba(3,10,15,.78);color:#74e9ff;font:7px "Share Tech Mono",monospace;letter-spacing:1.3px;pointer-events:none',S.parentNode.appendChild(T)}function Y(A,D){if(A&&A.operationKind==="junkyard"){let V=Math.max(1,Number(A.operationLevel)||1);return D?`JUNKYARD RECOVERY L${V} \xB7 LOCATING ARMORED CONVOY`:`JUNKYARD RECOVERY L${V} \xB7 ${Math.max(0,Math.ceil(Number(A.objectiveTime)||0))}s TO EXTRACTION`}return A&&A.operation?`CONTAINMENT LEVEL ${Math.max(1,Number(A.operationLevel)||1)} \xB7 FORWARD LINE`:"CENTRAL HQ \xB7 HOLT ON STATION"}function Te(){z=new Fe,z.name="Commander Holt fallback",J=z,Q.copy(J.scale),O("Holt left leg",new Tt(.105,.12,.5,9),[-.15,.31,0],1516322,z,{metalness:.2}),O("Holt right leg",new Tt(.105,.12,.5,9),[.15,.31,0],1516322,z,{metalness:.2}),w("Holt left boot",[.25,.18,.38],[-.15,.1,.07],1055e3,z,{metalness:.25}),w("Holt right boot",[.25,.18,.38],[.15,.1,.07],1055e3,z,{metalness:.25}),O("Holt torso",new er(.31,.48,5,10),[0,.88,0],3110249,z,{metalness:.22,roughness:.56}),w("Holt chest plate",[.56,.35,.2],[0,.96,.24],1457984,z,{metalness:.42,roughness:.38}),w("Holt command stripe",[.4,.055,.215],[0,1.04,.255],15777611,z,{metalness:.32,emissive:4859648,emissiveIntensity:.24}),O("Holt left shoulder",new Kt(.17,10,7),[-.36,1.07,.02],2382679,z,{metalness:.26}),O("Holt right shoulder",new Kt(.19,10,7),[.36,1.07,.02],2382679,z,{metalness:.26}),O("Holt left forearm",new Tt(.085,.11,.58,9),[-.29,.92,.3],2379595,z,{metalness:.28},[Math.PI/2,0,0]),O("Holt arm cannon",new Tt(.105,.15,.82,10),[.31,1.02,.45],1583149,z,{metalness:.62,roughness:.28},[Math.PI/2,0,0]),O("Holt cannon ring",new Nn(.13,.035,6,12),[.31,1.02,.85],7596287,z,{metalness:.42,emissive:1931408,emissiveIntensity:.8},[0,0,0]),O("Holt helmet",new Kt(.25,14,9),[0,1.43,0],2505533,z,{metalness:.38,roughness:.42}),w("Holt visor",[.37,.115,.21],[0,1.43,.2],8515583,z,{metalness:.28,emissive:1533562,emissiveIntensity:.78}),w("Holt helmet crest",[.07,.13,.34],[0,1.66,-.01],15185482,z,{metalness:.34}),$=new pt(new ri(.14,.34,7),new Rn({color:16772981,transparent:!0,opacity:.94})),$.name="Holt muzzle flash",$.rotation.x=Math.PI/2,$.position.set(.31,1.02,.98),$.visible=!1,z.add($),se=new Jt(16765018,0,2.2,2),se.position.copy($.position),z.add(se),Xe.add(z)}function Re(){le=new Fe,le.name="Main turret",O("Turret armored base",new Tt(.68,.82,.36,12),[0,.18,0],3161402,le,{metalness:.38,roughness:.48}),O("Turret rotation ring",new Tt(.58,.58,.12,16),[0,.4,0],7981001,le,{metalness:.58,roughness:.3,emissive:1064771,emissiveIntensity:.35}),Pe=new Fe,Pe.position.y=.45,le.add(Pe),O("Turret gun housing",new Tt(.48,.58,.48,10),[0,.22,0],5663334,Pe,{metalness:.42,roughness:.4}),w("Turret front armor",[.82,.42,.48],[0,.24,.25],4347475,Pe,{metalness:.46,roughness:.36}),w("Turret barrel cradle",[.48,.22,.42],[0,.27,.52],2503989,Pe,{metalness:.58,roughness:.28}),O("Turret barrel left",new Tt(.065,.09,1.42,9),[-.13,.28,1.12],1911083,Pe,{metalness:.78,roughness:.22},[Math.PI/2,0,0]),O("Turret barrel right",new Tt(.065,.09,1.42,9),[.13,.28,1.12],1911083,Pe,{metalness:.78,roughness:.22},[Math.PI/2,0,0]),O("Turret muzzle left",new Nn(.085,.024,6,12),[-.13,.28,1.82],10284287,Pe,{metalness:.52,emissive:1534842,emissiveIntensity:.75}),O("Turret muzzle right",new Nn(.085,.024,6,12),[.13,.28,1.82],10284287,Pe,{metalness:.52,emissive:1534842,emissiveIntensity:.75}),Le=new Fe,Le.name="Turret muzzle flashes",[-.13,.13].forEach(A=>{let D=new pt(new ri(.13,.42,7),new Rn({color:16765288,transparent:!0,opacity:.96}));D.position.set(A,.28,2.03),D.rotation.x=Math.PI/2,Le.add(D)}),Le.visible=!1,Pe.add(Le),mt=new Fe,mt.name="HQ level 2 turret reinforcement",w("Turret left armor wing",[.22,.5,.72],[-.53,.19,.08],3037531,mt,{metalness:.48,roughness:.34}),w("Turret right armor wing",[.22,.5,.72],[.53,.19,.08],3037531,mt,{metalness:.48,roughness:.34}),O("Turret targeting sensor",new Kt(.13,10,7),[0,.62,.02],8321279,mt,{metalness:.36,emissive:1538186,emissiveIntensity:1.05}),mt.visible=!1,Pe.add(mt),Ze=new Fe,Ze.name="HQ level 4 turret laser conversion",O("Turret laser barrel",new Tt(.1,.14,1.34,10),[0,.48,1.12],5433343,Ze,{metalness:.7,roughness:.18,emissive:1535876,emissiveIntensity:.85},[Math.PI/2,0,0]),O("Turret laser focusing ring",new Nn(.14,.035,7,14),[0,.48,1.8],13171711,Ze,{metalness:.52,emissive:2997201,emissiveIntensity:1.2}),Ze.visible=!1,Pe.add(Ze),qe=new Jt(16754747,0,3.4,2),qe.position.set(0,.32,1.88),Pe.add(qe),Xe.add(le)}function Ee(){j=new Fe,j.name="Build 172 forward containment battlefield",j.visible=!1,Xe.add(j);let A=new pt(new ai(14,27),M(1516326,{roughness:1,metalness:0}));A.name="Containment yard asphalt",A.rotation.x=-Math.PI/2,A.position.set(0,0,-2.6),A.receiveShadow=!0,j.add(A),w("Containment approach bed",[8.8,.07,20.8],[0,.035,-3.2],2372406,j,{roughness:.96}),h.forEach((D,V)=>{w(`Forward lane ${V+1}`,[1.62,.035,18.5],[D.x,.085,-3.4],V===1?3229771:2702656,j,{roughness:.91}),[-.76,.76].forEach(G=>{w(`Forward lane ${V+1} guide`,[.055,.025,18.2],[D.x+G,.115,-3.4],5403770,j,{emissive:1588035,emissiveIntensity:.38})});for(let G=0;G<6;G++)w(`Forward lane ${V+1} marker ${G+1}`,[.12,.03,.75],[D.x,.12,3.2-G*2.85],13675860,j,{emissive:4665344,emissiveIntensity:.18})}),[-4.72,4.72].forEach((D,V)=>{w(`Containment fence ${V+1}`,[.12,.72,21.5],[D,.37,-3],5859434,j,{metalness:.62,roughness:.34});for(let G=0;G<8;G++)w(`Containment fence post ${V+1}-${G+1}`,[.18,1.25,.18],[D,.63,5.6-G*2.45],8622226,j,{metalness:.66,roughness:.3})}),w("Quarantine gate header",[9.65,.46,.38],[0,2.02,-11.1],2505794,j,{metalness:.52,roughness:.36}),[-4.35,4.35].forEach((D,V)=>{w(`Quarantine gate column ${V+1}`,[.56,3.8,.56],[D,1.9,-11.1],3427152,j,{metalness:.48,roughness:.4}),O(`Quarantine warning lamp ${V+1}`,new Kt(.12,9,6),[D,3.92,-11.05],16757582,j,{emissive:12012808,emissiveIntensity:1.25});let G=new Jt(16747317,1.7,4.8,2);G.position.set(D,3.7,-10.8),j.add(G)}),w("Quarantine warning stripe",[7.5,.08,.42],[0,1.99,-10.86],13675860,j,{emissive:4860672,emissiveIntensity:.24}),w("Forward command platform",[5.6,.24,2.8],[0,.12,1.25],2705482,j,{metalness:.38,roughness:.46}),w("Forward command platform lip",[5.6,.46,.18],[0,.32,-.08],1520696,j,{metalness:.58,roughness:.32}),w("Forward command rear rail",[5.6,.72,.12],[0,.5,2.58],6847357,j,{metalness:.62,roughness:.3}),[-2.55,2.55].forEach((D,V)=>{w(`Forward command side rail ${V+1}`,[.12,.72,2.55],[D,.5,1.25],6847357,j,{metalness:.62,roughness:.3}),O(`Forward command beacon ${V+1}`,new Kt(.09,8,6),[D,.94,.12],8779263,j,{emissive:2997201,emissiveIntensity:1.35})}),w("Forward command stripe",[4.7,.035,.16],[0,.255,.2],13939806,j,{emissive:4665344,emissiveIntensity:.2}),h.forEach((D,V)=>{let G=new Fe;G.name=`Forward barricade lane ${V+1}`,G.position.set(D.x,0,D.z),j.add(G);let X=w("Forward barricade left",[.66,.68,.52],[-.35,.36,0],5402734,G,{metalness:.42,roughness:.42}),H=w("Forward barricade right",[.66,.68,.52],[.35,.36,0],5402734,G,{metalness:.42,roughness:.42});w("Forward barricade brace",[1.5,.13,.68],[0,.76,0],8623505,G,{metalness:.58,roughness:.3}),w("Forward barricade energy strip",[1.22,.065,.7],[0,.79,-.02],8318719,G,{emissive:2329240,emissiveIntensity:.92});let W=new Fe;W.name=`Forward barricade damage marks ${V+1}`;let ee=w("Forward barricade crack A",[.05,.5,.025],[-.24,.46,-.275],1445643,W,{roughness:1}),pe=w("Forward barricade crack B",[.05,.42,.025],[.27,.39,-.275],1445643,W,{roughness:1});ee.rotation.z=-.62,pe.rotation.z=.72,W.visible=!1,G.add(W),G.userData.faceMaterials=[X.material,H.material],G.userData.damageMarks=W,ne.push(G)})}function De(){ce=new Fe,ce.name="Build 185 decisive-destruction junkyard convoy battlefield",ce.visible=!1,Xe.add(ce);let A=new pt(new ai(20,30),M(3352862,{roughness:1,metalness:0}));A.name="Junkyard packed earth",A.rotation.x=-Math.PI/2,A.position.set(0,0,-1),A.receiveShadow=!0,ce.add(A);let D=new Ke(3.55,-7.35),V=new Ke(-2.95,5.75),G=V.clone().sub(D),X=G.length(),H=Math.atan2(G.x,G.y),W=D.clone().add(V).multiplyScalar(.5),ee=new Fe;ee.name="Diagonal armored convoy route",ee.position.set(W.x,0,W.y),ee.rotation.y=H,ce.add(ee),w("Convoy road shoulder",[3.25,.07,X+5.4],[0,.035,0],5981744,ee,{roughness:1}),w("Convoy road bed",[2.72,.085,X+5.1],[0,.08,0],2369578,ee,{roughness:.94}),[-1.24,1.24].forEach((je,Gt)=>{w(`Convoy route edge ${Gt+1}`,[.065,.028,X+4.8],[je,.14,0],10122565,ee,{emissive:3678208,emissiveIntensity:.18})});for(let je=-6;je<=6;je+=2)w(`Convoy route marker ${je+7}`,[.11,.03,.82],[0,.145,je],13802819,ee,{emissive:4859648,emissiveIntensity:.2});let pe=(je,Gt,an,Ii)=>{let gn=new Fe;gn.name=je,gn.position.set(Gt[0],0,Gt[1]),gn.rotation.y=Ii||0,ce.add(gn),w(`${je} shell`,[3.05,1.35,1.42],[0,.69,0],an,gn,{metalness:.38,roughness:.62});for(let Zt=-1.28;Zt<=1.28;Zt+=.43)w(`${je} rib`,[.055,1.18,1.46],[Zt,.69,0],9070403,gn,{metalness:.5,roughness:.45});w(`${je} frame`,[3.14,.1,1.5],[0,1.33,0],3419173,gn,{metalness:.58})};pe("Oxide freight container",[-6.25,-5.25],7551529,-.15),pe("Teal freight container",[-6,-3.52],3430490,-.15),pe("Ochre freight container",[5.55,-2.6],7623459,.16),pe("Salvage freight container",[4.6,4.25],4609869,.12);let ye=(je,Gt,an,Ii)=>{let gn=new Fe;gn.name=je,gn.position.set(Gt,0,an),ce.add(gn),O(`${je} mound`,new Tt(1.08,1.42,.55,9),[0,.28,0],3813672,gn,{roughness:.96});for(let Zt=0;Zt<8;Zt++){let xr=Ii+Zt*1.37,bh=.28+Zt%3*.25;w(`${je} scrap ${Zt+1}`,[.24+Zt%2*.28,.18+Zt%3*.12,.62],[Math.cos(xr)*bh,.52+Zt%2*.17,Math.sin(xr)*bh],Zt%3===0?8145196:Zt%3===1?4938582:2698541,gn,{metalness:.68,roughness:.42}).rotation.set(xr*.22,xr,xr*.13)}};ye("Northwest scrap heap",-5.65,-.65,.2),ye("Northeast scrap heap",5.8,-5.55,1.1),ye("East scrap heap",5.9,.7,2.4),ye("Southwest scrap heap",-5.55,6.05,3.3);let Se=new Fe;Se.name="Stripped convoy wreck",Se.position.set(3.55,6.25,0),Se.rotation.y=-.72,ce.add(Se),w("Wreck chassis",[2.1,.38,3.5],[0,.42,0],5190952,Se,{metalness:.58,roughness:.55}),w("Wreck cab",[1.75,.84,1.35],[0,.85,1],4074277,Se,{metalness:.52,roughness:.6}),[[-1.05,-1.15],[1.05,-1.15],[-1.05,1.1]].forEach((je,Gt)=>{O(`Wreck wheel ${Gt+1}`,new Tt(.42,.42,.3,12),[je[0],.42,je[1]],1447702,Se,{metalness:.24,roughness:.86},[0,0,Math.PI/2])});let Oe=new Fe;Oe.name="Junkyard recovery crane",Oe.position.set(6.65,5.25,0),ce.add(Oe),w("Crane mast",[.48,5.4,.48],[0,2.7,0],7755309,Oe,{metalness:.56,roughness:.42}),w("Crane boom",[4.2,.34,.34],[-1.78,5.18,0],9201717,Oe,{metalness:.58,roughness:.4}),w("Crane cable",[.035,2.7,.035],[-3.72,3.72,0],2237218,Oe,{metalness:.72}),O("Crane hook",new Nn(.18,.055,7,13,Math.PI*1.55),[-3.72,2.35,0],10977349,Oe,{metalness:.72},[0,0,Math.PI/2]);let ze=new Fe;ze.name="Convoy extraction gate",ze.position.set(V.x,0,V.y),ze.rotation.y=H,ce.add(ze),[-2,2].forEach((je,Gt)=>{w(`Extraction gate column ${Gt+1}`,[.48,3.35,.48],[je,1.68,.42],5326134,ze,{metalness:.52,roughness:.42}),O(`Extraction gate beacon ${Gt+1}`,new Kt(.13,9,6),[je,3.48,.42],16754498,ze,{emissive:13650696,emissiveIntensity:1.45});let an=new Jt(16744242,2.2,5.2,2);an.position.set(je,3.32,.2),ze.add(an)}),w("Extraction gate header",[4.5,.42,.46],[0,3.16,.42],4799792,ze,{metalness:.54,roughness:.4}),w("Extraction hazard stripe",[3.35,.09,.5],[0,3.13,.16],13802819,ze,{emissive:4859648,emissiveIntensity:.25}),w("Recovery firing platform",[3.25,.24,4.75],[-4.35,.12,2.9],4015682,ce,{metalness:.42,roughness:.5}),w("Recovery platform road wall",[.22,.74,4.75],[-2.72,.45,2.9],7822135,ce,{metalness:.48,roughness:.42}),w("Recovery platform rear rail",[3.25,.68,.12],[-4.35,.52,5.22],9074520,ce,{metalness:.58,roughness:.34}),w("Recovery platform stripe",[2.92,.035,.15],[-4.35,.265,.75],14919751,ce,{emissive:4859648,emissiveIntensity:.22});let It=new Jt(16752964,2.4,10,2);It.position.set(-4.7,5.2,3.6),ce.add(It),xe=new Fe,xe.name="Procedural armored convoy transport",xe.visible=!1,Xe.add(xe);let Sn=(je,Gt,an,Ii,gn)=>{let Zt=w(je,Gt,an,Ii,xe,gn);return Zt.material.userData.baseColor=Zt.material.color.getHex(),Me.push(Zt.material),Zt};Sn("Armored transport chassis",[2.25,.42,4.5],[0,.55,0],3553845,{metalness:.66,roughness:.35}),Sn("Armored transport cargo shell",[2.02,1.35,2.48],[0,1.25,-.72],6117448,{metalness:.58,roughness:.42}),Sn("Armored transport cab",[1.96,1.18,1.42],[0,1.17,1.34],6642503,{metalness:.6,roughness:.4}),Sn("Armored transport hood",[1.82,.58,.64],[0,.88,2.18],4934720,{metalness:.65,roughness:.36}),Sn("Armored transport front plate",[2.08,.74,.18],[0,.91,2.5],3159601,{metalness:.72,roughness:.3}),Sn("Armored transport roof armor",[2.18,.22,2.75],[0,2.02,-.48],4277307,{metalness:.68,roughness:.34}),[-1.08,1.08].forEach((je,Gt)=>{[-1.42,1.5].forEach((an,Ii)=>{O(`Armored transport wheel ${Gt+1}-${Ii+1}`,new Tt(.48,.48,.36,14),[je,.53,an],1250580,xe,{metalness:.24,roughness:.88},[0,0,Math.PI/2]),O(`Armored transport hub ${Gt+1}-${Ii+1}`,new Tt(.2,.2,.38,12),[je,.53,an],9203780,xe,{metalness:.72,roughness:.32},[0,0,Math.PI/2])})}),O("Armored transport roof hatch",new Tt(.48,.56,.24,12),[0,2.22,-.45],3356723,xe,{metalness:.7,roughness:.32}),w("Armored transport windshield",[1.5,.44,.08],[0,1.43,2.07],1518382,xe,{metalness:.38,roughness:.24,emissive:465180,emissiveIntensity:.32}),Ge=[-.62,.62].map((je,Gt)=>O(`Armored transport headlight ${Gt+1}`,new Kt(.13,9,6),[je,.78,2.61],16766571,xe,{emissive:16753950,emissiveIntensity:1.35})),O("Armored transport beacon housing",new Tt(.13,.16,.18,10),[0,2.31,.5],3483679,xe,{metalness:.6});let bn=O("Armored transport warning beacon",new Kt(.12,10,7),[0,2.45,.5],16740398,xe,{emissive:15022856,emissiveIntensity:1.5});ve=new Jt(16735011,2.8,4.6,2),ve.position.copy(bn.position),xe.add(ve),[[-.62,1.34,-.55,.66],[.52,1.12,.38,.52],[0,1.72,-1.12,.72]].forEach((je,Gt)=>{let an=new pt(new ki(je[3],1),new Rn({color:Gt===1?16766044:16735009,transparent:!0,opacity:.9,blending:Zi,depthWrite:!1}));an.name=`Armored transport destruction flame ${Gt+1}`,an.position.set(je[0],je[1],je[2]),an.visible=!1,xe.add(an),We.push(an)}),$e=new Jt(16734753,0,10,2),$e.position.set(0,1.5,0),xe.add($e)}function Ue(){let A=(Se,Oe,ze,It,Sn,bn)=>{let je=new pt(new tr(.62,0),new Rn({color:ze,transparent:!0,opacity:.28,depthWrite:!1}));return je.name=Se,je.position.set(Oe[0],Oe[1],Oe[2]),je.scale.set(1,1.45,1),It.add(je),_e.push({mesh:je,tier:Sn,damageTier:bn,baseY:Oe[1],drift:.12+_e.length*.015}),je},D=(Se,Oe,ze,It,Sn)=>{let bn=new Fe;bn.name=Se,bn.position.set(Oe,0,ze),bn.rotation.y=It,Sn.add(bn),w(`${Se} lower rail`,[4.2,.07,.07],[0,.42,0],5857888,bn,{metalness:.72,roughness:.42}),w(`${Se} upper rail`,[4.2,.07,.07],[0,1.12,0],5857888,bn,{metalness:.72,roughness:.42});for(let je=-2;je<=2;je++)w(`${Se} post ${je+3}`,[.07,1.42,.07],[je,.71,0],7370870,bn,{metalness:.72,roughness:.42})},V=(Se,Oe,ze)=>{[[-1.8,-7,.44],[1.6,-10,-.38],[-8,1.2,1.08],[8,-1.5,-1.04],[-1.4,8,.22]].forEach((It,Sn)=>{let bn=w(`${Oe} road crack ${Sn+1}`,[1.7+Sn%2*.7,.018,.065],[It[0],.035,It[1]],ze,Se,{roughness:1});bn.rotation.y=It[2]})},G=new Fe;G.name="Campaign tier 1 \xB7 Overrun Forward Outpost",Xe.add(G),me.push(G),V(G,"Outpost",2107424),[[-7.7,-7.1],[7.8,-6.7],[-7.4,6.6],[7.5,7.1]].forEach((Se,Oe)=>{let ze=new Fe;ze.name=`Abandoned outpost position ${Oe+1}`,ze.position.set(Se[0],0,Se[1]),ze.rotation.y=Oe*.46,G.add(ze),w("Outpost sandbag course",[3.2,.5,.72],[0,.27,0],7760455,ze,{roughness:.98});for(let It=-1;It<=1;It++)O(`Outpost sandbag ${It+2}`,new er(.22,.64,3,6),[It*.82,.58,0],9075540,ze,{roughness:.98},[0,0,Math.PI/2]);w("Outpost supply crate",[.86,.72,.86],[1.5,.38,.75],Oe%2?4150861:6116408,ze,{metalness:.22,roughness:.72})}),D("Broken west perimeter fence",-10.4,-1.2,Math.PI/2,G),D("Broken east perimeter fence",10.4,2.1,Math.PI/2,G);let X=new Jt(16760935,1.8,11,2);X.position.set(-7.3,4.8,-5.6),G.add(X),w("Outpost floodlight mast",[.16,4.8,.16],[-7.3,2.4,-5.6],5792607,G,{metalness:.68});let H=new Fe;H.name="Campaign tier 2 \xB7 Collapsed Industrial Sector",H.visible=!1,Xe.add(H),me.push(H),V(H,"Industrial",1908766),[[-9.1,-8.2,5850415],[8.8,-7.5,3955289],[-8.6,7.7,7028013]].forEach((Se,Oe)=>{let ze=new Fe;ze.name=`Collapsed freight stack ${Oe+1}`,ze.position.set(Se[0],.62,Se[1]),ze.rotation.y=(Oe-1)*.32,H.add(ze),w("Industrial freight container",[4.2,1.25,1.72],[0,0,0],Se[2],ze,{metalness:.48,roughness:.56});for(let It=-1.7;It<=1.7;It+=.57)w("Container rib",[.055,1.12,1.76],[It,0,0],3157803,ze,{metalness:.56})}),[-10.2,10.1].forEach((Se,Oe)=>{O(`Industrial storage silo ${Oe+1}`,new Tt(1.35,1.48,5.8,14),[Se,2.9,1.5-Oe*4],5133649,H,{metalness:.5,roughness:.58}),O(`Industrial silo cap ${Oe+1}`,new ri(1.48,.8,14),[Se,6.2,1.5-Oe*4],4343877,H,{metalness:.52,roughness:.54})}),w("Collapsed warehouse west wall",[6.4,3.8,.42],[-8.1,1.9,11.2],4870221,H,{metalness:.3,roughness:.78}),w("Collapsed warehouse east return",[.42,2.7,5.4],[-11.1,1.35,8.7],4212291,H,{metalness:.3,roughness:.8}),A("Industrial stack haze",[-10.2,7.3,1.5],4277569,H,2,0),A("Industrial yard haze",[9.5,3.4,7.8],3422776,H,2,0);let W=new Fe;W.name="Campaign tier 3 \xB7 Ruined Urban Perimeter",W.visible=!1,Xe.add(W),me.push(W),V(W,"Urban",1513754),[[-10.6,-9.6,5.8,7.5],[9.8,-9.7,6.2,9.4],[-10.4,9.7,7.2,8.3],[10.2,9.6,5.4,7.1]].forEach((Se,Oe)=>{let ze=new Fe;ze.name=`Urban building shell ${Oe+1}`,ze.position.set(Se[0],0,Se[1]),W.add(ze),w("Ruined building rear wall",[Se[2],Se[3],.52],[0,Se[3]/2,0],Oe%2?4803401:5394506,ze,{roughness:.9}),w("Ruined building side wall",[.52,Se[3]*.72,4.4],[-Se[2]/2+.24,Se[3]*.36,2],4277056,ze,{roughness:.92});for(let It=1;It<=2;It++)w("Exposed ruined floor",[Se[2]-.6,.18,3.8],[0,It*2.15,1.7],3421748,ze,{roughness:.92});for(let It=-1;It<=1;It++)w("Burned window opening",[.78,1.1,.08],[It*1.55,2.2+Oe%2*1.8,-.3],1119508,ze,{emissive:592650,emissiveIntensity:.25})});let ee=new Fe;ee.name="Burned evacuation vehicle",ee.position.set(7,.38,3.3),ee.rotation.y=-.62,W.add(ee),w("Evacuation wreck chassis",[1.8,.42,3.4],[0,0,0],2632489,ee,{metalness:.58,roughness:.7}),w("Evacuation wreck cabin",[1.55,.88,1.4],[0,.58,.78],3289646,ee,{metalness:.48,roughness:.74}),A("Urban ruin haze west",[-8.9,6.2,-8.7],3487287,W,3,0),A("Urban ruin haze east",[9,7.2,-7.8],3158323,W,3,0);let pe=new Fe;pe.name="Campaign assault 2 battlefield damage",pe.visible=!1,Xe.add(pe),re.push(pe),[[-4.9,-7.2],[7.2,4.8],[-7.4,4.1]].forEach((Se,Oe)=>{O(`Fresh impact crater ${Oe+1}`,new Tt(.42,1.12,.14,15),[Se[0],.055,Se[1]],2106399,pe,{roughness:1}),A(`Fresh crater smoke ${Oe+1}`,[Se[0],.78,Se[1]],3750711,pe,0,2)});let ye=new Fe;ye.name="Campaign assault 3 siege damage",ye.visible=!1,Xe.add(ye),re.push(ye),[[-6.2,-2.2],[6.4,-3.1]].forEach((Se,Oe)=>{O(`Siege fire ${Oe+1}`,new ri(.34,1.25,9),[Se[0],.68,Se[1]],16738849,ye,{emissive:16722432,emissiveIntensity:2.2});let ze=new Jt(16733986,2.4,6.5,2);ze.position.set(Se[0],1.3,Se[1]),ye.add(ze),A(`Siege column ${Oe+1}`,[Se[0],1.55,Se[1]],2829612,ye,0,3)})}function tt(){b.add(Xe);let A=new pt(new ai(34,38),M(4609853,{roughness:1,metalness:0}));A.name="Battlefield",A.rotation.x=-Math.PI/2,A.receiveShadow=!0,be=A.material,Xe.add(A);let D=new pt(new ai(3.1,34),M(3423793,{roughness:1,metalness:0}));D.rotation.x=-Math.PI/2,D.position.y=.012,D.receiveShadow=!0,ae.push(D.material),Xe.add(D);let V=D.clone();V.rotation.z=Math.PI/2,Xe.add(V),Ue(),w("HQ foundation",[3.7,.28,3.2],[0,.14,0],2503726),at=new Fe,at.name="Command Bastion rooftop emplacement",w("Command Bastion shared rooftop deck",[3.55,.22,1.55],[0,1.15-.11,-1],3230793,at,{metalness:.42,roughness:.42}),w("Command Bastion front armored lip",[3.55,.34,.16],[0,1.15-.02,-1+.69],2112316,at,{metalness:.56,roughness:.34}),w("Command Bastion rear safety rail",[3.55,.42,.12],[0,1.15+.18,-1-.7],7241074,at,{metalness:.58,roughness:.34}),[-1.48,1.48].forEach(X=>{w("Command Bastion rooftop support",[.22,1.02,.88],[X,.54,-1],2506043,at,{metalness:.46,roughness:.46}),w("Command Bastion side rail",[.12,.42,1.45],[X,1.15+.18,-1],7241074,at,{metalness:.58,roughness:.34})}),w("Command Bastion access step",[.68,.18,.42],[0,.91,0],6715248,at,{metalness:.38,roughness:.48}),w("Command Bastion command stripe",[3.18,.025,.18],[0,1.15+.015,-1+.42],13939806,at,{metalness:.42,emissive:4665344,emissiveIntensity:.18}),Xe.add(at),ot=new Fe,ot.name="Command Bastion level 2 armored rails",w("Bastion west command shield",[.26,.62,1.15],[-1.44,1.15+.28,-1],3496535,ot,{metalness:.52,roughness:.34}),w("Bastion east command shield",[.26,.62,1.15],[1.44,1.15+.28,-1],3496535,ot,{metalness:.52,roughness:.34}),ot.visible=!1,Xe.add(ot),nt=new Fe,nt.name="Command Bastion level 3 reinforced deck",w("Bastion reinforced front plate",[2.15,.54,.18],[0,1.15-.02,-1+.71],4678751,nt,{metalness:.58,roughness:.32}),w("Bastion stair tread",[1.05,.16,.34],[0,.73,-1+1.24],6715248,nt,{metalness:.4,roughness:.46}),nt.visible=!1,Xe.add(nt),Mt=new Fe,Mt.name="Command Bastion level 4 armored nest",w("Bastion center command console",[.46,.52,.42],[0,1.15+.25,-1-.34],3036502,Mt,{metalness:.68,roughness:.28}),[-1,1].forEach(X=>O("Bastion targeting light",new Kt(.07,8,6),[X*1.47,1.15+.66,-1-.5],8910335,Mt,{emissive:2997201,emissiveIntensity:1.2})),Mt.visible=!1,Xe.add(Mt),St=new Fe,St.name="Command Bastion level 5 command fortress",w("Bastion west energy rail",[.08,.08,1.35],[-1.62,1.15+.52,-1],9369343,St,{emissive:2534077,emissiveIntensity:1.25}),w("Bastion east energy rail",[.08,.08,1.35],[1.62,1.15+.52,-1],9369343,St,{emissive:2534077,emissiveIntensity:1.25}),w("Bastion command shield lip",[3.1,.12,.12],[0,1.15+.56,-1-.64],6675687,St,{metalness:.56,emissive:1865864,emissiveIntensity:.78}),St.visible=!1,Xe.add(St),xt=new Fe,xt.name="HQ loading fallback",Xe.add(xt),w("HQ fallback body",[2.35,.72,1.85],[0,.5,.2],4611160,xt),w("HQ fallback upper",[1.45,.28,1.15],[0,.91,.28],6847606,xt),w("HQ fallback mast",[.08,1.3,.08],[0,1.68,.28],13688536,xt,{metalness:.4}),Je=new Fe,Je.name="HQ level 2 reinforced compound",w("HQ rear blast wall",[4.75,.62,.28],[0,.33,-2.12],3361608,Je,{metalness:.28,roughness:.62}),w("HQ west blast wall",[.28,.62,4],[-2.38,.33,0],3361608,Je,{metalness:.28,roughness:.62}),w("HQ east blast wall",[.28,.62,4],[2.38,.33,0],3361608,Je,{metalness:.28,roughness:.62}),w("HQ front wall west",[1.72,.62,.28],[-1.5,.33,2.12],3361608,Je,{metalness:.28,roughness:.62}),w("HQ front wall east",[1.72,.62,.28],[1.5,.33,2.12],3361608,Je,{metalness:.28,roughness:.62}),[-1,1].forEach(X=>{O("HQ reinforced corner post",new Tt(.2,.25,.88,8),[X*2.38,.45,-2.12],7308672,Je,{metalness:.5,roughness:.34}),w("HQ powered equipment crate",[.72,.48,.58],[X*1.48,.25,1.72],X<0?5465173:4677219,Je,{metalness:.2,roughness:.66}),w("HQ floodlight pole",[.08,1.5,.08],[X*2.05,.75,1.78],8884878,Je,{metalness:.5}),O("HQ floodlight",new Kt(.1,9,6),[X*2.05,1.55,1.78],14089215,Je,{emissive:7724523,emissiveIntensity:1.25});let H=new Jt(10284287,1.35,4.2,2);H.position.set(X*2.05,1.5,1.65),Je.add(H)}),Je.visible=!1,Xe.add(Je),R=new Fe,R.name="HQ level 3 raised fortified walls",w("Level 3 rear upper wall",[5.05,.42,.38],[0,.78,-2.18],6583404,R,{metalness:.42,roughness:.46}),w("Level 3 west upper wall",[.38,.42,4.35],[-2.44,.78,0],6583404,R,{metalness:.42,roughness:.46}),w("Level 3 east upper wall",[.38,.42,4.35],[2.44,.78,0],6583404,R,{metalness:.42,roughness:.46}),w("Level 3 front upper wall west",[1.82,.42,.38],[-1.56,.78,2.18],6583404,R,{metalness:.42,roughness:.46}),w("Level 3 front upper wall east",[1.82,.42,.38],[1.56,.78,2.18],6583404,R,{metalness:.42,roughness:.46}),[[-2.44,-2.18],[2.44,-2.18],[-2.44,2.18],[2.44,2.18]].forEach((X,H)=>{O(`Level 3 corner bastion ${H+1}`,new Tt(.31,.38,1.42,8),[X[0],.71,X[1]],5401448,R,{metalness:.48,roughness:.4})}),R.visible=!1,Xe.add(R),x=new Fe,x.name="HQ level 4 armored perimeter wall",w("Level 4 rear armor course",[5.34,.5,.46],[0,1.18,-2.25],4152928,x,{metalness:.62,roughness:.32}),w("Level 4 west armor course",[.46,.5,4.56],[-2.55,1.18,0],4152928,x,{metalness:.62,roughness:.32}),w("Level 4 east armor course",[.46,.5,4.56],[2.55,1.18,0],4152928,x,{metalness:.62,roughness:.32}),w("Level 4 front armor west",[1.94,.5,.46],[-1.67,1.18,2.25],4152928,x,{metalness:.62,roughness:.32}),w("Level 4 front armor east",[1.94,.5,.46],[1.67,1.18,2.25],4152928,x,{metalness:.62,roughness:.32}),w("Level 4 gate pillar west",[.22,1.34,.5],[-.72,.67,2.25],2967628,x,{metalness:.68,roughness:.28}),w("Level 4 gate pillar east",[.22,1.34,.5],[.72,.67,2.25],2967628,x,{metalness:.68,roughness:.28}),w("Level 4 gate threshold",[1.28,.1,.58],[0,.05,2.25],7308672,x,{metalness:.5,roughness:.38}),x.visible=!1,Xe.add(x),k=new Fe,k.name="HQ level 5 command fortress wall",[[-2.72,-2.42],[2.72,-2.42],[-2.72,2.42],[2.72,2.42]].forEach((X,H)=>{O(`Level 5 heavy bastion ${H+1}`,new Tt(.46,.58,2.05,10),[X[0],1.03,X[1]],3038820,k,{metalness:.68,roughness:.28,emissive:601653,emissiveIntensity:.32}),O(`Level 5 bastion beacon ${H+1}`,new Kt(.1,9,6),[X[0],2.12,X[1]],8845055,k,{emissive:2997201,emissiveIntensity:1.35})}),w("Level 5 rear energy rail",[5.3,.08,.08],[0,1.52,-2.42],9369343,k,{emissive:2534077,emissiveIntensity:1.2}),w("Level 5 west energy rail",[.08,.08,4.8],[-2.72,1.52,0],9369343,k,{emissive:2534077,emissiveIntensity:1.2}),w("Level 5 east energy rail",[.08,.08,4.8],[2.72,1.52,0],9369343,k,{emissive:2534077,emissiveIntensity:1.2}),k.visible=!1,Xe.add(k),Ot=new Fe,Ot.name="HQ level 2 communications",O("HQ comms beacon",new Kt(.11,10,7),[-1.82,3.18,-1.18],7270143,Ot,{emissive:2071221,emissiveIntensity:1.2});let G=new Jt(7270143,2.2,4,2);G.position.set(-1.82,3.12,-1.18),Ot.add(G),Ot.visible=!1,Xe.add(Ot),q=new Fe,q.name="HQ level 4 laser upgrade",[-1,1].forEach(X=>{w("Laser pedestal",[.5,.28,.56],[X*2.25,.18,.85],2572098,q,{metalness:.42}),O("Laser emitter",new Tt(.1,.16,.95,10),[X*2.25,.75,.85],4902888,q,{metalness:.62,emissive:1534842,emissiveIntensity:.72})}),q.visible=!1,Xe.add(q),te=O("HQ level 5 shield ring",new Nn(3.35,.035,8,48),[0,.12,0],5627900,Xe,{emissive:880776,emissiveIntensity:1.1},[Math.PI/2,0,0]),te.visible=!1,w("Defensive compound north pad",[7.05,.09,.78],[0,.045,-5.05],3883832,Xe,{roughness:.96}),w("Defensive compound south pad",[7.05,.09,.78],[0,.045,5.05],3883832,Xe,{roughness:.96}),w("Defensive compound east pad",[.78,.09,10.1],[3.15,.045,0],3883832,Xe,{roughness:.96}),w("Defensive compound west pad",[.78,.09,10.1],[-3.15,.045,0],3883832,Xe,{roughness:.96}),w("Defensive compound north rail",[7,.16,.1],[0,.13,-5.47],10126931,Xe,{metalness:.18,roughness:.66}),w("Defensive compound south rail",[7,.16,.1],[0,.13,5.47],10126931,Xe,{metalness:.18,roughness:.66}),w("Defensive compound east rail",[.1,.16,10],[3.57,.13,0],10126931,Xe,{metalness:.18,roughness:.66}),w("Defensive compound west rail",[.1,.16,10],[-3.57,.13,0],10126931,Xe,{metalness:.18,roughness:.66});for(let X=0;X<8;X++){let H=f[X],W=new Fe;W.name=`Barricade lane ${X+1}`,W.position.set(H.x,0,H.z),W.rotation.y=H.rotation,W.userData.side=H.side,Xe.add(W);let ee=w("Barricade left",[1.02,.54,.46],[-.52,.29,0],8416586,W),pe=w("Barricade right",[1.02,.54,.46],[.52,.29,0],8416586,W);w("Barricade brace left",[.14,.68,.62],[-1.03,.34,0],5066045,W,{metalness:.22}),w("Barricade brace center",[.12,.62,.58],[0,.31,0],5066045,W,{metalness:.22}),w("Barricade brace right",[.14,.68,.62],[1.03,.34,0],5066045,W,{metalness:.22});let ye=new Fe;ye.name=`HQ level 2 reinforced barrier ${X+1}`,w("Reinforced barrier upper plate",[2.22,.42,.5],[0,.76,0],7306597,ye,{metalness:.34,roughness:.5}),w("Reinforced barrier top rail",[2.42,.12,.62],[0,1.02,0],9806459,ye,{metalness:.46,roughness:.38}),ye.visible=!1,W.add(ye);let Se=new Fe;Se.name=`HQ level 4 armored barrier ${X+1}`,w("Armored barrier face",[2.34,.58,.62],[0,.88,-.035],4153955,Se,{metalness:.62,roughness:.3}),w("Armored barrier energy strip",[1.86,.07,.66],[0,1.04,-.045],7727359,Se,{emissive:2132635,emissiveIntensity:1.05}),Se.visible=!1,W.add(Se);let Oe=new Fe;Oe.name=`Barricade damage marks ${X+1}`;let ze=w("Barricade crack A",[.055,.62,.03],[-.42,.55,-.335],1511692,Oe,{roughness:1}),It=w("Barricade crack B",[.055,.55,.03],[.47,.48,-.335],1511692,Oe,{roughness:1});ze.rotation.z=-.68,It.rotation.z=.74,Oe.visible=!1,W.add(Oe),W.userData.faceMaterials=[ee.material,pe.material],W.userData.reinforced=ye,W.userData.fortress=Se,W.userData.damageMarks=Oe,ge.push(W)}U=Xe.children.slice(),Ee(),De(),Te(),Re()}function lt(){_=document.createElement("canvas"),_.id="lsc-3d-prototype",_.style.cssText="position:absolute;inset:0;width:100%;height:100%;z-index:2;pointer-events:none;background:#283425;display:none",S.parentNode.insertBefore(_,S.nextSibling),Z(),C=new El({canvas:_,antialias:!0,alpha:!1,powerPreference:"high-performance"}),C.setPixelRatio(mn),C.shadowMap.enabled=y.shadows,C.shadowMap.type=Lo,C.outputColorSpace=bt,C.toneMapping=ca,C.toneMappingExposure=1.38,b=new Nr,b.background=new Ve(4280639),b.fog=new Dr(4280639,31,52),I=new Yt(45,1,.1,90),I.position.set(0,24.5,24.2),I.lookAt(0,0,-1.1),b.add(new ea(15398911,4608316,2.7));let A=new Yi(11194367,1.15);A.position.set(13,9,-9),b.add(A);let D=new Yi(16773073,3.75);D.position.set(-11,21,12),D.castShadow=y.shadows,D.shadow.mapSize.set(y.shadowMapSize,y.shadowMapSize),D.shadow.camera.left=-14,D.shadow.camera.right=14,D.shadow.camera.top=14,D.shadow.camera.bottom=-14,b.add(D),v=new aa,tt()}function Be(A){return 1+Math.floor((Math.max(1,Number(A)||1)-1)/5)%3}function At(A){return A===3?"RUINED URBAN PERIMETER":A===2?"COLLAPSED INDUSTRIAL SECTOR":"OVERRUN FORWARD OUTPOST"}function kt(A){let D=Math.floor((Math.max(1,Number(A)||1)-1)/5);return["REDHAVEN OUTSKIRTS","BLACKRIDGE INDUSTRIAL","WESTBRIDGE QUARANTINE","EVACUATION CORRIDOR","RUINED CITY CENTER","GROUND ZERO"][Math.min(D,5)]||"GROUND ZERO"}function Bt(A){let D=Math.floor((Math.max(1,Number(A)||1)-1)/5)%3;return D===1?"JUGGERNAUT":D===2?"OUTBREAK PRIME":"SIEGE BREAKER"}function Ct(A,D){if(!A||A.operation)return;let V=Be(A.phase),G=Math.max(1,Math.min(3,Number(A.assault)||1));me.forEach((H,W)=>{H.visible=W===V-1}),re.forEach((H,W)=>{H.visible=G>=W+2});let X=V===3?{ground:3421752,road:2566700,sky:3159096,near:25,far:45}:V===2?{ground:4014648,road:2961710,sky:3554357,near:28,far:48}:{ground:4609853,road:3423793,sky:4280639,near:31,far:52};if(be&&be.color.setHex(X.ground),ae.forEach(H=>H.color.setHex(X.road)),b.background.setHex(X.sky),b.fog.color.setHex(X.sky),b.fog.near=X.near-(G-1)*1.5,b.fog.far=X.far-(G-1)*2,_e.forEach((H,W)=>{let ee=(A.elapsed||0)*H.drift+W;H.mesh.position.y=H.baseY+Math.sin(ee*1.7)*.24+(A.elapsed||0)*H.drift%1.1,H.mesh.rotation.y+=D*(.08+W*.006),H.mesh.material&&(H.mesh.material.opacity=.18+Math.sin(ee)*.045+(G-1)*.025)}),Ne!==V||T){let H=A.bossSpawned&&!A.bossDefeated?` \xB7 ${Bt(A.phase)}`:G===3?" \xB7 FINAL ASSAULT":"";Bn(`PHASE ${A.phase} \xB7 ${kt(A.phase)}${H}`),Ne=V}}function en(A){if(I.position.copy(As),ns.copy(ts),m||!A){I.lookAt(ns);return}let D=Math.max(Number(A.artilleryPulse)||0,Number(A.destructionPulse)||0);if(D>0){let V=(A.elapsed||0)*46,G=Math.min(.14,D*.13);I.position.x+=Math.sin(V*1.7)*G,I.position.y+=Math.cos(V*2.3)*G*.45,I.position.z+=Math.sin(V*2.9)*G*.6,ns.x+=Math.cos(V*1.3)*G*.32}I.lookAt(ns)}function Ce(A){let D=A&&A.operationKind==="junkyard"?"junkyard":A&&A.operation?"operation":"campaign";if(Ie===D)return;Ie=D;let V=D==="operation",G=D==="junkyard",X=V||G;U.forEach(H=>{H.visible=!X}),j&&(j.visible=V),ce&&(ce.visible=G),xe&&!G&&(xe.visible=!1),G?(I.fov=49,As.set(11.4,9.1,14.9),ts.set(-.45,.58,-.8),I.position.set(11.4,9.1,14.9),I.lookAt(-.45,.58,-.8),b.background.setHex(2168848),b.fog.color.setHex(2168848),b.fog.near=19,b.fog.far=40,Bn(Y(A))):V?(I.fov=51,As.set(0,7.4,13.8),ts.set(0,.65,-3.9),I.position.set(0,7.4,13.8),I.lookAt(0,.65,-3.9),b.background.setHex(1121570),b.fog.color.setHex(1121570),b.fog.near=18,b.fog.far=38,Bn(Y(A))):(I.fov=45,As.set(0,24.5,24.2),ts.set(0,0,-1.1),I.position.set(0,24.5,24.2),I.lookAt(0,0,-1.1),b.background.setHex(4280639),b.fog.color.setHex(4280639),b.fog.near=31,b.fog.far=52,Bn("CENTRAL HQ \xB7 HOLT ON STATION")),I.updateProjectionMatrix()}function Ft(A,D=e){let V=new Rl;return V.setResourcePath(D),new Promise((G,X)=>{V.load(D+A,G,void 0,X)})}function ht(A,D=t){let V=new Ss;return new Promise((G,X)=>{V.load(D+A,H=>{H.colorSpace=bt,H.anisotropy=4,G(H)},void 0,X)})}function tn(A,D,V){if(!A||!A.animations||!A.animations[0])throw new Error(`Missing ${D} animation`);let G=A.animations[0].clone();return G.name=D,G.tracks.forEach(X=>{if(!/hips\.position$/i.test(X.name))return;let H=X.getValueSize(),W=X.values[0],ee=X.values[1],pe=X.values[2];for(let ye=0;ye<X.values.length;ye+=H)X.values[ye]=W,V&&(X.values[ye+1]=ee),X.values[ye+2]=pe}),G}function Ln(A,D,V){if(!A||!A.animations||!A.animations[0])throw new Error(`Missing ${D} pose source`);let G=A.animations[0],X=Math.max(0,Math.min(G.duration-1e-4,V||0)),H=G.tracks.map(W=>{let ee=W.getValueSize(),pe=W.createInterpolant(new Float32Array(ee)).evaluate(X),ye=new Float32Array(ee*2);return ye.set(pe,0),ye.set(pe,ee),new W.constructor(W.name,[0,1],ye,W.getInterpolation())});return new bi(D,1,H)}function zn(A){let D=new dn().setFromObject(A),V=Math.max(.01,D.max.y-D.min.y);A.scale.setScalar(1.72/V);let G=new dn().setFromObject(A);A.position.y-=G.min.y,A.traverse(X=>{if(!X.isMesh)return;X.castShadow=y.shadows,X.receiveShadow=!0,X.frustumCulled=!1;let W=(Array.isArray(X.material)?X.material:[X.material]).map(ee=>{if(!ee)return ee;let pe=ee.clone();return"roughness"in pe&&pe.roughness==null&&(pe.roughness=.76),"metalness"in pe&&pe.metalness==null&&(pe.metalness=.03),pe.needsUpdate=!0,pe});X.material=Array.isArray(X.material)?W:W[0]})}function Qn(A,D,V){A.animations=[],A.traverse(ye=>{ye.isMesh&&(ye.material=new Hi({map:D,color:16777215,roughness:.78,metalness:.08}),ye.castShadow=y.shadows,ye.receiveShadow=!0)});let X=new dn().setFromObject(A).getSize(new N),H=V.height?V.height/Math.max(.01,X.y):V.footprint/Math.max(.01,X.x,X.z);A.scale.setScalar(H);let W=new Fe;W.add(A);let ee=new dn().setFromObject(A),pe=ee.getCenter(new N);return A.position.x-=pe.x,A.position.y-=ee.min.y,A.position.z-=pe.z,W}function Rt(A){let D={Body:12157283,Eyes:1581087,Eyelashes:1053972,Shoes:1120278,Bottoms:2702132,Eyewear:9431285,Hats:2110511,Tops:4087634};A.traverse(ee=>{ee.isMesh&&(ee.material=new Hi({color:D[ee.name]||4217424,roughness:ee.name==="Eyewear"?.34:.7,metalness:ee.name==="Eyewear"?.24:.04,emissive:ee.name==="Eyewear"?734272:0,emissiveIntensity:ee.name==="Eyewear"?.45:0}),ee.castShadow=y.shadows,ee.receiveShadow=!0,ee.frustumCulled=!1)});let V=new dn().setFromObject(A),G=Math.max(.01,V.max.y-V.min.y);A.scale.setScalar(1.82/G),A.updateMatrixWorld(!0);let X=new dn().setFromObject(A),H=X.getCenter(new N);A.position.x-=H.x,A.position.y-=X.min.y,A.position.z-=H.z;let W=new Fe;return W.name="Commander Holt animated model",W.add(A),W}async function Ht(){let[A,D,V,G]=await Promise.all([Ft(g.holtModel),Ft(g.holtFire),Ft(E.weapon,n),ht(E.texture,n)]),X=tn(A,"holt-idle-aim",!0),H=tn(D,"holt-rifle-fire",!0),W=Rt(A);V.traverse(ye=>{ye.isMesh&&(ye.material=new Hi({map:G,color:4937042,roughness:.4,metalness:.46}),ye.castShadow=y.shadows,ye.receiveShadow=!0)}),V.position.set(-2,-1.2,0),V.rotation.set(0,0,0);let ee=null,pe=null;if(A.traverse(ye=>{!ee&&ye.isBone&&ye.name==="mixamorigRightHand"&&(ee=ye),!pe&&ye.isBone&&ye.name==="mixamorigLeftHand"&&(pe=ye)}),!ee)throw new Error("Commander Holt right-hand bone is missing");if(!pe)throw new Error("Commander Holt support-hand bone is missing");yt=ee,rt=pe,Ae=new Fe,Ae.name="Commander Holt two-hand rifle mount",yt.add(Ae),Ae.add(V),st=V,$=new pt(new ri(4.2,13,7),new Rn({color:16772982,transparent:!0,opacity:.96})),$.name="Commander Holt rifle flash",$.position.set(55.5,6.4,0),$.rotation.z=-Math.PI/2,$.visible=!1,V.add($),se=new Jt(16764757,0,2.6,2),se.position.copy($.position),V.add(se),oe=new sr(A),he=oe.clipAction(X),he.setLoop(_a,1/0),he.play(),fe=oe.clipAction(H),fe.setLoop(va,1),fe.clampWhenFinished=!0,z&&(z.visible=!1),J=W,Q.copy(J.scale),Xe.add(J)}async function jn(){let[A,D,V,G,X,H]=await Promise.all([Ft(p.base[0],t),ht(p.base[1]),Ft(p.radio[0],t),ht(p.radio[1]),Ft(p.tower[0],t),ht(p.tower[1])]);wt=new Fe,wt.name="Modular headquarters",Xe.add(wt),Pt=Qn(A,D,{footprint:3.05}),Pt.name="HQ level 1 center base",Pt.position.z+=.18,wt.add(Pt),Nt=Qn(V,G,{height:3.15}),Nt.name="HQ level 2 radio tower",Nt.position.set(-1.82,0,-1.18),wt.add(Nt);let W=Qn(X,H,{height:1.9}),ee=W;ee.name="HQ level 3 west security tower",ee.position.set(-2.02,0,.82),wt.add(ee),B.push(ee);let pe=W.clone(!0);pe.name="HQ level 3 east security tower",pe.position.set(2.02,0,.82),pe.rotation.y=Math.PI,wt.add(pe),B.push(pe),xt.visible=!1}async function Dt(){return L||(L=(async()=>{let[A,D,V,G,X]=await Promise.all([Ft(g.model),Ft(g.scout),Ft(g.run),Ft(g.attack),Ft(g.death)]);zn(A),zn(D),F.soldier=A,F.scout=D,K={run:tn(V,"zombie-run",!1),attack:tn(G,"zombie-punch",!0),waiting:Ln(G,"zombie-ready",0),death:tn(X,"zombie-death",!1)};try{await Ht()}catch(H){console.warn("Build 187 Commander Holt fallback:",H),z&&(z.visible=!0)}try{await jn()}catch(H){console.warn("Build 187 modular HQ fallback:",H),xt.visible=!0}return Bn(Ie==="junkyard"?"JUNKYARD RECOVERY \xB7 ARMORED CONVOY":Ie==="operation"?"DAILY OPERATION \xB7 FORWARD CONTAINMENT LINE":"CENTRAL HQ \xB7 HOLT ON STATION"),!0})().catch(A=>(console.warn("Build 187 battlefield asset fallback:",A),Bn("CENTRAL HQ \xB7 2D FALLBACK"),_&&(_.style.display="none"),S&&(S.style.visibility="visible"),!1)),L)}function ei(A){return A.variant?A.variant:A.kind==="runner"||A.kind==="grunt"&&A.id%4===1?"scout":"soldier"}function Ri(A,D,V,G){return A==="boss"?G==="outbreak"?5650504:G==="juggernaut"?5398874:8077358:A==="armored"?7891789:A==="runner"?8559526:D==="scout"?10128771:7901304}function Aa(A,D,V,G,X){let H=new Ve(Ri(D,V,G,X)),W=D==="boss"?Math.max(1,Math.min(3,Number(G)||1)):0,ee=[];return A.traverse(pe=>{if(!pe.isMesh)return;let Se=(Array.isArray(pe.material)?pe.material:[pe.material]).map(Oe=>{if(!Oe)return Oe;let ze=Oe.clone();return ze.color&&(D==="boss"?ze.color.lerp(H,.72):ze.color.multiply(H).lerp(new Ve(16777215),.32)),D==="boss"&&(ze.roughness=W>=3?.9:W===2?.82:.74,ze.metalness=Math.min(.16,Number(ze.metalness)||0)),ze.transparent=!1,ze.opacity=1,ze.needsUpdate=!0,ee.push(ze),ze});pe.material=Array.isArray(pe.material)?Se:Se[0]}),ee}function kf(A,D){let V=D||"siege",G={materials:[],armorParts:[]},X=(H,W)=>(H.castShadow=y.shadows,H.receiveShadow=!0,H.material.userData.baseEmissive=W||0,G.materials.push(H.material),A.add(H),H);if(V==="juggernaut"){let H=new pt(new Kt(.34,12,8),M(5135449,{metalness:.56,roughness:.5}));H.name="Juggernaut fitted chest plate",H.scale.set(1.04,.82,.42),H.position.set(0,1.02,-.14),G.armorParts.push(X(H)),[-.34,.34].forEach((ee,pe)=>{let ye=new pt(new Kt(.2,10,7),M(6911858,{metalness:.52,roughness:.48}));ye.name=`Juggernaut fitted shoulder plate ${pe+1}`,ye.scale.set(1.18,.7,.72),ye.position.set(ee,1.29,-.02),ye.rotation.z=ee<0?-.18:.18,G.armorParts.push(X(ye))});let W=new pt(new Nn(.21,.045,7,12,Math.PI),M(4082506,{metalness:.64,roughness:.4}));W.name="Juggernaut fitted neck guard",W.position.set(0,1.48,-.04),W.rotation.x=Math.PI/2,G.armorParts.push(X(W))}else if(V==="outbreak")[[0,.76,.25,.02],[-.2,1.03,.23,-.18],[.2,1.27,.21,.18],[0,1.49,.18,0]].forEach((H,W)=>{let ee=new pt(new ri(.11+W*.01,.4+W*.035,7),M(7616084,{roughness:.9,emissive:6099004,emissiveIntensity:.7}));ee.name=`Outbreak fitted dorsal spine ${W+1}`,ee.position.set(H[0],H[1],H[2]),ee.rotation.set(Math.PI/2+H[3],0,H[3]),X(ee,6099004)}),[[-.35,1.25,.01],[.35,1.25,.01],[-.23,.79,.15],[.23,.79,.15]].forEach((H,W)=>{let ee=new pt(new ki(.135+W%2*.025,1),M(W<2?10699384:7879265,{roughness:.84,emissive:7017033,emissiveIntensity:.85}));ee.name=`Outbreak fitted growth ${W+1}`,ee.position.set(H[0],H[1],H[2]),X(ee,7017033)});else{let H=new pt(new Nn(.3,.035,7,16),M(10117943,{metalness:.35,roughness:.58}));H.name="Siege Breaker command harness",H.position.set(0,1.05,-.12),H.rotation.x=Math.PI/2,X(H)}return G}function Hf(A){let D=null;return A.traverse(V=>{if(D||!V.isBone)return;(V.name||"").toLowerCase().replace(/[^a-z]/g,"").endsWith("hips")&&(D=V)}),D}function Vf(A){return A&&A.id!=null?`unit-${A.id}`:A}function Gf(A,D,V){let G=ei(A),X=F[G]||F.soldier,H=Bf(X),W=new Fe;W.name=A.kind==="boss"?"Infected boss":"Infected enemy",W.add(H),W.scale.setScalar(D||1),b.add(W);let ee=Aa(H,A.kind,G,A.bossGrade,A.bossArchetype),pe=A.kind==="boss"?kf(W,A.bossArchetype):{materials:[],armorParts:[]};ee.push(...pe.materials);let ye=new sr(W),Se={run:ye.clipAction(K.run),attack:ye.clipAction(K.attack),waiting:ye.clipAction(K.waiting),death:ye.clipAction(K.death)},Oe=Hf(H),ze={entity:A,root:W,model:H,mixer:ye,actions:Se,state:null,variant:G,hips:Oe,hipsAnchor:Oe?Oe.position.clone():null,materials:ee,bossArmorParts:pe.armorParts};return Lt.set(V,ze),ze}function Wf(A,D){return D?"death":A.moving?"run":A.engaged?"attack":"waiting"}function Xf(A,D,V){if(A.state===D)return;let G=A.state?A.actions[A.state]:null,X=A.actions[D];X&&(X.reset(),X.enabled=!0,X.setEffectiveWeight(1),X.setEffectiveTimeScale(1),X.setLoop(D==="death"?va:_a,D==="death"?1:1/0),X.clampWhenFinished=D==="death",D==="death"&&V&&X.setDuration(Math.max(.35,V)),D==="attack"&&X.setDuration(d),X.play(),G&&X.crossFadeFrom(G,D==="death"?.08:.16,!0),A.state=D)}function rs(A,D){let V=Math.min(S.width,S.height)*.54+45*(devicePixelRatio||1),G=8.2/Math.max(1,V);return[(A.x-D.hq.x)*G,(A.y-D.hq.y)*G]}function qf(A,D,V){let G=D.kind==="boss"?.38:.24,X=V?D.life>G?1:Math.min(1,Math.max(0,(D.life||0)/G)):1,H=!V&&(D.hit||0)>0,W=!V&&(D.armorHit||0)>0;A.materials.forEach(ee=>{if(ee&&(ee.transparent=X<1,ee.opacity=X,ee.depthWrite=X>.42,ee.emissive)){let pe=Number(ee.userData&&ee.userData.baseEmissive)||0;ee.emissive.setHex(W?4894664:H?8002322:pe),ee.emissiveIntensity=W?1.15:H?.85:pe?.72:0}})}function _h(A,D,V,G,X,H){let W=Vf(A),ee=Lt.get(W);ee||(ee=Gf(A,V,W)),ee.entity=A,H.add(W);let pe=rs(A,D),ye=-(A.aim||0)+Math.PI/2;if(ee.root.position.set(pe[0],0,pe[1]),ee.root.rotation.y=ye,Xf(ee,Wf(A,G),G?A.max:null),!G&&ee.state==="run"&&ee.actions.run.setEffectiveTimeScale(1),ee.mixer.update(X),ee.hips&&ee.hipsAnchor&&ee.hips.position.copy(ee.hipsAnchor),ee.root.position.set(pe[0],0,pe[1]),ee.root.rotation.y=ye,ee.bossArmorParts&&ee.bossArmorParts.length){let Se=!G&&Number(A.armor)>0;ee.bossArmorParts.forEach(Oe=>{Oe.visible=Se})}qf(ee,A,G)}function yh(A,D){return D.operation?2.14:A.bossArchetype==="juggernaut"?1.82:A.bossArchetype==="outbreak"?1.74:1.76}function Yf(A){if(A.operation){[wt,xt,Ot,Je,R,x,k,q,te,at,ot,nt,Mt,St].forEach(V=>{V&&(V.visible=!1)}),ue=0,Bn(Y(A));return}let D=Math.max(1,Number(A.hq&&A.hq.level)||1);at&&(at.visible=!0),wt?(wt.visible=!0,wt.scale.setScalar(1+Math.min(4,D-1)*.035),Pt.visible=!0,Nt.visible=D>=2,B.forEach(V=>{V.visible=D>=3}),xt.visible=!1):xt&&(xt.visible=!0,xt.scale.setScalar(1+Math.min(4,D-1)*.06)),Ot&&(Ot.visible=D>=2),Je&&(Je.visible=D>=2),R&&(R.visible=D>=3),x&&(x.visible=D>=4),k&&(k.visible=D>=5),q&&(q.visible=D>=4),te&&(te.visible=D>=5),ot&&(ot.visible=D>=2),nt&&(nt.visible=D>=3),Mt&&(Mt.visible=D>=4),St&&(St.visible=D>=5),ue!==D&&(ue=D,Bn(`CENTRAL HQ L${D} \xB7 HOLT ON STATION`))}function Zf(){!Ae||!st||!yt||!rt||(J.updateMatrixWorld(!0),rt.getWorldPosition(wi),yt.worldToLocal(wi),!(wi.lengthSq()<1e-4)&&(wi.normalize(),ws.setFromUnitVectors(Dl,wi),Ae.quaternion.copy(ws)))}function $f(A,D){if(!J)return;let V=(A.hero.flash||0)>0;oe&&he&&fe&&(V&&!de&&(ie=.24,he.enabled=!0,he.setEffectiveWeight(.18),fe.reset(),fe.enabled=!0,fe.setEffectiveWeight(1),fe.setDuration(.24),fe.play()),de=V,ie=Math.max(0,ie-D),ie<=0&&fe.isRunning()&&(fe.stop(),he.enabled=!0,he.setEffectiveWeight(1)),oe.update(D));let G=rs(A.hero,A),X=A.operationKind==="junkyard"?.28:A.operation?.24:1.15;J.position.set(G[0],X+Math.sin(A.elapsed*2.8)*.018,G[1]);let H=Math.max(1,Math.min(5,Number(A.commanderVisualTier)||1));J.scale.set(Q.x*(1+(H-1)*.035),Q.y*(1+(H-1)*.0075),Q.z*(1+(H-1)*.035)),J.rotation.y=-(A.hero.aim||-Math.PI/2)+Math.PI/2,J.visible=!0,Zf(),$.visible=V,$.visible&&$.scale.setScalar(.82+Math.random()*.4),se&&(se.intensity=V?6.5:0)}function Kf(A){if(!le||!Pe)return;let D=rs(A.turret,A);le.position.set(D[0],A.operationKind==="junkyard"?.28:A.operation?.24:1.15,D[1]),Pe.rotation.y=-(A.turret.aim||0)+Math.PI/2,le.visible=!0;let V=Math.max(1,Number(A.hq&&A.hq.level)||1);mt&&(mt.visible=V>=2),Ze&&(Ze.visible=V>=4),qe.color.setHex(V>=4?7270143:V>=2?10284287:16760923);let G=(A.turret.flash||0)>0;qe.intensity=G?8.5:0,Le&&(Le.visible=G,G&&Le.scale.setScalar(.86+Math.random()*.34),Le.children.forEach(X=>{X.material&&X.material.color.setHex(V>=4?9369343:16765288)}))}function Jf(A){if(!xe)return;if(!A||A.operationKind!=="junkyard"){xe.visible=!1;return}let D=A.objectiveVehicle||A.enemies&&A.enemies.find(W=>W.kind==="vehicle");if(!D){xe.visible=!1;return}let V=rs(D,A),G=!!(A.vehicleDestroyed||D.destroyed),X=!G&&(D.hit||0)>0,H=G?Math.max(0,Math.min(1,(Number(A.vehicleDestructionTimer)||0)/1.45)):0;xe.visible=!0,xe.position.set(V[0],.04,V[1]),xe.rotation.set(G?-.035:0,-(D.aim||0)+Math.PI/2,G?.14:0),Me.forEach(W=>{let ee=W.userData.baseColor==null?W.color.getHex():W.userData.baseColor;W.color.setHex(ee),G&&W.color.multiplyScalar(.48),W.emissive.setHex(X?11021068:G?1509124:0),W.emissiveIntensity=X?1.15:G?.28:0}),Ge.forEach(W=>{W.material&&(W.material.emissiveIntensity=G?.04:1.35)}),ve&&(ve.intensity=G?0:2.2+Math.sin((A.elapsed||0)*8)*.8),We.forEach((W,ee)=>{if(W.visible=G&&H>0,!W.visible)return;let pe=.76+Math.sin((A.elapsed||0)*(17+ee*4)+ee)*.18+Math.random()*.16,ye=Math.min(1.55,.45+(1-H)*5.5);W.scale.setScalar(pe*Math.min(ye,.55+H*1.15)),W.rotation.y+=.12+ee*.035,W.material.opacity=Math.min(.96,.35+H*.7)}),$e&&($e.intensity=G?2.2+H*7.5+Math.sin((A.elapsed||0)*22)*.8:0)}function Qf(A,D,V,G,X){let H=!!D&&D.hp>0;if(A.visible=H,!H)return;let W=Math.max(0,Math.min(1,D.hp/Math.max(1,D.maxHp))),ee=V>=5?3960176:V>=4?5401448:V>=3?7567453:V>=2?8746062:8416586,pe=D.flash>0?11749429:W<.35?5850932:W<.7?7363390:ee;A.userData.faceMaterials.forEach(Se=>{Se.color.setHex(pe),Se.emissive.setHex(D.flash>0?4527374:0),Se.emissiveIntensity=D.flash>0?.8:0}),A.userData.reinforced&&(A.userData.reinforced.visible=V>=2||G,A.userData.reinforced.scale.y=V>=3?1.18:1),A.userData.fortress&&(A.userData.fortress.visible=V>=4||X,A.userData.fortress.scale.y=V>=5?1.22:1),A.userData.damageMarks&&(A.userData.damageMarks.visible=W<.7,A.userData.damageMarks.children.forEach((Se,Oe)=>{Se.visible=W<(Oe?.35:.7)}));let ye=Math.max(0,Number(D.stress)||0);A.position.y=ye>0?Math.sin(ye*95)*.025:0}function jf(A){if(A.operationKind==="junkyard"){ge.concat(ne).forEach(W=>{W.visible=!1});return}let D=Math.max(1,Number(A.hq&&A.hq.level)||1),V=!!(A.research&&A.research.barrierHp>0),G=!!(A.research&&A.research.barrierDamageReduction>0),X=A.operation?ne:ge;(A.operation?ge:ne).forEach(W=>{W.visible=!1}),X.forEach((W,ee)=>{let pe=A.lanes&&A.lanes[ee]&&A.lanes[ee].barricade;Qf(W,pe,D,V,G)})}function ed(A){let D=A.source==="turret"?wa.turret:wa.standard,V=new pt(D,new Rn({color:A.color||16772981,transparent:!0,opacity:.98,blending:Zi,depthWrite:!1}));V.frustumCulled=!1,b.add(V);let G={tracer:V,geometry:D};return gt.set(A,G),G}function td(A,D){A.bullets.forEach(V=>{let G=gt.get(V);G||(G=ed(V)),D.add(V);let X=rs({x:V.px,y:V.py},A),H=rs(V,A),W=A.operationKind==="junkyard"?.28:A.operation?.24:1.15,ee=V.source==="commander"?W+1.08:V.source==="turret"?W+.76:.8,pe=new N(X[0],ee,X[1]),ye=new N(H[0],ee,H[1]),Se=ye.clone().sub(pe),Oe=Math.max(.05,Se.length());G.tracer.position.copy(pe).add(ye).multiplyScalar(.5),G.tracer.quaternion.setFromUnitVectors(Ll,Se.normalize()),G.tracer.scale.set(1,Oe,1),G.tracer.material.opacity=Math.min(1,Math.max(.42,V.life*2.2))});for(let[V,G]of gt)D.has(V)||(b.remove(G.tracer),G.tracer.material.dispose(),gt.delete(V))}function nd(A){let D=String(A&&A.type||"");return Object.prototype.hasOwnProperty.call(ss,D)?D:"impact"}function id(A){let D=nd(A),V=D==="shockwave",G=D==="smoke",X=ss[D].pop();if(X)return X.effect.visible=!0,X.effect.position.set(0,0,0),X.effect.scale.setScalar(1),X.effect.rotation.set(V?-Math.PI/2:0,0,0),X.effect.material.color.set(A.color||16777215),X.effect.material.opacity=G?.32:.9,X.effect.material.blending=G?ii:Zi,b.add(X.effect),rn.set(A,X),X;let H=Nl[D],W=new pt(H,new Rn({color:A.color||16777215,transparent:!0,opacity:G?.32:.9,blending:G?ii:Zi,depthWrite:!1,side:Fn}));W.frustumCulled=!1,V&&(W.rotation.x=-Math.PI/2),b.add(W);let ee={effect:W,geometry:H,isFlat:V,isSmoke:G,key:D};return rn.set(A,ee),ee}function sd(){return Object.keys(ss).reduce((A,D)=>A+ss[D].length,0)}function Mh(A,D){b.remove(D.effect),rn.delete(A),D.effect.visible=!1,sd()<y.effectPoolCap?ss[D.key].push(D):D.effect.material.dispose()}function rd(A,D){let V=Math.min(S.width,S.height)*.54+45*(devicePixelRatio||1),G=8.2/Math.max(1,V);A.particles.forEach(X=>{if((X.delay||0)>0)return;let H=rn.get(X);H||(H=id(X)),D.add(X);let W=rs(X,A),ee=Math.max(0,Math.min(1,X.life/Math.max(.01,X.max||1))),pe=1-ee,ye=Math.max(.045,(X.r||8)*G);if(H.key==="artillery")H.effect.position.set(W[0],2.15+pe*.35,W[1]),H.effect.scale.set(ye*(.28+pe*.16),.88+ee*.34,ye*(.28+pe*.16)),H.effect.material.opacity=Math.min(1,ee*1.35);else if(H.key==="shockwave")H.effect.position.set(W[0],.07,W[1]),H.effect.scale.setScalar(ye*(.4+pe*1.35)),H.effect.material.opacity=ee*.82;else if(H.key==="fireball"||H.key==="vehicle-explosion"){let Se=H.key==="vehicle-explosion";H.effect.position.set(W[0],(Se?1.15:.86)+pe*.46,W[1]),H.effect.scale.setScalar(ye*((Se?.34:.28)+pe*(Se?1.25:.95))),H.effect.rotation.y+=.19,H.effect.rotation.z+=.11,H.effect.material.opacity=Math.min(1,ee*1.55)}else if(H.key==="smoke")H.effect.position.set(W[0]+Math.sin(pe*7)*.18,.62+pe*2.4,W[1]),H.effect.scale.set(ye*(.5+pe*.8),ye*(.68+pe*1.2),ye*(.5+pe*.8)),H.effect.rotation.y+=.035,H.effect.material.opacity=ee*.34;else{let Se=X.type==="barrier"?.45:.78+Math.sin(pe*Math.PI)*.5;H.effect.position.set(W[0],Se,W[1]),H.effect.scale.setScalar(ye*(.72+pe*.58)),H.effect.material.opacity=ee*.92}H.key==="debris"&&(H.effect.rotation.x+=.18,H.effect.rotation.y+=.23)});for(let[X,H]of rn)D.has(X)||Mh(X,H)}function Sh(A,D){D.mixer.stopAllAction(),b.remove(D.root),D.materials.forEach(V=>V&&V.dispose&&V.dispose()),Lt.delete(A)}function ad(){for(let[A,D]of Lt)Sh(A,D);for(let[,A]of gt)b.remove(A.tracer),A.tracer.material.dispose();gt.clear();for(let[A,D]of Array.from(rn))Mh(A,D);J&&(J.visible=!1),le&&(le.visible=!1),xe&&(xe.visible=!1)}function od(){let A=S.getBoundingClientRect(),D=Math.max(2,A.width|0),V=Math.max(2,A.height|0);D===Cs&&V===Rs||(Cs=D,Rs=V,C.setSize(D,V,!1),I.aspect=D/V,I.updateProjectionMatrix())}function ld(A){if(!C||document.hidden||A<=0||(Ai+=A,is++,is<y.adaptiveSampleFrames))return;let D=Ai/is;Ai=0,is=0;let V=mn;D>.025&&mn>mr?(V=Math.max(mr,mn-.15),Ci=0):D<.018&&mn<Math.min(y.maxPixelRatio,devicePixelRatio||1)?(Ci++,Ci>=3&&(V=Math.min(Math.min(y.maxPixelRatio,devicePixelRatio||1),mn+.1),Ci=0)):Ci=0,!(Math.abs(V-mn)<.01)&&(mn=V,C.setPixelRatio(mn),Cs=0,Rs=0)}function gr(A){Jn&&(clearTimeout(Jn),Jn=0);let D=Mn;Mn=null,D&&D(A)}s.start=function(A,D,V){S=A;try{C||lt(),P=!0,Ce(D||{operation:!1}),Mn=typeof V=="function"?V:null,T.style.display="block",Bn(Y(D,!F.soldier)),S.style.visibility="hidden",_.style.display="none",Jn&&clearTimeout(Jn),Jn=setTimeout(()=>{Mn&&(P=!1,_.style.display="none",S.style.visibility="visible",gr(!1))},12e3),Dt().then(G=>{if(P){if(!G){S.style.visibility="visible",gr(!1);return}_.style.display="block",D&&s.render(D)}})}catch(G){console.warn("Build 187 3D fallback:",G),P=!1,_&&(_.style.display="none"),S.style.visibility="visible",gr(!1)}},s.stop=function(){P=!1,Ie="",gr(!1),de=!1,ie=0,se&&(se.intensity=0),fe&&fe.stop(),he&&(he.enabled=!0,he.setEffectiveWeight(1),he.isRunning()||he.play()),ad(),_&&(_.style.display="none"),T&&(T.style.display="none"),S&&(S.style.visibility="visible")},s.render=function(A){if(!P||!C||!F.soldier)return!1;Ce(A),od();let D=Math.min(.05,v.getDelta()),V=new Set,G=new Set,X=new Set;Ct(A,D),Yf(A),$f(A,D),Kf(A),Jf(A),jf(A),A.enemies.forEach(H=>{if(H.kind==="vehicle")return;let W=H.kind==="boss"?yh(H,A):H.kind==="armored"?1.24:H.kind==="runner"?.94:1.06;_h(H,A,W,!1,D,V)}),A.corpses.forEach(H=>{let W=H.kind==="boss"?yh(H,A):H.kind==="armored"?1.24:H.kind==="runner"?.94:1.06;_h(H,A,W,!0,D,V)});for(let[H,W]of Lt)V.has(H)||Sh(H,W);return td(A,G),rd(A,X),en(A),C.render(b,I),ld(D),Mn&&gr(!0),!0},window.LSC3DPrototype=s})();})();
/*! Bundled license information:

three/build/three.core.js:
three/build/three.module.js:
  (**
   * @license
   * Copyright 2010-2026 Three.js Authors
   * SPDX-License-Identifier: MIT
   *)

three/examples/jsm/libs/fflate.module.js:
  (*!
  fflate - fast JavaScript compression/decompression
  <https://101arrowz.github.io/fflate>
  Licensed under MIT. https://github.com/101arrowz/fflate/blob/master/LICENSE
  version 0.8.2
  *)
*/
