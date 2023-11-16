function _1(md){return(
md`# HW2 Strong baseline(2pt)`
)}

function _data(FileAttachment){return(
FileAttachment("data.json").json()
)}

function _CCounts(){return(
[]
)}

function _Constellation(data){return(
data.map(item => item.Constellation)
)}

function _labelName(){return(
["牡羊座", "金牛座", "雙子座", "巨蟹座", "獅子座", "處女座", "天秤座", "天蠍座", "射手座", "摩羯座", "水瓶座", "雙魚座"]
)}

function _6(CCounts,data)
{
  CCounts.length = 0; //將yCounts清空ㄠ
  for (var C=0; C<=11 ;C++) { 
    //所有年份都建立兩個Object，一個存放男性資料，一個存放女性資料
    CCounts.push({Constellation:C, gender:"male", count:0}); 
    //Object包含：1. 出生年，2.男性，3.人數(設為0)
    CCounts.push({Constellation:C, gender:"female", count:0}); 
    //Object包含：1. 出生年，2.女性，3.人數(設為0)
  }
  data.forEach (x=> {
    var i = (x.Constellation)*2 + (x.Gender== "男" ? 0 : 1); 
    CCounts[i].count++;
  })
  return CCounts
}


function _plot2(Inputs){return(
Inputs.form({
	mt:  Inputs.range([0, 100], {label: "marginTop", step: 1}),
	mr:  Inputs.range([0, 100], {label: "marginRight", step: 1}),
	mb:  Inputs.range([0, 100], {label: "marginBottom", step: 1}),
	ml:  Inputs.range([0, 100], {label: "marginLeft", step: 1}),
})
)}

function _8(Plot,plot2,labelName,CCounts){return(
Plot.plot({
  marginTop: plot2.mt,
  marginRight: plot2.mr,
  marginBottom: plot2.mb,
  marginLeft: plot2.ml,
  
  grid: true,
  y: {label: "count"},
  x: {tickFormat: (d) => {return labelName[d];}},
  marks: [
    Plot.ruleY([0]),
    Plot.barY(CCounts, {x: "Constellation", y: "count", tip: true , fill:"gender"}),
  ],
})
)}

function _9(Plot,plot1,labelName,data){return(
Plot.plot({ 
  marginTop: plot1.mt, 
	marginRight: plot1.mr, 
	marginBottom: plot1.mb, 
	marginLeft: plot1.ml,   

	y: {grid: true, label: "count"}, 
  x: {ticks: 12,
      tickFormat: (d) => {return labelName[d];}},
	marks: [   
		Plot.rectY(data, Plot.binX({y:"count"}, { x:"Constellation", interval: 1 ,fill: "Gender", tip:true, 
                                            title: d => `Constellation: ${labelName[d.Constellation]}\nGender: ${d.Gender == "male" ? "男":"女"}`})), 
		Plot.gridY({stroke:  "white", strokeOpacity: 0 })
	],
  
})
)}

function _plot1(Inputs){return(
Inputs.form({
	mt:  Inputs.range([0, 100], {label: "marginTop", step: 1}),
	mr:  Inputs.range([0, 100], {label: "marginRight", step: 1}),
	mb:  Inputs.range([0, 100], {label: "marginBottom", step: 1}),
	ml:  Inputs.range([0, 100], {label: "marginLeft", step: 1}),
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
  main.variable(observer("CCounts")).define("CCounts", _CCounts);
  main.variable(observer("Constellation")).define("Constellation", ["data"], _Constellation);
  main.variable(observer("labelName")).define("labelName", _labelName);
  main.variable(observer()).define(["CCounts","data"], _6);
  main.variable(observer("viewof plot2")).define("viewof plot2", ["Inputs"], _plot2);
  main.variable(observer("plot2")).define("plot2", ["Generators", "viewof plot2"], (G, _) => G.input(_));
  main.variable(observer()).define(["Plot","plot2","labelName","CCounts"], _8);
  main.variable(observer()).define(["Plot","plot1","labelName","data"], _9);
  main.variable(observer("viewof plot1")).define("viewof plot1", ["Inputs"], _plot1);
  main.variable(observer("plot1")).define("plot1", ["Generators", "viewof plot1"], (G, _) => G.input(_));
  return main;
}
