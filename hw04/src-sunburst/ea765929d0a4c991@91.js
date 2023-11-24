function _1(md){return(
md`#HW04 Sunburst`
)}

function _artist(FileAttachment){return(
FileAttachment("artist.csv").csv()
)}

function _innerCircleQuestion(artist){return(
Object.keys(artist[0])[1]
)}

function _outerCircleQuestion(artist){return(
Object.keys(artist[0])[16]
)}

function _data(artist,innerCircleQuestion,outerCircleQuestion,buildHierarchy)
{
  // 提取內外圈問題的答案
  var innerCircleAnswer = artist.map(row => row[innerCircleQuestion]);
  var outerCircleAnswer = artist.map(row => row[outerCircleQuestion]);

  // 將內外圈答案結合，形成新的答案陣列
  var combinedAnswers = innerCircleAnswer.map((innerAns, index) => innerAns + '-' + outerCircleAnswer[index]);

  // 重新格式化答案，將其轉換為符合特定模式的陣列
  var reformattedAnswers = combinedAnswers.map(item => {
    const [prefix, values] = item.split('-');
    const splitValues = values.split(';').map(value => value.trim());
    return splitValues.map(value => `${prefix}-${value}`);
  }).reduce((acc, curr) => acc.concat(curr), []);

  // 計算每個重新格式化答案的出現次數
  var answerCounts = {};
  reformattedAnswers.forEach(reformattedAns => {
    answerCounts[reformattedAns] = (answerCounts[reformattedAns] || 0) + 1;
  });

  // 轉換為CSV格式的數據
  var csvData = Object.entries(answerCounts).map(([answer, count]) => [answer, String(count)]);
  
  // 建立包含層次結構的數據
  return buildHierarchy(csvData);
}


function _breadcrumb(d3,breadcrumbWidth,breadcrumbHeight,sunburst,breadcrumbPoints,color)
{
  const svg = d3
    .create("svg")
    .attr("viewBox", `0 0 ${breadcrumbWidth * 10} ${breadcrumbHeight}`)
    .style("font", "12px sans-serif")
    .style("margin", "5px");

  const g = svg
    .selectAll("g")
    .data(sunburst.sequence)
    .join("g")
    .attr("transform", (d, i) => `translate(${i * breadcrumbWidth}, 0)`);

    g.append("polygon")
      .attr("points", breadcrumbPoints)
      .attr("fill", d => color(d.data.name))
      .attr("stroke", "white");

    g.append("text")
      .attr("x", (breadcrumbWidth + 10) / 2)
      .attr("y", 15)
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .text(d => {
        if(d.data.name === "減少包裝材及文宣印製") {
          return "減少包裝";
        }
        else if(d.data.name === "使用無毒媒材、再生材料、廢物利用素材等") {
          return "使用再生材料";
        }
        else if(d.data.name === "工作場所、活動展場的節約能源") {
          return "節約能源";
        }
        else if(d.data.name.length > 6)
        {
          return "其他答案";
        }
        return d.data.name;
      });

  svg
    .append("text")
    .text(sunburst.percentage > 0 ? sunburst.percentage + "%" : "")
    .attr("x", (sunburst.sequence.length + 0.5) * breadcrumbWidth)
    .attr("y", breadcrumbHeight / 2)
    .attr("dy", "0.35em")
    .attr("text-anchor", "middle");

  return svg.node();
}


function _sunburst(partition,data,d3,radius,innerCircleQuestion,outerCircleQuestion,width,color,arc,mousearc)
{
  const root = partition(data);
  const svg = d3.create("svg");
  // Make this into a view, so that the currently hovered sequence is available to the breadcrumb
  const element = svg.node();
  element.value = { sequence: [], percentage: 0.0 };

  // 使用foreignObject插入HTML
  const fo = svg
    .append("foreignObject")
    .attr("x", `${radius+50}px`)
    .attr("y", -10)
    .attr("width", radius*2)
    .attr("height", 350);
  
  const div = fo
    .append("xhtml:div")
    .style("color","#555")
    .style("font-size", "25px")
    .style("font-family", "Arial");

  d3.selectAll("div.tooltip").remove(); // clear tooltips from before
  const tooltip = d3
    .select("body")
    .append("div")
    .attr("class", `tooltip`)
    .style("position", "absolute")
    .style("opacity", 0)

  const label = svg
    .append("text")
    .attr("text-anchor", "middle");
    //.style("visibility", "hidden");

  label//內圈問題
    .append("tspan")
    .attr("class", "question1")
    .attr("x", 0)
    .attr("y", 0)
    .attr("dx", `${radius*2+50}px`)
    .attr("dy", "-6em")
    .attr("font-size", "2.5em")
    .attr("fill", "#BBB")
    .text(innerCircleQuestion);

  label//外圈問題
    .append("tspan")
    .attr("class", "question2")
    .attr("x", 0)
    .attr("y", 0)
    .attr("dx", `${radius*2+50}px`)
    .attr("dy", "-4em")
    .attr("font-size", "2.5em")
    .attr("fill", "#BBB")
    .text(outerCircleQuestion);

  label//答案
    .append("tspan")
    .attr("class", "sequence")
    .attr("x", 0)
    .attr("y", 0)
    .attr("dx", `${radius*2+50}px`)
    .attr("dy", "-1em")
    .attr("font-size", "2.5em")
    .text("");

  label//占比%數
    .append("tspan")
    .attr("class", "percentage")
    .attr("x", 0)
    .attr("y", 0)
    .attr("dx", 0)
    .attr("dy", "0em")
    .attr("font-size", "5em")
    .attr("fill", "#555")
    .text("");

  label//數量
    .append("tspan")
    .attr("class", "dataValue")
    .attr("x", 0)
    .attr("y", 0)
    .attr("dx", 0)
    .attr("dy", "2em")
    .attr("font-size", "2em")
    .attr("fill", "#555")
    .text("");

  svg
    .attr("viewBox", `${-radius} ${-radius} ${width*2.2} ${width}`)
    .style("max-width", `${width*2}px`)
    .style("font", "12px sans-serif");

  const path = svg
    .append("g")
    .selectAll("path")
    .data(
      root.descendants().filter(d => {
        // Don't draw the root node, and for efficiency, filter out nodes that would be too small to see
        return d.depth && d.x1 - d.x0 > 0.001;
      })
    )
    .join("path")
    .attr("fill", d => color(d.data.name))
    .attr("d", arc);

  svg
    .append("g")
    .attr("fill", "none")
    .attr("pointer-events", "all")
    .on("mouseleave", () => {
      path.attr("fill-opacity", 1);
      //tooltip.text("");
      //label.style("visibility", null);
      // Update the value of this view
      element.value = { sequence: [], percentage: 0.0 };
      element.dispatchEvent(new CustomEvent("input"));
    })
    .selectAll("path")
    .data(
      root.descendants().filter(d => {
        // Don't draw the root node, and for efficiency, filter out nodes that would be too small to see
        return d.depth && d.x1 - d.x0 > 0.001;
      })
    )
    .join("path")
    .attr("d", mousearc)
    .on("mouseover", (_evt, d) => {
      if(d.data.name === "減少包裝材及文宣印製") {
        tooltip
        .style("opacity", 1)
        .html(`減少包裝<br><svg width="64px" height="64px" viewBox="0 0 512 512" baseProfile="tiny" overflow="visible" version="1.1" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g id="Layer_1"/>
<g>
<path d="M397.191,504.5H114.809c-25.778,0-46.121-21.871-44.217-47.536L97.54,93.849    c0.191-2.572,2.333-4.561,4.912-4.561h307.095c2.579,0,4.721,1.989,4.912,4.561l26.948,363.115    C443.312,482.629,422.969,504.5,397.191,504.5z" fill="#FFC4BF"/>
<path d="M441.408,456.964L414.459,93.849c-0.191-2.572-2.333-4.561-4.912-4.561h-19.414    c2.579,0,4.721,1.989,4.912,4.561l26.948,363.115c1.905,25.665-18.439,47.536-44.217,47.536h19.414    C422.969,504.5,443.312,482.629,441.408,456.964z" fill="#FFAAA1"/>
<g>
<ellipse cx="189.584" cy="161.851" fill="#FD7A6E" rx="15.407" ry="15.382"/>
<ellipse cx="322.415" cy="161.851" fill="#FD7A6E" rx="15.407" ry="15.382"/>
<path d="M322.415,146.469c-1.698,0-3.326,0.285-4.854,0.791c6.129,2.031,10.554,7.791,10.554,14.591     s-4.425,12.56-10.554,14.591c1.527,0.506,3.156,0.791,4.854,0.791c8.509,0,15.407-6.887,15.407-15.382     C337.823,153.356,330.925,146.469,322.415,146.469z" fill="#FB695B"/>
</g>
<path d="M189.585,146.469c-1.698,0-3.326,0.285-4.854,0.791c6.129,2.031,10.554,7.791,10.554,14.591    s-4.425,12.56-10.554,14.591c1.527,0.506,3.156,0.791,4.854,0.791c8.509,0,15.407-6.887,15.407-15.382    C204.992,153.356,198.094,146.469,189.585,146.469z" fill="#FB695B"/>
<path d="M70.592,456.964c-1.905,25.665,18.439,47.536,44.217,47.536h282.382c25.778,0,46.121-21.871,44.217-47.536    l-2.776-37.405H73.368L70.592,456.964z" fill="#FD7A6E"/>
<path d="M441.408,456.964l-2.776-37.405h-19.414l2.776,37.405c1.905,25.665-18.439,47.536-44.217,47.536h19.414    C422.969,504.5,443.312,482.629,441.408,456.964z" fill="#FB695B"/>
<g><g>
<path d="M257.687,249.342c-0.48,0-0.966-0.047-1.455-0.145c-4.001-0.799-6.597-4.691-5.798-8.693      c1.094-5.476,1.043-11.251-0.147-16.7c-1.236-5.655-3.726-11.098-7.2-15.74c-2.445-3.267-1.779-7.897,1.488-10.342      c3.267-2.445,7.897-1.779,10.342,1.488c4.732,6.322,8.122,13.736,9.807,21.441c1.621,7.424,1.691,15.29,0.201,22.749      C264.224,246.912,261.138,249.342,257.687,249.342z" fill="#A05423"/>
</g>
<ellipse cx="224.46" cy="302.19" fill="#FFA83F" rx="41.604" ry="60.239"/>
<path d="M224.459,241.952c-1.643,0-3.26,0.153-4.854,0.421c20.689,3.483,36.751,28.927,36.751,59.818     c0,30.89-16.062,56.335-36.751,59.818c1.593,0.268,3.21,0.421,4.854,0.421c22.977,0,41.604-26.97,41.604-60.239     C266.064,268.921,247.437,241.952,224.459,241.952z" fill="#FF9C20"/>
<ellipse cx="287.54" cy="302.19" fill="#FFA83F" rx="41.604" ry="60.239"/>
<ellipse cx="257.68" cy="302.19" fill="#FF9000" rx="36.199" ry="60.239"/>
<path d="M287.54,241.952c-1.643,0-3.26,0.153-4.854,0.421c20.689,3.483,36.751,28.927,36.751,59.818     c0,30.89-16.062,56.335-36.751,59.818c1.593,0.268,3.21,0.421,4.854,0.421c22.977,0,41.604-26.97,41.604-60.239     C329.145,268.921,310.518,241.952,287.54,241.952z" fill="#FF9C20"/>
<path d="M257.68,241.952c-1.647,0-3.265,0.2-4.854,0.555c17.695,3.949,31.345,29.156,31.345,59.684     s-13.65,55.736-31.345,59.684c1.589,0.354,3.206,0.555,4.854,0.555c19.992,0,36.199-26.97,36.199-60.239     C293.879,268.921,277.672,241.952,257.68,241.952z" fill="#F88000"/>
</g></g><g><g>
<path d="M399.316,512H112.673c-14.565,0-28.6-6.117-38.503-16.783c-9.883-10.644-14.935-25.05-13.861-39.526L87.665,87.097     c0.481-6.49,5.957-11.575,12.466-11.575h311.729c6.51,0,11.985,5.085,12.466,11.576l27.354,368.593     c1.074,14.476-3.978,28.882-13.86,39.526C427.915,505.883,413.881,512,399.316,512z M102.452,90.522L75.269,456.801     c-0.778,10.482,2.736,20.5,9.894,28.209c7.179,7.732,16.949,11.99,27.511,11.99h286.643c10.562,0,20.331-4.258,27.511-11.989     c7.158-7.709,10.672-17.728,9.894-28.209L409.538,90.522H102.452z"/>
</g><g>
<path d="M322.359,148.605c-4.143,0-7.5-3.358-7.5-7.5V74.287c0-32.691-26.641-59.287-59.386-59.287     c-32.751,0-59.396,26.596-59.396,59.287v66.777c0,4.142-3.358,7.5-7.5,7.5s-7.5-3.358-7.5-7.5V74.287     C181.077,33.325,214.451,0,255.473,0c41.017,0,74.386,33.325,74.386,74.287v66.818     C329.859,145.248,326.501,148.605,322.359,148.605z"/>
</g><g><g>
<path d="M188.577,179.794c-12.759,0-23.14-10.369-23.14-23.114s10.381-23.114,23.14-23.114s23.14,10.369,23.14,23.114      S201.336,179.794,188.577,179.794z M188.577,148.566c-4.488,0-8.14,3.64-8.14,8.114s3.652,8.114,8.14,8.114      s8.14-3.64,8.14-8.114S193.065,148.566,188.577,148.566z"/>
</g><g>
<path d="M323.413,179.794c-12.759,0-23.14-10.369-23.14-23.114s10.381-23.114,23.14-23.114s23.14,10.369,23.14,23.114      S336.171,179.794,323.413,179.794z M323.413,148.566c-4.488,0-8.14,3.64-8.14,8.114s3.651,8.114,8.14,8.114      s8.14-3.64,8.14-8.114S327.901,148.566,323.413,148.566z"/>
</g></g><g>
<path d="M399.316,512H112.673c-14.565,0-28.599-6.117-38.502-16.783c-9.883-10.644-14.936-25.05-13.861-39.526l0,0l2.818-37.969     c0.291-3.916,3.553-6.945,7.479-6.945h370.775c3.927,0,7.188,3.029,7.479,6.945l2.817,37.969     c1.074,14.476-3.978,28.882-13.86,39.526C427.915,505.883,413.881,512,399.316,512z M75.269,456.801     c-0.778,10.482,2.736,20.5,9.895,28.209c7.179,7.731,16.949,11.989,27.51,11.989h286.643c10.562,0,20.331-4.258,27.511-11.989     c7.158-7.709,10.672-17.728,9.894-28.209l-2.302-31.024H77.571L75.269,456.801z"/>
</g><g><g>
<path d="M223.975,367.79c-13.816,0-26.612-7.511-36.031-21.149c-8.834-12.792-13.699-29.661-13.699-47.501      s4.865-34.709,13.699-47.501c9.419-13.638,22.215-21.149,36.031-21.149c7.725,0,15.424,2.472,22.263,7.149      c3.419,2.338,4.295,7.005,1.958,10.424s-7.004,4.296-10.424,1.958c-4.396-3.006-9.039-4.531-13.796-4.531      c-18.826,0-34.73,24.569-34.73,53.65s15.904,53.65,34.73,53.65c4.757,0,9.399-1.524,13.797-4.531      c3.419-2.338,8.086-1.461,10.424,1.958c2.338,3.419,1.461,8.086-1.958,10.424C239.397,365.318,231.699,367.79,223.975,367.79z"/>
</g><g>
<path d="M288.014,367.79c-7.003,0-13.76-1.934-20.083-5.748c-3.548-2.139-4.688-6.749-2.549-10.296      c2.14-3.547,6.749-4.688,10.295-2.549c3.952,2.384,8.104,3.592,12.337,3.592c18.826,0,34.73-24.569,34.73-53.65      s-15.904-53.65-34.73-53.65c-4.234,0-8.385,1.208-12.336,3.592c-3.546,2.141-8.156,1-10.296-2.548      c-2.14-3.547-0.999-8.157,2.548-10.296c6.322-3.814,13.08-5.748,20.084-5.748c13.816,0,26.613,7.511,36.031,21.149      c8.834,12.792,13.699,29.661,13.699,47.501s-4.865,34.709-13.699,47.501C314.627,360.279,301.831,367.79,288.014,367.79z"/>
</g><g>
<path d="M257.7,367.786c-24.811,0-44.245-30.154-44.245-68.648s19.435-68.648,44.245-68.648s44.245,30.154,44.245,68.648      S282.51,367.786,257.7,367.786z M257.7,245.49c-15.853,0-29.245,24.568-29.245,53.648s13.393,53.648,29.245,53.648      s29.245-24.568,29.245-53.648S273.552,245.49,257.7,245.49z"/>
</g><g>
<path d="M257.707,245.491c-0.487,0-0.981-0.048-1.477-0.147c-4.062-0.811-6.697-4.762-5.885-8.824      c1.11-5.559,1.059-11.421-0.149-16.952c-1.255-5.74-3.782-11.266-7.309-15.978c-2.482-3.316-1.806-8.017,1.51-10.499      c3.316-2.481,8.016-1.806,10.499,1.51c4.803,6.417,8.245,13.943,9.955,21.764c1.646,7.536,1.717,15.521,0.204,23.092      C264.342,243.025,261.21,245.491,257.707,245.491z"/>
</g></g></g></g></svg>`)
        .style("border-color", color(d.data.name));
      }
      else if(d.data.name === "使用無毒媒材、再生材料、廢物利用素材等") {
        tooltip
        .style("opacity", 1)
        .html(`再生材料<br><svg width="64px" height="64px" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <circle id="recycle6-a" cx="18" cy="18" r="18"/>
  </defs>
  <g fill="none" fill-rule="evenodd">
    <g transform="rotate(-13 24.73 -32.746)">
      <path fill="#80D25B" d="M10.5044647,16 C13.2658885,16 15.5044647,13.6581048 15.5044647,10.7692308 C15.5044647,7.88035669 10.5044647,-1 10.5044647,-1 C10.5044647,-1 5.50446475,7.88035669 5.50446475,10.7692308 C5.50446475,13.6581048 7.743041,16 10.5044647,16 Z" transform="rotate(75 10.504 7.5)"/>
      <path stroke="#22BA8E" stroke-linecap="round" stroke-width="2" d="M7,8.47040899 C4.60798666,8.47040899 2.37943836,9.170286 0.507960627,10.3764345"/>
    </g>
    <g transform="rotate(52 25.91 53.124)">
      <path fill="#80D25B" d="M10.5044647,16 C13.2658885,16 15.5044647,13.6581048 15.5044647,10.7692308 C15.5044647,7.88035669 10.5044647,-1 10.5044647,-1 C10.5044647,-1 5.50446475,7.88035669 5.50446475,10.7692308 C5.50446475,13.6581048 7.743041,16 10.5044647,16 Z" transform="rotate(75 10.504 7.5)"/>
      <path stroke="#22BA8E" stroke-linecap="round" stroke-width="2" d="M7,8.47040899 C4.60798666,8.47040899 2.37943836,9.170286 0.507960627,10.3764345"/>
    </g>
    <g transform="rotate(119 24.262 38.047)">
      <path fill="#80D25B" d="M10.5044647,16 C13.2658885,16 15.5044647,13.6581048 15.5044647,10.7692308 C15.5044647,7.88035669 10.5044647,-1 10.5044647,-1 C10.5044647,-1 5.50446475,7.88035669 5.50446475,10.7692308 C5.50446475,13.6581048 7.743041,16 10.5044647,16 Z" transform="rotate(75 10.504 7.5)"/>
      <path stroke="#22BA8E" stroke-linecap="round" stroke-width="2" d="M7,8.47040899 C4.60798666,8.47040899 2.37943836,9.170286 0.507960627,10.3764345"/>
    </g>
    <g transform="rotate(-101 21.396 23.91)">
      <path fill="#80D25B" d="M10.5044647,16 C13.2658885,16 15.5044647,13.6581048 15.5044647,10.7692308 C15.5044647,7.88035669 10.5044647,-1 10.5044647,-1 C10.5044647,-1 5.50446475,7.88035669 5.50446475,10.7692308 C5.50446475,13.6581048 7.743041,16 10.5044647,16 Z" transform="rotate(75 10.504 7.5)"/>
      <path stroke="#22BA8E" stroke-linecap="round" stroke-width="2" d="M7,8.47040899 C4.60798666,8.47040899 2.37943836,9.170286 0.507960627,10.3764345"/>
    </g>
    <g transform="rotate(-173 22.569 31.445)">
      <path fill="#80D25B" d="M10.5044647,16 C13.2658885,16 15.5044647,13.6581048 15.5044647,10.7692308 C15.5044647,7.88035669 10.5044647,-1 10.5044647,-1 C10.5044647,-1 5.50446475,7.88035669 5.50446475,10.7692308 C5.50446475,13.6581048 7.743041,16 10.5044647,16 Z" transform="rotate(75 10.504 7.5)"/>
      <path stroke="#22BA8E" stroke-linecap="round" stroke-width="2" d="M7,8.47040899 C4.60798666,8.47040899 2.37943836,9.170286 0.507960627,10.3764345"/>
    </g>
    <g transform="translate(15 13)">
      <mask id="recycle6-b" fill="#ffffff">
        <use xlink:href="#recycle6-a"/>
      </mask>
      <use fill="#80D25B" xlink:href="#recycle6-a"/>
      <path fill="#22BA8E" d="M27.3232659 12.9977108C27.3232659 12.9977108 23.0673031 11.2150898 21.7996205 12.1064003 20.5319378 12.9977108 21.2091535 17.2063492 21.2091535 17.2063492 21.2091535 17.2063492 19.3198511 19.9853433 20.2645023 21.4469607 21.2091535 22.908578 23.8331847 22.4061524 25.3074348 23.6954046 26.781685 24.9846567 26.1691715 27.2985224 26.1691715 27.2985224L25.8125908 30C25.8125908 30 29.7613383 28.1839302 30.8991373 25.5675502 32.0369364 22.9511701 31.6683739 18.8492726 31.6683739 18.8492726L33.9732078 16.7046181 36 9.95878678 28.8876198 7.59804701 28.104005 4 23.0179377 5.47961481 22.5583129 9.40393893 26.4647379 10.7313818 27.3232659 12.9977108zM-1 15C-1 15 .513000503 14.0809276.714941762 14.0663022 2.26421148 13.9540984 7.66288946 14.2678893 9.07444031 12.3181705 10.6699813 10.1143136 12 7.19602072 12 7.19602072L11.9465585 4.95065079 3.60391089 3-1 15z" mask="url(#recycle6-b)"/>
    </g>
  </g>
</svg>`)
        .style("border-color", color(d.data.name));
      }
      else if(d.data.name === "工作場所、活動展場的節約能源") {
        tooltip
        .style("opacity", 1)
        .html(`節約能源<br><svg width="64px" height="64px" viewBox="0 0 1024 1024" class="icon"  version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M433.5 468.5c0 151.8-86.1 213.9-192.4 213.9S48.8 620.3 48.8 468.5 241.1 71.9 241.1 71.9s192.4 244.8 192.4 396.6z" fill="#60C13D" /><path d="M241.1 692.4c-58.6 0-108.1-18.3-143.1-52.9-39.3-39-59.3-96.5-59.3-171 0-64.8 32.8-152.4 97.6-260.3 47.9-79.8 96.4-141.8 96.9-142.4 1.9-2.4 4.8-3.8 7.9-3.8s6 1.4 7.9 3.8c0.5 0.6 49 62.6 96.9 142.4 64.8 108 97.6 195.6 97.6 260.3 0 74.4-20 132-59.3 171-35 34.6-84.4 52.9-143.1 52.9z m0-604c-15.5 20.7-51.8 70.4-87.7 130.2-43.2 72-94.6 173.8-94.6 249.8 0 68.9 18 121.7 53.4 156.8 31.1 30.8 75.7 47.1 129 47.1s97.9-16.3 129-47.1c35.4-35.1 53.4-87.9 53.4-156.8 0-76.1-51.5-178-94.8-250-36-59.8-72.2-109.4-87.7-130z" fill="" /><path d="M996.6 316.3c0 144.9-262.4 445-262.4 445s-262.4-300.1-262.4-445S589.3 53.9 734.2 53.9s262.4 117.5 262.4 262.4z" fill="#FCD170" /><path d="M734.2 776.5l-7.5-8.6c-0.7-0.8-66.7-76.5-131.8-169-88.3-125.3-133-220.4-133-282.6 0-72.8 28.3-141.2 79.8-192.6s119.9-79.8 192.6-79.8 141.2 28.3 192.6 79.8c51.4 51.4 79.8 119.9 79.8 192.6 0 62.2-44.8 157.3-133 282.6-65.1 92.5-131.2 168.2-131.8 169l-7.7 8.6z m0-712.6c-67.4 0-130.8 26.3-178.5 73.9-47.7 47.7-73.9 111.1-73.9 178.5 0 57.2 44.7 150.9 129.4 271.1 51.7 73.5 104 136.2 123 158.6 42.7-50.3 252.4-303.7 252.4-429.7 0-67.4-26.3-130.8-73.9-178.5C865 90.1 801.6 63.9 734.2 63.9zM606.9 980.2H378.7c-81.4 0-147.5-66.2-147.5-147.5V215.9c0-5.5 4.5-10 10-10s10 4.5 10 10v616.8c0 70.3 57.2 127.5 127.5 127.5h228.2c70.3 0 127.5-57.2 127.5-127.5 0-5.5 4.5-10 10-10s10 4.5 10 10c0 81.3-66.2 147.5-147.5 147.5z" fill="" /><path d="M741.1 881.6h-13.9c-45 0-81.4-36.4-81.4-81.4V651.9h176.7v148.3c0 44.9-36.4 81.4-81.4 81.4z" fill="#75736F" /><path d="M741.1 891.6h-13.9c-50.4 0-91.4-41-91.4-91.4V641.9h196.7v158.3c0 50.4-41 91.4-91.4 91.4z m-85.3-229.7v138.3c0 39.4 32 71.4 71.4 71.4h13.9c39.4 0 71.4-32 71.4-71.4V661.9H655.8zM241.1 436.6c-2.7 0-5.5-1.1-7.4-3.3L134.6 323c-3.7-4.1-3.4-10.4 0.8-14.1 4.1-3.7 10.4-3.4 14.1 0.8L248.6 420c3.7 4.1 3.4 10.4-0.8 14.1-1.9 1.6-4.3 2.5-6.7 2.5zM241.1 624.7c-2.8 0-5.6-1.2-7.6-3.5L94.3 457.7c-3.6-4.2-3.1-10.5 1.1-14.1 4.2-3.6 10.5-3.1 14.1 1.1l139.2 163.5c3.6 4.2 3.1 10.5-1.1 14.1-1.9 1.7-4.2 2.4-6.5 2.4zM241.1 326.3c-2.6 0-5.1-1-7.1-2.9-3.9-3.9-3.9-10.2 0-14.1l67.1-67.1c3.9-3.9 10.2-3.9 14.1 0 3.9 3.9 3.9 10.2 0 14.1l-67.1 67.1c-1.9 1.9-4.4 2.9-7 2.9zM247.7 524c-2.7 0-5.5-1.1-7.4-3.3-3.7-4.1-3.3-10.4 0.8-14.1l97.9-87.8c4.1-3.7 10.4-3.3 14.1 0.8 3.7 4.1 3.3 10.4-0.8 14.1l-97.9 87.8c-2 1.7-4.4 2.5-6.7 2.5z" fill="" /></svg>`)
        .style("border-color", color(d.data.name));
      }
      else
      {
        tooltip
        .style("opacity", 1)
        .html(`${d.data.name}`)
        .style("border-color", color(d.data.name));
      }
    })
    .on("mousemove", (evt, d) => {
      tooltip
        .style("top", evt.pageY - 10 + "px")
        .style("left", evt.pageX + 10 + "px");
    })
    .on("mouseout", () => {
      tooltip.style("opacity", 0);
    })
    .on("mouseenter", (event, d) => {
      // Get the ancestors of the current segment, minus the root

      //introduce
      if(d.data.name === "工作室")
      {
        div
          .html("<ul><li>定義：藝術家創作藝術品的私人空間。它可以是一個房間、一棟建築或任何專為藝術製作而設的場所。</li><li>功能：用於藝術家進行創作，例如繪畫、雕塑或任何其他形式的藝術。</li><li>特色：它是一個私密的空間，藝術家可以在這裡自由地實驗、嘗試並發展他們的技巧和創意。</li></ul>");
      }
      else if(d.data.name === "替代空間")
      {
        div
          .html("<ul><li>定義：非傳統和非商業的展示空間。可以是臨時或長期的存在，但不同於傳統的美術館和畫廊。</li><li>功能：提供一個展示非主流、實驗性或邊緣藝術的場所。這些空間通常更加開放、靈活，能夠接受更多風格和形式的藝術品。</li><li>特色：是藝術家、策展人或社群自組、自發的，對於藝術家來說，這樣的空間提供了更多的自由和可能性。</li></ul>");
      }
      else if(d.data.name === "美術館")
      {
        div
          .html("<ul><li>定義：為了展示、保護和研究藝術品而設立的公共或私人機構。</li><li>功能：除了展示藝術品，美術館也負責藝術品的保護、修復、研究和教育等功能。</li><li>特色：通常有較為正式和嚴謹的運作模式。它們可能有長期或特定主題的展覽，且會對藝術品有一定的選擇和評價標準。</li></ul>");
      }
      else
      {
        div.html("");
      }
      
      //dataValue
      label
        .style("visibility", null)
        .select(".dataValue")
        .text("計數："+d.value);
      
      //question
      if(d.depth-1 === 0)
      {
        label
          .style("visibility", null)
          .select(".question1")
          .attr("fill", "#000");
        label
          .style("visibility", null)
          .select(".question2")
          .attr("fill", "#BBB");
      }
      else if(d.depth-1 === 1)
      {
        label
          .style("visibility", null)
          .select(".question1")
          .attr("fill", "#BBB");
        label
          .style("visibility", null)
          .select(".question2")
          .attr("fill", "#000");
      }
      
      const sequence = d
        .ancestors()
        .reverse()
        .slice(1);
      // Highlight the ancestors
      path.attr("fill-opacity", node =>
        sequence.indexOf(node) >= 0 ? 1.0 : 0.3
      );
      label
        .style("visibility", null)
        .select(".sequence")
        //.style("visibility", "visible")
        .attr("fill", sequence => color(d.data.name))
        .text(d.data.name);
      const percentage = ((100 * d.value) / root.value).toPrecision(3);
      label
        .style("visibility", null)
        .select(".percentage")
        .text(percentage + "%");

      /*tooltip
        .text(d.data.name);*/
      
      // Update the value of this view with the currently hovered sequence and percentage
      element.value = { sequence, percentage };
      element.dispatchEvent(new CustomEvent("input"));
    });     

  return element;
}


function _8(md){return(
md`<h2>結論</h2>
<h3>從上圖中，我們可以看出：
  <ul>
    <li>工作室的工作者大多傾向環保，減少碳排放與節約能源</li>
    <li>各個機構，減少包裝、節約能源、使用再生材料三者占比都在前五名</li>
    <li>美術館的藝術工作者減少碳排量的選擇是節約能源，而不是像工作室選擇減少包裝</li>
  </ul>
</h3>`
)}

function _buildHierarchy(){return(
function buildHierarchy(csv) {
  // Helper function that transforms the given CSV into a hierarchical format.
  const root = { name: "root", children: [] };
  for (let i = 0; i < csv.length; i++) {
    const sequence = csv[i][0];
    const size = +csv[i][1];
    if (isNaN(size)) {
      // e.g. if this is a header row
      continue;
    }
    const parts = sequence.split("-");
    let currentNode = root;
    for (let j = 0; j < parts.length; j++) {
      const children = currentNode["children"];
      const nodeName = parts[j];
      let childNode = null;
      if (j + 1 < parts.length) {
        // Not yet at the end of the sequence; move down the tree.
        let foundChild = false;
        for (let k = 0; k < children.length; k++) {
          if (children[k]["name"] == nodeName) {
            childNode = children[k];
            foundChild = true;
            break;
          }
        }
        // If we don't already have a child node for this branch, create it.
        if (!foundChild) {
          childNode = { name: nodeName, children: [] };
          children.push(childNode);
        }
        currentNode = childNode;
      } else {
        // Reached the end of the sequence; create a leaf node.
        childNode = { name: nodeName, value: size };
        children.push(childNode);
      }
    }
  }
  return root;
}
)}

function _width(){return(
640
)}

function _radius(width){return(
width/2
)}

function _partition(d3,radius){return(
data =>
  d3.partition().size([2 * Math.PI, radius * radius])(
    d3
      .hierarchy(data)
      .sum(d => d.value)
      .sort((a, b) => b.value - a.value)
  )
)}

function _mousearc(d3,radius){return(
d3
  .arc()
  .startAngle(d => d.x0)
  .endAngle(d => d.x1)
  .innerRadius(d => Math.sqrt(d.y0))
  .outerRadius(radius)
)}

function _color(d3){return(
d3
  .scaleOrdinal()
  .domain(["工作室", "替代空間", "美術館", "減少包裝材及文宣印製", "使用無毒媒材、再生材料、廢物利用素材等", "工作場所、活動展場的節約能源"])
  //.range(d3.schemePaired)
  .range(["#66327C","#77428D","#B28FCE","#CA7A2C","#FFB11B","#F7C242"])
  .unknown("#BEBEBE")
)}

function _arc(d3,radius){return(
d3
  .arc()
  .startAngle(d => d.x0)
  .endAngle(d => d.x1)
  .padAngle(1 / radius)
  .padRadius(radius)
  .innerRadius(d => Math.sqrt(d.y0))
  .outerRadius(d => Math.sqrt(d.y1) - 1)
)}

function _breadcrumbWidth(){return(
75
)}

function _breadcrumbHeight(){return(
30
)}

function _breadcrumbPoints(breadcrumbWidth,breadcrumbHeight){return(
function breadcrumbPoints(d, i) {
  const tipWidth = 10;
  const points = [];
  points.push("0,0");
  points.push(`${breadcrumbWidth},0`);
  points.push(`${breadcrumbWidth + tipWidth},${breadcrumbHeight / 2}`);
  points.push(`${breadcrumbWidth},${breadcrumbHeight}`);
  points.push(`0,${breadcrumbHeight}`);
  if (i > 0) {
    // Leftmost breadcrumb; don't include 6th vertex.
    points.push(`${tipWidth},${breadcrumbHeight / 2}`);
  }
  return points.join(" ");
}
)}

function _19(md){return(
md`<style>
.tooltip {
  padding: 8px 12px;
  color: white;
  border-radius: 6px;
  border: 2px solid rgba(255,255,255,0.5);
  box-shadow: 0 1px 4px 0 rgba(0,0,0,0.2);
  pointer-events: none;
  transform: translate(-50%, -100%);
  font-family: "Helvetica", sans-serif;
  background: rgba(20,10,30,0.6);
  transition: 0.2s opacity ease-out, 0.1s border-color ease-out;
}
</style>`
)}

export default function define(runtime, observer) {
  const main = runtime.module();
  function toString() { return this.url; }
  const fileAttachments = new Map([
    ["artist.csv", {url: new URL("./artist.csv", import.meta.url), mimeType: "text/csv", toString}]
  ]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer()).define(["md"], _1);
  main.variable(observer("artist")).define("artist", ["FileAttachment"], _artist);
  main.variable(observer("innerCircleQuestion")).define("innerCircleQuestion", ["artist"], _innerCircleQuestion);
  main.variable(observer("outerCircleQuestion")).define("outerCircleQuestion", ["artist"], _outerCircleQuestion);
  main.variable(observer("data")).define("data", ["artist","innerCircleQuestion","outerCircleQuestion","buildHierarchy"], _data);
  main.variable(observer("breadcrumb")).define("breadcrumb", ["d3","breadcrumbWidth","breadcrumbHeight","sunburst","breadcrumbPoints","color"], _breadcrumb);
  main.variable(observer("viewof sunburst")).define("viewof sunburst", ["partition","data","d3","radius","innerCircleQuestion","outerCircleQuestion","width","color","arc","mousearc"], _sunburst);
  main.variable(observer("sunburst")).define("sunburst", ["Generators", "viewof sunburst"], (G, _) => G.input(_));
  main.variable(observer()).define(["md"], _8);
  main.variable(observer("buildHierarchy")).define("buildHierarchy", _buildHierarchy);
  main.variable(observer("width")).define("width", _width);
  main.variable(observer("radius")).define("radius", ["width"], _radius);
  main.variable(observer("partition")).define("partition", ["d3","radius"], _partition);
  main.variable(observer("mousearc")).define("mousearc", ["d3","radius"], _mousearc);
  main.variable(observer("color")).define("color", ["d3"], _color);
  main.variable(observer("arc")).define("arc", ["d3","radius"], _arc);
  main.variable(observer("breadcrumbWidth")).define("breadcrumbWidth", _breadcrumbWidth);
  main.variable(observer("breadcrumbHeight")).define("breadcrumbHeight", _breadcrumbHeight);
  main.variable(observer("breadcrumbPoints")).define("breadcrumbPoints", ["breadcrumbWidth","breadcrumbHeight"], _breadcrumbPoints);
  main.variable(observer()).define(["md"], _19);
  return main;
}
