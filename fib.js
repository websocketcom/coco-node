// let mysql = require("mysql");
let axios = require('axios');//请求网址模块
var request = require('request');//也是请求网址模块，只不过下载图片的函数比较简单，所以用这个
let fs = require('fs');//用于操作文件流
const cheerio = require('cheerio')
let url = "http://www.4399dmw.com/haizeiwang/renwu/"
let headers = {"User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.140 Safari/537.36 Edge/18.17763"}
let i = 0;
// 获取每个人物的地址函数 
async function get_onePice(){
    let res =  await axios.get(url,{
        headers
    });
    // cheerio加载res里面的数据
    let $ =  cheerio.load(res.data);
    $(".g_rolelist li a").each((i,element)=>{
        href = "http://www.4399dmw.com"+ $(element).attr("href")
        // 根据地址,访问任务详情，抓取详情信息
        //  console.log(href)
        //  personInfo(href)

        let pattern = /http:\/\/.*?(gif|png|jpg)/gi;
        let image = $(element).html().match(pattern)[0];
        i++;　　　　//下载图片
        download_img(image,'./teacher/t'+i+'.jpg')

    })


}
//获取图片个人信息
async function personInfo(href){
    let res = await axios.get(href);
    let $ = cheerio.load(res.data);
    // 人物名称,获取元素文本
    let user= $(".dm_title").text();
    // user = user.substring(3,this.length)
    // 人物简介，获取元素的纯页面元素
    let detail = $(".dm_content").html();
    console.log(user)
}


// 异步执行函数，用于下载图片，接收图片地址，和文件命名方式两个参数。
async function download_img(img_url, file_name){
    await request(img_url).pipe(fs.createWriteStream(file_name)).on('close',function(){
        console.log('pic saved!')
    })
}

// 执行函数
get_onePice()