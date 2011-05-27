

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

function rgb_to_yuv ( imd ) {
  var yuv = { width: imd.width, height: imd.height }
  for (var x = 0; x < imd.width; x++)
  for (var y = 0; y < imd.height; y++)
  {
    var Wr = 0.299;
    var Wb = 0.114;
    var Wg = 0.587;
    var Umax = 0.436;
    var Vmax = 0.615;

    var offset = (y*imd.width + x)*4;
    var r = imd.data[offset];
    var g = imd.data[offset + 1];
    var b = imd.data[offset + 2];
    imd.data[offset+3] = 120;

    var Y = Wr*r + Wg*g + Wb+b;
    var U = Umax * (b-Y)/(1-Wb);
    var V = Vmax * (r-Y)/(1-Wr);
    
    yuv[x,y] = [Y,U,V];
  }
  return yuv;
}

function render_depixelized( image_id, canvas_id ) {
  var image = document.getElementById( image_id );
  var canvas = document.getElementById( canvas_id );
  var ctx = canvas.getContext ('2d');

  ctx.drawImage(image,0,0,245,100);
  var imd = ctx.getImageData(0,0,245,100);
  var yuv = rgb_to_yuv( imd );
  ctx.putImageData(imd,0,0);
}
