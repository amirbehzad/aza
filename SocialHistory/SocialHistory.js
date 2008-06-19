/*
 * Social Limit - Only the social you care about.
 *
 * Enables your site to know which social bookmarking badges to display to your
 * visitors. It tells you all social sites the user has gone to, or you can 
 * query for a specific one.
 * 
 * For example:
 * 
 *    var sl = SocialHistory();
 *    alert( sl.doesVisit("Digg") ); // Returns true/false, -1 if unknown.
 *    var listOfVisitedSites = sl.visitedSites();
 *    var checkedSites = sl.checkedSites();
 *
 * If you want to add more sites to check, you can pass that in as a dictionary
 * to History:
 *
 *    var more = { "Humanized": "http://humanized.com",
 *                 "Azarask.in": ["http://azarask.in", "http://azarask.in/blog"]
 *               };
 *    var sl = SocialHistory(more);
 *    alert( sl.doesVisit("Humanized") );
 *
 * For a list of built-in sites, see the sites variable below.
 *
 * Copyright (c) 2008 Aza Raskin (http://azarask.in/blog)
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 */

var SocialHistory = function( moreSites ){

  var sites = {
    "Digg": ["http://digg.com", "http://digg.com/login"],
    "Reddit": ["http://reddit.com", "http://reddit.com/new/", "http://reddit.com/controversial/", "http://reddit.com/top/", "http://reddit.com/r/reddit.com/", "http://reddit.com/r/programming/"],
    "StumbleUpon": ["http://stumbleupon.com"],
    "Yahoo Buzz": ["http://buzz.yahoo.com"],
    "Facebook": ["http://facebook.com/home.php", "http://facebook.com", "https://login.facebook.com/login.php"],
    "Del.icio.us": ["https://secure.del.icio.us/login", "http://del.icio.us/"],
    "MySpace": ["http://www.myspace.com/"],
    "Technorati": ["http://www.technorati.com"],
    "Newsvine": ["https://www.newsvine.com", "https://www.newsvine.com/_tools/user/login"],
    "Songza": ["http://songza.com"],
    "Slashdot": ["http://slashdot.org/"],
    "Ma.gnolia": ["http://ma.gnolia.com/"],
    "Blinklist": ["http://www.blinklist.com"],
    "Furl": ["http://furl.net", "http://furl.net/members/login"],
    "Mister Wong": ["http://www.mister-wong.com"],
    "Current": ["http://current.com", "http://current.com/login.html"],
    "Menaeme": ["http://meneame.net", "http://meneame.net/login.php"],
    "Oknotizie": ["http://oknotizie.alice.it", "http://oknotizie.alice.it/login.html.php"],
    "Diigo": ["http://www.diigo.com/", "https://secure.diigo.com/sign-in"],
    "Funp": ["http://funp.com", "http://funp.com/account/loginpage.php"],
    "Blogmarks": ["http://blogmarks.net"],
    "Yahoo Bookmarks": ["http://bookmarks.yahoo.com"],
    "Xanga": ["http://xanga.com"],
    "Blogger": ["http://blogger.com"],
    "Last.fm": ["http://www.last.fm/", "https://www.last.fm/login/"],
    "N4G": ["http://www.n4g.com"],
    "Faves": ["http://faves.com", "http://faves.com/home", "https://secure.faves.com/signIn"],
    "Simpy": ["http://www.simpy.com", "http://www.simpy.com/login"],
    "Yigg": ["http://www.yigg.de"],
    "Kirtsy": ["http://www.kirtsy.com", "http://www.kirtsy.com/login.php"],
    "Fark": ["http://www.fark.com", "http://cgi.fark.com/cgi/fark/users.pl?self=1"],
    "Mixx": ["https://www.mixx.com/login/dual", "http://www.mixx.com"],
    "Google Bookmarks": ["http://www.google.com/bookmarks", "http://www.google.com/ig/add?moduleurl=bookmarks.xml&hl=en"],
    "Subbmitt": ["http://subbmitt.com/"]
  };
  
  for( var site in moreSites ) {
    // If we don't have the site, create the URL list.
    if( typeof( sites[site] ) == "undefined" ) sites[site] = [];
    
    // If the value is string, just push that onto the URL list.
    if( typeof( moreSites[site] ) == "string" )
      sites[site].push( moreSites[site] );
    else
      sites[site] = sites[site].concat( moreSites[site] );
  }
  
  var visited = {};

  function getStyle(el, scopeDoc,styleProp) {
    if (el.currentStyle)
      var y = el.currentStyle[styleProp];
    else if (window.getComputedStyle)
      var y = scopeDoc.defaultView.getComputedStyle(el,null).getPropertyValue(styleProp);
    return y;
  }
  
  function remove( el ) {
    el.parentNode.removeChild( el );
  }
  
  // Code inspired by:
  // bindzus.wordpress.com/2007/12/24/adding-dynamic-contents-to-iframes
  function createIframe() {
    var iframe = document.createElement("iframe");
    iframe.style.position = "absolute";
    iframe.style.visibility = "hidden";

    document.body.appendChild(iframe);

    // Firefox, Opera
    if(iframe.contentDocument) iframe.doc = iframe.contentDocument;
    // Internet Explorer
    else if(iframe.contentWindow) iframe.doc = iframe.contentWindow.document;

    // Magic: Force creation of the body (which is null by default in IE).
    // Also force the styles of visited/not-visted links.
    iframe.doc.open();
  	iframe.doc.write('<style>');
  	iframe.doc.write("a{color: #000000; display:none;}");  	
  	iframe.doc.write("a:visited {color: #FF0000; display:inline;}");  	
  	iframe.doc.write('</style>');
    iframe.doc.close();
    
    // Return the iframe: iframe.doc contains the iframe.
    return iframe;
  }  

  var iframe = createIframe();
  
  function embedLinkInIframe( href, text ) {
    var a = iframe.doc.createElement("a");
    a.href = urls[i];
    a.innerHTML = site;
    iframe.doc.body.appendChild( a );
    //console.log( a.href );
  }
  
  for( var site in sites ) {
    var urls = sites[site];
    for( var i=0; i<urls.length; i++ ) {
      // You have to create elements in the scope of the iframe for IE.
      embedLinkInIframe( urls[i], site );
      
      // Automatically try variations of the URLS with and without the "www"
      if( urls[i].match(/www\./) ){
        var sansWWW = urls[i].replace(/www\./, "");
        embedLinkInIframe( sansWWW, site );
      } else {
        // 2 = 1 for length of string + 1 for slice offset
        var httpLen = urls[i].indexOf("//") + 2;
        var withWWW = urls[i].substring(0, httpLen ) + "www." + urls[i].substring( httpLen );
        embedLinkInIframe( withWWW, site );
      }
      
    }
  }
    
  var links = iframe.doc.body.childNodes;
  for( var i=0; i<links.length; i++) {
    // Handle both Firefox/Safari, and IE (respectively)
    var displayValue = getStyle(links[i], iframe.doc, "display");
    var didVisit = displayValue != "none";
      
    if( didVisit ){
      visited[ links[i].innerHTML ] = true;
    }
  }
  
  //remove( iframe );
  
  return new (function(){
    var usedSites = [];
    for( var site in visited ){
      usedSites.push( site );
    }
    
    // Return an array of visited sites.
    this.visitedSites = function() {
      return usedSites;
    }
    
    // Return true/false. If we didn't check the site, return -1.
    this.doesVisit = function( site ) {
      if( typeof( sites[site] ) == "undefined" )
        return -1;
      return typeof( visited[site] ) != "undefined";
    }
    
    var checkedSites = [];
    for( var site in sites ){
      checkedSites.push( site );
    }
    // Return a list of the sites checked.
    this.checkedSites = function(){
      return checkedSites;
    }
  })();
}