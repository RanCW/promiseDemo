/**
 * Created by pc100 on 2018/1/8 0008.
 */
let  test=new Promise(function (resolve, reject) {
  setTimeout(function () {
    resolve(2000)
  },2000)
})

test.then(res=>{
  console.log(res)
}).catch(err=>{
  console.log(err);
})