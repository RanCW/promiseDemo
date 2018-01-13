### 代码说明
 * es6MyPromise.js 为完整Promise原理分析代码
 * 其它文件均为个人写的测试代码


## ES6新特性Promise详解

在ES6当中添加了很多新的API其中很值得一提的当然少不了Promise，因为Promise的出现，很轻松的就给开发人员解决了异步回调地狱的问题，废话不多，直接上代码。 <br/>
在以前我们有个一个异步函数，而且还会有返回值给别的功能函数使用，函数如下：
```javaScript
 //异步函数延时两秒执行
function testA() {
  setTimeout(function () {
    return 200;
  },2000)
}
//其它功能函数
function testB(val) {
  console.log(val)
}
//将testA异步函数的返回值当成参数来使用
testB(testA());//遗憾的是这里输出的是undefined，原因是因为异步函数的调用是在主程序之后
//想要使用testA异步函数的值，解决方案有两种
// 1.那么我们只能将功能函数的功能集成到异步函数A当中来使用了
function testA() {
  setTimeout(function () {
    console.log(200);//功能模块
  },2000)
}
testA();
// 2.把testB当成testA的回调函数来使用
function testA(callback) {
  setTimeout(function () {
    callback(200);//功能模块
  },2000)
}
function callback(val) {
  console.log(200)
}
testA(callback);
但是这两种方式存在的问题很多，例如层级之间的嵌套太深，代码很臃肿，可读性与可维护性都极低。

直到ES6当中Promise的出现，这样子的事情就变得很简单了：
//要想创建一个Promise对象、可以使用new来调用Promise的构造器来进行实例化，实例化时可传一个函数
//对通过new生成的promise对象为了设置其值在 resolve(成功) / reject(失败)时调用的回调函数
// 可以使用promise.then() 实例方法。
//promise.then(onFulfilled, onRejected)
//resolve(成功)时，onFulfilled 会被调用
//reject(失败)时，onRejected 会被调用
let P1=new Promise((resolve,reject)=>{
  setTimeout(function () {
    resolve(200)
  },2000)
}).then(res=>{
  console.log(res)
})
通过Promise的使用上面两种情况是不是就变得很简单了呢
```
但是，Promise的实现到底是一个什么样的原理呢？下面我将会来一一的解析：

因为Promise要以实例化的方式来使用，所以需要创建一个类MyPromise，示例如下：
```javaScript
class MyPromise{
    constructor(callback){
        try{
            callback(this.resolve.bind(this),this.reject.bind(this))
        }catch (err){
            this.reject(err)
        }
        this.status='pending';//状态——pending-等待，fulfilled-成功，rejected-失败
        this.onRejectedCallback=[];//失败回调集合
        this.onFulfilledCallback=[];//成功回调集合
        this.value=undefined;//成功返回值
        this.reason=undefined;//失败返回值
    }
    resolve(res){
        if(this.status==='pending'){
            this.status='fulfilled';
            this.value=res;
            this.onFulfilledCallback.forEach((item)=>{
                item(this.value);
            })
        }
    }
    reject(err){
        if(this.status==='pending'){
            this.status='rejected';
            this.reason=err;
            this.onRejectedCallback.forEach((item)=>{
                item(this.reason);
            })
        }
    }
    then(resolve,reject){
        resolve = typeof resolve == 'function'?resolve:function(value){return value};
        reject = typeof reject=='function'?reject:function(reason){
            throw reason;
        };
        this.resolve=resolve;
        this.reject=reject;
        let self=this;
        if(self.status == 'fulfilled'){
            resolve(self.value);
        }
        if(self.status == 'rejected'){
            reject(self.reason);
        }
        if(self.status == 'pending'){
            self.onFulfilledCallback.push(resolve);
            self.onRejectedCallback.push(reject);
        }
    }
}
//测试
let test=new MyPromise(function (resolve,reject) {
        setTimeout(function () {
            resolve(1000)
        },2000)
})
test.then(res=>{
    console.log(res)
},err=>{
    console.log(err+'err')
})
```
按照上述的示例，一个简单的基础Promise就实现了，但是我们会发现ES6提供的Promise当中可以按照jQuery一样的链式调用，如下：
```javascript
    var origin=new Promise((resolve,reject)=>{
    setTimeout(function () {
        resolve('成功')
    },2000)
})
//链式调用
origin.then(res=>{
    console.log(res)
    return res;
}).then(res=>{
    console.log(res)
})
```
在jQuery当中的链式调用大家都清楚，jQuery之所以能够实现链式调用是因为每个jQuery方法返回的JQuery对象本身，那么在Promise里，其实每个Promise的then方法里面返回的都是一个全新的promise，原理如下：
```javascript
    class MyPromise {
    constructor(callback) {
        this.status = 'pending';//状态——pending-等待，fulfilled-成功，rejected-失败
        this.onRejectedCallback = [];//失败回调集合
        this.onFulfilledCallback = [];//成功回调集合
        this.value = undefined;//成功回调
        this.reason = undefined;//失败回调
        try {
            callback(this.resolve.bind(this), this.reject.bind(this))
        } catch (err) {
            this.reject(err)
        }
    }
    resolve(res) {
        if (res instanceof MyPromise) {
            return res.then(res.resolve.bind(this),res.reject.bind(this));
        }
        if (this.status === 'pending') {
            this.status = 'fulfilled';
            this.value = res;
            this.onFulfilledCallback.forEach((item) => {
                item(this.value);
            })
        }
    }

    reject(err) {
        if (this.status === 'pending') {
            this.status = 'rejected';
            this.reason = err;
            this.onRejectedCallback.forEach((item) => {
                item(this.reason);
            })
        }
    }

    resolvePromise(returnPromise, x, resolve, reject) {
        let then;
        //如果x就是returnPromise
        if (returnPromise === x) {
            return reject(new TypeError('循环引用'));
        }
        if (x instanceof MyPromise||x instanceof Promise) {
            if(x instanceof Promise){
                x.then(function (val) {
                    resolve(val)
                })
            }else{
                if (x.status == 'pending') {
                    x.then(function (y) {
                        this.resolvePromise(returnPromise, y, resolve, reject);
                    }, reject);
                } else if (x.status == 'fulfilled') {
                    resolve(x.value);
                } else if (x.status == 'rejected') {
                    reject(x.reason);
                }
            }

        } else if (x != null && (typeof x == 'object' || typeof x == 'function')) {
            try {
                then = x.then;
                if (typeof then == 'function') {
                    then.call(x, function (y) {
                        this.resolvePromise(returnPromise, y, resolve, reject)
                    }, reject);
                }
            } catch (e) {
                reject(e);
            };
        } else {
            resolve(x);
        }
    }

    then(resolve, reject) {
        resolve = typeof resolve == 'function' ? resolve : function (value) {
            return value
        };
        reject = typeof reject == 'function' ? reject : function (reason) {
            throw reason;
        };
        this.resolve = resolve;
        this.reject = reject;
        let returnPromise;//返回的新promise
        let self = this;
        if (this.status == 'pending') {//等待状态
           //创建返回的新的MyPromise
           //这里通过returnPromise，returnResolve，returnReject等命名主要是为了区分是之前的与新的返回的MyPromise对象的属性
            returnPromise = new MyPromise(function (returnResolve, returnReject) {
                self.onFulfilledCallback.push(function () {
                    let x = resolve(self.value);
                    self.resolvePromise(returnPromise, x, returnResolve, returnReject);
                });
                self.onRejectedCallback.push(function () {
                    let x = reject(self.reason);
                    self.resolvePromise(returnPromise, x, returnResolve, returnReject);
                });
            });
        }
        if (this.status == 'fulfilled') {//成功
           //创建返回的新的MyPromise
            returnPromise = new MyPromise(function (returnResolve, returnReject) {
                let x = resolve(self.value);
                self.resolvePromise(returnPromise, x, returnResolve, returnReject);
            });
        }
        if (this.status == 'rejected') {//失败
            //创建返回的新的MyPromise
            returnPromise = new MyPromise(function (returnResolve, returnReject) {
                let x = reject(self.reason);
                self.resolvePromise(returnPromise, x, returnResolve, returnReject);
            });
        }
         //返回新的MyPromise
        return returnPromise;
    }
}

//测试代码
let test=new MyPromise(function (resolve,reject) {
        setTimeout(function () {
            resolve(1000)
        },1000)
})
test.then(res=>{
    console.log(res)
    return res+200
},err=>{
    console.log(err+'err')
}).then(res=>{
    console.log(res);
})
```
按照以上代码一样，每个then方法都返回一个全新的MyPromise方法，于是就基本实现了一个ES6中Promise的链式调用。

### Promise.all
在我们的ES6中还有Promise.all这样一个方法，该方法主要是传入一个promise集合，返回一个全新的Promise实例，该全新的Promise实例的返回值为当集合当中所有的集合的所有的Promise都成功时才会返回一个对应的每个Promise成功的返回值的集合，但是只要有一个Promise失败，就会马上走到整个Promise.all包装后的新Promise对象的失败里面，ES6的使用方法如下：
```javascript
1.全成功
var winnerPromise = new Promise(function (resolve,reject) {
    setTimeout(function () {
        resolve('this is winner');
    }, 800);
});
var loserPromise = new Promise(function (resolve,reject) {
    setTimeout(function () {
        resolve('this is loser');
    }, 1000);
});
Promise.all([winnerPromise, loserPromise]).then(function (value) {
    console.log(value);    // => 'this is winner'
}).catch(err=>{
    console.log(err);
});
//输出结果
[ 'this is winner', 'this is loser' ]
2.有一个失败
var winnerPromise = new Promise(function (resolve,reject) {
    setTimeout(function () {
        resolve('this is winner');
    }, 800);
});
var loserPromise = new Promise(function (resolve,reject) {
    setTimeout(function () {
        reject('this is loser');
    }, 1000);
});
Promise.all([winnerPromise, loserPromise]).then(function (value) {
    console.log(value);    // => 'this is winner'
}).catch(err=>{
    console.log(err);
});
//输出
this is loser
```
对其原理解析：
```javascript 
    因为该方法不需要实例化就能使用，于是在我们原本的 MyPromise类上面添加这样一个静态方法
static all(arr) {
        return new MyPromise((resolve, reject) => {
            let result = [];
            let resolveIndex = 0;
            let resolved = function (index) {
                return function (data) {
                    result[index] = data;
                    resolveIndex++;
                    if (resolveIndex === arr.length) {
                        resolve(result)
                    }
                }
            };
            arr.forEach((item, index) => {
                item.then(resolved(index), err => {
                    reject(err)
                })
            });
        })
    }
```
以上代码就在我前面写的MyPromise类中实现了一个ES6的all方法。
### Promise.race
在我们的ES6中还有Promise.race这样一个方法，该方法主要是传入一个promise集合，返回一个全新的Promise实例，与Promise.all很相似，但是不同的是，Promise.race方法只要传入集合中有一个成功或者失败，返回的全新的Promise实例就马上成功或者失败。

ES6代码如下：
```javascript
var winnerPromise = new Promise(function (resolve,reject) {
    setTimeout(function () {
        resolve('this is winner');
    }, 800);
});
var loserPromise = new Promise(function (resolve,reject) {
    setTimeout(function () {
        reject('this is loser');
    }, 1000);
});
Promise.race([winnerPromise, loserPromise]).then(function (value) {
    console.log(value);    // => 'this is winner'
}).catch(err=>{
    console.log(err);
});
//输出
this is winner
```
因为该race方法不需要实例化就能使用，于是同样在我们的MyPromise上面添加一个static方法，原理解析代码片段如下：
```javascript
    static race(arr) {
        return new MyPromise((resolve, reject) => {
            arr.forEach((item, index) => {
                item.then(res => {
                    resolve(res);
                }, err => {
                    reject(err)
                })
            });
        })
    }
```

### Promise.catch
ES6中Promise.catch方法其实就是和then方法的reject方法是一样的应用场景，就是当Promise实例在只能reject的回调函数,ES6代码如下:
```javascript
    let  test=new Promise(function (resolve, reject) {
  setTimeout(function () {
      reject(2000)
  },2000)
})

test.then(res=>{
  console.log(res)
}).catch(err=>{
  console.log(err);
})
//输出2000
```
在MyPromise当中进行原理解析，代码片段如下：
```javascript   
    catch(catchFunc) {
        return this.then(null, catchFunc);
    }
```
以上就是我对于ES6当中Promise的一些理解，当然在代码当中肯定有很多的不足，欢迎大家多多交流，多多指正，

完整代码Github地址：[https://github.com/RanCW/promiseDemo](https://github.com/RanCW/promiseDemo)（欢迎大家star）

参考文献：

[JavaScript Promise迷你书（中文版）](http://liubin.org/promises-book/#introduction)

[MDN社区](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)