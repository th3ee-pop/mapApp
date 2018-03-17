let map = {};
let markers = [];
const keyWords = [
    '披萨', '巧克力', '烤肉', '火锅', '自助餐'
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


function viewModel() {


    const url = 'http://restapi.amap.com/v3/place/around?';
    const self = this;

    self.searchKey = ko.observable('钟楼附近美食');
    self.startArray = ko.observableArray();
    self.startKey = '肯德基';
    self.count = ko.observable(0);
    self.center = [108.947001,34.259458];
    self.city = 610100000000;
    const infoWindow = new AMap.InfoWindow();

    self.increment = function () {
        self.count(self.count() + 1);
    };

    self.showWindow = function(e) {
        console.log(e);
        infoWindow.setContent(e.target.content);
        infoWindow.open(map, e.target.getPosition());
    };

    self.gererateMarker = function () {
        map.setZoomAndCenter(18, bellTower);
        console.log(self.startArray());
        self.startArray().forEach(d => {
            const newMarker = new AMap.Marker({
                map: map,
                position: d.location.split(','),
                title: d.name,
                id: d.id
            });

            newMarker.content = '这里是' + d.name;
            newMarker.on('click', self.showWindow);
            newMarker.setAnimation('AMAP_ANIMATION_DROP');
            markers.push(newMarker);

        });
    };

    self.hideMarker = function (data) {
        map.setZoomAndCenter(18, data.location.split(','));
    };

    self.clearMarker = function () {
        markers.forEach(marker => {
            marker.setMap(null);
        })
    };

    self.searchCate = function (data) {
        console.log(data);
       // self.searchKey = data;
        self.searchKey(data);
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
            }
        });
    };

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


}

ko.applyBindings(new viewModel());
