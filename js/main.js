// camera.attachControl(canvas, true);

var pages = [];



var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0.0, 30.0, 0), scene);
light.intensity = .2;



var pl = new BABYLON.PointLight("pl", new BABYLON.Vector3(20, 5, -200), scene);
pl.diffuse = new BABYLON.Color3(1, 1, 1);
pl.specular = new BABYLON.Color3(0.3, 0.1, 0.1);
pl.intensity = 0.45;


//axes = makeAxes(50);
//saxes.parent = mainGroup;

meter.hide();

function imagePage(fn) {
    return {
        begin : function() { showImage("images/" + fn); },
        end : function() { hideImage(); }
    };
}

// pages.push(foldingTorusPage);
// pages.push(foldingKleinBottlePage);


pages.push(titlePage);

pages.push(foldingMoebiusPage);
pages.push(paintingMoebiusPage);
pages.push(moebiusWithWheelsPage);

pages.push(imagePage("moebius_strip_2_1024.png") );
pages.push(imagePage("moebius_strip_3.png") );

pages.push(RMoebiusPage);

pages.push(cutting2MoebiusPage);
pages.push(slidingMoebiusPage);
pages.push(cutting3MoebiusPage);
pages.push(sixColorsMoebiusPage);

pages.push(lineStarPage);
pages.push(hemispherePage);
pages.push(dummyPage);

pages.push(foldingKleinBottlePage);
pages.push(labeledKleinBottlePage);
pages.push(kleinToMoebiusPage);

var pageIndex = -1;
var currentPage = null;

function setPage(index) {
    if(pageIndex != index) {
        if(pageIndex>=0) pages[pageIndex].end();
        pageIndex = index;
        if(pageIndex>=0) pages[pageIndex].begin();

    }
    currentPage = pageIndex>=0 ? pages[pageIndex] : null;
}

setPage(0);

function getCurrentPage() {
    if(pageIndex>=0) return pages[pageIndex];
    else return null;
}

engine.runRenderLoop(function () {
    meter.tickStart();

   // pl.position = camera.position;

    var page = getCurrentPage();
    if(page.tick) page.tick();

    scene.render();
    meter.tick();

});
window.addEventListener("resize", function () {
 engine.resize();
});


function rotateWorld(dx,dy) {
    myRotate(mainGroup. rotationQuaternion, dx,dy);
/*    var obj = mainGroup;

    obj.rotationQuaternion =
        (new BABYLON.Quaternion())
        .multiply(BABYLON.Quaternion.RotationAxis(new Vector3(1,0,0), -dy*0.01))
        .multiply(BABYLON.Quaternion.RotationAxis(new Vector3(0,1,0), -dx*0.01))
        .multiply(obj.rotationQuaternion);
    obj.rotationQuaternion.normalize();
    */
}


canvas.oncontextmenu = function (e) {
    e.preventDefault();
};

var mousedown = false, oldx,oldy;
window.addEventListener("mousedown", function(e) {
   // console.log(e,scene.pointerX, scene.pointerY);
   mousedown = true;
   oldx = scene.pointerX;
   oldy = scene.pointerY;
   if(e.button == 0 && currentPage && currentPage.onmousedown)  
     currentPage.onmousedown(e);
});
window.addEventListener("mouseup", function(e) {
   // console.log(e,scene.pointerX, scene.pointerY);
   mousedown = false;
});
window.addEventListener("mousemove", function(e) {
    if(mousedown) {
        var dx = scene.pointerX - oldx;
        var dy = scene.pointerY - oldy;
        oldx = scene.pointerX;
        oldy = scene.pointerY;
        if(e.button == 2)
            rotateWorld(dx,dy);
        else if(currentPage && currentPage.drag)
            currentPage.drag(dx,dy);

    }
});

window.addEventListener("wheel", function(e) {
    camera.radius += 0.1*e.deltaY;
});

window.addEventListener("keydown", function(e) {
    if(e.keyCode == '38') { // up arrow
        if(pageIndex>0) setPage(pageIndex-1);
    }
    else if(e.keyCode == '40') { // down arrow
        if(pageIndex+1<pages.length) setPage(pageIndex+1);
    }
    else
    {
        if(currentPage && currentPage.keydown) currentPage.keydown(e);
    }
});

/*
BABYLON.SceneLoader.ImportMesh("", "", "test2.babylon", scene, function (newMeshes, particleSystems) {
    newMeshes.forEach(function(mesh){ mesh.parent = mainGroup; });
});


*/
