const Controller =require('egg').Controller;
const fs = require('fs');
const path = require('path');

class ScreenController extends Controller{



    async map() {
        await this.ctx.render('/map.html');
    }

    async picture(){
        const files=fs.readdirSync('./app/public/pic');
        this.ctx.body={
            success:true,
            list:
                files.map(f=>[
                    //`http://127.0.0.1:7001/public/pic/${encodeURI(f)}`,
                    `http://10.10.50.10:7001/public/pic/${encodeURI(f)}`,
                    f.replace(/^(\S+)\.(\S+)\.png$/,(w,p1)=>p1),
                    'http://10.10.50.18:8090/iserver/manager/services/'+f.replace(/^(\S+)\.(\S+)\.png$/,(w,p1,p2)=>p2)
                ])

        };
    }

    // 地图geoJSON请求接口（第二屏）
    async  map_llx(){
        let outer = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../mock/mapLLXOuter.json'), 'utf8'));
        let inner = fs.readFileSync(path.resolve(__dirname, '../mock/mapLLX.json'), 'utf8');
        const workers = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../mock/workersLLX.json'), 'utf8')).list;
        inner = JSON.parse(inner.replace(/"NAME"/g, '"name"'));
        // 处理名称定位
        formatterGeoJson(inner);
        formatterGeoJson(outer);
        this.ctx.body={
            success: true,
            outer: outer,
            inner: inner
        }
    }

    //// 经济概况接口（第三屏）
    async business_info(){
        const GDPInfo = JSON.parse(fs.readFileSync('app/mock/GDPData.json', 'utf8'));
        const economyInfo = JSON.parse(fs.readFileSync('app/mock/economyData.json', 'utf8'));
        const finaceInfo = JSON.parse(fs.readFileSync('app/mock/finaceData.json', 'utf8'));
        this.ctx.body={
            success: true,
            data: {
                GDP: GDPInfo,
                economy: economyInfo,
                finace: finaceInfo
            }
        };
    }

    // 城市建设概况接口（第三屏）
    async city_info(){
        const populationInfo1 = JSON.parse(fs.readFileSync('app/mock/populationData1.json', 'utf8'));
        const populationInfo2 = JSON.parse(fs.readFileSync('app/mock/populationData2.json', 'utf8'));
        const groundInfo = JSON.parse(fs.readFileSync('app/mock/groundData.json', 'utf8'));
        const cityConsInfo = JSON.parse(fs.readFileSync('app/mock/cityConsData.json', 'utf8'));
        const baseFaciInfo = JSON.parse(fs.readFileSync('app/mock/baseFaciData.json', 'utf8'));
        this.ctx.body={
            success: true,
            data: {
                population1: populationInfo1,
                population2: populationInfo2,
                ground: groundInfo,
                cityCons: cityConsInfo,
                baseFacility: baseFaciInfo,
            }
        };
    }

    //接口分类统计
    async servicesStatistic(){
        let top=await this.app.mysql.query(`select * from t_service_tree where pid=1`);
        let obj={};
        for(let i=0;i<top.length;i++){
            let t=top[i];
            let ids=await this.service.saveOrDelete.childList(t.id,'id','pid','t_service_tree');
            let [{total}]=await this.app.mysql.query(`select count(1) total from t_sys_operation where type=3 and service_tree_id in(?)`,[ids] );
            obj[t.name]=total;
        }
        this.ctx.body=obj;
    }


}

// geoJSON前置处理
const formatterGeoJson = (geoJson) => {
    const areaNum = geoJson.features.length;
    let i = 0;
    while (i < areaNum) {
        if (geoJson.features[i].type === 'Feature' && geoJson.features[i].geometry.type === 'Polygon') {
            let longitudeLeft = 0;
            let longitudeRight = 0;
            let latitudeTop = 0;
            let latitudeBottom = 0;
            geoJson.features[i].geometry.coordinates[0].forEach((point, index) => {
                if (index === 0) {
                    longitudeLeft = longitudeRight = point[0];
                    latitudeTop = latitudeBottom = point[1];
                }
                longitudeLeft = point[0] < longitudeLeft ? point[0] : longitudeLeft;
                longitudeRight = point[0] > longitudeRight ? point[0] : longitudeRight;
                latitudeTop = point[1] > latitudeTop ? point[1] : latitudeTop;
                latitudeBottom = point[1] < latitudeBottom ? point[1] : latitudeBottom;
            });
            if (!geoJson.features[i].properties.cp) {
                geoJson.features[i].properties.boundingCoords = [
                    [longitudeLeft, latitudeTop],// 左上角
                    [longitudeRight, latitudeBottom]// 右下角
                ];
                geoJson.features[i].properties.cp = [
                    (longitudeRight - longitudeLeft) / 2 + longitudeLeft,
                    (latitudeTop - latitudeBottom) / 2 + latitudeBottom
                ]
            }
        }
        i++
    }
    return geoJson
};


module.exports = ScreenController;