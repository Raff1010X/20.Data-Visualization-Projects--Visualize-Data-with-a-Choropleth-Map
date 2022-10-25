const URL = [
  'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/for_user_education.json', 
  'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/counties.json'
];

async function fetchURLs() {
    try {
      await Promise.all(URL.map((url) => fetch(url).then((response) => response.json())))
      .then((result) => {
        drawData(result);
      });
    } catch (error) {
      document.getElementById("chart").textContent = "Error loading data - " + error;
    }
 }

fetchURLs();

function drawData(data) {
  const [education, us] = data;
  
  const chartDiv = document.getElementById("chart");
  chartDiv.textContent = "";
  const padding = 50;
  const chartWidth = chartDiv.offsetWidth - padding;
  const chartHeight = chartDiv.offsetHeight - padding;

  const div = d3.select("#chart");
  div
    .append("h1")
    .attr("id", "title")
    .text("United States Educational Attainment")
    .append("h5")
    .attr("id", "description")
    .text("Percentage of adults age 25 and older with a bachelor's degree or higher (2010-2014)");

  div.append("div").attr("id", "tooltip");
  
  const toolTip = d3.select("#tooltip");
  toolTip.style("opacity", 0);
  
  let color = d3.scaleSequential()
    .domain([3, 66])
    .interpolator(d3.interpolateHsl("white", "blue"));
  
  function eduFilterId(d) {
    return education.find(obj => obj.fips === d.id);
  }
  
  const svg = d3.select("#chart").append("svg");
  svg
    //.attr("preserveAspectRatio", "xMinYMin")
    .attr("viewBox", "0 -120 1000 800")
    .classed("svg-content", true)
    .append('g')
    .attr('class', 'counties')
    .attr('id', 'svg')
    .selectAll('path')
    .data(topojson.feature(us, us.objects.counties).features)
    .enter()
    .append('path')
    .attr('class', 'county')
    .attr('data-fips', d => {return d.id})
    .attr('data-education', d =>  {return eduFilterId(d).bachelorsOrHigher})
    .attr('fill', d => {return color(eduFilterId(d).bachelorsOrHigher)})
    .attr('d', d3.geoPath())
    .on('mouseover', function (event, d) {
      toolTip.style('opacity', 0.9);
      toolTip
        .html(() => {
          let result = eduFilterId(d);
          return (result.area_name + ', <br>' + result.state + ': ' +  result.bachelorsOrHigher + '%');
        })
        .attr('data-education', eduFilterId(d).bachelorsOrHigher)
        .style('left', event.pageX - 100 + 'px')
        .style('top', event.pageY - 60 + 'px');
    })
    .on('mouseout', () => toolTip.style('opacity', 0));
  
  
  //legend
  const minLegend = 0;
  const maxLegend = 60;
  const domainLegend = [];
  for (let i = minLegend; i <= maxLegend; i=i+5)  domainLegend.push(i);
  const xScaleLegend = d3
    .scaleBand()
    .domain(domainLegend)
    .range([0, 260]);

  const xAxisLegend = d3
    .axisBottom()
    .scale(xScaleLegend)
    .tickValues(xScaleLegend.domain());

  svg
    .append('g')
    .attr('id', 'legend')
    .attr('transform', 'translate(610, 75)')
    .call(xAxisLegend)
    .append('g')
    .selectAll('rect')
    .data(domainLegend)
    .enter()
    .append('rect')
    .style('fill', (d) => {return color(d)})
    .attr('x', (d) => ((d)*4))
    .attr('y', -21)
    .attr('transform', 'translate(-10 ,0)')
    .attr('width', '20px')
    .attr('height', '20px');
  
}