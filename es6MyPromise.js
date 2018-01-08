/**
 * Created by pc100 on 2018/1/8 0008.
 */
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
    let returnPromise;//返回的新promise
    if(this.status == 'pending'){//等待状态
      let self=this;
      returnPromise =new MyPromise(function (resolve, reject) {
        self.onFulfilledCallback.push(resolve);
        self.onRejectedCallback.push(reject);
      })
      // this.onFulfilledCallback.push(resolve)
      // this.onRejectedCallback.push(reject)
    }
    if(this.status=='fulfilled'){//成功
      this.resolve(this.value);

      returnPromise=new MyPromise(function (resolve,reject) {})
    }
    if(this.status=='rejected'){//失败
      this.reject(this.reason);
    }
  }
}

let test=new MyPromise(function (resolve, reject) {
  setTimeout(function () {
    resolve(1000)
  },2000)
})
test.then(function (res) {
  console.log(res+'成功')
},function (err) {
  console.log(err+'错误')
})
