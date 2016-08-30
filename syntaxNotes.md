## http://localhost/VersionOne.Web/rest-1.v1/Data/Scope?where=Workitems:Story[Name='Story 1']

Get Scopes who have Workitems of type Story who have Name = Story 1

## http://localhost/VersionOne.Web/rest-1.v1/Data/Scope?where=Workitems:Story[Name='Story 1','Story 2']

Same as above, but also include if Stor Name = Story 2. This doesn't broaden anything really.

## http://localhost/VersionOne.Web/rest-1.v1/Data/Scope?where=Workitems:Story[Name='Story 1','Story 2';Name!='Story 1']

Now was added ;Name!='Story 1' which means get Scopes who have Stories named Story 1 or Story 2 and also Stories NOT named Story 1. This is still pretty much the same.

## http://localhost/VersionOne.Web/rest-1.v1/Data/Scope?where=Workitems:Story[Name='Story 1','Story 2'|Name!='Story 1']

Ahh, but now with |Name!='Story 1', we also include any Scope who has a Story not named Story 1.

## http://localhost/VersionOne.Web/rest-1.v1/Data/Scope?where=Workitems:Story[Name='Story 1','My Story 2']

Now, include Scopes with Stories with Name of Story 1 OR My Story 2. This brings us all three Scopes.

The same can be accomplished this way:

## http://localhost/VersionOne.Web/rest-1.v1/Data/Scope?where=Workitems:Story[Name='Story 1'|Name='My Story 2']

That produces the same result!

## http://localhost/VersionOne.Web/rest-1.v1/Data/Scope?where=Workitems:Story[Name='Story 1'|Name='My Story 2'];Name='Second Project'

Now, by adding ;Name='Second Project', which means AND, we are limiting the Scopes returned.

## http://localhost/VersionOne.Web/rest-1.v1/Data/Scope?where=Workitems:Story[Name='Story 1']

Taking a step back, we are back to getting just the two Scopes who have a matched Story with Name = Story 1.

## http://localhost/VersionOne.Web/rest-1.v1/Data/Scope?where=Workitems:Story[Name='Story 1']|Name='System (All Projects)'

Back to matching all Scopes by virtue of | the OR operator matching on the Name value specified.

## http://localhost/VersionOne.Web/rest-1.v1/Data/Scope?where=Workitems:Story[ID='Story:1003']&sel=Workitems:Story[ID='Story:1003']

Get Scopes with a Story of a specific ID, and select only that Story specifically from it.

## http://localhost/VersionOne.Web/rest-1.v1/Data/Scope?where=Workitems:Story[ID='Story:1003';Children:Task[ID='Task:1005']]&sel=Workitems:Story[ID='Story:1003'].Children:Task

Now we fetch Scopes who have a Story of ID Story:1003 if-and-only-if that Story has a Children:Task with ID of Task:1005, and select all of the matched Story's Children:Task assets.

## http://localhost/VersionOne.Web/rest-1.v1/Data/Scope?where=Workitems:Story[ID='Story:1003';Children:Task[ID='Task:1005']]|Workitems:Story[ID='Story:1057']&sel=Workitems:Story[ID='Story:1003'].Children:Task

Here we extend our Scope selection, but haven't broadened our Workitems:Story selection. This does result in two Scopes, but no additional Story matches for that matched Scope.

## http://localhost/VersionOne.Web/rest-1.v1/Data/Scope?where=Workitems:Story[ID='Story:1003';Children:Task[ID='Task:1005']]|Workitems:Story[ID='Story:1057']&sel=Workitems:Story.Children:Task

Now we just take the Story.Children:Task, which is cool, but it's actually empty still because there really are no Children:Task

## http://localhost/VersionOne.Web/rest-1.v1/Data/Scope?where=Workitems:Story[ID='Story:1003';Children:Task[ID='Task:1005']]|Workitems:Story[ID='Story:1057']&sel=Workitems:Story.ID,Workitems:Story.Children:Task

Here, we have taken not just the Workitems:Story.Children:Task, but also more simply the Workitems:Story, proving we do have Story Workitems under each matched Scope.

## http://localhost/VersionOne.Web/rest-1.v1/Data/Scope?where=Workitems:Story[ID='Story:1003';Children:Task[ID='Task:1005']]|Workitems:Story[ID='Story:1057'];ID='Scope:1027'&sel=Workitems:Story.ID,Workitems:Story.Children:Task

Now we get tricky. Adding ;ID='Scope:1027' is asking to add an additional AND clause to our previous ORed expressions. And, since the previous matches do not have this Scope ID, we get 0 results.

## http://localhost/VersionOne.Web/rest-1.v1/Data/Scope?where=Workitems:Story[ID='Story:1003';Children:Task[ID='Task:1005']]|Workitems:Story[ID='Story:1057']|ID='Scope:1027'&sel=Workitems:Story.ID,Workitems:Story.Children:Task

Changinng the ; to an | simply adds the expression as another OR, expanding our results to 3.

But, what if we want to group something more closely? 

## http://localhost/VersionOne.Web/rest-1.v1/Data/Scope?where=Workitems:Story[Name='Story 1';Children:Task[Name='Task 11']]&sel=Workitems:Story.Children:Task.Name

First, this expands our result to two Scopes. Let's artificially drop this down to one:

## http://localhost/VersionOne.Web/rest-1.v1/Data/Scope?where=Workitems:Story[Name='Story 1';Children:Task[Name='Task 11']];ID='Scope:1002'&sel=Workitems:Story.Children:Task.Name

By using ; to AND the expression ID='Scope:1002', we've forced out the Scope:1027 for demonstration purposes.

## http://localhost/VersionOne.Web/rest-1.v1/Data/Scope?where=Workitems:Story[Name='Story 1';Children:Task[Name='Task 11']];ID='Scope:1002'|ID='Scope:0'&sel=Workitems:Story.Children:Task.Name

Now with another OR with | we increase the count up to two again.

## http://localhost/VersionOne.Web/rest-1.v1/Data/Scope?where=Workitems:Story[Name='Story 1';Children:Task[Name='Task 11']];ID='Scope:1002'|ID='Scope:0';Name='System (All Projects)'&sel=Workitems:Story.Children:Task.Name

If add an additional AND with ; we forced out the first matched Scope and now only get back Scope:0

So, how do we get both the first and Scope:0?

## http://localhost/VersionOne.Web/rest-1.v1/Data/Scope?where=(Workitems:Story[Name='Story 1';Children:Task[Name='Task 11']];ID='Scope:1002')|(ID='Scope:0';Name='System (All Projects)')&sel=Workitems:Story.Children:Task.Name

We do it by grouping the expressions together. This way the first match is comprised of the (Task Name match AND ID='Scope:1002') OR (ID='Scope:0' AND Name='System (All Projects)')

Can we force back our other Scope with another grouping? Let's try:

## http://localhost/VersionOne.Web/rest-1.v1/Data/Scope?where=(((Workitems:Story[Name='Story 1';Children:Task[Name='Task 11']];ID='Scope:1002')|(ID='Scope:0';Name='System (All Projects)')|ID='Scope:1027'))&sel=Workitems:Story.Children:Task.Name

Well, that was easy, we just tacked on |ID='Scope:1027' after the grouped expressions.

# More notes

## http://localhost/VersionOne.Web/rest-1.v1/Data/Story?where=Name='Story 1';Name!='Story 5'

## http://localhost/VersionOne.Web/rest-1.v1/Data/Story?where=Name='Story 1';Name!='Story 5';AssetState='64'|Name='Story 3','Story 2'

##  http://localhost/VersionOne.Web/rest-1.v1/Data/Story?where=Name='Story 1';Children:Task[ID='Task:1032']&sel=Name,Children:Task[ID='Task:1030']

First: Get a Story where its name is Story 1 AND it has Children of type Task where at least one of them has ID of Task:1032
Second: After matching that, then select the matched Story's Name and its Children of type Task whose ID is Task:1030

## http://localhost/VersionOne.Web/rest-1.v1/Data/Story?where=Name='Story 1';Children:Task[ID='Task:1032']&sel=Name,Children:Task[ID='Task:1030','Task:1032']

Similar to above, but include the Children of type Task whose ID matches EITHER Task:1030 OR Task:1032

## http://localhost/VersionOne.Web/rest-1.v1/Data/Story?where=Name='Story 1';Children:Task[ID='Task:1032']&sel=Name,Children:Task[ID='Task:1030','Task:1032';Name='Task 11']

Now, we still attempt to match the Children of type Task whoses ID matches EITHER Task:1030 OR Task:1032 BUT ALSO whose Name must match Task 11. This results in filtering OUT the one whoses Name matches Task 12

## http://localhost/VersionOne.Web/rest-1.v1/Data/Story?where=Name='Story 1';Children:Task[ID='Task:1032']&sel=Name,Children:Task[ID='Task:1030','Task:1032'],Children:Test

## http://localhost/VersionOne.Web/rest-1.v1/Data/Story?where=Name='Story 1'&sel=Children:Task,Children:Test

## http://localhost/VersionOne.Web/rest-1.v1/Data/Story?where=Name='Story 1';Children:Test[ID='Test:1029']&sel=Name,Children:Test[ID='Test:1029','Test:1031']

Filter on Test now...

## http://localhost/VersionOne.Web/rest-1.v1/Data/Story?where=Name='Story 1';Children:Test[ID='Test:1029']&sel=Name,Children:Test[(ID='Test:1029','Test:1031'],Children:Test

This time, add in an un-filtered select of Test, overriding the filters!

## http://localhost/VersionOne.Web/rest-1.v1/Data/Story?where=Name='Story 1';Children:Task[ID='Task:1032']&sel=Name,Children:Task[ID='Task:1030','Task:1032';Name='Task 11']









