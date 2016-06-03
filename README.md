Docker Service Manager
======================
[![Build Status](https://img.shields.io/travis/michaelmior/node-docker-service.svg?style=flat)](https://travis-ci.org/michaelmior/node-docker-service)

This tool is a fork of [docker-service](https://github.com/Paulavery/node-docker-service/).
This tool allows the user to manage services run within docker containers.
These services might at times depend on each other and each expose different ports.
This application helps me (and maybe you), to easily mount folders and config files, to expose necessity ports and to build and start all necessity images and containers.
It also takes care of setting the containers timezone, so no time mismatches happen between the service and the host.

Structure of a Service
----------------------
Each service lives inside its own folder.
By default these folders live in `/etc/docker-services` but you can customize this by setting the environment variable `DOCKER_SERVICE_ROOT`.

### service.json
A service contains at its heart a `service.json` file, which may look like this:

	{
		"tag": "paulavery/ympd",
		"name": "ympd",
		"ports": [
			8000
		],
		"mounts": {
			"music": "/etc/mopidy/music"
		},
		"deps": [
			"mpd"
		]
	}

All its attributes are optional with the exception of a `tag` which we require.

#### tag
If a local Dockerfile is found, a new image will be built from it, under this tag.
Otherwise, the tag will be pulled from the docker registry.

#### name
A name to later be used as the services container name. You will use this to reference services (start or stop them as well as have other services depend on them).

If omitted it will default to the part behind the `/` of your `tag`.
I would suggest to use this property to allow for drop-in replacements of dependencies (e.g. a `mopidy` and an `mpd` service could both have different tags but the name `mpd`, as they are providing the same service for dependents).

#### ports
An array defining the ports this service will expose to you. This should not contain any ports not exposed to the user.

#### mounts
Define names for any directories which need to be mounted into your services container. See about the mounts directory below.

#### deps
An array listing all dependencies of this service. These dependencies will be started before loading up your service.

#### env
A hash of any environment variables to set in the container.

### `mounts` directory
You should symlink your mounts here under the name defined in your `service.json`. This allows you to check in the required mounts to git, while easily assigning them on each machine.
If you have no mounts, you do not need this directory.

### `config` directory
This directory contains any configuration files for your service. These are linked into the services container, so you may change them without much fuss.
You should treat this directory like a Linux systems root folder. So `config/etc/something.conf` will be linked to `/etc/something.conf` inside the container.
If you have no configuration files, you may omit this folder.

In addition, you may specify entire folders in your `service.json`'s `configs` property. The following would mount `config/home/sabnzbd/.sabnzbd` and `config/home/sabnzbd/downloads` to `/home/sabnzbd/.sabnzbd` and `/home/sabnzbd/downloads` respectively:

	{
		configs: {
			'home/sabnzbd': {
				'.sabnzbd': {},
				'downloads': {}
			}
		}
	}

Single files will still be mounted separately **unless** they are positioned in a folder which will be mounted.

CLI
---
The application exposes the following commands:

### docker-service start \<name\>
Builds any necessary images and containers as well as starting all dependencies before starting up your service. First time doing this might take some time.

A `-d`/`--nodaemon` flag may be passed, to start a service in non-daemon mode.

### docker-service stop \<name\>
Stops the container running your service

### docker-service restart \<name\>
Restarts a service.

### docker-service status \<name\>
Prints status information as JSON to the command line.

### docker-service list
Lists all installed services with their current status.

Errors
------
This application does NOT print user-friendly error messages. If anything goes wrong (e.g. a dependency is missing), it just throws an error and crashes. The error messages should be self-explanatory though.
