const Service=require('egg').Service;

class OrganizationService extends Service{

    //批量生成政府机构
    async createGovOrg(){
        let provinceOrg=['云南省自然资源厅','云南省住房城乡建设厅','云南省农业农村厅','云南省生态环境厅','云南省交通运输厅','云南省水利厅'];
        let cityOrg=['国土资源局','规划局','住房城乡建设局','农业局','林业局','环境保护局','交通运输局','水务局'];
        let countyOrg=['国土资源局','规划局','住房城乡建设局','农业局','林业局','环境保护局','交通运输局','水务局'];

        //省级单位
        const topId=3;
        let sql=`insert into t_organization (parent_id,name,areaCode) values(?,?,?)`;
        let citys =await this.app.mysql.query(`select * from t_gov_area where pid=1`);
        //let countys= await this.app.mysql.query(`select * from t_gov_area where pid in (?)`,[citys.map(_=>_.id)]);
        provinceOrg.forEach(async name=>{
            await this.app.mysql.query(sql,[topId,name,53]);
        });
        citys.forEach(async city=>{
            await this.app.mysql.query(sql,[topId,`${city.name}政府`,city.areaCode]);
        });

        //市级单位
        let orgCitys=await this.app.mysql.query(`select * from t_organization where parent_id=3`);

        for(let i=0;i<orgCitys.length;i++){
            let ocity=orgCitys[i];
            if(provinceOrg.indexOf(ocity.name)!=-1) continue;

            let cityAreaCode=ocity.areaCode;
            let city=citys.find(_=>_.areaCode==cityAreaCode);
            //insert 市级单位
            cityOrg.forEach(async (name)=>{
                await this.app.mysql.query(sql,[ocity.id,`${city.name}${name}`,cityAreaCode]);
            });
            // query区县
            let countys= await this.app.mysql.query(`select * from t_gov_area where pid=?`,[city.id]);
            //insert xx县(区)政府
            countys.forEach(async county=>{
                await this.app.mysql.query(sql,[ocity.id,`${county.name}政府`,county.areaCode]);
            });

            let orgCountys=await this.app.mysql.query(`select * from t_organization where parent_id=?`,[ocity.id]);
            for(let j=0;j<orgCountys.length;j++){
                let orgCounty=orgCountys[j];
                if(cityOrg.map(_=>`${city.name}${_}`).indexOf(orgCounty.name)!=-1) continue;
                let countyAreaCode=orgCounty.areaCode;
                let county=countys.find(_=>_.areaCode==countyAreaCode);
                //insert 县级单位
                countyOrg.forEach(async name=>{
                    await this.app.mysql.query(sql,[orgCounty.id,`${county.name}${name}`,countyAreaCode]);
                });
            }

        }

    }

    async delete(){
        //id,idField,pidField,tableName
        let ids=await this.service.entity.childList(3,'id','parent_id','t_organization');
        //console.log(ids.filter(_=>_!=3));
        await this.app.mysql.query(`delete from t_organization where id in(?)`,[ids.filter(_=>_!=3)]);
    }

}


module.exports = OrganizationService;