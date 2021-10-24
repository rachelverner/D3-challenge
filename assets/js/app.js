var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// set initial parameters
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// function for creating and updating xScale
function xScale(data, chosenXAxis) {
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenXAxis]) * 0.9,
      d3.max(data, d => d[chosenXAxis]) * 1.1])
    .range([0, width]);

  return xLinearScale;
}

// function for creating and updating yScale
function yScale(data, chosenYAxis) {
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenYAxis]) * 0.8,
      d3.max(data, d => d[chosenYAxis]) * 1.2])
    .range([height, 0]);
  return yLinearScale;
}

// function for updating xAxis
function renderXaxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// function for updating yAxis
function renderYaxes(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}

// function for updating circles group for X axis changes
function renderCircles(circlesGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newYScale(d[chosenYAxis]))

  return circlesGroup;
}

// function for updating circles group for Y axis changes
function yRenderCircles(circlesGroup, newYScale, chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cy", d => newYScale(d[chosenYAxis]))

  return circlesGroup;
}

// function for updating state text
function renderText (textGroup, newXScale, newYScale, chosenXAxis) {
  textGroup.transition()

    .duration(1000)
    .attr("x", d => newXScale(d[chosenXAxis]))
    .attr("y", d => newYScale(d[chosenYAxis]));

  return textGroup;
}

// function for updating circles group with new tooltip
function updateToolTip(circlesGroup, chosenXAxis, chosenYAxis) {



  // change tooltip based on X axis
  if (chosenXAxis === "poverty") {
    xTip = "Poverty: ";
  
    }
  else if (chosenXAxis === "age") {
    xTip = "Age: ";
  }
  else {
    xTip = "Income: $"
  }

  // change tooltip based on Y axis
  if (chosenYAxis === "healthcare") {
    yTip = "Lacks Healthcare: ";
    }
  else if (chosenYAxis === "obesity") {
    yTip = "Obesity: ";
  }
  else {
    yTip = "Smokers: "
  }

  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([40, -70])
    .html(function(d) {
      return (`${d.state}<br>${xTip}${d[chosenXAxis]}<br>${yTip}${d[chosenYAxis]}%`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(d) {
    toolTip.show(d, this);
  })
    .on("mouseout", function(d) {
      toolTip.hide(d);
    });

  return circlesGroup;
}

// create inital chart
d3.csv("assets/data/data.csv").then(function(data) {
  
  // parse data
  data.forEach(function(data) {
    data.poverty = +data.poverty;
    data.healthcare = +data.healthcare;
    data.smokes = +data.smokes;
    data.obesity = +data.obesity;
    data.age = +data.age;
    data.income = +data.income;
  });

  // call scale functions for initial scales
  var xLinearScale = xScale(data, chosenXAxis);
  var yLinearScale = yScale(data, chosenYAxis);
  
  // initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append initial x axis
  var xAxis = chartGroup.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append initial y axis
  var yAxis = chartGroup.append("g")
    .call(leftAxis);

  // append initial circles
  circlesGroup = chartGroup.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d.poverty))
    .attr("cy", d => yLinearScale(d.healthcare))
    .attr("r", "10")
    .attr("fill", "pink")
    .attr("class", "stateCircle")

  // add state abbreviation text
  text = chartGroup.append("g");
  
  textGroup = text.selectAll("text")
    .data(data)
    .enter()
    .append("text")
    .text(d => d.abbr)
    .style("font-size", "10px")
    .attr("x", d => xLinearScale(d.poverty))
    .attr("y", d => yLinearScale(d.healthcare))
    .attr("transform", `translate(0, 3)`)
    .attr("class", "stateText")

  // create group for 3 x-axis labels
  var xLabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var povertyLabel = xLabelsGroup.append("text")
    .attr("y", margin.bottom * (1/4))
    .attr("value", "poverty")
    .classed("active", true)
    .text("In Poverty (%)");

  var ageLabel = xLabelsGroup.append("text")
    .attr("y", margin.bottom * (2/4))
    .attr("value", "age")
    .classed("inactive", true)
    .text("Age (Median)");
  
  var incomeLabel = xLabelsGroup.append("text")
    .attr("y", margin.bottom * (3/4))
    .attr("value", "income")
    .classed("inactive", true)
    .text("Household Income (Median)");

  // create group for 3 y-axis labels
  var yLabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${-margin.left}, ${height/2})`);

  var healthcareLabel = yLabelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", margin.left * 1/2)
    .attr("dy", "1em")
    .attr("value", "healthcare")
    .classed("active", true)
    .text("Lacks Healthcare (%)");

  var obesityLabel = yLabelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", margin.left * 1/4)
    .attr("dy", "1em")
    .attr("value", "obesity")
    .classed("inactive", true)
    .text("Obesity (%)");

  var smokesLabel = yLabelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("dy", "1em")
    .attr("value", "smokes")
    .classed("inactive", true)
    .text("Smokes (%)");
  
  // call function to create initial tooltip
  var circlesGroup = updateToolTip(circlesGroup, chosenXAxis, chosenYAxis);

  // x axis label listener
  xLabelsGroup.selectAll("text")
      .on("click", function() {
        // get value of selection
        var value = d3.select(this).attr("value");

        if (value !== chosenXAxis) {

          chosenXAxis = value;
          xLinearScale = xScale(data, chosenXAxis);
          xAxis = renderXaxes(xLinearScale, xAxis);
          circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
          circlesGroup = updateToolTip(circlesGroup, chosenXAxis, chosenYAxis);
          textGroup = renderText(textGroup, xLinearScale, yLinearScale, chosenXAxis);
          }

        
          if (chosenXAxis === "poverty") {
            povertyLabel
              .classed("active", true)
              .classed("inactive", false);
            ageLabel
              .classed("active", false)
              .classed("inactive", true);
            incomeLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else if (chosenXAxis === "age") {
            povertyLabel
              .classed("active", false)
              .classed("inactive", true);
            ageLabel
              .classed("active", true)
              .classed("inactive", false);
            incomeLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else {
            povertyLabel
              .classed("active", false)
              .classed("inactive", true);
            ageLabel
              .classed("active", false)
              .classed("inactive", true);
            incomeLabel
              .classed("active", true)
              .classed("inactive", false);
          }
        });

  // y axis label listener
  yLabelsGroup.selectAll("text")
      .on("click", function()  {
        // get value of selection
        var value = d3.select(this).attr("value");

        if (value !== chosenYAxis) {

          chosenYAxis = value;
          yLinearScale = yScale(data, chosenYAxis);
          yAxis = renderYaxes(yLinearScale, yAxis);
          circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
          circlesGroup = updateToolTip(circlesGroup, chosenXAxis, chosenYAxis);
          textGroup = renderText(textGroup, xLinearScale, yLinearScale, chosenXAxis);

          }

          if (chosenYAxis === "healthcare") {
            healthcareLabel
              .classed("active", true)
              .classed("inactive", false);
            obesityLabel
              .classed("active", false)
              .classed("inactive", true);
            smokesLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else if (chosenYAxis === "obesity") {
            healthcareLabel
              .classed("active", false)
              .classed("inactive", true);
            obesityLabel
              .classed("active", true)
              .classed("inactive", false);
            smokesLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else {
            healthcareLabel
              .classed("active", false)
              .classed("inactive", true);
            obesityLabel
              .classed("active", false)
              .classed("inactive", true);
            smokesLabel
              .classed("active", true)
              .classed("inactive", false);
          }

      });
  }).catch(function(error) {
    console.log(error);
});
