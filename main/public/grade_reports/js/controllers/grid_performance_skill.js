/**
 * 各班知识情况数据表 - 知识平均得分率
 */
app.controller('SkillPerformanceGridDemoCtrl1', ['$scope', '$http', function($scope, $http) {
    $scope.filterOptions = {
        filterText: "",
        useExternalFilter: true
    }; 
    $scope.totalServerItems = 0;
    $scope.pagingOptions = {
        pageSizes: [250, 500, 1000],
        pageSize: 250,
        currentPage: 1
    };
    $scope.setPagingData = function(data, page, pageSize){  
        var pagedData = data.slice((page - 1) * pageSize, page * pageSize);
        $scope.myData = pagedData;
        $scope.totalServerItems = data.length;
        if (!$scope.$$phase) {
            $scope.$apply();
        }
    };
    $scope.getPagedDataAsync = function (pageSize, page, searchText) {
        setTimeout(function () {
            var data;
            if (searchText) {
                var ft = searchText.toLowerCase();
                $http.get('js/controllers/grid_performance/performance_data_skill1.json').success(function (largeLoad) {
                    data = largeLoad.filter(function(item) {
                        return JSON.stringify(item).toLowerCase().indexOf(ft) != -1;
                    });
                    $scope.setPagingData(data,page,pageSize);
                });            
            } else {
                $http.get('js/controllers/grid_performance/performance_data_skill1.json').success(function (largeLoad) {
                    $scope.setPagingData(largeLoad,page,pageSize);
                });
            }
        }, 100);
    };

    $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);

    $scope.$watch('pagingOptions', function (newVal, oldVal) {
        if (newVal !== oldVal && newVal.currentPage !== oldVal.currentPage) {
          $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.filterOptions.filterText);
        }
    }, true);
    $scope.$watch('filterOptions', function (newVal, oldVal) {
        if (newVal !== oldVal) {
          $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.filterOptions.filterText);
        }
    }, true);

    $scope.gridOptions = {
        data: 'myData',
        enablePaging: false,
        showFooter: false,
        totalServerItems: 'totalServerItems',
        pagingOptions: $scope.pagingOptions,
        filterOptions: $scope.filterOptions,
        enableSorting:false,
        enableCellSelection: false,
        enableRowSelection: false,
        enableCellEditOnFocus: false,
        headerRowHeight:48,
    };
}]);

/**
 * 各班知识情况数据表 - 知识中位数得分率
 */
app.controller('SkillPerformanceGridDemoCtrl2', ['$scope', '$http', function($scope, $http) {
    $scope.filterOptions = {
        filterText: "",
        useExternalFilter: true
    }; 
    $scope.totalServerItems = 0;
    $scope.pagingOptions = {
        pageSizes: [250, 500, 1000],
        pageSize: 250,
        currentPage: 1
    };  
    $scope.setPagingData = function(data, page, pageSize){  
        var pagedData = data.slice((page - 1) * pageSize, page * pageSize);
        $scope.myData = pagedData;
        $scope.totalServerItems = data.length;
        if (!$scope.$$phase) {
            $scope.$apply();
        }
    };
    $scope.getPagedDataAsync = function (pageSize, page, searchText) {
        setTimeout(function () {
            var data;
            if (searchText) {
                var ft = searchText.toLowerCase();
                $http.get('js/controllers/grid_performance/performance_data_skill2.json').success(function (largeLoad) {
                    data = largeLoad.filter(function(item) {
                        return JSON.stringify(item).toLowerCase().indexOf(ft) != -1;
                    });
                    $scope.setPagingData(data,page,pageSize);
                });            
            } else {
                $http.get('js/controllers/grid_performance/performance_data_skill2.json').success(function (largeLoad) {
                    $scope.setPagingData(largeLoad,page,pageSize);
                });
            }
        }, 100);
    };

    $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);

    $scope.$watch('pagingOptions', function (newVal, oldVal) {
        if (newVal !== oldVal && newVal.currentPage !== oldVal.currentPage) {
          $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.filterOptions.filterText);
        }
    }, true);
    $scope.$watch('filterOptions', function (newVal, oldVal) {
        if (newVal !== oldVal) {
          $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.filterOptions.filterText);
        }
    }, true);

    $scope.gridOptions = {
        data: 'myData',
        enablePaging: false,
        showFooter: false,
        totalServerItems: 'totalServerItems',
        pagingOptions: $scope.pagingOptions,
        filterOptions: $scope.filterOptions,
        enableSorting:false,
        enableCellSelection: false,
        enableRowSelection: false,
        enableCellEditOnFocus: false,
        headerRowHeight:48,
    };
}]);

/**
 * 各班知识情况数据表 - 知识各指标中平差值
 */
app.controller('SkillPerformanceGridDemoCtrl3', ['$scope', '$http', function($scope, $http) {
    $scope.filterOptions = {
        filterText: "",
        useExternalFilter: true
    }; 
    $scope.totalServerItems = 0;
    $scope.pagingOptions = {
        pageSizes: [250, 500, 1000],
        pageSize: 250,
        currentPage: 1
    };  
    $scope.setPagingData = function(data, page, pageSize){  
        var pagedData = data.slice((page - 1) * pageSize, page * pageSize);
        $scope.myData = pagedData;
        $scope.totalServerItems = data.length;
        if (!$scope.$$phase) {
            $scope.$apply();
        }
    };
    $scope.getPagedDataAsync = function (pageSize, page, searchText) {
        setTimeout(function () {
            var data;
            if (searchText) {
                var ft = searchText.toLowerCase();
                $http.get('js/controllers/grid_performance/performance_data_skill3.json').success(function (largeLoad) {
                    data = largeLoad.filter(function(item) {
                        return JSON.stringify(item).toLowerCase().indexOf(ft) != -1;
                    });
                    $scope.setPagingData(data,page,pageSize);
                });            
            } else {
                $http.get('js/controllers/grid_performance/performance_data_skill3.json').success(function (largeLoad) {
                    $scope.setPagingData(largeLoad,page,pageSize);
                });
            }
        }, 100);
    };

    $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);

    $scope.$watch('pagingOptions', function (newVal, oldVal) {
        if (newVal !== oldVal && newVal.currentPage !== oldVal.currentPage) {
          $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.filterOptions.filterText);
        }
    }, true);
    $scope.$watch('filterOptions', function (newVal, oldVal) {
        if (newVal !== oldVal) {
          $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.filterOptions.filterText);
        }
    }, true);

    $scope.gridOptions = {
        data: 'myData',
        enablePaging: false,
        showFooter: false,
        totalServerItems: 'totalServerItems',
        pagingOptions: $scope.pagingOptions,
        filterOptions: $scope.filterOptions,
        enableSorting:false,
        enableCellSelection: false,
        enableRowSelection: false,
        enableCellEditOnFocus: false,
        headerRowHeight:48,
        columnDefs: [{field:'班级', displayName:'班级'},
            {field:'认知', displayName:'认知', cellTemplate: '<div ng-class="{warning: row.getProperty(col.field) < 0}"><div class="ngCellText">{{row.getProperty(col.field)}}</div></div>'},
            {field:'理解（听）', displayName:'理解（听）', cellTemplate: '<div ng-class="{warning: row.getProperty(col.field) < 0}"><div class="ngCellText">{{row.getProperty(col.field)}}</div></div>'},
            {field:'理解（读）', displayName:'理解（读）', cellTemplate: '<div ng-class="{warning: row.getProperty(col.field) < 0}"><div class="ngCellText">{{row.getProperty(col.field)}}</div></div>'},
            {field:'信息提取（听）', displayName:'信息提取（听）', cellTemplate: '<div ng-class="{warning: row.getProperty(col.field) < 0}"><div class="ngCellText">{{row.getProperty(col.field)}}</div></div>'},
            {field:'信息提取（读）', displayName:'信息提取（读）', cellTemplate: '<div ng-class="{warning: row.getProperty(col.field) < 0}"><div class="ngCellText">{{row.getProperty(col.field)}}</div></div>'},
            {field:'推理（听）', displayName:'推理（听）', cellTemplate: '<div ng-class="{warning: row.getProperty(col.field) < 0}"><div class="ngCellText">{{row.getProperty(col.field)}}</div></div>'},
            {field:'推理（读）', displayName:'推理（读）', cellTemplate: '<div ng-class="{warning: row.getProperty(col.field) < 0}"><div class="ngCellText">{{row.getProperty(col.field)}}</div></div>'},
            {field:'分析', displayName:'分析', cellTemplate: '<div ng-class="{warning: row.getProperty(col.field) < 0}"><div class="ngCellText">{{row.getProperty(col.field)}}</div></div>'},
            {field:'表达', displayName:'表达', cellTemplate: '<div ng-class="{warning: row.getProperty(col.field) < 0}"><div class="ngCellText">{{row.getProperty(col.field)}}</div></div>'}]
    };
}]);

/**
 * 各班知识情况数据表 - 知识分化度
 */
app.controller('SkillPerformanceGridDemoCtrl4', ['$scope', '$http', function($scope, $http) {
    $scope.filterOptions = {
        filterText: "",
        useExternalFilter: true
    };
    $scope.totalServerItems = 0;
    $scope.pagingOptions = {
        pageSizes: [250, 500, 1000],
        pageSize: 250,
        currentPage: 1
    };
    $scope.setPagingData = function(data, page, pageSize){
        var pagedData = data.slice((page - 1) * pageSize, page * pageSize);
        $scope.myData = pagedData;
        $scope.totalServerItems = data.length;
        if (!$scope.$$phase) {
            $scope.$apply();
        }
    };
    $scope.getPagedDataAsync = function (pageSize, page, searchText) {
        setTimeout(function () {
            var data;
            if (searchText) {
                var ft = searchText.toLowerCase();
                $http.get('js/controllers/grid_performance/performance_data_skill4.json').success(function (largeLoad) {
                    data = largeLoad.filter(function(item) {
                        return JSON.stringify(item).toLowerCase().indexOf(ft) != -1;
                    });
                    $scope.setPagingData(data,page,pageSize);
                });
            } else {
                $http.get('js/controllers/grid_performance/performance_data_skill4.json').success(function (largeLoad) {
                    $scope.setPagingData(largeLoad,page,pageSize);
                });
            }
        }, 100);
    };

    $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);

    $scope.$watch('pagingOptions', function (newVal, oldVal) {
        if (newVal !== oldVal && newVal.currentPage !== oldVal.currentPage) {
            $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.filterOptions.filterText);
        }
    }, true);
    $scope.$watch('filterOptions', function (newVal, oldVal) {
        if (newVal !== oldVal) {
            $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.filterOptions.filterText);
        }
    }, true);

    $scope.gridOptions = {
        data: 'myData',
        enablePaging: false,
        showFooter: false,
        totalServerItems: 'totalServerItems',
        pagingOptions: $scope.pagingOptions,
        filterOptions: $scope.filterOptions,
        enableSorting:false,
        enableCellSelection: false,
        enableRowSelection: false,
        enableCellEditOnFocus: false,
        headerRowHeight:48,
    };
}]);