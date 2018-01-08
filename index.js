function MyPromise(callback) {
  this.status='pending';//状态,pending—等待，fulfilled-成功，rejected-失败
  this.onFulfilledCallback=[];
  this.onRejectedCallback=[];
  this.value=undefined;//成功的返回值
  this.reason=undefined;//失败的错误信息
  let self=this;
  function resolve(res) {
    if(self.status==='pending'){
      self.status='fulfilled';
      self.value=res;
      self.onFulfilledCallback.forEach(item=>{
        item(self.value)
      })
    }
  } 
  function reject(err) {
    if(self.status==='pending'){
      self.status='rejected';
      self.reason=err;
      self.onRejectedCallback.forEach(item=>{
        item(self.reason)
      })
    }
  }


  try {
    callback(resolve,reject)
  }catch (err){
    reject(err)
  }
}
/**
 * @params {Function} onFulfilled——成功回调，onReject——失败回调
 *
 * */
MyPromise.prototype.then=function (onFulfilled, onReject) {
  onFulfilled = typeof onFulfilled == 'function'?onFulfilled:function(value){return value};
  onReject = typeof onReject=='function'?onReject:function(reason){
    throw reason;
  }


  let self=this;
  let newPromise;//为了能够链式操作，返回全新Promise
  if(self.status==='pending'){//等待
      self.onFulfilledCallback.push(onFulfilled);
      self.onRejectedCallback.push(onReject);
  }
  if(self.status==='fulfilled'){//成功
    newPromise=new MyPromise(function (resolve, reject) {
      newPromise=resolve(self.value);
    })
  }
  if(self.status==='rejected'){
    newPromise=new MyPromise(function (resolve, reject) {
      newPromise=reject(self.reason);
    })
  }


//  之所以可以实现链式操作主要是因为每次的返回值都是一个新的promise

  return newPromise;
}


let test=new MyPromise(function (resolve, reject) {
  setTimeout(function () {
    resolve('这里是成功了')
  },2000)
})

test.then(res=>{
  console.log(res)
  return res;
}).then(res=>{
  console.log('这里是第二次'+res)
})