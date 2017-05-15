function PunchedMoebius() {
    this.positions = [];
    this.indices = [];
    this.normals = [];
    this.uvs = [];
    
    this.holeCount = 17;
    this.q1 = 50;
    this.q2 = Math.floor(this.q1 * 0.8);
    this.n = this.q1*this.holeCount;
    this.r0 = 16;
    this.r1 = 4;
    this.d = 0.5;
    this.theta0 = 0;
    this.paintParameter = 0.0;
    this.generate();
    this.compute();    
    this.makeMesh();
    
}


PunchedMoebius.prototype.setVertex = function(index, pos, norm, uv) {
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

PunchedMoebius.prototype.addQuad = function(a,b,c,d) {
    this.indices.push(a,b,c, a,c,d);
}

PunchedMoebius.prototype.generate = function() {
    var q1 = this.q1, q2 = this.q2;
    var n = this.n;
    var tt = this.tt = [];
    for(var i=0;i<q2;i++) {
        var cs = (2*i/(q2-1)-1)*0.99;
        var sn = Math.sqrt(1-cs*cs);
        tt.push([cs,sn]);       
    }
    var vIndex = 0;
    var oldk = 0, oldFlag = false;
    for(var i=0;i<n;i++)
    {
        var jj = i%this.q1;
        var flag = jj < q2;
        var m = flag ? 16 : 8;
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
            
            if(flag && oldFlag) {
                this.addQuad(oldk+0,oldk+8,k+8,k+0);
                this.addQuad(oldk+9,oldk+1,k+1,k+9);
                this.addQuad(oldk+4,oldk+12,k+12,k+4);
                this.addQuad(oldk+13,oldk+5,k+5,k+13);
                
                this.addQuad(oldk+10,k+10,k+11,oldk+11);
                this.addQuad(k+15,oldk+15,oldk+14,k+14);
                
            }
            else
            {
                this.addQuad(oldk+0,oldk+1,k+1,k+0);
                this.addQuad(oldk+4,oldk+5,k+5,k+4);  
            }
        }
        oldFlag = flag;
        oldk = k;    
    }
}

    
PunchedMoebius.prototype.compute = function() {
    var q1 = this.q1, q2 = this.q2;
    var n = this.n;
    var tt = this.tt;

    var vIndex = 0;
    var pts = [];
    var oldFlag = false;
    var oldk = 0;
    for(var i=0;i<n; i++) {
        
        var r0,r1,d;
        
        r0 = this.r0; r1 = this.r1; d = this.d;


        var u = this.holeCount*i/n+0.05;
        // u = 0.1 + (u-Math.floor(u)) * 0.79;
        
        var phi = 4*Math.PI*i/(n-1);
        var theta = 0.25*phi + this.theta0;
        var csPhi = Math.cos(phi);
        var snPhi = Math.sin(phi);
        var csTheta = Math.cos(theta);
        var snTheta = Math.sin(theta);
        var p = new BABYLON.Vector3(r0*csPhi,0,r0*snPhi);
        var e0 = new BABYLON.Vector3(csPhi*csTheta, snTheta, snPhi*csTheta);
        var e1 = new BABYLON.Vector3(-csPhi*snTheta, csTheta, -snPhi*snTheta);
        var ne0 = e0.scale(-1), ne1 = e1.scale(-1);
        
        var voff1 = 0, voff2 = 0;
        if(2*(1-this.paintParameter)<i/n)
            voff1 = -0.5;
        if(2*(1-this.paintParameter)<1+i/n)
            voff2 = -0.5;
        
            
        //   u = 0.92+0.07*i/n;
       
        var vv0 = 0.5, vv1 = 0.5+0.9/2, vv2 = 0.5+1.0/2;
       
        this.setVertex(vIndex++, p.add(e0.scale(-r1)).add(e1.scale( d)), e1, [u,vv0+voff1]);
        this.setVertex(vIndex++, p.add(e0.scale( r1)).add(e1.scale( d)), e1, [u,vv1+voff1]);
        this.setVertex(vIndex++, p.add(e0.scale( r1)).add(e1.scale( d)), e0, [u,vv2]);
        this.setVertex(vIndex++, p.add(e0.scale( r1)).add(e1.scale(-d)), e0, [u,vv1]);
        this.setVertex(vIndex++, p.add(e0.scale( r1)).add(e1.scale(-d)), ne1, [u,vv0+voff2]);
        this.setVertex(vIndex++, p.add(e0.scale(-r1)).add(e1.scale(-d)), ne1, [u,vv1+voff2]);
        this.setVertex(vIndex++, p.add(e0.scale(-r1)).add(e1.scale(-d)), ne0, [u,vv2]);
        this.setVertex(vIndex++, p.add(e0.scale(-r1)).add(e1.scale( d)), ne0, [u,vv1]);
     
        var j = i%q1;
        if(j<q2) {
            var e2 = new BABYLON.Vector3(-snPhi, 0, csPhi);
            var tcs = tt[j][0], tsn = tt[j][1];
            var ee0 = e2.scale(tcs).add(e0.scale(tsn));
            var nee0 = e2.scale(tcs).add(ne0.scale(tsn));
            
            var s = this.tt[j][1] * 0.8;
            var r2 = r1 * s;
            var v1 = 0.5 - 0.5*s, v2 = 0.5 + 0.5*s;
            var vv3 = vv0 + (vv1-vv0)*v1;
            var vv4 = vv0 + (vv1-vv0)*v2;
            
            this.setVertex(vIndex++, p.add(e0.scale(-r2)).add(e1.scale( d)), e1, [u,vv3+voff1]);
            this.setVertex(vIndex++, p.add(e0.scale( r2)).add(e1.scale( d)), e1, [u,vv4+voff1]);
            this.setVertex(vIndex++, p.add(e0.scale( r2)).add(e1.scale( d)), nee0, [u,vv1]);
            this.setVertex(vIndex++, p.add(e0.scale( r2)).add(e1.scale(-d)), nee0, [u,vv2]);
            this.setVertex(vIndex++, p.add(e0.scale( r2)).add(e1.scale(-d)), ne1, [u,vv3+voff2]);
            this.setVertex(vIndex++, p.add(e0.scale(-r2)).add(e1.scale(-d)), ne1, [u,vv4+voff2]);
            this.setVertex(vIndex++, p.add(e0.scale(-r2)).add(e1.scale(-d)), ee0, [u,vv2]);
            this.setVertex(vIndex++, p.add(e0.scale(-r2)).add(e1.scale( d)), ee0, [u,vv1]);   
        }
                
    }
}

PunchedMoebius.prototype.makeMesh = function() {
    var mat = new BABYLON.StandardMaterial("PunchedMoebiusMaterial", scene);
    mat.alpha = 1.0;
    // mat.diffuseColor = new BABYLON.Color3(0.5, 0.5, 1.0);
    mat.backFaceCulling = false;
    mat.wireframe = false;
    mat.diffuseTexture = new BABYLON.Texture(
        "textures/punched_moebius_texture.png", scene);
	this.material = mat;

    var mesh =  new BABYLON.Mesh("custom", scene);
    mesh.parent = mainGroup;
    mesh.material = mat;
    
    var vertexData = new BABYLON.VertexData();
    vertexData.positions = this.positions;
    vertexData.indices = this.indices;    
    vertexData.normals = this.normals;
    vertexData.uvs = this.uvs;
    vertexData.applyToMesh(mesh, true);
    
    this.mesh = mesh;    
}

PunchedMoebius.prototype.update = function() {
    this.compute();
    this.mesh.updateVerticesData(BABYLON.VertexBuffer.PositionKind, this.positions);
    this.mesh.updateVerticesData(BABYLON.VertexBuffer.NormalKind, this.normals);    
}

PunchedMoebius.prototype.setTheta0 = function(theta0) {
    this.theta0 = theta0;
    this.update();
}


PunchedMoebius.prototype.setPaintParameter = function(parameter) {
    this.paintParameter = parameter;
    this.compute();
    this.mesh.updateVerticesData(BABYLON.VertexBuffer.UVKind, this.uvs);      
}


PunchedMoebius.prototype.dispose = function() {
    
    this.mesh.dispose();
    this.mesh = null;
    this.material.dispose();
    this.material = null;
}


