This repo is a test case code to reproduce issue reported in https://github.com/balderdashy/sails-mysql/issues/327

### Problem description

``populate()`` returns empty array of child objects in ONE-to-MANY association.

Following mysql scheme is used (2 mysql tables):

```
mysql> describe ModelA;
+-------+------------------+------+-----+---------+----------------+
| Field | Type             | Null | Key | Default | Extra          |
+-------+------------------+------+-----+---------+----------------+
| a_id  | int(10) unsigned | NO   | PRI | NULL    | auto_increment |
| name  | varchar(255)     | YES  |     | NULL    |                |
+-------+------------------+------+-----+---------+----------------+
```

```
mysql> describe ModelB;
+--------+------------------+------+-----+---------+----------------+
| Field  | Type             | Null | Key | Default | Extra          |
+--------+------------------+------+-----+---------+----------------+
| b_id   | int(10) unsigned | NO   | PRI | NULL    | auto_increment |
| a_id   | int(11)          | YES  |     | NULL    |                |
| name   | varchar(255)     | YES  |     | NULL    |                |
+--------+------------------+------+-----+---------+----------------+
```

Following data is added into database:
```
mysql> select * from ModelA;
+------+--------+
| a_id | name   |
+------+--------+
|    1 | first  |
|    2 | second |
+------+--------+
2 rows in set (0.00 sec)
```

```
mysql> select * from ModelB;
+------+------+------+
| b_id | a_id | name |
+------+------+------+
|    1 |    1 | b_1  |
|    2 |    1 | b_2  |
+------+------+------+
2 rows in set (0.00 sec)
```

ModelA description:

```
module.exports = {

    identity: 'modela',
    tableName: 'ModelA',
    connection: 'mysql',
    migrate: 'safe',
    autoPK: false,
    autoCreatedAt: false,
    autoUpdatedAt: false,

    attributes: {

        a_id: {
            type: 'integer',
            unique: true,
            autoIncrement: true,
            primaryKey: true
        },

        name: {
            type: 'string'
        },

        // Links
        childs: {
            collection: 'ModelB',
            via: 'parent'
        }
    }
};
```

ModelB description:

```
module.exports = {

    identity: 'modelb',
    tableName: 'ModelB',
    connection: 'mysql',
    migrate: 'safe',
    autoPK: false,
    autoCreatedAt: false,
    autoUpdatedAt: false,

    attributes: {

        b_id: {
            type: 'integer',
            unique: true,
            autoIncrement: true,
            primaryKey: true
        },

        // This is foreign key
        a_id: {
            type: 'integer'
        },

        name: {
            type: 'string'
        },

        // Links
        parent: {
            model: 'ModelA',
            columnName: 'a_id'
        }
    }
};
```

In case if I try to retrieve ModelA by ``a_id`` set in ``where`` clause, 
all works fine and ``populate()`` returns correct array:
```
ModelA.find({a_id: 1})
.populate('childs')
.then(function(res)
{
    console.log(res);
});

MySQL.populateBuffers:  SELECT `ModelA`.`a_id`, `ModelA`.`name` FROM `ModelA` AS `ModelA`  WHERE `ModelA`.`a_id` = 1
MySQL.processChildren:  (SELECT `ModelB`.`b_id`,`ModelB`.`a_id`,`ModelB`.`name`,`ModelB`.`a_id`,`ModelB`.`b_id`,`ModelB`.`a_id` FROM `ModelB` AS `ModelB` WHERE `a_id` = 1  ORDER BY `ModelB`.`b_id` ASC)
[ { childs:
     [ { b_id: 1, name: 'b_1', parent: 1 },
       { b_id: 2, name: 'b_2', parent: 1 } ],
    a_id: 1,
    name: 'first' } ]
    
```

But if I try to select several ModelA objects, ``populate()`` returns empty arrays:

```
ModelA.find()
.populate('childs')
.then(function(res)
{
    console.log(res);
});

MySQL.populateBuffers:  SELECT `ModelA`.`a_id`, `ModelA`.`name` FROM `ModelA` AS `ModelA`
MySQL.processChildren:  (SELECT `ModelB`.`b_id`,`ModelB`.`a_id`,`ModelB`.`name`,`ModelB`.`a_id`,`ModelB`.`b_id`,`ModelB`.`a_id` FROM `ModelB` AS `ModelB` WHERE `a_id` = 1  ORDER BY `ModelB`.`b_id` ASC) UNION ALL (SELECT `ModelB`.`b_id`,`ModelB`.`a_id`,`ModelB`.`name`,`ModelB`.`a_id`,`ModelB`.`b_id`,`ModelB`.`a_id` FROM `ModelB` AS `ModelB` WHERE `a_id` = 2  ORDER BY `ModelB`.`b_id` ASC)  ORDER BY b_id ASC
[ { childs: [], a_id: 1, name: 'first' },
  { childs: [], a_id: 2, name: 'second' } ]
```

If I try to execute produced SQL query manually, it returns error, that's why arrays are empty.

```
mysql> (SELECT `ModelB`.`b_id`,`ModelB`.`a_id`,`ModelB`.`name`,`ModelB`.`a_id`,`ModelB`.`b_id`,`ModelB`.`a_id` FROM `ModelB` AS `ModelB` WHERE `a_id` = 1  ORDER BY `ModelB`.`b_id` ASC) UNION ALL (SELECT `ModelB`.`b_id`,`ModelB`.`a_id`,`ModelB`.`name`,`ModelB`.`a_id`,`ModelB`.`b_id`,`ModelB`.`a_id` FROM `ModelB` AS `ModelB` WHERE `a_id` = 2  ORDER BY `ModelB`.`b_id` ASC)  ORDER BY b_id ASC;
ERROR 1052 (23000): Column 'b_id' in order clause is ambiguous
```

As you can see adapter selects several columns with the same name.

### Environment

Sails is not used.
Waterline 0.12.2
sails-mysql 0.12.2
NodeJS v5.12.0

### Full code is available here

https://github.com/mast/sails-mysql-populate-bug

To install it, run ``npm install``, and import database from ``db.sql``.
You should also change passwords in ``index.js``
