
function Cord(cps) {
    this.cp=[];
    this.cv=[];
    this.valid = false;
    if(cps) {
        for(var i=0;i+1<cps.length;i+=2) {
            this.add(cps[i], cps[i+1]);
        }
        this.update();
    }
}

Cord.prototype.add = function(p,v) {
    this.cp.push(p);
    this.cv.push(v);
    this.valid = false;
}

Cord.prototype.update = function() {
    this.cc = [];
    this.rf = [];
    this.rf.push([0.0, 0, 0]);
    var oldp = this.cp[0];
    var olds = 0.0;
    for(var i=0; i+1<this.cp.length; i++) {
        var p0,p1,p2,p3;
        p0 = this.cp[i];
        p3 = this.cp[i+1];
        var sc = p3.subtract(p0).length()*0.1;
        var p1 = p0.add(this.cv[i].scale(sc));
        var p2 = p3.subtract(this.cv[i+1].scale(sc));
        this.cc.push([p0,p1,p2,p3]);
        var m = 5 + Math.floor(p1.subtract(p0).length()+p2.subtract(p1).length()+p3.subtract(p2).length());
        for(var j=1;j<=m;j++) {
            var t = j/m;
            var p = Vector3.cubicBezier(p0,p1,p2,p3,t);
            var ds = p.subtract(oldp).length();
            this.rf.push([olds+ds,i,t]);
            olds += ds;
            oldp = p;
        }
    }
    this.length = olds;
    this.valid = true;
}

Cord.prototype.getIndex =function(s) {
    if(!this.valid) this.update();
    if(s<=0) return [0,0];
    else if(s>=this.length) return [this.cc.length-1,1];
    var rf = this.rf;
    var a=0, b=rf.length-1;
    while(b-a>1)
    {
        var c = Math.floor((a+b)/2);
        if(rf[c][0]<=s) a=c; else b=c;
    }
    var k = rf[b][1];
    var s0 = rf[a][0], s1 = rf[b][0];
    var t1 = rf[b][2];
    var t0 = rf[a][1]==k ? rf[a][2] : 0.0;
    return [k,  t0 + (t1-t0)*(s-s0)/(s1-s0)];
}

Cord.prototype.getPoint = function(s) {
    if(!this.valid) this.update();
    var it = this.getIndex(s*this.length);
    var pp = this.cc[it[0]];
    return Vector3.cubicBezier(pp[0],pp[1],pp[2],pp[3],it[1]);
}

Cord.prototype.getPointAndSpeed = function(s) {
    if(!this.valid) this.update();
    var it = this.getIndex(s*this.length);
    var pp = this.cc[it[0]];
    return [Vector3.cubicBezier(pp[0],pp[1],pp[2],pp[3],it[1]), Vector3.cubicBezierD(pp[0],pp[1],pp[2],pp[3],it[1])];
}
