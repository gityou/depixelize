

/* 

1) reshape graph
  input: image
  -) create similarity graph with node for each pixel
  -) connect each node to all neighbouring 8 pixels
  -) remove from graph all edges that connect dissimilar colours
     compare YUV channels of connected pixels
     if difference is larger than (48/255), (7/255), or (6/255) respectively
     then pixels are determined as dissimilar
  -) remove edges to make graph planar
     if a 2x2 block is fully connected, then remove both diagonal edges
     if a 2x2 block contains only diagonal connections, choose 1 to remove
       decision cannot be made locally to 2x2 block
       if two pixels are part of a long curve feature they should be connected
         (1-aux-heuristic-curves)
         (1-aux-heuristic-sparse-pixels)
         (1-aux-heuristic-islands)
  -) simplify graph
     remove nodes of degree 2
  output: planar graph


2) identify visible edges


3) interpolate colours


*/


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
  for (var x = 0; x < yuv.width-1; x++)
  for (var y = 0; y < yuv.height-1; y++)
  {
    var tl = [ x, y ];
    var tr = [ x+1, y ];
    var bl = [ x, y+1 ];
    var br = [ x+1, y+1 ];
    
    if( yuv.edges[t1][tr] && yuv.edges[tl][bl] &&
        yuv.edges[tl][br] && yuv.edges[bl][br] &&
        yuv.edges[tr][bl] && yuv.edges[tr][br] )
    {
      gr.remove_edge(tl,br);
      gr.remove_edge(tr,bl);
    }
  }
}

function render_remove_dissimilar_edges( imd, yuv ) {
  for (var x = 0; x < imd.width; x++)
  for (var y = 0; y < imd.height; y++)
  {
    var offset = (y*imd.width + x)*4;
    imd.data[offset+0] = 255;
    imd.data[offset+1] = 255;
    imd.data[offset+2] = 255;
    imd.data[offset+3] = 255;
  }
  
  for (var x = 0; x < imd.width-1; x++)
  for (var y = 0; y < imd.height-1; y++)
  {
    if( !yuv.edges[[x,y,x+1,y]] ||
        !yuv.edges[[x,y,x,y+1]] ||
        !yuv.edges[[x,y,x+1,y+1]] )
    {
      var offset = (y*imd.width + x)*4;
      imd.data[offset+0] = 0;
      imd.data[offset+1] = 0;
      imd.data[offset+2] = 0;
    }
  }
} 


function render_depixelized( image_id, canvas_id ) {
  var image = document.getElementById( image_id );
  var canvas = document.getElementById( canvas_id );
  var ctx = canvas.getContext ('2d');

  ctx.drawImage(image,0,0,245,100);
  var imd = ctx.getImageData(0,0,245,100);
  var yuv = rgb_to_yuv( imd );
  yuv_add_edges( yuv );
  yuv_remove_dissimilar_edges( yuv );
  yuv_remove_crossbar( yuv );
  
  //count_edges( yuv );
  //count_edges( yuv );

  render_remove_dissimilar_edges( imd, yuv );
  ctx.putImageData(imd,0,0);
}
