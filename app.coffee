proxyUrl = 'http://localhost:8080'
v1HostUrl = 'http://localhost'
v1InstanceName = 'VersionOne.Web'
v1Ticket = 'HFZlcnNpb25PbmUuV2ViLkF1dGhlbnRpY2F0b3IUAAAABWFkbWlurDxBxOzP0wj/Pzf0dSjKKxAGqf4JFIdBMgObRKtwQRP1'

app = angular.module 'VersionOne.MetaTrain', ['ui.bootstrap', 'jsonFormatter', 'ui.ace']

app.controller 'HomeController', ($scope, $http, $anchorScroll) ->
    baseUrl = "#{proxyUrl}/#{v1HostUrl}"

    delete $http.defaults.headers.common['X-Requested-With']

    makeQuery = (assetName) ->
        query =
            from: assetName
            filter: []
            sort: []
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
        metaInfo = massageTheMeta metaData
        if lastIndex >= 0
            metaList[lastIndex].visible = false
            if attrName
                metaInfo.query.from = attrName
                query.select.push metaInfo.query
        metaList.push metaInfo

    $scope.fillEditor = () ->
        $scope.editor = $scope.queryRender()

    $scope.aggregateOption = ''

    $scope.aggregators = [
        '',
        'Sum',
        'Count',
        'DistinctCount',
        'MinDate',
        'MaxDate',
        'And',
        'Or',
        'MaxState']

    $scope.changeAggregate = (value, attr) ->
        query = currentQuery()
        aggregateName = getWitoutAgregateName(query.select, attr.Name)
        aggregate = if value == '' then attr.Name else attr.Name + '.@' + value
        query.select = _.without(query.select, aggregateName)
        if (value != '')
            query.select.push aggregate

    getWitoutAgregateName = (select, attrName) ->
        return _.filter(select, (ele) ->
           return ele.split('.')[0] == attrName
        )[0]

    $scope.queryResult = {}
    $scope.showResults = false
    $scope.radioOption = 'raw'
    $scope.radioOptionPayload = 'yaml'
    $scope.showFormatted = (value) ->
        $scope.showResults && $scope.radioOption == value

    $scope.tryIt = () ->
        url = "#{baseUrl}/#{v1InstanceName}/query.v1?ticket=#{v1Ticket}"
        payload = if $scope.showEditor then $scope.editor else $scope.queryRender()
        $http.post(url, payload).
            success (data) ->
                $scope.showResults = true
                $scope.queryResult = JSON.stringify(data, '\t', 2)
                $scope.queryResultToBeFormatted = data

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
        attributeSearchReset()
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

    proccessSort = (sortValue) ->
        query = currentQuery()
        if _.contains(query.sort, sortValue)
            query.sort = _.without(query.sort, sortValue)
        else
            query.sort.push sortValue

    $scope.sortUp = (attr) ->
        sortValue = '+' + attr.Name
        proccessSort sortValue

    $scope.sortDown = (attr) ->
        sortValue = '-' + attr.Name
        proccessSort sortValue

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

    $scope.filtersUpdate = (item) ->
        query = currentQuery()
        resetQueryFilter(query)

        for attr in item.Attributes
            if (attr.filters.length > 0)
                for filter in attr.filters
                    token = operatorsMap[filter.operator]
                    values = _.map(filter.values, (val) ->
                        return '"' + val.value + '"' # TODO clean up
                    ).join(',')
                    if(token != "")
                        query.filter.push attr.Name + token + values

    $scope.metaBack = () ->
        if metaList.length > 1
            metaList.pop()
            metaList[metaList.length - 1].visible = true

    $scope.metaList = metaList

    removeEmptyArrayProperties = (obj) ->
        for key, val of obj
            if _.isArray(val) && val.length == 0
                delete obj[key]
            else if _.isArray(val) && val.length > 0
                removeEmptyArrayProperties val
            else if _.isObject(val)
                removeEmptyArrayProperties val


    $scope.queryRender = () ->
        if metaList.length > 0
            querySerialized = JSON.stringify(metaList[0].query)
            query = JSON.parse(querySerialized)

            removeEmptyArrayProperties query

            yaml = YAML.stringify(query, 100, 2)
            yaml = yaml.replace(/-\s*?from:/g, '- from:')

            if $scope.radioOptionPayload == 'yaml'
                return yaml
            else
                return JSON.stringify(query, '\t', 2)

            #return JSON.stringify(query, '\t', 2)
        else
            return ''

    $scope.attributeSearch = {search:'', prefixMatch: false}

    attributeSearchReset = () -> $scope.attributeSearch.search = ''

    $scope.attributeMatchesFilter = (attrName) ->
      rawFilter = $scope.attributeSearch.search
      if rawFilter
        filters = rawFilter.split(',')
        if filters.length > 0 && filters[0] != ''
          filters = _.without(filters, '')
          matches = _.some filters, (filter) ->
            if $scope.attributeSearch.prefixMatch
              return attrName.toLowerCase().indexOf(filter.toLowerCase()) == 0
            else
              return attrName.toLowerCase().search(filter.toLowerCase()) > -1
          return matches
        else
          return true
      return true

    $scope.assetsVisible = true

    $scope.assetTypes = {types:[]}

    highlightAssets = ['Scope', 'Story', 'Defect', 'Task', 'Test', 'Epic']

    $scope.highlightedAsset = (assetType) -> _.contains(highlightAssets, assetType.Name)

    $scope.assetTypesShow = () -> $scope.assetsVisible = true

    $http.get("#{baseUrl}/#{v1InstanceName}/rest-1.v1/Data/AssetType?sel=Name&accept=text/json&ticket=#{v1Ticket}").success (data) ->
        assetTypes = _.map(data.Assets, (assetType) ->
            return { Name: assetType.Attributes.Name.value }
        )
        assetTypes = _.sortBy assetTypes, (assetType) -> assetType.Name
        highlights = _.filter assetTypes, $scope.highlightedAsset
        assetTypes = _.without assetTypes, highlights[0], highlights[1], highlights[2], highlights[3], highlights[4], highlights[5]
        assetTypes = _.union highlights, assetTypes

        $scope.assetTypes.types = assetTypes

    $scope.assetSelect = (assetType) ->
        $scope.explore "/#{v1InstanceName}/meta.v1/" + assetType.Name
        attributeSearchReset()
        $scope.assetsVisible = false

angular.bootstrap document, ['VersionOne.MetaTrain']
