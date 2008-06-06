function ZUI( ){
    this.items = [];
    this.mousePos = [0,0];
    this.scale = .3;
    this.maxZoomOut = .3;
    this.x = this.y = 0;
    this.scaleFactor = 1.08;
    this.boundingBox = {top:0, left:0, right:0, bottom: 0, width: 0, height: 0};

    this.inFind = false;
    this.animationSpeed = 500;

    this.setMouse = function( x, y){
        this.mousePos = [x,y];
    }

    this.zoomHere = function( ){
        this.zoomTo( 0, 0, this.maxZoomOut, 400 );
    }

    this.zoomIn = function(){
        this.scale *= this.scaleFactor;

        if( this.scale > 1 ){
            this.scale = 1;
        }else{
            this.x -= (this.scaleFactor-1)*this.mousePos[0]/this.scale;
            this.y -= (this.scaleFactor-1)*this.mousePos[1]/this.scale;
        }
        this.draw();
    }

    this.zoomOut = function(){
        this.scale /= this.scaleFactor;

        if( this.scale < .01 ){
            this.scale = .01
        }else{
            this.x += (1-1/this.scaleFactor)*this.mousePos[0]/this.scale;
            this.y += (1-1/this.scaleFactor)*this.mousePos[1]/this.scale;
        }
        this.draw();
    }

    this.pointIn = function( x, y, rect ){
        if( x >= rect.x && x < rect.x+rect.width && y >= rect.y && y < rect.y+rect.height ) return true
        return false
    }


    this.getLocation = function( ){
        return {"x": this.x, "y": this.y, "scale": this.scale}
    }

    this.setPanStart = function( x, y ){
        zui.panStartCoord = [x, y];
    }

    this.pan = function( x, y ){
        this.x += (x - this.panStartCoord[0])/this.scale;
        this.y += (y - this.panStartCoord[1])/this.scale;
        this.setPanStart( x, y );
        this.draw()            
    }

    this.zoomTo = function( x, y, scale, duration ){
        this.zoomTarget = {"x":x, "y":y, "scale":scale};
        this.zoomStart = this.getLocation();

        this.animationDT = 50;
        this.animationStep = 0;
        this.animationTotalSteps = duration/this.animationDT;
        this.animationOldScale = this.scale

        clearInterval( this.animationInterval );
        this.animationInterval = setInterval( function(){zui.animate()}, this.animationDT );
    }

    this.eased = function(firstNum, lastNum){
        n = this.animationStep/this.animationTotalSteps
        return ((-Math.cos(n*Math.PI)/2) + 0.5) * (lastNum-firstNum) + firstNum;
    }

    this.linear = function(firstNum, lastNum){
        n = this.animationStep/this.animationTotalSteps
        return n * (lastNum-firstNum) + firstNum;
    }

    this.animate = function(){
        oldScale = this.scale;
        this.scale = this.eased( this.zoomStart.scale, this.zoomTarget.scale );

        deltaScale = this.scale - oldScale
        s = this.zoomStart.scale
        t = this.zoomTarget.scale
        sX = this.eased( this.zoomStart.x*s, this.zoomTarget.x*t )
        sY = this.eased( this.zoomStart.y*s, this.zoomTarget.y*t )
        
        this.x = sX/this.scale
        this.y = sY/this.scale
        
        this.draw();

        this.animationStep += 1;
        if( this.animationStep > this.animationTotalSteps ) clearInterval( this.animationInterval );
    }


    this.add = function( item ){
        item.setId( "zui_"+this.items.length );
        this.items.push( item );
    }

    this.draw = function(){
        for( i in this.items ){
            this.items[i].draw( this );
        }
    }

    this.recalculateBoundingBox = function(){
      var boundingBox = { top:0, left:0, right:0, bottom: 0};
      
      $(this.items).each( function(){
        var apparent = {
          top: this.y*zui.scale,
          left: this.x*zui.scale,
          right: (this.x+this.width)*zui.scale,
          bottom: (this.y+this.height)*zui.scale,
        };

        boundingBox.top = Math.min( apparent.top, boundingBox.top );
        boundingBox.left = Math.min( apparent.left, boundingBox.left );
        boundingBox.right = Math.max( apparent.right, boundingBox.right );
        boundingBox.bottom = Math.max( apparent.bottom, boundingBox.bottom );
      })
      
      boundingBox.width = boundingBox.right-boundingBox.left;
      boundingBox.height = boundingBox.bottom-boundingBox.top;
      
      function computeScale( dimension, constraint ){
        // The .99 is to zoom out just a bit more than srictly necessary.
        return zui.maxZoomOut * dimension/constraint * .99; 
      }
      
      zui.maxZoomOut = Math.min(
        computeScale( window.innerHeight, boundingBox.bottom ),
        computeScale( window.innerWidth, boundingBox.right )
      )
      
      this.boundingBox = boundingBox;
  }
  
  // A rect = { x:x, y:y, width:width, height:height }
  this.doesRectCollude = function( rect ) {
    for( var i=0; i< this.items.length; i++ ) {
      console.log( rect )
      if( this.items[i].overlapsRect(rect) ){
        console.log( "TRUE" )
        return true;
      }
    }
    return false;
  }
  
  this.findOpenLocation = function( width, height ) {
    var dist = 2;
    console.log( "" );
    
    //while( 1 ) {
      for( var i=0; i<=dist; i++){
        var rect = {x:i*dist, y:height*dist, width:width, height:height};
        if( !this.doesRectCollude( rect ) )
          return rect; // TODO: Step back to find first open space...
        
        //var rect = {x:width*dist, y:width*i, width:width, height:height};
        //if( !this.doesRectCollude( rect ) )
        //  return rect;  // TODO: See above.
      }
      //dist += 1;
    //}
  }

}

// Function wrappers of DOOM!
// Makes them no-ops if their criteria isn't satisfied.
function _wrapFunctionIf( func, expr ){
  return function() {
    if( eval(expr) )
      return func.apply( this, arguments );
    else
      return function(){}     
  }  
}

function ifZoomedIn( func ){ return _wrapFunctionIf(func, "zui.scale == 1" ); }
function ifZoomedOut( func ){ return _wrapFunctionIf(func, "zui.scale != 1" ); }


Tab = function( div ) {
  this.main = div;
  this.img = $(div).find("img.content");
  $(div).find("img").css({ position: "relative" }) 
  this.mouseState = "up";
  
  this.startPos = {x:0, y:0};
  this.startTop = 0;
  this.startLeft = 0;
  this.realTop = 0;
  this.realLeft = 0;
  
  var self = this;
  
  this.getCurrentTop = function() {
    var t = $(self.img).css("top");
    return parseInt( t.substr( 0, t.length - 2 ) );    
  }

  this.getCurrentLeft = function() {
    var t = $(self.img).css("left");
    return parseInt( t.substr( 0, t.length - 2 ) );    
  }

  
  this.setScroll = function( pos ) {
    var top = pos.top == null? this.realTop : pos.top;
    var left = pos.left == null? this.realLeft : pos.left;
    
    $(self.img).css("top", top);
    $(self.img).css("left", left);    
    this.realTop = top;
    this.realLeft = left;
    
    // Background magic. This syncs it up with the dragging.
    var offsetHeight = $(self.main).height() - $(self.img).height();
    if( top > 0 ){
      var bImage = "url(gfx/ZoomOutTopOff.png)";
      if( top > 340 ) bImage = "url(gfx/ZoomOutTopOn.png)";
      
      $(this.main).css({
        "background-image": bImage,
        "backgroundPosition": "0 " + top
      });
    }
    
    else if( top < offsetHeight ){
      var bImage = "url(gfx/ZoomOutBottomOff.png)";
      if( top < offsetHeight-340 ) bImage = "url(gfx/ZoomOutBottomOn.png)";
      
      $(this.main).css({
        "background-image": bImage,
        "backgroundPosition": "0 " + (top-offsetHeight)
      });
    }

    else if( left < 0 ){
      $(this.main).css({
        "background-image":"url(gfx/ZoomOutRight.png)",
        "backgroundPosition": left + " 0"
      });      
    }
    else if( left > 0 ){
      $(this.main).css({
        "background-image":"url(gfx/ZoomOutLeft.png)",    
        "backgroundPosition": left + " 0"
      });      
    }
    else{
      $(this.main).css({"background-image":"none"});      
    }
  }
  
  this.animateScroll = function( pos ) {
    var top = pos.top == null? this.realTop : pos.top;
    var left = pos.left == null? this.realLeft : pos.left;
    var speed = pos.speed || "normal";
    
    $(self.img).animate({ top: top, left:left }, speed);
    this.realTop = top;
    this.realLeft = left;        
  }
  
  this.mouseDown = function( e ) {
    self.mouseState = "down";
    self.startPos = {x:e.clientX, y:e.clientY };
    self.startTop = self.getCurrentTop();
    self.startLeft = self.getCurrentLeft();
    
    e.preventDefault();
  };
  
  this.mouseUp = function( e ) {
    function delayedZoomOut(){
      setTimeout( function(){
        self.animateScroll({left:0, speed:200});
        makePagesDraggable();
        zui.zoomHere();
      }, 300)
    }
    
    self.mouseState = "up";
    
    var cTop = self.realTop;
    if( cTop > 0 ){      
      self.animateScroll({ top:0, speed: 200 });
      if( cTop > 300 )
        delayedZoomOut();    
    }
    
    var offsetHeight = $(self.main).height() - $(self.img).height();
    if( cTop < offsetHeight ){
      self.animateScroll({ top:offsetHeight, speed: 200 });
      if( offsetHeight - cTop > 300 )       
        delayedZoomOut();
    }
        
    var cLeft = self.realLeft;
    if( cLeft > 0 ){
      
      if( cLeft > 50 && cLeft < 300){
        self.setScroll({left:100});
      }
      else
        self.animateScroll({left: 0, speed: 150});
      
      if( cLeft > 300 )       
        delayedZoomOut();
    }
    
    if( cLeft < 0 ){
      self.animateScroll({left: 0, speed: 150});
      if( cLeft < -300 )       
       delayedZoomOut();

    }

    
  };
  
  this.mouseMove = function( e ) {
    if( self.mouseState != "down" ) return;
    self.setScroll({
      top: self.startTop - 2*(self.startPos.y - e.clientY),
      left: self.startLeft - 2*(self.startPos.x - e.clientX)
    });    
  };
  
}



var ZObject = Extend.Class({
  name: "ZObject",
  initialize: function(){ /* Remember to call __init__(); */ },
  methods: {
    setId: function(id) { $(this.main).attr( "id", id ); },
    getId: function() { return $(this.main).attr("id"); },
    
    __init__: function( x, y ){
      if( !this.main ) return;
      
      $(this.main).addClass( "zwindow" ).css({
        zIndex: 2,
        position: "absolute",
      });
      
      this.main.zparent = this;
      $("body").append(this.main);
      
      this.width = $(this.main).width();
      this.height = $(this.main).height();

      this.x = x;
      this.y = y;         
    },
    zoomHere: function(){
        x = -this.x + (window.innerWidth-this.width)/2;
        y = -this.y + (window.innerHeight-this.height)/2;                
        zui.zoomTo( x, y, 1, zui.animationSpeed ); 
    },
    calcBounds: function(){
        this.cX = (this.x+zui.x)*zui.scale;
        this.cY = (this.y+zui.y)*zui.scale;
        this.cW = this.width*zui.scale;
        this.cH = this.height*zui.scale;
    },
    overlapsRect: function( rect ){
      var sX = this.x;
      var sY = this.y;
      var sW = this.width;
      var sH = this.width;
      if( zui.pointIn(sX, sY, rect) || zui.pointIn(sX+sW, sY+sH, rect) )
        return true
        
      return false
    },
    draw: function(){
        this.calcBounds()
    },
  }
})

var ZButton = Extend.Class({
  name: "ZButton",
  parent: ZObject,
  initialize: function( source, x, y, name ) {
    this.main = document.createElement( "div" );
    this.img = document.createElement( "img" );
    this.name = document.createElement( "h2" );
    

    this.img.src = source;
    $(this.main).width(250).height(250);
    $(this.img).css({width: "100%", height:"100%"});

    name = name.replace(/ /g, "&nbsp;");
    $(this.name).html( name );
    
    $(this.main).append(this.img).append(this.name);
    
    this.__init__( x,y );
  },
  methods:{
    draw: function(){
        this.calcBounds();
        
        $(this.main)
          .css({left: this.cX, top: this.cY})
          .width( this.cW )
          .height( this.cH )
          
        $(this.name).css({ fontSize: zui.scale*65 })        
        return true;
    } 
  }
})

var ZNewTab = Extend.Class({
  name: "ZNewTab",
  parent: ZButton,
  initialize: function( source, x, y, name ){
    this.ZButton_initialize( source, x, y, name );
    $(this.img).click( this.onClick );
  },
  methods: {
    onClick: function(e) {
      var place = zui.findOpenLocation( 800, 480 );
      var newTab = new ZScroll("tab_images/newtab.gif", place.x, place.y, "New Tab");
      zui.add( newTab  );
      zui.recalculateBoundingBox();
      zui.draw();
      zui.zoomHere();
      //newTab.zoomHere();
    }
  }
})

var ZScroll = Extend.Class({
  name: "ZScroll",
  parent: ZObject,
  initialize: function( source, x, y, name ) {    
    this.main = document.createElement( "div" );
    this.main.className = "zscroll";

    // Setup div dimensions and CSS.
    $( this.main ).height( 480 ).width( 800 ).css({ overflow: "hidden" });
            
    this.img = document.createElement( "img" );
    this.img.src = source;
    this.img.className = "content";
    $(this.main).append( this.img );
        
    this.name = document.createElement( "h2" );
    $(this.name).text( name )
                .css({position: "absolute", zIndex: 10});
    $(document.body).append( this.name );
    
    this.__init__(x,y);
    
        
    $(this.main).click( ifZoomedOut(function() {
      this.zparent.zoomHere();
      makePagesUndraggable();
    }))
    
    this.theTab = new Tab( this.main );
    $(this.main).mousedown( ifZoomedIn(this.theTab.mouseDown) )
                .mouseup( ifZoomedIn(this.theTab.mouseUp) )
                .mousemove( ifZoomedIn(this.theTab.mouseMove) );
                
    
  },

  methods:{
    positionName: function(x, y){
      $(this.name).css({
        left: x+ "px",
        top: y-125*zui.scale + "px",
        fontSize: zui.scale*65,
      })      
    },
    
    draw: function(){
        this.calcBounds();
        
        $(this.main)
          .css({left: this.cX, top: this.cY})
          .width( this.cW )
          .height( this.cH )

        $(this.img)
          .css("top", this.theTab.realTop*zui.scale + "px")
          .width( this.cW )
          .height( this.img.naturalHeight*zui.scale );
        
        this.positionName( this.cX, this.cY );
        
        return true;
    } 
  }
  
})


function makePagesDraggable(){
    $(".zscroll").Draggable({
      zIndex: 1000,
      ghosting: false,
      opacity: .8,
      distance: 10,
      onStart: function(){
        this.justStarted = true;
      },

      onDrag: function( x, y ){
        if( this.justStarted ){
          this.justStarted = false;
          this.startCoord = [x,y];
        }
        this.lastCoord = [x,y];
        
        this.zparent.positionName( x, y );
      },

      onStop: function(){
        xOffset = this.lastCoord[0] - this.startCoord[0];
        yOffset = this.lastCoord[1] - this.startCoord[1];
        this.zparent.x += xOffset/zui.scale;
        this.zparent.y += yOffset/zui.scale;
     
        zui.recalculateBoundingBox();
        zui.zoomHere();
      },                 
    });
}


function makePagesUndraggable(){
    $(".zscroll").DraggableDestroy();
}

function bindActions(){
    $("html").click( function(e){
        if( e.target.tagName == "HTML" ){
            self = this.zparent;
            zui.zoomTo( 0, 0, zui.maxZoomOut, zui.animationSpeed );
        }
    })
}

function unbindActions(){
    $("html").unbind();
}


function init(){
  zui = new ZUI();

  /*
  zui.add( new ZScroll("tab_images/slashdot.gif", 50, 100, "Slashdot") )
  zui.add( new ZScroll("tab_images/reddit.gif", 50, 750, "Reddit") )    
  zui.add( new ZScroll("tab_images/toolness.gif", 900, 750, "Toolness") )
  zui.add( new ZScroll("tab_images/humanized.gif", 900, 100, "Humanized") )
  //zui.add( new ZScroll("tab_images/newtab.gif", 1750, 100, "New Tab") )
  */
  
  
  //zui.add( new ZNewTab("gfx/BigPlus.png", 600, 680, "New Tab") );
  //zui.add( new ZScroll("tab_images/bookmarks.gif", 1400, 600, "Bookmarks") )

  zui.add( new ZNewTab("gfx/BigPlus.png", 200, 200, "New Tab") );
  zui.add( new ZScroll("tab_images/Bookmarks.gif", 700, 100, "Bookmarks") )

  zui.recalculateBoundingBox();
  zui.zoomHere();
  zui.draw();

  bindActions();
  makePagesDraggable();

  function doZoom(){
    if( zui.keyDown ){
      if( zui.zoomDirection == "in" ) zui.zoomIn();
      if( zui.zoomDirection == "out" ) zui.zoomOut();
      setTimeout( doZoom, 20 );
    }
  }

  $(window).keydown( function(e) {
    // Alt-O
    if( e.keyCode == 79 ){
      //&& e.altKey
      zui.zoomHere();
      makePagesDraggable()
      return false;
    }
  })
}