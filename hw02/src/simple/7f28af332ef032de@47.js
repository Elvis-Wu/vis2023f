function _1(md){return(
md`# HW2 Simple Baseline (4pt)`
)}

function _data(FileAttachment){return(
FileAttachment("data.json").json()
)}

function _3(Plot,data){return(
Plot.plot({ 
	y: {grid: true, label: "count"}, 
	marks: [   
		Plot.rectY(data, Plot.binX({y:"count"}, { x:"Year", interval: 1, tip:true})), 
		Plot.gridY({ interval: 1, stroke:  "white", strokeOpacity: 0.5 })
	]
})
)}

function _plot1(Inputs){return(
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

function _fill_Color(plot1){return(
`rgb(${plot1.r},${plot1.g},${plot1.b})`
)}

function _6(Plot,plot1,data,fill_Color){return(
Plot.plot({ 
  marginTop: plot1.mt, 
	marginRight: plot1.mr, 
	marginBottom: plot1.mb, 
	marginLeft: plot1.ml, 
	y: {grid: true, label: "count"}, 
	marks: [   
		Plot.rectY(data, Plot.binX({y:"count"}, { x:"Year", interval: 1, tip:plot1.tip_choose, fill:fill_Color})), 
		Plot.gridY({ interval: 1, stroke:  "white", strokeOpacity: 0.5 })
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
  main.variable(observer()).define(["Plot","data"], _3);
  main.variable(observer("viewof plot1")).define("viewof plot1", ["Inputs"], _plot1);
  main.variable(observer("plot1")).define("plot1", ["Generators", "viewof plot1"], (G, _) => G.input(_));
  main.variable(observer("fill_Color")).define("fill_Color", ["plot1"], _fill_Color);
  main.variable(observer()).define(["Plot","plot1","data","fill_Color"], _6);
  return main;
}
