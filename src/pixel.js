

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


var abs = Math.abs;
function sizeof( v ){
  var count = 0;
  for( var _ in v ) count ++;
  return count;
}

function rgb_to_yuv ( imd ) {
  var yuv = { width: imd.width, height: imd.height, edges: {} }
  var Wr = 0.299;
  var Wb = 0.114;
  var Wg = 0.587;
  var Umax = 0.436;
  var Vmax = 0.615;

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
    
    yuv[[x,y]] = [Y,U,V];
  }
  return yuv;
}
function yuv_add_edges( yuv ) {
  for (var x = 0; x < yuv.width; x++)
  for (var y = 0; y < yuv.height; y++)
  {
    if( x < yuv.width-1 ) yuv.edges[[x,y,x+1,y]] = true;
    if( y < yuv.height-1 ) yuv.edges[[x,y,x,y+1]] = true;
    if( x < yuv.width-1 && y < yuv.height-1 ) {
      yuv.edges[[x,y,x+1,y+1]] = true;
      yuv.edges[[x+1,y,x,y+1]] = true;
    }
  }  
}

function yuv_remove_dissimilar_edges( yuv ) {
  for (var e in yuv.edges) 
  {
    var ve = eval("[" + e + "]");
    var n1 = yuv[[ ve[0],ve[1] ]];
    var n2 = yuv[[ ve[2],ve[3] ]];

    if( abs(n1[0]-n2[0])>48 ||  
        abs(n1[1]-n2[1])>(7/255) ||
        abs(n1[2]-n2[2])>(6/255) )
      delete yuv.edges[e];    
  }
}
function yuv_remove_crossbar( yuv ) {
  for (var x = 0; x < yuv.width-1; x++)
  for (var y = 0; y < yuv.height-1; y++)
  {
    var tl = [ x, y ];
    var tr = [ x+1, y ];
    var bl = [ x, y+1 ];
    var br = [ x+1, y+1 ];
    
    if( yuv.edges[[ tl[0], tl[1], tr[0], tr[1] ]] &&
        yuv.edges[[ tl[0], tl[1], bl[0], bl[1] ]] &&
        yuv.edges[[ tl[0], tl[1], br[0], br[1] ]] &&
        yuv.edges[[ bl[0], bl[1], br[0], br[1] ]] &&
        yuv.edges[[ tr[0], tr[1], bl[0], bl[1] ]] &&
        yuv.edges[[ tr[0], tr[1], br[0], br[1] ]] )
    {
      delete yuv.edges[[ tl[0], tl[1], br[0], br[1] ]];
      delete yuv.edges[[ tr[0], tr[1], bl[0], bl[1] ]];
    }         
  }
}

function count_edges( yuv ){
  alert( "edge count: " + sizeof(yuv.edges) );
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
