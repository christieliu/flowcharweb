!function ( $, window){
	function _intersects (r1, r2) {
	    var x1 = r1.x, x2 = r1.x + r1.w, y1 = r1.y, y2 = r1.y + r1.h,
	        a1 = r2.x, a2 = r2.x + r2.w, b1 = r2.y, b2 = r2.y + r2.h;
	
		return  ( (x1 <= a1 && a1 <= x2) && (y1 <= b1 && b1 <= y2) ) ||
		        ( (x1 <= a2 && a2 <= x2) && (y1 <= b1 && b1 <= y2) ) ||
		        ( (x1 <= a1 && a1 <= x2) && (y1 <= b2 && b2 <= y2) ) ||
		        ( (x1 <= a2 && a1 <= x2) && (y1 <= b2 && b2 <= y2) ) ||	
		        ( (a1 <= x1 && x1 <= a2) && (b1 <= y1 && y1 <= b2) ) ||
		        ( (a1 <= x2 && x2 <= a2) && (b1 <= y1 && y1 <= b2) ) ||
		        ( (a1 <= x1 && x1 <= a2) && (b1 <= y2 && y2 <= b2) ) ||
		        ( (a1 <= x2 && x1 <= a2) && (b1 <= y2 && y2 <= b2) );
	};
	function FormUtils(){
		var retArray = [], tmpdx, tmpdx2,tmpdy;
		var options = {borderWidth : 1};
		//
		var _recusiveChangeTdWhenEast = function(targetTd){
			var $this = $(targetTd);
			//console.log($this.offset().left + ":" + $this.width());
			//$this.data("oldWidth", $this.width() + options.borderWidth);
			if(!$this.find(">table").size()){
				if(tmpdx <0 && (tmpdx + $this.width() < minTdWidth)){
					tmpdx = Math.max(tmpdx, minTdWidth - $this.width());
				}
				retArray.push($this);
				$this.data("oldWidth", $this.width());
				return;
			}
			$this.find(">table>tbody>tr").find(">td:last").each(function(n){
				_recusiveChangeTdWhenEast(this, tmpdx);
			});
		}
		var _recusiveChangeTdWhenWest = function(targetTd){
			var $this = $(targetTd);
			if(!$this.find(">table").size()){
				if( tmpdx >0 && (-tmpdx + $this.width() < minTdWidth)){
					tmpdx = Math.min(tmpdx, $this.width() - minTdWidth );
				}
				retArray.push($this);
				$this.data("oldWidth", $this.width());
				return;
			}
			$this.find(">table>tbody>tr").find(">td:first").each(function(n){
				_recusiveChangeTdWhenWest(this);
			});
		}
		//向上寻找td
		var _recrusiveTd = function(targetTd){
			var $targetTd = $(targetTd);
			//判断是否一行中最末尾的td
			if($targetTd.index() == $targetTd.parent().find(">td").size() -1 ){
				var $parentTd = $targetTd.parent().closest("td");
				if($parentTd.size()){
					return _recrusiveTd($parentTd);
				}
			}
			return targetTd;
		}
		/**向右拉动单元格, 目标单元格变宽**/
		var _changeTdWhenEast = function(targetTd){
			retArray = [];
			_recusiveChangeTdWhenEast(targetTd);
			return retArray; 
		}
		/**右边临近的单元格缩窄**/
		var _changeTdWhenWest = function(targetTd, deltaX){
			retArray = [];
			_recusiveChangeTdWhenWest(targetTd);
			return retArray; 
		}
		
		var _getRightBorder = function(el){
			return el.offset().left + el.width();
		}
		

		var _isSameRightBorder = function(el1, el2){
			return Math.abs(_getRightBorder(el1) - _getRightBorder(el2)) <= options.borderWidth;
		}
		/**改变列宽**/
		this.changeTdVertical = function(targetTd, deltaX){
			var changeEl_local = _recrusiveTd(targetTd);
			tmpdx = deltaX;
			var rightBorder = changeEl_local.width() + changeEl_local.offset().left;
			var irow = changeEl_local.parent().index();
			var changeTable = changeEl_local.closest("table"), trs = changeTable.find(">tbody>tr");
			var leftTds = [], rightTds = [];
			for(var i = 0; i < trs.size(); i++){
				 var curTr = trs.eq(i);
				 var rowTd = curTr.find(">td");
				 for(var j = 0; j < rowTd.size(); j++){
					 var curTd = rowTd.eq(j);
					 if(Math.abs(curTd.offset().left + curTd.width() - rightBorder) <= options.borderWidth){
						 leftTds = leftTds.concat(_changeTdWhenEast(curTd));
						 //console.log(leftTds.length);
						 break;
					 }
				 }
			}	
			//console.log("total leftTds length" + leftTds.length + ":" + tmpdx);
			//changeEl_local = changeEl_local.next();
    		if( changeEl_local.size()){
    			//changeTable = changeEl_local.closest("table");
    			trs = changeTable.find(">tbody>tr");
    			for(var i = 0; i < trs.size(); i++){
    				 var curTr = trs.eq(i);
   					 var rowTd = curTr.find(">td");
   					 for(var j = 0; j < rowTd.size(); j++){
   						 var curTd = rowTd.eq(j);
   						 //console.log(curTd.offset().left + ":" + rightBorder)
   						 if( Math.abs(curTd.offset().left - rightBorder) <= options.borderWidth * 2){
   							 rightTds = rightTds.concat(_changeTdWhenWest(curTd));
   							 break;
   						 }
   					 }
    			}
    			//console.log("total rightTds length" + rightTds.length + ":" + tmpdx);	
			}
			$(leftTds).each(function(){
				var $this = $(this);
				$this.width(parseInt($this.data("oldWidth")) + tmpdx);
			})	
			$(rightTds).each(function(){
				var $this = $(this);
				//console.log("oldWidth :" + $this.data("oldWidth"));
				$this.width(parseInt($this.data("oldWidth")) - tmpdx);
			})	
			
		}
		/***改变行高计算需要移动哪一行**/
		this.getHorizontalTr = function (targetTd){
			var $currentTd = $(targetTd);
			var oldHeight, changeEl_local;
			var rowspan = $currentTd.attr("rowspan");
			if(rowspan && rowspan > 1){
				var $table = $currentTd.closest("table");
				var $trs = $table.find(">tbody>tr");
				var topH = $currentTd.parent().offset().top 
				var bottomH = topH +  $currentTd.height();
				for(var i = 0 ; i < $trs.length; i++){
					var $tr = $trs.eq(i);
					if( ($tr.offset().top <= bottomH) && ($tr.offset().top + $tr.height() >= bottomH)){
						return $tr;
					}
				}
			}else{
				return $currentTd.parent(); 
			}
		}
		/**
		 * 递归获得lasttr
		 */
		this.getRecursiveLastTr = function($tr){
			var ret = [], that = this;
			$tr.find(">td>table>tbody>tr:last").each(function(){
				var $this = $(this);
				var subTrs = that.getRecursiveLastTr($this);
				if(subTrs.length > 0){
					ret = ret.concat(subTrs);
				}
				ret.push(this)
			})
			return ret;
		}
		/**改变行高的时候涉及的td**/
		this.getRelationTds = function ($currenTr){
			var ret = [];
			if(!$currenTr || !$currenTr.size()){
				return ret;
			}
			var $table = $currenTr.closest("table");
			var $trs = $table.find(">tbody>tr");
			var topH = $currenTr.offset().top,
			bottomH = topH +  $currenTr.height()
			, that = this;
			for(var i = 0 ; i < $trs.size(); i++){
				var $tr = $trs.eq(i);
				if( $tr.offset().top >= bottomH ){
					break;
				}else{
					$tr.find(">td").each(function(n){
						var $this = $(this), top = $this.offset().top, height = $this.outerHeight();
						if(top <= topH && top + height >=bottomH ){
							var subTds = that.getRelationTds($this.find(">table>tbody>tr:last"));
							if(subTds.length > 0)
								ret = ret.concat(subTds)
							ret.push(this)
						}
					})
				}
			}			
			return ret;
		}
		
		/**改变行高**/
		this.changeTdHorizontal = function(targetTd, dy){
			var changeEl_local = $(targetTd);
			var oldHeight = changeEl_local.height();
			var deltaY = dy;
			if(dy < 0){
				deltaY = ( oldHeight + dy ) >= minTdHeight ? dy  : minTdHeight - oldHeight;
				changeEl_local.find("table>tbody>tr:last").each(function(){
					var oldH = $(this).height();
					deltaY = Math.max(deltaY, ( oldH + dy ) >= minTdHeight ? dy  : minTdHeight - oldH);
    			})
			}
			var changeTds = this.getRelationTds(changeEl_local);
			$(changeTds).find(">div.tdelement").each(function(){
				$(this).height($(this).height() + deltaY);
			})
			$(this.getRecursiveLastTr(changeEl_local)).each(function(){
				$(this).height($(this).height() + deltaY);
			})
			changeEl_local.height(deltaY + oldHeight);		
		}
		/**增加一行**/
		this.addRow = function(targetId, position){
			var $table = $(targetId).closest("table");
			var appendHtml = "<tr>";
			$(targetId).parent().find(">td").each(function(){
				var colspan = $(this).attr("colspan");
				colspan = colspan ? parseInt(colspan) : 0;
				appendHtml += "<td" + (colspan > 1 ? " colspan=" + colspan : "")  + ">&nbsp;</td>";
			})
			appendHtml += "</tr>";
			//console.log(appendHtml);
			//console.log($(targetId).html());
			var trIndex = $(targetId).parent().index();
			var $trs = $table.find(">tbody>tr");
			var ajustTds = [];
			for( var i = 0; i <= (trIndex -1); i++ ){
				$trs.eq(i).find(">td").each(function(){
					var $td = $(this);
					var rowspan = $td.attr("rowspan");
					//console.log("rowspan: " + rowspan)
					rowspan = rowspan ? parseInt(rowspan) : 1;
					//console.log($td.offset().top + $td.height());
					if( rowspan > 1 &&  ($td.offset().top < $(targetId).offset().top )
							&& ($td.offset().top + $td.height() >= $(targetId).offset().top + $(targetId).height() )){
						$td.attr("rowspan", rowspan+1);
						ajustTds.push(this);
					}
				})
			}
			$(appendHtml).insertBefore($(targetId).parent());
			$(ajustTds).find("div.tdelement").each(function(){
				var $this = $(this);
				$this.outerHeight($this.parent().height() + 1);
			})
		}
		//增加一列
		this.addColumn = function(targetId, position){
			var $table = $(targetId).closest("table");
			var leftBorder = $(targetId).offset().left;
			var newTds = [];
			$table.find(">tbody>tr").each(function(){
				var tds = $(this).find(">td");
				for(var i=0; i < tds.length ; i++){
					if(tds.eq(i).offset().left == leftBorder){
						newTds.push(tds.eq(i));
						break;
					}
				}
			})
			$(newTds).each(function(){
				$("<td style='width:" + minTdWidth +"px'>&nbsp;</td>").insertBefore($(this));
			})
		}
		/**合并单元格**/
		this.mergeTd = function(){
			var tds = $("td.tdSelected");
    		if(!tds.size()) return;
    		//先判断是否符合合并条件
    		var tdCount = 0, minCol, maxCol, minRow, maxRow;
    		tds.each(function(){
    			var $this = $(this);
    			tdCount += ($this.attr("colspan") ? parseInt($this.attr("colspan")) : 1) * ($this.attr("rowspan") ? parseInt($this.attr("rowspan")) : 1);
    			minCol = (minCol === undefined) ? $this.index() : Math.min(minCol, $this.index());
    			maxCol = (maxCol === undefined) ? $this.index() : Math.max(maxCol, $this.index());
    			minRow = (minRow === undefined) ? $this.parent().index() : Math.min(minRow, $this.parent().index());
    			maxRow = (maxRow === undefined) ? $this.parent().index() : Math.max(maxRow, $this.parent().index());
    		})
    		//console.log(tdCount);
    		//console.log(minCol + ":" + maxCol + ":" + minRow + ":" + maxRow);
    		var tdFirst = tds.first(), tdLast = tds.last();
    		var cols = 0,$td, rows = 0, $tmpTr;
    		cols += tdFirst.attr("colspan") ? parseInt(tdFirst.attr("colspan")) : 1;
    		$td = tdFirst.next();
    		while($td.size() && $td.hasClass("tdSelected")){
    			cols += $td.attr("colspan") ? parseInt($td.attr("colspan")) : 1;
    			$td = $td.next();
    		}
    		rows += tdFirst.attr("rowspan") ? parseInt(tdFirst.attr("rowspan")) : 1;
    		$tmpTr = tdFirst.parent().next();
    		var $firstTd = $tmpTr.find(">td:eq(0)");
    		var bottomH = tdLast.offset().top + tdLast.height();
    		while($firstTd.size() && ($firstTd.offset().top + $firstTd.height() <= bottomH)){
	    		$td = $tmpTr.find(">td.tdSelected:eq(0)");
    			if($td.size()  && $td.offset().left == tdFirst.offset().left)
    				rows += $td.attr("rowspan") ? parseInt($td.attr("rowspan")) : 1;
    			$tmpTr = $tmpTr.next();
    			$firstTd = $tmpTr.find(">td:eq(0)");
    		}
    		//console.log(cols + ":" + rows);
    		$(tds).each(function(n){
    			var $td = $(this);
    			if(n == 0){
    				$td.attr("colspan", cols);
    				$td.attr("rowspan", rows);
    				$td.removeClass("tdSelected");
    				$td.find("div.tdelement").each(function(){
    					var $this = $(this); 
    					$this.outerHeight($this.closest("td").height() + 1);
    				})
    			}else{
    				$td.remove();
    			}
    		});
		}
	}	    	
	
	/**
	** 普通表格开始
	**/
	var isDown = false, 
	isDragTd = false,
	lastPoint, changeEl, dropTable,
	formUtils = new FormUtils(),
	minTdHeight = 20, minTdWidth = 10,
	containerGroup = {},
	_DefaultGroupContainer = {
			helperLineClass : "helperline",
			dragAreaClass : "dragarea" ,
			rcMenuClass : "rcMenu",
			rcMenuoffset : {top : 5, left : 5},
			tolerance_resize : 2,
			tolerance_move : 5
		};

	//表格(td)控件开始
	var _defaultTdElementOptions = {}
	function TdElement(typeId, td, options){
		this.typeId = typeId;
		this.options = $.extend( {}, _defaultTdElementOptions, options);
		this.td = td;
		this.init();
	}
	TdElement.prototype = {
		init : function(){
			var elHtml
			switch(this.typeId){
			 	case "label":
			 		elHtml= "<div class='tdelement formelement_label' >标签</div>";
	   				break;	        			
	   			case "textbox":
        		case "numberic":
       				 elHtml  = "<div class='tdelement'><input type='text' class='tdInput'/></div>";
			 		break;
			 	case "textarea":
           			elHtml  = "<div class='tdelement'><textarea  class='tdInput'/></textarea></div>";
           			break;
  				case "datetime":
   				    elHtml  = "<div class='tdelement' style='position:relative'><input type='text' class='tdInput' readonly='readonly'/>";
   				    elHtml += "<i class='inner-right-btn icon-widget-datetime'></i>";
   				    elHtml += "</div>"; 
   				    break;
  				case "combobox":
    				elHtml  = "<div class='tdelement' style='position:relative'><input type='text' class='tdInput' readonly='readonly'/>";
    				elHtml += "<i class='inner-right-btn icon-ui-combobox'></i>";
    				elHtml += "</div>";
    				break;  
  				case "radiogroup" :
    				elHtml  = "<div class='tdelement radiogroup' style='position:relative'>";
    				elHtml += "<ul><li><i class='icon-blank'></i><span>选项1</span></li><li><i  class='icon-blank'></i><span>选项2</span></li></ul>";
    				elHtml += "</div>";
   					break;  
  				case "checkboxgroup":
   				    elHtml  = "<div class='tdelement checkgroup' style='position:relative'>";
   				    elHtml += "<ul><li><i class='icon-blank'></i><span>选项1</span></li><li><i class='icon-blank'></i><span>选项2</span></li><li><i class='icon-blank'></i><span>选项3</span></li></ul>";
   				    elHtml += "</div>";
   				default:
   					break;
			}
			if(elHtml){
   				var $newEl = $(elHtml);
   				//无法通过css:height%来限制高度
   				$newEl.outerHeight(this.td.height() + 1);
   				this.td.empty();
   				this.td.append($newEl);
   				this.el = $newEl;
				this.el.find(":text").add(this.el.find("textarea")).add(this.el.find("select")).focus(function(){
					 this.blur();
				})
			}
		}	
	}
	//表格(td)控件结束	
	function CommonTable(el, options){
    	this.el = el;
    	this.options = $.extend({}, _DefaultGroupContainer, options );
    	this.container = containerGroup[this.options.group];
    	this.el.on("mousemove", $.proxy(this.onMove, this));
    	this.el.on("mouseout", $.proxy(this.onOut, this));
    	this.el.on("mousedown", $.proxy(this.onDown, this));
    	this.el.on("mouseup", $.proxy(this.onUp, this));
	}
	CommonTable.prototype = {
    	onMove : function(e){
    		if(!isDown && !isDragTd){
	    		var target = e.srcElement || e.target
	    		,tagName = target.tagName.toLowerCase();
	    		if(tagName != "td" && tagName != "table" ){
	    			target = $(target).closest("td");
	    		}
	    		var offset = $(target).offset(), oldOffset = this.el.offset();
    			var w = $(target).width(), h = $(target).height();
    			offset.left += w; offset.top += h;
    			if( e.pageY - oldOffset.top <= this.options.tolerance_move && e.pageX - oldOffset.left <= this.options.tolerance_move){
    				this.el.css("cursor", "move");
    			}else if(offset.top - e.pageY <= this.options.tolerance_resize ){
    				this.el.css("cursor", "s-resize");
    			}else if( offset.left - e.pageX <= this.options.tolerance_resize ){
    				this.el.css("cursor", "e-resize");
    			}else{
    				this.el.css("cursor", "default");
	    		}
    		}
    	},
    	onOut : function(e){
    		var target = e.relatedTarget;
    		if(!isDown && target){
    			if(target.tagName.toLowerCase() == "div" || $(target).hasClass(this.options.rcMenuClass)){
    				this.container.container.css("cursor", "default");
    			}
    		}
    	},
    	onDown : function(e){
    		var target = e.srcElement || e.target;
    		if(e.which == 3){
    			//弹出右键菜单
    			var containerOffset =  this.container.container.offset();
    			$("#tableRcMenu").css("left" , (e.pageX - containerOffset.left - this.options.rcMenuoffset.left) + "px");
    			$("#tableRcMenu").css("top"  , (e.pageY - containerOffset.top - this.options.rcMenuoffset.top) + "px");
    			$("#tableRcMenu").show();
    			$("#tableRcMenu").data("target", target);
    			//e.stopPropagation();
    			return;
    		}
    		$("#tableRcMenu").hide();
    		var resizeState = this.el.css("cursor");
    		var tagName = target.tagName.toLowerCase();
    		if(resizeState == "s-resize"){
    			if(tagName == "table"){
					changeEl = $(target).find(">tbody>tr:last");
    			}else if(tagName == "td"){
	    			changeEl = formUtils.getHorizontalTr(target);
    				target = $(target).closest("table");
    			}else{
	    			changeEl = formUtils.getHorizontalTr( $(target).closest("td"));
	    			if(!changeEl.size())return;
    				target = $(target).closest("table");
    			}
    			isDown = true;
    			lastPoint = {left : e.pageX, top : e.pageY};
    			var span=$("<div class='" + this.options.helperLineClass + "'></div>");
    			span.appendTo(this.container.container);
    			var offset = $(target).offset(), containerOffset = this.container.container.offset();
    			span.css("left", (offset.left - containerOffset.left) + "px");
    			span.css("width", $(target).width() + "px");
    			span.css("height",  "1px");
    			span.css("top", (e.pageY - containerOffset.top) +  "px");
    			this.container.container.css("cursor", resizeState);
    		}else if(resizeState == "e-resize"){
    			if(tagName == "table"){
					changeEl = $(target).find(">tbody>tr").find(">td:last");
    			}else if(tagName == "td"){
    				changeEl = $(target);
    			}else{
	    			changeEl = $(target).closest("td");
	    			if(!changeEl.size())return;
    			}
    			isDown = true;
    			lastPoint = {left : e.pageX, top : e.pageY};
    			var span=$("<div class='" + this.options.helperLineClass + "'></div>");
    			span.appendTo(this.container.container);
    			span.css("width", "1px");
    			var topTable = $(target).closest("table");
    			var offset = topTable.offset(), containerOffset = this.container.container.offset();
    			span.css("height", topTable.height() + "px");
    			span.css("left", ( e.pageX - containerOffset.left )+ "px");
    			span.css("top",  ( offset.top - containerOffset.top ) +  "px");
    			this.container.container.css("cursor", resizeState);
    		}else if(resizeState == "move"){
    			isDown = true;
    			changeEl = this.el;
    			lastPoint = {left : e.pageX, top : e.pageY};  
    			this.container.container.css("cursor", "move");
    		}else{
    			//拖拽区域;
    			isDragTd = true;
    			lastPoint = {left : e.pageX, top : e.pageY};
    			this.container.container.css("cursor", "default");
    		}
    	},
    	onUp : function(e){
    		this.el.css("cursor", "default");
    	}
	}
	// 普通表格结束
	
	
	/**
	** 容器对象
	**/
	function TableContainer(container, options){
		this.container = container;
		this.options = $.extend({}, _DefaultGroupContainer, options);
		if(this.options.drop){
			containerGroup[this.options.group] = this;
		}
		this.initRcMenu();
		this.container.on("mousemove", $.proxy(this.onMove, this));
		this.container.on("mouseup", $.proxy(this.onMouseUp,  this));
		this.container.on("mouseout", $.proxy(this.onOut,  this));
		this.container.on("click" , $.proxy(this.onClick, this));
		//window事件
		$(window).on("mouseout", $.proxy(this.onWindowOut, this));
	}
	TableContainer.prototype = {
		initRcMenu : function(){
	    	//添加右键菜单
	    	var tableRcMenu = $("#tableRcMenu");
			if(!tableRcMenu.size()){
				var tableRcMenu = $("<div class=\"" + this.options.rcMenuClass + "\" id=\"tableRcMenu\">"
							+"<ul>"
							+"<li id=\"mergeTd\">合并单元格</li>"
							+"<li id=\"insertRow\">插入行</li>"
							+"<li id=\"addColumn\">插入列</li>"
							+"<li id=\"clearTd\">清除内容</li>"
							+"</ul>"
							+"</div>");
				this.container.append(tableRcMenu);
				document.oncontextmenu = function(){return false;};
				this.container.click(function(){
					tableRcMenu.hide();
		    	})
		    	var that = this;
		    	tableRcMenu.find("li").click(function(){
		    		var target = tableRcMenu.data("target");
		    		if(target.tagName.toLowerCase() != "td"){
		    			target = $(target).closest("td");
		    		}else{
		    			target = $(target)
		    		}
		    		if(!target || !target.size())return
		    		var $li = $(this);
		    		switch($li.attr("id")){
		    			case "mergeTd":
		    				formUtils.mergeTd(target);
		    				break;
		    			case "insertRow":
		    				formUtils.addRow(target);
		    				break;
		    			case "addColumn":
		    				formUtils.addColumn(target);
		    				break;
		    			case "clearTd":
		    				target.empty();
		    				break;
		    			default : break;
		    		}
		    	});		
				tableRcMenu.on("mouseleave", $.proxy(that.menuLeave, that))
			}					
		},
		menuLeave : function(e){
			this.container.css("cursor", "default");
			$("#tableRcMenu").hide();
		},
		onMove : function(e){
    		var target = e.srcElement || e.target;
    		var tagName = target.tagName.toLowerCase();
    		if(isDragTd){
    			var dragDiv = $("div." + this.options.dragAreaClass);
    			var containerOffset = this.container.offset();
    			if(!dragDiv.size()){
	    			dragDiv=$("<div class='" + this.options.dragAreaClass + "'></div>");
	    			dragDiv.appendTo(this.container);
	    			dropTable = $(target).closest("table");
	    			dropTable.find(".tdSelected").removeClass("tdSelected");
    			}
    			var dx = e.pageX - lastPoint.left;
    			var dy = e.pageY - lastPoint.top;
    			dx < 0 ? dragDiv.css("left", parseInt(lastPoint.left + dx  -  containerOffset.left) + "px") : dragDiv.css("left", (lastPoint.left -  containerOffset.left)+ "px");
    			dy < 0 ? dragDiv.css("top", parseInt(lastPoint.top + dy - containerOffset.top) + "px") : dragDiv.css("top", (lastPoint.top - containerOffset.top) + "px");
    			dragDiv.width(Math.abs(dx));
    			dragDiv.height(Math.abs(dy));
    		}else if(isDown){
    			var spanLine = $("." + this.options.helperLineClass);
    			var offset = spanLine.offset();
	    		var resizeState = this.container.css("cursor");
	    		if(resizeState == "s-resize"){
	    			spanLine.offset({top : e.pageY, left : offset.left});
	    		}else if(resizeState == "e-resize"){
	    			spanLine.offset({top : offset.top, left : e.pageX});
	    		}else if(resizeState == "move"){
	    			//移动
	    			var dx = e.pageX - lastPoint.left;
	    			var dy = e.pageY - lastPoint.top;
	    			var nowOffset = changeEl.position();
	    			changeEl.css("top", nowOffset.top + dy + "px")
	    			changeEl.css("left", nowOffset.left + dx + "px")
	    			lastPoint = {left : e.pageX, top : e.pageY};
	    		}
    		}
    	},
    	onMouseUp : function(e){
    		if(isDown){
	    		isDown = false;
	    		$("." + this.options.helperLineClass ).remove();
	    		var resizeState = this.container.css("cursor");
	    		var dx = e.pageX - lastPoint.left;
	    		var dy = e.pageY - lastPoint.top;
	    		if(resizeState == "s-resize"){
	    			formUtils.changeTdHorizontal(changeEl, dy);
	    		}else if(resizeState == "e-resize"){
	    			//console.log(dx +":" + oldW + ", changeEl" + changeEl.html());
	    			formUtils.changeTdVertical(changeEl, dx);
	    			//changeEl.data("oldWidth", oldW);
	    		}
	    		chanegeEl = null;
	    		this.container.css("cursor", "default");
    		}else if(isDragTd){
    			isDragTd = false;
				var tdArray = [],
				dragArea = $("."  + this.options.dragAreaClass);
    			$(dropTable).find(">tbody>tr>td").each(function(){
    				var $td = $(this), x1, x2;
    				x2 = {x : $td.offset().left, y : $td.offset().top, w : $td.width(), h : $td.height()};
    				x1 = {x :  Math.min(lastPoint.left , e.pageX) , y : Math.min(lastPoint.top , e.pageY), w : Math.abs(e.pageX - lastPoint.left), h :  Math.abs(e.pageY - lastPoint.top)};
    				if(_intersects(x1, x2)){
    					tdArray.push(this);
    				}
    			})
    			if(tdArray.length >1){
    				$(tdArray).addClass("tdSelected");
    			}else if(tdArray.length == 1){
    				//在td内画控件
    				if(dragArea.width() * dragArea.height() * 1.000 >= 0.3333 * $(tdArray[0]).width() * $(tdArray[0]).height()){
        				var getTypeId = (this.options.getCurTypeId || function(){return ""})();
        				new TdElement(getTypeId, $(tdArray[0]), {});
    				}
    			}
    			dropTable = null;
    			dragArea.remove();
    		}
    	},
    	onOut : function(e){
    		
    	},
    	onWindowOut : function(e){
			if(isDown && !e.relatedTarget){
	    		isDown = false;
	    		$("." + this.options.helperLineClass).remove();
			}else if(isDragTd && !e.relatedTarget){
				isDragTd = false;
	    		$("." + this.options.dragAreaClass).remove();
			}
    	},
    	onClick : function(e){
    		var dragDiv = $("<div class='" + this.options.dragAreaClass + "'></div>");
    		this.container.find("td.tdSelected").removeClass("tdSelected");
    	}
	}
    	
	//容器对象结束
	


	//自定义插件--普通表格
	$.fn["CommonTable"] = function(methodOrOptions){
		return this.map(function(){
			var $this = $(this),
			$data = $this.data("commonTable");
			if(!$data){
			    $this.data("commonTable", new CommonTable($this, methodOrOptions))
			}
			return this;
		})
	}
	//自定义插件--容器
	$.fn["TableContainer"] = function(methodOrOptions){
		return this.map(function(){
			var $this = $(this),
			$data = $this.data("TableContainer");
			if(!$data)
			    $this.data("TableContainer", new TableContainer($this, methodOrOptions))
			return this;
		})
	}	    	
}(jQuery, window)