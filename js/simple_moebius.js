
function SimpleMoebius() {
    this.positions = [];
    this.indices = [];
    this.normals = [];
    this.uvs = [];
    
    this.holeCount = 16;
    this.q1 = 50;
    this.q2 = Math.floor(this.q1 * 0.8);
    this.n = this.q1*this.holeCount;
    this.r0 = 16;
    this.r1 = 4;
    this.d = 1;
    this.theta0 = 0;
    
    this.generate();
    this.compute();    
    this.makeMesh();
}

SimpleMoebius.prototype.setVertex = function(index, pos, norm, uv) {
    var k0 = index*3;
    var k = k0;
    this.positions[k++] = pos.x;
    this.positions[k++] = pos.y;
    this.positions[k++] = pos.z;
    k = k0;
    this.normals[k++] = norm.x;
    this.normals[k++] = norm.y;
    this.normals[k++] = norm.z;
    k = index*2;
    this.uvs[k++] = uv[0];
    this.uvs[k++] = uv[1];    
}

SimpleMoebius.prototype.addQuad = function(a,b,c,d) {
    this.indices.push(a,b,c, a,c,d);
}

SimpleMoebius.prototype.generate = function() {
    var q1 = this.q1, q2 = this.q2;
    var n = this.n;
    var tt = this.tt = [];
    for(var i=0;i<q2;i++) {
        var cs = (2*i/(q2-1)-1)*0.99;
        var sn = Math.sqrt(1-cs*cs);
        tt.push([cs,sn]);       
    }
    var vIndex = 0;
    var oldk = 0;
    for(var i=0;i<n;i++)
    {
        var jj = i%this.q1;
        var m = 8;
        for(var j=0;j<m;j++) {
            this.positions.push(0,0,0);
            this.normals.push(0,0,0);            
        }
        var k = vIndex;
        vIndex += m;
        
        if(jj==0) this.addQuad(k+11,k+10,k+15,k+14); 
        else if(jj==q2-1) this.addQuad(k+10,k+15,k+14,k+11); 
                
        if(i>0)
        {
            this.addQuad(oldk+2,oldk+3,k+3,k+2);
            this.addQuad(oldk+6,oldk+7,k+7,k+6);
            
            this.addQuad(oldk+0,oldk+1,k+1,k+0);
            this.addQuad(oldk+4,oldk+5,k+5,k+4);  
            
        }
        oldk = k;    
    }
}

    
SimpleMoebius.prototype.compute = function() {
    var q1 = this.q1, q2 = this.q2;
    var n = this.n;
    var tt = this.tt;

    var vIndex = 0;
    var pts = [];
    var oldFlag = false;
    var oldk = 0;
    var px, py;
    var cs = Math.cos(this.theta0);
    var sn = Math.sin(this.theta0);
    if(Math.abs(cs)>Math.abs(sn)) { px = cs>0 ? 1.0 : -1.0; py = px * sn / cs; }
    else { py = sn>0 ? 1.0 : -1.0; px = py * cs/sn; }
    
    for(var i=0;i<n; i++) {
        
        var r0,r1,d;
        
        r0 = this.r0; r1 = this.r1; d = this.d;


        var u = this.holeCount*i/(n-1);
        var phi = 4*Math.PI*i/(n-1);
        var theta = 0.5*phi; //  + this.theta0;
        var csPhi = Math.cos(phi);
        var snPhi = Math.sin(phi);
        var csTheta = Math.cos(theta);
        var snTheta = Math.sin(theta);
        var p = new BABYLON.Vector3(r0*csPhi,0,r0*snPhi);
        var e0 = new BABYLON.Vector3(csPhi*csTheta, snTheta, snPhi*csTheta);
        var e1 = new BABYLON.Vector3(-csPhi*snTheta, csTheta, -snPhi*snTheta);
        var ne0 = e0.scale(-1), ne1 = e1.scale(-1);
        p = p.add(e0.scale(r1*1.1*px)).add(e1.scale(d*1.1*py));
        
        this.setVertex(vIndex++, p.add(e0.scale(-r1)).add(e1.scale( d)), e1, [u,0]);
        this.setVertex(vIndex++, p.add(e0.scale( r1)).add(e1.scale( d)), e1, [u,0.9]);
        this.setVertex(vIndex++, p.add(e0.scale( r1)).add(e1.scale( d)), e0, [u,1.0]);
        this.setVertex(vIndex++, p.add(e0.scale( r1)).add(e1.scale(-d)), e0, [u,0.9]);
        this.setVertex(vIndex++, p.add(e0.scale( r1)).add(e1.scale(-d)), ne1, [u,0]);
        this.setVertex(vIndex++, p.add(e0.scale(-r1)).add(e1.scale(-d)), ne1, [u,0.9]);
        this.setVertex(vIndex++, p.add(e0.scale(-r1)).add(e1.scale(-d)), ne0, [u,1.0]);
        this.setVertex(vIndex++, p.add(e0.scale(-r1)).add(e1.scale( d)), ne0, [u,0.9]);
    }
}

SimpleMoebius.prototype.makeMesh = function() {
    var mat = new BABYLON.StandardMaterial("SimpleMoebiusMaterial", scene);
    mat.alpha = 1.0;
    // mat.diffuseColor = new BABYLON.Color3(0.5, 0.5, 1.0);
    mat.backFaceCulling = false;
    mat.wireframe = false;
    mat.diffuseTexture = new BABYLON.Texture("texture2.png", scene);
	

    var mesh =  new BABYLON.Mesh("custom", scene);
    mesh.parent = mainGroup;
    mesh.material = mat;
    
    
    
    var t = new Date().getTime();
    console.log(new Date().getTime()-t);
    
    var vertexData = new BABYLON.VertexData();
    vertexData.positions = this.positions;
    vertexData.indices = this.indices;    
    vertexData.normals = this.normals;
    vertexData.uvs = this.uvs;
    vertexData.applyToMesh(mesh, true);

    
    this.mesh = mesh;
}

SimpleMoebius.prototype.getMatrixAt = function(t) {
    var phi = 4*Math.PI*t;
    var theta = phi * 0.5;
    var csPhi = Math.cos(phi), snPhi = Math.sin(phi);
    var csTheta = Math.cos(theta), snTheta = Math.sin(theta);
    r0 = this.r0; r1 = this.r1; d = this.d;
    
    var matrix = Matrix.FromValues(
        csPhi*csTheta,snTheta,snPhi*csTheta,0,  // e0 : right
        csPhi*snTheta,-csTheta,snPhi*snTheta,0, // e1 : up
        -snPhi,0,csPhi,0, // e2 : forward
        r0*csPhi,0,r0*snPhi,1
    );
    return matrix;
}


//=============================================================================


function MoebiusPart(section, mat, objParent) {
    this.positions = [];
    this.indices = [];
    this.normals = [];
    this.uvs = [];
    
    
    this.r0 = 16;
    this.psi = 0;
    this.curvature = 1.0;
    this.twist = 0.5;
    this.phi0 = 0.0;
    this.phi1 = 2*Math.PI;    
    // n.b: this.phi0 < PI < this.phi1
    
    this.section = section;
    this.generate();
    this.compute();    
    this.makeMesh(mat, objParent);
}

MoebiusPart.prototype.setVertex = function(index, pos, norm, uv) {
    var k0 = index*3;
    var k = k0;
    this.positions[k++] = pos.x;
    this.positions[k++] = pos.y;
    this.positions[k++] = pos.z;
    k = k0;
    this.normals[k++] = norm.x;
    this.normals[k++] = norm.y;
    this.normals[k++] = norm.z;
    k = index*2;
    this.uvs[k++] = uv[0];
    this.uvs[k++] = uv[1];    
}

MoebiusPart.prototype.addQuad = function(a,b,c,d) {
    this.indices.push(a,b,c, a,c,d);
}

MoebiusPart.prototype.generate = function() {
    var n = this.n = 100;
    var vIndex = 0;
    var oldk = 0;
    for(var i=0;i<n;i++)
    {
        var m = 8;
        for(var j=0;j<m;j++) {
            this.positions.push(0,0,0);
            this.normals.push(0,0,0);            
        }
        var k = vIndex;
        vIndex += m;
                        
        if(i>0)
        {
            this.addQuad(oldk+2,oldk+3,k+3,k+2);
            this.addQuad(oldk+6,oldk+7,k+7,k+6);
            
            this.addQuad(oldk+0,oldk+1,k+1,k+0);
            this.addQuad(oldk+4,oldk+5,k+5,k+4);              
        }
        oldk = k;    
    }
    
    var k = vIndex;
    for(var j=0;j<8;j++) {
        this.positions.push(0,0,0);
        this.normals.push(0,0,0);  
    }
    this.addQuad(k,k+1,k+2,k+3);
    this.addQuad(k+4,k+5,k+6,k+7);
    
}

    
MoebiusPart.prototype.compute = function() {
    var c1x = this.section.c1x;
    var c1y = this.section.c1y;
    var c2x = this.section.c2x;
    var c2y = this.section.c2y;
    
    this.cord = [];
    var n = this.n;

    var vIndex = 0;
    var r0 = this.r0;
    
    var ccx = 0;
    
    var length = (this.phi1-this.phi0)*r0;
    var curvature = this.curvature;
    
    var phi0 = Math.PI - (Math.PI - this.phi0) * curvature;
    var phi1 = Math.PI + (this.phi1 - Math.PI) * curvature;
    if(0.0 < this.curvature && this.curvature< 1.0) {
        r0 = length / (phi1 - phi0);
        ccx = -this.r0 * this.curvature + r0;
    }
    var firstSection, lastSection;
    
    for(var i=0;i<n; i++) {        

        var u = i/(n-1);
        var phi = phi0 *(1-u) + phi1 * u;
        var csPhi = Math.cos(phi);
        var snPhi = Math.sin(phi);
        var theta = this.curvature*this.twist * (phi - Math.PI) + this.psi;
        var csTheta = Math.cos(theta);
        var snTheta = Math.sin(theta);
                
        var p,e0,e1;
        if(this.curvature == 0.0) {
            var length0 = length * (Math.PI - this.phi0) / (this.phi1 - this.phi0);
            var length1 = length - length0;
            p = new Vector3(-this.r0*0,0,length0 - length * u);
            e0 = new Vector3(-csTheta, snTheta, 0);
            e1 = new Vector3(snTheta, csTheta, 0); 
        }
        else {
            p = new Vector3(ccx + r0*csPhi,0,r0*snPhi);
            e0 = new Vector3(csPhi*csTheta, snTheta, snPhi*csTheta);
            e1 = new Vector3(-csPhi*snTheta, csTheta, -snPhi*snTheta);            
        }
        
        this.cord.push([p,e0,e1]);
        var ne0 = e0.scale(-1), ne1 = e1.scale(-1);
        
        var q0 = p.add(e0.scale(c1x)).add(e1.scale(c2y));
        var q1 = p.add(e0.scale(c2x)).add(e1.scale(c2y));
        var q2 = p.add(e0.scale(c2x)).add(e1.scale(c1y));
        var q3 = p.add(e0.scale(c1x)).add(e1.scale(c1y));
        
        this.setVertex(vIndex++, q0, e1, [u,0]);
        this.setVertex(vIndex++, q1, e1, [u,0.9]);
        this.setVertex(vIndex++, q1, e0, [u,1.0]);
        this.setVertex(vIndex++, q2, e0, [u,0.9]);
        this.setVertex(vIndex++, q2, ne1, [u,0]);
        this.setVertex(vIndex++, q3, ne1, [u,0.9]);
        this.setVertex(vIndex++, q3, ne0, [u,1.0]);
        this.setVertex(vIndex++, q0, ne0, [u,0.9]);
        
        if(i==0) firstSection = [q0,q1,q2,q3];
        else if(i==n-1) lastSection = [q0,q1,q2,q3];
    }
    
    var nrm;
    var s;
    s = firstSection;
    nrm = Vector3.Cross(s[1].subtract(s[0]), s[3].subtract(s[0])).normalize();
    this.setVertex(vIndex++, s[0], nrm, [0,0]);
    this.setVertex(vIndex++, s[3], nrm, [1,0]);
    this.setVertex(vIndex++, s[2], nrm, [1,1]);
    this.setVertex(vIndex++, s[1], nrm, [0,1]);

    s = lastSection;
    nrm = Vector3.Cross(s[3].subtract(s[0]), s[1].subtract(s[0])).normalize();
    this.setVertex(vIndex++, s[0], nrm, [0,0]);
    this.setVertex(vIndex++, s[1], nrm, [1,0]);
    this.setVertex(vIndex++, s[2], nrm, [1,1]);
    this.setVertex(vIndex++, s[3], nrm, [0,1]);
    
}

MoebiusPart.prototype.makeMesh = function(mat, objParent) {
    var mesh = this.mesh = new BABYLON.Mesh("custom", scene);
    mesh.parent = objParent;
    mesh.material = mat;
    
    var vertexData = new BABYLON.VertexData();
    vertexData.positions = this.positions;
    vertexData.indices = this.indices;    
    vertexData.normals = this.normals;
    vertexData.uvs = this.uvs;
    vertexData.applyToMesh(mesh, true);    
}


MoebiusPart.prototype.update = function() {
    this.compute();
    this.mesh.updateVerticesData(BABYLON.VertexBuffer.PositionKind, this.positions);
    this.mesh.updateVerticesData(BABYLON.VertexBuffer.NormalKind, this.normals);    
}

MoebiusPart.prototype.dispose = function() {
    this.mesh.dispose();
    this.mesh = null;
}


MoebiusPart.prototype.getMatrixAt = function(t) {
    var n = this.cord.length;
    var i = Math.floor(n*t); if(i>=n) i = n-1;
    var q = this.cord[i];
    var p = q[0], e0 = q[1], e1 = q[2];
    var e2 = Vector3.Cross(e0,e1).normalize();
    
    var matrix = Matrix.FromValues(
        e0.x,e0.y,e0.z,0,  // e0 : right
        e1.x,e1.y,e1.z,0, // e1 : up
        e2.x,e2.y,e2.z,0, // e2 : forward
        p.x,p.y,p.z,1
    );
    return matrix;
}


MoebiusPart.prototype.getMatrixAtAngle = function(phi) {
    var r = 16.0;
    var csPhi = Math.cos(phi), snPhi = Math.sin(phi);
    var theta = phi * 0.5;
    var csTheta = Math.cos(theta), snTheta = Math.sin(theta);
    
    var p = new Vector3(csPhi*r, 0, snPhi*r);
    var e2 = new Vector3(-snPhi,0,csPhi);
    var e0 = new Vector3(csPhi*csTheta, snTheta, snPhi*csTheta);
    var e1 = new Vector3(-csPhi*snTheta, csTheta, -snPhi*snTheta);
        
    var matrix = Matrix.FromValues(
        e0.x,e0.y,e0.z,0,  // e0 : right
        e1.x,e1.y,e1.z,0, // e1 : up
        e2.x,e2.y,e2.z,0, // e2 : forward
        p.x,p.y,p.z,1
    );
    return matrix;
}

//=============================================================================

function MoebiusPart2(section, mat, objParent) {
    this.positions = [];
    this.indices = [];
    this.normals = [];
    this.uvs = [];
    
    this.r0 = 16;
    this.psi = Math.PI/2;
    this.twist = 0.5;
    
    this.section = section;
    this.generate();
    this.compute();    
    this.makeMesh(mat, objParent);
}

MoebiusPart2.prototype.setVertex = function(index, pos, norm, uv) {
    var k0 = index*3;
    var k = k0;
    this.positions[k++] = pos.x;
    this.positions[k++] = pos.y;
    this.positions[k++] = pos.z;
    k = k0;
    this.normals[k++] = norm.x;
    this.normals[k++] = norm.y;
    this.normals[k++] = norm.z;
    k = index*2;
    this.uvs[k++] = uv[0];
    this.uvs[k++] = uv[1];    
}

MoebiusPart2.prototype.addQuad = function(a,b,c,d) {
    this.indices.push(a,b,c, a,c,d);
}

MoebiusPart2.prototype.generate = function() {
    var n = this.n = 100;
    var vIndex = 0;
    var oldk = 0;
    for(var i=0;i<n;i++)
    {
        var m = 8;
        for(var j=0;j<m;j++) {
            this.positions.push(0,0,0);
            this.normals.push(0,0,0);            
        }
        var k = vIndex;
        vIndex += m;
                        
        if(i>0)
        {
            this.addQuad(oldk+2,oldk+3,k+3,k+2);
            this.addQuad(oldk+6,oldk+7,k+7,k+6);
            
            this.addQuad(oldk+0,oldk+1,k+1,k+0);
            this.addQuad(oldk+4,oldk+5,k+5,k+4);              
        }
        oldk = k;    
    }
    
    var k = vIndex;
    for(var j=0;j<8;j++) {
        this.positions.push(0,0,0);
        this.normals.push(0,0,0);  
    }
    this.addQuad(k,k+1,k+2,k+3);
    this.addQuad(k+4,k+5,k+6,k+7);
    
}

    
MoebiusPart2.prototype.compute = function() {
    var f_c1x = this.section.c1x;
    var c1y = this.section.c1y;
    var f_c2x = this.section.c2x;
    var c2y = this.section.c2y;
    
    var section = this.section;
    
    if(typeof(f_c1x)!="function") f_c1x = function(u) { return section.c1x; }
    if(typeof(f_c2x)!="function") f_c2x = function(u) { return section.c2x; }
    
    var n = this.n;

    var vIndex = 0;
    var r0 = this.r0;
    
    var firstSection, lastSection;
    
    for(var i=0;i<n; i++) {        

        var u = i/(n-1);
        var phi = 2*Math.PI * u;
        var csPhi = Math.cos(phi);
        var snPhi = Math.sin(phi);
        var theta = this.curvature*this.twist * (phi - Math.PI) + this.psi;
        var csTheta = Math.cos(theta);
        var snTheta = Math.sin(theta);
                
        var p,e0,e1;
        p = new Vector3(r0*csPhi,0,r0*snPhi);
        e0 = new Vector3(csPhi*csTheta, snTheta, snPhi*csTheta);
        e1 = new Vector3(-csPhi*snTheta, csTheta, -snPhi*snTheta);            
       
        
        var ne0 = e0.scale(-1), ne1 = e1.scale(-1);
        
        var c1x = f_c1x(u);
        var c2x = f_c2x(u);
        
        var q0 = p.add(e0.scale(c1x)).add(e1.scale(c2y));
        var q1 = p.add(e0.scale(c2x)).add(e1.scale(c2y));
        var q2 = p.add(e0.scale(c2x)).add(e1.scale(c1y));
        var q3 = p.add(e0.scale(c1x)).add(e1.scale(c1y));
        
        this.setVertex(vIndex++, q0, e1, [u,0]);
        this.setVertex(vIndex++, q1, e1, [u,0.9]);
        this.setVertex(vIndex++, q1, e0, [u,1.0]);
        this.setVertex(vIndex++, q2, e0, [u,0.9]);
        this.setVertex(vIndex++, q2, ne1, [u,0]);
        this.setVertex(vIndex++, q3, ne1, [u,0.9]);
        this.setVertex(vIndex++, q3, ne0, [u,1.0]);
        this.setVertex(vIndex++, q0, ne0, [u,0.9]);
        
        if(i==0) firstSection = [q0,q1,q2,q3];
        else if(i==n-1) lastSection = [q0,q1,q2,q3];
    }
    
    var nrm;
    var s;
    s = firstSection;
    nrm = Vector3.Cross(s[1].subtract(s[0]), s[3].subtract(s[0])).normalize();
    this.setVertex(vIndex++, s[0], nrm, [0,0]);
    this.setVertex(vIndex++, s[3], nrm, [1,0]);
    this.setVertex(vIndex++, s[2], nrm, [1,1]);
    this.setVertex(vIndex++, s[1], nrm, [0,1]);

    s = lastSection;
    nrm = Vector3.Cross(s[3].subtract(s[0]), s[1].subtract(s[0])).normalize();
    this.setVertex(vIndex++, s[0], nrm, [0,0]);
    this.setVertex(vIndex++, s[1], nrm, [1,0]);
    this.setVertex(vIndex++, s[2], nrm, [1,1]);
    this.setVertex(vIndex++, s[3], nrm, [0,1]);
    
}

MoebiusPart2.prototype.makeMesh = function(mat, objParent) {    

    var mesh = this.mesh = new BABYLON.Mesh("custom3", scene);
    mesh.parent = objParent;
    mesh.material = mat;
    
    var vertexData = new BABYLON.VertexData();
    vertexData.positions = this.positions;
    vertexData.indices = this.indices;    
    vertexData.normals = this.normals;
    vertexData.uvs = this.uvs;
    vertexData.applyToMesh(mesh, true);    
}


MoebiusPart2.prototype.update = function() {
    this.compute();
    this.mesh.updateVerticesData(BABYLON.VertexBuffer.PositionKind, this.positions);
    this.mesh.updateVerticesData(BABYLON.VertexBuffer.NormalKind, this.normals);    
}

MoebiusPart2.prototype.dispose = function() {
    this.mesh.dispose();
    this.mesh = null;
}


//=============================================================================



function ThinMoebius(r0,r1) {
    this.positions = [];
    this.indices = [];
    this.normals = [];
    this.uvs = [];    
    this.r0 = r0;
    this.r1 = r1;
    this.generate();
    this.compute();    
    this.makeMesh();
}

ThinMoebius.prototype.generate = function() {
    var n = this.n = 200;
    var m = this.m = 10;
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
    
ThinMoebius.prototype.compute = function() {
    var n = this.n;
    var m = this.m;
    var k = 0;
    for(var i=0;i<n;i++) {
        var phi = 2*Math.PI*i/(n-1);
        var csPhi = Math.cos(phi), snPhi = Math.sin(phi);
        var theta = phi * 0.5;
        var csTheta = Math.cos(theta), snTheta = Math.sin(theta);
        var p0 = new Vector3(-this.r0*csPhi,0,this.r0*snPhi);
        var e0 = new Vector3(-csPhi*csTheta, snTheta, snPhi*csTheta);
        var e1 = new Vector3(-csPhi*snTheta, -csTheta, snPhi*snTheta);        
        for(var j=0;j<m;j++) {
            var pos = p0.add(e0.scale(this.r1*(-1+2*j/(m-1))));
            var nrm = e1;
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


ThinMoebius.prototype.makeMesh = function() {
    var mesh = this.mesh = new BABYLON.Mesh("ThinMoebius", scene);
    
    var vertexData = new BABYLON.VertexData();
    vertexData.positions = this.positions;
    vertexData.indices = this.indices;    
    vertexData.normals = this.normals;
    vertexData.uvs = this.uvs;
    vertexData.applyToMesh(mesh, true);    
}

ThinMoebius.prototype.dispose = function() {
    this.mesh.dispose();
    this.mesh = null;
}
