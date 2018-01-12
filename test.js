/**
 * Created by pc100 on 2018/1/8 0008.
 */
//异步函数延时两秒执行
// function testA() {
//   setTimeout(function () {
//     return 200;
//   },2000)
// }
// //其它功能函数
// function testB(val) {
//   console.log(val)
// }
// //将testA异步函数的返回值当成参数来使用
// testB(testA());//遗憾的是这里输出的是undefined，原因是因为异步函数的调用是在主程序之后
//想要使用testA异步函数的值，解决方案有两种
// 1.那么我们只能将功能函数的功能集成到异步函数A当中来使用了
// function testA() {
//   setTimeout(function () {
//     console.log(200);//功能模块
//   },2000)
// }
// testA();
// 2.把testB当成testA的回调函数来使用
// function testA(callback) {
//   setTimeout(function () {
//     callback(200);//功能模块
//   },2000)
// }
// function callback(val) {
//   console.log(200)
// }
// testA(callback);
//ES6的Promise
//要想创建一个promise对象、可以使用new来调用Promise的构造器来进行实例化，实例化时可传一个函数
//对通过new生成的Promise对象为了设置其值在 resolve(成功) / reject(失败)时调用的回调函数 可以使用promise.then() 实例方法。
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