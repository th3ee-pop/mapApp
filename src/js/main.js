let map = {};
let markers = [];
const keyWords = [
    '披萨', '巧克力', '烤肉', '火锅', '自助餐', '全部'
];
const bellTower = [108.947001,34.259458];


window.init = function () {
    map = new AMap.Map('ali_map', {
        center: bellTower,
        zoom: 18
    });
    map.plugin(["AMap.ToolBar"], function () {
        map.addControl(new AMap.ToolBar());
    });

    map.setFitView();
    ko.applyBindings(new viewModel());


};

/*地图初始化*/

function viewModel() {


    const url = 'http://restapi.amap.com/v3/place/around?';
    const self = this;


    self.searchKey = ko.observable('钟楼附近美食');
    self.displayKey = ko.observable('钟楼附近美食');
    self.startArray = ko.observableArray();
    self.startKey = '肯德基';
    self.sideBar = ko.observable(true);
    self.hidden = ko.observable('隐藏');

    const infoWindow = new AMap.InfoWindow();

    self.hideSideBar = function () {
        self.sideBar(!self.sideBar());
        console.log(self.sideBar);
        self.hidden ( self.sideBar() ? '隐藏' : '展开' );
        console.log(self.sideBar);
    };

    self.getCarInfo = function (marker, ll) {
        $.ajax({
            url: 'http://api.map.baidu.com/parking/search?',
            type: 'GET',
            data: {
                location: ll,
                coordtype: 'bd09ll',
                ak: 'HxYe8PWRdQNFNoXr3Of8UqaMTd0oq39r'
            },
            dataType: 'jsonp',
            success: function (data) {
                console.log(data);
                if(data.recommendStops.length > 0){
                    data.recommendStops.forEach(d => {
                        marker.target.content.push(d.name);
                    });
                } else {
                    marker.target.content.push('暂无');
                }

                console.log(marker.target.content);
                infoWindow.setContent(marker.target.content.join('<br>'));
                infoWindow.open(map, marker.target.getPosition());

                return data;
            },
            error: function (data) {
                console.log(data);
                return {status: 'error'}
            }
        })
    };
    /*通过第三方api百度map，获取上车信息*/

    self.showWindow = function(e) {
        console.log(e);
        const ll = e.lnglat.lng + ','+ e.lnglat.lat;
        console.log(ll);
        self.getCarInfo(e, ll);
    };
    /*用于展示商户的信息*/

    self.gererateMarker = function () {
        map.setZoomAndCenter(18, bellTower);
        self.startArray().forEach(d => {
            const newMarker = new AMap.Marker({
                map: map,
                position: d.location.split(','),
                title: d.name,
            });
            newMarker.content = ['名称:'+ d.name, '地址:' + d.address, '电话:' + d.tel, '上车地点推荐：'];
            newMarker.on('click', self.showWindow);
            newMarker.setAnimation('AMAP_ANIMATION_DROP');
            markers.push(newMarker);
        });
    };
    /*为当前api返回的所有商户生成marker*/

    self.hideMarker = function (data, index) {
        infoWindow.close();
        if (markers.length > 0) {
            for (let i = 0; i < markers.length; i++) {
                if (i === index())
                {
                    markers[i].show();
                    markers[i].setAnimation('AMAP_ANIMATION_DROP');
                }  else {
                    markers[i].hide();
                }
            }
        }
        map.setZoomAndCenter(18, data.location.split(','));
    };
    /*仅显示选中的marker，并高亮显示对应地点*/

    self.clearMarker = function () {
        markers.forEach(marker => {
            marker.hide();
        })
    };
    /*清楚当前所有marker*/

    self.searchCate = function (data) {
        console.log(data);
       // self.searchKey = data;
        if(data === '全部') {
            self.searchKey('披萨|巧克力|烤肉|火锅|自助餐');
            self.displayKey('钟楼附近美食');
        } else {
            self.searchKey(data);
            self.displayKey(data);
        }
        $.ajax({
            url: url,
            type: 'GET',
            data: {
                city: '西安',
                location: '108.947001,34.259458',
                keywords: self.searchKey,
                radius: 1000,
                offset: 14,
                page: 1,
                key: 'af3a1d108b7dd1c40752478c0e67f378',
                output: 'json',
                types: '050000'
            },
            async: false,
            dataType: 'jsonp',
            success: function (data) {
                console.log(data);
                console.log(self.startArray());
                self.startArray().splice(0, self.startArray().length);
                self.clearMarker();
                markers.splice(0, markers.length);
                console.log(self.startArray());
                data.pois.forEach(d => {
                    self.startArray.push(d);
                });
                self.gererateMarker();
                console.log(markers);
            },
            error: function (data) {
                console.log(data);
                window.alert(data.message);
            }
        });
    };
    /*根据指定类别，访问api，获得相关的美食商户*/

    $.ajax({
        url: url,
        type: 'GET',
        data: {
           city: '西安',
           location: '108.947001,34.259458',
           keywords: '披萨|巧克力|烤肉|火锅|自助餐',
           radius: 3000,
           offset: 14,
           page: 1,
           key: 'af3a1d108b7dd1c40752478c0e67f378',
           output: 'json',
           types: '050000'
        },
        async: false,
        dataType: 'jsonp',
        success: function (data) {
            console.log(data);
            data.pois.forEach(d => {
                self.startArray.push(d);
            });
            self.gererateMarker();
            console.log(markers);
        },
        error: function (data) {
            console.log(data);
        }
    });
    /*默认加载各种分类的美食地点*/
}


