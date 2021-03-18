---
layout: post
title:  "event loop"
date:   2018-08-05 18:31:00 +0800
categories: Living
tags: js
img: https://i.loli.net/2021/03/18/wOls1DJLEB5pijg.png
themecolor: "#fff"
themetextcolor: "#000"
---

# js中的事件循环机制

首先，javascript是**单线程**的。作为设计之初主要用来操作DOM的语言，如果允许存在两个线程，一个对当前DOM进行编辑，而另一个对当前DOM进行删除，这种矛盾的命令，是在为难浏览器，所以浏览器要保持GUI渲染线程和JS引擎线程**互斥**。但是，在单线程中，代码按顺序自上而下的执行，如果某一段代码执行的时间过长，就会引发阻塞，影响后面的代码执行，在浏览器上，非常影响用户体验。于是**event loop**作为js的并发机制就显得尤为重要。

## 基本概念☕️
---

### event queue  
js程序在运行时，一直维持着一个事件队列，主线程沿着这个队列依次执行。

### macrotask

script（整体代码）, setTimeout, setInterval, setImmediate, I/O, UI rendering

### microtask

process.nextTick, Promises（这里指浏览器实现的原生 Promise）, Object.observe, MutationObserver

> 在不支持原生Promise的浏览器上，经过polyfill的Promise是基于setTimeout，所以属于macrotask。

## 事件循环过程📖
---


![eventLoop.png](https://i.loli.net/2021/03/18/wOls1DJLEB5pijg.png)

整个过程大致上如图所示，对于一次宏任务的执行，如果遇到了微任务，那么添加到微任务队列中。当前宏任务执行完毕后（其实是同步代码执行完毕后），检查微任务队列，按先进先出的顺序执行微任务，直到微任务队列为空，这一次宏任务真正执行完毕，开始下一个宏任务。

## 举个例子🌰
```js
async function rose() {
    console.log('有一只玫瑰花属于我')
    return '你相信吗';
}

async function fox() {
    var promise = new Promise((resolve)=> { 
      console.log('世界上还是有很多只玫瑰花'); 
      resolve('星星还是很美')
    })
    promise.then((val)=> console.log(val));
    return Promise.resolve('我浇灌了她');
}

var promise = new Promise((resolve)=> { 
  console.log('世界上有很多只玫瑰花'); resolve('星星很美')
})

promise.then((val)=> console.log(val));

setTimeout(()=>{console.log('我驯服了这只狐狸')}, 1000)

console.log('有一只小狐狸与我形影不离')

async function start(){
    let ro = await rose()
    console.log(ro)
    let fo = await fox()
    console.log(fo)
}

start()

console.log('用心喜欢')
```
这段代码就是一个宏任务，现在来从第一行开始执行。   

前两段代码只是声明了两个函数，暂时不看。从第三段代码开始，创建了一个Promise，由于Promise内部的代码是同步执行的，所以输出第一句话`世界上有很多只玫瑰花`。这个Promise在下一段代码进入resolved，将这个Promise注册到微任务队列1⃣️。接着，遇到了setTimeout，这是一个创建一个宏事件的标志，由定时触发器线程进行为期一秒的定时，时间结束时，将函数推入到主线程的宏任务队列。继续，很好，终于碰到一个最简单的同步输出了，第二句话`有一只小狐狸与我形影不离`。下面又是一段函数声明，暂且跳过。终于，在声明了三次函数后，第一次迎来了函数调用，执行*start()*。这个start函数声明拥有*async*标志，这就意味着，这个函数一定会返回一个Promise。那么首先，进入函数第一行，*await rose()*。遇到了await，就意味着这句代码再等一个结果。await标记一次等待表达式的结果，如果是普通function，那么直接获取运算结果，代码同步执行。如果是async标记的function，意味着这个函数会返回一个Promise，那么await就会阻塞后面的代码，等待Promise返回的结果。而这个Promise和被阻塞的代码会作为**一整个微任务**，被注册到微任务列表中。但是首先，我们会先去执行rose函数，输出`有一只玫瑰花属于我`。然后将返回的Promise（此时虽然函数返回的是一个字符串，但是在async标志的影响下，其实是返回Promise.resolve('你相信吗')）和被阻塞的代码注册成一个微任务，放入微任务队列2⃣️。最后，又是一句同步输出，`用心喜欢`。   

截止到目前为止，同步代码执行完毕，按照约定，开始执行微任务队列中的代码。   

可以看到，微任务列表中此刻有两个微任务，首先执行1⃣️，会输出`星星很美`。接着执行2⃣️，也就是ro能够获取到值并输出`你相信吗`，接着又是*await fox()*，同样，先执行fox函数，函数中创建了一个Promise, 同步输出`世界上还是有很多只玫瑰花`，然后将这个Promise注册到微任务队列3⃣️，接着，这个函数自己返回了一个Promise，那么连同await fox()之后的代码注册成一个微任务，放入微任务队列4⃣️。这个时候微任务2⃣️执行完毕，开始执行3⃣️，输出`星星还是很美`。接着，执行4⃣️，fo获得结果，输出`我浇灌了她`，微任务队列执行完毕。   

当前宏任务执行完毕，定时器触发线程在定时结束后，将函数推入主线程，输出`我驯服了这只狐狸`。至此，这段代码执行完毕。   

chrome控制台执行结果如下:
```bash
世界上有很多只玫瑰花
VM135:15 有一只小狐狸与我形影不离
VM135:2 有一只玫瑰花属于我
VM135:24 用心喜欢
VM135:11 星星很美
VM135:19 你相信吗
VM135:6 世界上还是有很多只玫瑰花
VM135:7 星星还是很美
VM135:21 我浇灌了她
undefined
VM135:13 我驯服了这只狐狸
```

## 扩展
---
### VUE的异步更新DOM策略

>JS引擎线程，在完成一次宏事件后，会将交接棒传递给UI渲染线程，完成一次UI更新（他们俩只能这样交替进行工作）。   

如果在一次宏事件中，对同一个数据反复进行修改，假使每一次修改都去更新UI，那么代价太大了。所以最好在本次宏事件的末尾获取所有数据的最终状态，一次更新渲染。 Vue.nextTick()，其实就是将回调函数用Promise注册到本次宏事件的微事件队列的末尾，确保当前调用栈执行完毕后，再调用回调函数获取更新数据的最终结果。

## 参考
[从浏览器多进程到JS单线程，JS运行机制最全面的一次梳理](http://www.dailichun.com/2018/01/21/js_singlethread_eventloop.html)
