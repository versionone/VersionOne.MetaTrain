![Powered by VersionOne](client/images/poweredbyv1.png)

## VersionOne Requestor

The VersionOne Requestor is an open-source and community supported application that lets stakeholders submit and edit Requests in VersionOne via its REST API, without requiring each stakeholder to have a VersionOne login, and you can configure it to use custom fields that you've added to your own VersionOne instance.

As an open-sourced and community supported project, the Requestor is not formally supported by VersionOne.

That said, there are a number of options for getting your questions addressed:

* [StackOverflow](http://stackoverflow.com/questions/tagged/versionone): For asking questions of the VersionOne Development Community.
* [GitHub Issues](https://github.com/versionone/VersionOne.Client.Requestor/issues): For submitting issues that others may try to address.

In general, StackOverflow is your best option for getting support for the Requestor.

The source code for the Requestor is free and open-source, and we encourage you to improve it by [submitting pull requests](https://help.github.com/articles/using-pull-requests)!

## Background

When seeking input on the backlog, would it encourage collaboration with more stakeholders across the organization if they could submit requests to a simple, stand-alone web application, without having to login and navigate an agile project management tool? The VersionOne Requestor is a single-page web application that can be customized with custom fields and your organization's style. The Requestor is a simple way for internal stakeholders to submit and edit requests for new features or to report defects, without having access to the full VersionOne application or knowledge of your VersionOne project structure. So what? Stakeholders are infrequent users of agile project management software; hence, they often forget the right combination of menu options and project structure to submit requests in the right place. By removing these obstacles to collaboration, more stakeholders can provide feedback without frustration.

For more about the features of the VersionOne Requestor, see the blog post on [Introduction and Why You'd Need It](http://blogs.versionone.com/agile-development/2013/02/07/feature-requestor-what-and-why/)

![Feature Requestor](client/images/requestor-07-update.png)

For broader collaboration including external customers, and deeper collaboration including comments and voting, check out [VersionOne Ideas](http://www.versionone.com/Product/agile-idea-management-tool/).

### Browser Requirements

This tool has been tested with Google Chrome, and partially with Mozilla Firefox. It is known that it does 
not work with IE 9, but has not been tested on later versions. If you try it on other browsers and it works,
please let us know so we can update this.

### Implementation

It's implemented in 100% HTML, CSS, and JavaScript/CoffeeScript and uses several popular open source libraries like jQueryMobile, Backbone.js, and Backbone Forms.

### Customization

It's designed to be easily customizable for different custom fields and server locations. See below for details.

### Contributing

We also welcome contributions! [Please send pull requests](https://help.github.com/articles/using-pull-requests)! If you figure out specific instructions for using the Node.JS based installation option under different OS or cloud-hosted configurations, please create a how-to document and submit a pull request. **See the [HowTo-DeployInHeroku.md](HowTo-DeployInHeroku.md) doc for an example.**

## Community supported code (not VersionOne supported)

Since this is an open source, community supported project, VersionOne does not support installing this code into its On-Demand / Hosted environment. Instead, see the various methods for running this code below. Also, please use GitHub issues for documenting your questions and ideas, as VersionOne will not answer questions via its helpdesk about this code.

## How to use with your own On-Premise VersionOne

If you have your own instance of VersionOne installed on premise, and have full access to the IIS server, then the easiest thing to do is this:

* Copy all the files from the `client` directory in this repo to a new folder named `Requestor` in your `<VersionOne Installation Location>\Custom`folder.
* Next, modify the `config.js` file as described in the `Configure for VersionOne Projects` section below, setting  `host = ''` along with the other changes.
* **Notes:** 
  1. The standard installation directory for a local instance of VersionOne is `C:\inetpub\wwwroot\VersionOne`, also you may need to create the `Custom` folder if it does not exist.
  2. If you have the `Active Directory` authentication option configured for VersionOne, you'll need to ensure that **ASP Impersonation** is enabled in IIS, and that `Anonymous Authentication` is disabled.


You should now be able to navigate to the site at [http://localhost/VersionOne/Custom/Requestor](http://localhost/VersionOne/Custom/Requestor).

## How to run as a stand-alone Node.js process for On-Premise installations or Hosted instances

If you have a Hosted VersionOne instance, then you have two option types for running the Requestor: locally in your own network, or on a public cloud provider. 

### How to run as a Windows service in your own local network

First, make sure you have [Node.js](http://nodejs.org/) and [Git for Windows](http://msysgit.github.io/) installed on the server on which you plan to install Requestor.

After those are installed, do this:

* Open a Git Bash prompt.
* Navigate to a folder where you would like to install the Requestor, for example `C:\WebApps`, by typing `cd /c/WebApps`
* Type `git clone https://github.com/versionone/VersionOne.Client.Requestor.git`.
* Type `cd VersionOne.Client.Requestor` to change into the newly cloned repository directory.
* Follow the steps in [Configure for VersionOne Projects](#configure-for-versionone-projects) for editing the `config.js` and `fields.js` files to meet your needs.
* Modify the `package.json` file such that the `scripts` property looks like this (simply prefixing **node** to the `start` sub-property's value):
```json
  "scripts": {
    "start": "node server.js",
    "install-windows-service": "winser -i -a",
    "uninstall-windows-service": "winser -r -a"
  },
```
* Type `npm install winser` to install the [WinSer](https://www.npmjs.org/package/winser) node package.
* Finally, type `npm run-script install-windows-service` to install the Requestor as a Windows service. 
* Open a web browser and you should now be able to access the Requestor at [http://localhost:5000/index.html](http://localhost:5000/index.html)!


### How to Deploy Requestor to Heroku for Free via a single click

[We've documented this process in this guide](HowTo-DeployInHeroku.md).

**If you figure out another option for how to deploy it, please send us a pull request with a file named like: *HowTo-DeployIn&lt;provider&gt;.md***

## Configure for VersionOne Projects

There are two configuration files:

1. config.js -- specifies the URL for VersionOne and a few other options
2. fields.js -- specifies the projects and fields you want to display on the request form for each project

## config.js

Most importantly, change the `host`, `service`, and `versionOneAuth` variables to point to your own VersionOne instance. By default, the settings expect that you are running the sever.js process from Node.js and are proxying through it to the public VersionOne test instance. That's what the `/pt/https://www.v1host.com` default means.

**Note:** If you deployed the code into the `Custom` folder of your On-Premise VersionOne instance as [mentioned above](https://github.com/versionone/VersionOne.Client.Requestor/blob/master/READMETOO.md#how-to-use-with-your-own-on-premise-versionone), then you should just set `host = ''`, because it is running on the same server as the `service` itself.

```javascript
host = '/pt/https://www.v1host.com';
service = host + '/v1instance/rest-1.v1/Data/';
```

The odd looking path, `/pt/`, is simply the "pass through" route that the Node.js based server.js file uses to handle [CORS proxying](http://enable-cors.org/) since the VersionOne system does not support CORS inherently. The second part, for example `https://www.v1host.com`, is the actual server base address where your VersionOne instance is installed.

The `service` variable simply tacks on the instance and REST api endpoint pathing to the `host` variable.

**Note:** We have an issue open for modifying the code to allow configuring the remote server and authentication on the server side, instead of passing it from the client. We welcome a pull request for this solution, as we're not able to do it at this time.

### host

*Url, default: `/pt/https://www14.v1host.com`*

As explained above, only set this if you are running the Node.js server.js process and need to proxy through to a hosted VersionOne instance. It's important that you keep the `/pt/` in front of the actual server host address because the server.js process responds to requests coming to this route by proxying them through to the actual target host.

### service

*Url, default: `/pt/https://www14.v1host.com/v1sdktesting/rest-1.v1/Data/`*

The complete proxied url for the VersionOne REST API endpoint for your hosted instance, ending with a `/`; or, the relative path if you have deployed the Requestor into your On-Premise instances's Custom folder as described abobe. 

If you log in to your instance at `https://www11.v1host.com/TeamAwesome`, then your REST API endpoint url is `https://www11.v1host.com/TeamAwesome/rest-1.v1/Data/`.

### versionOneAuth

*String, default: admin:admin*

Authentication credentials for a user that can submit a feature request into the projects you specify in `fields.js`. You should take care to give this user only the permissions you want, perhaps only to add requests for those projects. 

This must be in the form of `username:password`. This value gets [Base64-encoded](http://en.wikipedia.org/wiki/Base64) and sent as an HTTP `Authorization` header.

### projectListClickTarget

*String, default: new*

This controls what happens when a user clicks a project name after searching

Valid values are:

* `new` -- open a new blank request form
* `list` -- open the list of existing requests to filter and select

### others

Modify the others to your heart's content.

## fields.js

The fields.js file is where specifies the fields that will be visiible for all projects or for specific projects when adding or editing a request.

## Specify default fields

To specify which fields to show up for all projects by default, define the a setting named `default`, like this:

```javascript
'default': {
  RequestedBy: {
    title: 'Requested By',
    autofocus: true
  },
  Name: {
    title: 'Request Title'
  },
  Description: {
    title: 'Request Description (Project & Why needed)',
    type: 'TextArea',
    optional: true
  },
  Priority: {
    title: 'Priority',
    type: 'Select',
    assetName: 'RequestPriority'
  }
}
```
## Field options

Each entry within the `default` project is keyed by the physical name of the corresponding VersionOne attribute or relationship. The entry itself is an object can contain the following options. Note that all of these work fine with the built-in VersionOne asset attributes as well as custom fields.

### title

*String, default: <key>*

The label to appear above the input field.

### type

*Backbone Forms field type, default: text*

Specifies the input element type for the field, based on [Backbone Forms](https://github.com/powmedia/backbone-forms) field types. You can compare this with the meta data for the field to get it right -- see [VersionOne Meta API](http://community.versionone.com/Developers/Developer-Library/Documentation/API/Endpoints/meta.v1).

### autofocus

*Boolean, default: false*

Set this to true if you want a field to autofocus on load. It sets the HTML 5 `autofocus` attribute in the input element. Obviously, it will only work with one field.

### optional

*Boolean, default: false*

By default, all fields will be required, unless you set this to `false`!

### Backbone Forms docs

Check out the [Backbone Forms](https://github.com/powmedia/backbone-forms) documentation for more information on how you can utilize and customize the form fields.

## Relation options

The tool supports basic use with relations by showing them in a select element. This works with both built-in and custom list types.

### Example relation

From above:

```javascript
Priority: {
  title: 'Priority',
  type: 'Select',
  assetName: 'RequestPriority'
}
```

A Request asset has a `Request.Priority` attribute, which is of type RequestPriority. You can see that in the meta data for a Request at: [https://www14.v1host.com/v1sdktesting/meta.v1/Request?xsl=api.xsl](https://www14.v1host.com/v1sdktesting/meta.v1/Request?xsl=api.xsl)

And, you can find the list of possible values at [https://www14.v1host.com/v1sdktesting/rest-1.v1/Data/RequestPriority](https://www14.v1host.com/v1sdktesting/rest-1.v1/Data/RequestPriority)

In the `Specify fields for specific projects` section, you'll see this:

```javascript
Custom_ProductService: {
  title: 'Product/Service',
  type: 'Select',
  assetName: 'Custom_Product'
}
```

In that case, a customer chose to name the attribute `Custom_ProductService`, which can take values from the list of the custom list-type named `Custom_Product`. **There is no requirement that the `Custom_` prefix appear in a custom field, however!**

## Specify fields for individual projects

For a sepcific project, you define fields with a key named after the project's Scope oid, like below. Note that this even lets you even use custom fields that are defined in your VersionOne instance. The `type` parameter refers to the field types available in [Backbone Forms](https://github.com/powmedia/backbone-forms).

```javascript
'Scope:173519': {
  RequestedBy: {
    title: 'Requested By',
    autofocus: true
  },
  Name: {
    title: 'Request Title'
  },
  Custom_RequestedETA: {
    title: 'Requested by (ETA)',
    type: 'Date'
  },
  Description: {
    title: 'Request Description (Project & Why needed)',
    type: 'TextArea',
    optional: true
  },
  Custom_ProductService: {
    title: 'Product/Service',
    type: 'Select',
    assetName: 'Custom_Product'
  },
  Custom_Team2: {
    title: 'Team',
    type: 'Select',
    assetName: 'Custom_Team'
  },
  Custom_HWRequestedlistandcostperunit: {
    title: 'Capacity or HW Requested',
    type: 'TextArea'
  },
  Custom_RequestImpact: {
    title: 'Request Impact',
    type: 'Select',
    assetName: 'Custom_Severity'
  }
}
```

## Advanced: CoffeeScript

The main source for the app is actually CoffeeScript. It's been compiled to JavaScript, and those files are here in the repository, but if you'd prefer to customize the code in CoffeeScript rather than muck with JavaScript, then do this:

1. Install [Node.js](http://nodejs.org/) if you don't already have it.
2. Open a command prompt and change directory to where the `VersionOne.Client.Requestor` folder is in your local repository clone.
3. Type `npm install coffee-script` (Or, [see alternatives for installing CoffeeScript](http://coffeescript.org/#installation)).
4. Type `./make.sh` to execute the CoffeeScript compiler. This is a simple script that regenerates a few `.js` files from the `.coffee` files in the project.
