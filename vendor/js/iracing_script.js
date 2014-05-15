/*

iracing_script.js

Copyright (c) 2007 iRacing.com Motorsport Simulations, LLC.   All Rights Reserved.

@author Amy Winter/Scott Nash
*/


// iracing_script.js
/******************************************************************************************************

GLOBALS:
-------
fsTimer
xmlDoc
menu
navid
active_dropdown_navsubs
active_dropdown_navitem
addbreadcrumb
activepopup
systemversions
race_button_open
test_button_open
race_button_closed
test_button_closed
instructionWin
*******************************************************************************************************/
/*  If Firebug is not installed, then define it's methods so debug statements do not break a page using them */
if(!window.console){
	var console={
		log:function(){return false;}
		,debug:function(){return false;}
		,info:function(){return false;}
		,warn:function(){return false;}
		,error:function(){return false;}
		,assert:function(){return false;}
		,dir:function(){return false;}
		,dirxml:function(){return false;}
		,trace:function(){return false;}
		,group:function(){return false;}
		,groupCollapsed:function(){return false;}
		,groupEnd:function(){return false;}
		,time:function(){return false;}
		,timeEnd:function(){return false;}
		,profile:function(){return false;}
		,profileEnd:function(){return false;}
		,count:function(){return false;}
	};
}


var hostname = window.location.hostname;


var IRACING={
	listings:{}
	,msgs:{}
	,constants:{}
	,UI:{}
	,id2var:function(a){
		if(a.nodeType==1 && a.id)IRACING.UI[a.id]=a;
		var nodes=a.childNodes;
		for(var i=0,ilen=nodes.length;i<ilen;i++)arguments.callee(nodes[i]);
	}
	//,XHR_load:function(file,handler,varsobj){
	//	var req=new XMLHttpRequest();
	//	var method="GET";
	//	if(varsobj){
	//		method="POST";
	//		var data=[];
	//		for(var each in varsobj)data.push(escape(each)+"="+escape(varsobj[each]));
	//		data=data.join("&");
	//		req.open(method,file);
	//		req.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
	//	}else{
	//		req.open(method,file);
	//	}
	//	req.onreadystatechange=handler;
	//	req.send(data);
	//}
	,script_GET:function(obj,id,src,handler){
		if(obj)obj=null;
		if(el(id))document.getElementsByTagName("head")[0].removeChild(el(id));
		var _s=document.createElement("script");
		_s.type="text/javascript";
		_s.id=id;
		_s.src=src;
		if(document.all){
			_s.onreadystatechange = function(){if(this.readyState=="loaded"||this.readyState=="complete")handler();};
		}else{
			_s.addEventListener("load",handler,false);
			_s.addEventListener("error",handler,false);
		}
		document.getElementsByTagName("head")[0].appendChild(_s);
	}
	,create_confirm:function(data,left,top,isLeft,isTop){
		var popup=element("div",{},{width:data.width,zIndex:"1000",position:"absolute",left:left+"px",top:top+"px"});
			var content=popup.appendChild(element("div",{className:"popup"},{width:data.width,backgroundColor:data.bg,padding:"5px"}));
				content.appendChild(element("div",{innerHTML:data.msg}));
				var buttons=content.appendChild(element("div",{},{padding:"5px 0px",margin:"5px auto 0px",textAlign:"center"}));
					buttons.appendChild(element("a",{innerHTML:"Ok",href:"javascript:IRACING.popup.remove_popup()()",onclick:data.ok_func,className:"btn_enabled"},{marginRight:"2px"}));
					buttons.appendChild(element("a",{innerHTML:"Cancel",href:"javascript:IRACING.popup.remove_popup()()",className:"btn_enabled"}));
		if(isLeft)content.style.left="0px";
		else content.style.right="0px";
		if(isTop)content.style.top="0px";
		else content.style.bottom="0px";
		return popup;
	}
	,popup:{
		popuptimer:null
		,popuptimerover:null
		,activepopup:{popup:null,layernode:null}
		,getOffsets:function(a){
			var left=a.offsetLeft,top=a.offsetTop,b=a;
			while(b=b.offsetParent){left+=b.offsetLeft;top+=b.offsetTop;}
			return {left:left,top:top};
		}
		,create_popup_onclick:function(data,layernode,func,displayOne,left,top,isLeft,isTop){
			var offsets=this.getOffsets(layernode);
			offsets.left+=left;
			offsets.top+=top;
			var appendnode=document.body;
			var popup=func(data,offsets.left,offsets.top,isLeft,isTop);
			if(displayOne){
				if(this.popuptimer)clearTimeout(this.popuptimer);
				if(this.popuptimerover)clearTimeout(this.popuptimerover);
				if(this.activepopup.popup){
					appendnode.removeChild(this.activepopup.popup);
					this.activepopup.popup=null;
					this.activepopup.layernode=null;
				}
				this.activepopup.popup=popup;
				this.activepopup.layernode=layernode;
			}
			appendnode.appendChild(popup);
		}
		,create_popup:function(data,layernode,func,left,top,isLeft,isTop,remove_onmouseout){
			var that=this;
			return function(){
				var offsets=that.getOffsets(layernode);
				offsets.left+=left;
				offsets.top+=top;
				var appendnode=document.body;
				if(that.popuptimer)clearTimeout(that.popuptimer);
				that.popuptimerover=setTimeout(function(){
						if(that.activepopup.popup){
							if(that.activepopup.popup==layernode){
								return;
							}else{
								appendnode.removeChild(that.activepopup.popup);
								that.activepopup.popup=null,that.activepopup.layernode=null;
							}
						}

						appendnode.appendChild(that.activepopup.popup=func(data,offsets.left,offsets.top,isLeft,isTop,remove_onmouseout));
						that.activepopup.popup.onmouseover=function(){
							if(that.popuptimer)clearTimeout(that.popuptimer);
						};
						that.activepopup.layernode=layernode;
				},200);
			};
		}
		,remove_popup:function(){
			var that=this;
			return function(e){
				//var toElement=window.event?window.event.toElement:e.relatedTarget;
				if(that.popuptimerover)clearTimeout(that.popuptimerover);
				that.popuptimer=setTimeout(function(){
						if(that.activepopup && that.activepopup.popup){
							document.body.removeChild(that.activepopup.popup);
							that.activepopup.popup=null;
							that.activepopup.layernode=null;
						}
				},200);
			};
		}
	}
};
function writeDocument(s){document.write(s);}
var systemversions=null;
var downloadstatus=null;
var replaydata=null;
var joinurl=null;
var calendar_icon=contextpath+"/images/icons/calendar_icon.gif";
var	overallUpdateRequired=0;
var	overallUpdateAvailable=0;
var fsTimer;
var newWin=null;
var img_arrow_green=imageserver+contextpath+"/images/member/arrow_green.gif";
var customer_support_tel="781-271-1900";
var chathref;
var update_series_addtocart_targets;
var addtocart_arr;
var GET_limit=2048;//as per IE
//window.onerror=function(){return true;};
/*==================== PROTOTYPES ====================*/
Array.prototype.indexOf=function(a){var index=-1;for(var i=this.length;i--;)if(this[i]==a){index=i;break;}return index;}
Array.prototype.objIndexOf=function(a,b){var index=-1;for(var i=this.length;i--;)if(this[i]&&(this[i][b]==a)){index=i;break;}return index;}

// define the following prototypes for IE emulation in Mozilla
if(!document.all){
/*
Event.prototype.__defineGetter__("srcElement", function () {
   var node=this.target;
   while(node.nodeType!=1)node=node.parentNode;
   return node;
});
*/
Event.prototype.__defineSetter__("cancelBubble", function (b) {
   if(b)this.stopPropagation();
});
Event.prototype.__defineGetter__("fromElement", function () {
   var node;
   if(this.type=="mouseover")node=this.relatedTarget;
   else if(this.type=="mouseout")node=this.target;
   else return null;
   while(node.nodeType!=1)node=node.parentNode;
   return node;
});

Event.prototype.__defineGetter__("toElement", function () {
   var node;
   if(this.type=="mouseout")node=this.relatedTarget;
   else if(this.type=="mouseover")node=this.target;
   else return null;
   while(node.nodeType!=1)node=node.parentNode;
   return node;
});

HTMLElement.prototype.__defineGetter__("currentStyle", function(){
	return this.ownerDocument.defaultView.getComputedStyle(this,null);
});
}

Date.prototype.formatUTCdate=function(){
	var d={};
	d.year=this.getUTCFullYear();
	d.month=this.getUTCMonth()+1;
	d.day=this.getUTCDate();
	d.hour=this.getUTCHours();
	d.minutes=this.getUTCMinutes();
	d.seconds=this.getUTCSeconds();
	if(d.month<10)d.month="0"+d.month;
	if(d.day<10)d.day="0"+d.day;
	if(d.hour<10)d.hour="0"+d.hour;
	if(d.minutes<10)d.minutes="0"+d.minutes;
	if(d.seconds<10)d.seconds="0"+d.seconds;
	return d;
}
Date.prototype.formatLocalSelectDate=function(excludeYear){
	var d={};
	d.year=this.getFullYear();
	d.month=this.getMonth()+1;
	d.day=this.getDate();
	d.hour=this.getHours();
	d.minutes=this.getMinutes();
	d.seconds=this.getSeconds();
	if(d.month<10)d.month="0"+d.month;
	if(d.day<10)d.day="0"+d.day;
	if(d.hour<10)d.hour="0"+d.hour;
	if(d.minutes<10)d.minutes="0"+d.minutes;
	if(d.seconds<10)d.seconds="0"+d.seconds;

	if (excludeYear) {
		return d.month+"-"+d.day;
	}
	return d.year+"-"+d.month+"-"+d.day;

}
Date.prototype.formatLocalTime=function(a){
	var d={};
	var ampm=" am";
	d.hour=this.getHours();
	if(d.hour>=12)ampm=" pm";
	if(d.hour>12)d.hour=d.hour-12;
	if(d.hour==0)d.hour=12;

	d.minutes=this.getMinutes();
	if(a)if(d.hour<10)d.hour="0"+d.hour;
	if(d.minutes<10)d.minutes="0"+d.minutes;
	return d.hour+":"+d.minutes+ampm;
}
Date.prototype.formatUTCTime=function(){
	var d={};
	d.hour=this.getUTCHours();
	d.minutes=this.getUTCMinutes();
	if(d.hour<10)d.hour="0"+d.hour;
	if(d.minutes<10)d.minutes="0"+d.minutes;
	return d.hour+":"+d.minutes;
}
Date.prototype.formatUTCTimeHMS=function(){
	var d={};
	d.hour=this.getUTCHours();
	d.minutes=this.getUTCMinutes();
	d.seconds=this.getUTCSeconds();
	if(d.hour<10)d.hour="0"+d.hour;
	if(d.minutes<10)d.minutes="0"+d.minutes;
	if(d.seconds<10)d.seconds="0"+d.seconds;
	return d.hour+":"+d.minutes+":"+d.seconds;
}
Date.prototype.formatLocalTime2=function(){
	var d={};
	var ampm="a";
	d.hour=this.getHours();
	if(d.hour>=12)ampm="p";
	if(d.hour>12)d.hour=d.hour-12;
	if(d.hour==0)d.hour=12;

	d.minutes=this.getMinutes();
	if(d.minutes<10)d.minutes="0"+d.minutes;
	return d.hour+":"+d.minutes+ampm;
}
Date.prototype.formatLocalSelectDateYY=function(){
	var d={};
	d.year=this.getFullYear() - 2000;
	d.month=this.getMonth()+1;
	d.day=this.getDate();
	if (d.year < 10) {
		d.year = "0" + d.year;
	}
	if(d.month<10)d.month="0"+d.month;
	if(d.day<10)d.day="0"+d.day;
	return d.year+"-"+d.month+"-"+d.day;

}


/*========================== GENERIC SORT FOR OBJECT ARRAYS ===================*/
function sortByProp(prop){
	return function(a,b){
		if (a[prop]<b[prop])return -1;
		else if(a[prop]>b[prop])return 1;
		else return 0;
	};
}

/*========================== GET DOM OFFSETS ============================*/
function getOffsets(a){
	var left=a.offsetLeft,top=a.offsetTop,b=a;
	while(b=b.offsetParent){left+=b.offsetLeft;top+=b.offsetTop;}
	return {left:left,top:top};
}
/*=========================== NAME UTILS ==========================*/
function acronym(a){
	var a=a.split(" ");
	for(var i=0;i<a.length;i++)a[i]=a[i].substr(0,1);
	return a.join("");
}
function abbrevName(a){
	a=a.split(" ");
	var name=a.shift().substr(0,1)+". ";
	for(j=a.length;j--;)if(a[j].length==1)a[j]+=".";
	return name+=a.join(" ");
}

/*=========================== LAP TIME CONVERSION ==============*/
function getTimeFromMilliseconds(time){
	var hours=Math.floor(time/(3600*10000));
	time=time-hours*3600*10000;
	var min=Math.floor(time/(60*10000));
	time=time-min*60*10000;
	var secs=Math.floor(time/10000);
	time=time-secs*10000;
	var tenths=Math.floor(time/1000);
	time=time-tenths*1000;
	var hun=Math.floor(time/100);
	time=time-hun*100;
	var thous=Math.floor(time/10);
	if(hours)hours+=":";else hours="";
	if(min<10)min="0"+min;
	if(secs<10)secs="0"+secs;
	return hours+min+":"+secs+"."+tenths+hun+thous;
}

// ******************  Check for local service ***********
function httpserver_missing(missingloc){
	document.location.href=missingloc;
}
// ******************  AJAX  ********************
function load(file,varsobj,handler,args){
	var synch=false;
	var req=window.ActiveXObject?new ActiveXObject("Microsoft.XMLHTTP"):new XMLHttpRequest();

	if(handler){
		req.onreadystatechange=handler(req,args);
		synch=true;
	}
	if(!varsobj)varsobj={a:null};
	req.open("post",file,synch);
	var vars=[];
	//for(var each in varsobj)vars.push(escape(each)+"="+escape(varsobj[each]));
	for(var each in varsobj)vars.push(escape(each)+"="+escape(varsobj[each]));
	vars=vars.join("&");
	req.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
	req.send(vars);
	if(!handler)return req.responseText;
}


//document.domain = "127.0.0.1";
function loadGetCrossDomain(file,varsobj,handler,args){
	var synch=false;
	var req=window.ActiveXObject?new ActiveXObject("Microsoft.XMLHTTP"):new XMLHttpRequest();

	if (typeof XDomainRequest != "undefined") {
	    // XDomainRequest for IE.
		 req = new XDomainRequest();
	}
	if(handler){
		req.onreadystatechange=handler(req,args);
		synch=true;
	}
	if(!varsobj)varsobj={a:null};
	var vars=[];
	for(var each in varsobj)vars.push(escape(each)+"="+escape(varsobj[each]));
	vars=vars.join("&");
	req.open("get",file+"?"+vars,synch);
	req.send(null);
	if(!handler)return req.responseText;
}


//document.domain = "127.0.0.1";
function loadGet(file,varsobj,handler,args){
	var synch=false;
	var req=window.ActiveXObject?new ActiveXObject("Microsoft.XMLHTTP"):new XMLHttpRequest();


	if(handler){
		req.onreadystatechange=handler(req,args);
		synch=true;
	}
	if(!varsobj)varsobj={a:null};
	var vars=[];
	for(var each in varsobj)vars.push(escape(each)+"="+escape(varsobj[each]));
	vars=vars.join("&");
	req.open("get",file+"?"+vars,synch);
	req.send(null);
	if(!handler)return req.responseText;
}

function loadAJAX(file,varsobj,handler){
	var vars=[];
	for(var each in varsobj)vars.push(escape(each)+"="+escape(varsobj[each]));
	vars=vars.join("&");
	var req=window.ActiveXObject?new ActiveXObject("Microsoft.XMLHTTP"):new XMLHttpRequest();

	req.onreadystatechange=handler(req);
	req.open("post",file,true);
	req.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
	req.send(vars);
}


// ******************  DOM UTILS *******************
function el(a){return document.getElementById(a);}
function nolink(){}
function menunolink(){window.location.reload();}
function element(a,b,c){
    var e=document.createElement(a);
    for(var d in b)
	e[d]=b[d];
    var s=e.style;
    for(d in c)
	s[d]=c[d];
    return e;
}
function imgpreload(src,node,className,setdims){
	var img=new Image();
	img.src=src;
	if(className)img.className=className;
	var si=setInterval(function(){
		if(img.width){
			clearInterval(si);
			node.appendChild(img);
			if(setdims){
				node.style.width=img.width+"px";
				node.style.height=img.height+"px";
			}
		}
	},15);
}
function removeOptions(n){if (!n) return;var c=n.childNodes;while(c.length)n.removeChild(c[c.length-1]);}
function set_node_null(a){
	//comment out for now.  Chrome/WebKit browsers don't like the null assignment using hasOwnProperty
	/*
	var childnodes=a.childNodes;
	for(var i=0,ilen=childnodes.length;i<ilen;i++){
		var node=childnodes[i];
		for(var j in node){
			if(node.hasOwnProperty){
				if(node.hasOwnProperty(j))node[j]=null;
			}else{
			}
		}
		if(node.childNodes.length)set_node_null(node);
		node=null;
	}
	*/
}
/*============================== COLOR CONTRAST =============================*/
var colorcontrast={};
colorcontrast.wr=parseInt("#ffffff".substring(1,3),16);
colorcontrast.wg=parseInt("#ffffff".substring(3,5),16);
colorcontrast.wb=parseInt("#ffffff".substring(5),16);
colorcontrast.br=parseInt("#000000".substring(1,3),16);
colorcontrast.bg=parseInt("#000000".substring(3,5),16);
colorcontrast.bb=parseInt("#000000".substring(5),16);
function find_max_contrast(a){
	var choosewhite=0,chooseblack=0;
	var r=parseInt(a.substring(1,3),16);
	var g=parseInt(a.substring(3,5),16);
	var b=parseInt(a.substring(5),16);
	var contrast_white=Math.max(colorcontrast.wr,r)-Math.min(colorcontrast.wr,r)+Math.max(colorcontrast.wg,g)-Math.min(colorcontrast.wg,g)+Math.max(colorcontrast.wb,b)-Math.min(colorcontrast.wb,b);
	var contrast_black=Math.max(colorcontrast.br,r)-Math.min(colorcontrast.br,r)+Math.max(colorcontrast.bg,g)-Math.min(colorcontrast.bg,g)+Math.max(colorcontrast.bb,b)-Math.min(colorcontrast.bb,b);
	var bright_white=Math.abs((r*299+g*587+b*114)/1000-(colorcontrast.wr*299+colorcontrast.wg*587+colorcontrast.wb*114)/1000);
	var bright_black=Math.abs((r*299+g*587+b*114)/1000-(colorcontrast.br*299+colorcontrast.bg*587+colorcontrast.bb*114)/1000);
	if(bright_white>bright_black)choosewhite++;else chooseblack++;
	if(contrast_white>contrast_black)choosewhite++;else chooseblack++;
	var textcolor="#000000";
	if(choosewhite>chooseblack)textcolor="#ffffff";
	return textcolor;
}
//================================ PANEL ANIMATION ==========================*/
function findTarget(e){
	var target;
	if(window.event && window.event.srcElement){
		target=window.event.srcElement;
		//window.event.cancelBubble = true;
	}else if(e && e.target){
		target=e.target;
  	//e.stopPropagation();
	}
	if(!target)return null;
	while(target!=document.body && target.nodeName.toLowerCase()!="a")target=target.parentNode;
	if(target.nodeName.toLowerCase()!="a")return null;
	return target;
}
function mouseover(e){
	var target=findTarget(e);
	if(!target)return;
	var imgnode=target.childNodes[0];
	imgnode.src=imgnode.src.replace(/(\.[^.]+)$/,"_hover$1");
}
function mouseout(e){
	var target=findTarget(e);
	if(!target)return;
	var imgnode=target.childNodes[0];
	imgnode.src=imgnode.src.replace(/_hover(\.[^.]+)$/,"$1");
}
var race_button_closed=element("a",{id:"race_button"},{display:"inline"});
var test_button_closed=element("a",{id:"test_button"},{display:"inline"});
var race_button_open=element("a",{id:"race_button"},{display:"inline"});
var test_button_open=element("a",{id:"test_button"},{display:"inline"});
//var race_button_flash=element("a",{id:"race_button"});
//var test_button_flash=element("a",{id:"test_button"});
/* Fixing Integration Issue */
function init_racetest_buttons(){
	//imgpreload(imageserver+"/member_images/buttons/race_button_closed.png",race_button_closed,"navitem_racetest");
	race_button_closed.href="javascript:changepanel('racingpanel')";
	race_button_closed.style.backgroundImage="url('"+imageserver+"/member_images/buttons/race_button_sprite.png')";
	//imgpreload(imageserver+"/member_images/buttons/test_button_closed.png",test_button_closed,"navitem_racetest");
	test_button_closed.href="javascript:changepanel('testingpanel')";
	test_button_closed.style.backgroundImage="url('"+imageserver+"/member_images/buttons/test_button_sprite.png')";
	//imgpreload(imageserver+"/member_images/buttons/race_button_open.png",race_button_open,"navitem_racetest");
	race_button_open.href="javascript:changepanel('racingpanel')";
	race_button_open.style.backgroundImage="url('"+imageserver+"/member_images/buttons/race_button_sprite.png')";
	//imgpreload(imageserver+"/member_images/buttons/test_button_open.png",test_button_open,"navitem_racetest");
	test_button_open.href="javascript:changepanel('testingpanel')";
	test_button_open.style.backgroundImage="url('"+imageserver+"/member_images/buttons/test_button_sprite.png')";
	//imgpreload(imageserver+"/member_images/buttons/race_button_flash.gif",race_button_flash,"navitem_racetest");
	//imgpreload(imageserver+"/member_images/buttons/test_button_flash.gif",test_button_flash,"navitem_racetest");
}
function changepanel(a){
	var testingpanel=el("testingpanel");
	var racepanel=el("racingpanel");
	var state=Get_Cookie("panelstate");
	if(!state)slide_out(a);
	else {
		if(a=="testingpanel"){
			if(state==6 || state==4)slide_in(a);
			else slide_out(a);
		}else{
			if(state==2 || state==3 || state==7)slide_in(a);
			else slide_out(a);
		}
	}
}
function showpanel(){
	el("testingpanel").style.zIndex="1";
	el("racingpanel").style.zIndex="2";
	var state=Get_Cookie("panelstate");
	Set_Cookie("panelstate",state | 1);
}
function slide_out(a){
	var testingpanel=el("testingpanel");
	var racepanel=el("racingpanel");
	var state=Get_Cookie("panelstate");
	var maxheight;
	if(a=="testingpanel"){
		testingpanel.style.visibility="visible";
		maxheight=parseInt(testingpanel.currentStyle.height);
		testingpanel.style.zIndex="2";
		racepanel.style.zIndex="1";
		if(state & 16)state=state&~16;
		if(state & 1)state=state&~1;
		Set_Cookie("panelstate",state);
		if(state & 4)return;
		Set_Cookie("panelstate",state|4);
		test_button_closed.parentNode.replaceChild(test_button_open,test_button_closed);
	}else{
		racepanel.style.visibility="visible";
		maxheight=parseInt(racepanel.currentStyle.height);
		testingpanel.style.zIndex="1";
		racepanel.style.zIndex="2";
		if(state & 8)state=state&~8;
		Set_Cookie("panelstate",state=(state|1));
		if(state & 2)return;
		Set_Cookie("panelstate",state|2);
		race_button_closed.parentNode.replaceChild(race_button_open,race_button_closed);
	}

	var target=el(a);
	//var maxheight=target.offsetHeight;
	var top=0;
	var si=setInterval(function(){
		if(top<-(maxheight+8)){
			top=-(maxheight+8);
			target.style.top=top+"px";
			clearInterval(si);
		}else{
			target.style.top=top+"px";
			top-=10;
		}
	},15);
}
function slide_in(a){
	var testingpanel=el("testingpanel");
	var racepanel=el("racingpanel");
	var state=Get_Cookie("panelstate");
	var maxheight;
	if(a=="testingpanel"){
		maxheight=parseInt(testingpanel.currentStyle.height);
		test_button_open.parentNode.replaceChild(test_button_closed,test_button_open);
		Set_Cookie("panelstate",state&~5);

	}else{
		if(racingpaneldata.session)return;
		maxheight=parseInt(racepanel.currentStyle.height);
		race_button_open.parentNode.replaceChild(race_button_closed,race_button_open);
		Set_Cookie("panelstate",state&~3);
	}

	var target=el(a);
	//var maxheight=target.offsetHeight;
	var top=-(maxheight);
	var si=setInterval(function(){
		if(top>0){
			top=0;
			target.style.top=top+"px";
			clearInterval(si);
			//testingpanel.style.visibility="hidden";
			//racepanel.style.visibility="hidden";
		}else{
			target.style.top=top+"px";
			top+=10;
		}
	},15);
}
function checkpanelstate(){
	var state;
	init_racetest_buttons();
	var racenavbar=el("racenavbar");
	if(el("racenavbar"))racenavbar=el("racenavbar");
		var racetest=racenavbar.appendChild(element("div",{id:"navitem_controls"}));
	var racepanel=el("racingpanel");
	var testingpanel=el("testingpanel");
	if(state=Get_Cookie("panelstate")){
		if(state & 4){
			testingpanel.style.top="-"+(parseInt(testingpanel.currentStyle.height)+8)+"px";
			testingpanel.style.visibility="visible";
			racetest.appendChild(test_button_open);
		}else racetest.appendChild(test_button_closed);
		if(state & 2){
			racepanel.style.top="-"+(parseInt(racepanel.currentStyle.height)+8)+"px";
			racepanel.style.visibility="visible";
			racetest.appendChild(race_button_open);
		}else racetest.appendChild(race_button_closed);
		if((state & 3)==3){
			racepanel.style.zIndex="2";
			testingpanel.style.zIndex="1";
		}else {
			racepanel.style.zIndex="1";
			testingpanel.style.zIndex="2";
		}
		if(state & 8){
			window.onload=function(){
				slide_out("racingpanel");
			};
		}
		if(state & 16){
			window.onload=function(){
				slide_out("testingpanel");
			}
		}
	}else {
		racetest.appendChild(test_button_closed);
		racetest.appendChild(race_button_closed);
	}
}
// ******************************** POPUPS *********************************
var activepopup={popup:null,layernode:null};
var popuptimer=null;
var popuptimerover=null;
function cancelbubble(e){
	if(window.event)window.event.cancelBubble=true;
	else if(e)e.stopPropagation();
}


function popup_helmet(data,offsetleft,offsettop){
		var popup=element("div",{},{position:"absolute",width:"150px",height:"100px",top:offsettop+"px",left:offsetleft+"px",padding:"5px",backgroundColor:"white",border:"1px solid black",textAlign:"left"});
		var viewdriverlink=popup.appendChild(element("a",{innerHTML:"View Driver",href:contextpath+"/member/CareerStats.do?custid="+data.custid,className:"driverlink"}));
		var addfriendlink=popup.appendChild(element("div",{innerHTML:["Send Friend Request","Remove Friend","Revoke Friend Request", "Accept Friend Request"][data.friend],className:"driver_popup"}));

		switch(data.friend){
		case 0:
			addfriendlink.onclick=sendfriendrequest(data);
			break;
		case 1:
			addfriendlink.onclick=removefriend(data);
			break;
		case 2:
			addfriendlink.onclick=revokefriendrequest(data);
			break;
		case 3:
			addfriendlink.onclick=acceptfriendrequest(data);
			break;
		default:
		}
		//addfriendlink.onclick=addremovefriend(data);



		addfriendlink.onmouseover=function(e){this.className="driver_popup_hover"};
				addfriendlink.onmouseout=function(e){this.className="driver_popup"};
		var addwatchlink=popup.appendChild(element("div",{innerHTML:["Add Studied","Remove Studied"][data.watch],className:"driver_popup"}));
				addwatchlink.onclick=addremovewatch(data);
				addwatchlink.onmouseover=function(e){this.className="driver_popup_hover"};
				addwatchlink.onmouseout=function(e){this.className="driver_popup"};
		var pmlink=popup.appendChild(element("div",{innerHTML:"Private Message",className:"driver_popup"}));
			pmlink.onclick=sendjforumpm(data.custid);
			//pmlink.onclick=sendpm(data.displayName);
			pmlink.onmouseover=function(e){this.className="driver_popup_hover"};
			pmlink.onmouseout=function(e){this.className="driver_popup"};
		var forumprofilelink=popup.appendChild(element("div",{innerHTML:"Forum Profile",className:"driver_popup"}));
			forumprofilelink.onclick=visitjforumprofile(data.custid);
			forumprofilelink.onmouseover=function(e){this.className="driver_popup_hover"};
			forumprofilelink.onmouseout=function(e){this.className="driver_popup"};

		//Blacklist code that will hook into helmetPopups.js
		var blacklistlink = popup.appendChild(element("div", {
			innerHTML : ["Add to Blacklist","Remove from Blacklist"][(isBlacklisted(data.custid) ? 1 : 0)],
			className : "driver_popup"
		}));
		blacklistlink.id = "blink_" + data.custid;

		blacklistlink.onclick = blacklistMember(data.custid);

		if (isBlacklisted(data.custid)) {
			blacklistlink.onclick = whitelistMember(data.custid);
		}

		blacklistlink.onmouseover = function(e) {
			this.className = "driver_popup_hover"
		};
		blacklistlink.onmouseout = function(e) {
			this.className = "driver_popup"
		};


		return popup;
}

function popup_calendar(data,offsetleft,offsettop){
	var inputdate=data.date;
	var func=data.func;
	var months="January,February,March,April,May,June,July,August,September,October,November,December".split(",");
	var days="S,M,T,W,T,F,S".split(",");
 	var dayms=24*60*60*1000;
	var div=element("div",{},{position:"absolute",top:offsettop+"px",left:offsetleft+"px"});
	function rebuild_table(date){
		div.replaceChild(build_table(date),div.childNodes[0]);
		//func(date);
	}
	function build_table(date){
		var prevmonth,prevyear,nextmonth,nextyear;
		var today=new Date();
  	var datems=date.getTime();
  	var datemonth=date.getMonth();
  	//alert(today.getMonth()+" "+datemonth+" "+inputdate.getMonth());
		var dateyear=date.getFullYear();
		var dateday=date.getDate();
  	var firstday=new Date(datems-(date.getDate()-1)*24*60*60*1000);
		var firstdayms=firstday.getTime();
		var firstday=firstday.getDay();
		var prevmaxdays=new Date(new Date(dateyear,datemonth,1).getTime()-dayms).getDate();
		var nextmaxdays=new Date(new Date(dateyear,datemonth+2,1).getTime()-dayms).getDate();
		if(datemonth==0){
			prevmonth=11;
			prevyear=dateyear-1;
		}else{
			prevmonth=datemonth-1;
			prevyear=dateyear;
		}
		if(datemonth==11){
			nextmonth=0;
			nextyear=dateyear+1;
		}else{
			nextmonth=datemonth+1;
			nextyear=dateyear;
		}
		var prevdate=new Date();
		prevdate.setFullYear(prevyear,prevmonth,Math.min(prevmaxdays,dateday));
		var nextdate=new Date();
		nextdate.setFullYear(nextyear,nextmonth,Math.min(nextmaxdays,dateday));
	  	var table=element("table",{id:"datepicker"},{background:"#ffffff"});
			var tbody=table.appendChild(element("tbody"));
				var monthbar=tbody.appendChild(element("tr",{id:"monthbar"}));
					var prev=monthbar.appendChild(element("td",{innerHTML:"&lt;",className:"pointer"}));
					prev.onclick=function(){rebuild_table(prevdate);};
					var monthname=monthbar.appendChild(element("td",{innerHTML:months[date.getMonth()]+" "+date.getFullYear(),colSpan:"5",className:"center"}));
					var next=monthbar.appendChild(element("td",{innerHTML:"&gt;",className:"pointer"}));
					next.onclick=function(){rebuild_table(nextdate);};
				var row=tbody.appendChild(element("tr",{id:"daysbar"}));
					for(var i=0;i<days.length;i++)row.appendChild(element("td",{innerHTML:days[i],className:"center"}));
				row=tbody.appendChild(element("tr"));
				var i=0,j=0;
				while(j++<firstday)row.appendChild(element("td",{innerHTML:"&nbsp"}));
      			while(new Date(firstdayms+i*dayms).getMonth()==datemonth){
       				if(!((i+firstday)%7))row=tbody.appendChild(element("tr"));
					var datecelltd=row.appendChild(element("td"));
				  		var datecell=datecelltd.appendChild(element("div",{innerHTML:i+1,className:"datecell"}));
						if((date.getDate()-1)==i && datemonth==inputdate.getMonth())datecell.style.background="#888888",datecell.style.color="#ffffff";
						if((today.getDate()-1)==i && today.getMonth()==datemonth)datecell.style.border="1px solid black";
						datecell.onclick=function(){
							var newdate=new Date();
							newdate.setFullYear(dateyear,datemonth,parseInt(this.innerHTML));
							func(newdate);
						};
					i++;
				}
  		return table;
 	}
 	div.appendChild(build_table(inputdate));
 	return div;
}
function formatdate(y,m,d,func){
	return function(){
		if(m<10)m="0"+m;
		if(d<10)d="0"+d;
		func(y+"-"+m+"-"+d);
	};
}

function build_popup(data,layernode,func,left,top){
	return function(e){
		var appendnode=this;
		if(popuptimer)clearTimeout(popuptimer);
		popuptimerover=setTimeout(function(){
			if(activepopup.popup){
				if(activepopup.popup.parentNode==appendnode){
					return;
				}else{
					//reset zIndex of parentNode to reestablish the default stacking order context
					activepopup.layernode.style.zIndex="1";
					activepopup.popup.parentNode.removeChild(activepopup.popup);
					activepopup.popup=null,activepopup.layernode=null;
				}
			}

			appendnode.appendChild(activepopup.popup=func(data,left,top));
			activepopup.layernode=layernode;
			//set zIndex of parentNode to alter stacking context of rows so that popup always appears above rows
			layernode.style.zIndex="2";
		},200);
	}
}


function removepopup_notimer(){
	if(popuptimerover)clearTimeout(popuptimerover);
	if(activepopup.popup)activepopup.layernode.style.zIndex="1",activepopup.popup.parentNode.removeChild(activepopup.popup),activepopup.popup=null,activepopup.layernode=null;
}
function removepopup(){
	if(popuptimerover)clearTimeout(popuptimerover);
	//var appendnode=this;
	popuptimer=setTimeout(function(){if(activepopup.popup)activepopup.layernode.style.zIndex="1",activepopup.popup.parentNode.removeChild(activepopup.popup),activepopup.popup=null,activepopup.layernode=null},200);
}
/*
function addremovefriend(data){
	return function(){
		if(data.friend){
			var result=load(contextpath+"/member/RemoveFriend",{custid:data.custid});

			//alert("friend "+result+" "+data.friend+" "+data.custid);
			if(result=="1"){
				data.friend=0,this.innerHTML="Add Friend";
			}
		}else{
			var result=load(contextpath+"/member/AddFriend",{custid:data.custid});
			//alert("not friend "+result+" "+data.friend+" "+data.custid);
			if(result=="1"){
				data.friend=1,this.innerHTML="Remove Friend";
			}
		}
		if(data.friendspage){
			window.location.reload();
		}else if(data.reload){
			activepopup.popup=null,activepopup.layernode=null;
			data.reload.call(this);
		}else if(data.modify){
			data.modify(data);
		}
		else if (data.callback) {
			activepopup.popup=null,activepopup.layernode=null;
			data.callback(data);
		}
	}
}
*/

function sendfriendrequest(data){
	return function(){
	if(!data.friend){

		var result=load(contextpath+"/member/SendFriendRequest",{custid:data.custid});
		if(result==2){
			data.friend=2,this.innerHTML="Revoke Friend Request";
		}else if(result==4){
			alert("You cannot send this friend request. You already have the maximum number of allowed (friends + outbound friend requests).");
		}
	}
		if(data.friendspage){
			window.location.reload();
		}else if(data.reload){
			activepopup.popup=null,activepopup.layernode=null;
			data.reload.call(this);
		}else if(data.modify){
			data.modify(data);
		}
		else if (data.callback) {
			activepopup.popup=null,activepopup.layernode=null;
			data.callback(data);
		}
	}
}

function acceptfriendrequest(data){
	return function(){

		if(data.friend){
			var result=load(contextpath+"/member/AcceptFriendRequest",{custid:data.custid});
			if(result==1){
				data.friend=1,this.innerHTML="Remove Friend";
			}else if(result==4){
				alert("You cannot accept this friend request.  You already have the maximum number of allowed friends.");
			}
		}
			if(data.friendspage){
				window.location.reload();
			}else if(data.reload){
				activepopup.popup=null,activepopup.layernode=null;
				data.reload.call(this);
			}else if(data.modify){
				data.modify(data);
			}
			else if (data.callback) {
				activepopup.popup=null,activepopup.layernode=null;
				data.callback(data);
			}
		}
	}

function revokefriendrequest(data){
	return function(){
			if(data.friend){
				var result=load(contextpath+"/member/RevokeFriendRequest",{custid:data.custid});
				if(result==0){
					data.friend=0,this.innerHTML="Send Friend Request";
				}
			}
				if(data.friendspage){
					window.location.reload();
				}else if(data.reload){
					activepopup.popup=null,activepopup.layernode=null;
					data.reload.call(this);
				}else if(data.modify){
					data.modify(data);
				}
				else if (data.callback) {
					activepopup.popup=null,activepopup.layernode=null;
					data.callback(data);
				}
			}
}



function removefriend(data){

	return function(){

		if(data.friend){
			var result=load(contextpath+"/member/RemoveFriend",{custid:data.custid});

			if(result==0){
				data.friend=0,this.innerHTML="Send Friend Request";
			}
		}
		if(data.friendspage){
			window.location.reload();
		}else if(data.reload){
			activepopup.popup=null,activepopup.layernode=null;
			data.reload.call(this);
		}else if(data.modify){
			data.modify(data);
		}
		else if (data.callback) {
			activepopup.popup=null,activepopup.layernode=null;
			data.callback(data);
		}
	}
}


function addremovewatch(data){
	return function(){
		debugger;
		if(data.watch==1){
			var result=load(contextpath+"/member/RemoveWatched",{custid:data.custid});
			if(result=="1"){
				data.watch=0,this.innerHTML="Add Studied";
			}
		}else{
			var result=load(contextpath+"/member/AddWatched",{custid:data.custid});
			//alert("not watch "+result+" "+data.watch+" "+data.custid);
			if(result=="1") {
				data.watch=1,this.innerHTML="Remove Studied";
			}
		}
		if(data.watchpage){
			window.location.reload();
		}else if(data.reload){
			activepopup.popup=null,activepopup.layernode=null;
			data.reload.call(this);
		}else if(data.modify){
			data.modify(data);
		}
		else if (data.callback) {
			activepopup.popup=null,activepopup.layernode=null;
			data.callback(data);
		}
	}
}
function sendpm(displayName){
	return function(){
		var loc ="/iforum/pmpost!default.jspa?to="+escape(displayName);
 		top.newWin = window.open(loc, "forum", 'resizable=1, scrollbars=1, status=0,toolbar=0');
	  	newWin.focus();
  	}
}

function sendjforumpm(custid){
	return function(){
		var loc ="/jforum/pm/sendTo/"+custid+".page";
 		top.newWin = window.open(loc, "Jforum", 'resizable=1, scrollbars=1, status=0,toolbar=0');
	  	newWin.focus();
  	}
}

function sendleaguejforumpm(custid){
	var loc ="/jforum/pm/sendTo/"+custid+".page";
 	top.newWin = window.open(loc, "Jforum", 'resizable=1, scrollbars=1, status=0,toolbar=0');
	newWin.focus();
}



function visitjforumprofile(custid){
	return function(){
		var loc ="/jforum/user/profile/"+custid+".page";
 		top.newWin = window.open(loc, "Jforum", 'resizable=1, scrollbars=1, status=0,toolbar=0');
	  	newWin.focus();
  	}
}


function linkToForum(url) {
 	var loc = url;
  // 	top.newWin = window.open(loc, "Jforum");
    top.newWin = window.open(loc, "forum");
   	newWin.focus();
}



/*==================== NEW MENU NAV =========================*/
function hilite_navbar() {

	var matchSTR 	= new RegExp(navid,"gi");
	var returnSTR 	= true;
	if (matchSTR) {
		$(".simpleNav a").each(function() {
			var navHTML = $(this).text();
			if ( matchSTR.test(navHTML) ) {
				$(this).addClass("active");
				returnSTR = false;
			};
			return returnSTR;
		});
	};

}


//  ***************   IRACING COOKIE HANDLING FUNCTIONS   ******************
function Set_Cookie( name, value, expires, path, domain, secure )
{
// set time, it's in milliseconds
var today = new Date();
today.setTime( today.getTime() );

/*
if the expires variable is set, make the correct
expires time, the current script below will set
it for x number of days, to make it for hours,
delete * 24, for minutes, delete * 60 * 24
*/
if ( expires )
{
expires = expires * 1000 * 60 * 60 * 24;
}
var expires_date = new Date( today.getTime() + (expires) );

document.cookie = name + "=" +escape( value ) +
( ( expires ) ? ";expires=" + expires_date.toGMTString() : "" ) +
( ( path ) ? ";path=" + path : "" ) +
( ( domain ) ? ";domain=" + domain : "" ) +
( ( secure ) ? ";secure" : "" );
}


// this function gets the cookie, if it exists
function Get_Cookie( name ) {

var start = document.cookie.indexOf( name + "=" );
var len = start + name.length + 1;
if ( ( !start ) &&
( name != document.cookie.substring( 0, name.length ) ) )
{
return null;
}
if ( start == -1 ) return null;
var end = document.cookie.indexOf( ";", len );
if ( end == -1 ) end = document.cookie.length;
return unescape( document.cookie.substring( len, end ) );
}


// this deletes the cookie when called
function Delete_Cookie( name, path, domain ) {
if ( Get_Cookie( name ) ) document.cookie = name + "=" +
( ( path ) ? ";path=" + path : "") +
( ( domain ) ? ";domain=" + domain : "" ) +
";expires=Thu, 01-Jan-1970 00:00:01 GMT";
}


function resetCookieTimeout(name){
	if(Get_Cookie(name)){
			Set_Cookie(name,Get_Cookie(name), '4000', '/', '', '' );
	}
}


//********   Login Functions and Warnings ***************************

function submitLoginForm(){
	var thisForm = document.LOGIN;

	//Validate the Form
	if((thisForm.password.value=="") || (thisForm.username.value=="")){
		document.getElementById("alertauto").innerHTML="Please supply an email address and password.";
		return;
	}
	//Set an auto login cookie that will last for 10 years
	if(thisForm.AUTOLOGIN.checked){
		//Set_Cookie( 'autologin', thisForm.j_username.value+"~**~**~"+thisForm.j_password.value, '4000', '/', 'iracing.com', '' );
	}else{
		//Make sure the user does not have an autologin cookie
		Delete_Cookie('autologin2', '/','');
	}
	//Submit the login
	thisForm.submit();
}
function submitenter(myfield,e){
	var keycode;
	if (window.event) keycode = window.event.keyCode;
	else if (e) keycode = e.which;
	else return true;
	if (keycode == 13){
   		myfield.form.submit();
   		return false;
	}else return true;
}
function checkAutoLogin(){
	var thisForm = document.LOGIN;
	if(Get_Cookie( 'autologin' )){
		thisForm.AUTOLOGIN.checked=true;
		thisForm.submit();
	}
}
function checkFailedAutoLogin(){
	var thisForm = document.LOGIN;
	if(Get_Cookie( 'autologin' )){
		thisForm.AUTOLOGIN.checked=true;
		var login = Get_Cookie( 'autologin' );
		var loginname = login.substring(0,login.indexOf("~**~**~"));
		var loginpass = login.substring(login.indexOf("~**~**~")+7,login.length);
	}
}

/*function launchAutoLoginWarning(){
	var thisForm = document.LOGIN;
	var alertauto = el("alertauto");
	if(thisForm.AUTOLOGIN.checked)alertauto.innerHTML = "This will allow any user of this computer to access your account.";
	else alertauto.innerHTML = "&nbsp;";
}*/

function showFeedback() {
	var messageHeight = $('#feedbackMessage').height();
	$('#feedbackMessage').slideDown(400);
	$('#feedbackTop, #feedbackBottom').animate({height: '20'}, 400);
	$('#feedbackMiddle').animate({height: messageHeight}, 400);
}
function hideFeedback() {
	$('#feedbackMessage').slideUp(400);
	$('#feedbackTop, #feedbackBottom, #feedbackMiddle').animate({height: '0'}, 400);
}

function autoLoginWarning() {
	var thisForm = document.LOGIN;
	var feedbackMessage = document.getElementById('feedbackMessage');
	if(thisForm.AUTOLOGIN.checked) {
		if($('#feedback').children().hasClass('error' && 'errorTile')) {
			$('#feedbackTop, #feedbackBottom').removeClass('error');
			$('#feedbackMiddle').removeClass('errorTile');
			$('#feedbackTop, #feedbackBottom').addClass('warning');
			$('#feedbackMiddle').addClass('warningTile');
		}
		if($('#feedback').children().hasClass('facebook' && 'facebookTile')) {
			$('#feedbackTop, #feedbackBottom').removeClass('facebook');
			$('#feedbackMiddle').removeClass('facebookTile');
			$('#feedbackTop, #feedbackBottom').addClass('warning');
			$('#feedbackMiddle').addClass('warningTile');
		}
	 	feedbackMessage.innerHTML = '<p>Allows any user of this computer to access your account.</p>';
		showFeedback();
	} else {
		hideFeedback();
	}
}

function checkField() {
	var email = document.forms[0].elements[0];
	var password = document.forms[0].elements[1];

	if(email.value != 0) {
		$(email).removeClass('username');
	} else {
		$(email).addClass('username');
	}
	if(password.value != 0) {
		$(password).removeClass('password');
	} else {
		$(password).addClass('password');
	}
}

function hideForm() {
	$('#content').fadeTo(500, 0.01, function() {
		$(this).slideUp(500, function() {
			$(this).remove();
		});
	});
	showFeedback();
}

//***************   Date-Time Functions ********************
function getDateTime(millisecs){
	var d = new Date(millisecs);
	return d;
}

function getDateAndTime(millisecs){
	return getDate(millisecs)+ " <BR>" + getTime(millisecs);
}

function getDate(millisecs){
	var d = new Date(millisecs);
	var Month = "";
	return d.getMonth()+1 +"/"+d.getDate()+"/"+d.getFullYear();
}

function getTime(millisecs){
	var ampm=" a.m.";
	var d = new Date(millisecs);
	var hours = d.getHours();
	if(hours>=12){var ampm=" p.m.";}
	if(hours>12)hours=hours-12;
	if(hours==0)hours=12;
	var mins = d.getMinutes();
	if(mins <= 9){mins = "0" + mins; }



	return hours+":"+mins+ampm;
}


function getDateAddDays(days){
	var d = new Date();
	var lDate = d.valueOf();
	//Add the correct number of days to the list
	lDate = lDate + (days * (1000*60*60*24));
	var dd = new Date(lDate);
	return dd.getMonth()+1 +"/"+dd.getDate()+"/"+dd.getFullYear();
}




// ************** NAV functions ***********************
function autoLaunchForum(url){
	var loc = url;
   	top.newWin = window.open(loc, "Jforum");
	//top.newWin = window.open(loc, "forum");
   	//, 'resizable=1,menubar=1,location=1, scrollbars=1, status=1,toolbar=1');
  	newWin.focus();
}

function launchForum(url){
 	var loc = (url ? url : "/jforum");
  	top.newWin = window.open(loc, "Jforum");
   	newWin.focus();
}

function closeForum(){
	if(top.newWin){
		newWin.close();
	}
}
function closeFriends(){
 	if(top.friendsWin && !top.friendsWin.closed){
 		var loc ="/membersite/member/chat/buddylistoff.jsp";
 		var friendsWin = window.open(loc, "friendsWin", 'WIDTH=210, HEIGHT=540,resizable=0, scrollbars=0, status=0,toolbar=0');
 	}
}

function closeMeeting(){
	if(top.meetroomWin  && !top.meetroomWin.closed){
		var loc ="/membersite/member/chat/chatroomoff.jsp";
 		var meetroomWin = window.open(loc, "meetroomWin", 'WIDTH=700, HEIGHT=600,resizable=1, scrollbars=0, status=1,toolbar=0');

		//meetroomWin.close();
	}
}

function closepostsession(){
	if(top.postracechat  && !top.postracechat.closed){
		postracechat.close();
	}
}

function closepresession(){
	if(top.preracechat  && !top.preracechat.closed){
		preracechat.close();
	}
}

var launchingSession = false;
function LaunchSession(){
	if (launchingSession) {
		return;
	}
	launchingSession = true;
    closeFriends();
  	setTimeout("closeMeeting()",100);
  	setTimeout("closepresession()",100);
  	setTimeout("closepostsession()",100);
    setTimeout(function(){document.location.href=joinurl;},1000);
}

function logoutUser(path){
	closeForum();
	Delete_Cookie('autologin2','/','');
	document.location.href=path;
	//document.location.href="ibm_security_logout?&logoutExitPage=../publicsite.jsp";

}

function changeMemberPage(newPage){

	var offset = new Date().getTimezoneOffset();
	var dToday = new Date();
	var mn = (dToday.getMonth()+1);
	var month = new String(mn);
	if(month.length<2){
		month = "0"+month;
	}
	var dy = dToday.getDate();
	var day = new String(dy);
	if(day.length<2){
		day = "0"+day;
	}
	var todaysDate = dToday.getFullYear()+"-"+ month +"-"+day;
	document.location.href=newPage+"?&utcoffset="+offset;
}

//*******************   Countdown Timer Functions *******************************
var timerID = null;
var timerRunning = false;
function stopClock(){
	if(timerRunning) clearTimeout(timerID);
	timerRunning =false;

	}

function startClock(){
	stopClock();
	countDown();
}

function countDown() {

	timerRunning = true;
	var formName = "COUNTER0";
	var secsDisp = "0"
	var minsDisp = "0";

	if(document.forms[formName]){

		var startTime = document.forms[formName].COUNTER.value;
	//	alert(startTime);
		var currentTime = new Date().valueOf();
		var timeSecs = (startTime - currentTime) * .001;

		var reloadFrame = false;
		if(timeSecs<-10){reloadFrame=true;}
		if(timeSecs>0){
			//timeSecs = timeSecs -1 ;
		}else{
			timeSecs = 0;
		}
		//Figure Out the time to Display
		var mins = 0;
		var secs = 0;
		secsDisp = "00";
		//We only need to do anything if there is more than 0 secsonds
		if(timeSecs > 0){

			if(timeSecs>59){
				mins = timeSecs/60;
				secs = timeSecs%60;


				if(mins.toString().indexOf(".")>-1){
					mins = mins.toString().substring(0,mins.toString().indexOf("."));
				}

				var sMins = new String(mins);
 				if(sMins.indexOf('.')>-1){
 					sMins = sMins.substring(0,sMins.indexOf('.'));
 				}


				if(sMins.length < 2){
					minsDisp = "0" + sMins;
				}else{
					minsDisp = sMins;
				}
			}else{
				secs = timeSecs;

			}
		}

 		var sSecs = new String(secs);

 		if(sSecs.indexOf('.')>-1){
 			sSecs = sSecs.substring(0,sSecs.indexOf('.'));
 		}

 		if(sSecs.length < 2){
			secsDisp = "0" + sSecs;
		}else{
			secsDisp = sSecs;
		}

	if(minsDisp.length<2){minsDisp = "0"+minsDisp;}
	if(secsDisp.length<2){secsDisp = "0"+secsDisp;}
		setTimeImages(minsDisp,secsDisp);
		//Set the hidden timer to the correct seconds
    	//document.forms[formName].COUNTER.value = timeSecs;//updateDisplay(countMin, countSec);
 	}

 	timerID = setTimeout("countDown()",1000);
 	if(reloadFrame < -10){
 		var loc = regSessCounter.location.href;
 		var newLoc = loc + "&rnd="+new String(currentTime);
 		//alert(newLoc);
		top.regSessCounter.location = newLoc;
		return;
		}

}
/*============================== CHECK UPDATES ===============================*/
function viewUpdates(loc, autoStart){
	var left,top;
	//IE top is 0 of content in browser, whereas Mozilla top is 0 of browser
	if(window.screenLeft){
		left=window.screenLeft;
		top=window.screenTop;
	}else {
		left=window.screenX;
		top=window.screenY;
	}

	//offset top, left by 50 pixels
	if(window.outerHeight)top=window.outerHeight-window.innerHeight;
	else top=top+50;
	if(newWin)newWin.close();

	var width=956;
	if (enableAutoStartDL && autoStart) {
		showPleaseWaitDlg("Please wait while we prepare to download your updates");
		loc += "&autostart=1";
		var iframe = document.body.appendChild(element("iframe", {src:loc}, {display:"none"}));
		iframe.onload = function() {
			setTimeout(function() {
				hidePleaseWaitDlg();
			}, 3000);
		}
	}
	else {
		newWin=window.open(loc, "_blank", "width="+width+", top="+top+", left="+(left+50)+", scrollbars=1, resizable=1, status=0, toolbar=0");
	}
}
function find_displaysize(kb){
	var label="M";
	var style="size_M";
	var size=kb;
	if(kb>999){
		var MB=kb/1024;
		if(Math.round(MB)>999){
			size=(MB/1024).toFixed(2);
			label="G";
			style=" size_G";
		}else{
			size=Math.round(Math.max(1,kb/1024));
			label="M";
			style=" size_M";
		}
	}else{
		style=" size_k";
		label="k";
	}
	return {label:label,size:size,style:style};
}
/*============================== CAR/TRACK SELECT ============================*/

function selectTestCar(key){
	var state=Get_Cookie("panelstate");
	//if(state&1)state=state&~1;
	//if(!(state&4))state=state|16;
	//Set_Cookie("panelstate",state);
	window.location.href=contextpath+"/member/SelectTestCar.do?carid="+key+"&nocache="+new Date().getTime();
}

function selectTestCarHandler(req){
	return function(){
		if(req.readyState == 4) {
			if(req.status == 200){
				//window.location.reload();
				var res = extractJSON(req.responseText);
				decodeAllFields(res);
				if (systemversions) {
					res.img=getCarURL(res,1,res.pattern);
				}
				IRACING.control_panels.rebuild_testingpanel_car(res);
			}
		}
	}
}

function selectTestCarAjax(carId) {
	var parms={}
	parms['carId'] = carId;
	load(contextpath+"/member/SelectTestCar",parms, selectTestCarHandler);
}


function selectTestTrack(key){
	var state=Get_Cookie("panelstate");
	window.location.href=contextpath+"/member/SelectTestTrack.do?trackid="+key+"&nocache="+new Date().getTime();
}

function selectTestTrackHandler(req){
	return function(){
		if(req.readyState == 4) {
			if(req.status == 200){
				var res = extractJSON(req.responseText);
				decodeAllFields(res);
				IRACING.control_panels.rebuild_testingpanel_track(res);
			}
		}
	}
}

function selectTestTrackAjax(trackId,nightMode,weather) {
	var parms={}
	parms['trackId'] = trackId;
	if (nightMode) {
		parms['nightMode'] = (nightMode ? 1 : 0);
	}
	// Now with weather!
	if (weather) {
		parms['weatherType']				= weather.weatherType;
		parms['weatherTempUnits']			= weather.weatherTempUnits;
		parms['weatherTempValue']			= weather.weatherTempValue;
		parms['weatherRelativeHumidity']	= weather.weatherRelativeHumidity;
		parms['weatherFogDensity']			= weather.weatherFogDensity;
		parms['weatherWindDir']				= weather.weatherWindDir;
		parms['weatherWindSpeedUnits']		= weather.weatherWindSpeedUnits;
		parms['weatherWindSpeedValue']		= weather.weatherWindSpeedValue;
		parms['weatherSkies']				= weather.weatherSkies;
	}
	load(contextpath+"/member/SelectTestTrack",parms, selectTestTrackHandler);
}

// Compares two objects
function matchObj(a,b){var c=1;for(var i in a)if(a[i]!=b[i]){c=0;break;}return c;}

// Clones
function cloneObj(a){var b={};for(var i in a)b[i]=a[i];return b;}

function setWeatherAjaxHandler(response) {
	return function(){
		if(response.readyState == 4) {
			if(response.status == 200){
				//var res = extractJSON(response.responseText);
				//decodeAllFields(res);
			}
		}
	}
};

function setWeatherAjax(trackID,weather) {
	var params = {};

	params['trackId'] = trackID;

	params['weatherType']				= weather.weatherType;
	params['weatherTempUnits']			= weather.weatherTempUnits;
	params['weatherTempValue']			= weather.weatherTempValue;
	params['weatherRelativeHumidity']	= weather.weatherRelativeHumidity;
	params['weatherFogDensity']			= weather.weatherFogDensity;
	params['weatherWindDir']				= weather.weatherWindDir;
	params['weatherWindSpeedUnits']		= weather.weatherWindSpeedUnits;
	params['weatherWindSpeedValue']		= weather.weatherWindSpeedValue;
	params['weatherSkies']				= weather.weatherSkies;

	/*
	console.log("\n")
	console.log(params)
	console.log("\n")
	*/

	load(contextpath+"/member/SelectTestTrack",params, setWeatherAjaxHandler);
};

function selectCarAjaxHandler(req){
	return function(){
		if(req.readyState == 4) {
			if(req.status == 200){
				window.location.reload();

				/**
				 *  What I'd really like to do it update the race panel without reloading the page
				 *
				 */
				//var res = extractJSONNew(req.responseText);
				//if (systemversions) {
				//	res.img=getCarURL(res,1,res.pattern);
				//}
				//dumpProperties(res, "new racingpanel car data");
				//IRACING.control_panels.rebuild_racingpanel_car(res);
			}
		}
	}
}

function selectCarAjax(seasonId, carId) {
	var parms={}
	parms['seasonId'] = seasonId;
	parms['carId'] = carId;
	load(contextpath+"/member/SelectCar",parms, selectCarAjaxHandler);
}

function selectSeries(key,view){
	var state=Get_Cookie("panelstate");
	window.location.href=contextpath+"/member/SelectSeries.do?&season="+key+"&view="+view+"&nocache="+new Date().getTime();
}
function selectSeriesCar(key){
	var state=Get_Cookie("panelstate");
	window.location.href=contextpath+"/member/SelectCar.do?&car="+key+"&nocache="+new Date().getTime();
}

function launchFriendsChat(){
   	var loc =contextpath+"/member/FriendChat.do";
   	var friendsWin = window.open(loc, "friendsWin", 'WIDTH=210, HEIGHT=540,resizable=0, scrollbars=0, status=0,toolbar=0');
   	friendsWin.focus();
}

/*=========================== INSTRUCTION =================================*/
function launch_sportingcode(loc){

	var sportingCodeWin = window.open(loc, "_blank", 'width=750, height=600, resizable=1, scrollbars=1, status=0, toolbar=0');
	sportingCodeWin.focus();
	var parms = {};
	load(contextpath+"/member/GrantRTFMAward",parms,dummyAjaxHandler);


}
function launch_userguide(loc){
	var userGuideWin = window.open(loc, "_blank", 'width=750, height=600, resizable=1, scrollbars=1, status=0, toolbar=0');
	userGuideWin.focus();
}

function launch_unofficialsitepolicy(loc){
	var unofficialsitepolicyWin = window.open(loc, "_blank", 'width=750, height=600, resizable=1, scrollbars=1, status=0, toolbar=0');
	unofficialsitepolicyWin.focus();
}

function launch_setupguide(loc){
	var setupguideWin = window.open(loc, "_blank", 'width=750, height=600, resizable=1, scrollbars=1, status=0, toolbar=0');
	setupguideWin.focus();
}
function launch_clubpreview(loc){
	var clubpreviewWin = window.open(loc, "_blank", 'width=750, height=600, resizable=1, scrollbars=1, status=0, toolbar=0');
	clubpreviewWin.focus();
}
function launch_proseries(loc){
	var proseriesWin = window.open(loc, "_blank", 'width=750, height=600, resizable=1, scrollbars=1, status=0, toolbar=0');
	proseriesWin.focus();
}
function launch_codeofconduct(){
	var loc=contextpath+"/codeofconduct_wrapper.jsp";
	var codeofconductWin = window.open(loc, "_blank", 'width=750, height=600, resizable=1, scrollbars=1, status=0, toolbar=0');
	codeofconductWin.focus();
}
function launch_quickstart(){
	var loc=contextpath+"/member/instruction/init_qsg.jsp";
	var quickstartWin = window.open(loc, "_blank", 'width=1032, height=600, resizable=1, scrollbars=1, status=0, toolbar=0');
	quickstartWin.focus();
}

function launch_quickstart_loc(doc_loc){
	var loc=contextpath+doc_loc;
	var quickstartWin = window.open(loc, "_blank", 'width=1032, height=600, resizable=1, scrollbars=1, status=0, toolbar=0');
	quickstartWin.focus();
}
function launch_seasonSchedule(){
	var scheduleWin = window.open(contextpath + "/member/GetSeasonSchedulePDF", "_blank", 'width=750, height=600, resizable=1, scrollbars=1, status=0, toolbar=0');
	scheduleWin.focus();
}

/*=========================== HELP =======================================*/
function launch_help(){
	var loc=contextpath+"/member/help.jsp";
	if(js_isFreeSiteMember){
		loc = contextpath+"/member/helplite.jsp";
	}
	var helpWin = window.open(loc, "_blank", 'width=964, height=600, resizable=1, scrollbars=1, status=0, toolbar=0');
	helpWin.focus();
}

function launch_FAQ(){
	var loc="http://faq.iracing.com";
	var helpWin = window.open(loc, "_blank", 'width=964, height=600, resizable=1, scrollbars=1, status=0, toolbar=0');
	helpWin.focus();
}
function launch_FAQLite(){
	var loc="http://faq.iracing.com/category.php?id=119";
	var helpWin = window.open(loc, "_blank", 'width=964, height=600, resizable=1, scrollbars=1, status=0, toolbar=0');
	helpWin.focus();
}

function launch_help_nonmember(){
	var loc=contextpath+"/help.jsp";
	var help_nonmember_Win = window.open(loc, "_blank", 'width=964, height=600, resizable=1, scrollbars=1, status=0, toolbar=0');
	help_nonmember_Win.focus();
}
function launch_contactus(){
	var loc=contextpath+"/contactus.jsp";
	var contactusWin = window.open(loc, "_blank", 'width=964, height=600, resizable=1, scrollbars=1, status=0, toolbar=0');
	contactusWin.focus();
}

function launch_contactuslite(){
	var loc=contextpath+"/member/contactuslite.jsp";
	var contactusWin = window.open(loc, "_blank", 'width=964, height=600, resizable=1, scrollbars=1, status=0, toolbar=0');
	contactusWin.focus();
}

/*=========================== LEGAL =======================================*/
function openPrivacyWin(){
	var loc=contextpath+"/privacypolicy.jsp";
	var privacyWin = window.open(loc, "_blank", 'width=750, height=600, resizable=1, scrollbars=1, status=0, toolbar=0');
	privacyWin.focus();
}
function openTermsWin(){
	var loc=contextpath+"/termsofuse.jsp";
	var termsWin = window.open(loc, "_blank", 'width=750, height=600, resizable=1, scrollbars=1, status=0, toolbar=0');
	termsWin.focus();
}
/*=========================== BILLING =====================================*/
function openTax(){
	var loc=contextpath+"/order/tax.jsp";
	var taxWin = window.open(loc, "_blank", 'width=315, height=300, resizable=1, scrollbars=1, status=0, toolbar=0');
	taxWin.focus();
}
function openIrd(type){
	var loc=contextpath+"/order/ird.jsp";
	if (type != null) {
		loc += "?type=" + type;
	}
	var taxWin = window.open(loc, "_blank", 'width=315, height=350, resizable=1, scrollbars=1, status=0, toolbar=0');
	taxWin.focus();
}

function openIrc(type){
	var loc=contextpath+"/order/irc.jsp";
	if (type != null) {
		loc += "?type=" + type;
	}
	var taxWin = window.open(loc, "_blank", 'width=315, height=350, resizable=1, scrollbars=1, status=0, toolbar=0');
	taxWin.focus();
}

function openSavings(){
	var loc=contextpath+"/order/savings.jsp";
	var savingsWin = window.open(loc, "_blank", 'width=315, height=300, resizable=1, scrollbars=1, status=0, toolbar=0');
	savingsWin.focus();
}

/*=========================== LAUNCH SWF ==================================*/
function launch_swf(divid, objectid, width, height, url, flashvars){
  var a=document.getElementById(divid);
  a.innerHTML=
  	'<object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" codebase="http://fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=7,0,0,0"'+
    'id="'+objectid+'" width="'+width+'" height="'+height+'">'+
    '<param name="movie" value="'+url+'" />'+
    '<param name="quality" value="high" />'+
   	'<param name="loop" value="1" />'+
  	'<param name="FlashVars" value="'+flashvars+'" />'+
   	'<embed src="'+url+'" FlashVars="'+flashvars+'" width="'+width+'" height="'+height+'" loop="1" quality="high" pluginspage="http://www.adobe.com/go/getflashplayer" type="application/x-shockwave-flash" menu="false"></embed>'+
  	'</object>';
}
/*========================== VIEW CART ====================================*/
function viewcart(){
	document.location.href=contextpath+"/member/ViewCart.do";
}
/*========================== CAR URL ======================================*/
function getCarURL(car,size,pattern,nosponsors){
	var src="";
	if(!systemversions){
		var idx=CarListing.objIndexOf(car.id,"id");
		if(idx!=-1){
			src=imageserver+"/"+decodeURIComponent(CarListing[idx].defaultimg)+"/size_"+size+"/car.bmp";
		}
	}else{
		if(car){
			var dirPath = decodeURIComponent(car.dirpath);

			// Set up wheels data:
			var wheelString = "";

				var wheelDetails = {"type":"","color":""};
					if ((Number(car.wheelsChrome) >= 0) && (String(car.wheelsColor).length == 6)) {
						wheelString = car.wheelsChrome + "," + car.wheelsColor;
					} else if ((Number(car.wheelChrome) >= 0) && (String(car.wheelColor).length == 6)) {
						wheelString = car.wheelChrome + "," + car.wheelColor;
					};

			if(nosponsors)src=localserver+'/car.png?dirpath='+dirPath+'&size='+size+'&pat='+pattern+'&numberslant='+car.numberSlant+'&lic='+MemBean.highestLicColor+'&colors='+car.carColor1+','+car.carColor2+','+car.carColor3+'&car_number='+car.carNum+"&wheels="+wheelString;
			else src=localserver+'/car.png?dirpath='+dirPath+'&size='+size+'&pat='+pattern+'&numberslant='+car.numberSlant+'&lic='+MemBean.highestLicColor+'&colors='+car.carColor1+','+car.carColor2+','+car.carColor3+'&sponsors='+car.sponsor1+','+car.sponsor2+'&numfont='+car.numFont+'&numcolors='+car.numColor1+','+car.numColor2+','+car.numColor3+'&club='+MemBean.clubID+'&car_number='+car.carNum+"&wheels="+wheelString;
		}
	}
	return src;
}
/*========================== BUILD TRACK STATUS ====================================*/
function build_track_status(track,select){
	var status_abs=element("div",{className:"tracks_status"});//absolute
	var status;
	if(track.owned){
		if(track.download){
			var updatelink=status_abs.appendChild(element("a",{href:"javascript:viewUpdates(downloadcontextpath+'/member/GetVersions.do?preselect="+track.pkgID+"&nocache'+new Date().getTime());",title:"Update track"}));
				imgpreload(imageserver+"/member_images/buttons/ptb_download.gif",updatelink,"panel_download_btn");
		}else if(track.update){
			var updatelink=status_abs.appendChild(element("a",{href:"javascript:viewUpdates(downloadcontextpath+'/member/GetVersions.do?preselect="+track.pkgID+"&nocache='+new Date().getTime());",title:"Update track"}));
				imgpreload(imageserver+"/member_images/buttons/ptb_updatesreq.gif",updatelink,"panel_updates_btn");
		}else{
			var teststatus=status_abs.appendChild(element("span"));
				var testlink=teststatus.appendChild(element("a",{title:"Select Test Track"}));
					imgpreload(imageserver+"/member_images/buttons/ptb_select.gif",testlink,"panel_select_btn");
				if(select){
					teststatus.onclick=function(){
						var tracks_select_series=el("tracks_select_series");
						var tracks_select=el("tracks_select");
						if(tracks_select){
							if(tracks_select.parentNode.parentNode==this.parentNode){
								tracks_select.parentNode.removeChild(tracks_select);
								return;
							}
							tracks_select.parentNode.removeChild(tracks_select);
						}

						if(tracks_select_series)tracks_select_series.parentNode.removeChild(tracks_select_series);
						select.id="tracks_select";
						setTimeout(function(){select.size=select.options.length},0);
						select.onchange=function(){if(this.selectedIndex)selectTestTrack(this[this.selectedIndex].value);}
						var div=element("div",{},{position:"relative"});
							div.appendChild(select);
						status_abs.appendChild(div);
					}
				}else{
					testlink.href="javascript:selectTestTrack("+track.trackID+")";
				}
			var seriesstatus=status_abs.appendChild(element("span",{className:""}));
				var findserieslink=seriesstatus.appendChild(element("a",{title:"Find a Series"}));
					imgpreload(imageserver+"/member_images/buttons/ptb_findseries.gif",findserieslink,"panel_findseries_btn");
				if(select){
					seriesstatus.onclick=function(){
						var tracks_select_series=el("tracks_select_series");
						var tracks_select=el("tracks_select");
						if(tracks_select_series){
							if(tracks_select_series.parentNode.parentNode==this.parentNode){
								tracks_select_series.parentNode.removeChild(tracks_select_series);
								return;
							}
							tracks_select_series.parentNode.removeChild(tracks_select_series);
						}
						if(tracks_select)tracks_select.parentNode.removeChild(tracks_select);
						select.id="tracks_select_series";
						setTimeout(function(){select.size=select.options.length},0);
						select.onchange=function(){if(this.selectedIndex)document.location.href=contextpath+"/member/Series.do?trackid="+this[this.selectedIndex].value};
						var div=element("div",{},{position:"relative"});
							div.appendChild(select);
						status_abs.appendChild(div);
					}
				}else{
					findserieslink.href=contextpath+"/member/Series.do?trackid="+track.trackID;
				}
		}
	}else{
		if(skusincart.indexOf(track.sku)!=-1){
			status_abs.appendChild(element("span",{innerHTML:"PRICE: $"+track.price,className:"listing_price"}));
			var incartlink=status_abs.appendChild(element("a",{href:"javascript:viewcart()",title:"View Cart"}));
				imgpreload(imageserver+"/member_images/buttons/ptb_viewcart.gif",incartlink,"panel_viewcart_btn");
		} else if ((track.freeWithSubscription == "true") && !MemBean.accountHasBeenPaid) {
			status_abs.appendChild(element("span",{innerHTML:"FREE WITH UPGRADE",className:"listing_price"}));
			var freeWithSubscriptionNode=status_abs.appendChild(element("span"));
			var freeWithSubscription=freeWithSubscriptionNode.appendChild(element("a",{href:"/membersite/account/ChooseNewSubscription.do",id:"freeWithSubscription_"+track.pkgID,title:"UPGRADE"}));
			imgpreload(imageserver+"/member_images/buttons/ptb_upgd.gif",freeWithSubscription,"freeWithSubscription_"+track.pkgID);
		} else {
			status_abs.appendChild(element("span",{innerHTML:"PRICE: $"+track.price,className:"listing_price"}));
			var purchasenode=status_abs.appendChild(element("span"));
			var purchaselink=purchasenode.appendChild(element("a",{href:"javascript:addtocart('sku="+track.sku+"',addtocart_tracks_handler);",title:"Purchase Track"}));
				imgpreload(imageserver+"/member_images/buttons/ptb_addtocart.gif",purchaselink,"panel_addtocart_btn");
			addtocart_arr.push({target:purchasenode,sku:track.sku});
		}
	}
	return status_abs;
}

/*========================== BUILD CAR STATUS ====================================*/
function build_car_status(car,select){
	var status_abs=element("div",{className:"cars_status"});
	var status;

	if(car.owned){
		if(car.download){
			var updatelink=status_abs.appendChild(element("a",{href:"javascript:viewUpdates(downloadcontextpath+'/member/GetVersions.do?preselect="+car.pkgID+"&nocache'+new Date().getTime());",title:"Update Car"}));
			imgpreload(imageserver+"/member_images/buttons/ptb_download.gif",updatelink,"panel_download_btn");
		}else if(car.update){
			var updatelink=status_abs.appendChild(element("a",{href:"javascript:viewUpdates(downloadcontextpath+'/member/GetVersions.do?preselect="+car.pkgID+"&nocache'+new Date().getTime());",title:"Update Car"}));
			imgpreload(imageserver+"/member_images/buttons/ptb_updatesreq.gif",updatelink,"panel_updates_btn");
		}else{
			var teststatus=status_abs.appendChild(element("span"));
				var testlink=teststatus.appendChild(element("a",{title:"Select Test Car"}));
				imgpreload(imageserver+"/member_images/buttons/ptb_select.gif",testlink,"panel_select_btn");

				if(select){
					teststatus.onclick=function(){
						var cars_select_series=el("cars_select_series");
						var cars_select=el("cars_select");
						if(cars_select){
							if(cars_select.parentNode.parentNode==this.parentNode){
								cars_select.parentNode.removeChild(cars_select);
								return;
							}
							cars_select.parentNode.removeChild(cars_select);
						}

						//if(cars_select)cars_select.parentNode.removeChild(cars_select);
						if(cars_select_series)cars_select_series.parentNode.removeChild(cars_select_series);
						select.id="cars_select";
						setTimeout(function(){select.size=select.options.length},0);
						select.onchange=function(){if(this.selectedIndex)selectTestCar(this[this.selectedIndex].value);}
						var div=element("div",{},{position:"relative"});
							div.appendChild(select);
						status_abs.appendChild(div);
					}
				}else{
					testlink.href="javascript:selectTestCar("+car.carID+")";
				}
			var seriesstatus=status_abs.appendChild(element("span",{className:""}));
				var findserieslink=seriesstatus.appendChild(element("a",{title:"Find a Series"}));
				imgpreload(imageserver+"/member_images/buttons/ptb_findseries.gif",findserieslink,"panel_findseries_btn");

				if(select){
					seriesstatus.onclick=function(){
						var cars_select_series=el("cars_select_series");
						var cars_select=el("cars_select");
						if(cars_select_series){
							if(cars_select_series.parentNode.parentNode==this.parentNode){
								cars_select_series.parentNode.removeChild(cars_select_series);
								return;
							}
							cars_select_series.parentNode.removeChild(cars_select_series);
						}
						if(cars_select)cars_select.parentNode.removeChild(cars_select);
						select.id="cars_select_series";
						setTimeout(function(){select.size=select.options.length},0);
						select.onchange=function(){if(this.selectedIndex)document.location.href=contextpath+"/member/Series.do?carid="+this[this.selectedIndex].value};
						var div=element("div",{},{position:"relative",left:"152px"});
							div.appendChild(select);
						status_abs.appendChild(div);
					}
				}else{
					findserieslink.href=contextpath+"/member/Series.do?carid="+car.carID;
				}
			//status_abs.appendChild(element("div",{className:"clearboth"}));
		}
	}else{ // Not owned
		// If in the cart already
		if(skusincart.indexOf(car.sku)!=-1){
			status_abs.appendChild(element("span",{innerHTML:"PRICE: $"+car.price,className:"listing_price"}));
			var incartlink=status_abs.appendChild(element("a",{href:"javascript:viewcart()",title:"View Cart"}));
			imgpreload(imageserver+"/member_images/buttons/ptb_viewcart.gif",incartlink,"panel_viewcart_btn");
		} else if ((car.freeWithSubscription == "true") && !MemBean.accountHasBeenPaid) {
			status_abs.appendChild(element("span",{innerHTML:"FREE WITH UPGRADE",className:"listing_price"}));
			var freeWithSubscriptionNode=status_abs.appendChild(element("span"));
			var freeWithSubscription=freeWithSubscriptionNode.appendChild(element("a",{href:"/membersite/account/ChooseNewSubscription.do",id:"freeWithSubscription_"+car.pkgID,title:"UPGRADE"}));
			imgpreload(imageserver+"/member_images/buttons/ptb_upgd.gif",freeWithSubscription,"freeWithSubscription_"+car.pkgID);
		}else{
			status_abs.appendChild(element("span",{innerHTML:"PRICE: $"+car.price,className:"listing_price"}));
			var purchasenode=status_abs.appendChild(element("span"));
			var purchaselink=purchasenode.appendChild(element("a",{href:"javascript:addtocart('sku="+car.sku+"',addtocart_cars_handler);",title:"Purchase Car"}));
			imgpreload(imageserver+"/member_images/buttons/ptb_addtocart.gif",purchaselink,"panel_addtocart_btn");
			addtocart_arr.push({target:purchasenode,sku:car.sku});
		}
		status_abs.appendChild(element("div",{className:"clearboth"}));
	}
	return status_abs;
}

/*========================== LAUNCH CHAT ====================================*/
function launchchat_ajax_handler(req){
	return function(){
		if(req.readyState == 4) {
	  	if(req.status == 200){
	  		eval("var chatsvr="+req.responseText.replace(/\+/g," ")+";");
	  		if(chatsvr==-1)alert("There are no chat servers available at this time.");
	  		else document.location.href=chathref+"&chatsvr="+chatsvr;
	  	}
		}
	}
}
function launchchat_ajax(room){
	if(!systemversions){
		alert("Chat is not available when your system is not in service.");
	}else if(overallUpdateRequired){
		alert("Chat is not available until you update your system software.");
	}else{
		load(contextpath+"/member/GetChatServerInfo?room="+room,null,launchchat_ajax_handler);
	}
}
/*========================= ADD TO CART ====================================*/
function addtocart(sku,handler){
	if(typeof(handler)=="string")handler=this[handler];
	var res = load(contextpath+"/member/OrderAddItemToCart?"+sku,null,handler);
	return res;
}
function update_content_addtocart_targets_carstracks(cartskus){
	el("siteutils_cart").style.display="inline";
	if(addtocart_arr){
	for(var i=0;i<addtocart_arr.length;i++){
	  var item=addtocart_arr[i];
	  if(cartskus.indexOf(item.sku)!=-1){
			var incartlink=element("a",{href:"javascript:viewcart()",title:"View Cart"});
				imgpreload(imageserver+"/member_images/buttons/ptb_viewcart.gif",incartlink,"panel_viewcart_btn");
			item.target.replaceChild(incartlink,item.target.childNodes[0]);
	  }
	}
	}
	update_content_addtocart_racepanel(cartskus);
}
function update_content_addtocart_targets_series(cartskus){
	el("siteutils_cart").style.display="inline";
	if(addtocart_arr){
	for(var i=0;i<addtocart_arr.length;i++){
	  var item=addtocart_arr[i];
	  if(cartskus.indexOf(item.sku)!=-1){
			item.target.innerHTML="VIEW CART";
			item.target.href=contextpath+"/member/ViewCart.do";
			item.target.title="View Cart";
	  }
	}
	}
	update_content_addtocart_racepanel(cartskus);
}
function update_content_addtocart_racepanel(cartskus){
	if(racingpaneldata && racingpaneldata.skus_arr.length){
		for(var i=0;i<racingpaneldata.content_arr.length;i++){
	  	var item=racingpaneldata.content_arr[i];
	  	if(cartskus.indexOf(item.sku)!=-1){
	  		item.target.innerHTML="In Cart";
	  		item.target.href=contextpath+"/member/ViewCart.do";
	  		item.target.title="View Cart";
	  	}
		}
	  var incart=1;
	  for(var i=0;i<racingpaneldata.skus_arr.length;i++){
	  	var sku=racingpaneldata.skus_arr[i];
	  	if(cartskus.indexOf(sku)==-1)incart=0;
	  }
	  if(incart){
	  	racingpaneldata.addtocart_target.parentNode.replaceChild(IRACING.control_panels.viewcart,racingpaneldata.addtocart_target);
	  }
	}
}
/*========================= DHTML ===================================*/
function showhide(a,b){
	return function(){
		a.style.display="inline";
		b.style.display="none";
	};
}
function assign_states_status(a){
	var div=a.getElementsByTagName("div")[0];
	function shift(a,top){return function(){a.style.top=top+"px";};}
	a.onmouseover=shift(div,-29);
	a.onmouseout=shift(div,0);
	a.onmousedown=shift(div,-58);
}
function launchEventResult(id,custid){
	var useWidth = Math.min(parseInt(screen.availWidth * .90), 1250);
	var useHeight = parseInt(screen.availHeight * .90);
	var loc=contextpath+"/member/EventResult.do?&subsessionid="+id+"&custid="+custid;
	var eventWin=window.open(loc, "_blank", 'width=' + useWidth + ', height=' + useHeight + ', resizable=1, scrollbars=1, status=0, toolbar=0');
	eventWin.focus();
}
/*========================= Panel Listings ===================================*/
function panelover(img){
	return function(){
		this.style.background="transparent url('"+img+"') 0 -115px no-repeat";
	};
}
function panelout(img){
	return function(){
		this.style.background="transparent url('"+img+"') no-repeat";
	};
}
/*========================== CSS Sprite Utility ===============================*/
function spriteShift(target,top,left){
	target.style.top=top+"px";
	target.style.left=left+"px";
}


/*========================= Browser Size Utility ==============================*/
/**
 * Returns the current size of the browser window
 */
function getWindowSize() {
  var myWidth = 0, myHeight = 0;
  if( typeof( window.innerWidth ) == 'number' ) {
    //Non-IE
    myWidth = window.innerWidth;
    myHeight = window.innerHeight;
  } else if( document.documentElement && ( document.documentElement.clientWidth || document.documentElement.clientHeight ) ) {
    //IE 6+ in 'standards compliant mode'
    myWidth = document.documentElement.clientWidth;
    myHeight = document.documentElement.clientHeight;
  } else if( document.body && ( document.body.clientWidth || document.body.clientHeight ) ) {
   	//IE 4 compatible
    myWidth = document.body.clientWidth;
    myHeight = document.body.clientHeight;
  }
  return [myWidth, myHeight];
}

/*========================= Element Position Utility ==============================*/
/**
 * Returns the absolute location of the given element
 */
function findPos(obj) {
	var curleft = curtop = 0;
	if (obj.offsetParent) {
		do {
			curleft += obj.offsetLeft;
			curtop += obj.offsetTop;
		} while (obj = obj.offsetParent);
	}
	return [curleft,curtop];
}

/**
 * Returns the current size of the browser window
 */
function getWindowSize() {
  var myWidth = 0, myHeight = 0;
  if( typeof( window.innerWidth ) == 'number' ) {
    //Non-IE
    myWidth = window.innerWidth;
    myHeight = window.innerHeight;
  } else if( document.documentElement && ( document.documentElement.clientWidth || document.documentElement.clientHeight ) ) {
    //IE 6+ in 'standards compliant mode'
    myWidth = document.documentElement.clientWidth;
    myHeight = document.documentElement.clientHeight;
  } else if( document.body && ( document.body.clientWidth || document.body.clientHeight ) ) {
   	//IE 4 compatible
    myWidth = document.body.clientWidth;
    myHeight = document.body.clientHeight;
  }
	return [myWidth, myHeight];
}

/**
 * Returns the index of a given value in a select element's options array
 *
 */
getSelectOptionIndex=function(select, lookFor){var index=-1;for(var i=select.options.length;i--;)if(select.options[i]&&(select.options[i].value==lookFor)){index=i;break;}return index;}

selectOption=function(select, value) {
	var ndx = 0;
	while (select && select.options && ndx < select.options.length) {
		var option = select.options[ndx];
		if (option.value == value) {
			if (select.selectedIndex != ndx) {
				select.selectedIndex = ndx;
			}
		}
		ndx++;
	}
}

function getSelectedOption(select) {
	if (!select) {
		return null;
	}
	var ndx = select.selectedIndex;
	if (ndx < 0) {
		return null;
	}
	if (ndx >= select.options.length) {
		return null;
	}
	return select.options[ndx];
}

function selectHasOptionWithName(select, name) {
	var ndx = 0;
	while (select && select.options && ndx < select.options.length) {
		var option = select.options[ndx];
		if (option.text == name) {
			return true;
		}
		ndx++;
	}
	return false;
}

function selectHasOptionWithValue(select, value) {
	var ndx = 0;
	while (select && select.options && ndx < select.options.length) {
		var option = select.options[ndx];
		if (option.value == value) {
			return true;
		}
		ndx++;
	}
	return false;
}

/**
* This doesn't do anything but I use it to force asynchronous behavior when sending preferences to the server
*
*/
function dummyAjaxHandler(req) {
	return function(){
		if (req.readyState==4) {
			if (req.status==200){
	  		}else{
	  		}
		}
	}
}

function sendMPToHost(name, value, handler) {
	var url = contextpath+"/member/SetMemberPreferences";
	var parms = Object();
	parms[name] = value;
	load(contextpath+"/member/SetMemberPreferences", parms, (handler ? handler : dummyAjaxHandler));
}

function sendMPsToHost(parms, handler) {
	var url = contextpath+"/member/SetMemberPreferences";
	load(contextpath+"/member/SetMemberPreferences", parms, (handler ? handler : dummyAjaxHandler));
}

function sendMemberPreferenceToHost(name, value, handler) {
	var url = contextpath+"/member/SetMemberPreferences";
	var parms = Object();
	parms[name] = value;
	load(contextpath+"/member/SetMemberPreferences", parms, (handler ? handler : dummyAjaxHandler));
}

function strcmp(str1, str2) {
	return ( ( str1 == str2 ) ? 0 : ( ( str1 > str2 ) ? 1 : -1 ) );
}

function removeAllChildren(e) {
	if (!e) {
		return false;
	}
    if(typeof(e)=='string') {
        e = xGetElementById(e);
    }
    while (e.hasChildNodes()) {
        e.removeChild(e.firstChild);
    }
    return true;
}

function truncTwoDecPts(value, numPts) {
	var pts = numPts;
	if (!pts) {
		pts = 2;
	}
	var mult = Math.pow(10, pts);
	try {
		var newValue = parseFloat(value);
		newValue = parseInt(newValue * mult) / mult;
		return newValue;
	}
	catch (err) {
	}
	return 0;
}

function getLocalDate(timems){
	var d=new Date(timems);
	var mo=d.getMonth()+1;
	if(mo<10)mo="0"+mo;
	var day=d.getDate();
	if(day<10)day="0"+day;
	var ymd=d.getFullYear()+"."+mo+"."+day;
	var ap=d.getHours()>11?"p":"a";
	var h=d.getHours();
	if(h>12)h-=12;
	if(h==0)h=12;
	var m=d.getMinutes();
	if(m<10)m="0"+m;
	var hm=h+":"+m+ap;
	return {ymd:ymd,hm:hm}
}
function getUTCDate(timems){
	var d=new Date(timems);
	var mo=d.getUTCMonth()+1;
	if(mo<10)mo="0"+mo;
	var day=d.getUTCDate();
	if(day<10)day="0"+day;
	var ymd=d.getUTCFullYear()+"."+mo+"."+day;
	var h=d.getUTCHours();
	var m=d.getUTCMinutes();
	if(m<10)m="0"+m;
	var hm=h+":"+m;
	return {ymd:ymd,hm:hm}
}

function trim(str) {
	var	str = str.replace(/^\s\s*/,''),
		ws = /\s/,
		i = str.length;
	while (ws.test(str.charAt(--i)));
	return str.slice(0,i+1);
}

/**
 * Beware - this seems to hang on some objects and should only be used for debugging
 */
function traverseObject(obj) {
    for (i in obj) {
    	if (typeof obj[i] == 'object') {
    		traverseObject(obj[i]);
    	}
    }
}

/**
 * Creates and returns a clone of an object (o).  It takes a fieldmap as a parameter and uses this to change the field
 * names in the cloned object
 *
 * @param o
 * @param fieldmap
 * @return
 */
function cloneObject(o, fieldmap) {
	/**
	 * If the var passed in isn't an object we can just return it b/c it's a primitive type
	 */
    if(typeof(o) != 'object') {
    	return o;
    }
    if(o == null) {
    	return o;
    }


    /**
     * Arrays are objects but they need to be dealt with carefully.  I found that if I clone an array just like I would any other object the
     * resulting array won't really be an array.  It will look kinda like an array but it won't work properly (e.g. no length property and I didn't
     * stick around long enough to find out what else may be wrong with them).  My workaround for this is to loop through the source array creating
     * clones of each object found and pushing
     * them onto a new array.
     */
    var newO;
    if (o instanceof Array) {
    	newO = [];
    	var i = 0;
    	while (i < o.length) {
    		newO.push(cloneObject(o[i++], fieldmap));
    	}
    	return newO;
    }

    /**
     * This code will clone an object (that isn't an array) by first creating an empty object and then looping through the source object
     * and adding clones of each object we find to the target object.  This is also the place where the field name translation takes
     * place.  When we put the cloned object into the target object we will see if it's name is represented in the fieldMap.  If so we'll
     * use that name rather than the original name from the source object.
     */
    newO = new Object();
    for(var i in o) {
    	var fieldName = i;
    	if (fieldmap && fieldmap[i]) {
    		fieldName = fieldmap[i];
    	}
    	newO[fieldName] = cloneObject(o[i], fieldmap);
    }
    return newO;
}

/**
 * Takes json data, uncompresses it (if necessary) and returns an eval'ed object
 *
 *
 * @param jsonData
 * @return
 */
function extractJSONOld(jsonData) {
	/*
	 *  Eval the json into a temporary object
	 */
	var d = decodeURIComponent(jsonData);
	var ds = d.replace(/\+/g," ");
	ds=ds.replace(/\\/ig,"\\\\");

	/**
	 * Randy suggests we do a json encode here before an eval
	 */

	eval("var tmp="+ds+";");

	/**
	 * See if this looks like a compressed json object
	 */
	if (!tmp.m || !tmp.d) {
		/**
		 * This doesn't look like compressed json so just return the object
		 */
		return tmp;
	}

	var newObject;
	try {
		newObject = cloneObject(tmp.d, tmp.m);
	}catch(e){
	}
	return newObject;
}

/**
 *
 * @param s
 * @return
 */
function decodeUTF8( s )
{
  return decodeURIComponent( escape( s ) );
}

/**
 * Extends decodeURIComponent by also replacing +'s with spaces
 *
 * @param buf
 * @return
 */
function decodeURIComponentEx(buf) {
	if (!buf) {
		return buf;
	}

	var result = buf;
	try {

		result = decodeURIComponent(("" + buf).replace(/\+/g," "));
		}

	catch (err) {
		logToConsole("error decoding " + buf);
		logToConsole(err);
	}
	return result;
}

/**
 * Takes json data, uncompresses it (if necessary) and returns an eval'ed object
 *
 *
 * @param jsonData
 * @return
 */
function extractJSON(jsonData) {
	//console.info("extracting JSON...");
	if (!jsonData) {
		return null;
	}

	var newObject;

	try {
		/*
		 *  Eval the json into a temporary object
		 */
		var tmp1=jsonData.replace(/\+/g," ");
		if (!tmp1) {
			return null;
		}

		eval("var tmp="+tmp1+";");
	} catch (e) {
		console.group(" > Problems Parsing JSON");
			console.warn(e);
		console.groupEnd();
	}

	/**
	 * See if this looks like a compressed json object
	 */
	if (!tmp.m || !tmp.d) {
		/**
		 * This doesn't look like compressed json so just return the object
		 */
		return tmp;
	}


	try {
		newObject = cloneObject(tmp.d, tmp.m);
	}catch(e){
		console.group(" > Problems Cloning JSON");
			console.warn(e);
		console.groupEnd();
	}
	return newObject;
}

/**
 * Loops through all of the non-numeric properties of this object and runs them through decodeURIComponentEx
 *
 * @param obj
 * @return
 */
function decodeAllFields(obj) {
	for (prop in obj) {
		if (obj.hasOwnProperty(prop)) {
			if (typeof(obj[prop]) == "object") {
				decodeAllFields(obj[prop]);
			}
			else if (isNaN(obj[prop])) {
				obj[prop] = decodeURIComponentEx(obj[prop]);
			}
		}
	}
	return obj;
}

function selectCarHandler(req, forwardTo){
	return function(){
		if(req.readyState == 4) {
			if(req.status == 200){
				var res = extractJSON(req.responseText);
				if (res.rc != 0) {
					el("goButton").style.cursor = "default";
					el("modalCarSelErr").innerHTML = "Error selecting car.  If the problem persists contact customer support and provide error code " + res.rc;
					el("modalCarSelErr").style.display = "block";
					return;
				}
				var state=Get_Cookie("panelstate");
				state=state|1;
				if(!(state&2))state=state|8;
				Set_Cookie("panelstate",state);
				window.location.href=forwardTo;
			}
		}
	}
}


function handleCB(e) {
	var checkbox = null;
	if ($(e).is(".control-checkbox-check")) {
		checkbox = e;
	}
	else {
		checkbox = $(e).prev(".control-checkbox-check")[0];
	}
	var checkBoxOff = "0px 0px";
	var checkBoxOn = "0px -12px";
	var bgPos = checkbox.style.backgroundPosition;
	if (bgPos == "" || bgPos == checkBoxOff) {
	 	checkbox.style.backgroundPosition = checkBoxOn;
	 	return true;
	}
	else {
	 	checkbox.style.backgroundPosition = checkBoxOff;
	 	return false;
	}
}

function removeMCExcluded(seriesid) {
	try {
		if (multiClassSettings && multiClassSettings['carpopup.excluded_series']) {
			var es = [];
			es = multiClassSettings['carpopup.excluded_series'].split(",");
			var ndx = 0;
			while (es && ndx < es.length) {
				if (es[ndx] == seriesid) {
					es.splice(ndx, 1);
					continue;
				}
				ndx++;
			}
			multiClassSettings['carpopup.excluded_series'] = es.join(",");
			sendMemberPreferenceToHost("multiclass.carpopup.excluded_series", multiClassSettings['carpopup.excluded_series']);
		}
	}
	catch (err) {
	}
}

function addMCExcluded(seriesid) {
	try {
		var es = [];
		if (multiClassSettings && multiClassSettings['carpopup.excluded_series']) {
			es = multiClassSettings['carpopup.excluded_series'].split(",");
		}
		var found = false;
		var ndx = 0;
		while (ndx < es.length) {
			if (es[ndx++] == seriesid) {
				found = true;
				break;
			}
		}
		if (!found) {
			es.push(seriesid);
		}
		multiClassSettings['carpopup.excluded_series'] = es.join(",");
		sendMemberPreferenceToHost("multiclass.carpopup.excluded_series", multiClassSettings['carpopup.excluded_series']);
	}
	catch (err) {
	}
}

function removeCSDLink(parent, seriesId) {
	removeAllChildren(parent);
	parent.appendChild(element("span", {innerHTML:"WARNING:  You will not be prompted to select a car the next time you register for this series.<br>"}, {fontSize:"7pt"}));
	var link = parent.appendChild(element("a", {innerHTML:"Click here ", href:"javascript:void(0)"}, {fontSize:"7pt"}));
	link.seriesId = seriesId;
	link.onclick = function() {
		removeMCExcluded(this.seriesId);
		addCSDLink(this.parentNode, this.seriesId);
	}
	parent.appendChild(element("span",
			{innerHTML:"if you would like to re-enable this popup."}, {fontSize:"7pt"}));

}

function addCSDLink(parent, seriesId) {
	removeAllChildren(parent);
	var link = parent.appendChild(element("a", {innerHTML:"Click here ", href:"javascript:void(0)"}, {fontSize:"7pt"}));
	link.seriesId = seriesId;
	link.onclick = function() {
		addMCExcluded(this.seriesId);
		removeCSDLink(this.parentNode, this.seriesId);
	}
	parent.appendChild(element("span",
			{innerHTML:"if you do not want to be prompted to select a car when you register for future sessions in this series.  If you do this you can re-enable the popup from the general tab on the settings panel."}, {fontSize:"7pt"}));

}

/**
 * This is used in the race panel when there is a discrepancy between the track being displayed in the race panel and the track that is associated with
 * a "join session" link in the race panel.  The problem can arise when we are close to a week cutover (and thus a track cutover).
 *
 * @param track
 * @param session
 * @return
 */
function confirmRacePanelTrack(session, isOP) {
	/**
		Create and initialize a div to hold our dialog
	 */
	var div = el("confirmTrackDlg");
	if (!div) {
		var bgURL = "url(" + imageserver + "/member_images/multiclass/modal/modal-background.gif)";
		div = document.body.appendChild(element("div", {id:"confirmTrackDlg", className:"jqmWindow"}, {border:"1px solid black", height:"220px", zbackgroundImage:bgURL, textAlign:"left"}));
		$('#confirmTrackDlg').jqm({modal:true});
	}

	/**
		Populate our dialog with content (first remove any children in case we are coming back in here multiple times)
	 */
	removeAllChildren(div);
	var container = div.appendChild(element("div", {}, {margin:"0px", padding:"0px", marginLeft:"20px", marginTop:"10px"}));

	var title = container.appendChild(element("div", {innerHTML:"CONFIRM YOUR TRACK", className:"euro"}, {position:"relative", width:"560px", height:"30px", lineHeight:"30px", backgroundColor:"black", color:"white", textAlign:"center", fontWeight:"bold"}));
		var closeButton = title.appendChild(element("img", {className:"pointer", src:imageserver+"/member_images/multiclass/modal/modal-x.jpg"}, {position:"absolute", top:"8px", right:"5px"}));
		closeButton.onclick = function() {
			$("#confirmTrackDlg").jqmHide();
		}

	var sessionTrack = getTrackById(session.trackid);
	var div2 = container.appendChild(element("div", {}, {width:"538px", height:"148px", padding:"10px", border:"1px solid #aaaaaa", backgroundColor:"#eeeeee", margin:"0px"}));
		div2.appendChild(element("div", {innerHTML:"The session you selected will run at <b>" + sessionTrack.name + "</b>.  This is different from what is currently displayed in the race panel.  This can happen when we are close to a race week cutover.<br><br>Would you like to register for the session at <b>" + sessionTrack.name + "</b>?"}, {fontSize:"8pt", textAlign:"center"}));

		var goURL = "url(" + imageserver + "/member_images/multiclass/modal/modal-go.gif)";
		var goButton = div2.appendChild(element("div", {id:"goButton", className:"floatleft pointer"}, {width:"67px", height:"23px", backgroundImage:goURL, marginTop:"13px", marginLeft:"185px", marginBottom:"10px"}));
		goButton.onclick = function() {
			$("#confirmTrackDlg").jqmHide();
			if (isOP) {
				selectOpenSession("racepanel", session.subsessionid, session.seasonid);
			}
			else {
				selectSession("racepanel", session.sessionid, session.seasonid);
			}
		}

		var cancelURL = "url(" + imageserver + "/member_images/multiclass/modal/modal-cancel.gif)";
		var cancelButton = div2.appendChild(element("div", {className:"floatleft pointer"}, {width:"90px", height:"23px", backgroundImage:cancelURL, marginTop:"13px", marginLeft:"10px", marginBottom:"10px"}));
		cancelButton.onclick = function() {
			$("#confirmTrackDlg").jqmHide();
		}

		Cufon.replace(".euro");

	/** show the dialog **/
	$(div).jqmShow();

}

function selectSession(context, sessionId, seasonId) {

	/**
	 *	The first thing we need to do is get the season object
	 */
	var season = null;
	if (seasonId) {
		/**
		 * 	They passed in a seasonId so just do a simple lookup into SeasonListing
	 	 */
		season = getSeasonById(seasonId);
		if (!season) {
			return;
		}
	}
	else {
		/**
		 * They didn't pass in a seasonId so see if we can figure out the season from the sessionId
		 */
		season = getSeasonBySessionId(sessionId);
		if (!season) {
			return;
		}
	}

	/**
	 * If this is a single car session we can go straight to the registration
	 */
	if (season.cars.length == 1 || context == "racepanel") {
		var state=Get_Cookie("panelstate");
		state=state|1;
		if(!(state&2))state=state|8;
		Set_Cookie("panelstate",state);
		window.location.href=contextpath+"/member/RegisterForSession.do?&sessionid="+sessionId+"&regloc="+context+"&nocache="+new Date().getTime();
		return;
	}

	var pref = multiClassSettings['carpopup.excluded_series'];
	if (pref) {
		var ids = pref.split(",");
		var ndx = 0;
		while (ids && ndx < ids.length) {
			if (ids[ndx] == season.seriesid) {
				var state=Get_Cookie("panelstate");
				state=state|1;
				if(!(state&2))state=state|8;
				Set_Cookie("panelstate",state);
				window.location.href=contextpath+"/member/RegisterForSession.do?&sessionid="+sessionId+"&regloc="+context+"&nocache="+new Date().getTime();
				return;
			}
			ndx++;
		}
	}

	/**
		Create and initialize a div to hold our dialog
	 */
	var div = el("selectCarDlg");
	if (!div) {
		var bgURL = "url(" + imageserver + "/member_images/multiclass/modal/modal-background.gif)";
		div = document.body.appendChild(element("div", {id:"selectCarDlg", className:"jqmWindow"}, {backgroundImage:bgURL, textAlign:"left"}));
		$('#selectCarDlg').jqm({modal:true});
	}

	/**
		Populate our dialog with content (first remove any children in case we are coming back in here multiple times)
	 */
	removeAllChildren(div);
	var container = div.appendChild(element("div", {}, {margin:"0px", padding:"0px", marginLeft:"20px", marginTop:"10px"}));

	var titleURL = "url(" + imageserver + "/member_images/multiclass/modal/modal-select-a-car.gif)";
	var title = container.appendChild(element("div", {}, {width:"560px", height:"30px", backgroundImage:titleURL, textAlign:"right"}));
		var closeButton = title.appendChild(element("img", {src:imageserver+"/member_images/multiclass/modal/modal-cancel.jpg"}, {marginTop:"8px", marginRight:"8px"}));
		closeButton.onclick = function() {
			$("#selectCarDlg").jqmHide();
		}
		closeButton.onmouseover = function() {
			this.style.cursor = "pointer";
		}
		closeButton.onmouseout = function() {
			this.style.cursor = "default";
		}

	var div2 = container.appendChild(element("div", {}, {width:"538px", height:"87px", padding:"10px", border:"1px solid #aaaaaa", backgroundColor:"#eeeeee", margin:"0px"}));
		div2.appendChild(element("div", {innerHTML:"This is a multi-car session.  Select the car you would like to drive and press the 'Go' button."}, {fontSize:"8pt", textAlign:"center"}));
			var carSelect = div2.appendChild(element("select", {id:"carSelect"}, {width:"300px", fontSize:"8pt", cssFloat:"left", styleFloat:"left", marginTop:"15px", marginLeft:"74px"}));
			var y = 0;
			while (y < season.carclasses.length) {
				var carclass = season.carclasses[y++];
				var z = 0;
				while (carclass && carclass.carsinclass && z < carclass.carsinclass.length) {
					var car = carclass.carsinclass[z++];
					if (ownsCar(car.id)) {
						var label = decodeURIComponent(carclass.shortname) + " : " + decodeURIComponent(car.name);
						carSelect.appendChild(element("option", {innerHTML:label, value:car.id}, {fontSize:"8pt"}));
					}
				}
			}
			selectOption(carSelect, racingpaneldata.car.id);

		var goURL = "url(" + imageserver + "/member_images/multiclass/modal/modal-go.gif)";
		var goButton = div2.appendChild(element("div", {id:"goButton"}, {width:"67px", height:"23px", backgroundImage:goURL, cssFloat:"left", styleFloat:"left", marginTop:"13px", marginLeft:"25px", marginBottom:"10px"}));
		goButton.carSelect = carSelect;
		goButton.seasonId = season.seasonid;
		goButton.processing = false;
		goButton.onclick = function() {
			if (this.processing) {
				return;
			}
			this.processing = true;
			el("modalCarSelErr").innerHTML = "";
			el("modalCarSelErr").style.display = "none";
			this.style.cursor = "wait";
			var parms={}
			parms['carId'] = this.carSelect.value;
			parms['seasonId'] = this.seasonId;
			var gotoURL = contextpath+"/member/RegisterForSession.do?&sessionid="+sessionId+"&regloc="+context+"&nocache="+new Date().getTime();
			var buf = load(contextpath+"/member/SelectCar",parms, selectCarHandler, gotoURL);
		}
		goButton.onmouseover = function() {
			this.style.cursor = "pointer";
		}
		goButton.onmouseout = function() {
			this.style.cursor = "default";
		}

		div2.appendChild(element("div", {id:"modalCarSelErr"}, {clear:"both", fontSize:"7pt", width:"535px", color:"red", display:"none", textAlign:"center"}));

		var hideDiv = div2.appendChild(element("div", {}, {clear:"both", position:"relative", marginLeft:"10px"}));
			addCSDLink(hideDiv, season.seriesid);


	/** show the dialog **/
	$(div).jqmShow();
}


function selectOpenSession(context, subSessionId, seasonId) {
	/**
	 * 	We need access to the season to see if this is multicar
	 */
	var season = getSeasonById(seasonId);
	if (!season) {
		return;
	}

	/**
	 * If this is a single car session we can go straight to the registration
	 */
	if (season.cars.length == 1 || context == "racepanel") {
		var state=Get_Cookie("panelstate");
		state=state|1;
		if(!(state&2))state=state|8;
		Set_Cookie("panelstate",state);
		window.location.href=contextpath+"/member/RegisterForOpenSession.do?&subsessionid="+subSessionId+"&regloc="+context+"&nocache="+new Date().getTime();
		return;
	}

	var pref = multiClassSettings['carpopup.excluded_series'];
	if (pref) {
		var a = pref.split(",");
		for (var s in a) {
			if (s == season.seriesid) {
				var state=Get_Cookie("panelstate");
				state=state|1;
				if(!(state&2))state=state|8;
				Set_Cookie("panelstate",state);
				window.location.href=contextpath+"/member/RegisterForOpenSession.do?&subsessionid="+subSessionId+"&regloc="+context+"&nocache="+new Date().getTime();
				return;
			}
		}
	}

	/**
		Create and initialize a div to hold our dialog
	 */
	var div = el("selectCarDlg");
	if (!div) {
		var bgURL = "url(" + imageserver + "/member_images/multiclass/modal/modal-background.gif)";
		div = document.body.appendChild(element("div", {id:"selectCarDlg", className:"jqmWindow"}, {backgroundImage:bgURL, textAlign:"left"}));
		$('#selectCarDlg').jqm({modal:true});
	}

	/**
		Populate our dialog with content (first remove any children in case we are coming back in here multiple times)
	 */
	removeAllChildren(div);
	var container = div.appendChild(element("div", {}, {margin:"0px", padding:"0px", marginLeft:"20px", marginTop:"10px"}));
	var titleURL = "url(" + imageserver + "/member_images/multiclass/modal/modal-select-a-car.gif)";
	var title = container.appendChild(element("div", {}, {width:"560px", height:"30px", backgroundImage:titleURL, textAlign:"right"}));
		var closeButton = title.appendChild(element("img", {src:imageserver+"/member_images/multiclass/modal/modal-cancel.jpg"}, {marginTop:"8px", marginRight:"8px"}));
		closeButton.onclick = function() {
			$("#selectCarDlg").jqmHide();
		}
		closeButton.onmouseover = function() {
			this.style.cursor = "pointer";
		}
		closeButton.onmouseout = function() {
			this.style.cursor = "default";
		}

	var div2 = container.appendChild(element("div", {}, {width:"538px", height:"87px", padding:"10px", border:"1px solid #aaaaaa", backgroundColor:"#eeeeee", margin:"0px"}));
		div2.appendChild(element("div", {innerHTML:"This is a multi-car session.  Select the car you would like to drive and press the 'Go' button."}, {fontSize:"8pt", textAlign:"center"}));

		var carSelect = div2.appendChild(element("select", {}, {width:"300px", fontSize:"8pt", cssFloat:"left", styleFloat:"left", marginTop:"15px", marginLeft:"74px"}));
		var y = 0;
		while (y < season.carclasses.length) {
			var carclass = season.carclasses[y++];
			var z = 0;
			while (carclass && carclass.carsinclass && z < carclass.carsinclass.length) {
				var car = carclass.carsinclass[z++];
				if (ownsCar(car.id)) {
					var label = decodeURIComponent(carclass.shortname) + " : " + decodeURIComponent(car.name);
					carSelect.appendChild(element("option", {innerHTML:label, value:car.id}, {fontSize:"8pt"}));
				}
			}
		}
		selectOption(carSelect, racingpaneldata.car.id);

		var goURL = "url(" + imageserver + "/member_images/multiclass/modal/modal-go.gif)";
		var goButton = div2.appendChild(element("div", {}, {width:"67px", height:"23px", backgroundImage:goURL, cssFloat:"left", styleFloat:"left", marginTop:"13px", marginLeft:"25px", marginBottom:"10px"}));
		goButton.carSelect = carSelect;
		goButton.seasonId = seasonId;
		goButton.processing = false;
		goButton.onclick = function() {
			if (this.processing) {
				return;
			}
			this.processing = true;
			this.style.cursor = "wait";
			var parms={}
			parms['carId'] = this.carSelect.value;
			parms['seasonId'] = this.seasonId;
			var gotoURL = contextpath+"/member/RegisterForOpenSession.do?&subsessionid="+subSessionId+"&regloc="+context+"&nocache="+new Date().getTime();
			var buf = load(contextpath+"/member/SelectCar",parms, selectCarHandler, gotoURL);
		}
		goButton.onmouseover = function() {
			this.style.cursor = "pointer";
		}
		goButton.onmouseout = function() {
			this.style.cursor = "default";
		}

		var hideDiv = div2.appendChild(element("div", {}, {clear:"both", position:"relative", marginLeft:"10px"}));
			addCSDLink(hideDiv, season.seriesid);

		/** show the dialog **/
		$(div).jqmShow();
}

function registerAsSpectator(subsessionid, season, role, context) {
	var suffix = "";
	if (role) {
		suffix = "&rl=" + role;
	}
	if (context) {
		suffix = suffix + "&context=" + context;
	}

	var state=Get_Cookie("panelstate");
	state=state|1;
	if(!(state&2))state=state|8;
	Set_Cookie("panelstate",state);

	/**
	 * If this is a single car session we can go straight to the registration
	 */
	if (season.cars.length == 1 || context == "racepanel") {
		document.location.href = contextpath+"/member/RegisterAsSpectator.do?subsessionid=" + subsessionid + suffix;
		return;
	}

	/**
	 * Multicar
	 */
	var pref = multiClassSettings['carpopup.excluded_series'];
	if (pref) {
		var ids = pref.split(",");
		var ndx = 0;
		while (ids && ndx < ids.length) {
			if (ids[ndx] == season.seriesid) {
				document.location.href = contextpath+"/member/RegisterAsSpectator.do?subsessionid=" + subsessionid + suffix;
				return;
			}
			ndx++;
		}
	}

	/**
		Create and initialize a div to hold our dialog
	 */
	var div = el("selectCarDlg");
	if (!div) {
		var bgURL = "url(" + imageserver + "/member_images/multiclass/modal/modal-background.gif)";
		div = document.body.appendChild(element("div", {id:"selectCarDlg", className:"jqmWindow"}, {backgroundImage:bgURL, textAlign:"left"}));
		$('#selectCarDlg').jqm({modal:true});
	}

	/**
		Populate our dialog with content (first remove any children in case we are coming back in here multiple times)
	 */
	removeAllChildren(div);
	var container = div.appendChild(element("div", {}, {margin:"0px", padding:"0px", marginLeft:"20px", marginTop:"10px"}));

	var titleURL = "url(" + imageserver + "/member_images/multiclass/modal/modal-select-a-car.gif)";
	var title = container.appendChild(element("div", {}, {width:"560px", height:"30px", backgroundImage:titleURL, textAlign:"right"}));
		var closeButton = title.appendChild(element("img", {src:imageserver+"/member_images/multiclass/modal/modal-cancel.jpg"}, {marginTop:"8px", marginRight:"8px"}));
		closeButton.onclick = function() {
			$("#selectCarDlg").jqmHide();
		}
		closeButton.onmouseover = function() {
			this.style.cursor = "pointer";
		}
		closeButton.onmouseout = function() {
			this.style.cursor = "default";
		}

	var div2 = container.appendChild(element("div", {}, {width:"538px", height:"87px", padding:"10px", border:"1px solid #aaaaaa", backgroundColor:"#eeeeee", margin:"0px"}));
		div2.appendChild(element("div", {innerHTML:"This is a multi-car session.  We ask you to select a car in case you decide to drive a ghost car in sim.  Please select a car and press the 'Go' button."}, {fontSize:"8pt", textAlign:"center"}));
			var carSelect = div2.appendChild(element("select", {id:"carSelect"}, {width:"300px", fontSize:"8pt", cssFloat:"left", styleFloat:"left", marginTop:"15px", marginLeft:"74px"}));
			var y = 0;
			while (y < season.carclasses.length) {
				var carclass = season.carclasses[y++];
				var z = 0;
				while (carclass && carclass.carsinclass && z < carclass.carsinclass.length) {
					var car = carclass.carsinclass[z++];
					if (ownsCar(car.id)) {
						var label = decodeURIComponent(carclass.shortname) + " : " + decodeURIComponent(car.name);
						carSelect.appendChild(element("option", {innerHTML:label, value:car.id}, {fontSize:"8pt"}));
					}
				}
			}
			selectOption(carSelect, racingpaneldata.car.id);

		var goURL = "url(" + imageserver + "/member_images/multiclass/modal/modal-go.gif)";
		var goButton = div2.appendChild(element("div", {id:"goButton"}, {width:"67px", height:"23px", backgroundImage:goURL, cssFloat:"left", styleFloat:"left", marginTop:"13px", marginLeft:"25px", marginBottom:"10px"}));
		goButton.carSelect = carSelect;
		goButton.seasonId = season.seasonid;
		goButton.processing = false;
		goButton.onclick = function() {
			if (this.processing) {
				return;
			}
			this.processing = true;
			el("modalCarSelErr").innerHTML = "";
			el("modalCarSelErr").style.display = "none";
			this.style.cursor = "wait";
			var parms={}
			parms['carId'] = this.carSelect.value;
			parms['seasonId'] = this.seasonId;
			var gotoURL = contextpath+"/member/RegisterAsSpectator.do?subsessionid=" + subsessionid  + "&carId=" + this.carSelect.value + suffix;
			//var gotoURL = contextpath+"/member/RegisterForSession.do?&sessionid="+sessionId+"&regloc="+context+"&nocache="+new Date().getTime();
			var buf = load(contextpath+"/member/SelectCar",parms, selectCarHandler, gotoURL);
		}
		goButton.onmouseover = function() {
			this.style.cursor = "pointer";
		}
		goButton.onmouseout = function() {
			this.style.cursor = "default";
		}

		div2.appendChild(element("div", {id:"modalCarSelErr"}, {clear:"both", fontSize:"7pt", width:"535px", color:"red", display:"none", textAlign:"center"}));

		var hideDiv = div2.appendChild(element("div", {}, {clear:"both", position:"relative", marginLeft:"10px"}));
			addCSDLink(hideDiv, season.seriesid);


	/** show the dialog **/
	$(div).jqmShow();

}

function registerAsSpectatorForHosted(subsessionid, privateSessionId, carIds, role, context, password) {
	var suffix = "";
	if (role) {
		suffix = "&rl=" + role;
	}
	if (context) {
		suffix = suffix + "&context=" + context;
	}
	if (password) {
		suffix = suffix + "&password=" + password;
	}

	var state=Get_Cookie("panelstate");
	state=state|1;
	if(!(state&2))state=state|8;
	Set_Cookie("panelstate",state);

	if (carIds.length == 1) {
		document.location.href = contextpath+"/member/RegisterAsSpectatorForHosted.do?subsessionid=" + subsessionid + suffix;
		return;
	}

	/**
	  This is a multi-car session so we're going to display a modal dialog to get their car selection.  This is a multi-step
	  process:
	  	1) Create a top level empty div if it doesn't already exist.  This will hold the dialog.
		2) Make the jqModal ui call to turn the div into a modal dialog (first time only)
		3) Populate the modal dialog with content
		4) Display the dialog
	*/
	var div = el("selectCarDlg");
	if (!div) {
		var bgURL = "url(" + imageserver + "/member_images/multiclass/modal/modal-background.gif)";
		div = document.body.appendChild(element("div", {id:"selectCarDlg", className:"jqmWindow"}, {backgroundImage:bgURL, textAlign:"left"}));
		$('#selectCarDlg').jqm({modal:true});
	}

	removeAllChildren(div);
	var container = div.appendChild(element("div", {}, {margin:"0px", padding:"0px", marginLeft:"20px", marginTop:"10px"}));
		var titleURL = "url(" + imageserver + "/member_images/multiclass/modal/modal-select-a-car.gif)";
		var title = container.appendChild(element("div", {}, {width:"560px", height:"30px", backgroundImage:titleURL, textAlign:"right"}));
			var closeButton = title.appendChild(element("img", {src:imageserver+"/member_images/multiclass/modal/modal-cancel.jpg"}, {marginTop:"8px", marginRight:"8px"}));
			closeButton.onclick = function() {
				$("#selectCarDlg").jqmHide();
			}
			closeButton.onmouseover = function() {
				this.style.cursor = "pointer";
			}
			closeButton.onmouseout = function() {
				this.style.cursor = "default";
			}
		var div2 = container.appendChild(element("div", {}, {width:"538px", height:"87px", padding:"10px", border:"1px solid #aaaaaa", backgroundColor:"#eeeeee", margin:"0px"}));
			div2.appendChild(element("div", {innerHTML:"This is a multi-car session.  We ask you to select a car in case you decide to drive a ghost car in sim.  Please select a car and press the 'Go' button."}, {fontSize:"8pt", textAlign:"center"}));
			var carSelect = div2.appendChild(element("select", {id:"carSelect"}, {width:"240px", fontSize:"8pt", cssFloat:"left", styleFloat:"left", marginTop:"15px", marginLeft:"126px"}));
			var y = 0;
			while (y < carIds.length) {
				var car = getCarById(carIds[y++]);
				if (ownsCar(car.id)) {
					carSelect.appendChild(element("option", {innerHTML:decodeURIComponent(car.name), value:car.id}, {fontSize:"8pt"}));
				}
			}

			selectOption(carSelect, racingpaneldata.car.id);
			var goURL = "url(" + imageserver + "/member_images/multiclass/modal/modal-go.gif)";
			var goButton = div2.appendChild(element("div", {id:"goButton"}, {width:"67px", height:"23px", backgroundImage:goURL, cssFloat:"left", styleFloat:"left", marginTop:"13px", marginLeft:"5px"}));
			goButton.carSelect = carSelect;
			goButton.processing = false;
			goButton.onclick = function() {
				if (this.processing) {
					return;
				}
				this.processing = true;
				el("modalCarSelErr").innerHTML = "";
				el("modalCarSelErr").style.display = "none";
				this.style.cursor = "wait";
				var parms={}
				var carId = this.carSelect.value;
				parms['carId'] = carId;
				parms['privateSessionId'] = privateSessionId;
				var pw = "";
				if (password) {
					pw = password;
				}
				var gotoURL = contextpath+"/member/RegisterAsSpectatorForHosted.do?subsessionid=" + subsessionid + "&carId=" + carId + suffix;
				//var gotoURL = contextpath+"/member/RegisterForHostedSession.do?&subsessionid="+sessionId+"&regloc="+context+"&privatesessionid="+privateSessionId+"&trackId="+trackId+"&carId="+carId+"&password="+pw+"&nocache="+new Date().getTime();
				var buf = load(contextpath+"/member/SelectHostedCar",parms, selectHostedCarHandler, gotoURL);
			}

			div2.appendChild(element("div", {id:"modalCarSelErr"}, {fontSize:"7pt", clear:"both", width:"535px", color:"red", display:"none", textAlign:"center"}));
	$(div).jqmShow();

}

function registerAsSpotter(sid, ssid, driverId, password, context, pvtid) {
	logToConsole("> registerAsSpotter");
	logToConsole("sid = " + sid);
	logToConsole("ssid = " + ssid);
	logToConsole("driverId = " + driverId);
	logToConsole("password = " + password);
	logToConsole("context = " + context);
	logToConsole("pvtid = " + pvtid);

	/**
	 * I don't know if we need this panel stuff
	 */
	var state=Get_Cookie("panelstate");
	state=state|1;
	if(!(state&2))state=state|8;
	Set_Cookie("panelstate",state);

	/**
	 * For spotter sessions we don't need to worry about car selection with multicar sessions.  On the back end we'll grab
	 * the same car our driver selected
	 */
	var url = contextpath+"/member/RegisterAsSpotter.do?sid=" + sid + "&ssid=" + ssid + "&did=" + driverId + "&pw=" + password + "&cxt=" + context + "&pvtid=" + pvtid;
	//alert("registerAsSpotter using " + url)
	document.location.href = url;
}

/**
 * Returns the current size of the browser window
 */
function getWindowSize() {
  var myWidth = 0, myHeight = 0;
  if( typeof( window.innerWidth ) == 'number' ) {
    //Non-IE
    myWidth = window.innerWidth;
    myHeight = window.innerHeight;
  } else if( document.documentElement && ( document.documentElement.clientWidth || document.documentElement.clientHeight ) ) {
    //IE 6+ in 'standards compliant mode'
    myWidth = document.documentElement.clientWidth;
    myHeight = document.documentElement.clientHeight;
  } else if( document.body && ( document.body.clientWidth || document.body.clientHeight ) ) {
	//IE 4 compatible
    myWidth = document.body.clientWidth;
    myHeight = document.body.clientHeight;
  }
  return [myWidth, myHeight];
}



function selectHostedSession(context, sessionId, privateSessionId, trackId, carIds, password) {
	/**
	 * If this is a single car session we can go straight to the registration
	 */
	if (carIds.length == 1) {
		var state=Get_Cookie("panelstate");
		state=state|1;
		if(!(state&2))state=state|8;
		Set_Cookie("panelstate",state);
		var pw = "";
		if (password) {
			pw = encodeURIComponent(password);
		}
		window.location.href = contextpath+"/member/RegisterForHostedSession.do?&subsessionid="+sessionId+"&regloc="+context+"&privatesessionid="+privateSessionId+"&trackId="+trackId+"&carId="+carIds[0]+"&password="+pw+"&nocache="+new Date().getTime();
		return;
	}

	/**
	  This is a multi-car session so we're going to display a modal dialog to get their car selection.  This is a multi-step
	  process:
	  	1) Create a top level empty div if it doesn't already exist.  This will hold the dialog.
		2) Make the jqModal ui call to turn the div into a modal dialog (first time only)
		3) Populate the modal dialog with content
		4) Display the dialog
	*/
	var div = el("selectCarDlg");
	if (!div) {
		var bgURL = "url(" + imageserver + "/member_images/multiclass/modal/modal-background.gif)";
		div = document.body.appendChild(element("div", {id:"selectCarDlg", className:"jqmWindow"}, {backgroundImage:bgURL, textAlign:"left"}));
		$('#selectCarDlg').jqm({modal:true});
	}

	removeAllChildren(div);
	var container = div.appendChild(element("div", {}, {margin:"0px", padding:"0px", marginLeft:"20px", marginTop:"10px"}));
		var titleURL = "url(" + imageserver + "/member_images/multiclass/modal/modal-select-a-car.gif)";
		var title = container.appendChild(element("div", {}, {width:"560px", height:"30px", backgroundImage:titleURL, textAlign:"right"}));
			var closeButton = title.appendChild(element("img", {src:imageserver+"/member_images/multiclass/modal/modal-cancel.jpg"}, {marginTop:"8px", marginRight:"8px"}));
			closeButton.onclick = function() {
				$("#selectCarDlg").jqmHide();
			}
			closeButton.onmouseover = function() {
				this.style.cursor = "pointer";
			}
			closeButton.onmouseout = function() {
				this.style.cursor = "default";
			}
		var div2 = container.appendChild(element("div", {}, {width:"538px", height:"87px", padding:"10px", border:"1px solid #aaaaaa", backgroundColor:"#eeeeee", margin:"0px"}));
			div2.appendChild(element("div", {innerHTML:"This is a multi-car session.  Select the car you would like to drive and press the 'Go' button."}, {fontSize:"8pt", textAlign:"center"}));
			var carSelect = div2.appendChild(element("select", {id:"carSelect"}, {width:"240px", fontSize:"8pt", cssFloat:"left", styleFloat:"left", marginTop:"15px", marginLeft:"126px"}));
			var y = 0;
			while (y < carIds.length) {
				var car = getCarById(carIds[y++]);
				if (ownsCar(car.id)) {
					carSelect.appendChild(element("option", {innerHTML:decodeURIComponent(car.name), value:car.id}, {fontSize:"8pt"}));
				}
			}

			selectOption(carSelect, racingpaneldata.car.id);
			var goURL = "url(" + imageserver + "/member_images/multiclass/modal/modal-go.gif)";
			var goButton = div2.appendChild(element("div", {id:"goButton"}, {width:"67px", height:"23px", backgroundImage:goURL, cssFloat:"left", styleFloat:"left", marginTop:"13px", marginLeft:"5px"}));
			goButton.carSelect = carSelect;
			goButton.processing = false;
			goButton.onclick = function() {
				if (this.processing) {
					return;
				}
				this.processing = true;
				el("modalCarSelErr").innerHTML = "";
				el("modalCarSelErr").style.display = "none";
				this.style.cursor = "wait";
				var parms={}
				var carId = this.carSelect.value;
				parms['carId'] = carId;
				parms['privateSessionId'] = privateSessionId;
				var pw = "";
				if (password) {
					pw = encodeURIComponent(password);
				}
				var gotoURL = contextpath+"/member/RegisterForHostedSession.do?&subsessionid="+sessionId+"&regloc="+context+"&privatesessionid="+privateSessionId+"&trackId="+trackId+"&carId="+carId+"&password="+pw+"&nocache="+new Date().getTime();
				var buf = load(contextpath+"/member/SelectHostedCar",parms, selectHostedCarHandler, gotoURL);
			}

			div2.appendChild(element("div", {id:"modalCarSelErr"}, {fontSize:"7pt", clear:"both", width:"535px", color:"red", display:"none", textAlign:"center"}));
	$(div).jqmShow();
}

function selectHostedCarHandler(req, forwardTo){
	return function(){
		if(req.readyState == 4) {
			if(req.status == 200){
				var res = extractJSON(req.responseText);
				if (res.rc != 0) {
					el("goButton").style.cursor = "default";
					el("modalCarSelErr").innerHTML = "<br>Error selecting car.  If the problem persists contact customer support and provide error code " + res.rc;
					el("modalCarSelErr").style.display = "block";
					return;
				}
				var state=Get_Cookie("panelstate");
				state=state|1;
				if(!(state&2))state=state|8;
				Set_Cookie("panelstate",state);
				window.location.href=forwardTo;
			}
		}
	}
}

var getElementsByClassName = function (className, tag, elm){
	if (document.getElementsByClassName) {
		getElementsByClassName = function (className, tag, elm) {
			elm = elm || document;
			var elements = elm.getElementsByClassName(className),
				nodeName = (tag)? new RegExp("\\b" + tag + "\\b", "i") : null,
				returnElements = [],
				current;
			for(var i=0, il=elements.length; i<il; i+=1){
				current = elements[i];
				if(!nodeName || nodeName.test(current.nodeName)) {
					returnElements.push(current);
				}
			}
			return returnElements;
		};
	}
	else if (document.evaluate) {
		getElementsByClassName = function (className, tag, elm) {
			tag = tag || "*";
			elm = elm || document;
			var classes = className.split(" "),
				classesToCheck = "",
				xhtmlNamespace = "http://www.w3.org/1999/xhtml",
				namespaceResolver = (document.documentElement.namespaceURI === xhtmlNamespace)? xhtmlNamespace : null,
				returnElements = [],
				elements,
				node;
			for(var j=0, jl=classes.length; j<jl; j+=1){
				classesToCheck += "[contains(concat(' ', @class, ' '), ' " + classes[j] + " ')]";
			}
			try	{
				elements = document.evaluate(".//" + tag + classesToCheck, elm, namespaceResolver, 0, null);
			}
			catch (e) {
				elements = document.evaluate(".//" + tag + classesToCheck, elm, null, 0, null);
			}
			while ((node = elements.iterateNext())) {
				returnElements.push(node);
			}
			return returnElements;
		};
	}
	else {
		getElementsByClassName = function (className, tag, elm) {
			tag = tag || "*";
			elm = elm || document;
			var classes = className.split(" "),
				classesToCheck = [],
				elements = (tag === "*" && elm.all)? elm.all : elm.getElementsByTagName(tag),
				current,
				returnElements = [],
				match;
			for(var k=0, kl=classes.length; k<kl; k+=1){
				classesToCheck.push(new RegExp("(^|\\s)" + classes[k] + "(\\s|$)"));
			}
			for(var l=0, ll=elements.length; l<ll; l+=1){
				current = elements[l];
				match = false;
				for(var m=0, ml=classesToCheck.length; m<ml; m+=1){
					match = classesToCheck[m].test(current.className);
					if (!match) {
						break;
					}
				}
				if (match) {
					returnElements.push(current);
				}
			}
			return returnElements;
		};
	}
	return getElementsByClassName(className, tag, elm);
};

function createCheckbox(id, props, label, labelClass, defValue, callback) {
	var cbProps = props;
	if (!cbProps) {
		cbProps = {};
	}
	cbProps['cursor'] = "pointer";
	var cb = element("div", {id:id}, cbProps);
	cb.callback = callback;
	cb.onmousedown = function() {
		return false;
	}
	cb.onmouseup = function() {
		var check=getElementsByClassName("checkboxChecked", "img", this)[0];
		if (check.style.visibility == "hidden") {
			check.style.visibility = "visible";
		}
		else {
			check.style.visibility="hidden";
		}
		if (this.callback) {
			callback(check.style.visibility == "visible", id);
		}
	}
	var div = cb.appendChild(element("div", {}, {position:"relative"}));
	div.appendChild(element("img", {src:imageserver+"/member_images/multiclass/filter/checkboxUnchecked.gif"}, {width:"12px",height:"12px",position:"absolute",top:"2px",left:"2px"}));
	var check = div.appendChild(element("img", {className:"checkboxChecked",src:imageserver+"/member_images/results/xicon.gif"},
			{width:"12px",height:"12px",position:"absolute",top:"2px",left:"2px", visibility:"hidden"}));
	if (defValue && defValue == true) {
		check.style.visibility = "visible";
	}
	div.appendChild(element("div", {innerHTML:label, className:labelClass}));
	return cb;
}

function dumpProperties(obj, label) {
	logToConsole("> dumpProperties " + label);
	for (var prop in obj) {
		logToConsole(prop + " = " + obj[prop]);
	}
	logToConsole("< dumpProperties " + label);
}

function createFriendLinks(div, driverCustId, fsClass) {
	removeAllChildren(div);

	var friend = (FriendsListing[driverCustId]?FriendsListing[driverCustId]:0);
	var isWatched = (WatchedListing[driverCustId]?true:false);

	var friendLinkText = "Send Friend Request";
	if (friend==1) {
		friendLinkText = "Remove Friend";
	}else if(friend==2){
		friendLinkText = "Revoke Friend Request";
	}else if(friend==3){
		friendLinkText = "Accept Friend Request";
	}

	var watchedLinkText = "Add Studied";
	if (isWatched) {
		watchedLinkText = "Remove Studied";
	}

	var linkClass = (fsClass ? fsClass : "fsLink");
	var linkDiv = div.appendChild(element("div", {}, {textAlign:"center"}));
	linkDiv.style.width = div.style.width;
	linkDiv.style.height = div.style.height;
	var friendDiv = linkDiv.appendChild(element("span", {innerHTML:friendLinkText, className:linkClass}, {}));
	friendDiv.onclick = function() {
		var url;
		if (friend==0) {
			url = contextpath+"/member/SendFriendRequest";
		}else if(friend==1) {
			url = contextpath+"/member/RemoveFriend";
		}else if(friend==2) {
			url = contextpath+"/member/RevokeFriendRequest";
		}else if(friend==3) {
			url = contextpath+"/member/AcceptFriendRequest";
		}
		var result=load(url,{custid:driverCustId});
		if (result > -1 && result <4 ) {
			//we added / removed this guy from our friends list on the back end - update our local list and recreate the links
			FriendsListing[driverCustId] = result;
		}
		createFriendLinks(div, driverCustId, fsClass);
	}
	friendDiv.onmouseover = function() {
		this.style.cursor = "pointer";
	}
	friendDiv.onmouseout = function() {
		this.style.cursor = "default";
	}
	linkDiv.appendChild(element("span", {innerHTML:"|", className:linkClass}));
	var watchedDiv = linkDiv.appendChild(element("span", {innerHTML:watchedLinkText, className:linkClass}));
	watchedDiv.onclick = function() {
		var url;
		if (isWatched) {
			url = contextpath+"/member/RemoveWatched";
		}
		else {
			url = contextpath+"/member/AddWatched";
		}
		var result=load(url,{custid:driverCustId});
		if (result=="1") {
			// we added / removed this guy from our watched list on the back end - update our local list and recreate the links --%>
			if (isWatched) {
				WatchedListing[driverCustId] = 0;
			}
			else {
				WatchedListing[driverCustId] = 1;
			}
		}
		createFriendLinks(div, driverCustId, fsClass);
	}
	watchedDiv.onmouseover = function() {
		this.style.cursor = "pointer";
	}
	watchedDiv.onmouseout = function() {
		this.style.cursor = "default";
	}
}

/**
 * This converts html <'s and >'s into {'s and }'s so the content won't be rendered as html.  We using this with the member profile stuff to ensure
 * that people can't inject html into our site from their member bio.
 *
 * @param strInputCode
 * @return
 */
function removeHTMLTags(strInputCode) {
	strInputCode = strInputCode.replace(/&(lt|gt);/g, function (strMatch, p1){
 		 	return (p1 == "lt")? "<" : ">";
 	});
	var res = strInputCode.replace(/</g, "{").replace(/>/g, "}");
 	return res;
}

function truncateToNDecPts(value, numDecPts) {
	var pts = 2;
	if (numDecPts) {
		if (numDecPts < 0) {
			pts = 0;
		}
		if (numDecPts > 5) {
			pts = 5;
		}
	}
	var buf = "" + value;
	var ndx = buf.indexOf(".");
	if (ndx < 0) {
		return buf;
	}
	return buf.substring(0, ndx + numDecPts + 1);
}

//<%-- Car popup --%>
CarPopup = {};
CarPopup.buildPopupCar = function(data,left,top){
		var popup=element("div",{},{zIndex:"3",position:"absolute",top:top+"px",left:left+"px",padding:"5px",backgroundColor:"white",border:"1px solid black",textAlign:"center"});
			popup.appendChild(element("div",{innerHTML:unescape(data.name),className:"bold"},{paddingTop:"10px"}));
			var imgdiv=popup.appendChild(element("div",{className:"car_size2"}));
			imgpreload(data.img,imgdiv,"car_size2");
		popup.onmouseout=function(e){removePopupOnBody(this.parentNode,e);}
		return popup;
}

CarPopup.mashPopupCar = function(layernode,img,name){
	var offsets=getOffsets(layernode);
	buildPopupOnBody({img:img,name:name},layernode,CarPopup.buildPopupCar,offsets.left+49,offsets.top-136)();
}
//<%-- End Car popup --%>

function limitTextAreaChars(textarea, maxChars) {
	return;
	if (!textarea) {
		return;
	}
	textarea.maxChars = maxChars;
	textarea.onkeydown = function() {
		if (this.value.length > maxChars) {
			this.value = this.value.substring(0, this.maxChars);
		}
	}
	textarea.onkeyup = onkeydown;
}

function isURL(value) {
	var url_pattern = new RegExp("((http|https)(:\/\/))?([a-zA-Z0-9\-]+[.]{1}){2}[a-zA-z0-9\-]+(\/{1}[a-zA-Z0-9\-]+)*\/?", "i");
	if(url_pattern.exec(value) == null || url_pattern.exec(value).index > 0) {
  		return false;
	}

	/**
	 * At this point it looks like a url but we want to ignore any strings that look like they could be dates
	 */
	var date_pattern = new RegExp("[0-9]+[ /.-][0-9]+[ /.-][0-9]+", "i");
	if(date_pattern.exec(value) != null && date_pattern.exec(value).index >= 0) {
  		return false;
	}


	return true;
}

function html_entity_decode(str) {
	var ta=document.createElement("textarea");
	ta.innerHTML=str.replace(/</g,"&lt;").replace(/>/g,"&gt;");
	return ta.value;
}

function serverLog(dest, msg) {
	try {
		var parms={}
		parms['logDest'] = dest;
		parms['logMsg'] = encodeURIComponent(msg);
		load(contextpath+"/member/LogSomething",parms,dummyAjaxHandler);
	}
	catch (err) {
		logToConsole("serverLog exception: " + err);
	}
}

function stopPropagation(e) {
	if (window.event) {
		e.cancelBubble=true; // IE
	} else {
		e.stopPropagation(); // Others
	}
}

function browserUses24HourClock() {
	var now = new Date();
	var localStr = now.toLocaleTimeString().toLowerCase();
	if (localStr.indexOf("am") >= 0 || localStr.indexOf("pm") >= 0) {
		return false;
	}
	return true;
}

function isSameDay(t1, t2) {
	var d1 = new Date(t1);
	var d2 = new Date(t2);

	if (d1.getFullYear() != d2.getFullYear()) {
		return false;
	}
	if (d1.getMonth() != d2.getMonth()) {
		return false;
	}
	if (d1.getDate() != d2.getDate()) {
		return false;
	}
	return true;
}

function daysDiff(t1, t2) {
	if (isSameDay(t1, t2)) {
		return 0;
	}

	return Math.abs(parseInt((t1.getTime() - t2.getTime()) / (1000 * 60 * 60 * 24)));
}

function hoursDiff(t1, t2) {
	return Math.abs(parseInt((t1.getTime() - t2.getTime()) / (1000 * 60 * 60)));
}

function minsDiff(t1, t2) {
	return Math.abs(parseInt((t1.getTime() - t2.getTime()) / (1000 * 60)));
}

function secsDiff(t1, t2) {
	return Math.abs(parseInt((t1.getTime() - t2.getTime()) / (1000)));
}

/**
 * Links are specified in the db based on image width of 1600 pixels - we need to adjust the x-coord based on the actual browser viewport width
 *
 */
function addSBLink(id, left, top, width, height, loc, target) {
	var newLeft = left + ($(window).width() - 1600) / 2;
	var link = element("a", {id:id, className:"siteBGElement", href:loc, target:(target ? target : "_blank")}, {left:newLeft+"px",top:top+"px",width:width+"px",height:height+"px"});
	link.origLeft = left;
	document.body.appendChild(link);
	return link;
}


function addSBCountdown(id, left, top, width, height, cssProps, endsAt) {
	var newLeft = left + ($(window).width() - 1600) / 2;

	if (el(id)) {
		/**
		 * Element already exists
		 */
		return;
	}
	var props = {};
	for (var prop in cssProps) {
		props.prop = cssProps[prop];
	}
	props.left = newLeft+"px";
	props.top = top+"px";
	props.width = width+"px";
	props.height = height+"px";
	props.border = "1px solid white";
	props.color = "white";

	var now = new Date();
	var diff = endsAt - now.getTime();
	if (diff < 0) {
		return;
	}
	var div = element("div", {id:id, className:"siteBGElement"}, props);
	document.body.appendChild(div);

	var dt = new Date(endsAt);

	var countdownHandler = {};
	countdownHandler.endsAt = endsAt;
	countdownHandler.div = div;
	countdownHandler.interval = setInterval(function() {
		var now = new Date();
		var diff = countdownHandler.endsAt - now.getTime();
		if (diff < 0) {
			clearInterval(countdownHandler.interval);
			$(div).remove();
		}
		else {

			var minuteMS = (1000 * 60);
			var hourMS = minuteMS * 60;
			var dayMS = hourMS * 24;

			var days = parseInt(diff / dayMS);
			var hours = parseInt((diff - (days * dayMS)) / hourMS);
			var minutes = parseInt((diff - (days * dayMS) - (hours * hourMS)) / minuteMS);
			var seconds = parseInt((diff - (days * dayMS) - (hours * hourMS) - (minutes * minuteMS)) / 1000);
			$(div).text(days + "d:" + hours + "h:" + minutes + "m:" + seconds + "s");
		}
	}, 1000)

}

/**
Live Broadcasts
**/
function getBroadcasts() {
	var url = contextpath + '/GetBroadcastBanners';

	$.getJSON(url,function(json){
		/** Loop through returned json (jquery foreach statement) **/
		$.each(json,function(i,broadcast){
			/* If the current date/time is between the banner show and hide time, show the bar */
			if(broadcast.now > broadcast.bannershowat && broadcast.now < broadcast.bannerhideat){
				liveBroadcastBar(broadcast.bannertext.replace(/[^a-zA-Z 0-9]+/g,' '));
			}
		});
	});
}
function liveBroadcastBar(broadcast) {
	var bodyColor = $('body').css("background-color");
	var testUrl = document.location.href.indexOf("Home.do");
	var refUrl = document.referrer;
	var liveBroadcasts = $.cookie("showBroadcastBar");

	/** Show the bar if the user hasn't clicked close (expires in 1 day) **/
	if(liveBroadcasts != 'hide') {
		$("#liveBroadcastTrack").html('<h1>' + broadcast + '</h1>');
		Cufon.replace('#liveBroadcast h1');
		/** Only animate when the user first logs in **/
		if(testUrl != -1 && refUrl == ''){
			$('#liveBroadcastBar').delay(1000).slideDown(500);
		} else {
			$('#liveBroadcastBar').show();
		}
	}
	$('#closeBar').click(function(){
		$('#liveBroadcastBar').slideUp(500);
		$.cookie("showBroadcastBar", "hide", { path: "/", expires: 1 });
	});
}
function fadeBackground() {
	var bodyColor = $('body').css("background-color");
	var testUrl = document.location.href.indexOf("Home.do");
	var refUrl = document.referrer;

	/** Only animate when the user first logs in **/
	if(testUrl != -1 && refUrl == ''){
		$('#fader').css("background-color", bodyColor);
		$('#fader').delay(2000).fadeOut();
	}
}

/**
 * time is passed in as 10000ths of a second
 */
function formatLapTime(time){
	var full = time / 10000;
	var secsFull = parseInt(full);
	var leftOver = full - secsFull;
	leftOver = parseInt(leftOver * 1000);
	if (leftOver < 100) {
		leftOver = "0" + leftOver;
	}
	else if (leftOver < 10) {
		leftOver = "00" + leftOver;
	}
	var mins = parseInt(secsFull / 60);
	var secs = secsFull - (mins * 60);
	if (secs < 10) {
		secs = "0" + secs;
	}
	if (mins > 0) {
		return mins + ":" + secs + "." + leftOver;
	}
	return secs + "." + leftOver;
}

function isBlackedOut(serviceName) {
	var blackedOut = false;
	if (initialBlackouts) {
		var ndx = initialBlackouts.objIndexOf(serviceName, "service");
		if (ndx >= 0) {
			var blackout = initialBlackouts[ndx];
			if (blackout.ineffect == 1) {
				blackedOut =  true;
			}
		}
	}
	return blackedOut;
}


function removeAccents(strAccents) {
	var strAccents = strAccents.split('');
	var strAccentsOut = new Array();
	var strAccentsLen = strAccents.length;
	var accents = '¿¡¬√ƒ≈‡·‚„‰Â“”‘’’÷ÿÚÛÙıˆ¯»… ÀËÈÍÎ«Á–ÃÕŒœÏÌÓÔŸ⁄€‹˘˙˚¸—Òäöüˇ˝éû';
	var accentsOut = "AAAAAAaaaaaaOOOOOOOooooooEEEEeeeeeCcDIIIIiiiiUUUUuuuuNnSsYyyZz";
	for (var y = 0; y < strAccentsLen; y++) {
		if (accents.indexOf(strAccents[y]) != -1) {
			strAccentsOut[y] = accentsOut.substr(accents.indexOf(strAccents[y]), 1);
		} else
			strAccentsOut[y] = strAccents[y];
	}
	strAccentsOut = strAccentsOut.join('');
	return strAccentsOut;
}

var iracingScriptLoaded = true;

function convertCurlyQuotesAndDashes(buf) {
	if (!buf) {
		return;
	}
	if (typeof buf != "string") {
		return buf;
	}
	/**
	 * convert common characters (curly quotes and em dashes) that are outside of the utf-8 character set.
	 */
	return buf.replace(/\u2012|\u2013|\u2014|\u2015/g, '-')
							.replace(/\u2018|\u2019/g, "'")
							.replace(/\u201C|\u201D/g, '"');
}

//Detect Windows 8.1 and IE11
function theWindowsSpecial(){

	if(!systemversions && !downloadstatus && window.navigator.appVersion.indexOf('Windows NT 6.3') != -1 && !systemversions && window.navigator.appVersion.indexOf('rv:11.0') != -1){
		$('body').css('padding-top','75px');
		if($('body').css('background-image').length > 0){
			$('body').css('background-position','center 75px');
		}

		$('body div:first').before('<div id="ie-message-container"><div id="ie-message"><h2>Add iRacing.com as a Trusted Site in IE 11</h2><a href="#">Click Here</a><span>To update your service, join races, or purchase content, you must change some privacy settings in Internet Explorer 11 with Windows 8.1. Click the button for instructions.</span></div></div>');

		$('#ie-message-container').css({
			width: "100%",
			height: "75px",
			position: "absolute",
			top:"0",
			background: "#00394c"
		});

		// I'm doing the styling dynamically because we can't rely on a single stylesheet across multiple sites
		var bg;
		if(imageserver.length == 0){
			bg = "url(images/ie-11/ie-stop.png) no-repeat 0 15px";
		} else {
			bg = "url("+imageserver+"/member_images/aboveheader/ie-stop.png) no-repeat 0 15px";
		}

		$('#ie-message').css({
			display: "block",
			float:"none",
			color:"#ffffff",
			textAlign:"left",
			width:"892px",
			height:"75px",
			margin:"0 auto",
			padding:"0 0 0 80px",
			background:bg
		});
		$('#ie-message h2').css({
			margin: "8px 0 5px 0",
			fontSize: "18px",
			lineHeight:"18px",
			padding:"0",
			fontWeight: "bold",
			width: "640px",
			display:"block",
			float: "left"
		});
		$('#ie-message span').css({
			fontSize: "12px",
			lineHeight: "16px",
			padding:"0",
			width: "600px",
			margin: "0",
			display:"block",
			color: "#ffffff"
		});
		$('#ie-message a').css({
			color:"#000000",
			fontSize: "18px",
			textAlign: "center",
			fontWeight: "bold",
			lineHeight: "43px",
			marginTop: "15px",
			width: "160px",
			height: "45px",
			display:"block",
			float: "right",
			background: "#ffffff"
		});
		$('#ie-message a').click(function(){
			window.open(contextpath+"/ie-11.jsp", "_blank", 'toolbar=no,width=680,height=400,left=0,top=0,scrollbars=yes,status=no');
		});
	}

}


var iracingScriptLoaded = true;











