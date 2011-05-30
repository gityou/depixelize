function Graph( is_undirected ) {
  if( ! (this instanceof Graph) ){
    return new Graph( is_undirected );
  }
  this.is_undirected = is_undirected;
  this.nodes = {};
  this.edges = {};
}

Graph.prototype.add_node = function( n1, v ) {
  v = v || true;
  this.nodes[n1] = v;
  this.edges[n1] = {};
}

Graph.prototype.add_edge = function( n1, n2, v ) {
  v = v || true;
  if( !(n1 in this.nodes) ) this.add_node(n1);
  if( !(n2 in this.nodes) ) this.add_node(n2);
  this.edges[n1][n2] = v;
  if( this.is_undirected )
    this.edges[n2][n1] = v;
}

Graph.prototype.remove_edge = function( n1, n2 ) {
  delete this.edges[n1][n2];
  if( this.is_undirected )
    delete this.edges[n2][n1];
}

Graph.polygons = function() {
  var poly = [];
  for( var n1 in this.edges )
  for( var n2 in this.edges[n1] )
  {
    var t = this.trace_polygon(n1,n2);
    if( t ) poly.push( t );
  }
}
Graph.trace_polygon = function( n1, n2 ) {
  var path = [n1,n2];
  var tail = n1;
  while( tail != n2 ) {
    var head = null;
    var theta = -1;
    for( var n3 in this.edges[n2] )
    if( this.theta3( n1, n2, n3 ) > theta ) {
      head = n3;
      theta = this.theta(n1,n2,n3);
    }
    path.push( n3 );
  }
  for( var ni=0; ni<path.length; ni++ ) {
    if( n1 < path[ni] ) return null; 
  }
  return path;
}
Graph.theta3 = function( n1, n2, n3 ) {
  return this.theta(n2,n1) - this.theta(n2,n3);
}
Graph.theta = function( n1, n2 ) {
  
}


Graph.prototype.draw = function( r, x, y, scale ) {
  x = x || 0;
  y = y || 0;
  scale = scale || 1;
  for( var n1 in this.edges )
  for( var n2 in this.edges[n1] )
  {
    n1v = eval("["+n1+"]");
    n2v = eval("["+n2+"]");
    r.path( "M" + (n1v[0]*scale+x) +
            "," + (n1v[1]*scale+y) +
            "L" + (n2v[0]*scale+x) +
            "," + (n2v[1]*scale+y)
    );
  }
}

