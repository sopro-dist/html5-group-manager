html5-peer-lists
================

Peer list administration app

This app uses angular-material.js, a compiled script.  

SoPro has a fork of the material project for use with developing our own components. Here's how to get our changes applied to the current upstream. Be warned that the material design repo is under heavy development so the current version may include breaking changes.

Start by cloning `sopro-components/material`:  
    $ git clone https://github.com/sopro-components/material.git; cd material
Configure an upstream remote, pointing at `angular/material`:  
    $ git remote add upstream https://github.com/angular/material.git
Fetch the current `angular/material` and merge it onto your local master:
    $ git fetch upstream
    $ git checkout master
    $ git merge upstream/master
Build the material repo as per its [readme](https://github.com/angular/material#development-1); then copy `dist/js/angular-material.js` into `html5-peer-lists/js`