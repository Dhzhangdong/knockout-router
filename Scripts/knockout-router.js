/**
 * dhzhang create 2020 12 05
 * konckout作为spa应用开发框架，因为没有路由模块而备受局限，因此开发本js模块临时解决小型使用konckout作为框架的受限问题。
 * 本模块基于konckout 3.4开发，但是并未使用太多特性
 * 模板解析使用了jquery.tmpl.js （个人开发中也可以使用koncout默认模板解析引擎）
 * 
 * 本模块使用到一下特殊的浏览器对象
 * history.pushState
 */


var App=new function(){
    var _salf=this;
    var deftmpid="def";
    this.State={
        currentPage:ko.observable(null),//当前页面
        title:ko.observable("默认页"),//页面title
        tmpid:ko.observable("def"),
        tmpdata:ko.observable({}),
    };
    this.pages=[];//页面列表
    //添加页面
    this.addPage=function(page){
        this.pages.push(page);
    }
    //打开页面
    this.open=function(path,param){
        //find page by path
        var page=_salf.treeEachPage(function(page){ return page.path==path;});
        if(!page){
            return ;
        }

        //释放当前页面
        if (_salf.State.currentPage()!=null) {
            var oldpage = this.pagemap[this.lastpage()];
            oldpage.dispose();
        }
        this.lastpage(pagename);
        
        _salf.State.tmpid=deftmpid;
        _salf.State.tmpdata=page.state;
        _salf.State.tmpid=page.tmpid;
        page.create();//进入页面
        if (history.state==null || path != history.state.path) {
            window.history.pushState({ path, param }, "title", "#" + path);
        }
    }
    this.pageToOrBack = function () {
        var obj= history.state;
        if (obj.pagename) {
            _salf.open(obj.pagename, obj.param);
        }
    }
    //初始化
    this.init=function(){
        //popstate监听
        window.addEventListener("popstate", function (e) {
            _salf.pageToOrBack();
        }, false);
        //page初始化
        _salf.treeEachPage(function(page){
            if(page && page.init){
                page.init(page);
            }
        });
    };
    //递归遍历page对象
    this.treeEachPage=function(func){
        var treeeach=function(pages){
            if(pages){
                for(var i=0;i<pages.length;i++){
                    var p=pages[i];
                    var tmp=func(p);
                    if(tmp){
                        return p;
                    }else if(p.child){
                       var tmp2= treeeach(p.child);
                       if(tmp2){
                           return tmp2;
                       }
                    }
                }
            }
        };
        return treeeach(_salf.pages);
    }
}();

function Page(setting){
    var _salf=this;
    if(!setting) setting={};
    this.title=setting.title??"默认页";//页面名称
    this.tmpid=setting.tmpid??"default";//模板
    this.path=setting.path??"index";//路由地址
    this.state=setting.state??{};//页面状态,
    this.init=setting.init??function(){};//初始化函数
    this.create=setting.create??function(param){};//页面创建函数（每次路由进入调用）
    this.dispose=setting.dispose??function(){};//页面销毁函数（每次路由离开调用）
    this.child=setting.child??[];//子路由
}