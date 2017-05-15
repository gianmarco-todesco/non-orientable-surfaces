var titleCanvas;

var titlePage = {
    speed : 0.01,
    spinning : true,
    
};

titlePage.begin = function() {
    this.model = new PunchedMoebius();
    this.speed = 0.01;
    this.spinning = true;
    var div = this.titleDiv = document.createElement("div");
    var style = {
        position : "absolute",
        left : "0px",
        top : "0px",
        width : "1024px",
        height : "200px",
        // border: "solid 1px red",
        padding: "20px",
        color : "white",
        zIndex : 10,
        // fontSize : "100px",   
        transition: "opacity 1000ms linear",
        pointerEvents:"none",        
    };
    for(v in style) div.style[v] = style[v];
    div.innerHTML = "<h1>Superfici ad una faccia</h2><h2>todesco@toonz.com</h2>";
    document.body.appendChild(div);
    
    mainGroup.rotationQuaternion = new Quaternion(
        -0.3898222715654934,
        0.23615052455587598,
        0.006552740838808928,
        0.8900722374790727).normalize();
};

titlePage.end = function() {
    this.model.dispose();
    this.model = 0;
    var titleDiv = this.titleDiv;
    if(titleDiv) { document.body.removeChild(titleDiv);  this.titleDiv=null; }    
};

    
titlePage.tick = function() {
    if(!this.model) return;
    if(this.spinning) { 
        var maxSpeed = 0.01; 
        if(this.speed < maxSpeed) { 
            this.speed += 0.0005; 
            if(this.speed>maxSpeed) this.speed = maxSpeed;
        }
    } else {
        if(this.speed > 0) { 
            this.speed -= 0.0005; 
            if(this.speed<=0)this.speed = 0;
        }        
    } 
    if(this.speed != 0) 
        this.model.setTheta0(this.model.theta0 + this.speed);    
}

titlePage.keydown = function(e) {
    if(e.key==" ") {
        this.spinning = !this.spinning;
    }
    else if(e.key=="t") {
        var titleDiv = this.titleDiv;
        if(titleDiv) {
        console.log("qua");
            this.titleDiv.style.opacity = '0';
            setTimeout(function() {
                document.body.removeChild(titleDiv);        
            }, 1000);
            this.titleDiv = null;
        }
    }    
    
    else console.log(e);
}

titlePage.drag = function(dx,dy) {
    if(!this.model) return;
    this.model.setPaintParameter(this.model.paintParameter + 0.001*dx);
}

