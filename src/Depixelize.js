
var abs = Math.abs;

function load_imd( src ) {
  var canvas = document.createElement("canvas");  
  var img = new Image(); img.src = src;
  var ctx = canvas.getContext ('2d');
  ctx.drawImage(img,0,0,img.width,img.height);
  return ctx.getImageData(0,0,img.width,img.height);
}

function imd_to_graph ( imd ) {
  var Wr = 0.299;
  var Wb = 0.114;
  var Wg = 0.587;
  var Umax = 0.436;
  var Vmax = 0.615;

  var gr = Graph( true );

  //add nodes
  for (var x = 0; x < imd.width; x++)
  for (var y = 0; y < imd.height; y++)
  {
    var offset = (y*imd.width + x)*4;
    var r = imd.data[offset];
    var g = imd.data[offset + 1];
    var b = imd.data[offset + 2];

    var Y = Wr*r + Wg*g + Wb*b;
    var U = Umax * (b-Y)/(1-Wb);
    var V = Vmax * (r-Y)/(1-Wr);
    
    gr.add_node( [x,y], [Y,U,V] );
  }

  //add edges
  for (var x = 0; x < imd.width; x++)
  for (var y = 0; y < imd.height; y++)
  {
    if( x < imd.width-1 ) gr.add_edge( [x,y], [x+1,y] );
    if( y < imd.height-1 ) gr.add_edge( [x,y], [x,y+1] );
    if( x < imd.width-1 && y < imd.height-1 ) {
      gr.add_edge( [x,y], [x+1,y+1] );
      gr.add_edge( [x+1,y], [x,y+1] );
    }
  }  

  return gr;
}


function remove_dissimilar_edges( gr ) {
  for (var n1 in gr.edges) 
  for (var n2 in gr.edges[n1])
  {
    var c1 = gr.nodes[n1];
    var c2 = gr.nodes[n2];
    if( abs(c1[0]-c2[0])>48 ||  
        abs(c1[1]-c2[1])>(7/255) ||
        abs(c1[2]-c2[2])>(6/255) )
      gr.remove_edge(n1,n2);    
  }
}
function remove_crossbar( gr ) {
  for( var n1 in gr.nodes )
  {
    var tl = eval("["+n1+"]");
    var x = tl[0], y = tl[1];
    var tr = [ x+1, y ];
    var bl = [ x, y+1 ];
    var br = [ x+1, y+1 ];
    
    if( gr.edges[tl][tr] && gr.edges[tl][bl] &&
        gr.edges[tl][br] && gr.edges[bl][br] &&
        gr.edges[tr][bl] && gr.edges[tr][br] )
    {
      gr.remove_edge(tl,br);
      gr.remove_edge(tr,bl);
    }
  }
}

