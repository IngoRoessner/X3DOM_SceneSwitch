//Dependencies: x3dom.js, jquery.js

/*
Note:
    elements events would not work after switch, without unbind and rebinding of the event
    use workaround like:
        $(element).unbind("click")
        switchElement(element);
        setClickEvent(element);
*/

/*
Use:
    init by start:
        method: x3dom_switch_init
        params:
            param1: id or element of x3d tag
            param2: id or element of x3d tag
            param3: function
        example:
            x3dom_switch_init("X3D1", "X3D2", function(x3d_switch){
                x3d_switch.setClickEvents(["Shape1", "Shape2", "Shape3"]);
            });


    normal init:
        method: x3dom_switch
        params:
            param1: id or element of x3d tag
            param2: id or element of x3d tag
        example:
            var x3d_switch = new x3dom_switch("X3D1", "X3D2");


    clickable elements:
        method: setClickEvents
        params:
            param1: array of id or element of elements witch should be switch on click
        example:
            x3d_switch.setClickEvents(["Shape1", "Shape2", "Shape3"]);


    activate and deactivate clickable
        attribute: listenEvents
        default: true
        example: x3d_switch.listenEvents = false; //ignore click events


    switch single element:
        method: switchElement
        params:
            param1: id or element
        example:
            x3d_switch.switchElement("Shape1");

*/

//util
var isDescendant = function(parent, child) {
     var node = child.parentNode;
     while (node != null) {
         if (node == parent) {
             return true;
         }
         node = node.parentNode;
     }
     return false;
}


//parameter as id string or dom element of <x3d>
var x3dom_switch = function(x3d_1, x3d_2){
//Private:

    var idPrefix = "x3dom_switch_copy_id_";

    var getElement = function(idOrElement){
        var result;
        if(typeof idOrElement === "string"){
            result = document.getElementById(idOrElement);
        }else{
            result = idOrElement;
        }
        return result;
    }

    var getScene = function(x3d){
        return x3d.getElementsByTagName("scene")[0];
    }

    var setClickEvent = function(element){
        $(element).click(function(event){
            if(that.listenEvents){
                that.switchElement(this);
            }
        });
    }

    //augments the element with the original parent and a from the rest of the scene independent node copy
    //augmentations:
    //      rootCopy (the root of the copied graph),
    //      parentCopy (equivalent to the origParent),
    //      origParent
    var augmentElement = function(element){
        var firstCopy = true;
        var rootCopy = element;
        var next = element.parentNode;
        element.origParent = next;

        //create copy
        while(next.tagName != "scene" && next.tagName != "SCENE"){
            var child = rootCopy;
            var useAppend = firstCopy && child != element;
            //use saved copy if possible
            if(next.copy){
                rootCopy = next.copy;
                firstCopy = false;
            }else{
                rootCopy = next.cloneNode(false);
                next.copy = rootCopy;
                rootCopy.id = idPrefix+rootCopy.id;
            }
            //append only if copy is created and not reused, no append for param element (child != element)
            if(useAppend){
                rootCopy.appendChild(child);
            }
            //create parentCopy augmentation if not existent (not existent -> rootCopy == first copy)
            if(!element.parentCopy){
                element.parentCopy = rootCopy;
            }
            next = next.parentNode;
        }
        element.rootCopy=rootCopy;
    }

    //augments the element if it isnt already
    var getAugmentedElement = function(element){
        if(!element.rootCopy){
            augmentElement(element);
        }
        return element;
    }

    //return the original parent node or a element in the target scene with the same transform attributes as the original parent
    var getDestination = function(scene, element){
        var result;
        var element = getAugmentedElement(element);
        if(isDescendant(scene, element.origParent)){
            result = element.origParent;
        }else{
            scene.appendChild(element.rootCopy);
            result = element.parentCopy;
        }
        return result;
    }

    //moves the element to the given x3d (and its scene)
    //tech: without unbind and rebinding of the event future clicks wouldn't work
    var switchElementTo = function(element, to){
        $(element).unbind("click")
        getDestination(getScene(to), element).appendChild(element);
        setClickEvent(element);
    }

    //private vars
    var x3d1 = getElement(x3d_1);
    var x3d2 = getElement(x3d_2);
    var that = this;

//Public:
    //true -> click event active, false -> click event not active
    this.listenEvents = true;

    //move the given element from one x3d to the other.
    this.switchElement = function(elementOrId){
        var element = getElement(elementOrId);
        if(isDescendant(x3d1, element)){
            switchElementTo(element, x3d2);
        }else if(isDescendant(x3d2, element)){
            switchElementTo(element, x3d1);
        }
    }

    //add elementsOrIDs = array of elements or ids
    this.setClickEvents = function(elementsOrIDs){
        for( key in elementsOrIDs){
            var element = getElement(elementsOrIDs[key]);
            if(element.id != "" && element.id != null && (isDescendant(x3d1, element)||isDescendant(x3d2, element))){
                setClickEvent(element);
            }
        }
    }

    this.getX3DElements = function(){
        return [x3d1, x3d2];
    }

    return this;
}


var x3dom_switch_init = function(x3d1, x3d2, foo){
    var getElement = function(idOrElement){
        var result;
        if(typeof idOrElement === "string"){
            result = document.getElementById(idOrElement);
        }else{
            result = idOrElement;
        }
        return result;
    }

    x3dom.runtime.ready = function(){
        var x3d1_ = getElement(x3d1);
        var x3d2_ = getElement(x3d2);
        //wait for the second ready() (isReady = true after ready() -> only one isReady == true)
        if((x3d2_.runtime && x3d1_.runtime.isReady) || (x3d2_.runtime && x3d2_.runtime.isReady)){
            var x3d_switch = new x3dom_switch(x3d1_, x3d2_);
            foo(x3d_switch);
        }
    };
}
