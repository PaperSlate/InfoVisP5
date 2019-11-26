// global variables
var width = 375;    // left bubble chart
var widthTwo = 300; // right bubble chart
var height = 400;

var selectedOne;    // first selected state
var selectedTwo;    // second selected state

var idToCandy = {};

function changeBubbleState(candyBubbles, candyBubblesTwo, allCandies, candySums, candyStats) {

  var svg = d3.select("#bubbleChart").select("#primarySVG");      // first state
  var svgTwo = d3.select("#bubbleChart").select("#secondarySVG"); // second state clicked (if clicked)

  var padding = 4;

  for (var candy in candyBubbles) {
    candyBubbles[candy].radius = 10;
    candyBubbles[candy].x = Math.random() * width;
    candyBubbles[candy].y = Math.random() * height;
    candyBubbles[candy].joy = candySums[candyBubbles[candy].name]["Joy"];
    candyBubbles[candy].meh = candySums[candyBubbles[candy].name]["Meh"];
    candyBubbles[candy].despair = candySums[candyBubbles[candy].name]["Despair"];

    candyBubblesTwo[candy].radius = 10;
    candyBubblesTwo[candy].x = Math.random() * widthTwo;
    candyBubblesTwo[candy].y = Math.random() * height;
    candyBubblesTwo[candy].joy = candySums[candyBubblesTwo[candy].name]["Joy"];
    candyBubblesTwo[candy].meh = candySums[candyBubblesTwo[candy].name]["Meh"];
    candyBubblesTwo[candy].despair = candySums[candyBubblesTwo[candy].name]["Despair"];
  }

  var maxRadius = d3.max(candyBubbles.map(function(circle) { return circle.radius; }));

  var getCentersOne = function(size) {
    var centers, map;

    centers = _.uniq(_.pluck(candyBubbles, "candyState")).map(function(d) { return { name: d, value: 1 }; });

    map = d3.layout.pack().size(size);
    map.nodes({ children: centers });

    return centers;
  };

  var getCentersTwo = function(size) {
    var centers, map;

    centers = _.uniq(_.pluck(candyBubblesTwo, "candyState")).map(function(d) { return { name: d, value: 1 }; });

    map = d3.layout.pack().size(size);
    map.nodes({ children: centers });

    return centers;
  }

  var nodes = svg.selectAll("circle").data(candyBubbles);
  var nodesTwo = svgTwo.selectAll("circle").data(candyBubblesTwo);

  nodes.enter().append("circle")
       .attr("cx", function(d) { return d.x; })
       .attr("cy", function(d) { return d.y; })
       .attr("r", 10)
       .attr("id", function(d) {
         var name = d.name;

         name = name.replace(new RegExp(" ", "g"), "");
         name = name.replace(new RegExp("\'", "g"), "");
         name = name.replace(/\(|\)/g, "");
         name = name.replace(new RegExp("&", "g"), "");
         name = name.replace(".", "");

         idToCandy[name] = d.name;

         return name;
       })
       .on("mouseover", function(d) { showPopover.call(this, d); })
       .on("mouseout", function(d) { removePopovers(); });

   nodesTwo.enter().append("circle")
           .attr("cx", function(d) { return d.x; })
           .attr("cy", function(d) { return d.y; })
           .attr("r", 10)
           .attr("id", function(d) {

             var name = d.name;
             name = name.replace(new RegExp(" ", "g"), "");
             name = name.replace(new RegExp("\'", "g"), "");
             name = name.replace(/\(|\)/g, "");
             name = name.replace(new RegExp("&", "g"), "");
             name = name.replace(".", "");

             idToCandy[name] = d.name;

             return name;
           })
           .on("mouseover", function(d) { showPopoverTwo.call(this, d); }) // adjust to fit tooltip of state map
           .on("mouseout", function(d) { removePopovers(); });

  var text = nodes.append("text")
                  .attr("dx", 12)
                  .attr("dy", ".35em")
                  .style("text-anchor", "middle")
                  .text(function(d) { return d.name; });

  var textTwo = nodesTwo.append("text")
                        .attr("dx", 12)
                        .attr("dy", ".35em")
                        .style("text-anchor", "middle")
                        .text(function(d) { return d.name; });

  nodes.transition()
       .duration(100)
       .attr("r", function(d) { return d.radius; });

  nodesTwo.transition()
          .duration(100)
          .attr("r", function(d) { return d.radius; });

  var force = d3.layout.force();
  var forceTwo = d3.layout.force();

  drawOne("candyState");
  drawTwo("candyState");
  makeClickable();

  d3.select("#statesvg").selectAll(".state").on("click", function(d) {

    var numStateSelect = document.getElementById('numStates');                // access number of states dropdown
    var numVal = numStateSelect.options[numStateSelect.selectedIndex].value;  // get selected number of states

    if (numVal == 1) {
      document.getElementById("stateOne").textContent = d.id;

      var stateCandies = candyStats[d.id];

      for (var c in candyBubbles) {
        var candy = candyBubbles[c].name;

        if (stateCandies[candy][0] < (-1 / 3)) {
          candyBubbles[c].candyState = "Despair";
        } else if (stateCandies[candy][0] > (1 / 3)) {
          candyBubbles[c].candyState = "Joy";
        } else {
          candyBubbles[c].candyState = "Meh";
        }
      }

      selectedOne = d.id;
      d3.select("#statesvg").selectAll(".state").style("fill", "#e6ccab"); // reset color of all states
      d3.select("#statesvg").select("#" + d.id).style("fill", "#3498db");

      drawOne("candyState");

      if (document.getElementById("stateTwo").textContent != "") { // changed from two to one state
        for (var i in candyBubblesTwo) {
          candyBubblesTwo[i].candyState = "All";
        }

        drawTwo("candyState");

        document.getElementById("stateTwo").textContent = "";
        selectedTwo = null;
      }

    } else if (numVal == 2 && selectedOne == null) {
      document.getElementById("stateOne").textContent = d.id;

      var stateCandies = candyStats[d.id];

      for (var c in candyBubbles) {
        var candy = candyBubbles[c].name;

        if (stateCandies[candy][0] < (-1 / 3)) {
          candyBubbles[c].candyState = "Despair";
        } else if (stateCandies[candy][0] > (1 / 3)) {
          candyBubbles[c].candyState = "Joy";
        } else {
          candyBubbles[c].candyState = "Meh";
        }
      }

      drawOne("candyState");

      d3.select("#statesvg").selectAll(".state").style("fill", "#e6ccab"); // reset color of all states
      d3.select("#statesvg").select("#" + d.id).style("fill", "#3498db");
      selectedOne = d.id;

    } else if (numVal == 2 && selectedOne != null && selectedTwo == null) { // first state selected
      document.getElementById("stateTwo").textContent = d.id;

      var stateCandies = candyStats[d.id];

      for (var c in candyBubblesTwo) {
        var candy = candyBubblesTwo[c].name;

        if (stateCandies[candy][0] < (-1 / 3)) {
          candyBubblesTwo[c].candyState = "Despair";
        } else if (stateCandies[candy][0] > (1 / 3)) {
          candyBubblesTwo[c].candyState = "Joy";
        } else {
          candyBubblesTwo[c].candyState = "Meh";
        }
      }

      drawTwo("candyState");

      d3.select("#statesvg").selectAll(".state").style("fill", "#e6ccab"); // reset color of all states
      d3.select("#statesvg").select("#" + d.id).style("fill", "#3498db");
      d3.select("#statesvg").select("#" + selectedOne).style("fill", "#3498db");
      selectedTwo = d.id;

    } else {
      drawOne("candyState");
      drawTwo("candyState");
    }

    states.draw("#statesvg", sampleData, tooltipHtml);
  });

  d3.select("button").on("click", function(d) {

    d3.select("#statesvg").selectAll(".state").style("fill", "#e6ccab");  // reset color of all states
    document.getElementById("stateOne").textContent = "";                 // reset state text
    document.getElementById("stateTwo").textContent = "";
    document.getElementById("selectedCandy").textContent = "";
    selectedOne = null;
    selectedTwo = null;

    for (var i in candyBubbles) {
      candyBubbles[i].candyState = "All";
      candyBubblesTwo[i].candyState = "All";
    }

    drawOne("candyState");
    drawTwo("candyState");
  });

  // draw circles on screen
  function drawOne(candyState) {
    d3.selectAll("circle").attr("r", 10);

    var centers = getCentersOne([width, height]);

    labels(centers, 0);
    nodes.attr("class", function(d) { return d.candyState; });
    force.on("tick", tickOne(centers, candyState));
    force.start();
  }

  function drawTwo(candyState) {
    d3.selectAll("circle").attr("r", 10);

    var centers = getCentersTwo([widthTwo, height]);

    labels(centers, 1);
    nodesTwo.attr("class", function(d) { return d.candyState; });
    forceTwo.on("tick", tickTwo(centers, candyState));
    forceTwo.start();
  }

  function tickOne(centers, candyState) {
    var foci = {};

    for (var i = 0; i < centers.length; i++) {
      foci[centers[i].name] = centers[i];
    }

    return function (e) {
      for (var i = 0; i < candyBubbles.length; i++) {
        var o = candyBubbles[i];
        var f = foci[o.candyState];
        o.y += (f.y - o.y) * e.alpha;
        o.x += (f.x - o.x) * e.alpha;
       }

       nodes.each(collide(0.2, 0))
         .attr("cx", function (d) { return d.x; })
         .attr("cy", function (d) { return d.y; });
      }
  }

  function tickTwo(centers, candyState) {
    var foci = {};

    for (var i = 0; i < centers.length; i++) {
      foci[centers[i].name] = centers[i];
    }

    return function (e) {
      for (var i = 0; i < candyBubblesTwo.length; i++) {
        var o = candyBubblesTwo[i];
        var f = foci[o.candyState];
        o.y += (f.y - o.y) * e.alpha;
        o.x += (f.x - o.x) * e.alpha;
       }

       nodesTwo.each(collide(0.2, 1))
         .attr("cx", function (d) { return d.x; })
         .attr("cy", function (d) { return d.y; });
      }
  }


  function labels(centers, centersNum) {
    if (centersNum == 0) {
      svg.selectAll(".label").remove();
      svg.selectAll(".label")
         .data(centers).enter().append("text")
         .attr("class", "label")
         .text(function(d) { return d.name; })
         .attr("transform", function (d) {
              return "translate(" + (d.x - ((d.name.length) * 3)) + ", " + (d.y + 5 - d.r) + ")";
            }
         );
    } else if (centersNum == 1) {
      svgTwo.selectAll(".label").remove();

      svgTwo.selectAll(".label")
        .data(centers).enter().append("text")
        .attr("class", "label")
        .text(function(d) { return d.name; })
        .attr("transform", function (d) {
             return "translate(" + (d.x - ((d.name.length) * 3)) + ", " + (d.y + 5 - d.r) + ")";
           }
        );
    }
  }

  function removePopovers() {
    $('.popover').each(function() {
      $(this).remove();
    });
  }

  function showPopoverTwo(d) {
    var clicked = document.getElementById("stateTwo").textContent;

    $(this).popover({
      placement: 'auto top',
      container: 'body',
      trigger: 'manual',
      html: true,
      content: function() {
        return "Candy: " + d.name + "</br>Joy: " + d.joy + "</br>Meh: " + d.meh + "</br>Despair: " + d.despair;
      }
    });

    $(this).popover('show');

    if (clicked != "") {
      var candy = idToCandy[this.id];
      var states = allCandies[candy];
      var feelings = states[selectedTwo];

      $(this).attr('data-content',function() {
        return "Candy: " + d.name + "</br>State: " + selectedTwo + "<br/>Joy: " + feelings.Joy + "</br>Meh: " + feelings.Meh + "</br>Despair: " + feelings.Despair;
      });
      $(this).popover('show');
    }
  }

  function showPopover(d) {
    var clicked = document.getElementById("stateOne").textContent;

    $(this).popover({
      placement: 'auto top',
      container: 'body',
      trigger: 'manual',
      html: true,
      content: function() {
        return "Candy: " + d.name + "</br>Joy: " + d.joy + "</br>Meh: " + d.meh + "</br>Despair: " + d.despair;
      }
    });

    $(this).popover('show');

    if (clicked != "") {
      var candy = idToCandy[this.id];
      var states = allCandies[candy];
      var feelings = states[selectedOne];

      $(this).attr('data-content',function() {
        return "Candy: " + d.name + "</br>State: " + selectedOne + "<br/>Joy: " + feelings.Joy + "</br>Meh: " + feelings.Meh + "</br>Despair: " + feelings.Despair;
      });
      $(this).popover('show');
    }
  }

  function collide(alpha, forceNum) {
    var quadtree;

    if (forceNum == 0) {
      quadtree = d3.geom.quadtree(candyBubbles);
    } else if (forceNum == 1) {
      quadtree = d3.geom.quadtree(candyBubblesTwo);
    }

    return function(d) {
       var r = d.radius + maxRadius + padding;
       var nx1 = d.x - r;
       var nx2 = d.x + r;
       var ny1 = d.y - r;
       var ny2 = d.y + r;

      quadtree.visit(function(quad, x1, y1, x2, y2) {

        if (quad.point && (quad.point !== d)) {
          var x = d.x - quad.point.x;
          var y = d.y - quad.point.y;
          var l = Math.sqrt(x * x + y * y);
          var r = d.radius + quad.point.radius + padding;

          if (l < r) {
            l = (l - r) / l * alpha;
            d.x -= x *= l;
            d.y -= y *= l;
            quad.point.x += x;
            quad.point.y += y;
          }
        }

        return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
      });
    };
  }

  function makeClickable () {

    d3.select("#primarySVG").selectAll("circle").on("click", function() {

      $(this).attr('data-content',function() {
        return "Candy: " + idToCandy[this.id] + "<br/>Joy: " + candySums[idToCandy[this.id]].Joy + "</br>Meh: " + candySums[idToCandy[this.id]].Meh + "</br>Despair: " + candySums[idToCandy[this.id]].Despair;
      });

      $(this).popover('show');

      var color = d3.scale.linear().domain([-1, 0, 1]).range(['#d73027', '#fee08b', '#1a9850']);

      for (var state in sampleData) {
        var candy = idToCandy[this.id];
        var feeling = candyStats[state][candy][0];
        d3.select("#statesvg").select("#" + state).style("fill", color(feeling));
      }

      for (var i in candyBubbles) {
        if (candyBubbles[i].name == idToCandy[this.id]) { // candy selected
          candyBubbles[i].candyState = "Selected";
        } else {
          candyBubbles[i].candyState = "All";
        }

        candyBubblesTwo[i].candyState = "All";
      }

      drawOne("candyState");

      if (document.getElementById("stateOne").textContent != "") {
        drawTwo("candyState");
      }

      document.getElementById("selectedCandy").textContent = idToCandy[this.id];
      document.getElementById("stateOne").textContent = "";
      document.getElementById("stateTwo").textContent = "";
      selectedOne = null;
      selectedTwo = null;
    });

    var nest = d3.nest().key(function(d){return d.name;}).entries(candyBubbles);
    var nestTwo = d3.nest().key(function(d){return d.name;}).entries(candyBubblesTwo);

  }

  nodes.exit().remove();
  nodesTwo.exit().remove();

}
