'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var proxyUrl = '/pt';
/*
https://www14.v1host.com/v1sdktesting
1.vPHZYd9OPRSFBgEb76qCOLKdxy0=
*/

// Do not change anything below this comment

var auth = {};

var parseUrl = function parseUrl(url) {
    // Examples:
    // https://www14.v1host.com/v1sdktesting
    // http://localhost/
    var rx = /(https?:\/\/.*?)\/(.*)/;
    var match = url.match(rx);
    return {
        instanceBaseUrl: match[1],
        instanceName: match[2]
    };
};

var app = angular.module('VersionOne.MetaTrain', ['ui.bootstrap', 'jsonFormatter', 'ui.ace']);

app.controller('HomeController', function ($scope, $http, $anchorScroll) {
    delete $http.defaults.headers.common['X-Requested-With'];

    var makeQuery = function makeQuery(assetName) {
        return { from: assetName, filter: [], sort: [], select: [] };
    };

    var resetQueryFilter = function resetQueryFilter(query) {
        return query.filter = [];
    };

    var currentQuery = function currentQuery() {
        return metaList[metaList.length - 1].query;
    };

    var metaList = [];

    var createFilterValue = function createFilterValue() {
        return { value: '' };
    };

    var createFilter = function createFilter() {
        return { operator: 'none', values: [createFilterValue()] };
    };

    var massageTheMeta = function massageTheMeta(data) {
        var relations = _.where(data.Attributes, { AttributeType: 'Relation' });
        relations = _.sortBy(relations, function (rel) {
            return (!rel.IsRequired ? 'A' : 'Z') + rel.Name;
        });
        var attributes = _.filter(data.Attributes, function (attr) {
            return attr.AttributeType != 'Relation';
        });
        attributes = _.sortBy(attributes, function (attr) {
            return (!attr.IsRequired ? 'A' : 'Z') + attr.Name;
        });
        var operations = data.operations;

        attributes = _.map(attributes, function (a) {
            a.filterVisible = false;
            a.filters = [createFilter()];
            return a;
        });

        return {
            AssetName: data.Token,
            Attributes: attributes,
            Relations: relations,
            Operations: operations,
            visible: true,
            query: makeQuery(data.Token)
        };
    };

    var metaListReset = function metaListReset() {
        return metaList.length = 0;
    };

    var metaListAdd = function metaListAdd(metaData, attrName, query) {
        var lastIndex = metaList.length - 1;
        var metaInfo = massageTheMeta(metaData);
        if (lastIndex >= 0) {
            metaList[lastIndex].visible = false;
            if (attrName) {
                metaInfo.query.from = attrName;
                query.select.push(metaInfo.query);
            }
        }
        metaList.push(metaInfo);
    };

    $scope.config = {
        instanceUrl: '',
        accessToken: '',
        instanceBaseUrl: '',
        instanceName: ''
    };

    $scope.configPending = true;

    $scope.configSave = function () {
        auth.headers = {
            Authorization: 'Bearer ' + $scope.config.accessToken
        };

        var urlParts = parseUrl($scope.config.instanceUrl);
        $scope.config.instanceBaseUrl = urlParts.instanceBaseUrl;
        $scope.config.instanceName = urlParts.instanceName;

        $scope.assetTypesSearch();

        $scope.configPending = false;
    };

    $scope.fillEditor = function () {
        return $scope.editor = $scope.queryRender();
    };

    $scope.aggregateOption = '';

    $scope.aggregators = ['', 'Sum', 'Count', 'DistinctCount', 'MinDate', 'MaxDate', 'And', 'Or', 'MaxState'];

    $scope.changeAggregate = function (value, attr) {
        var query = currentQuery();
        aggregateName = getWitoutAgregateName(query.select, attr.Name);
        aggregate = value === '' ? attr.Name : attr.Name + '.@' + value;
        query.select = _.without(query.select, aggregateName);
        if (value != '') query.select.push(aggregate);
    };

    var getWitoutAgregateName = function getWitoutAgregateName(select, attrName) {
        return _.filter(select, function (ele) {
            return ele.split('.')[0] === attrName;
        })[0];
    };

    $scope.queryResult = {};
    $scope.showResults = false;
    $scope.radioOption = 'raw';
    $scope.radioOptionPayload = 'yaml';

    $scope.showFormatted = function (value) {
        return $scope.showResults && $scope.radioOption === value;
    };

    $scope.tryIt = function () {
        var url = proxyUrl + '/' + $scope.config.instanceUrl + '/query.v1';
        var payload = $scope.showEditor ? $scope.editor : $scope.queryRender();
        $http.post(url, payload, auth).success(function (data) {
            $scope.showResults = true;
            $scope.queryResult = JSON.stringify(data, '\t', 2);
            $scope.queryResultToBeFormatted = data;
        });
    };

    $scope.explore = function (href) {
        metaListReset();
        $http.get(proxyUrl + '/' + $scope.config.instanceBaseUrl + href + '?accept=text/json', auth).success(function (data) {
            return metaListAdd(data);
        });
    };

    $scope.selected = function (attrName) {
        return _.contains(currentQuery().select, attrName);
    };

    $scope.toggleSelect = function (attrName) {
        var query = currentQuery();
        if (!_.contains(query.select, attrName)) query.select.push(attrName);else query.select = _.without(query.select, attrName);
    };

    $scope.selectedRelation = function (attrName) {
        return _.findWhere(currentQuery().select, { from: attrName }) != undefined;
    };

    $scope.toggleSelectRelation = function (href, attrName) {
        var query = currentQuery();
        attributeSearchReset();
        obj = _.findWhere(query.select, { from: attrName });
        if (obj) query.select = _.without(query.select, obj);else {
            $http.get($scope.config.instanceBaseUrl + href + '?accept=text/json', auth).success(function (data) {
                metaListAdd(data, attrName, query);
                $anchorScroll('asset-type');
            });
        }
    };

    $scope.toggleFilter = function (attr) {
        return attr.filterVisible = !attr.filterVisible;
    };

    var proccessSort = function proccessSort(sortValue) {
        var query = currentQuery();
        if (_.contains(query.sort, sortValue)) query.sort = _.without(query.sort, sortValue);else query.sort.push(sortValue);
    };

    $scope.sortUp = function (attr) {
        return proccessSort('+' + attr.Name);
    };

    $scope.sortDown = function (attr) {
        return proccessSort('-' + attr.Name);
    };

    $scope.filterAdd = function (attr) {
        return attr.filters.push(createFilter());
    };

    $scope.filterRemove = function (attr, filter) {
        return attr.filters = _.without(attr.filters, filter);
    };

    $scope.filterValueAdd = function (filter) {
        return filter.values.push(createFilterValue());
    };

    $scope.filterValueRemove = function (filter, filterValue) {
        return filter.values = _.without(filter.values, filterValue);
    };

    var operatorsMap = {
        none: '',
        equal: '=',
        notEqual: '!=',
        greaterThan: '>',
        greaterThanOrEqual: '>=',
        lessThan: '<',
        lessThanOrEqual: '<=',
        exists: '+',
        notExists: '-'
    };

    $scope.filtersUpdate = function (item) {
        var query = currentQuery();
        resetQueryFilter(query);
        item.Attributes.forEach(function (attr) {
            if (attr.filters.length > 0) {
                attr.filters.forEach(function (filter) {
                    var token = operatorsMap[filter.operator];
                    // TODO clean up
                    var values = _.map(filter.values, function (val) {
                        return '"' + val.value + '"';
                    }).join(',');
                    if (token != "") query.filter.push(attr.Name + token + values);
                });
            }
        });
    };

    $scope.metaBack = function () {
        if (metaList.length > 1) {
            metaList.pop();
            metaList[metaList.length - 1].visible = true;
        }
    };

    $scope.metaList = metaList;

    var removeEmptyArrayProperties = function removeEmptyArrayProperties(obj) {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = Object.entries(obj)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var _step$value = _slicedToArray(_step.value, 2),
                    key = _step$value[0],
                    val = _step$value[1];

                if (_.isArray(val) && val.length === 0) {
                    delete obj[key];
                } else if (_.isArray(val) && val.length > 0) {
                    removeEmptyArrayProperties(val);
                } else if (_.isObject(val)) {
                    removeEmptyArrayProperties(val);
                }
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator.return) {
                    _iterator.return();
                }
            } finally {
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }
    };

    $scope.queryRender = function () {
        if (metaList.length > 0) {
            var querySerialized = JSON.stringify(metaList[0].query);
            var query = JSON.parse(querySerialized);

            removeEmptyArrayProperties(query);

            var yaml = YAML.stringify(query, 100, 2);
            yaml = yaml.replace(/-\s*?from:/g, '- from:');

            if ($scope.radioOptionPayload === 'yaml') return yaml;else return JSON.stringify(query, '\t', 2);
        } else return '';
    };

    $scope.attributeSearch = { search: '', prefixMatch: false };

    var attributeSearchReset = function attributeSearchReset() {
        return $scope.attributeSearch.search = '';
    };

    $scope.attributeMatchesFilter = function (attrName) {
        var rawFilter = $scope.attributeSearch.search;
        if (rawFilter) {
            var filters = rawFilter.split(',');
            if (filters.length > 0 && filters[0] != '') {
                filters = _.without(filters, '');
                var matches = _.some(filters, function (filter) {
                    if ($scope.attributeSearch.prefixMatch) return attrName.toLowerCase().indexOf(filter.toLowerCase()) === 0;else return attrName.toLowerCase().search(filter.toLowerCase()) > -1;
                });
                return matches;
            } else return true;
        }
        return true;
    };

    $scope.assetsVisible = false;

    $scope.assetTypes = { types: [] };

    var highlightAssets = ['Scope', 'Story', 'Defect', 'Task', 'Test', 'Epic'];

    $scope.highlightedAsset = function (assetType) {
        return _.contains(highlightAssets, assetType.Name);
    };

    $scope.assetTypesShow = function () {
        return $scope.assetsVisible = true;
    };

    $scope.assetTypesSearch = function () {
        $http.get(proxyUrl + '/' + $scope.config.instanceUrl + '/rest-1.v1/Data/AssetType?sel=Name&accept=text/json', auth).success(function (data) {
            var assetTypes = _.map(data.Assets, function (assetType) {
                return { Name: assetType.Attributes.Name.value };
            });
            assetTypes = _.sortBy(assetTypes, function (assetType) {
                return assetType.Name;
            });
            var highlights = _.filter(assetTypes, $scope.highlightedAsset);
            assetTypes = _.without(assetTypes, highlights[0], highlights[1], highlights[2], highlights[3], highlights[4], highlights[5]);
            assetTypes = _.union(highlights, assetTypes);

            $scope.assetTypes.types = assetTypes;

            $scope.assetTypesShow();
        });
    };

    $scope.assetSelect = function (assetType) {
        // TODO
        $scope.explore('/' + $scope.config.instanceName + '/meta.v1/' + assetType.Name);
        attributeSearchReset();
        $scope.assetsVisible = false;
    };
});
angular.bootstrap(document, ['VersionOne.MetaTrain']);