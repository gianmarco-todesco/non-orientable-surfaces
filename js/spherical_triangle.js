
function SphericalTriangle(r, p0, p1, p2) {
    this.radius = r;
    this.positions = [];
    this.indices = [];
    this.normals = [];    
    this.generate();
    this.compute(p0,p1,p2);    
    this.makeMesh();    
}

SphericalTriangle.prototype.setVertex = function(index, pos, norm) {
    var k0 = index*3;
    var k = k0;
    this.positions[k++] = pos.x;
    this.positions[k++] = pos.y;
    this.positions[k++] = pos.z;
    k = k0;
    this.normals[k++] = norm.x;
    this.normals[k++] = norm.y;
    this.normals[k++] = norm.z;
    //k = index*2;
    //this.uvs[k++] = uv[0];
    //this.uvs[k++] = uv[1];    
}

SphericalTriangle.prototype.generate = function() {
    var n = this.n = 60;
    var m = n*(n+1)/2;    
    for(var i=0;i<m;i++) {
        this.positions.push(0,0,0);
        this.normals.push(0,0,0);  
    }
    var k = 0;
    for(var i=0;i+1<n;i++)
    {
        for(var j=0;j<i+1;j++) {
            this.indices.push(k+j,k+i+1+j,k+i+2+j);
        }
        k += i+1;
    }
   
    k = 1;
    for(var i=1;i+1<n;i++)
    {
        for(var j=0;j<i;j++) {
            this.indices.push(k+j,k+i+2+j,k+1+j);
        }
        k += i+1;
    }
  
}
    
SphericalTriangle.prototype.compute = function(p0,p1,p2) {
    for(var i=0;i<this.n;i++) 
    var q1 = this.q1, q2 = this.q2;
    var n = this.n;
    var r = this.radius;
    var k = 0;
    var p = p0.clone().normalize();
    this.setVertex(k++, p.scale(r), p);
    for(var i=1;i<n; i++) {
        var t = i/(n-1);
        var p0t = p0.scale(1-t);
        var p01 = p0t.add(p1.scale(t));
        var p02 = p0t.add(p2.scale(t));
        
        for(var j=0;j<i+1;j++) {
            var s = j/i;
            p = p01.scale(1-s).add(p02.scale(s)).normalize();
            this.setVertex(k++, p.scale(r), p);
        }
    }
}

SphericalTriangle.prototype.makeMesh = function() {    
    var mesh = this.mesh = new BABYLON.Mesh("custom2", scene);    
    var vertexData = new BABYLON.VertexData();
    vertexData.positions = this.positions;
    vertexData.indices = this.indices;    
    vertexData.normals = this.normals;
    vertexData.applyToMesh(mesh, true);
}


SphericalTriangle.prototype.update = function(p0,p1,p2) {
    this.compute(p0,p1,p2);
    this.mesh.updateVerticesData(BABYLON.VertexBuffer.PositionKind, this.positions);
    this.mesh.updateVerticesData(BABYLON.VertexBuffer.NormalKind, this.normals);    
}

