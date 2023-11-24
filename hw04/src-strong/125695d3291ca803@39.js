function _1(md){return(
md`# HW04 Strong baseline`
)}

function _artist(FileAttachment){return(
FileAttachment("artist.csv").csv()
)}

function _artist_columnKey1(artist){return(
Object.keys(artist[0])[3]
)}

function _artist_columnKey2(artist){return(
Object.keys(artist[0])[7]
)}

function _artist_Column1(artist,artist_columnKey1){return(
artist.map(row => row[artist_columnKey1])
)}

function _artist_Column2(artist,artist_columnKey2){return(
artist.map(row => row[artist_columnKey2])
)}

function _scatterplotData(artist_Column1,artist_Column2){return(
artist_Column1.map((value, index) => {
    return { x: value, y: artist_Column2[index] };
})
)}

function _scatterplotData_counts(scatterplotData){return(
scatterplotData.reduce((counts, point) => {
    const key = `${point.x}-${point.y}`;
    counts[key] = (counts[key] || 0) + 1;
    return counts;
}, {})
)}

function _finalData(scatterplotData_counts){return(
Object.keys(scatterplotData_counts).map((key) => {
    const [x, y] = key.split('-');
    return { x, y, count: scatterplotData_counts[key] };
})
)}

function _createSVG(d3,finalData)
{
  // 定義邊界大小，以及圖形的寬度和高度
  const margin = { top: 20, right: 30, bottom: 30, left: 40 };
  const width = 500 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  // X 軸的比例尺
  const xScale = d3
    .scaleLinear()
    .domain([0, d3.max(finalData, (d) => +d.x) + 1]) // 根據 x 的值設定範圍
    .range([0, width]);

  // Y 軸的比例尺
  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(finalData, (d) => +d.y) + 1]) // 根據 y 的值設定範圍
    .range([height, 0]);

  // 創建 SVG 元素
  const svg = d3.create("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom + 20);

  // 在 SVG 中添加一個包含所有內容的 g 元素
  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  // 定義半徑的比例尺
  const radiusScale = d3
    .scaleLinear()
    .domain([1, 10, 20, 30, 40, 50, 51]) // 根據 count 的區間設定
    .range([2, 4, 6, 8, 10, 12, 14]); // 對應的半徑值

  // 繪製點
  g.selectAll("circle")
    .data(finalData)
    .enter()
    .append("circle")
    .attr("cx", (d) => xScale(+d.x)) // 使用 xScale 將 x 值映射到位置
    .attr("cy", (d) => yScale(+d.y)) // 使用 yScale 將 y 值映射到位置
    .attr("r", (d) => radiusScale(d.count)) // 根據 count 設定半徑
    .attr("fill", "#5CADAD") // 點的顏色
    .append("title") // 加入 title 元素
    .text((d) => `Count: ${d.count}`);
  
  // 過度效果，參考111598087邱凡洺
  g.selectAll("circle")
    .on("mouseover", function(d) {
      d3.select(this).attr("fill", "#211E55");
    })
    .on("mouseout", function(d) {
      d3.select(this).attr("fill", "#5CADAD");
  });
  // X 軸
  g.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(xScale).ticks(5)); // 設定刻度數量

  // X 軸標籤
  g.append("text")
    .attr("transform", `translate(${width / 2}, ${height + margin.top + 20})`)
    .style("text-anchor", "middle")
    .text("您對於「台灣 2050 淨零排放」政策的瞭解在那個相對位置？");

  // Y 軸
  g.append("g").call(d3.axisLeft(yScale).ticks(5)); // 設定刻度數量

  // Y 軸標籤
  g.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -margin.left)
    .attr("x", -height / 2)
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("您對於SDGs的瞭解在那個相對位置?");

  // 顯示 SVG
  
  return svg.node();
}


function _11(md){return(
md`<h2>結論</h2>
<h3>從上圖中，我們可以看出：
  <ul>
    <li>對於台灣2050淨零排放政策越了解的群眾，對SDGs有越清楚的認知</li>
    <li>XY軸呈正相關</li>
  </ul>
</h3>`
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
  main.variable(observer("artist_columnKey1")).define("artist_columnKey1", ["artist"], _artist_columnKey1);
  main.variable(observer("artist_columnKey2")).define("artist_columnKey2", ["artist"], _artist_columnKey2);
  main.variable(observer("artist_Column1")).define("artist_Column1", ["artist","artist_columnKey1"], _artist_Column1);
  main.variable(observer("artist_Column2")).define("artist_Column2", ["artist","artist_columnKey2"], _artist_Column2);
  main.variable(observer("scatterplotData")).define("scatterplotData", ["artist_Column1","artist_Column2"], _scatterplotData);
  main.variable(observer("scatterplotData_counts")).define("scatterplotData_counts", ["scatterplotData"], _scatterplotData_counts);
  main.variable(observer("finalData")).define("finalData", ["scatterplotData_counts"], _finalData);
  main.variable(observer("createSVG")).define("createSVG", ["d3","finalData"], _createSVG);
  main.variable(observer()).define(["md"], _11);
  return main;
}
