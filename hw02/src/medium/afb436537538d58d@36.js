function _1(md){return(
md`# HW2 Medium Baseline(4pt)`
)}

function _data(FileAttachment){return(
FileAttachment("data.json").json()
)}

function _yCounts(){return(
[]
)}

function _years(data){return(
data.map(item => item.Year)
)}

function _5(yCounts,years,data)
{
  yCounts.length = 0; //將yCounts清空
  var minYear = Math.min(...years); //最早出生年
  var maxYear = Math.max(...years); //最晚出生年
  for (var y=minYear; y<=maxYear; y++) { 
    //所有年份都建立兩個Object，一個存放男性資料，一個存放女性資料
    yCounts.push({year:y, gender:"male", count:0}); 
    //Object包含：1. 出生年，2.男性，3.人數(設為0)
    yCounts.push({year:y, gender:"female", count:0}); 
    //Object包含：1. 出生年，2.女性，3.人數(設為0)
  }
  data.forEach (x=> {
    var i = (x.Year-minYear)*2 + (x.Gender== "男" ? 0 : 1); 
    yCounts[i].count++;
    //讀取data array，加總每個年份出生的人
  })
  return yCounts
}


function _6(Plot,yCounts){return(
Plot.plot({
  
  grid: true,
  y: {label: "count"},
  marks: [
    Plot.ruleY([0]),
    Plot.barY(yCounts, {x: "year", y: "count", tip: true }),
  ]
})
)}

function _plot2(Inputs){return(
Inputs.form({
	mt:  Inputs.range([0, 100], {label: "marginTop", step: 1}),
	mr:  Inputs.range([0, 100], {label: "marginRight", step: 1}),
	mb:  Inputs.range([0, 100], {label: "marginBottom", step: 1}),
	ml:  Inputs.range([0, 100], {label: "marginLeft", step: 1}),
  // 參考111598087 邱凡洺
  r:  Inputs.range([0, 255], {label: "color_r", step: 1}),
	g:  Inputs.range([0, 255], {label: "color_g", step: 1}),
	b:  Inputs.range([0, 255], {label: "color_b", step: 1}),
  tip_choose: Inputs.range([0, 1], {label: "tip", step: 1})
})
)}

function _fill_Color(plot2){return(
`rgb(${plot2.r},${plot2.g},${plot2.b})`
)}

function _9(Plot,plot2,yCounts,fill_Color){return(
Plot.plot({
  marginTop: plot2.mt, 
	marginRight: plot2.mr, 
	marginBottom: plot2.mb, 
	marginLeft: plot2.ml, 
  
  grid: true,
  y: {label: "count"},
  marks: [
    Plot.ruleY([0]),
    Plot.barY(yCounts, {x: "year", y: "count", tip: plot2.tip_choose, fill:fill_Color }),
  ]
})
)}

export default function define(runtime, observer) {
  const main = runtime.module();
  function toString() { return this.url; }
  const fileAttachments = new Map([
    ["data.json", {url: new URL("../data.json", import.meta.url), mimeType: "application/json", toString}]
  ]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer()).define(["md"], _1);
  main.variable(observer("data")).define("data", ["FileAttachment"], _data);
  main.variable(observer("yCounts")).define("yCounts", _yCounts);
  main.variable(observer("years")).define("years", ["data"], _years);
  main.variable(observer()).define(["yCounts","years","data"], _5);
  main.variable(observer()).define(["Plot","yCounts"], _6);
  main.variable(observer("viewof plot2")).define("viewof plot2", ["Inputs"], _plot2);
  main.variable(observer("plot2")).define("plot2", ["Generators", "viewof plot2"], (G, _) => G.input(_));
  main.variable(observer("fill_Color")).define("fill_Color", ["plot2"], _fill_Color);
  main.variable(observer()).define(["Plot","plot2","yCounts","fill_Color"], _9);
  return main;
}
