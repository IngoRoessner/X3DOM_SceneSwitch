x3dom_switch_init("X3D1", "X3D2", function(x3d_switch){
    x3d_switch.setClickEvents(["Shape1", "Shape2", "Shape3"]);

    //event bubbling not stopable in x3dom event mapping from canvas
    //x3d_switch.setClickEvents(["Shape1", "Shape2", "ShapeDeep1"]);
});