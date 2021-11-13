# Lichtbundel


Now busy with https://stackoverflow.com/questions/9043805/test-if-two-lines-intersect-javascript-function to work on intersection of the lightbeam with the figure.

Todo:
Draw points on corners


##How it works

After the second beam-point has been clicked the real fun starts. 
First, we have to determine the first intersection point. 

We have an array filled with figure-lines and a lightbeam.

####Calculating the beam path
At this time this is done by first calculating the point where the beam collides with the border. First we determine the direction of the line in the y and x-axis. With these directions we can determine if the beam collides with the axis or the far edge.  We then calculate the intersection point with either the X-axis or bottom edge. If the calculated y-coordinate falls within the bounds we know the beam's endpoint. If not, calculate the intersection with Y (or right edge).   



####Getting the first intersection with the beam
Then we iterate over all linesegments and discard the segments that do not intersect with the beam (fist beampoint to intersection beam-border). If no segments intersect the beam hits the border and we're done!

We now know all intersecting linesegments. To find out the first intersection I just take the first possibility and check if the beamsegment from beam point one to intersection possibility one intersects with one of the other possibilities. 
If that is the case, discard the first possibility and use the second one. If no possibilities are left after that we have a winner! 

####Calculating the reflected beam
![alt text](https://github.com/Xinne/lichtbulb/blob/[branch]/image.jpg?raw=true)



