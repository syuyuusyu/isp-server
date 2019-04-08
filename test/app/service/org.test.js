'use strict';

const { app, assert } = require('egg-mock/bootstrap');

describe('test/app/service/org.test.js', () => {

    it('createOrg', async ()=> {

        const ctx = app.mockContext();
        let json=`{
  "status": "801",
  "messages": "查询成功",
  "respData": null,
  "t": {
    "xmid": "76b9844474354a7b8bcd7cbdfbef5807",
    "xmmc": "麒麟区第三次全国国土调查项目",
    "users": [
      {
        "uid": "gtswzx_lizhixiong",
        "xm": "gtswzx_lizhixiong",
        "xb": "男",
        "zw": "作业人员",
        "lxdh": "13398794341",
        "dz": null,
        "gzjd": 0.0
      },
      {
        "uid": "gtswzx_ningwenwen",
        "xm": "国土事务中心-宁文文",
        "xb": "男",
        "zw": "作业人员",
        "lxdh": "15887488151",
        "dz": null,
        "gzjd": 0.0
      },
      {
        "uid": "gtswzx_shijuping",
        "xm": "国土事务中心-施菊萍",
        "xb": "男",
        "zw": "作业人员",
        "lxdh": "13529019250",
        "dz": null,
        "gzjd": 0.0
      },
      {
        "uid": "gtswzx_zengkunhong",
        "xm": "国土事务中心-曾昆红",
        "xb": "男",
        "zw": "作业人员",
        "lxdh": "13529743730",
        "dz": null,
        "gzjd": 0.0
      },
      {
        "uid": "gtswzx_zhaoxiaofeng",
        "xm": "国土事务中心-赵晓锋",
        "xb": "男",
        "zw": "作业人员",
        "lxdh": "15717411518",
        "dz": null,
        "gzjd": 0.0
      },
      {
        "uid": "gtswzx_zhujindong",
        "xm": "国土事务中心-朱瑾冬",
        "xb": "男",
        "zw": "作业人员",
        "lxdh": "15752155500",
        "dz": null,
        "gzjd": 0.0
      },
      {
        "uid": "gtswzx_lixingshuai",
        "xm": "国土事务中心_李兴帅",
        "xb": "男",
        "zw": "作业人员",
        "lxdh": "13987675083",
        "dz": null,
        "gzjd": 0.0
      },
      {
        "uid": "gtswzx_yaowenying",
        "xm": "国土事务中心_姚文映",
        "xb": "男",
        "zw": "作业人员",
        "lxdh": "15912292436",
        "dz": null,
        "gzjd": 0.0
      },
      {
        "uid": "lcfy_kezhenying",
        "xm": "临沧分院-可珍莹",
        "xb": "男",
        "zw": "作业人员",
        "lxdh": "15887108211",
        "dz": null,
        "gzjd": 0.0
      },
      {
        "uid": "qjfy_chenyun",
        "xm": "曲靖分院-陈允",
        "xb": "男",
        "zw": "作业人员",
        "lxdh": "15087128895",
        "dz": null,
        "gzjd": 0.0
      },
      {
        "uid": "qjfy_gongcan",
        "xm": "曲靖分院-龚灿",
        "xb": "男",
        "zw": "作业人员",
        "lxdh": "15887458238",
        "dz": null,
        "gzjd": 0.0
      },
      {
        "uid": "qjfy_guyuanli",
        "xm": "曲靖分院-顾媛丽",
        "xb": "男",
        "zw": "作业人员",
        "lxdh": "15096634796",
        "dz": null,
        "gzjd": 0.0
      },
      {
        "uid": "qjfy_guomengyuan",
        "xm": "曲靖分院-郭梦元",
        "xb": "男",
        "zw": "作业人员",
        "lxdh": "15287996032",
        "dz": null,
        "gzjd": 0.0
      },
      {
        "uid": "qjfy_huanglinghu",
        "xm": "曲靖分院-黄玲虎",
        "xb": "男",
        "zw": "作业人员",
        "lxdh": "15187472513",
        "dz": null,
        "gzjd": 0.0
      },
      {
        "uid": "qjfy_puwenjun",
        "xm": "曲靖分院-普文君",
        "xb": "男",
        "zw": "作业人员",
        "lxdh": "18468196270",
        "dz": null,
        "gzjd": 0.0
      },
      {
        "uid": "qjfy_wangchunli",
        "xm": "曲靖分院-王春丽",
        "xb": "男",
        "zw": "作业人员",
        "lxdh": "15911930836",
        "dz": null,
        "gzjd": 0.0
      },
      {
        "uid": "qjfy_wangdongli",
        "xm": "曲靖分院-王东利",
        "xb": "男",
        "zw": "作业人员",
        "lxdh": "13618843416",
        "dz": null,
        "gzjd": 0.0
      },
      {
        "uid": "qjfy_yangwenshuang",
        "xm": "曲靖分院-杨文双",
        "xb": "男",
        "zw": "作业人员",
        "lxdh": "18487228802",
        "dz": null,
        "gzjd": 0.0
      },
      {
        "uid": "qjfy_zhaoyan",
        "xm": "曲靖分院-赵艳",
        "xb": "男",
        "zw": "作业人员",
        "lxdh": "15187977620",
        "dz": null,
        "gzjd": 0.0
      },
      {
        "uid": "qjfy_zhouhua",
        "xm": "曲靖分院-周化",
        "xb": "男",
        "zw": "作业人员",
        "lxdh": "15126965064",
        "dz": null,
        "gzjd": 0.0
      },
      {
        "uid": "xxzx_caojianbing",
        "xm": "信息中心-曹建兵",
        "xb": "男",
        "zw": "作业人员",
        "lxdh": "18183933442",
        "dz": null,
        "gzjd": 0.0
      },
      {
        "uid": "xxzx_lichunhua",
        "xm": "信息中心-李春花",
        "xb": "男",
        "zw": "作业人员",
        "lxdh": "13238675592",
        "dz": null,
        "gzjd": 0.0
      },
      {
        "uid": "xxzx_ligen",
        "xm": "信息中心-李根",
        "xb": "男",
        "zw": "作业人员",
        "lxdh": "13116211298",
        "dz": null,
        "gzjd": 0.0
      },
      {
        "uid": "xxzx_lijiao",
        "xm": "信息中心-李娇",
        "xb": "男",
        "zw": "作业人员",
        "lxdh": "15087141083",
        "dz": null,
        "gzjd": 0.0
      },
      {
        "uid": "xxzx_lijincheng",
        "xm": "信息中心-李金程",
        "xb": "男",
        "zw": "作业人员",
        "lxdh": "18487121383",
        "dz": null,
        "gzjd": 0.0
      },
      {
        "uid": "xxzx_songqingjing",
        "xm": "信息中心-宋清晶",
        "xb": "男",
        "zw": "作业人员",
        "lxdh": "18206838200",
        "dz": null,
        "gzjd": 0.0
      },
      {
        "uid": "xxzx_wanglimei",
        "xm": "信息中心-王丽梅",
        "xb": "男",
        "zw": "作业人员",
        "lxdh": "13759486708",
        "dz": null,
        "gzjd": 0.0
      },
      {
        "uid": "xxzx_xufengmei",
        "xm": "信息中心-徐凤梅",
        "xb": "男",
        "zw": "作业人员",
        "lxdh": "13529248806",
        "dz": null,
        "gzjd": 0.0
      },
      {
        "uid": "xxzx_xuhongtao",
        "xm": "信息中心-徐宏涛",
        "xb": "男",
        "zw": "作业人员",
        "lxdh": "15288381004",
        "dz": null,
        "gzjd": 0.0
      },
      {
        "uid": "xxzx_yangyingxue",
        "xm": "信息中心-杨应学",
        "xb": "男",
        "zw": "作业人员",
        "lxdh": "15969560323",
        "dz": null,
        "gzjd": 0.0
      },
      {
        "uid": "xxzx_zhangmengyuan",
        "xm": "信息中心-张梦圆",
        "xb": "男",
        "zw": "作业人员",
        "lxdh": "15087147490",
        "dz": null,
        "gzjd": 0.0
      },
      {
        "uid": "xxzx_zhangyuefu",
        "xm": "信息中心-张跃福",
        "xb": "男",
        "zw": "作业人员",
        "lxdh": "18487270327",
        "dz": null,
        "gzjd": 0.0
      },
      {
        "uid": "xxzx_lihongying",
        "xm": "信息中心_李红英",
        "xb": "男",
        "zw": "作业人员",
        "lxdh": "15687893079",
        "dz": null,
        "gzjd": 0.0
      }
    ],
    "pads": [
      {
        "sbid": "97de889a381643ebb65daf9102febe0c",
        "sbbh": "S/N:2KH6R18604000283",
        "sbmc": "M5 Pro（全网通）",
        "ryid": "3bba1c147d554e3bbeee654f0e110b5e",
        "ryxm": "曲靖分院-龚灿",
        "ryxb": null,
        "ryzw": null,
        "rylxdh": "15887458238",
        "rydz": null,
        "rytx": "http://10.10.50.50:8090/pdms/project/user/photo/3bba1c147d554e3bbeee654f0e110b5e",
        "locations": [
          {
            "xh": 1,
            "x": 103.89,
            "y": 25.37,
            "cjsj": "2019-04-02 14:48:36"
          }
        ]
      },
      {
        "sbid": "357b548b83bb4f7d9609fc70b821f30d",
        "sbbh": "S/N:CMRDU18330001554",
        "sbmc": "M5 Pro（全网通）",
        "ryid": "f48a33c687a040c3b32b8f25f319d211",
        "ryxm": "信息中心-杨应学",
        "ryxb": null,
        "ryzw": null,
        "rylxdh": "15969560323",
        "rydz": null,
        "rytx": "http://10.10.50.50:8090/pdms/project/user/photo/f48a33c687a040c3b32b8f25f319d211",
        "locations": [
          {
            "xh": 1,
            "x": 103.91,
            "y": 25.51,
            "cjsj": "2019-04-02 14:48:43"
          }
        ]
      },
      {
        "sbid": "c4f13d9c39264cf595f43bac214b5bbe",
        "sbbh": "S/N:CMRDU18330002002",
        "sbmc": "M5 Pro（全网通）",
        "ryid": "5371761f8e5543f0b8038627648a68ec",
        "ryxm": "信息中心-李根",
        "ryxb": null,
        "ryzw": null,
        "rylxdh": "13116211298",
        "rydz": null,
        "rytx": "http://10.10.50.50:8090/pdms/project/user/photo/5371761f8e5543f0b8038627648a68ec",
        "locations": []
      },
      {
        "sbid": "4afffd2cf3c14a13b38023ac6ddaf65f",
        "sbbh": "S/N:CMRDU18330002011",
        "sbmc": "M5 Pro（全网通）",
        "ryid": "63f8ea31876e4b1d957e276561de0a28",
        "ryxm": "曲靖分院-周化",
        "ryxb": null,
        "ryzw": null,
        "rylxdh": "15126965064",
        "rydz": null,
        "rytx": "http://10.10.50.50:8090/pdms/project/user/photo/63f8ea31876e4b1d957e276561de0a28",
        "locations": []
      }
    ]
  },
  "list": null
}`


    let obj=JSON.parse(json);
        parse(obj);
    });

});



function parse(response,head,status){

        if(response.t.users.length==0){
            return {list:[]};
        }

        let list=response.t.pads.map(p=>{
            return {
                id:p.ryid,
                name:p.ryxm,
                location:[ p.locations[0]?p.locations[0].x:0,p.locations[0]?p.locations[0].y:0],
                picture:p.rytx,
                position:p.ryzw,
                finished:p.gzjd?p.gzjd:0
            };
        });
        return {list:list};
}