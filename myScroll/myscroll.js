class MyScroll{
	constructor(selector,options={}){
		this.eventQueue=[]; //--声明一个事件队列

		//------封装一个函数来处理参数
		function defaultValues(options, defaults){
			for(let name in defaults){
				if(typeof options[name] =='undefined'){ 
					//---如果name为空，就是用默认值
					options[name]=defaults[name]
				}
			}
		}
		//----处理默认的参数
		defaultValues(options,{
			bounce:true,  //-true可以拖出框，false不可以
			bounceTime:600,
			scrollX:false,
			scrollY:true,
			freeScroll:false,
			startX:0,
			startY:0,
			directionLockThreshold:5
		})


		//--选出父级元素
		let aParent=Array.from(document.querySelectorAll(selector));

		aParent.forEach(parent=>{
			//--便利取出每个父级元素
			//--只有第一个子元素可以被拖动
			let child=parent.children[0];

			if(!child)return; //-如果一个子元素都没有return

			//--加事件---
			child.addEventListener('touchstart',start,false);
			child.addEventListener('touchmove',move,false);
			child.addEventListener('touchend',end,false);

			let startX=0,startY=0;
			let disX=0,disY=0;
			let translateX=options.startX,translateY=options.startY;
			let dir='';
			let _this=this;
			let firstMove;

			child.style.transform=`translateX(${translateX}px) translateY(${translateY}px)`;


			function start(ev){
				startX=ev.targetTouches[0].clientX;
				startY=ev.targetTouches[0].clientY;

				disX=startX-translateX;
				disY=startY-translateY;
				dir=''; //---每次start重置方向

				//--有没有用户需要监听，如果有就执行对面的fn函数
				_this.eventQueue.forEach(json=>{
					if(json.type=='beforeScrollStart'){
						json.fn();
					} 
				})

				firstMove=true;
			}

			function move(ev){
				//--第一次start的时候执行，并把firstMove改为false，确保只执行一次
				if(firstMove){  
					firstMove=false;
					_this.eventQueue.forEach(json=>{
						if(json.type=='scrollStart'){
							json.fn();
						} 
					})
				}

				if(!dir){
					if(Math.abs(ev.targetTouches[0].clientX-startX)>=options.directionLockThreshold){
						dir='x'
					}
					if(Math.abs(ev.targetTouches[0].clientY-startY)>=options.directionLockThreshold){
						dir='y'
					}
				}else{
					if(options.freeScroll||dir=='x'){
						translateX=ev.targetTouches[0].clientX-disX;
					}
					if(options.freeScroll||dir=='y'){
						translateY=ev.targetTouches[0].clientY-disY;
					}
					if(options.bounce==false){
						if(translateX>0){ 
							translateX=0; 
						}
						if(translateX<parent.offsetWidth-child.offsetWidth){
							translateX=parent.offsetWidth-child.offsetWidth
						}
						if(translateY>0){
							translateY=0
						}
						if(translateY<parent.offsetHeight-child.offsetHeight){
							translateY=parent.offsetHeight-child.offsetHeight
						}
					}
					
					_this.x=translateX;
					_this.y=translateY;	

					//----有没有用户监听scroll事件
					_this.eventQueue.forEach(json=>{
						if(json.type=='scroll'){
							json.fn();
						} 
					})

					child.style.transform=`translateX(${translateX}px) translateY(${translateY}px)`;
				}
			}

			function end(){
				if(translateX>0){ 
					translateX=0; 
				}
				if(translateX<parent.offsetWidth-child.offsetWidth){
					translateX=parent.offsetWidth-child.offsetWidth
				}
				if(translateY>0){
					translateY=0
				}
				if(translateY<parent.offsetHeight-child.offsetHeight){
					translateY=parent.offsetHeight-child.offsetHeight
				}
				//----设置了可以拖动的最大范围

				child.style.transition=`${options.bounceTime}ms all ease`
				child.style.transform=`translateX(${translateX}px) translateY(${translateY}px)`
				
				child.addEventListener('transitionend',tend,false); 
				//--给过渡结束添加事件，去掉元素上多余的transition和事件，不要多余的东西，
				//--挂载的越多性能就越差
				function tend(){ 
					child.style.transition='';
					child.removeEventListener('transitionend',tend,false);

					//----有没有人监听 scrollEnd事件
					_this.eventQueue.forEach(json=>{
						if(json.type=='scrollEnd'){
							json.fn();
						} 
					})
				}
			}

		})
	}

	on(name, fn){  //---给事件队列添加事件
		this.eventQueue.push({type: name,fn});
	}

}