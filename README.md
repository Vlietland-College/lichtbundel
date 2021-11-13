# Lichtbundel


# Todo
- [ ] Draw points on corners
- [ ] Show number of collisions
- [ ] Redraw beam on adding figure point
- [ ] Make corners draggable to change figure shape
- [ ] Make canvas zoomable
- [ ] Add interactive mouseover for the beam and figure list 
- [ ] add interactive mouseover for corners
- [ ] Make drawings and results 'savable' shareable
- [x] Prevent CPU lock for infinitive reflection 
- [ ] Make straight angle when shift (?) is held down
- [ ] Make everything beautiful 
- [ ] [Give beam a color gradient](https://github.com/Xinne/lichtbundel/issues/2)

# Live demo
https://apps.xinne.nl/lichtbundel/


## How it works

After the second beam-point has been clicked the real fun starts. 
First, we have to determine the first intersection point. 

We have an array filled with figure-lines and a lightbeam.

#### Calculating the beam path
At this time this is done by first calculating the point where the beam collides with the border. First we determine the direction of the line in the y and x-axis. With these directions we can determine if the beam collides with the axis or the far edge.  We then calculate the intersection point with either the X-axis (or bottom edge). If the calculated y-coordinate falls within the bounds we know the beam's endpoint. If not, calculate the intersection with Y (or right edge).   



#### Getting the first intersection with the beam
Then we iterate over all linesegments and discard the segments that do not intersect with the beam (first beampoint to intersection beam-border). If no segments intersect the beam hits the border, and we're done!

We now know all intersecting linesegments. To figure out the first intersection I just take the first possibility and check if the beamsegment from beam point one to intersection possibility one intersects with one of the other possibilities. 
If that is the case, discard the first possibility and select the first segment that still intersects. Test the beam against the other still intersecting segments. If no possibilities are left after that we have a winner! 

#### Calculating the reflected beam
Imagine the following situation (CA is the calculated light beam)

If └ CAQ = 1/2 π the beam is perpendicular to the mirror and C = B.


Then we check if └ CAQ > 1/2 π . If so we "swap" P and Q in the calculations.


We know that  └ CAD = └ BAD and that b has the same length as c.

![alt text](https://github.com/Xinne/lichtbundel/blob/master/img/triangle.png?raw=true)

First we have to calculate if AC needs to be rotated clockwise or counterclockwise to get AB. For this we determine the rotation direction of △CAQ. If this direction is clockwise we need to rotate clockwise and vice versa.

The unity vector of CA is rotated over 2*(1/2 π - └ CAQ )  ( same as 2*(└ CAD )) and point B is calculated.

We now know the next beam and can start over with calculating the beam path. We ignore the mirror used in the previous run (it is impossible to collide with the same mirror two consecutive times and since the start of the next lightbeam is located on the last mirror this might give problems)



