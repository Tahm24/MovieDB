# MovieDB setup for local


1. ## File setup
Load file into an environment like vs code that has a built in terminal
Install all npm dependencies in the root of the file. Command for terminal: "npm install all". Json package should know all the dependencies.

2. ##SQL setup (Assuming you have Mysql setup)
Create database, starting from root folder. Run mysql eg. (for macOS) "/usr/local/mysql/bin/mysql -u root -p" in built in terminal from vs code.
Should prompt password, enter it.
Then "source create_db.sql". This should create the database with the tables.

More simple, if you have Mysql workbench and copy/paste all sql code into an already made connection instance. Create one if you need. Then run all the sql code.

3. ##Run it
Finally, go to index.js file in vs code environment and run. Everything should be working....


 
