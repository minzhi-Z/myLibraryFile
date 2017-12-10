class MyHammer{
	constructor(obj,options){
		this.eventQueue=[]; // 事件队列
		this._start_time=0; //--按下的时间
		this._timer=null;  //  添加一个定时器
		this.startx=0;
		this.starty=0;
		this.first=null;
		this.panstartx=0;
		this.panstarty=0;
		this.panmovex=0;
		this.panmovey=0;
		this.panendx=0;
		this.panendy=0;


		//  使用bind方法绑定 this
		obj.addEventListener('touchstart',this._start.bind(this),false);
		obj.addEventListener('touchmove',this._move.bind(this),false);
		obj.addEventListener('touchend',this._end.bind(this),false);
	}


	on(name,fn){
		this.eventQueue.push({name,fn})

		return this;  //-返回 this 支持链式操作
	}

	//  事件触发函数，通过传参便利事件队列，找到等于传参的事件
	//  名称，然后执行传过来的函数
	_trigger_event(name,values){  
		this.eventQueue.forEach(item=>{
			if(item.name==name){
				item.fn(values)
			}
		})
	}

	_start(ev){
		//  tap
		//----记录一个时间
		this._start_time=Date.now();

		this.first=true;
		this.startx=ev.targetTouches[0].clientX;
		this.starty=ev.targetTouches[0].clientY;

		clearTimeout(this._timer); //-使用定时器之前清除一下是个好习惯
		//  press长按事件 >251ms
		this._timer=setTimeout(function(){

			//  console.log('press')
			this._trigger_event('press')
		}.bind(this),250);

	}

	_move(ev){
		if(this.first){
			this.first=false;
			this.panstartx=ev.targetTouches[0].clientX;
			this.panstarty=ev.targetTouches[0].clientY;
			this._trigger_event('panstart',{panstartx:this.panstartx,panstarty:this.panstarty})
		}
		this.panmovex=ev.targetTouches[0].clientX;
		this.panmovey=ev.targetTouches[0].clientY;

		this._trigger_event('panmove',{panmovex:this.panmovex,panmovey:this.panmovey})
	}

	_end(ev){
		//-----记录另一个时间,
		// tap点击事件 <250ms
		if(Date.now()-this._start_time<=250){
			// console.log('tap')
			this._trigger_event('tap',{tapx:this.startx,tapy:this.starty})
			clearTimeout(this._timer); // tap的时候删掉press
		}

		this.panendx=ev.changedTouches[0].clientX;
		this.panendy=ev.changedTouches[0].clientY;
		this._trigger_event('panend',{panendx:this.panendx,panendy:this.panendy})
	}



}