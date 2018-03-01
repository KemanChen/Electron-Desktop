# Electron-Desktop
基于Electron+react的桌面应用程序

## 实现功能如下：
* 硬件检测 
    * 其中包含视频检测与音频检测
* 白板绘制
	* 支持画笔、直线以及矩形等形状
	* 支持橡皮擦、更改画笔颜色以及撤回等功能
	* 支持绘画录制、暂停、播放等功能
	
#技术支持
* js框架：reactjs（react-deux、react-router）
* ui: ant-design
* 包管理工具：npm 
* 模块管理和打包工具：webpack
* 开发工具：webstorm

##安装运行
* npm install --安装依赖
* npm run clean --清除www目录文件
* npm run start/npm start 编译文件
* npm run dev --通过electron 启动程序
* npm run server --浏览器访问 8384端口启动

##打包.exe文件
* window平台: npm run packagerwin
* os平台: npm run packageros

##打包setup文件
* 可借助第三方打包脚步（推荐inno setup compiler）
* 参考地址: 
	*[inno setup](http://www.jrsoftware.org/isinfo.php) or
	*[nsis](http://blog.csdn.net/arvin0/article/details/56482370)
	
