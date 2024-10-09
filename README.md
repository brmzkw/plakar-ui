
Features:

- list of snapshots
- for each snapshot, list of files in a table
  - name
  - mode
  - uid
  - gid
  - date
  - size
- for each file, informations
  - metadata
    - checksum 
    - content type
    - name
    - size
    - mode
    - uid
    - gid
    - device
    - inode
    - modification time
  - structure
    - chunk
    - length 
  - download button
  - raw file content
  - highlight file content
- list of file kinds
  - kind
  - count: count among all snapshots
  - ratio
- for each kind
  - snapshot where the kind if found


The UI currently has the following views:

* Snapshots list: to browse through the files in each snapshot
* File kind/mime-type/etensions: shows files of a specific type. If the file exists in multiple snapshots, it’ll appear multiple times
* Search: to search for a file by name. If it’s in several snapshots, it will show up multiple times


Snapshots View

* Shows the list of snapshots, the most recent first
* Each snapshot displays the file list by name as the default view
* You can switch tabs to view files by kind/mime-type/extensions
* The "diff mode" setting can be toogled to compare the current snapshot with another one (defaulting to the previous snapshot).
* A search input to look for files by name within the current snapshot

Global Search

* To search for files by name across all snapshots.
* If the file exists in multiple snapshots, only the latest one shows up by default
* In the file details, you'll see a list of snapshots where the file appears



-----

| Search | 

Snapshos

DATE | UUID | Hostname | Path | Stats

xxx | xxx | julien@localhost | /bin | 3 dirs, 17 files, 17MB