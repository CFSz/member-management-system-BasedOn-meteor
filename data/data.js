Workmate = new Mongo.Collection("workmate");

if (Meteor.isClient) {
    /**
     * 处理表单提交事件
     * @param e 事件对象
     * @param collection 数据对象
     * @param act 操作
     * @param options 配置
     */
    function submitHandle(e,collection,act,options){
        e.preventDefault();
        var $form=$(e.currentTarget);
        var postData =serializeForm($form,options.defaultData);
        saveToDb(act,collection,postData,options);

        /**
         * 序列化表单内容,并添加默认值
         * @param $form 表单元素
         * @param defaultData 默认值
         * @returns {{}} 合并后的信息
         */
        function serializeForm($form,defaultData) {
            var resultData = {};
            var defaultData = defaultData||{};
            var formData = $form.serializeArray();
            $(formData).each(function (index, item) {
                resultData[item.name] = item.value;
            });
            $.extend(resultData, defaultData);
            return resultData;
        }
    }

    /**
     * 保存到数据库
     * @param act 操作方式
     * @param collection 数据表
     * @param postData 数据
     * @param options 其他设置
     */
    function saveToDb(act,collection,postData,options){
        var options=options||{};
        switch (act){
            case 'insert':
                collection.insert(postData, function (error,id) {
                    dbCallback(options.errorHandle,error,options.successHandle,id);
                });
                break;

            case 'update':
                var curid=options.curid;
                if(!curid){
                    throw '更新数据时id不能为空';
                }
                collection.update(curid, {$set: postData}, function (error) {
                    dbCallback(options.errorHandle,error,options.successHandle,curid);
                });
                break;

            case 'remove':
                var curid=options.curid;
                if(!curid){
                    throw '删除数据时id不能为空';
                }
                collection.remove(curid, function (error) {
                    dbCallback(options.errorHandle,error,options.successHandle,curid);
                });
                break;
        }

        /**
         * 数据库交互完成的回调函数
         * @param errorHandle 错误处理
         * @param error 错误信息
         * @param successHandle 成功处理
         * @param id 数据id
         */
        function dbCallback(errorHandle,error,successHandle,id){
            if (error) {
                errorHandle&&errorHandle(error);
            } else {
                successHandle&&successHandle(id);
            }
        }
    }

    /* 列表页数据 */
    Template.list.helpers({
        people: function () {
            return Workmate.find().fetch();
        }
    });

    /* 详情页数据数据 */
    Template.detail.helpers({

    });

    /* 录入页面表单提交事件 */
    Template.input.events({
        'submit form': function (e) {
            //var template=this;
            submitHandle(e,Workmate,'insert',{
                defaultData:{
                    createdAt:new Date(),
                    createdBy:Meteor.user().emails[0].address
                },
                successHandle:function(id){
                    Router.go('detail', {_id: id});
                },
                errorHandle:function(e){
                    alert(e);
                }
            });
        }
    });

    /* 编辑页面表单提交事件 */
    Template.edit.events({
        'submit form': function (e) {
            var template=this;
            var curid=template._id;
            submitHandle(e,Workmate,'update',{
                curid:curid,
                defaultData:{
                    createdAt:new Date(),
                    createdBy:Meteor.user().emails[0].address
                },
                successHandle:function(){
                    Router.go('detail', {_id: curid});
                },
                errorHandle:function(e){
                    alert(e);
                }
            });
        }
    });

    /* 列表页删除按钮点击事件 */
    Template.list.events({
        'click .del-btn': function (e) {
            var $target=$(e.currentTarget);
            var curid=$target.data().id;
            saveToDb('remove',Workmate,{},{
                curid:curid,
                successHandle:function(){
                    console.log('删除成功');
                },
                errorHandle:function(e){
                    alert(e);
                }
            });
        }
    });

}


