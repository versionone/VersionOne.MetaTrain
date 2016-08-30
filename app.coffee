app = angular.module 'VersionOne.MetaTrain', ['ui.bootstrap']

app.controller 'HomeController', ($scope, $http, $anchorScroll) ->
    baseUrl = 'https://crossorigin.me/https://www14.v1host.com'

    delete $http.defaults.headers.common['X-Requested-With']

    makeQuery = (assetName) ->
        query = 
            from: assetName
            select: []
        return query

    resetQueryFilter = (query) ->
        query.filter = []

    currentQuery = () ->
        metaIndex = metaList.length - 1
        return metaList[metaIndex].query

    metaList = []

    createFilterValue = () -> return {value:''}

    createFilter = () -> return {operator: 'none', values: [createFilterValue()]}

    massageTheMeta = (data) ->
        relations = _.where data.Attributes, {AttributeType:'Relation'}
        relations = _.sortBy relations, (rel) -> (!rel.IsRequired ? 'A' : 'Z') + rel.Name
        attributes = _.filter data.Attributes, (attr) -> attr.AttributeType != 'Relation'
        attributes = _.sortBy attributes, (attr) -> (!attr.IsRequired ? 'A' : 'Z') + attr.Name
        operations = data.operations

        attributes = _.map(attributes, (a) ->
            a.filterVisible = false
            a.filters = [createFilter()]
            return a
        )

        return {
            AssetName: data.Token
            Attributes: attributes
            Relations: relations
            Operations: operations
            visible: true
            query: makeQuery(data.Token)
        }

    metaListReset = () -> metaList.length = 0

    metaListAdd = (metaData, attrName, query) ->
        lastIndex = metaList.length - 1
        metaInfo = massageTheMeta(metaData)        
        if lastIndex >= 0
            metaList[lastIndex].visible = false
            if attrName
                metaInfo.query.from = attrName
                query.select.push metaInfo.query
        metaList.push metaInfo

    $scope.explore = (href) ->
        metaListReset()
        $http.get(baseUrl + href + '?accept=text/json').
            success (data) -> 
                metaListAdd data

    $scope.selected = (attrName) ->
        query = currentQuery()
        return _.contains(query.select, attrName)

    $scope.toggleSelect = (attrName) ->
        query = currentQuery()
        if !_.contains(query.select, attrName)
            query.select.push attrName
        else
            query.select = _.without(query.select, attrName)

    $scope.selectedRelation = (attrName) ->
        query = currentQuery()
        return _.findWhere(query.select, {from:attrName}) != undefined

    $scope.toggleSelectRelation = (href, attrName) ->
        query = currentQuery()
        obj = _.findWhere(query.select, {from:attrName})
        if obj
            query.select = _.without(query.select, obj)
        else
            $http.get(baseUrl + href + '?accept=text/json').
                success (data) ->
                    metaListAdd data, attrName, query
                    $anchorScroll('asset-type')

    $scope.toggleFilter = (attr) ->
        attr.filterVisible = !attr.filterVisible

    $scope.filterAdd = (attr) ->
        attr.filters.push(createFilter())

    $scope.filterRemove = (attr, filter) ->
        attr.filters = _.without(attr.filters, filter)

    $scope.filterValueAdd = (filter) ->
        filter.values.push(createFilterValue())

    $scope.filterValueRemove = (filter, filterValue) ->
        filter.values = _.without(filter.values, filterValue)

    operatorsMap =
        none: ''
        equal: '='
        notEqual: '!='
        greaterThan: '>'
        greaterThanOrEqual: '>='
        lessThan: '<'
        lessThanOrEqual: '<='
        exists: '+'
        notExists: '-'

    $scope.filtersUpdate = (attr) ->
        query = currentQuery()

        if (attr.filters.length > 0)
            resetQueryFilter(query)

            for filter in attr.filters
                token = operatorsMap[filter.operator]
                values = _.map(filter.values, (val) ->
                    return '"' + val.value + '"' # TODO clean up
                ).join(',')
                query.filter.push attr.Name + token + values

    $scope.metaBack = () ->
        if metaList.length > 1
            metaList.pop()
            metaList[metaList.length - 1].visible = true

    $scope.metaList = metaList

    $scope.queryRender = () ->
        if metaList.length > 0
            return YAML.stringify(metaList[0].query, 100, 2)
            #return JSON.stringify(metaList[0].query, '\t', 2)
        else
            return ''

    $scope.assetsVisible = true

    $scope.assetTypes = {types:[]}

    $scope.highlightedAsset = (assetType) -> _.contains(['Scope', 'Story', 'Defect', 'Task', 'Test'], assetType.Name)

    $scope.assetTypesShow = () -> $scope.assetsVisible = true

    $http.get(baseUrl + '/v1sdktesting/rest-1.v1/Data/AssetType?sel=Name' + '&accept=text/json&ticket=HFZlcnNpb25PbmUuV2ViLkF1dGhlbnRpY2F0b3IUAAAABWFkbWlurufCiPXP0wj/Pzf0dSjKKxBjP2DesXYad30GuCU16YZk').success (data) ->
        assetTypes = _.map(data.Assets, (assetType) ->
            return { Name: assetType.Attributes.Name.value }
        )
        assetTypes = _.sortBy assetTypes, (assetType) -> assetType.Name

        $scope.assetTypes.types = assetTypes

    $scope.assetSelect = (assetType) ->
        $scope.explore '/v1sdktesting/meta.v1/' + assetType.Name
        $scope.assetsVisible = false

angular.bootstrap document, ['VersionOne.MetaTrain']