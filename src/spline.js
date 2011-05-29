/*
	Copyright 2010 by Robin W. Spencer

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You can find a copy of the GNU General Public License
    at http://www.gnu.org/licenses/.

*/

function getControlPoints( p0, p1, p2, t){
    //  x0,y0,x1,y1 are the coordinates of the end (knot) pts of this segment
    //  x2,y2 is the next knot -- not connected here but needed to calculate p2
    //  p1 is the control point calculated here, from x1 back toward x0.
    //  p2 is the next control point, calculated here and returned to become the 
    //  next segment's p1.
    //  t is the 'tension' which controls how far the control points spread.
    
    //  Scaling factors: distances from this knot to the previous and following knots.
    var d01=Math.sqrt(Math.pow( p1[0]-p0[0],2)+Math.pow( p1[1]- p0[1],2));
    var d12=Math.sqrt(Math.pow( p2[0]-p1[0],2)+Math.pow( p2[1]- p1[1],2));
   
    var fa=t*d01/(d01+d12);
    var fb=t-fa;
  
    var r1 = [
      p1[0]+fa*(p0[0]-p2[0]),
      p1[1]+fa*(p0[1]-p2[1])
    ];

    var r2 = [
      p1[0]-fb*(p0[0]-p2[0]),
      p1[1]-fb*(p0[1]-p2[1])
    ];
    
    return [ r1, r2 ];
}

function spline_stroke( ctx, pts, t ) {
    ctx.save();
    var cp=[];   // array of control points, as x0,y0,x1,y1,...
    var n=pts.length;

          // Draw an open curve, not connected at the ends
        for(var i=0;i<n-2;i++){
            cp=cp.concat(getControlPoints(pts[i],pts[i+1],pts[i+2],t));
        }

        for(var i=1;i<pts.length-2;i++){
            ctx.beginPath();
            ctx.moveTo( pts[i][0],pts[i][1] );
            ctx.bezierCurveTo( cp[2*i-1][0],cp[2*i-1][1], cp[2*i][0],cp[2*i][1], pts[i+1][0],pts[i+1][1] );
            ctx.stroke();
            ctx.closePath();
        }

        //  For open curves the first and last arcs are simple quadratics.
        ctx.beginPath();
        ctx.moveTo(pts[0][0],pts[0][1]);
        ctx.quadraticCurveTo( cp[0][0],cp[0][1], pts[1][0],pts[1][1] );
        ctx.stroke();
        ctx.closePath();
        
        ctx.beginPath();
        ctx.moveTo(pts[n-2][0],pts[n-2][1]);
        ctx.quadraticCurveTo( cp[2*n-5][0],cp[2*n-5][1], 
                              pts[n-1][0],pts[n-1][1] );
        ctx.stroke();
        ctx.closePath();
  ctx.restore();
}

function spline_fill( ctx, pts, t ) {
    ctx.save();
    var cp=[];   // array of control points, as x0,y0,x1,y1,...
    var n=pts.length;

        //Append and prepend knots and control points to close the curve
        pts.push(pts[0],pts[1]);
        pts.unshift(pts[n-1]);
        for(var i=0;i<n;i++){
            cp=cp.concat(getControlPoints(pts[i],pts[i+1],pts[i+2],t));
        }
        cp.push(cp[0]);

        ctx.beginPath();
        ctx.moveTo(pts[1][0],pts[1][1]);
        for(var i=1;i<n+1;i++){
            ctx.bezierCurveTo( cp[2*i-1][0],cp[2*i-1][1], cp[2*i][0],cp[2*i][1], pts[i+1][0],pts[i+1][1] );
        }
        ctx.closePath();
        ctx.fill();

    ctx.restore();
}


function main(t){
    var e=document.getElementById("canvas1");
    var ctx=e.getContext('2d');
    if(!ctx){return}
    ctx.strokeStyle="rgba(0,0,0,0.3)";
    ctx.lineWidth=4;
    ctx.clearRect(0,0,e.width,e.height);
    //   Drawing a spline takes one call.  The points are an array [x0,y0,x1,y1,...],
    //   the tension is t (typically 0.33 to 0.5), and true/false tells whether to
    //   connect the endpoints of the data to make a closed curve.
    spline_stroke(ctx,[ [20,50], [100,100], [150,50], [200,150], [250,50], [300,70], [310,130], [380,30] ],t);
    spline_fill(ctx,[ [50,200], [150,200], [150,300], [50,300] ],t);
    spline_fill(ctx,[ [260,240], [360,240], [310,340] ],t);
    //   Update the passive display of tension t.
}

