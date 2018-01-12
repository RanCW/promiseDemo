/**
 * Created by pc100 on 2018/1/8 0008.
 */
class promiseParent{

}


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
    this.value=undefined;
    this.reason=undefined;
  }
  resolve(res){
    if(res instanceof Promise){
      return res.then(resolve,reject);
    }
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
  resolvePromise(promise2,x,resolve,reject){
    let then;
    //如果x就是promise2
    if(promise2 === x){
      return reject(new TypeError('循环引用'));
    }
    if(x instanceof Promise){
      if(x.status == 'pending'){
        x.then(function(y){
          this.resolvePromise(promise2,y,resolve,reject);
        },reject);
      }else if(x.status == 'fulfilled'){
        resolve(x.value);
      }else if(x.status == 'rejected'){
        reject(x.reason);
      }
    }else if(x!=null && (typeof x == 'object' || typeof x == 'function')){
      try{
        then = x.then;
        if(typeof then == 'function'){
          then.call(x,function(y){
            this.resolvePromise(promise2,y,resolve,reject)
          },reject);
        }
      }catch(e){
        reject(e);
      };
    }else{
      resolve(x);
    }
  }
  then(resolve,reject){
    resolve = typeof resolve == 'function'?resolve:function(value){return value};
    reject = typeof reject=='function'?reject:function(reason){
      throw reason;
    };
    this.resolve=resolve;
    this.reject=reject;
    let returnPromise;//返回的新promise
    let self=this;
    if(this.status == 'pending'){//等待状态
      returnPromise = new Promise(function(returnResolve,returnReject){
        self.onFulfilledCallback.push(function(){
          let x = resolve(self.value);
          self.resolvePromise(returnPromise,x,returnResolve,returnReject);
        });
        self.onRejectedCallback.push(function(){
          let x = reject(self.reason);
          self.resolvePromise(returnPromise,x,returnResolve,returnReject);
        });
      });
    }
    if(this.status=='fulfilled'){//成功
      returnPromise = new Promise(function(returnResolve,returnReject){
        let x = resolve(self.value);
        self.resolvePromise(returnPromise,x,returnResolve,returnReject);
      });
    }
    if(this.status=='rejected'){//失败
      returnPromise = new Promise(function(returnResolve,returnReject){
        let x = reject(self.reason);
        self.resolvePromise(returnPromise,x,returnResolve,returnReject);
      });
    }
    return returnPromise;
  }
  catch(catchFunc){
    this.then(null,catchFunc);
  }
  static all(arr){
    return new MyPromise((resolve,reject)=>{
      let result=[];
      let resolveIndex=0;
      let resolved=function (index) {
        return function (data) {
          result[index]=data;
          resolveIndex++;
          if(resolveIndex===arr.length){
            resolve(result)
          }
        }
      };
      arr.forEach((item,index)=>{
        item.then(resolved(index),err=>{
          reject(err)
        })
      });
    })
  }
  static race(arr){
    return new MyPromise((resolve,reject)=>{
      arr.forEach((item,index)=>{
        item.then(res=>{
          resolve(res);
        },err=>{
          reject(err)
        })
      });
    })
  }
}

let test1=new MyPromise(function (resolve, reject) {
  setTimeout(function () {
    reject(1000)
  },400)
});

let test2=new MyPromise(function (resolve, reject) {
  setTimeout(function () {
    resolve(2000)
  },100)
});

let all=MyPromise.race([test1,test2])

all.then(res=>{
  console.log(res)
},err=>{
  console.log(err+'err');
})