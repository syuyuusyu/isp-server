const Controller =require('egg').Controller;

class MetadataController extends Controller{

    async queryMetadata(){
        const {systemId,metadataType,databaseType,proType} =this.ctx.request.body;
        let c_systemId=systemId?` and system_id=${systemId} `:'';
        let c_metadataType=metadataType?` and type='${metadataType}' `:'';
        let c_databaseType=databaseType?` and database_type='${databaseType}' `:'';
        let c_proType=proType?` and pro_type='${proType}'`:'';
        let sql=`select * from t_metadata
            where stateflag=1${c_systemId}${c_metadataType}${c_databaseType}${c_proType}`;
        let result=await this.app.mysql.query(sql);
        this.ctx.body=result;
    }

    async metadataFields(){
        let result=await this.app.mysql.query(`select * from t_metadata_fields where metadata_id=? and stateflag=1`,[this.ctx.params.metadataId]);
        this.ctx.body=result;
    }
}

module.exports=MetadataController;