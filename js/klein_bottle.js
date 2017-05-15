
function KleinBottle(side) {
    this.side = side;
    this.positions = [];
    this.indices1 = [];
    this.indices2 = [];
    this.normals = [];
    this.uvs = [];

    this.generate();
    this.compute();
    this.computeUV();
    this.makeMesh();
}


KleinBottle.prototype.generate = function() {
    var n = this.n = 151;
    var m = this.m =51;
    var count = 2*n*m;
    for(var i=0;i<count;i++)
    {
        this.positions.push(0,0,0);
        this.normals.push(0,0,0);
        this.uvs.push(0,0);
    }
    
    for(var i=n-2;i>=0;i--)
    {
        for(var j=0;j+1<m;j++) {
            var a=2*(i*m+j), b=a+2, c=b+2*m, d=a+2*m;
            
            var ip = Math.floor(8*i/n);
            var jp = Math.floor(8*j/m);
            var k = jp+ip*8;
            var indices = this.indices;
            
            //if(j&1) continue;
            //indices.push(a,c,b, a,d,c);
            //indices.push(a+1,b+1,c+1, a+1,c+1,d+1);
            this.indices1.push(a,c,b, a,d,c);
            this.indices2.push(a+1,b+1,c+1, a+1,c+1,d+1);
        }
    }
}





KleinBottle.prototype.compute = function() {

    var a = 18, b = 8, d = 5;
    var cp = [
        new Vector3(0,d+b,-a-b),   new Vector3(0,b/2,0),
        new Vector3(0,d+2*b,-a),   new Vector3(0,0,b/2),
        new Vector3(0,d, a),       new Vector3(0,0,b/2),
        new Vector3(b,d, a+b),     new Vector3(b/2,0,0),
        new Vector3(2*b,d, a),     new Vector3(0,0,-b/2),
        new Vector3(0, d, -a),     new Vector3(0,0,-b/2),
        new Vector3(0,d+b,-a-b),   new Vector3(0,b/2,0),
    ];

    var cord = new Cord(cp);

    var n = this.n;
    var m = this.m;

    var positions = this.positions;
    var normals = this.normals;
    var k = 0;

    var cordPts = [];
    for(var i=0;i<n;i++) {
        var u = i/(n-1);
        var ps = cord.getPointAndSpeed(u);
        var dir = ps[1];
        dir.y = 0.0;
        if(dir.length()<0.0001) dir = new Vector3(0,0,i==0 ? 1 : -1);
        else dir.normalize();
        ps[1] = dir;
        cordPts.push(ps);
    }
    cordPts.push([cordPts[0][0],cordPts[0][1].scale(-1)]);


    for(var i=0;i<n;i++) {
        var u = i/(n-1);
        var cs = [];
        var p0 = cordPts[i][0].clone(), e2 = cordPts[i][1];

        var r = p0.y; p0.y = 0;
        var e1 = new Vector3(0,1,0);
        var e0 = Vector3.Cross(e1,e2).normalize();

        var qx = -(cordPts[(i+1)%n][0].y - cordPts[(i+n-1)%n][0].y);
        var dd = cordPts[(i+1)%n][0].subtract(cordPts[(i+n-1)%n][0]);
        var qy = Math.sqrt(dd.x*dd.x+dd.z*dd.z);
        var qq = 1.0/Math.sqrt(qx*qx+qy*qy);
        qx *= qq; qy *= qq;
        if(i==0 || i==n-1) { qx = -1.0; qy = 0.0; }

        for(var j=0; j<m; j++) {
            var v = j/(m-1);
            var phi = 2.0*Math.PI*v;
            var csPhi = Math.cos(phi), snPhi = Math.sin(phi);

            var px = p0.x + r*(e0.x * csPhi + e1.x *snPhi);
            var py = p0.y + r*(e0.y * csPhi + e1.y *snPhi);
            var pz = p0.z + r*(e0.z * csPhi + e1.z *snPhi);

            var nx = e2.x * qx + (e0.x * csPhi + e1.x * snPhi) * qy;
            var ny = e2.y * qx + (e0.y * csPhi + e1.y * snPhi) * qy;
            var nz = e2.z * qx + (e0.z * csPhi + e1.z * snPhi) * qy;

            var kk = k*6;

            positions[kk+0] = positions[kk+3] = px;
            positions[kk+1] = positions[kk+4] = py;
            positions[kk+2] = positions[kk+5] = pz;
            normals[kk+0] = nx; normals[kk+3] = -nx;
            normals[kk+1] = ny; normals[kk+4] = -ny;
            normals[kk+2] = nz; normals[kk+5] = -nz;
            
            k++;
        }
    }
}

KleinBottle.prototype.computeUV = function() {
    var n = this.n, m = this.m;
    var uvs = this.uvs;
        
       
    var u0 = this.u0 = this.u0 || 1.3;
     
    
    for(var i=0;i<n;i++) {
        for(var j=0;j<m;j++) {
            var k = (i*m+j)*4;
            var u = i/(n-1);
            var v = j/(m-1);
            
            u -= u0;
            var q = Math.floor(u);
            u = u - q;
            if(u>0.8) u = q + 1.2 + 0.6 * (u-0.8)/(1.0-0.8);
            else u = q + 0.8 + 0.4 * u / 0.8;
            
            var v0 = 0.25; 
            var sgn = (q&1)*2-1;
            
            v = sgn*(v-v0);
            if(v<-0.2) v = 0.23-(-0.2-v)*0.01;
            else if(v>0.2) v = 0.77+(v-0.2)*0.01;
            else v = 0.5 + 0.27*v/0.2;
            

            uvs[k+0] = uvs[k+2] = v;
            uvs[k+1] = uvs[k+3] = u;
        }
    }
}

KleinBottle.prototype.changeU = function(u0) {
    this.u0 = u0;
    this.computeUV();
    for(var i=0;i<this.children.length;i++)
      this.children[i].updateVerticesData(BABYLON.VertexBuffer.UVKind, this.uvs, false);
}


KleinBottle.prototype.makeMesh = function() {
    var mat = new BABYLON.StandardMaterial("KleinBottleMaterial", scene);
    // mat.alpha = 0.6;
    mat.backFaceCulling = true;
    mat.wireframe = false;
    // mat.diffuseColor = new BABYLON.Color3(0.5, 0.5, 1.0);
    mat.diffuseTexture = new BABYLON.Texture("textures/klein_bottle_label.png", scene);
    mat.diffuseTexture.hasAlpha = true;
    mat.useAlphaFromDiffuseTexture = true;

    var mesh =  new BABYLON.Mesh("KleinBottle", scene);
    mesh.parent = mainGroup;

    
    var vertexData = new BABYLON.VertexData();
    vertexData.positions = this.positions;
    vertexData.normals = this.normals;
    vertexData.uvs = this.uvs;
    
    this.children = [];
    for(var i=0;i<2;i++) {
        vertexData.indices = i==1 ? this.indices1 : this.indices2;
        var childMesh = new BABYLON.Mesh("KleinBottle.child"+i, scene);
        childMesh.material = mat;
        childMesh.parent = mesh;
        vertexData.applyToMesh(childMesh, true);
        this.children.push(childMesh);
    }
   
    


    this.mesh = mesh;
    
}

/*
KleinBottle.prototype.getMatrixAt = function(t) {
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
*/




function KleinHalfBottle(side) {
    this.side = side;
    this.positions = [];
    this.indices = [];
    this.normals = [];
    this.uvs = [];
    this.curvature = 1.0;

    this.generate();
    this.compute();
    this.computeUV();
    this.makeMesh();
}


KleinHalfBottle.prototype.generate = function() {
    var n = this.n = 151;
    var m = this.m =51;
    var count = 2*n*m;
    for(var i=0;i<count;i++)
    {
        this.positions.push(0,0,0);
        this.normals.push(0,0,0);
        this.uvs.push(0,0);
    }
    
    for(var i=0;i+1<n;i++)
    {
        for(var j=0;j+1<m;j++) {
            var a=2*(i*m+j), b=a+2, c=b+2*m, d=a+2*m;
            
            var ip = Math.floor(8*i/n);
            var jp = Math.floor(8*j/m);
            var k = jp+ip*8;
            var indices = this.indices;
            indices.push(a,c,b, a,d,c);
            indices.push(a+1,b+1,c+1, a+1,c+1,d+1);
        }
    }
}



KleinHalfBottle.prototype.compute = function() {

    var a = 18, b = 8, d = 5;
    var cp = [
        new Vector3(0,d+b,-a-b),   new Vector3(0,b/2,0),
        new Vector3(0,d+2*b,-a),   new Vector3(0,0,b/2),
        new Vector3(0,d, a),       new Vector3(0,0,b/2),
        new Vector3(b,d, a+b),     new Vector3(b/2,0,0),
        new Vector3(2*b,d, a),     new Vector3(0,0,-b/2),
        new Vector3(0, d, -a),     new Vector3(0,0,-b/2),
        new Vector3(0,d+b,-a-b),   new Vector3(0,b/2,0),
    ];

    var cord = new Cord(cp);

    var n = this.n;
    var m = this.m;

    var positions = this.positions;
    var normals = this.normals;
    var k = 0;

    var cordPts = [];
    for(var i=0;i<n;i++) {
        var u = i/(n-1);
        var ps = cord.getPointAndSpeed(u);
        var dir = ps[1];
        dir.y = 0.0;
        if(dir.length()<0.0001) dir = new Vector3(0,0,i==0 ? 1 : -1);
        else dir.normalize();
        ps[1] = dir;
        cordPts.push(ps);
    }
    cordPts.push([cordPts[0][0],cordPts[0][1].scale(-1)]);

    var curv = this.curvature;
    if(curv<=0.01)curv=0.01;
    
    var phi0 = 0.5*Math.PI*(1-curv), phi1 = Math.PI-phi0;
    
    
    for(var i=0;i<n;i++) {
        var u = i/(n-1);
        var cs = [];
        var p0 = cordPts[i][0].clone(), e2 = cordPts[i][1];

        var r = p0.y; p0.y = 0;
        var e1 = new Vector3(0,1,0);
        var e0 = Vector3.Cross(e1,e2).normalize();

        var qx = -(cordPts[(i+1)%n][0].y - cordPts[(i+n-1)%n][0].y);
        var dd = cordPts[(i+1)%n][0].subtract(cordPts[(i+n-1)%n][0]);
        var qy = Math.sqrt(dd.x*dd.x+dd.z*dd.z);
        var qq = 1.0/Math.sqrt(qx*qx+qy*qy);
        qx *= qq; qy *= qq;
        if(i==0 || i==n-1) { qx = -1.0; qy = 0.0; }
        
        var y0 = p0.y + r;
        r/=curv;
        
        
        r = (1-curv)*(10/(phi1-phi0)) + curv*r;
        p0.y = y0 - r;
                
        for(var j=0; j<m; j++) {
            var v = j/(m-1);
            var phi = (1-v)*phi0 + v*phi1;
            var csPhi = Math.cos(phi), snPhi = Math.sin(phi);

            var px = p0.x + r*(e0.x * csPhi + e1.x *snPhi);
            var py = p0.y + r*(e0.y * csPhi + e1.y *snPhi);
            var pz = p0.z + r*(e0.z * csPhi + e1.z *snPhi);

            var nx = e2.x * qx + (e0.x * csPhi + e1.x * snPhi) * qy;
            var ny = e2.y * qx + (e0.y * csPhi + e1.y * snPhi) * qy;
            var nz = e2.z * qx + (e0.z * csPhi + e1.z * snPhi) * qy;

            var kk = k*6;

            positions[kk+0] = positions[kk+3] = px;
            positions[kk+1] = positions[kk+4] = py;
            positions[kk+2] = positions[kk+5] = pz;
            normals[kk+0] = nx; normals[kk+3] = -nx;
            normals[kk+1] = ny; normals[kk+4] = -ny;
            normals[kk+2] = nz; normals[kk+5] = -nz;
            
            k++;
        }
    }
}

KleinHalfBottle.prototype.computeUV = function() {
    var n = this.n, m = this.m;
    var uvs = this.uvs;
        
       
    var u0 = this.u0 = this.u0 || 1.3;
     
    
    for(var i=0;i<n;i++) {
        for(var j=0;j<m;j++) {
            var k = (i*m+j)*4;
            var u = i/(n-1);
            var v = j/(m-1);
            
            u -= u0;
            var q = Math.floor(u);
            u = u - q;
            if(u>0.8) u = q + 1.2 + 0.6 * (u-0.8)/(1.0-0.8);
            else u = q + 0.8 + 0.4 * u / 0.8;
            
            var v0 = 0.25; 
            var sgn = (q&1)*2-1;
            
            v = sgn*(v-v0);
            if(v<-0.2) v = 0.23-(-0.2-v)*0.01;
            else if(v>0.2) v = 0.77+(v-0.2)*0.01;
            else v = 0.5 + 0.27*v/0.2;
            

            uvs[k+0] = uvs[k+2] = v;
            uvs[k+1] = uvs[k+3] = u;
        }
    }
}

KleinHalfBottle.prototype.setCurvature = function(curvature) {
    
    this.curvature = curvature;
    this.compute();
    this.mesh.updateVerticesData(BABYLON.VertexBuffer.PositionKind, this.positions, false);
    this.mesh.updateVerticesData(BABYLON.VertexBuffer.NormalKind, this.normals, false);
}


KleinHalfBottle.prototype.makeMesh = function() {
    var mat = new BABYLON.StandardMaterial("KleinBottleMaterial", scene);
    // mat.alpha = 0.6;
    mat.backFaceCulling = true;
    mat.wireframe = false;
    mat.diffuseColor = new BABYLON.Color3(0.5, 0.5, 1.0);
    //mat.diffuseTexture = new BABYLON.Texture("KleinBottleLabel.png", scene);
    //mat.diffuseTexture.hasAlpha = true;
    //mat.useAlphaFromDiffuseTexture = true;

    var mesh =  new BABYLON.Mesh("KleinBottle", scene);
    mesh.parent = mainGroup;

    
    var vertexData = new BABYLON.VertexData();
    vertexData.positions = this.positions;
    vertexData.normals = this.normals;
    vertexData.uvs = this.uvs;
    
    vertexData.indices = this.indices;
    var mesh = new BABYLON.Mesh("KleinHalfBottle", scene);
    mesh.material = mat;
    vertexData.applyToMesh(mesh, true);
    
    


    this.mesh = mesh;
    
}



//=============================================================================


function MorphableKleinBottle() {
    this.positions = [];
    this.indices = [];
    this.normals = [];
    this.uvs = [];

    this.parameter = 0.0;
    
    this.generate();
    this.compute();
    this.computeUV();
    this.makeMesh();
    
    
    
}


MorphableKleinBottle.prototype.generate = function() {
    var n = this.n = 151;
    var m = this.m =51;
    var count = 2*n*m;
    for(var i=0;i<count;i++)
    {
        this.positions.push(0,0,0);
        this.normals.push(0,0,0);
        this.uvs.push(0,0);
    }
    
    for(var i=n-2;i>=0;i--)
    {
        for(var j=0;j+1<m;j++) {
            var a=2*(i*m+j), b=a+2, c=b+2*m, d=a+2*m;            
            var ip = Math.floor(8*i/n);
            var jp = Math.floor(8*j/m);
            var k = jp+ip*8;
            var indices = this.indices;            
            indices.push(a,c,b, a,d,c);
            indices.push(a+1,b+1,c+1, a+1,c+1,d+1);
        }
    }
}

MorphableKleinBottle.prototype.makeCordPts = function() {

    var param;
        
    var a = 18, b = 8, d = 5;    
    var q = b/2;
    
    // si parte da p2,v2: un punto ragionevolmente centrale
    var p2 = new Vector3(0,d, a), v2 = new Vector3(0,0,q);
    
    // calcolo p3/p4 : curva del collo della bottiglia
    var p3,p4,v3,v4;
    
    var len = b*Math.PI;
    param = subParam(this.parameter,0.5,0.75);
    if(param == 0) {
        p3 = p2.add(new Vector3(0,0,len/2));
        p4 = p2.add(new Vector3(0,0,len));
        v4 = v3 = v2;        
    } else {
        var psi = param * Math.PI;
        var r = len/psi;
        var center = p2.add(new Vector3(r,0,0));
        var cs,sn;
        cs = Math.cos(psi/2);
        sn = Math.sin(psi/2);
        p3 = center.clone(); p3.x -= r*cs; p3.z += r*sn;
        v3 = new Vector3(q*sn,0,q*cs);
        cs = Math.cos(psi);
        sn = Math.sin(psi);
        p4 = center.clone(); p4.x -= r*cs; p4.z += r*sn;
        v4 = new Vector3(q*sn,0,q*cs);        
    } 
    
    // proseguo con lo zig-zag
    var e0 = v4.scale(1.0/q), e1 = new Vector3(-e0.z,0,e0.x);
    
    var p5 = p4.add(e0.scale(2*a)).add(e1.scale(-2*b));
    var v5 = v4;
    
    param = subParam(this.parameter,0.75,1.0);

    // imbuto finale
    var p6 = p5.add(v5.scale(b/q)).add(new Vector3(0,b*param,0));

    var psi = Math.PI*0.5*param;
    var csPsi = Math.cos(psi), snPsi = Math.sin(psi);

    
    e0 = v5.scale(1.0/q);
    e1 = new Vector3(0,1,0);
    var v6 = e0.scale(csPsi).add(e1.scale(snPsi)).scale(q);
    
    
    // imbuto iniziale    
    var p1 = new Vector3(0,d+2*b*param,-a), v1 = new Vector3(0,0,q);

    var p0 = new Vector3(0,p1.y-b*param,-a-b);
    var v0 = new Vector3(0,q*snPsi,q*csPsi);
    
    var cp = [
        p0,v0, // new Vector3(0,d+b,-a-b),   new Vector3(0,b/2,0),
        p1,v1,
        p2,v2,
        p3,v3,
        p4,v4,
        p5,v5,
        p6,v6,
        //new Vector3(b,d, a+b),     new Vector3(b/2,0,0),
        //new Vector3(2*b,d, a),     new Vector3(0,0,-b/2),
        
        
        //new Vector3(0, d, -a),     new Vector3(0,0,-b/2),        
        //new Vector3(0,d+b * this.parameter,-a-b),   new Vector3(0,b/2,0),
    ];
    var cord = new Cord(cp);
    
    param = subParam(this.parameter,0.75,1.0);
    var cordPts = [];
    var n = this.n;
    
    for(var i=0;i<n;i++) {
        var u = i/(n-1) * (0.5+0.5*param);
        var ps = cord.getPointAndSpeed(u);
        var dir = ps[1];
        dir.y = 0.0;
        if(dir.length()<0.0001) dir = new Vector3(0,0,i==0 ? 1 : -1);
        else dir.normalize();
        ps[1] = dir;
        cordPts.push(ps);
    }
    // cordPts.push([cordPts[0][0],cordPts[0][1].scale(-1)]);
    
    return cordPts;
}


MorphableKleinBottle.prototype.compute = function() {

    

    var cordPts = this.makeCordPts(); 
    
    var n = this.n;
    var m = this.m;

    var positions = this.positions;
    var normals = this.normals;
    var k = 0;

    var curvature = subParam(this.parameter,0.0,0.5);
    var phi0 = Math.PI*(1-curvature), phi1 = 2*Math.PI-phi0, dphi = phi1-phi0;
    
    var isClosed = this.parameter == 1.0;

    for(var i=0;i<n;i++) {
        var u = i/(n-1);
        var cs = [];
        var p0 = cordPts[i][0].clone(), e2 = cordPts[i][1];

        var r = p0.y; p0.y = 0;
        var e1 = new Vector3(0,1,0);
        var e0 = Vector3.Cross(e1,e2).normalize();
        
        var ia = i-1, ib = i+1;
        if(ia== -1) ia = isClosed ? n-1 : i;
        if(ib>= n-1) ib = isClosed ? 0 : i;
        
        
        var qx = -(cordPts[ib][0].y - cordPts[ia][0].y);
        var dd = cordPts[ib][0].subtract(cordPts[ia][0]);
        var qy = Math.sqrt(dd.x*dd.x+dd.z*dd.z);
        var qq = 1.0/Math.sqrt(qx*qx+qy*qy);
        qx *= qq; qy *= qq;
        if(isClosed && (i==0 || i==n-1)) { qx = -1.0; qy = 0.0; }

        if(curvature>0) { 
            p0.x += r/curvature - r;
            r = r/curvature;
        }
        
        for(var j=0; j<m; j++) {
            var v = j/(m-1);
            var px,py,pz,nx,ny,nz;
            if(curvature == 0) {
                var x = (1-2*v)*Math.PI;
                px = p0.x + r*(-e0.x * 1 + e1.x *x);
                py = p0.y + r*(-e0.y * 1 + e1.y *x);
                pz = p0.z + r*(-e0.z * 1 + e1.z *x);

                nx = e2.x * qx + (-e0.x  + e1.x * 0) * qy;
                ny = e2.y * qx + (-e0.y  + e1.y * 0) * qy;
                nz = e2.z * qx + (-e0.z  + e1.z * 0) * qy;
                
            }
            else
            {
                
                var phi = (1-v)*phi0 + v*phi1;            
                var csPhi = Math.cos(phi), snPhi = Math.sin(phi);
                
                

                px = p0.x + r*(e0.x * (csPhi) + e1.x *snPhi);
                py = p0.y + r*(e0.y * (csPhi) + e1.y *snPhi);
                pz = p0.z + r*(e0.z * (csPhi) + e1.z *snPhi);

                nx = e2.x * qx + (e0.x * csPhi + e1.x * snPhi) * qy;
                ny = e2.y * qx + (e0.y * csPhi + e1.y * snPhi) * qy;
                nz = e2.z * qx + (e0.z * csPhi + e1.z * snPhi) * qy;

            }
            var kk = k*6;

            positions[kk+0] = positions[kk+3] = px;
            positions[kk+1] = positions[kk+4] = py;
            positions[kk+2] = positions[kk+5] = pz;
            normals[kk+0] = nx; normals[kk+3] = -nx;
            normals[kk+1] = ny; normals[kk+4] = -ny;
            normals[kk+2] = nz; normals[kk+5] = -nz;
            
            k++;
        }
    }
}

MorphableKleinBottle.prototype.computeUV = function() {
    var n = this.n, m = this.m;
    var uvs = this.uvs;     
    
    for(var i=0;i<n;i++) {
        for(var j=0;j<m;j++) {
            var u = i/(n-1);
            var v = j/(m-1);            
            k = (i*m+j)*4;
            uvs[k+0] = uvs[k+2] = v;
            uvs[k+1] = uvs[k+3] = u;
        }
    }
}

MorphableKleinBottle.prototype.setParameter = function(parameter) {
    this.parameter = parameter;
    this.compute();
    this.mesh.updateVerticesData(BABYLON.VertexBuffer.PositionKind, this.positions, false);
    this.mesh.updateVerticesData(BABYLON.VertexBuffer.NormalKind, this.normals, false);
}


MorphableKleinBottle.prototype.makeMesh = function() {
    var mat = new BABYLON.StandardMaterial("KleinBottleMaterial", scene);
    mat.backFaceCulling = true;
    mat.wireframe = false;
    // mat.diffuseColor = new BABYLON.Color3(0.5, 0.5, 1.0);
    mat.diffuseTexture = new BABYLON.Texture("textures/klein_texture.png", scene);
    
    var mesh =  new BABYLON.Mesh("MorphableKleinBottle", scene);
    mesh.material = mat;
    mesh.parent = mainGroup;
    

    
    var vertexData = new BABYLON.VertexData();
    vertexData.positions = this.positions;
    vertexData.normals = this.normals;
    vertexData.uvs = this.uvs;
    vertexData.indices = this.indices;
    
    vertexData.applyToMesh(mesh, true);

    this.mesh = mesh;
    
}

//=============================================================================


function MorphableTorus() {
    this.positions = [];
    this.indices = [];
    this.normals = [];
    this.uvs = [];

    this.parameter = 0.0;
    
    this.generate();
    this.compute();
    this.computeUV();
    this.makeMesh();    
}


MorphableTorus.prototype.generate = function() {
    var n = this.n = 151;
    var m = this.m =51;
    var count = 2*n*m;
    for(var i=0;i<count;i++)
    {
        this.positions.push(0,0,0);
        this.normals.push(0,0,0);
        this.uvs.push(0,0);
    }
    
    for(var i=n-2;i>=0;i--)
    {
        for(var j=0;j+1<m;j++) {
            var a=2*(i*m+j), b=a+2, c=b+2*m, d=a+2*m;            
            var indices = this.indices;            
            indices.push(a,c,b, a,d,c);
            indices.push(a+1,b+1,c+1, a+1,c+1,d+1);
        }
    }
}


MorphableTorus.prototype.compute = function() {
    var n = this.n;
    var m = this.m;

    var positions = this.positions;
    var normals = this.normals;
    var k = 0;

    var c1 = smoothStep(this.parameter,0.0,0.5);
    var c2 = smoothStep(this.parameter,0.5,1.0);
    
    for(var i=0;i<n;i++) {
        var u = i/(n-1);
        
        var p0,e0,e1,e2;
        if(c2==0) {
            e0 = new Vector3(1,0,0);
            e2 = new Vector3(0,0,1);            
            p0 = new Vector3(0,0,20*(-1+2*u));
        } else {
            p0 = new Vector3();
            var theta0 = Math.PI * (1-c2);
            var theta1 = 2*Math.PI - theta0;
            var theta = (1-u)*theta0 + u*theta1;
            var csTheta = Math.cos(theta);
            var snTheta = Math.sin(theta);
            
            var r1 = 40 / (theta1-theta0);
            p0 = new Vector3(-r1 + r1*csTheta,0,r1*snTheta);
            e2 = new Vector3(-snTheta,0,csTheta);            
            
            e0 = new Vector3(csTheta,0,snTheta);
            
            
            
        }
        
        e1 = new Vector3(0,1,0);
            
        r = 10;
        
        var qx = 0;
        var qy = 1;
        
        var phi0, phi1;
        phi0 = Math.PI*(1-c1);
        phi1 = 2*Math.PI-phi0, dphi = phi1-phi0;
    
        if(c1>0) { 
            p0.x += r/c1 - r;
            r = r/c1;            
        }
        
        for(var j=0; j<m; j++) {
            var v = j/(m-1);
            var px,py,pz,nx,ny,nz;
            if(c1 == 0) {
                var x = (1-2*v)*Math.PI;
                px = p0.x + r*(-e0.x * 1 + e1.x *x);
                py = p0.y + r*(-e0.y * 1 + e1.y *x);
                pz = p0.z + r*(-e0.z * 1 + e1.z *x);

                nx = e2.x * qx + (-e0.x  + e1.x * 0) * qy;
                ny = e2.y * qx + (-e0.y  + e1.y * 0) * qy;
                nz = e2.z * qx + (-e0.z  + e1.z * 0) * qy;
                
            }
            else
            {
                
                var phi = (1-v)*phi0 + v*phi1;            
                var csPhi = Math.cos(phi), snPhi = Math.sin(phi);
                
                px = p0.x + r*(e0.x * (csPhi) + e1.x *snPhi);
                py = p0.y + r*(e0.y * (csPhi) + e1.y *snPhi);
                pz = p0.z + r*(e0.z * (csPhi) + e1.z *snPhi);

                nx = e2.x * qx + (e0.x * csPhi + e1.x * snPhi) * qy;
                ny = e2.y * qx + (e0.y * csPhi + e1.y * snPhi) * qy;
                nz = e2.z * qx + (e0.z * csPhi + e1.z * snPhi) * qy;

            }
            var kk = k*6;

            positions[kk+0] = positions[kk+3] = px;
            positions[kk+1] = positions[kk+4] = py;
            positions[kk+2] = positions[kk+5] = pz;
            normals[kk+0] = nx; normals[kk+3] = -nx;
            normals[kk+1] = ny; normals[kk+4] = -ny;
            normals[kk+2] = nz; normals[kk+5] = -nz;
            
            k++;
        }
    }
}

MorphableTorus.prototype.computeUV = function() {
    var n = this.n, m = this.m;
    var uvs = this.uvs;     
    
    for(var i=0;i<n;i++) {
        for(var j=0;j<m;j++) {
            var u = i/(n-1);
            var v = j/(m-1);            
            k = (i*m+j)*4;
            uvs[k+0] = uvs[k+2] = v;
            uvs[k+1] = uvs[k+3] = u;
        }
    }
}

MorphableTorus.prototype.setParameter = function(parameter) {
    this.parameter = parameter;
    this.compute();
    this.mesh.updateVerticesData(BABYLON.VertexBuffer.PositionKind, this.positions, false);
    this.mesh.updateVerticesData(BABYLON.VertexBuffer.NormalKind, this.normals, false);
}


MorphableTorus.prototype.makeMesh = function() {
    var mat = new BABYLON.StandardMaterial("KleinBottleMaterial", scene);
    mat.backFaceCulling = true;
    mat.wireframe = false;
    // mat.diffuseColor = new BABYLON.Color3(0.5, 0.5, 1.0);
    mat.diffuseTexture = new BABYLON.Texture("textures/klein_texture.png", scene);
    
    var mesh =  new BABYLON.Mesh("MorphableKleinBottle", scene);
    mesh.material = mat;
    mesh.parent = mainGroup;
    

    
    var vertexData = new BABYLON.VertexData();
    vertexData.positions = this.positions;
    vertexData.normals = this.normals;
    vertexData.uvs = this.uvs;
    vertexData.indices = this.indices;
    
    vertexData.applyToMesh(mesh, true);

    this.mesh = mesh;
    
}
