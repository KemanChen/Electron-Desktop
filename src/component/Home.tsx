import React from 'react';
import { Layout, Menu, Breadcrumb, Icon ,Button} from 'antd';
import {Link,Route} from "react-router-dom";
import style from "./style.scss";
import {Paint} from "./Paint";
import {StudentPaint} from "./Student";
const { SubMenu } = Menu;
const { Header, Content, Footer, Sider } = Layout;

interface HomeOwnProps{}
interface HomeOwnState{}

export default class Home extends React.Component<HomeOwnProps, HomeOwnState>{
    track: Array<any>;
    //音频参数
    audioContext: any;
    audioInput: any;
    realAudioInput: any;
    inputPoint: any;
    audioRecorder: any;
    recIndex: number;
    //
    audio: any;
    constructor(props: HomeOwnProps){
        super(props);
        this.track = [];
        //初始化参数
        this.audioContext = new AudioContext();
        this.audioInput = null;
        this.realAudioInput = null;
        this.inputPoint = null;
        this.audioRecorder = null;
        this.recIndex = 0;

        this.audio = new Audio("images/demo.mp3");
        this.deskCapture = this.deskCapture.bind(this);
        this.closeVideo = this.closeVideo.bind(this);
        this.audioCheck = this.audioCheck.bind(this);
        this.beginRecord = this.beginRecord.bind(this);
        this.stopRecord = this.stopRecord.bind(this);
        this.playDemo = this.playDemo.bind(this);
    }
    componentDidMount(){
        // this.deskCapture();
        let arr = new Array(10);
        arr[5].push(10);
        console.log(arr);
    }
    //渲染进程
    deskCapture() {
        let media = navigator.getUserMedia({
            audio: true,
            video: {
                width: 320,
                height: 200
            }
        }, (stream: any) => {
            let video = document.querySelector("video");
            this.track = stream.getTracks();
            video.setAttribute("controls","controls");
            video.src = window.URL.createObjectURL(stream);
            video.play();
        }, (err: any) => {
            console.log("getUserMediaError:" + JSON.stringify(err));
        });
    }
    //关闭视频
    closeVideo(){
        this.track.map((item: any)=>{item.stop()});
        document.querySelector("video").pause();
    }
    //音频检测
    audioCheck(){
        navigator.getUserMedia({
            audio: true
        },(stream: any)=>{
            let Recorder = (window as any).Recorder;
            this.inputPoint = this.audioContext.createGain();

            this.realAudioInput = this.audioContext.createMediaStreamSource(stream);
            this.audioInput = this.realAudioInput;
            this.audioInput.connect(this.inputPoint);

            let analyserNode = this.audioContext.createAnalyser();
            analyserNode.fftSize = 2048;
            this.inputPoint.connect(analyserNode);

            this.audioRecorder = new Recorder(this.inputPoint);

            let zeroGain = this.audioContext.createGain();
            zeroGain.gain.value = 0.0;
            this.inputPoint.connect( zeroGain );
            zeroGain.connect( this.audioContext.destination );

        },(e: any)=>{
            console.log(e);
        })
    }
    beginRecord(){
        if (!this.audioRecorder)
            return;
        this.audioRecorder.clear();
        this.audioRecorder.record();
    }
    stopRecord(){
        this.audioRecorder.stop();
        this.audioRecorder.getBuffers( ()=>{
            this.audioRecorder.exportWAV( doneEncoding );
        });
        function doneEncoding( blob: any ) {
            (window as any).Recorder.setupDownload( blob, "myRecording" + Math.random() + ".wav" );
            let audio = document.querySelector("audio");
            audio.setAttribute("controls","controls");
            audio.src = window.URL.createObjectURL(blob);
        }
    }
    playAudio(){
        let audio = document.querySelector("audio");
        audio.play();
    }
    playDemo(){
        if(this.audio.paused){
            this.audio.play();
        }else {
            this.audio.pause();
        }
    }
    render(){
        const videoOption = () => (
            <div>
                <video id="video">
                    您的浏览器不支持 video 标签。
                </video>
                <div>
                    <Button type="primary" onClick={this.deskCapture} style={{marginRight: 20}}>视频</Button>
                    <Button type="primary" onClick={this.closeVideo}>结束</Button>
                </div>
            </div>
        );
        const AudioOption = () => (
            <div>
                <p id="status"></p>
                <div>
                    <Button type="primary" onClick={this.audioCheck} style={{marginRight: 20}}>Check</Button>
                    <Button type="primary" onClick={this.beginRecord} style={{marginRight: 20}}>Begin</Button>
                    <Button type="primary" onClick={this.stopRecord} style={{marginRight: 20}}>Stop</Button>
                    <Button type="primary" style={{marginRight: 20}}>
                        <a id="save" href="#">Save</a>
                    </Button>
                    <Button type="primary" onClick={this.playAudio} style={{marginRight: 20}}>Play</Button>
                    <Button type="primary" onClick={this.playDemo}>Play Demo</Button>
                </div>
                <audio id="audio">
                    您的浏览器不支持 audio 标签。
                </audio>
            </div>
        );
        const IntelOption = () => (
            <div>
                <h2>是否联网：{navigator.onLine}</h2>
            </div>
        );
        const boardOption = () => (
            <div></div>
        );
        return(
            <div id={style.homePage}>
                <Layout>
                    <Header className="header">
                        <div className="logo" />
                        <Menu
                            theme="dark"
                            mode="horizontal"
                            defaultSelectedKeys={['2']}
                            style={{ lineHeight: '64px' }}
                        >
                            <Menu.Item key="1">学习中心</Menu.Item>
                            <Menu.Item key="2">奖品中心</Menu.Item>
                            <Menu.Item key="3">个人中心</Menu.Item>
                        </Menu>
                    </Header>
                    <Content style={{ padding: '0 50px' }}>
                        <Breadcrumb style={{ margin: '16px 0' }}>
                            <Breadcrumb.Item>Home</Breadcrumb.Item>
                            <Breadcrumb.Item>List</Breadcrumb.Item>
                            <Breadcrumb.Item>App</Breadcrumb.Item>
                        </Breadcrumb>
                        <Layout style={{ padding: '24px 0', background: '#fff' }}>
                            <Sider width={200} style={{ background: '#fff' }}>
                                <Menu
                                    mode="inline"
                                    defaultSelectedKeys={['1']}
                                    defaultOpenKeys={['sub1']}
                                    style={{ height: '100%' }}
                                >
                                    <SubMenu key="sub1" title={<span><Icon type="user" />一对一</span>}>
                                        <Menu.Item key="1"><Link to="/video">视频检测</Link></Menu.Item>
                                        <Menu.Item key="2"><Link to="/audio">音频检测</Link></Menu.Item>
                                        <Menu.Item key="3"><Link to="/intel">网络检测</Link></Menu.Item>
                                        <Menu.Item key="4"><Link to="/board">白板</Link></Menu.Item>
                                    </SubMenu>
                                    <SubMenu key="sub2" title={<span><Icon type="laptop" />学生端</span>}>
                                        <Menu.Item key="5">
                                            <Link to="/stuPaint">课堂</Link>
                                        </Menu.Item>
                                        <Menu.Item key="6">option6</Menu.Item>
                                        <Menu.Item key="7">option7</Menu.Item>
                                        <Menu.Item key="8">option8</Menu.Item>
                                    </SubMenu>
                                    <SubMenu key="sub3" title={<span><Icon type="notification" />subnav 3</span>}>
                                        <Menu.Item key="9">option9</Menu.Item>
                                        <Menu.Item key="10">option10</Menu.Item>
                                        <Menu.Item key="11">option11</Menu.Item>
                                        <Menu.Item key="12">option12</Menu.Item>
                                    </SubMenu>
                                </Menu>
                            </Sider>
                            <Content style={{ padding: '0 24px', minHeight: 280 }}>
                                <Route path="/video" component={videoOption}/>
                                <Route path="/audio" component={AudioOption}/>
                                <Route path="/intel" component={IntelOption}/>
                                <Route path="/board" component={Paint}/>
                                <Route path="/stuPaint" component={StudentPaint}/>
                            </Content>
                        </Layout>
                    </Content>
                    <Footer style={{ textAlign: 'center' }}>
                        Ant Design ©2016 Created by Ant UED
                    </Footer>
                </Layout>
            </div>
        );
    }
}