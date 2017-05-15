

function Pipe(srf,i,n,di) {
    this.srfParam = {srf:srf, i:i, n:n, di:di};
    this.positions = [];
    this.indices = [];
    this.normals = [];
    this.colors = [];
    this.uvs = [];
    this.parameter = 0.0;
    this.cycleCount = 1;
    this.saturation = this.value = 1;
    this.generate();
    this.compute();    
    this.makeMesh();    
    
}


Pipe.prototype.generate = function() {
    var n = this.n = this.srfParam.n;
    var m = this.m = 5;
    this.cssn = [];
    for(var i=0;i<m;i++) {
        var phi = 2*Math.PI*i/m;
        this.cssn.push(Math.cos(phi), Math.sin(phi));
    }
    for(var i=0;i<n*m;i++)
    {
        this.positions.push(0,0,0);
        this.normals.push(0,0,0); 
        this.colors.push(0,0,0,0);         
        this.uvs.push(0,0);
    }
    for(var i=0; i+1<n; i++)
    {
        for(var j=0;j<m;j++)
        {
            var j1 = (j+1)%m, i1 = i+1;
            var k11 = i*m+j, k12 = i*m+j1;
            var k21 = i1*m+j, k22 = i1*m+j1;
            this.indices.push(k11,k12,k22, k11,k22,k21);            
        }
    }   
    this.computeColors();  
}


Pipe.prototype.computeColors = function() {
    var n = this.n, m = this.m;
    for(var i=0; i<n; i++)
    {
        var t = this.cycleCount * i/n;
        var col = HSVToColor(t-Math.floor(t),this.saturation,this.value);
            
        for(var j=0;j<m;j++)
        {
            var k = (i*m+j)*2;
            this.uvs[k+0] = this.uvs[k+2] = j/m;
            this.uvs[k+1] = this.uvs[k+3] = i/(n-1);   
            k = (i*m+j)*4;
            this.colors[k+0] = col.r;
            this.colors[k+1] = col.g;
            this.colors[k+2] = col.b;  
            this.colors[k+3] = 1;             
        }
    }
}

Pipe.prototype.updateColors = function() {
    this.computeColors();
    this.mesh.updateVerticesData(BABYLON.VertexBuffer.ColorKind, this.colors); 
}

    
Pipe.prototype.compute = function() {
    var cs 
    var n = this.n;
    var m = this.m;
    
    var cord = [];
    var srf = this.srfParam.srf;
    for(var i=0;i<n; i++) {  
        var k = (this.srfParam.i + this.srfParam.di * i)*3;
        cord.push(new Vector3(srf.positions[k], srf.positions[k+1], srf.positions[k+2]));        
    }
    var e2s = [];
    for(var i=0;i<n; i++) {  
        e2s.push(cord[i<(n-1) ? i+1 : i].subtract(cord[i>0 ? i-1 : i]).normalize());
    }
    e2 = e2s[0];
    var e0;
    if(Math.abs(e2.x)<Math.abs(e2.y)) 
        e0 = (Math.abs(e2.x)<Math.abs(e2.z)) ? new Vector3(1,0,0) : new Vector3(0,0,1);
    else
        e0 = (Math.abs(e2.y)<Math.abs(e2.z)) ? new Vector3(0,1,0) : new Vector3(0,0,1);
    
    var cssn = this.cssn;
    
    var k = 0;    
    for(var i=0;i<n; i++) {        
        var p0 = cord[i];
        var e2 = e2s[i];
        e0 = e0.subtract(e2.scale(Vector3.Dot(e0,e2))).normalize();
        var e1 = Vector3.Cross(e2,e0).normalize();
                                
        for(var j=0;j<m; j++) {
            
            var nrm = e0.scale(cssn[2*j]).add(e1.scale(-cssn[2*j+1]));
            var pos = p0.add(nrm.scale(0.4));
                       
            this.positions[k+0] = pos.x;
            this.positions[k+1] = pos.y;
            this.positions[k+2] = pos.z;
            this.normals[k+0] = nrm.x;
            this.normals[k+1] = nrm.y;
            this.normals[k+2] = nrm.z;
            k += 3;
        }        
    }
}

Pipe.prototype.makeMesh = function() {
    var mesh = this.mesh = new BABYLON.Mesh("DummySurface.Pipe", scene);
     
    var vertexData = new BABYLON.VertexData();
    vertexData.positions = this.positions;
    vertexData.indices = this.indices;    
    vertexData.normals = this.normals;
    vertexData.uvs = this.uvs;
    vertexData.colors = this.colors;
    vertexData.applyToMesh(mesh, true);    
}

Pipe.prototype.update = function() {
    this.compute();  
    this.mesh.updateVerticesData(BABYLON.VertexBuffer.PositionKind, this.positions);
    this.mesh.updateVerticesData(BABYLON.VertexBuffer.NormalKind, this.normals);    
}

Pipe.prototype.dispose = function() {
    this.mesh.dispose();
    this.mesh = null;
}

//---------------------------------------------------------------------------------------

function DummySurface() {
    this.positions = [];
    this.indices1 = [];
    this.indices2 = [];
    this.normals = [];
    this.uvs = [];
    this.parameter = 0.0;
    this.generate();
    this.compute();    
    this.makeMesh();
    this.stripes = false;
}


DummySurface.prototype.generate = function() {
    var n = this.n = 101;
    var m = this.m = 101;
    for(var i=0;i<2*n*m;i++)
    {
        this.positions.push(0,0,0);
        this.normals.push(0,0,0); 
        this.uvs.push(0,0);
    }
    for(var i=0; i+1<n; i++)
    {
        for(var j=0;j+1<m;j++)
        {
            var k1 = 2*(i*m+j);
            var k2 = 2*((i+1)*m+j);
            this.indices1.push(k1,k1+2,k2+2, k1,k2+2,k2);
            this.indices1.push(k1+1,k2+3,k1+3, k1+1,k2+1,k2+3);
            if((j+1)&2) {
                this.indices2.push(k1,k1+2,k2+2, k1,k2+2,k2);
                this.indices2.push(k1+1,k2+3,k1+3, k1+1,k2+1,k2+3);
                
            }
        }
    }    
    for(var i=0; i<n; i++)
    {
        for(var j=0;j<m;j++)
        {
            var k = (i*m+j)*4;
            this.uvs[k+0] = this.uvs[k+2] = j/(m-1);
            this.uvs[k+1] = this.uvs[k+3] = i/(n-1);            
        }
    }
}

DummySurface.prototype.surface = function(s,t) {    
    var r0 = 2;
    var r1 = 0.25;
    var r2 = 1;

    var ra = r0+r1*Math.cos(Math.PI*t);
    var rb = r0-r1*Math.cos(Math.PI*t);
    var a0 = new Vector3(ra*Math.cos(Math.PI*2*t), ra*Math.sin(Math.PI*2*t), r1*Math.sin(Math.PI*t));
    var b0 = new Vector3(rb*Math.cos(Math.PI*2*t), rb*Math.sin(Math.PI*2*t), -r1*Math.sin(Math.PI*t));
    var c0 = new Vector3(r0*Math.cos(Math.PI*2*t), r0*Math.sin(Math.PI*2*t), 0);

    var a1 = new Vector3((r0+r1)*Math.cos(Math.PI*t), 0, (r0+r1)*Math.sin(Math.PI*t));
    var b1 = a1.scale(-1);
    var c1 = new Vector3(0, (-1-1+Math.sin(Math.PI*2*t))*r2, 0);

    var h = this.parameter;

    var a = Vector3.Lerp(a0,a1,h);
    var b = Vector3.Lerp(b0,b1,h);
    var c = Vector3.Lerp(c0,c1,h);

    var v = c.subtract(Vector3.Lerp(a,b,0.5)).scale(3);

    var s2 = s*s, s3 = s2*s;
    var ab = b.subtract(a);
    return a.add(v.scale(s)).add(ab.scale(3).subtract(v).scale(s2)).add(ab.scale(-s3*2)).scale(10);        
}
    
DummySurface.prototype.compute = function() {
    var n = this.n;
    var m = this.m;
    var k = 0;
    for(var i=0;i<n; i++) {        
        var u = i/(n-1);
        for(var j=0;j<m; j++) {
            var v = j/(m-1);
                    
            var pos = this.surface(u,v);
            
            var eps = 0.01;
            var dfdu = this.surface(u+eps,v).subtract(this.surface(u-eps,v));
            var dfdv = this.surface(u,v+eps).subtract(this.surface(u,v-eps));
            
            var nrm = Vector3.Cross(dfdu,dfdv).normalize();
                       
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

DummySurface.prototype.makeMesh = function() {
    var mesh = this.mesh = new BABYLON.Mesh("DummySurface", scene);
     
    var vertexData = new BABYLON.VertexData();
    vertexData.positions = this.positions;
    vertexData.indices = this.stripes ? this.indices2 : this.indices1;    
    vertexData.normals = this.normals;
    vertexData.uvs = this.uvs;
    vertexData.applyToMesh(mesh, true);    
}

DummySurface.prototype.setParameter = function(t) {
    this.parameter = t;
    this.compute();  
    this.mesh.updateVerticesData(BABYLON.VertexBuffer.PositionKind, this.positions);
    this.mesh.updateVerticesData(BABYLON.VertexBuffer.NormalKind, this.normals);    
}


DummySurface.prototype.setStripes = function(stripes) {
    var material = this.mesh.material;
    var parent = this.mesh.parent;
    this.stripes = stripes;
    this.mesh.dispose();
    this.makeMesh();
    this.mesh.parent = parent;
    this.mesh.material = material;
}



DummySurface.prototype.dispose = function() {
    this.mesh.dispose();
    this.mesh = null;
}

dummyPage = {};

dummyPage.begin = function() {
    this.srf = new DummySurface();
    this.srf.mesh.parent = mainGroup;
    var material = this.srf.mesh.material = new BABYLON.StandardMaterial("mat1", scene);
    material.diffuseColor = new Color3(0.2,0.6,0.8);
    material.backFaceCulling = true;
    
    
    var material2 = new BABYLON.StandardMaterial("mat2", scene);
    material2.diffuseColor = new Color3(1.0,1.0,1.0);
    
    this.pipe1 = new Pipe(this.srf, 0, this.srf.m, 2);
    this.pipe1.mesh.parent = mainGroup;
    this.pipe1.mesh.material = material2;
    
    this.pipe2 = new Pipe(this.srf, 2*this.srf.m*(this.srf.n-1), this.srf.m, 2);
    this.pipe2.mesh.parent = mainGroup;
    this.pipe2.mesh.material = material2;
    
    this.pipe1.saturation = 0;
    this.pipe2.saturation = 0;
    this.pipe1.updateColors();
    this.pipe2.updateColors();
    
    /*
    var srf = this.srf;
    var llines = [];
    var cord = [];
    for(var i=0;i<srf.m;i++)
    {
        var k = i*6;
        var pos = new Vector3(srf.positions[k],srf.positions[k+1],srf.positions[k+2]);
        cord.push(pos);
    }
    
    for(var i=0;i<srf.m;i++)
    {
        var k = i*6;
        var pos = cord[i];
        var nrm = new Vector3(srf.normals[k],srf.normals[k+1],srf.normals[k+2]);
        llines.push([pos,pos.add(nrm.scale(3))]);
        
        var ia = i>0 ? i-1 : i;
        var ib = i+1<srf.m ? i+1 : i;
        var dir = cord[ib].subtract(cord[ia]).normalize();
        llines.push([pos,pos.add(dir.scale(3))]);
        
        var u = Vector3.Cross(dir,nrm).normalize();
        llines.push([pos,pos.add(u.scale(3))]);
        
    }
    
    this.lineSystem = BABYLON.MeshBuilder.CreateLineSystem("ls1", { lines: llines}, scene);
    this.lineSystem.parent = mainGroup;
    */
    
}
dummyPage.drag = function(dx,dy) {
    this.srf.setParameter(clamp(this.srf.parameter + 0.01*dx, 0,1));
    this.pipe1.update();
    this.pipe2.update();
};

dummyPage.end = function() {
    this.srf.dispose();
    this.pipe1.dispose();
    this.pipe2.dispose();
    this.srf = null;
    this.pipe1 = null;
    this.pipe2 = null;
}

dummyPage.keydown = function(e) {
    if(e.key == "s") { this.srf.mesh.visibility = !this.srf.mesh.visibility; }
    else if(e.key == "c") { 
        if(this.pipe1.saturation>0) this.pipe1.saturation = this.pipe2.saturation = 0;
        else this.pipe1.saturation = this.pipe2.saturation = 1;
        this.pipe1.updateColors();
        this.pipe2.updateColors();
    }
    else if(e.key == "f") { 
        this.srf.setStripes(!this.srf.stripes);
    }
}



//---------------------------------------------------------------------------------------

function DummySurface2() {
    this.positions = [];
    this.indices = [];
    this.normals = [];
    this.uvs = [];
    this.parameter = 0.0;
    this.generate();
    this.compute();    
    this.makeMesh();
    this.stripes = false;
}


DummySurface2.prototype.generate = function() {
    var n = this.n = 101;
    var m = this.m = 101;
    for(var i=0;i<2*n*m;i++)
    {
        this.positions.push(0,0,0);
        this.normals.push(0,0,0); 
        this.uvs.push(0,0);
    }
    for(var i=0; i+1<n; i++)
    {
        for(var j=0;j+1<m;j++)
        {
            var k1 = 2*(i*m+j);
            var k2 = 2*((i+1)*m+j);
            this.indices.push(k1,k1+2,k2+2, k1,k2+2,k2);
            this.indices.push(k1+1,k2+3,k1+3, k1+1,k2+1,k2+3);            
        }
    }    
    for(var i=0; i<n; i++)
    {
        for(var j=0;j<m;j++)
        {
            var k = (i*m+j)*4;
            this.uvs[k+0] = this.uvs[k+2] = j/(m-1);
            this.uvs[k+1] = this.uvs[k+3] = i/(n-1);            
        }
    }
}

DummySurface2.prototype.surface1 = function(s,t) {    
    var r0 = 2;
    var r1 = 0.25;
    var r2 = 1;
    
    var phi = Math.PI*2*t;
    var theta = phi * 0.5;
    var csPhi = Math.cos(phi);
    var snPhi = Math.sin(phi);
    
    var ra = r0+r1*Math.cos(theta);
    var rb = r0-r1*Math.cos(theta);
    var a0 = new Vector3(ra*csPhi, ra*snPhi,  r1*snPhi);
    var b0 = new Vector3(rb*csPhi, rb*snPhi, -r1*snPhi);
    
    
    
    var a = a0;
    var b = b0;

    var ab = b.subtract(a);
    return a.add(ab.scale(s)).scale(10);
    
}

DummySurface2.prototype.surface2 = function(s,t) {    
    var r0 = 2;
    var r1 = 0.25;
    var r2 = 1;

    var ra = r0+r1*Math.cos(Math.PI*t);
    var rb = r0-r1*Math.cos(Math.PI*t);
    var a0 = new Vector3(ra*Math.cos(Math.PI*2*t), ra*Math.sin(Math.PI*2*t), r1*Math.sin(Math.PI*t));
    var b0 = new Vector3(rb*Math.cos(Math.PI*2*t), rb*Math.sin(Math.PI*2*t), -r1*Math.sin(Math.PI*t));
    var c0 = new Vector3(r0*Math.cos(Math.PI*2*t), r0*Math.sin(Math.PI*2*t), 0);

    var a1 = new Vector3((r0+r1)*Math.cos(Math.PI*t), 0, (r0+r1)*Math.sin(Math.PI*t));
    var b1 = a1.scale(-1);
    var c1 = new Vector3(0, (-1-1+Math.sin(Math.PI*2*t))*r2, 0);

    var h = this.parameter;

    var a = Vector3.Lerp(a0,a1,h);
    var b = Vector3.Lerp(b0,b1,h);
    var c = Vector3.Lerp(c0,c1,h);

    var v = c.subtract(Vector3.Lerp(a,b,0.5)).scale(3);

    var s2 = s*s, s3 = s2*s;
    var ab = b.subtract(a);
    return a.add(v.scale(s)).add(ab.scale(3).subtract(v).scale(s2)).add(ab.scale(-s3*2)).scale(10);        
}
    
DummySurface2.prototype.compute = function() {
    var n = this.n;
    var m = this.m;
    var k = 0;
    this.surface = this.surface1;
    for(var i=0;i<n; i++) {        
        var u = i/(n-1);
        for(var j=0;j<m; j++) {
            var v = j/(m-1);
                    
            var pos = this.surface(u,v);
            
            var eps = 0.01;
            var dfdu = this.surface(u+eps,v).subtract(this.surface(u-eps,v));
            var dfdv = this.surface(u,v+eps).subtract(this.surface(u,v-eps));
            
            var nrm = Vector3.Cross(dfdu,dfdv).normalize();
                       
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

DummySurface2.prototype.makeMesh = function() {
    var mesh = this.mesh = new BABYLON.Mesh("DummySurface", scene);
     
    var vertexData = new BABYLON.VertexData();
    vertexData.positions = this.positions;
    vertexData.indices = this.indices;    
    vertexData.normals = this.normals;
    vertexData.uvs = this.uvs;
    vertexData.applyToMesh(mesh, true);    
}

DummySurface2.prototype.setParameter = function(t) {
    this.parameter = t;
    this.compute();  
    this.mesh.updateVerticesData(BABYLON.VertexBuffer.PositionKind, this.positions);
    this.mesh.updateVerticesData(BABYLON.VertexBuffer.NormalKind, this.normals);    
}


DummySurface2.prototype.dispose = function() {
    this.mesh.dispose();
    this.mesh = null;
}

dummyPage2 = {};

dummyPage2.begin = function() {
    this.srf = new DummySurface2();
    this.srf.mesh.parent = mainGroup;
    var material = this.srf.mesh.material = new BABYLON.StandardMaterial("mat1", scene);
    material.diffuseColor = new Color3(0.2,0.6,0.8);
    material.backFaceCulling = true;
}


dummyPage2.drag = function(dx,dy) {
    this.srf.setParameter(clamp(this.srf.parameter + 0.01*dx, 0,1));
    
};

dummyPage2.end = function() {
    this.srf.dispose();
    this.srf = null;
    
}

dummyPage2.keydown = function(e) {
}




//-----------------------------------------------------------------------------

lineStarPage = {
    nextId : 0,    
};


lineStarPage.createSphere = function(pos,r,mat,objParent) {
    var obj = BABYLON.MeshBuilder.CreateSphere("page5.sphere." + (++this.nextId), {diameter:r*2}, scene);
    obj.material = mat;
    obj.position = pos;
    obj.parent = objParent || mainGroup;
    return obj;
}

lineStarPage.createCylinder = function(pos,r,h,mat,objParent) {
    var obj = BABYLON.MeshBuilder.CreateCylinder("page5.cylinder." + (++this.nextId), {diameter:r*2, height:h}, scene);
    obj.material = mat;
    obj.parent = objParent || mainGroup;
    return obj;
}


lineStarPage.createTorus = function(pos,r0,r1,mat,objParent) {
    var obj = BABYLON.MeshBuilder.CreateTorus("page5.torus." + (++this.nextId), {diameter:r0*2, thickness:r1, tessellation:100}, scene);
    obj.material = mat;
    obj.parent = objParent || mainGroup;
    return obj;
}




lineStarPage.begin = function() {
    var MB = BABYLON.MeshBuilder;
    var SM = BABYLON.StandardMaterial;

    this.objects = [];
    this.materials = [];

    if(!this.mat1) {
        var mat1 = this.mat1 = new SM("page5.mat.1", scene);
        mat1.diffuseColor = new Color3(0.9,0.9,0.9);
        mat1.alpha = 0.3;
        this.materials.push(mat1);

        var mat2=this.mat2 = this.mat2 = new SM("page5.mat.2", scene);
        mat2.diffuseColor = new Color3(0.2,0.6,0.8);

        var mat3 = this.mat3 = new SM("page5.mat.3", scene);
        mat3.diffuseColor = new Color3(0.2,0.2,0.2);

        var mat4 = this.mat4 = new SM("page5.mat.4", scene);
        mat4.diffuseColor = new Color3(0.8,0.2,0.4);
        mat4.alpha = 0.6;
        mat4.backFaceCulling = false;    
    }
    var mat1=this.mat1, mat2=this.mat2, mat3=this.mat3, mat4=this.mat4;

    
    var r = this.radius = 18;
    // sfera trasparente
    this.sphere = this.createSphere(new Vector3(0,0,0), r, mat1);

    // centro
    this.centerPoint = this.createSphere(new Vector3(0,0,0), 1, mat3);

    
    this.planes = [];
    this.lines = [];
    
    this.addLine();
    
    
    // c1
    
    /*
    var c2 = this.c2 = this.createCylinder(new Vector3(0,0,0), 1, 60, mat2);
    this.createSphere(new Vector3(0,30,0), 2, mat3, c2);
    this.createSphere(new Vector3(0,-30,0), 2, mat3, c2);
    c2.rotation.x = Math.PI/2;

    var c3 = this.c3 = this.createCylinder(new Vector3(0,0,0), 1, 60, mat2);
    this.createSphere(new Vector3(0,30,0), 2, mat3, c3);
    this.createSphere(new Vector3(0,-30,0), 2, mat3, c3);
    c3.rotation.z = Math.PI/2;

    var ring1 = this.ring1 = this.createTorus(new Vector3(0,0,0), 30,0.5, mat2);

    var ring2 = this.ring2 = this.createTorus(new Vector3(0,0,0), 30,0.5, mat2);
    ring2.rotation.x = Math.PI/2;

    var ring3 = this.ring3 = this.createTorus(new Vector3(0,0,0), 30,0.5, mat2);
    ring3.rotation.z = Math.PI/2;



    
    this.update();

*/

    mainGroup.rotationQuaternion = Quaternion.RotationYawPitchRoll(0.3,-0.2,0.0);
}


lineStarPage.end = function() {
    this.sphere.dispose();this.sphere=null;
    this.centerPoint.dispose();this.centerPoint=null;
    for(var i=0; i<this.lines.length;i++) this.lines[i].dispose();
    this.lines = [];
    for(var i=0; i<this.planes.length;i++)this.planes[i].dispose();    
    this.planes = [];
    if(this.triangle) { this.triangle.mesh.dispose(); this.triangle = null; }
}

lineStarPage.addLine = function() {    
    var thick = 0.2;
    var thick2 = 0.3;
    var rline = 30;
    var mat1=this.mat1, mat2=this.mat2, mat3=this.mat3, mat4=this.mat4;
    var line = this.createCylinder(new Vector3(0,0,0), thick, 2*rline, mat2);
    this.createSphere(new Vector3(0,this.radius,0), thick2, mat3, line);
    this.createSphere(new Vector3(0,-this.radius,0), thick2, mat3, line);
    var index = this.lines.length;
    if(index==0) 
      line.rotationQuaternion=new Quaternion();
    else if(index==1)
      line.rotation.z = Math.PI/2;
    else if(index==2)
      line.rotation.x = Math.PI/2;
    this.lines.push(line);
}

lineStarPage.removeLine = function(id) {
    if(this.lines.length==0) return;
    this.lines[this.lines.length-1].dispose();
    this.lines.splice(this.lines.length-1,1);
}

lineStarPage.addPlane = function() {
    var plane = this.createTorus(new Vector3(0,0,0), this.radius,0.25, this.mat2);
    this.createCylinder(new Vector3(0,0,0), this.radius,0.2, this.mat2, plane);
    this.planes.push(plane);    
}

lineStarPage.removePlane = function(id) {
    if(this.planes.length==0) return;
    this.planes[this.planes.length-1].dispose();
    this.planes.splice(this.planes.length-1,1);
}

lineStarPage.update = function() {
    if(this.lines.length==0) return;
    var matrix = new Matrix();
    this.lines[0].rotationQuaternion.toRotationMatrix(matrix);
    var p = Vector3.TransformCoordinates(new Vector3(0,1,0), matrix);
    
    if(this.planes.length>0) {
        var v2 = Vector3.Cross(p, new Vector3(1,0,0)).normalize();
        var v1 = new Vector3(0,1,0);
        var half = v1.add(v2).normalize();
        var q = Vector3.Cross(v1,half);
        this.planes[0].rotationQuaternion = new Quaternion(q.x,q.y,q.z,Vector3.Dot(v1,half));
        
    }
    
    if(this.planes.length>2) {
    
        v2 = Vector3.Cross(p, new Vector3(0,0,1)).normalize();
        v1 = new Vector3(0,1,0);
        half = v1.add(v2).normalize();
        q = Vector3.Cross(v1,half);
        this.planes[1].rotationQuaternion = new Quaternion(q.x,q.y,q.z,Vector3.Dot(v1,half));
    }
    if(this.triangle)
        this.triangle.update(new Vector3(1,0,0), p, new Vector3(0,0,-1));
    
}

lineStarPage.tick = function() {


}

lineStarPage.keydown = function(e) {
    if(e.key=="+") {
        if(this.lines.length==1) {
            this.addLine();
            this.addPlane();
        } else if(this.lines.length==2) {
            this.addLine();
            this.addPlane();
            this.addPlane();
        } else if(!this.triangle) {
            this.triangle = new SphericalTriangle(this.radius+0.1, new Vector3(1,0,0), new Vector3(0,1,0), new Vector3(0,0,-1));
            this.triangle.mesh.material = this.mat4;
            this.triangle.mesh.parent = mainGroup;
        }
        this.update();
    }
    else if(e.key=="-") {
        if(this.triangle) { this.triangle.mesh.dispose(); this.triangle = null;}
        else if(this.lines.length==3) {
            this.removeLine();
            this.removePlane();
            this.removePlane();
        }
        else if(this.lines.length==2) {
            this.removeLine();
            this.removePlane();
        }
    }
    
}


lineStarPage.drag = function(dx,dy) {

    var q = this.lines[0].rotationQuaternion;

    var qq = (new BABYLON.Quaternion())
        .multiply(Quaternion.Inverse(mainGroup.rotationQuaternion) )
        .multiply(BABYLON.Quaternion.RotationAxis(new Vector3(1,0,0), -dy*0.01))
        .multiply(BABYLON.Quaternion.RotationAxis(new Vector3(0,1,0), -dx*0.01))
        .multiply(mainGroup.rotationQuaternion)
        .multiply(q)
        .normalize();
    q.copyFrom(qq);
    this.update();
}




//-----------------------------------------------------------------------------

hemispherePage = {
    nextId : 0,    
};

hemispherePage.begin = function() {
    
    if(!this.mat1) {
        var SM = BABYLON.StandardMaterial;
        var mat1 = this.mat1 = new SM("hemispherePage.mat.1", scene);
        mat1.diffuseColor = new Color3(0.9,0.9,0.9);
        mat1.alpha = 0.3;
        
        var mat2=this.mat2 = this.mat2 = new SM("hemispherePage.mat.2", scene);
        mat2.diffuseColor = new Color3(0.2,0.6,0.8);

        var mat3 = this.mat3 = new SM("hemispherePage.mat.3", scene);
        mat3.diffuseColor = new Color3(0.2,0.2,0.2);

        var mat4 = this.mat4 = new SM("hemispherePage.mat.4", scene);
        mat4.diffuseColor = new Color3(0.8,0.2,0.4);
        mat4.alpha = 0.6;
        mat4.backFaceCulling = false;  

        var mat5 = this.mat5 = new SM("hemispherePage.mat.5", scene);
        mat5.diffuseColor = new Color3(0.9,0.9,0.9);
        
    }
    var mat1=this.mat1, mat2=this.mat2, mat3=this.mat3, mat4=this.mat4, mat5 = this.mat5;

    
    var r = this.radius = 18;
    // semisfera trasparente
    this.sphere = new Sphere({radius:r,theta0:Math.PI,theta1:2*Math.PI});
    this.sphere.mesh.material = mat1;
    this.sphere.mesh.parent = mainGroup;
    
    var obj = this.centerPoint = BABYLON.MeshBuilder.CreateSphere("uff1", {diameter:1}, scene);
    obj.parent = mainGroup;
    obj.material = mat3;
    
    obj = this.refPoint = BABYLON.MeshBuilder.CreateSphere("uff3", {diameter:2}, scene);
    obj.parent = mainGroup;
    obj.material = mat5;
    obj.position.y = -r;
    

    obj = this.line = BABYLON.MeshBuilder.CreateCylinder("uff2" , {diameter:0.2, height:2*r}, scene);
    obj.material = mat2;
    obj.parent = mainGroup;
    obj.rotationQuaternion = new Quaternion();
    
    var srf = {};
    srf.positions = [];
    var m = 200;
    for(var i=0;i<m;i++) {
        var phi = i*Math.PI*2/(m-1);
        srf.positions.push(this.radius*Math.cos(phi), 0, this.radius*Math.sin(phi));
    }
    this.pipe = new Pipe(srf,0,m,1);
    this.pipe.mesh.parent = mainGroup;
    this.pipe.saturation = 0.0;
    this.pipe.cycleCount = 2;
    this.pipe.updateColors();
}

hemispherePage.end = function() {
    this.sphere.dispose();
    this.centerPoint.dispose();
    this.line.dispose();
    this.refPoint.dispose();
    this.pipe.mesh.dispose();
    
}

hemispherePage.update = function() {
    var matrix = new Matrix();
    this.line.rotationQuaternion.toRotationMatrix(matrix);
    var p = Vector3.TransformCoordinates(new Vector3(0,1,0), matrix);
    p = p.normalize().scale(this.radius);
    if(p.y>0) p=p.scale(-1);
    this.refPoint.position.copyFrom(p);
}


hemispherePage.drag = function(dx,dy) {

    var q = this.line.rotationQuaternion;

    var qq = (new BABYLON.Quaternion())
        .multiply(Quaternion.Inverse(mainGroup.rotationQuaternion) )
        .multiply(BABYLON.Quaternion.RotationAxis(new Vector3(1,0,0), -dy*0.01))
        .multiply(BABYLON.Quaternion.RotationAxis(new Vector3(0,1,0), -dx*0.01))
        .multiply(mainGroup.rotationQuaternion)
        .multiply(q)
        .normalize();
    q.copyFrom(qq);
    this.update();
}

hemispherePage.tick = function() {
    if(this.targetSaturation !== undefined) {
        if(this.pipe.saturation<this.targetSaturation) 
            this.pipe.saturation=Math.min(this.pipe.saturation+0.05, this.targetSaturation); 
        else if(this.pipe.saturation>this.targetSaturation) 
            this.pipe.saturation=Math.max(this.pipe.saturation-0.05, this.targetSaturation); 
        this.pipe.updateColors();
        if(this.pipe.saturation == this.targetSaturation) this.targetSaturation=undefined;
    }
}

hemispherePage.keydown = function(e) {
    if(e.key=="s") {
        if(this.pipe.saturation>0) this.targetSaturation = 0;
        else this.targetSaturation = 1;
    } 
}