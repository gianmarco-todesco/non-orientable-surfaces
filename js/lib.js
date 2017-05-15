function makeTextPlane(txt, color, size) {
    var dynamicTexture = new BABYLON.DynamicTexture("DynamicTexture", 50, scene, true);
    dynamicTexture.hasAlpha = true;
    dynamicTexture.drawText(txt, 5, 40, "bold 36px Arial", color , "transparent", true);
    var plane = new BABYLON.Mesh.CreatePlane("TextPlane", size, scene, true);
    plane.material = new BABYLON.StandardMaterial("TextPlaneMaterial", scene);
    plane.material.backFaceCulling = false;
    plane.material.specularColor = new BABYLON.Color3(0, 0, 0);
    plane.material.diffuseTexture = dynamicTexture;
    return plane;
}


function makeAxes(size) {
    var obj = new BABYLON.Mesh("ciao", scene);
    obj.visibility = false;

    var axisX = BABYLON.Mesh.CreateLines("axisX", [
      new BABYLON.Vector3.Zero(), new BABYLON.Vector3(size, 0, 0), new BABYLON.Vector3(size * 0.95, 0.05 * size, 0),
      new BABYLON.Vector3(size, 0, 0), new BABYLON.Vector3(size * 0.95, -0.05 * size, 0)
      ], scene);
    axisX.parent = obj;
    axisX.color = new BABYLON.Color3(1, 0, 0);

    var xChar = makeTextPlane("X", "red", size / 10);
    xChar.parent = obj;
    xChar.position = new BABYLON.Vector3(0.9 * size, -0.05 * size, 0);

    var axisY = BABYLON.Mesh.CreateLines("axisY", [
        new BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, size, 0), new BABYLON.Vector3( -0.05 * size, size * 0.95, 0),
        new BABYLON.Vector3(0, size, 0), new BABYLON.Vector3( 0.05 * size, size * 0.95, 0)
        ], scene);
    axisY.parent = obj;
    axisY.color = new BABYLON.Color3(0, 1, 0);

    var yChar = makeTextPlane("Y", "green", size / 10);
    yChar.parent = obj;
    yChar.position = new BABYLON.Vector3(0, 0.9 * size, -0.05 * size);

    var axisZ = BABYLON.Mesh.CreateLines("axisZ", [
        new BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, 0, size), new BABYLON.Vector3( 0 , -0.05 * size, size * 0.95),
        new BABYLON.Vector3(0, 0, size), new BABYLON.Vector3( 0, 0.05 * size, size * 0.95)
        ], scene);
    axisZ.parent = obj;
    axisZ.color = new BABYLON.Color3(0, 0, 1);

    var zChar = makeTextPlane("Z", "blue", size / 10);
    zChar.parent = obj;
    zChar.position = new BABYLON.Vector3(0, 0.05 * size, 0.9 * size);

    return obj;
}

Vector3 = BABYLON.Vector3;
Color3 = BABYLON.Color3;
Matrix = BABYLON.Matrix;
Quaternion = BABYLON.Quaternion;

var canvas = document.querySelector("#renderCanvas");
var engine = new BABYLON.Engine(canvas, true);
var scene = new BABYLON.Scene(engine);
scene.clearColor = new Color3( .5, .5, .5);
var camera = new BABYLON.ArcRotateCamera("camera1",  0, 0, 0, new BABYLON.Vector3(0, 0, 0), scene);
camera.setPosition(new Vector3(0, 0, -50));
camera.radius = 50;



var mainGroup = new BABYLON.Mesh("mainGroup", scene);
mainGroup.visibility = false;
mainGroup.rotationQuaternion  = new BABYLON.Quaternion();




function myRotate(q,dx,dy) {
    var qq = (new BABYLON.Quaternion())
        .multiply(BABYLON.Quaternion.RotationAxis(new Vector3(1,0,0), -dy*0.01))
        .multiply(BABYLON.Quaternion.RotationAxis(new Vector3(0,1,0), -dx*0.01))
        .multiply(q)
        .normalize();
    q.copyFrom(qq);
}

function clamp(x,v0,v1) { return x<v0?v0:x>v1?v1:x; }


Vector3.cubicBezier = function(v0,v1,v2,v3,t) {
    var t2=t*t,t3=t2*t,it = 1-t, it2=it*it, it3=it2*it;
    return new Vector3(
        it3 * v0.x + 3 * it2 * t * v1.x + 3 * it * t2 * v2.x + t3 * v3.x,
        it3 * v0.y + 3 * it2 * t * v1.y + 3 * it * t2 * v2.y + t3 * v3.y,
        it3 * v0.z + 3 * it2 * t * v1.z + 3 * it * t2 * v2.z + t3 * v3.z);
}

Vector3.cubicBezierD = function(v0,v1,v2,v3,t) {
    var t2=t*t,t3=t2*t,it = 1-t, it2=it*it, it3=it2*it;
    return new Vector3(
        - 3 * it2 * v0.x + (3 * it2 - 6*t*it) * v1.x + (-3 * t2 + 6 * t * it) * v2.x + 3 * t2 * v3.x,
        - 3 * it2 * v0.y + (3 * it2 - 6*t*it) * v1.y + (-3 * t2 + 6 * t * it) * v2.y + 3 * t2 * v3.y,
        - 3 * it2 * v0.z + (3 * it2 - 6*t*it) * v1.z + (-3 * t2 + 6 * t * it) * v2.z + 3 * t2 * v3.z);
}

function subParam(t,a,b) { return t<=a?0 : t>=b?1 : (t-a)/(b-a); }
function step(t,a,b) { return t<=a?0 : t>=b?1 : (t-a)/(b-a); }
function smooth(t) { return t*t*(3-2*t); }


function smoothStep(t,t0,t1) {
    if(t<t0) return 0;
    else if(t>t1) return 1;
    else return 0.5-0.5*Math.cos(Math.PI*(t-t0)/(t1-t0));
}

function smoothBump(t,t0,t1) {
    if(t<t0 || t>t1) return 0;
    else return 0.5-0.5*Math.cos(2*Math.PI*(t-t0)/(t1-t0));
}

//
// f = makeCutFunction(t,q,w,v0,v1); 
// f(u) in [v0,v1]
// se t = 0 f(u) = v0
// se t = 1 f(i) = v1
// per t in [0,q] e [1-q,1] c'è l'entrata e l'uscita delle "forbici"
// per t in [q,1-q] il taglio si estende
// la larghezza del segmento di taglio diagonale è w
function makeCutFunction(t,q,w,v0,v1) {
    var vv0 = v0, dv = v1-v0;
    if(t<=q) {
        if(t<0)t=0;
        var u0=0, u1=w; dv *= t/q;
        return function(u) {
            if(u<=u0||u>=u1) return vv0;
            else return v0 + dv * smoothBump(u,u0,u1);
        };
    } else if(t<1-q) {
        var u0=0, u1 = w*0.5, u2 = w*0.5 + (1-w)*(t-q)/(1-2*q), u3 = u2+w*0.5, u4 = 1.0;
        return function(u) {
            if(u<u0) return v0;
            else if(u<u1) return v0+dv*smoothStep(u,u0,u1);
            else if(u<u2) return v1;
            else if(u<u3) return v0+dv*(1-smoothStep(u,u2,u3));
            else return v0;
        };
    } else {
        if(t>1)t=1;
        var u0=0, u1=w*0.5, u2=1-w*0.5, u3=1.0; dv *= (1-t)/q;
        return function(u) {
            if(u<u0) return v0;
            else if(u<u1) return v1 - dv * (1-smoothStep(u,u0,u1));
            else if(u<u2) return v1;
            else if(u<=u3) return v1 - dv * smoothStep(u,u2,u3);
            else return v0;
        };

    }
}


function HSVToColor(h, s, v) {
    var r, g, b, i, f, p, q, t;
    if (arguments.length === 1) {
        s = h.s, v = h.v, h = h.h;
    }
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return new BABYLON.Color3(r,g,b);
}

var imgPopup;

function showImage(url) {
    imgPopup = document.createElement("img");
    imgPopup.style.opacity = 0;
    imgPopup.style.position = "absolute";
    imgPopup.style.top = "50%";
    imgPopup.style.left = "50%";
    imgPopup.style.transition= "opacity 500ms linear";
    imgPopup.pointerEvents = "none";        
    document.body.appendChild(imgPopup);     
    imgPopup.onload = function() {
        imgPopup.style.marginLeft = "-" +  Math.floor(imgPopup.width/2) + "px";
        imgPopup.style.marginTop = "-" + Math.floor(imgPopup.height/2) + "px";
        imgPopup.style.opacity = 1;
    } 
    imgPopup.src = url;
}

function hideImage() {
    if(!imgPopup) return;
    imgPopup.style.opacity = 0;
    var old = imgPopup;
    setTimeout(function() { document.body.removeChild(old); }, 600);
    imgPopup = null;
}

//--------------------------------------


function Sphere(options) {
    this.positions = [];
    this.indices = [];
    this.normals = [];
    this.uvs = [];    
    this.radius = options.radius || 100;
    this.theta0 = options.theta0 || 0;
    this.theta1 = options.theta1 || 2*Math.PI;
    
    this.generate();
    this.compute();    
    this.makeMesh();
}

Sphere.prototype.generate = function() {
    var n = this.n = 200;
    var m = this.m = 200;
    for(var i=0;i<2*n*m;i++)
    {
        this.positions.push(0,0,0);
        this.normals.push(0,0,0);            
        this.uvs.push(0,0);   
    }
    for(var i=0; i+1<n; i++) {
        for(var j=0; j+1<m; j++) {
            var k = 2*(i*m+j);    
            this.indices.push(k,k+2,k+2+2*m,  k,k+2+2*m,k+2*m);
            this.indices.push(k+1,k+3+2*m,k+3,  k+1,k+2*m+1,k+3+2*m);
        }
    }
    for(var i=0;i<n;i++) {
        var u = i/(n-1);
        for(var j=0;j<m;j++) {
            var v = j/(m-1);
            var k = 4*(i*m+j);
            this.uvs[k] = u;
            this.uvs[k+1] = v;
            this.uvs[k+2] = u;
            this.uvs[k+3] = v;            
        }            
    }
}
    
Sphere.prototype.compute = function() {
    var n = this.n;
    var m = this.m;
    var k = 0;
    for(var i=0;i<n;i++) {
        var u = i/(n-1);
        var theta = this.theta0 * (1-u) + this.theta1 * u;
        var csTheta = Math.cos(theta), snTheta = Math.sin(theta);
        
        for(var j=0;j<m;j++) {
            var v = j/(m-1);
            var phi = v*Math.PI*2;
            var csPhi = Math.cos(phi), snPhi = Math.sin(phi);
            var nrm = new Vector3(csPhi*csTheta, snTheta, snPhi*csTheta);
            var pos = nrm.scale(this.radius);            
            this.positions[k+0] = this.positions[k+3] = pos.x;
            this.positions[k+1] = this.positions[k+4] = pos.y;
            this.positions[k+2] = this.positions[k+5] = pos.z;
            this.normals[k+0] = nrm.x;
            this.normals[k+1] = nrm.y;
            this.normals[k+2] = nrm.z;
            this.normals[k+3] = -nrm.x;
            this.normals[k+4] = -nrm.y;
            this.normals[k+5] = -nrm.z;
            k += 6;
        }
    }    
}


Sphere.prototype.makeMesh = function() {
    var mesh = this.mesh = new BABYLON.Mesh("Sphere", scene);
    
    var vertexData = new BABYLON.VertexData();
    vertexData.positions = this.positions;
    vertexData.indices = this.indices;    
    vertexData.normals = this.normals;
    vertexData.uvs = this.uvs;
    vertexData.applyToMesh(mesh, true);    
}

Sphere.prototype.dispose = function() {
    this.mesh.dispose();
    this.mesh = null;
}
