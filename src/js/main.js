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
};
/*地图初始化*/

function viewModel() {


    const url = 'http://restapi.amap.com/v3/place/around?';
    const self = this;

    self.searchKey = ko.observable('钟楼附近美食');
    self.displayKey = ko.observable('钟楼附近美食');
    self.startArray = ko.observableArray();
    self.startKey = '肯德基';

    const infoWindow = new AMap.InfoWindow();


    self.showWindow = function(e) {
        console.log(e);
        infoWindow.setContent(e.target.content.join('<br>'));
        infoWindow.open(map, e.target.getPosition());
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
            newMarker.content = ['名称:'+ d.name, '地址:' + d.address, '电话:' + d.tel];
            newMarker.on('click', self.showWindow);
            newMarker.setAnimation('AMAP_ANIMATION_DROP');
            markers.push(newMarker);
        });
    };
    /*为当前api返回的所有商户生成marker*/

    self.hideMarker = function (data, index) {
       // console.log(index());
        if (markers.length > 0) {
            for (let i = 0; i < markers.length; i++) {
                if (i === index())
                {
                    markers[i].setMap(map);
                    markers[i].setAnimation('AMAP_ANIMATION_DROP');
                }  else {
                    markers[i].setMap(null);
                }
            }
        }
        map.setZoomAndCenter(18, data.location.split(','));
    };
    /*仅显示选中的marker，并高亮显示对应地点*/

    self.clearMarker = function () {
        markers.forEach(marker => {
            marker.setMap(null);
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

ko.applyBindings(new viewModel());
