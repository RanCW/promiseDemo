/**
 * Created by pc100 on 2018/1/8 0008.
 */
let  test=new Promise(function (resolve, reject) {
  setTimeout(function () {
    resolve(2000)
  },2000)
})

// test.then(res=>{
//   console.log(res)
// }).catch(err=>{
//   console.log(err);
// })

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
// 第一个promise变为resolve后程序停止
Promise.race([winnerPromise, loserPromise]).then(function (value) {
  console.log(value);    // => 'this is winner'
}).then(res=>{
  console.log(res);
}).catch(err=>{
  console.log(err);
});