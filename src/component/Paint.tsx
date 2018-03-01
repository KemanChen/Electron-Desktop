import React from 'react';
import {Link, Route} from "react-router-dom";
import style from "./style.scss";
import {Button, message} from "antd";
// import {io} from "socket.io";
import $ from "jquery";
import {_POINT_ACTION, _SET_COLOR_ACTION, _SET_STOKE_SIZE, _SET_SHAPE,_SET_TEXT,_SET_IMAGE} from "./constants";

/**
 * Action
 */
class Action {
    public isMovable: boolean;

    constructor(public actionType?: any, public x?: any, public y?: any) {
        let self = this;
        this.x = 0;
        this.y = 0;
        this.isMovable = false;

        if (arguments.length > 0) {
            self.actionType = arguments[0];
        }
        if (arguments.length > 2) {
            self.x = arguments[1];
            self.y = arguments[2];
        }
    }
}

/**
 * Point
 */
class Point extends Action {
    public type: any;
    public startX: number;
    public startY: number;
    public isShaping: boolean;
    constructor(argX: any, argY: any, typeArg: any,sX: number,sY: number,isShaping: boolean) {
        super(_POINT_ACTION, argX, argY);
        let self = this;
        this.type = typeArg;
        this.startX = sX;
        this.startY = sY;
        this.isShaping = isShaping;
    }
}

class ActionsSet {
    public actions: any;
    public interval: any;
    public next: any;

    constructor(intervalArg: any, actionsArrayArg: any) {
        let self = this;
        this.actions = actionsArrayArg;
        this.interval = intervalArg;
        this.next = null;
    }
}

/**
 * 设置颜色
 */
class SetColor extends Action {
    constructor(public color: any) {
        super(_SET_COLOR_ACTION);
        let self = this;
        self.color = color;
    }
}

/**
 * 设置绘画笔笔号
 */
class SetStokeSize extends Action {
    constructor(public size: any) {
        super(_SET_STOKE_SIZE);
        let self = this;
        self.size = size;
    }
}

/**
 * 设置形状
 */
class SetShape extends Action {
    constructor(public shape: any) {
        super(_SET_SHAPE);
        let self = this;
        this.shape = shape;
    }
}
class SetText extends Action {
    constructor(public text: string){
        super(_SET_TEXT);
        let self = this;
        this.text = text;
    }
}
class SetImage extends Action{
    constructor(public url: any){
        super(_SET_IMAGE);
        this.url = url;
    }
}

//record draw
class RecordableDrawing {
    public canvas: any;
    public canvasId: string;
    public width: number;
    public height: number;
    public actions: Array<any>;
    public ctx: any;
    public mouseDown: boolean;
    public currentRecording: any;
    public recordings: Array<any>;
    public lastMouseX: number;
    public lastMouseY: number;
    public startXs: Array<number>;
    public startYs: Array<number>;
    public bgColor: string;
    public currentLineWidth: number;
    public drawingColor: string;
    public drawShape: string;
    public drawValue: string;
    public pauseInfo: any;
    public pausedRecIndex: number;
    //socket
    public socket: any;
    //Tem canvas
    public temCanvas: any;
    public temCanvasId: string;
    public temCtx: any;
    //virtual canvas
    public imageData: Array<any>;
    public backgroudImg: string;
    public undoTimes: number;

    constructor(canvasId: string, temCanvasId: string, socket: any) {
        this.canvas = null;
        this.canvasId = canvasId;
        this.width = 0;
        this.height = 0;
        this.actions = new Array();
        this.ctx = null;
        this.mouseDown = false;
        this.currentRecording = null;
        this.recordings = new Array();
        this.lastMouseX = this.lastMouseY = -1;
        this.startXs  = [];
        this.startYs = [];
        this.bgColor = "rgb(255,255,255)";
        this.currentLineWidth = 3;
        this.drawShape = "noShape";
        this.drawingColor = "rgb(0,0,0)";
        this.drawValue = "";
        this.pauseInfo = null;
        this.pausedRecIndex = 0;
        //socket
        this.socket = socket;
        //tem canvas
        this.temCanvas = null;
        this.temCanvasId = temCanvasId;
        this.temCtx = null;
        //virtual canvas
        this.imageData = new Array();
        this.imageData.push("ElectronPro/www/images/timg.jpg");
        this.backgroudImg = "";
        this.undoTimes = 0;

        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onMouseOut = this.onMouseOut.bind(this);
        this.setColor = this.setColor.bind(this);
        this.setStokeSize = this.setStokeSize.bind(this);
        this.setShape = this.setShape.bind(this);
        this.setText = this.setText.bind(this);
        this.setImage = this.setImage.bind(this);
        this.undoDraw = this.undoDraw.bind(this);
        this.clearCanvas = this.clearCanvas.bind(this);
        this.removeAllRecordings = this.removeAllRecordings.bind(this);
        this.drawAction = this.drawAction.bind(this);
        this.drawPoint = this.drawPoint.bind(this);
        this.drawLine = this.drawLine.bind(this);
        this.drawRect = this.drawRect.bind(this);
        this.drawText = this.drawText.bind(this);
        //recording
        this.startRecording = this.startRecording.bind(this);
        this.stopRecording = this.stopRecording.bind(this);
        this.pauseRecording = this.pauseRecording.bind(this);
        this.resumeRecording = this.resumeRecording.bind(this);
        this.playRecording = this.playRecording.bind(this);
        this.__onPause = this.__onPause.bind(this);
        this.resumePlayback = this.resumePlayback.bind(this);
        this.__init = this.__init.bind(this);
    }

    /**
     * 鼠标触发点下事件
     * @param event
     * @returns {boolean}
     */
    onMouseDown(event: any) {
        let self = this;
        let canvasX = $(self.canvas).offset().left;
        let canvasY = $(self.canvas).offset().top;

        let x = Math.floor(event.pageX - canvasX) + 4;
        let y = Math.floor(event.pageY - canvasY) + 28;
        //文本绘制
        if (self.drawShape === "text"){
            $("#canvas_input").css({left: x - 6, top: y -38,display: "block"});
            let sy = $("#canvas_input").position().top + 15;
            let sx = $("#canvas_input").position().left;
            self.startXs.push(sx);
            self.startYs.push(sy);
            return;
        }
        let currAction = new Point(x, y, 0, self.lastMouseX, self.lastMouseY, true);
        self.drawAction(currAction, true);
        self.mouseDown = true;

        self.lastMouseX = x;
        self.lastMouseY = y;

        if (self.currentRecording != null)
            self.currentRecording.addAction(currAction);
        event.preventDefault();
        return false;
    };

    /**
     * 鼠标出发移动事件
     * @param event event.pageX/pageY 显示鼠标指针的位置
     * @returns {boolean}
     */
    onMouseMove(event: any) {
        let self = this;
        if (self.mouseDown) {
            let canvasX = $(self.canvas).offset().left; //canvas 在页面的偏移量
            let canvasY = $(self.canvas).offset().top;

            let x = Math.floor(event.pageX - canvasX) + 4;
            let y = Math.floor(event.pageY - canvasY) + 28;

            let action = new Point(x, y, 1, self.lastMouseX, self.lastMouseY, true);
            if (self.currentRecording != null)
                self.currentRecording.addAction(action);
            self.drawAction(action, true);

            event.preventDefault();
            return false;
        }
    };

    /**
     * 鼠标触发放开事件
     * @param event
     */
    onMouseUp(event: any) {
        let self = this;
        if (self.mouseDown) {
            let canvasX = $(self.canvas).offset().left; //canvas 在页面的偏移量
            let canvasY = $(self.canvas).offset().top;

            let x = Math.floor(event.pageX - canvasX) + 4;
            let y = Math.floor(event.pageY - canvasY) + 28;

            let action = new Point(x, y, 1,self.lastMouseX, self.lastMouseY, false);
            if (self.currentRecording != null)
                self.currentRecording.addAction(action);
            self.drawAction(action, true);
            //copy canvas
            let divDom = document.getElementById("wrapper");
            html2canvas(divDom, {allowTaint: true,useCORS: true,width: 600,height: 400}).then((canvas: HTMLCanvasElement) => {
                let dataUrl = canvas.toDataURL("image/jpeg", 1.0);
                self.imageData.push(dataUrl);
            });

            self.mouseDown = false;
            self.lastMouseX = -1;
            self.lastMouseY = -1;
            event.preventDefault();
            return false;
        }
    };
    onMouseOut(event: any){
        let self = this;
        self.onMouseUp(event);
    }

    //设置颜色
    setColor(color: any) {
        let self = this;
        self.drawingColor = color;
        let colorAction = new SetColor(color);
        self.actions.push(colorAction);
        if (self.currentRecording != null)
            self.currentRecording.addAction(colorAction);
    };

    //设置字体size
    setStokeSize(sizeArg: any) {
        let self = this;
        self.currentLineWidth = sizeArg;
        let sizeAction = new SetStokeSize(sizeArg);
        self.actions.push(sizeAction);
        if (self.currentRecording != null)
            self.currentRecording.addAction(sizeAction);
    };

    //设置绘画形状
    setShape(shapeArg: any) {
        let self = this;
        //非文本点击，文本框消失
        if(shapeArg !== "text"){
            $("#canvas_input").css({display: "none"});
        }
        self.drawShape = shapeArg;
        let shapeAction = new SetShape(shapeArg);
        self.actions.push(shapeAction);
        if (self.currentRecording !== null) {
            self.currentRecording.addAction(shapeAction);
        }
    }

    //设置绘画文本
    setText(textArg: string){
        let self = this;
        self.drawValue = textArg;
        let textAction = new SetText(textArg);
        self.actions.push(textAction);

        let currAction = new Point(self.lastMouseX, self.lastMouseY, 0, self.startXs[self.startXs.length - 2], self.startYs[self.startYs.length - 2], true);
        self.drawAction(currAction, true);

        if (self.currentRecording != null){
            self.currentRecording.addAction(textAction);
            self.currentRecording.addAction(currAction);
        }
    }

    //设置图片
    setImage(url: any){
        let self = this;
        self.backgroudImg = url;
        let imgAction = new SetImage(url);
        self.actions.push(imgAction);
        if (self.currentRecording != null)
            self.currentRecording.addAction(imgAction);
    }
    //撤销
    undoDraw(){
        let self = this;
        if (self.imageData.length <= 1){
            message.warn("不能继续撤销！");
            return;
        }
        self.undoTimes ++;
        if (self.undoTimes > 10){
            message.warn("仅限撤销十步!");
            return;
        }
        self.imageData.pop();
        let url: any = self.imageData[self.imageData.length - 1];
        this.setImage(url);
        this.clearCanvas(self.ctx);
        // socket.emit("chat message", url);
        $("#wrapper").css("background-image", "url(" + url + ")");
    }

    //清空画布
    clearCanvas(ctx: any) {
        let self = this;
        ctx.clearRect(0, 0, self.width, self.height);
    };

    /**
     * 录制、结束、暂停、播放等
     */
    //开始录制
    startRecording() {
        let self = this;
        self.currentRecording = new Recording(this);
        self.recordings = new Array();
        self.recordings.push(self.currentRecording);
        self.currentRecording.start();
    }

    //stop
    stopRecording() {
        let self = this;
        if (self.currentRecording !== null) {
            self.currentRecording.stop();
        }
        self.currentRecording = null;
    }

    //pause
    pauseRecording() {
        let self = this;
        if (self.currentRecording !== null) {
            self.currentRecording.pause();
        }
    }

    //resume
    resumeRecording() {
        let self = this;
        if (self.currentRecording !== null) {
            self.currentRecording.resumeRecording();
        }
    }

    //play
    playRecording(onPlayStart: any, onPlayEnd: any, onPause: any, interruptActionStatus: any) {
        let self = this;
        if (typeof interruptActionStatus == 'undefined')
            interruptActionStatus = null;

        if (self.recordings.length == 0) {
            alert("No recording loaded to play");
            onPlayEnd();
            return;
        }

        self.clearCanvas(self.ctx);
        self.undoTimes = 0;
        $("#wrapper").css("background-image", "url('ElectronPro/www/images/timg.jpg')");


        onPlayStart();

        self.pausedRecIndex = -1;

        for (let rec = 0; rec < self.recordings.length; rec++) {
            if (interruptActionStatus != null) {
                let status = interruptActionStatus();
                if (status == "stop") {
                    self.pauseInfo = null;
                    break;
                }
                else if (status == "pause") {
                    self.__onPause(rec - 1, onPlayEnd, onPause, interruptActionStatus);
                    break;
                }
            }
            self.recordings[rec].playRecording(undefined, onPlayEnd, function () {
                self.__onPause(rec, onPlayEnd, onPause, interruptActionStatus);
            }, interruptActionStatus);
        }
    }

    __onPause(index: number, onPlayEnd: any, onPause: any, interruptActionStatus: any) {
        let self = this;
        self.pauseInfo = {
            "index": index,
            "onPlayEnd": onPlayEnd,
            "onPause": onPause,
            "interruptActionStatus": interruptActionStatus
        };
        if (onPause) {
            onPause();
        }
    }

    resumePlayback(onResume: Function) {
        let self = this;
        if (self.pauseInfo === null) {
            if (onResume) {
                onResume(false);
            }
            return;
        }
        let index: number = self.pauseInfo.index;
        let onPlayEnd: Function = self.pauseInfo.onPlayEnd;
        let interruptActionStatus: Function = self.pauseInfo.interruptActionStatus;
        let onPause: Function = self.pauseInfo.onPause;

        if (self.recordings.length == 0) {
            alert("No recording loaded to play");
            onPlayEnd();
            return;
        }

        onResume(true);

        self.pauseInfo = null;

        for (let rec = index; rec < self.recordings.length; rec++) {
            if (interruptActionStatus != null) {
                let status = interruptActionStatus();
                if (status == "stop")
                    break;
                else if (status == "pause") {
                    self.__onPause(rec - 1, onPlayEnd, onPause, interruptActionStatus);
                    break;
                }
            }
            self.recordings[rec].playRecording(undefined, onPlayEnd, function () {
                self.__onPause(rec, onPlayEnd, onPause, interruptActionStatus);
            }, interruptActionStatus);
        }
    }

    removeAllRecordings() {
        let self = this;
        self.recordings = new Array();
        self.currentRecording = null;
    };

    //教师端canvas绘制
    drawAction(actionArg: any, addToArray: any) {
        let self = this;
        switch (actionArg.actionType) {
            case _POINT_ACTION :
                self.drawPoint(actionArg);
                break;
            case _SET_COLOR_ACTION :
                self.drawingColor = actionArg.color;
                break;
            case _SET_STOKE_SIZE:
                self.currentLineWidth = actionArg.size;
                break;
            case _SET_SHAPE:
                self.drawShape = actionArg.shape;
                break;
            case _SET_TEXT:
                self.drawValue = actionArg.text;
                break;
            case _SET_IMAGE:
                let url: any = actionArg.url;
                this.clearCanvas(self.ctx);
                $("#wrapper").css("background-image","url("+ url +")");
                break;
            default:
                break;
        }

        if (addToArray)
            self.actions.push(actionArg);
    };
    /**
     *
     * @param actionArg
     * @param {string} shape "round":圆形，"rect": 矩形, "line": 直线
     */
    drawPoint(actionArg: any) {
        let self = this;
        let x = actionArg.x;
        let y = actionArg.y;
        //默认source-over--在目标图像上显示源图像
        self.ctx.globalCompositeOperation = 'source-over';
        //绘制
        if (self.drawShape === "rect") {
            self.drawRect(actionArg);
        } else if (self.drawShape === "line") {
            self.drawLine(actionArg);
        } else if (self.drawShape === "text"){
            self.drawText(actionArg);
        } else {
            if(self.drawShape === "eraser"){
                self.ctx.globalCompositeOperation = 'destination-out';//只有后绘制的图形外的目标图像部分会被显示，源图像是透明的；
                self.ctx.beginPath();
                self.ctx.arc(x, y, 10, 0, 2 * Math.PI);
                self.ctx.fill();
            }
            switch (actionArg.type) {
                case 0: //moveto
                    self.ctx.beginPath();
                    self.ctx.moveTo(x, y);
                    self.ctx.strokeStyle = self.drawingColor;
                    self.ctx.lineWidth = self.currentLineWidth;
                    break;
                case 1: //lineto
                    self.ctx.lineTo(x, y);
                    self.ctx.stroke();
                    break;
            }
        }
    }
    //绘制直线
    drawLine(actionArg: any) {
        let self = this;
        let toX: number = actionArg.x;
        let toY: number = actionArg.y;
        let stX: number = actionArg.startX;
        let stY: number = actionArg.startY;
        let type: number = actionArg.type;
        let context: any = actionArg.isShaping ? self.temCtx : self.ctx;
        if (type === 0) {
            self.clearCanvas(self.temCtx);
            $("#canvas2").css({left: 0, top: 0});
        } else if (type === 1) {
            self.clearCanvas(self.temCtx);
            context.beginPath();
            context.moveTo(stX, stY);
            context.strokeStyle = self.drawingColor;
            context.lineWidth = self.currentLineWidth;
            context.lineTo(toX, toY);
            context.stroke();
        }
    }
    //绘制矩形
    drawRect(actionArg: any) {
        let self = this;
        let toX: number = actionArg.x;
        let toY: number = actionArg.y;
        let stX: number = actionArg.startX;
        let stY: number = actionArg.startY;
        let type: number = actionArg.type;
        let context: any = actionArg.isShaping ? self.temCtx : self.ctx;
        if (type === 0) {
            self.clearCanvas(self.temCtx);
            $("#canvas2").css({left: 0, top: 0});
        } else if (type === 1) {
            self.clearCanvas(self.temCtx);
            context.strokeStyle = self.drawingColor;
            context.lineWidth = self.currentLineWidth;
            context.strokeRect(stX, stY, toX - stX, toY - stY);
        }
    }
    //绘制文本
    drawText(actionArg: any){
        let self = this;
        let ctx = self.ctx;
        let text = self.drawValue;
        let stX: number = actionArg.startX;
        let stY: number = actionArg.startY;
        //设置字体样式
        ctx.font = "16px Microsoft YaHei";
        //设置字体填充颜色
        ctx.fillStyle = self.drawingColor;
        //从坐标点(50,50)开始绘制文字
        ctx.fillText(text, stX, stY);
    }

    //初始化画布
    __init() {
        let self = this;
        self.canvas = $("#" + self.canvasId);
        if (self.canvas.length == 0) {
            return;
        }
        self.canvas = self.canvas.get(0);
        self.width = $(self.canvas).width();
        self.height = $(self.canvas).height();
        self.ctx = self.canvas.getContext("2d");
        //tem canvas
        self.temCanvas = $("#" + self.temCanvasId);
        if (self.temCanvas.length == 0) {
            return;
        }
        self.temCanvas = self.temCanvas.get(0);
        self.temCtx = self.temCanvas.getContext("2d");

        $("#wrapper").children("canvas").bind("mousedown", this.onMouseDown);
        $("#wrapper").children("canvas").bind("mouseup", this.onMouseUp);
        $("#wrapper").children("canvas").bind("mouseout", this.onMouseOut);
        $("#wrapper").children("canvas").bind("mousemove", this.onMouseMove);
        self.clearCanvas(self.ctx);
    };
}

//录制
class Recording {
    public drawing: any;
    public buffer: Array<any>;
    public timeInterval: number;
    public currentTime: number;
    public started: boolean;
    public intervalId: any;
    public currentTimeSlot: number;
    public actionsSet: any;
    public currActionSet: any;
    public recStartTime: any;
    public pauseInfo: any;

    public totalPauseTime: number;
    public pauseStartTime: number;

    constructor(drawingArg: any) {
        this.drawing = drawingArg;
        this.buffer = new Array();
        this.timeInterval = 100;//时间节点
        this.currentTime = 0;//当前时间节点
        this.started = false;//是否开始录制
        this.intervalId = null;//定时执行函数
        this.currentTimeSlot = 0;//
        this.actionsSet = null;//ActionSet对象 actions: Array ;interval: number; next {}
        this.currActionSet = null;//当前ActionSet 对象
        this.recStartTime = null;//开始时间
        this.pauseInfo = null;
        this.totalPauseTime = 0;//总暂停时间
        this.pauseStartTime = 0;//暂停开始时间

        this.start = this.start.bind(this);
        this.stop = this.stop.bind(this);
        this.pause = this.pause.bind(this);
        this.resumeRecording = this.resumeRecording.bind(this);
        this.addAction = this.addAction.bind(this);
        this.onInterval = this.onInterval.bind(this);
        this.playRecording = this.playRecording.bind(this);
        this.scheduleDraw = this.scheduleDraw.bind(this);
        this.resume = this.resume.bind(this);
        this.drawActions = this.drawActions.bind(this);
    }

    //开始录制
    start() {
        let self = this;
        self.currentTime = 0;
        self.currentTimeSlot = -1;
        self.actionsSet = null;
        self.pauseInfo = null;

        self.recStartTime = (new Date()).getTime();
        self.intervalId = window.setInterval(self.onInterval, self.timeInterval);
        self.started = true;
    }

    //结束录制
    stop() {
        let self = this;
        if (self.intervalId !== null) {
            window.clearInterval(self.intervalId);
            self.intervalId = null;
        }
        self.started = false;
    }

    //暂停录制
    pause() {
        let self = this;
        self.pauseStartTime = (new Date()).getTime();
        window.clearInterval(self.intervalId);
    }

    //继续录制
    resumeRecording() {
        let self = this;
        self.totalPauseTime += (new Date()).getTime() - self.pauseStartTime;
        self.pauseStartTime = 0;
        self.intervalId = window.setInterval(self.onInterval, self.timeInterval);
    }

    //定时器回调函数
    onInterval() {
        let self = this;
        if (self.buffer.length > 0) {
            let timeSlot = (new Date()).getTime() - self.recStartTime - this.totalPauseTime;

            if (self.currActionSet === null) {
                self.currActionSet = new ActionsSet(timeSlot, self.buffer);
                self.actionsSet = self.currActionSet;
            } else {
                let tmpActionSet = self.currActionSet;
                self.currActionSet = new ActionsSet(timeSlot, self.buffer);
                tmpActionSet.next = self.currActionSet;
            }

            self.buffer = new Array();
        }
        self.currentTime += self.timeInterval;
    }

    //添加action 对象
    addAction(actionArg: any) {
        let self = this;
        if (!self.started) {
            return
        }
        self.buffer.push(actionArg);
        self.drawing.socket.emit("chat message",actionArg);
    }

    //播放绘制轨迹
    playRecording(callbackFunctionArg: any, onPlayEnd: any, onPause: any, interruptActionStatus: any) {
        let self = this;
        if (self.actionsSet === null) {
            if (typeof onPlayEnd !== "undefined" && onPlayEnd !== null) {
                onPlayEnd();
            }
            return;
        }
        self.scheduleDraw(self.actionsSet, self.actionsSet.interval, callbackFunctionArg, onPlayEnd, onPause, true, interruptActionStatus);
    }

    scheduleDraw(actionSetArg: any, interval: any, callbackFunctionArg: any, onPlayEnd: any, onPause: any, isFirst: boolean, interruptActionStatus: any) {
        let self = this;
        window.setTimeout(() => {
            let status: string = "";
            if (interruptActionStatus !== null) {
                status = interruptActionStatus();
                if (status === "stop") {
                    self.pauseInfo = null;
                    onPlayEnd();
                    return;
                }
            }
            if (status === "pause") {
                self.pauseInfo = {
                    "actionset": actionSetArg,
                    "callbackFunc": callbackFunctionArg,
                    "onPlaybackEnd": onPlayEnd,
                    "onPause": onPause,
                    "isFirst": isFirst,
                    "interruptActionsStatus": interruptActionStatus
                };
                if (onPause)
                    onPause();
                return;
            }
            let intervalDiff = -1;
            let isLast: boolean = true;
            if (actionSetArg.next !== null) {
                isLast = false;
                intervalDiff = actionSetArg.next.interval - actionSetArg.interval;
            }
            if (intervalDiff >= 0) {
                self.scheduleDraw(actionSetArg.next, intervalDiff, callbackFunctionArg, onPlayEnd, onPause, false, interruptActionStatus);
            }
            self.drawActions(actionSetArg.actions, onPlayEnd, isFirst, isLast);
        }, interval);
    }

    resume() {
        let self = this;
        if (!self.pauseInfo) {
            return
        }
        self.scheduleDraw(self.pauseInfo.actionset, 0,
            self.pauseInfo.callbackFunc,
            self.pauseInfo.onPlaybackEnd,
            self.pauseInfo.onPause,
            self.pauseInfo.isFirst,
            self.pauseInfo.interruptActionsStatus);
        self.pauseInfo = null;
    }

    drawActions(actionsArray: any, onPlayEnd: any, isFirst: boolean, isLast: boolean) {
        let self = this;
        for (let i = 0; i < actionsArray.length; i++) {
            self.drawing.drawAction(actionsArray[i], false);
        }
        if (isLast) {
            onPlayEnd();
        }
    }
}

interface PaintOwnState {
    colorIndex?: number;
    sizeIndex?: number;
    shapeIndex?: number;
    recordBtn?: any;
    playBtn?: any;
    pauseBtn?: any;
    isRecording?: boolean;
    isPlaying?: boolean;
    isEraser?: boolean;
}

interface PaintOwnProps {
}

export class Paint extends React.Component<PaintOwnProps, PaintOwnState> {
    public drawer: any;
    public ctx: any;
    public colors: Array<any>;
    public sizes: Array<any>;
    public shapes: Array<any>;
    public playbackInterruptCommand: string;

    public socket: any;
    public io: SocketIO.Server;

    constructor(props: PaintOwnProps) {
        super(props);
        this.state = {
            colorIndex: 0,
            sizeIndex: 0,
            shapeIndex: 0,
            recordBtn: {isShow: true, value: "Record"},
            playBtn: {isShow: true, value: "Play"},
            pauseBtn: {isShow: false, value: "Pause"},
            isRecording: false,
            isPlaying: false,
            isEraser: false
        };
        this.colors = ["black", "red", "blue", "green"];
        this.sizes = [{b_r: 3, b_w: 3}, {b_r: 6, b_w: 5}, {b_r: 8, b_w: 7}, {b_r: 12, b_w: 10}, {
            b_r: 16,
            b_w: 13
        }, {b_r: 18, b_w: 15}];
        this.shapes = ["noShape","eraser", "line", "rect"];
        this.playbackInterruptCommand = "";
        this.ctx = null;
        //连接服务器
        this.connectServer();

        this.drawer = new RecordableDrawing("canvas1", "canvas2",this.socket);

        this.record = this.record.bind(this);
        this.playRec = this.playRec.bind(this);
        this.pause = this.pause.bind(this);
        this.undo  = this.undo.bind(this);
        this.textInput = this.textInput.bind(this);
        this.blurInput = this.blurInput.bind(this);
        this.connectServer = this.connectServer.bind(this);
    }

    componentDidMount() {
        let canvas: any = $("#canvas1").get(0);
        this.ctx = canvas.getContext("2d");
        // $("#canvas2").css({left: -1000, top: 0});
        this.drawer.__init();
    }
    //连接服务器
    connectServer(){
        //连接socket
        this.socket = io.connect("http://10.213.0.33:3000",{
            reconnection: true,
            query: 'token=Bearer 3fccbf19-d156-3709-85a1-5e86dfa67d91'
        });
        this.socket.on('connect', function() {
            console.log("与服务连接成功");
        });
        this.socket.on('disconnect', function() {
            console.log("与服务其断开");
        });
        this.socket.on('reconnect', function() {
            console.log("重新连接到服务器");
        });
    }

    //录制按钮
    record() {
        if (this.state.recordBtn.value === "Record") {
            this.setState({
                recordBtn: {isShow: true, value: "Stop"},
                playBtn: {isShow: false, value: "Play"},
                pauseBtn: {isShow: true, value: "Pause"},
                isRecording: true
            });
            this.drawer.startRecording();
            this.drawer.setColor(this.colors[this.state.colorIndex]);
            this.drawer.setStokeSize(this.sizes[this.state.sizeIndex].b_w);
            this.drawer.setShape(this.shapes[this.state.shapeIndex]);
        } else if (this.state.recordBtn.value === "Stop") {
            this.setState({
                recordBtn: {isShow: true, value: "Record"},
                playBtn: {isShow: true, value: "Play"},
                pauseBtn: {isShow: false, value: "Pause"},
                isRecording: false
            });
            this.drawer.stopRecording();
        }
    }

    //播放轨迹
    playRec() {
        let self = this;
        if (this.state.playBtn.value === "Play") {
            if (this.drawer.recordings.length === 0) {
                message.warning("No recording to play");
                return;
            }
            this.drawer.playRecording(function () {
                //on playback start
                self.setState({
                    recordBtn: {isShow: false, value: "Stop"},
                    playBtn: {isShow: true, value: "Stop"},
                    pauseBtn: {isShow: true, value: "Pause"},
                    isPlaying: true
                });
                self.playbackInterruptCommand = "";
            }, function () {
                //on play end
                self.setState({
                    recordBtn: {isShow: true, value: "Record"},
                    playBtn: {isShow: true, value: "Play"},
                    pauseBtn: {isShow: false, value: "Pause"},
                    isPlaying: false
                });
                self.drawer.setColor(self.colors[self.state.colorIndex]);
                self.drawer.setStokeSize(self.sizes[self.state.sizeIndex].b_w);
                self.drawer.setShape(self.shapes[self.state.shapeIndex]);
            }, function () {
                self.setState({
                    recordBtn: {isShow: false, value: "Stop"},
                    playBtn: {isShow: false, value: "Play"},
                    pauseBtn: {isShow: true, value: "Resume"}
                });
            }, function () {
                return self.playbackInterruptCommand;
            });
        } else if (this.state.playBtn.value === "Stop") {
            self.playbackInterruptCommand = "stop";
        }
    }

    //暂停播放
    pause() {
        let self = this;
        if (this.state.pauseBtn.value === "Pause") {
            if (this.state.isRecording) {
                this.drawer.pauseRecording();
                this.setState({
                    recordBtn: {isShow: true, value: "Stop"},
                    playBtn: {isShow: false, value: "Stop"},
                    pauseBtn: {isShow: true, value: "Resume"}
                });
            }
            if (this.state.isPlaying) {
                this.playbackInterruptCommand = "pause";
            }
        } else if (this.state.pauseBtn.value === "Resume") {
            if (this.state.isRecording) {
                this.drawer.resumeRecording();
                this.setState({
                    recordBtn: {isShow: true, value: "Stop"},
                    playBtn: {isShow: false, value: "Play"},
                    pauseBtn: {isShow: true, value: "Pause"}
                });
            }
            if (this.state.isPlaying) {
                this.playbackInterruptCommand = "";
                this.drawer.resumePlayback(function () {
                    self.setState({
                        recordBtn: {isShow: false, value: "Stop"},
                        playBtn: {isShow: true, value: "Stop"},
                        pauseBtn: {isShow: true, value: "Pause"}
                    });
                });
            }
        }
    }

    //撤销操作
    undo(){
        console.log("undo!");
        this.drawer.undoDraw();
    }
    //文本输入
    textInput(){
        this.setState({shapeIndex: -1,isEraser: false});
        this.drawer.setShape("text");
    }
    //监听input 失去焦点事件
    blurInput(){
        let text = $("#canvas_input").val();
        if (text !== ""){
            console.log("blur input");
            this.drawer.setText(text);
            $("#canvas_input").val("");
        }
    }
    render() {
        let colors: Array<string> = this.colors;
        let colorDiv = colors.map((item: any, index: number) =>
            <div key={"color" + index}
                 className={style.colorbox + " " + (this.state.colorIndex === index ? style.selectedColor : "")}
                 style={{backgroundColor: item}} onClick={() => {
                this.setState({colorIndex: index});
                this.drawer.setColor(item)
            }}/>
        );
        let sizes: Array<Object> = this.sizes;
        let sizeDiv: any = sizes.map((item: any, index: number) =>
            <div key={"size" + index}
                 className={style.stroke + " " + (this.state.sizeIndex === index ? style.stroke_selected : "")}
                 style={{borderRadius: item.b_r, borderWidth: item.b_w}} onClick={() => {
                this.setState({sizeIndex: index});
                this.drawer.setStokeSize(item.b_w)
            }}/>
        );

        let shapeDiv = <div style={{width: 200}}>
            <div id="blank" onClick={() => {
                this.setState({shapeIndex: 0,isEraser: false});
                this.drawer.setShape("noShape");
            }} className={style.shape + " " + (this.state.shapeIndex == 0 ? style.shape_selected : "")}>
                <div className={style.shape_pen} style={{width: 32, height: 32, margin: "4px auto"}}/>
            </div>
            <div id="line" onClick={() => {
                this.setState({shapeIndex: 1,isEraser: false});
                this.drawer.setShape("line");
            }} className={style.shape + " " + (this.state.shapeIndex == 1 ? style.shape_selected : "")}>
                <div style={{width: 30, border: "2px solid #333", borderRadius: "2px", margin: "18px auto"}}/>
            </div>
            <div id="rect" onClick={() => {
                this.setState({shapeIndex: 2,isEraser: false});
                this.drawer.setShape("rect");
            }} className={style.shape + " " + (this.state.shapeIndex == 2 ? style.shape_selected : "")}>
                <div style={{width: 30, height: 20, border: "2px solid #333", margin: "8px auto"}}/>
            </div>
        </div>;
        return (
            <div id={style.paint}>
                <div id="drawingDiv" style={{height: 420}}>
                    <div className={style.wrapper} id="wrapper">
                        <textarea id="canvas_input" autoFocus style={{color: this.colors[this.state.colorIndex]}}
                                  className={style.canvas_input} onBlur={this.blurInput}>
                        </textarea>
                        <canvas id="canvas1"
                                className={(this.state.isEraser ? style.is_eraser : (this.state.shapeIndex === -1 ? style.normal_input : style.normal_canvas))}
                                width="600px" height="400px"></canvas>
                        <canvas id="canvas2"
                                className={(this.state.isEraser ? style.is_eraser : (this.state.shapeIndex === -1 ? style.normal_input : style.normal_canvas))}
                                width="600px" height="400px"></canvas>
                    </div>
                    <div style={{float: "left", marginLeft: 20}} id="colorsDiv">
                        <div style={{marginRight: 20}}>
                            <span>color：</span>
                            <p></p>
                            {colorDiv}
                        </div>
                        <div>
                            <span>Stoke Size :</span>
                            <p></p>
                            {sizeDiv}
                            <p></p>
                        </div>
                        <div>
                            <span>shape :</span>
                            <p></p>
                            {shapeDiv}
                            <p></p>
                        </div>
                        <div onClick={this.textInput}>
                            <span>文本 :</span><p></p>
                            <button className={style.textBtn}/>
                        </div>
                        <div style={{display: "inline-block"}} onClick={()=>{
                            this.setState({shapeIndex: 1,isEraser: false});
                            this.drawer.setShape("line");
                            this.drawer.setColor("#1afa2991");
                        }}>
                            <span>荧光笔：</span><p></p>
                            <button className={style.high_light}/>
                        </div>
                        <div onClick={()=>{
                            this.setState({shapeIndex: -1,isEraser: true});
                            this.drawer.setShape("eraser");
                        }}>
                            <span>橡皮擦：</span><p></p>
                            <button className={style.eraser}/>
                        </div>
                    </div>
                </div>

                <div id="canvasBtnsDiv" className={style.canvasBtn}>
                    <Button type="primary" ref="recordBtn" onClick={this.record}
                            style={{display: this.state.recordBtn.isShow ? "inline-block" : "none"}}>
                        {this.state.recordBtn.value}
                    </Button>
                    <Button type="primary" ref="playBtn" onClick={this.playRec}
                            style={{display: this.state.playBtn.isShow ? "inline-block" : "none"}}>
                        {this.state.playBtn.value}
                    </Button>
                    <Button type="primary" ref="pauseBtn" onClick={this.pause}
                            style={{display: this.state.pauseBtn.isShow ? "inline-block" : "none"}}>
                        {this.state.pauseBtn.value}
                    </Button>
                    <Button type="primary" ref="clearBtn" onClick={() => {
                        this.drawer.clearCanvas(this.ctx)
                    }}>Clear</Button>
                    <Button type="primary" ref="undoBtn" onClick={this.undo}>Undo</Button>
                </div>
            </div>
        );
    }
}