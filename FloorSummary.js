/**==========================================================================================
 * Helper Functions
 */
if (!Object.create) {
	Object.create = function(base) {
		function F () {};
		F.prototype = base;
		return new F();
	};
}

//NameSpace
global.TGMLAPI = {}

MYAPI = global.TGMLAPI;

MYAPI.isUndefined = function(o) {
	if(typeof(o) === "undefined") {
		return true;			
	}
	return false;	
}

MYAPI.getBool = function(s) {
	var trueEnum = ["yes", "y", "Yes", "Y", "1", "True", "true", "T", "t", "On", "active"];
	var i = trueEnum.length;
	while(i--) {
		if(String(s) === trueEnum[i]) {
			return true;
		}
	}
	return false
}

/**==========================================================================================
 * Bind Object
 */
MYAPI.Bind = {
	node: null,
	fbn: null,
	value: null,
	
	init: function(node) {
		this.node = node;
		if(this.node) {
			this.fbn = this.node.getFullBindName();
		}
	},
	
	enableUpdates: function(){
		try {
			if(this.node) {
				this.node.setAttribute("DynamicUpdates", "Enable");
			}
		}
		catch(err) {
		}
	},
	
	disableUpdates: function() {
		try {
			if(this.node) {
				this.node.setAttribute("DynamicUpdates", "Disable");
			}
		}
		catch(err) {
		}
	},
	
	displayProperties: function() {
		if(this.fbn) {
			invoke(this.fbn,"EditProperties");
		}
	},
	
	relinquish: function() {
		try {
			if(this.fbn) {
				setValue(this.fbn,null);	
			}
		}
		catch(err) {
		}
	},
	
	write: function(val) {
		try {
			if(this.fbn) {
				setValue(this.fbn, val);
			}
		}
		catch(err) {
		}
	}
};

/**==========================================================================================
 * Link Object
 */
MYAPI.Link = {
	init: function(node) {
		this.node = node;
		if(this.node) {
			this.fbn = this.node.getFullBindName();
		}
	},
	
	gotoLink: function() {
		if(this.fbn) {
			invoke(this.fbn,"OpenInParent");//ViewObject
		}
	}
};

/**==========================================================================================
 * Analog Value Object
 */
MYAPI.AnalogValue = {
	init: function(node) {
		this.content = "---";
		this.node = node;
		
		this.prefix = "";
		if(this.node.hasAttribute("Prefix")) {
			this.prefix = this.node.getAttribute("Prefix");
		}
		
		this.suffix = "";
		if(this.node.hasAttribute("Suffix")) {
			this.suffix = this.node.getAttribute("Suffix");
		}
		
		this.units = "";
		if(this.node.hasAttribute("Units")) {
			this.units = this.node.getAttribute("Units");
		}
		
		this.decimals = 0;
		if(this.node.hasAttribute("Decimals")) {
			this.decimals = +this.node.getAttribute("Decimals");
		}
		this.render();
	},
	update: function(val) {
		val = val.toFixed(this.decimals);
	
		this.content = this.prefix + val + " " + this.units + this.suffix;
				
		this.render();
	},
	render: function() {
		if(this.node) {		
			this.node.setAttribute("Content", this.content);
		}
	}
};

/**==========================================================================================
 * TextBox Object
 */
MYAPI.TextBox = {
	init: function(node) {
		this.content = "---";
		this.node = node;		
	},
	update: function(val) {
		this.content = val;
		this.render();
	},
	render: function() {
		if(this.node) {		
			this.node.setAttribute("Content", this.content);
		}
	}
};

/**==========================================================================================
 * Pie Object
 */
MYAPI.Pie = {
	init: function(node) {
		this.node = node;
		
		// get colors
		this.colors = [];
		var i = 1;
		while(this.node.hasAttribute("Color" + i)) {
			this.colors.push(this.node.getAttribute("Color" + i));
			i += 1;
		}
		
		// get the model pie
		var pies = this.node.getElementsByTagName("Pie");
		this.model = pies.item(0);
		this.model.setAttribute("Visibility", "Hidden");
		this.wedges = [];
				
		// delete all but model
		for(var i = 1, max = pies.length; i < max; i += 1) {
			this.node.removeChild(pies.item(i));
		}	
		this.topper = this.node.getChild("topper");	
	},
	
	update: function(vals) {
		var startAngle = -90;
		for(var i = 0, max = vals.length - 1; i < max; i += 1) {
			if(MYAPI.isUndefined(this.wedges[i])) {
				this.wedges[i] = Object.create(MYAPI.PieWedge);
				this.wedges[i].init(this.model, this.colors[i % this.colors.length]);
				this.node.appendChild(this.topper);
			}
			var sweepAngle = vals[i] ? vals[i] * 360 : 0;	
//			alert("i: " + i + ", value: " + vals[i] + ", start: " + startAngle + ", sweep: " + sweepAngle);		
			this.wedges[i].update(startAngle, sweepAngle);
			startAngle += sweepAngle;
		}
	}
};

/**==========================================================================================
 * PieWedge Object
 */
MYAPI.PieWedge = {
	init: function(model, color) {
		var parent = model.getParentNode();		
		this.node = model.cloneNode(true);
		parent.appendChild(this.node);
		this.node.setAttribute("Visibility", "Visible");
		this.node.setAttribute("Fill", color);
	},
	
	update: function(start, sweep) {
		this.node.setAttribute("StartAngle", start);
		this.node.setAttribute("SweepAngle", sweep);
	}
};

/**==========================================================================================
 * Canvas Object
 */
MYAPI.Canvas = {
	node: null,
	width: null,
	height: null,
	top: null,
	left: null,
	
	init: function(node) {
		this.node = node;
		this.width = +this.getProperty("Width");
		this.height = +this.getProperty("Height");
		this.top = +this.getProperty("Top");
		this.left = +this.getProperty("Left");
	},
	
	getProperty : function(prop) {
		if(this.node !== null) {
			return this.node.getAttribute(prop);
		}
		return null;
	}	
};

/**==========================================================================================
 * Floor Object
 */
MYAPI.Floor = {
	node: null,
	top: 0,
	left: 0,
	startWidth: 0,
	startHeight: 0,
	pad: 10,
	
	init: function(model, floorNum) {
		this.node = model.cloneNode(true);
		model.getParentNode().appendChild(this.node);
		this.node.setAttribute("Visibility", "Visible");
		
		var targetArea = this.node.getElementsByTagName("TargetArea").item(0);
		var leadZero = floorNum < 10 ? "0" : "";
		var linkName = "Floor_" + leadZero + floorNum;
		targetArea.setAttribute("Name", linkName);
		
		this.startWidth = +this.node.getAttribute("Width");
		this.startHeight = +this.node.getAttribute("Height");
		
		// set the floor name
		this.node.getChild("Floor").setAttribute("Content", this.getName(floorNum));
		
		this.RCs = {};
		
		// get value text boxes
		this.rmTmpAvgTB = Object.create(MYAPI.AnalogValue);
		this.rmTmpAvgTB.init(this.node.getChild("RmTmpAvg"));
		this.rmTmpSptAvgTB = Object.create(MYAPI.AnalogValue);
		this.rmTmpSptAvgTB.init(this.node.getChild("RmTmpSptAvg"));
		this.UUTB = Object.create(MYAPI.AnalogValue);
		this.UUTB.init(this.node.getChild("UU"));
		this.RUTB = Object.create(MYAPI.AnalogValue);
		this.RUTB.init(this.node.getChild("RU"));
		this.UOTB = Object.create(MYAPI.AnalogValue);
		this.UOTB.init(this.node.getChild("UO"));
		this.ROTB = Object.create(MYAPI.AnalogValue);	
		this.ROTB.init(this.node.getChild("RO"));
		
		this.pie = Object.create(MYAPI.Pie);
		this.pie.init(this.node.getChild("PieChart"));
	},
	
	getName: function(num) {
		var ones = String(num).slice(-1),
			tens = String(num).slice(-2, -1),
			ending = "th";
				
		if(tens !== "1") {
			switch(ones) {
			case "1":
				ending = "st";
				break;
			case "2":
				ending = "nd";
				break;
			case "3":
				ending = "rd";
				break;
			default:	
			}	
		}
		
		return num + ending + " Floor";
	},
	
	updatePosition: function(cellWidth, cellHeight, cellTop, cellLeft) {
		var multiplier = Math.min(Math.min((cellWidth - this.pad) / this.startWidth, (cellHeight - this.pad) / this.startHeight), 2);
				
		this.width = this.startWidth * multiplier;
		this.height = this.startHeight * multiplier;		
		this.top = cellTop + (cellHeight - this.height) / 2;
		this.left = cellLeft + (cellWidth - this.width) / 2;
		
		this.node.setAttribute("Top", this.top);
		this.node.setAttribute("Left", this.left);
		this.node.setAttribute("Width" , this.width);
		this.node.setAttribute("Height" , this.height);
	},
	
	update: function(RCname, name, value) {
		// store value
		if(!this.RCs.hasOwnProperty(RCname)) {
			this.RCs[RCname] = {};
		}
		this.RCs[RCname][name] = +value;
		
		// update Average Temp
		var tmpCount = 0,
			rmTmpSum = 0,
			sptCount = 0,
			rmTmpSptSum = 0,
			UUsum = 0,
			RUsum = 0,
			UOsum = 0,
			ROsum = 0;
		for(var key in this.RCs) {
			if(this.RCs.hasOwnProperty(key)) {
				var RC = this.RCs[key];
				if(RC.hasOwnProperty("RoomTemp")) {
					rmTmpSum += RC["RoomTemp"];
					tmpCount += 1; 
				}
				var clgMd = null;
				if(RC.hasOwnProperty("PICoolDemand") && RC.hasOwnProperty("PIHeatDemand")) {
					if(RC["PIHeatDemand"] > 0) {
						clgMd = false;
					} else if(RC["PICoolDemand"] >= 0) {
						clgMd = true;
					}
				}
				
				if(RC.hasOwnProperty("EffectiveOcc")) {
					switch(RC["EffectiveOcc"]) {
					case 1:
					case 3:
						if(clgMd !== null) {
							if(clgMd) {
								if(RC.hasOwnProperty("OccCoolSetpoint")) {
									rmTmpSptSum += RC["OccCoolSetpoint"];
									sptCount += 1;
								}
							} else {
								if(RC.hasOwnProperty("OccHeatSetpoint")) {
									rmTmpSptSum += RC["OccHeatSetpoint"];
									sptCount += 1;
								}
							}
						}
						break;
					case 2:
						if(clgMd !== null) {
							if(clgMd) {
								if(RC.hasOwnProperty("UnoccCoolSetpoint")) {
									rmTmpSptSum += RC["UnoccCoolSetpoint"];
									sptCount += 1;
								}
							} else {
								if(RC.hasOwnProperty("UnoccHeatSetpoint")) {
									rmTmpSptSum += RC["UnoccHeatSetpoint"];
									sptCount += 1;
								}
							}
						}
						break;
					case 4:
						if(clgMd !== null) {
							if(clgMd) {
								if(RC.hasOwnProperty("StandbyCoolSetpoint")) {
									rmTmpSptSum += RC["StandbyCoolSetpoint"];
									sptCount += 1;
								}
							} else {
								if(RC.hasOwnProperty("StandbyHeatSetpoint")) {
									rmTmpSptSum += RC["StandbyHeatSetpoint"];
									sptCount += 1;
								}
							}
						}
						break;
					default:
					}
				}
				
				if(RC.hasOwnProperty("EffectiveOcc") && RC.hasOwnProperty("OccCommand")) {
					if(RC["EffectiveOcc"] === 2) {
						UUsum += 1;
					} else if(RC["EffectiveOcc"] === 4) {
						RUsum += 1;
					} else if(RC["EffectiveOcc"] === 3 && RC["OccCommand"] === 3) {
						UOsum += 1;
					} else {
						ROsum += 1;
					}					
				}
			}
		}
		
		if(tmpCount > 0) {
			this.rmTmpAvgTB.update(rmTmpSum / tmpCount);
		}
		
		if(sptCount > 0) {
//			alert(rmTmpSptSum);
			this.rmTmpSptAvgTB.update(rmTmpSptSum / sptCount);
		}
				
		var total = UUsum + RUsum + UOsum + ROsum;
		if(total > 0) {
			this.UUTB.update(UUsum / total * 100);
			this.RUTB.update(RUsum / total * 100);
			this.UOTB.update(UOsum / total * 100);
			this.ROTB.update(ROsum / total * 100);
		}
		
		this.pie.update([UUsum / total, RUsum / total, UOsum / total, ROsum / total]);
	}
};

/**==========================================================================================
 * Grid Object
 */
MYAPI.Grid = {
	rows: 1,
	columns: 1,
	columnWidth: null,
	rowHeight: null,
	canvasWidth: null,
	canvasHeight: null,
	top: 0,
	left: 0,
	
	init: function(canvasWidth, canvasHeight, canvasTop, canvasLeft) {
		this.canvasWidth = canvasWidth;
		this.canvasHeight = canvasHeight;
		this.update(1);
	},
	
	update: function(numFloors) {
		// calculate the most efficient rows and columns
//		alert(numFloors);
		this.rows = 1;
		this.columns = 1;
		while(this.rows * this.columns < numFloors) {
			this.columns += 1;
			if(this.rows * this.columns >= numFloors) {
				break;
			}
			this.rows += 1;
		}
//		alert("numFloors: " + numFloors + ", rows: " + this.rows + ", columns: " + this.columns);
		
		// calculate columnWidth
		// calculate columnHeight
		this.columnWidth = this.canvasWidth / this.columns;
		this.rowHeight = this.canvasHeight / this.rows;
//		alert("rowHeight: " + this.rowHeight+ ", columnWidth: " + this.columnWidth);
	}
};

/**==========================================================================================
 * Display Manager Object
 */
MYAPI.DisplayManager = {
	floors: [],
	displayLayer: null,
	floorModel: null,
	grid: null,
	
	init: function(node) {
		this.displayLayer = node;
		
		this.canvas = Object.create(MYAPI.Canvas);
		this.canvas.init(this.displayLayer.getChild("Canvas"));
		this.floorModel = this.displayLayer.getChild("FloorModel");
		
		this.grid = Object.create(MYAPI.Grid);
		this.grid.init(this.canvas.width, this.canvas.height);
	},
	
	update: function(e) {
		var bind = e.getTarget(),
			floorName = String(bind.getParentNode().getParentNode().getAttribute("Name")),
			RCname = String(bind.getParentNode().getAttribute("Name")),
			bindName = String(bind.getAttribute("Name")),
			value = e.getValue(),
			units = e.getUnit();
			
		// check if the floor already exists
		var floorNum = +floorName.slice(-2);
//		alert("floorNum: " + floorNum);
		if(MYAPI.isUndefined(this.floors[floorNum - 1])) {
			// create a new floor object			
			this.floors[floorNum - 1] = Object.create(MYAPI.Floor);
			this.floors[floorNum - 1].init(this.floorModel, floorNum);
						
			// update grid
			this.grid.update(this.floors.length);
			
			// update floor position
			for(var i = 0, max = this.floors.length; i < max; i += 1) {
				var cellRow = Math.floor(i / this.grid.columns);
					cellColumn = i % this.grid.columns;
					cellTop = cellRow * this.grid.rowHeight + this.canvas.top;
					cellLeft = cellColumn * this.grid.columnWidth + this.canvas.left;
				
//				alert("i: " + i + ", cellTop: " + cellTop + ", cellLeft: " + cellLeft);
				if(!MYAPI.isUndefined(this.floors[i])) {
					this.floors[i].updatePosition(this.grid.columnWidth, this.grid.rowHeight, cellTop, cellLeft);
				}
			}
		}
		
		// update value
//		alert("floor: " + floorNum + ", RC: " + RCname + ", bind: " + bindName + ", value: " + value);
		this.floors[floorNum - 1].update(RCname, bindName, value);
	}
};

/**==========================================================================================
 * Bind Manager Object
 */
MYAPI.BindManager = {
	binds: {},
	init: function(node) {
		var bindList = node.getElementsByTagName("Bind");
		for(var i = 0, max = bindList.length; i < max; i += 1) {
			var bind = bindList.item(i),
				name = String(bind.getAttribute("Name")),
				parentName = String(bind.getParentNode().getAttribute("Name"));
			
			if(!this.binds.hasOwnProperty(parentName)) {
				this.binds[parentName] = {};
			}
			this.binds[parentName][name] = Object.create(MYAPI.Bind);
			this.binds[parentName][name].init(bind);
		}
	},
	
	update: function(e) {
		var bind = e.getTarget(),
			parentName = String(bind.getParentNode().getAttribute("Name")),
			name = String(bind.getAttribute("Name")),
			value = e.getValue();
		
		this.binds[parentName][name].value = value;
	}
};

/**==========================================================================================
 * Link Manager Object
 */
MYAPI.LinkManager = {
	links: {},
	init: function(node) {
		var linkList = node.getElementsByTagName("Link");
		for(var i = 0, max = linkList.length; i < max; i += 1) {
			var link = linkList.item(i),
				parentName = String(link.getParentNode().getAttribute("Name"));
			
			this.links[parentName] = Object.create(MYAPI.Link);
			this.links[parentName].init(link);
		}
	},
	click: function(e) {
		var name = String(e.getTarget().getAttribute("Name"));
		this.links[name].gotoLink();
	}
};

var Main = {
	tgml: null,
	canvas: null,
	bm: null,
	lm: null,
	dm: null,
	
	init: function(e) {
		// create needed objects
		// Create canvas
		this.tgml = e.getCurrentTarget().getOwnerDocument().getDocumentElement()
		
		// Create Bind Manager
//		this.bm = Object.create(MYAPI.BindManager);
//		this.bm.init(this.tgml.getChild("Binds"));
		
		// Create Link Manager
		this.lm = Object.create(MYAPI.LinkManager);
		this.lm.init(this.tgml.getChild("Binds"));
		
		// Create Display Manager
		this.dm = Object.create(MYAPI.DisplayManager);
		this.dm.init(this.tgml.getChild("Display"));
	},
	change: function(e) {
//		this.bm.update(e);
		e.preventDefault();
		this.dm.update(e);	
	},
	click: function(e) {
		this.lm.click(e);
	}
}

function onLoad(evt) {
	Main.init(evt);
}

function onChange(evt) {
	Main.change(evt);
}

function onClick(evt) {
	Main.click(evt);
}