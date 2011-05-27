

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
