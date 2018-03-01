import React from 'react';
import {Link, Route} from "react-router-dom";
import style from "./style.scss";
import {Button, message} from "antd";
import {_POINT_ACTION, _SET_COLOR_ACTION, _SET_STOKE_SIZE, _SET_SHAPE,_SET_TEXT,_SET_IMAGE} from "./constants";

interface StudentOwnState{}

interface StudentOwnProps{}

class stuDraw{
    //main canvas
    public canvas: any;
    public canvasId: string;
    public ctx: any;
    public width: number;
    public height: number;
    public currentLineWidth: number;
    public drawingColor: string;
    public drawShape: string;
    public drawValue: string;
    //tem canvas
    public temCanvas: any;
    public temCanvasId: string;
    public temCtx: any;

    constructor(canvasId: string,temCanvasId: string){
        this.canvas = null;
        this.canvasId = canvasId;
        this.ctx = null;
        this.width = this.height = 0;
        this.currentLineWidth = 3;
        this.drawingColor = "rgb(0,0,0)";
        this.drawShape = "noShape";
        this.drawValue = "";
        //tem canvas
        this.temCanvas = null;
        this.temCanvasId = temCanvasId;
        this.temCtx = null;

        //bind this
        this.drawAction = this.drawAction.bind(this);
        this.drawPoint = this.drawPoint.bind(this);
        this.drawLine = this.drawLine.bind(this);
        this.drawRect = this.drawRect.bind(this);
        this.drawText = this.drawText.bind(this);
        this.clearCanvas = this.clearCanvas.bind(this);
        this.__init = this.__init.bind(this);
    }

    /**
     *
     * @param actionArg
     */
    drawAction(actionArg: any) {
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
                $("#stuWrapper").css("background-image","url("+ url +")");
                break;
            default:
                break;
        }
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
        //绘制
        if (self.drawShape === "rect") {
            self.drawRect(actionArg);
        } else if (self.drawShape === "line") {
            self.drawLine(actionArg);
        } else if (self.drawShape === "text"){
            self.drawText(actionArg);
        } else {
            //默认source-over--在目标图像上显示源图像
            self.ctx.globalCompositeOperation = 'source-over';
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
    //clean canvas
    clearCanvas(ctx: any){
        let self = this;
        ctx.clearRect(0, 0, self.width, self.height);
    }
    //canvas init
    __init(){
        let _self = this;
        _self.canvas = $("#" + _self.canvasId);
        if(_self.canvas.length === 0){
            return
        }
        _self.canvas = _self.canvas.get(0);
        _self.width = $(_self.canvas).width();
        _self.height = $(_self.canvas).height();
        _self.ctx = _self.canvas.getContext("2d");

        //tem canvas
        _self.temCanvas = $("#" + _self.temCanvasId);
        if (_self.temCanvas.length === 0) {
            return;
        }
        _self.temCanvas = _self.temCanvas.get(0);
        _self.temCtx = _self.temCanvas.getContext("2d");
    }
}

export class StudentPaint extends React.Component<StudentOwnProps, StudentOwnState>{
    public stuSocket: any;
    public stuDrawer: any;
    constructor(props: StudentOwnProps){
        super(props);
        this.connectServer();
        this.stuDrawer = new stuDraw("canvas3","canvas4");
        //bind this
        this.connectServer = this.connectServer.bind(this);
    }
    componentDidMount(){
        this.stuDrawer.__init();
    }
    //连接服务器
    connectServer(){
        //连接socket
        this.stuSocket = io.connect("http://10.213.0.33:3000",{
            reconnection: true,
            query: 'token=Bearer 3fccbf19-d156-3709-85a1-5e86dfa67d91'
        });
        this.stuSocket.on('connect', function() {
            console.log("与服务连接成功");
        });
        this.stuSocket.on('disconnect', function() {
            console.log("与服务其断开");
        });
        this.stuSocket.on('reconnect', function() {
            console.log("重新连接到服务器");
        });
        this.stuSocket.on("chat message",(response: any)=>{
            console.log("record data:" + response);
            this.stuDrawer.drawAction(response);
        });
    }
    render(){
        return (
            <div id={style.studentPaint}>
                <div className={style.stuWrapper} id="stuWrapper">
                    <canvas id="canvas3" className={style.canvas} width="600px" height="400px"></canvas>
                    <canvas id="canvas4" className={style.canvas} width="600px" height="400px"></canvas>
                </div>
            </div>
        );
    }
}
