function Graph( is_undirected ) {
  if( ! (this instanceof Graph) {
    return new Graph( is_undirected );
  }
  this.is_undirected = is_undirected;
  this.nodes = {};
  this.edges = {};
}

Graph.prototype.add_node( n1, v ) {
  v = v || true;
  this.nodes[n1] = v;
  this.edges[n1] = {};
}

Graph.prototype.add_edge( n1, n2, v ) {
  v = v || true;
  this.edges[n1][n2] = v;
  if( this.is_undirected )
    this.edges[n2][n1] = v;
}

Graph.prototype.remove_edge( n1, n2 ) {
  delete this.edges[n1][n2];
  if( this.is_undirected )
    delete this.edges[n2][n1];
}

