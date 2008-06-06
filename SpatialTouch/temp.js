function ZScroll( source, x, y, caption ){
    this.image = document.createElement( "div" );
    $(this.image).attr("img", "tab_images/slashdot.png");
    this.image.className = "tab";
    $(this.image).tab();
  

    this.image.style.position = "absolute"
    this.image.zparent = this;
    $(this.image).find("img").get(0).zparent = this;

    $(this.image).css("zIndex", 2).addClass( "zwindow" );
    this.caption = caption
    $("body").append(this.image)

    this.width = $(this.image).width();
    this.height = $(this.image).height();

    this.x = x
    this.y = y

    this.setId = function( id ){
        $(this.image).attr( "id", id )
    }

    this.getId = function(){ return $(this.image).attr("id") }

    this.zoomHere = function(){
        x = -this.x + (window.innerWidth-this.width)/2
        y = -this.y + (window.innerHeight-this.height)/2                
        zui.zoomTo( x, y, 1, zui.animationSpeed ); 
    }

    this.matches = function( string ){
        if( this.getTitle().search(string ,"i") != -1 ) return true;
        return false;
    }

    this.getTitle = function(){
        return this.caption;
    }

    this.highlighted = function( yes ){
        if( yes ) $(this.image).css("z-index", 200).addClass("highlighted");
        else $(this.image).css("z-index", 2).removeClass("highlighted");
    }
    
    this.calcBounds = function(){
        this.cX = (this.x+zui.x)*zui.scale;
        this.cY = (this.y+zui.y)*zui.scale;
        this.cW = this.width*zui.scale;
        this.cH = this.height*zui.scale;
    }

    this.overlapsEl = function( el ){
        if( zui.pointIn(this.x, this.y, el) || zui.pointIn(this.x+this.width, this.y+this.height, el) ) return true
        return false
    }

    this.parentFrame = function(){
        for( i=0; i < zui.items.length; i++ ){
            if( zui.items[i].type == "Workspace" && this.overlapsEl(zui.items[i])){
                return zui.items[i];
            }
        }

        return null;
    }

    this.draw = function(){
        this.calcBounds()
        
        $(this.image).css("left", this.cX + "px")
        $(this.image).css("top", this.cY + "px")

        $(this.image).width( this.cW );
        $(this.image).height( this.cH );
        $(this.image).find("img").width( this.cW );
        $(this.image).find("img").height( this.cH );
        
        return true;
    }

}