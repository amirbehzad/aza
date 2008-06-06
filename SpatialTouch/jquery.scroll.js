;(function($) {
  
$.fn.tab = function() {
  $(this).each( setupTab );  
};

Tab = function( div ) {
  this.div = div;
  this.top = $(div).find(".top")
  this.img = $(div).find(".content");
  this.mouseState = "up";
  
  this.startPos = {x:0, y:0};
  this.startTop = 0;
  
  var self = this;
  
  this.getCurrentTop = function() {
    var t = $(self.img).css("top");
    return parseInt( t.substr( 0, t.length - 2 ) );    
  }
  
  this.setScroll = function( t ) {
    $(self.img).css("top", t);
  }
  
  this.animateScroll = function( t ) {
    $(self.img).animate({ top: t });
    $(self.top).animate({ top: t });    
  }
  
  this.mouseDown = function( e ) {
    self.mouseState = "down";
    self.startPos = {x:e.clientX, y:e.clientY };
    self.startTop = self.getCurrentTop();
    
    e.preventDefault();
  };
  
  this.mouseUp = function( e ) {
    self.mouseState = "up";
    var cTop = self.getCurrentTop();
    if( cTop > 0 ){ self.animateScroll( 0 ); }
    
    var offsetHeight = window.innerHeight - $(self.img).height();
    if( cTop < offsetHeight ){ self.animateScroll( offsetHeight); }
  };
  
  this.mouseMove = function( e ) {
    if( self.mouseState != "down" ) return; 
    self.setScroll( self.startTop - 2*(self.startPos.y - e.clientY) );    
  };
  
}

var setupTab = function( ) {
  var div = this;
    
  // Setup div dimensions and CSS.
  $(div).height( 480 ).width( 800 ).css({ overflow: "hidden" });
    
  var img = document.createElement( "img" );
  img.src = $(div).attr("img");
  img.className = "content";
  $(div).append( img );
  
  $(img).css({ position: "relative" });
  $(topDiv).css({ position: "relative" });
  
  var theTab = new Tab( div );
  $(div).mousedown( theTab.mouseDown )
        .mouseup( theTab.mouseUp )
        .mousemove( theTab.mouseMove );

};

  
  
})(jQuery);