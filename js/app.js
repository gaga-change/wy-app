/**
 * Created by qingyun2 on 16/11/1.
 */
var onUpdate = false;  //是否出发新闻的追加
var isUpdate = true; //是否完成数据的更新
var startUpdate = false; //是否启动更新
var cache = {};
var changeUpdateUpInfo; //改变下拉提示
var app = angular.module('wyApp', [
    'ngRoute',
    'wyApp.ptimeFilter',
    'ngAnimate',
    "ui.router"
])
    .controller('WyCtrl', ['$scope', function ($scope) {
        $scope.footerUrl = 'com/content-footer.html';
        $scope.size = {
            windowH: $(window).height(),
            windowW: $(window).width()
        };
        $(window).resize(function () {
            $scope.$apply(function () {
                $scope.size = {
                    windowH: $(window).height(),
                    windowW: $(window).width()
                };
            })
        });
        $scope.barList = [
            // {name : '头条'},
            {name: '精选', ename: 'jinxuan', url: 'T1467284926140'},
            // {name: '娱乐', url: ''},
            // {name: '娱乐'},
            {name: '体育', ename: 'tiyu', url: 'T1348649079062'},
            // {name: '网易号'},
            // {name: '视屏'},
            // {name: '财经'},
            // {name: '科技'},
            // {name: '汽车'},
            {name: '时尚', ename: 'shishang', url: 'T1348650593803'},
            // {name: '图片'},
            // {name: '直播'},
            // {name: '热点'},
            // {name: '跟贴'},
            // {name: '房产'},
            // {name: '股票'},
            {name: '轻松一刻', ename: 'qingsongyike', url: 'T1350383429665'},
            // {name: '段子'},
            // {name: '军事'},
            {name: '历史', ename: 'lishi', url: 'T1368497029546'},
            {name: '家居', ename: 'jiaju', url: 'T1348654105308'},
            {name: '独家', ename: 'dujia', url: 'T1370583240249'},
            // {name: '游戏'},
            // {name: '健康'},
            {name: '政务', ename: 'zhengwu', url: 'T1414142214384'},
            {name: '漫画', ename: 'manhua', url: 'T1444270454635'},
            {name: '达达趣闻', ename: 'dadaqvwen', url: 'T1444289532601'},
            {name: '彩票', ename: 'caipiao', url: 'T1356600029035'}
            // {name: '美女'},
        ]
    }])

    .controller('FooterCtrl', ['$scope', '$stateParams', '$interval', function ($scope, $stateParams, $interval) {
        /**
         * 点击菜单时,改变选中的样式
         *
         */
        var str = "";
        if ($stateParams['footerBar']) {
            str = $stateParams['footerBar'];
        }
        if (str == "")return;
        var interval = $interval(function () {
            if ($("[data-id = " + str + "]").length == 1) {
                $interval.cancel(interval);
                $("[data-id = " + str + "]").addClass('active')
            }
        }, 10);
        $scope.menuClick = addActive;
        function addActive(e) {
            var t = $(e.currentTarget);
            t.addClass('active');
            t.siblings().removeClass('active');
        }
    }])

    .controller('XinwenCtrl', ['$scope', function ($scope) {
        $scope.xinwenHeader = 'com/xinwen-header.html'
    }])

    .controller('XinwenHeaderCtrl', ['$scope', '$stateParams', '$interval', function ($scope, $stateParams, $interval) {
        /**
         * 点击菜单时,改变选中的样式
         *
         */
        var str = "";
        if ($stateParams['xinwenList']) {
            str = $stateParams['xinwenList'];
        }
        if (str == "")return;
        var interval = $interval(function () {
            if ($("[data-id = " + str + "]").length == 1) {
                $interval.cancel(interval);
                $("[data-id = " + str + "]").addClass('active')
            }
        }, 10);
        $scope.menuClick = addActive;
        function addActive(str) {
            var t = $("[data-id = " + str + "]");
            console.log(t);
            t.addClass('active');
            t.siblings().removeClass('active');
        }
    }])

    .controller('XinwenListCtrl', ['$interval', '$rootScope', '$stateParams', '$scope', '$state', function ($interval, $rootScope, $stateParams, $scope, $state) {
        if (!$stateParams['xinwenList'])return;
        /*
         * 1.监听,新闻的滚动,适当改变元素
         * */
        // var xinwen = $('[data-id = comXinwen]');
        // var h = $('[data-id = xinwen-header]');
        // xinwen.on('scroll', scroll)
        // var interval ;
        // interval = $interval(function () {
        //     // console.log('gaga')
        // },1000);
        // function scroll(e) {
        //     // console.log(xinwen.scrollTop());
        //     //划到一定长度,自动隐藏logo
        //     if(xinwen.scrollTop() > $(window).height()*0.075){
        //         h.addClass('hide-half');
        //     }else {
        //         h.removeClass('hide-half');
        //     }
        // }

        /*
         * 2.控制器撤销时,关闭一切的监听和定时器
         * */
        // $scope.$on('$destroy', function (evt, msg) {
        //     $interval.cancel(interval);
        //     xinwen.off('scroll')
        // });
        /*
         * 数据的请求
         * */
        var news = getIndex($scope.barList, {ename: $stateParams['xinwenList']});
        // console.log(news);

        $scope.news = news;
        $scope.data = [];
        getData('down'); //第一次自己更新
        //     //滚动条
        // var swiper = new Swiper('.swiper-container', {
        //     pagination: '.swiper-pagination',
        //     paginationClickable: true
        // });
        //更新当前数据  参数 为up上面  down 下面
        function getData(updataMeth) {
            /**
             * 1.得到当前的新闻类别
             * 2.得到当前新闻类别的缓存
             * 3.更新缓存 (下拉更新  和 上划加载)
             * 4.更新当前数据data
             */
            cache[news.ename] = cache[news.ename] || [];
            //追加
            if (updataMeth == 'down') {
                /**
                 * 根据条数获取响应的新闻
                 */
                // var s = parseInt((cache[news.ename].length) / 10) * 10;
                d(0, 20, function (list) {
                    cache[news.ename] = cache[news.ename].concat(list);
                    // console.log($scope.data)
                    $scope.$apply(function () {
                        $scope.data = cache[news.ename];
                    })
                })
            }
            function d(s, n, callBack) {
                var url = "http://c.3g.163.com/nc/article/list/" + news.url + "/" + s + "-" + n + ".html";
                $.post('http://localhost:8080/tools/jsonp', {url: url}, function (data) {
                    var d = data.data;
                    var list = JSON.parse(data.data)[news.url];
                    list.map(function (ele, index) {
                        var re = new RegExp(/^(http:\/\/)(.+)/, 'g')
                        var result = re.exec(ele.imgsrc);
                        // if(result[2] == null) return;
                        if (index == 0) {
                            ele.imgsrc = "http://s.cimg.163.com/pi/" + result[2] + '.1080x2147483647.75.auto.webp'
                            return;
                        } else if (ele['imgextra']) {
                            ele.imgsrc = "http://s.cimg.163.com/pi/" + result[2] + '.322x2147483647.75.auto.webp'
                            return;
                        } else {
                            ele.imgsrc = "http://s.cimg.163.com/pi/" + result[2] + '.270x2147483647.75.auto.webp';
                        }
                    });
                    callBack(list);
                });
            }
        }
    }])

    .controller('XinwenDetailCtrl', ['$scope', '$stateParams', '$sce', '$state', '$location', function ($scope, $stateParams, $sce, $state, $location) {
        $scope.goBack = function () {
            console.log($stateParams);
            var url = '/index/' + $stateParams.footerBar + $stateParams.xinwenList;
            $location.path(url);
        }
        console.log('detail', $stateParams);
        $scope.xinwenDetailData = [];
// http://c.m.163.com/nc/article/C51TJCSH000181BT/full.html
        var url = 'http://c.m.163.com/nc/article/' + $stateParams['docid'] + '/full.html';
        $.post('http://localhost:8080/tools/jsonp', {url: url}, function (data) {
            var d = data.data;
            d = JSON.parse(d)[$stateParams['docid']]
            var body = d['body'];
            var imgArr = d['img'];
            var replyCount = d['replyCount'];
            /**
             * 切除
             */
            var re = new RegExp(/(\<!--IMG#\d--\>)/, 'g')
            var i = 0;
            body = body.replace(re, function (a, b) {
                var r;
                imgArr.map(function (ele, index) {
                    if (ele.ref == a) {
                        r = ele.src;
                    }
                })
                r = "<img src=" + r + ">";
                // console.log(r);
                return r;
            })
            // d = d[$stateParams['docid']]
            // console.log(body);
            $scope.$apply(function () {
                $scope.xinwenDetailData = $sce.trustAsHtml(body);
            })
        })


    }])

    .controller('ZhiboCtrl', ['$scope', function ($scope) {
        $scope.zhiboHeader = 'com/zhibo-header.html'
    }])

    .controller('ZhiboHeaderCtrl', ['$scope', function ($scope) {
    }])

    .controller('ZhiboListCtrl', ['$scope', '$stateParams', function ($scope, $stateParams) {
        // http://data.live.126.net/livechannel/previewlist.json
        var zhiboArr = [
            {name: 'remen', url: 'previewlist', vname: 'live_review'}
        ];
        // console.log($stateParams);
        var zb = getIndex(zhiboArr, {name: $stateParams['zhiboList']});
        $scope.data = [];
        getZhiboData('down')
        /**
         * 获取数据
         */
        function getZhiboData(dir) {
            if (dir == 'down') {
                var url = 'http://data.live.126.net/livechannel/' + zb.url + '.json';
                $.post('http://localhost:8080/tools/jsonp', {url: url}, function (data) {
                    // console.log(zb)
                    // console.log(data.data);
                    var d = JSON.parse(data.data);
                    // console.log(d[zb.vname]);
                    var list = d[zb.vname];
                    list.map(function (ele, index) {
                        var re = new RegExp(/^(http:\/\/)(.+)/, 'g')
                        var result = re.exec(ele.image);
                        // if(result[2] == null) return;
                        ele.image = "http://s.cimg.163.com/pi/" + result[2] + '.1080x2147483647.75.auto.webp'
                    });
                    console.log(list)
                    $scope.$apply(function () {
                        $scope.data = list;
                    })
                })
            }
        }


    }])

    .controller('HuatiCtrl', ['$scope', function ($scope) {
        $scope.huatiHeader = 'com/huati-header.html'
    }])

    .controller('HuatiListCtrl', ['$scope', '$stateParams', function ($scope, $stateParams) {
        // http://c.3g.163.com/newstopic/list/expert/5bmz6aG25bGx/10-10.html
        var zhiboArr = [
            {name: 'wenba', url: '5bmz6aG25bGx', vname: 'expertList'}
        ];
        // console.log($stateParams);
        var zb = getIndex(zhiboArr, {name: $stateParams['huatiList']});
        $scope.data = [];
        getZhiboData('down')
        /**
         * 获取数据
         */
        function getZhiboData(dir) {
            if (dir == 'down') {
                var url = 'http://c.3g.163.com/newstopic/list/expert/' + zb.url + '/0-10.html';
                $.post('http://localhost:8080/tools/jsonp', {url: url}, function (data) {
                    // console.log(data.data);
                    var d = JSON.parse(data.data);
                    var list = d.data[zb.vname];
                    console.log(list);
                    // list.map(function (ele, index) {
                    //     var re = new RegExp(/^(http:\/\/)(.+)/, 'g')
                    //     var result = re.exec(ele.image);
                    //     // if(result[2] == null) return;
                    //     ele.image = "http://s.cimg.163.com/pi/" + result[2] + '.1080x2147483647.75.auto.webp'
                    // });
                    $scope.$apply(function () {
                        $scope.data = list;
                    })
                })
            }
        }
    }])

    .controller('HuatiHeaderCtrl', ['$scope', '$stateParams', function ($scope, $stateParams) {

    }])

    .controller('WoCtrl', ['$scope', function ($scope) {
    }])
// .controller('ContentCtrl', ['$scope', '$location', function ($scope, $location) {
//     //判断当前的状态,给相应的初始值
//     var dataId = $location.url().split('/')[2];
//     $('[data-id = ' + dataId + ']').addClass('active');
//     $scope.footerBar = function (e) {
//         var t = $(e.currentTarget);
//         t.addClass('active');
//         t.siblings().removeClass('active');
//     }
// }])
// .controller('XinwenCtrl', ['$scope', function ($scope) {
//     $scope.xinwenDetailUrl = 'com/xinwen-detail.html';
//     $scope.detailShow = false;
//     /**
//      * 设置下拉按钮
//      *  点击,下拉菜单全屏
//      *      给按钮下点击事件
//      *  点击选项自动回收
//      *      给全屏div加点击事件
//      */
//     var isSlide = false;
//     $scope.slideDown = function () {
//         if (isSlide) {
//             $('[data-id = slideMenu]').removeClass('bounceInDown');
//             $('[data-id = slideMenu]').addClass('bounceOutRight');
//
//         } else {
//             $('[data-id = slideMenu]').addClass('bounceInDown');
//             $('[data-id = slideMenu]').removeClass('bounceOutRight');
//         }
//         isSlide = !isSlide;
//     };
//     $scope.slideUp = function () {
//         // $('[data-id = bounceInDown]').addClass('bounceInDown');
//     }
//     /**
//      * 设置点击显示新闻详情
//      */
//     $scope.showDetail = function (e,b) {
//         if(b){
//             $scope.detailShow = false;
//             return
//         }
//         console.log(e)
//         console.log('fd')
//         $scope.detailShow = true;
//         $(window).on('hashchange', function(e) {
//             e.preventDefault();
//             console.log('hashchange');
//         });
//     }
// }])
// .controller('XinwenDetailCtrl', ['$scope', function ($scope) {
//     console.log('xinwendetailCtrl');
//     $scope.test = 'test';
// }])
// .controller('ZhiboCtrl', ['$scope', function ($scope) {
// }])


// .controller('newListCtrl', ['$scope', '$routeParams', '$rootScope', '$interval', function ($scope, $routeParams, $rootScope, $interval) {
//     onUpdate = false;
//     isUpdate = true;
//     startUpdate = false;
//
//     $scope.data = [];
//
//     //添加监听事件
//     var len;
//     $interval(function () {
//         /**
//          * 引擎没有启动
//          *  startUpdate == false
//          *    如果 item的条数大于6
//          *     运行引擎 startUpdate =true
//          */
//         if (!startUpdate) {
//             if ($('.item').length > 6) {
//                 scrollListen();
//                 startUpdate = true;
//             }
//             return;
//         }
//         /**
//          *  追加新闻
//          *  1. onUpdate == false 没有出现在视口内
//          *      不干嘛
//          *  2. onUpdate == true  出现在视口内
//          *      判断数据是否已经是追加完成,即长度改变  isUpdate
//          *      isUpdate == false  没有追加完成
//          *          不干嘛
//          *      isUpdate == true  追加完成
//          *          更新数据
//          *          isUpdate =false
//          *
//          */
//         if (onUpdate && isUpdate) {
//             getData('down')
//             isUpdate = false;
//             /**
//              * 获取当前新闻的条数
//              */
//             len = $('.item').length;
//         }
//         /**
//          * 判定长度变化
//          *  如果 isUpdate == false
//          *     如果 条数改变
//          *       isUpdate == true;
//          *       onUpdate == false;
//          */
//         if ((!isUpdate) && (len != $('.item').length)) {
//             isUpdate = true;
//             onUpdate = false;
//         }
//
//     }, 10)

//

//     $scope.updateUpInfo = 1;
//     changeUpdateUpInfo = function (s) {
//         $scope.updateUpInfo = s;
//     }
//
//
// }])

// .controller('docidCtrl', ['$scope', '$routeParams', function ($scope, $routeParams) {
//     $scope.content = "hello world";
//     $.post('http://localhost:8080/tools/jsonp', {url: "http://c.3g.163.com/nc/article/" + $routeParams.docid + "/full.html"}, function (data) {
//         var d = data.data;
//         console.log(d);
//         $scope.$apply(function () {
//             $scope.content = d;
//             console.log()
//         })
//     })
// }])

//滚动监听
var scrollListen = function () {
    hideHeadTop();
    updateDown();

    $('[data-id = wyContainer]').scroll(hideHeadTop);
    $('[data-id = wyContainer]').scroll(updateDown);


    /**
     * 分析
     *  触摸点击后
     *      当前为初始点
     *          正常下拉移动改变样式
     *      当前不是初始点
     *          要等到为初始点
     *   解决
     *      触摸先获取con的scrollTop()的值,和初始触摸点
     *          移动时计算差值  还要减去scrollTop()的值
     *
     *
     * @type {any}
     */
    var con = $('[data-id = wyContainer]');
    var _y = 0;
    var _s = 0
    con.on('touchstart', function (e) {
        $('[data-id = updateUp]').removeClass('goback')
        // console.log("??? touchstart");
        _y = event.targetTouches[0].pageY;
        _s = con.scrollTop();
        con.on('touchmove', touchmove);
        con.on('touchend', touchend)
    });
    /**
     * 触摸移动
     * @param event
     */
    function touchmove(event) {
        var d = event.targetTouches[0].pageY - _y - _s;
        if (d < 1) d = 0;
        if (d > $(window).height() * 0.075) {
            changeUpdateUpInfo(2)
        } else {
            changeUpdateUpInfo(1)
        }

        // console.log(d);
        $('[data-id = updateUp]').css({
            height: d + 'px'
        })
    };
    /**
     * 触摸结束
     */
    function touchend(event) {
        // console.log('???  end')
        $('[data-id = updateUp]').addClass('goback')
        $('[data-id = updateUp]').css({
            height: 0
        })
        changeUpdateUpInfo(1);
        con.off('touchmove', touchmove);
        con.off('touchend', touchend);
    }

    /**
     * 自动隐藏头部图标
     */
    function hideHeadTop() {
        /**
         * 判断当前document.scrollTop
         */
        if ($('[data-id = wyContainer]').scrollTop() > $(window).height() * 0.075) {
            $('[data-id = header]').addClass('h-half');
            $('[data-id = headerTop]').addClass('h-0');
        } else {
            $('[data-id = header]').removeClass('h-half');
            $('[data-id = headerTop]').removeClass('h-0');
        }
    }

    /**
     * 上拉刷新
     */
    function updateDown() {
        //如果正在更新中 则停止监听
        if (onUpdate)return;
        /**
         * 得到刷新动画相对父窗口底部的偏移
         */
        var offsize = $('[data-id = updateDown]').offset().top - $(window).height();
        // console.log(offsize);
        if (offsize < 0) {
            console.log('get data');
            onUpdate = true;
        }
    }
};

/**
 * 根据参数获取具体的 一个 对象
 * @param arr   目标数组
 * @param obj   过滤的条件
 * @returns {*}  得到的一个 数组中的元素
 */
function getIndex(arr, obj) {
    if (arr.length < 1)return {};
    if (obj.length < 1)return {};
    var re;
    for (var i = 0; i < arr.length; i++) {
        for (var j in obj) {
            if (obj[j] == arr[i][j])return arr[i];
        }
    }
    return {};
}