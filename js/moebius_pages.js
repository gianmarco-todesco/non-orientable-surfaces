
var moebiusWidth = 6.0;
var moebiusThickness = 0.25;

var moebiusPagesMaterials = {};

(function() {
    var materials = moebiusPagesMaterials;
    var mat;
    mat = materials.material1 =  new BABYLON.StandardMaterial("FoldingMoebius.mat1", scene);
    mat.diffuseColor = new Color3(0.4,0.95,0.97);   
    
    mat = materials.material2 =  new BABYLON.StandardMaterial("FoldingMoebius.mat2", scene);
    mat.diffuseColor = new Color3(0.9,0.1,0.1);   

    mat = materials.material10 =  new BABYLON.StandardMaterial("FoldingMoebius.mat10", scene);
    mat.diffuseTexture = new BABYLON.Texture("textures/sliding_moebius_texture.png", scene);
     
})();


var foldingMoebiusPage = {
    w0 : 16,
};


foldingMoebiusPage.begin = function() {
    var w = this.w0, h = moebiusThickness;
    var strip = this.strip = new MoebiusPart({c1x:-w,c1y:-h, c2x:w,c2y:h}, 
        moebiusPagesMaterials.material1, mainGroup);
    strip.psi = Math.PI/2;
    strip.curvature = 0.0;
    strip.r0 = this.w0/Math.PI;
    strip.update();
    strip.mesh.rotation.y = Math.PI/2;
    
}

foldingMoebiusPage.drag = function(dx,dy) {
    var strip = this.strip;
    var c = strip.curvature = clamp(strip.curvature + dx * 0.01, 0, 1);
    var c1 = smoothStep(c,0,0.5);
    strip.r0 = (1-c) * this.w0/Math.PI + c * 16;
    var w = (1-c1)*this.w0 + c1*moebiusWidth;
    strip.section.c1x = -w;
    strip.section.c2x =  w;
    
    strip.update();
    strip.mesh.rotation.y = (1-c)*Math.PI/2;
}

foldingMoebiusPage.end = function() {
    this.strip.dispose();
    this.strip = null;
}

//-----------------------------------------------------------------------------


var paintingMoebiusPage = {
    
};

paintingMoebiusPage.begin = function() {
    var w = moebiusWidth, h = moebiusThickness;

    var strip = this.stripMesh = new BABYLON.Mesh("paintingMoebius", scene);
    this.stripMesh.parent = mainGroup;

    var strip1 = this.strip1 = new MoebiusPart({c1x:-w,c1y:-h, c2x:w,c2y:h}, moebiusPagesMaterials.material1, this.stripMesh);
    strip1.psi = Math.PI/2;
    strip1.curvature = 1.0;
    strip1.twist = 0.5;
    strip1.update();
    
    var strip2 = this.strip2 = new MoebiusPart({c1x:-w,c1y:h+0.01, c2x:w,c2y:h+0.10}, moebiusPagesMaterials.material2, this.stripMesh);
    strip2.psi = Math.PI/2;
    strip2.curvature = 1.0;
    strip2.twist = 0.5;
    strip2.phi1 = 0.0;
    strip2.update();
    
    var cylinder = this.cylinder = BABYLON.MeshBuilder.CreateCylinder("paintingMoebius.cylinder", {
        diameter:4,
        height:w*2
        },scene);
    cylinder.parent = mainGroup;
    cylinder.material = moebiusPagesMaterials.material2;
    
    this.placeCylinder();
}

paintingMoebiusPage.placeCylinder = function() {    
    var matrix = this.strip2.getMatrixAt(1);
    var scale = new Vector3(), dummy = new Vector3();
    var rotation = new Quaternion();
    matrix.decompose(scale, rotation, dummy);
    
    var cylinder = this.cylinder;
    cylinder.rotationQuaternion = rotation.multiply(Quaternion.RotationYawPitchRoll(0,0,Math.PI/2));
    cylinder.position.copyFrom(Vector3.TransformCoordinates(new Vector3(0,2+moebiusThickness,0), matrix));
} 

paintingMoebiusPage.drag = function(dx,dy) {
    var strip = this.strip;
    this.strip2.phi1 = clamp(this.strip2.phi1 + dx * 0.01, 0, 4*Math.PI);
    this.strip2.update();
    this.placeCylinder();
}

paintingMoebiusPage.end = function() {
    this.strip1.dispose();
    this.strip2.dispose();
    this.cylinder.dispose();
    this.strip1 = this.strip2 = this.cylinder = null;
}


//-----------------------------------------------------------------------------


var cutting2MoebiusPage = {
    
};

cutting2MoebiusPage.begin = function() {
    
    var w = moebiusWidth, h = moebiusThickness;

    var strip1 = this.strip1 = new MoebiusPart2({c1x:-w,c1y:-h, c2x:0,c2y:h}, moebiusPagesMaterials.material1, mainGroup);
    strip1.psi = Math.PI/2;
    strip1.curvature = 1.0;
    strip1.twist = 0.5;
    strip1.update();

    var strip2 = this.strip2 = new MoebiusPart2({c1x:0,c1y:-h, c2x:w,c2y:h}, moebiusPagesMaterials.material1, mainGroup);
    strip2.psi = Math.PI/2;
    strip2.curvature = 1.0;
    strip2.twist = 0.5;
    strip2.update();

    var parameter = this.parameter = 0.0;    
}

cutting2MoebiusPage.drag = function(dx,dy) {
    var parameter = this.parameter = clamp(this.parameter + dx*0.01, 0,1);

    this.strip1.section.c2x = makeCutFunction(parameter, 0.1, 0.2, 0.0, -1);
    this.strip2.section.c1x = makeCutFunction(parameter, 0.1, 0.2, 0.0, 1);
    this.strip1.update();
    this.strip2.update();
}    

cutting2MoebiusPage.setTwist = function(twist) {
    this.strip1.twist = this.strip2.twist = twist;
    this.strip1.update();
    this.strip2.update();
}

cutting2MoebiusPage.keydown = function(e) {
    if(e.key=="z") { this.setTwist(this.strip1.twist + 0.05); }
    else if(e.key=="x") { this.setTwist(this.strip1.twist - 0.05); }
}

cutting2MoebiusPage.end = function() {
    this.strip1.dispose();
    this.strip2.dispose();
    this.strip1 = this.strip2 = null;
}


//-----------------------------------------------------------------------------


var slidingMoebiusPage = {
    
};

slidingMoebiusPage.begin = function() {
    
    
    var sections = this.getSections(0);
    var strip1 = this.strip1 = new MoebiusPart2(sections[0], moebiusPagesMaterials.material10, mainGroup);
    strip1.psi = Math.PI/2;
    strip1.curvature = 1.0;
    strip1.twist = 0.5;
    strip1.update();

    var strip2 = this.strip2 = new MoebiusPart2(sections[1], moebiusPagesMaterials.material10, mainGroup);
    strip2.psi = Math.PI/2;
    strip2.curvature = 1.0;
    strip2.twist = 0.5;
    strip2.update();

    var parameter = this.parameter = 0.0;    
}


slidingMoebiusPage.getSections = function(t) {
    var w = (moebiusWidth-1)/2, h = moebiusThickness;

    // var phi = t;
    
    var tt = t-Math.floor(t);
    var dx = 1+w, dy = h * 2.1;
    tt *= (dx+dy)*4;
    var tt1 = dx*2, tt2 = tt1+dy*2, tt3 = tt2+dx*2;
    var x=0,y=0;
    if(tt<tt1) { x = -dx+tt; y = dy; }
    else if(tt<tt2) { x = dx; y = dy - (tt-tt1); }
    else if(tt<tt3) { x = dx-(tt-tt2); y = -dy; }
    else { x = -dx; y = -dy + tt-tt3; }    
    /*
    
    var px,py;
    var cs = Math.cos(phi);
    var sn = Math.sin(phi);
    if(Math.abs(cs)>Math.abs(sn)) { px = cs>0 ? 1.0 : -1.0; py = px * sn / cs; }
    else { py = sn>0 ? 1.0 : -1.0; px = py * cs/sn; }
    
    var x = px*(1+w);
    var y = py*0.2;
    
    */
    
    return [
        {c1x:x-w, c1y:y-h, c2x:x+w, c2y:y+h},
        {c1x:-x-w, c1y:-y-h, c2x:-x+w, c2y:-y+h},
    ];
}


slidingMoebiusPage.drag = function(dx,dy) {
    var parameter = this.parameter = this.parameter + dx*0.002;
    var sections = this.getSections(parameter);
    this.strip1.section = sections[0];
    this.strip2.section = sections[1];
    this.strip1.update();
    this.strip2.update();
}    

slidingMoebiusPage.end = function() {
    this.strip1.dispose();
    this.strip2.dispose();
    this.strip1 = this.strip2 = null;
}


//-----------------------------------------------------------------------------


var cutting3MoebiusPage = {
    
};

cutting3MoebiusPage.begin = function() {
    
    var w = moebiusWidth, h = moebiusThickness;
    var w2 = w*1/3;

    var strip1 = this.strip1 = new MoebiusPart2({c1x:-w,c1y:-h, c2x:-w2,c2y:h}, moebiusPagesMaterials.material1, mainGroup);
    strip1.psi = Math.PI/2;
    strip1.curvature = 1.0;
    strip1.twist = 0.5;
    strip1.update();

    var strip2 = this.strip2 = new MoebiusPart2({c1x:w2,c1y:-h, c2x:w,c2y:h}, moebiusPagesMaterials.material1, mainGroup);
    strip2.psi = Math.PI/2;
    strip2.curvature = 1.0;
    strip2.twist = 0.5;
    strip2.update();

    var strip3 = this.strip3 = new MoebiusPart2({c1x:-w2,c1y:-h, c2x:w2,c2y:h}, moebiusPagesMaterials.material1, mainGroup);
    strip3.psi = Math.PI/2;
    strip3.curvature = 1.0;
    strip3.twist = 0.5;
    strip3.update();
    
    var parameter = this.parameter = 0.0;    
}

cutting3MoebiusPage.drag = function(dx,dy) {
    var parameter = this.parameter = clamp(this.parameter + dx*0.01, 0,1);
    var w = moebiusWidth, h = moebiusThickness;
    var w2 = w*1/3;

    this.strip1.section.c2x = makeCutFunction(parameter, 0.1, 0.2, -w2, -w2-1);
    this.strip2.section.c1x = makeCutFunction(parameter, 0.1, 0.2, w2, w2+1);
    this.strip1.update();
    this.strip2.update();
    
    if(parameter == 1.0) this.strip3.mesh.material = moebiusPagesMaterials.material2;
    else this.strip3.mesh.material = moebiusPagesMaterials.material1;
}    

cutting3MoebiusPage.end = function() {
    this.strip1.dispose();
    this.strip2.dispose();
    this.strip3.dispose();
    
    this.strip1 = this.strip2 = this.strip3 = null;
}



//-----------------------------------------------------------------------------


var sixColorsMoebiusPage = {
    
};

sixColorsMoebiusPage.begin = function() {
    
    var w = moebiusWidth, h = moebiusThickness;
    var w2 = w/3;
    
    var regions = [
        {id:0, band:0, phi0: -Math.PI/3, phi1: Math.PI},
        {id:1, band:0, phi0: Math.PI, phi1: Math.PI*7/3},        
        {id:2, band:2, phi0: Math.PI/3, phi1: Math.PI*5/3},        
        {id:3, band:1, phi0: 0, phi1: Math.PI*2/3},        
        {id:4, band:1, phi0: Math.PI*2/3, phi1: Math.PI*4/3},        
        {id:5, band:1, phi0: Math.PI*4/3, phi1: Math.PI*2},        
    ];
    var colors = [
        new Color3(1,0,0),
        new Color3(1,1,0),
        new Color3(0,1,0),
        new Color3(0,1,1),
        new Color3(0,0,1),
        new Color3(1,0,1)        
    ];
    var ww = [-w,-w2,w2,w];
    var texture = new BABYLON.Texture("textures/blank.png",scene);
    
    this.strips = [];
    for(var i=0;i<regions.length;i++) {
        var mat = new BABYLON.StandardMaterial("mat"+i,scene);
        mat.diffuseTexture = texture;
        mat.diffuseColor = new Color3(0.9,0.9,0.9);
        var rg = regions[i];
        var strip = new MoebiusPart({
            c1x:ww[rg.band],c1y:-h, 
            c2x:ww[rg.band+1],c2y:h
            }, mat, mainGroup);
        strip.psi = Math.PI/2;
        strip.curvature = 1.0;
        strip.twist = 0.5;
        strip.phi0 = rg.phi0;
        strip.phi1 = rg.phi1;
        strip.update();
        strip.mesh.regionId = rg.id;
        this.strips.push(strip);
        strip.mesh.color = colors[i];
        strip.active = false;
    }
    
    
    var parameter = this.parameter = 0.0;    
}

sixColorsMoebiusPage.setActive = function(obj, active) {
    obj.active = active;
    if(obj.active) obj.material.diffuseColor.copyFrom(obj.color);
    else obj.material.diffuseColor.copyFromFloats(0.9,0.9,0.9);
}

sixColorsMoebiusPage.onmousedown = function(e) {
    var pickResult = scene.pick(scene.pointerX, scene.pointerY);
    if(pickResult && pickResult.pickedMesh) {
        console.log("picked mesh : ", pickResult.pickedMesh);
        if(pickResult.pickedMesh.regionId !== undefined) {
            // pickResult.pickedMesh.material.wireframe = !pickResult.pickedMesh.material.wireframe;
            var obj = pickResult.pickedMesh;
            this.setActive(obj, !obj.active);            
        }
    }
}



sixColorsMoebiusPage.keydown = function(e) {
    var me = this;
    var flip = function(i) { me.setActive(me.strips[i].mesh, !me.strips[i].mesh.active); };
    
    if(e.key=="0") { 
        for(var i=0;i<6;i++) this.setActive(this.strips[i].mesh, false);
    }
    else if(e.key=="1") flip(0);
    else if(e.key=="2") flip(1);
    else if(e.key=="3") flip(2);
    else if(e.key=="4") flip(3);
    else if(e.key=="5") flip(4);
    else if(e.key=="6") flip(5);
}


sixColorsMoebiusPage.end = function() {
    for(var i=0;i<this.strips.length;i++) this.strips[i].dispose();
    this.strips = [];
}



//-----------------------------------------------------------------------------


var moebiusWithWheelsPage = {
   nextId : 0, 
};

moebiusWithWheelsPage.begin = function() {
    
    /*

    var mat = new BABYLON.StandardMaterial("fred.mat1", scene);
    mat.diffuseColor = new Color3(0.9,0.8,0.1);
    
    sphere = BABYLON.MeshBuilder.CreateSphere("s1", {diameter:10}, scene);
    sphere.parent = mainGroup;
    sphere.material = mat;
    
    var leg = BABYLON.MeshBuilder.CreateCylinder("leg1", {diameter:2, height:10}, scene);
    leg.material = mat;
    
    var legs = [leg];
    for(var i=1;i<4;i++) legs.push(leg.createInstance("leg"+(i+1)));
    
    for(var i=0;i<4;i++)
    {
        legs[i].setPivotMatrix(BABYLON.Matrix.Translation(0, -5, 0));
    }
    
    legs[0].parent = sphere;
    legs[1].parent = sphere;
    
    legs[2].parent = legs[0];
    legs[3].parent = legs[1];
    
    legs[0].position.copyFromFloats(-5,-5,0);
    legs[1].position.copyFromFloats( 5,-5,0);
    */
    
    
    
    var w = 6, h = 0.25;

    
    var strip = this.strip = new MoebiusPart({c1x:-w,c1y:-h, c2x:w,c2y:h}, moebiusPagesMaterials.material1, this.stripMesh);
    strip.psi = Math.PI/2;
    strip.curvature = 1.0;
    strip.twist = 0.5;
    strip.update();
    strip.mesh.parent = mainGroup;
    
    var me = this;
    
    BABYLON.SceneLoader.ImportMesh("", "models/", "wheel.babylon", scene, function (meshes, particleSystems) {
        var wheel = me.wheel = meshes[0];
        // me.wheel.position.copyFromFloats(26,7,0);
        // me.wheel.rotation.z = Math.PI/2;
        wheel.parent = mainGroup;
        wheel.phi = 0;
        wheel.visibility = false;
        me.wheels = [];
    });
    this.speed = 0.01;
    
/*
    // Then find the vector between spheres
    var v1 = vend.subtract(vstart);
    v1.normalize();
    var v2 = new BABYLON.Vector3(0, 1, 0);
    
    // Using cross we will have a vector perpendicular to both vectors
    var axis = BABYLON.Vector3.Cross(v1, v2);
    axis.normalize();
    console.log(axis);
    
    // Angle between vectors
    var angle = BABYLON.Vector3.Dot(v1, v2);
    console.log(angle);
    
    // Then using axis rotation the result is obvious
    cylinder.rotationQuaternion = BABYLON.Quaternion.RotationAxis(axis, -Math.PI / 2 + angle);
*/

   
   
}

moebiusWithWheelsPage.end = function() {
    this.strip.dispose();
    if(this.wheels) for(var i=1;i<this.wheels.length;i++) this.wheels[i].dispose(); 
    if(this.wheel) this.wheel.dispose();
    this.wheels = null;
    this.wheel = null;
}

moebiusWithWheelsPage.addWheel = function() {
    if(!this.wheels) return;    
       
    for(var i=0;i<this.wheels.length;i++) {
        var t = this.wheels[i].phi / (4*Math.PI);
        t -= Math.floor(t);
        if(t<0.07 || t>0.93) return;         
    }
    var wheel;
    if(this.wheels.length == 0)
    {
        wheel = this.wheel;
        wheel.visibility = true;
    }
    else
    {
        wheel = this.wheel.createInstance("wheel" + ++this.nextId);
        wheel.parent = mainGroup;            
    }        
    wheel.phi = 0;
    this.wheels.push(wheel);    
}

moebiusWithWheelsPage.removeWheel = function() {
    if(!this.wheels) return;
    var n = this.wheels.length;
    if(n==0) return;
    for(var i=0;i+1<n;i++) this.wheels[i].phi = this.wheels[i+1].phi;
    if(n>1) this.wheels[n-1].dispose();
    else this.wheels[0].visibility = false;
    this.wheels.splice(n-1,1);
}



moebiusWithWheelsPage.tick = function() {
    if(this.wheels) {
        for(var i=0; i<this.wheels.length;i++) {
            this.wheels[i].phi += this.speed;
        }
        if(this.wheels.length>0) 
            this.placeWheels();
    }
}

moebiusWithWheelsPage.keydown = function(e) {
    if(e.key=="+") this.addWheel();
    else if(e.key=="-") this.removeWheel();
    else if(e.key==">") this.speed += 0.01;
    else if(e.key=="<") { if(this.speed>0.01) this.speed -= 0.01; } 
    else console.log(e);
}

moebiusWithWheelsPage.placeWheels = function() {   
    if(!this.wheels) return;
    var wheelRadius = 5.6;
    var factor = 16.0/wheelRadius;
        
    for(var i=0;i<this.wheels.length;i++) {
        var wheel = this.wheels[i];
        var matrix = this.strip.getMatrixAtAngle(wheel.phi);
    
        var scale = new Vector3(), dummy = new Vector3();
        var rotation = new Quaternion();
        matrix.decompose(scale, rotation, dummy);
        wheel.rotationQuaternion = rotation.multiply(Quaternion.RotationYawPitchRoll(0,wheel.phi*factor,Math.PI/2));
        wheel.position.copyFrom(Vector3.TransformCoordinates(new Vector3(0,wheelRadius+0.25,0), matrix));
    }
} 


//-----------------------------------------------------------------------------


var RMoebiusPage = {
   nextId : 0, 
};

RMoebiusPage.begin = function() {
    
    
    var mat =new BABYLON.StandardMaterial("page6.mat3", scene);

    var texture = this.texture = new BABYLON.DynamicTexture("dynamic texture1", 1024, scene, true);
    this.textureContext = texture.getContext();
    mat.diffuseTexture = texture;

    this.pos = new BABYLON.Vector2(2500,800);
    
    this.drawCanvas();
    
    
    var w = 4, h = 0.5;

    
    var strip = this.strip = new ThinMoebius(14,5);
    strip.mesh.material = mat;
    strip.mesh.parent = mainGroup;
    
 
   
}

RMoebiusPage.drawCanvas = function() {
    var ctx = this.textureContext;
    ctx.clearRect(0,0,1024,1024);
    ctx.fillStyle = "#5588cc";
    ctx.fillRect(0, 0, 1024, 1024);
    ctx.fillStyle = "#222222";
    ctx.fillRect(0, 0, 1024, 100);
    ctx.fillRect(0, 1024-100, 1024, 1024);
    // ctx.drawLine(0,0,100,100);
    ctx.font = "600px arial";
    ctx.save();
    ctx.scale(0.1,1.0);
    ctx.fillStyle = "#8822aa";
    
    ctx.fillText("R", 0, 800);
    ctx.fillText("R", 500, 800);
    ctx.fillText("R", 1000, 600);
    ctx.fillText("R", 1500, 800);
    ctx.fillText("R", 2000, 600);
    ctx.fillText("R", this.pos.x, this.pos.y);
    ctx.restore();


	this.texture.update();
    
}

RMoebiusPage.drag = function(dx,dy) {
    this.pos.x = clamp(this.pos.x + dx*5, 100,9730);
    // this.pos.y += dy*5;
    this.drawCanvas();
}

RMoebiusPage.end = function() {
    this.strip.dispose();
    this.strip = null;
}
