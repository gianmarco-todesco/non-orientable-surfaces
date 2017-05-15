var foldingKleinBottlePage = {};

foldingKleinBottlePage.begin = function() {


    this.bottle = new MorphableKleinBottle();
    this.bottle.mesh.parent = mainGroup;
    
    mainGroup.rotationQuaternion = (new Quaternion(
        -0.6601185793564609, 
        -0.39390509955660064, 
        -0.31941935086118534, 
        0.5541240944293357)).normalize();

}

foldingKleinBottlePage.drag = function(dx,dy) {
    var bottle = this.bottle;
    bottle.setParameter(clamp(bottle.parameter + dx*0.001, 0, 1));
}
foldingKleinBottlePage.end = function() {
    this.bottle.mesh.dispose();
}


//=============================================================================

var foldingTorusPage = {};

foldingTorusPage.begin = function() {

    this.bottle = new MorphableTorus();
    this.bottle.mesh.parent = mainGroup;
    
    mainGroup.rotationQuaternion = (new Quaternion(
        -0.6601185793564609, 
        -0.39390509955660064, 
        -0.31941935086118534, 
        0.5541240944293357)).normalize();

}

foldingTorusPage.drag = function(dx,dy) {
    var bottle = this.bottle;
    bottle.setParameter(clamp(bottle.parameter + dx*0.001, 0, 1));
}
foldingTorusPage.end = function() {
    this.bottle.mesh.dispose();
}


//=============================================================================


var labeledKleinBottlePage = {};


labeledKleinBottlePage.begin = function() {


    this.kleinBottle1 = new KleinBottle(1);
    this.kleinBottle1.mesh.parent = mainGroup;

    mainGroup.rotationQuaternion = (new Quaternion(
        -0.6601185793564609, 
        -0.39390509955660064, 
        -0.31941935086118534, 
        0.5541240944293357)).normalize();
    this.speed = 0.0;
}

labeledKleinBottlePage.tick = function() {
    var bottle = this.kleinBottle1;
    
    bottle.changeU(bottle.u0 + this.speed);
}

labeledKleinBottlePage.drag = function(dx,dy) {
    var bottle = this.kleinBottle1;
    bottle.changeU(bottle.u0 + dx*0.001);
}


labeledKleinBottlePage.end = function() {
    this.kleinBottle1.mesh.dispose();
}

labeledKleinBottlePage.keydown = function(e) {
    if(e.key == "+") { this.speed += 0.0005; }
    else if(e.key=="-") { this.speed -= 0.0005; if(this.speed<0) this.speed=0; }    
}

//=============================================================================

var kleinToMoebiusPage = {};

kleinToMoebiusPage.begin = function() {


    this.bottle = new KleinHalfBottle(1);
    this.bottle.mesh.parent = mainGroup;
    
    mainGroup.rotationQuaternion = (new Quaternion(
        -0.6601185793564609, 
        -0.39390509955660064, 
        -0.31941935086118534, 
        0.5541240944293357)).normalize();

}

kleinToMoebiusPage.drag = function(dx,dy) {
    var bottle = this.bottle;
    bottle.setCurvature(clamp(bottle.curvature + dx*0.01, 0, 2));
}
kleinToMoebiusPage.end = function() {
    this.bottle.mesh.dispose();
}



