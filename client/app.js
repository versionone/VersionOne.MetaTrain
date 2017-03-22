const proxyUrl = '/pt';
/*
https://www14.v1host.com/v1sdktesting
1.vPHZYd9OPRSFBgEb76qCOLKdxy0=
*/

// Do not change anything below this comment

let auth = {};

const parseUrl = url => {
    // Examples:
    // https://www14.v1host.com/v1sdktesting
    // http://localhost/
    const rx = /(https?:\/\/.*?)\/(.*)/;
    const match = url.match(rx);
    return {
        instanceBaseUrl: match[1],
        instanceName: match[2]
    };
};

const app = angular.module('VersionOne.MetaTrain', ['ui.bootstrap', 'jsonFormatter', 'ui.ace']);

app.controller('HomeController', ($scope, $http, $anchorScroll) => {
    delete $http.defaults.headers.common['X-Requested-With'];

    let makeQuery = (assetName) => ({ from: assetName, filter: [], sort: [], select: [] });

    let resetQueryFilter = (query) => query.filter = [];

    let currentQuery = () => metaList[metaList.length - 1].query;

    let metaList = [];

    let createFilterValue = () => ({value: ''});

    let createFilter = () => ({operator: 'none', values: [createFilterValue()]});

    let massageTheMeta = (data) => {
        let relations = _.where(data.Attributes, {AttributeType:'Relation'});
        relations = _.sortBy(relations, (rel) => (!rel.IsRequired ? 'A' : 'Z') + rel.Name);
        let attributes = _.filter(data.Attributes, (attr) => attr.AttributeType != 'Relation');
        attributes = _.sortBy(attributes, (attr) => (!attr.IsRequired ? 'A' : 'Z') + attr.Name);
        let operations = data.operations;

        attributes = _.map(attributes, (a) => {
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
    }

    const metaListReset = () => metaList.length = 0;

    let metaListAdd = (metaData, attrName, query) => {
        const lastIndex = metaList.length - 1;
        let metaInfo = massageTheMeta(metaData);
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

    $scope.configSave = () => {
        auth.headers = {
            Authorization: `Bearer ${$scope.config.accessToken}`
        };

        const urlParts = parseUrl($scope.config.instanceUrl);
        $scope.config.instanceBaseUrl = urlParts.instanceBaseUrl;
        $scope.config.instanceName = urlParts.instanceName;

        $scope.assetTypesSearch();

        $scope.configPending = false;
    };

    $scope.fillEditor = () => $scope.editor = $scope.queryRender();

    $scope.aggregateOption = '';

    $scope.aggregators = [
        '',
        'Sum',
        'Count',
        'DistinctCount',
        'MinDate',
        'MaxDate',
        'And',
        'Or',
        'MaxState'];

    $scope.changeAggregate = (value, attr) => {
        let query = currentQuery();
        aggregateName = getWitoutAgregateName(query.select, attr.Name);
        aggregate = value === '' ? attr.Name : attr.Name + '.@' + value;
        query.select = _.without(query.select, aggregateName);
        if (value != '')
            query.select.push(aggregate);
    }

    let getWitoutAgregateName = (select, attrName) => 
        _.filter(select, (ele) => ele.split('.')[0] === attrName)[0];

    $scope.queryResult = {};
    $scope.showResults = false;
    $scope.radioOption = 'raw';
    $scope.radioOptionPayload = 'yaml';

    $scope.showFormatted = (value) => $scope.showResults && $scope.radioOption === value;

    $scope.tryIt = () => {
        const url = `${proxyUrl}/${$scope.config.instanceUrl}/query.v1`;
        const payload = $scope.showEditor ? $scope.editor : $scope.queryRender();
        $http.post(url, payload, auth)
            .success((data) => {
                $scope.showResults = true;
                $scope.queryResult = JSON.stringify(data, '\t', 2);
                $scope.queryResultToBeFormatted = data;
        });
    };

    $scope.explore = (href) => {
        metaListReset();
        $http.get(proxyUrl + '/' + $scope.config.instanceBaseUrl + href + '?accept=text/json', auth)
            .success((data) => metaListAdd(data));
    }

    $scope.selected = (attrName) => _.contains(currentQuery().select, attrName);

    $scope.toggleSelect = (attrName) => {
        let query = currentQuery();
        if (!_.contains(query.select, attrName))
            query.select.push(attrName);
        else
            query.select = _.without(query.select, attrName);
    }

    $scope.selectedRelation = (attrName) => 
    	_.findWhere(currentQuery().select, {from:attrName}) != undefined;

    $scope.toggleSelectRelation = (href, attrName) => {
        let query = currentQuery();
        attributeSearchReset();
        obj = _.findWhere(query.select, {from:attrName});
        if (obj)
            query.select = _.without(query.select, obj);
        else {
            $http.get($scope.config.instanceBaseUrl + href + '?accept=text/json', auth)
                .success((data) => {
                    metaListAdd(data, attrName, query);
                    $anchorScroll('asset-type');
                });
        }
    }

    $scope.toggleFilter = (attr) => attr.filterVisible = !attr.filterVisible;

    let proccessSort = (sortValue) => {
        let query = currentQuery();
        if (_.contains(query.sort, sortValue))
            query.sort = _.without(query.sort, sortValue);
        else
            query.sort.push(sortValue);
    }

    $scope.sortUp = (attr) => proccessSort('+' + attr.Name);

    $scope.sortDown = (attr) => proccessSort('-' + attr.Name);

    $scope.filterAdd = (attr) => attr.filters.push(createFilter());

    $scope.filterRemove = (attr, filter) => attr.filters = _.without(attr.filters, filter);

    $scope.filterValueAdd = (filter) => filter.values.push(createFilterValue());

    $scope.filterValueRemove = (filter, filterValue) => filter.values = _.without(filter.values, filterValue);

    const operatorsMap = {
        none: '',
        equal: '=',
        notEqual: '!=',
        greaterThan: '>',
        greaterThanOrEqual: '>=',
        lessThan: '<',
        lessThanOrEqual: '<=',
        exists: '+',
        notExists: '-'
    }

    $scope.filtersUpdate = (item) => {
        let query = currentQuery();
        resetQueryFilter(query);
        item.Attributes.forEach(attr => {
            if (attr.filters.length > 0) {
                attr.filters.forEach(filter => {
                    let token = operatorsMap[filter.operator];
                     // TODO clean up
                    let values = _.map(filter.values, (val) => '"' + val.value + '"').join(',');
                    if(token != "")
                        query.filter.push(attr.Name + token + values);
                });
            }
        });
   	}

    $scope.metaBack = () => {
        if (metaList.length > 1) {
            metaList.pop();
            metaList[metaList.length - 1].visible = true;
        }
    }

    $scope.metaList = metaList;

    let removeEmptyArrayProperties = (obj) => {
        for (let [key, val] of Object.entries(obj)) {
            if (_.isArray(val) && val.length === 0) {
                delete(obj[key]);
            }
            else if (_.isArray(val) && val.length > 0) {
                removeEmptyArrayProperties(val);
            }
            else if (_.isObject(val)) {
                removeEmptyArrayProperties(val);
            }
        }
    }

    $scope.queryRender = () => {
        if (metaList.length > 0) {
            let querySerialized = JSON.stringify(metaList[0].query);
            let query = JSON.parse(querySerialized);

            removeEmptyArrayProperties(query);

            let yaml = YAML.stringify(query, 100, 2);
            yaml = yaml.replace(/-\s*?from:/g, '- from:');

            if ($scope.radioOptionPayload === 'yaml')
                return yaml;
            else
                return JSON.stringify(query, '\t', 2);
        } else
            return '';
    }

    $scope.attributeSearch = {search:'', prefixMatch: false};

    let attributeSearchReset = () => $scope.attributeSearch.search = '';

    $scope.attributeMatchesFilter = (attrName) => {
      	let rawFilter = $scope.attributeSearch.search;
      	if (rawFilter) {
        	let filters = rawFilter.split(',');
	        if (filters.length > 0 && filters[0] != '') {
	          	filters = _.without(filters, '');
	          	let matches = _.some(filters, (filter) => {
	            	if ($scope.attributeSearch.prefixMatch) 
	              		return attrName.toLowerCase().indexOf(filter.toLowerCase()) === 0;
	            	else
	              		return attrName.toLowerCase().search(filter.toLowerCase()) > -1;
	      			});
	          	return matches;
	        } else
	          	return true;
	    }
      	return true;
    }

    $scope.assetsVisible = false;

    $scope.assetTypes = {types:[]};

    const highlightAssets = ['Scope', 'Story', 'Defect', 'Task', 'Test', 'Epic'];

    $scope.highlightedAsset = (assetType) => _.contains(highlightAssets, assetType.Name);

    $scope.assetTypesShow = () => $scope.assetsVisible = true;

    $scope.assetTypesSearch = () => {
        $http.get(`${proxyUrl}/${$scope.config.instanceUrl}/rest-1.v1/Data/AssetType?sel=Name&accept=text/json`, auth)
        	.success((data) => {
    	        let assetTypes = _.map(data.Assets, (assetType) => ({ Name: assetType.Attributes.Name.value }));
    	        assetTypes = _.sortBy(assetTypes, (assetType) => assetType.Name);
    	        let highlights = _.filter(assetTypes, $scope.highlightedAsset);
    	        assetTypes = _.without(assetTypes, highlights[0], highlights[1], highlights[2], highlights[3], highlights[4], highlights[5]);
    	        assetTypes = _.union(highlights, assetTypes);

                $scope.assetTypes.types = assetTypes;
                
                $scope.assetTypesShow();
    	});
    }

    $scope.assetSelect = (assetType) => {
        // TODO
        $scope.explore(`/${$scope.config.instanceName}/meta.v1/` + assetType.Name);
        attributeSearchReset();
        $scope.assetsVisible = false;
    }
});
angular.bootstrap(document, ['VersionOne.MetaTrain']);