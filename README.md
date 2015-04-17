PDB Database
==============================
Sync of the official PDB database in couchdb. The database is searchable for properties like number of residues, residue percentages, molecular weight etc...


CouchDB replication of the PDB
==============================

__This documentation requires CentOS 7.0__

We will need to:
* install CouchDB
* install PyMol to generate small images of the PDB
* install node to rsync PDB and create the couchDB
 

Install PyMol
-------------
```
cd /usr/local/src
```
Download the program from sourceforge using lynx !!!

```
yum install lynx
```

It is full of redirect ... and with curl and get it is not obvious.

http://downloads.sourceforge.net/project/pymol/pymol/1.7/pymol-v1.7.4.0.tar.bz2?r=https%3A%2F%2Fwww.google.ch%2F&ts=1429190153&use_mirror=softlayer-ams
Uncompress and untar

```
bzip2 -d pymol-v1.7.4.0.tar.bz2 
tar -xvf pymol-v1.7.4.0.tar
````

### Install missing packages
```
yum install freeglut numpy freeglut-devel libpng libpng-devel PyOpenGL glew glew-devel libxml2-devel freetype-devel gcc gcc-c++ python-devel
```

### Build the program
````
python setup.py build install --home=/usr/local/pymol
ln -s /usr/local/pymol/bin/pymol /usr/local/bin/
````

## Convert a PDB to PNG
* http://www.pymolwiki.org/index.php/Simple_Scripting
* http://www.pymolwiki.org/index.php/Png

Examples from command line:

* pymol -c 1XAA.pdb -d "as ribbon;spectrum count;set seq_view"  -g 1XAA.png
* pymol -c 1XAA.pdb -d "orient; as cartoon;spectrum count;set seq_view" -d "png 1XAA, width=200, height=200"


