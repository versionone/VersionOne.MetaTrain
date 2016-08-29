app = angular.module 'VersionOne.MetaTrain', ['ui.bootstrap']

app.controller 'HomeController', ($scope, $http, $anchorScroll) ->
    baseUrl = 'https://crossorigin.me/https://www14.v1host.com/v1sdktesting/rest-1.v1/Data/'

    delete $http.defaults.headers.common['X-Requested-With']

    makeQuery = (assetName) ->
        query = 
            from: assetName
            select: []
        return query

    #where: {}
    #filter: []
    #paging:
    #    page: -1
    #    size: -1        

    currentQuery = () ->
        metaIndex = metaList.length - 1
        return metaList[metaIndex].query

    metaList = []

    massageTheMeta = (data) ->
        relations = _.where data.Attributes, {AttributeType:'Relation'}
        relations = _.sortBy relations, (rel) -> (!rel.IsRequired ? 'A' : 'Z') + rel.Name
        attributes = _.filter data.Attributes, (attr) -> attr.AttributeType != 'Relation'
        attributes = _.sortBy attributes, (attr) -> (!attr.IsRequired ? 'A' : 'Z') + attr.Name
        operations = data.operations
        
        return {
            AssetName: data.Token
            Attributes: attributes
            Relations: relations
            Operations: operations
            visible: true
            query: makeQuery(data.Token)
        }

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
        $http.get('https://crossorigin.me/https://www14.v1host.com' + href + '?accept=text/json').
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
            $http.get('https://crossorigin.me/https://www14.v1host.com' + href + '?accept=text/json').
                success (data) ->
                    metaListAdd data, attrName, query
                    $anchorScroll('asset-type')

    $scope.metaBack = () ->
        if metaList.length > 1
            metaList.pop()
            metaList[metaList.length - 1].visible = true

    $scope.metaList = metaList
    $scope.path = {val: ''}

    $scope.queryRender = () ->
        if metaList.length > 0
            return YAML.stringify(metaList[0].query, 100, 2)
            #return JSON.stringify(metaList[0].query, '\t', 2)
        else
            return ''

    $scope.explore '/v1sdktesting/meta.v1/Scope'

angular.bootstrap document, ['VersionOne.MetaTrain']